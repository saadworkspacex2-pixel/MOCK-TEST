import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import {
  verifyPassword,
  newSessionToken,
  USER_COOKIE,
} from "@/lib/userAuth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const identifier = String(body?.identifier ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "ইমেইল/নম্বর ও পাসওয়ার্ড দিন" },
      { status: 400 },
    );
  }

  const [user] = await db
    .select()
    .from(users)
    .where(or(eq(users.email, identifier), eq(users.phone, identifier)));

  if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
    return NextResponse.json(
      { error: "ইমেইল/নম্বর অথবা পাসওয়ার্ড সঠিক নয়" },
      { status: 401 },
    );
  }

  const token = newSessionToken();
  await db
    .update(users)
    .set({ sessionToken: token })
    .where(eq(users.id, user.id));

  const res = NextResponse.json({ ok: true });
  res.cookies.set(USER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
