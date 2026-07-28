import axiosInstance from "./axios-instance";

/** POST /api/v1/ai/suggest-post — Get 3 AI description suggestions for a post */
export const suggestPostDescription = async (
  title: string,
  description: string
): Promise<string[]> => {
  try {
    const response = await axiosInstance.post("/api/v1/ai/suggest-post", {
      title,
      description,
    });
    return response.data?.data ?? [];
  } catch {
    return [];
  }
};

/** POST /api/v1/ai/suggest-comment — Get 2–3 short AI quick-reply chips for a comment */
export const suggestComment = async (postTitle: string): Promise<string[]> => {
  try {
    const response = await axiosInstance.post("/api/v1/ai/suggest-comment", {
      postTitle,
    });
    return response.data?.data ?? [];
  } catch {
    return [];
  }
};

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/** POST /api/v1/ai/chat — Chat with TrailIdea AI assistant */
export const chatWithAI = async (messages: ChatMessage[]): Promise<string> => {
  try {
    const response = await axiosInstance.post("/api/v1/ai/chat", { messages });
    return response.data?.data?.reply ?? "Sorry, I could not process your request.";
  } catch {
    return "Sorry, the AI assistant is currently unavailable. Please try again later.";
  }
};
