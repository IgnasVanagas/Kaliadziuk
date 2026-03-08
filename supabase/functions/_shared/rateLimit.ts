import { getServiceClient } from './supabase.ts';

function getIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

export async function rateLimit(req: Request, name: string, limit: number, windowSeconds: number) {
  const ip = getIp(req);
  const key = `${name}:${ip}`;
  const supabase = getServiceClient();

  // Atomic check-and-increment via Postgres function to prevent TOCTOU races.
  const result = await supabase.rpc('check_rate_limit', {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (result.error) throw new Error(result.error.message);

  // The function returns true if allowed, false if rate-limited.
  if (result.data === false) {
    throw new Error('rate_limited');
  }
}
