// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import getSessionDetails from "@/utils/getSessionDetails";

const TEMPORARY_REDIRECT = 307;

const redirectToPaper = (
  res: NextApiResponse,
  paperId?: string | null,
  globalId?: string | null
) => {
  // Default to the first paper.
  if (!paperId && !globalId) {
    return res.redirect(TEMPORARY_REDIRECT, "/papers/0");
  }

  // If only 1 of the 2 is provided, 400.
  if ((paperId && !globalId) || (!paperId && globalId)) {
    return res
      .status(400)
      .end(`Invalid query parameters, must provide both paperId and globalId`);
  }

  // Redirect to the paper.
  return res.redirect(TEMPORARY_REDIRECT, `/papers/${paperId}#${globalId}`);
};

// Handle GET method.
const handleGet = async (
  req: NextApiRequest,
  res: NextApiResponse,
  user?: User
) => {
  // If unauthorized, use req.query if provided (e.g. they stored last visited node in localStorage).
  if (!user?.lastVisitedGlobalId) {
    return redirectToPaper(
      res,
      req.query.paperId as string,
      req.query.globalId as string
    );
  }

  // If authorized, derive the last visited node from the User.
  return redirectToPaper(
    res,
    user.lastVisitedPaperId,
    user.lastVisitedGlobalId
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sessionDetails = await getSessionDetails(req, res, {
    skipUnauthorized: true,
  });

  const { method } = req;
  switch (method) {
    case "GET":
      return handleGet(req, res, sessionDetails?.user);
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
