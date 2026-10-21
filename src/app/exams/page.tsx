import Link from "next/link";
import { db } from "@/db";
import { exams, questions } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicSections from "@/components/DynamicSections";
import Reveal from "@/components/Reveal";
import { toBn } from "@/lib/bn";

export const dynamic = "force-dynamic";

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const rows = await db
    .select({
      exam: exams,
      questionCount: count(questions.id),
    })
    .from(exams)
    .leftJoin(questions, eq(questions.examId, exams.id))
    .where(eq(exams.isLive, true))
    .groupBy(exams.id)
    .orderBy(desc(exams.createdAt));

  const categories = Array.from(new Set(rows.map((r) => r.exam.category)));
  const filtered = category
    ? rows.filter((r) => r.exam.category === category)
    : rows;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6">
        <div className="anim-fade-up">
          <h1 className="text-3xl font-bold sm:text-4xl">
            লাইভ <span className="text-[#E51A24]">পরীক্ষাসমূহ</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[#6C757D]">
            পছন্দের বিষয় বেছে নিয়ে এখনই মক টেস্ট শুরু করুন। প্রতিটি পরীক্ষায়
            টাইমার, নেগেটিভ মার্কিং ও সঙ্গে সঙ্গে ফলাফল।
          </p>
        </div>

        <div className="anim-fade-up delay-200 mt-8 flex flex-wrap gap-2">
          <Link
            href="/exams"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !category
                ? "bg-[#E51A24] text-white"
                : "border border-slate-300 text-slate-700 hover:border-red-300"
            }`}
          >
            সব ({toBn(rows.length)})
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/exams?category=${encodeURIComponent(c)}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                category === c
                  ? "bg-[#E51A24] text-white"
                  : "border border-slate-300 text-slate-700 hover:border-red-300"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {filtered.map((r, i) => (
            <Reveal key={r.exam.id} delay={(i % 3) * 80}>
              <Link
                href={`/exams/${r.exam.id}`}
                className="lift group block h-full rounded-lg border border-black/[0.07] card p-6 hover:border-red-300"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {r.exam.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#E51A24]">
                    <span className="anim-pulse-ring h-1.5 w-1.5 rounded-full bg-[#E51A24]" />
                    লাইভ
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-semibold transition-colors group-hover:text-[#E51A24]">
                  {r.exam.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-[#6C757D]">
                  {r.exam.description}
                </p>
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-black/[0.07] pt-4 text-center text-xs">
                  <div>
                    <div className="font-bold text-slate-800">
                      {r.exam.module === "writing"
                        ? "টাস্ক"
                        : toBn(r.questionCount)}
                    </div>
                    <div className="text-slate-500">
                      {r.exam.module === "writing" ? "রাইটিং" : "প্রশ্ন"}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">
                      {toBn(r.exam.durationMinutes)} মি
                    </div>
                    <div className="text-slate-500">সময়</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-600">
                      {r.exam.module === "listening" ? "অডিও" : "স্ক্রিন"}
                    </div>
                    <div className="text-slate-500">
                      {r.exam.module === "reading"
                        ? "Reading"
                        : r.exam.module === "listening"
                          ? "Listening"
                          : r.exam.module === "writing"
                            ? "Writing"
                            : "MCQ"}
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-20 text-center text-[#6C757D]">
              কোনো পরীক্ষা পাওয়া যায়নি।
            </p>
          )}
        </div>
      </main>
      <DynamicSections page="exams" />
      <Footer />
    </div>
  );
}
