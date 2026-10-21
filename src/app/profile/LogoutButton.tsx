"use client";

import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/");
        router.refresh();
      }}
      className="btn-ghost inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold"
    >
      <Icon name="logout" size={15} /> লগআউট
    </button>
  );
}
