"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
import ChatPreview, { BotInfo } from "@/components/ChatPreview";
import { BotContext } from "@/contexts/BotContext";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSettings = pathname === "/dashboard/settings";
  const { getToken } = useAuth();
  const [bot, setBot] = useState<BotInfo | null>(null);
  const [botId, setBotId] = useState<string | null>(null);
  const [botLoading, setBotLoading] = useState(true);
  const [chatKey, setChatKey] = useState(0);

  async function fetchBot() {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setBotLoading(false);
      return;
    }
    const data: BotInfo = await res.json();
    setBotId(data.id);
    setBot(data);
    setChatKey((k) => k + 1);
    setBotLoading(false);
  }

  useEffect(() => {
    if (isSettings) {
      setBotLoading(false);
      return;
    }
    fetchBot();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSettings]);

  useEffect(() => {
    const handler = () => fetchBot();
    window.addEventListener("bot-settings-updated", handler);
    return () => window.removeEventListener("bot-settings-updated", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BotContext.Provider value={{ botId, botLoading }}>
      <div className="flex min-h-screen bg-muted">
        <Sidebar />
        {isSettings ? (
          <div className="flex-1 bg-surface">{children}</div>
        ) : (
          <div className="flex-1 bg-surface flex overflow-hidden" style={{ height: "100vh" }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: "none" }}>{children}</div>
            <div className="w-115 shrink-0 flex flex-col px-8 py-8 overflow-hidden">
              <div className="flex-1 min-h-0">
                {bot ? (
                  <ChatPreview key={chatKey} bot={bot} />
                ) : botLoading ? (
                  <div className="h-full flex items-center justify-center bg-muted rounded-xl border border-line-3">
                    <span className="flex gap-1.5 items-center text-ink-3 text-sm">
                      <span className="animate-bounce [animation-delay:0ms]">●</span>
                      <span className="animate-bounce [animation-delay:150ms]">●</span>
                      <span className="animate-bounce [animation-delay:300ms]">●</span>
                    </span>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted rounded-xl border border-line-3 px-6 text-center">
                    <div>
                      <p className="text-[15px] font-medium text-ink mb-1">No bot yet</p>
                      <p className="text-[13px] text-ink-3">Upload documents to start training your bot.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </BotContext.Provider>
  );
}
