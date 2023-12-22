// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
// Relative modules.
import getSessionDetails from "@/utils/getSessionDetails";
import UserService from "@/services/user";

const userService = new UserService();

// GET handler
const handleGet = async (
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) => {
  res.status(200).json(user);
};

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
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
