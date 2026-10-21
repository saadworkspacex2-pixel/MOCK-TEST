import { NextResponse } from "next/server";
import { db } from "@/db";
import { examSessions } from "@/db/schema";
import { currentUser } from "@/lib/userAuth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = String(body?.token ?? "");
  const examId = Number(body?.examId);
  const studentName = String(body?.studentName ?? "");
  if (!token || !examId) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }
  const user = await currentUser();
  await db
    .insert(examSessions)
    .values({
      token,
      examId,
      userId: user?.id ?? null,
      studentName,
      lastSeen: new Date(),
    })
    .onConflictDoUpdate({
      target: examSessions.token,
      set: { lastSeen: new Date(), studentName },
    });
  return NextResponse.json({ ok: true });
}
