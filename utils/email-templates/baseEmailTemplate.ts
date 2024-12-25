interface BaseEmailTemplateProps {
  title: string;
  content: string;
}

export const baseEmailTemplate = ({
  title,
  content,
}: BaseEmailTemplateProps) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
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

              ${content}

              <!-- Footer -->
              <tr>
                <td style="padding: 32px 50px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 13px; margin: 0 0 16px; font-weight: 500;">
                    Exploring Our Origin, Past, and Future Together
                  </p>
                  <p style="color: #6b7280; font-size: 13px; margin: 0;">
                    <a href="${process.env.NEXT_PUBLIC_HOST}/api/user/unsubscribe"
                       style="color: #6b7280; text-decoration: underline;">
                      Unsubscribe from emails
                    </a>
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
