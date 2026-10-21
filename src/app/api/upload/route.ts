import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";

const MAX_BYTES = 20 * 1024 * 1024; // 20MB

function allowedMime(mime: string): boolean {
  return (
    mime.startsWith("audio/") ||
    mime.startsWith("image/") ||
    mime === "application/pdf" ||
    mime === "font/woff2" ||
    mime === "font/woff" ||
    mime === "font/ttf" ||
    mime === "font/otf" ||
    mime === "application/font-woff" ||
    mime === "application/vnd.ms-fontobject" ||
    mime === "application/octet-stream"
  );
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "ফাইল পাওয়া যায়নি" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "ফাইল সর্বোচ্চ ২০ মেগাবাইট হতে পারবে" },
      { status: 413 },
    );
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const fontExts = ["woff2", "woff", "ttf", "otf"];
  let mime = file.type || "application/octet-stream";
  if (fontExts.includes(ext)) {
    mime = ext === "woff2" ? "font/woff2" : ext === "woff" ? "font/woff" : `font/${ext}`;
  }
  if (!allowedMime(mime)) {
    return NextResponse.json(
      { error: "অডিও, ছবি, PDF বা ফন্ট ফাইল আপলোড করুন" },
      { status: 415 },
    );
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const [row] = await db
    .insert(media)
    .values({
      filename: file.name,
      mime,
      data: buf.toString("base64"),
    })
    .returning({ id: media.id });

  return NextResponse.json(
    { url: `/api/media/${row.id}`, id: row.id, mime, size: file.size },
    { status: 201 },
  );
}
