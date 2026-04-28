"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import FileUpload from "@/components/FileUpload";
import { useState, useEffect } from "react";
import DocumentList from "@/components/DocumentList";
import Link from "next/link";
import posthog from "posthog-js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TEST_BOT_ID = "00000000-0000-0000-0000-000000000001";

interface AnalyticsData {
  total_conversations: number;
  total_messages: number;
  fallback_rate: number;
  messages_per_day: { date: string; count: number }[];
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  function handleCopyLink() {
    const url = `${window.location.origin}/chat/${TEST_BOT_ID}`;
    navigator.clipboard.writeText(url);
    posthog.capture("link_copied", { bot_id: TEST_BOT_ID, url });
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${TEST_BOT_ID}/analytics`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setAnalytics(data))
      .catch(() => {});
  }, []);

  const chartData = analytics?.messages_per_day.map((d) => ({
    date: d.date.slice(5),
    count: d.count,
  }));

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Onboarding Co-Pilot</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard/fallbacks"
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Unanswered Questions
          </Link>
          <Link
            href="/dashboard/settings"
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Settings
          </Link>
          <UserButton />
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome, {user?.firstName} 👋
        </h2>
        <p className="text-gray-500 mb-8">
          {`You're logged in as ${user?.emailAddresses[0].emailAddress}`}
        </p>

        {/* Analytics */}
        {analytics && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Analytics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard
                label="Total Conversations"
                value={analytics.total_conversations}
              />
              <StatCard
                label="Total Messages"
                value={analytics.total_messages}
              />
              <StatCard
                label="Fallback Rate"
                value={`${analytics.fallback_rate}%`}
              />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600 mb-4">
                Messages per Day (Last 30 Days)
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Share link */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-medium text-gray-700">Bot link</p>
            <p className="text-xs text-gray-400 mt-0.5">{`/chat/${TEST_BOT_ID}`}</p>
          </div>
          <button
            onClick={handleCopyLink}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-700"
          >
            {linkCopied ? "Copied!" : "Copy Link"}
          </button>
        </div>

        {/* File Upload */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Upload Documents
        </h3>
        <FileUpload
          botId={TEST_BOT_ID}
          onUploadSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
        <DocumentList botId={TEST_BOT_ID} refreshTrigger={refreshTrigger} />
      </div>
    </main>
  );
}
