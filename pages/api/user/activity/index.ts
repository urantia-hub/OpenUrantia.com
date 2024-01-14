// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import NoteService from "@/services/note";
import BookmarkService from "@/services/bookmark";
import getSessionDetails from "@/utils/getSessionDetails";

const noteService = new NoteService();
const bookmarkService = new BookmarkService();

const getBookmarksWithDetails = async (userId: string) => {
  // Handle fetching all bookmarks for a user.
  const bookmarks = await bookmarkService.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Fetch the paperSectionParagraphId details for each bookmark.
  const paperSectionParagraphId = bookmarks.map(
    (bookmark) => bookmark.paperSectionParagraphId
  );
  const nodesDetails = await bookmarkService.getNodesByPaperSectionParagraphIds(
    paperSectionParagraphId
  );

  // Add the paperSectionParagraphId details to each bookmark.
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

  return bookmarksWithDetails;
};

const getNotesWithDetails = async (userId: string) => {
  // Handle fetching all notes for a user.
  const notes = await noteService.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Fetch the paperSectionParagraphId details for each note.
  const paperSectionParagraphId = notes.map(
    (note) => note.paperSectionParagraphId
  );
  const nodesDetails = await bookmarkService.getNodesByPaperSectionParagraphIds(
    paperSectionParagraphId
  );

  // Add the paperSectionParagraphId details to each note.
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

  return notesWithDetails;
};

// GET handler
async function handleGet(_: NextApiRequest, res: NextApiResponse, user: User) {
  const bookmarksWithDetails = await getBookmarksWithDetails(user.id);
  const notesWithDetails = await getNotesWithDetails(user.id);

  // Combine bookmarks and notes.
  const activity = [...bookmarksWithDetails, ...notesWithDetails];

  // Sort by createdAt.
  activity.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

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
