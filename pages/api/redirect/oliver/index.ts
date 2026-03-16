// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { withSentry } from "@/middleware/sentry";

const PERMANENT_REDIRECT = 301;
const TEMPORARY_REDIRECT = 307;

function handler(req: NextApiRequest, res: NextApiResponse) {
  // Redirect to the main website for now.
  res.redirect(
    TEMPORARY_REDIRECT,
    "https://www.urantiahub.com/papers/paper-117-god-the-supreme#3:117.6.21"
  );
}

export default withSentry(handler);
