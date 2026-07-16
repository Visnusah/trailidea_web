"use client";
import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
    type KeyboardEvent,
} from "react";
import { handleGenerateContent } from "@/lib/actions/ai/gemini-action";

type ChatMessage = {
    id: number;
    role: "user" | "assistant";
    content: string;
};

const starterMessages: ChatMessage[] = [
    {
        id: 1,
        role: "assistant",
        content: "Ask me anything.",
    },
];

const formatMessage = (value: unknown) => {
    if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
    }

    return "No content generated.";
};

export default function Page() {
    const [prompt, setPrompt] = useState("");
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(starterMessages);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isSending]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt || isSending) {
            return;
        }

        setPrompt("");
        setIsSending(true);
        setChatHistory((previousHistory) => [
            ...previousHistory,
            {
                id: Date.now(),
                role: "user",
                content: trimmedPrompt,
            },
        ]);

        try {
            const result = await handleGenerateContent(trimmedPrompt);
            const resultData = formatMessage(
                result.data?.candidates?.[0]?.content?.parts?.[0]?.text,
            );

            setChatHistory((previousHistory) => [
                ...previousHistory,
                {
                    id: Date.now() + 1,
                    role: "assistant",
                    content: result.success ? resultData : result.message || "Something went wrong.",
                },
            ]);
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";

            setChatHistory((previousHistory) => [
                ...previousHistory,
                {
                    id: Date.now() + 1,
                    role: "assistant",
                    content: message,
                },
            ]);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
        }
    };

    return (
        <main className="bg-canvas text-body" style={{ display: "flex", height: "100vh", flexDirection: "column" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "32px 16px" }}>
                <div className="mx-auto max-w-3xl" style={{ display: "flex", flexDirection: "column", gap: "32px", paddingBottom: "16px" }}>
                    {chatHistory.map((message) => (
                        <div key={message.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span className="text-sm text-body-strong" style={{ fontWeight: 600 }}>
                                {message.role === "user" ? "You" : "Gemini"}
                            </span>
                            <div className="whitespace-pre-wrap text-body" style={{ fontSize: "16px", lineHeight: "1.6" }}>
                                {message.content}
                            </div>
                        </div>
                    ))}
                    {isSending && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", opacity: 0.7 }}>
                            <span className="text-sm text-body-strong" style={{ fontWeight: 600 }}>Gemini</span>
                            <div className="text-muted" style={{ fontSize: "16px", lineHeight: "1.6" }}>Thinking...</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="mx-auto w-full max-w-3xl" style={{ padding: "16px" }}>
                <form onSubmit={handleSubmit} className="bg-surface-soft border border-hairline focus-within:border-m-blue-dark/60" style={{ display: "flex", position: "relative", alignItems: "center", borderRadius: "24px", padding: "8px", transition: "border-color 0.2s" }}>
                    <textarea
                        value={prompt}
                        onChange={handlePromptChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Gemini"
                        rows={1}
                        className="w-full resize-none text-body-strong outline-none"
                        style={{ backgroundColor: "transparent", padding: "12px 48px 12px 16px", border: "none" }}
                    />
                    <button
                        type="submit"
                        disabled={isSending || !prompt.trim()}
                        className="bg-m-blue-dark text-white"
                        style={{ position: "absolute", bottom: "12px", right: "12px", display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "50%", border: "none", cursor: (isSending || !prompt.trim()) ? "not-allowed" : "pointer", opacity: (isSending || !prompt.trim()) ? 0.5 : 1 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
                <div className="text-center text-muted" style={{ marginTop: "12px", fontSize: "12px" }}>
                    Gemini may display inaccurate info, so double-check its responses.
                </div>
            </div>
        </main>
    );
}