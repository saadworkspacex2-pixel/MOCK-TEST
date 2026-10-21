import { NextResponse } from "next/server";
import { db } from "@/db";
import { resources } from "@/db/schema";
import { desc } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";

export async function GET() {
  const rows = await db
    .select()
    .from(resources)
    .orderBy(desc(resources.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body?.title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  const [row] = await db
    .insert(resources)
    .values({
      title: String(body.title),
      description: String(body.description ?? ""),
      category: String(body.category ?? "সাধারণ"),
      type: String(body.type ?? "article"),
      url: String(body.url ?? "#"),
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
