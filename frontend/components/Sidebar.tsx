"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="w-[180px] shrink-0 flex flex-col bg-muted border-r border-line-3 px-3 py-4 h-screen sticky top-0">
      {/* Logo mark + product name */}
      <div className="flex items-center gap-2 px-[10px] mb-6">
        <div className="w-7 h-7 rounded-[10px] bg-ember flex items-center justify-center shrink-0">
          <IconSparkles size={13} className="text-white" />
        </div>
        <span className="text-[13px] font-medium text-ink leading-tight">
          Co-Pilot
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ label, href, exact, icon: Icon }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-2 px-[10px] py-[7px] rounded-lg text-[13px] transition-colors ${
                active
                  ? "bg-surface border border-line-3 font-medium text-ink"
                  : "text-ink-2 hover:text-ink hover:bg-surface/60"
              }`}
            >
              <Icon size={15} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Settings pinned to bottom */}
      <Link
        href="/dashboard/settings"
        className={`flex items-center gap-2 px-[10px] py-[7px] rounded-lg text-[13px] transition-colors ${
          pathname === "/dashboard/settings"
            ? "bg-surface border border-line-3 font-medium text-ink"
            : "text-ink-2 hover:text-ink hover:bg-surface/60"
        }`}
      >
        <IconSettings size={15} strokeWidth={1.75} />
        Settings
      </Link>
    </aside>
  );
}
