// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
// Relative modules.
import CuratedQuoteService from "@/services/curatedQuote";
import { CuratedQuote } from "@prisma/client";
import { getRedisClient, ONE_WEEK_IN_SECONDS, getCacheKey } from "@/libs/redis";

const curatedQuoteService = new CuratedQuoteService();

// GET handler
async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const { sent, randomAmount: randomAmountString } = req.query;

  try {
    const redis = getRedisClient();
    const cacheKey = getCacheKey("curated-quotes", {
      sent,
      randomAmount: randomAmountString,
    });

    // Try to get from cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for curated-quotes");
      return res.status(200).json(JSON.parse(cachedData));
    }

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

    const responseData = {
      count: curatedQuotes.length,
      data: curatedQuotes,
      metadata,
    };

    // Store in cache
    await redis.setex(
      cacheKey,
      ONE_WEEK_IN_SECONDS,
      JSON.stringify(responseData)
    );

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
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
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
