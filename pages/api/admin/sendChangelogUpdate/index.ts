// Node modules.
import { Resend } from "resend";
import type { NextApiRequest, NextApiResponse } from "next";
// Relative modules.
import UserService from "@/services/user";
import {
  getChangelogUpdateEmailHTML,
  getChangelogUpdateEmailText,
} from "@/utils/email-templates/changelogUpdate";
import getSessionDetails from "@/utils/getSessionDetails";

const userService = new UserService();
const resend = new Resend(process.env.RESEND_API_KEY);

const handleSendChangelogUpdate = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const sessionDetails = await getSessionDetails(req, res, { isAdmin: true });
  if (!sessionDetails) return;

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

  // Get all users with both general and changelog notifications enabled
  const users = await userService.findMany({
    where: {
      email: {
        notIn: excludedUserEmails || [],
      },
      emailNotificationsEnabled: true,
      emailChangelogEnabled: true,
    },
  });

  const userEmails = users?.map((user) => user.email) || [];

  console.log(`Sending changelog update emails to ${userEmails.length} users`, {
    userEmails,
  });

  const changelogUrl = `${process.env.NEXT_PUBLIC_HOST}/changelog`;

  // Prepare emails
  const messages = users.map((user) => ({
    from: `"UrantiaHub" <${process.env.EMAIL_FROM}>`,
    to: user.email as string,
    subject: `New Updates to UrantiaHub (v${version})`,
    headers: {
      "List-Unsubscribe": `<${process.env.NEXT_PUBLIC_HOST}/api/user/unsubscribe>`,
      Precedence: "Bulk",
      "X-Auto-Response-Suppress": "OOF",
    },
    clickTracking: false,
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
