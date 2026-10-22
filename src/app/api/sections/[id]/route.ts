import { NextResponse } from "next/server";
import { db } from "@/db";
import { sections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { canAccess } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  if (!(await canAccess("exams"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const [row] = await db
    .update(sections)
    .set({
      ...(body.title !== undefined && { title: String(body.title) }),
      ...(body.passageTitle !== undefined && {
        passageTitle: String(body.passageTitle),
      }),
      ...(body.passageText !== undefined && {
        passageText: String(body.passageText),
      }),
      ...(body.instruction !== undefined && {
        instruction: String(body.instruction),
      }),
      ...(body.audioUrl !== undefined && { audioUrl: String(body.audioUrl) }),
      ...(body.sortOrder !== undefined && {
        sortOrder: Number(body.sortOrder),
      }),
    })
    .where(eq(sections.id, Number(id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await canAccess("exams"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.delete(sections).where(eq(sections.id, Number(id)));
  return NextResponse.json({ ok: true });
}
