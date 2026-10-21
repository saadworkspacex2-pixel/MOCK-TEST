import { cookies } from "next/headers";

export const ADMIN_COOKIE = "mt_admin";

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export function sessionToken(): string {
  // simple deterministic token derived from the password
  const pw = adminPassword();
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
  }
  return `adm_${Math.abs(h)}_ok`;
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === sessionToken();
}
