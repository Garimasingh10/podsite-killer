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
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://podsite-killer.vercel.app';
  const html = `
    <div style="text-align:center;">
      <p style="background:#eef2ff;color:#6366f1;padding:8px 16px;border-radius:99px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;margin-bottom:24px;">Welcome Aboard</p>
      <h1 style="color:#111827;font-size:36px;font-weight:800;margin:0 0 24px;letter-spacing:-0.02em;">Welcome to PodSite Killer 🚀</h1>
      <p style="color:#64748b;font-size:16px;line-height:1.6;margin:0 0 40px;">Your podcast empire starts here. Let's launch your show in three simple steps:</p>
      
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0 0 40px;">
        <tr>
          <td width="33.33%" style="padding:0 12px;">
            <div style="background:#f1f5f9;border-radius:16px;padding:24px;border:1px solid #e2e8f0;">
              <div style="background:#6366f1;color:#fff;width:40px;height:40px;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;">1</div>
              <p style="font-weight:700;color:#111827;margin:0 0 8px;font-size:14px;">Paste Your RSS</p>
              <p style="font-size:12px;color:#64748b;margin:0;">Drop your podcast's RSS feed URL into the dashboard.</p>
            </div>
          </td>
          <td width="33.33%" style="padding:0 12px;">
            <div style="background:#f1f5f9;border-radius:16px;padding:24px;border:1px solid #e2e8f0;">
              <div style="background:#6366f1;color:#fff;width:40px;height:40px;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;">2</div>
              <p style="font-weight:700;color:#111827;margin:0 0 8px;font-size:14px;">Connect YouTube</p>
              <p style="font-size:12px;color:#64748b;margin:0;">Link your YouTube channel to auto-match videos to episodes.</p>
            </div>
          </td>
          <td width="33.33%" style="padding:0 12px;">
            <div style="background:#f1f5f9;border-radius:16px;padding:24px;border:1px solid #e2e8f0;">
              <div style="background:#6366f1;color:#fff;width:40px;height:40px;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;">3</div>
              <p style="font-weight:700;color:#111827;margin:0 0 8px;font-size:14px;">Launch & Share</p>
              <p style="font-size:12px;color:#64748b;margin:0;">Get a custom domain and share your beautiful podcast site.</p>
            </div>
          </td>
        </tr>
      </table>

      <a href="${dashboardUrl}/dashboard" style="display:inline-block;background:#111827;color:#fff;padding:18px 48px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;margin-bottom:24px;box-shadow:0 4px 15px rgba(17,24,39,0.3);">Go to Dashboard</a>

      <div style="background:#eef2ff;border-radius:16px;padding:24px;border-left:4px solid #6366f1;text-align:left;margin-top:32px;">
        <p style="margin:0 0 12px;color:#111827;font-weight:700;font-size:14px;">Pro Tips:</p>
        <ul style="margin:0;padding-left:20px;list-style-position:inside;">
          <li style="color:#374151;font-size:13px;margin-bottom:8px;">Your first podcast becomes your primary show and appears on your dashboard.</li>
          <li style="color:#374151;font-size:13px;margin-bottom:8px;">Episodes sync automatically whenever your RSS feed updates.</li>
          <li style="color:#374151;font-size:13px;">Customize your site's theme and layout to match your brand.</li>
        </ul>
      </div>
    </div>`;
  return baseWrap(html);
}

/** Verification email for email signups (trigger: email_signup) */
export function getVerificationEmailHtml(verificationUrl: string): string {
  const html = `
    <div style="text-align:center;">
      <p style="background:#dbeafe;color:#0284c7;padding:8px 16px;border-radius:99px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;margin-bottom:24px;">Verify Your Email</p>
      <h1 style="color:#111827;font-size:36px;font-weight:800;margin:0 0 24px;letter-spacing:-0.02em;">Verify Your Account</h1>
      <p style="color:#64748b;font-size:16px;line-height:1.6;margin:0 0 32px;">Click the button below to verify your email and activate your PodSite Killer account.</p>
      
      <a href="${verificationUrl}" style="display:inline-block;background:#0284c7;color:#fff;padding:18px 48px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;margin-bottom:32px;box-shadow:0 4px 15px rgba(2,132,199,0.3);">Verify Email Address</a>

      <p style="color:#64748b;font-size:13px;margin:0 0 24px;line-height:1.6;">Or copy and paste this link in your browser:</p>
      <p style="color:#0284c7;font-size:12px;margin:0 0 32px;word-break:break-all;font-family:monospace;background:#f0f9ff;padding:16px;border-radius:8px;">${verificationUrl}</p>

      <div style="background:#fef3c7;border-radius:16px;padding:16px;border-left:4px solid #f59e0b;text-align:left;margin-top:32px;">
        <p style="margin:0 0 8px;color:#92400e;font-weight:700;font-size:13px;">💡 This link expires in 24 hours</p>
        <p style="margin:0;color:#b45309;font-size:12px;">If you didn't create this account, you can safely ignore this email.</p>
      </div>
    </div>`;
  return baseWrap(html);
}
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
