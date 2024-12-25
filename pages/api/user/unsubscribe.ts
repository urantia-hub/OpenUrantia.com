// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
// Relative modules.
import UserService from "@/services/user";
import getSessionDetails from "@/utils/getSessionDetails";

const userService = new UserService();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sessionDetails = await getSessionDetails(req, res, {
    skipUnauthorized: true,
  });
  if (!sessionDetails) {
    return res.redirect(
      302,
      `${process.env.NEXT_PUBLIC_HOST}?unsubscribed=false`
    );
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Update the user's notification settings
    await userService.update(sessionDetails.user.id, {
      emailNotificationsEnabled: false,
    });

    // Redirect to the homepage with a success message
    res.redirect(302, `${process.env.NEXT_PUBLIC_HOST}?unsubscribed=true`);
  } catch (error) {
    console.error("Failed to unsubscribe user:", error);
    res.redirect(302, `${process.env.NEXT_PUBLIC_HOST}?unsubscribed=false`);
  }
}
