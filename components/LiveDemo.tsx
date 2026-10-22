"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import ExamSplit from "./ExamSplit";
import HighlightablePassage from "./HighlightablePassage";

type DemoTab = "reading" | "listening" | "writing";

type DemoQuestion = {
  id: number;
  tab: "reading" | "listening";
  passageTitle: string;
  passage: string;
  instruction: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
};

const QUESTIONS: DemoQuestion[] = [
  {
    id: 1,
    tab: "reading",
    passageTitle: "The Secret Life of Honeybees",
    passage:
      "Honeybees are among the most studied insects on Earth. A single colony may contain up to sixty thousand individuals, yet each bee takes on different roles during its short life: cleaning cells as a young worker, nursing larvae, guarding the entrance, and finally foraging for nectar in its last weeks.\n\nPerhaps the most remarkable behaviour of honeybees is their system of communication. When a forager discovers a rich source of food, she returns to the hive and performs a waggle dance that indicates both direction and distance.",
    instruction: "Question 1: Choose TRUE, FALSE or NOT GIVEN.",
    text: "A honeybee performs the same role throughout its entire life.",
    options: ["TRUE", "FALSE", "NOT GIVEN"],
    correct: 1,
    explanation:
      "প্যাসেজে বলা আছে মৌমাছি জীবনের বিভিন্ন ধাপে ভিন্ন ভিন্ন কাজ করে। তাই উত্তর FALSE।",
  },
  {
    id: 2,
    tab: "reading",
    passageTitle: "The Secret Life of Honeybees",
    passage:
      "Honeybees are among the most studied insects on Earth. A single colony may contain up to sixty thousand individuals, yet each bee takes on different roles during its short life: cleaning cells as a young worker, nursing larvae, guarding the entrance, and finally foraging for nectar in its last weeks.\n\nPerhaps the most remarkable behaviour of honeybees is their system of communication. When a forager discovers a rich source of food, she returns to the hive and performs a waggle dance that indicates both direction and distance.",
    instruction: "Question 2: Choose the correct answer.",
    text: "What is the maximum colony size mentioned in the passage?",
    options: [
      "Six thousand",
      "Sixteen thousand",
      "Sixty thousand",
      "Not mentioned",
    ],
    correct: 2,
    explanation:
      "প্যাসেজের প্রথম অনুচ্ছেদে sixty thousand individuals উল্লেখ করা হয়েছে।",
  },
  {
    id: 3,
    tab: "listening",
    passageTitle: "Library Membership · Demo Transcript",
    passage:
      "Receptionist: Good morning, Greenfield Community Library. How can I help you?\nCaller: Hi, I would like to join the library. Could you tell me how much membership costs?\nReceptionist: Membership is free for local residents. Standard members can borrow six books for three weeks. On Sundays we open from ten in the morning to four in the afternoon.",
    instruction: "Listening Question 1: Choose the correct answer.",
    text: "How much does a resident pay for membership?",
    options: [
      "Nothing",
      "Fifty taka",
      "One hundred taka",
      "It depends on age",
    ],
    correct: 0,
    explanation:
      "রিসেপশনিস্ট স্পষ্টভাবে বলেন Membership is free for local residents।",
  },
];

const WRITING_TASK = {
  title: "Writing Task 2 · Opinion Essay",
  instruction: "কমপক্ষে ২৫০ শব্দ লিখুন। সময়: ৪০ মিনিট।",
  prompt:
    "Some people believe that students learn best when teachers strictly control the classroom. Others think students make more progress when they are given freedom to explore topics on their own.\n\nDiscuss both views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
};

