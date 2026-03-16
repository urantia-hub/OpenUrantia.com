import type { NextApiRequest, NextApiResponse } from "next";
import getSessionDetails from "@/utils/getSessionDetails";
import BookmarkService from "@/services/bookmark";
import { withSentry } from "@/middleware/sentry";

const bookmarkService = new BookmarkService();

async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sessionDetails = await getSessionDetails(req, res);
  if (!sessionDetails) return;

  const { method } = req;
  switch (method) {
    case "GET":
      const bookmarks = await bookmarkService.findMany({
        where: {
          userId: sessionDetails.user.id,
          category: { not: null },
        },
        distinct: ["category"],
        select: {
          category: true,
        },
      });

      const categories = bookmarks.map((b) => b.category);

      return res.status(200).json(categories);

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withSentry(handle);
