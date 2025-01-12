// Node modules.
import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import ReadNodeService from "@/services/readNode";
import getSessionDetails from "@/utils/getSessionDetails";
import { withSentry } from "@/middleware/sentry";

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
        gte: moment.utc().subtract(5, "minutes").toISOString(),
      },
    },
  });
  if (readNodeExists) {
    return res.status(200).json(readNodeExists);
  }

  // Create the read node.
  const readNode = await readNodeService.create({
    data: {
      createdAt: moment.utc().toISOString(),
      globalId,
      paperId,
      paperSectionId,
      paperSectionParagraphId,
      updatedAt: moment.utc().toISOString(),
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
  const { paperId } = req.query;

  if (paperId && typeof paperId !== "string") {
    return res.status(400).json({
      message: `Invalid paperId, must be a string: ${paperId}`,
    });
  }

  // Get the read nodes.
  const readNodes = await readNodeService.findMany({
    where: {
      userId: user.id,
      paperId: `${paperId}`,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Return the read nodes.
  res.status(200).json(readNodes);
}

// Handler for the API endpoints.
async function handle(req: NextApiRequest, res: NextApiResponse) {
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

export default withSentry(handle);
