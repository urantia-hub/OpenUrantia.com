// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import NodeCommentService from "@/services/nodeComment";
import getSessionDetails from "@/utils/getSessionDetails";

const nodeCommentService = new NodeCommentService();

const MAX_COMMENT_TEXT_LENGTH = 1000;

// POST handler
async function handlePOST(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const { globalId, paperId, paperSectionId, paperSectionParagraphId, text } =
    req.body;

  if (!globalId || !paperId || !text) {
    return res.status(400).json({
      message:
        `Missing required fields: ${!globalId ? "globalId " : ""}` +
        `${!paperId ? "paperId " : ""}` +
        `${!text ? "text " : ""}`,
    });
  }

  if (typeof text !== "string") {
    return res.status(400).json({
      message: `Text must be a string.`,
    });
  }

  if (text.length > MAX_COMMENT_TEXT_LENGTH) {
    return res.status(400).json({
      message: `Text is too long. Max length is ${MAX_COMMENT_TEXT_LENGTH} characters.`,
    });
  }

  const nodeComment = await nodeCommentService.create({
    data: {
      globalId,
      paperId,
      paperSectionId,
      paperSectionParagraphId,
      text,
      userId: user.id,
    },
  });

  res.status(201).json(nodeComment);
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
    case "POST":
      return handlePOST(req, res, sessionDetails.user);
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
