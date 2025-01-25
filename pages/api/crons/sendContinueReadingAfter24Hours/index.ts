// Node modules.
import axios from "axios";
import { Resend } from "resend";
import type { NextApiRequest, NextApiResponse } from "next";
// Relative modules.
import UserService from "@/services/user";
import { paperIdToUrl } from "@/utils/paperFormatters";
import {
  getContinueReadingEmailHTML,
  getContinueReadingEmailText,
} from "@/utils/email-templates/continueReading24Hours";

const userService = new UserService();

const resend = new Resend(process.env.RESEND_API_KEY);

const handleCron = async (_: NextApiRequest, res: NextApiResponse) => {
  const users = await userService.findMany({
    where: {
      emailNotificationsEnabled: true,
      emailContinueReadingEnabled: true,
      lastVisitedGlobalId: {
        not: null,
      },
      lastVisitedPaperId: {
        not: null,
      },
      lastVisitedAt: {
        // Last visited between 0 and 48 hours ago.
        gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
        lt: new Date(Date.now()),
      },
    },
  });

  // Prepare emails
  const messages = await Promise.all(
    users.map(async (user) => {
      // Fetch the paragraph details
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST}/api/v1/urantia-book/paragraphs/${user.lastVisitedGlobalId}`
      );
      const paragraph = response?.data?.data;

      if (!paragraph) {
        console.error(
          `Failed to fetch paragraph ${user.lastVisitedGlobalId} for user ${user.id}`
        );
        return null;
      }

      return {
        from: process.env.EMAIL_FROM as string,
        to: user.email as string,
        subject: "Continue right where you left off",
        html: getContinueReadingEmailHTML({
          paperTitle: user.lastVisitedPaperTitle as string,
          paperId: user.lastVisitedPaperId as string,
          text: paragraph.text,
          standardReferenceId: paragraph.standardReferenceId,
          continueReadingUrl: `${
            process.env.NEXT_PUBLIC_HOST
          }/papers/${paperIdToUrl(`${user.lastVisitedPaperId}`)}#${
            user.lastVisitedGlobalId
          }`,
        }),
        text: getContinueReadingEmailText({
          paperTitle: user.lastVisitedPaperTitle as string,
          paperId: user.lastVisitedPaperId as string,
          text: paragraph.text,
          standardReferenceId: paragraph.standardReferenceId,
          continueReadingUrl: `${
            process.env.NEXT_PUBLIC_HOST
          }/papers/${paperIdToUrl(`${user.lastVisitedPaperId}`)}#${
            user.lastVisitedGlobalId
          }`,
        }),
      };
    })
  );

  // Filter out any null messages from failed paragraph fetches
  const validMessages = messages.filter(
    (message): message is NonNullable<typeof message> => message !== null
  );

  try {
    // Send the emails
    await Promise.all(
      validMessages.map((message) => resend.emails.send(message))
    );

    // Update the lastAskedNotificationsAt field for each user
    await userService.updateMany({
      data: {
        lastAskedNotificationsAt: new Date(),
      },
      where: {
        id: {
          in: users.map((user) => user.id),
        },
      },
    });

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
  // Check if the secret key matches
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log("Sending continue reading emails");

  await handleCron(req, res);
};

export default handler;
