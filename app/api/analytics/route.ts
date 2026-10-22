import { NextResponse } from "next/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { attempts, examSessions, exams } from "@/db/schema";
import { canAccess } from "@/lib/adminAuth";

export async function GET() {
  if (!(await canAccess("analytics"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cutoff = new Date(Date.now() - 90_000);
  const [active, allAttempts, sessions] = await Promise.all([
    db
      .select({ session: examSessions, examTitle: exams.title, module: exams.module })
      .from(examSessions)
      .innerJoin(exams, eq(examSessions.examId, exams.id))
      .where(and(eq(examSessions.submitted, false), gt(examSessions.lastSeen, cutoff)))
      .orderBy(desc(examSessions.lastSeen))
      .limit(50),
    db
      .select({ attempt: attempts, module: exams.module })
      .from(attempts)
      .innerJoin(exams, eq(attempts.examId, exams.id))
      .limit(2000),
    db.select().from(examSessions).limit(5000),
  ]);

  const scored = allAttempts.filter((r) => r.attempt.status === "scored");
  const withPercent = scored.filter((r) => r.attempt.totalQuestions > 0);
  const passed = withPercent.filter(
    (r) => r.attempt.correctCount / Math.max(1, r.attempt.totalQuestions) >= 0.5,
  ).length;

  const modules = ["reading", "listening", "writing", "mcq"].map((m) => {
    const rows = scored.filter((r) => r.module === m);
    const bands = rows
      .map((r) => r.attempt.bandScore)
      .filter((b): b is number => b !== null);
    return {
      module: m,
      attempts: rows.length,
      avgBand: bands.length
        ? Math.round((bands.reduce((a, b) => a + b, 0) / bands.length) * 100) / 100
        : null,
    };
  });

  const submittedSessions = sessions.filter((s) => s.submitted).length;

  return NextResponse.json({
    active: active.map((r) => ({
      id: r.session.id,
      studentName: r.session.studentName,
      examTitle: r.examTitle,
      module: r.module,
      lastSeen: r.session.lastSeen,
    })),
    totalAttempts: allAttempts.length,
    pending: allAttempts.length - scored.length,
    passRate: withPercent.length ? Math.round((passed / withPercent.length) * 100) : 0,
    failRate: withPercent.length ? 100 - Math.round((passed / withPercent.length) * 100) : 0,
    completionRate: sessions.length
      ? Math.round((submittedSessions / sessions.length) * 100)
      : 100,
    modules,
    generatedAt: new Date(),
  });
}
