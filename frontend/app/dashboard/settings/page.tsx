"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { IconCheck, IconExternalLink, IconSun, IconMoon, IconDeviceLaptop } from "@tabler/icons-react";

const TEST_BOT_ID = "00000000-0000-0000-0000-000000000001";

interface BotConfig {
  id: string;
  name: string;
  welcome_message: string;
  system_prompt: string;
  hr_contact_name: string;
  hr_contact_email: string;
  hr_contact_slack: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";
type Tab = "bot" | "plan" | "appearance";
type ThemeChoice = "light" | "dark" | "system";

const inputClass =
  "w-full border border-line-2 rounded-lg px-3 py-2 text-[13px] bg-surface text-ink focus:outline-none focus:ring-[3px] focus:ring-teal/25 focus:border-teal/50 transition-shadow placeholder:text-ink-3";

const PLAN_DETAILS: Record<string, {
  label: string;
  price: string;
  features: string[];
  docsLimit: string;
  messagesLimit: string;
}> = {
  free: {
    label: "Free",
    price: "$0 / month",
    features: ["1 onboarding bot", "3 document uploads", "50 messages / month", "Community support"],
    docsLimit: "3 documents",
    messagesLimit: "50 messages / month",
  },
  starter: {
    label: "Starter",
    price: "$299 / month",
    features: ["1 onboarding bot", "25 document uploads", "500 messages / month", "Email support", "Analytics dashboard"],
    docsLimit: "25 documents",
    messagesLimit: "500 messages / month",
  },
  growth: {
    label: "Growth",
    price: "$499 / month",
    features: ["5 onboarding bots", "100 document uploads", "2,000 messages / month", "Priority email support", "Advanced analytics", "Custom bot branding"],
    docsLimit: "100 documents",
    messagesLimit: "2,000 messages / month",
  },
  scale: {
    label: "Scale",
    price: "$799 / month",
    features: ["Unlimited onboarding bots", "Unlimited document uploads", "Unlimited messages", "Dedicated support", "SSO & team management"],
    docsLimit: "Unlimited",
    messagesLimit: "Unlimited",
  },
};

export default function SettingsPage() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("bot");
  const [form, setForm] = useState<BotConfig>({
    id: TEST_BOT_ID,
    name: "",
    welcome_message: "",
    system_prompt: "",
    hr_contact_name: "",
    hr_contact_email: "",
    hr_contact_slack: "",
  });
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [themeChoice, setThemeChoice] = useState<ThemeChoice>("system");

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
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${TEST_BOT_ID}`).then((r) => r.json()),
      getToken().then((token) =>
        token
          ? fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/me`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((r) => (r.ok ? r.json() : null))
          : null
      ),
    ])
      .then(([botData, billingData]) => {
        setForm({
          id: botData.id,
          name: botData.name ?? "",
          welcome_message: botData.welcome_message ?? "",
          system_prompt: botData.system_prompt ?? "",
          hr_contact_name: botData.hr_contact_name ?? "",
          hr_contact_email: botData.hr_contact_email ?? "",
          hr_contact_slack: botData.hr_contact_slack ?? "",
        });
        if (billingData?.plan) setCurrentPlan(billingData.plan);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [getToken]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveState("saving");
    setErrorMessage("");

    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${TEST_BOT_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          welcome_message: form.welcome_message,
          system_prompt: form.system_prompt,
          hr_contact_name: form.hr_contact_name,
          hr_contact_email: form.hr_contact_email,
          hr_contact_slack: form.hr_contact_slack,
        }),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const updated = await res.json();
      setForm((prev) => ({ ...prev, ...updated }));
      posthog.capture("bot_settings_saved", {
        bot_id: TEST_BOT_ID,
        has_system_prompt: !!form.system_prompt,
        has_welcome_message: !!form.welcome_message,
        has_hr_contact: !!form.hr_contact_name,
      });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save changes.";
      posthog.captureException(err);
      setErrorMessage(message);
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 4000);
    }
  }

  const plan = PLAN_DETAILS[currentPlan] ?? PLAN_DETAILS.free;

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-line-3">
        <h1 className="text-[15px] font-medium text-ink">Settings</h1>
        <UserButton />
      </div>

      <div className="max-w-225 mx-auto px-8 py-8">
        <div className="flex gap-10">
          {/* Sub-nav */}
          <nav className="w-40 shrink-0 flex flex-col gap-0.5 pt-0.5">
            {(["bot", "plan", "appearance"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left px-3 py-1.75 rounded-lg text-[13px] transition-colors ${
                  activeTab === tab
                    ? "bg-muted border border-line-3 font-medium text-ink"
                    : "text-ink-2 hover:text-ink hover:bg-muted/60"
                }`}
              >
                {tab === "bot" ? "Bot settings" : tab === "plan" ? "Plan" : "Appearance"}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">

        {/* ── Bot settings tab ── */}
        {activeTab === "bot" && (
          <>
            {loading ? (
              <p className="text-[13px] text-ink-3">Loading bot config…</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-8">
                {/* Bot identity */}
                <section>
                  <h2 className="text-[20px] font-medium text-ink mb-1">Bot identity</h2>
                  <p className="text-[13px] text-ink-2 mb-4">
                    How your bot introduces itself to new hires.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-medium text-ink mb-1.5">Bot name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Acme onboarding assistant"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-ink mb-1.5">Welcome message</label>
                      <textarea
                        name="welcome_message"
                        value={form.welcome_message}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Hi! I'm here to help you get started. Ask me anything about company policies, benefits, or your first week."
                        className={`${inputClass} resize-none`}
                      />
                      <p className="text-[12px] text-ink-3 mt-1.5">
                        Shown to new hires when they first open the chat.
                      </p>
                    </div>
                  </div>
                </section>

                {/* System prompt */}
                <section>
                  <h2 className="text-[20px] font-medium text-ink mb-1">System prompt</h2>
                  <p className="text-[13px] text-ink-2 mb-4">
                    Instructions that shape how the bot responds. Use this to set tone, focus areas, and what to avoid.
                  </p>
                  <textarea
                    name="system_prompt"
                    value={form.system_prompt}
                    onChange={handleChange}
                    rows={8}
                    placeholder="You are a helpful onboarding assistant for Acme Corp. Answer questions using only the provided company documents. Be friendly and concise. If you don't know something, say so and offer to connect the employee with HR."
                    className={`${inputClass} resize-y font-mono text-[12px]`}
                  />
                </section>

                {/* HR fallback contact */}
                <section>
                  <h2 className="text-[20px] font-medium text-ink mb-1">HR fallback contact</h2>
                  <p className="text-[13px] text-ink-2 mb-4">
                    When the bot can&apos;t answer a question, it will suggest reaching out to this person.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[13px] font-medium text-ink mb-1.5">Name</label>
                      <input type="text" name="hr_contact_name" value={form.hr_contact_name} onChange={handleChange} placeholder="Jane Smith" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-ink mb-1.5">Email</label>
                      <input type="email" name="hr_contact_email" value={form.hr_contact_email} onChange={handleChange} placeholder="jane@company.com" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-ink mb-1.5">Slack ID</label>
                      <input type="text" name="hr_contact_slack" value={form.hr_contact_slack} onChange={handleChange} placeholder="@janesmith" className={inputClass} />
                    </div>
                  </div>
                </section>

                {/* Save bar */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={saveState === "saving"}
                    className="bg-ember text-white text-[13px] font-medium px-5 py-2 rounded-full hover:opacity-80 disabled:opacity-50 transition-opacity"
                  >
                    {saveState === "saving" ? "Saving…" : "Save changes"}
                  </button>
                  {saveState === "saved" && (
                    <span className="flex items-center gap-1.5 text-[13px] text-success-tx">
                      <IconCheck size={13} />
                      Changes saved
                    </span>
                  )}
                  {saveState === "error" && (
                    <span className="text-[13px] text-danger-tx">
                      {errorMessage || "Something went wrong."}
                    </span>
                  )}
                </div>
              </form>
            )}
          </>
        )}

        {/* ── Appearance tab ── */}
        {activeTab === "appearance" && (
          <div>
            <h2
              className="text-ink mb-1"
              style={{ fontSize: "20px", fontWeight: 300, letterSpacing: "-0.02em" }}
            >
              Appearance
            </h2>
            <p className="text-[13px] text-ink-2 mb-8">
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
                    {/* Mini UI preview */}
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

                    {/* Label row */}
                    <div className="flex items-center gap-1.5">
                      <Icon size={13} className="text-ink-2" strokeWidth={1.75} />
                      <span
                        className="text-[13px]"
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

        {/* ── Plan tab ── */}
        {activeTab === "plan" && (
          <div className="space-y-6">
            {/* Current plan card */}
            <div className="rounded-xl border border-line-3 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[11px] text-ink-3 mb-1">Current plan</p>
                  <p className="text-[20px] font-medium text-ink">{plan.label}</p>
                  <p className="text-[13px] text-ink-2 mt-0.5">{plan.price}</p>
                </div>
                <Link
                  href="/pricing"
                  className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-full bg-ember text-white hover:opacity-80 transition-opacity shrink-0"
                >
                  {currentPlan === "free" ? "Upgrade plan" : "Change plan"}
                  <IconExternalLink size={12} />
                </Link>
              </div>

              <div className="border-t border-line-3 pt-4">
                <p className="text-[11px] text-ink-3 mb-3">What&apos;s included</p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-ink-2">
                      <IconCheck size={13} className="text-teal shrink-0" strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Usage summary */}
            <div className="rounded-xl border border-line-3 p-5">
              <p className="text-[13px] font-medium text-ink mb-4">Usage limits</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-lg px-3 py-2.5">
                  <p className="text-[11px] text-ink-3 mb-1">Documents</p>
                  <p className="text-[15px] font-medium text-ink">{plan.docsLimit}</p>
                </div>
                <div className="bg-muted rounded-lg px-3 py-2.5">
                  <p className="text-[11px] text-ink-3 mb-1">Messages</p>
                  <p className="text-[15px] font-medium text-ink">{plan.messagesLimit}</p>
                </div>
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
