import { Resend } from "resend";

const resend = new Resend("re_FC4Asuhb_34bv4Go4JZYigjAAd58GTaBz");

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
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
              <div style="margin-bottom:32px;">
                <span style="color:#a5b4fc;font-size:18px;font-weight:700;letter-spacing:4px;">MONTAGE</span>
              </div>
              <h1 style="color:#fff;font-size:26px;font-weight:700;margin:0 0 12px;">Reset Your Password</h1>
              <p style="color:rgba(255,255,255,0.55);font-size:15px;line-height:1.6;margin:0 0 32px;">
                Click the button below to reset your password. This link expires in <strong style="color:#a5b4fc;">1 hour</strong>.
              </p>
            </td></tr>
            <tr><td style="padding:0 40px 32px;">
              <a href="${resetLink}"
                style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:1px;padding:14px 36px;border-radius:10px;box-shadow:0 0 30px rgba(99,102,241,0.4);">
                Reset Password &rarr;
              </a>
            </td></tr>
            <tr><td style="padding:0 40px 32px;">
              <p style="color:rgba(255,255,255,0.35);font-size:13px;line-height:1.6;margin:0;">
                If you didn&apos;t request this, you can safely ignore this email.
              </p>
              <p style="color:rgba(255,255,255,0.25);font-size:12px;margin:16px 0 0;">
                Or copy this link into your browser:<br>
                <span style="color:#818cf8;word-break:break-all;">${resetLink}</span>
              </p>
            </td></tr>
            <tr><td style="height:1px;background:rgba(99,102,241,0.15)"></td></tr>
            <tr><td style="padding:20px 40px;text-align:center;">
              <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;">&copy; Montage Studio &middot; All rights reserved</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const { error } = await resend.emails.send({
    from: "Montage Support <onboarding@resend.dev>",
    to,
    subject: "Reset Your Montage Password",
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    console.log("── RESET LINK (fallback) ──");
    console.log(`For: ${to}`);
    console.log(`Link: ${resetLink}`);
    console.log("──────────────────────────");
    throw new Error(`Failed to send reset email: ${error.message}`);
  }

  console.log(`Password reset email sent to: ${to}`);
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Verify Your Email - Montage</title>
    </head>
    <body style="margin:0;padding:0;background:#070714;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#070714;padding:40px 0;">
        <tr><td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background:#0d0d20;border:1px solid rgba(99,102,241,0.3);border-radius:16px;overflow:hidden;">
            <tr><td style="height:3px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#6366f1)"></td></tr>
            <tr><td style="padding:40px 40px 0;">
              <div style="margin-bottom:32px;">
                <span style="color:#a5b4fc;font-size:18px;font-weight:700;letter-spacing:4px;">MONTAGE</span>
              </div>
              <h1 style="color:#fff;font-size:26px;font-weight:700;margin:0 0 12px;">Verify Your Email</h1>
              <p style="color:rgba(255,255,255,0.55);font-size:15px;line-height:1.6;margin:0 0 24px;">
                Use the code below to complete your registration. It expires in <strong style="color:#a5b4fc;">10 minutes</strong>.
              </p>
            </td></tr>
            <tr><td style="padding:0 40px 32px;text-align:center;">
              <div style="display:inline-block;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15));border:2px solid rgba(99,102,241,0.5);border-radius:16px;padding:24px 48px;">
                <span style="color:#fff;font-size:42px;font-weight:800;letter-spacing:12px;font-family:monospace;">${otp}</span>
              </div>
            </td></tr>
            <tr><td style="padding:0 40px 32px;">
              <p style="color:rgba(255,255,255,0.35);font-size:13px;line-height:1.6;margin:0;">
                If you didn&apos;t request this, you can safely ignore this email.
              </p>
            </td></tr>
            <tr><td style="height:1px;background:rgba(99,102,241,0.15)"></td></tr>
            <tr><td style="padding:20px 40px;text-align:center;">
              <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;">&copy; Montage Studio &middot; All rights reserved</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const { error } = await resend.emails.send({
    from: "Montage <onboarding@resend.dev>",
    to,
    subject: "Your Montage Verification Code",
    html,
  });

  if (error) {
    console.error("Resend OTP error:", error);
    console.log("── OTP FALLBACK ──");
    console.log(`For: ${to}`);
    console.log(`OTP: ${otp}`);
    console.log("──────────────────");
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }

  console.log(`OTP email sent to: ${to}`);
}
