import { getCorsHeaders, handleOptions } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/supabase.ts';
import { rateLimit } from '../_shared/rateLimit.ts';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve: (handler: (req: any) => Promise<any> | any) => void;
};

type Body = { gift_card_id?: string };

Deno.serve(async (req: any) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const corsHeaders = getCorsHeaders(req);

  if (req.method !== 'POST') {
    return new Response('method_not_allowed', { status: 405, headers: corsHeaders });
  }

  try {
    await rateLimit(req, 'admin-delete-gift-card', 5, 60);

    const auth = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = auth.slice('bearer '.length).trim();

    const supabase = getServiceClient();

    const userRes = await supabase.auth.getUser(token);
    if (userRes.error || !userRes.data?.user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminCheck = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userRes.data.user.id)
      .maybeSingle();

    if (adminCheck.error) throw new Error(adminCheck.error.message);
    if (!adminCheck.data) {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: Body = await req.json();
    const id = String(body?.gift_card_id || '').trim();
    if (!id) {
      return new Response(JSON.stringify({ error: 'missing_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate UUID format to prevent injection of invalid identifiers
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return new Response(JSON.stringify({ error: 'invalid_id_format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Audit trail: log deletion before it happens so it is recoverable.
    const gcData = await supabase
      .from('gift_cards')
      .select('purchased_order_id,initial_amount_cents,remaining_amount_cents,status')
      .eq('id', id)
      .maybeSingle();

    if (gcData.data?.purchased_order_id) {
      await supabase.from('order_events').insert({
        order_id: gcData.data.purchased_order_id,
        actor_type: 'admin',
        event_type: 'gift_card_deleted',
        payload: {
          gift_card_id: id,
          admin_user_id: userRes.data.user.id,
          initial_amount_cents: gcData.data.initial_amount_cents,
          remaining_amount_cents: gcData.data.remaining_amount_cents,
          status_before: gcData.data.status,
        },
      });
    }

    const del = await supabase.from('gift_cards').delete().eq('id', id);
    if (del.error) throw new Error(del.error.message);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    const isRateLimited = String(e?.message || '') === 'rate_limited';
    if (!isRateLimited) {
      console.error('[admin-delete-gift-card] error', e);
    }
    const status = isRateLimited ? 429 : 500;
    return new Response(JSON.stringify({ error: isRateLimited ? 'rate_limited' : 'server_error' }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
