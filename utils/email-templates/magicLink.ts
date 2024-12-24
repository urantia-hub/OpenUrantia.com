export function getMagicLinkEmailHTML(url: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Sign in to Urantia Hub</title>
      </head>
      <body style="background-color: #f3f4f6; margin: 0; padding: 48px 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <table width="500" border="0" cellspacing="0" cellpadding="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 50px 32px;">
                    <h1 style="margin: 0; font-size: 28px; color: #111827;">
                      <span style="font-weight: 300;">Urantia</span><span style="font-weight: 600;">Hub</span>
                    </h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 0 50px 32px;">
                    <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 12px;">Welcome back!</h2>
                    <p style="color: #4b5563; font-size: 15px; line-height: 24px; margin: 0 0 24px;">
                      Click the button below to securely sign in to your account. This link will expire in 24 hours.
                    </p>
                    <a href="${url}"
                       style="background-color: #3b82f6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500; display: inline-block; transition: background-color 0.2s;">
                      Sign in to UrantiaHub
                    </a>
                    <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 24px 0 0;">
                      If you didn't request this email, you can safely ignore it.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding: 32px 50px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 13px; margin: 0; font-weight: 500;">
                      Exploring Our Origin, Past, and Future Together
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
