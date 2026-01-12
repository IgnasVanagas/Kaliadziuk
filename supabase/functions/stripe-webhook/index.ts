import { corsHeaders, handleOptions } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/supabase.ts';
import { getStripe, getWebhookSecret } from '../_shared/stripe.ts';
import { normalizeGiftCode, randomGiftCode, sha256Hex } from '../_shared/crypto.ts';
import { renderAdminDispute, renderAdminNewOrderPaid, renderAdminRefund, renderGiftCardRecipientEmail, renderOrderPaidEmail, sendEmail } from '../_shared/email.ts';

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
    locale?: 'lt' | 'en';
  }
) {
  const { orderId, paidAt, stripePaymentIntentId, stripeCustomerId } = params;

  const orderRes = await supabase
    .from('orders')
    .select('id,status,total_cents,customer_id,locale')
    .eq('id', orderId)
    .single();
  if (orderRes.error) throw new Error(orderRes.error.message);

  const effectiveLocale: 'lt' | 'en' =
    (params.locale ?? (orderRes.data.locale === 'en' ? 'en' : 'lt'));

  if (orderRes.data.status === 'paid') return;

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
    .select('email')
    .eq('id', orderRes.data.customer_id)
    .single();
  if (cust.error) throw new Error(cust.error.message);

  // Issue gift cards if order contains gift-card items
  const items = await supabase
    .from('order_items')
    .select('id,kind,unit_price_cents,qty,meta')
    .eq('order_id', orderId);
  if (items.error) throw new Error(items.error.message);

  const pepper = Deno.env.get('GIFT_CARD_PEPPER');
  if (!pepper) throw new Error('Missing GIFT_CARD_PEPPER');

  for (const it of items.data || []) {
    if (it.kind !== 'gift_card') continue;

    const amountCents = Number(it.unit_price_cents) * Number(it.qty || 1);
    const code = randomGiftCode();
    const normalized = normalizeGiftCode(code);
    const hash = await sha256Hex(`${normalized}:${pepper}`);
    const expiresAt = new Date(paidAt);
    expiresAt.setMonth(expiresAt.getMonth() + 12);

    const meta = it.meta || {};
    const recipientName = meta.recipientName || meta.recipient_name || null;
    const recipientEmail = meta.recipientEmail || meta.recipient_email || null;
    const buyerName = meta.buyerName || meta.buyer_name || null;
    const buyerEmail = meta.buyerEmail || meta.buyer_email || null;

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
        recipient_email: recipientEmail,
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

    const expiryDate = new Date(gcIns.data.expires_at).toLocaleDateString(effectiveLocale === 'lt' ? 'lt-LT' : 'en-US');
    const to = recipientEmail || buyerEmail || cust.data.email;

    const tpl = renderGiftCardRecipientEmail(effectiveLocale, code, expiryDate);
    const sent = await sendEmail({
      to,
      subject: tpl.subject,
      html: tpl.html,
      template: tpl.template,
      locale: effectiveLocale,
      related_order_id: orderId,
    });

    await supabase.from('email_log').insert({
      to_email: to,
      template: tpl.template,
      locale: effectiveLocale,
      related_order_id: orderId,
      provider_message_id: sent.providerId,
      status: sent.ok ? 'sent' : 'failed',
    });
  }

  // Customer email
  {
    const tpl = renderOrderPaidEmail(orderRes.data.locale === 'en' ? 'en' : 'lt', formatEur(orderRes.data.total_cents));
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
      const tpl = renderAdminNewOrderPaid(formatEur(orderRes.data.total_cents));
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

  const supabase = getServiceClient();
  const stripe = getStripe();
  let insertedEventId: string | null = null;

  try {
    const sig = req.headers.get('stripe-signature');
    if (!sig) {
      return new Response('missing_signature', { status: 400, headers: corsHeaders });
    }

    const rawBody = await req.text();
    const secret = getWebhookSecret();

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, secret);
    } catch (e) {
      return new Response('invalid_signature', { status: 400, headers: corsHeaders });
    }

    // Idempotency
    const insert = await supabase
      .from('stripe_events')
      .insert({ event_id: event.id, type: event.type })
      .select('event_id')
      .maybeSingle();

    if (insert.error) {
      // Ignore only true duplicates; anything else should fail loudly.
      const msg = String(insert.error.message || 'insert_failed');
      const code = (insert.error as any).code;
      const isDuplicate = code === '23505' || msg.toLowerCase().includes('duplicate');
      if (isDuplicate) {
        return new Response('ok', { status: 200, headers: corsHeaders });
      }
      return new Response('stripe_events_insert_failed', { status: 500, headers: corsHeaders });
    }

    insertedEventId = event.id;

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
        locale,
      });

      await markStripeEventStatus(supabase, event.id, 'processed');
      return new Response('ok', { status: 200, headers: corsHeaders });
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      let orderId = pi?.metadata?.order_id as string | undefined;
      const locale: 'lt' | 'en' | undefined = pi?.metadata?.locale === 'en' ? 'en' : (pi?.metadata?.locale ? 'lt' : undefined);

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
        return new Response('missing_order_id', { status: 200, headers: corsHeaders });
      }

      const paidAt = new Date().toISOString();
      await handleOrderPaid(supabase, {
        orderId,
        paidAt,
        stripePaymentIntentId: pi?.id || null,
        stripeCustomerId: (pi as any)?.customer || null,
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
