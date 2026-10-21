import { db } from "@/db";
import { attempts, exams } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export type ModuleStat = {
  module: string;
  label: string;
  attempts: number;
  bestBand: number | null;
  avgPercent: number;
};

export async function getProfileData(userId: number) {
  const rows = await db
    .select({ attempt: attempts, exam: exams })
    .from(attempts)
    .innerJoin(exams, eq(attempts.examId, exams.id))
    .where(eq(attempts.userId, userId))
    .orderBy(desc(attempts.createdAt))
    .limit(100);

  const mods: Record<string, { label: string; rows: typeof rows }> = {
    reading: { label: "Reading", rows: [] },
    listening: { label: "Listening", rows: [] },
    writing: { label: "Writing", rows: [] },
    mcq: { label: "Grammar/MCQ", rows: [] },
  };
  for (const r of rows) {
    (mods[r.exam.module] ?? mods.mcq).rows.push(r);
  }

  const moduleStats: ModuleStat[] = Object.entries(mods).map(([m, v]) => {
    const scored = v.rows.filter((r) => r.attempt.status === "scored");
    const bands = scored
      .map((r) => r.attempt.bandScore)
      .filter((b): b is number => b !== null);
    const percents = scored
      .filter((r) => r.attempt.totalQuestions > 0)
      .map(
        (r) =>
          (r.attempt.correctCount / Math.max(1, r.attempt.totalQuestions)) *
          100,
      );
    return {
      module: m,
      label: v.label,
      attempts: v.rows.length,
      bestBand: bands.length ? Math.max(...bands) : null,
      avgPercent: percents.length
        ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length)
        : 0,
    };
  });

  const scoredAll = rows.filter(
    (r) => r.attempt.status === "scored" && r.attempt.totalQuestions > 0,
  );
  const overallPercent = scoredAll.length
    ? Math.round(
        scoredAll.reduce(
          (a, r) =>
            a +
            (r.attempt.correctCount / Math.max(1, r.attempt.totalQuestions)) *
              100,
          0,
        ) / scoredAll.length,
      )
    : 0;
  const allBands = rows
    .map((r) => r.attempt.bandScore)
    .filter((b): b is number => b !== null);
  const overallBand = allBands.length
    ? Math.round((allBands.reduce((a, b) => a + b, 0) / allBands.length) * 2) /
      2
    : null;

  // progress: oldest -> newest percent per scored attempt (max 12 points)
  const progress = [...scoredAll]
    .reverse()
    .slice(-12)
    .map((r) => ({
      label: r.exam.title,
      percent: Math.round(
        (r.attempt.correctCount / Math.max(1, r.attempt.totalQuestions)) * 100,
      ),
      band: r.attempt.bandScore,
      date: r.attempt.createdAt,
    }));

  return { rows, moduleStats, overallPercent, overallBand, progress };
}
