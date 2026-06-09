import { APP_NAME } from './brand';

export interface EmailTemplateData {
  userName?: string;
  userEmail?: string;
  planName?: string;
  amount?: string;
  orderId?: string;
  loginUrl?: string;
  dashboardUrl?: string;
  supportEmail?: string;
  customMessage?: string;
  appName?: string;
}

const baseStyle = `
  body { margin: 0; padding: 0; background: #0f172a; font-family: 'Segoe UI', Arial, sans-serif; }
  .wrap { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 2rem 2.5rem; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; }
  .header p { color: rgba(255,255,255,0.8); margin: 0.5rem 0 0; font-size: 0.9rem; }
  .body { padding: 2rem 2.5rem; }
  .greeting { font-size: 1.05rem; color: #f1f5f9; font-weight: 600; margin-bottom: 1rem; }
  .text { color: #94a3b8; line-height: 1.7; font-size: 0.9rem; margin: 0 0 1rem; }
  .card { background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 1.25rem 1.5rem; margin: 1.5rem 0; }
  .card-row { display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid #1e293b; font-size: 0.85rem; }
  .card-row:last-child { border-bottom: none; }
  .card-label { color: #64748b; }
  .card-value { color: #f1f5f9; font-weight: 600; }
  .badge { display: inline-block; background: #22c55e20; border: 1px solid #22c55e44; color: #86efac; padding: 0.3rem 0.85rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
  .badge-red { background: #ef444420; border-color: #ef444440; color: #fca5a5; }
  .cta { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff !important; text-decoration: none; padding: 0.85rem 2rem; border-radius: 8px; font-weight: 700; font-size: 0.9rem; margin: 1rem 0; }
  .footer { background: #0f172a; padding: 1.25rem 2.5rem; text-align: center; }
  .footer p { color: #475569; font-size: 0.75rem; margin: 0; line-height: 1.6; }
  .divider { height: 1px; background: #334155; margin: 1.25rem 0; }
  .emoji { font-size: 2rem; display: block; text-align: center; margin-bottom: 1rem; }
`;

function htmlShell(content: string, data: EmailTemplateData): string {
  const appName = data.appName || APP_NAME;
  const supportEmail = data.supportEmail || '';
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${appName}</title>
<style>${baseStyle}</style>
</head>
<body>
<div style="padding: 2rem 1rem; background: #0f172a;">
<div class="wrap">
  <div class="header">
    <h1>${appName}</h1>
    <p>Professional Website Builder</p>
  </div>
  <div class="body">
    ${content}
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} ${appName} · All rights reserved</p>
    ${supportEmail ? `<p style="margin-top:0.35rem;">Need help? <a href="mailto:${supportEmail}" style="color:#6366f1;">${supportEmail}</a></p>` : ''}
    <p style="margin-top:0.5rem; color:#334155; font-size:0.65rem;">This email was sent automatically. Please do not reply directly.</p>
  </div>
