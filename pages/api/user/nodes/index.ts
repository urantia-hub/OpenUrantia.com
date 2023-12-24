// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import SavedNodeService from "@/services/savedNode";
import getSessionDetails from "@/utils/getSessionDetails";

const savedNodeService = new SavedNodeService();

// GET handler
async function handleGet(_: NextApiRequest, res: NextApiResponse, user: User) {
  // Handle fetching all saved nodes for a user.
  const savedNodes = await savedNodeService.findMany({
    where: { userId: user.id },
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

  res.status(200).json(savedNodesWithDetails);
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
