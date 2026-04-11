"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function SettingsPage() {
  const { getToken } = useAuth();
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

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${TEST_BOT_ID}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          id: data.id,
          name: data.name ?? "",
          welcome_message: data.welcome_message ?? "",
          system_prompt: data.system_prompt ?? "",
          hr_contact_name: data.hr_contact_name ?? "",
          hr_contact_email: data.hr_contact_email ?? "",
          hr_contact_slack: data.hr_contact_slack ?? "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveState("saving");
    setErrorMessage("");

    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bots/${TEST_BOT_ID}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name,
            welcome_message: form.welcome_message,
            system_prompt: form.system_prompt,
            hr_contact_name: form.hr_contact_name,
            hr_contact_email: form.hr_contact_email,
            hr_contact_slack: form.hr_contact_slack,
          }),
        },
      );

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const updated = await res.json();
      setForm((prev) => ({ ...prev, ...updated }));
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to save changes.",
      );
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 4000);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      {/* Top navigation bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-gray-500 hover:text-gray-800 text-sm"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Bot Settings</h1>
        </div>
        <UserButton />
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-gray-400 text-sm">Loading bot config...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-10">
            {/* Bot Identity */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                Bot Identity
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                How your bot introduces itself to new hires.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bot Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Acme Onboarding Assistant"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Welcome Message
                  </label>
                  <textarea
                    name="welcome_message"
                    value={form.welcome_message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g. Hi! I'm here to help you get started. Ask me anything about company policies, benefits, or your first week."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Shown to new hires when they first open the chat.
                  </p>
                </div>
              </div>
            </section>

            {/* System Prompt */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                System Prompt
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Instructions that shape how the bot responds. Use this to set
                tone, focus areas, and what to avoid.
              </p>
              <textarea
                name="system_prompt"
                value={form.system_prompt}
                onChange={handleChange}
                rows={8}
                placeholder={`e.g. You are a helpful onboarding assistant for Acme Corp. Answer questions using only the provided company documents. Be friendly and concise. If you don't know something, say so and offer to connect the employee with HR.`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </section>

            {/* HR Fallback Contact */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                HR Fallback Contact
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                When the bot can&apos;t answer a question, it will suggest
                reaching out to this person.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="hr_contact_name"
                    value={form.hr_contact_name}
                    onChange={handleChange}
                    placeholder="e.g. Jane Smith"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="hr_contact_email"
                    value={form.hr_contact_email}
                    onChange={handleChange}
                    placeholder="jane@company.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slack ID
                  </label>
                  <input
                    type="text"
                    name="hr_contact_slack"
                    value={form.hr_contact_slack}
                    onChange={handleChange}
                    placeholder="@janesmith"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Save bar */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={saveState === "saving"}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                {saveState === "saving" ? "Saving..." : "Save Changes"}
              </button>
              {saveState === "saved" && (
                <span className="text-green-600 text-sm font-medium">
                  Changes saved!
                </span>
              )}
              {saveState === "error" && (
                <span className="text-red-500 text-sm">
                  {errorMessage || "Something went wrong."}
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
