// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import getSessionDetails from "@/utils/getSessionDetails";
import UserInterestService from "@/services/userInterest";

const userInterestService = new UserInterestService();

// GET handler
async function handleGet(_: NextApiRequest, res: NextApiResponse, user: User) {}

// PUT handler
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  try {
    const { interests } = req.body;

    // Validate the interests array
    if (
      !Array.isArray(interests) ||
      !interests.every((id) => typeof id === "string")
    ) {
      return res
        .status(400)
        .json({ message: "Invalid input format for interests." });
    }

    // Remove all existing interests for the user
    await userInterestService.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Add new interests
    const newInterests = interests.map((labelId: string) => ({
      userId: user.id,
      labelId,
    }));
    await Promise.all(
      newInterests.map((interest) =>
        userInterestService.create({ data: interest })
      )
    );

    res.status(200).json({ message: "Interests updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
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
    case "GET":
      return handleGet(req, res, sessionDetails.user);
    case "PUT":
      return handlePut(req, res, sessionDetails.user);
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
