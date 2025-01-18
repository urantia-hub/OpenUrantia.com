import { NextApiRequest, NextApiResponse } from "next";
import getSessionDetails from "@/utils/getSessionDetails";
import UserSearchService from "@/services/userSearch";

const userSearchService = new UserSearchService();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getSessionDetails(req, res);
  const userId = session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const recentSearches = await userSearchService.getRecentSearches({
      userId,
      limit: 10,
    });

    return res.status(200).json(recentSearches);
  } catch (error) {
    console.error("Failed to fetch recent searches:", error);
    return res.status(500).json({ error: "Failed to fetch searches" });
  }
}
