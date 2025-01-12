// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import BookmarkService from "@/services/bookmark";
import getSessionDetails from "@/utils/getSessionDetails";
import { enforceGlobalId, enforceString } from "@/utils/typeUtils";
import { withSentry } from "@/middleware/sentry";

const bookmarkService = new BookmarkService();

// POST handler
async function handlePOST(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const { globalId, paperId, paperSectionId, paperSectionParagraphId } =
    req.body;

  if (!globalId || !paperId) {
    return res.status(400).json({
      message:
        `Missing required fields: ${!globalId ? "globalId " : ""}` +
        `${!paperId ? "paperId " : ""}`,
    });
  }

  const bookmark = await bookmarkService.create({
    data: {
      globalId,
      paperId,
      paperSectionId,
      paperSectionParagraphId,
      userId: user.id,
    },
  });

  res.status(201).json(bookmark);
}

// GET handler
async function handleGET(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const { paperId } = req.query;

  if (paperId && typeof paperId !== "string") {
    return res.status(400).json({
      message: `The query param "paperId" must be a string.`,
    });
  }

  const where: any = { userId: user.id };
  if (paperId) {
    where["paperId"] = paperId;
  }

  const bookmarks = await bookmarkService.findMany({ where });

  res.status(200).json(bookmarks);
}

// DELETE handler
async function handleDELETE(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const { globalId } = req.query;

  try {
    enforceGlobalId("globalId", globalId);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }

  const bookmark = await bookmarkService.find({
    where: { globalId: globalId as string, userId: user.id },
  });

  if (!bookmark) {
    return res.status(400).json({ message: `Bookmark not found.` });
  }

  await bookmarkService.delete({ where: { id: bookmark.id } });

  res.status(204).end();
}

// Handler for the API endpoints.
async function handle(req: NextApiRequest, res: NextApiResponse) {
  const sessionDetails = await getSessionDetails(req, res);
  if (!sessionDetails) return;

  const { method } = req;
  switch (method) {
    case "POST":
      return handlePOST(req, res, sessionDetails.user);
    case "GET":
      return handleGET(req, res, sessionDetails.user);
    case "DELETE":
      return handleDELETE(req, res, sessionDetails.user);
    default:
      res.setHeader("Allow", ["POST", "GET", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withSentry(handle);
