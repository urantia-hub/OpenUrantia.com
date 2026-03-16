// Node modules.
import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next";
// Relative modules.
import ReadNodeService from "@/services/readNode";
import { getRedisClient, ONE_WEEK_IN_SECONDS, getCacheKey } from "@/libs/redis";
import { withSentry } from "@/middleware/sentry";
import createLogger from "@/utils/logger";

const logger = createLogger("api/explore/most-read");

const readNodeService = new ReadNodeService();

async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const redis = getRedisClient();
    const cacheKey = getCacheKey("most-read");

    // Try to get from cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      logger.info("Cache hit for most-read");
      return res.status(200).json(JSON.parse(cachedData));
    }

    // If not in cache, proceed with original logic
    const thirtyDaysAgo = moment.utc().subtract(30, "days").toDate();
    const now = moment.utc().toDate();

    const readNodes = await readNodeService.findReadsForPopularPapers(
      thirtyDaysAgo,
      now
    );

    // Count occurrences of each paperId
    const countsByPaper = readNodes.reduce((acc, node) => {
      acc[node.paperId] = (acc[node.paperId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort by count and take top 6
    const topPaperIds = Object.entries(countsByPaper)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([paperId]) => paperId);

    const responseData = {
      data: {
        topPaperIds,
        countsByPaper,
      },
    };

    // Store in cache
    await redis.setex(
      cacheKey,
      ONE_WEEK_IN_SECONDS,
      JSON.stringify(responseData)
    );

    res.status(200).json(responseData);
  } catch (error) {
    logger.error("Internal server error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default withSentry(handle);
