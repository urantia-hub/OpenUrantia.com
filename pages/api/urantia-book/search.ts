import type { NextApiRequest, NextApiResponse } from "next";
import { searchParagraphs } from "@/libs/urantiaApi/client";
import { withSentry } from "@/middleware/sentry";

// POST handler
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { q } = req.body;
    const result = await searchParagraphs(q);

    // Return the data to the client (same wrapper shape as before)
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
};

// Handler for the API endpoints.
async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case "POST":
      return handlePOST(req, res);
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withSentry(handle);
