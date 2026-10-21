import { NextResponse } from "next/server";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const [row] = await db
    .update(questions)
    .set({
      ...(body.sectionId !== undefined && {
        sectionId: body.sectionId ? Number(body.sectionId) : null,
      }),
      ...(body.qtype !== undefined && { qtype: String(body.qtype) }),
      ...(body.acceptedAnswers !== undefined && {
        acceptedAnswers: String(body.acceptedAnswers),
      }),
      ...(body.text !== undefined && { text: String(body.text) }),
      ...(body.optionA !== undefined && { optionA: String(body.optionA) }),
      ...(body.optionB !== undefined && { optionB: String(body.optionB) }),
      ...(body.optionC !== undefined && { optionC: String(body.optionC) }),
      ...(body.optionD !== undefined && { optionD: String(body.optionD) }),
      ...(body.correctOption !== undefined && {
        correctOption: Number(body.correctOption),
      }),
      ...(body.explanation !== undefined && {
        explanation: String(body.explanation),
      }),
      ...(body.sortOrder !== undefined && {
        sortOrder: Number(body.sortOrder),
      }),
    })
    .where(eq(questions.id, Number(id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.delete(questions).where(eq(questions.id, Number(id)));
  return NextResponse.json({ ok: true });
}
