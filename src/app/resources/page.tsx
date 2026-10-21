import { db } from "@/db";
import { resources } from "@/db/schema";
import { desc } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { formatDateBn } from "@/lib/bn";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TYPE_META: Record<string, { icon: string; label: string; cls: string }> =
  {
    pdf: { icon: "doc", label: "পিডিএফ", cls: "bg-[#F8F9FA] text-[#6C757D]" },
    video: {
      icon: "play",
      label: "ভিডিও",
      cls: "bg-[#F8F9FA] text-[#6C757D]",
    },
    article: {
      icon: "book",
      label: "আর্টিকেল",
      cls: "bg-[#F8F9FA] text-[#6C757D]",
    },
  };

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const rows = await db
    .select()
    .from(resources)
    .orderBy(desc(resources.createdAt));

  const categories = Array.from(new Set(rows.map((r) => r.category)));
  const filtered = category
    ? rows.filter((r) => r.category === category)
    : rows;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6">
        <div className="anim-fade-up">
          <h1 className="text-3xl font-bold sm:text-4xl">
            রিসোর্স <span className="text-[#E51A24]">লাইব্রেরি</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[#6C757D]">
            নোট, সাজেশন, পিডিএফ ও ভিডিও লেকচার — প্রস্তুতির সব উপকরণ এক
            জায়গায়, সম্পূর্ণ ফ্রি।
          </p>
        </div>

        <div className="anim-fade-up delay-200 mt-8 flex flex-wrap gap-2">
          <Link
            href="/resources"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !category
                ? "bg-[#E51A24] text-white"
                : "border border-slate-300 text-slate-700 hover:border-red-300"
            }`}
          >
            সব
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/resources?category=${encodeURIComponent(c)}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                category === c
                  ? "bg-[#E51A24] text-white"
                  : "border border-slate-300 text-slate-700 hover:border-red-300"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {filtered.map((r, i) => {
            const meta = TYPE_META[r.type] ?? TYPE_META.article;
            return (
              <Reveal key={r.id} delay={(i % 3) * 80}>
                <a
                  href={r.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lift group block h-full rounded-lg border border-black/[0.07] card p-6 hover:border-red-300"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${meta.cls}`}
                    >
                      <Icon name={meta.icon} size={13} /> {meta.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDateBn(r.createdAt)}
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-semibold transition-colors group-hover:text-[#E51A24]">
                    {r.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#6C757D]">
                    {r.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-black/[0.07] pt-4 text-xs">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      {r.category}
                    </span>
                    <span className="font-semibold text-[#E51A24]">
                      খুলুন →
                    </span>
                  </div>
                </a>
              </Reveal>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full py-20 text-center text-[#6C757D]">
              কোনো রিসোর্স পাওয়া যায়নি।
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