export default function LiveDemo() {
  const [tab, setTab] = useState<DemoTab>("reading");
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [essay, setEssay] = useState("");
  const [essaySubmitted, setEssaySubmitted] = useState(false);

  const tabQuestions =
    tab === "writing" ? [] : QUESTIONS.filter((q) => q.tab === tab);
  const question =
    tabQuestions[Math.min(activeIndex, Math.max(0, tabQuestions.length - 1))];
  const picked = question ? answers[question.id] : undefined;
  const isSubmitted = question ? Boolean(submitted[question.id]) : false;
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  const switchTab = (next: DemoTab) => {
    setTab(next);
    setActiveIndex(0);
  };

  return (
    <div className="card overflow-hidden rounded-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1A1A1A] px-5 py-3 text-xs text-white">
        <span className="flex items-center gap-2 font-semibold">
          <span className="anim-pulse-live h-2 w-2 rounded-full bg-emerald-400" />
          লাইভ ডেমো ·{" "}
          {tab === "reading"
            ? "Academic Reading"
            : tab === "listening"
              ? "Listening"
              : "Writing Task 2"}
        </span>
        <div className="flex items-center gap-2.5">
          <span className="rounded-md border border-white/10 bg-white/10 px-3 py-1.5 font-mono text-sm font-bold text-white">
            {tab === "writing" ? "00:40:00" : "00:19:42"}
          </span>
          {tab === "writing" ? (
            <button
              onClick={() => setEssaySubmitted(true)}
              disabled={!essay.trim() || essaySubmitted}
              className="rounded bg-[#E51A24] px-3 py-1.5 font-bold transition-colors hover:bg-[#c8141d] disabled:opacity-40"
            >
              {essaySubmitted ? "জমা হয়েছে" : "জমা দিন"}
            </button>
          ) : (
            <button
              onClick={() =>
                question &&
                setSubmitted((old) => ({ ...old, [question.id]: true }))
              }
              disabled={picked === undefined || isSubmitted}
              className="rounded bg-[#E51A24] px-3 py-1.5 font-bold transition-colors hover:bg-[#c8141d] disabled:opacity-40"
            >
              {isSubmitted ? "জমা হয়েছে" : "জমা দিন"}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-black/[0.07] bg-white px-4 py-2">
        {(["reading", "listening", "writing"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => switchTab(item)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              tab === item
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "text-[#6C757D] hover:bg-black/[0.04]"
            }`}
          >
            {item === "reading"
              ? "Reading"
              : item === "listening"
                ? "Listening"
                : "Writing"}
          </button>
        ))}
        <span className="ml-auto hidden text-[11px] text-[#6C757D] md:block">
          বাঁ পাশে প্যাসেজ/টাস্ক · ডান পাশে প্রশ্ন/উত্তর · মাঝের ডিভাইডার ড্র্যাগযোগ্য
        </span>
      </div>

      {tab === "writing" ? (
        <ExamSplit
          initial={50}
          leftLabel="Task Prompt"
          rightLabel="Your Answer"
          className="min-h-[380px] md:h-[430px]"
          left={
            <div className="h-full overflow-y-auto bg-white p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6C757D]">
                Task 2
              </p>
              <p className="mt-1.5 text-base font-bold text-[#1A1A1A]">
                {WRITING_TASK.title}
              </p>
              <p className="mt-3 rounded-md bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200">
                {WRITING_TASK.instruction}
              </p>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#212529]">
                {WRITING_TASK.prompt}
              </p>
            </div>
          }
          right={
            <div className="flex h-full flex-col bg-[#F8F9FA] p-5 sm:p-6">
              <div className="flex items-center justify-between rounded-md border border-black/[0.07] bg-white px-4 py-2.5 text-xs">
                <span className="font-semibold text-[#1A1A1A]">আপনার উত্তর</span>
                <span
                  className={`font-bold ${
                    wordCount >= 250 ? "text-emerald-700" : "text-[#6C757D]"
                  }`}
                >
                  শব্দ: {wordCount} / ২৫০
                </span>
              </div>
              <textarea
                value={essay}
                onChange={(e) => {
                  setEssay(e.target.value);
                  if (essaySubmitted) setEssaySubmitted(false);
                }}
                placeholder="এখানে আপনার Essay লিখুন…"
                className="mt-3 min-h-[210px] flex-1 resize-none rounded-lg border border-black/[0.09] bg-white p-4 text-sm leading-7 text-[#1A1A1A] outline-none focus:border-slate-700"
              />
              {essaySubmitted && (
                <div className="anim-fade-up mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-900">
                  <span className="font-semibold">
                    ডেমো সাবমিশন সম্পন্ন ({wordCount} শব্দ)। আসল পরীক্ষায় ইনস্ট্রাক্টর ৪টি ক্রাইটেরিয়ায় ব্যান্ড দেন।
                  </span>
                  <Link
                    href="/exams"
                    className="btn-red inline-flex items-center gap-1.5 rounded px-3 py-1.5 font-bold"
                  >
                    পুরো Writing টেস্ট <Icon name="arrow" size={12} />
                  </Link>
                </div>
              )}
            </div>
          }
        />
      ) : (
        <ExamSplit
          initial={50}
          leftLabel={tab === "listening" ? "Audio / Transcript" : "Passage"}
          rightLabel="Questions"
          className="min-h-[380px] md:h-[430px]"
          left={
            <div className="h-full overflow-y-auto bg-white p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6C757D]">
                {tab === "reading" ? "Passage 1" : "Section 1 · Audio & Transcript"}
              </p>
              <p className="mt-1.5 text-base font-bold text-[#1A1A1A]">
                {question.passageTitle}
              </p>
              {tab === "listening" && (
                <div className="mt-3 rounded-md border border-black/[0.08] bg-[#F8F9FA] px-3.5 py-2.5">
                  <p className="mb-1.5 text-[11px] font-semibold text-[#6C757D]">
                    ডেমো অডিও প্রিভিউ
                  </p>
                  <audio controls src="/api/media/1" className="h-9 w-full" />
                </div>
              )}
              <div className="mt-4">
                <HighlightablePassage
                  key={question.id}
                  text={question.passage}
                />
              </div>
            </div>
          }
          right={
            <div className="h-full overflow-y-auto bg-[#F8F9FA] p-5 sm:p-6">
              <p className="rounded-md border border-black/[0.07] bg-white px-4 py-2.5 text-xs font-medium text-[#6C757D]">
                {question.instruction}
              </p>
              <div className="mt-4 rounded-lg border border-black/[0.09] bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded bg-[#1A1A1A] text-center text-xs font-bold text-white">
                      {activeIndex + 1}
                    </span>
                    {question.text}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setFlags((old) => ({
                        ...old,
                        [question.id]: !old[question.id],
                      }))
                    }
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${
                      flags[question.id]
                        ? "bg-amber-100 text-amber-700"
                        : "bg-[#F8F9FA] text-[#6C757D]"
                    }`}
                  >
                    {flags[question.id] ? "FLAGGED" : "REVIEW"}
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {question.options.map((option, index) => {
                    const chosen = picked === index;
                    const correct = index === question.correct;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          !isSubmitted &&
                          setAnswers((old) => ({
                            ...old,
                            [question.id]: index,
                          }))
                        }
                        className={`flex w-full items-center justify-between rounded-md border px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                          isSubmitted && correct
                            ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                            : isSubmitted && chosen && !correct
                              ? "border-rose-300 bg-rose-50 text-rose-700"
                              : chosen
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : "border-black/10 bg-white text-[#212529] hover:border-emerald-400"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className={`grid h-4 w-4 place-items-center rounded-full border ${
                              chosen ? "border-current" : "border-slate-300"
                            }`}
                          >
                            {chosen && (
                              <span className="h-2 w-2 rounded-full bg-current" />
                            )}
                          </span>
                          {option}
                        </span>
                        {isSubmitted && correct && (
                          <Icon name="check" size={15} />
                        )}
                        {isSubmitted && chosen && !correct && (
                          <Icon name="x" size={15} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isSubmitted && (
                  <div className="anim-fade-up mt-4 rounded-md bg-[#F8F9FA] px-4 py-3">
                    <p className="text-sm font-bold text-[#1A1A1A]">
                      {picked === question.correct
                        ? "সঠিক উত্তর। এভাবেই জমা দেওয়ার সঙ্গে সঙ্গে মার্কিং হয়।"
                        : "ভুল হয়েছে, তবে এখানেই শেখা।"}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#6C757D]">
                      {question.explanation}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href="/exams"
                        className="btn-red inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold"
                      >
                        পুরো টেস্ট দিন <Icon name="arrow" size={13} />
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          setSubmitted((old) => ({
                            ...old,
                            [question.id]: false,
                          }))
                        }
                        className="rounded-md border border-black/10 px-4 py-2 text-xs font-bold"
                      >
                        আবার চেষ্টা
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          }
        />
      )}

      {tab !== "writing" && (
        <div className="flex items-center gap-2 border-t border-black/[0.07] bg-white px-4 py-3">
          {tabQuestions.map((q, index) => {
            const answered = answers[q.id] !== undefined;
            const current = index === activeIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`প্রশ্ন ${index + 1}`}
                className={`relative grid h-8 w-8 place-items-center rounded-md text-xs font-bold transition-all ${
                  answered
                    ? "bg-emerald-600 text-white"
                    : "border border-black/10 bg-white text-[#6C757D]"
                } ${
                  current
                    ? "anim-current-ring ring-2 ring-emerald-500 ring-offset-2"
                    : ""
                }`}
              >
                {index + 1}
                {flags[q.id] && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
                )}
              </button>
            );
          })}
          <span className="ml-auto hidden text-[10px] text-[#6C757D] sm:block">
            সবুজ = উত্তর দেওয়া · Amber = Review · Ring = Current
          </span>
        </div>
      )}
    </div>
  );
}
