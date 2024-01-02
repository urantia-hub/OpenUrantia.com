// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import UserService from "@/services/user";
import getSessionDetails from "@/utils/getSessionDetails";

const userService = new UserService();

// PUT handler
async function handlePUT(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const { globalId, paperId, paperTitle } = req.body;

  if (!globalId || !paperId || !paperTitle) {
    return res.status(400).json({
      message:
        `Missing required fields: ${!globalId ? "globalId " : ""}` +
        `${!paperId ? "paperId " : ""}` +
        `${!paperTitle ? "paperTitle " : ""}`,
    });
  }

  const updatedUser = await userService.update(user.id, {
    lastVisitedGlobalId: globalId,
    lastVisitedPaperId: paperId,
    lastVisitedPaperTitle: paperTitle,
  });

  res.status(200).json({
    globalId: updatedUser.lastVisitedGlobalId,
    paperId: updatedUser.lastVisitedPaperId,
    paperTitle: updatedUser.lastVisitedPaperTitle,
  });
}

// GET handler
async function handleGET(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const { lastVisitedGlobalId, lastVisitedPaperId, lastVisitedPaperTitle } =
    user;

  if (!lastVisitedGlobalId || !lastVisitedPaperId || !lastVisitedPaperTitle) {
    return res.status(200).json(null);
  }

  res.status(200).json({
    globalId: lastVisitedGlobalId,
    paperId: lastVisitedPaperId,
    paperTitle: user.lastVisitedPaperTitle,
  });
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
    case "PUT":
      return handlePUT(req, res, sessionDetails.user);
    case "GET":
      return handleGET(req, res, sessionDetails.user);
    default:
      res.setHeader("Allow", ["PUT", "GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
