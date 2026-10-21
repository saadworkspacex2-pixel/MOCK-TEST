import { NextResponse } from "next/server";
import { currentUser } from "@/lib/userAuth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      nameEn: user.nameEn,
      nameBn: user.nameBn,
      avatar: user.avatar,
    },
  });
}

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const avatar = body.avatar !== undefined ? String(body.avatar) : undefined;
  if (avatar && avatar.length > 1_500_000) {
    return NextResponse.json(
      { error: "প্রোফাইল ছবি সর্বোচ্চ ১ মেগাবাইট হতে পারবে" },
      { status: 400 },
    );
  }
  if (avatar && avatar !== "" && !avatar.startsWith("data:image/")) {
    return NextResponse.json({ error: "ছবির ফরম্যাট সঠিক নয়" }, { status: 400 });
  }
  await db
    .update(users)
    .set({
      ...(body.nameEn !== undefined && { nameEn: String(body.nameEn) }),
      ...(body.nameBn !== undefined && { nameBn: String(body.nameBn) }),
      ...(body.phone !== undefined && { phone: String(body.phone) }),
      ...(avatar !== undefined && { avatar }),
    })
    .where(eq(users.id, user.id));
  return NextResponse.json({ ok: true });
}
