"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { IconCheck } from "@tabler/icons-react";
import { useBotId } from "@/contexts/BotContext";

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

const inputClass =
  "w-full border border-line-2 rounded-lg px-3 py-2.5 text-[15px] bg-surface text-ink focus:outline-none focus:ring-[3px] focus:ring-teal/25 focus:border-teal/50 transition-shadow placeholder:text-ink-3";

export default function BotPage() {
  const { getToken } = useAuth();
  const { botId, botLoading } = useBotId();
  const [form, setForm] = useState<BotConfig>({
    id: "",
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

  useEffect(() => {
    if (botLoading || !botId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${botId}`)
      .then((r) => r.json())
      .then((botData) => {
        setForm({
          id: botData.id,
          name: botData.name ?? "",
          welcome_message: botData.welcome_message ?? "",
          system_prompt: botData.system_prompt ?? "",
          hr_contact_name: botData.hr_contact_name ?? "",
          hr_contact_email: botData.hr_contact_email ?? "",
          hr_contact_slack: botData.hr_contact_slack ?? "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [botId, botLoading]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!botId) return;
    setSaveState("saving");
    setErrorMessage("");

    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${botId}`, {
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
        bot_id: botId,
        has_system_prompt: !!form.system_prompt,
        has_welcome_message: !!form.welcome_message,
        has_hr_contact: !!form.hr_contact_name,
      });
      window.dispatchEvent(new CustomEvent("bot-settings-updated"));
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

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-8 py-8">
        {loading ? (
          <p className="text-[15px] text-ink-3">Loading bot config…</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            <section>
              <h2 className="text-[24px] font-medium text-ink mb-1">Bot identity</h2>
              <p className="text-[15px] text-ink-2 mb-4">
                How your bot introduces itself to new hires.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-[15px] font-medium text-ink mb-1.5">Bot name</label>
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
                  <label className="block text-[15px] font-medium text-ink mb-1.5">Welcome message</label>
                  <textarea
                    name="welcome_message"
                    value={form.welcome_message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Hi! I'm here to help you get started. Ask me anything about company policies, benefits, or your first week."
                    className={`${inputClass} resize-none`}
                  />
                  <p className="text-[13px] text-ink-3 mt-1.5">
                    Shown to new hires when they first open the chat.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[24px] font-medium text-ink mb-1">System prompt</h2>
              <p className="text-[15px] text-ink-2 mb-4">
                Instructions that shape how the bot responds. Use this to set tone, focus areas, and what to avoid.
              </p>
              <textarea
                name="system_prompt"
                value={form.system_prompt}
                onChange={handleChange}
                rows={8}
                placeholder="You are a helpful onboarding assistant for Acme Corp. Answer questions using only the provided company documents. Be friendly and concise. If you don't know something, say so and offer to connect the employee with HR."
                className={`${inputClass} resize-y font-mono text-[13px]`}
              />
            </section>

            <section>
              <h2 className="text-[24px] font-medium text-ink mb-1">HR fallback contact</h2>
              <p className="text-[15px] text-ink-2 mb-4">
                When the bot can&apos;t answer a question, it will suggest reaching out to this person.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[15px] font-medium text-ink mb-1.5">Name</label>
                  <input type="text" name="hr_contact_name" value={form.hr_contact_name} onChange={handleChange} placeholder="Jane Smith" className={inputClass} />
                </div>
                <div>
                  <label className="block text-[15px] font-medium text-ink mb-1.5">Email</label>
                  <input type="email" name="hr_contact_email" value={form.hr_contact_email} onChange={handleChange} placeholder="jane@company.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-[15px] font-medium text-ink mb-1.5">Slack ID</label>
                  <input type="text" name="hr_contact_slack" value={form.hr_contact_slack} onChange={handleChange} placeholder="@janesmith" className={inputClass} />
                </div>
              </div>
            </section>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={saveState === "saving"}
                className="bg-ember text-white text-[15px] font-medium px-5 py-2.5 rounded-full hover:opacity-80 disabled:opacity-50 transition-opacity"
              >
                {saveState === "saving" ? "Saving…" : "Save changes"}
              </button>
              {saveState === "saved" && (
                <span className="flex items-center gap-1.5 text-[15px] text-success-tx">
                  <IconCheck size={15} />
                  Changes saved
                </span>
              )}
              {saveState === "error" && (
                <span className="text-[15px] text-danger-tx">
                  {errorMessage || "Something went wrong."}
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
