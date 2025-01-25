// Node modules.
import type { NextApiRequest, NextApiResponse } from "next";
// Relative modules.
import UserService from "@/services/user";
import getSessionDetails from "@/utils/getSessionDetails";
import { withSentry } from "@/middleware/sentry";

const userService = new UserService();

async function handle(req: NextApiRequest, res: NextApiResponse) {
  const sessionDetails = await getSessionDetails(req, res, {
    skipUnauthorized: true,
  });
  if (!sessionDetails) {
    res.redirect(302, `${process.env.NEXT_PUBLIC_HOST}?unsubscribed=false`);
    return;
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    // Update the user's notification settings
    await userService.update(sessionDetails.user.id, {
      emailNotificationsEnabled: false,
      emailDailyQuoteEnabled: false,
      emailContinueReadingEnabled: false,
      emailChangelogEnabled: false,
    });

    // Redirect to the homepage with a success message
    res.redirect(302, `${process.env.NEXT_PUBLIC_HOST}?unsubscribed=true`);
  } catch (error) {
    console.error("Failed to unsubscribe user:", error);
    res.redirect(302, `${process.env.NEXT_PUBLIC_HOST}?unsubscribed=false`);
  }
}

export default withSentry(handle);
