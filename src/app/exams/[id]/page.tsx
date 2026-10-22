import { notFound } from "next/navigation";
import { db } from "@/db";
import { attempts, exams, questions, sections } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StartExamCard from "./StartExamCard";
import { toBn } from "@/lib/bn";

export const dynamic = "force-dynamic";

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const examId = Number(id);
  if (!Number.isFinite(examId)) notFound();

  const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
  if (!exam) notFound();

  const [[qCount], [secCount], topAttempts] = await Promise.all([
    db
      .select({ c: count() })
      .from(questions)
      .where(eq(questions.examId, examId)),
    db
      .select({ c: count() })
      .from(sections)
      .where(eq(sections.examId, examId)),
    db
      .select()
      .from(attempts)
      .where(eq(attempts.examId, examId))
      .orderBy(desc(attempts.score), desc(attempts.createdAt))
      .limit(5),
  ]);

  const passageRows = await db
    .select({ id: sections.id, title: sections.title, passageTitle: sections.passageTitle, audioUrl: sections.audioUrl })
    .from(sections)
    .where(eq(sections.examId, examId))
    .orderBy(sections.sortOrder);

  const totalMarks = qCount.c * exam.marksPerQuestion;
  const isWriting = exam.module === "writing";
  const isReading =
    exam.module === "reading" || exam.module === "listening";
  const moduleBadge = isWriting
    ? "Writing"
    : exam.module === "listening"
      ? "Listening"
      : isReading
        ? "Reading"
        : "MCQ";

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-24 sm:px-6">
        <div className="anim-fade-up">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {exam.category}
          </span>
          <span className="ml-2 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-[#E51A24]">
            {moduleBadge}
          </span>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{exam.title}</h1>
          {exam.description && (
            <p className="mt-3 max-w-2xl leading-relaxed text-[#6C757D]">
              {exam.description}
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="space-y-6 lg:col-span-2">
            <div className="anim-fade-up delay-100 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(isWriting
                ? [
                    { label: "টাস্ক", value: toBn(secCount.c) },
                    { label: "সময়", value: `${toBn(exam.durationMinutes)} মি` },
                    { label: "মার্কিং", value: "ইনস্ট্রাক্টর" },
                    { label: "ফলাফল", value: "রিভিউর পর" },
                  ]
                : isReading
                  ? [
                      { label: "মোট প্রশ্ন", value: toBn(qCount.c) },
                      { label: "সময়", value: `${toBn(exam.durationMinutes)} মি` },
                      { label: "প্যাসেজ", value: toBn(secCount.c) },
                      { label: "স্কোর", value: "ব্যান্ড" },
                    ]
                  : [
                      { label: "মোট প্রশ্ন", value: toBn(qCount.c) },
                      { label: "সময়", value: `${toBn(exam.durationMinutes)} মি` },
                      { label: "পূর্ণমান", value: toBn(totalMarks) },
                      {
                        label: "নেগেটিভ মার্ক",
                        value: `-${toBn(exam.negativeMark)}`,
                      },
                    ]
              ).map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-black/[0.07] card p-5 text-center"
                >
                  <div className="text-xl font-bold text-[#E51A24]">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs text-[#6C757D]">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="anim-fade-up delay-200 rounded-lg border border-black/[0.07] card p-7">
              <h2 className="text-lg font-semibold">টেস্টের নিয়মাবলি</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#6C757D]">
                {isWriting ? (
                  <>
                    <li className="flex gap-3">
                      <span className="text-[#E51A24]"></span> স্ক্রিনের বাঁ
                      পাশে টাস্ক, ডান পাশে লেখার জায়গা — লাইভ শব্দগণনাসহ।
                    </li>
                    <li className="flex gap-3">
                      <span className="text-slate-600"></span> সময় শেষ হলে লেখা
                      স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে।
                    </li>
                    <li className="flex gap-3">
                      <span className="text-amber-600"></span> ইনস্ট্রাক্টর
                      আপনার লেখা পড়ে মূল্যায়ন করবেন — শুধু নম্বর নয়, কারণসহ।
                    </li>
                  </>
                ) : isReading ? (
                  <>
                    <li className="flex gap-3">
                      <span className="text-[#E51A24]"></span> আসল
                      কম্পিউটার-ডেলিভার্ড টেস্টের মতো স্ক্রিন — বাঁয়ে প্যাসেজ,
                      ডানে প্রশ্ন, একই ঘড়ি।
                    </li>
                    <li className="flex gap-3">
                      <span className="text-slate-600">↔</span> নিচের নম্বর
                      প্যালেট দিয়ে যেকোনো প্রশ্নে যান, রিভিউ ফ্ল্যাগ দিন।
                    </li>
                    <li className="flex gap-3">
                      <span className="text-slate-600"></span> MCQ,
                      True/False/Not Given ও ফাঁকা পূরণ (টাইপ করা উত্তর) — সব
                      ধরনের প্রশ্ন।
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#E51A24]"></span> জমা দেওয়ার
                      সঙ্গে সঙ্গেই ব্যান্ড স্কোর — বানানের গ্রহণযোগ্য বিকল্পসহ
                      মার্কিং।
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex gap-3">
                      <span className="text-[#E51A24]"></span> প্রতিটি সঠিক
                      উত্তরে {toBn(exam.marksPerQuestion)} নম্বর পাবেন।
                    </li>
                    <li className="flex gap-3">
                      <span className="text-rose-600"></span> প্রতিটি ভুল
                      উত্তরে {toBn(exam.negativeMark)} নম্বর কাটা যাবে। স্কিপ
                      করলে কাটা যাবে না।
                    </li>
                    <li className="flex gap-3">
                      <span className="text-slate-600"></span> সময় শেষ হলে
                      পরীক্ষা স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে।
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#E51A24]"></span> জমা দেওয়ার
                      সঙ্গে সঙ্গেই ফলাফল, ব্যাখ্যাসহ উত্তর ও র্যাঙ্ক।
                    </li>
                  </>
                )}
              </ul>
            </div>

            {passageRows.length > 0 && (
              <div className="anim-fade-up delay-200 card rounded-lg p-7">
                <h2 className="text-lg font-semibold">
                  {exam.module === "writing" ? "টাস্ক তালিকা" : "প্যাসেজ / সেকশন তালিকা"}
                </h2>
                <p className="mt-1 text-sm text-[#6C757D]">
                  মোট {toBn(passageRows.length)}টি {exam.module === "writing" ? "টাস্ক" : "অংশ"}, প্রতিটির জন্য আলাদা প্রশ্ন রয়েছে।
                </p>
                <ol className="mt-4 space-y-2">
                  {passageRows.map((row, i) => (
                    <li key={row.id} className="flex items-center justify-between gap-3 rounded-md border border-black/[0.07] bg-[#F8F9FA] px-4 py-2.5 text-sm">
                      <span className="min-w-0">
                        <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded bg-[#1A1A1A] text-center text-[11px] font-bold text-white">
                          {toBn(i + 1)}
                        </span>
                        <span className="font-semibold">{row.title}</span>
                        {row.passageTitle && <span className="text-[#6C757D]"> · {row.passageTitle}</span>}
                      </span>
                      {row.audioUrl && <span className="badge-neutral shrink-0">অডিও</span>}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="anim-fade-up delay-300 rounded-lg border border-black/[0.07] card p-7">
              <h2 className="text-lg font-semibold">
                এই পরীক্ষার সেরা ফলাফল
              </h2>
              {topAttempts.length === 0 ? (
                <p className="mt-4 text-sm text-[#6C757D]">
                  এখনও কেউ পরীক্ষা দেয়নি — আপনিই প্রথম হোন!
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {topAttempts.map((a, i) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-md bg-slate-100 px-4 py-3 text-sm"
                    >
                      <span className="flex items-center gap-3">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-200 text-xs font-bold">
                          {toBn(i + 1)}
                        </span>
                        <span className="font-medium">{a.studentName}</span>
                      </span>
                      <span className="font-bold text-[#E51A24]">
                        {toBn(a.score)} / {toBn(a.totalQuestions * exam.marksPerQuestion)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="anim-fade-up delay-200">
            <StartExamCard
              examId={exam.id}
              hasQuestions={isWriting ? secCount.c > 0 : qCount.c > 0}
              durationMinutes={exam.durationMinutes}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
