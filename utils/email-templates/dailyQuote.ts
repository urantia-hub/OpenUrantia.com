import { baseEmailTemplate } from "./baseEmailTemplate";

interface DailyQuoteEmailProps {
  paperTitle: string;
  paperId: string;
  text: string;
  standardReferenceId: string;
  continueReadingUrl: string;
  lastVisitedUrl: string;
}

export const getDailyQuoteEmailHTML = (props: DailyQuoteEmailProps) => {
  const content = `
    <!-- Content -->
    <tr>
      <td style="padding: 0 50px 32px;">
        <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 12px;">
          ${
            props.paperId === "0"
              ? "Foreword"
              : `Paper ${props.paperId} - ${props.paperTitle}`
          }
        </h2>
        <p style="color: #4b5563; font-size: 15px; line-height: 24px; margin: 0 0 24px; font-style: italic;">
          "(${props.standardReferenceId}) ${props.text}"
        </p>
        <a href="${props.continueReadingUrl}"
           style="background-color: #3b82f6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500; display: inline-block; transition: background-color 0.2s;">
          Read more...
        </a>
      </td>
    </tr>
    <!-- Action Buttons Section -->
    <tr>
      <td style="padding: 0 50px 40px;">
        <div style="margin-top: 24px;">
          <p style="color: #6b7280; font-size: 15px; margin: 0 0 12px;">
            Want to continue where you left off instead?
          </p>
          <a href="${props.lastVisitedUrl}"
             style="background-color: #f3f4f6; color: #374151; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500; display: inline-block; transition: background-color 0.2s;">
            Pick up where you left off
          </a>
        </div>
      </td>
    </tr>
  `;

  return baseEmailTemplate({
    title: "Your Daily Quote",
    content,
  });
};

export const getDailyQuoteEmailText = (props: DailyQuoteEmailProps) => {
  return `
  ${
    props.paperId === "0"
      ? "Foreword"
      : `Paper ${props.paperId} - ${props.paperTitle}`
  }
  "(${props.standardReferenceId}) ${props.text}"
  Read more... ${props.continueReadingUrl}
  Want to continue where you left off instead? Pick up where you left off: ${
    props.lastVisitedUrl
  }
  `;
};
