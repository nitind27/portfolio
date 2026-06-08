import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { APP_NAME } from '@/lib/brand';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, smtp } = await req.json();

    if (!smtp?.host || !smtp?.user || !smtp?.password) {
      return NextResponse.json({ error: 'SMTP not configured' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port) || 587,
      secure: smtp.secure === true || Number(smtp.port) === 465,
      auth: { user: smtp.user, pass: smtp.password },
      tls: { rejectUnauthorized: false },
    });

    // Verify connection first
    await transporter.verify();

    await transporter.sendMail({
      from: `"${smtp.fromName || 'Portfolio Contact'}" <${smtp.user}>`,
      to: smtp.toEmail || smtp.user,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:2rem;background:#f9f9f9;border-radius:8px;">
          <h2 style="color:#6366f1;margin-bottom:1.5rem;">New Portfolio Contact</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:0.5rem 0;font-weight:600;color:#555;width:100px;">Name</td><td style="padding:0.5rem 0;">${name}</td></tr>
            <tr><td style="padding:0.5rem 0;font-weight:600;color:#555;">Email</td><td style="padding:0.5rem 0;"><a href="mailto:${email}">${email}</a></td></tr>
          </table>
          <div style="margin-top:1.5rem;padding:1rem;background:#fff;border-radius:6px;border-left:4px solid #6366f1;">
            <p style="font-weight:600;color:#555;margin-bottom:0.5rem;">Message</p>
            <p style="line-height:1.7;color:#333;">${message.replace(/\n/g, '<br/>')}</p>
          </div>
          <p style="margin-top:1.5rem;font-size:0.8rem;color:#999;">Sent via ${APP_NAME} contact form</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('SMTP error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
