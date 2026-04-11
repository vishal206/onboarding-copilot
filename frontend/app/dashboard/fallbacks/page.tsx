"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";

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
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Onboarding Co-Pilot</h1>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/fallbacks" className="text-sm font-medium text-gray-800">
            Unanswered Questions
          </Link>
          <Link href="/dashboard/settings" className="text-sm text-gray-500 hover:text-gray-800">
            Settings
          </Link>
          <UserButton />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unanswered Questions</h2>
        <p className="text-gray-500 mb-8">
          Questions your bot couldn't confidently answer, sorted newest first.
        </p>

        {loading && <p className="text-gray-400">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && messages.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            No unanswered questions yet.
          </div>
        )}

        {!loading && !error && messages.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium w-44">Date</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Question</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg, i) => (
                  <tr
                    key={`${msg.conversation_id}-${i}`}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{msg.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
