import { Request, Response } from "express";
import { ApiResponseHelper } from "../utils/apihelper.util";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const MODEL_FAST = "deepseek-chat";      // fast & cheap — for suggestions
const MODEL_PRO  = "deepseek-chat";      // same endpoint; deepseek-reasoner for chain-of-thought

async function callDeepSeek(
  messages: { role: string; content: string }[],
  model = MODEL_FAST
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured in backend/.env");
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[DeepSeek] ${response.status}:`, errText);
    throw new Error(`DeepSeek API error ${response.status}: ${errText}`);
  }

  const json = (await response.json()) as any;
  const content = json?.choices?.[0]?.message?.content ?? "";
  console.log(`[DeepSeek] model=${model} tokens=${json?.usage?.total_tokens}`);
  return content;
}

export class AIController {
  /**
   * POST /api/v1/ai/suggest-post
   * Returns 3 AI-generated description suggestions for a trail post draft.
   */
  async suggestPost(req: Request, res: Response) {
    try {
      const { title, description } = req.body;

      if (!title) {
        return ApiResponseHelper.error(res, "title is required", 400);
      }

      const prompt = `You are a creative writer for a hiking and trail community app called TrailIdea.

A user is writing a trail post with the following details:
- Title: "${title}"
- Current description: "${description || "(empty)"}"

Generate exactly 3 compelling, friendly, and vivid trail-experience descriptions. Each should be 2–4 sentences long. 
Make them unique from each other. Focus on nature, adventure, experience, and tips.

RESPOND ONLY with a JSON array of 3 strings, no extra text:
["suggestion1", "suggestion2", "suggestion3"]`;

      const raw = await callDeepSeek([{ role: "user", content: prompt }]);

      let suggestions: string[] = [];
      try {
        const match = raw.match(/\[[\s\S]*\]/);
        suggestions = match ? JSON.parse(match[0]) : [];
      } catch {
        suggestions = [raw.trim()];
      }

      return ApiResponseHelper.success(res, suggestions.slice(0, 3), "Suggestions generated");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Failed to generate suggestions", 500);
    }
  }

  /**
   * POST /api/v1/ai/suggest-comment
   * Returns 3 short (2–4 word) comment quick-reply suggestions for a post.
   */
  async suggestComment(req: Request, res: Response) {
    try {
      const { postTitle } = req.body;

      const prompt = `You are helping users quickly reply to a hiking/trail post titled: "${postTitle || "Trail Post"}".

Generate exactly 3 short comment suggestions. Each should be 2–4 words only, like quick reactions.
Examples: "Amazing trail!", "Love this!", "So beautiful!", "Great adventure!", "Must visit!"

RESPOND ONLY with a JSON array of 3 short strings:
["chip1", "chip2", "chip3"]`;

      const raw = await callDeepSeek([{ role: "user", content: prompt }]);

      let chips: string[] = [];
      try {
        const match = raw.match(/\[[\s\S]*\]/);
        chips = match ? JSON.parse(match[0]) : [];
      } catch {
        chips = ["Amazing trail!", "Love this!", "Great adventure!"];
      }

      return ApiResponseHelper.success(res, chips.slice(0, 3), "Comment chips generated");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Failed to generate comment chips", 500);
    }
  }

  /**
   * POST /api/v1/ai/chat
   * TrailIdea AI chatbot — scoped to hiking, trekking, travel, routes, and budgets.
   */
  async chat(req: Request, res: Response) {
    try {
      const { messages } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return ApiResponseHelper.error(res, "messages array is required", 400);
      }

      const systemMessage = {
        role: "system",
        content: `You are TrailIdea AI — a friendly, knowledgeable AI assistant for the TrailIdea hiking and trekking community.

You ONLY discuss topics related to:
- Hiking, trekking, and trail experiences
- Trail routes, difficulty ratings, and maps
- Travel planning for trekking destinations (Nepal, Himalayas, Alps, Andes, etc.)
- Budget planning for hikes and treks
- Gear recommendations (boots, backpacks, tents, etc.)
- Safety tips, weather, permits, and logistics
- Camping, altitude sickness, and first aid on trails
- Local culture at trekking destinations

If a user asks about anything UNRELATED to hiking, trekking, or trail travel, politely decline and redirect them:
"I'm TrailIdea AI and I specialize in hiking and trekking topics! I'd be happy to help you plan a trek, find a trail, or answer gear questions instead."

Be friendly, encouraging, and concise. Use bullet points for lists. Provide practical, actionable advice.`,
      };

      const allMessages = [
        systemMessage,
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const reply = await callDeepSeek(allMessages, MODEL_PRO);

      return ApiResponseHelper.success(res, { reply }, "Chat response generated");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Failed to generate chat response", 500);
    }
  }
}
