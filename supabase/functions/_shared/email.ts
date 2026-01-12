declare const Deno: { env: { get(name: string): string | undefined } };

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  template: string;
  locale: 'lt' | 'en';
  related_order_id?: string;
};

function getEnv(name: string) {
  const v = Deno.env.get(name);
  return v && v.trim() ? v.trim() : null;
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

function brandedEmailShell(args: {
  locale: 'lt' | 'en';
  heading: string;
  bodyHtml: string;
  preheader?: string;
}) {
  const siteName = getEnv('SITE_NAME') ?? (args.locale === 'lt' ? 'Parduotuvė' : 'Shop');
  const siteUrl = getEnv('PUBLIC_SITE_URL') ?? '';
  const logoUrl = getEnv('EMAIL_LOGO_URL');
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
                    <td style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;">
                      ${
                        logoUrl
                          ? `<img src="${logoUrl}" alt="${escapeHtml(siteName)}" style="display:block;height:32px;max-width:100%;border:0;" />`
                          : escapeHtml(siteName)
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

export function renderOrderPaidEmail(locale: 'lt' | 'en', totalEur: string) {
  if (locale === 'lt') {
    const shell = brandedEmailShell({
      locale,
      heading: 'Užsakymas apmokėtas',
      preheader: 'Ačiū! Jūsų užsakymas apmokėtas.',
      bodyHtml: `<p style="margin:0 0 10px 0;">Ačiū! Jūsų užsakymas apmokėtas.</p>
<p style="margin:0;">Suma: <b>${escapeHtml(totalEur)}</b></p>`,
    });
    return {
      subject: 'Užsakymas apmokėtas',
      html: shell.html,
      template: 'order_paid',
    };
  }
  const shell = brandedEmailShell({
    locale,
    heading: 'Order paid',
    preheader: 'Thanks! Your order is paid.',
    bodyHtml: `<p style="margin:0 0 10px 0;">Thanks! Your order is paid.</p>
<p style="margin:0;">Total: <b>${escapeHtml(totalEur)}</b></p>`,
  });
  return {
    subject: 'Order paid',
    html: shell.html,
    template: 'order_paid',
  };
}

export function renderGiftCardRecipientEmail(locale: 'lt' | 'en', code: string, expiryDate: string) {
  if (locale === 'lt') {
    const shell = brandedEmailShell({
      locale,
      heading: 'Jums skirta dovanų kupono kortelė',
      preheader: 'Jums padovanotas dovanų kuponas.',
      bodyHtml: `<p style="margin:0 0 10px 0;">Jums padovanotas dovanų kuponas.</p>
<p style="margin:0 0 6px 0;">Kodas: <b>${escapeHtml(code)}</b></p>
<p style="margin:0 0 10px 0;">Galioja iki: <b>${escapeHtml(expiryDate)}</b></p>
<p style="margin:0;">Įveskite kodą krepšelyje apmokėjimo metu.</p>`,
    });
    return {
      subject: 'Jums skirta dovanų kupono kortelė',
      html: shell.html,
      template: 'gift_card_recipient',
    };
  }
  const shell = brandedEmailShell({
    locale,
    heading: 'You received a gift card',
    preheader: 'A gift card was sent to you.',
    bodyHtml: `<p style="margin:0 0 10px 0;">You received a gift card.</p>
<p style="margin:0 0 6px 0;">Code: <b>${escapeHtml(code)}</b></p>
<p style="margin:0 0 10px 0;">Expires on: <b>${escapeHtml(expiryDate)}</b></p>
<p style="margin:0;">Enter the code in the cart during checkout.</p>`,
  });
  return {
    subject: 'You received a gift card',
    html: shell.html,
    template: 'gift_card_recipient',
  };
}

export function renderAdminNewOrderPaid(totalEur: string) {
  const shell = brandedEmailShell({
    locale: 'lt',
    heading: 'Naujas apmokėtas užsakymas',
    preheader: 'Gautas naujas apmokėtas užsakymas.',
    bodyHtml: `<p style="margin:0 0 10px 0;">Gautas naujas apmokėtas užsakymas.</p>
<p style="margin:0;">Suma: <b>${escapeHtml(totalEur)}</b></p>`,
  });
  return {
    subject: 'Naujas apmokėtas užsakymas',
    html: shell.html,
    template: 'admin_new_order_paid',
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
  const from = requireEnv('EMAIL_FROM');

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

  let providerId: string | null = null;
  try {
    const body = await resp.json();
    providerId = body?.id ?? null;
  } catch {
    // ignore
  }

  return { ok: resp.ok, providerId };
}
