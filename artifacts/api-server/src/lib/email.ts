import nodemailer from "nodemailer";

function createTransport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const transport = createTransport();
  const from = process.env.SMTP_FROM || "Montage Studio <noreply@montage.studio>";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Reset Your Password</title>
    </head>
    <body style="margin:0;padding:0;background:#070714;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#070714;padding:40px 0;">
        <tr><td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background:#0d0d20;border:1px solid rgba(99,102,241,0.3);border-radius:16px;overflow:hidden;">
            <tr><td style="height:3px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#6366f1)"></td></tr>
            <tr><td style="padding:40px 40px 0;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px;">
                <div style="background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);border-radius:8px;padding:6px 10px;">
                  <span style="color:#818cf8;font-size:18px;">🎬</span>
                </div>
                <span style="color:#a5b4fc;font-size:18px;font-weight:700;letter-spacing:4px;">MONTAGE</span>
              </div>
              <h1 style="color:#fff;font-size:26px;font-weight:700;margin:0 0 12px;">Reset Your Password</h1>
              <p style="color:rgba(255,255,255,0.55);font-size:15px;line-height:1.6;margin:0 0 32px;">
                We received a request to reset your password. Click the button below to choose a new one. This link expires in <strong style="color:#a5b4fc;">1 hour</strong>.
              </p>
            </td></tr>
            <tr><td style="padding:0 40px 32px;">
              <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:1px;padding:14px 36px;border-radius:10px;box-shadow:0 0 30px rgba(99,102,241,0.4);">
                Reset Password →
              </a>
            </td></tr>
            <tr><td style="padding:0 40px 32px;">
              <p style="color:rgba(255,255,255,0.35);font-size:13px;line-height:1.6;margin:0;">
                If you didn't request this, you can safely ignore this email. Your password will not change.
              </p>
              <p style="color:rgba(255,255,255,0.25);font-size:12px;margin:16px 0 0;">
                Or copy this link: <span style="color:#818cf8;">${resetLink}</span>
              </p>
            </td></tr>
            <tr><td style="height:1px;background:rgba(99,102,241,0.15)"></td></tr>
            <tr><td style="padding:20px 40px;text-align:center;">
              <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;">© Montage Studio · All rights reserved</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  if (!transport) {
    console.log("─── PASSWORD RESET LINK (no SMTP configured) ───");
    console.log(`To: ${to}`);
    console.log(`Reset link: ${resetLink}`);
    console.log("────────────────────────────────────────────────");
    return;
  }

  await transport.sendMail({ from, to, subject: "Reset Your Montage Password", html });
}
