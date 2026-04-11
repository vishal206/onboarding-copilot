"use client";

import { useState, useEffect } from "react";

interface HRContact {
  hr_contact_name: string;
  hr_contact_email: string;
  hr_contact_slack: string;
}

export default function HRContactForm({ botId }: { botId: string }) {
  const [form, setForm] = useState<HRContact>({
    hr_contact_name: "",
    hr_contact_email: "",
    hr_contact_slack: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots/${botId}/hr-contact`)
      .then((r) => r.json())
      .then((data) =>
        setForm({
          hr_contact_name: data.hr_contact_name ?? "",
          hr_contact_email: data.hr_contact_email ?? "",
          hr_contact_slack: data.hr_contact_slack ?? "",
        }),
      )
      .catch(() => {});
  }, [botId]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/bots/${botId}/hr-contact`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hr_contact_name: form.hr_contact_name || null,
          hr_contact_email: form.hr_contact_email || null,
          hr_contact_slack: form.hr_contact_slack || null,
        }),
      },
    );
    const data = await res.json();
    setForm({
      hr_contact_name: data.hr_contact_name ?? "",
      hr_contact_email: data.hr_contact_email ?? "",
      hr_contact_slack: data.hr_contact_slack ?? "",
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 text-black">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">HR Contact</h3>
      <p className="text-sm text-gray-500 mb-5">
        When the bot can&apos;t answer a question, it will direct users to this
        person and show their contact card.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            placeholder="e.g. Jane Smith"
            value={form.hr_contact_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, hr_contact_name: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="e.g. hr@company.com"
            value={form.hr_contact_email}
            onChange={(e) =>
              setForm((f) => ({ ...f, hr_contact_email: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slack ID
          </label>
          <input
            type="text"
            placeholder="e.g. @jane or U012AB3CD"
            value={form.hr_contact_slack}
            onChange={(e) =>
              setForm((f) => ({ ...f, hr_contact_slack: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">Saved!</span>
        )}
      </div>
    </div>
  );
}
