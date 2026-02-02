import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno';

declare const Deno: { env: { get(name: string): string | undefined } };

export function getStripe() {
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  return new Stripe(key, { apiVersion: '2023-10-16' });
}

export function getWebhookSecrets() {
  const raw = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!raw) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
  const secrets = raw
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  if (!secrets.length) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
  return secrets;
}

export function getWebhookSecret() {
  return getWebhookSecrets()[0];
}
