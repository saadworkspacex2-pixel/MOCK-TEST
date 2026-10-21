import { NextResponse } from "next/server";
import { db } from "@/db";
import { pageSections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { canAccess } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  if (!(await canAccess("pages"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const [row] = await db
    .update(pageSections)
    .set({
      ...(body.page !== undefined && { page: String(body.page) }),
      ...(body.type !== undefined && { type: String(body.type) }),
      ...(body.title !== undefined && { title: String(body.title) }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.sortOrder !== undefined && {
        sortOrder: Number(body.sortOrder),
      }),
      ...(body.enabled !== undefined && { enabled: Boolean(body.enabled) }),
    })
    .where(eq(pageSections.id, Number(id)))
    .returning();
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await canAccess("pages"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.delete(pageSections).where(eq(pageSections.id, Number(id)));
  return NextResponse.json({ ok: true });
}
