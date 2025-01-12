// Node modules.
import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import ReadNodeService from "@/services/readNode";
import getSessionDetails from "@/utils/getSessionDetails";
import { createSortId } from "@/utils/node";
import { withSentry } from "@/middleware/sentry";

const readNodeService = new ReadNodeService();

// GET handler
async function handleGET(_: NextApiRequest, res: NextApiResponse, user: User) {
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
    .toISOString();

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
async function handle(req: NextApiRequest, res: NextApiResponse) {
  const sessionDetails = await getSessionDetails(req, res);
  if (!sessionDetails) return;

  const { method } = req;
  switch (method) {
    case "GET":
      return handleGET(req, res, sessionDetails.user);
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withSentry(handle);
