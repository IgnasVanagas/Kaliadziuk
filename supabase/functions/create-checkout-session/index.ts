import { getCorsHeaders, handleOptions, isAllowedOrigin } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/supabase.ts';
import { getStripe } from '../_shared/stripe.ts';
import { normalizeGiftCode, sha256Hex } from '../_shared/crypto.ts';
import { rateLimit } from '../_shared/rateLimit.ts';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

function successPath(locale: 'lt' | 'en') {
  return locale === 'lt' ? '/lt/sekme' : '/en/success';
}

function cancelPath(locale: 'lt' | 'en') {
  return locale === 'lt' ? '/lt/atsaukta' : '/en/cancel';
}

type CartItem = {
  kind: 'product' | 'gift_card';
  productId?: string | null;
  qty?: number;
  unitPriceCents?: number;
  amountCents?: number;
  name?: string;
  meta?: Record<string, unknown>;
};

function asTrimmedString(v: unknown) {
  const s = String(v ?? '').trim();
  return s.length ? s : '';
}

function clamp(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max);
}

function getIp(req: Request): string {
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  return 'unknown';
}

async function verifyTurnstile(args: { token: string; ip?: string | null }) {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (!secret || !secret.trim()) {
    if (Deno.env.get('TURNSTILE_DISABLED') === 'true') {
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const isLocal = supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1');
      if (!stripeKey.startsWith('sk_live_') && isLocal) {
        console.warn('[turnstile] bypassed – local development environment');
        return { enforced: false, ok: true as const };
      }
      console.error('[turnstile] TURNSTILE_DISABLED ignored – not a local dev environment');
    }
    console.error('CRITICAL: TURNSTILE_SECRET_KEY not set. Set TURNSTILE_DISABLED=true to bypass in development.');
    return { enforced: true, ok: false as const, error: 'captcha_unavailable' as const };
  }
  const token = String(args.token || '').trim();
  if (!token) {
    return { enforced: true, ok: false as const, error: 'missing_captcha' as const };
  }
  const form = new URLSearchParams();
  form.set('secret', secret.trim());
  form.set('response', token);
  if (args.ip && args.ip !== 'unknown') form.set('remoteip', args.ip);
  const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  const data: any = await resp.json().catch(() => null);
  if (data?.success) return { enforced: true, ok: true as const };
  return { enforced: true, ok: false as const, error: 'captcha_failed' as const };
}

