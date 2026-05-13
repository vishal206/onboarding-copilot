"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import FileUpload from "@/components/FileUpload";
import DocumentList from "@/components/DocumentList";
import { PLAN_MAX_DOCS } from "@/lib/plans";

const TEST_BOT_ID = "00000000-0000-0000-0000-000000000001";

export default function DocumentsPage() {
  const { getToken } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [currentPlan, setCurrentPlan] = useState<string>("free");

  useEffect(() => {
    getToken().then((token) => {
      if (!token) return;
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => { if (data?.plan) setCurrentPlan(data.plan); })
        .catch(() => {});
    });
  }, [getToken]);

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
          {PLAN_MAX_DOCS[currentPlan] != null && (
            <span className="text-[15px] text-ink-3 shrink-0 ml-4">
              {docCount} / {PLAN_MAX_DOCS[currentPlan]} used
            </span>
          )}
        </div>

        <FileUpload
          botId={TEST_BOT_ID}
          onUploadSuccess={() => setRefreshTrigger((prev) => prev + 1)}
          atLimit={PLAN_MAX_DOCS[currentPlan] != null && docCount >= (PLAN_MAX_DOCS[currentPlan] as number)}
          maxDocs={PLAN_MAX_DOCS[currentPlan]}
        />
        <DocumentList
          botId={TEST_BOT_ID}
          refreshTrigger={refreshTrigger}
          onDocCountChange={setDocCount}
        />
      </div>
    </div>
  );
}
