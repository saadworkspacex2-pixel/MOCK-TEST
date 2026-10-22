"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { LogoMark } from "@/components/Logo";

const LOGO_SIZES = [24, 32, 38, 44, 56, 64];

export default function BrandingPage() {
  const [v, setV] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "favicon" | "">("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);
  const favRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d: Record<string, string>) => setV(d))
      .finally(() => setLoading(false));
  }, []);

  const set = (k: string, value: string) =>
    setV((prev) => ({ ...prev, [k]: value }));

  const upload = async (file: File, kind: "logo" | "favicon") => {
    setUploading(kind);
    setError("");
    if (file.size > 2_000_000) {
      setUploading("");
      setError("ছবি সর্বোচ্চ ২ মেগাবাইট হতে পারবে");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const d = (await res.json()) as { url?: string; error?: string };
    setUploading("");
    if (!res.ok || !d.url) {
      setError(d.error || "আপলোড ব্যর্থ হয়েছে");
      return;
    }
    if (kind === "logo") {
      set("brand_logo_url", d.url);
      set("brand_show_logo", "1");
    } else {
      set("favicon_url", d.url);
    }
    setSuccess(
      kind === "logo" ? "লোগো আপলোড হয়েছে, সেভ করুন" : "ফ্যাভিকন আপলোড হয়েছে, সেভ করুন",
    );
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
    if (!res.ok) {
      setError("সংরক্ষণ ব্যর্থ হয়েছে");
      return;
    }
    setSuccess("ব্র্যান্ডিং সংরক্ষিত। পুরো সাইটে সাথে সাথে দেখা যাবে।");
    setTimeout(() => setSuccess(""), 4000);
  };

  const removeLogo = () => {
    set("brand_logo_url", "");
    setSuccess("লোগো সরানো হয়েছে (সেভ করুন)");
  };

  const num = (key: string, fallback: number) => {
    const n = Number(v[key]);
    return Number.isFinite(n) && v[key] !== "" ? n : fallback;
  };

  const width = num("brand_logo_width", 38);
  const height = num("brand_logo_height", 38);
  const x = num("brand_logo_x", 0);
  const y = num("brand_logo_y", 0);
  const radius = num("brand_logo_radius", 10);
  const nameSize = num("brand_name_size", 20);
  const logoUrl = v.brand_logo_url ?? "";
  const showLogo = v.brand_show_logo !== "0";
  const showText = v.brand_show_text !== "0";
  const showTagline = v.brand_show_tagline !== "0";
  const favText = v.favicon_text ?? "L";
  const favBg = v.favicon_bg || "#E51A24";
  const favColor = v.favicon_color || "#FFFFFF";
  const favUrl = v.favicon_url ?? "";

  const input =
    "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#E51A24] focus:ring-2 focus:ring-red-100";

  const range = (
    label: string,
    key: string,
    fallback: number,
    min: number,
    max: number,
    step = 1,
  ) => (
    <div>
      <label className="flex items-center justify-between text-sm font-medium">
        {label}
        <span className="font-mono text-xs text-[#6C757D]">{num(key, fallback)}px</span>
      </label>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={num(key, fallback)}
          onChange={(e) => set(key, e.target.value)}
          className="flex-1 accent-[#E51A24]"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={num(key, fallback)}
          onChange={(e) => set(key, e.target.value)}
          className="w-20 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card rounded-lg p-6">
            <div className="shimmer h-5 w-1/3 rounded" />
            <div className="shimmer mt-4 h-24 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ব্র্যান্ডিং: লোগো ও ফ্যাভিকন</h1>
          <p className="mt-1 text-sm text-[#6C757D]">
            PC থেকে লোগো/ফ্যাভিকন আপলোড, আকার ও X-Y অবস্থান নিয়ন্ত্রণ
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="btn-red rounded-md px-6 py-2.5 text-sm font-bold disabled:opacity-60"
        >
          {saving ? "সংরক্ষণ হচ্ছে…" : "সব সংরক্ষণ করুন"}
        </button>
      </div>

      {error && (
        <p className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>
      )}
      {success && (
        <p className="rounded-md bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          {success}
        </p>
      )}

      {/* live header preview */}
      <section className="card rounded-lg p-6">
        <h2 className="font-bold">লাইভ হেডার প্রিভিউ</h2>
        <p className="mt-1 text-xs text-[#6C757D]">
          ঠিক যেমনটি ওয়েবসাইটের নেভিগেশনে দেখা যাবে
        </p>
        <div className="mt-4 flex items-center justify-between rounded-md border border-black/10 bg-white px-5 py-4">
          <div className="flex items-center gap-2.5">
            {showLogo &&
              (logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="logo"
                  style={{
                    width,
                    height,
                    borderRadius: radius,
                    objectFit: "contain",
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                />
              ) : (
                <span
                  style={{
                    display: "block",
                    width,
                    height,
                    borderRadius: radius,
                    overflow: "hidden",
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                >
                  <LogoMark size={Math.min(width, height)} />
                </span>
              ))}
            {showText && (
              <span className="flex flex-col leading-none">
                <span
                  className="font-extrabold tracking-tight text-[#1A1A1A]"
                  style={{ fontFamily: "Manrope, sans-serif", fontSize: nameSize }}
                >
                  {v.brand_name || "LHBD"}
                  <span className="text-[#E51A24]">{v.brand_name_accent ?? "."}</span>
                </span>
                {showTagline && (
                  <span className="mt-1 text-[10px] font-medium tracking-[0.18em] text-[#6C757D]">
                    {v.brand_tagline || "মক টেস্ট প্ল্যাটফর্ম"}
                  </span>
                )}
              </span>
            )}
          </div>
          <span className="rounded-md bg-[#E51A24] px-4 py-2 text-xs font-bold text-white">
            ফ্রি টেস্ট দিন
          </span>
        </div>
      </section>

      {/* logo uploader */}
      <section className="card rounded-lg p-6">
        <h2 className="font-bold">লোগো (PC থেকে আপলোড)</h2>
        <p className="mt-1 text-xs text-[#6C757D]">
          PNG, JPG, SVG বা WebP। স্বচ্ছ (transparent) PNG সবচেয়ে ভালো দেখায়।
        </p>
        <input
          ref={logoRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f, "logo");
            e.target.value = "";
          }}
        />
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            onClick={() => logoRef.current?.click()}
            disabled={uploading === "logo"}
            className="flex items-center gap-2 rounded-md border border-slate-300 px-5 py-2.5 text-sm font-bold disabled:opacity-50"
          >
            <Icon name="plus" size={15} />
            {uploading === "logo" ? "আপলোড হচ্ছে…" : "লোগো ফাইল বেছে নিন"}
          </button>
          {logoUrl && (
            <button
              onClick={removeLogo}
              className="flex items-center gap-1.5 rounded-md bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600"
            >
              <Icon name="trash" size={14} /> লোগো সরান (ডিফল্ট ব্যবহার)
            </button>
          )}
          {logoUrl && (
            <span className="break-all font-mono text-[11px] text-[#6C757D]">{logoUrl}</span>
          )}
        </div>

        <label className="mt-5 flex items-center gap-2.5 text-sm font-semibold">
          <input
            type="checkbox"
            checked={showLogo}
            onChange={(e) => set("brand_show_logo", e.target.checked ? "1" : "0")}
            className="h-4 w-4 accent-[#E51A24]"
          />
          লোগো মার্ক দেখাও
        </label>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            {range("প্রস্থ (Width)", "brand_logo_width", 38, 16, 160)}
            <div className="mt-3 flex flex-wrap gap-2">
              {LOGO_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    set("brand_logo_width", String(s));
                    set("brand_logo_height", String(s));
                  }}
                  className={`rounded border px-2.5 py-1 text-xs font-bold ${
                    width === s && height === s
                      ? "border-[#E51A24] bg-red-50 text-[#E51A24]"
                      : "border-slate-300 text-slate-700"
                  }`}
                >
                  {s}px
                </button>
              ))}
            </div>
          </div>
          {range("উচ্চতা (Height)", "brand_logo_height", 38, 16, 160)}
          {range("অনুভূমিক অবস্থান X", "brand_logo_x", 0, -60, 60)}
          {range("উল্লম্ব অবস্থান Y", "brand_logo_y", 0, -60, 60)}
          {range("কোণা বাঁক (Radius)", "brand_logo_radius", 10, 0, 60)}
          <div className="flex items-end">
            <button
              onClick={() => {
                set("brand_logo_x", "0");
                set("brand_logo_y", "0");
                set("brand_logo_width", "38");
                set("brand_logo_height", "38");
                set("brand_logo_radius", "10");
              }}
              className="rounded-md border border-slate-300 px-4 py-2.5 text-xs font-bold"
            >
              পজিশন ও সাইজ রিসেট
            </button>
          </div>
        </div>
      </section>

      {/* brand text */}
      <section className="card rounded-lg p-6">
        <h2 className="font-bold">ব্র্যান্ড নাম ও ট্যাগলাইন</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium">ব্র্যান্ড নাম</label>
            <input
              value={v.brand_name ?? ""}
              onChange={(e) => set("brand_name", e.target.value)}
              placeholder="LHBD"
              className={input}
            />
          </div>
          <div>
            <label className="text-sm font-medium">অ্যাকসেন্ট চিহ্ন</label>
            <input
              value={v.brand_name_accent ?? ""}
              onChange={(e) => set("brand_name_accent", e.target.value)}
              placeholder="."
              className={input}
            />
          </div>
          <div>
            <label className="text-sm font-medium">নামের ফন্ট সাইজ</label>
            <input
              type="number"
              min={12}
              max={42}
              value={nameSize}
              onChange={(e) => set("brand_name_size", e.target.value)}
              className={input}
            />
          </div>
          <div className="sm:col-span-3">
            <label className="text-sm font-medium">ট্যাগলাইন</label>
            <input
              value={v.brand_tagline ?? ""}
              onChange={(e) => set("brand_tagline", e.target.value)}
              placeholder="মক টেস্ট প্ল্যাটফর্ম"
              className={input}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2.5 text-sm font-semibold">
            <input
              type="checkbox"
              checked={showText}
              onChange={(e) => set("brand_show_text", e.target.checked ? "1" : "0")}
              className="h-4 w-4 accent-[#E51A24]"
            />
            ব্র্যান্ড নাম দেখাও
          </label>
          <label className="flex items-center gap-2.5 text-sm font-semibold">
            <input
              type="checkbox"
              checked={showTagline}
              onChange={(e) => set("brand_show_tagline", e.target.checked ? "1" : "0")}
              className="h-4 w-4 accent-[#E51A24]"
            />
            ট্যাগলাইন দেখাও
          </label>
        </div>
      </section>

      {/* favicon */}
      <section className="card rounded-lg p-6">
        <h2 className="font-bold">ফ্যাভিকন (ব্রাউজার ট্যাব আইকন)</h2>
        <p className="mt-1 text-xs text-[#6C757D]">
          নিজের ছবি আপলোড করুন, অথবা লেখা দিয়ে অটোমেটিক ফ্যাভিকন বানান।
        </p>
        <input
          ref={favRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f, "favicon");
            e.target.value = "";
          }}
        />
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => favRef.current?.click()}
                disabled={uploading === "favicon"}
                className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-bold disabled:opacity-50"
              >
                <Icon name="plus" size={15} />
                {uploading === "favicon" ? "আপলোড হচ্ছে…" : "ফ্যাভিকন ছবি আপলোড"}
              </button>
              {favUrl && (
                <button
                  onClick={() => set("favicon_url", "")}
                  className="flex items-center gap-1.5 rounded-md bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600"
                >
                  <Icon name="trash" size={14} /> আপলোড করা আইকন সরান
                </button>
              )}
            </div>
            <div className="mt-5">
              <label className="text-sm font-medium">ফ্যাভিকন লেখা (সর্বোচ্চ ৩ অক্ষর)</label>
              <input
                value={favText}
                maxLength={3}
                onChange={(e) => set("favicon_text", e.target.value)}
                placeholder="L"
                className={input}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">ব্যাকগ্রাউন্ড</label>
                <span className="mt-1.5 flex items-center gap-2 rounded-md border border-slate-300 p-2">
                  <input
                    type="color"
                    value={favBg}
                    onChange={(e) => set("favicon_bg", e.target.value)}
                    className="h-9 w-12 cursor-pointer border-0 bg-transparent"
                  />
                  <span className="font-mono text-xs">{favBg}</span>
                </span>
              </div>
              <div>
                <label className="text-sm font-medium">লেখার রং</label>
                <span className="mt-1.5 flex items-center gap-2 rounded-md border border-slate-300 p-2">
                  <input
                    type="color"
                    value={favColor}
                    onChange={(e) => set("favicon_color", e.target.value)}
                    className="h-9 w-12 cursor-pointer border-0 bg-transparent"
                  />
                  <span className="font-mono text-xs">{favColor}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 rounded-md bg-[#F8F9FA] p-6">
            <p className="text-xs font-bold text-[#6C757D]">প্রিভিউ</p>
            {favUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={favUrl}
                alt="favicon"
                style={{ width: 72, height: 72, borderRadius: 14, objectFit: "cover" }}
              />
            ) : (
              <span
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 14,
                  background: favBg,
                  color: favColor,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "Manrope, sans-serif",
                  fontWeight: 800,
                  fontSize: favText.length >= 3 ? 26 : favText.length === 2 ? 32 : 40,
                }}
              >
                {favText || "L"}
              </span>
            )}
            <div className="flex items-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2">
              {favUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={favUrl} alt="" style={{ width: 16, height: 16, objectFit: "contain" }} />
              ) : (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: favBg,
                    color: favColor,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 9,
                    fontWeight: 800,
                  }}
                >
                  {(favText || "L").slice(0, 1)}
                </span>
              )}
              <span className="text-xs font-semibold">LHBD | মক টেস্ট</span>
              <span className="text-[#6C757D]">✕</span>
            </div>
            <p className="text-[11px] text-[#6C757D]">ব্রাউজার ট্যাবে এভাবে দেখা যাবে</p>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="btn-red rounded-md px-8 py-3 text-sm font-bold disabled:opacity-60"
        >
          {saving ? "সংরক্ষণ হচ্ছে…" : "সব সংরক্ষণ করুন"}
        </button>
      </div>
    </div>
  );
}
