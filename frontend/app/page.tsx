"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import AppLogo from "@/components/AppLogo";
import PixelFlow from "@/components/PixelFlow";
import { APP_NAME, APP_EMAIL } from "@/lib/brand";
import {
  IconArrowRight,
  IconCheck,
  IconFileText,
  IconBolt,
  IconChartBar,
  IconSearch,
  IconPlus,
  IconMinus,
  IconSun,
  IconMoon,
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
      "Unlimited conversations",
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
    features: [
      "Unlimited conversations",
      "50 employees covered",
      "500 pages indexed",
      "Remove branding",
      "Email support",
      "Full analytics",
    ],
  },
  {
    name: "Growth",
    price: 149,
    plan: "growth",
    highlighted: true,
    features: [
      "Unlimited conversations",
      "200 employees covered",
      "2,500 pages indexed",
      "Remove branding",
      "Email support",
      "Full analytics",
    ],
  },
  {
    name: "Scale",
    price: 399,
    plan: "scale",
    features: [
      "Unlimited conversations",
      "1,000 employees covered",
      "10,000 pages indexed",
      "SSO & custom domain",
      "Unlimited chat history",
      "Email support",
      "Full analytics",
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
    a: "Monthly subscription with no contracts. Upgrade, downgrade, or cancel at any time. All plans include unlimited conversations — you're only gated on employees covered and pages indexed.",
  },
];

const NAV_LINKS = [
  { label: "How it works", id: "how" },
  { label: "Features", id: "features" },
  { label: "Pricing", id: "pricing" },
  { label: "FAQ", id: "faq" },
];

const ACCENT = "#4ECDC4";

function getColors(light: boolean) {
  return {
    HEADING: light ? "#111111" : "#F0F0F0",
    MUTED: light ? "rgba(30,70,70,0.78)" : "rgba(200,230,232,0.82)",
    TEXT_SHADOW: light ? "none" : "0 2px 20px rgba(0,0,0,0.8)",
    CARD: light ? "rgba(78,205,196,0.05)" : "rgba(78,205,196,0.04)",
    CARD_BORDER: light ? "rgba(78,205,196,0.22)" : "rgba(78,205,196,0.12)",
    PAGE_BG: light ? "#f4f4f2" : "#0d0d0d",
    NAV_BG: light ? "rgba(244,244,242,0.85)" : "rgba(20,20,20,0.55)",
    NAV_BORDER: light ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)",
    NAV_TEXT: light ? "rgba(30,30,30,0.75)" : "rgba(240,240,240,0.75)",
    MARQUEE_BG: light ? "rgba(244,244,242,0.6)" : "rgba(13,13,13,0.5)",
    MARQUEE_BORDER: light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)",
    FOOTER_BG: light ? "rgba(236,236,234,0.8)" : "rgba(13,13,13,0.6)",
    FOOTER_BORDER: light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)",
    FOOTER_TEXT: light ? "rgba(60,100,100,0.55)" : "rgba(130,200,200,0.5)",
    FAQ_BORDER: light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
    TOGGLE_BG: light ? "rgba(244,244,242,0.85)" : "rgba(20,20,20,0.55)",
    HERO_LEFT_BG: light ? "#f4f4f2" : "#0d0d0d",
    HERO_SUBTEXT: light ? "rgba(30,70,70,0.60)" : "rgba(220,235,235,0.65)",
    PRICE_MUTED: light ? "rgba(30,100,100,0.45)" : "rgba(130,200,200,0.5)",
    FAQ_STILL: light ? "rgba(30,100,100,0.45)" : "rgba(130,200,200,0.5)",
  };
}

