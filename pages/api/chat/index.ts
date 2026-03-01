// pages/api/chat/index.ts
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { NextApiRequest, NextApiResponse } from "next";

import AIExplanationService from "@/services/aiExplanation";
import PaperService from "@/services/paper";

const AI_MODEL = process.env.AI_MODEL || "claude-haiku-4-5-20251001";
const SUPPORTED_XAI_MODELS = ["grok-beta"];
const SUPPORTED_ANTHROPIC_MODELS = [
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-6",
  "claude-opus-4-6",
];

const aiExplanationService = new AIExplanationService();
const paperService = new PaperService();

const generatePaperContext = async (paperId: string) => {
  if (paperId) {
    const paper = await paperService.find({ where: { id: paperId } });
    return `Paper ${paper?.id}: ${paper?.title}`;
  }

  // Get all paper titles for context
  const papers = await paperService.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return papers
    .map((paper, index) => `Paper ${index}: ${paper.title}`)
    .join("\n");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages, globalId, paperId } = req.body;

    // Check if we have a cached explanation
    const existingExplanation = await aiExplanationService.find({
      where: { globalId },
    });

    if (existingExplanation) {
      return res.status(200).json({ text: existingExplanation.text });
    }

    // Get paper context
    const paperContext = await generatePaperContext(paperId);

    // Enhanced system prompt
    const systemPrompt = `You are an expert at explaining the Urantia Papers in a clear, concise manner. Your goal is to:

1. Break down complex theological, philosophical, and cosmological concepts into easily digestible explanations
2. Keep explanations concise and structured (400 words max)
3. Use simple language while maintaining accuracy
4. Structure the response in markdown format like this:

**Main Concept:**
[One sentence summary of the key idea (35 words max)]

**Simplified Explanation:**
[Break down the concept using everyday analogies when possible (115 words max)]

**Detailed Explanation:**
[Provide a detailed explanation of the concept from first principles (150 words max)]

**Reflection:**
[Ask a deeper spiritual or philosophical question that explores the implications of the concept or text, if applicable.]
[Ask a thought-provoking question that you as the reader wish you could ask the author of the paper]

Important guidelines:
- Focus on making abstract concepts concrete through clear examples
- Explain theological terms in plain language
- When discussing cosmic concepts, start from the familiar and build to the universal
- Maintain the spiritual significance while simplifying the language

Context - You are explaining a passage from:
${paperContext}`;

    // Combine system prompt and user message
    const combinedPrompt = `Instructions:\n${systemPrompt}\n\nUser Message:\n${messages[0].content}`;

    let text;
    try {
      console.log(
        `Generating explanation for ${globalId} with model ${AI_MODEL} and with system prompt:\n\n${systemPrompt}\n\nAnd with messages:\n\n${JSON.stringify(
          messages,
        )}`,
      );
      if (SUPPORTED_ANTHROPIC_MODELS.includes(AI_MODEL)) {
        const response = await generateText({
          model: anthropic(AI_MODEL),
          prompt: combinedPrompt,
        });
        text = response.text;
      } else if (SUPPORTED_XAI_MODELS.includes(AI_MODEL)) {
        // Make a request to xAI
        const rawResponse = await fetch(
          "https://api.x.ai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.XAI_API_KEY}`,
            },
            body: JSON.stringify({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: messages[0].content },
              ],
              model: AI_MODEL,
              stream: false,
              temperature: 0,
            }),
          },
        );
        const jsonResponse = await rawResponse.json();
        console.log("xAI response:", jsonResponse.choices[0].message);
        text = jsonResponse.choices[0].message.content;
      } else {
        const response = await generateText({
          model: openai(AI_MODEL),
          prompt: combinedPrompt,
        });
        text = response.text;
      }
    } catch (error) {
      console.error("Error generating text:", error);
      return res.status(500).json({ error: "Unable to generate explanation" });
    }

    // Cache the explanation
    try {
      await aiExplanationService.create({
        data: {
          aiModel: AI_MODEL || "unknown",
          globalId,
          paperId,
          text,
          prompt: messages[0].content,
        },
      });
    } catch (error) {
      console.error("Error caching explanation:", error);
    }

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
