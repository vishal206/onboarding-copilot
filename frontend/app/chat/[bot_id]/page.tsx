"use client";

import { useEffect, useRef, useState } from "react";
import { use } from "react";
import ReactMarkdown from "react-markdown";

interface BotInfo {
  id: string;
  name: string;
  welcome_message: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export default function PublicChatPage({
  params,
}: {
  params: Promise<{ bot_id: string }>;
}) {
  const { bot_id } = use(params);

  const [bot, setBot] = useState<BotInfo | null>(null);
  const [botError, setBotError] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch public bot info on mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${bot_id}/public`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: BotInfo) => {
        setBot(data);
        if (data.welcome_message) {
          setMessages([{ role: "assistant", content: data.welcome_message }]);
        }
      })
      .catch(() => setBotError(true));
  }, [bot_id]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMessage: Message = { role: "user", content: question };
    const historyBeforeSend = [...messages];

    setMessages((prev) => [
      ...prev,
      userMessage,
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/query/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot_id,
          question,
          session_id: sessionId,
          conversation_history: historyBeforeSend,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Check if the sources delimiter has arrived yet
        const delimiterIndex = buffer.indexOf("\n\n__SOURCES__:");

        if (delimiterIndex !== -1) {
          // Split into answer text and sources JSON
          const answerText = buffer.slice(0, delimiterIndex);
          const sourcesRaw = buffer.slice(
            delimiterIndex + "\n\n__SOURCES__:".length,
          );

          let sources: string[] = [];
          try {
            const parsed = JSON.parse(sourcesRaw);
            sources = parsed.sources ?? [];
          } catch {
            // If JSON is malformed, just show no sources
          }

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: answerText,
              sources,
            };
            return updated;
          });
        } else {
          // Still streaming the answer — update content with buffer so far
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: buffer,
            };
            return updated;
          });
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  // Error state
  if (botError) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🤖</p>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Bot not found
          </h1>
          <p className="text-gray-500 text-sm">
            This link may be invalid or the bot has been removed.
          </p>
        </div>
      </main>
    );
  }

  // Loading state
  if (!bot) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex gap-1.5 items-center text-gray-400 text-sm">
          <span className="animate-bounce [animation-delay:0ms]">●</span>
          <span className="animate-bounce [animation-delay:150ms]">●</span>
          <span className="animate-bounce [animation-delay:300ms]">●</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {bot.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-sm font-semibold text-gray-800 leading-tight">
            {bot.name}
          </h1>
        </div>
        <div className="ml-auto text-xs text-gray-400 font-medium">
          Powered by Onboarding Co-Pilot
        </div>
      </nav>

      {/* Chat area */}
      <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 py-6 gap-4">
        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2 mt-0.5">
                  {bot.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col gap-1.5 max-w-[75%]">
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.content ? (
                    msg.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-4 mb-2 space-y-1">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-4 mb-2 space-y-1">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => <li>{children}</li>,
                          strong: ({ children }) => (
                            <strong className="font-semibold">
                              {children}
                            </strong>
                          ),
                          code: ({ children }) => (
                            <code className="bg-gray-100 rounded px-1 py-0.5 text-xs">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )
                  ) : (
                    <span className="inline-flex gap-1 items-center text-gray-400">
                      <span className="animate-bounce [animation-delay:0ms]">
                        ●
                      </span>
                      <span className="animate-bounce [animation-delay:150ms]">
                        ●
                      </span>
                      <span className="animate-bounce [animation-delay:300ms]">
                        ●
                      </span>
                    </span>
                  )}
                </div>

                {/* Source citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {msg.sources.map((source, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-1"
                      >
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {source}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex gap-3 shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1 text-sm focus:outline-none disabled:opacity-50 text-gray-800 placeholder:text-gray-400"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
