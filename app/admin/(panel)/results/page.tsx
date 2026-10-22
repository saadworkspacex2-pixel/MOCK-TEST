import SpringHeading from "@/components/SpringHeading";
import { db } from "@/db";
import { attempts, exams } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { formatDateBn, formatDuration, toBn } from "@/lib/bn";

export const dynamic = "force-dynamic";

export default async function AdminResultsPage() {
  const rows = await db
    .select({ attempt: attempts, examTitle: exams.title })
    .from(attempts)
    .innerJoin(exams, eq(attempts.examId, exams.id))
    .orderBy(desc(attempts.createdAt))
    .limit(200);

  return (
    <div>
      <div className="anim-fade-up">
        <SpringHeading as="h1" className="text-2xl font-bold">সব ফলাফল</SpringHeading>
        <p className="mt-1 text-sm text-[#6C757D]">
          শিক্ষার্থীদের সাম্প্রতিক {toBn(rows.length)}টি অ্যাটেম্পট
        </p>
      </div>

      <div className="anim-fade-up delay-100 mt-7 overflow-x-auto rounded-lg border border-black/[0.07]">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-white text-left text-xs text-[#6C757D]">
            <tr>
              <th className="px-5 py-3.5">#</th>
              <th className="px-5 py-3.5">নাম</th>
              <th className="px-5 py-3.5">পরীক্ষা</th>
              <th className="px-5 py-3.5 text-right">স্কোর</th>
              <th className="px-5 py-3.5 text-right">সঠিক</th>
              <th className="px-5 py-3.5 text-right">ভুল</th>
              <th className="px-5 py-3.5 text-right">স্কিপ</th>
              <th className="px-5 py-3.5 text-right">সময়</th>
              <th className="px-5 py-3.5 text-right">তারিখ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((r, i) => (
              <tr key={r.attempt.id} className="hover:bg-slate-50">
                <td className="px-5 py-3.5 text-slate-500">{toBn(i + 1)}</td>
                <td className="px-5 py-3.5 font-medium">
                  {r.attempt.studentName}
                </td>
                <td className="px-5 py-3.5 text-[#6C757D]">{r.examTitle}</td>
                <td className="px-5 py-3.5 text-right font-bold text-[#E51A24]">
                  {toBn(r.attempt.score)}
                </td>
                <td className="px-5 py-3.5 text-right text-green-600">
                  {toBn(r.attempt.correctCount)}
                </td>
                <td className="px-5 py-3.5 text-right text-rose-600">
                  {toBn(r.attempt.wrongCount)}
                </td>
                <td className="px-5 py-3.5 text-right text-amber-600">
                  {toBn(r.attempt.skippedCount)}
                </td>
                <td className="px-5 py-3.5 text-right text-[#6C757D]">
                  {formatDuration(r.attempt.timeTakenSeconds)}
                </td>
                <td className="px-5 py-3.5 text-right text-slate-500">
                  {formatDateBn(r.attempt.createdAt)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-14 text-center text-[#6C757D]"
                >
                  এখনও কোনো ফলাফল নেই।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
