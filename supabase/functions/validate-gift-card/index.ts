import { getCorsHeaders, handleOptions } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/supabase.ts';
import { normalizeGiftCode, sha256Hex } from '../_shared/crypto.ts';
import { rateLimit } from '../_shared/rateLimit.ts';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve: (handler: (req: any) => Promise<any> | any) => void;
};

Deno.serve(async (req: any) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const corsHeaders = getCorsHeaders(req);

  if (req.method !== 'POST') {
    return new Response('method_not_allowed', { status: 405, headers: corsHeaders });
  }

  try {
    await rateLimit(req, 'validate-gift-card', 3, 60);

    // Enforce a minimum response time to prevent timing-based code enumeration.
    const minDelayMs = 200;
    const start = Date.now();

    const body = await req.json();
    const code = normalizeGiftCode(body?.code || '');
    const subtotal = Number(body?.cart_subtotal_cents || 0);

    // Uniform error response — all rejection paths return the same generic
    // error code so an attacker cannot distinguish "not found" from "expired"
    // or "invalid format" via response content.
    const GENERIC_ERROR = 'invalid_code';

    if (!code || !Number.isFinite(subtotal) || subtotal < 0) {
      // Still perform pepper + hash + DB lookup so timing is indistinguishable
      // from a real lookup (prevents format-based timing oracle).
      const pepper = Deno.env.get('GIFT_CARD_PEPPER');
      if (pepper) {
        const dummyHash = await sha256Hex(`DUMMY:${pepper}`);
        const supabase = getServiceClient();
        await supabase.from('gift_cards').select('id').eq('code_hash', dummyHash).maybeSingle();
      }
      const elapsed = Date.now() - start;
      if (elapsed < minDelayMs) await new Promise((r) => setTimeout(r, minDelayMs - elapsed));
      return new Response(JSON.stringify({ error: GENERIC_ERROR }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
      const elapsed = Date.now() - start;
      if (elapsed < minDelayMs) await new Promise((r) => setTimeout(r, minDelayMs - elapsed));
      return new Response(JSON.stringify({ error: GENERIC_ERROR }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const expiresAt = new Date(gc.data.expires_at);
    if (gc.data.status !== 'active' || expiresAt.getTime() <= Date.now()) {
      const elapsed = Date.now() - start;
      if (elapsed < minDelayMs) await new Promise((r) => setTimeout(r, minDelayMs - elapsed));
      return new Response(JSON.stringify({ error: GENERIC_ERROR }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const available = await supabase.rpc('gift_card_available_cents', { p_gift_card_id: gc.data.id });
    if (available.error) throw new Error(available.error.message);

    const availCents = Number(available.data || 0);
    const discount = Math.min(availCents, subtotal);

    const elapsed = Date.now() - start;
    if (elapsed < minDelayMs) await new Promise((r) => setTimeout(r, minDelayMs - elapsed));

    return new Response(JSON.stringify({ discount_cents: discount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    const isRateLimited = String(e?.message || '') === 'rate_limited';
    if (!isRateLimited) {
      console.error('[validate-gift-card] error', e);
    }
    const status = isRateLimited ? 429 : 500;
    return new Response(JSON.stringify({ error: isRateLimited ? 'rate_limited' : 'server_error' }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
