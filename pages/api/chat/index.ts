// pages/api/chat/index.ts
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { NextApiRequest, NextApiResponse } from "next";

import AIExplanationService from "@/services/aiExplanation";
import PaperService from "@/services/paper";

const AI_MODEL = "o1-mini";

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
  res: NextApiResponse
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

    let response;
    try {
      console.log(
        `Generating explanation for ${globalId} with system prompt:\n\n${systemPrompt}\n\nAnd with messages:\n\n${JSON.stringify(
          messages
        )}`
      );
      const combinedPrompt = `Instructions:\n${systemPrompt}\n\nUser Message:\n${messages[0].content}`;
      response = await generateText({
        model: openai(AI_MODEL),
        prompt: combinedPrompt,
      });
    } catch (error) {
      console.error("Error generating text:", error);
      return res.status(500).json({ error: "Unable to generate explanation" });
    }

    // Cache the explanation
    try {
      await aiExplanationService.create({
        data: {
          globalId,
          paperId,
          text: response.text,
          prompt: messages[0].content,
        },
      });
    } catch (error) {
      console.error("Error caching explanation:", error);
    }

    return res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
