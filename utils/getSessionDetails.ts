// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth/next";
// Relative modules.
import UserService from "@/services/user";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const userService = new UserService();

const getSessionDetails = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ session: any; user: User } | undefined> => {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // Retrieve the user ID from the database
  const user = await userService.find({
    where: { email: session?.user?.email },
    include: {
      userInterests: {
        include: {
          label: {
            include: {
              papers: true,
            },
          },
        },
      },
    },
  });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  return { session, user };
};

export default getSessionDetails;
