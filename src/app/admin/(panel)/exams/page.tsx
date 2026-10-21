"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toBn } from "@/components/CountUp";

type Exam = {
  id: number;
  title: string;
  category: string;
  durationMinutes: number;
  negativeMark: number;
  isLive: boolean;
  createdAt: string;
};

export default function AdminExamsPage() {
  const [rows, setRows] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = () =>
    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => setRows(d))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const toggleLive = async (e: Exam) => {
    setBusy(e.id);
    await fetch(`/api/exams/${e.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLive: !e.isLive }),
    });
    await load();
    setBusy(null);
  };

  const remove = async (e: Exam) => {
    if (
      !confirm(
        `"${e.title}" মুছে ফেলবেন? এর সব প্রশ্ন ও ফলাফলও মুছে যাবে।`,
      )
    )
      return;
    setBusy(e.id);
    await fetch(`/api/exams/${e.id}`, { method: "DELETE" });
    await load();
    setBusy(null);
  };

  return (
    <div>
      <div className="anim-fade-up flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">পরীক্ষা ম্যানেজ</h1>
          <p className="mt-1 text-sm text-[#6C757D]">
            পরীক্ষা তৈরি, সম্পাদনা, লাইভ/অফ ও প্রশ্ন ব্যবস্থাপনা
          </p>
        </div>
        <Link
          href="/admin/exams/new"
          className="rounded-md btn-red px-5 py-2.5 text-sm font-bold text-white transition"
        >
          + নতুন পরীক্ষা
        </Link>
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card rounded-lg p-5">
              <div className="shimmer h-4 w-1/2 rounded" />
              <div className="shimmer mt-2.5 h-3 w-1/3 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="anim-fade-up delay-100 mt-8 overflow-hidden rounded-lg border border-black/[0.07]">
          <table className="w-full text-sm">
            <thead className="bg-white text-left text-xs text-[#6C757D]">
              <tr>
                <th className="px-5 py-3.5">পরীক্ষা</th>
                <th className="hidden px-5 py-3.5 sm:table-cell">বিভাগ</th>
                <th className="hidden px-5 py-3.5 text-right md:table-cell">
                  সময়
                </th>
                <th className="px-5 py-3.5 text-center">স্ট্যাটাস</th>
                <th className="px-5 py-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium">{e.title}</td>
                  <td className="hidden px-5 py-4 sm:table-cell">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {e.category}
                    </span>
                  </td>
                  <td className="hidden px-5 py-4 text-right text-[#6C757D] md:table-cell">
                    {toBn(e.durationMinutes)} মি
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => toggleLive(e)}
                      disabled={busy === e.id}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        e.isLive
                          ? "bg-red-50 text-[#E51A24] hover:bg-red-100"
                          : "bg-slate-200 text-[#6C757D] hover:bg-slate-200"
                      }`}
                    >
                      {e.isLive ? "● লাইভ" : "○ অফ"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/exams/${e.id}`}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-200"
                      >
                        সম্পাদনা
                      </Link>
                      <button
                        onClick={() => remove(e)}
                        disabled={busy === e.id}
                        className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                      >
                        মুছুন
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-14 text-center text-[#6C757D]"
                  >
                    কোনো পরীক্ষা নেই —{" "}
                    <Link
                      href="/admin/exams/new"
                      className="text-[#E51A24] hover:underline"
                    >
                      প্রথম পরীক্ষাটি তৈরি করুন
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
