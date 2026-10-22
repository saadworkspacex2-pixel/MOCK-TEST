import { NextResponse } from "next/server";
import { db } from "@/db";
import { sections } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { canAccess } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const rows = await db
    .select()
    .from(sections)
    .where(eq(sections.examId, Number(id)))
    .orderBy(asc(sections.sortOrder), asc(sections.id));
  return NextResponse.json(rows);
}

export async function POST(req: Request, { params }: Params) {
  if (!(await canAccess("exams"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const [row] = await db
    .insert(sections)
    .values({
      examId: Number(id),
      title: String(body.title ?? "Part 1"),
      passageTitle: String(body.passageTitle ?? ""),
      passageText: String(body.passageText ?? ""),
      instruction: String(body.instruction ?? ""),
      audioUrl: String(body.audioUrl ?? ""),
      sortOrder: Number(body.sortOrder ?? 0),
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
