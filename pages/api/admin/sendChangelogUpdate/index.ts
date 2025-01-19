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

const handleSendChangelogUpdate = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // Get the X-ADMIN-SECRET header.
  const adminSecret = req.headers["x-admin-secret"];
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log("Sending changelog update emails");

  // Get the changelog data from the request body
  const { excludedUserEmails, version, changes, images } = req.body;

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
      email: {
        notIn: excludedUserEmails || [],
      },
      emailNotificationsEnabled: true,
    },
  });

  const userEmails = users?.map((user) => user.email) || [];

  console.log(`Sending changelog update emails to ${userEmails.length} users`, {
    userEmails,
  });

  const changelogUrl = `${process.env.NEXT_PUBLIC_HOST}/changelog`;

  // Prepare emails
  const messages = users.map((user) => ({
    from: process.env.EMAIL_FROM as string,
    to: user.email as string,
    subject: `New Updates to UrantiaHub (v${version})`,
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
    await resend.batch.send(messages);

    res.status(200).json({
      userEmails,
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

  await handleSendChangelogUpdate(req, res);
};

export default handler;
