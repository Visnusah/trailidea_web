import { generateContent } from "@/lib/api/ai/gemini";



const systemInstruction = "You are a friendly, witty agent. Explain complex topics using simple analogies and keep responses under two paragraphs."
const contents = "Context: Respond to the user query in a concise and informative manner."

export async function handleGenerateContent(prompt: string): Promise<any> {
    try {
        const response = await generateContent(systemInstruction, contents, prompt);

        if (response.candidates && response.candidates.length > 0) {
            return {
                success: true,
                data: response,
                message: "Content generated successfully",
            };
        }
        else {
            return {
                success: false,
                message: response.message || "Failed to generate content",
            }
        }
    } catch (error) {
        return {
            success: false,
            error: true,
            message: error instanceof Error ? error.message : "An unknown error occurred",
        }
    }

}