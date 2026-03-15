// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import moment from "moment";
// Relative modules.
import CuratedQuoteService from "@/services/curatedQuote";
import {
  enforceGlobalId,
  enforcePaperId,
  enforceStandardReferenceId,
} from "@/utils/typeUtils";
import {
  getGlobalIdFromStandardReferenceId,
  getPaperIdFromGlobalId,
} from "@/utils/node";
import { CuratedQuote } from "@prisma/client";
import getSessionDetails from "@/utils/getSessionDetails";
import UserService from "@/services/user";
import SentQuoteService from "@/services/sentQuote";

const curatedQuoteService = new CuratedQuoteService();
const userService = new UserService();
const sentQuoteService = new SentQuoteService();

// GET handler
async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const { sent, randomAmount: randomAmountString } = req.query;

  // Validate sent parameter
  if (sent && sent !== "true" && sent !== "false") {
    return res
      .status(400)
      .json({ error: `Expected sent to be "true" or "false", got ${sent}` });
  }

  // Validate randomAmount if provided
  const randomAmount = randomAmountString
    ? parseInt(randomAmountString as string, 10)
    : undefined;
  if (randomAmount && (isNaN(randomAmount) || randomAmount < 1)) {
    return res
      .status(400)
      .json({ error: "randomAmount must be a positive integer" });
  }

  // Build where clause
  const where: any = {};
  const metadata: any = {};
  if (sent === "true") {
    where.sentAt = { not: null };
    metadata.sent = true;
  } else if (sent === "false") {
    where.sentAt = null;
    metadata.sent = false;
  }

  let curatedQuotes: CuratedQuote[] = [];

  // If randomAmount is specified, randomly sample the quotes
  if (randomAmount) {
    const unsortedQuotes = (await curatedQuoteService.getRandom({
      amount: randomAmount,
      enriched: true,
      sent: where.sentAt ? true : false,
    })) as CuratedQuote[];
    curatedQuotes =
      unsortedQuotes?.sort((a, b) => {
        return a.globalId.localeCompare(b.globalId);
      }) || [];
    metadata.randomAmount = randomAmount;
  } else {
    curatedQuotes = await curatedQuoteService.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Fetch node information for each quote
  const { fetchParagraph } = await import("@/libs/urantiaApi/client");
  const nodePromises = curatedQuotes.map(async (quote) => {
    try {
      return await fetchParagraph(quote.globalId);
    } catch {
      return null;
    }
  });

  const nodes = await Promise.all(nodePromises);

  // Get total number of users with notifications enabled using count
  const totalUsersWithNotifications = await userService.count({
    where: {
      emailNotificationsEnabled: true,
    },
  });

  // Get sent quote counts more efficiently using count
  const sentQuoteCounts = await Promise.all(
    curatedQuotes.map(async (quote) => {
      const count = await sentQuoteService.count({
        where: {
          globalId: quote.globalId,
        },
      });
      return { globalId: quote.globalId, count };
    })
  );

  // Combine quotes with their node information and sent counts
  const quotesWithNodes = curatedQuotes
    .map((quote, index) => ({
      ...quote,
      paragraphNode: nodes[index],
      sentCount:
        sentQuoteCounts.find(
          (sentQuote) => sentQuote.globalId === quote.globalId
        )?.count || 0,
      totalUsers: totalUsersWithNotifications,
    }))
    .sort((a, b) => {
      // Put quotes without sentAt first
      if (!a.sentAt !== !b.sentAt) {
        return a.sentAt ? 1 : -1;
      }

      // If neither has sentAt, sort by createdAt asc (soonest first)
      if (!a.sentAt) {
        return moment(a.createdAt).diff(moment(b.createdAt));
      }

      // If both have sentAt, sort by sentAt desc (most recent first)
      return moment(b.sentAt).diff(moment(a.sentAt));
    });

  res.status(200).json({
    count: quotesWithNodes.length,
    data: quotesWithNodes,
    metadata,
  });
}

// POST handler
async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  let { globalId, standardReferenceId } = req.body;

  if (globalId) {
    try {
      enforceGlobalId("globalId", globalId);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (standardReferenceId) {
    try {
      enforceStandardReferenceId("standardReferenceId", standardReferenceId);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (globalId && standardReferenceId) {
    return res.status(400).json({
      error: "Expected either globalId or standardReferenceId, got both",
    });
  }

  if (!globalId && !standardReferenceId) {
    return res.status(400).json({
      error: "Expected either globalId or standardReferenceId, got neither",
    });
  }

  if (standardReferenceId) {
    try {
      globalId = getGlobalIdFromStandardReferenceId(standardReferenceId);
      if (!globalId) {
        return res.status(400).json({
          error: `Unable to get globalId from standardReferenceId: ${standardReferenceId}`,
        });
      }
    } catch (error: any) {
      console.error("Error getting globalId from standardReferenceId:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  const paperId = getPaperIdFromGlobalId(globalId);

  try {
    enforcePaperId("paperId", paperId);
  } catch (error: any) {
    console.error("Error enforcing paperId:", error);
    return res.status(500).json({ error: error.message });
  }

  let curatedQuote;
  try {
    console.log(
      "Creating curated quote with globalId:",
      globalId,
      "and paperId:",
      paperId
    );
    curatedQuote = await curatedQuoteService.create({
      data: {
        globalId,
        paperId,
      },
    });
  } catch (error: any) {
    console.error("Error creating curated quote:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(curatedQuote);
}

// Handler for the API endpoints.
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sessionDetails = await getSessionDetails(req, res, { isAdmin: true });
  if (!sessionDetails) return;

  const { method } = req;
  switch (method) {
    case "GET":
      return handleGET(req, res);
    case "POST":
      return handlePOST(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
