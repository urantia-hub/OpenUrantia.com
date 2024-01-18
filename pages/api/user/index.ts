// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import AccountService from "@/services/account";
import BookmarkService from "@/services/bookmark";
import NoteService from "@/services/note";
import ReadNodeService from "@/services/readNode";
import SessionService from "@/services/session";
import ShareService from "@/services/share";
import UserService from "@/services/user";
import getSessionDetails from "@/utils/getSessionDetails";

// Services.
const accountService = new AccountService();
const bookmarkService = new BookmarkService();
const noteService = new NoteService();
const readNodeService = new ReadNodeService();
const sessionService = new SessionService();
const shareService = new ShareService();
const userService = new UserService();

// GET handler
const handleGet = async (
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) => {
  res.status(200).json(user);
};

const handlePut = async (
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) => {
  const { emailNotificationsEnabled } = req.body;

  // Update the user's notification settings
  const updatedUser = await userService.update(user.id, {
    emailNotificationsEnabled,
  });

  res.status(200).json(updatedUser);
};

const handleDelete = async (
  _: NextApiRequest,
  res: NextApiResponse,
  user: User
) => {
  // Delete a user's account, bookmarks, notes, readNodes, sessions, and shares.
  await accountService.deleteMany({ where: { userId: user.id } });
  await bookmarkService.deleteMany({ where: { userId: user.id } });
  await noteService.deleteMany({ where: { userId: user.id } });
  await readNodeService.deleteMany({ where: { userId: user.id } });
  await sessionService.deleteMany({ where: { userId: user.id } });
  await shareService.deleteMany({ where: { userId: user.id } });
  await userService.delete({ where: { id: user.id } });

  res.status(204).end();
};

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
    case "PUT":
      return handlePut(req, res, sessionDetails.user);
    case "DELETE":
      return handleDelete(req, res, sessionDetails.user);
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
