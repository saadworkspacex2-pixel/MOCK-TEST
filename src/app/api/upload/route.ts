import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";

const MAX_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
  "audio/webm",
  "audio/x-m4a",
];

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
      { error: "ফাইল সর্বোচ্চ ১৫ মেগাবাইট হতে পারবে" },
      { status: 413 },
    );
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "শুধু অডিও ফাইল (mp3, wav, ogg, m4a) আপলোড করা যাবে" },
      { status: 415 },
    );
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const [row] = await db
    .insert(media)
    .values({
      filename: file.name,
      mime: file.type,
      data: buf.toString("base64"),
    })
    .returning({ id: media.id });

  return NextResponse.json(
    { url: `/api/media/${row.id}`, id: row.id },
    { status: 201 },
  );
}
