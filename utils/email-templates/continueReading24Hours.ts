import { baseEmailTemplate } from "./baseEmailTemplate";

interface ContinueReadingEmailProps {
  paperTitle: string;
  paperId: string;
  text: string;
  standardReferenceId: string;
  continueReadingUrl: string;
}

export const getContinueReadingEmailHTML = (
  props: ContinueReadingEmailProps
) => {
  const content = `
    <!-- Content -->
    <tr>
      <td style="padding: 0 50px 32px;">
        <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 12px;">Ready to continue?</h2>
        <p style="color: #4b5563; font-size: 15px; line-height: 24px; margin: 0 0 24px;">
          You were reading <strong>"${
            props.paperId === "0"
              ? "the Foreword"
              : `Paper ${props.paperId} - ${props.paperTitle}`
          }"</strong>:
        </p>
        <p style="color: #4b5563; font-size: 15px; line-height: 24px; margin: 0 0 24px; font-style: italic;">
          "(${props.standardReferenceId}) ${props.text}"
        </p>
        <a href="${props.continueReadingUrl}"
           style="background-color: #3b82f6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500; display: inline-block; transition: background-color 0.2s;">
          Pick up right where you left off
        </a>
      </td>
    </tr>
  `;

  return baseEmailTemplate({
    title: "Continue Reading",
    content,
  });
};

export const getContinueReadingEmailText = (
  props: ContinueReadingEmailProps
) => {
  return `
    Ready to continue?
    You were reading "${
      props.paperId === "0"
        ? "the Foreword"
        : `Paper ${props.paperId} - ${props.paperTitle}`
    }":
    "(${props.standardReferenceId}) ${props.text}"
    ${props.continueReadingUrl}
  `;
};