function FaqItem({
  q,
  a,
  colors,
}: {
  q: string;
  a: string;
  colors: ReturnType<typeof getColors>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: colors.FAQ_BORDER }}>
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-6"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-[15px] font-medium" style={{ color: colors.HEADING, lineHeight: 1.4 }}>
          {q}
        </span>
        <span
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: open ? ACCENT : colors.FAQ_BORDER,
            color: open ? "#0a0a0a" : colors.MUTED,
          }}
        >
          {open ? <IconMinus size={12} strokeWidth={2.5} /> : <IconPlus size={12} strokeWidth={2.5} />}
        </span>
      </button>
      <div
        className="overflow-hidden"
        style={{
          maxHeight: open ? "200px" : "0",
          opacity: open ? 1 : 0,
          transition: "max-height 0.35s ease, opacity 0.25s ease",
        }}
      >
        <p className="pb-5 text-[14px] leading-relaxed" style={{ color: colors.MUTED }}>
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
  const [lightMode, setLightMode] = useState(false);
  const C = getColors(lightMode);

  function toggleTheme() {
    const next = !lightMode;
    setLightMode(next);
    localStorage.setItem("theme", next ? "light" : "dark");
  }

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") setLightMode(true);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="relative min-h-screen"
      style={{
        background: C.PAGE_BG,
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >

      {/* ── All page content ── */}
      <div className="relative z-10">

        {/* ── Header ── */}
        <header
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8"
          style={{
            height: "64px",
            background: "transparent",
          }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 shrink-0 px-4 py-2 rounded-full transition-all cursor-pointer"
              style={{
                background: C.NAV_BG,
                border: `1px solid ${C.NAV_BORDER}`,
                backdropFilter: "blur(12px)",
              }}
            >
              <AppLogo size="md" textClassName={lightMode ? "text-gray-900" : "text-white"} />
            </button>

            <nav className="hidden sm:flex items-center gap-1.5">
              {NAV_LINKS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollTo(item.id)}
                  className="px-4 py-2 rounded-full text-[13px] cursor-pointer transition-all"
                  style={{
                    color: C.NAV_TEXT,
                    background: C.NAV_BG,
                    border: `1px solid ${C.NAV_BORDER}`,
                    backdropFilter: "blur(12px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = C.HEADING;
                    e.currentTarget.style.background = lightMode ? "rgba(220,220,218,0.90)" : "rgba(40,40,40,0.70)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = C.NAV_TEXT;
                    e.currentTarget.style.background = C.NAV_BG;
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Light / dark toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer"
              style={{
                background: C.TOGGLE_BG,
                border: `1px solid ${C.NAV_BORDER}`,
                backdropFilter: "blur(12px)",
                color: C.NAV_TEXT,
              }}
              title={lightMode ? "Switch to dark mode" : "Switch to light mode"}
            >
              {lightMode ? <IconMoon size={15} strokeWidth={1.75} /> : <IconSun size={15} strokeWidth={1.75} />}
            </button>

            <Link
              href="/sign-in"
              className="text-[13px] font-medium px-5 py-2 rounded-full shrink-0 transition-all hover:opacity-90"
              style={{
                color: C.NAV_TEXT,
                background: C.NAV_BG,
                border: `1px solid ${C.NAV_BORDER}`,
                backdropFilter: "blur(12px)",
              }}
            >
              Sign in
            </Link>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="relative flex overflow-hidden" style={{ minHeight: "100svh" }}>

          {/* Left half — background + text pinned to bottom-left */}
          <div
            className="relative flex flex-col justify-end"
            style={{ flex: "0 0 40%", background: C.HERO_LEFT_BG, padding: "0 48px 72px", transition: "background 0.3s ease" }}
          >
            <h1
              style={{
                fontSize: "clamp(36px, 4.5vw, 72px)",
                fontWeight: 600,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: C.HEADING,
                maxWidth: "560px",
              }}
            >
              New hires get answers.
              <br />
              HR gets time back.
            </h1>

            <p
              className="mt-5"
              style={{ fontSize: "14px", color: C.HERO_SUBTEXT, maxWidth: "380px", lineHeight: 1.75 }}
            >
              Upload your onboarding docs once. Your new hires get an AI assistant
              that answers questions instantly — 24/7, from your knowledge base.
            </p>

            <div className="flex items-center gap-4 mt-10">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-85"
                style={{
                  background: ACCENT,
                  color: "#0a0a0a",
                  borderRadius: "9999px",
                  padding: "13px 28px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
                onClick={() => posthog.capture("hero_start_trial_clicked")}
              >
                Get started free
                <IconArrowRight size={13} />
              </Link>
              <span style={{ fontSize: "11px", color: C.HERO_SUBTEXT }}>
                No credit card required
              </span>
            </div>
          </div>

          {/* Right half — PixelFlow animation, hard cut */}
          <div className="relative" style={{ flex: "0 0 60%" }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <PixelFlow />
            </div>
          </div>

        </section>

        {/* ── Marquee ticker ── */}
        <div
          className="overflow-hidden"
          style={{
            borderTop: `1px solid ${C.MARQUEE_BORDER}`,
            borderBottom: `1px solid ${C.MARQUEE_BORDER}`,
            padding: "22px 0",
            background: C.MARQUEE_BG,
            backdropFilter: "blur(8px)",
            transition: "background 0.3s ease",
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
                      color: item.green ? ACCENT : C.HEADING,
                      textShadow: C.TEXT_SHADOW,
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
        <section id="how" className="py-28">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16 reveal">
              <h2
                style={{
                  fontSize: "clamp(28px, 3.5vw, 42px)",
                  fontWeight: 300,
                  letterSpacing: "-0.025em",
                  color: C.HEADING,
                  lineHeight: 1.1,
                  textShadow: C.TEXT_SHADOW,
                }}
              >
                Up and running in minutes
              </h2>
              <p className="mt-3 text-[14px]" style={{ color: C.MUTED, textShadow: C.TEXT_SHADOW }}>
                No engineering, no integrations, no waiting. Three steps and you're live.
              </p>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-px"
              style={{ background: "rgba(78,205,196,0.2)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: "20px", overflow: "hidden" }}
            >
              {HOW_STEPS.map((step, i) => (
                <div
                  key={step.num}
                  className="reveal p-8 md:p-10 flex flex-col gap-4"
                  style={{ background: C.CARD, backdropFilter: "blur(12px)", transitionDelay: `${i * 100}ms` }}
                >
                  <span style={{ fontSize: "48px", fontWeight: 200, letterSpacing: "-0.04em", lineHeight: 1, color: ACCENT }}>
                    {step.num}
                  </span>
                  <h3 className="text-[17px] font-medium" style={{ color: C.HEADING }}>
                    {step.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: C.MUTED }}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-28">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14 reveal">
              <h2
                style={{
                  fontSize: "clamp(28px, 3.5vw, 42px)",
                  fontWeight: 300,
                  letterSpacing: "-0.025em",
                  color: C.HEADING,
                  lineHeight: 1.1,
                  textShadow: C.TEXT_SHADOW,
                }}
              >
                Everything your onboarding needs
              </h2>
              <p className="mt-3 text-[14px]" style={{ color: C.MUTED, textShadow: C.TEXT_SHADOW }}>
                Set up in minutes. Your new hires will wonder how they ever managed without it.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className="rounded-2xl p-6 reveal"
                  style={{
                    background: C.CARD,
                    border: `1px solid ${C.CARD_BORDER}`,
                    backdropFilter: "blur(12px)",
                    transitionDelay: `${i * 80}ms`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(78,205,196,0.12)" }}
                  >
                    <f.icon size={16} style={{ color: ACCENT }} strokeWidth={1.75} />
                  </div>
                  <h3 className="text-[15px] font-medium mb-2" style={{ color: C.HEADING }}>
                    {f.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: C.MUTED }}>
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-28">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14 reveal">
              <h2
                style={{
                  fontSize: "clamp(28px, 3.5vw, 42px)",
                  fontWeight: 300,
                  letterSpacing: "-0.025em",
                  color: C.HEADING,
                  lineHeight: 1.1,
                  textShadow: C.TEXT_SHADOW,
                }}
              >
                Simple, transparent pricing
              </h2>
              <p className="mt-3 text-[14px]" style={{ color: C.MUTED, textShadow: C.TEXT_SHADOW }}>
                Unlimited conversations on every plan. Starts at $49/mo — upgrade or cancel anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {PLANS.map((p, i) => (
                <div
                  key={p.plan}
                  className="rounded-2xl p-6 flex flex-col reveal"
                  style={{
                    ...(p.highlighted
                      ? { background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.3)" }
                      : { background: C.CARD, border: `1px solid ${C.CARD_BORDER}` }),
                    backdropFilter: "blur(12px)",
                    transitionDelay: `${i * 80}ms`,
                  }}
                >
                  {p.highlighted && (
                    <span className="text-[10px] font-medium uppercase tracking-widest mb-2" style={{ color: ACCENT }}>
                      Most popular
                    </span>
                  )}
                  <h3 className="text-[20px] font-medium mb-1" style={{ color: C.HEADING }}>
                    {p.name}
                  </h3>
                  <div className="flex items-end gap-1 mb-7">
                    {p.price === 0 ? (
                      <span className="text-[32px] font-light" style={{ color: C.HEADING }}>Free</span>
                    ) : (
                      <>
                        <span className="text-[32px] font-light" style={{ color: C.HEADING }}>${p.price}</span>
                        <span className="text-[13px] mb-2" style={{ color: C.PRICE_MUTED }}>/mo</span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px]">
                        <IconCheck size={13} className="mt-0.5 shrink-0" style={{ color: ACCENT }} strokeWidth={2.5} />
                        <span style={{ color: C.MUTED }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/sign-up"
                    className="w-full py-2.5 rounded-full text-[13px] font-medium text-center block transition-opacity hover:opacity-80"
                    style={
                      p.highlighted
                        ? { background: ACCENT, color: "#0a0a0a" }
                        : { background: "rgba(78,205,196,0.08)", color: C.HEADING, border: `1px solid ${C.CARD_BORDER}` }
                    }
                    onClick={() => posthog.capture("pricing_get_started_clicked", { plan: p.plan })}
                  >
                    {p.price === 0 ? "Start for free" : `Get ${p.name}`}
                  </Link>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/pricing" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] transition-colors"
                style={{ color: C.MUTED }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.HEADING)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.MUTED)}
              >
                See full plan details
                <span style={{ color: ACCENT }}>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-28">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-14 reveal">
              <h2
                style={{
                  fontSize: "clamp(28px, 3.5vw, 42px)",
                  fontWeight: 300,
                  letterSpacing: "-0.025em",
                  color: C.HEADING,
                  lineHeight: 1.1,
                  textShadow: C.TEXT_SHADOW,
                }}
              >
                Common questions
              </h2>
              <p className="mt-3 text-[14px]" style={{ color: C.MUTED, textShadow: C.TEXT_SHADOW }}>
                Everything you need to know before getting started.
              </p>
            </div>

            <div
              className="reveal rounded-2xl overflow-hidden"
              style={{
                background: C.CARD,
                border: `1px solid ${C.CARD_BORDER}`,
                backdropFilter: "blur(12px)",
                padding: "0 28px",
              }}
            >
              {FAQ_ITEMS.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} colors={C} />
              ))}
            </div>

            <p className="text-center mt-8 text-[13px]" style={{ color: C.FAQ_STILL }}>
              Still have questions?{" "}
              <a
                href={`mailto:${APP_EMAIL}`}
                className="underline transition-colors"
                style={{ color: C.MUTED }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.HEADING)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.MUTED)}
              >
                Email us
              </a>
            </p>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          className="px-8 py-10"
          style={{
            borderTop: `1px solid ${C.FOOTER_BORDER}`,
            background: C.FOOTER_BG,
            backdropFilter: "blur(12px)",
            transition: "background 0.3s ease",
          }}
        >
          <div
            className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4"
            style={{ fontSize: "13px", color: C.FOOTER_TEXT }}
          >
            <div className="flex items-center gap-2">
              <AppLogo size="sm" textClassName={lightMode ? "text-gray-500" : "text-white/60"} />
            </div>
            <nav className="flex gap-6">
              <button
                onClick={() => scrollTo("pricing")}
                className="cursor-pointer transition-colors hover:text-white"
                style={{ background: "none", border: "none", color: "inherit", fontSize: "inherit" }}
              >
                Pricing
              </button>
              <Link href="/sign-in" className="hover:text-white transition-colors">Sign in</Link>
              <Link href="/sign-up" className="hover:text-white transition-colors">Sign up</Link>
            </nav>
            <span>© {new Date().getFullYear()} {APP_NAME}</span>
          </div>
        </footer>

      </div>{/* end z-10 content wrapper */}
    </div>
  );
}
