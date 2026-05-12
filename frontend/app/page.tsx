"use client";

import Link from "next/link";
import posthog from "posthog-js";

const FEATURES = [
  {
    icon: "📄",
    title: "Upload your docs",
    description:
      "Drop in handbooks, SOPs, benefits guides, or any onboarding material. Supports PDF, Word, and plain text.",
  },
  {
    icon: "⚡",
    title: "Instant AI answers",
    description:
      "New hires get accurate, cited answers from your own documents — no ticket queues, no waiting on HR.",
  },
  {
    icon: "📊",
    title: "HR dashboard",
    description:
      "See which bots are active, how many messages were sent, and how employees are engaging across your org.",
  },
  {
    icon: "🔍",
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-gray-900">Onboarding Co-Pilot</span>
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition">Features</a>
          <Link href="/pricing" className="hover:text-gray-900 transition">Pricing</Link>
          <Link href="/sign-in" className="hover:text-gray-900 transition">Sign in</Link>
          <Link
            href="/sign-up"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            onClick={() => posthog.capture("nav_signup_clicked")}
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full mb-6">
            AI-powered onboarding
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            New hires get answers.
            <br />
            <span className="text-indigo-600">HR gets their time back.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Upload your onboarding docs once. Your new hires get an AI assistant
            that answers questions instantly — 24/7, from your own knowledge base.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
              onClick={() => posthog.capture("hero_start_trial_clicked")}
            >
              Start free trial
            </Link>
            <Link
              href="/pricing"
              className="border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition"
            >
              See pricing
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">No credit card required · Cancel anytime</p>
        </section>

        {/* Features */}
        <section id="features" className="bg-gray-50 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Everything your onboarding needs
              </h2>
              <p className="text-lg text-gray-500">
                Set up in minutes. Your new hires will wonder how they ever managed without it.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-gray-500">
                Choose the plan that fits your team. Upgrade or cancel anytime.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {PLANS.map((p) => (
                <div
                  key={p.plan}
                  className={`rounded-2xl border p-8 flex flex-col ${
                    p.highlighted
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105"
                      : "bg-white border-gray-200 text-gray-800"
                  }`}
                >
                  {p.highlighted && (
                    <span className="text-xs font-semibold uppercase tracking-widest text-indigo-200 mb-2">
                      Most popular
                    </span>
                  )}
                  <h3
                    className={`text-2xl font-bold mb-1 ${
                      p.highlighted ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {p.name}
                  </h3>
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
                        <span className={`mt-0.5 ${p.highlighted ? "text-indigo-200" : "text-indigo-500"}`}>✓</span>
                        <span className={p.highlighted ? "text-indigo-100" : "text-gray-600"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/sign-up"
                    className={`w-full py-3 rounded-xl font-semibold text-sm text-center transition-all block ${
                      p.highlighted
                        ? "bg-white text-indigo-600 hover:bg-indigo-50"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
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
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <span className="font-semibold text-gray-700">Onboarding Co-Pilot</span>
          <nav className="flex gap-6">
            <Link href="/pricing" className="hover:text-gray-700 transition">Pricing</Link>
            <Link href="/sign-in" className="hover:text-gray-700 transition">Sign in</Link>
            <Link href="/sign-up" className="hover:text-gray-700 transition">Sign up</Link>
          </nav>
          <span>© {new Date().getFullYear()} Onboarding Co-Pilot</span>
        </div>
      </footer>
    </div>
  );
}
