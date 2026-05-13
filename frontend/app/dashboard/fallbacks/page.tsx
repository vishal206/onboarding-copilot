"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const TEST_BOT_ID = "00000000-0000-0000-0000-000000000001";

interface FallbackMessage {
  conversation_id: string;
  content: string;
  created_at: string;
}

export default function FallbacksPage() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<FallbackMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getToken()
      .then((token) =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${TEST_BOT_ID}/fallbacks`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch fallback messages");
        return r.json();
      })
      .then((data: FallbackMessage[]) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setMessages(sorted);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [getToken]);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-line-3">
        <h1 className="text-[17px] font-medium text-ink">Fallbacks</h1>
        <UserButton />
      </div>

      <div className="max-w-225 mx-auto px-8 py-8">
        <h2 className="text-[32px] font-medium text-ink mb-1">Unanswered questions</h2>
        <p className="text-[17px] text-ink-2 mb-8">
          Questions your bot couldn&apos;t confidently answer, sorted newest first.
        </p>

        {loading && (
          <p className="text-[15px] text-ink-3">Loading…</p>
        )}
        {error && (
          <p className="text-[15px] text-danger-tx">{error}</p>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="bg-muted rounded-xl border border-line-3 p-10 text-center">
            <p className="text-[17px] font-medium text-ink mb-1">No unanswered questions yet</p>
            <p className="text-[15px] text-ink-2">
              When your bot can&apos;t answer something, it&apos;ll show up here so you can fill the gap.
            </p>
          </div>
        )}

        {!loading && !error && messages.length > 0 && (
          <div className="rounded-xl border border-line-3 overflow-hidden">
            <table className="w-full text-[15px]">
              <thead className="bg-muted border-b border-line-3">
                <tr>
                  <th className="text-left px-5 py-3.5 text-ink-3 font-medium w-44">Date</th>
                  <th className="text-left px-5 py-3.5 text-ink-3 font-medium">Question</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg, i) => (
                  <tr
                    key={`${msg.conversation_id}-${i}`}
                    className="border-b border-line-3 last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-ink-3 whitespace-nowrap font-mono text-[13px]">
                      {new Date(msg.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-ink-2">{msg.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
