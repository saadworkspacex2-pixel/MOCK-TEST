import SpringHeading from "@/components/SpringHeading";
import { redirect } from "next/navigation";
import Link from "next/link";
import Donut from "@/components/Donut";
import Icon from "@/components/Icon";
import { LogoMark } from "@/components/Logo";
import { currentUser } from "@/lib/userAuth";
import { getProfileData } from "@/lib/profileData";
import { formatDateBn, toBn } from "@/lib/bn";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const { rows, moduleStats, overallPercent, overallBand, progress } =
    await getProfileData(user.id);

  return (
    <div className="min-h-screen bg-[#F8F9FA] print:bg-white">
      {/* screen-only toolbar */}
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 pt-8 print:hidden">
        <Link
          href="/profile"
          className="btn-ghost inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold"
        >
          প্রোফাইলে ফিরুন
        </Link>
        <PrintButton />
      </div>

      {/* report sheet */}
      <main className="mx-auto my-8 max-w-4xl rounded-xl border border-black/10 bg-white p-10 print:my-0 print:max-w-none print:rounded-none print:border-0 print:p-6">
        {/* letterhead */}
        <header className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-6">
          <div className="flex items-center gap-3">
            <LogoMark size={46} />
            <div>
              <p className="text-xl font-extrabold tracking-tight text-[#1A1A1A]">
                LHBD<span className="text-[#E51A24]">.</span>
              </p>
              <p className="text-[11px] font-semibold tracking-widest text-[#6C757D]">
                প্রগ্রেস রিপোর্ট
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-[#6C757D]">
            <p>তৈরির তারিখ</p>
            <p className="font-bold text-[#1A1A1A]">
              {formatDateBn(new Date())}
            </p>
          </div>
        </header>

        {/* student identity with big image */}
        <section className="mt-8 flex items-center gap-8">
          <div className="grid h-36 w-36 shrink-0 place-items-center overflow-hidden rounded-xl border border-black/10 bg-[#F8F9FA]">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt="profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <Icon name="users" size={52} className="text-[#6C757D]" />
            )}
          </div>
          <div>
            <SpringHeading as="h1" className="text-3xl font-bold text-[#1A1A1A]">
              {user.nameBn || user.nameEn}
            </SpringHeading>
            {user.nameEn && (
              <p className="text-lg font-semibold text-[#6C757D]">
                {user.nameEn}
              </p>
            )}
            <div className="mt-3 space-y-1 text-sm text-[#6C757D]">
              <p>ইমেইল: {user.email}</p>
              {user.phone && <p>মোবাইল: {toBn(user.phone)}</p>}
              <p>মোট টেস্ট: {toBn(rows.length)}টি</p>
            </div>
          </div>
          <div className="ml-auto rounded-xl border border-black/10 bg-[#F8F9FA] px-7 py-5 text-center">
            <p className="text-xs font-bold text-[#6C757D]">সার্বিক ব্যান্ড</p>
            <p className="text-5xl font-extrabold text-[#E51A24]">
              {overallBand !== null ? toBn(overallBand) : "–"}
            </p>
          </div>
        </section>

        {/* charts row */}
        <section className="mt-10">
          <SpringHeading as="h2" className="border-b border-black/10 pb-2 text-sm font-extrabold tracking-widest text-[#1A1A1A] uppercase">
            ফলাফল বিশ্লেষণ
          </SpringHeading>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-5">
            <Donut
              value={overallPercent}
              max={100}
              size={110}
              label={`${toBn(overallPercent)}%`}
              sublabel="সার্বিক"
            />
            {moduleStats.map((m) => (
              <Donut
                key={m.module}
                value={
                  m.bestBand !== null ? m.bestBand : m.avgPercent / (100 / 9)
                }
                max={9}
                size={110}
                color={m.attempts > 0 ? "#1A1A1A" : "#CED4DA"}
                label={
                  m.bestBand !== null
                    ? toBn(m.bestBand)
                    : m.attempts > 0
                      ? `${toBn(m.avgPercent)}%`
                      : "–"
                }
                sublabel={m.label}
              />
            ))}
          </div>
        </section>

        {/* progress */}
        <section className="mt-10">
          <SpringHeading as="h2" className="border-b border-black/10 pb-2 text-sm font-extrabold tracking-widest text-[#1A1A1A] uppercase">
            প্রগ্রেস
          </SpringHeading>
          {progress.length === 0 ? (
            <p className="mt-4 text-sm text-[#6C757D]">এখনও স্কোর নেই।</p>
          ) : (
            <div className="mt-6 flex h-32 items-end gap-2">
              {progress.map((p, i) => (
                <div key={i} className="flex-1">
                  <div
                    className="w-full rounded-t bg-[#1A1A1A]"
                    style={{ height: `${Math.max(6, p.percent)}%` }}
                  />
                  <p className="mt-1 text-center text-[10px] font-bold text-[#6C757D]">
                    {toBn(p.percent)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* history table */}
        <section className="mt-10">
          <SpringHeading as="h2" className="border-b border-black/10 pb-2 text-sm font-extrabold tracking-widest text-[#1A1A1A] uppercase">
            টেস্ট হিস্ট্রি
          </SpringHeading>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs text-[#6C757D]">
                <th className="py-2.5 pr-4">টেস্ট</th>
                <th className="py-2.5 pr-4">মডিউল</th>
                <th className="py-2.5 pr-4 text-right">সঠিক</th>
                <th className="py-2.5 pr-4 text-right">ফলাফল</th>
                <th className="py-2.5 text-right">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {rows.slice(0, 15).map((r) => (
                <tr key={r.attempt.id}>
                  <td className="py-2.5 pr-4 font-semibold">{r.exam.title}</td>
                  <td className="py-2.5 pr-4 text-[#6C757D]">
                    {r.exam.module === "reading"
                      ? "Reading"
                      : r.exam.module === "listening"
                        ? "Listening"
                        : r.exam.module === "writing"
                          ? "Writing"
                          : "MCQ"}
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    {r.attempt.status === "pending"
                      ? "–"
                      : `${toBn(r.attempt.correctCount)}/${toBn(r.attempt.totalQuestions)}`}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-bold">
                    {r.attempt.status === "pending"
                      ? "রিভিউতে"
                      : r.attempt.bandScore !== null
                        ? `ব্যান্ড ${toBn(r.attempt.bandScore)}`
                        : toBn(r.attempt.score)}
                  </td>
                  <td className="py-2.5 text-right text-[#6C757D]">
                    {formatDateBn(r.attempt.createdAt)}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#6C757D]">
                    কোনো টেস্ট দেওয়া হয়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <footer className="mt-10 border-t border-black/10 pt-5 text-center text-xs text-[#6C757D]">
          এই রিপোর্টটি LHBD মক টেস্ট প্ল্যাটফর্ম থেকে স্বয়ংক্রিয়ভাবে তৈরি।
          ব্যান্ড স্কোর অনুশীলনের সুবিধার্থে স্ট্যান্ডার্ড কনভার্সন অনুসরণ করে।
        </footer>
      </main>
    </div>
  );
}
