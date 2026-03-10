import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const uploadsDir = path.resolve(rootDir, 'uploads');

/**
 * Build the Content-Security-Policy string using Supabase project URLs
 * from environment variables so the CSP is always in sync with the
 * deployed backend and never uses an overly-broad wildcard.
 */
function buildCsp(env) {
  const supabaseOrigins = new Set();
  for (const key of ['VITE_SUPABASE_URL', 'VITE_SUPABASE_FUNCTIONS_URL']) {
    const val = env[key];
    if (val) {
      try { supabaseOrigins.add(new URL(val).origin); } catch { /* skip invalid */ }
    }
  }

  // Fallback: if no env vars are set (e.g. first checkout / CI without secrets),
  // block everything except same-origin so the page still loads safely.
  const connectSrc = supabaseOrigins.size
    ? `'self' ${[...supabaseOrigins].join(' ')} https://api.stripe.com https://challenges.cloudflare.com https://www.google-analytics.com https://region1.google-analytics.com`
    : "'self' https://api.stripe.com https://challenges.cloudflare.com https://www.google-analytics.com https://region1.google-analytics.com";

  return [
    "default-src 'self'",
    "script-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    `connect-src ${connectSrc}`,
    'frame-src https://challenges.cloudflare.com https://js.stripe.com https://hooks.stripe.com',
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ') + ';';
}

function cspPlugin(env) {
  const csp = buildCsp(env);
  return {
    name: 'inject-csp',
    transformIndexHtml(html) {
      return html.replace('%%CSP_CONTENT%%', csp);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, 'VITE_');

  return {
    plugins: [react(), cspPlugin(env)],
    server: {
      fs: {
        allow: [rootDir, uploadsDir],
      },
    },
  };
});
