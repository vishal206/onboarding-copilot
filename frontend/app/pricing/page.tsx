"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { IconCheck, IconInfinity } from "@tabler/icons-react";
import AppLogo from "@/components/AppLogo";

const PLANS = [
  {
    name: "Free",
    price: 0,
    plan: "free",
    price_id: null,
    description: "Try it out",
    limits: "10 employees · 50 pages",
    features: [
      "Unlimited conversations",
      "Web chat channel",
      "10 employees covered",
      "50 pages indexed",
      "30-day chat history",
      "Community support",
    ],
  },
  {
    name: "Starter",
    price: 49,
    plan: "starter",
    price_id: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ?? "",
    description: "Small teams",
    limits: "50 employees · 500 pages",
    features: [
      "Unlimited conversations",
      "Web chat channel",
      "Slack & Teams (coming soon)",
      "50 employees covered",
      "500 pages indexed",
      "Remove 'Powered by' branding",
      "1-year chat history",
      "Email support",
      "Full analytics dashboard",
    ],
  },
  {
    name: "Growth",
    price: 149,
    plan: "growth",
    price_id: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID ?? "",
    highlighted: true,
    description: "Scaling companies",
    limits: "200 employees · 2,500 pages",
    features: [
      "Unlimited conversations",
      "Web chat channel",
      "Slack & Teams (coming soon)",
      "200 employees covered",
      "2,500 pages indexed",
      "Remove 'Powered by' branding",
      "1-year chat history",
      "Email support",
      "Full analytics dashboard",
    ],
  },
  {
    name: "Scale",
    price: 399,
    plan: "scale",
    price_id: process.env.NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID ?? "",
    description: "Enterprise",
    limits: "1,000 employees · 10,000 pages",
    features: [
      "Unlimited conversations",
      "Web chat channel",
      "Slack & Teams (coming soon)",
      "1,000 employees covered",
      "10,000 pages indexed",
      "Remove 'Powered by' branding",
      "Unlimited chat history",
      "SSO & custom domain",
      "Email support",
      "Full analytics dashboard",
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
        <Link href="/">
          <AppLogo size="lg" />
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center mb-2">
          <h1 className="text-[24px] font-medium text-ink mb-1">
            Simple, transparent pricing
          </h1>
          <p className="text-[14px] text-ink-2">
            Choose the plan that fits your team. Upgrade or cancel anytime.
          </p>
        </div>

        {/* Unlimited conversations callout */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <IconInfinity size={14} className="text-teal" strokeWidth={2} />
          <p className="text-[13px] font-medium text-teal">
            Unlimited conversations on every plan — no message caps, ever
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
                className={`rounded-xl border p-4 flex flex-col ${
                  p.highlighted
                    ? "bg-ember border-ember"
                    : "bg-surface border-line-3"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5 min-h-4">
                  {p.highlighted && (
                    <span className="text-[10px] font-medium text-white/70 uppercase tracking-wide">
                      Most popular
                    </span>
                  )}
                  {isCurrent && (
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        p.highlighted
                          ? "bg-white/20 text-white"
                          : "bg-teal-light text-teal-dark"
                      }`}
                    >
                      Current plan
                    </span>
                  )}
                </div>

                <h2 className={`text-[17px] font-medium mb-0.5 ${p.highlighted ? "text-white" : "text-ink"}`}>
                  {p.name}
                </h2>
                <p className={`text-[11px] mb-2 ${p.highlighted ? "text-white/60" : "text-ink-3"}`}>
                  {p.description}
                </p>

                <div className="flex items-end gap-1 mb-0.5">
                  {p.price === 0 ? (
                    <span className={`text-[26px] font-medium ${p.highlighted ? "text-white" : "text-ink"}`}>
                      Free
                    </span>
                  ) : (
                    <>
                      <span className={`text-[26px] font-medium ${p.highlighted ? "text-white" : "text-ink"}`}>
                        ${p.price}
                      </span>
                      <span className={`text-[12px] mb-1 ${p.highlighted ? "text-white/60" : "text-ink-3"}`}>
                        /mo
                      </span>
                    </>
                  )}
                </div>
                <p className={`text-[11px] mb-4 ${p.highlighted ? "text-white/50" : "text-ink-3"}`}>
                  {p.limits}
                </p>

                <ul className="space-y-1.5 mb-4 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-[12px]">
                      <IconCheck
                        size={12}
                        className={`mt-0.5 shrink-0 ${p.highlighted ? "text-white/70" : "text-teal"}`}
                        strokeWidth={2}
                      />
                      <span className={p.highlighted ? "text-white/90" : "text-ink-2"}>{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div
                    className={`w-full py-2 rounded-lg text-[12px] font-medium text-center ${
                      p.highlighted ? "bg-white/20 text-white" : "bg-muted text-ink-3"
                    }`}
                  >
                    Current plan
                  </div>
                ) : p.price_id ? (
                  <button
                    onClick={() => handleCheckout(p.plan, p.price_id as string)}
                    disabled={loading === p.plan}
                    className={`w-full py-2 rounded-lg text-[12px] font-medium cursor-pointer
                      transition-all duration-150
                      active:scale-95 active:brightness-95
                      disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
                      ${p.highlighted
                        ? "bg-white text-ember hover:bg-white/90 hover:shadow-md"
                        : "bg-ink text-surface hover:opacity-80 hover:shadow-md"
                      }`}
                  >
                    {loading === p.plan ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Redirecting…
                      </span>
                    ) : `Get ${p.name}`}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="text-center text-[12px] text-ink-3 mt-4">
          Starting at $49/mo · No message caps · Cancel anytime
        </p>
      </div>
    </main>
  );
}
