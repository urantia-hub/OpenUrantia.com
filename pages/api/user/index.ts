// Import necessary modules and services
import type { NextApiRequest, NextApiResponse } from "next";
import UserService from "@/services/user";

const userService = new UserService();

// Handler for GET and PUT requests
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Identify the logged-in user, e.g., via session token
    const userId = ""; // Replace with actual logic to identify user

    // Handle GET request - Fetch user data
    if (req.method === "GET") {
      const userData = await userService.find({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      });
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(userData);
    }

    // Handle PUT request - Update user data
    if (req.method === "PUT") {
      const { name, email } = req.body;

      // Validate input data as necessary

      const updatedUserData = await userService.update(userId, {
        name,
        email,
      });
      return res.status(200).json(updatedUserData);
    }

    // Handle other methods
    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    // Error handling
    res.status(500).json({ message: error.message });
  }
};

export default handler;
