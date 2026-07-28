"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithAI, ChatMessage } from "@/lib/api/ai";

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm **TrailIdea AI** — your hiking & trekking assistant!\n\nI can help you with:\n- Trail route planning\n- Budget estimates for treks\n- Gear recommendations\n- Permits & logistics\n- Altitude safety tips\n\nWhat trail adventure can I help you plan?",
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      // Send only non-system messages to API (system prompt added server-side)
      const apiMessages = newHistory.filter((m) => m.role !== "system");
      const reply = await chatWithAI(apiMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      // Bold: **text**
      const withBold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      if (line.startsWith("- ")) {
        elements.push(
          <li
            key={i}
            dangerouslySetInnerHTML={{ __html: withBold.slice(2) }}
            style={{ marginLeft: "16px", marginBottom: "3px", listStyle: "disc" }}
          />
        );
      } else if (line.trim() === "") {
        elements.push(<br key={i} />);
      } else {
        elements.push(
          <span key={i}>
            <span dangerouslySetInnerHTML={{ __html: withBold }} />
            {i < lines.length - 1 && <br />}
          </span>
        );
      }
    });

    return elements;
  };

  const QUICK_PROMPTS = [
    "Everest Base Camp plan",
    "Budget trek Nepal",
    "Gear for Annapurna",
  ];

  return (
    <>
      {/* ── Floating Toggle Button ── */}
      <button
        id="ai-chatbot-toggle"
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Open TrailIdea AI Assistant"
        title="TrailIdea AI Assistant"
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "var(--color-primary)",
          color: "var(--color-on-primary)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.15)",
          zIndex: 9990,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.35)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.15)";
        }}
      >
        {isOpen ? (
          <span className="material-symbols-outlined" style={{ fontSize: 26 }}>close</span>
        ) : (
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>smart_toy</span>
        )}
      </button>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          id="ai-chatbot-panel"
          style={{
            position: "fixed",
            bottom: "96px",
            right: "28px",
            width: "370px",
            maxHeight: "540px",
            display: "flex",
            flexDirection: "column",
            background: "var(--color-surface)",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: "20px",
            boxShadow: "0 12px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
            zIndex: 9989,
            overflow: "hidden",
            animation: "slideUpFade 0.22s cubic-bezier(0.34, 1.2, 0.64, 1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 18px",
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>smart_toy</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "14px" }}>TrailIdea AI</div>
              <div style={{ fontSize: "11px", opacity: 0.85 }}>Hiking & Trekking Assistant</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#4ade80",
                  boxShadow: "0 0 5px #4ade80",
                }}
              />
              <span style={{ fontSize: "11px", opacity: 0.85 }}>Online</span>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              scrollBehavior: "smooth",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  alignItems: "flex-end",
                  gap: "8px",
                }}
              >
                {msg.role === "assistant" && (
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: "var(--color-on-primary)" }}>smart_toy</span>
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "9px 13px",
                    borderRadius:
                      msg.role === "user"
                        ? "16px 16px 3px 16px"
                        : "16px 16px 16px 3px",
                    background:
                      msg.role === "user"
                        ? "var(--color-primary)"
                        : "var(--color-surface-container-low)",
                    color:
                      msg.role === "user"
                        ? "var(--color-on-primary)"
                        : "var(--color-on-surface)",
                    fontSize: "13px",
                    lineHeight: "1.55",
                    wordBreak: "break-word",
                  }}
                >
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {renderMessage(msg.content)}
                  </ul>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 15, color: "var(--color-on-primary)" }}>smart_toy</span>
                </div>
                <div
                  style={{
                    padding: "10px 15px",
                    borderRadius: "16px 16px 16px 3px",
                    background: "var(--color-surface-container-low)",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                  }}
                >
                  <span className="ai-typing-dot" />
                  <span className="ai-typing-dot" style={{ animationDelay: "0.15s" }} />
                  <span className="ai-typing-dot" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompt chips */}
          <div
            style={{
              padding: "8px 12px 0",
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              flexShrink: 0,
              borderTop: "1px solid var(--color-outline-variant)",
            }}
          >
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setInput(prompt);
                  inputRef.current?.focus();
                }}
                style={{
                  padding: "4px 10px",
                  borderRadius: "100px",
                  border: "1px solid var(--color-outline-variant)",
                  background: "var(--color-surface-container-lowest)",
                  color: "var(--color-on-surface-variant)",
                  fontSize: "11px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-family)",
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <div
            style={{
              padding: "10px 14px",
              borderTop: "1px solid var(--color-outline-variant)",
              display: "flex",
              gap: "8px",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about hiking, routes, gear..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                flex: 1,
                border: "1px solid var(--color-outline-variant)",
                borderRadius: "100px",
                padding: "8px 16px",
                fontSize: "13px",
                background: "var(--color-surface-container-low)",
                color: "var(--color-on-surface)",
                outline: "none",
                fontFamily: "var(--font-family)",
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background:
                  input.trim() && !loading
                    ? "var(--color-primary)"
                    : "var(--color-surface-container-high)",
                color:
                  input.trim() && !loading
                    ? "var(--color-on-primary)"
                    : "var(--color-outline)",
                border: "none",
                cursor: input.trim() && !loading ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s, color 0.2s",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
