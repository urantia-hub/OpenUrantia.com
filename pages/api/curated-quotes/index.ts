// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
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

const curatedQuoteService = new CuratedQuoteService();

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

  res.status(200).json({
    count: curatedQuotes.length,
    data: curatedQuotes,
    metadata,
  });
}

// POST handler
async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  // Get the X-ADMIN-SECRET header.
  const adminSecret = req.headers["x-admin-secret"];
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

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
      return res.status(400).json({ error: error.message });
    }
  }

  const paperId = getPaperIdFromGlobalId(globalId);

  try {
    enforcePaperId("paperId", paperId);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }

  let curatedQuote;
  try {
    curatedQuote = await curatedQuoteService.create({
      data: {
        globalId,
        paperId,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(curatedQuote);
}

// Handler for the API endpoints.
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "GET":
      return handleGET(req, res);
    case "POST":
      return handlePOST(req, res);
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
