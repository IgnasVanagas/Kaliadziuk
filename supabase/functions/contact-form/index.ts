import { getCorsHeaders, handleOptions } from '../_shared/cors.ts';
import { rateLimit } from '../_shared/rateLimit.ts';
import { renderAdminContactForm, sendEmail } from '../_shared/email.ts';
import { getServiceClient } from '../_shared/supabase.ts';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

function asTrimmedString(v: unknown) {
  const s = String(v ?? '').trim();
  return s.length ? s : '';
}

function clamp(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max);
}

function getIp(req: Request): string {
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  return 'unknown';
}

async function verifyTurnstile(args: { token: string; ip?: string | null }) {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (!secret || !secret.trim()) {
    if (Deno.env.get('TURNSTILE_DISABLED') === 'true') {
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const isLocal = supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1');
      if (!stripeKey.startsWith('sk_live_') && isLocal) {
        console.warn('[turnstile] bypassed – local development environment');
        return { enforced: false, ok: true as const };
      }
      console.error('[turnstile] TURNSTILE_DISABLED ignored – not a local dev environment');
    }
    console.error('CRITICAL: TURNSTILE_SECRET_KEY not set. Set TURNSTILE_DISABLED=true to bypass in development.');
    return { enforced: true, ok: false as const, error: 'captcha_unavailable' as const };
  }

  const token = String(args.token || '').trim();
  if (!token) {
    return { enforced: true, ok: false as const, error: 'missing_captcha' as const };
  }

  const form = new URLSearchParams();
  form.set('secret', secret.trim());
  form.set('response', token);
  if (args.ip && args.ip !== 'unknown') form.set('remoteip', args.ip);

  const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  const data: any = await resp.json().catch(() => null);
  if (data?.success) {
    return { enforced: true, ok: true as const };
  }
  return { enforced: true, ok: false as const, error: 'captcha_failed' as const };
}

Deno.serve(async (req: Request) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const corsHeaders = getCorsHeaders(req);

  if (req.method !== 'POST') {
    return new Response('method_not_allowed', { status: 405, headers: corsHeaders });
  }

  try {
    await rateLimit(req, 'contact-form', 5, 60);

    const body: any = await req.json();
    const locale: 'lt' | 'en' = body?.locale === 'en' ? 'en' : 'lt';

    // Honeypot: bots often fill hidden fields.
    const website = clamp(asTrimmedString(body?.website), 200);
    if (website) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const name = clamp(asTrimmedString(body?.name), 120) || null;
    const email = clamp(asTrimmedString(body?.email), 200);
    const phone = clamp(asTrimmedString(body?.phone), 60) || null;
    const message = clamp(asTrimmedString(body?.message), 4000);
    const pageUrl = clamp(asTrimmedString(body?.page_url), 500) || null;

    const captchaToken = clamp(asTrimmedString(body?.turnstile_token ?? body?.cf_turnstile_response ?? body?.captcha_token), 3000);
    const captcha = await verifyTurnstile({ token: captchaToken, ip: getIp(req) });
    if (!captcha.ok) {
      return new Response(JSON.stringify({ error: captcha.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!email || !message) {
      return new Response(JSON.stringify({ error: 'missing_required_fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminEmail = Deno.env.get('ADMIN_EMAIL');
    if (!adminEmail) {
      return new Response(JSON.stringify({ error: 'missing_admin_email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tpl = renderAdminContactForm({
      locale,
      name,
      email,
      phone,
      message,
      pageUrl,
    });

    const sent = await sendEmail({
      to: adminEmail,
      subject: tpl.subject,
      html: tpl.html,
      template: tpl.template,
      locale: 'lt',
    });

    try {
      const supabase = getServiceClient();
      await supabase.from('email_log').insert({
        to_email: adminEmail,
        template: tpl.template,
        locale: 'lt',
        related_order_id: null,
        provider_message_id: sent.providerId,
        status: sent.ok ? 'sent' : 'failed',
      });
    } catch {
      // ignore logging failures
    }

    return new Response(JSON.stringify({ ok: sent.ok }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    const isRateLimited = String(e?.message || '') === 'rate_limited';
    if (!isRateLimited) {
      console.error('[contact-form] error', e);
    }
    const status = isRateLimited ? 429 : 500;
    return new Response(JSON.stringify({ error: isRateLimited ? 'rate_limited' : 'server_error' }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
