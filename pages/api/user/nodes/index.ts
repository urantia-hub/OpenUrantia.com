// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
// Relative modules.
import SavedNodeService from "@/services/savedNode";
import UserService from "@/services/user";
import { User } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const savedNodeService = new SavedNodeService();
const userService = new UserService();

// Handler for the API endpoints.
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Retrieve the user ID from the database
  const user = await userService.find({
    where: { email: session?.user?.email },
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { method } = req;
  switch (method) {
    case "GET":
      return handleGet(req, res, user);
    case "POST":
      return handlePost(req, res, user);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// GET handler
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  const savedNodes = await savedNodeService.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(savedNodes);
}

// POST handler
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  // Handle saving a new node
  const { globalId, paperId, paperSectionId, paperSectionParagraphId } =
    req.body;

  if (!globalId || !paperId) {
    return res.status(400).json({
      message:
        `Missing required fields: ${!globalId ? "globalId " : ""}` +
        `${!paperId ? "paperId " : ""}`,
    });
  }

  const savedNode = await savedNodeService.create({
    data: {
      globalId,
      paperId,
      paperSectionId,
      paperSectionParagraphId,
      userId: user.id,
    },
  });
  res.status(201).json(savedNode);
}
