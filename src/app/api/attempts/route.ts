import { NextResponse } from "next/server";
import { db } from "@/db";
import { attempts, exams, questions } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";
import { currentUser } from "@/lib/userAuth";
import { bandFromRaw, normalizeAnswer } from "@/lib/band";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select({
      attempt: attempts,
      examTitle: exams.title,
    })
    .from(attempts)
    .innerJoin(exams, eq(attempts.examId, exams.id))
    .orderBy(desc(attempts.createdAt))
    .limit(200);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const examId = Number(body?.examId);
  const user = await currentUser();
  const studentName = String(body?.studentName ?? "").trim();
  const answers: Record<string, number | string> = body?.answers ?? {};
  const essayText = String(body?.essayText ?? "");
  const timeTakenSeconds = Math.max(0, Number(body?.timeTakenSeconds ?? 0));

  if (!examId || !studentName) {
    return NextResponse.json(
      { error: "examId ও studentName প্রয়োজন" },
      { status: 400 },
    );
  }

  const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
  if (!exam) {
    return NextResponse.json({ error: "পরীক্ষা পাওয়া যায়নি" }, { status: 404 });
  }

  // Writing module: stored for instructor review, no auto-score
  if (exam.module === "writing") {
    const [row] = await db
      .insert(attempts)
      .values({
      examId,
      userId: user?.id ?? null,
      studentName,
        score: 0,
        correctCount: 0,
        wrongCount: 0,
        skippedCount: 0,
        totalQuestions: 0,
        timeTakenSeconds,
        answers: {},
        essayText,
        status: "pending",
      })
      .returning();
    return NextResponse.json({ attemptId: row.id }, { status: 201 });
  }

  const qs = await db
    .select()
    .from(questions)
    .where(eq(questions.examId, examId))
    .orderBy(asc(questions.sortOrder), asc(questions.id));

  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  const cleanAnswers: Record<string, number | string> = {};

  for (const q of qs) {
    const picked = answers[String(q.id)];
    if (
      picked === undefined ||
      picked === null ||
      (typeof picked === "string" && picked.trim() === "") ||
      (typeof picked === "number" && picked < 0)
    ) {
      skipped++;
      continue;
    }

    if (q.qtype === "gap") {
      const given = normalizeAnswer(String(picked));
      cleanAnswers[String(q.id)] = String(picked).trim();
      const accepted = q.acceptedAnswers
        .split("|")
        .map((a) => normalizeAnswer(a))
        .filter(Boolean);
      if (accepted.includes(given)) correct++;
      else wrong++;
    } else {
      const idx = Number(picked);
      cleanAnswers[String(q.id)] = idx;
      if (idx === q.correctOption) correct++;
      else wrong++;
    }
  }

  const score =
    Math.round(
      (correct * exam.marksPerQuestion - wrong * exam.negativeMark) * 100,
    ) / 100;

  const bandScore =
    exam.module === "reading" || exam.module === "listening" ? bandFromRaw(correct, qs.length) : null;

  const [row] = await db
    .insert(attempts)
    .values({
      examId,
      userId: user?.id ?? null,
      studentName,
      score,
      bandScore,
      correctCount: correct,
      wrongCount: wrong,
      skippedCount: skipped,
      totalQuestions: qs.length,
      timeTakenSeconds,
      answers: cleanAnswers,
      status: "scored",
    })
    .returning();

  return NextResponse.json({ attemptId: row.id }, { status: 201 });
}
