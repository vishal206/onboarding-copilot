"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import AppLogo from "@/components/AppLogo";
import { APP_NAME, APP_EMAIL } from "@/lib/brand";
import {
  IconArrowRight,
  IconCheck,
  IconFileText,
  IconBolt,
  IconChartBar,
  IconSearch,
  IconPlayerPlay,
  IconPlus,
  IconMinus,
} from "@tabler/icons-react";

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
      "See which bots are active, how many messages were sent, and how employees engage across your org.",
  },
  {
    icon: IconSearch,
    title: "Track what new hires ask",
    description:
      "Spot knowledge gaps before they become churn. Review question logs to continuously improve onboarding.",
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

const TICKER_ITEMS = [
  { text: "new hire answers ", green: false },
  { text: "instantly", green: true },
  { text: " · zero HR tickets · deploy in ", green: false },
  { text: "5 minutes", green: true },
  { text: " · knowledge gaps ", green: false },
  { text: "surfaced automatically", green: true },
  { text: " · onboarding that ", green: false },
  { text: "scales", green: true },
  { text: " · ", green: false },
];

const HOW_STEPS = [
  {
    num: "01",
    title: "Upload your docs",
    description:
      "Drop in your employee handbook, SOPs, benefits guides, and any onboarding material. PDF, Word, or plain text — we handle it all.",
  },
  {
    num: "02",
    title: "Deploy in one click",
    description:
      "We generate a custom AI assistant trained on your documents. Share a link with your new hires — no app downloads, no accounts required.",
  },
  {
    num: "03",
    title: "Hires get instant answers",
    description:
      "New hires chat with the bot 24/7 and get cited answers pulled directly from your documents. HR gets notified of trends and gaps.",
  },
];

const FAQ_ITEMS = [
  {
    q: "How long does setup take?",
    a: "Under 10 minutes. Upload your docs, review the bot's name and greeting, and share a link. No engineering required.",
  },
  {
    q: "What file types are supported?",
    a: "PDF, Word (.docx), and plain text files. More formats — including Notion pages and Google Docs — are coming soon.",
  },
  {
    q: "Can I update documents after launching?",
    a: "Yes. Add, remove, or replace documents at any time from your dashboard. The bot reflects changes immediately.",
  },
  {
    q: "Is my company data secure?",
    a: "All documents are encrypted at rest and in transit. We never use your data to train shared models. Your knowledge base stays private.",
  },
  {
    q: "Can new hires use the bot without signing up?",
    a: "Yes. You share a link and they can start chatting instantly — no account creation needed on their end.",
  },
  {
    q: "How does billing work?",
    a: "Monthly subscription with no contracts. Upgrade, downgrade, or cancel at any time. Unused message credits don't roll over.",
  },
];

const NAV_LINKS = [
  { label: "Features", id: "features" },
  { label: "How it works", id: "how" },
  { label: "Pricing", id: "pricing" },
  { label: "FAQ", id: "faq" },
];

function OrganicHeroScene() {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none"
      style={{ height: "62%" }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, transparent 0%, #f2f2f0 35%, #e8e8e5 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-8%",
          left: "-30%",
          width: "160%",
          height: "85%",
          background:
            "radial-gradient(ellipse 70% 50% at 50% 100%, #d0d0cc 0%, #dcdcda 28%, transparent 62%)",
          filter: "blur(22px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "-18%",
          width: "68%",
          height: "90%",
          background:
            "radial-gradient(ellipse 65% 58% at 35% 100%, #c0c0bc 0%, #d2d2ce 32%, transparent 65%)",
          filter: "blur(16px)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-6%",
          right: "-22%",
          width: "72%",
          height: "95%",
          background:
            "radial-gradient(ellipse 65% 54% at 60% 100%, #c4c4c0 0%, #d4d4d0 30%, transparent 65%)",
          filter: "blur(20px)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-6%",
          left: "18%",
          width: "64%",
          height: "62%",
          background:
            "radial-gradient(ellipse 80% 68% at 50% 100%, #b4b4b0 0%, #c8c8c4 28%, transparent 58%)",
          filter: "blur(10px)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "48%",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.55) 55%, transparent 100%)",
        }}
      />
      {/* Green sphere 1 */}
      <div
        style={{
          position: "absolute",
          bottom: "36%",
          left: "17%",
          width: "88px",
          height: "88px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 33% 28%, #dcfce7 0%, #4ade80 45%, #15803d 100%)",
          boxShadow:
            "0 0 55px 22px rgba(74,222,128,0.42), 0 0 110px 45px rgba(74,222,128,0.15)",
        }}
      />
      {/* Green sphere 2 */}
      <div
        style={{
          position: "absolute",
          bottom: "44%",
          right: "26%",
          width: "58px",
          height: "58px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 33% 28%, #dcfce7 0%, #4ade80 45%, #15803d 100%)",
          boxShadow:
            "0 0 38px 16px rgba(74,222,128,0.38), 0 0 75px 28px rgba(74,222,128,0.13)",
        }}
      />
      {/* Green sphere 3 */}
      <div
        style={{
          position: "absolute",
          bottom: "26%",
          right: "11%",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 33% 28%, #dcfce7 0%, #4ade80 45%, #16a34a 100%)",
          boxShadow:
            "0 0 24px 10px rgba(74,222,128,0.32), 0 0 50px 20px rgba(74,222,128,0.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, white 0%, transparent 12%, transparent 88%, white 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b"
      style={{ borderColor: "rgba(0,0,0,0.07)" }}
    >
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-6"
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="text-[15px] font-medium"
          style={{ color: "#111", lineHeight: 1.4 }}
        >
          {q}
        </span>
        <span
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: open ? "#111" : "rgba(0,0,0,0.06)",
            color: open ? "white" : "#555",
          }}
        >
          {open ? <IconMinus size={12} strokeWidth={2.5} /> : <IconPlus size={12} strokeWidth={2.5} />}
        </span>
      </button>
      <div
        className="overflow-hidden transition-all"
        style={{
          maxHeight: open ? "200px" : "0",
          opacity: open ? 1 : 0,
          transition: "max-height 0.35s ease, opacity 0.25s ease",
        }}
      >
        <p
          className="pb-5 text-[14px] leading-relaxed"
          style={{ color: "#888" }}
        >
          {a}
        </p>
      </div>
    </div>
  );
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Home() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Full-width header ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8"
        style={{
          height: "60px",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <AppLogo size="md" textClassName="text-[#111]" />
        </Link>

        {/* Center links */}
        <nav className="hidden sm:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.id)}
              className="px-4 py-1.5 rounded-full text-[13px] transition-colors hover:bg-gray-100 cursor-pointer"
              style={{ color: "#555", background: "none", border: "none" }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sign in */}
        <Link
          href="/sign-in"
          className="text-[13px] font-medium px-4 py-2 rounded-full transition-colors hover:bg-gray-50 shrink-0"
          style={{ color: "#111", border: "1px solid rgba(0,0,0,0.12)" }}
        >
          Sign in
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "100svh" }}>
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-36">
          <div
            className="inline-flex items-center gap-2 mb-8 text-[12px] font-medium px-3 py-1.5 rounded-full"
            style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#4ADE80" }} />
            AI-powered onboarding
          </div>

          <h1
            style={{
              fontSize: "clamp(50px, 7.5vw, 92px)",
              fontWeight: 300,
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              color: "#111111",
              maxWidth: "820px",
            }}
          >
            New hires get answers.
            <br />
            <span style={{ color: "#4ADE80" }}>HR gets time back.</span>
          </h1>

          <p
            className="mt-6"
            style={{ fontSize: "14px", color: "#999", maxWidth: "380px", lineHeight: 1.65 }}
          >
            Upload your onboarding docs once. Your new hires get an AI assistant
            that answers questions instantly — 24/7, from your knowledge base.
          </p>

          <Link
            href="/sign-up"
            className="mt-8 inline-flex items-center gap-2.5 text-white"
            style={{
              background: "#111111",
              borderRadius: "9999px",
              padding: "14px 28px",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}
            onClick={() => posthog.capture("hero_start_trial_clicked")}
          >
            Get started
            <IconArrowRight size={13} />
          </Link>

          <p className="mt-3 text-[11px]" style={{ color: "#ccc" }}>
            No credit card required · Cancel anytime
          </p>
        </div>

        <OrganicHeroScene />

      </section>

      {/* ── Marquee ticker ── */}
      <div
        className="overflow-hidden"
        style={{
          borderTop: "1px solid rgba(0,0,0,0.06)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "22px 0",
          background: "white",
        }}
      >
        <div className="flex whitespace-nowrap animate-marquee">
          {[0, 1].map((i) => (
            <span key={i} className="flex items-baseline shrink-0" style={{ paddingRight: "80px" }}>
              {TICKER_ITEMS.map((item, j) => (
                <span
                  key={j}
                  style={{
                    fontSize: "clamp(30px, 4.5vw, 52px)",
                    fontWeight: 300,
                    letterSpacing: "-0.025em",
                    color: item.green ? "#4ADE80" : "#111111",
                  }}
                >
                  {item.text}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section id="how" className="py-28" style={{ background: "white" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16 reveal">
            <h2
              style={{
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 300,
                letterSpacing: "-0.025em",
                color: "#111",
                lineHeight: 1.1,
              }}
            >
              Up and running in minutes
            </h2>
            <p className="mt-3 text-[14px]" style={{ color: "#aaa" }}>
              No engineering, no integrations, no waiting. Three steps and you're live.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "20px", overflow: "hidden" }}>
            {HOW_STEPS.map((step, i) => (
              <div
                key={step.num}
                className="reveal p-8 md:p-10 flex flex-col gap-4"
                style={{
                  background: "white",
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <span
                  style={{
                    fontSize: "48px",
                    fontWeight: 200,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    color: "#4ADE80",
                  }}
                >
                  {step.num}
                </span>
                <h3
                  className="text-[17px] font-medium"
                  style={{ color: "#111" }}
                >
                  {step.title}
                </h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "#aaa" }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28" style={{ background: "#fafafa" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14 reveal">
            <h2
              style={{
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 300,
                letterSpacing: "-0.025em",
                color: "#111",
                lineHeight: 1.1,
              }}
            >
              Everything your onboarding needs
            </h2>
            <p className="mt-3 text-[14px]" style={{ color: "#aaa" }}>
              Set up in minutes. Your new hires will wonder how they ever managed without it.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="rounded-2xl p-6 reveal"
                style={{
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.07)",
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "#f0fdf4" }}
                >
                  <f.icon size={16} style={{ color: "#16a34a" }} strokeWidth={1.75} />
                </div>
                <h3 className="text-[15px] font-medium mb-2" style={{ color: "#111" }}>
                  {f.title}
                </h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "#aaa" }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-28" style={{ background: "white" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14 reveal">
            <h2
              style={{
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 300,
                letterSpacing: "-0.025em",
                color: "#111",
                lineHeight: 1.1,
              }}
            >
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-[14px]" style={{ color: "#aaa" }}>
              Choose the plan that fits your team. Upgrade or cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {PLANS.map((p, i) => (
              <div
                key={p.plan}
                className="rounded-2xl p-6 flex flex-col reveal"
                style={{
                  ...(p.highlighted
                    ? { background: "#111111", border: "1px solid #111" }
                    : { background: "white", border: "1px solid rgba(0,0,0,0.08)" }),
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                {p.highlighted && (
                  <span
                    className="text-[10px] font-medium uppercase tracking-widest mb-2"
                    style={{ color: "#4ADE80" }}
                  >
                    Most popular
                  </span>
                )}
                <h3
                  className="text-[20px] font-medium mb-1"
                  style={{ color: p.highlighted ? "white" : "#111" }}
                >
                  {p.name}
                </h3>
                <div className="flex items-end gap-1 mb-7">
                  {p.price === 0 ? (
                    <span
                      className="text-[32px] font-light"
                      style={{ color: p.highlighted ? "white" : "#111" }}
                    >
                      Free
                    </span>
                  ) : (
                    <>
                      <span
                        className="text-[32px] font-light"
                        style={{ color: p.highlighted ? "white" : "#111" }}
                      >
                        ${p.price}
                      </span>
                      <span
                        className="text-[13px] mb-2"
                        style={{ color: p.highlighted ? "rgba(255,255,255,0.4)" : "#ccc" }}
                      >
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
                        className="mt-0.5 shrink-0"
                        style={{ color: "#4ADE80" }}
                        strokeWidth={2.5}
                      />
                      <span style={{ color: p.highlighted ? "rgba(255,255,255,0.75)" : "#888" }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/sign-up"
                  className="w-full py-2.5 rounded-full text-[13px] font-medium text-center transition-opacity block hover:opacity-80"
                  style={
                    p.highlighted
                      ? { background: "#4ADE80", color: "#111" }
                      : { background: "#111", color: "white" }
                  }
                  onClick={() => posthog.capture("pricing_get_started_clicked", { plan: p.plan })}
                >
                  {p.price === 0 ? "Start for free" : `Get ${p.name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-28" style={{ background: "#fafafa" }}>
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-14 reveal">
            <h2
              style={{
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 300,
                letterSpacing: "-0.025em",
                color: "#111",
                lineHeight: 1.1,
              }}
            >
              Common questions
            </h2>
            <p className="mt-3 text-[14px]" style={{ color: "#aaa" }}>
              Everything you need to know before getting started.
            </p>
          </div>

          <div
            className="reveal rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", padding: "0 28px" }}
          >
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>

          <p className="text-center mt-8 text-[13px]" style={{ color: "#bbb" }}>
            Still have questions?{" "}
            <a href="mailto:hello@onboardingcopilot.com" className="underline hover:text-[#111] transition-colors" style={{ color: "#888" }}>
              Email us
            </a>
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-8 py-10"
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)", background: "white" }}
      >
        <div
          className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ fontSize: "13px", color: "#bbb" }}
        >
          <div className="flex items-center gap-2">
            <AppLogo size="sm" textClassName="text-[#555]" />
          </div>
          <nav className="flex gap-6">
            <button
              onClick={() => scrollTo("pricing")}
              className="hover:text-[#111] transition-colors cursor-pointer"
              style={{ background: "none", border: "none", color: "inherit", fontSize: "inherit" }}
            >
              Pricing
            </button>
            <Link href="/sign-in" className="hover:text-[#111] transition-colors">
              Sign in
            </Link>
            <Link href="/sign-up" className="hover:text-[#111] transition-colors">
              Sign up
            </Link>
          </nav>
          <span>© {new Date().getFullYear()} {APP_NAME}</span>
        </div>
      </footer>
    </div>
  );
}
