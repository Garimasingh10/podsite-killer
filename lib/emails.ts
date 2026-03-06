/**
 * Email templates and sender for PodSite (Resend).
 * Used for: welcome, new episode, commerce (buyer + creator), domain live.
 */

const FROM = process.env.RESEND_FROM || 'PodSite <onboarding@resend.dev>';

function baseStyles() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  `;
}

function baseWrap(html: string) {
  return `
<!DOCTYPE html>
<html>
<head><style>${baseStyles()}</style></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Inter',sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f9fafb;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.03);border:1px solid #f1f5f9;">
        <tr><td style="height:8px;background:linear-gradient(90deg,#6366f1 0%,#a855f7 100%);"></td></tr>
        <tr><td style="padding:48px;">
          ${html}
        </td></tr>
        <tr><td style="padding:32px 48px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
          <p style="color:#94a3b8;font-size:13px;margin:0;">&copy; ${new Date().getFullYear()} PodSite. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export type SendOptions = { to: string; subject: string; html: string };

/** Welcome email after signup (trigger: user_created) */
export function getWelcomeEmailHtml(): string {
  const html = `
    <div style="text-align:center;">
      <p style="background:#eef2ff;color:#6366f1;padding:8px 16px;border-radius:99px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;margin-bottom:24px;">Welcome</p>
      <h1 style="color:#111827;font-size:32px;font-weight:800;margin:0 0 16px;letter-spacing:-0.02em;">Welcome to PodSite 🚀</h1>
      <p style="color:#64748b;font-size:16px;line-height:1.6;margin:0 0 32px;">Get your podcast site live in three steps:</p>
      <ol style="text-align:left;max-width:320px;margin:0 auto 32px;color:#374151;font-size:16px;line-height:2;">
        <li><strong>Paste your RSS feed</strong> in the dashboard.</li>
        <li><strong>Connect YouTube</strong> to match video to episodes.</li>
        <li><strong>Launch your site</strong> and share your link.</li>
      </ol>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://podsite-killer.vercel.app'}/dashboard" style="display:inline-block;background:#111827;color:#fff;padding:18px 40px;border-radius:16px;font-size:16px;font-weight:700;text-decoration:none;">Go to Dashboard</a>
    </div>`;
  return baseWrap(html);
}

/** New episode detected (trigger: new_episode_detected) */
export function getNewEpisodeEmailHtml(episodeTitle: string): string {
  const html = `
    <div style="text-align:center;">
      <p style="background:#eef2ff;color:#6366f1;padding:8px 16px;border-radius:99px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;margin-bottom:24px;">New Episode</p>
      <h1 style="color:#111827;font-size:28px;font-weight:800;margin:0 0 16px;letter-spacing:-0.02em;">New episode detected 🎙</h1>
      <p style="color:#374151;font-size:18px;font-weight:600;margin:0 0 12px;">${episodeTitle}</p>
      <p style="color:#64748b;font-size:16px;line-height:1.6;margin:0 0 24px;">Your website has been updated automatically.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://podsite-killer.vercel.app'}/dashboard" style="display:inline-block;background:#111827;color:#fff;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">View dashboard</a>
    </div>`;
  return baseWrap(html);
}

/** Commerce: buyer – your purchase is ready (trigger: stripe.payment_succeeded) */
export function getCommerceBuyerEmailHtml(productTitle: string, downloadUrl: string): string {
  const html = `
    <div style="text-align:center;">
      <p style="background:#eef2ff;color:#6366f1;padding:8px 16px;border-radius:99px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;margin-bottom:24px;">Your purchase is ready</p>
      <h1 style="color:#111827;font-size:32px;font-weight:800;margin:0 0 16px;letter-spacing:-0.02em;">Thanks for buying!</h1>
      <p style="color:#64748b;font-size:16px;line-height:1.6;margin:0 0 24px;">Download your file below:</p>
      <a href="${downloadUrl}" style="display:inline-block;background:#111827;color:#fff;padding:18px 40px;border-radius:16px;font-size:16px;font-weight:700;text-decoration:none;">Download PDF</a>
      <p style="color:#64748b;font-size:13px;margin-top:24px;">This link expires in 24 hours. Save the file to your device after downloading.</p>
    </div>`;
  return baseWrap(html);
}

/** Commerce: creator – you made a sale (trigger: stripe.payment_succeeded) */
export function getCommerceCreatorEmailHtml(productTitle: string, amountFormatted: string, dashboardUrl: string): string {
  const html = `
    <div style="text-align:center;">
      <p style="background:#d1fae5;color:#059669;padding:8px 16px;border-radius:99px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;margin-bottom:24px;">Sale</p>
      <h1 style="color:#111827;font-size:28px;font-weight:800;margin:0 0 16px;letter-spacing:-0.02em;">You made a sale 🎉</h1>
      <p style="color:#374151;font-size:16px;margin:0 0 8px;"><strong>Product:</strong> ${productTitle}</p>
      <p style="color:#374151;font-size:16px;margin:0 0 24px;"><strong>Amount:</strong> ${amountFormatted}</p>
      <a href="${dashboardUrl}" style="display:inline-block;background:#111827;color:#fff;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">View dashboard →</a>
    </div>`;
  return baseWrap(html);
}

/** Domain is live (trigger: after DNS verification) */
export function getDomainLiveEmailHtml(domain: string): string {
  const url = domain.startsWith('http') ? domain : `https://${domain}`;
  const html = `
    <div style="text-align:center;">
      <p style="background:#d1fae5;color:#059669;padding:8px 16px;border-radius:99px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;margin-bottom:24px;">Live</p>
      <h1 style="color:#111827;font-size:28px;font-weight:800;margin:0 0 16px;letter-spacing:-0.02em;">Your domain is live 🎉</h1>
      <p style="color:#64748b;font-size:16px;line-height:1.6;margin:0 0 24px;">Your podcast site is now available at:</p>
      <a href="${url}" style="color:#6366f1;font-size:18px;font-weight:700;text-decoration:none;">${url}</a>
    </div>`;
  return baseWrap(html);
}

export async function sendResend(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('RESEND_API_KEY missing, skip send');
    return { ok: false, error: 'RESEND_API_KEY missing' };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject,
        html,
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: (data as any)?.message || res.statusText };
    return { ok: true };
  } catch (e: any) {
    console.error('Resend send error', e);
    return { ok: false, error: e?.message };
  }
}