</div>
</div>
</body>
</html>`;
}

export function welcomeEmailHtml(data: EmailTemplateData): string {
  const name = data.userName || 'there';
  const loginUrl = data.loginUrl || '';
  const custom = data.customMessage || '';

  return htmlShell(`
    <span class="emoji">🎉</span>
    <p class="greeting">Welcome aboard, ${name}!</p>
    <p class="text">
      Your account has been created successfully. You're all set to start building stunning websites with ${data.appName || APP_NAME}.
    </p>
    ${custom ? `<p class="text" style="color:#c7d2fe; background:#1e1b4b; border:1px solid #312e81; border-radius:8px; padding:0.85rem 1rem;">${custom}</p>` : ''}
    <div class="divider"></div>
    <p class="text" style="font-weight:600; color:#c4b5fd;">What you can do now:</p>
    <ul style="color:#94a3b8; font-size:0.88rem; line-height:1.9; padding-left:1.25rem; margin:0 0 1rem;">
      <li>Create your first portfolio project</li>
      <li>Choose from beautiful templates</li>
      <li>Customize sections, colors & animations</li>
      <li>Publish and share your site</li>
    </ul>
    ${loginUrl ? `<div style="text-align:center;"><a href="${loginUrl}" class="cta">Go to Dashboard →</a></div>` : ''}
    <div class="divider"></div>
    <p class="text" style="font-size:0.82rem;">
      Started on the <strong style="color:#f1f5f9;">Free plan</strong>. Upgrade anytime to unlock exports, custom domain, and more.
    </p>
  `, data);
}

export function welcomeEmailText(data: EmailTemplateData): string {
  const name = data.userName || 'there';
  return `Welcome to ${data.appName || APP_NAME}, ${name}!\n\nYour account has been created.\n${data.customMessage ? '\n' + data.customMessage + '\n' : ''}\nStart building at: ${data.loginUrl || ''}\n\n© ${new Date().getFullYear()} ${data.appName || APP_NAME}`;
}

export function paymentSuccessEmailHtml(data: EmailTemplateData): string {
  const name = data.userName || 'there';
  const dashUrl = data.dashboardUrl || '';

  return htmlShell(`
    <span class="emoji">✅</span>
    <p class="greeting">Payment confirmed, ${name}!</p>
    <p class="text">
      Thank you for your purchase. Your plan has been activated and you now have access to all premium features.
    </p>
    <div class="card">
      ${data.planName ? `<div class="card-row"><span class="card-label">Plan</span><span class="card-value">${data.planName}</span></div>` : ''}
      ${data.amount ? `<div class="card-row"><span class="card-label">Amount Paid</span><span class="card-value">${data.amount}</span></div>` : ''}
      ${data.orderId ? `<div class="card-row"><span class="card-label">Order ID</span><span class="card-value" style="font-size:0.75rem; font-family:monospace;">${data.orderId}</span></div>` : ''}
      <div class="card-row"><span class="card-label">Status</span><span><span class="badge">✓ Paid</span></span></div>
    </div>
    ${data.customMessage ? `<p class="text" style="color:#c7d2fe; background:#1e1b4b; border:1px solid #312e81; border-radius:8px; padding:0.85rem 1rem;">${data.customMessage}</p>` : ''}
    <p class="text">You can now:</p>
    <ul style="color:#94a3b8; font-size:0.88rem; line-height:1.9; padding-left:1.25rem; margin:0 0 1rem;">
      <li>Export your portfolio as HTML, React, or Next.js</li>
      <li>Publish on a custom domain</li>
      <li>Use all premium templates</li>
      <li>Unlock advanced sections & features</li>
    </ul>
    ${dashUrl ? `<div style="text-align:center;"><a href="${dashUrl}" class="cta">Open Dashboard →</a></div>` : ''}
    <div class="divider"></div>
    <p class="text" style="font-size:0.8rem;">Keep this email as your payment receipt. Order ID: <code style="background:#0f172a;padding:2px 6px;border-radius:4px;color:#c4b5fd;">${data.orderId || '—'}</code></p>
  `, data);
}

export function paymentSuccessEmailText(data: EmailTemplateData): string {
  return `Payment Confirmed - ${data.appName || APP_NAME}\n\nHi ${data.userName || 'there'},\n\nYour ${data.planName || 'premium'} plan is now active.\nAmount: ${data.amount || ''}\nOrder ID: ${data.orderId || ''}\n\nDashboard: ${data.dashboardUrl || ''}\n\n© ${new Date().getFullYear()} ${data.appName || APP_NAME}`;
}

export function paymentFailedEmailHtml(data: EmailTemplateData): string {
  const name = data.userName || 'there';

  return htmlShell(`
    <span class="emoji">⚠️</span>
    <p class="greeting">Payment unsuccessful, ${name}</p>
    <p class="text">
      Your recent payment attempt did not go through. Your account remains on the free plan — no charges were made.
    </p>
    <div class="card">
      ${data.orderId ? `<div class="card-row"><span class="card-label">Order ID</span><span class="card-value" style="font-family:monospace;font-size:0.75rem;">${data.orderId}</span></div>` : ''}
      <div class="card-row"><span class="card-label">Status</span><span><span class="badge badge-red">✗ Failed</span></span></div>
    </div>
    <p class="text">Common reasons for failure:</p>
    <ul style="color:#94a3b8; font-size:0.88rem; line-height:1.9; padding-left:1.25rem; margin:0 0 1.5rem;">
      <li>Insufficient balance in your account</li>
      <li>Card details entered incorrectly</li>
      <li>Bank declined the transaction</li>
      <li>Payment session timed out</li>
    </ul>
    ${data.dashboardUrl ? `<div style="text-align:center;"><a href="${data.dashboardUrl}" class="cta">Try Again →</a></div>` : ''}
  `, data);
}

export function testEmailHtml(data: EmailTemplateData): string {
  return htmlShell(`
    <span class="emoji">🧪</span>
    <p class="greeting">SMTP Test Email</p>
    <p class="text">
      This is a test email sent from <strong style="color:#f1f5f9;">${data.appName || APP_NAME}</strong> admin panel to verify your SMTP configuration is working correctly.
    </p>
    <div class="card">
      <div class="card-row"><span class="card-label">Sent at</span><span class="card-value">${new Date().toLocaleString()}</span></div>
      <div class="card-row"><span class="card-label">Status</span><span><span class="badge">✓ Delivered</span></span></div>
    </div>
    <p class="text" style="font-size:0.82rem; color:#64748b;">
      If you received this email, your SMTP settings are configured correctly and transactional emails (welcome, payment confirmation) will be delivered to users.
    </p>
  `, data);
}
