"use client";

import SpringHeading from "@/components/SpringHeading";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toBn } from "@/components/CountUp";

export default function StartExamCard({
  examId,
  hasQuestions,
  durationMinutes,
}: {
  examId: number;
  hasQuestions: boolean;
  durationMinutes: number;
}) {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setName(d.user.nameBn || d.user.nameEn || "");
      })
      .catch(() => {});
  }, []);
  const [error, setError] = useState("");

  const start = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("আপনার নাম লিখুন");
      return;
    }
    sessionStorage.setItem("mt_student_name", trimmed);
    router.push(`/exams/${examId}/take`);
  };

  return (
    <div className="sticky top-24 rounded-lg border border-red-200 card p-7">
      <SpringHeading as="h2" className="text-lg font-semibold">পরীক্ষা শুরু করুন</SpringHeading>
      <p className="mt-2 text-sm text-[#6C757D]">
        নাম লিখুন — রেজিস্ট্রেশন লাগবে না। টাইমার চলবে{" "}
        {toBn(durationMinutes)} মিনিট।
      </p>
      <label className="mt-5 block text-sm font-medium text-slate-700">
        আপনার নাম
      </label>
      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
        onKeyDown={(e) => e.key === "Enter" && start()}
        placeholder="যেমন: রাহিম উদ্দিন"
        className="mt-2 w-full rounded-md border border-slate-300 bg-[#F8F9FA] px-4 py-3 text-sm outline-none transition focus:border-[#E51A24] focus:ring-2 focus:ring-red-100"
      />
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      <button
        onClick={start}
        disabled={!hasQuestions}
        className="mt-5 w-full rounded-md btn-red py-3.5 font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
      >
        {hasQuestions ? "এখনই শুরু করুন" : "প্রশ্ন যোগ করা হয়নি"}
      </button>
      <p className="mt-4 text-center text-xs text-slate-500">
        শুরু করলেই টাইমার চালু হয়ে যাবে
      </p>
    </div>
  );
}
