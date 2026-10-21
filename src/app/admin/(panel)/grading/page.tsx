"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { formatDateBn, toBn } from "@/lib/bn";

type Attempt = {
  id: number;
  studentName: string;
  essayText: string;
  answers: Record<string, string | number>;
  createdAt: string;
};
type Row = { attempt: Attempt; exam: { title: string; module: string } };
type Comment = { id: number; quote: string; comment: string };

const CRITERIA = [
  { key: "tr", label: "Task Response" },
  { key: "cc", label: "Coherence & Cohesion" },
  { key: "lr", label: "Lexical Resource" },
  { key: "gra", label: "Grammatical Range & Accuracy" },
];

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] ?? ch);
}

export default function GradingStudio() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Row | null>(null);
  const [criteria, setCriteria] = useState<Record<string, number>>({ tr: 6, cc: 6, lr: 6, gra: 6 });
  const [comments, setComments] = useState<Comment[]>([]);
  const [quote, setQuote] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/grading");
    const data = (await res.json()) as Row[];
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const overall = useMemo(() => {
    const avg = CRITERIA.reduce((a, c) => a + (criteria[c.key] || 0), 0) / 4;
    return Math.round(avg * 2) / 2;
  }, [criteria]);

  const essay = selected?.attempt.essayText ||
    Object.values(selected?.attempt.answers ?? {}).filter((v) => typeof v === "string").join("\n\n");

  const annotated = useMemo(() => {
    let html = escapeHtml(essay);
    for (const c of comments) {
      const q = escapeHtml(c.quote);
      if (q) html = html.replace(q, `<mark style="background:#FEF3C7;padding:2px 0" title="${escapeHtml(c.comment)}">${q}</mark>`);
    }
    return html.replace(/\n/g, "<br/>");
  }, [essay, comments]);

  const captureSelection = () => {
    const text = window.getSelection()?.toString().trim() ?? "";
    if (text) setQuote(text.slice(0, 500));
  };

  const save = async (status: "scored" | "pending") => {
    if (!selected) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/grading/${selected.attempt.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bandScore: overall,
        status,
        feedback: { criteria, comments, overall },
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("সংরক্ষণ ব্যর্থ");
      return;
    }
    setSuccess(status === "scored" ? "মূল্যায়ন প্রকাশিত হয়েছে" : "খসড়া সংরক্ষিত");
    if (status === "scored") {
      setSelected(null);
      setComments([]);
      await load();
    }
  };

  if (loading) {
    return <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="card rounded-lg p-5"><div className="shimmer h-4 w-2/3 rounded" /><div className="shimmer mt-3 h-20 rounded" /></div>)}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">ইনস্ট্রাক্টর গ্রেডিং স্টুডিও</h1>
      <p className="mt-1 text-sm text-[#6C757D]">Pending রাইটিং, ইনলাইন মন্তব্য ও চার ক্রাইটেরিয়ায় ব্যান্ড</p>
      {success && <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{success}</p>}
      <div className="mt-6 grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2">
          {rows.map((r) => (
            <button key={r.attempt.id} onClick={() => { setSelected(r); setComments([]); setSuccess(""); }} className={`card w-full rounded-lg p-4 text-left ${selected?.attempt.id === r.attempt.id ? "border-[#E51A24]" : ""}`}>
              <p className="font-bold">{r.attempt.studentName}</p>
              <p className="mt-1 line-clamp-1 text-xs text-[#6C757D]">{r.exam.title}</p>
              <p className="mt-1 text-[11px] text-[#6C757D]">{formatDateBn(r.attempt.createdAt)}</p>
            </button>
          ))}
          {rows.length === 0 && <p className="card rounded-lg p-6 text-center text-sm text-[#6C757D]">কোনো pending সাবমিশন নেই।</p>}
        </aside>

        {selected ? (
          <section className="space-y-5">
            <div className="card rounded-lg p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">{selected.exam.title} · {selected.attempt.studentName}</h2>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">Pending</span>
              </div>
              <p className="mt-2 text-xs text-[#6C757D]">লেখার অংশ সিলেক্ট করলে সেটি দিয়ে মার্জিন কমেন্ট যোগ করতে পারবেন।</p>
              <div className="mt-4 leading-7" onMouseUp={captureSelection} dangerouslySetInnerHTML={{ __html: annotated || "লেখা নেই" }} />
            </div>

            <div className="card rounded-lg p-6">
              <h3 className="font-bold">ইনলাইন মার্জিন কমেন্ট</h3>
              {quote && <p className="mt-3 rounded bg-amber-50 px-3 py-2 text-xs text-amber-900">“{quote}”</p>}
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="মন্তব্য লিখুন…" className="mt-3 w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm" />
              <button onClick={() => { if (!quote || !comment.trim()) { setError("টেক্সট সিলেক্ট করে মন্তব্য লিখুন"); return; } setComments((c) => [...c, { id: Date.now(), quote, comment }]); setQuote(""); setComment(""); setError(""); }} className="btn-ink mt-3 rounded-md px-4 py-2 text-xs font-bold">কমেন্ট যোগ করুন</button>
              <div className="mt-4 space-y-2">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-md border-l-2 border-amber-400 bg-[#F8F9FA] p-3 text-xs">
                    <p className="font-semibold">“{c.quote}”</p>
                    <p className="mt-1 text-[#6C757D]">{c.comment}</p>
                    <button onClick={() => setComments((all) => all.filter((x) => x.id !== c.id))} className="mt-1 text-rose-600">মুছুন</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card rounded-lg p-6">
              <h3 className="font-bold">ব্যান্ড স্কোর</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {CRITERIA.map((c) => (
                  <label key={c.key} className="text-sm font-semibold">
                    {c.label}
                    <span className="mt-1.5 flex items-center gap-3">
                      <input type="range" min={0} max={9} step={0.5} value={criteria[c.key]} onChange={(e) => setCriteria((v) => ({ ...v, [c.key]: Number(e.target.value) }))} className="flex-1 accent-[#E51A24]" />
                      <span className="w-10 text-right font-extrabold">{toBn(criteria[c.key])}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-5">
                <p className="text-sm font-semibold">Overall Band: <span className="text-3xl font-extrabold text-[#E51A24]">{toBn(overall)}</span></p>
                <div className="flex gap-2">
                  <button onClick={() => save("pending")} disabled={saving} className="btn-ghost rounded-md px-5 py-2.5 text-sm font-bold">খসড়া</button>
                  <button onClick={() => save("scored")} disabled={saving} className="btn-red flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold disabled:opacity-60"><Icon name="check" size={15} />{saving ? "সংরক্ষণ…" : "প্রকাশ করুন"}</button>
                </div>
              </div>
              {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
            </div>
          </section>
        ) : (
          <div className="card grid min-h-64 place-items-center rounded-lg p-10 text-center text-sm text-[#6C757D]">বাঁ পাশ থেকে একটি সাবমিশন বেছে নিন।</div>
        )}
      </div>
    </div>
  );
}
