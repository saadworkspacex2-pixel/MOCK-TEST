import { db } from "@/db";
import { exams } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.select({ id: exams.id }).from(exams).limit(1);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Healthcheck error:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
