import SpringHeading from "@/components/SpringHeading";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { exams, pageSections, resources } from "@/db/schema";
import RawHtml from "./RawHtml";
import MediaHero from "./MediaHero";
import AnnouncementBar from "./AnnouncementBar";
import Icon from "./Icon";
import { toBn } from "@/lib/bn";

type LinkItem = { label: string; url: string; description?: string };
type Content = {
  html?: string;
  headline?: string;
  subtext?: string;
  images?: string[];
  videoUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  text?: string;
  deadline?: string;
  links?: LinkItem[];
  limit?: number;
};

export default async function DynamicSections({ page }: { page: string }) {
  const rows = await db
    .select()
    .from(pageSections)
    .where(eq(pageSections.page, page))
    .orderBy(asc(pageSections.sortOrder), asc(pageSections.id));
  const enabled = rows.filter((r) => r.enabled);
  if (enabled.length === 0) return null;

  const needExams = enabled.some((r) => r.type === "exam_grid");
  const needResources = enabled.some((r) => r.type === "resource_grid");
  const examRows = needExams
    ? await db.select().from(exams).where(eq(exams.isLive, true)).limit(12)
    : [];
  const resourceRows = needResources
    ? await db.select().from(resources).limit(12)
    : [];

  return (
    <div className="dynamic-sections">
      {enabled.map((s) => {
        const c = (s.content ?? {}) as Content;
        if (s.type === "html") {
          return <RawHtml key={s.id} html={c.html ?? ""} />;
        }
        if (s.type === "announcement") {
          return (
            <AnnouncementBar
              key={s.id}
              text={c.text ?? s.title}
              ctaLabel={c.ctaLabel ?? ""}
              ctaUrl={c.ctaUrl ?? ""}
              deadline={c.deadline ?? ""}
            />
          );
        }
        if (s.type === "hero") {
          return (
            <MediaHero
              key={s.id}
              headline={c.headline ?? s.title}
              subtext={c.subtext ?? ""}
              images={c.images ?? []}
              videoUrl={c.videoUrl ?? ""}
              ctaLabel={c.ctaLabel ?? ""}
              ctaUrl={c.ctaUrl ?? ""}
            />
          );
        }
        if (s.type === "links") {
          return (
            <section key={s.id} className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
              {s.title && (
                <SpringHeading as="h2" className="mb-8 text-2xl font-bold text-[#1A1A1A]">{s.title}</SpringHeading>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {(c.links ?? []).map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    className="lift card flex items-center justify-between rounded-lg p-5 font-semibold"
                  >
                    <span>
                      {l.label}
                      {l.description && (
                        <span className="mt-1 block text-xs font-normal text-[#6C757D]">
                          {l.description}
                        </span>
                      )}
                    </span>
                    <Icon name="arrow" size={16} />
                  </a>
                ))}
              </div>
            </section>
          );
        }
        if (s.type === "exam_grid") {
          return (
            <section key={s.id} className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
              <SpringHeading as="h2" className="mb-8 text-2xl font-bold">{s.title || "টেস্টসমূহ"}</SpringHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                {examRows.slice(0, c.limit ?? 6).map((e) => (
                  <Link key={e.id} href={`/exams/${e.id}`} className="lift card rounded-lg p-5">
                    <p className="font-bold">{e.title}</p>
                    <p className="mt-1 text-xs text-[#6C757D]">
                      {e.module} · {toBn(e.durationMinutes)} মিনিট
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        }
        if (s.type === "resource_grid") {
          return (
            <section key={s.id} className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
              <SpringHeading as="h2" className="mb-8 text-2xl font-bold">{s.title || "রিসোর্স"}</SpringHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                {resourceRows.slice(0, c.limit ?? 6).map((r) => (
                  <a key={r.id} href={r.url} className="lift card rounded-lg p-5">
                    <p className="font-bold">{r.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-[#6C757D]">{r.description}</p>
                  </a>
                ))}
              </div>
            </section>
          );
        }
        return null;
      })}
    </div>
  );
}
