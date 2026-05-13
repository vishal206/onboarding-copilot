"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { IconSend, IconFileText, IconRefresh } from "@tabler/icons-react";

export interface BotInfo {
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
          {" "}
          at{" "}
          <a href={`mailto:${contact.email}`} className="underline">
            {contact.email}
          </a>
        </>
      )}
      {contact.slack && (
        <>
          {" "}
          or <span className="font-mono">{contact.slack}</span> on Slack
        </>
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

const TEST_BOT_ID = "00000000-0000-0000-0000-000000000001";

export default function ChatPreview({ bot }: { bot: BotInfo }) {
  const [messages, setMessages] = useState<Message[]>(() =>
    bot.welcome_message ? [{ role: "assistant", content: bot.welcome_message }] : [],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function reset() {
    setMessages(
      bot.welcome_message ? [{ role: "assistant", content: bot.welcome_message }] : [],
    );
    setInput("");
    setLoading(false);
  }

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const historyBeforeSend = [...messages];
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
          bot_id: TEST_BOT_ID,
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

  return (
    <div className="flex flex-col h-full bg-surface rounded-xl border border-line-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-line-3 shrink-0 bg-surface">
        <div className="w-6 h-6 rounded-lg bg-ember flex items-center justify-center shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-teal" />
        </div>
        <span className="text-[13px] font-medium text-ink">{bot.name}</span>
        <span className="ml-auto text-[11px] text-ink-3 mr-2">Preview</span>
        <button
          onClick={reset}
          title="Reset conversation"
          className="text-ink-3 hover:text-ink transition-colors"
        >
          <IconRefresh size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-lg bg-ember flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-teal" />
              </div>
            )}
            <div
              className="flex flex-col gap-1.5"
              style={{ maxWidth: msg.role === "user" ? "75%" : "85%" }}
            >
              <div
                className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  msg.role === "user" ? "bg-ember text-white" : "bg-muted text-ink"
                }`}
                style={{
                  borderRadius:
                    msg.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                }}
              >
                {msg.content ? (
                  msg.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => (
                          <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
                        ),
                        li: ({ children }) => <li>{children}</li>,
                        strong: ({ children }) => (
                          <strong className="font-medium">{children}</strong>
                        ),
                        code: ({ children }) => (
                          <code className="bg-subtle rounded px-1 py-0.5 text-[12px] font-mono">
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
                  <span className="inline-flex gap-1 items-center text-ink-3">
                    <span className="animate-bounce [animation-delay:0ms]">●</span>
                    <span className="animate-bounce [animation-delay:150ms]">●</span>
                    <span className="animate-bounce [animation-delay:300ms]">●</span>
                  </span>
                )}
              </div>

              {msg.role === "assistant" && msg.hrContact && (
                <HRFallbackCard contact={msg.hrContact} />
              )}

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

      {/* Input */}
      <div className="border-t border-line-3 shrink-0 px-4 py-3 bg-surface">
        <div className="flex gap-2 bg-muted rounded-full border border-line-2 px-3 py-1.5">
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
            className="bg-ember text-white text-[13px] font-medium px-3 py-1 rounded-full hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1"
          >
            <IconSend size={12} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
