import SpringHeading from "@/components/SpringHeading";
import Link from "next/link";
import { db } from "@/db";
import { attempts, exams, questions, resources } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicSections from "@/components/DynamicSections";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";
import Icon from "@/components/Icon";
import LiveDemo from "@/components/LiveDemo";
import { toBn } from "@/lib/bn";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const MARQUEE = [
  "Academic Reading",
  "Writing Task 2",
  "Listening",
  "True / False / Not Given",
  "Gap Fill: টাইপ-করা উত্তর",
  "Grammar Drill",
  "Vocabulary",
  "ব্যান্ড স্কোর",
  "টাইমড মক টেস্ট",
  "লিডারবোর্ড",
];

const MODULES = [
  {
    icon: "book",
    name: "Reading",
    time: "১৫-২০ মিনিট",
    desc: "বাঁয়ে প্যাসেজ, ডানে প্রশ্ন। MCQ, T/F/NG ও gap-fill, নিচে নম্বর প্যালেট আর রিভিউ ফ্ল্যাগ।",
    tag: "সঙ্গে সঙ্গে ব্যান্ড",
  },
  {
    icon: "audio",
    name: "Listening",
    time: "সেকশনভিত্তিক",
    desc: "অডিও শুনে উত্তর দিন। ইনস্ট্রাক্টরের আপলোড করা রেকর্ডিং, টাইপ-করা উত্তরসহ সব প্রশ্নের ধরন।",
    tag: "সঙ্গে সঙ্গে ব্যান্ড",
  },
  {
    icon: "pen",
    name: "Writing",
    time: "৪০ মিনিট",
    desc: "টাস্ক বাঁয়ে, লেখার জায়গা ডানে, লাইভ শব্দগণনা। জমা দিলে ইনস্ট্রাক্টরের কাছে যায়।",
    tag: "ইনস্ট্রাক্টর রিভিউ",
  },
  {
    icon: "target",
    name: "Grammar & Vocab",
    time: "৮-১০ মিনিট",
    desc: "দ্রুত MCQ ও টাইপ-করা উত্তরের ড্রিল। ভিত মজবুত করার সবচেয়ে সহজ উপায়।",
    tag: "সঙ্গে সঙ্গে স্কোর",
  },
];

const FEATURES = [
  {
    icon: "screen",
    title: "হুবহু পরীক্ষার স্ক্রিন",
    desc: "একই ঘড়ি, একই নম্বর প্যালেট, একই রিভিউ ফ্ল্যাগ। পরীক্ষার হলে ঢুকবেন সবকিছু চেনা অবস্থায়।",
  },
  {
    icon: "bolt",
    title: "উঠে দাঁড়ানোর আগেই স্কোর",
    desc: "Reading ও Listening জমা দেওয়ার সঙ্গে সঙ্গেই ব্যান্ড। বানানের গ্রহণযোগ্য বিকল্পসহ মার্কিং।",
  },
  {
    icon: "pen",
    title: "Writing-এ কারণসহ মূল্যায়ন",
    desc: "ইনস্ট্রাক্টর আপনার লেখা পড়ে ফলাফল দেন। ব্যান্ড কোথায় আটকাল, সেটাও জানিয়ে দেন।",
  },
  {
    icon: "bulb",
    title: "ব্যাখ্যাসহ প্রতিটি উত্তর",
    desc: "কোন উত্তর কেন সঠিক, বাংলায় ব্যাখ্যা। ভুলগুলো থেকেই পরের টেস্টের প্রস্তুতি হয়।",
  },
  {
    icon: "trophy",
    title: "লাইভ লিডারবোর্ড",
    desc: "প্রতিটি ব্যান্ড জমা থাকে। সময়ের সাথে নিজের উন্নতি দেখুন, অন্যদের সাথে তুলনা করুন।",
  },
  {
    icon: "device",
    title: "যেকোনো ডিভাইসে",
    desc: "মোবাইল, ট্যাব বা কম্পিউটার। অ্যাপ লাগবে না, রেজিস্ট্রেশনও লাগবে না।",
  },
];

const STEPS = [
  {
    n: "১",
    title: "টেস্ট বেছে নিন",
    desc: "Reading, Listening, Writing বা Grammar, লাইভ তালিকা থেকে পছন্দেরটি নির্বাচন করুন।",
  },
  {
    n: "২",
    title: "সময় ধরে টেস্ট দিন",
    desc: "নাম লিখেই শুরু। আসল পরীক্ষার স্ক্রিন, একই ঘড়ি, রিভিউ ফ্ল্যাগ দিয়ে প্রশ্ন চিহ্নিত করুন।",
  },
  {
    n: "৩",
    title: "ব্যান্ড স্কোর পান",
    desc: "জমা দেওয়ার সঙ্গে সঙ্গেই স্কোর, ব্যাখ্যাসহ রিভিউ আর লিডারবোর্ডে আপনার র‍্যাঙ্ক।",
  },
];

