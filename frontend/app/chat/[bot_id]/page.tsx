"use client";

import { useEffect, useRef, useState } from "react";
import { use } from "react";
import ReactMarkdown from "react-markdown";
import posthog from "posthog-js";
import { IconFileText, IconSend } from "@tabler/icons-react";

interface BotInfo {
  id: string;
  name: string;
  welcome_message: string | null;
}

interface HRContact {
  name: string | null;
  email: string | null;
  slack: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  hrContact?: HRContact;
}

function HRFallbackCard({ contact }: { contact: HRContact }) {
  return (
    <div className="mt-2 rounded-lg px-3.5 py-2.5 text-[13px] bg-ember-light text-ember-dark">
      I don&apos;t have an answer for this — reach out to{" "}
      {contact.name && <strong>{contact.name}</strong>}
      {contact.email && (
        <>
          {" "}at{" "}
          <a href={`mailto:${contact.email}`} className="underline">
            {contact.email}
          </a>
        </>
      )}
      {contact.slack && (
        <> or <span className="font-mono">{contact.slack}</span> on Slack</>
      )}
      .
    </div>
  );
}

function parseBuffer(buffer: string): {
  content: string;
  sources: string[];
  hrContact?: HRContact;
} {
  let content = buffer;
  let sources: string[] = [];
  let hrContact: HRContact | undefined;

  const sourcesIdx = content.indexOf("\n\n__SOURCES__:");
  if (sourcesIdx !== -1) {
    const rest = content.slice(sourcesIdx + "\n\n__SOURCES__:".length);
    content = content.slice(0, sourcesIdx);
    const hrIdx = rest.indexOf("\n\n__HR_CONTACT__:");
    const sourcesRaw = hrIdx !== -1 ? rest.slice(0, hrIdx) : rest;
    try {
      sources = JSON.parse(sourcesRaw).sources ?? [];
    } catch {}
    if (hrIdx !== -1) {
      try {
        hrContact = JSON.parse(rest.slice(hrIdx + "\n\n__HR_CONTACT__:".length));
      } catch {}
    }
  }

  return { content: content.trim(), sources, hrContact };
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const historyBeforeSend = [...messages];
    const userTurnCount = historyBeforeSend.filter((m) => m.role === "user").length;

    if (userTurnCount === 0) {
      posthog.capture("chat_started", { bot_id, session_id: sessionId });
    }
    posthog.capture("message_sent", {
      bot_id,
      session_id: sessionId,
      message_length: question.length,
      conversation_turn: userTurnCount + 1,
    });

    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
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

      if (res.status === 403) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "You've hit your monthly message limit. [Upgrade your plan →](/pricing)",
          };
          return updated;
        });
        return;
      }

      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parsed = parseBuffer(buffer);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: parsed.content,
            sources: parsed.sources,
            hrContact: parsed.hrContact,
          };
          return updated;
        });
      }
    } catch (err) {
      posthog.capture("public_chat_error", { bot_id, session_id: sessionId });
      posthog.captureException(err);
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

  if (botError) {
    return (
      <main className="min-h-screen bg-muted flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-ember flex items-center justify-center mx-auto mb-4">
            <div className="w-3 h-3 rounded-full bg-teal" />
          </div>
          <h1 className="text-[20px] font-medium text-ink mb-2">Bot not found</h1>
          <p className="text-[13px] text-ink-2">
            This link may be invalid or the bot has been removed.
          </p>
        </div>
      </main>
    );
  }

  if (!bot) {
    return (
      <main className="min-h-screen bg-muted flex items-center justify-center">
        <div className="flex gap-1.5 items-center text-ink-3 text-sm">
          <span className="animate-bounce [animation-delay:0ms]">●</span>
          <span className="animate-bounce [animation-delay:150ms]">●</span>
          <span className="animate-bounce [animation-delay:300ms]">●</span>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen bg-surface flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-5 py-3 border-b border-line-3 shrink-0 bg-surface">
          <div className="w-7 h-7 rounded-lg bg-ember flex items-center justify-center shrink-0">
            <div className="w-2 h-2 rounded-full bg-teal" />
          </div>
          <span className="text-[13px] font-medium text-ink">{bot.name}</span>
          <span className="ml-auto text-[11px] text-ink-3">Powered by Onboarding Co-Pilot</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-5 flex flex-col gap-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-ember flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-teal" />
                </div>
              )}

              <div className="flex flex-col gap-1.5" style={{ maxWidth: msg.role === "user" ? "75%" : "85%" }}>
                {/* Bubble */}
                <div
                  className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-ember text-white"
                      : "bg-muted text-ink"
                  }`}
                  style={{
                    borderRadius: msg.role === "user"
                      ? "12px 4px 12px 12px"
                      : "4px 12px 12px 12px",
                  }}
                >
                  {msg.content ? (
                    msg.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li>{children}</li>,
                          strong: ({ children }) => <strong className="font-medium">{children}</strong>,
                          code: ({ children }) => (
                            <code className="bg-subtle rounded px-1 py-0.5 text-[12px] font-mono">{children}</code>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )
                  ) : (
                    <span className="inline-flex gap-1 items-center text-ink-3">
                      <span className="animate-bounce [animation-delay:0ms]">●</span>
                      <span className="animate-bounce [animation-delay:150ms]">●</span>
                      <span className="animate-bounce [animation-delay:300ms]">●</span>
                    </span>
                  )}
                </div>

                {/* HR fallback card */}
                {msg.role === "assistant" && msg.hrContact && (
                  <HRFallbackCard contact={msg.hrContact} />
                )}

                {/* Source citation pills */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {msg.sources.map((source, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.75 rounded-full bg-teal-light text-teal-dark"
                      >
                        <IconFileText size={11} />
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
        </div>

        {/* Input bar */}
        <div className="border-t border-line-3 shrink-0 px-5 py-4 bg-surface">
          <div className="max-w-2xl mx-auto flex gap-2 bg-muted rounded-full border border-line-2 px-4 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask a question…"
              disabled={loading}
              className="flex-1 text-[13px] bg-transparent focus:outline-none disabled:opacity-50 text-ink placeholder:text-ink-3"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-ember text-white text-[13px] font-medium px-4 py-1.5 rounded-full hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
            >
              <IconSend size={13} />
              Send
            </button>
          </div>
        </div>
    </main>
  );
}
