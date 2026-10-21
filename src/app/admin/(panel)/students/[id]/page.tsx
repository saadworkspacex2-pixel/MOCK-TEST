import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getProfileData } from "@/lib/profileData";
import { formatDateBn, formatDuration, toBn } from "@/lib/bn";

export const dynamic = "force-dynamic";

export default async function StudentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user] = await db.select().from(users).where(eq(users.id, Number(id)));
  if (!user) notFound();
  const { rows, moduleStats, overallPercent, overallBand, progress } = await getProfileData(user.id);

  return (
    <div className="space-y-6">
      <Link href="/admin/students" className="text-sm font-semibold text-[#6C757D]">← স্টুডেন্ট তালিকা</Link>
      <div className="card flex flex-wrap items-center gap-5 rounded-lg p-6">
        <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-[#F8F9FA] text-2xl font-bold">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt="" className="h-full w-full object-cover" />
          ) : (user.nameBn || user.nameEn).slice(0, 1)}
        </span>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.nameBn || user.nameEn}</h1>
          <p className="text-sm text-[#6C757D]">{user.nameEn} · {user.email} · {toBn(user.phone)}</p>
        </div>
        <Link href={`/admin/students/${user.id}/report`} className="btn-red rounded-md px-5 py-2.5 text-sm font-bold">PDF রিপোর্ট</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card rounded-lg p-5"><p className="text-xs text-[#6C757D]">সার্বিক সঠিক</p><p className="text-2xl font-extrabold">{toBn(overallPercent)}%</p></div>
        <div className="card rounded-lg p-5"><p className="text-xs text-[#6C757D]">গড় ব্যান্ড</p><p className="text-2xl font-extrabold">{overallBand !== null ? toBn(overallBand) : "–"}</p></div>
        {moduleStats.slice(0, 2).map((m) => <div key={m.module} className="card rounded-lg p-5"><p className="text-xs text-[#6C757D]">{m.label}</p><p className="text-2xl font-extrabold">{m.bestBand !== null ? toBn(m.bestBand) : `${toBn(m.avgPercent)}%`}</p></div>)}
      </div>
      <section className="card rounded-lg p-6">
        <h2 className="font-bold">পারফরম্যান্স ট্রেন্ড</h2>
        <div className="mt-5 flex h-28 items-end gap-2">
          {progress.map((p, i) => <div key={i} className="flex-1" title={p.label}><div className="w-full rounded-t bg-[#1A1A1A]" style={{ height: `${Math.max(6, p.percent)}%` }} /><p className="mt-1 text-center text-[10px]">{toBn(p.percent)}%</p></div>)}
          {progress.length === 0 && <p className="text-sm text-[#6C757D]">ডেটা নেই।</p>}
        </div>
      </section>
      <section className="card overflow-hidden rounded-lg">
        <h2 className="border-b border-black/[0.06] px-5 py-4 font-bold">অ্যাটেম্পট ও IP লগ</h2>
        <table className="w-full text-sm">
          <thead className="bg-[#F8F9FA] text-left text-xs text-[#6C757D]"><tr><th className="px-5 py-3">টেস্ট</th><th className="px-5 py-3 text-right">ফলাফল</th><th className="hidden px-5 py-3 text-right sm:table-cell">সময়</th><th className="px-5 py-3 text-right">IP</th><th className="px-5 py-3 text-right">তারিখ</th></tr></thead>
          <tbody className="divide-y divide-black/[0.05]">
            {rows.map((r) => <tr key={r.attempt.id}><td className="px-5 py-3 font-semibold">{r.exam.title}</td><td className="px-5 py-3 text-right font-bold">{r.attempt.status === "pending" ? "Pending" : r.attempt.bandScore !== null ? `ব্যান্ড ${toBn(r.attempt.bandScore)}` : toBn(r.attempt.score)}</td><td className="hidden px-5 py-3 text-right text-xs text-[#6C757D] sm:table-cell">{formatDuration(r.attempt.timeTakenSeconds)}</td><td className="px-5 py-3 text-right font-mono text-[11px] text-[#6C757D]">{r.attempt.ip || "–"}</td><td className="px-5 py-3 text-right text-xs text-[#6C757D]">{formatDateBn(r.attempt.createdAt)}</td></tr>)}
            {rows.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-[#6C757D]">কোনো অ্যাটেম্পট নেই।</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
