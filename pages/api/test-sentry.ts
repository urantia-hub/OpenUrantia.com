import { NextApiRequest, NextApiResponse } from "next";
import { withSentry } from "@/middleware/sentry";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.error === "sync") {
    throw new Error("Test Sync Error");
  }

  if (req.query.error === "async") {
    await new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Test Async Error")), 100);
    });
  }

  if (req.query.error === "custom") {
    const error = new Error("Test Custom Error");
    error.name = "CustomError";
    throw error;
  }

  res.status(200).json({ message: "No error" });
}

export default withSentry(handler);
