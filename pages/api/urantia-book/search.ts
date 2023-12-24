// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";

// GET handler
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { q } = req.query;
    const url = `${process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST}/api/v1/urantia-book/search`;
    console.log("Making request to Urantia.dev API:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q,
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
    console.error(
      "Error fetching /api/v1/urantia-book/search endpoint from Urantia.dev:",
      error
    );
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
    case "GET":
      return handleGET(req, res);
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
