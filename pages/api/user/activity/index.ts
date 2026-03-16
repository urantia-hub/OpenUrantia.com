// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { Bookmark, User } from "@prisma/client";
// Relative modules.
import BookmarkService from "@/services/bookmark";
import NoteService from "@/services/note";
import getSessionDetails from "@/utils/getSessionDetails";
import { createSortId } from "@/utils/node";
import { enforceStringNumber } from "@/utils/typeUtils";
import { withSentry } from "@/middleware/sentry";
import createLogger from "@/utils/logger";

const logger = createLogger("api/user/activity");

const noteService = new NoteService();
const bookmarkService = new BookmarkService();

// GET handler
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const { filterType, sortBy, paperId } = req.query;

  const filter: any = {};
  if (paperId) {
    logger.info("paperId", { paperId: paperId as unknown as Record<string, unknown> });
    enforceStringNumber("paperId", paperId);
    filter.paperId = parseInt(paperId as string, 10);
  }

  let bookmarksWithDetails: (Bookmark & UBNode)[] = [];
  let notesWithDetails: any[] = [];

  if (filterType === "all" || filterType === "bookmark") {
    logger.info("Fetching bookmarks");
    bookmarksWithDetails = await bookmarkService.getUserBookmarksWithDetails(
      user.id,
      filter
    );
  }

  if (filterType === "all" || filterType === "note") {
    logger.info("Fetching notes");
    notesWithDetails = await noteService.getUserNotesWithDetails(
      user.id,
      filter
    );
  }

  // Combine bookmarks and notes.
  logger.info("Combining bookmarks and notes");
  let activity = [...bookmarksWithDetails, ...notesWithDetails];

  let sortedActivity = [...activity];

  // Then apply sorting to this new array
  if (sortBy === "updatedAt") {
    logger.info("Sorting by updatedAt");
    sortedActivity.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } else if (sortBy === "globalId") {
    logger.info("Sorting by globalId");
    sortedActivity.sort((a, b) => {
      if (!a.globalId || !b.globalId) {
        logger.error("Missing globalId in node", undefined, { a: a as unknown as Record<string, unknown>, b: b as unknown as Record<string, unknown> });
      }
      const sortIdA = createSortId(a.globalId);
      const sortIdB = createSortId(b.globalId);
      return sortIdA.localeCompare(sortIdB);
    });
  }

  res.status(200).json(sortedActivity);
}

// POST handler
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  // Handle saving a new node
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

// Handler for the API endpoints.
async function handle(req: NextApiRequest, res: NextApiResponse) {
  const sessionDetails = await getSessionDetails(req, res);
  if (!sessionDetails) return;

  const { method } = req;
  switch (method) {
    case "GET":
      return handleGet(req, res, sessionDetails.user);
    case "POST":
      return handlePost(req, res, sessionDetails.user);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withSentry(handle);
