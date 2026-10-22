"use client";

import SpringHeading from "@/components/SpringHeading";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LogoMark } from "@/components/Logo";
import type { ExamRules } from "@/lib/examRules";
import ExamSplit from "@/components/ExamSplit";
import HighlightablePassage from "@/components/HighlightablePassage";
import ExamAudio from "@/components/ExamAudio";

type Q = {
  id: number;
  sectionId: number | null;
  qtype: string;
  text: string;
  options: string[];
};
type Sec = {
  id: number;
  title: string;
  passageTitle: string;
  passageText: string;
  instruction: string;
  audioUrl: string;
};
type ExamInfo = {
  id: number;
  title: string;
  module: "mcq" | "reading" | "listening" | "writing";
  durationMinutes: number;
  negativeMark: number;
  marksPerQuestion: number;
  rules: ExamRules;
};

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function TakeExamClient({ examId }: { examId: number }) {
  const router = useRouter();
  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [secs, setSecs] = useState<Sec[]>([]);
  const [questionList, setQuestionList] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [activePart, setActivePart] = useState(0);
  const [activeQ, setActiveQ] = useState<number | null>(null);
  const [essay, setEssay] = useState("");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [error, setError] = useState("");
  const startTime = useRef<number>(Date.now());
  const submitted = useRef(false);
  const qRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const sessionToken = useRef<string>(
    typeof window !== "undefined" ? crypto.randomUUID() : "",
  );
  const [optionOrders, setOptionOrders] = useState<Record<number, number[]>>({});
  const [sectionSeconds, setSectionSeconds] = useState<number | null>(null);

  const studentName =
    typeof window !== "undefined"
      ? sessionStorage.getItem("mt_student_name")
      : null;

  useEffect(() => {
    if (!studentName) {
      router.replace(`/exams/${examId}`);
      return;
    }
    fetch(`/api/exams/${examId}/questions`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.exam) throw new Error("not found");
        setExam(data.exam);
        setSecs(data.sections ?? []);
        const incoming = (data.questions ?? []) as Q[];
        const shuffled = data.exam.rules?.shuffleQuestions ? [...incoming].sort(() => Math.random() - 0.5) : incoming;
        setQuestionList(shuffled);
        setActiveQ(shuffled[0]?.id ?? null);
        if (data.exam.rules?.shuffleOptions) {
          const orders: Record<number, number[]> = {};
          for (const q of shuffled) orders[q.id] = q.options.map((_, i) => i).sort(() => Math.random() - 0.5);
          setOptionOrders(orders);
        }
        setSecondsLeft(data.exam.durationMinutes * 60);
        startTime.current = Date.now();
      })
      .catch(() => setError("পরীক্ষা লোড করা যায়নি। আবার চেষ্টা করুন।"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  // parts: sections if any, else one virtual part containing everything
  const parts = useMemo(() => {
    if (secs.length === 0) {
      return [
        {
          sec: null as Sec | null,
          questions: questionList,
        },
      ];
    }
    const knownIds = new Set(secs.map((s) => s.id));
    return secs.map((s, idx) => ({
      sec: s,
      questions: questionList.filter(
        (q) =>
          q.sectionId === s.id ||
          (idx === 0 && (!q.sectionId || !knownIds.has(q.sectionId))),
      ),
    }));
  }, [secs, questionList]);

  const flatNumber = useMemo(() => {
    const map: Record<number, number> = {};
    let n = 1;
    for (const p of parts) for (const q of p.questions) map[q.id] = n++;
    return map;
  }, [parts]);

  const submit = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          studentName,
          answers,
          essayText: essay,
          sessionToken: sessionToken.current,
          timeTakenSeconds: Math.round((Date.now() - startTime.current) / 1000),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "submit failed");
      router.replace(`/results/${data.attemptId}`);
    } catch {
      submitted.current = false;
      setSubmitting(false);
      setError("জমা দেওয়া যায়নি। সংযোগ দেখে আবার চেষ্টা করুন।");
    }
  }, [answers, essay, examId, router, studentName]);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, submit]);

  // Live heartbeat for the admin monitoring desk
  useEffect(() => {
    if (!exam || !studentName) return;
    const beat = () => {
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken.current,
          examId,
          studentName,
        }),
      }).catch(() => {});
    };
    beat();
    const t = setInterval(beat, 20000);
    return () => clearInterval(t);
  }, [exam, examId, studentName]);

  // Anti-cheat: switching tabs auto-submits when enabled for this exam
  useEffect(() => {
    if (!exam?.rules?.antiCheat) return;
    const onVisibility = () => {
      if (document.hidden) submit();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [exam, submit]);

  // Optional per-section timer
  const sectionMinutes = exam?.rules?.sectionTimeMinutes ?? 0;
  useEffect(() => {
    if (sectionMinutes > 0) setSectionSeconds(sectionMinutes * 60);
  }, [activePart, sectionMinutes]);
  useEffect(() => {
    if (sectionMinutes <= 0 || sectionSeconds === null) return;
    if (sectionSeconds <= 0) {
      if (activePart < parts.length - 1) setActivePart((p) => p + 1);
      else submit();
      return;
    }
    const t = setTimeout(() => setSectionSeconds((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [sectionSeconds, sectionMinutes, activePart, parts.length, submit]);

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) setPaletteOpen(true);
  }, []);

  const jumpTo = (q: Q) => {
    const pi = parts.findIndex((p) => p.questions.some((x) => x.id === q.id));
    if (pi >= 0 && pi !== activePart) setActivePart(pi);
    setActiveQ(q.id);
    if (window.innerWidth < 1024) setPaletteOpen(false);
    setTimeout(() => {
      qRefs.current[q.id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 60);
  };

  if (error && !exam) {
    return (
      <div className="grid min-h-screen place-items-center bg-stone-100 px-4 text-slate-900">
        <div className="anim-pop rounded-md border border-rose-300 bg-white p-8 text-center">
          <p className="text-rose-600">{error}</p>
          <button
            onClick={() => router.push(`/exams/${examId}`)}
            className="mt-5 rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white"
          >
            ← ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  if (!exam || secondsLeft === null) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-stone-100">
        <div className="h-14 shrink-0 bg-[#1A1A1A]" />
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
          <div className="space-y-3 border-r border-stone-200 bg-white p-8">
            <div className="shimmer h-3 w-24 rounded" />
            <div className="shimmer h-6 w-2/3 rounded" />
            <div className="shimmer mt-6 h-3 w-full rounded" />
            <div className="shimmer h-3 w-11/12 rounded" />
            <div className="shimmer h-3 w-full rounded" />
            <div className="shimmer h-3 w-4/5 rounded" />
            <div className="shimmer h-3 w-full rounded" />
            <div className="shimmer h-3 w-3/5 rounded" />
          </div>
          <div className="space-y-4 p-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-md border border-stone-200 bg-white p-5">
                <div className="shimmer h-4 w-5/6 rounded" />
                <div className="mt-3 space-y-2">
                  <div className="shimmer h-9 w-full rounded" />
                  <div className="shimmer h-9 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex h-12 shrink-0 items-center gap-2 border-t border-stone-200 bg-white px-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="shimmer h-7 w-7 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const isWriting = exam.module === "writing";
  const isReading = exam.module === "reading" || exam.module === "listening";
  const part = parts[Math.min(activePart, parts.length - 1)];
  const answeredCount = Object.keys(answers).filter((k) => {
    const v = answers[Number(k)];
    return !(typeof v === "string" && v.trim() === "");
  }).length;
  const hours = Math.floor(secondsLeft / 3600);
  const mins = Math.floor((secondsLeft % 3600) / 60);
  const secsR = secondsLeft % 60;
  const timeDanger = secondsLeft <= 300;
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  const renderQuestion = (q: Q) => {
    const num = flatNumber[q.id];
    const val = answers[q.id];
    const flagged = flags[q.id];
    return (
      <div
        key={q.id}
        ref={(el) => {
          qRefs.current[q.id] = el;
        }}
        onClick={() => setActiveQ(q.id)}
        className={`rounded-lg border bg-white p-5 transition-all ${
          activeQ === q.id
            ? "border-slate-700 ring-2 ring-slate-700/15"
            : "border-stone-200 hover:border-stone-300"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="font-medium leading-relaxed text-slate-900">
            <span className="mr-2 inline-grid h-7 w-7 place-items-center rounded bg-slate-800 text-center text-sm font-bold text-white">
              {num}
            </span>
            {q.text}
          </p>
          <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-stone-500 select-none">
            <input
              type="checkbox"
              checked={!!flagged}
              onChange={(e) =>
                setFlags((f) => ({ ...f, [q.id]: e.target.checked }))
              }
              className="h-4 w-4 accent-amber-500"
            />
            রিভিউ
          </label>
        </div>

        {q.qtype === "gap" ? (
          <input
            value={typeof val === "string" ? val : ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
            placeholder="উত্তর টাইপ করুন…"
            className="mt-4 w-full max-w-sm rounded-md border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-700 focus:bg-white focus:ring-2 focus:ring-slate-700/15"
          />
        ) : q.qtype === "essay" ? (
          <textarea
            value={typeof val === "string" ? val : ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
            rows={7}
            placeholder="আপনার উত্তর লিখুন… ইনস্ট্রাক্টর মূল্যায়ন করবেন"
            className="mt-4 w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-3 text-sm leading-relaxed outline-none focus:border-slate-700"
          />
        ) : q.qtype === "dnd" ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-stone-500">অপশনগুলো ড্র্যাগ করে সঠিক ক্রমে সাজান (অথবা ↑ ↓ চাপুন)</p>
            {(() => {
              const rawBase = optionOrders[q.id] ?? q.options.map((_, i) => i);
              const base = rawBase.length > 1 ? [...rawBase.slice(1), rawBase[0]] : rawBase;
              const order = typeof val === "string" && val
                ? val.split(",").map(Number)
                : base.filter((i) => q.options[i] !== "");
              const setOrder = (arr: number[]) => setAnswers((a) => ({ ...a, [q.id]: arr.join(",") }));
              return order.map((orig, idx) => (
                <div
                  key={orig}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", String(idx))}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = Number(e.dataTransfer.getData("text/plain"));
                    if (from === idx) return;
                    const next = [...order];
                    const [moved] = next.splice(from, 1);
                    next.splice(idx, 0, moved);
                    setOrder(next);
                  }}
                  className="flex cursor-move items-center gap-3 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm"
                >
                  <span className="font-mono text-xs text-stone-400">≡ {idx + 1}</span>
                  <span className="flex-1">{q.options[orig]}</span>
                  <button type="button" onClick={() => { if (idx === 0) return; const next = [...order]; [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]; setOrder(next); }} className="px-2 text-stone-500">↑</button>
                  <button type="button" onClick={() => { if (idx === order.length - 1) return; const next = [...order]; [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]]; setOrder(next); }} className="px-2 text-stone-500">↓</button>
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {(optionOrders[q.id] ?? q.options.map((_, i) => i))
              .filter((orig) => q.options[orig] !== "")
              .map((orig) => {
                const opt = q.options[orig];
                const selected = val === orig;
                return (
                  <label
                    key={orig}
                    className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-2.5 text-sm transition-all ${
                      selected
                        ? "border-slate-800 bg-slate-800 text-white"
                        : "border-stone-200 bg-stone-50 text-slate-800 hover:border-stone-400 hover:bg-white"
                    }`}
                  >
                    <input type="radio" checked={selected} onChange={() => setAnswers((a) => ({ ...a, [q.id]: orig }))} className="h-4 w-4 accent-slate-800" />
                    {q.qtype === "tfng" ? (
                      <span className="font-semibold tracking-wide">{opt}</span>
                    ) : (
                      <span><b className="mr-1.5">{OPTION_LABELS[orig]}</b>{opt}</span>
                    )}
                  </label>
                );
              })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-stone-200 text-slate-900">
      {/* ===== top bar (exam-hall style) ===== */}
      <header className="z-30 flex h-14 shrink-0 items-center justify-between bg-slate-900 px-4 text-white sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0">
            <LogoMark size={30} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{exam.title}</p>
            <p className="truncate text-[11px] text-slate-400">
              {studentName}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div
            role="timer"
            aria-label="পরীক্ষার বাকি সময়"
            className={`flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-base font-bold tracking-wider sm:text-lg ${
              timeDanger
                ? "animate-pulse border-rose-400/40 bg-rose-600/25 text-rose-200"
                : "border-white/10 bg-white/10 text-white"
            }`}
          >
            {String(hours).padStart(2, "0")}:{String(mins).padStart(2, "0")}:{String(secsR).padStart(2, "0")}
            <span className="hidden font-sans text-[10px] font-normal tracking-normal text-slate-300 sm:inline">
              বাকি
            </span>
          </div>
          {!isWriting && (
            <button
              onClick={() => setPaletteOpen((open) => !open)}
              aria-expanded={paletteOpen}
              className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/15"
            >
              প্যালেট
            </button>
          )}
          <button
            onClick={() => setShowConfirm(true)}
            className="rounded-md bg-[#E51A24] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#c8141d] sm:px-4"
          >
            জমা দিন
          </button>
        </div>
      </header>

      {/* ===== part / passage switcher ===== */}
      {parts.length > 1 && (
        <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-stone-300 bg-white px-4 py-2">
          {parts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActivePart(i)}
              className={`rounded-md px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                i === activePart
                  ? "bg-slate-900 text-white"
                  : "bg-stone-100 text-slate-600 hover:bg-stone-200"
              }`}
            >
              {p.sec?.title ?? `Part ${i + 1}`}
              {!isWriting && ` (${p.questions.length})`}
            </button>
          ))}
        </div>
      )}

      {/* ===== body + docked palette ===== */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {isWriting ? (
            /* -------- WRITING: task left, answer right -------- */
            <ExamSplit
              initial={50}
              leftLabel="Task Prompt"
              rightLabel="Your Answer"
              className="min-h-0 flex-1"
              left={
                <div className="h-full overflow-y-auto bg-white p-6 lg:p-10">
                  {part.sec ? (
                    <>
                      <p className="text-xs font-bold tracking-widest text-stone-400 uppercase">
                        {part.sec.title}
                      </p>
                      <SpringHeading as="h2" className="mt-2 text-xl font-bold">
                        {part.sec.passageTitle}
                      </SpringHeading>
                      {part.sec.instruction && (
                        <p className="mt-3 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                          {part.sec.instruction}
                        </p>
                      )}
                      <div className="mt-5 space-y-4 leading-8 whitespace-pre-line text-slate-800">
                        {part.sec.passageText}
                      </div>
                    </>
                  ) : (
                    <p className="text-stone-500">কোনো টাস্ক যোগ করা হয়নি।</p>
                  )}
                </div>
              }
              right={
                <div className="flex h-full min-h-0 flex-col overflow-hidden bg-stone-50">
                  <div className="flex shrink-0 items-center justify-between border-b border-stone-200 bg-white px-6 py-3">
                    <p className="text-sm font-semibold text-slate-700">
                      আপনার উত্তর
                    </p>
                    <p
                      className={`text-sm font-bold ${
                        wordCount >= 150 ? "text-green-600" : "text-stone-500"
                      }`}
                    >
                      শব্দ: {wordCount}
                    </p>
                  </div>
                  <textarea
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    placeholder="এখানে লিখুন… (জমা দেওয়ার পর ইনস্ট্রাক্টর মূল্যায়ন করবেন)"
                    className="min-h-0 flex-1 resize-none bg-transparent p-6 leading-8 text-slate-900 outline-none"
                  />
                </div>
              }
            />
          ) : isReading ? (
            /* -------- READING / LISTENING: passage/audio left, questions right -------- */
            <ExamSplit
              initial={50}
              leftLabel={
                exam.module === "listening" ? "Audio / Transcript" : "Passage"
              }
              rightLabel="Questions"
              className="min-h-0 flex-1"
              left={
                <div className="h-full overflow-y-auto bg-white p-6 lg:p-10">
                  {part.sec ? (
                    <>
                      <p className="text-xs font-bold tracking-widest text-stone-400 uppercase">
                        {part.sec.title}
                      </p>
                      <SpringHeading as="h2" className="mt-2 text-xl font-bold">
                        {part.sec.passageTitle}
                      </SpringHeading>
                      {part.sec.audioUrl && (
                        <div className="mt-4 rounded-md border border-stone-200 bg-stone-50 p-4">
                          <p className="mb-2 text-xs font-semibold text-stone-500">
                            অডিও চালিয়ে প্রশ্নের উত্তর দিন
                          </p>
                          <ExamAudio src={part.sec.audioUrl} />
                        </div>
                      )}
                      <div className="mt-5">
                        <HighlightablePassage
                          key={part.sec.id}
                          text={part.sec.passageText}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-stone-500">
                      এই পরীক্ষায় কোনো প্যাসেজ বা অডিও সেকশন যোগ করা হয়নি।
                    </p>
                  )}
                </div>
              }
              right={
                <div className="h-full overflow-y-auto bg-stone-100 p-4 sm:p-6">
                  {part.sec?.instruction && (
                    <p className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                      {part.sec.instruction}
                    </p>
                  )}
                  <div className="space-y-4">
                    {part.questions.map((q) => renderQuestion(q))}
                    {part.questions.length === 0 && (
                      <p className="py-10 text-center text-sm text-stone-500">
                        এই অংশে কোনো প্রশ্ন নেই।
                      </p>
                    )}
                  </div>
                </div>
              }
            />
          ) : (
            /* -------- MCQ: single scrollable pane -------- */
            <div className="min-h-0 flex-1 overflow-y-auto bg-stone-100">
              <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
                {part.sec?.instruction && (
                  <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                    {part.sec.instruction}
                  </p>
                )}
                {part.questions.map((q) => renderQuestion(q))}
                {part.questions.length === 0 && (
                  <p className="py-16 text-center text-stone-500">
                    এই পরীক্ষায় কোনো প্রশ্ন নেই।
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== collapsible docked palette ===== */}
        {!isWriting && paletteOpen && (
          <aside className="anim-fade-in fixed top-14 bottom-0 right-0 z-40 w-[min(20rem,90vw)] overflow-y-auto border-l border-stone-300 bg-white px-4 py-4 lg:static lg:inset-auto lg:w-72 lg:shrink-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Question Palette</p>
            <button
              onClick={() => setPaletteOpen(false)}
              aria-label="প্যালেট বন্ধ করুন"
              className="rounded border border-stone-300 px-2 py-1 text-xs font-bold text-stone-600"
            >
              ×
            </button>
            <div className="flex items-center gap-3 text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-emerald-600" />
                উত্তর {answeredCount}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded border border-stone-300 bg-white" />
                বাকি {questionList.length - answeredCount}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
                রিভিউ
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {parts.map((p, pi) => (
              <section key={pi} className={pi > 0 ? "border-t border-stone-200 pt-3" : ""}>
                <div className="mb-2 flex items-center gap-2">
                  <button
                    onClick={() => setActivePart(pi)}
                    className={`rounded px-3 py-1.5 text-xs font-bold whitespace-nowrap transition ${
                      pi === activePart
                        ? "bg-slate-800 text-white"
                        : "bg-stone-100 text-slate-600 hover:bg-stone-200"
                    }`}
                  >
                    {p.sec?.title ?? "প্রশ্নপত্র"}
                  </button>
                  <span className="text-[10px] text-stone-400">{p.questions.length}টি প্রশ্ন</span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-1.5">
                  {p.questions.map((q) => {
                    const v = answers[q.id];
                    const done = v !== undefined && !(typeof v === "string" && v.trim() === "");
                    const flagged = flags[q.id];
                    const current = activeQ === q.id;
                    return (
                      <button
                        key={q.id}
                        onClick={() => jumpTo(q)}
                        aria-current={current ? "true" : undefined}
                        title={`${done ? "উত্তর দেওয়া" : "উত্তর দেওয়া হয়নি"}${flagged ? " · Review flagged" : ""}`}
                        className={`relative grid h-8 min-w-8 place-items-center rounded text-xs font-bold transition-all ${
                          done
                            ? "bg-emerald-600 text-white"
                            : "border border-stone-300 bg-white text-slate-600 hover:border-emerald-500"
                        } ${current ? "anim-current-ring ring-2 ring-emerald-500 ring-offset-1" : ""}`}
                      >
                        {flatNumber[q.id]}
                        {flagged && (
                          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          </aside>
        )}
      </div>
      {error && (
        <p className="bg-rose-50 px-4 py-2 text-center text-sm text-rose-600">
          {error}
        </p>
      )}

      {/* confirm modal */}
      {showConfirm && (
        <div className="anim-fade-in fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4">
          <div className="anim-pop w-full max-w-md rounded-lg bg-white p-7">
            <SpringHeading as="h3" className="text-xl font-bold">টেস্ট জমা দেবেন?</SpringHeading>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              {isWriting ? (
                <>
                  আপনি <b>{wordCount}</b> শব্দ লিখেছেন। জমা দেওয়ার পর
                  ইনস্ট্রাক্টর আপনার লেখা মূল্যায়ন করবেন।
                </>
              ) : (
                <>
                  {questionList.length}টির মধ্যে{" "}
                  <b className="text-green-600">{answeredCount}টি</b> উত্তর
                  দিয়েছেন।
                  {answeredCount < questionList.length && (
                    <span className="text-amber-600">
                      {" "}
                      {questionList.length - answeredCount}টি বাকি আছে।
                    </span>
                  )}{" "}
                  জমার পর আর বদলানো যাবে না।
                </>
              )}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="flex-1 rounded-md border border-stone-300 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-100"
              >
                ফিরে যাই
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-1 rounded-md bg-[#E51A24] py-3 text-sm font-bold text-white transition hover:bg-[#c8141d] disabled:opacity-60"
              >
                {submitting ? "জমা হচ্ছে…" : "হ্যাঁ, জমা দিন "}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
