// Node modules.
import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next";
// Relative modules.
import ReadNodeService from "@/services/readNode";

const readNodeService = new ReadNodeService();

async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    // Get the last 30 days of read nodes using UTC dates
    const thirtyDaysAgo = moment.utc().subtract(30, "days").toDate();
    const now = moment.utc().toDate();

    const readNodes = await readNodeService.findReadsForPopularPapers(
      thirtyDaysAgo,
      now
    );

    // Count occurrences of each paperId
    const paperCounts = readNodes.reduce((acc, node) => {
      acc[node.paperId] = (acc[node.paperId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort by count and take top 3
    const topPaperIds = Object.entries(paperCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([paperId]) => paperId);

    res.status(200).json({ data: topPaperIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default handle;
