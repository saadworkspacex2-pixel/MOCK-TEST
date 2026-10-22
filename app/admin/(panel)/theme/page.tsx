"use client";

import SpringHeading from "@/components/SpringHeading";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";

const COLOR_FIELDS = [
  { key: "color_primary", label: "Primary Brand Red" },
  { key: "color_bg", label: "Page Background" },
  { key: "color_surface", label: "Card Surface" },
  { key: "color_text", label: "Main Text" },
  { key: "color_muted", label: "Secondary Text" },
];

const FONT_SLOTS = [
  { key: "body", label: "Body Text (p, span, inputs)" },
  { key: "heading", label: "Headlines (h1, h2, h3)" },
  { key: "accent", label: "Brand Red Accents / CTA" },
  { key: "style", label: "Modern / Italic / Quotes" },
];

export default function AdminThemePage() {
  const [v, setV] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [slot, setSlot] = useState("body");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d: Record<string, string>) => setV(d))
      .finally(() => setLoading(false));
  }, []);

  const set = (k: string, value: string) => setV((old) => ({ ...old, [k]: value }));

  const uploadFont = async (file: File) => {
    setUploading(slot);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const d = (await res.json()) as { url?: string; error?: string };
    setUploading("");
    if (!res.ok || !d.url) {
      setError(d.error || "আপলোড ব্যর্থ");
      return;
    }
    set(`font_${slot}_url`, d.url);
    if (!v[`font_${slot}_family`]) {
      set(`font_${slot}_family`, `LHBDCustom${slot[0].toUpperCase()}${slot.slice(1)}`);
    }
    setSuccess("ফন্ট আপলোড হয়েছে। সংরক্ষণ করলে সাইটে কার্যকর হবে।");
  };

  const save = async () => {
    setSaving(true);
    setError("");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    setSaving(false);
    if (res.ok) {
      setSuccess("থিম সংরক্ষিত। পাবলিক সাইট রিলোড করলেই নতুন স্টাইল।");
      setTimeout(() => setSuccess(""), 3500);
    } else setError("সংরক্ষণ ব্যর্থ");
  };

  const input =
    "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#E51A24] focus:ring-2 focus:ring-red-100";

  if (loading) {
    return <div className="card rounded-lg p-6"><div className="shimmer h-5 w-1/3 rounded" /><div className="shimmer mt-4 h-24 rounded" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <SpringHeading as="h1" className="text-2xl font-bold">থিম ও টাইপোগ্রাফি ইঞ্জিন</SpringHeading>
          <p className="mt-1 text-sm text-[#6C757D]">রং, ফন্ট ও টেক্সট স্টাইল, কোড ছাড়াই</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-red rounded-md px-6 py-2.5 text-sm font-bold disabled:opacity-60">
          {saving ? "সংরক্ষণ হচ্ছে…" : "থিম সংরক্ষণ"}
        </button>
      </div>
      {error && <p className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}
      {success && <p className="rounded-md bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{success}</p>}

      <section className="card rounded-lg p-6">
        <SpringHeading as="h2" className="font-bold">কালার প্যালেট</SpringHeading>
        <div className="mt-5 grid gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {COLOR_FIELDS.map((f) => (
            <label key={f.key} className="text-sm font-medium">
              {f.label}
              <span className="mt-2 flex items-center gap-2 rounded-md border border-slate-300 p-2">
                <input type="color" value={v[f.key] || (f.key === "color_primary" ? "#E51A24" : f.key === "color_bg" ? "#F8F9FA" : f.key === "color_surface" ? "#FFFFFF" : f.key === "color_muted" ? "#6C757D" : "#1A1A1A")} onChange={(e) => set(f.key, e.target.value)} className="h-9 w-12 cursor-pointer border-0 bg-transparent" />
                <span className="font-mono text-xs">{v[f.key] || "auto"}</span>
              </span>
            </label>
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Card Border Hairline (CSS)</label>
            <input value={v.color_border ?? ""} onChange={(e) => set("color_border", e.target.value)} placeholder="rgba(26,26,26,.09)" className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Background Gradient (CSS, ঐচ্ছিক)</label>
            <input value={v.color_gradient ?? ""} onChange={(e) => set("color_gradient", e.target.value)} placeholder="linear-gradient(135deg,#F8F9FA,#FFFFFF)" className={input} />
          </div>

        </div>
      </section>

      <section className="card rounded-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <SpringHeading as="h2" className="font-bold">Font Style Controls</SpringHeading>
            <p className="mt-1 text-sm text-[#6C757D]">Bold, Italic এবং Bold Version Mode আলাদাভাবে চালু/বন্ধ করুন</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[#6C757D]">সাইট-wide</span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              key: "font_bold_enabled",
              label: "Bold Text",
              description: "বন্ধ করলে সব লেখা Normal weight-এ দেখাবে",
              on: v.font_bold_enabled !== "0",
            },
            {
              key: "font_italic_enabled",
              label: "Italic Text",
              description: "বন্ধ করলে সব Italic লেখা Normal style-এ দেখাবে",
              on: v.font_italic_enabled !== "0",
            },
            {
              key: "font_bold_mode",
              label: "Bold Version Mode",
              description: "চালু করলে Bold টেক্সট Extra Bold (800) version পাবে",
              on: v.font_bold_mode === "1",
            },
          ].map((control) => (
            <div key={control.key} className="rounded-lg border border-black/[0.07] bg-white/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-bold">{control.label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={control.on}
                  aria-label={`${control.label} ${control.on ? "বন্ধ" : "চালু"} করুন`}
                  onClick={() => set(control.key, control.on ? "0" : "1")}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${control.on ? "bg-[#E51A24]" : "bg-slate-300"}`}
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${control.on ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#6C757D]">{control.description}</p>
              <p className={`mt-3 text-xs font-bold ${control.on ? "text-emerald-600" : "text-slate-400"}`}>
                {control.on ? "ON" : "OFF"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="card rounded-lg p-6">
        <SpringHeading as="h2" className="font-bold">ফন্ট ফাইল ম্যানেজার ও টাইপোগ্রাফি</SpringHeading>
        <input ref={fileRef} type="file" accept=".woff2,.woff,.ttf,.otf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFont(f); e.target.value = ""; }} />
        <div className="mt-5 space-y-6">
          {FONT_SLOTS.map((s) => (
            <div key={s.key} className="rounded-md border border-black/[0.07] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SpringHeading as="h3" className="font-semibold">{s.label}</SpringHeading>
                <button onClick={() => { setSlot(s.key); setTimeout(() => fileRef.current?.click(), 0); }} disabled={uploading === s.key} className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-xs font-bold disabled:opacity-50">
                  <Icon name="plus" size={13} /> {uploading === s.key ? "আপলোড হচ্ছে…" : "ফন্ট আপলোড (.woff2/.ttf/.otf)"}
                </button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div><label className="text-xs font-semibold">Font Family নাম</label><input value={v[`font_${s.key}_family`] ?? ""} onChange={(e) => set(`font_${s.key}_family`, e.target.value)} placeholder="Hind Siliguri" className={input} /></div>
                <div><label className="text-xs font-semibold">Weight</label><input value={v[`${s.key}_weight`] ?? ""} onChange={(e) => set(`${s.key}_weight`, e.target.value)} placeholder="400 / 700" className={input} /></div>
                <div><label className="text-xs font-semibold">Letter Spacing</label><input value={v[`${s.key}_letter_spacing`] ?? ""} onChange={(e) => set(`${s.key}_letter_spacing`, e.target.value)} placeholder="-0.02em" className={input} /></div>
                <div><label className="text-xs font-semibold">Line Height</label><input value={v[`${s.key}_line_height`] ?? ""} onChange={(e) => set(`${s.key}_line_height`, e.target.value)} placeholder="1.6" className={input} /></div>
              </div>
              {v[`font_${s.key}_url`] && <p className="mt-2 break-all font-mono text-[11px] text-[#6C757D]">{v[`font_${s.key}_url`]}</p>}
              <p className="mt-4 text-2xl" style={{ fontFamily: v[`font_${s.key}_family`] || undefined, fontWeight: v[`${s.key}_weight`] || undefined, letterSpacing: v[`${s.key}_letter_spacing`] || undefined, lineHeight: v[`${s.key}_line_height`] || undefined }}>
                বাংলা টাইপোগ্রাফি Preview · The quick brown fox 123
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="card rounded-lg p-6">
        <SpringHeading as="h2" className="font-bold">লাইভ প্রিভিউ</SpringHeading>
        <div className="mt-4 rounded-md border border-black/10 p-8" style={{ background: v.color_bg || "#F8F9FA", color: v.color_text || "#1A1A1A" }}>
          <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: v.color_primary || "#E51A24", color: "#fff" }}>ব্যাজ</span>
          <SpringHeading as="h2" className="mt-4 text-3xl" style={{ fontFamily: v.font_heading_family || undefined, fontWeight: v.font_bold_enabled === "0" ? 400 : v.font_bold_mode === "1" ? 800 : v.heading_weight || 700, letterSpacing: v.heading_letter_spacing }}>হেডলাইন দেখে নিন</SpringHeading>
          <p className="mt-3" style={{ fontFamily: v.font_body_family || undefined, lineHeight: v.body_line_height, color: v.color_muted || "#6C757D" }}>বডি টেক্সট, ফন্ট ও লাইন হাইট এখানে লাইভ দেখা যাচ্ছে।</p>
          <p className="mt-3 text-sm">
            <strong style={{ fontWeight: v.font_bold_enabled === "0" ? 400 : v.font_bold_mode === "1" ? 800 : 700 }}>Bold Preview</strong>
            <span className="mx-2 text-[#6C757D]">·</span>
            <em style={{ fontStyle: v.font_italic_enabled === "0" ? "normal" : "italic" }}>Italic Preview</em>
          </p>
          <button className="mt-5 rounded-md px-6 py-3 font-bold text-white" style={{ background: v.color_primary || "#E51A24", fontFamily: v.font_accent_family || undefined }}>প্রাইমারি CTA</button>
        </div>
      </section>
    </div>
  );
}
