"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "./Icon";

// A real, working mini-demo of the exam engine: one TFNG question,
// answered inline with instant marking, exactly like the live test.
const PASSAGE =
  "Honeybees are among the most studied insects on Earth. A single colony may contain up to sixty thousand individuals, yet each bee takes on different roles during its short life: cleaning cells as a young worker, nursing larvae, guarding the entrance, and finally foraging for nectar in its last weeks.";

const QUESTION = "A honeybee performs the same role throughout its entire life.";
const OPTIONS = ["TRUE", "FALSE", "NOT GIVEN"];
const CORRECT = 1;
const EXPLANATION =
  "প্যাসেজে বলা আছে প্রতিটি মৌমাছি জীবনের বিভিন্ন ধাপে ভিন্ন ভিন্ন কাজ করে। তাই উত্তর FALSE।";

export default function LiveDemo() {
  const [picked, setPicked] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="card overflow-hidden rounded-xl">
      {/* exam top bar */}
      <div className="flex items-center justify-between bg-[#1A1A1A] px-5 py-3 text-xs text-white">
        <span className="font-semibold">লাইভ ডেমো · Academic Reading</span>
        <span className="rounded bg-white/10 px-3 py-1.5 font-mono text-sm font-bold">
          19:42
        </span>
        <button
          onClick={() => setSubmitted(true)}
          disabled={picked === null || submitted}
          className="rounded bg-[#E51A24] px-3 py-1.5 font-bold transition-colors hover:bg-[#c8141d] disabled:opacity-40"
        >
          জমা দিন
        </button>
      </div>

      <div className="grid md:grid-cols-2">
        {/* passage pane */}
        <div className="border-b border-black/[0.07] bg-white p-6 md:border-r md:border-b-0">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#6C757D] uppercase">
            Passage 1
          </p>
          <p className="mt-1.5 font-bold text-[#1A1A1A]">
            The Secret Life of Honeybees
          </p>
          <p className="mt-3 text-sm leading-7 text-[#212529]">{PASSAGE}</p>
        </div>

        {/* question pane */}
        <div className="bg-[#F8F9FA] p-6">
          <p className="rounded-md border border-black/[0.07] bg-white px-4 py-2.5 text-xs font-medium text-[#6C757D]">
            Question 1: Choose TRUE, FALSE or NOT GIVEN.
          </p>
          <div className="mt-4 rounded-md border border-black/[0.09] bg-white p-5">
            <p className="text-sm font-semibold text-[#1A1A1A]">
              <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded bg-[#1A1A1A] text-center text-xs font-bold text-white">
                1
              </span>
              {QUESTION}
            </p>
            <div className="mt-4 space-y-2">
              {OPTIONS.map((opt, i) => {
                const chosen = picked === i;
                const showState = submitted;
                const correct = i === CORRECT;
                return (
                  <button
                    key={opt}
                    onClick={() => !submitted && setPicked(i)}
                    className={`flex w-full items-center justify-between rounded-md border px-4 py-2.5 text-left text-sm font-semibold tracking-wide transition-colors ${
                      showState && correct
                        ? "border-green-400 bg-green-50 text-green-800"
                        : showState && chosen && !correct
                          ? "border-rose-300 bg-rose-50 text-rose-700"
                          : chosen
                            ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                            : "border-black/10 bg-white text-[#212529] hover:border-black/30"
                    }`}
                  >
                    {opt}
                    {showState && correct && <Icon name="check" size={15} />}
                    {showState && chosen && !correct && (
                      <Icon name="x" size={15} />
                    )}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div className="anim-fade-up mt-4 rounded-md bg-[#F8F9FA] px-4 py-3">
                <p className="text-sm font-bold text-[#1A1A1A]">
                  {picked === CORRECT
                    ? "সঠিক উত্তর। এভাবেই জমা দেওয়ার সঙ্গে সঙ্গে মার্কিং হয়।"
                    : "ভুল হয়েছে, তবে এখানেই শেখা।"}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#6C757D]">
                  {EXPLANATION}
                </p>
                <Link
                  href="/exams"
                  className="btn-red mt-3 inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold"
                >
                  পুরো টেস্ট দিন <Icon name="arrow" size={13} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* palette strip */}
      <div className="flex items-center gap-1.5 border-t border-black/[0.07] bg-white px-4 py-2.5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <span
            key={n}
            className={`grid h-6 w-6 place-items-center rounded text-[10px] font-bold ${
              n === 1 && submitted
                ? "bg-[#1A1A1A] text-white"
                : n === 1
                  ? "bg-[#E51A24] text-white"
                  : "border border-black/10 text-[#6C757D]"
            }`}
          >
            {n}
          </span>
        ))}
        <span className="ml-auto text-[10px] text-[#6C757D]">
          নিচের প্যালেট থেকে যেকোনো প্রশ্নে যাওয়া যায়
        </span>
      </div>
    </div>
  );
}
