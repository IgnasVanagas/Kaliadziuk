import { getCorsHeaders, handleOptions } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/supabase.ts';
import { getStripe } from '../_shared/stripe.ts';
import { normalizeGiftCode, randomGiftCode, sha256Hex } from '../_shared/crypto.ts';
import { rateLimit } from '../_shared/rateLimit.ts';
import { renderAdminNewOrderPaid, renderOrderPaidEmail, sendEmail } from '../_shared/email.ts';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

function formatEur(cents: number) {
  const value = (Number(cents || 0) / 100).toFixed(2);
  return `${value} EUR`;
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

const PRIVATE_TEST_PRODUCT_ID = 'private_test_1eur';
const PRIVATE_TEST_PRODUCT_PRICE_CENTS = 100;

function getHeader(req: Request, name: string) {
  return req.headers.get(name) || req.headers.get(name.toLowerCase()) || null;
}

function getBearerToken(req: Request) {
  const raw = req.headers.get('authorization') || req.headers.get('Authorization') || '';
  const m = raw.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

function looksLikeJwt(token: string) {
  // Supabase access tokens are JWTs with 3 dot-separated parts.
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
    await rateLimit(req, 'create-payment-intent', 20, 60);

    const body: any = await req.json();
    const locale: 'lt' | 'en' = body?.locale === 'en' ? 'en' : 'lt';
    const origin = String(body?.origin || '').replace(/\/$/, '');

    if (!origin.startsWith('http')) {
      return new Response(JSON.stringify({ error: 'invalid_origin' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Safety: don't allow production site to accidentally use Stripe test mode.
    // This also prevents Apple Pay/Google Pay from showing “test environment” messaging.
    const isProdOrigin = /^https:\/\/(www\.)?kaliadziuk\.lt$/i.test(origin);
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
    if (isProdOrigin && stripeSecretKey.startsWith('sk_test_')) {
      return new Response(JSON.stringify({ error: 'stripe_test_mode_in_production' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const items: CartItem[] = Array.isArray(body?.items) ? body.items : [];
    if (items.length === 0) {
      return new Response(JSON.stringify({ error: 'empty_cart' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const hasPrivateTestItem = items.some((it) => it?.kind === 'product' && String(it?.productId || '') === PRIVATE_TEST_PRODUCT_ID);

    const customer = body?.customer || {};
    const email = String(customer?.email || '').trim();
    const phone = String(customer?.phone || '').trim() || null;
    const fullName = String(customer?.full_name || '').trim() || null;
    const marketingOptIn = Boolean(customer?.marketing_opt_in);
    const acceptTerms = Boolean(customer?.accept_terms);
    const acceptPrivacy = Boolean(customer?.accept_privacy);

    if (!email || !acceptTerms || !acceptPrivacy) {
      return new Response(JSON.stringify({ error: 'missing_required_fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      .upsert(
        {
          email,
          phone,
          full_name: fullName,
          locale,
          marketing_opt_in: marketingOptIn,
          terms_accepted_at: acceptTerms ? nowIso : null,
          privacy_accepted_at: acceptPrivacy ? nowIso : null,
        },
        { onConflict: 'email' },
      )
      .select('id')
      .single();

    if (custUpsert.error) throw new Error(custUpsert.error.message);
    const customerId = custUpsert.data.id;

    // Resolve cart items against DB (products) and validate gift card amount
    const orderItems: Array<any> = [];
    let subtotalCents = 0;

    for (const it of items) {
      if (it.kind === 'product') {
        const productId = String(it.productId || '');
        const qty = Math.max(1, Number(it.qty || 1));

        // Private €1 test product: only usable with a server-side secret token.
        if (productId === PRIVATE_TEST_PRODUCT_ID) {
          if (items.length !== 1 || qty !== 1) {
            return new Response(JSON.stringify({ error: 'test_item_must_be_alone' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          if (body?.gift_code) {
            return new Response(JSON.stringify({ error: 'test_item_no_discounts' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const expected = Deno.env.get('TEST_CHECKOUT_TOKEN') || '';
          const got = String(getHeader(req, 'x-test-checkout-token') || '');
          if (!expected || !got || got !== expected) {
            return new Response(JSON.stringify({ error: 'test_item_forbidden' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          subtotalCents += PRIVATE_TEST_PRODUCT_PRICE_CENTS;
          orderItems.push({
            kind: 'product',
            product_id: null,
            name: locale === 'lt' ? 'Testinis apmokėjimas (privatus) – 1€' : 'Test payment (private) – €1',
            unit_price_cents: PRIVATE_TEST_PRODUCT_PRICE_CENTS,
            qty: 1,
            meta: { private_test: true },
          });
          continue;
        }

        const p = await supabase
          .from('products_active_localized')
          .select('product_id,price_cents,currency,name,description,locale')
          .eq('product_id', productId)
          .eq('locale', locale)
          .maybeSingle();

        if (p.error) throw new Error(p.error.message);
        if (!p.data) {
          return new Response(JSON.stringify({ error: 'invalid_product' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        subtotalCents += p.data.price_cents * qty;

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
        // Minimum gift card: 50 EUR
        if (!Number.isFinite(amountCents) || amountCents < 5000) {
          return new Response(JSON.stringify({ error: 'invalid_gift_amount' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        subtotalCents += amountCents;

        const name = locale === 'lt' ? 'Dovanų kuponas' : 'Gift card';
        orderItems.push({
          kind: 'gift_card',
          product_id: null,
          name,
          unit_price_cents: amountCents,
          qty: 1,
          meta: it.meta || {},
        });
      } else {
        return new Response(JSON.stringify({ error: 'invalid_item' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Gift code discount (optional): reserve amount and reduce PaymentIntent amount.
    let discountCents = 0;
    let giftCardId: string | null = null;

    if (hasPrivateTestItem && body?.gift_code) {
      return new Response(JSON.stringify({ error: 'test_item_no_discounts' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rawGift = body?.gift_code ? String(body.gift_code) : '';
    if (rawGift) {
      const code = normalizeGiftCode(rawGift);
      if (!code) {
        return new Response(JSON.stringify({ error: 'invalid_gift_code' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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
        return new Response(JSON.stringify({ error: 'invalid_gift_code' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const expiresAt = new Date(gc.data.expires_at);
      if (gc.data.status !== 'active' || expiresAt.getTime() <= Date.now()) {
        return new Response(JSON.stringify({ error: 'gift_expired' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const available = await supabase.rpc('gift_card_available_cents', { p_gift_card_id: gc.data.id });
      if (available.error) throw new Error(available.error.message);

      const availCents = Number(available.data || 0);
      discountCents = Math.min(availCents, subtotalCents);
      giftCardId = gc.data.id;
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

    // Create reservation if gift card applied
    if (giftCardId && discountCents > 0) {
      const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const res = await supabase.from('gift_card_reservations').insert({
        gift_card_id: giftCardId,
        order_id: orderId,
        amount_cents: discountCents,
        status: 'active',
        expires_at: expires,
      });
      if (res.error) throw new Error(res.error.message);

      await supabase.from('gift_card_ledger').insert({
        gift_card_id: giftCardId,
        type: 'reserve',
        order_id: orderId,
        amount_cents: -discountCents,
      });
    }

    if (totalCents <= 0) {
      // No payment required; mark paid + send emails here (no Stripe webhook will fire).
      const paidAt = new Date().toISOString();

      await supabase
        .from('orders')
        .update({ status: 'paid', paid_at: paidAt })
        .eq('id', orderId);

      await supabase.from('order_events').insert({
        order_id: orderId,
        actor_type: 'system',
        event_type: 'status_changed',
        payload: { status: 'paid' },
      });

      const consume = await supabase.rpc('consume_gift_card_reservation', { p_order_id: orderId });
      if (consume.error) {
        await supabase.from('order_events').insert({
          order_id: orderId,
          actor_type: 'system',
          event_type: 'gift_reservation_consume_failed',
          payload: { error: consume.error.message },
        });
      }

      // Issue gift cards (if any gift-card items exist)
      let pepper: string | null = null;

      const adminItemLines: string[] = [];
      const giftCardCodes: Array<{ code: string; expiryDate: string }> = [];
      const customerItemLines: string[] = [];

      for (const it of orderItems) {
        // Always list items for the admin email.
        if (it.kind === 'gift_card') {
          const qty = Number(it.qty || 1);
          const amountCents = Number(it.unit_price_cents) * qty;
          adminItemLines.push(`${locale === 'lt' ? 'Dovanų kuponas' : 'Gift card'} ×${qty} (${formatEur(amountCents)})`);
        } else {
          const qty = Number(it.qty || 1);
          adminItemLines.push(`${String(it.name || (locale === 'lt' ? 'Paslauga' : 'Service'))} ×${qty}`);
        }

        // Customer email list
        {
          const qty = Number(it.qty || 1);
          const meta: any = it.meta || {};
          const name = String(
            meta.displayName ||
              meta.display_name ||
              meta.title ||
              meta.name ||
              it.name ||
              (locale === 'en' ? 'Item' : 'Prekė')
          );
          const amountCents = Number(it.unit_price_cents) * qty;
          const line = Number.isFinite(amountCents) && amountCents > 0
            ? `${name} ×${qty} (${formatEur(amountCents)})`
            : `${name} ×${qty}`;
          customerItemLines.push(line);
        }

        if (it.kind !== 'gift_card') continue;

        if (!pepper) {
          pepper = Deno.env.get('GIFT_CARD_PEPPER') ?? null;
          if (!pepper) throw new Error('Missing GIFT_CARD_PEPPER');
        }

        const amountCents = Number(it.unit_price_cents) * Number(it.qty || 1);
        const code = randomGiftCode();
        const normalized = normalizeGiftCode(code);
        const hash = await sha256Hex(`${normalized}:${pepper}`);

        const expiresAt = new Date(paidAt);
        expiresAt.setMonth(expiresAt.getMonth() + 12);

        const meta: any = it.meta || {};
        const recipientName = meta.recipientName || meta.recipient_name || null;
        const buyerName = fullName || null;
        const buyerEmail = email || null;

        const gcIns = await supabase
          .from('gift_cards')
          .insert({
            code_hash: hash,
            initial_amount_cents: amountCents,
            remaining_amount_cents: amountCents,
            currency: 'EUR',
            status: 'active',
            purchased_order_id: orderId,
            recipient_name: recipientName,
            recipient_email: null,
            buyer_name: buyerName,
            buyer_email: buyerEmail,
            expires_at: expiresAt.toISOString(),
          })
          .select('id,expires_at')
          .single();

        if (gcIns.error) throw new Error(gcIns.error.message);

        await supabase.from('gift_card_ledger').insert({
          gift_card_id: gcIns.data.id,
          type: 'issue',
          order_id: orderId,
          amount_cents: amountCents,
        });

        const expiryDate = new Date(gcIns.data.expires_at).toLocaleDateString(locale === 'lt' ? 'lt-LT' : 'en-US');
        giftCardCodes.push({ code, expiryDate });
      }

      // Customer email
      try {
        const tpl = renderOrderPaidEmail(locale, formatEur(totalCents), giftCardCodes.length ? giftCardCodes : undefined, customerItemLines);
        const sent = await sendEmail({
          to: email,
          subject: tpl.subject,
          html: tpl.html,
          template: tpl.template,
          locale,
          related_order_id: orderId,
        });
        await supabase.from('email_log').insert({
          to_email: email,
          template: tpl.template,
          locale,
          related_order_id: orderId,
          provider_message_id: sent.providerId,
          status: sent.ok ? 'sent' : 'failed',
        });
      } catch {
        await supabase.from('email_log').insert({
          to_email: email,
          template: 'order_paid',
          locale,
          related_order_id: orderId,
          provider_message_id: null,
          status: 'failed',
        });
      }

      // Admin email (optional)
      const adminEmail = Deno.env.get('ADMIN_EMAIL');
      if (adminEmail) {
        try {
          const tpl = renderAdminNewOrderPaid(formatEur(totalCents), adminItemLines, {
            email,
            phone,
            fullName,
            marketingOptIn,
          });
          const sent = await sendEmail({
            to: adminEmail,
            subject: tpl.subject,
            html: tpl.html,
            template: tpl.template,
            locale: 'lt',
            related_order_id: orderId,
          });
          await supabase.from('email_log').insert({
            to_email: adminEmail,
            template: tpl.template,
            locale: 'lt',
            related_order_id: orderId,
            provider_message_id: sent.providerId,
            status: sent.ok ? 'sent' : 'failed',
          });
        } catch {
          await supabase.from('email_log').insert({
            to_email: adminEmail,
            template: 'admin_new_order_paid',
            locale: 'lt',
            related_order_id: orderId,
            provider_message_id: null,
            status: 'failed',
          });
        }
      }

      return new Response(
        JSON.stringify({ client_secret: null, order_id: orderId, zero_total: true, total_cents: totalCents, currency: 'eur' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const pi = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'eur',
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: orderId,
        locale,
        ...(authUserId ? { auth_user_id: authUserId } : {}),
      },
    });

    const up = await supabase
      .from('orders')
      .update({ stripe_payment_intent_id: pi.id })
      .eq('id', orderId);
    if (up.error) throw new Error(up.error.message);

    return new Response(JSON.stringify({ client_secret: pi.client_secret, order_id: orderId, total_cents: totalCents, currency: 'eur' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    const isRateLimited = String(e?.message || '') === 'rate_limited';
    if (!isRateLimited) {
      console.error('[create-payment-intent] error', e);
    }
    const status = isRateLimited ? 429 : 500;
    return new Response(JSON.stringify({ error: isRateLimited ? 'rate_limited' : 'server_error' }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
