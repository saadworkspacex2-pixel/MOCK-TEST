"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";

const NAV = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: "chart", area: "all" },
  { href: "/admin/exams", label: "পরীক্ষা ম্যানেজ", icon: "doc", area: "exams" },
  { href: "/admin/grading", label: "গ্রেডিং স্টুডিও", icon: "pen", area: "grading" },
  { href: "/admin/students", label: "স্টুডেন্ট CRM", icon: "users", area: "students" },
  { href: "/admin/analytics", label: "লাইভ অ্যানালিটিক্স", icon: "chart", area: "analytics" },
  { href: "/admin/pages", label: "পেজ বিল্ডার", icon: "screen", area: "pages" },
  { href: "/admin/theme", label: "থিম ও ফন্ট", icon: "bulb", area: "theme" },
  { href: "/admin/media", label: "মিডিয়া ভল্ট", icon: "play", area: "media" },
  { href: "/admin/resources", label: "রিসোর্স", icon: "book", area: "pages" },
  { href: "/admin/results", label: "ফলাফল", icon: "trophy", area: "exams" },
  { href: "/admin/settings", label: "সেটিংস ও SEO", icon: "globe", area: "settings" },
  { href: "/admin/staff", label: "স্টাফ ও রোল", icon: "shield", area: "staff" },
];

const ROLE_AREAS: Record<string, string[]> = {
  super: ["all", "exams", "grading", "students", "analytics", "pages", "theme", "media", "settings", "staff"],
  exam: ["all", "exams", "media", "analytics"],
  evaluator: ["all", "grading", "students", "analytics"],
  content: ["all", "pages", "theme", "media", "settings"],
};

export default function AdminShell({
  children,
  role = "super",
  adminName = "Admin",
}: {
  children: ReactNode;
  role?: string;
  adminName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const visibleNav = NAV.filter((n) => (ROLE_AREAS[role] ?? ["all"]).includes(n.area));

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  const nav = (
    <nav className="flex max-h-[calc(100vh-4rem)] flex-col gap-1 overflow-y-auto p-4">
      {visibleNav.map((n) => {
        const active =
          n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-all ${
              active
                ? "bg-[#E51A24]/[0.08] text-[#E51A24] ring-1 ring-red-200"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon name={n.icon} size={17} />
            {n.label}
          </Link>
        );
      })}
      <div className="mt-4 border-t border-black/[0.07] pt-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-4 py-3 text-sm text-[#6C757D] transition hover:bg-slate-100 hover:text-slate-900"
        >
          মূল সাইট দেখুন
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm text-rose-600 transition hover:bg-rose-50"
        >
          লগআউট
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-black/[0.07] glass px-4 lg:pl-72">
        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 lg:hidden"
          aria-label="menu"
        >
          {open ? "" : ""}
        </button>
        <h1 className="text-sm font-semibold text-slate-700">
          অ্যাডমিন <span className="text-[#E51A24]">প্যানেল</span>
        </h1>
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-[#E51A24]" title={adminName}>
          ● অনলাইন
        </span>
      </header>

      {/* sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-black/[0.07] card lg:block">
        <div className="flex h-16 items-center border-b border-black/[0.07] px-5">
          <Logo />
        </div>
        {nav}
      </aside>

      {/* sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setOpen(false)}
          />
          <aside className="anim-fade-up absolute inset-y-0 left-0 w-72 border-r border-black/[0.07] bg-white">
            <div className="flex h-16 items-center justify-between border-b border-black/[0.07] px-5">
              <Logo />
              <button onClick={() => setOpen(false)}></button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <main className="px-4 pt-24 pb-16 sm:px-6 lg:pl-72">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
