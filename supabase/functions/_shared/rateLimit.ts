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

  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / (windowSeconds * 1000)) * windowSeconds * 1000);

  const existing = await supabase.from('function_rate_limits').select('*').eq('key', key).maybeSingle();
  if (existing.error) throw new Error(existing.error.message);

  if (!existing.data) {
    const ins = await supabase.from('function_rate_limits').insert({
      key,
      window_started_at: windowStart.toISOString(),
      count: 1,
    });
    if (ins.error) throw new Error(ins.error.message);
    return;
  }

  const existingStart = new Date(existing.data.window_started_at);
  if (existingStart.getTime() !== windowStart.getTime()) {
    const up = await supabase.from('function_rate_limits').update({
      window_started_at: windowStart.toISOString(),
      count: 1,
    }).eq('key', key);
    if (up.error) throw new Error(up.error.message);
    return;
  }

  if (existing.data.count >= limit) {
    throw new Error('rate_limited');
  }

  const up = await supabase.from('function_rate_limits').update({
    count: existing.data.count + 1,
  }).eq('key', key);
  if (up.error) throw new Error(up.error.message);
}
