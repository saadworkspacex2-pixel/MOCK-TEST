import { NextResponse } from "next/server";
import { db } from "@/db";
import { attempts, exams } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { canAccess } from "@/lib/adminAuth";

export async function GET() {
  if (!(await canAccess("grading"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select({ attempt: attempts, exam: exams })
    .from(attempts)
    .innerJoin(exams, eq(attempts.examId, exams.id))
    .where(eq(attempts.status, "pending"))
    .orderBy(desc(attempts.createdAt))
    .limit(100);
  return NextResponse.json(rows);
}
