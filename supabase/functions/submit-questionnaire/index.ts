import { getCorsHeaders, handleOptions } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/supabase.ts';
import { rateLimit } from '../_shared/rateLimit.ts';
import { sendEmail } from '../_shared/email.ts';

const fieldLabels: Record<string, string> = {
  goal: "Pagrindinis tikslas",
  motivation: "Patirtis / Motyvacija",
  workday: "Darbo pobūdis",
  sleep: "Miego kokybė (1-10)",
  tracker: "Pulsometras",
  discomforts: "Diskomfortas",
  injury: "Traumos",
  gender: "Lytis",
  age: "Amžius",
  weight: "Svoris (kg)",
  height: "Ūgis (cm)",
  family: "Širdies ligų istorija",
  smoking: "Rūkymas",
  stress: "Streso lygis (1-10)"
};

const orderedKeys = [
  'goal', 'motivation',
  'gender', 'age', 'height', 'weight',
  'workday', 'smoking', 'sleep', 'stress', 'tracker',
  'discomforts', 'injury', 'family'
];

function asTrimmedString(v: unknown) {
  const s = String(v ?? '').trim();
  return s.length ? s : '';
}

function clamp(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max);
}

function escapeHtml(s: string): string {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

async function verifyTurnstile(args: { token: string; ip?: string | null }) {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (!secret || !secret.trim()) {
    return { enforced: false, ok: true as const };
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
    await rateLimit(req, 'submit-questionnaire', 10, 60);

    const supabase = getServiceClient();

    const body: any = await req.json();
    const { payload, email, user_id, locale } = body;

    const captchaToken = clamp(
      asTrimmedString(body?.turnstile_token ?? body?.cf_turnstile_response ?? body?.captcha_token),
      3000
    );
    const captcha = await verifyTurnstile({ token: captchaToken, ip: getIp(req) });
    if (!captcha.ok) {
      return new Response(JSON.stringify({ error: captcha.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Save to DB
    const { error: dbError } = await supabase
      .from('questionnaire_submissions')
      .insert({
        payload,
        email,
        user_id: user_id || null,
      });

    if (dbError) {
      console.error('DB Error:', dbError);
      throw dbError;
    }

    // 2. Send Email
    const adminEmail = Deno.env.get('ADMIN_EMAIL');
    if (adminEmail) {
      const formattedLocale = locale === 'en' ? 'en' : 'lt';
      
      // Format payload into readable structured HTML
      let rows = '';
      
      // First, iterate nicely ordered keys
      for (const key of orderedKeys) {
        if (payload[key] !== undefined && payload[key] !== '') {
          const label = fieldLabels[key] || escapeHtml(key);
          let val = payload[key];
          if (Array.isArray(val)) {
            val = val.join(', ');
          }
          rows += `<li style="margin-bottom: 8px;"><strong>${label}:</strong> <br/><span style="color: #333;">${escapeHtml(String(val))}</span></li>`;
        }
      }

      // Then check for any extra keys not in our ordered list (e.g. email if it was in payload, or future fields)
      for (const key of Object.keys(payload)) {
        if (!orderedKeys.includes(key) && key !== 'email') {
           const val = Array.isArray(payload[key]) ? payload[key].join(', ') : payload[key];
           rows += `<li style="margin-bottom: 8px;"><strong>${escapeHtml(key)}:</strong> <br/><span style="color: #333;">${escapeHtml(String(val))}</span></li>`;
        }
      }

      const html = `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h1 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">Nauja anketos užklausa</h1>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>El. paštas:</strong> <a href="mailto:${escapeHtml(email || '')}">${escapeHtml(email || 'Nenurodytas')}</a></p>
            <p style="margin: 5px 0;"><strong>Vartotojo ID:</strong> ${escapeHtml(String(user_id || 'Nėra'))}</p>
            <p style="margin: 5px 0;"><strong>Kalba:</strong> ${escapeHtml(formattedLocale.toUpperCase())}</p>
          </div>

          <h3>Kliento atsakymai:</h3>
          <ul style="list-style-type: none; padding-left: 0;">${rows}</ul>
          
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; color: #999; font-size: 12px;">
             <p>Neapdoroti duomenys:</p>
             <pre style="background: #eee; padding: 10px; overflow-x: auto;">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
          </div>
        </div>
      `;

      await sendEmail({
        to: adminEmail,
        subject: `Nauja anketa: ${String(email || 'Nenurodytas').slice(0, 100)}`,
        html,
        template: 'questionnaire_submission',
        locale: 'lt',
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    const isRateLimited = String(e?.message || '') === 'rate_limited';
    if (!isRateLimited) {
      console.error('[submit-questionnaire] error', e);
    }
    const status = isRateLimited ? 429 : 500;
    return new Response(JSON.stringify({ error: isRateLimited ? 'rate_limited' : 'server_error' }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
