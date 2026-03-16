import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import * as Sentry from "@sentry/nextjs";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

export function withSentry(
  handler: (req: NextApiRequest, res: NextApiResponse) => unknown
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get the session from NextAuth
      const session = await getServerSession(req, res, authOptions);

      // Set the user in Sentry if the session is authenticated and in production
      if (session?.user && process.env.NODE_ENV !== "development") {
        Sentry.setUser(session.user as Sentry.User);
      }

      // Call the handler
      return await handler(req, res);
    } catch (error) {
      // Capture any errors and throw them
      if (process.env.NODE_ENV !== "development") {
        Sentry.captureException(error, {
          extra: {
            where: `Server-side error captured with withSentry middleware: ${req.url}`,
          },
        });
      }
      throw error;
    }
  };
}
