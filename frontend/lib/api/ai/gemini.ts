
import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const aiApiClient = axios.create({
    baseURL: "https://generativelanguage.googleapis.com",
    headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": API_KEY
    },
});

export const generateContent = async (systemInstruction: string, userContext: string, userQuery: string) => {
    try {
        const response = await aiApiClient.post("/v1beta/models/gemini-2.5-flash-lite:generateContent", {
            systemInstruction: {
                parts: [
                    {
                        text: systemInstruction
                    }
                ]
            },
            contents: [
                {
                    parts: [
                        { text: userContext },
                        { text: userQuery }
                    ]
                }
            ]
        });
        return response.data;
    } catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
};
