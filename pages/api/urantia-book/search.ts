// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";

// POST handler
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { q } = req.body;
    const url = `${process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST}/api/v1/urantia-book/search`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: "test",
        acceptOnlyFullMatches: true,
        sortByRelevance: true,
      }),
    });

    if (!response.ok) {
      const error = new Error("Network response was not ok");
      // @ts-ignore
      error.response = response;
      throw error;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Urantia.dev API error" });
  }
};

// Handler for the API endpoints.
export default async function handle(
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
