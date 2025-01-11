import { baseEmailTemplate } from "./baseEmailTemplate";

export function getMagicLinkEmailHTML(url: string) {
  const content = `
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
  `;

  return baseEmailTemplate({
    title: "Sign in to Urantia Hub",
    content,
  });
}

export function getMagicLinkEmailText(url: string) {
  return `
    Welcome back!
    Click the button below to securely sign in to your account. This link will expire in 24 hours.
    ${url}
  `;
}
