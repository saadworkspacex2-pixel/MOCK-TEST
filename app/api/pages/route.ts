import { NextResponse } from "next/server";
import { db } from "@/db";
import { pageSections } from "@/db/schema";
import { asc } from "drizzle-orm";
import { canAccess, isAdmin } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(pageSections)
    .orderBy(asc(pageSections.page), asc(pageSections.sortOrder));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  if (!(await canAccess("pages"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body?.page || !body?.type) {
    return NextResponse.json({ error: "page ও type প্রয়োজন" }, { status: 400 });
  }
  const [row] = await db
    .insert(pageSections)
    .values({
      page: String(body.page),
      type: String(body.type),
      title: String(body.title ?? ""),
      content: body.content ?? {},
      sortOrder: Number(body.sortOrder ?? 0),
      enabled: body.enabled !== false,
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
