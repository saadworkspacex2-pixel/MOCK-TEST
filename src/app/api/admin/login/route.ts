import { NextResponse } from "next/server";
import { adminPassword, sessionToken, ADMIN_COOKIE } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body.password !== adminPassword()) {
    return NextResponse.json(
      { error: "পাসওয়ার্ড সঠিক নয়" },
      { status: 401 },
    );
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
