import { corsHeaders, handleOptions } from '../_shared/cors.ts';
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

Deno.serve(async (req: Request) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return new Response('method_not_allowed', { status: 405, headers: corsHeaders });
  }

  try {
    await rateLimit(req, 'contact-form', 5, 60);

    const body: any = await req.json();
    const locale: 'lt' | 'en' = body?.locale === 'en' ? 'en' : 'lt';

    const name = clamp(asTrimmedString(body?.name), 120) || null;
    const email = clamp(asTrimmedString(body?.email), 200);
    const phone = clamp(asTrimmedString(body?.phone), 60) || null;
    const message = clamp(asTrimmedString(body?.message), 4000);
    const pageUrl = clamp(asTrimmedString(body?.page_url), 500) || null;

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
    const code = String(e?.message || e || 'error');
    const status = code === 'rate_limited' ? 429 : 500;
    return new Response(JSON.stringify({ error: code }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
