import { NextResponse } from "next/server";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { eq } from "drizzle-orm";
import { adminPassword, sessionToken, ADMIN_COOKIE } from "@/lib/adminAuth";
import { verifyPassword, newSessionToken } from "@/lib/userAuth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = String(body.password ?? "");
  const email = String(body.email ?? "").trim().toLowerCase();

  // Super admin (master password)
  if (!email && password === adminPassword()) {
    const res = NextResponse.json({ ok: true, role: "super" });
    res.cookies.set(ADMIN_COOKIE, sessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }

  // Staff account
  if (email) {
    const [member] = await db.select().from(staff).where(eq(staff.email, email));
    if (
      member &&
      verifyPassword(password, member.salt, member.passwordHash)
    ) {
      const token = newSessionToken();
      await db
        .update(staff)
        .set({ sessionToken: token })
        .where(eq(staff.id, member.id));
      const res = NextResponse.json({ ok: true, role: member.role });
      res.cookies.set(ADMIN_COOKIE, `staff:${token}`, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }
  }

  return NextResponse.json({ error: "পাসওয়ার্ড সঠিক নয়" }, { status: 401 });
}
