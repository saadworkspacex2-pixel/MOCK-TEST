"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LogoMark } from "@/components/Logo";

type Q = {
  id: number;
  sectionId: number | null;
  qtype: "mcq" | "gap" | "tfng";
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
  const [error, setError] = useState("");
  const startTime = useRef<number>(Date.now());
  const submitted = useRef(false);
  const qRefs = useRef<Record<number, HTMLDivElement | null>>({});

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
        setQuestionList(data.questions ?? []);
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
    return secs.map((s) => ({
      sec: s,
      questions: questionList.filter((q) => q.sectionId === s.id),
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

  const jumpTo = (q: Q) => {
    const pi = parts.findIndex((p) => p.questions.some((x) => x.id === q.id));
    if (pi >= 0 && pi !== activePart) setActivePart(pi);
    setActiveQ(q.id);
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
      <div className="flex h-screen flex-col bg-stone-100">
        <div className="h-14 shrink-0 bg-[#1A1A1A]" />
        <div className="grid flex-1 grid-cols-1 md:grid-cols-2">
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
  const mins = Math.floor(secondsLeft / 60);
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
            onChange={(e) =>
              setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
            }
            placeholder="উত্তর টাইপ করুন…"
            className="mt-4 w-full max-w-sm rounded-md border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-700 focus:bg-white focus:ring-2 focus:ring-slate-700/15"
          />
        ) : (
          <div className="mt-4 space-y-2">
            {q.options
              .filter((o) => o !== "")
              .map((opt, i) => {
                const selected = val === i;
                return (
                  <label
                    key={i}
                    className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-2.5 text-sm transition-all ${
                      selected
                        ? "border-slate-800 bg-slate-800 text-white"
                        : "border-stone-200 bg-stone-50 text-slate-800 hover:border-stone-400 hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={selected}
                      onChange={() =>
                        setAnswers((a) => ({ ...a, [q.id]: i }))
                      }
                      className="h-4 w-4 accent-slate-800"
                    />
                    {q.qtype === "tfng" ? (
                      <span className="font-semibold tracking-wide">
                        {opt}
                      </span>
                    ) : (
                      <span>
                        <b className="mr-1.5">{OPTION_LABELS[i]}</b>
                        {opt}
                      </span>
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
    <div className="flex h-screen flex-col bg-stone-200 text-slate-900">
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
        <div
          className={`absolute left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-md px-4 py-1.5 font-mono text-lg font-bold ${
            timeDanger
              ? "animate-pulse bg-rose-600/20 text-rose-300"
              : "bg-white/10 text-white"
          }`}
        >
          <span aria-hidden></span>
          {String(mins).padStart(2, "0")}:{String(secsR).padStart(2, "0")}
          <span className="hidden text-xs font-normal text-slate-300 sm:inline">
            বাকি
          </span>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="rounded-md bg-[#E51A24] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#c8141d]"
        >
          জমা দিন
        </button>
      </header>

      {/* ===== body ===== */}
      {isWriting ? (
        /* -------- WRITING: task left, answer right -------- */
        <div className="grid flex-1 grid-rows-2 overflow-hidden md:grid-cols-2 md:grid-rows-1">
          <div className="overflow-y-auto border-b border-stone-300 bg-white p-6 md:border-r md:border-b-0 lg:p-10">
            {part.sec ? (
              <>
                <p className="text-xs font-bold tracking-widest text-stone-400 uppercase">
                  {part.sec.title}
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  {part.sec.passageTitle}
                </h2>
                {part.sec.instruction && (
                  <p className="mt-3 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                    {part.sec.instruction}
                  </p>
                )}
                <div className="mt-5 space-y-4 leading-relaxed whitespace-pre-line text-slate-800">
                  {part.sec.passageText}
                </div>
                {parts.length > 1 && (
                  <div className="mt-8 flex gap-2">
                    {parts.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePart(i)}
                        className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                          i === activePart
                            ? "bg-slate-800 text-white"
                            : "bg-stone-100 text-slate-700 hover:bg-stone-200"
                        }`}
                      >
                        {p.sec?.title ?? `Task ${i + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-stone-500">কোনো টাস্ক যোগ করা হয়নি।</p>
            )}
          </div>
          <div className="flex flex-col overflow-hidden bg-stone-50">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-3">
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
              className="flex-1 resize-none bg-transparent p-6 leading-relaxed text-slate-900 outline-none"
            />
          </div>
        </div>
      ) : isReading && part.sec ? (
        /* -------- READING: passage left, questions right -------- */
        <div className="grid flex-1 grid-rows-2 overflow-hidden md:grid-cols-2 md:grid-rows-1">
          <div className="overflow-y-auto border-b border-stone-300 bg-white p-6 md:border-r md:border-b-0 lg:p-10">
            <p className="text-xs font-bold tracking-widest text-stone-400 uppercase">
              {part.sec.title}
            </p>
            <h2 className="mt-2 text-xl font-bold">{part.sec.passageTitle}</h2>
            {part.sec.audioUrl && (
              <div className="mt-4 rounded-md border border-stone-200 bg-stone-50 p-4">
                <p className="mb-2 text-xs font-semibold text-stone-500">
                  অডিও চালিয়ে প্রশ্নের উত্তর দিন
                </p>
                <audio controls src={part.sec.audioUrl} className="w-full" />
              </div>
            )}
            <div className="mt-5 space-y-4 text-[15px] leading-7 whitespace-pre-line text-slate-800">
              {part.sec.passageText}
            </div>
          </div>
          <div className="overflow-y-auto bg-stone-100 p-4 sm:p-6">
            {part.sec.instruction && (
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
        </div>
      ) : (
        /* -------- MCQ: single scrollable pane -------- */
        <div className="flex-1 overflow-y-auto bg-stone-100">
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

      {/* ===== bottom palette ===== */}
      {!isWriting && (
        <footer className="z-30 shrink-0 border-t border-stone-300 bg-white px-3 py-2">
          <div className="flex items-center gap-3 overflow-x-auto">
            {parts.map((p, pi) => (
              <div key={pi} className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => setActivePart(pi)}
                  className={`rounded px-3 py-2 text-xs font-bold whitespace-nowrap transition ${
                    pi === activePart
                      ? "bg-slate-800 text-white"
                      : "bg-stone-100 text-slate-600 hover:bg-stone-200"
                  }`}
                >
                  {p.sec?.title ?? "প্রশ্নপত্র"}
                </button>
                {p.questions.map((q) => {
                  const v = answers[q.id];
                  const done =
                    v !== undefined &&
                    !(typeof v === "string" && v.trim() === "");
                  const flagged = flags[q.id];
                  return (
                    <button
                      key={q.id}
                      onClick={() => jumpTo(q)}
                      className={`relative grid h-8 w-8 shrink-0 place-items-center rounded text-xs font-bold transition-all ${
                        activeQ === q.id
                          ? "scale-110 bg-[#E51A24] text-white"
                          : done
                            ? "bg-slate-800 text-white"
                            : "border border-stone-300 bg-white text-slate-600 hover:border-slate-500"
                      }`}
                    >
                      {flatNumber[q.id]}
                      {flagged && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
            <div className="ml-auto hidden shrink-0 items-center gap-4 pl-3 text-[11px] text-stone-500 lg:flex">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-slate-800" />
                উত্তর দেওয়া {answeredCount}
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
        </footer>
      )}
      {error && (
        <p className="bg-rose-50 px-4 py-2 text-center text-sm text-rose-600">
          {error}
        </p>
      )}

      {/* confirm modal */}
      {showConfirm && (
        <div className="anim-fade-in fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4">
          <div className="anim-pop w-full max-w-md rounded-lg bg-white p-7">
            <h3 className="text-xl font-bold">টেস্ট জমা দেবেন?</h3>
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
