import { NextResponse } from "next/server";
import { db } from "@/db";
import { resources } from "@/db/schema";
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
    .update(resources)
    .set({
      ...(body.title !== undefined && { title: String(body.title) }),
      ...(body.description !== undefined && {
        description: String(body.description),
      }),
      ...(body.category !== undefined && { category: String(body.category) }),
      ...(body.type !== undefined && { type: String(body.type) }),
      ...(body.url !== undefined && { url: String(body.url) }),
    })
    .where(eq(resources.id, Number(id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.delete(resources).where(eq(resources.id, Number(id)));
  return NextResponse.json({ ok: true });
}
