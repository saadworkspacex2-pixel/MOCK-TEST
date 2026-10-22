"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";

type DemoQuestion = {
  id: number;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
};

type DemoPart = {
  id: number;
  label: string;
  title: string;
  passage: string;
  questions: DemoQuestion[];
};

const PARTS: DemoPart[] = [
  {
    id: 1,
    label: "Passage 1",
    title: "The Secret Life of Honeybees",
    passage:
      "Honeybees are among the most studied insects on Earth. A single colony may contain up to sixty thousand individuals, yet each bee takes on different roles during its short life: cleaning cells as a young worker, nursing larvae, guarding the entrance, and finally foraging for nectar in its last weeks.\n\nWhen a forager finds a rich source of food, she returns and performs a waggle dance. The angle of the dance shows direction relative to the sun, while its duration signals distance. Other foragers read the information in the darkness of the hive through touch and vibration.",
    questions: [
      {
        id: 1,
        text: "A honeybee performs the same role throughout its entire life.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correct: 1,
        explanation:
          "প্যাসেজে বলা আছে প্রতিটি মৌমাছি জীবনের বিভিন্ন ধাপে ভিন্ন ভিন্ন কাজ করে। তাই FALSE।",
      },
      {
        id: 2,
        text: "The waggle dance communicates both direction and distance.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correct: 0,
        explanation:
          "নাচের কোণ দিক এবং সময়কাল দূরত্ব বোঝায়, তাই TRUE।",
      },
      {
        id: 3,
        text: "Foragers watch the dance with their eyes inside the hive.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correct: 1,
        explanation:
          "মৌচাকের অন্ধকারে তারা স্পর্শ ও কম্পনের মাধ্যমে তথ্য নেয়, তাই FALSE।",
      },
    ],
  },
  {
    id: 2,
    label: "Passage 2",
    title: "Cities That Breathe",
    passage:
      "Local governments from Singapore to Milan are planting dense pockets of trees, sometimes called urban forests, on rooftops, along avenues and in abandoned lots. Trees lower surrounding air temperature by providing shade and by releasing water vapour from their leaves.\n\nLeaves also trap airborne dust, and soil around roots absorbs rainwater that would otherwise flood drains. Urban forestry is not without challenges: roots crack pavements and young trees need costly watering during dry summers.",
    questions: [
      {
        id: 4,
        text: "Trees reduce heat by shade and by releasing water vapour.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correct: 0,
        explanation: "প্যাসেজে ঠিক এভাবেই বলা আছে, তাই TRUE।",
      },
      {
        id: 5,
        text: "The passage states that urban forestry has no disadvantages.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correct: 1,
        explanation:
          "শিকড় ফুটপাত ফাটানো ও পানির খরচের কথা বলা আছে, তাই FALSE।",
      },
    ],
  },
];

