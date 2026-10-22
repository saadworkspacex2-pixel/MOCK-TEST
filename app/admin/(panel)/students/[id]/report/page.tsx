import SpringHeading from "@/components/SpringHeading";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getProfileData } from "@/lib/profileData";
import Donut from "@/components/Donut";
import PrintButton from "@/app/profile/report/PrintButton";
import { formatDateBn, toBn } from "@/lib/bn";

export const dynamic = "force-dynamic";

export default async function AdminStudentReport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user] = await db.select().from(users).where(eq(users.id, Number(id)));
  if (!user) notFound();
  const { rows, moduleStats, overallPercent, overallBand } = await getProfileData(user.id);

  return (
    <div className="print:bg-white">
      <div className="mb-5 flex justify-end print:hidden"><PrintButton /></div>
      <main className="card rounded-lg bg-white p-8 print:border-0">
        <header className="flex items-center gap-6 border-b-2 border-[#1A1A1A] pb-6">
          <span className="grid h-28 w-28 place-items-center overflow-hidden rounded-lg bg-[#F8F9FA] text-3xl font-bold">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (user.nameBn || user.nameEn).slice(0, 1)}
          </span>
          <div className="flex-1"><SpringHeading as="h1" className="text-3xl font-bold">{user.nameBn || user.nameEn}</SpringHeading><p className="text-[#6C757D]">{user.nameEn} · {user.email} · {toBn(user.phone)}</p><p className="mt-2 text-xs text-[#6C757D]">LHBD Progress Report · {formatDateBn(new Date())}</p></div>
          <div className="text-center"><p className="text-xs text-[#6C757D]">Overall Band</p><p className="text-5xl font-extrabold text-[#E51A24]">{overallBand !== null ? toBn(overallBand) : "–"}</p></div>
        </header>
        <section className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-5">
          <Donut value={overallPercent} max={100} size={105} label={`${toBn(overallPercent)}%`} sublabel="সার্বিক" />
          {moduleStats.map((m) => <Donut key={m.module} value={m.bestBand ?? m.avgPercent / (100 / 9)} max={9} size={105} color="#1A1A1A" label={m.bestBand !== null ? toBn(m.bestBand) : `${toBn(m.avgPercent)}%`} sublabel={m.label} />)}
        </section>
        <table className="mt-8 w-full text-sm">
          <thead><tr className="border-b border-black/10 text-left text-xs text-[#6C757D]"><th className="py-2">টেস্ট</th><th className="py-2 text-right">ফলাফল</th><th className="py-2 text-right">তারিখ</th></tr></thead>
          <tbody className="divide-y divide-black/[0.05]">{rows.slice(0, 20).map((r) => <tr key={r.attempt.id}><td className="py-2.5 font-semibold">{r.exam.title}</td><td className="py-2.5 text-right font-bold">{r.attempt.status === "pending" ? "Pending" : r.attempt.bandScore !== null ? `ব্যান্ড ${toBn(r.attempt.bandScore)}` : toBn(r.attempt.score)}</td><td className="py-2.5 text-right text-[#6C757D]">{formatDateBn(r.attempt.createdAt)}</td></tr>)}</tbody>
        </table>
      </main>
    </div>
  );
}
