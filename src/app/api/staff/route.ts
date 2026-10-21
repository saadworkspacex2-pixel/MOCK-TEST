import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { canAccess } from "@/lib/adminAuth";
import { hashPassword } from "@/lib/userAuth";

export async function GET() {
  if (!(await canAccess("staff"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      createdAt: staff.createdAt,
    })
    .from(staff)
    .orderBy(desc(staff.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  if (!(await canAccess("staff"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const role = String(body?.role ?? "content");
  const password = String(body?.password ?? "");
  if (!name || !email || password.length < 6) {
    return NextResponse.json(
      { error: "নাম, ইমেইল ও ৬+ অক্ষরের পাসওয়ার্ড দিন" },
      { status: 400 },
    );
  }
  const [exists] = await db.select().from(staff).where(eq(staff.email, email));
  if (exists) {
    return NextResponse.json({ error: "ইমেইলটি আগে থেকেই আছে" }, { status: 409 });
  }
  const { salt, hash } = hashPassword(password);
  const [row] = await db
    .insert(staff)
    .values({ name, email, role, salt, passwordHash: hash })
    .returning({ id: staff.id });
  return NextResponse.json(row, { status: 201 });
}
