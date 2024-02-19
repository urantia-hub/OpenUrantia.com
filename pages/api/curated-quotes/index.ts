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

const curatedQuoteService = new CuratedQuoteService();

// GET handler
async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const { sent } = req.query;
  if (sent && sent !== "true" && sent !== "false") {
    return res
      .status(400)
      .json({ error: `Expected sent to be "true" or "false", got ${sent}` });
  }

  const where: any = {};
  if (sent === "true") {
    where.sentAt = { not: null };
  } else if (sent === "false") {
    where.sentAt = null;
  }

  const curatedQuotes = await curatedQuoteService.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    count: curatedQuotes.length,
    data: curatedQuotes,
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
      return res.status(400).json({ error: error.message });
    }
  }

  const paperId = getPaperIdFromGlobalId(globalId);

  try {
    enforcePaperId("paperId", paperId);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }

  const curatedQuote = await curatedQuoteService.create({
    data: {
      globalId,
      paperId,
    },
  });

  res.status(201).json(curatedQuote);
}

// Handler for the API endpoints.
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the X-ADMIN-SECRET header.
  const adminSecret = req.headers["x-admin-secret"];
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

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
