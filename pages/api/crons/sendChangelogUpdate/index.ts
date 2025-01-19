// Node modules.
import { Resend } from "resend";
import type { NextApiRequest, NextApiResponse } from "next";
// Relative modules.
import UserService from "@/services/user";
import {
  getChangelogUpdateEmailHTML,
  getChangelogUpdateEmailText,
} from "@/utils/email-templates/changelogUpdate";

const userService = new UserService();
const resend = new Resend(process.env.RESEND_API_KEY);

const handleCron = async (req: NextApiRequest, res: NextApiResponse) => {
  // Get the changelog data from the request body
  const { version, changes, images } = req.body;

  if (!version || !changes || !Array.isArray(changes)) {
    return res.status(400).json({
      message:
        "Invalid request body. Required: version (string) and changes (string[])",
      success: false,
    });
  }

  // Get all users with email notifications enabled
  const users = await userService.findMany({
    where: {
      emailNotificationsEnabled: true,
    },
  });

  const changelogUrl = `${process.env.NEXT_PUBLIC_HOST}/changelog`;

  // Prepare emails
  const messages = users.map((user) => ({
    from: process.env.EMAIL_FROM as string,
    to: user.email as string,
    subject: `New Updates to UrantiaHub v${version}`,
    html: getChangelogUpdateEmailHTML({
      version,
      changes,
      changelogUrl,
      images,
    }),
    text: getChangelogUpdateEmailText({
      version,
      changes,
      changelogUrl,
    }),
  }));

  try {
    // Send the emails
    await Promise.all(messages.map((message) => resend.emails.send(message)));

    res.status(200).json({
      users: users.map((user) => user.email),
      success: true,
    });
  } catch (error: any) {
    console.error(error);
    if (error?.response) {
      console.error(error?.response.body);
    }
    res.status(500).json({ message: "Failed to send emails", success: false });
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Check if the secret key matches
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log("Sending changelog update emails");

  await handleCron(req, res);
};

export default handler;
