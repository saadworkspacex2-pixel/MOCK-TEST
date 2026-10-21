import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  newSessionToken,
  USER_COOKIE,
} from "@/lib/userAuth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const phone = String(body?.phone ?? "").trim();
  const nameEn = String(body?.nameEn ?? "").trim();
  const nameBn = String(body?.nameBn ?? "").trim();
  const password = String(body?.password ?? "");
  const avatar = String(body?.avatar ?? "");

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "সঠিক ইমেইল দিন" }, { status: 400 });
  }
  if (!nameBn && !nameEn) {
    return NextResponse.json({ error: "নাম লিখুন" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" },
      { status: 400 },
    );
  }
  if (avatar && avatar.length > 1_500_000) {
    return NextResponse.json(
      { error: "প্রোফাইল ছবি সর্বোচ্চ ১ মেগাবাইট হতে পারবে" },
      { status: 400 },
    );
  }
  if (avatar && !avatar.startsWith("data:image/")) {
    return NextResponse.json({ error: "ছবির ফরম্যাট সঠিক নয়" }, { status: 400 });
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) {
    return NextResponse.json(
      { error: "এই ইমেইলে আগে থেকেই অ্যাকাউন্ট আছে" },
      { status: 409 },
    );
  }

  const { salt, hash } = hashPassword(password);
  const token = newSessionToken();
  await db.insert(users).values({
    email,
    phone,
    nameEn,
    nameBn,
    passwordHash: hash,
    salt,
    avatar,
    sessionToken: token,
  });

  const res = NextResponse.json({ ok: true }, { status: 201 });
  res.cookies.set(USER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
