// Node modules.
import axios from "axios";
import sgMail from "@sendgrid/mail";
import type { NextApiRequest, NextApiResponse } from "next";
// Relative modules.
import SentQuoteService from "@/services/sentQuote";
import UserService from "@/services/user";
import CuratedQuoteService from "@/services/curatedQuote";
import { paperIdToUrl } from "@/utils/paperFormatters";

const curatedQuoteService = new CuratedQuoteService();
const sentQuoteService = new SentQuoteService();
const userService = new UserService();

// Setting SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const handleCron = async (_: NextApiRequest, res: NextApiResponse) => {
  // Get users who have email notifications enabled.
  console.log("[sendDailyQuote] Fetching users");
  const users = await userService.findMany({
    where: {
      emailNotificationsEnabled: true,
    },
  });

  // Get a curated quote
  console.log("[sendDailyQuote] Fetching curated quote");
  const curatedQuotes = await curatedQuoteService.getRandom({
    sent: false,
  });
  const curatedQuote = curatedQuotes?.[0];

  if (!curatedQuote?.globalId) {
    console.log(
      "[sendDailyQuote] Failed to get a curated quote, are there any unsent curated quotes left?"
    );
    return res.status(500).json({
      message: "Failed to get a curated quote",
      success: false,
    });
  }

  // Get a random quote
  console.log("[sendDailyQuote] Fetching paragraph");
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST}/api/v1/urantia-book/paragraphs/${curatedQuote.globalId}`
  );
  const paragraph = response?.data?.data;

  if (!paragraph) {
    console.log(
      "[sendDailyQuote] Failed to get a curated quote from urantia.dev",
      response
    );
    return res.status(500).json({
      message: "Failed to get a curated quote from urantia.dev",
      success: false,
    });
  }

  const { globalId, text, paperId, standardReferenceId } = paragraph;

  // Fetch existing sent quotes for this globalId
  console.log("[sendDailyQuote] Fetching existing sent quotes");
  const existingSentQuotes = await sentQuoteService.findMany({
    where: {
      globalId,
      userId: {
        in: users.map((user) => user.id),
      },
    },
  });

  // Extract user IDs from existing sent quotes
  console.log("[sendDailyQuote] Extracting user IDs from existing sent quotes");
  const usersWithSentQuote = existingSentQuotes.map(
    (sentQuote) => sentQuote.userId
  );

  // Filter users who have not received this quote
  console.log(
    "[sendDailyQuote] Filtering users who have not received this quote"
  );
  const usersToSend = users.filter(
    (user) => !usersWithSentQuote.includes(user.id)
  );

  // Prepare emails
  console.log("[sendDailyQuote] Preparing emails");
  const messages = usersToSend.map((user) => ({
    to: user.email as string,
    from: process.env.SENDGRID_FROM as string,
    templateId: process.env.SENDGRID_SEND_DAILY_QUOTE_TEMPLATE_ID as string,
    dynamicTemplateData: {
      paper:
        paperId === "0"
          ? "Foreword"
          : `Paper ${paperId} - ${paragraph.paperTitle}`,
      paragraph: `"(${standardReferenceId}) ${text}"`,
      preHeader: `${
        paperId === "0"
          ? "Foreword"
          : `Paper ${paperId} - ${paragraph.paperTitle} - "(${standardReferenceId}) ${text}"`
      }`,
      continueReadingUrl: `${
        process.env.NEXT_PUBLIC_HOST
      }/papers/${paperIdToUrl(`${paperId}`)}#${globalId}`,
    },
  }));

  try {
    // Send the emails.
    console.log("[sendDailyQuote] Sending emails");
    await sgMail.send(messages);

    // Create sent quotes for each user.
    console.log("[sendDailyQuote] Creating sent quotes");
    await Promise.all(
      usersToSend.map((user) =>
        sentQuoteService.create({
          data: {
            globalId,
            paperId,
            userId: user.id,
          },
        })
      )
    );

    // Update curated quote to mark it as sent
    console.log("[sendDailyQuote] Updating curated quote to mark it as sent");
    await curatedQuoteService.update(curatedQuote.id, {
      sentAt: new Date(),
    });

    console.log("[sendDailyQuote] Emails sent successfully");
    res
      .status(200)
      .json({ users: usersToSend.map((user) => user.email), success: true });
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
