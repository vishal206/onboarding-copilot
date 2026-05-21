"use client";

import { useAuth, UserButton, useClerk, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { IconCheck, IconExternalLink, IconSun, IconMoon, IconDeviceLaptop, IconLogout } from "@tabler/icons-react";

type Tab = "plan" | "appearance" | "account";
type ThemeChoice = "light" | "dark" | "system";

const PLAN_DETAILS: Record<string, {
  label: string;
  price: string;
  features: string[];
  maxPages: number | null;
}> = {
  free: {
    label: "Free",
    price: "$0 / month",
    features: ["Unlimited conversations", "Web chat", "10 employees covered", "50 pages indexed", "30-day chat history", "Community support"],
    maxPages: 50,
  },
  starter: {
    label: "Starter",
    price: "$49 / month",
    features: ["Unlimited conversations", "Web chat", "Slack & Teams (coming soon)", "50 employees covered", "500 pages indexed", "Remove branding", "1-year chat history", "Email support", "Full analytics"],
    maxPages: 500,
  },
  growth: {
    label: "Growth",
    price: "$149 / month",
    features: ["Unlimited conversations", "Web chat", "Slack & Teams (coming soon)", "200 employees covered", "2,500 pages indexed", "Remove branding", "1-year chat history", "Email support", "Full analytics"],
    maxPages: 2500,
  },
  scale: {
    label: "Scale",
    price: "$399 / month",
    features: ["Unlimited conversations", "Web chat", "Slack & Teams (coming soon)", "1,000 employees covered", "10,000 pages indexed", "SSO & custom domain", "Unlimited chat history", "Email support", "Full analytics"],
    maxPages: 10000,
  },
};

export default function SettingsPage() {
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("plan");
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [themeChoice, setThemeChoice] = useState<ThemeChoice>("system");

  // Bot usage state
  const [pagesIndexed, setPagesIndexed] = useState<number>(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") as ThemeChoice | null;
      if (saved === "light" || saved === "dark") setThemeChoice(saved);
      else setThemeChoice("system");
    } catch {}
  }, []);

  function applyTheme(choice: ThemeChoice) {
    setThemeChoice(choice);
    try {
      if (choice === "system") {
        localStorage.removeItem("theme");
        delete document.documentElement.dataset.theme;
      } else {
        localStorage.setItem("theme", choice);
        document.documentElement.dataset.theme = choice;
      }
    } catch {}
  }

  useEffect(() => {
    getToken().then(async (token) => {
      if (!token) return;

      const [billingRes, botsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (billingRes.ok) {
        const data = await billingRes.json();
        if (data?.plan) setCurrentPlan(data.plan);
      }

      if (botsRes.ok) {
        const bots = await botsRes.json();
        if (bots?.length > 0) {
          setPagesIndexed(bots[0].pages_indexed_count ?? 0);
        }
      }
    });
  }, [getToken]);

  const plan = PLAN_DETAILS[currentPlan] ?? PLAN_DETAILS.free;
  const pagesPercent = plan.maxPages ? Math.min((pagesIndexed / plan.maxPages) * 100, 100) : 0;
  const pagesNearLimit = plan.maxPages ? pagesIndexed / plan.maxPages >= 0.8 : false;

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between px-8 py-5 border-b border-line-3">
        <h1 className="text-[17px] font-medium text-ink">Settings</h1>
        <UserButton />
      </div>

      <div className="max-w-225 mx-auto px-8 py-8">
        <div className="flex gap-10">
          {/* Sub-nav */}
          <nav className="w-48 shrink-0 flex flex-col gap-1 pt-0.5">
            {(["plan", "appearance", "account"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left px-3 py-2 rounded-lg text-[15px] transition-colors ${
                  activeTab === tab
                    ? "bg-muted border border-line-3 font-medium text-ink"
                    : "text-ink-2 hover:text-ink hover:bg-muted/60"
                }`}
              >
                {tab === "plan" ? "Plan" : tab === "appearance" ? "Appearance" : "Account"}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* ── Appearance tab ── */}
            {activeTab === "appearance" && (
              <div>
                <h2
                  className="text-ink mb-1"
                  style={{ fontSize: "20px", fontWeight: 300, letterSpacing: "-0.02em" }}
                >
                  Appearance
                </h2>
                <p className="text-[15px] text-ink-2 mb-8">
                  Choose how the dashboard looks. Your preference is saved in this browser.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      { value: "light", label: "Light", Icon: IconSun, preview: { bg: "#ffffff", surface: "#f8f8f6", text: "#111110" } },
                      { value: "system", label: "System", Icon: IconDeviceLaptop, preview: null },
                      { value: "dark",  label: "Dark",  Icon: IconMoon, preview: { bg: "#0e0e0d", surface: "#1a1a18", text: "#f0f0ee" } },
                    ] as const
                  ).map(({ value, label, Icon, preview }) => {
                    const active = themeChoice === value;
                    return (
                      <button
                        key={value}
                        onClick={() => applyTheme(value)}
                        className="rounded-2xl border p-5 flex flex-col items-center gap-4 transition-colors"
                        style={{
                          border: active ? "1.5px solid #111" : "1px solid rgba(0,0,0,0.08)",
                          background: active ? "var(--bg-secondary)" : "var(--bg-primary)",
                        }}
                      >
                        <div
                          className="w-full rounded-xl overflow-hidden"
                          style={{
                            height: "72px",
                            background: preview ? preview.bg : "linear-gradient(135deg, #ffffff 50%, #0e0e0d 50%)",
                            border: "1px solid rgba(0,0,0,0.08)",
                            position: "relative",
                          }}
                        >
                          {preview && (
                            <>
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "36%",
                                  bottom: 0,
                                  background: preview.surface,
                                  borderRight: "1px solid rgba(128,128,128,0.12)",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "5px",
                                  padding: "8px 6px",
                                }}
                              >
                                <div style={{ width: "60%", height: "6px", borderRadius: "3px", background: preview.text, opacity: 0.15 }} />
                                {[1,2,3].map(i => (
                                  <div key={i} style={{ width: "80%", height: "5px", borderRadius: "3px", background: preview.text, opacity: 0.08 }} />
                                ))}
                              </div>
                              <div style={{ position: "absolute", left: "40%", right: "8px", top: "10px", display: "flex", flexDirection: "column", gap: "5px" }}>
                                <div style={{ height: "6px", borderRadius: "3px", background: preview.text, opacity: 0.12, width: "70%" }} />
                                <div style={{ height: "5px", borderRadius: "3px", background: preview.text, opacity: 0.07, width: "90%" }} />
                                <div style={{ height: "5px", borderRadius: "3px", background: preview.text, opacity: 0.07, width: "60%" }} />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Icon size={16} className="text-ink-2" strokeWidth={1.75} />
                          <span
                            className="text-[15px]"
                            style={{ fontWeight: active ? 500 : 400, color: active ? "var(--text-primary)" : "var(--text-secondary)" }}
                          >
                            {label}
                          </span>
                          {active && (
                            <IconCheck size={12} strokeWidth={2.5} style={{ color: "#4ADE80" }} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Account tab ── */}
            {activeTab === "account" && (
              <div>
                <h2
                  className="text-ink mb-1"
                  style={{ fontSize: "20px", fontWeight: 300, letterSpacing: "-0.02em" }}
                >
                  Account
                </h2>
                <p className="text-[15px] text-ink-2 mb-8">Manage your account settings.</p>

                <div className="rounded-xl border border-line-3 p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <UserButton />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[15px] font-medium text-ink truncate">{user?.fullName ?? user?.firstName ?? ""}</span>
                      <span className="text-[13px] text-ink-3 truncate">{user?.primaryEmailAddress?.emailAddress ?? ""}</span>
                    </div>
                  </div>

                  <div className="border-t border-line-3 pt-4">
                    <button
                      onClick={() => signOut({ redirectUrl: "/" })}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-[15px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <IconLogout size={16} strokeWidth={1.75} />
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Plan tab ── */}
            {activeTab === "plan" && (
              <div className="space-y-6">
                {/* Current plan card */}
                <div className="rounded-xl border border-line-3 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[13px] text-ink-3 mb-1">Current plan</p>
                      <p className="text-[24px] font-medium text-ink">{plan.label}</p>
                      <p className="text-[15px] text-ink-2 mt-0.5">{plan.price}</p>
                    </div>
                    <Link
                      href="/pricing" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[15px] font-medium px-4 py-2 rounded-full bg-ember text-white hover:opacity-80 transition-opacity shrink-0"
                    >
                      {currentPlan === "free" ? "Upgrade plan" : "Change plan"}
                      <IconExternalLink size={12} />
                    </Link>
                  </div>

                  <div className="border-t border-line-3 pt-4">
                    <p className="text-[13px] text-ink-3 mb-3">What&apos;s included</p>
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-[15px] text-ink-2">
                          <IconCheck size={15} className="text-teal shrink-0" strokeWidth={2} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Usage card */}
                <div className="rounded-xl border border-line-3 p-5 space-y-5">
                  <p className="text-[15px] font-medium text-ink">Usage</p>

                  {/* Pages indexed */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[13px] text-ink-3">Pages indexed</p>
                      <p className={`text-[13px] font-medium ${pagesNearLimit ? "text-amber-500" : "text-ink"}`}>
                        {pagesIndexed.toLocaleString()} / {plan.maxPages ? plan.maxPages.toLocaleString() : "∞"}
                      </p>
                    </div>
                    {plan.maxPages && (
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pagesNearLimit ? "bg-amber-400" : "bg-teal"}`}
                          style={{ width: `${pagesPercent}%` }}
                        />
                      </div>
                    )}
                    {pagesNearLimit && (
                      <p className="text-[12px] text-amber-500 mt-1.5">
                        Approaching your page limit.{" "}
                        <Link href="/pricing" target="_blank" rel="noopener noreferrer" className="underline">Upgrade to add more.</Link>
                      </p>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
