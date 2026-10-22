"use client";

import SpringHeading from "@/components/SpringHeading";

import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { toBn } from "@/components/CountUp";

type Section = {
  id: number;
  page: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  sortOrder: number;
  enabled: boolean;
};

type FormState = {
  id: number | null;
  page: string;
  type: string;
  title: string;
  html: string;
  headline: string;
  subtext: string;
  images: string;
  videoUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  text: string;
  deadline: string;
  links: string;
  limit: number;
  enabled: boolean;
};

const PAGES = ["home", "exams", "resources", "leaderboard", "privacy", "terms"];
const TYPES = [
  { value: "html", label: "Raw HTML / CSS / JS" },
  { value: "hero", label: "Media / Video Hero" },
  { value: "announcement", label: "Announcement Ticker" },
  { value: "exam_grid", label: "Exam Grid" },
  { value: "resource_grid", label: "Resource Grid" },
  { value: "links", label: "Link Cards" },
];

const emptyForm: FormState = {
  id: null,
  page: "home",
  type: "html",
  title: "",
  html: "",
  headline: "",
  subtext: "",
  images: "",
  videoUrl: "",
  ctaLabel: "",
  ctaUrl: "",
  text: "",
  deadline: "",
  links: "",
  limit: 6,
  enabled: true,
};

function contentOf(s: Section): Record<string, string | number | string[]> {
  return s.content as Record<string, string | number | string[]>;
}

