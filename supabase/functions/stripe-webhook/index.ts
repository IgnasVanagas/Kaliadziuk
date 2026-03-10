import { getCorsHeaders, handleOptions } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/supabase.ts';
import { getStripe, getWebhookSecrets } from '../_shared/stripe.ts';
import { normalizeGiftCode, randomGiftCode, sha256Hex } from '../_shared/crypto.ts';
import { renderAdminDispute, renderAdminNewOrderPaid, renderAdminRefund, renderOrderPaidEmail, sendEmail } from '../_shared/email.ts';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

function formatEur(cents: number) {
  const value = (Number(cents || 0) / 100).toFixed(2);
  return `${value} EUR`;
}

async function markStripeEventStatus(supabase: any, eventId: string, status: 'processed' | 'failed', lastError?: string) {
  await supabase.from('stripe_events').update({
    status,
    processed_at: status === 'processed' ? new Date().toISOString() : null,
    last_error: lastError || null,
  }).eq('event_id', eventId);
}

async function handleOrderPaid(
  supabase: any,
  params: {
    orderId: string;
    paidAt: string;
    stripePaymentIntentId?: string | null;
    stripeCustomerId?: string | null;
    stripeAmountCents?: number | null;
    locale?: 'lt' | 'en';
  }
) {
  const { orderId, paidAt, stripePaymentIntentId, stripeCustomerId, stripeAmountCents } = params;

  const orderRes = await supabase
    .from('orders')
    .select('id,status,total_cents,subtotal_cents,discount_cents,customer_id,locale')
    .eq('id', orderId)
    .single();
  if (orderRes.error) throw new Error(orderRes.error.message);

  const effectiveLocale: 'lt' | 'en' =
    (params.locale ?? (orderRes.data.locale === 'en' ? 'en' : 'lt'));

  if (orderRes.data.status === 'paid') return;

  // Verify the Stripe amount matches the order total to prevent amount-tampering.
  if (stripeAmountCents != null && Number.isFinite(stripeAmountCents) && orderRes.data.total_cents > 0) {
    if (stripeAmountCents !== orderRes.data.total_cents) {
      console.error('[stripe-webhook] amount mismatch', {
        orderId,
        dbTotalCents: orderRes.data.total_cents,
        stripeAmountCents,
      });
      throw new Error(`amount_mismatch: order=${orderRes.data.total_cents} stripe=${stripeAmountCents}`);
    }
  }

  const up = await supabase
    .from('orders')
    .update({
      status: 'paid',
      paid_at: paidAt,
      stripe_payment_intent_id: stripePaymentIntentId || null,
      stripe_customer_id: stripeCustomerId || null,
    })
    .eq('id', orderId);
  if (up.error) throw new Error(up.error.message);

  await supabase.from('order_events').insert({
    order_id: orderId,
    actor_type: 'system',
    event_type: 'status_changed',
    payload: { status: 'paid' },
  });

  // Consume gift reservation if present
  const consume = await supabase.rpc('consume_gift_card_reservation', { p_order_id: orderId });
  if (consume.error) {
    await supabase.from('order_events').insert({
      order_id: orderId,
      actor_type: 'system',
      event_type: 'gift_reservation_consume_failed',
      payload: { error: consume.error.message },
    });
  }

  // Fetch customer email
  const cust = await supabase
    .from('customers')
    .select('email,phone,full_name,marketing_opt_in')
    .eq('id', orderRes.data.customer_id)
    .single();
  if (cust.error) throw new Error(cust.error.message);

  const buyerEmail = cust.data.email;

  // Issue gift cards if order contains gift-card items
  const items = await supabase
    .from('order_items')
    .select('id,kind,name,unit_price_cents,qty,meta')
    .eq('order_id', orderId);
  if (items.error) throw new Error(items.error.message);

  // Only required when issuing gift cards.
  let pepper: string | null = null;

  const adminItemLines: string[] = [];
  const customerItemLines: string[] = [];

  const giftCardCodes: Array<{ code: string; expiryDate: string }> = [];

  for (const it of items.data || []) {
    // Always list items for the admin email.
    if (it.kind === 'gift_card') {
      const qty = Number(it.qty || 1);
      const amountCents = Number(it.unit_price_cents) * qty;
      adminItemLines.push(`Dovanų kuponas ×${qty} (${formatEur(amountCents)})`);
    } else {
      const qty = Number(it.qty || 1);
      adminItemLines.push(`${String(it.meta?.displayName || it.meta?.display_name || it.meta?.title || it.meta?.name || it.name || 'Paslauga')} ×${qty}`);
    }

    // Customer email list (use stored item name and include totals when available).
    {
      const qty = Number(it.qty || 1);
      const name = String(
        it.meta?.displayName ||
          it.meta?.display_name ||
          it.meta?.title ||
          it.meta?.name ||
          it.name ||
          (effectiveLocale === 'en' ? 'Item' : 'Prekė')
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

    const meta = it.meta || {};
    const recipientName = meta.recipientName || meta.recipient_name || null;
    const buyerName = cust.data.full_name ?? null;
    const buyerEmail = cust.data.email ?? null;

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

    // Do NOT email the gift card recipient; include codes in the buyer's single order email.
    const expiryDate = new Date(gcIns.data.expires_at).toLocaleDateString(effectiveLocale === 'lt' ? 'lt-LT' : 'en-US');
    giftCardCodes.push({ code, expiryDate });
  }

  // Customer email
  {
    const tpl = renderOrderPaidEmail(
      orderRes.data.locale === 'en' ? 'en' : 'lt',
      formatEur(orderRes.data.total_cents),
      giftCardCodes.length ? giftCardCodes : undefined,
      customerItemLines,
      (orderRes.data.discount_cents && orderRes.data.discount_cents > 0) ? formatEur(orderRes.data.discount_cents) : undefined,
      (orderRes.data.discount_cents && orderRes.data.discount_cents > 0) ? formatEur(orderRes.data.subtotal_cents) : undefined,
    );
    const sent = await sendEmail({
      to: cust.data.email,
      subject: tpl.subject,
      html: tpl.html,
      template: tpl.template,
      locale: orderRes.data.locale === 'en' ? 'en' : 'lt',
      related_order_id: orderId,
    });

    await supabase.from('email_log').insert({
      to_email: cust.data.email,
      template: tpl.template,
      locale: orderRes.data.locale === 'en' ? 'en' : 'lt',
      related_order_id: orderId,
      provider_message_id: sent.providerId,
      status: sent.ok ? 'sent' : 'failed',
    });
  }

  // Admin email (LT-only)
  {
    const adminEmail = Deno.env.get('ADMIN_EMAIL');
    if (adminEmail) {
      const tpl = renderAdminNewOrderPaid(formatEur(orderRes.data.total_cents), adminItemLines, {
        email: cust.data.email ?? null,
        phone: cust.data.phone ?? null,
        fullName: cust.data.full_name ?? null,
        marketingOptIn: typeof cust.data.marketing_opt_in === 'boolean' ? cust.data.marketing_opt_in : null,
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
    }
  }
}

Deno.serve(async (req: Request) => {
  // Stripe will not send OPTIONS, but keeping CORS consistent helps local testing
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const corsHeaders = getCorsHeaders(req);

  if (req.method !== 'POST') {
    return new Response('method_not_allowed', { status: 405, headers: corsHeaders });
  }

  const supabase = getServiceClient();
  const stripe = getStripe();
  let insertedEventId: string | null = null;

  try {
    const sig = req.headers.get('stripe-signature');
    if (!sig) {
      console.error('[stripe-webhook] missing stripe-signature header');
      return new Response('missing_signature', { status: 400, headers: corsHeaders });
    }

    const rawBodyBytes = new Uint8Array(await req.arrayBuffer());
    let event: any;
    try {
      const secrets = getWebhookSecrets();
      let lastErr: unknown = null;
      for (const secret of secrets) {
        try {
          // Use raw bytes to avoid any subtle encoding/normalization changes.
          // Tolerance of 10 minutes covers Stripe retries; idempotency is enforced via stripe_events table.
          event = await stripe.webhooks.constructEventAsync(rawBodyBytes, sig, secret, 600);
          break;
        } catch (e) {
          lastErr = e;
        }
      }
      if (!event) throw lastErr;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e ?? 'invalid_signature');
      console.error('[stripe-webhook] invalid signature', msg);
      return new Response('invalid_signature', { status: 400, headers: corsHeaders });
    }

    console.log('[stripe-webhook] event received', { id: event?.id, type: event?.type });

    // Idempotency: check if event was already processed (guards against transient DB errors on insert).
    const existing = await supabase
      .from('stripe_events')
      .select('event_id,status')
      .eq('event_id', event.id)
      .maybeSingle();

    if (existing.data) {
      // Event already in DB — skip if already processed successfully.
      if (existing.data.status === 'processed') {
        return new Response('ok', { status: 200, headers: corsHeaders });
      }
      // Event exists but failed previously — allow reprocessing below.
      insertedEventId = event.id;
    } else {
      const insert = await supabase
        .from('stripe_events')
        .insert({ event_id: event.id, type: event.type })
        .select('event_id')
        .maybeSingle();

      if (insert.error) {
        const msg = String(insert.error.message || 'insert_failed');
        const code = (insert.error as any).code;
        const isDuplicate = code === '23505' || msg.toLowerCase().includes('duplicate');
        if (isDuplicate) {
          return new Response('ok', { status: 200, headers: corsHeaders });
        }
        console.error('[stripe-webhook] stripe_events insert failed', insert.error);
        return new Response('stripe_events_insert_failed', { status: 500, headers: corsHeaders });
      }
      insertedEventId = event.id;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session?.metadata?.order_id;
      const locale: 'lt' | 'en' | undefined = session?.metadata?.locale === 'en' ? 'en' : (session?.metadata?.locale ? 'lt' : undefined);

      if (!orderId) {
        await markStripeEventStatus(supabase, event.id, 'failed', 'missing_order_id');
        return new Response('missing_order_id', { status: 200, headers: corsHeaders });
      }

      const paidAt = new Date().toISOString();
      await handleOrderPaid(supabase, {
        orderId,
        paidAt,
        stripePaymentIntentId: session?.payment_intent || null,
        stripeCustomerId: session?.customer || null,
        stripeAmountCents: typeof session?.amount_total === 'number' ? session.amount_total : null,
        locale,
      });

      await markStripeEventStatus(supabase, event.id, 'processed');
      return new Response('ok', { status: 200, headers: corsHeaders });
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      let orderId = pi?.metadata?.order_id as string | undefined;
      const locale: 'lt' | 'en' | undefined = pi?.metadata?.locale === 'en' ? 'en' : (pi?.metadata?.locale ? 'lt' : undefined);

      // Checkout Session metadata does not always propagate to PaymentIntent; recover order_id from Checkout.
      if (!orderId && pi?.id) {
        try {
          const sessions = await stripe.checkout.sessions.list({ payment_intent: pi.id, limit: 1 });
          const s = sessions?.data?.[0];
          const recovered = s?.metadata?.order_id as string | undefined;
          if (recovered) orderId = recovered;
        } catch (e) {
          // Keep going; we still have other fallbacks below.
          console.error('[stripe-webhook] failed to resolve checkout session for PI', e instanceof Error ? e.message : e);
        }
      }

      if (!orderId && pi?.id) {
        const order = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_payment_intent_id', pi.id)
          .maybeSingle();
        if (!order.error && order.data?.id) orderId = order.data.id;
      }

      if (!orderId) {
        await markStripeEventStatus(supabase, event.id, 'failed', 'missing_order_id');
        console.error('[stripe-webhook] missing order_id for payment_intent.succeeded', { eventId: event.id, piId: pi?.id });
        return new Response('missing_order_id', { status: 200, headers: corsHeaders });
      }

      const paidAt = new Date().toISOString();
      await handleOrderPaid(supabase, {
        orderId,
        paidAt,
        stripePaymentIntentId: pi?.id || null,
        stripeCustomerId: (pi as any)?.customer || null,
        stripeAmountCents: typeof pi?.amount === 'number' ? pi.amount : null,
        locale,
      });

      await markStripeEventStatus(supabase, event.id, 'processed');
      return new Response('ok', { status: 200, headers: corsHeaders });
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const orderId = session?.metadata?.order_id;
      if (orderId) {
        await supabase.from('orders').update({ status: 'expired' }).eq('id', orderId).neq('status', 'paid');
        await supabase.rpc('release_gift_card_reservation', { p_order_id: orderId });
        await supabase.from('order_events').insert({
          order_id: orderId,
          actor_type: 'system',
          event_type: 'status_changed',
          payload: { status: 'expired' },
        });
      }
      await markStripeEventStatus(supabase, event.id, 'processed');
      return new Response('ok', { status: 200, headers: corsHeaders });
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      const piId = pi?.id;
      if (piId) {
        const order = await supabase.from('orders').select('id,status').eq('stripe_payment_intent_id', piId).maybeSingle();
        if (!order.error && order.data?.id && order.data.status !== 'paid') {
          await supabase.from('orders').update({ status: 'failed' }).eq('id', order.data.id);
          await supabase.rpc('release_gift_card_reservation', { p_order_id: order.data.id });
          await supabase.from('order_events').insert({
            order_id: order.data.id,
            actor_type: 'system',
            event_type: 'status_changed',
            payload: { status: 'failed' },
          });
        }
      }
      await markStripeEventStatus(supabase, event.id, 'processed');
      return new Response('ok', { status: 200, headers: corsHeaders });
    }

    if (event.type === 'charge.refunded') {
      const ch = event.data.object;
      const piId = ch?.payment_intent;
      if (piId) {
        const order = await supabase.from('orders').select('id').eq('stripe_payment_intent_id', piId).maybeSingle();
        if (!order.error && order.data?.id) {
          await supabase.from('orders').update({ status: 'refunded' }).eq('id', order.data.id);
          await supabase.from('order_events').insert({
            order_id: order.data.id,
            actor_type: 'system',
            event_type: 'refund_recorded',
            payload: { charge_id: ch?.id },
          });

          const adminEmail = Deno.env.get('ADMIN_EMAIL');
          if (adminEmail) {
            const tpl = renderAdminRefund();
            const sent = await sendEmail({
              to: adminEmail,
              subject: tpl.subject,
              html: tpl.html,
              template: tpl.template,
              locale: 'lt',
              related_order_id: order.data.id,
            });
            await supabase.from('email_log').insert({
              to_email: adminEmail,
              template: tpl.template,
              locale: 'lt',
              related_order_id: order.data.id,
              provider_message_id: sent.providerId,
              status: sent.ok ? 'sent' : 'failed',
            });
          }
        }
      }
      await markStripeEventStatus(supabase, event.id, 'processed');
      return new Response('ok', { status: 200, headers: corsHeaders });
    }

    if (event.type === 'charge.dispute.created' || event.type === 'charge.dispute.updated') {
      const dispute = event.data.object;
      const chId = dispute?.charge;
      if (chId) {
        const charge = await stripe.charges.retrieve(chId);
        const piId = (charge as any)?.payment_intent;
        if (piId) {
          const order = await supabase.from('orders').select('id').eq('stripe_payment_intent_id', piId).maybeSingle();
          if (!order.error && order.data?.id) {
            await supabase.from('orders').update({ status: 'disputed' }).eq('id', order.data.id);
            await supabase.from('order_events').insert({
              order_id: order.data.id,
              actor_type: 'system',
              event_type: 'dispute_recorded',
              payload: { dispute_id: dispute?.id },
            });

            const adminEmail = Deno.env.get('ADMIN_EMAIL');
            if (adminEmail) {
              const tpl = renderAdminDispute();
              const sent = await sendEmail({
                to: adminEmail,
                subject: tpl.subject,
                html: tpl.html,
                template: tpl.template,
                locale: 'lt',
                related_order_id: order.data.id,
              });
              await supabase.from('email_log').insert({
                to_email: adminEmail,
                template: tpl.template,
                locale: 'lt',
                related_order_id: order.data.id,
                provider_message_id: sent.providerId,
                status: sent.ok ? 'sent' : 'failed',
              });
            }
          }
        }
      }
      await markStripeEventStatus(supabase, event.id, 'processed');
      return new Response('ok', { status: 200, headers: corsHeaders });
    }

    // Default: mark processed for unhandled events
    await markStripeEventStatus(supabase, event.id, 'processed');
    return new Response('ok', { status: 200, headers: corsHeaders });
  } catch (e) {
    if (insertedEventId) {
      const msg = e instanceof Error ? e.message : 'handler_error';
      await markStripeEventStatus(supabase, insertedEventId, 'failed', msg);
    }
    return new Response('error', { status: 500, headers: corsHeaders });
  }
});
