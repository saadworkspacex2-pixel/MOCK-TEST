import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Donut from "@/components/Donut";
import Icon from "@/components/Icon";
import { currentUser } from "@/lib/userAuth";
import { getProfileData } from "@/lib/profileData";
import { formatDateBn, toBn } from "@/lib/bn";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const { rows, moduleStats, overallPercent, overallBand, progress } =
    await getProfileData(user.id);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 pt-28 pb-24 sm:px-8">
        {/* header card */}
        <div className="anim-fade-up card flex flex-col gap-6 rounded-xl p-8 sm:flex-row sm:items-center">
          <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border border-black/10 bg-[#F8F9FA]">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt="profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <Icon name="users" size={36} className="text-[#6C757D]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              {user.nameBn || user.nameEn}
            </h1>
            {user.nameEn && user.nameBn && (
              <p className="text-sm font-semibold text-[#6C757D]">
                {user.nameEn}
              </p>
            )}
            <p className="mt-1 text-sm text-[#6C757D]">
              {user.email}
              {user.phone ? ` · ${toBn(user.phone)}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/profile/report"
              className="btn-red inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold"
            >
              <Icon name="doc" size={15} /> PDF রিপোর্ট
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* overall + module donuts */}
        <div className="anim-fade-up delay-100 mt-6 grid gap-5 sm:grid-cols-2">
          <div className="card rounded-xl p-7 text-center">
            <h2 className="text-sm font-bold tracking-wide text-[#6C757D]">
              সার্বিক ফলাফল
            </h2>
            <div className="mt-4 flex items-center justify-center gap-8">
              <Donut
                value={overallPercent}
                max={100}
                size={130}
                label={`${toBn(overallPercent)}%`}
                sublabel="গড় সঠিক"
              />
              <div className="text-left">
                <p className="text-xs font-semibold text-[#6C757D]">
                  গড় ব্যান্ড
                </p>
                <p className="text-4xl font-extrabold text-[#1A1A1A]">
                  {overallBand !== null ? toBn(overallBand) : "–"}
                </p>
                <p className="mt-2 text-xs font-semibold text-[#6C757D]">
                  মোট অ্যাটেম্পট
                </p>
                <p className="text-2xl font-bold text-[#1A1A1A]">
                  {toBn(rows.length)}
                </p>
              </div>
            </div>
          </div>

          <div className="card rounded-xl p-7">
            <h2 className="text-sm font-bold tracking-wide text-[#6C757D]">
              মডিউলভিত্তিক স্কোর
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {moduleStats.map((m) => (
                <div
                  key={m.module}
                  className="rounded-md border border-black/[0.07] bg-[#F8F9FA] p-4"
                >
                  <p className="text-xs font-bold text-[#6C757D]">{m.label}</p>
                  <p className="mt-1 text-xl font-extrabold text-[#1A1A1A]">
                    {m.bestBand !== null
                      ? `ব্যান্ড ${toBn(m.bestBand)}`
                      : m.attempts > 0 && m.module === "writing"
                        ? "রিভিউতে"
                        : m.attempts > 0
                          ? `${toBn(m.avgPercent)}%`
                          : "–"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#6C757D]">
                    {toBn(m.attempts)}টি টেস্ট
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* progress bars */}
        <div className="anim-fade-up delay-200 card mt-6 rounded-xl p-7">
          <h2 className="text-sm font-bold tracking-wide text-[#6C757D]">
            প্রগ্রেস (পুরোনো থেকে নতুন)
          </h2>
          {progress.length === 0 ? (
            <p className="mt-4 text-sm text-[#6C757D]">
              এখনও কোনো স্কোর নেই। প্রথম টেস্টটি দিলেই প্রগ্রেস দেখা যাবে।
            </p>
          ) : (
            <div className="mt-5 flex h-36 items-end gap-2">
              {progress.map((p, i) => (
                <div
                  key={i}
                  className="group relative flex-1"
                  title={`${p.label}: ${p.percent}%`}
                >
                  <div
                    className="w-full rounded-t bg-[#1A1A1A] transition-colors group-hover:bg-[#E51A24]"
                    style={{ height: `${Math.max(6, p.percent)}%` }}
                  />
                  <p className="mt-1.5 text-center text-[10px] font-bold text-[#6C757D]">
                    {toBn(p.percent)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* history */}
        <div className="anim-fade-up delay-300 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1A1A1A]">টেস্ট হিস্ট্রি</h2>
            <Link
              href="/exams"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E51A24]"
            >
              নতুন টেস্ট দিন <Icon name="arrow" size={14} />
            </Link>
          </div>
          <div className="card mt-4 overflow-hidden rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F9FA] text-left text-xs text-[#6C757D]">
                <tr>
                  <th className="px-5 py-3.5">টেস্ট</th>
                  <th className="hidden px-5 py-3.5 sm:table-cell">মডিউল</th>
                  <th className="px-5 py-3.5 text-right">ফলাফল</th>
                  <th className="hidden px-5 py-3.5 text-right md:table-cell">
                    তারিখ
                  </th>
                  <th className="px-5 py-3.5 text-right">রিভিউ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {rows.map((r) => (
                  <tr key={r.attempt.id} className="hover:bg-[#F8F9FA]">
                    <td className="px-5 py-3.5 font-semibold">
                      {r.exam.title}
                    </td>
                    <td className="hidden px-5 py-3.5 text-[#6C757D] sm:table-cell">
                      {r.exam.module === "reading"
                        ? "Reading"
                        : r.exam.module === "listening"
                          ? "Listening"
                          : r.exam.module === "writing"
                            ? "Writing"
                            : "MCQ"}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold">
                      {r.attempt.status === "pending" ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
                          রিভিউতে
                        </span>
                      ) : r.attempt.bandScore !== null ? (
                        `ব্যান্ড ${toBn(r.attempt.bandScore)}`
                      ) : (
                        toBn(r.attempt.score)
                      )}
                    </td>
                    <td className="hidden px-5 py-3.5 text-right text-[#6C757D] md:table-cell">
                      {formatDateBn(r.attempt.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/results/${r.attempt.id}`}
                        className="text-xs font-bold text-[#E51A24]"
                      >
                        দেখুন
                      </Link>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-14 text-center text-[#6C757D]"
                    >
                      লগইন অবস্থায় টেস্ট দিলে ফলাফল এখানে জমা হবে।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
