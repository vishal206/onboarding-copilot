"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import FileUpload from "@/components/FileUpload";
import DocumentList from "@/components/DocumentList";
import Link from "next/link";
import { PLAN_LABELS, PLAN_MAX_DOCS } from "@/lib/plans";

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
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-line-3">
        <h1 className="text-[17px] font-medium text-ink">Documents</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className={`text-[13px] font-medium px-3 py-1 rounded-full ${PLAN_LABELS[currentPlan]?.className ?? PLAN_LABELS.free.className}`}
          >
            {PLAN_LABELS[currentPlan]?.label ?? "Free"} plan
          </Link>
          <UserButton />
        </div>
      </div>

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
