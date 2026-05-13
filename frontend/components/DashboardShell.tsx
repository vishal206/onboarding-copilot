"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatPreview, { BotInfo } from "@/components/ChatPreview";

const TEST_BOT_ID = "00000000-0000-0000-0000-000000000001";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSettings = pathname === "/dashboard/settings";
  const [bot, setBot] = useState<BotInfo | null>(null);

  useEffect(() => {
    if (isSettings) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${TEST_BOT_ID}/public`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setBot(data))
      .catch(() => {});
  }, [isSettings]);

  return (
    <div className="flex min-h-screen bg-muted">
      <Sidebar />
      {isSettings ? (
        <div className="flex-1 bg-surface">{children}</div>
      ) : (
        <div className="flex-1 bg-surface flex overflow-hidden" style={{ height: "100vh" }}>
          <div className="flex-1 overflow-y-auto">{children}</div>
          <div className="w-[460px] shrink-0 flex flex-col px-8 py-8 overflow-hidden">
            <div className="flex-1 min-h-0">
              {bot ? (
                <ChatPreview bot={bot} />
              ) : (
                <div className="h-full flex items-center justify-center bg-muted rounded-xl border border-line-3">
                  <span className="flex gap-1.5 items-center text-ink-3 text-sm">
                    <span className="animate-bounce [animation-delay:0ms]">●</span>
                    <span className="animate-bounce [animation-delay:150ms]">●</span>
                    <span className="animate-bounce [animation-delay:300ms]">●</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
