import { cookies } from "next/headers";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { eq } from "drizzle-orm";

export const ADMIN_COOKIE = "mt_admin";

export type AdminRole = "super" | "exam" | "evaluator" | "content";
export type AdminArea =
  | "exams"
  | "grading"
  | "pages"
  | "theme"
  | "settings"
  | "media"
  | "students"
  | "analytics"
  | "staff";

export type AdminContext = {
  role: AdminRole;
  name: string;
  staffId: number | null;
};

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export function sessionToken(): string {
  const pw = adminPassword();
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
  }
  return `adm_${Math.abs(h)}_ok`;
}

export async function adminContext(): Promise<AdminContext | null> {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  if (!value) return null;
  if (value === sessionToken()) {
    return { role: "super", name: "Super Admin", staffId: null };
  }
  if (value.startsWith("staff:")) {
    const token = value.slice(6);
    const [row] = await db
      .select()
      .from(staff)
      .where(eq(staff.sessionToken, token));
    if (row) {
      return {
        role: row.role as AdminRole,
        name: row.name,
        staffId: row.id,
      };
    }
  }
  return null;
}

export async function isAdmin(): Promise<boolean> {
  return (await adminContext()) !== null;
}

const AREA_ROLES: Record<AdminArea, AdminRole[]> = {
  exams: ["super", "exam"],
  grading: ["super", "evaluator"],
  pages: ["super", "content"],
  theme: ["super", "content"],
  settings: ["super", "content"],
  media: ["super", "content", "exam"],
  students: ["super", "evaluator"],
  analytics: ["super", "exam", "evaluator"],
  staff: ["super"],
};

export async function canAccess(area: AdminArea): Promise<boolean> {
  const ctx = await adminContext();
  return !!ctx && AREA_ROLES[area].includes(ctx.role);
}
