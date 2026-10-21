import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/adminAuth";
import AdminShell from "./AdminShell";

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authed = await isAdmin();
  if (!authed) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
