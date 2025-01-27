// Node modules.
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import ReadNodeService from "@/services/readNode";
import UserService from "@/services/user";
import getSessionDetails from "@/utils/getSessionDetails";
import { withSentry } from "@/middleware/sentry";

const readNodeService = new ReadNodeService();
const userService = new UserService();

// GET handler
async function handleGET(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const { paperId } = req.query;

  if (paperId && typeof paperId !== "string") {
    return res.status(400).json({
      message: "Expected paperId to be a string.",
    });
  }

  const nodes = await readNodeService.findMany({
    where: {
      paperId,
      userId: user.id,
    },
  });
  const paperIds = Array.from(new Set(nodes.map((node) => node.paperId)));

  if (!paperIds.length) {
    return res.status(200).json({ data: [] });
  }

  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST}/api/v1/urantia-book/progress`,
      {
        paperIds,
        readGlobalIds: nodes.map((node) => node.globalId),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to fetch progress from Urantia.dev.",
    });
  }
}

// DELETE handler
async function handleDELETE(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  await userService.update(user.id, {
    lastAskedNotificationsAt: null,
    lastVisitedAt: null,
    lastVisitedGlobalId: null,
    lastVisitedPaperId: null,
    lastVisitedPaperTitle: null,
  });

  await readNodeService.deleteMany({
    where: {
      userId: user.id,
    },
  });

  res.status(204).end();
}

// Handler for the API endpoints.
async function handle(req: NextApiRequest, res: NextApiResponse) {
  const sessionDetails = await getSessionDetails(req, res);
  if (!sessionDetails) return;

  const { method } = req;
  switch (method) {
    case "GET":
      return handleGET(req, res, sessionDetails.user);
    case "DELETE":
      return handleDELETE(req, res, sessionDetails.user);
    default:
      res.setHeader("Allow", ["GET", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withSentry(handle);