const FAQS = [
  {
    q: "টেস্ট দিতে কি টাকা লাগে?",
    a: "না। LHBD-র সব মক টেস্ট, ব্যান্ড স্কোর, ব্যাখ্যা ও রিসোর্স সম্পূর্ণ ফ্রি। রেজিস্ট্রেশনও লাগে না, নাম লিখেই শুরু।",
  },
  {
    q: "ব্যান্ড স্কোর কীভাবে হিসাব হয়?",
    a: "Reading ও Listening টেস্টে সঠিক উত্তরের সংখ্যা স্ট্যান্ডার্ড কনভার্সন টেবিল দিয়ে ব্যান্ডে (০-৯) রূপান্তর হয়। টাইপ-করা উত্তরে বানানের গ্রহণযোগ্য বিকল্পও গণ্য হয়।",
  },
  {
    q: "Writing-এর ফলাফল কখন পাব?",
    a: "Writing জমা দিলে তা ইনস্ট্রাক্টরের কাছে যায়। মূল্যায়ন শেষ হলে মন্তব্যসহ ফলাফল দেখতে পাবেন।",
  },
  {
    q: "একই টেস্ট কি একাধিকবার দেওয়া যায়?",
    a: "হ্যাঁ, যতবার খুশি। প্রতিবারের স্কোর লিডারবোর্ডে জমা হয়, উন্নতির ধারাটা নিজেই দেখতে পাবেন।",
  },
];

