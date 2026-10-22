"use client";

import SpringHeading from "@/components/SpringHeading";

import { useCallback, useEffect, useState } from "react";
import { toBn } from "@/components/CountUp";

type Analytics = {
  active: Array<{ id: number; studentName: string; examTitle: string; module: string; lastSeen: string }>;
  totalAttempts: number;
  pending: number;
  passRate: number;
  failRate: number;
  completionRate: number;
  modules: Array<{ module: string; attempts: number; avgBand: number | null }>;
  generatedAt: string;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/analytics");
    if (!res.ok) { setError("অ্যাক্সেস নেই"); return; }
    setData((await res.json()) as Analytics);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  if (!data) {
    return <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="card rounded-lg p-5"><div className="shimmer h-8 w-16 rounded" /><div className="shimmer mt-3 h-3 w-24 rounded" /></div>)}{error && <p className="text-rose-600">{error}</p>}</div>;
  }

  const stats = [
    { label: "লাইভ পরীক্ষার্থী", value: toBn(data.active.length) },
    { label: "মোট অ্যাটেম্পট", value: toBn(data.totalAttempts) },
    { label: "Pending রিভিউ", value: toBn(data.pending) },
    { label: "পাস রেট", value: `${toBn(data.passRate)}%` },
    { label: "ফেল রেট", value: `${toBn(data.failRate)}%` },
    { label: "কমপ্লিশন রেট", value: `${toBn(data.completionRate)}%` },
  ];

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <SpringHeading as="h1" className="text-2xl font-bold">লাইভ মনিটরিং ও অ্যানালিটিক্স</SpringHeading>
          <p className="mt-1 text-sm text-[#6C757D]">প্রতি ১৫ সেকেন্ডে স্বয়ংক্রিয় রিফ্রেশ</p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-xs font-bold text-green-700"><span className="anim-pulse-ring h-2 w-2 rounded-full bg-green-600" />LIVE</span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => <div key={s.label} className="card rounded-lg p-5"><p className="text-2xl font-extrabold">{s.value}</p><p className="mt-1 text-xs text-[#6C757D]">{s.label}</p></div>)}
      </div>
      <section className="card rounded-lg p-6">
        <SpringHeading as="h2" className="font-bold">মডিউলভিত্তিক গড় ব্যান্ড</SpringHeading>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {data.modules.map((m) => <div key={m.module} className="rounded-md bg-[#F8F9FA] p-4"><p className="text-xs font-bold capitalize text-[#6C757D]">{m.module}</p><p className="mt-1 text-2xl font-extrabold">{m.avgBand !== null ? toBn(m.avgBand) : "–"}</p><p className="text-[11px] text-[#6C757D]">{toBn(m.attempts)}টি স্কোরড</p></div>)}
        </div>
      </section>
      <section className="card overflow-hidden rounded-lg">
        <SpringHeading as="h2" className="border-b border-black/[0.06] px-5 py-4 font-bold">এই মুহূর্তে চলমান টেস্ট</SpringHeading>
        <table className="w-full text-sm">
          <thead className="bg-[#F8F9FA] text-left text-xs text-[#6C757D]"><tr><th className="px-5 py-3">শিক্ষার্থী</th><th className="px-5 py-3">টেস্ট</th><th className="px-5 py-3">মডিউল</th><th className="px-5 py-3 text-right">সর্বশেষ সক্রিয়</th></tr></thead>
          <tbody className="divide-y divide-black/[0.05]">
            {data.active.map((a) => <tr key={a.id}><td className="px-5 py-3 font-bold">{a.studentName || "অতিথি"}</td><td className="px-5 py-3">{a.examTitle}</td><td className="px-5 py-3 capitalize text-[#6C757D]">{a.module}</td><td className="px-5 py-3 text-right text-xs text-[#6C757D]">{new Date(a.lastSeen).toLocaleTimeString()}</td></tr>)}
            {data.active.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-[#6C757D]">এই মুহূর্তে কেউ টেস্ট দিচ্ছে না।</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
