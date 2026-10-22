import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [row] = await db.select().from(media).where(eq(media.id, Number(id)));
  if (!row) return new Response("Not found", { status: 404 });
  const buf = Buffer.from(row.data, "base64");
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": row.mime,
      "Content-Length": String(buf.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
      "Content-Disposition": `inline; filename="${encodeURIComponent(row.filename)}"`,
    },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.delete(media).where(eq(media.id, Number(id)));
  return NextResponse.json({ ok: true });
}
