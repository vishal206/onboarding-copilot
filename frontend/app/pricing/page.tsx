"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: 0,
    plan: "free",
    price_id: null,
    features: [
      "1 onboarding bot",
      "3 document uploads",
      "50 messages / month",
      "Community support",
    ],
  },
  {
    name: "Starter",
    price: 299,
    plan: "starter",
    price_id: "price_1TNmML2YapZL05LZDdnsXsD3",
    features: [
      "1 onboarding bot",
      "25 document uploads",
      "500 messages / month",
      "Email support",
      "Analytics dashboard",
    ],
  },
  {
    name: "Growth",
    price: 499,
    plan: "growth",
    price_id: "price_1TNmNh2YapZL05LZa8793rGx",
    highlighted: true,
    features: [
      "5 onboarding bots",
      "100 document uploads",
      "2,000 messages / month",
      "Priority email support",
      "Advanced analytics",
      "Custom bot branding",
    ],
  },
  {
    name: "Scale",
    price: 799,
    plan: "scale",
    price_id: "price_1TNmOL2YapZL05LZ4NxJlMCY",
    features: [
      "Unlimited onboarding bots",
      "Unlimited document uploads",
      "Unlimited messages",
      "Dedicated support",
      "Advanced analytics",
      "Custom bot branding",
      "SSO & team management",
    ],
  },
];

export default function PricingPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

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

  async function handleCheckout(plan: string, price_id: string) {
    setLoading(plan);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/billing/create-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ plan, price_id }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail ?? "Something went wrong");
      }

      const { url } = await res.json();
      router.push(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold text-gray-800">
          Onboarding Co-Pilot
        </Link>
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          ← Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-500">
            Choose the plan that fits your team. Upgrade or cancel anytime.
          </p>
        </div>

        {error && (
          <div className="mb-8 text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg py-3 px-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {PLANS.map((p) => {
            const isCurrent = currentPlan === p.plan;
            return (
              <div
                key={p.plan}
                className={`rounded-2xl border p-8 flex flex-col ${
                  p.highlighted
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105"
                    : "bg-white border-gray-200 text-gray-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-2 min-h-5">
                  {p.highlighted && (
                    <span className="text-xs font-semibold uppercase tracking-widest text-indigo-200">
                      Most popular
                    </span>
                  )}
                  {isCurrent && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.highlighted ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700"}`}>
                      Current plan
                    </span>
                  )}
                </div>

                <h2
                  className={`text-2xl font-bold mb-1 ${
                    p.highlighted ? "text-white" : "text-gray-900"
                  }`}
                >
                  {p.name}
                </h2>
                <div className="flex items-end gap-1 mb-6">
                  {p.price === 0 ? (
                    <span className={`text-4xl font-extrabold ${p.highlighted ? "text-white" : "text-gray-900"}`}>
                      Free
                    </span>
                  ) : (
                    <>
                      <span className={`text-4xl font-extrabold ${p.highlighted ? "text-white" : "text-gray-900"}`}>
                        ${p.price}
                      </span>
                      <span className={`text-sm mb-1 ${p.highlighted ? "text-indigo-200" : "text-gray-400"}`}>
                        /mo
                      </span>
                    </>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 ${p.highlighted ? "text-indigo-200" : "text-indigo-500"}`}>
                        ✓
                      </span>
                      <span className={p.highlighted ? "text-indigo-100" : "text-gray-600"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div
                    className={`w-full py-3 rounded-xl font-semibold text-sm text-center ${
                      p.highlighted
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    Current plan
                  </div>
                ) : p.price_id ? (
                  <button
                    onClick={() => handleCheckout(p.plan, p.price_id as string)}
                    disabled={loading === p.plan}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                      p.highlighted
                        ? "bg-white text-indigo-600 hover:bg-indigo-50"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {loading === p.plan ? "Redirecting…" : `Get ${p.name}`}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
