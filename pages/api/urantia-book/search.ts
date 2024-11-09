// Node modules.
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

// POST handler
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { q } = req.body;
    const url = `${process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST}/api/v1/urantia-book/search`;

    const response = await axios.post(
      url,
      {
        acceptOnlyFullMatches: true,
        q,
        sortByRelevance: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Ensure results are unique by globalId.
    const filteredResults = response.data.data.results.filter(
      (result: { globalId: string }, index: number, self: any) =>
        index ===
        self.findIndex(
          (node: { globalId: string }) => node.globalId === result.globalId
        )
    );
    response.data.data.results = filteredResults;

    // Return the data to the client
    res.status(200).json(response.data);
  } catch (error) {
    // Axios wraps the original error in an 'AxiosError' object
    if (axios.isAxiosError(error)) {
      // Optionally handle Axios-specific errors here
      res
        .status(500)
        .json({ error: "Error with Axios request", errorDetails: error });
    } else {
      // Handle non-Axios errors
      res.status(500).json({ error: "Urantia.dev API error" });
    }
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
