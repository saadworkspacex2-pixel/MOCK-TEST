import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { desc } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select({
      id: media.id,
      filename: media.filename,
      mime: media.mime,
      createdAt: media.createdAt,
      size: media.data,
    })
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(300);
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      filename: r.filename,
      mime: r.mime,
      createdAt: r.createdAt,
      bytes: Math.floor((r.size.length * 3) / 4),
      url: `/api/media/${r.id}`,
    })),
  );
}
