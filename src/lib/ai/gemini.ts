import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAiUsage, incrementAiUsage } from "@/lib/firebase/firestore";
import { getToday } from "@/lib/utils/date";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });



export class AiLimitReachedError extends Error {
  constructor() {
    super("Daily AI limit reached (5/5). Try again tomorrow.");
    this.name = "AiLimitReachedError";
  }
}

/**
 * Rate-limited AI content generation.
 * Checks Firestore usage count before calling Gemini.
 * Throws AiLimitReachedError if daily limit (5) is exceeded.
 */
export async function generateContent(
  prompt: string,
  userId?: string
): Promise<string> {
  const today = getToday();

  // Check limit if userId is provided
  if (userId) {
    const { count, limit } = await getAiUsage(userId, today);
    if (count >= limit) {
      throw new AiLimitReachedError();
    }
  }

  try {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();

    // Increment usage on success
    if (userId) {
      await incrementAiUsage(userId, today);
    }

    return text;
  } catch (error) {
    if (error instanceof AiLimitReachedError) throw error;
    console.error("Gemini API error:", error);
    throw error;
  }
}

/**
 * Get remaining AI calls for today.
 */
export async function getRemainingAiCalls(userId: string): Promise<number> {
  const today = getToday();
  const { count, limit } = await getAiUsage(userId, today);
  return Math.max(0, limit - count);
}