export default async function HomePage() {
  const s = await getSettings();
  const [liveExams, [examCount], [questionCount], [attemptCount], [resourceCount]] =
    await Promise.all([
      db
        .select()
        .from(exams)
        .where(eq(exams.isLive, true))
        .orderBy(desc(exams.createdAt))
        .limit(6),
      db.select({ c: count() }).from(exams),
      db.select({ c: count() }).from(questions),
      db.select({ c: count() }).from(attempts),
      db.select({ c: count() }).from(resources),
    ]);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36">
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="anim-fade-up card inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold text-[#212529]">
                <span className="anim-pulse-live inline-block h-2 w-2 rounded-full bg-emerald-500" />
                {toBn(liveExams.length)}টি {s.hero_badge}
              </div>

              <SpringHeading as="h1" className="anim-fade-up delay-100 mt-7 text-[2.55rem] leading-[1.12] font-bold tracking-tight text-[#1A1A1A] sm:text-5xl xl:text-6xl">
                {s.hero_title_1}
                <br />
                {s.hero_title_2} <span className="text-[#E51A24]">{s.hero_title_accent}</span>
              </SpringHeading>

              <p className="anim-fade-up delay-200 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#6C757D] lg:mx-0">
                {s.hero_subtitle}
              </p>

              <div className="anim-fade-up delay-300 mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Link href="/exams" className="btn-red inline-flex items-center gap-2 rounded-md px-8 py-4 text-base font-bold">
                  ফ্রি টেস্ট শুরু করুন <Icon name="arrow" size={17} />
                </Link>
                <Link href="/resources" className="btn-ghost rounded-md px-8 py-4 text-base font-bold">
                  রিসোর্স দেখুন
                </Link>
              </div>
              <p className="anim-fade-up delay-400 mt-5 text-xs font-medium text-[#6C757D]">
                রেজিস্ট্রেশন ছাড়াই ডেমো · সঙ্গে সঙ্গে ব্যান্ড স্কোর · ব্যাখ্যাসহ রিভিউ
              </p>
            </div>

            <figure className="anim-fade-up delay-200 relative mx-auto w-full max-w-2xl lg:max-w-none">
              <div className="card overflow-hidden rounded-xl bg-white p-2.5">
                <div className="mb-2.5 flex items-center justify-between px-2 pt-1 text-[11px] font-bold text-[#6C757D]">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Reading · Part 1
                  </span>
                  <span className="font-mono text-[#1A1A1A]">00:59:45</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://mocktest.live/brand/hero-760.jpg"
                  alt="কম্পিউটার-ডেলিভার্ড IELTS Reading পরীক্ষার স্ক্রিন"
                  width={760}
                  height={383}
                  fetchPriority="high"
                  className="aspect-[760/383] w-full rounded-lg border border-black/[0.06] object-cover"
                />
              </div>
              <figcaption className="mt-3 text-center text-xs text-[#6C757D] lg:text-right">
                আসল পরীক্ষার মতো স্ক্রিন, প্যাসেজ হাইলাইট ও প্রশ্ন প্যালেট
              </figcaption>
            </figure>
          </div>

          <div className="anim-fade-up delay-400 mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "মক টেস্ট", value: examCount.c, suffix: "+" },
              { label: "প্রশ্ন", value: questionCount.c, suffix: "+" },
              { label: "অ্যাটেম্পট", value: attemptCount.c, suffix: "" },
              { label: "রিসোর্স", value: resourceCount.c, suffix: "+" },
            ].map((stat) => (
              <div key={stat.label} className="card rounded-lg p-4 text-center">
                <div className="text-2xl font-extrabold text-[#1A1A1A]"><CountUp end={stat.value} suffix={stat.suffix} /></div>
                <div className="mt-1 text-xs font-medium text-[#6C757D]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LIVE PRODUCT DEMO ================= */}
      <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        <Reveal>
          <div className="mb-6 flex items-center justify-center gap-2 text-sm font-semibold text-[#6C757D]">
            <Icon name="play" size={16} className="text-[#E51A24]" />
            এটি ছবি নয়, আসল ইঞ্জিন। এখনই একটি প্রশ্নের উত্তর দিয়ে দেখুন
          </div>
          <LiveDemo />
        </Reveal>
      </section>

      {/* ================= MARQUEE ================= */}
      <section className="marquee-mask overflow-hidden border-y border-black/[0.06] bg-white py-5">
        <div className="anim-marquee flex w-max gap-3">
          {[...MARQUEE, ...MARQUEE].map((c, i) => (
            <span
              key={i}
              className="rounded-full border border-black/[0.07] bg-[#F8F9FA] px-5 py-2 text-sm font-medium whitespace-nowrap text-[#212529]"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* ================= MODULES (rows) ================= */}
      <section className="mx-auto max-w-5xl px-5 py-24 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="rounded-full bg-[#E51A24]/[0.08] px-4 py-1.5 text-xs font-bold tracking-wide text-[#E51A24]">
            মডিউল
          </span>
          <SpringHeading as="h2" className="mt-5 text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-[2.4rem] sm:leading-tight">
            একটি টেস্ট কেমন হয়
          </SpringHeading>
          <p className="mt-4 text-[#6C757D]">
            কম্পিউটার-ডেলিভার্ড পরীক্ষার মতোই ক্রম, ঘড়ি ও প্রশ্নের ধরন, চারটি
            মডিউলে সাজানো।
          </p>
        </Reveal>
        <div className="mt-14 space-y-3">
          {MODULES.map((m, i) => (
            <Reveal key={m.name} delay={i * 90}>
              <div className="lift card flex flex-col gap-5 rounded-lg p-6 sm:flex-row sm:items-center sm:p-7">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-[#F8F9FA] text-[#1A1A1A]">
                  <Icon name={m.icon} size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <SpringHeading as="h3" className="text-lg font-bold text-[#1A1A1A]">
                      {m.name}
                    </SpringHeading>
                    <span className="text-xs font-semibold text-[#6C757D]">
                      {m.time}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#6C757D]">
                    {m.desc}
                  </p>
                </div>
                <span
                  className={`shrink-0 self-start rounded-full px-4 py-1.5 text-xs font-bold sm:self-center ${
                    m.tag === "ইনস্ট্রাক্টর রিভিউ"
                      ? "bg-[#F8F9FA] text-[#6C757D]"
                      : "bg-[#E51A24]/[0.08] text-[#E51A24]"
                  }`}
                >
                  {m.tag}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= FEATURES (2 col) ================= */}
      <section className="border-y border-black/[0.06] bg-white py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="rounded-full bg-[#E51A24]/[0.08] px-4 py-1.5 text-xs font-bold tracking-wide text-[#E51A24]">
              ফিচার
            </span>
            <SpringHeading as="h2" className="mt-5 text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-[2.4rem] sm:leading-tight">
              যা যা পাচ্ছেন
            </SpringHeading>
            <p className="mt-4 text-[#6C757D]">
              স্ক্রিনটাই পরীক্ষা, আর নম্বরও বেরোয় একদম আসল নিয়মেই।
            </p>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 2) * 90}>
                <div className="lift h-full rounded-lg border border-black/[0.07] bg-[#F8F9FA] p-7">
                  <div className="grid h-11 w-11 place-items-center rounded-md bg-white text-[#1A1A1A]">
                    <Icon name={f.icon} size={21} />
                  </div>
                  <SpringHeading as="h3" className="mt-5 text-lg font-bold text-[#1A1A1A]">
                    {f.title}
                  </SpringHeading>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#6C757D]">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LIVE TESTS ================= */}
      <section className="mx-auto max-w-5xl px-5 py-24 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="rounded-full bg-[#E51A24]/[0.08] px-4 py-1.5 text-xs font-bold tracking-wide text-[#E51A24]">
              লাইভ
            </span>
            <SpringHeading as="h2" className="mt-5 text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-[2.4rem]">
              লাইভ টেস্টসমূহ
            </SpringHeading>
          </div>
          <Link
            href="/exams"
            className="btn-ghost inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-bold"
          >
            সব টেস্ট দেখুন <Icon name="arrow" size={15} />
          </Link>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {liveExams.map((e, i) => (
            <Reveal key={e.id} delay={(i % 2) * 90}>
              <Link
                href={`/exams/${e.id}`}
                className="lift card group block h-full rounded-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 rounded-full bg-[#F8F9FA] px-3.5 py-1.5 text-xs font-bold text-[#6C757D]">
                    <Icon
                      name={
                        e.module === "reading"
                          ? "book"
                          : e.module === "listening"
                            ? "audio"
                            : e.module === "writing"
                              ? "pen"
                              : "target"
                      }
                      size={13}
                    />
                    {e.module === "reading"
                      ? "Reading"
                      : e.module === "listening"
                        ? "Listening"
                        : e.module === "writing"
                          ? "Writing"
                          : "MCQ"}
                  </span>
                  <span className="status-pill flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold">
                    <span className="anim-pulse-live h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    LIVE
                  </span>
                </div>
                <SpringHeading as="h3" className="mt-5 text-lg font-bold text-[#1A1A1A] transition-colors group-hover:text-[#E51A24]">
                  {e.title}
                </SpringHeading>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#6C757D]">
                  {e.description}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-black/[0.06] pt-5 text-xs font-semibold text-[#6C757D]">
                  <span className="flex items-center gap-1.5">
                    <Icon name="clock" size={13} />
                    {toBn(e.durationMinutes)} মিনিট
                  </span>
                  <span>{e.category}</span>
                  <span className="flex items-center gap-1 text-[#1A1A1A]">
                    শুরু করুন <Icon name="arrow" size={13} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
          {liveExams.length === 0 && (
            <p className="col-span-full text-center text-[#6C757D]">
              এই মুহূর্তে কোনো লাইভ টেস্ট নেই।
            </p>
          )}
        </div>
      </section>

      {/* ================= STEPS ================= */}
      <section className="border-y border-black/[0.06] bg-white py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <SpringHeading as="h2" className="text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-[2.4rem]">
              মাত্র <span className="text-[#E51A24]">৩ ধাপে</span> শুরু
            </SpringHeading>
          </Reveal>
          <div className="relative mt-14 grid gap-10 md:grid-cols-3">
            <div className="absolute top-7 right-[16%] left-[16%] hidden border-t border-dashed border-black/15 md:block" />
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 110}>
                <div className="relative text-center">
                  <div
                    className={`mx-auto grid h-14 w-14 place-items-center rounded-md text-xl font-extrabold text-white ${
                      i === 2 ? "bg-[#E51A24]" : "bg-[#1A1A1A]"
                    }`}
                  >
                    {s.n}
                  </div>
                  <SpringHeading as="h3" className="mt-6 text-lg font-bold text-[#1A1A1A]">
                    {s.title}
                  </SpringHeading>
                  <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-[#6C757D]">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
        <Reveal className="text-center">
          <SpringHeading as="h2" className="text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-[2.4rem]">
            সাধারণ প্রশ্ন
          </SpringHeading>
        </Reveal>
        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 80}>
              <details className="card group rounded-lg p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-[#1A1A1A]">
                  {f.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#F8F9FA] text-[#E51A24] transition-transform duration-300 group-open:rotate-45">
                    <Icon name="plus" size={15} />
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-[#6C757D]">
                  {f.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        <Reveal>
          <div className="rounded-xl bg-[#1A1A1A] p-12 text-center sm:p-16">
            <SpringHeading as="h2" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {s.cta_title}
            </SpringHeading>
            <p className="mx-auto mt-5 max-w-xl text-white/60">
              {s.cta_subtitle}
            </p>
            <Link
              href="/exams"
              className="btn-red mt-9 inline-flex items-center gap-2 rounded-md px-9 py-4 text-base font-bold"
            >
              ফ্রি মক টেস্ট দিন <Icon name="arrow" size={17} />
            </Link>
          </div>
        </Reveal>
      </section>

      <DynamicSections page="home" />
      <Footer />
    </div>
  );
}
