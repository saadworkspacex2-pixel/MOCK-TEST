import { NextResponse } from "next/server";
import { db } from "@/db";
import { exams, questions, sections } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };

// Public: returns sections + questions WITHOUT correct answers (for taking the exam).
// Admin (?full=1 with admin cookie): includes answers & explanations.
export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  const examId = Number(id);
  const url = new URL(req.url);
  const wantFull = url.searchParams.get("full") === "1";

  const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
  if (!exam) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [secs, rows] = await Promise.all([
    db
      .select()
      .from(sections)
      .where(eq(sections.examId, examId))
      .orderBy(asc(sections.sortOrder), asc(sections.id)),
    db
      .select()
      .from(questions)
      .where(eq(questions.examId, examId))
      .orderBy(asc(questions.sortOrder), asc(questions.id)),
  ]);

  if (wantFull && (await isAdmin())) {
    return NextResponse.json({ exam, sections: secs, questions: rows });
  }

  const sanitized = rows.map((q) => ({
    id: q.id,
    sectionId: q.sectionId,
    qtype: q.qtype,
    text: q.text,
    options:
      q.qtype === "tfng"
        ? ["TRUE", "FALSE", "NOT GIVEN"]
        : [q.optionA, q.optionB, q.optionC, q.optionD],
  }));
  return NextResponse.json({ exam, sections: secs, questions: sanitized });
}

export async function POST(req: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }
  const [row] = await db
    .insert(questions)
    .values({
      examId: Number(id),
      sectionId: body.sectionId ? Number(body.sectionId) : null,
      qtype: String(body.qtype ?? "mcq"),
      text: String(body.text),
      optionA: String(body.optionA ?? ""),
      optionB: String(body.optionB ?? ""),
      optionC: String(body.optionC ?? ""),
      optionD: String(body.optionD ?? ""),
      correctOption: Number(body.correctOption ?? 0),
      acceptedAnswers: String(body.acceptedAnswers ?? ""),
      explanation: String(body.explanation ?? ""),
      sortOrder: Number(body.sortOrder ?? 0),
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
