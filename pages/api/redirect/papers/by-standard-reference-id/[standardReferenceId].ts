// Node modules.
import { getGlobalIdFromStandardReferenceId } from "@/utils/node";
import type { NextApiRequest, NextApiResponse } from "next";

const PERMANENT_REDIRECT = 301;
const TEMPORARY_REDIRECT = 307;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { standardReferenceId } = req.query;

  // 404 if standardReferenceId is not provided.
  if (!standardReferenceId || typeof standardReferenceId !== "string") {
    res.status(404).end("standardReferenceId (string) is required");
    return;
  }

  // Derive the paperId.
  const [paperId] = standardReferenceId.split(":");

  // 404 if paperId is not a number or is not in the range [1, 196].
  if (
    Number.isNaN(Number(paperId)) ||
    Number(paperId) < 0 ||
    Number(paperId) > 196
  ) {
    res
      .status(404)
      .end(
        `Invalid paperId (${paperId}) in standardReferenceId (${standardReferenceId})`
      );
    return;
  }

  // Derive the globalId.
  const globalId = getGlobalIdFromStandardReferenceId(standardReferenceId);

  // Redirect to the paper page.
  if (globalId) {
    res.redirect(PERMANENT_REDIRECT, `/papers/${paperId}#${globalId}`);
  } else {
    res.redirect(PERMANENT_REDIRECT, `/papers/${paperId}`);
  }
}
