import { NextResponse } from "next/server";
import { db } from "@/db";
import { exams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const [row] = await db
    .select()
    .from(exams)
    .where(eq(exams.id, Number(id)));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const [row] = await db
    .update(exams)
    .set({
      ...(body.title !== undefined && { title: String(body.title) }),
      ...(body.description !== undefined && {
        description: String(body.description),
      }),
      ...(body.category !== undefined && { category: String(body.category) }),
      ...(body.durationMinutes !== undefined && {
        durationMinutes: Number(body.durationMinutes),
      }),
      ...(body.marksPerQuestion !== undefined && {
        marksPerQuestion: Number(body.marksPerQuestion),
      }),
      ...(body.negativeMark !== undefined && {
        negativeMark: Number(body.negativeMark),
      }),
      ...(body.isLive !== undefined && { isLive: Boolean(body.isLive) }),
    })
    .where(eq(exams.id, Number(id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.delete(exams).where(eq(exams.id, Number(id)));
  return NextResponse.json({ ok: true });
}
