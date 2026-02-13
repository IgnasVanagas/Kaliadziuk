const DEFAULT_ALLOWED_ORIGINS = [
  'https://kaliadziuk.lt',
  'https://www.kaliadziuk.lt',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function parseAllowedOrigins(envValue: string | undefined | null) {
  const raw = String(envValue || '').trim();
  if (!raw) return null;
  const origins = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return origins.length ? origins : null;
}

function getAllowedOrigins() {
  // Comma-separated list, e.g.
  // ALLOWED_ORIGINS=https://kaliadziuk.lt,https://www.kaliadziuk.lt,http://localhost:5173
  const configured = parseAllowedOrigins(Deno?.env?.get?.('ALLOWED_ORIGINS'));
  return configured ?? DEFAULT_ALLOWED_ORIGINS;
}

function isAllowedOrigin(origin: string) {
  const allowed = getAllowedOrigins();
  return allowed.includes(origin);
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  const allowOrigin = origin && isAllowedOrigin(origin) ? origin : '';

  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, x-test-checkout-token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };

  // If Origin isn't allowed (or is missing), omit ACAO so browsers block cross-site.
  if (allowOrigin) headers['Access-Control-Allow-Origin'] = allowOrigin;
  return headers;
}

// Back-compat export (prefer getCorsHeaders(req) in handlers).
export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': DEFAULT_ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, x-test-checkout-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
};

export function handleOptions(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }
  return null;
}
