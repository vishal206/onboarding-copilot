import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-01-30",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
  autocapture: false, // stops Pageview + Pageleave auto capture
  capture_pageview: false, // explicitly disables Pageview
  capture_pageleave: false, // explicitly disables Pageleave
  person_profiles: "never", // stops Set person properties
});