export default function LiveDemo() {
  const [partIndex, setPartIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [current, setCurrent] = useState<number>(PARTS[0].questions[0].id);
  const [submitted, setSubmitted] = useState(false);
  const [split, setSplit] = useState(48);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const part = PARTS[partIndex];
  const allQuestions = PARTS.flatMap((p) => p.questions);
  const currentQuestion =
    part.questions.find((q) => q.id === current) ?? part.questions[0];
  const answeredCount = allQuestions.filter((q) => answers[q.id] !== undefined).length;
  const score = allQuestions.filter((q) => answers[q.id] === q.correct).length;

  const selectPart = (index: number) => {
    setPartIndex(index);
    setCurrent(PARTS[index].questions[0].id);
    setSubmitted(false);
  };

  const goToQuestion = (qid: number) => {
    const pi = PARTS.findIndex((p) => p.questions.some((q) => q.id === qid));
    if (pi >= 0 && pi !== partIndex) setPartIndex(pi);
    setCurrent(qid);
    setSubmitted(false);
  };

  const startDrag = useCallback(() => setDragging(true), []);

  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pct = ((event.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.min(72, Math.max(28, pct)));
    };
    const stop = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
  }, [dragging]);

  return (
    <div className="glass-card overflow-hidden rounded-xl">
      {/* top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#1A1A1A] px-5 py-3 text-xs text-white">
        <span className="flex items-center gap-2 font-semibold">
          <span className="live-dot" /> লাইভ ডেমো · Academic Reading
        </span>
        <span className="rounded bg-white/10 px-3 py-1.5 font-mono text-sm font-bold">
          19:42
        </span>
        <button
          onClick={() => setSubmitted(true)}
          disabled={answeredCount === 0}
          className="rounded bg-[#E51A24] px-3 py-1.5 font-bold transition-colors hover:bg-[#c8141d] disabled:opacity-40"
        >
          জমা দিন
        </button>
      </div>

      {/* part tabs */}
      <div className="flex items-center gap-1 border-b border-black/[0.07] bg-white/60 px-4 py-2">
        {PARTS.map((p, i) => {
          const done = p.questions.every((q) => answers[q.id] !== undefined);
          return (
            <button
              key={p.id}
              onClick={() => selectPart(i)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                i === partIndex
                  ? "bg-[#1A1A1A] text-white"
                  : "text-[#6C757D] hover:bg-black/[0.04]"
              }`}
            >
              {p.label}
              {done && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
        <span className="ml-auto hidden text-[11px] text-[#6C757D] sm:inline">
          ডিভাইডার টেনে প্যানেল চওড়া করুন
        </span>
      </div>

      {/* split panes */}
      <div
        ref={containerRef}
        className="flex select-none flex-col md:flex-row"
        style={{ touchAction: "pan-y" }}
      >
        {/* passage */}
        <div
          className="min-w-0 bg-white/70 p-6"
          style={{ flexBasis: `${split}%`, flexGrow: 0, flexShrink: 0 }}
        >
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#6C757D] uppercase">
            {part.label}
          </p>
          <p className="mt-1.5 font-bold text-[#1A1A1A]">{part.title}</p>
          <div className="mt-3 space-y-3 text-sm leading-7 whitespace-pre-line text-[#212529]">
            {part.passage}
          </div>
        </div>

        {/* divider */}
        <div
          className="split-handle hidden w-3 shrink-0 md:flex"
          data-dragging={dragging}
          onPointerDown={(e) => {
            e.preventDefault();
            startDrag();
          }}
          role="separator"
          aria-orientation="vertical"
          aria-label="প্যানেল রিসাইজ করুন"
        />

        {/* questions */}
        <div className="min-w-0 flex-1 bg-[#F8F9FA]/70 p-6">
          <div className="rounded-md border border-black/[0.07] bg-white px-4 py-2.5 text-xs font-medium text-[#6C757D]">
            Question {part.questions.findIndex((q) => q.id === currentQuestion.id) + 1} of{" "}
            {part.questions.length}: Choose TRUE, FALSE or NOT GIVEN.
          </div>

          <div className="mt-4 rounded-md border border-black/[0.09] bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-[#1A1A1A]">
                <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded bg-[#1A1A1A] text-center text-xs font-bold text-white">
                  {currentQuestion.id}
                </span>
                {currentQuestion.text}
              </p>
              <button
                onClick={() =>
                  setFlags((f) => ({ ...f, [currentQuestion.id]: !f[currentQuestion.id] }))
                }
                className={`flex shrink-0 items-center gap-1 rounded px-2 py-1 text-[11px] font-bold transition-colors ${
                  flags[currentQuestion.id]
                    ? "bg-amber-100 text-amber-700"
                    : "text-[#6C757D] hover:bg-black/[0.04]"
                }`}
              >
                <Icon name="flag" size={12} />
                {flags[currentQuestion.id] ? "ফ্ল্যাগড" : "রিভিউ"}
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {currentQuestion.options.map((opt, i) => {
                const chosen = answers[currentQuestion.id] === i;
                const correct = i === currentQuestion.correct;
                const show = submitted;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      setAnswers((a) => ({ ...a, [currentQuestion.id]: i }));
                      setSubmitted(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md border px-4 py-2.5 text-left text-sm font-semibold tracking-wide transition-all ${
                      show && correct
                        ? "border-green-400 bg-green-50 text-green-800"
                        : show && chosen && !correct
                          ? "border-rose-300 bg-rose-50 text-rose-700"
                          : chosen
                            ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                            : "border-black/10 bg-white text-[#212529] hover:border-black/30"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`grid h-4 w-4 place-items-center rounded-full border ${
                          chosen ? "border-current" : "border-black/25"
                        }`}
                      >
                        {chosen && <span className="h-2 w-2 rounded-full bg-current" />}
                      </span>
                      {opt}
                    </span>
                    {show && correct && <Icon name="check" size={15} />}
                    {show && chosen && !correct && <Icon name="x" size={15} />}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div className="anim-fade-up mt-4 rounded-md bg-[#F8F9FA] px-4 py-3">
                <p className="text-sm font-bold text-[#1A1A1A]">
                  {answers[currentQuestion.id] === currentQuestion.correct
                    ? "সঠিক উত্তর। এভাবেই জমা দেওয়ার সঙ্গে সঙ্গে মার্কিং হয়।"
                    : "ভুল হয়েছে, তবে এখানেই শেখা।"}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#6C757D]">
                  {currentQuestion.explanation}
                </p>
                <Link
                  href="/exams"
                  className="btn-red mt-3 inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold"
                >
                  পুরো টেস্ট দিন <Icon name="arrow" size={13} />
                </Link>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => {
                  const idx = part.questions.findIndex((q) => q.id === currentQuestion.id);
                  if (idx > 0) setCurrent(part.questions[idx - 1].id);
                }}
                disabled={part.questions[0].id === currentQuestion.id}
                className="rounded-md border border-black/10 px-3 py-1.5 text-xs font-bold text-[#6C757D] disabled:opacity-30"
              >
                ← আগের
              </button>
              <button
                onClick={() => {
                  const idx = part.questions.findIndex((q) => q.id === currentQuestion.id);
                  if (idx < part.questions.length - 1) setCurrent(part.questions[idx + 1].id);
                }}
                disabled={part.questions[part.questions.length - 1].id === currentQuestion.id}
                className="rounded-md bg-[#1A1A1A] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-30"
              >
                পরের →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* palette */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-black/[0.07] bg-white/70 px-4 py-2.5">
        {allQuestions.map((q) => {
          const isAnswered = answers[q.id] !== undefined;
          const isCurrent = q.id === currentQuestion.id;
          return (
            <button
              key={q.id}
              onClick={() => goToQuestion(q.id)}
              className={`pal-btn ${isAnswered ? "pal-btn--answered" : ""} ${
                isCurrent ? "pal-btn--current" : ""
              }`}
              aria-label={`প্রশ্ন ${q.id}`}
            >
              {q.id}
              {flags[q.id] && <span className="pal-flag" />}
            </button>
          );
        })}
        <div className="ml-auto flex flex-wrap items-center gap-3 text-[10px] text-[#6C757D]">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-[#E51A24]" /> উত্তর দেওয়া
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-black/20 bg-white" /> বাকি
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> ফ্ল্যাগ
          </span>
          {submitted && (
            <span className="badge-soft">
              {score}/{allQuestions.length} সঠিক
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
