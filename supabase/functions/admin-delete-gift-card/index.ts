import { corsHeaders, handleOptions } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/supabase.ts';
import { rateLimit } from '../_shared/rateLimit.ts';

type Body = { gift_card_id?: string };

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    await rateLimit(req, 'admin-delete-gift-card', 30, 60);

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

    const del = await supabase.from('gift_cards').delete().eq('id', id);
    if (del.error) throw new Error(del.error.message);

    return new Response(JSON.stringify({ ok: true }), {
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
