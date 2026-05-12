"use client";

import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { PLAN_LABELS } from "@/lib/plans";
import { COLORS } from "@/lib/colors";
import { IconCopy, IconCheck } from "@tabler/icons-react";
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

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-muted rounded-lg px-3 py-[10px]">
      <p className="text-[11px] text-ink-3 mb-1">{label}</p>
      <p className="text-[20px] font-medium text-ink">{value}</p>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [planLoaded, setPlanLoaded] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() =>
    typeof window !== "undefined" &&
    localStorage.getItem("free_plan_banner_dismissed") === "1"
  );

  function dismissBanner() {
    localStorage.setItem("free_plan_banner_dismissed", "1");
    setBannerDismissed(true);
  }

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

  useEffect(() => {
    getToken().then((token) => {
      if (!token) return;
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => { if (data?.plan) setCurrentPlan(data.plan); })
        .catch(() => {})
        .finally(() => setPlanLoaded(true));
    });
  }, [getToken]);

  const chartData = analytics?.messages_per_day.map((d) => ({
    date: d.date.slice(5),
    count: d.count,
  }));

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-line-3">
        <p className="text-[15px] font-medium text-ink">
          {greeting()}, {user?.firstName}
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${PLAN_LABELS[currentPlan]?.className ?? PLAN_LABELS.free.className}`}
          >
            {PLAN_LABELS[currentPlan]?.label ?? "Free"} plan
          </Link>
          <UserButton />
        </div>
      </div>

      {/* Free-plan upgrade banner */}
      {planLoaded && currentPlan === "free" && !bannerDismissed && (
        <div className="bg-warning-bg border-b border-warning-tx/20 px-8 py-2.5 flex items-center justify-between">
          <p className="text-[13px] text-warning-tx">
            You&apos;re on the free plan · limited to 3 documents &amp; 50 messages/month.
          </p>
          <div className="flex items-center gap-4 shrink-0 ml-4">
            <Link
              href="/pricing"
              className="text-[13px] font-medium text-warning-tx hover:opacity-80 underline"
            >
              See pricing →
            </Link>
            <button
              onClick={dismissBanner}
              aria-label="Dismiss banner"
              className="text-warning-tx/60 hover:text-warning-tx text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-225 mx-auto px-8 py-8">

        {/* Analytics */}
        {analytics && (
          <section className="mb-8">
            <h2 className="text-[20px] font-medium text-ink mb-4">Analytics</h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <MetricCard label="Total conversations" value={analytics.total_conversations} />
              <MetricCard label="Total messages" value={analytics.total_messages} />
              <MetricCard label="Fallback rate" value={`${analytics.fallback_rate}%`} />
            </div>

            <div className="bg-muted rounded-xl border border-line-3 p-5">
              <p className="text-[13px] text-ink-2 mb-4">Messages per day — last 30 days</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-tertiary)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "0.5px solid var(--border-secondary)",
                      fontSize: "13px",
                      background: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={COLORS.ember}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3, fill: COLORS.ember }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Bot link */}
        <section className="mb-8">
          <div className="flex items-center justify-between bg-muted rounded-xl border border-line-3 px-5 py-4">
            <div>
              <p className="text-[13px] font-medium text-ink mb-0.5">Bot link</p>
              <p className="text-[12px] text-ink-3 font-mono">{`/chat/${TEST_BOT_ID}`}</p>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-lg border border-line-2 bg-surface hover:bg-muted transition-colors text-ink"
            >
              {linkCopied
                ? <><IconCheck size={13} /><span>Copied</span></>
                : <><IconCopy size={13} /><span>Copy link</span></>
              }
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
