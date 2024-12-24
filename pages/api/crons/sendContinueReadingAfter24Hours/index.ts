// Node modules.
import { Resend } from "resend";
import type { NextApiRequest, NextApiResponse } from "next";
// Relative modules.
import UserService from "@/services/user";
import { paperLabels, paperLabelsLookup } from "@/utils/paperLabels";
import { paperIdToUrl } from "@/utils/paperFormatters";

const userService = new UserService();

const resend = new Resend(process.env.RESEND_API_KEY);

const deriveOtherPaperLabels = (paperId: string): string => {
  const excludedLabels =
    paperLabelsLookup[paperId as keyof typeof paperLabelsLookup];
  const labels = paperLabels.filter((label) => !excludedLabels.includes(label));

  // Grab 3 random ones.
  const randomLabels = labels
    .sort(() => Math.random() - Math.random())
    .slice(0, 3);

  return formatLabels(randomLabels);
};

const derivePaperLabels = (paperId: string): string => {
  const labels = paperLabelsLookup[paperId as keyof typeof paperLabelsLookup];

  return formatLabels(labels?.slice(0, 3) || []);
};

const formatLabels = (labels: string[]): string => {
  switch (labels.length) {
    case 0:
      return "";
    case 1:
      return labels[0];
    case 2:
      return labels.join(" and ");
    default:
      return `${labels.slice(0, -1).join(", ")}, and ${
        labels[labels.length - 1]
      }`;
  }
};

const handleCron = async (req: NextApiRequest, res: NextApiResponse) => {
  const users = await userService.findMany({
    where: {
      emailNotificationsEnabled: true,
      lastVisitedGlobalId: {
        not: null,
      },
      lastVisitedPaperId: {
        not: null,
      },
      lastVisitedAt: {
        // Last visited between 24 and 48 hours ago.
        gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
        lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  });

  // Prepare emails
  const messages = users.map((user) => ({
    from: process.env.EMAIL_FROM as string,
    to: user.email as string,
    subject: "Continue Reading Your Paper",
    html: `<p>Continue reading ${
      user.lastVisitedPaperId === "0"
        ? "the Foreword"
        : `Paper ${user.lastVisitedPaperId} - ${user.lastVisitedPaperTitle}`
    }</p>
    <p><a href="${process.env.NEXT_PUBLIC_HOST}/papers/${paperIdToUrl(
      `${user.lastVisitedPaperId}`
    )}#${user.lastVisitedGlobalId}">Continue Reading</a></p>`,
  }));

  try {
    // Send the emails
    await Promise.all(messages.map((message) => resend.emails.send(message)));

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

  await handleCron(req, res);
};

export default handler;
