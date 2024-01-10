// Node modules.
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import ReadNodeService from "@/services/readNode";
import getSessionDetails from "@/utils/getSessionDetails";

const readNodeService = new ReadNodeService();

// POST handler
async function handlePOST(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const { paperId } = req.body;

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
