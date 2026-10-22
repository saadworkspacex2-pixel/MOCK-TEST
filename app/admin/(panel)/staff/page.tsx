"use client";

import SpringHeading from "@/components/SpringHeading";

import { useCallback, useEffect, useState } from "react";

type Staff = { id: number; name: string; email: string; role: string; createdAt: string };
const ROLES = [
  { value: "super", label: "Super Admin (সব অ্যাক্সেস)" },
  { value: "exam", label: "Exam Creator (পরীক্ষা ও প্রশ্ন)" },
  { value: "evaluator", label: "Evaluator (রাইটিং মূল্যায়ন)" },
  { value: "content", label: "Content Manager (পেজ, থিম, সেটিংস)" },
];

export default function StaffPage() {
  const [rows, setRows] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", role: "content", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/staff");
    const data = (await res.json()) as Staff[];
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true); setError("");
    const res = await fetch("/api/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) { setError(d.error || "ব্যর্থ"); return; }
    setSuccess("স্টাফ যোগ হয়েছে। স্টাফ ইমেইল ও পাসওয়ার্ড দিয়ে /admin/login-এ ঢুকতে পারবে।");
    setForm({ name: "", email: "", role: "content", password: "" });
    await load();
  };

  const input = "w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#E51A24]";

  if (loading) return <div className="card rounded-lg p-6"><div className="shimmer h-5 w-1/3 rounded" /><div className="shimmer mt-4 h-20 rounded" /></div>;

  return (
    <div className="space-y-7">
      <div>
        <SpringHeading as="h1" className="text-2xl font-bold">স্টাফ ও রোল পারমিশন</SpringHeading>
        <p className="mt-1 text-sm text-[#6C757D]">মাল্টি-অ্যাডমিন অ্যাকাউন্ট ও কাজভিত্তিক অ্যাক্সেস</p>
      </div>
      <section className="card rounded-lg p-6">
        <SpringHeading as="h2" className="font-bold">নতুন স্টাফ</SpringHeading>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="নাম" className={input} />
          <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="staff@email.com" className={input} />
          <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className={input}>{ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
          <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="পাসওয়ার্ড (৬+ অক্ষর)" className={input} />
        </div>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        {success && <p className="mt-3 text-sm font-semibold text-green-700">{success}</p>}
        <button onClick={save} disabled={saving} className="btn-red mt-4 rounded-md px-6 py-2.5 text-sm font-bold disabled:opacity-60">{saving ? "সংরক্ষণ…" : "স্টাফ যোগ করুন"}</button>
      </section>
      <section className="card overflow-hidden rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F9FA] text-left text-xs text-[#6C757D]"><tr><th className="px-5 py-3">নাম</th><th className="px-5 py-3">ইমেইল</th><th className="px-5 py-3">রোল</th><th className="px-5 py-3 text-right">অ্যাকশন</th></tr></thead>
          <tbody className="divide-y divide-black/[0.05]">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3.5 font-bold">{r.name}</td>
                <td className="px-5 py-3.5 text-[#6C757D]">{r.email}</td>
                <td className="px-5 py-3.5">
                  <select value={r.role} onChange={async (e) => { await fetch(`/api/staff/${r.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: e.target.value }) }); await load(); }} className="rounded border border-slate-300 px-2 py-1 text-xs">
                    {ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3.5 text-right"><button onClick={async () => { if (!confirm("স্টাফ মুছবেন?")) return; await fetch(`/api/staff/${r.id}`, { method: "DELETE" }); await load(); }} className="rounded bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600">মুছুন</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-[#6C757D]">এখনও স্টাফ নেই। মাস্টার পাসওয়ার্ড দিয়ে Super Admin লগইন চলছে।</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
