import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
import BookmarkService from "@/services/bookmark";
import getSessionDetails from "@/utils/getSessionDetails";

const bookmarkService = new BookmarkService();

async function handlePATCH(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const { id } = req.query;
  const { category } = req.body;

  if (!category && category !== "") {
    return res.status(400).json({ message: "Category is required" });
  }

  const bookmark = await bookmarkService.find({
    where: { id: id as string, userId: user.id },
  });
  if (!bookmark) {
    return res.status(404).json({ message: "Bookmark not found" });
  }

  const updatedBookmark = await bookmarkService.update(bookmark.id, {
    category,
  });

  res.status(200).json(updatedBookmark);
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sessionDetails = await getSessionDetails(req, res);
  if (!sessionDetails) return;

  const { method } = req;
  switch (method) {
    case "PATCH":
      return handlePATCH(req, res, sessionDetails.user);
    default:
      res.setHeader("Allow", ["PATCH"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
