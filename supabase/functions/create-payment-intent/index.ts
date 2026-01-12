import { corsHeaders, handleOptions } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/supabase.ts';
import { getStripe } from '../_shared/stripe.ts';
import { normalizeGiftCode, sha256Hex } from '../_shared/crypto.ts';
import { rateLimit } from '../_shared/rateLimit.ts';

type CartItem = {
  kind: 'product' | 'gift_card';
  productId?: string | null;
  qty?: number;
  unitPriceCents?: number;
  amountCents?: number;
  name?: string;
  meta?: Record<string, unknown>;
};

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

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

    const items: CartItem[] = Array.isArray(body?.items) ? body.items : [];
    if (items.length === 0) {
      return new Response(JSON.stringify({ error: 'empty_cart' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
        if (!Number.isFinite(amountCents) || amountCents < 1000) {
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
      // No payment required; frontend can redirect to success.
      return new Response(JSON.stringify({ client_secret: null, order_id: orderId, zero_total: true, total_cents: totalCents, currency: 'eur' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pi = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'eur',
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: orderId,
        locale,
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
  } catch (e) {
    const msg = e?.message === 'rate_limited' ? 'rate_limited' : (e?.message || 'server_error');
    const status = e?.message === 'rate_limited' ? 429 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
