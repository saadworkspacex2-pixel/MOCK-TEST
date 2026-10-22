"use client";

import SpringHeading from "@/components/SpringHeading";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ExamRules } from "@/lib/examRules";

export type ExamFormData = {
  title: string;
  description: string;
  category: string;
  module: string;
  durationMinutes: number;
  marksPerQuestion: number;
  negativeMark: number;
  isLive: boolean;
  rules: ExamRules;
};

const CATEGORY_OPTIONS = [
  "বিসিএস প্রিলি",
  "ব্যাংক নিয়োগ",
  "প্রাইমারি শিক্ষক",
  "সাধারণ জ্ঞান",
  "ইংরেজি",
  "গণিত",
  "বাংলা",
  "বিজ্ঞান ও প্রযুক্তি",
  "কম্পিউটার",
];

export default function ExamForm({
  examId,
  initial,
}: {
  examId?: number;
  initial?: ExamFormData;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ExamFormData>(
    initial ?? {
      title: "",
      description: "",
      category: CATEGORY_OPTIONS[0],
      module: "mcq",
      durationMinutes: 20,
      marksPerQuestion: 1,
      negativeMark: 0,
      isLive: true,
      rules: { showExplanations: true },
    },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof ExamFormData>(k: K, v: ExamFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleRule = (k: keyof ExamRules) =>
    setForm((f) => ({ ...f, rules: { ...f.rules, [k]: !f.rules[k] } }));

  const save = async () => {
    if (!form.title.trim()) {
      setError("পরীক্ষার নাম লিখুন");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch(examId ? `/api/exams/${examId}` : "/api/exams", {
      method: examId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "সংরক্ষণ ব্যর্থ হয়েছে");
      return;
    }
    if (examId) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } else {
      const data = await res.json();
      router.push(`/admin/exams/${data.id}`);
    }
  };

  const input =
    "mt-2 w-full rounded-md border border-slate-300 bg-[#F8F9FA] px-4 py-3 text-sm outline-none transition focus:border-[#E51A24] focus:ring-2 focus:ring-red-100";

  return (
    <div className="rounded-lg border border-black/[0.07] card p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">
            পরীক্ষার নাম *
          </label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="যেমন: সাধারণ জ্ঞান মডেল টেস্ট — ১"
            className={input}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">বিবরণ</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="পরীক্ষা সম্পর্কে সংক্ষিপ্ত বিবরণ…"
            className={input}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            মডিউল (টেস্টের ধরন)
          </label>
          <select
            value={form.module}
            onChange={(e) => set("module", e.target.value)}
            className={input}
          >
            <option value="mcq">MCQ টেস্ট (এক পেইনে সব প্রশ্ন)</option>
            <option value="reading">
              Reading (প্যাসেজ বাঁয়ে, প্রশ্ন ডানে, ব্যান্ড স্কোর)
            </option>
            <option value="listening">
              Listening (অডিও + প্রশ্ন, ব্যান্ড স্কোর)
            </option>
            <option value="writing">
              Writing (টাস্ক + লেখার জায়গা, ইনস্ট্রাক্টর রিভিউ)
            </option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">বিভাগ</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={input}
          >
            {[...new Set([...CATEGORY_OPTIONS, form.category])].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            সময় (মিনিট)
          </label>
          <input
            type="number"
            min={1}
            value={form.durationMinutes}
            onChange={(e) => set("durationMinutes", Number(e.target.value))}
            className={input}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            প্রতি প্রশ্নে নম্বর
          </label>
          <input
            type="number"
            step="0.5"
            min={0}
            value={form.marksPerQuestion}
            onChange={(e) => set("marksPerQuestion", Number(e.target.value))}
            className={input}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            নেগেটিভ মার্ক (প্রতি ভুলে)
          </label>
          <input
            type="number"
            step="0.05"
            min={0}
            value={form.negativeMark}
            onChange={(e) => set("negativeMark", Number(e.target.value))}
            className={input}
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
            <button
              type="button"
              onClick={() => set("isLive", !form.isLive)}
              className={`relative h-7 w-13 rounded-full transition-colors ${
                form.isLive ? "bg-[#E51A24]" : "bg-slate-200"
              }`}
              style={{ width: 52 }}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                  form.isLive ? "left-7" : "left-1"
                }`}
              />
            </button>
            {form.isLive ? "লাইভ আছে" : "লাইভ নয়"}
          </label>
        </div>
      </div>
      <div className="mt-7 rounded-md border border-black/[0.07] bg-[#F8F9FA] p-5">
        <SpringHeading as="h3" className="text-sm font-bold">প্রোক্টরিং ও পরীক্ষার আচরণ</SpringHeading>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["antiCheat", "ট্যাব বদলালে স্বয়ংক্রিয় জমা (anti-cheat)"],
              ["shuffleQuestions", "প্রশ্ন এলোমেলো করুন"],
              ["shuffleOptions", "অপশন এলোমেলো করুন"],
              ["showExplanations", "ফলাফলে ব্যাখ্যা দেখান"],
              ["hideResults", "ইনস্ট্রাক্টর রিভিউ পর্যন্ত ফলাফল লুকান"],
            ] as Array<[keyof ExamRules, string]>
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2.5 text-sm font-medium">
              <input type="checkbox" checked={Boolean(form.rules[key])} onChange={() => toggleRule(key)} className="h-4 w-4 accent-[#E51A24]" />
              {label}
            </label>
          ))}
          <label className="text-sm font-medium">
            প্রতি সেকশনে সময় (মিনিট, ০ = নিষ্ক্রিয়)
            <input type="number" min={0} value={form.rules.sectionTimeMinutes ?? 0} onChange={(e) => setForm((f) => ({ ...f, rules: { ...f.rules, sectionTimeMinutes: Number(e.target.value) } }))} className={input} />
          </label>
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-md btn-red px-6 py-3 text-sm font-bold text-white transition disabled:opacity-60"
        >
          {saving
            ? "সংরক্ষণ হচ্ছে…"
            : examId
              ? "পরিবর্তন সংরক্ষণ করুন"
              : "পরীক্ষা তৈরি করুন →"}
        </button>
        {saved && (
          <span className="anim-pop text-sm font-semibold text-[#E51A24]">
            সংরক্ষিত হয়েছে
          </span>
        )}
      </div>
    </div>
  );
}
