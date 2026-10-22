import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { adminContext } from "@/lib/adminAuth";
import AdminShell from "./AdminShell";

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const ctx = await adminContext();
  if (!ctx) redirect("/admin/login");
  return (
    <AdminShell role={ctx.role} adminName={ctx.name}>
      {children}
    </AdminShell>
  );
}
