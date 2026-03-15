// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import ReadNodeService from "@/services/readNode";
import UserService from "@/services/user";
import getSessionDetails from "@/utils/getSessionDetails";
import { withSentry } from "@/middleware/sentry";
import { getPaperParagraphCounts } from "@/libs/urantiaApi/paperCounts";

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
    // Get paragraph counts for each paper from the API (cached)
    const paperCounts = await getPaperParagraphCounts();

    // Count read nodes per paper
    const readCountsByPaper = new Map<string, Set<string>>();
    for (const node of nodes) {
      if (!readCountsByPaper.has(node.paperId)) {
        readCountsByPaper.set(node.paperId, new Set());
      }
      readCountsByPaper.get(node.paperId)!.add(node.globalId);
    }

    // Calculate progress for each paper
    const progressData: ProgressResult[] = paperIds.map((pid) => {
      const totalParagraphs = paperCounts.get(pid) ?? 0;
      const readCount = readCountsByPaper.get(pid)?.size ?? 0;
      const progress =
        totalParagraphs > 0
          ? Math.round((readCount / totalParagraphs) * 100)
          : 0;

      return {
        paperId: pid,
        paperTitle: "", // Will be populated by the frontend from TOC data
        progress: Math.min(progress, 100),
      };
    });

    res.status(200).json({ data: progressData });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to calculate progress.",
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
