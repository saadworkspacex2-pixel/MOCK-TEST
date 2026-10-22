"use client";

import SpringHeading from "@/components/SpringHeading";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";

type UploadKind = "logo" | "favicon";

export default function BrandingStudio() {
  const [v, setV] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<UploadKind | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d: Record<string, string>) => setV(d))
      .catch(() => setError("সেটিংস লোড করা যায়নি"))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, value: string) =>
    setV((old) => ({ ...old, [key]: value }));

  const upload = async (file: File, kind: UploadKind) => {
    if (!file.type.startsWith("image/") && !file.name.endsWith(".ico")) {
      setError("ছবি, SVG, PNG, JPG, WEBP বা ICO ফাইল বেছে নিন");
      return;
    }
    setUploading(kind);
    setError("");
    setSuccess("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = (await res.json()) as { url?: string; error?: string };
    setUploading(null);
    if (!res.ok || !data.url) {
      setError(data.error || "আপলোড ব্যর্থ হয়েছে");
      return;
    }
    set(kind === "logo" ? "logo_url" : "favicon_url", data.url);
    setSuccess(`${kind === "logo" ? "লোগো" : "Favicon"} আপলোড হয়েছে। এখন সংরক্ষণ করুন।`);
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
    setSuccess("ব্র্যান্ডিং সংরক্ষিত। পাবলিক সাইট রিলোড করলেই বদল দেখা যাবে।");
  };

  const input =
    "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#E51A24] focus:ring-2 focus:ring-red-100";
  const logoWidth = Number(v.logo_width || 44);
  const logoHeight = Number(v.logo_height || 44);
  const logoX = Number(v.logo_x || 0);
  const logoY = Number(v.logo_y || 0);

  if (loading) {
    return (
      <div className="card rounded-lg p-6">
        <div className="shimmer h-6 w-1/3 rounded" />
        <div className="shimmer mt-5 h-28 rounded" />
        <div className="shimmer mt-3 h-40 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <SpringHeading as="h1" className="text-2xl font-bold">লোগো ও Favicon স্টুডিও</SpringHeading>
          <p className="mt-1 text-sm text-[#6C757D]">
            PC থেকে আপলোড করুন, সাইজ ও অবস্থান ঠিক করুন, ব্রাউজার ট্যাবের লেখা বদলান
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="btn-red rounded-md px-6 py-2.5 text-sm font-bold disabled:opacity-60"
        >
          {saving ? "সংরক্ষণ হচ্ছে…" : "সব বদল সংরক্ষণ"}
        </button>
      </div>

      {error && <p className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}
      {success && <p className="rounded-md bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{success}</p>}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card rounded-lg p-6">
          <SpringHeading as="h2" className="font-bold">মূল লোগো</SpringHeading>
          <p className="mt-1 text-sm text-[#6C757D]">Navbar ও Footer-এ ব্যবহৃত হবে। PNG/SVG transparent logo সবচেয়ে ভালো।</p>
          <input
            ref={logoRef}
            type="file"
            accept="image/*,.ico"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file, "logo");
              e.target.value = "";
            }}
          />
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => logoRef.current?.click()}
              disabled={uploading === "logo"}
              className="btn-ink flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold disabled:opacity-60"
            >
              <Icon name="plus" size={15} />
              {uploading === "logo" ? "আপলোড হচ্ছে…" : "PC থেকে লোগো আপলোড"}
            </button>
            {v.logo_url && (
              <button
                onClick={() => set("logo_url", "")}
                className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold"
              >
                ডিফল্ট লোগোতে ফিরুন
              </button>
            )}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Logo Width (px)</label>
              <input type="number" min={20} max={500} value={logoWidth} onChange={(e) => set("logo_width", e.target.value)} className={input} />
              <input type="range" min={20} max={300} value={Math.min(300, logoWidth)} onChange={(e) => set("logo_width", e.target.value)} className="mt-2 w-full accent-[#E51A24]" />
            </div>
            <div>
              <label className="text-sm font-semibold">Logo Height (px)</label>
              <input type="number" min={20} max={300} value={logoHeight} onChange={(e) => set("logo_height", e.target.value)} className={input} />
              <input type="range" min={20} max={200} value={Math.min(200, logoHeight)} onChange={(e) => set("logo_height", e.target.value)} className="mt-2 w-full accent-[#E51A24]" />
            </div>
            <div>
              <label className="text-sm font-semibold">X Position (বাঁ/ডান)</label>
              <input type="number" min={-200} max={200} value={logoX} onChange={(e) => set("logo_x", e.target.value)} className={input} />
              <input type="range" min={-100} max={100} value={Math.max(-100, Math.min(100, logoX))} onChange={(e) => set("logo_x", e.target.value)} className="mt-2 w-full accent-[#E51A24]" />
            </div>
            <div>
              <label className="text-sm font-semibold">Y Position (উপরে/নিচে)</label>
              <input type="number" min={-200} max={200} value={logoY} onChange={(e) => set("logo_y", e.target.value)} className={input} />
              <input type="range" min={-100} max={100} value={Math.max(-100, Math.min(100, logoY))} onChange={(e) => set("logo_y", e.target.value)} className="mt-2 w-full accent-[#E51A24]" />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Image Fit</label>
              <select value={v.logo_object_fit || "contain"} onChange={(e) => set("logo_object_fit", e.target.value)} className={input}>
                <option value="contain">Contain (ছবি না কেটে)</option>
                <option value="cover">Cover (ফ্রেম ভরে)</option>
                <option value="fill">Fill (Stretch)</option>
              </select>
            </div>
            <label className="flex items-end gap-2 pb-3 text-sm font-bold">
              <input type="checkbox" checked={v.logo_show_text !== "0"} onChange={(e) => set("logo_show_text", e.target.checked ? "1" : "0")} className="h-4 w-4 accent-[#E51A24]" />
              লোগোর পাশে টেক্সট দেখান
            </label>
          </div>
        </section>

        <section className="card rounded-lg p-6">
          <SpringHeading as="h2" className="font-bold">লাইভ লোগো প্রিভিউ</SpringHeading>
          <div className="mt-5 space-y-4">
            <div className="rounded-lg border border-black/[0.07] bg-white p-6">
              <div className="flex items-center gap-3">
                {v.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.logo_url}
                    alt="Logo preview"
                    className="shrink-0"
                    style={{
                      width: `${logoWidth}px`,
                      height: `${logoHeight}px`,
                      objectFit: (v.logo_object_fit || "contain") as "contain" | "cover" | "fill",
                      transform: `translate(${logoX}px, ${logoY}px)`,
                    }}
                  />
                ) : (
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E51A24] text-lg font-bold text-white">L</span>
                )}
                {v.logo_show_text !== "0" && (
                  <span>
                    <span className="block text-xl font-extrabold">{v.logo_text || v.site_name || "LHBD"}</span>
                    <span className="block text-[10px] tracking-[0.18em] text-[#6C757D]">{v.logo_tagline || "মক টেস্ট প্ল্যাটফর্ম"}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-lg bg-[#1A1A1A] p-6">
              <div className="flex items-center gap-3">
                {v.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.logo_url} alt="Dark logo preview" className="shrink-0" style={{ width: `${logoWidth}px`, height: `${logoHeight}px`, objectFit: (v.logo_object_fit || "contain") as "contain" | "cover" | "fill", transform: `translate(${logoX}px, ${logoY}px)` }} />
                ) : (
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E51A24] text-lg font-bold text-white">L</span>
                )}
                {v.logo_show_text !== "0" && <span className="text-xl font-extrabold text-white">{v.logo_text || v.site_name || "LHBD"}</span>}
              </div>
            </div>
            <p className="text-xs text-[#6C757D]">বর্তমান: W {logoWidth}px · H {logoHeight}px · X {logoX}px · Y {logoY}px</p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">লোগোর পাশের লেখা</label>
              <input value={v.logo_text || ""} onChange={(e) => set("logo_text", e.target.value)} placeholder="LHBD" className={input} />
            </div>
            <div>
              <label className="text-sm font-semibold">ছোট ট্যাগলাইন</label>
              <input value={v.logo_tagline || ""} onChange={(e) => set("logo_tagline", e.target.value)} placeholder="মক টেস্ট প্ল্যাটফর্ম" className={input} />
            </div>
          </div>
        </section>
      </div>

      <section className="card rounded-lg p-6">
        <SpringHeading as="h2" className="font-bold">Favicon ও ব্রাউজার ট্যাব</SpringHeading>
        <p className="mt-1 text-sm text-[#6C757D]">32×32 বা 64×64 PNG/ICO/SVG ব্যবহার করুন।</p>
        <input
          ref={faviconRef}
          type="file"
          accept="image/*,.ico"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file, "favicon");
            e.target.value = "";
          }}
        />
        <div className="mt-5 grid items-end gap-5 md:grid-cols-[1fr_auto_auto]">
          <div>
            <label className="text-sm font-semibold">ব্রাউজার ট্যাবের লেখা (Favicon Text / Page Title)</label>
            <input value={v.browser_title || ""} onChange={(e) => set("browser_title", e.target.value)} placeholder="LHBD | মক টেস্ট অনলাইন" className={input} />
          </div>
          <button onClick={() => faviconRef.current?.click()} disabled={uploading === "favicon"} className="btn-red rounded-md px-5 py-2.5 text-sm font-bold disabled:opacity-60">
            {uploading === "favicon" ? "আপলোড হচ্ছে…" : "Favicon আপলোড"}
          </button>
          {v.favicon_url && <button onClick={() => set("favicon_url", "")} className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold">মুছুন</button>}
        </div>
        <div className="mt-5 flex items-center gap-3 rounded-lg border border-black/[0.07] bg-[#F8F9FA] p-4">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-black/10 bg-white">
            {v.favicon_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.favicon_url} alt="Favicon preview" className="h-7 w-7 object-contain" />
            ) : (
              <span className="text-xs font-bold text-[#6C757D]">ICO</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="h-2 w-1/2 rounded-full bg-slate-200" />
            <p className="mt-2 truncate text-xs font-semibold">{v.browser_title || v.seo_title || "LHBD"}</p>
          </div>
          <span className="text-xs text-[#6C757D]">Browser Tab Preview</span>
        </div>
      </section>
    </div>
  );
}
