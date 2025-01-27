// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { Paper, PaperLabel } from "@prisma/client";
// Relative modules.
import LabelService from "@/services/label";
import PaperLabelService from "@/services/paperLabel";
import { getRedisClient, ONE_WEEK_IN_SECONDS, getCacheKey } from "@/libs/redis";

const labelService = new LabelService();
const paperLabelService = new PaperLabelService();

async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const { topic } = req.query;
  if (!topic || typeof topic !== "string") {
    return res.status(400).json({ message: "Topic is required" });
  }

  try {
    const redis = getRedisClient();
    const cacheKey = getCacheKey("papers-by-topic", { topic });

    // Try to get from cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for papers-by-topic");
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Find the label ID for the given topic
    const label = await labelService.find({
      where: { name: topic },
    });
    if (!label) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Find papers with this label, now with random ordering
    const paperLabels = (await paperLabelService.findMany({
      where: { labelId: label.id },
      include: { paper: true },
    })) as (PaperLabel & { paper: Paper })[];

    // Randomly select 3 papers and then sort by paperId
    const papers = paperLabels
      .map((pl) => pl.paper)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .sort((a, b) => parseInt(a.id) - parseInt(b.id));

    const responseData = { data: papers };

    // Store in cache
    await redis.setex(
      cacheKey,
      ONE_WEEK_IN_SECONDS,
      JSON.stringify(responseData)
    );

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default handle;
