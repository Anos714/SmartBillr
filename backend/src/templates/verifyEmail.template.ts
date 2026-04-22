export const verifyEmailTemplate = (
  fullName: string,
  verificationUrl: string,
) => {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your email</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1a2433;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#2563eb,#06b6d4);padding:28px 28px 24px;color:#ffffff;">
                <div style="font-size:13px;letter-spacing:1.2px;text-transform:uppercase;opacity:0.9;">SmartBillr</div>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;">Verify your email address</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">Hi ${fullName},</p>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
                  Welcome to SmartBillr. Please confirm your email to activate your account and start creating invoices.
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 18px;">
                  <tr>
                    <td align="center" style="border-radius:10px;background:#2563eb;">
                      <a href="${verificationUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:13px 22px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">
                        Verify Email
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 14px;font-size:13px;line-height:1.7;color:#64748b;">
                  This link expires in <strong>15 minutes</strong>.
                </p>

                <p style="margin:0 0 6px;font-size:13px;line-height:1.7;color:#64748b;">
                  If the button does not work, copy and paste this URL into your browser:
                </p>
                <p style="margin:0 0 22px;font-size:12px;line-height:1.7;word-break:break-all;color:#0f172a;background:#f8fafc;padding:10px 12px;border-radius:8px;border:1px solid #e2e8f0;">
                  ${verificationUrl}
                </p>

                <p style="margin:0;font-size:13px;line-height:1.7;color:#64748b;">
                  If you did not create an account, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 28px 24px;border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">
                  Sent by SmartBillr • Secure billing made simple
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
