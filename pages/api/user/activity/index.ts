// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import NodeCommentService from "@/services/nodeComment";
import SavedNodeService from "@/services/savedNode";
import getSessionDetails from "@/utils/getSessionDetails";

const nodeCommentService = new NodeCommentService();
const savedNodeService = new SavedNodeService();

const getSavedNodesWithDetails = async (userId: string) => {
  // Handle fetching all saved nodes for a user.
  const savedNodes = await savedNodeService.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Fetch the paperSectionParagraphId details for each saved node.
  const paperSectionParagraphId = savedNodes.map(
    (savedNode) => savedNode.paperSectionParagraphId
  );
  const nodesDetails =
    await savedNodeService.getNodesByPaperSectionParagraphIds(
      paperSectionParagraphId
    );

  // Add the paperSectionParagraphId details to each saved node.
  const savedNodesWithDetails = savedNodes.map((savedNode) => {
    const nodeDetail = nodesDetails.find(
      (nodeDetail: UBNode) =>
        nodeDetail.paperSectionParagraphId === savedNode.paperSectionParagraphId
    );
    return {
      ...savedNode,
      ...nodeDetail,
      type: "savedNode",
    };
  });

  return savedNodesWithDetails;
};

const getNodeCommentsWithDetails = async (userId: string) => {
  // Handle fetching all node comments for a user.
  const nodeComments = await nodeCommentService.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Fetch the paperSectionParagraphId details for each node comment.
  const paperSectionParagraphId = nodeComments.map(
    (nodeComment) => nodeComment.paperSectionParagraphId
  );
  const nodesDetails =
    await savedNodeService.getNodesByPaperSectionParagraphIds(
      paperSectionParagraphId
    );

  // Add the paperSectionParagraphId details to each node comment.
  const nodeCommentsWithDetails = nodeComments.map((nodeComment) => {
    const nodeDetail = nodesDetails.find(
      (nodeDetail: UBNode) =>
        nodeDetail.paperSectionParagraphId ===
        nodeComment.paperSectionParagraphId
    );
    return {
      ...nodeComment,
      ...nodeDetail,
      commentText: nodeComment.text,
      type: "nodeComment",
    };
  });

  return nodeCommentsWithDetails;
};

// GET handler
async function handleGet(_: NextApiRequest, res: NextApiResponse, user: User) {
  const savedNodesWithDetails = await getSavedNodesWithDetails(user.id);
  const nodeCommentsWithDetails = await getNodeCommentsWithDetails(user.id);

  // Combine saved nodes and node comments.
  const activity = [...savedNodesWithDetails, ...nodeCommentsWithDetails];

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

  const savedNode = await savedNodeService.create({
    data: {
      globalId,
      paperId,
      paperSectionId,
      paperSectionParagraphId,
      userId: user.id,
    },
  });
  res.status(201).json(savedNode);
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