function getBearerToken(req: Request) {
  const raw = req.headers.get('authorization') || req.headers.get('Authorization') || '';
  const m = raw.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

function looksLikeJwt(token: string) {
  return token.split('.').length === 3;
}

Deno.serve(async (req: Request) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const corsHeaders = getCorsHeaders(req);

  if (req.method !== 'POST') {
    return new Response('method_not_allowed', { status: 405, headers: corsHeaders });
  }

  try {
    await rateLimit(req, 'create-checkout-session', 20, 60);

    const body: any = await req.json();
    const locale: 'lt' | 'en' = body?.locale === 'en' ? 'en' : 'lt';
    // Use the real HTTP Origin header for security decisions (not attacker-controlled body).
    const origin = (req.headers.get('Origin') || '').replace(/\/$/, '');

    if (!origin.startsWith('http') || !isAllowedOrigin(origin)) {
      return new Response(JSON.stringify({ error: 'invalid_origin' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Safety: don't allow production site to accidentally use Stripe test mode.
    const isProdOrigin = /^https:\/\/(www\.)?kaliadziuk\.lt$/i.test(origin);
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
    if (isProdOrigin && stripeSecretKey.startsWith('sk_test_')) {
      return new Response(JSON.stringify({ error: 'stripe_test_mode_in_production' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify Turnstile bot protection
    const captchaToken = clamp(
      asTrimmedString(body?.cf_turnstile_response ?? body?.turnstile_token ?? body?.captcha_token),
      3000,
    );
    const captcha = await verifyTurnstile({ token: captchaToken, ip: getIp(req) });
    if (!captcha.ok) {
      return new Response(JSON.stringify({ error: captcha.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const items: CartItem[] = Array.isArray(body?.items) ? body.items : [];
    if (items.length === 0) {
      return new Response(JSON.stringify({ error: 'empty_cart' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (items.length > 50) {
      return new Response(JSON.stringify({ error: 'too_many_items' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const customer = body?.customer || {};
    const email = String(customer?.email || '').trim();
    const phone = String(customer?.phone || '').trim() || null;
    const fullName = String(customer?.full_name || '').trim() || null;
    const marketingOptIn = Boolean(customer?.marketing_opt_in);
    const acceptTerms = Boolean(customer?.accept_terms);

    // Server-side email format validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return new Response(JSON.stringify({ error: 'invalid_email' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const acceptPrivacy = Boolean(customer?.accept_privacy);

    if (!acceptTerms || !acceptPrivacy) {
      return new Response(JSON.stringify({ error: 'missing_required_fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = getServiceClient();
    const stripe = getStripe();

    // Optional: attach purchases to the authenticated user.
    let authUserId: string | null = null;
    const bearer = getBearerToken(req);
    if (bearer && looksLikeJwt(bearer)) {
      const { data, error } = await supabase.auth.getUser(bearer);
      if (!error && data?.user?.id) authUserId = data.user.id;
    }

    // Upsert customer by email
    const nowIso = new Date().toISOString();
    const custUpsert = await supabase
      .from('customers')
      .upsert({
        email,
        phone,
        full_name: fullName,
        locale,
        marketing_opt_in: marketingOptIn,
        terms_accepted_at: acceptTerms ? nowIso : null,
        privacy_accepted_at: acceptPrivacy ? nowIso : null,
      }, { onConflict: 'email' })
      .select('id')
      .single();

    if (custUpsert.error) throw new Error(custUpsert.error.message);
    const customerId = custUpsert.data.id;

    // Resolve cart items against DB (products) and validate gift card amount
    const lineItems: Array<any> = [];
    const orderItems: Array<any> = [];

    let subtotalCents = 0;

    for (const it of items) {
      if (it.kind === 'product') {
        const productId = String(it.productId || '');
        const qty = Math.max(1, Number(it.qty || 1));

        const p = await supabase
          .from('products_active_localized')
          .select('product_id,price_cents,currency,name,description,locale')
          .eq('product_id', productId)
          .eq('locale', locale)
          .maybeSingle();

        if (p.error) throw new Error(p.error.message);
        if (!p.data) {
          return new Response(JSON.stringify({ error: 'invalid_product' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        subtotalCents += p.data.price_cents * qty;

        lineItems.push({
          quantity: qty,
          price_data: {
            currency: 'eur',
            unit_amount: p.data.price_cents,
            product_data: { name: p.data.name, description: p.data.description || undefined },
          },
        });

        orderItems.push({
          kind: 'product',
          product_id: p.data.product_id,
          name: p.data.name,
          unit_price_cents: p.data.price_cents,
          qty,
          meta: {},
        });
      } else if (it.kind === 'gift_card') {
        const amountCents = Math.round(Number(it.amountCents || it.unitPriceCents || 0));
        if (!Number.isFinite(amountCents) || amountCents < 5000 || amountCents > 50000) {
          return new Response(JSON.stringify({ error: 'invalid_gift_amount' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        subtotalCents += amountCents;

        const name = locale === 'lt' ? 'Dovanų kuponas' : 'Gift card';
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: amountCents,
            product_data: { name },
          },
        });

        orderItems.push({
          kind: 'gift_card',
          product_id: null,
          name,
          unit_price_cents: amountCents,
          qty: 1,
          meta: it.meta || {},
        });
      } else {
        return new Response(JSON.stringify({ error: 'invalid_item' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // Gift code (optional): create reservation + one-time coupon
    let discountCents = 0;
    let stripeDiscounts: any[] = [];
    let giftCardId: string | null = null;

    const rawGift = body?.gift_code ? String(body.gift_code) : '';
    if (rawGift) {
      const code = normalizeGiftCode(rawGift);
      if (!code) {
        return new Response(JSON.stringify({ error: 'invalid_gift_code' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const pepper = Deno.env.get('GIFT_CARD_PEPPER');
      if (!pepper) throw new Error('Missing GIFT_CARD_PEPPER');
      const hash = await sha256Hex(`${code}:${pepper}`);

      const gc = await supabase
        .from('gift_cards')
        .select('id,remaining_amount_cents,status,expires_at')
        .eq('code_hash', hash)
        .maybeSingle();

      if (gc.error) throw new Error(gc.error.message);
      if (!gc.data) {
        return new Response(JSON.stringify({ error: 'invalid_gift_code' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const expiresAt = new Date(gc.data.expires_at);
      if (gc.data.status !== 'active' || expiresAt.getTime() <= Date.now()) {
        return new Response(JSON.stringify({ error: 'gift_expired' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const available = await supabase.rpc('gift_card_available_cents', { p_gift_card_id: gc.data.id });
      if (available.error) throw new Error(available.error.message);

      const availCents = Number(available.data || 0);
      discountCents = Math.min(availCents, subtotalCents);
      giftCardId = gc.data.id;

      if (discountCents > 0) {
        const coupon = await stripe.coupons.create({
          duration: 'once',
          currency: 'eur',
          amount_off: discountCents,
          max_redemptions: 1,
          name: `Gift card (${code.slice(0, 4)}…)`,
        });

        stripeDiscounts = [{ coupon: coupon.id }];
      }
    }

    const totalCents = Math.max(0, subtotalCents - discountCents);

    // Create order
    const orderIns = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        auth_user_id: authUserId,
        status: 'pending',
        subtotal_cents: subtotalCents,
        discount_cents: discountCents,
        total_cents: totalCents,
        currency: 'EUR',
        locale,
      })
      .select('id')
      .single();

    if (orderIns.error) throw new Error(orderIns.error.message);
    const orderId = orderIns.data.id;

    // Insert items
    for (const oi of orderItems) {
      const ins = await supabase.from('order_items').insert({ ...oi, order_id: orderId });
      if (ins.error) throw new Error(ins.error.message);
    }

    // Atomically reserve gift card balance (prevents double-spend race condition).
    if (giftCardId) {
      const reserved = await supabase.rpc('reserve_gift_card_cents', {
        p_gift_card_id: giftCardId,
        p_order_id: orderId,
        p_max_cents: subtotalCents,
      });
      if (reserved.error) throw new Error(reserved.error.message);
      const confirmedDiscount = Number(reserved.data || 0);

      // Update order with confirmed discount
      if (confirmedDiscount !== discountCents) {
        discountCents = confirmedDiscount;
        const newTotal = Math.max(0, subtotalCents - discountCents);
        await supabase
          .from('orders')
          .update({ discount_cents: discountCents, total_cents: newTotal })
          .eq('id', orderId);
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'eur',
      customer_email: email,
      line_items: lineItems,
      discounts: stripeDiscounts.length ? stripeDiscounts : undefined,
      client_reference_id: orderId,
      success_url: `${origin}${successPath(locale)}`,
      cancel_url: `${origin}${cancelPath(locale)}`,
      // IMPORTANT: session.metadata does NOT automatically propagate to the PaymentIntent.
      // Adding payment_intent_data.metadata makes `payment_intent.succeeded` sufficient to locate the order.
      payment_intent_data: {
        metadata: {
          order_id: orderId,
          locale,
          ...(authUserId ? { auth_user_id: authUserId } : {}),
        },
      },
      metadata: {
        order_id: orderId,
        locale,
        ...(authUserId ? { auth_user_id: authUserId } : {}),
      },
    });

    const up = await supabase
      .from('orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', orderId);
    if (up.error) throw new Error(up.error.message);

    return new Response(JSON.stringify({ url: session.url, order_id: orderId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    const isRateLimited = String(e?.message || '') === 'rate_limited';
    if (!isRateLimited) {
      console.error('[create-checkout-session] error', e);
    }
    const status = isRateLimited ? 429 : 500;
    return new Response(JSON.stringify({ error: isRateLimited ? 'rate_limited' : 'server_error' }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
