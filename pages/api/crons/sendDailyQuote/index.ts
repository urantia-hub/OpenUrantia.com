// Node modules.
import axios from "axios";
import sgMail from "@sendgrid/mail";
import type { NextApiRequest, NextApiResponse } from "next";
// Relative modules.
import UserService from "@/services/user";

const userService = new UserService();

// Setting SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const users = await userService.findMany({
    where: {
      emailNotificationsEnabled: true,
    },
  });

  // Get a random quote
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST}/api/v1/urantia-book/paragraphs/random`
  );
  const paragraph = response?.data?.data;

  if (!paragraph) {
    return res.status(500).json({
      message: "Failed to get a random quote from urantia.dev",
      success: false,
    });
  }

  const { globalId, htmlText, paperId, standardReferenceId } = paragraph;

  // Prepare emails
  const messages = users.map((user) => ({
    to: user.email as string,
    from: process.env.SENDGRID_FROM as string,
    templateId: process.env.SENDGRID_SEND_DAILY_QUOTE_TEMPLATE_ID as string,
    dynamicTemplateData: {
      paper:
        paperId === "0"
          ? "Foreword"
          : `Paper ${paperId} - ${paragraph.paperTitle}`,
      paragraph: `"(${standardReferenceId}) ${htmlText}"`,
      preHeader: `${
        paperId === "0"
          ? "Foreword"
          : `Paper ${paperId} - ${paragraph.paperTitle} - "(${standardReferenceId}) ${htmlText}"`
      }`,
      continueReadingUrl: `${process.env.NEXT_PUBLIC_OPEN_URANTIA_HOST}/papers/${paperId}#${globalId}`,
    },
  }));

  try {
    // Send the emails
    await sgMail.send(messages);

    res
      .status(200)
      .json({ users: users.map((user) => user.email), success: true });
  } catch (error: any) {
    console.error(error);
    if (error?.response) {
      console.error(error?.response.body);
    }
    res.status(500).json({ message: "Failed to send emails", success: false });
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const secretKey = process.env.CRON_SECRET;

  // Check if the secret key matches
  if (req.headers["x-cron-secret"] !== secretKey) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "POST") {
    return handlePOST(req, res);
  } else {
    // Handle any non-POST requests
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
