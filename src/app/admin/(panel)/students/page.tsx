import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { attempts, users } from "@/db/schema";
import { canAccess } from "@/lib/adminAuth";
import { formatDateBn, toBn } from "@/lib/bn";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  if (!(await canAccess("students"))) {
    return <p className="card rounded-lg p-8 text-center text-[#6C757D]">এই অংশে আপনার অ্যাক্সেস নেই।</p>;
  }
  const [allUsers, allAttempts] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)),
    db.select().from(attempts).orderBy(desc(attempts.createdAt)).limit(2000),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">স্টুডেন্ট CRM</h1>
      <p className="mt-1 text-sm text-[#6C757D]">প্রোফাইল, অ্যাটেম্পট হিস্ট্রি ও পারফরম্যান্স</p>
      <div className="card mt-6 overflow-hidden rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F9FA] text-left text-xs text-[#6C757D]"><tr><th className="px-5 py-3">শিক্ষার্থী</th><th className="hidden px-5 py-3 sm:table-cell">যোগাযোগ</th><th className="px-5 py-3 text-right">অ্যাটেম্পট</th><th className="hidden px-5 py-3 text-right md:table-cell">যোগদান</th><th className="px-5 py-3 text-right">CRM</th></tr></thead>
          <tbody className="divide-y divide-black/[0.05]">
            {allUsers.map((u) => {
              const count = allAttempts.filter((a) => a.userId === u.id).length;
              return (
                <tr key={u.id}>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[#F8F9FA]">
                        {u.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (u.nameBn || u.nameEn || "?").slice(0, 1)}
                      </span>
                      <span><span className="block font-bold">{u.nameBn || u.nameEn}</span><span className="block text-xs text-[#6C757D]">{u.nameEn}</span></span>
                    </span>
                  </td>
                  <td className="hidden px-5 py-3.5 text-xs text-[#6C757D] sm:table-cell">{u.email}<br />{toBn(u.phone)}</td>
                  <td className="px-5 py-3.5 text-right font-bold">{toBn(count)}</td>
                  <td className="hidden px-5 py-3.5 text-right text-xs text-[#6C757D] md:table-cell">{formatDateBn(u.createdAt)}</td>
                  <td className="px-5 py-3.5 text-right"><Link href={`/admin/students/${u.id}`} className="text-xs font-bold text-[#E51A24]">প্রোফাইল</Link></td>
                </tr>
              );
            })}
            {allUsers.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-[#6C757D]">এখনও রেজিস্টার্ড শিক্ষার্থী নেই।</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
