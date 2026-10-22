import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { canAccess } from "@/lib/adminAuth";
import { hashPassword } from "@/lib/userAuth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  if (!(await canAccess("staff"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const password = String(body.password ?? "");
  const credentials = password
    ? hashPassword(password)
    : null;
  const [row] = await db
    .update(staff)
    .set({
      ...(body.name !== undefined && { name: String(body.name) }),
      ...(body.role !== undefined && { role: String(body.role) }),
      ...(credentials && { salt: credentials.salt, passwordHash: credentials.hash }),
    })
    .where(eq(staff.id, Number(id)))
    .returning({ id: staff.id });
  return NextResponse.json(row ?? { error: "Not found" });
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await canAccess("staff"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.delete(staff).where(eq(staff.id, Number(id)));
  return NextResponse.json({ ok: true });
}
