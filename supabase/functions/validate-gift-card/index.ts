import { corsHeaders, handleOptions } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/supabase.ts';
import { normalizeGiftCode, sha256Hex } from '../_shared/crypto.ts';
import { rateLimit } from '../_shared/rateLimit.ts';

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    await rateLimit(req, 'validate-gift-card', 30, 60);

    const body = await req.json();
    const code = normalizeGiftCode(body?.code || '');
    const subtotal = Number(body?.cart_subtotal_cents || 0);

    if (!code) {
      return new Response(JSON.stringify({ error: 'missing_code' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return new Response(JSON.stringify({ error: 'invalid_subtotal' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const pepper = Deno.env.get('GIFT_CARD_PEPPER');
    if (!pepper) throw new Error('Missing GIFT_CARD_PEPPER');

    const hash = await sha256Hex(`${code}:${pepper}`);
    const supabase = getServiceClient();

    const gc = await supabase
      .from('gift_cards')
      .select('id,remaining_amount_cents,status,expires_at')
      .eq('code_hash', hash)
      .maybeSingle();

    if (gc.error) throw new Error(gc.error.message);
    if (!gc.data) {
      return new Response(JSON.stringify({ error: 'invalid_code' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const expiresAt = new Date(gc.data.expires_at);
    if (gc.data.status !== 'active' || expiresAt.getTime() <= Date.now()) {
      return new Response(JSON.stringify({ error: 'expired_or_inactive' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const available = await supabase.rpc('gift_card_available_cents', { p_gift_card_id: gc.data.id });
    if (available.error) throw new Error(available.error.message);

    const availCents = Number(available.data || 0);
    const discount = Math.min(availCents, subtotal);

    return new Response(JSON.stringify({ discount_cents: discount }), {
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
