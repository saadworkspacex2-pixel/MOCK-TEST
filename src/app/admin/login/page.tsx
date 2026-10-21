"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "লগইন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#F8F9FA] px-4">
      <div className="pointer-events-none absolute inset-0">
      </div>
      <div className="anim-pop relative w-full max-w-md rounded-lg border border-black/[0.07] glass p-8">
        <div className="text-center">
          <span className="mx-auto inline-block">
            <LogoMark size={52} />
          </span>
          <h1 className="mt-5 text-2xl font-bold">অ্যাডমিন লগইন</h1>
          <p className="mt-2 text-sm text-[#6C757D]">
            পরীক্ষা, প্রশ্ন ও রিসোর্স পরিচালনার জন্য লগইন করুন
          </p>
        </div>
        <label className="mt-7 block text-sm font-medium text-slate-700">
          পাসওয়ার্ড
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && login()}
          placeholder="••••••••"
          className="mt-2 w-full rounded-md border border-slate-300 bg-[#F8F9FA] px-4 py-3 text-sm outline-none transition focus:border-[#E51A24] focus:ring-2 focus:ring-red-100"
        />
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
        <button
          onClick={login}
          disabled={loading}
          className="mt-5 w-full rounded-md btn-red py-3.5 font-semibold text-white transition disabled:opacity-60"
        >
          {loading ? "যাচাই হচ্ছে…" : "লগইন করুন →"}
        </button>
        <p className="mt-4 rounded-md bg-slate-100 px-4 py-3 text-center text-xs text-[#6C757D]">
          ডেমো পাসওয়ার্ড: <code className="text-[#E51A24]">admin123</code>
        </p>
        <p className="mt-4 text-center text-xs">
          <Link href="/" className="text-[#6C757D] hover:text-[#E51A24]">
            ← মূল সাইটে ফিরে যান
          </Link>
        </p>
      </div>
    </div>
  );
}
