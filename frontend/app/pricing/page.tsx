"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";
import AppLogo from "@/components/AppLogo";

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
    <main className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="border-b border-line-3 px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard">
          <AppLogo size="lg" />
        </Link>
        <Link href="/dashboard" className="text-[13px] text-ink-2 hover:text-ink transition-colors">
          ← Back to dashboard
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-[28px] font-medium text-ink mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-[15px] text-ink-2">
            Choose the plan that fits your team. Upgrade or cancel anytime.
          </p>
        </div>

        {error && (
          <div className="mb-8 text-center text-[13px] text-danger-tx bg-danger-bg border border-danger-tx/20 rounded-lg py-3 px-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {PLANS.map((p) => {
            const isCurrent = currentPlan === p.plan;
            return (
              <div
                key={p.plan}
                className={`rounded-xl border p-6 flex flex-col ${
                  p.highlighted
                    ? "bg-ember border-ember"
                    : "bg-surface border-line-3"
                }`}
              >
                <div className="flex items-center gap-2 mb-2 min-h-5">
                  {p.highlighted && (
                    <span className="text-[11px] font-medium text-white/70 uppercase tracking-wide">
                      Most popular
                    </span>
                  )}
                  {isCurrent && (
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        p.highlighted
                          ? "bg-white/20 text-white"
                          : "bg-teal-light text-teal-dark"
                      }`}
                    >
                      Current plan
                    </span>
                  )}
                </div>

                <h2 className={`text-[20px] font-medium mb-1 ${p.highlighted ? "text-white" : "text-ink"}`}>
                  {p.name}
                </h2>
                <div className="flex items-end gap-1 mb-6">
                  {p.price === 0 ? (
                    <span className={`text-[32px] font-medium ${p.highlighted ? "text-white" : "text-ink"}`}>
                      Free
                    </span>
                  ) : (
                    <>
                      <span className={`text-[32px] font-medium ${p.highlighted ? "text-white" : "text-ink"}`}>
                        ${p.price}
                      </span>
                      <span className={`text-[13px] mb-1.5 ${p.highlighted ? "text-white/60" : "text-ink-3"}`}>
                        /mo
                      </span>
                    </>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px]">
                      <IconCheck
                        size={13}
                        className={`mt-0.5 shrink-0 ${p.highlighted ? "text-white/70" : "text-teal"}`}
                        strokeWidth={2}
                      />
                      <span className={p.highlighted ? "text-white/90" : "text-ink-2"}>{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div
                    className={`w-full py-2.5 rounded-lg text-[13px] font-medium text-center ${
                      p.highlighted ? "bg-white/20 text-white" : "bg-muted text-ink-3"
                    }`}
                  >
                    Current plan
                  </div>
                ) : p.price_id ? (
                  <button
                    onClick={() => handleCheckout(p.plan, p.price_id as string)}
                    disabled={loading === p.plan}
                    className={`w-full py-2.5 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                      p.highlighted
                        ? "bg-white text-ember hover:bg-ember-light"
                        : "bg-ember text-white hover:opacity-90"
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
