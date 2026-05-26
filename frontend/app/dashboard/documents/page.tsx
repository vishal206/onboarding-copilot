"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import FileUpload from "@/components/FileUpload";
import DocumentList from "@/components/DocumentList";
import { PLAN_MAX_PAGES } from "@/lib/plans";
import { useBotId } from "@/contexts/BotContext";

export default function DocumentsPage() {
  const { getToken } = useAuth();
  const { botId, botLoading } = useBotId();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [pagesUsed, setPagesUsed] = useState<number>(0);

  useEffect(() => {
    if (botLoading || !botId) return;
    getToken().then(async (token) => {
      if (!token) return;
      const [billingRes, botRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${botId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (billingRes.ok) {
        const data = await billingRes.json();
        if (data?.plan) setCurrentPlan(data.plan);
      }
      if (botRes.ok) {
        const bot = await botRes.json();
        setPagesUsed(bot.pages_indexed_count ?? 0);
      }
    });
  }, [getToken, botId, botLoading, refreshTrigger]);

  const maxPages = PLAN_MAX_PAGES[currentPlan];
  const atLimit = maxPages != null && pagesUsed >= maxPages;

  if (botLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-225 mx-auto px-8 py-8">
          <p className="text-[15px] text-ink-3">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-225 mx-auto px-8 py-8">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-[32px] font-medium text-ink mb-1">Documents</h2>
            <p className="text-[17px] text-ink-2">
              Upload your onboarding materials. The AI answers from these files.
            </p>
          </div>
          {maxPages != null && (
            <span className="text-[15px] text-ink-3 shrink-0 ml-4">
              {pagesUsed} / {maxPages} pages used
            </span>
          )}
        </div>

        {botId && (
          <>
            <FileUpload
              botId={botId}
              onUploadSuccess={() => setRefreshTrigger((prev) => prev + 1)}
              atLimit={atLimit}
              maxPages={maxPages}
            />
            <DocumentList
              botId={botId}
              refreshTrigger={refreshTrigger}
            />
          </>
        )}
      </div>
    </div>
  );
}
