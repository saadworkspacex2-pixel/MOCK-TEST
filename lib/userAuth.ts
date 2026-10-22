import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const USER_COOKIE = "mt_user";

export function hashPassword(password: string, salt?: string) {
  const s = salt ?? randomBytes(16).toString("hex");
  const hash = scryptSync(password, s, 64).toString("hex");
  return { salt: s, hash };
}

export function verifyPassword(password: string, salt: string, hash: string) {
  const candidate = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  return (
    candidate.length === stored.length && timingSafeEqual(candidate, stored)
  );
}

export function newSessionToken() {
  return randomBytes(32).toString("hex");
}

export async function currentUser() {
  const store = await cookies();
  const token = store.get(USER_COOKIE)?.value;
  if (!token) return null;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.sessionToken, token));
  return user ?? null;
}
