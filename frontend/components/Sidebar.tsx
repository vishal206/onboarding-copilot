"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { PLAN_LABELS } from "@/lib/plans";
import {
  IconLayoutDashboard,
  IconFileText,
  IconAlertCircle,
  IconSettings,
  IconSparkles,
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { label: "Overview",  href: "/dashboard",           icon: IconLayoutDashboard, exact: true  },
  { label: "Documents", href: "/dashboard/documents", icon: IconFileText,        exact: false },
  { label: "Fallbacks", href: "/dashboard/fallbacks", icon: IconAlertCircle,     exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<string>("free");

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

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const planLabel = PLAN_LABELS[currentPlan] ?? PLAN_LABELS.free;

  return (
    <aside className="w-[240px] shrink-0 flex flex-col bg-muted border-r border-line-3 px-4 py-5 h-screen sticky top-0">
      {/* Logo mark + product name */}
      <div className="flex items-center gap-2.5 px-3 mb-7">
        <div className="w-7 h-7 rounded-md bg-[#111] flex items-center justify-center shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-teal" />
        </div>
        <span className="text-[15px] font-medium text-ink leading-tight">
          Co-Pilot
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, exact, icon: Icon }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[15px] transition-colors ${
                active
                  ? "bg-surface border border-line-3 font-medium text-ink"
                  : "text-ink-2 hover:text-ink hover:bg-surface/60"
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Settings pinned to bottom */}
      <Link
        href="/dashboard/settings"
        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[15px] transition-colors ${
          pathname === "/dashboard/settings"
            ? "bg-surface border border-line-3 font-medium text-ink"
            : "text-ink-2 hover:text-ink hover:bg-surface/60"
        }`}
      >
        <IconSettings size={18} strokeWidth={1.75} />
        Settings
      </Link>

      {/* User profile card */}
      <div className="mt-3 bg-surface border border-line-3 rounded-xl px-3 pt-2.5 pb-2 flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <UserButton />
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-medium text-ink truncate leading-tight">
              {user?.fullName ?? user?.firstName ?? ""}
            </span>
            <span className="text-[11px] text-ink-3 truncate leading-tight mt-0.5">
              {user?.primaryEmailAddress?.emailAddress ?? ""}
            </span>
          </div>
        </div>

        {/* Plan pill */}
        <Link
          href="/pricing"
          className={`flex items-center gap-2 w-full rounded-full px-3 py-1.5 text-[12px] font-medium transition-opacity hover:opacity-80 ${planLabel.className}`}
        >
          <IconSparkles size={13} />
          {planLabel.label} plan
        </Link>
      </div>
    </aside>
  );
}
