import SpringHeading from "@/components/SpringHeading";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { exams } from "@/db/schema";
import { eq } from "drizzle-orm";
import ExamForm from "../ExamForm";
import QuestionManager from "./QuestionManager";
import { rulesOf } from "@/lib/examRules";

export const dynamic = "force-dynamic";

export default async function EditExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const examId = Number(id);
  if (!Number.isFinite(examId)) notFound();

  const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
  if (!exam) notFound();

  return (
    <div className="anim-fade-up">
      <Link
        href="/admin/exams"
        className="text-sm text-[#6C757D] hover:text-[#E51A24]"
      >
        ← পরীক্ষার তালিকায় ফিরুন
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <SpringHeading as="h1" className="text-2xl font-bold">{exam.title}</SpringHeading>
        <Link
          href={`/exams/${exam.id}`}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:text-[#E51A24]"
        >
          প্রিভিউ দেখুন
        </Link>
      </div>

      <div className="mt-7 space-y-10">
        <section>
          <SpringHeading as="h2" className="mb-4 text-lg font-semibold text-slate-700">
            পরীক্ষার তথ্য
          </SpringHeading>
          <ExamForm
            examId={exam.id}
            initial={{
              title: exam.title,
              description: exam.description,
              category: exam.category,
              module: exam.module,
              durationMinutes: exam.durationMinutes,
              marksPerQuestion: exam.marksPerQuestion,
              negativeMark: exam.negativeMark,
              isLive: exam.isLive,
              rules: rulesOf(exam.rules),
            }}
          />
        </section>

        <section>
          <SpringHeading as="h2" className="mb-4 text-lg font-semibold text-slate-700">
            {exam.module === "writing"
              ? "টাস্ক ব্যবস্থাপনা"
              : "প্রশ্ন ব্যবস্থাপনা"}
          </SpringHeading>
          <QuestionManager examId={exam.id} module={exam.module} />
        </section>
      </div>
    </div>
  );
}
