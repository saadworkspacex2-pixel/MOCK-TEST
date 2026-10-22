import SpringHeading from "@/components/SpringHeading";
import Link from "next/link";
import { db } from "@/db";
import { attempts, exams, questions, resources } from "@/db/schema";
import { avg, count, desc, eq } from "drizzle-orm";
import { formatDateBn, toBn } from "@/lib/bn";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    [examCount],
    [liveCount],
    [questionCount],
    [attemptCount],
    [resourceCount],
    [avgScore],
    recentAttempts,
  ] = await Promise.all([
    db.select({ c: count() }).from(exams),
    db.select({ c: count() }).from(exams).where(eq(exams.isLive, true)),
    db.select({ c: count() }).from(questions),
    db.select({ c: count() }).from(attempts),
    db.select({ c: count() }).from(resources),
    db.select({ a: avg(attempts.score) }).from(attempts),
    db
      .select({ attempt: attempts, examTitle: exams.title })
      .from(attempts)
      .innerJoin(exams, eq(attempts.examId, exams.id))
      .orderBy(desc(attempts.createdAt))
      .limit(8),
  ]);

  const stats = [
    { label: "মোট পরীক্ষা", value: toBn(examCount.c), icon: "doc" },
    { label: "লাইভ পরীক্ষা", value: toBn(liveCount.c), icon: "play" },
    { label: "মোট প্রশ্ন", value: toBn(questionCount.c), icon: "target" },
    { label: "মোট অ্যাটেম্পট", value: toBn(attemptCount.c), icon: "users" },
    { label: "রিসোর্স", value: toBn(resourceCount.c), icon: "book" },
    {
      label: "গড় স্কোর",
      value: toBn(avgScore.a ? Math.round(Number(avgScore.a) * 100) / 100 : 0),
      icon: "chart",
    },
  ];

  return (
    <div>
      <div className="anim-fade-up flex flex-wrap items-center justify-between gap-4">
        <div>
          <SpringHeading as="h1" className="text-2xl font-bold">ড্যাশবোর্ড</SpringHeading>
          <p className="mt-1 text-sm text-[#6C757D]">
            প্ল্যাটফর্মের সার্বিক চিত্র এক নজরে
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/exams/new"
            className="rounded-md btn-red px-5 py-2.5 text-sm font-bold text-white transition"
          >
            + নতুন পরীক্ষা
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="anim-fade-up card rounded-lg p-5"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="grid h-9 w-9 place-items-center rounded-md bg-[#F8F9FA] text-[#1A1A1A]">
              <Icon name={s.icon} size={18} />
            </div>
            <div className="mt-3 text-2xl font-bold">{s.value}</div>
            <div className="mt-1 text-xs text-[#6C757D]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="anim-fade-up delay-300 mt-10">
        <div className="flex items-center justify-between">
          <SpringHeading as="h2" className="text-lg font-semibold">সাম্প্রতিক অ্যাটেম্পট</SpringHeading>
          <Link
            href="/admin/results"
            className="text-sm text-[#E51A24] hover:underline"
          >
            সব দেখুন →
          </Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-black/[0.07]">
          <table className="w-full text-sm">
            <thead className="bg-white text-left text-xs text-[#6C757D]">
              <tr>
                <th className="px-5 py-3.5">নাম</th>
                <th className="px-5 py-3.5">পরীক্ষা</th>
                <th className="px-5 py-3.5 text-right">স্কোর</th>
                <th className="hidden px-5 py-3.5 text-right sm:table-cell">
                  সঠিক/ভুল
                </th>
                <th className="hidden px-5 py-3.5 text-right md:table-cell">
                  তারিখ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentAttempts.map((r) => (
                <tr key={r.attempt.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-medium">
                    {r.attempt.studentName}
                  </td>
                  <td className="px-5 py-3.5 text-[#6C757D]">{r.examTitle}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-[#E51A24]">
                    {toBn(r.attempt.score)}
                  </td>
                  <td className="hidden px-5 py-3.5 text-right text-[#6C757D] sm:table-cell">
                    <span className="text-green-600">
                      {toBn(r.attempt.correctCount)}
                    </span>{" "}
                    /{" "}
                    <span className="text-rose-600">
                      {toBn(r.attempt.wrongCount)}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3.5 text-right text-slate-500 md:table-cell">
                    {formatDateBn(r.attempt.createdAt)}
                  </td>
                </tr>
              ))}
              {recentAttempts.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-[#6C757D]"
                  >
                    এখনও কোনো অ্যাটেম্পট নেই।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
