// pages/api/chat/index.ts
import { CoreMessage, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages }: { messages: CoreMessage[] } = req.body;

    const response = await generateText({
      model: openai("o1-preview"),
      system: `You are an expert at explaining the Urantia Papers, focusing on theological, philosophical, and cosmological concepts. Break down complex ideas while maintaining accuracy. Reference related concepts from other papers only when you have direct context.`,
      messages,
    });

    return res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
