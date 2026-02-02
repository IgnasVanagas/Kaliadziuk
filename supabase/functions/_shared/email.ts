declare const Deno: { env: { get(name: string): string | undefined } };

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  template: string;
  locale: 'lt' | 'en';
  related_order_id?: string;
};

let recentSendTimestampsMs: number[] = [];

async function throttleEmails(maxPerSecond: number) {
  // Best-effort throttle per Edge Function isolate.
  // If the platform runs multiple isolates in parallel, this won't be global,
  // but it prevents accidental bursts within a single invocation.
  for (;;) {
    const now = Date.now();
    recentSendTimestampsMs = recentSendTimestampsMs.filter((t) => now - t < 1000);
    if (recentSendTimestampsMs.length < maxPerSecond) {
      recentSendTimestampsMs.push(now);
      return;
    }
    const oldest = recentSendTimestampsMs[0];
    const waitMs = Math.max(0, 1000 - (now - oldest) + 10);
    await new Promise((r) => setTimeout(r, waitMs));
  }
}

function getEnv(name: string) {
  const v = Deno.env.get(name);
  return v && v.trim() ? v.trim() : null;
}

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, '');
}

function requireEnv(name: string) {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function stripTags(html: string) {
  return html
    .replaceAll(/<\s*br\s*\/?\s*>/gi, '\n')
    .replaceAll(/<\s*\/p\s*>/gi, '\n\n')
    .replaceAll(/<[^>]*>/g, '')
    .replaceAll(/\n{3,}/g, '\n\n')
    .trim();
}

function formatDisplayName(displayName: string) {
  const name = (displayName || '').trim();
  if (!name) return '';

  // Prefer unquoted names for provider/client compatibility.
  // Only quote if the name contains characters that require it.
  const needsQuotes = /[\",<>]/.test(name);
  if (!needsQuotes) return name;
  return `"${name.replaceAll('"', '\\"')}"`;
}

function formatFromAddress(fromEnvValue: string, displayName: string) {
  const raw = fromEnvValue.trim();
  if (!raw) return raw;

  const name = formatDisplayName(displayName);
  if (!name) return raw;

  // If EMAIL_FROM is already "Name <email>", preserve the email and replace the display name.
  const lt = raw.indexOf('<');
  const gt = raw.indexOf('>');
  if (lt !== -1 && gt !== -1 && gt > lt + 1) {
    const email = raw.slice(lt + 1, gt).trim();
    return `${name} <${email}>`;
  }

  // Otherwise treat it as a bare email address.
  if (raw.includes(',')) return raw;
  return `${name} <${raw}>`;
}

function brandedEmailShell(args: {
  locale: 'lt' | 'en';
  heading: string;
  bodyHtml: string;
  preheader?: string;
}) {
  const siteName = getEnv('SITE_NAME') ?? 'Coach Kaliadziuk';
  // Default to production domain so branding works even if PUBLIC_SITE_URL isn't set.
  const siteUrl = getEnv('PUBLIC_SITE_URL') ?? 'https://kaliadziuk.lt';
  const logoUrlEnv = getEnv('EMAIL_LOGO_URL');
  const logoUrl = logoUrlEnv
    ? logoUrlEnv
    : siteUrl
      ? `${stripTrailingSlash(siteUrl)}/uploads/Branding/${encodeURIComponent('Žalias-full-TP-RGB.png')}`
      : null;
  const supportEmail = getEnv('SUPPORT_EMAIL');

  const preheader = (args.preheader ?? '').trim();
  const heading = escapeHtml(args.heading);

  const footerText =
    args.locale === 'lt'
      ? 'Jei turite klausimų, atsakykite į šį laišką.'
      : 'If you have questions, reply to this email.';

  const siteLink = siteUrl
    ? `<a href="${siteUrl}" style="color:#111111;text-decoration:underline">${escapeHtml(siteUrl)}</a>`
    : '';
  const supportLink = supportEmail
    ? `<a href="mailto:${supportEmail}" style="color:#111111;text-decoration:underline">${escapeHtml(supportEmail)}</a>`
    : '';

  return {
    html: `<!doctype html>
<html lang="${args.locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f6f6;color:#111111;">
    ${
      preheader
        ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>`
        : ''
    }
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f6f6;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;">
            <tr>
              <td style="padding:0 0 12px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700; text-align:center;">
                      ${
                        logoUrl
                          ? `<img src="${logoUrl}" alt="${escapeHtml(siteName)}" style="display:block;margin:0 auto;height:56px;max-width:100%;border:0;" />`
                          : `<div style="text-align:center;">${escapeHtml(siteName)}</div>`
                      }
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border-radius:16px;padding:20px 20px 8px 20px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.25;font-weight:800;margin:0 0 12px 0;">${heading}</div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1f2937;">${args.bodyHtml}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 4px 0 4px; font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:1.5; color:#6b7280;">
                <div>${escapeHtml(footerText)}</div>
                <div style="margin-top:6px;">
                  ${supportLink}${supportLink && siteLink ? ' · ' : ''}${siteLink}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    text: stripTags(args.bodyHtml),
  };
}

export function renderOrderPaidEmail(
  locale: 'lt' | 'en',
  totalEur: string,
  giftCards?: Array<{ code: string; expiryDate: string }>,
  items?: string[],
  discountEur?: string,
  subtotalEur?: string,
) {
  const itemsHtml = (items || []).length
    ? locale === 'lt'
      ? `<div style="margin-top:12px;">
<div style="font-weight:700;margin:0 0 6px 0;">Įsigytos prekės / paslaugos:</div>
<ul style="margin:0;padding-left:18px;">${(items || []).map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
</div>`
      : `<div style="margin-top:12px;">
<div style="font-weight:700;margin:0 0 6px 0;">Purchased items:</div>
<ul style="margin:0;padding-left:18px;">${(items || []).map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
</div>`
    : '';

  const giftCardsHtml = (giftCards || []).length
    ? locale === 'lt'
      ? `<div style="margin-top:12px;">
<div style="font-weight:700;margin:0 0 6px 0;">Dovanų kuponų kodai:</div>
<ul style="margin:0;padding-left:18px;">${(giftCards || []).map((g) => `<li><b>${escapeHtml(g.code)}</b> (galioja iki ${escapeHtml(g.expiryDate)})</li>`).join('')}</ul>
</div>`
      : `<div style="margin-top:12px;">
<div style="font-weight:700;margin:0 0 6px 0;">Gift card codes:</div>
<ul style="margin:0;padding-left:18px;">${(giftCards || []).map((g) => `<li><b>${escapeHtml(g.code)}</b> (expires on ${escapeHtml(g.expiryDate)})</li>`).join('')}</ul>
</div>`
    : '';

  if (locale === 'lt') {
    const summaryHtml = (discountEur && subtotalEur)
      ? `<p style="margin:0;">Tarpinė suma: ${escapeHtml(subtotalEur)}</p>
<p style="margin:0;">Nuolaida: -${escapeHtml(discountEur)}</p>
<p style="margin:0;">Suma: <b>${escapeHtml(totalEur)}</b></p>`
      : `<p style="margin:0;">Suma: <b>${escapeHtml(totalEur)}</b></p>`;

    const shell = brandedEmailShell({
      locale,
      heading: 'Užsakymas apmokėtas',
      preheader: 'Ačiū! Jūsų užsakymas apmokėtas.',
      bodyHtml: `<p style="margin:0 0 10px 0;">Ačiū! Jūsų užsakymas apmokėtas.</p>
<p style="margin:0 0 10px 0;">Netrukus susisieksiu.</p>
    ${summaryHtml}${itemsHtml}${giftCardsHtml}`,
    });
    return {
      subject: 'Užsakymas apmokėtas',
      html: shell.html,
      template: 'order_paid',
    };
  }
  
  const summaryHtml = (discountEur && subtotalEur)
    ? `<p style="margin:0;">Subtotal: ${escapeHtml(subtotalEur)}</p>
<p style="margin:0;">Discount: -${escapeHtml(discountEur)}</p>
<p style="margin:0;">Total: <b>${escapeHtml(totalEur)}</b></p>`
    : `<p style="margin:0;">Total: <b>${escapeHtml(totalEur)}</b></p>`;

  const shell = brandedEmailShell({
    locale,
    heading: 'Order paid',
    preheader: 'Thanks! Your order is paid.',
    bodyHtml: `<p style="margin:0 0 10px 0;">Thanks! Your order is paid.</p>
<p style="margin:0 0 10px 0;">We’ll contact you shortly.</p>
${summaryHtml}${itemsHtml}${giftCardsHtml}`,
  });
  return {
    subject: 'Order paid',
    html: shell.html,
    template: 'order_paid',
  };
}

export function renderAdminNewOrderPaid(
  totalEur: string,
  items?: string[],
  customer?: {
    email?: string | null;
    phone?: string | null;
    fullName?: string | null;
    marketingOptIn?: boolean | null;
  },
) {
  const contactLines: string[] = [];
  if (customer?.fullName) contactLines.push(`Vardas pavardė: ${escapeHtml(customer.fullName)}`);
  if (customer?.email) contactLines.push(`El. paštas: ${escapeHtml(customer.email)}`);
  if (customer?.phone) contactLines.push(`Telefonas: ${escapeHtml(customer.phone)}`);
  if (typeof customer?.marketingOptIn === 'boolean') {
    contactLines.push(`Rinkodara: ${customer.marketingOptIn ? 'taip' : 'ne'}`);
  }

  const contactHtml = contactLines.length
    ? `<div style="margin-top:12px;">
<div style="font-weight:700;margin:0 0 6px 0;">Kliento kontaktai:</div>
<div>${contactLines.join('<br/>')}</div>
</div>`
    : '';

  const itemsHtml = (items || []).length
    ? `<div style="margin:12px 0 0 0;">
<div style="font-weight:700;margin:0 0 6px 0;">Užsakymo prekės / paslaugos:</div>
<ul style="margin:0;padding-left:18px;">${(items || []).map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
</div>`
    : '';
  const shell = brandedEmailShell({
    locale: 'lt',
    heading: 'Naujas apmokėtas užsakymas',
    preheader: 'Gautas naujas apmokėtas užsakymas.',
    bodyHtml: `<p style="margin:0 0 10px 0;">Gautas naujas apmokėtas užsakymas.</p>
<p style="margin:0;">Suma: <b>${escapeHtml(totalEur)}</b></p>${contactHtml}${itemsHtml}`,
  });
  return {
    subject: 'Naujas apmokėtas užsakymas',
    html: shell.html,
    template: 'admin_new_order_paid',
    locale: 'lt' as const,
  };
}

export function renderAdminContactForm(args: {
  locale: 'lt' | 'en';
  name?: string | null;
  email: string;
  phone?: string | null;
  message: string;
  pageUrl?: string | null;
}) {
  const heading = args.locale === 'lt' ? 'Nauja užklausa (kontaktų forma)' : 'New inquiry (contact form)';

  const lines: string[] = [];
  if (args.name) lines.push(`<b>${args.locale === 'lt' ? 'Vardas' : 'Name'}:</b> ${escapeHtml(args.name)}`);
  lines.push(`<b>Email:</b> ${escapeHtml(args.email)}`);
  if (args.phone) lines.push(`<b>${args.locale === 'lt' ? 'Telefonas' : 'Phone'}:</b> ${escapeHtml(args.phone)}`);
  if (args.pageUrl) lines.push(`<b>Page:</b> <a href="${escapeHtml(args.pageUrl)}" style="color:#111111;text-decoration:underline">${escapeHtml(args.pageUrl)}</a>`);

  const shell = brandedEmailShell({
    locale: 'lt',
    heading,
    preheader: args.locale === 'lt' ? 'Gauta nauja žinutė iš svetainės.' : 'New message received from the website.',
    bodyHtml: `<p style="margin:0 0 10px 0;">${lines.join('<br/>')}</p>
<div style="margin-top:12px; white-space:pre-wrap; font-family:Arial,Helvetica,sans-serif;">${escapeHtml(args.message)}</div>`,
  });

  return {
    subject: heading,
    html: shell.html,
    template: 'admin_contact_form',
    locale: 'lt' as const,
  };
}

export function renderAdminRefund() {
  const shell = brandedEmailShell({
    locale: 'lt',
    heading: 'Grąžinimas (refund)',
    preheader: 'Stripe užregistravo grąžinimą.',
    bodyHtml: `<p style="margin:0;">Stripe užregistravo grąžinimą.</p>`,
  });
  return {
    subject: 'Grąžinimas (refund)',
    html: shell.html,
    template: 'admin_refund',
    locale: 'lt' as const,
  };
}

export function renderAdminDispute() {
  const shell = brandedEmailShell({
    locale: 'lt',
    heading: 'Ginčas (dispute)',
    preheader: 'Stripe užregistravo ginčą.',
    bodyHtml: `<p style="margin:0;">Stripe užregistravo ginčą (dispute).</p>`,
  });
  return {
    subject: 'Ginčas (dispute)',
    html: shell.html,
    template: 'admin_dispute',
    locale: 'lt' as const,
  };
}

export async function sendEmail(args: SendEmailArgs) {
  const resendKey = requireEnv('RESEND_API_KEY');
  // Force sender display name for consistency in clients.
  // (Avoid env overrides like "Pavel" leaking into the From header.)
  const fromName = 'Coach Kaliadziuk';
  const from = formatFromAddress(requireEnv('EMAIL_FROM'), fromName);

  await throttleEmails(2);

  // Provide a plain-text fallback for deliverability.
  const text = stripTags(args.html);

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text,
    }),
  });

  if (!resp.ok) {
    let errorBody: unknown = null;
    try {
      errorBody = await resp.json();
    } catch {
      try {
        errorBody = await resp.text();
      } catch {
        // ignore
      }
    }
    console.error('[email] resend failed', {
      status: resp.status,
      template: args.template,
      related_order_id: args.related_order_id ?? null,
      error: errorBody,
    });
  }

  let providerId: string | null = null;
  try {
    const body = await resp.json();
    providerId = body?.id ?? null;
  } catch {
    // ignore
  }

  return { ok: resp.ok, providerId };
}
