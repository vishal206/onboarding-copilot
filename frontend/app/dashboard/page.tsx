"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { COLORS } from "@/lib/colors";
import { useBotId } from "@/contexts/BotContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  total_conversations: number;
  total_messages: number;
  fallback_rate: number;
  messages_per_day: { date: string; count: number }[];
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-muted rounded-lg px-4 py-3">
      <p className="text-[13px] text-ink-3 mb-1">{label}</p>
      <p className="text-[24px] font-medium text-ink">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { botId } = useBotId();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [planLoaded, setPlanLoaded] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem("free_plan_banner_dismissed") === "1",
  );

  function dismissBanner() {
    localStorage.setItem("free_plan_banner_dismissed", "1");
    setBannerDismissed(true);
  }

  useEffect(() => {
    if (!botId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${botId}/analytics`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setAnalytics(data);
        if (data) posthog.capture("dashboard_analytics_loaded", { bot_id: botId });
      })
      .catch(() => {});
  }, [botId]);

  useEffect(() => {
    getToken().then((token) => {
      if (!token) return;
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.plan) setCurrentPlan(data.plan);
        })
        .catch(() => {})
        .finally(() => setPlanLoaded(true));
    });
  }, [getToken]);

  const chartData = analytics?.messages_per_day.map((d) => ({
    date: d.date.slice(5),
    count: d.count,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Free-plan upgrade banner */}
      {planLoaded && currentPlan === "free" && !bannerDismissed && (
        <div className="bg-warning-bg border-b border-warning-tx/20 px-8 py-3 flex items-center justify-between shrink-0">
          <p className="text-[15px] text-warning-tx">
            You&apos;re on the free plan · limited to 10 employees &amp; 50 pages indexed.
          </p>
          <div className="flex items-center gap-4 shrink-0 ml-4">
            <Link
              href="/pricing" target="_blank" rel="noopener noreferrer"
              className="text-[15px] font-medium text-warning-tx hover:opacity-80 underline"
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

      <div className="px-8 py-8">
        {analytics && (
          <section className="mb-8">
            <h2 className="text-[20px] font-medium text-ink mb-4">Analytics</h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <MetricCard
                label="Conversations"
                value={analytics.total_conversations}
              />
              <MetricCard label="Messages" value={analytics.total_messages} />
              <MetricCard
                label="Fallback rate"
                value={`${analytics.fallback_rate}%`}
              />
            </div>

            <div className="bg-muted rounded-xl border border-line-3 p-5">
              <p className="text-[13px] text-ink-2 mb-4">
                Messages per day — last 30 days
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-tertiary)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
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

        {/* Slack deployment placeholder */}
        <section>
          <div className="bg-muted rounded-xl border border-line-3 px-5 py-4">
            <p className="text-[15px] font-medium text-ink mb-0.5">Slack bot</p>
            <p className="text-[13px] text-ink-3">
              Slack deployment is coming soon. Use the preview panel on the right to test your bot.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
