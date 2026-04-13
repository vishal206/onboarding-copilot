"use client";

import Link from "next/link";
import posthog from "posthog-js";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-24">
      <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
        Onboarding Co-Pilot
      </h1>
      <p className="text-xl text-gray-500 mb-10 text-center max-w-xl">
        AI-powered onboarding assistant. Upload your docs, get an instant Q&A
        bot for new hires.
      </p>
      <div className="flex gap-4">
        <Link
          href="/sign-up"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          onClick={() => posthog.capture("get_started_clicked")}
        >
          Get Started Free
        </Link>
        <Link
          href="/sign-in"
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          Sign In
        </Link>
      </div>
    </main>
  );
}
