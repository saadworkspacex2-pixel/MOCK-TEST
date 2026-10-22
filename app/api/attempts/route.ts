import { NextResponse } from "next/server";
import { db } from "@/db";
import { attempts, examSessions, exams, questions } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";
import { currentUser } from "@/lib/userAuth";
import { bandFromRaw, matchesAcceptedAnswer } from "@/lib/band";
import { rulesOf } from "@/lib/examRules";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select({ attempt: attempts, examTitle: exams.title })
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
  const sessionToken = String(body?.sessionToken ?? "");
  const claimedSeconds = Number(body?.timeTakenSeconds ?? 0);
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "";

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
  const rules = rulesOf(exam.rules);

  const durationSeconds = exam.durationMinutes * 60;
  if (!Number.isFinite(claimedSeconds) || claimedSeconds < 0 || claimedSeconds > durationSeconds + 120) {
    return NextResponse.json(
      { error: "সময়ের তথ্য সঠিক নয়। পরীক্ষাটি আবার শুরু করুন।" },
      { status: 400 },
    );
  }
  const timeTakenSeconds = Math.round(claimedSeconds);

  // Validate the browser's claimed duration against the server-side session.
  if (sessionToken) {
    const [session] = await db
      .select()
      .from(examSessions)
      .where(and(eq(examSessions.token, sessionToken), eq(examSessions.examId, examId)));
    if (!session) {
      return NextResponse.json({ error: "পরীক্ষার সেশন পাওয়া যায়নি" }, { status: 400 });
    }
    if (session.submitted) {
      return NextResponse.json({ error: "এই পরীক্ষাটি একবার জমা হয়েছে" }, { status: 409 });
    }
    const serverElapsed = Math.max(0, Math.floor((Date.now() - session.createdAt.getTime()) / 1000));
    if (serverElapsed < 5) {
      return NextResponse.json({ error: "অস্বাভাবিক দ্রুত জমা শনাক্ত হয়েছে" }, { status: 400 });
    }
    if (Math.abs(timeTakenSeconds - serverElapsed) > 120) {
      return NextResponse.json({ error: "সময় যাচাই ব্যর্থ হয়েছে" }, { status: 400 });
    }
  }

  const closeSession = async () => {
    if (sessionToken) {
      await db
        .update(examSessions)
        .set({ submitted: true, lastSeen: new Date() })
        .where(eq(examSessions.token, sessionToken));
    }
  };

  // Writing module: stored for instructor review, no auto-score
  if (exam.module === "writing") {
    const [row] = await db
      .insert(attempts)
      .values({
        examId,
        userId: user?.id ?? null,
        studentName,
        score: 0,
        totalQuestions: 0,
        timeTakenSeconds,
        answers: {},
        essayText,
        status: "pending",
        ip,
      })
      .returning();
    await closeSession();
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
  let hasEssay = false;
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

    if (q.qtype === "essay") {
      hasEssay = true;
      cleanAnswers[String(q.id)] = String(picked);
      continue;
    }

    if (q.qtype === "gap") {
      const rawGiven = String(picked).trim();
      cleanAnswers[String(q.id)] = rawGiven;
      if (matchesAcceptedAnswer(rawGiven, q.acceptedAnswers)) correct++;
      else wrong++;
    } else if (q.qtype === "dnd") {
      const order = String(picked).replace(/\s/g, "");
      cleanAnswers[String(q.id)] = order;
      if (order === q.acceptedAnswers.replace(/\s/g, "")) correct++;
      else wrong++;
    } else {
      // mcq, tfng and matching all use an option index
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
    exam.module === "reading" || exam.module === "listening"
      ? bandFromRaw(correct, qs.length)
      : null;

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
      status: hasEssay || rules.hideResults ? "pending" : "scored",
      ip,
    })
    .returning();

  await closeSession();
  return NextResponse.json({ attemptId: row.id }, { status: 201 });
}
