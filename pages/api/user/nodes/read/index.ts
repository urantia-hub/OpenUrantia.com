// Node modules.
import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import ReadNodeService from "@/services/readNode";
import getSessionDetails from "@/utils/getSessionDetails";
import { createSortId } from "@/utils/node";

const readNodeService = new ReadNodeService();

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

  // Ensure there isn't a read node for this user and globalId from the past 5 minutes.
  const readNodeExists = await readNodeService.find({
    where: {
      globalId,
      userId: user.id,
      createdAt: {
        gte: moment().subtract(5, "minutes").toDate(),
      },
    },
  });
  if (readNodeExists) {
    return res.status(200).json(readNodeExists);
  }

  // Create the read node.
  const readNode = await readNodeService.create({
    data: {
      globalId,
      paperId,
      paperSectionId,
      paperSectionParagraphId,
      userId: user.id,
    },
  });

  // Return the read node.
  res.status(200).json(readNode);
}

// GET handler
async function handleGET(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const { lastRead } = req.query;

  if (lastRead !== "true") {
    return res.status(400).json({
      message: `Missing required fields: ${!lastRead ? "lastRead " : ""}`,
    });
  }

  // Get the most recent read node first
  const latestReadNode = await readNodeService.find({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!latestReadNode) {
    return res.status(404).json({ message: "No read nodes found for user." });
  }

  // Define the time range (e.g., last 10 minutes from the latest read node)
  const timeFrameStart = moment(latestReadNode.createdAt)
    .subtract(10, "minutes")
    .toDate();

  // Get read nodes within the time range
  const readNodesInRange = await readNodeService.findMany({
    where: {
      createdAt: {
        gte: timeFrameStart,
        lte: latestReadNode.createdAt,
      },
      paperId: latestReadNode.paperId,
      userId: user.id,
    },
  });

  // Sort by globalId to find the furthest one down the page within the time range
  const lastReadNodeInRange = readNodesInRange
    .sort((a, b) =>
      createSortId(b.globalId).localeCompare(createSortId(a.globalId))
    )
    .shift();

  // Return the last read node within the time range
  res.status(200).json(lastReadNodeInRange);
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
    case "GET":
      return handleGET(req, res, sessionDetails.user);
    default:
      res.setHeader("Allow", ["POST", "GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
