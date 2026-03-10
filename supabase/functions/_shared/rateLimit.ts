import { getServiceClient } from './supabase.ts';

function getIp(req: Request): string {
  // Prefer Cloudflare's verified header (cannot be spoofed by the client).
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  return 'unknown';
}

export { getIp };

/**
 * Per-function rate limit.  Also enforces a global per-IP budget
 * (across ALL public endpoints) so an attacker cannot multiply their
 * effective request allowance by hitting many different functions.
 */
export async function rateLimit(req: Request, name: string, limit: number, windowSeconds: number) {
  const ip = getIp(req);
  const supabase = getServiceClient();

  // Global per-IP budget: 60 requests / 60 seconds across all functions.
  // Uses the same key prefix regardless of function name.
  const globalKey = `global:${ip}`;
  const globalResult = await supabase.rpc('check_rate_limit', {
    p_key: globalKey,
    p_limit: 60,
    p_window_seconds: 60,
  });
  if (globalResult.error) throw new Error(globalResult.error.message);
  if (globalResult.data === false) throw new Error('rate_limited');

  // Per-function rate limit (existing behaviour).
  const key = `${name}:${ip}`;
  const result = await supabase.rpc('check_rate_limit', {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (result.error) throw new Error(result.error.message);
  if (result.data === false) throw new Error('rate_limited');
}