export default function AdminPagesPage() {
  const [rows, setRows] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("home");
  const [customPage, setCustomPage] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [headerCode, setHeaderCode] = useState("");
  const [footerCode, setFooterCode] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/pages");
    const data = (await res.json()) as Section[];
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d: Record<string, string>) => {
        setHeaderCode(d.header_code ?? "");
        setFooterCode(d.footer_code ?? "");
      });
  }, [load]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const edit = (s: Section) => {
    const c = contentOf(s);
    const links = Array.isArray(c.links)
      ? (c.links as unknown as Array<{ label: string; url: string; description?: string }>)
          .map((l) => `${l.label} | ${l.url} | ${l.description ?? ""}`)
          .join("\n")
      : "";
    setForm({
      ...emptyForm,
      id: s.id,
      page: s.page,
      type: s.type,
      title: s.title,
      html: String(c.html ?? ""),
      headline: String(c.headline ?? ""),
      subtext: String(c.subtext ?? ""),
      images: Array.isArray(c.images) ? c.images.join("\n") : "",
      videoUrl: String(c.videoUrl ?? ""),
      ctaLabel: String(c.ctaLabel ?? ""),
      ctaUrl: String(c.ctaUrl ?? ""),
      text: String(c.text ?? ""),
      deadline: String(c.deadline ?? ""),
      links,
      limit: Number(c.limit ?? 6),
      enabled: s.enabled,
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildContent = (): Record<string, unknown> => {
    if (form.type === "html") return { html: form.html };
    if (form.type === "hero")
      return {
        headline: form.headline,
        subtext: form.subtext,
        images: form.images.split("\n").map((x) => x.trim()).filter(Boolean),
        videoUrl: form.videoUrl,
        ctaLabel: form.ctaLabel,
        ctaUrl: form.ctaUrl,
      };
    if (form.type === "announcement")
      return {
        text: form.text,
        deadline: form.deadline,
        ctaLabel: form.ctaLabel,
        ctaUrl: form.ctaUrl,
      };
    if (form.type === "links")
      return {
        links: form.links
          .split("\n")
          .map((line) => line.split("|").map((x) => x.trim()))
          .filter((p) => p[0] && p[1])
          .map((p) => ({ label: p[0], url: p[1], description: p[2] ?? "" })),
      };
    return { limit: form.limit };
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    const res = await fetch(form.id ? `/api/pages/${form.id}` : "/api/pages", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: form.page,
        type: form.type,
        title: form.title,
        content: buildContent(),
        enabled: form.enabled,
        sortOrder: form.id ? undefined : rows.length,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("সংরক্ষণ ব্যর্থ হয়েছে");
      return;
    }
    setSuccess("সেকশন সংরক্ষিত হয়েছে");
    setForm(emptyForm);
    await load();
  };

  const move = async (s: Section, dir: -1 | 1) => {
    const siblings = rows
      .filter((r) => r.page === s.page)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = siblings.findIndex((r) => r.id === s.id);
    const other = siblings[idx + dir];
    if (!other) return;
    await Promise.all([
      fetch(`/api/pages/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: other.sortOrder }),
      }),
      fetch(`/api/pages/${other.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: s.sortOrder }),
      }),
    ]);
    await load();
  };

  const toggle = async (s: Section) => {
    await fetch(`/api/pages/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !s.enabled }),
    });
    await load();
  };

  const remove = async (s: Section) => {
    if (!confirm("সেকশনটি মুছে ফেলবেন?")) return;
    await fetch(`/api/pages/${s.id}`, { method: "DELETE" });
    await load();
  };

  const saveInjection = async () => {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ header_code: headerCode, footer_code: footerCode }),
    });
    setSaving(false);
    setSuccess(res.ok ? "কোড ইনজেকশন সংরক্ষিত" : "সংরক্ষণ ব্যর্থ");
  };

  const input =
    "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#E51A24] focus:ring-2 focus:ring-red-100";
  const visible = rows
    .filter((r) => r.page === filter)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card rounded-lg p-5">
            <div className="shimmer h-4 w-1/3 rounded" />
            <div className="shimmer mt-2.5 h-9 w-full rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <SpringHeading as="h1" className="text-2xl font-bold">পেজ ও সেকশন বিল্ডার</SpringHeading>
        <p className="mt-1 text-sm text-[#6C757D]">
          পাবলিক পেজে ডাইনামিক সেকশন, HTML/CSS/JS, ভিডিও হিরো ও নোটিস যোগ করুন
        </p>
      </div>

      {/* editor */}
      <section className="card rounded-lg p-6">
        <SpringHeading as="h2" className="font-bold">{form.id ? `সেকশন #${toBn(form.id)} সম্পাদনা` : "নতুন সেকশন"}</SpringHeading>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium">পেজ</label>
            <select value={form.page} onChange={(e) => set("page", e.target.value)} className={input}>
              {PAGES.map((p) => <option key={p}>{p}</option>)}
              {!PAGES.includes(form.page) && <option>{form.page}</option>}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">ব্লক টাইপ</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className={input}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">শিরোনাম</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} className={input} />
          </div>
        </div>

        {form.type === "html" && (
          <div className="mt-4">
            <label className="text-sm font-medium">HTML / CSS / JavaScript / iframe</label>
            <textarea
              rows={10}
              value={form.html}
              onChange={(e) => set("html", e.target.value)}
              placeholder={'<section style="padding:40px">\n  <h2>My block</h2>\n</section>\n<script>console.log("hello")</script>'}
              className={`${input} font-mono text-xs`}
            />
          </div>
        )}
        {(form.type === "hero" || form.type === "announcement") && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {form.type === "hero" ? (
              <>
                <div><label className="text-sm font-medium">হেডলাইন</label><input value={form.headline} onChange={(e) => set("headline", e.target.value)} className={input} /></div>
                <div><label className="text-sm font-medium">ভিডিও URL (.mp4 / YouTube / Vimeo)</label><input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} className={input} /></div>
                <div className="sm:col-span-2"><label className="text-sm font-medium">সাবটেক্সট</label><textarea rows={2} value={form.subtext} onChange={(e) => set("subtext", e.target.value)} className={input} /></div>
                <div className="sm:col-span-2"><label className="text-sm font-medium">স্লাইডার ছবির URL (প্রতি লাইনে একটি)</label><textarea rows={3} value={form.images} onChange={(e) => set("images", e.target.value)} className={input} /></div>
              </>
            ) : (
              <>
                <div className="sm:col-span-2"><label className="text-sm font-medium">নোটিস টেক্সট</label><textarea rows={2} value={form.text} onChange={(e) => set("text", e.target.value)} className={input} /></div>
                <div><label className="text-sm font-medium">কাউন্টডাউন ডেডলাইন (ঐচ্ছিক)</label><input type="datetime-local" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className={input} /></div>
              </>
            )}
            <div><label className="text-sm font-medium">CTA লেবেল</label><input value={form.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} className={input} /></div>
            <div><label className="text-sm font-medium">CTA URL</label><input value={form.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} className={input} /></div>
          </div>
        )}
        {form.type === "links" && (
          <div className="mt-4">
            <label className="text-sm font-medium">লিংক (Label | URL | Description প্রতি লাইনে)</label>
            <textarea rows={5} value={form.links} onChange={(e) => set("links", e.target.value)} className={input} />
          </div>
        )}
        {(form.type === "exam_grid" || form.type === "resource_grid") && (
          <div className="mt-4 max-w-xs">
            <label className="text-sm font-medium">কতটি আইটেম দেখাবে</label>
            <input type="number" value={form.limit} onChange={(e) => set("limit", Number(e.target.value))} className={input} />
          </div>
        )}

        <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} className="h-4 w-4 accent-[#E51A24]" />
          সেকশনটি সক্রিয়
        </label>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        {success && <p className="mt-3 text-sm font-semibold text-green-700">{success}</p>}
        <div className="mt-5 flex gap-3">
          <button onClick={save} disabled={saving} className="btn-red rounded-md px-6 py-2.5 text-sm font-bold disabled:opacity-60">
            {saving ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
          </button>
          {form.id && <button onClick={() => setForm(emptyForm)} className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold">বাতিল</button>}
        </div>
      </section>

      {/* section list */}
      <section>
        <div className="flex flex-wrap items-center gap-2">
          {[...PAGES, ...Array.from(new Set(rows.map((r) => r.page))).filter((p) => !PAGES.includes(p))].map((p) => (
            <button key={p} onClick={() => setFilter(p)} className={`rounded-md px-4 py-2 text-sm font-bold ${filter === p ? "bg-[#1A1A1A] text-white" : "bg-slate-100 text-slate-700"}`}>{p}</button>
          ))}
          <input value={customPage} onChange={(e) => setCustomPage(e.target.value)} placeholder="custom-slug" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <button onClick={() => customPage.trim() && setFilter(customPage.trim())} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold">খুলুন</button>
          {filter && !PAGES.includes(filter) && <a href={`/p/${filter}`} target="_blank" className="text-xs font-bold text-[#E51A24]">পাবলিক লিংক /p/{filter}</a>}
        </div>
        <div className="mt-4 space-y-2">
          {visible.map((s, i) => (
            <div key={s.id} className="card flex flex-wrap items-center gap-3 rounded-lg px-5 py-3.5">
              <span className="text-xs font-bold text-[#6C757D]">#{toBn(i + 1)}</span>
              <span className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-bold">{s.type}</span>
              <span className="min-w-0 flex-1 font-semibold">{s.title || "(শিরোনামহীন)"}</span>
              <button onClick={() => move(s, -1)} disabled={i === 0} className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-30">↑</button>
              <button onClick={() => move(s, 1)} disabled={i === visible.length - 1} className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-30">↓</button>
              <button onClick={() => toggle(s)} className={`rounded px-3 py-1.5 text-xs font-bold ${s.enabled ? "bg-green-50 text-green-700" : "bg-slate-100 text-[#6C757D]"}`}>{s.enabled ? "সক্রিয়" : "বন্ধ"}</button>
              <button onClick={() => edit(s)} className="rounded bg-slate-100 px-3 py-1.5 text-xs font-bold"><Icon name="edit" size={13} /></button>
              <button onClick={() => remove(s)} className="rounded bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600"><Icon name="trash" size={13} /></button>
            </div>
          ))}
          {visible.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 py-10 text-center text-sm text-[#6C757D]">এই পেজে কোনো কাস্টম সেকশন নেই।</p>}
        </div>
      </section>

      {/* injection */}
      <section className="card rounded-lg p-6">
        <SpringHeading as="h2" className="font-bold">Header / Footer কোড ইনজেকশন</SpringHeading>
        <p className="mt-1 text-sm text-[#6C757D]">Analytics, Meta Pixel, chat widget, কাস্টম CSS ইত্যাদি সব পেজে চলবে।</p>
        <label className="mt-4 block text-sm font-medium">Header code</label>
        <textarea rows={5} value={headerCode} onChange={(e) => setHeaderCode(e.target.value)} className={`${input} font-mono text-xs`} />
        <label className="mt-4 block text-sm font-medium">Footer code</label>
        <textarea rows={5} value={footerCode} onChange={(e) => setFooterCode(e.target.value)} className={`${input} font-mono text-xs`} />
        <button onClick={saveInjection} disabled={saving} className="btn-ink mt-4 rounded-md px-6 py-2.5 text-sm font-bold">ইনজেকশন সংরক্ষণ</button>
      </section>
    </div>
  );
}
