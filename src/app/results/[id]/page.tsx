import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { attempts, exams, questions, sections } from "@/db/schema";
import { and, asc, count, desc, eq, gt } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { formatDuration, toBn } from "@/lib/bn";

export const dynamic = "force-dynamic";

const OPTION_LABELS = ["A", "B", "C", "D"];
const TFNG = ["TRUE", "FALSE", "NOT GIVEN"];

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const attemptId = Number(id);
  if (!Number.isFinite(attemptId)) notFound();

  const [attempt] = await db
    .select()
    .from(attempts)
    .where(eq(attempts.id, attemptId));
  if (!attempt) notFound();

  const [[exam], qs, secs, [better]] = await Promise.all([
    db.select().from(exams).where(eq(exams.id, attempt.examId)),
    db
      .select()
      .from(questions)
      .where(eq(questions.examId, attempt.examId))
      .orderBy(asc(questions.sortOrder), asc(questions.id)),
    db
      .select()
      .from(sections)
      .where(eq(sections.examId, attempt.examId))
      .orderBy(asc(sections.sortOrder), asc(sections.id)),
    db
      .select({ c: count() })
      .from(attempts)
      .where(
        and(
          eq(attempts.examId, attempt.examId),
          gt(attempts.score, attempt.score),
        ),
      ),
  ]);
  if (!exam) notFound();

  /* ---------- WRITING: pending instructor review ---------- */
  if (exam.module === "writing") {
    const words = attempt.essayText.trim()
      ? attempt.essayText.trim().split(/\s+/).length
      : 0;
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 pt-28 pb-24 sm:px-6">
          <div className="anim-pop rounded-lg border border-amber-200 card p-10 text-center">
            <div className="text-6xl"></div>
            <h1 className="mt-5 text-3xl font-bold">জমা হয়ে গেছে!</h1>
            <p className="mx-auto mt-3 max-w-md text-[#6C757D]">
              {attempt.studentName}, আপনার লেখা ({toBn(words)} শব্দ)
              ইনস্ট্রাক্টরের কাছে পাঠানো হয়েছে। মূল্যায়ন শেষ হলে প্রতিটি
              ক্রাইটেরিয়ায় মন্তব্যসহ ফলাফল পাবেন।
            </p>
            <span className="mt-6 inline-block rounded-full bg-amber-50 px-5 py-2 text-sm font-semibold text-amber-600">
              মূল্যায়নের অপেক্ষায়
            </span>
          </div>
          <Reveal className="mt-8 rounded-lg border border-black/[0.07] card p-7">
            <h2 className="font-semibold">আপনার লেখা</h2>
            <p className="mt-4 leading-relaxed whitespace-pre-line text-slate-700">
              {attempt.essayText || "—"}
            </p>
          </Reveal>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/exams"
              className="rounded-md btn-red px-6 py-3 text-sm font-bold text-white transition"
            >
              অন্য টেস্ট দিন →
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const rank = better.c + 1;
  const answers = (attempt.answers ?? {}) as Record<string, number | string>;
  const totalMarks = attempt.totalQuestions * exam.marksPerQuestion;
  const percent =
    totalMarks > 0
      ? Math.max(0, Math.round((attempt.score / totalMarks) * 100))
      : 0;
  const passed = percent >= 50;
  const secTitle = new Map(secs.map((s) => [s.id, s.title]));

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pt-28 pb-24 sm:px-6">
        {/* score hero */}
        <div className="anim-pop relative overflow-hidden rounded-lg border border-black/[0.07] card p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute inset-0">
          </div>
          <div className="relative">
            <p className="text-sm text-[#6C757D]">
              {exam.title} • {attempt.studentName}
            </p>
            {attempt.bandScore !== null ? (
              <>
                <div className="mt-6 text-sm font-semibold tracking-widest text-slate-600 uppercase">
                  ব্যান্ড স্কোর
                </div>
                <h1 className="mt-2 text-7xl font-extrabold text-[#1A1A1A]">
                  {attempt.bandScore % 1 === 0
                    ? `${toBn(attempt.bandScore)}.০`
                    : toBn(attempt.bandScore)}
                </h1>
                <p className="mt-3 text-[#6C757D]">
                  সঠিক {toBn(attempt.correctCount)} / {toBn(attempt.totalQuestions)} —
                  জমা দেওয়ার সঙ্গে সঙ্গেই স্কোর, আসল নিয়মে।
                </p>
              </>
            ) : (
              <>
                <div className="mt-6 text-6xl">{passed ? "" : ""}</div>
                <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
                  <span className="text-[#E51A24]">
                    {toBn(attempt.score)}
                  </span>
                  <span className="text-2xl text-slate-500">
                    {" "}
                    / {toBn(totalMarks)}
                  </span>
                </h1>
              </>
            )}
            <div className="mx-auto mt-6 h-3 max-w-md overflow-hidden rounded-full bg-slate-100">
              <div
                className=" h-full rounded-full btn-red"
                style={{
                  width: `${
                    attempt.bandScore !== null
                      ? Math.round(
                          (attempt.correctCount /
                            Math.max(1, attempt.totalQuestions)) *
                            100,
                        )
                      : percent
                  }%`,
                }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              র্যাঙ্ক #{toBn(rank)}
            </p>
          </div>
        </div>

        {/* stats */}
        <div className="anim-fade-up delay-200 mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: "সঠিক",
              value: toBn(attempt.correctCount),
              cls: "text-green-600",
            },
            {
              label: "ভুল",
              value: toBn(attempt.wrongCount),
              cls: "text-rose-600",
            },
            {
              label: "স্কিপ",
              value: toBn(attempt.skippedCount),
              cls: "text-amber-600",
            },
            {
              label: "সময় লেগেছে",
              value: formatDuration(attempt.timeTakenSeconds),
              cls: "text-slate-600",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-black/[0.07] card p-4 text-center"
            >
              <div className={`text-lg font-bold ${s.cls}`}>{s.value}</div>
              <div className="mt-1 text-xs text-[#6C757D]">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="anim-fade-up delay-300 mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/exams/${exam.id}`}
            className="rounded-md btn-red px-6 py-3 text-sm font-bold text-white transition"
          >
            আবার টেস্ট দিন
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-red-300"
          >
            লিডারবোর্ড
          </Link>
          <Link
            href="/exams"
            className="rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-red-300"
          >
            অন্য টেস্ট
          </Link>
        </div>

        {/* review */}
        <h2 className="mt-14 text-2xl font-bold">
          উত্তর <span className="text-[#E51A24]">রিভিউ</span>
        </h2>
        <p className="mt-2 text-sm text-[#6C757D]">
          প্রতিটি প্রশ্নের সঠিক উত্তর ও ব্যাখ্যা দেখে নিন।
        </p>
        <div className="mt-8 space-y-6">
          {qs.map((q, idx) => {
            const picked = answers[String(q.id)];
            const isGap = q.qtype === "gap";
            const isSkipped =
              picked === undefined ||
              (typeof picked === "string" && picked.trim() === "");
            const acceptedList = q.acceptedAnswers
              .split("|")
              .map((a) => a.trim())
              .filter(Boolean);
            const isCorrect = isGap
              ? !isSkipped &&
                acceptedList.some(
                  (a) =>
                    a.toLowerCase().replace(/\s+/g, " ") ===
                    String(picked).trim().toLowerCase().replace(/\s+/g, " "),
                )
              : picked === q.correctOption;
            const options =
              q.qtype === "tfng"
                ? TFNG
                : [q.optionA, q.optionB, q.optionC, q.optionD].filter(
                    (o) => o !== "",
                  );
            return (
              <Reveal key={q.id} delay={Math.min(idx, 4) * 60}>
                <div
                  className={`rounded-lg border p-6 ${
                    isSkipped
                      ? "border-amber-200 card"
                      : isCorrect
                        ? "border-green-200 bg-green-50/40"
                        : "border-rose-200 bg-rose-50/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold leading-relaxed">
                      {toBn(idx + 1)}. {q.text}
                      {q.sectionId && secTitle.get(q.sectionId) && (
                        <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-normal text-[#6C757D]">
                          {secTitle.get(q.sectionId)}
                        </span>
                      )}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        isSkipped
                          ? "bg-amber-50 text-amber-600"
                          : isCorrect
                            ? "bg-green-100 text-green-700"
                            : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {isSkipped ? "স্কিপ" : isCorrect ? "সঠিক " : "ভুল "}
                    </span>
                  </div>

                  {isGap ? (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <div
                        className={`rounded-md border px-4 py-2.5 text-sm ${
                          isCorrect
                            ? "border-green-300 bg-green-50 text-green-800"
                            : "border-rose-400 bg-rose-50 text-rose-700"
                        }`}
                      >
                        আপনার উত্তর:{" "}
                        <b>{isSkipped ? "—" : String(picked)}</b>
                      </div>
                      <div className="rounded-md border border-[#E51A24] bg-red-50 px-4 py-2.5 text-sm text-emerald-700">
                        সঠিক উত্তর: <b>{acceptedList.join(" / ")}</b>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {options.map((opt, i) => {
                        const correctOpt = i === q.correctOption;
                        const pickedOpt = i === picked;
                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-3 rounded-md border px-4 py-2.5 text-sm ${
                              correctOpt
                                ? "border-green-300 bg-green-50 text-green-800"
                                : pickedOpt
                                  ? "border-rose-400 bg-rose-50 text-rose-700"
                                  : "border-black/[0.07] text-[#6C757D]"
                            }`}
                          >
                            <span className="font-bold">
                              {q.qtype === "tfng" ? "" : `${OPTION_LABELS[i]}.`}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {correctOpt && <span></span>}
                            {pickedOpt && !correctOpt && <span></span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {q.explanation && (
                    <p className="mt-4 rounded-md bg-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-700">
                      <span className="font-semibold text-slate-600">
                        ব্যাখ্যা:
                      </span>{" "}
                      {q.explanation}
                    </p>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
