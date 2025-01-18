import { NextApiRequest, NextApiResponse } from "next";
import getSessionDetails from "@/utils/getSessionDetails";
import UserSearchService from "@/services/userSearch";

const userSearchService = new UserSearchService();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getSessionDetails(req, res);
  const userId = session?.user?.id;

  try {
    const { searchQuery, resultCount } = req.body;

    if (!searchQuery) {
      return res.status(400).json({ error: "'searchQuery' is required" });
    }

    if (!resultCount && resultCount !== 0) {
      return res.status(400).json({ error: "Result count is required" });
    }

    const search = await userSearchService.create({
      data: {
        searchQuery,
        resultCount,
        userId, // Optional, will be undefined if user is not logged in
      },
    });

    return res.status(201).json(search);
  } catch (error) {
    console.error("Failed to create search:", error);
    return res.status(500).json({ error: "Failed to create search" });
  }
}
