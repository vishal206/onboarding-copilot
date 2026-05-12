"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { IconSparkles, IconFileText, IconBolt, IconChartBar, IconSearch, IconCheck } from "@tabler/icons-react";

const FEATURES = [
  {
    icon: IconFileText,
    title: "Upload your docs",
    description:
      "Drop in handbooks, SOPs, benefits guides, or any onboarding material. Supports PDF, Word, and plain text.",
  },
  {
    icon: IconBolt,
    title: "Instant AI answers",
    description:
      "New hires get accurate, cited answers from your own documents — no ticket queues, no waiting on HR.",
  },
  {
    icon: IconChartBar,
    title: "HR dashboard",
    description:
      "See which bots are active, how many messages were sent, and how employees are engaging across your org.",
  },
  {
    icon: IconSearch,
    title: "Track what new hires ask",
    description:
      "Spot knowledge gaps before they become churn. Review question logs to continuously improve your onboarding.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: 0,
    plan: "free",
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

export default function Home() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Nav */}
      <header className="border-b border-line-3 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[10px] bg-ember flex items-center justify-center shrink-0">
            <IconSparkles size={13} className="text-white" />
          </div>
          <span className="text-[15px] font-medium text-ink">Onboarding Co-Pilot</span>
        </div>
        <nav className="flex items-center gap-6 text-[13px] text-ink-2">
          <a href="#features" className="hover:text-ink transition-colors">Features</a>
          <Link href="/pricing" className="hover:text-ink transition-colors">Pricing</Link>
          <Link href="/sign-in" className="hover:text-ink transition-colors">Sign in</Link>
          <Link
            href="/sign-up"
            className="bg-ember text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-[13px] font-medium"
            onClick={() => posthog.capture("nav_signup_clicked")}
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-1.5 bg-ember-light text-ember-dark text-[11px] font-medium px-3 py-1 rounded-full mb-6">
            <IconSparkles size={11} />
            AI-powered onboarding
          </div>
          <h1 className="text-[44px] sm:text-[56px] font-medium text-ink leading-tight mb-6 tracking-tight">
            New hires get answers.
            <br />
            <span className="text-ember">HR gets their time back.</span>
          </h1>
          <p className="text-[17px] text-ink-2 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your onboarding docs once. Your new hires get an AI assistant
            that answers questions instantly — 24/7, from your own knowledge base.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sign-up"
              className="bg-ember text-white px-8 py-3.5 rounded-lg font-medium text-[15px] hover:opacity-90 transition-opacity"
              onClick={() => posthog.capture("hero_start_trial_clicked")}
            >
              Start free trial
            </Link>
            <Link
              href="/pricing"
              className="border border-line-2 text-ink px-8 py-3.5 rounded-lg font-medium text-[15px] hover:bg-muted transition-colors"
            >
              See pricing
            </Link>
          </div>
          <p className="mt-4 text-[12px] text-ink-3">No credit card required · Cancel anytime</p>
        </section>

        {/* Features */}
        <section id="features" className="bg-muted py-20 border-y border-line-3">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-[28px] font-medium text-ink mb-3">
                Everything your onboarding needs
              </h2>
              <p className="text-[15px] text-ink-2">
                Set up in minutes. Your new hires will wonder how they ever managed without it.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-surface rounded-xl border border-line-3 p-5">
                  <div className="w-8 h-8 rounded-lg bg-ember-light flex items-center justify-center mb-4">
                    <f.icon size={15} className="text-ember-dark" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-[15px] font-medium text-ink mb-2">{f.title}</h3>
                  <p className="text-[13px] text-ink-2 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-[28px] font-medium text-ink mb-3">
                Simple, transparent pricing
              </h2>
              <p className="text-[15px] text-ink-2">
                Choose the plan that fits your team. Upgrade or cancel anytime.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {PLANS.map((p) => (
                <div
                  key={p.plan}
                  className={`rounded-xl border p-6 flex flex-col ${
                    p.highlighted
                      ? "bg-ember border-ember text-white"
                      : "bg-surface border-line-3"
                  }`}
                >
                  {p.highlighted && (
                    <span className="text-[11px] font-medium text-white/70 mb-2 uppercase tracking-wide">
                      Most popular
                    </span>
                  )}
                  <h3 className={`text-[20px] font-medium mb-1 ${p.highlighted ? "text-white" : "text-ink"}`}>
                    {p.name}
                  </h3>
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
                  <Link
                    href="/sign-up"
                    className={`w-full py-2.5 rounded-lg font-medium text-[13px] text-center transition-colors block ${
                      p.highlighted
                        ? "bg-white text-ember hover:bg-ember-light"
                        : "bg-ember text-white hover:opacity-90"
                    }`}
                    onClick={() => posthog.capture("pricing_get_started_clicked", { plan: p.plan })}
                  >
                    {p.price === 0 ? "Start for free" : `Get ${p.name}`}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line-3 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[13px] text-ink-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-ember flex items-center justify-center">
              <IconSparkles size={10} className="text-white" />
            </div>
            <span className="font-medium text-ink-2">Onboarding Co-Pilot</span>
          </div>
          <nav className="flex gap-6">
            <Link href="/pricing" className="hover:text-ink transition-colors">Pricing</Link>
            <Link href="/sign-in" className="hover:text-ink transition-colors">Sign in</Link>
            <Link href="/sign-up" className="hover:text-ink transition-colors">Sign up</Link>
          </nav>
          <span>© {new Date().getFullYear()} Onboarding Co-Pilot</span>
        </div>
      </footer>
    </div>
  );
}
