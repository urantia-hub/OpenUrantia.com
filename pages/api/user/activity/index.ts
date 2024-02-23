// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import BookmarkService from "@/services/bookmark";
import NoteService from "@/services/note";
import getSessionDetails from "@/utils/getSessionDetails";
import { createSortId } from "@/utils/node";
import { enforceStringNumber } from "@/utils/typeUtils";

const noteService = new NoteService();
const bookmarkService = new BookmarkService();

const getBookmarksWithDetails = async (
  userId: string,
  filter: { paperId?: number }
) => {
  // Handle fetching all bookmarks for a user.
  console.log(
    "[getBookmarksWithDetails] Fetching bookmarks with filter:",
    filter
  );
  const bookmarks = await bookmarkService.findMany({
    where: {
      userId,
      ...(filter.paperId !== undefined && { paperId: `${filter.paperId}` }),
    },
  });

  // If there are no bookmarks, return an empty array.
  if (!bookmarks?.length) {
    console.log("[getBookmarksWithDetails] No bookmarks found");
    return [];
  }

  // Fetch the paperSectionParagraphIds details for each bookmark.
  const paperSectionParagraphIds = bookmarks.map(
    (bookmark) => bookmark.paperSectionParagraphId
  );
  console.log(
    "[getBookmarksWithDetails] Fetching nodes details for paperSectionParagraphIds:",
    paperSectionParagraphIds
  );
  const nodesDetails = await bookmarkService.getNodesByPaperSectionParagraphIds(
    paperSectionParagraphIds
  );

  // Add the paperSectionParagraphId details to each bookmark.
  console.log("[getBookmarksWithDetails] Adding nodes details to bookmarks");
  const bookmarksWithDetails = bookmarks.map((bookmark) => {
    const nodeDetail = nodesDetails.find(
      (nodeDetail: UBNode) =>
        nodeDetail.paperSectionParagraphId === bookmark.paperSectionParagraphId
    );
    return {
      ...bookmark,
      ...nodeDetail,
      type: "bookmark",
    };
  });

  console.log(
    "[getBookmarksWithDetails] bookmarksWithDetails:",
    bookmarksWithDetails
  );
  return bookmarksWithDetails;
};

const getNotesWithDetails = async (
  userId: string,
  filter: { paperId?: number }
) => {
  // Handle fetching all notes for a user.
  console.log("[getNotesWithDetails] Fetching notes with filter:", filter);
  const notes = await noteService.findMany({
    where: { userId, ...(filter.paperId && { paperId: `${filter.paperId}` }) },
  });

  // If there are no notes, return an empty array.
  if (!notes?.length) {
    console.log("[getNotesWithDetails] No notes found");
    return [];
  }

  // Fetch the paperSectionParagraphId details for each note.
  const paperSectionParagraphId = notes.map(
    (note) => note.paperSectionParagraphId
  );
  console.log(
    "[getNotesWithDetails] Fetching nodes details for paperSectionParagraphId:",
    paperSectionParagraphId
  );
  const nodesDetails = await bookmarkService.getNodesByPaperSectionParagraphIds(
    paperSectionParagraphId
  );

  // Add the paperSectionParagraphId details to each note.
  console.log("[getNotesWithDetails] Adding nodes details to notes");
  const notesWithDetails = notes.map((note) => {
    const nodeDetail = nodesDetails.find(
      (nodeDetail: UBNode) =>
        nodeDetail.paperSectionParagraphId === note.paperSectionParagraphId
    );
    return {
      ...note,
      ...nodeDetail,
      noteText: note.text,
      type: "note",
    };
  });

  console.log("[getNotesWithDetails] notesWithDetails:", notesWithDetails);
  return notesWithDetails;
};

// GET handler
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const { filterType, sortBy, paperId } = req.query;

  const filter: any = {};
  if (paperId) {
    console.log("[GET /api/user/activity] paperId:", paperId);
    enforceStringNumber("paperId", paperId);
    filter.paperId = parseInt(paperId as string, 10);
  }

  let bookmarksWithDetails = [];
  let notesWithDetails = [];

  if (filterType === "all" || filterType === "bookmark") {
    console.log("[GET /api/user/activity] Fetching bookmarks");
    bookmarksWithDetails = await getBookmarksWithDetails(user.id, filter);
  }

  if (filterType === "all" || filterType === "note") {
    console.log("[GET /api/user/activity] Fetching notes");
    notesWithDetails = await getNotesWithDetails(user.id, filter);
  }

  // Combine bookmarks and notes.
  console.log("[GET /api/user/activity] Combining bookmarks and notes");
  let activity = [...bookmarksWithDetails, ...notesWithDetails];

  // Apply sorting to the combined list
  if (sortBy === "updatedAt") {
    console.log("[GET /api/user/activity] sortBy: updatedAt");
    activity.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } else if (sortBy === "globalId") {
    console.log("[GET /api/user/activity] sortBy: globalId");
    activity.sort((a, b) => {
      if (!a.globalId || !b.globalId) {
        console.error("Missing globalId in node", a, b);
      }
      const sortIdA = createSortId(a.globalId);
      const sortIdB = createSortId(b.globalId);
      return sortIdA.localeCompare(sortIdB);
    });
  }

  res.status(200).json(activity);
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
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
