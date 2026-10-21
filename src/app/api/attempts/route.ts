import { NextResponse } from "next/server";
import { db } from "@/db";
import { attempts, examSessions, exams, questions } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";
import { currentUser } from "@/lib/userAuth";
import { bandFromRaw, normalizeAnswer } from "@/lib/band";
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
  const timeTakenSeconds = Math.max(0, Number(body?.timeTakenSeconds ?? 0));
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
      const given = normalizeAnswer(rawGiven);
      cleanAnswers[String(q.id)] = rawGiven;
      const accepted = q.acceptedAnswers.split("|").map((a) => a.trim()).filter(Boolean);
      const matched = accepted.some((a) => {
        if (a.startsWith("re:")) {
          try {
            return new RegExp(a.slice(3), "i").test(rawGiven);
          } catch {
            return false;
          }
        }
        return normalizeAnswer(a) === given;
      });
      if (matched) correct++;
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
