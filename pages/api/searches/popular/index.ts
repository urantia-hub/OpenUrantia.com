import { NextApiRequest, NextApiResponse } from "next";
import UserSearchService from "@/services/userSearch";
import moment from "moment";

const userSearchService = new UserSearchService();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Get the start date 30 days ago.
    const startDate = moment.utc().subtract(30, "days");

    const popularSearches = await userSearchService.getPopularSearches({
      startDate: startDate.toISOString(),
      endDate: moment.utc().toISOString(),
      limit: 10,
    });

    return res.status(200).json(popularSearches);
  } catch (error) {
    console.error("Failed to fetch popular searches:", error);
    return res.status(500).json({ error: "Failed to fetch searches" });
  }
}
