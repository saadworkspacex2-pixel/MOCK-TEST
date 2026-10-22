import { NextResponse } from "next/server";
import { db } from "@/db";
import { exams, questions, sections } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { canAccess } from "@/lib/adminAuth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await canAccess("exams"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const examId = Number(id);
  const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
  if (!exam) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [secs, qs] = await Promise.all([
    db.select().from(sections).where(eq(sections.examId, examId)).orderBy(asc(sections.sortOrder)),
    db.select().from(questions).where(eq(questions.examId, examId)).orderBy(asc(questions.sortOrder)),
  ]);
  return NextResponse.json({
    exam: {
      title: exam.title,
      description: exam.description,
      category: exam.category,
      module: exam.module,
      durationMinutes: exam.durationMinutes,
      marksPerQuestion: exam.marksPerQuestion,
      negativeMark: exam.negativeMark,
      isLive: exam.isLive,
      rules: exam.rules,
    },
    sections: secs.map((s) => ({
      key: s.id,
      title: s.title,
      passageTitle: s.passageTitle,
      passageText: s.passageText,
      instruction: s.instruction,
      audioUrl: s.audioUrl,
      sortOrder: s.sortOrder,
    })),
    questions: qs.map((q) => ({
      sectionKey: q.sectionId,
      qtype: q.qtype,
      text: q.text,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      acceptedAnswers: q.acceptedAnswers,
      explanation: q.explanation,
      sortOrder: q.sortOrder,
    })),
  });
}
