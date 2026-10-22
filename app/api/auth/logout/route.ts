import { NextResponse } from "next/server";
import { USER_COOKIE, currentUser } from "@/lib/userAuth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  const user = await currentUser();
  if (user) {
    await db
      .update(users)
      .set({ sessionToken: "" })
      .where(eq(users.id, user.id));
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
