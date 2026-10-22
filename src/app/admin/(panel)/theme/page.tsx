"use client";

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
  { key: "body", label: "Body Text (p, span, inputs)", scope: "body, p, span, input, label, li" },
  { key: "heading", label: "Headlines (h1, h2, h3)", scope: "h1, h2, h3, h4, h5, h6" },
  { key: "accent", label: "Brand Red Accents / CTA", scope: ".btn-red, .btn-ink, badges" },
  { key: "style", label: "Modern / Italic / Quotes", scope: "blockquote, em, quotes" },
];

const TRI_STATES = [
  { value: "unset", label: "ডিফল্ট" },
  { value: "on", label: "চালু" },
  { value: "off", label: "বন্ধ" },
] as const;

function triValue(raw: string | undefined): "unset" | "on" | "off" {
  return raw === "on" || raw === "off" ? raw : "unset";
}

/** Mirrors the generated CSS so the preview matches the live site. */
function styleFor(
  v: Record<string, string>,
  slot: string,
  baseWeight: string,
): React.CSSProperties {
  const bold = triValue(v[`${slot}_bold`]);
  const italic = triValue(v[`${slot}_italic`]);
  return {
    fontFamily: v[`font_${slot}_family`] || undefined,
    fontWeight: bold === "on" ? 700 : bold === "off" ? 400 : baseWeight,
    fontStyle: italic === "on" ? "italic" : italic === "off" ? "normal" : undefined,
    letterSpacing: v[`${slot}_letter_spacing`] || undefined,
    lineHeight: v[`${slot}_line_height`] || undefined,
  };
}

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
          <h1 className="text-2xl font-bold">থিম ও টাইপোগ্রাফি ইঞ্জিন</h1>
          <p className="mt-1 text-sm text-[#6C757D]">রং, ফন্ট ও টেক্সট স্টাইল, কোড ছাড়াই</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-red rounded-md px-6 py-2.5 text-sm font-bold disabled:opacity-60">
          {saving ? "সংরক্ষণ হচ্ছে…" : "থিম সংরক্ষণ"}
        </button>
      </div>
      {error && <p className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}
      {success && <p className="rounded-md bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{success}</p>}

      <section className="card rounded-lg p-6">
        <h2 className="font-bold">কালার প্যালেট</h2>
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
        <h2 className="font-bold">ফন্ট ফাইল ম্যানেজার ও টাইপোগ্রাফি</h2>
        <input ref={fileRef} type="file" accept=".woff2,.woff,.ttf,.otf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFont(f); e.target.value = ""; }} />
        <div className="mt-5 space-y-6">
          {FONT_SLOTS.map((s) => (
            <div key={s.key} className="rounded-md border border-black/[0.07] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold">{s.label}</h3>
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

              {/* Bold / Italic switches */}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {([
                  { field: "bold", label: "Bold ভার্সন", icon: "B" },
                  { field: "italic", label: "Italic", icon: "I" },
                ] as const).map((toggle) => {
                  const key = `${s.key}_${toggle.field}`;
                  const active = triValue(v[key]);
                  return (
                    <div key={key} className="rounded-md bg-[#F8F9FA] p-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs font-bold text-[#212529]">
                          <span
                            className="grid h-6 w-6 place-items-center rounded border border-black/15 bg-white text-[11px] leading-none"
                            style={{
                              fontWeight: toggle.field === "bold" ? 800 : 500,
                              fontStyle: toggle.field === "italic" ? "italic" : "normal",
                            }}
                          >
                            {toggle.icon}
                          </span>
                          {toggle.label}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            active === "on"
                              ? "bg-green-100 text-green-700"
                              : active === "off"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {active === "on" ? "চালু" : active === "off" ? "বন্ধ" : "ডিফল্ট"}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-1 rounded-md border border-black/10 bg-white p-1">
                        {TRI_STATES.map((state) => (
                          <button
                            key={state.value}
                            type="button"
                            onClick={() => set(key, state.value)}
                            className={`rounded px-2 py-1.5 text-[11px] font-bold transition-colors ${
                              active === state.value
                                ? state.value === "off"
                                  ? "bg-rose-600 text-white"
                                  : "bg-[#1A1A1A] text-white"
                                : "text-[#6C757D] hover:bg-slate-100"
                            }`}
                          >
                            {state.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-[#6C757D]">
                প্রযোজ্য: <span className="font-mono">{s.scope}</span>
              </p>

              <p className="mt-4 text-2xl" style={styleFor(v, s.key, s.key === "body" ? "400" : "700")}>
                বাংলা টাইপোগ্রাফি Preview · The quick brown fox 123
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="card rounded-lg p-6">
        <h2 className="font-bold">সব স্লটে একসাথে প্রয়োগ</h2>
        <p className="mt-1 text-sm text-[#6C757D]">
          চাইলে এক ক্লিকে সব টাইপোগ্রাফি স্লটের Bold/Italic বদলান, তারপর নিচের স্লটগুলোতে আলাদাভাবে ঠিক করে নিন।
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(["bold", "italic"] as const).map((field) => (
            <div key={field} className="flex items-center justify-between rounded-md border border-black/[0.07] bg-[#F8F9FA] px-4 py-3">
              <span className="text-sm font-bold">{field === "bold" ? "Bold ভার্সন" : "Italic"}</span>
              <div className="flex gap-1 rounded-md border border-black/10 bg-white p-1">
                {(["on", "unset", "off"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      const patch: Record<string, string> = {};
                      for (const slot of FONT_SLOTS) patch[`${slot.key}_${field}`] = mode;
                      setV((old) => ({ ...old, ...patch }));
                      setSuccess("সব স্লটে প্রয়োগ হয়েছে, সংরক্ষণ করুন");
                    }}
                    className={`rounded px-3 py-1.5 text-[11px] font-bold ${
                      mode === "off" ? "text-rose-700" : "text-slate-700"
                    } hover:bg-slate-100`}
                  >
                    {mode === "on" ? "সব চালু" : mode === "off" ? "সব বন্ধ" : "রিসেট"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card rounded-lg p-6">
        <h2 className="font-bold">লাইভ প্রিভিউ</h2>
        <div className="mt-4 rounded-md border border-black/10 p-8" style={{ background: v.color_bg || "#F8F9FA", color: v.color_text || "#1A1A1A" }}>
          <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: v.color_primary || "#E51A24", color: "#fff" }}>ব্যাজ</span>
          <h2 className="mt-4 text-3xl" style={{ ...styleFor(v, "heading", "700"), letterSpacing: v.heading_letter_spacing || undefined }}>হেডলাইন দেখে নিন</h2>
          <p className="mt-3" style={{ ...styleFor(v, "body", "400"), color: v.color_muted || "#6C757D" }}>বডি টেক্সট, ফন্ট ও লাইন হাইট এখানে লাইভ দেখা যাচ্ছে।</p>
          <p className="mt-2 font-bold" style={styleFor(v, "body", "400")}>Bold টেক্সট: দ্রুত প্রস্তুতি শুরু করুন</p>
          <button className="mt-5 rounded-md px-6 py-3 font-bold text-white" style={{ ...styleFor(v, "accent", "700"), background: v.color_primary || "#E51A24" }}>প্রাইমারি CTA</button>
        </div>
      </section>
    </div>
  );
}
