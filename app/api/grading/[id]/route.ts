import { NextResponse } from "next/server";
import { db } from "@/db";
import { attempts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { canAccess } from "@/lib/adminAuth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await canAccess("grading"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const feedback = body.feedback ?? {};
  const band = Number(body.bandScore ?? 0);
  const [row] = await db
    .update(attempts)
    .set({
      feedback,
      bandScore: band > 0 ? band : null,
      score: band > 0 ? band : 0,
      status: body.status === "pending" ? "pending" : "scored",
    })
    .where(eq(attempts.id, Number(id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
