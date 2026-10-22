import { NextResponse } from "next/server";
import { db } from "@/db";
import { exams } from "@/db/schema";
import { desc } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";

export async function GET() {
  const rows = await db.select().from(exams).orderBy(desc(exams.createdAt));
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
    .insert(exams)
    .values({
      title: String(body.title),
      description: String(body.description ?? ""),
      category: String(body.category ?? "সাধারণ জ্ঞান"),
      durationMinutes: Number(body.durationMinutes ?? 20),
      marksPerQuestion: Number(body.marksPerQuestion ?? 1),
      negativeMark: Number(body.negativeMark ?? 0.25),
      isLive: Boolean(body.isLive ?? true),
      rules: body.rules ?? {},
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
