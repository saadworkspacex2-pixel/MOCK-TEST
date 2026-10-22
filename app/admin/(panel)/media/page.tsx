"use client";

import SpringHeading from "@/components/SpringHeading";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { toBn } from "@/components/CountUp";

type MediaItem = { id: number; filename: string; mime: string; bytes: number; url: string; createdAt: string };

function human(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function MediaLibrary() {
  const [rows, setRows] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/media");
    const data = (await res.json()) as MediaItem[];
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const d = (await res.json()) as { error?: string };
    setUploading(false);
    if (!res.ok) { setError(d.error || "আপলোড ব্যর্থ"); return; }
    setSuccess("ফাইল আপলোড হয়েছে");
    await load();
  };

  const filtered = rows.filter((r) =>
    r.filename.toLowerCase().includes(q.toLowerCase()) &&
    (type === "all" || (type === "font" ? r.mime.startsWith("font/") || r.mime === "application/octet-stream" : r.mime.startsWith(type))),
  );
  const totalBytes = rows.reduce((a, r) => a + r.bytes, 0);

  if (loading) return <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="card rounded-lg p-4"><div className="shimmer h-28 rounded" /><div className="shimmer mt-3 h-4 w-2/3 rounded" /></div>)}</div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <SpringHeading as="h1" className="text-2xl font-bold">মিডিয়া লাইব্রেরি</SpringHeading>
          <p className="mt-1 text-sm text-[#6C757D]">{toBn(rows.length)}টি ফাইল · মোট {human(totalBytes)}</p>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-red flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-bold disabled:opacity-60">
          <Icon name="plus" size={15} />{uploading ? "আপলোড হচ্ছে…" : "ফাইল আপলোড"}
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      </div>
      {error && <p className="mt-4 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}
      {success && <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">{success}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ফাইল খুঁজুন…" className="rounded-md border border-slate-300 px-4 py-2.5 text-sm" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border border-slate-300 px-4 py-2.5 text-sm">
          <option value="all">সব ধরন</option><option value="image">ছবি</option><option value="audio">অডিও</option><option value="application/pdf">PDF</option><option value="font">ফন্ট</option>
        </select>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <div key={r.id} className="card overflow-hidden rounded-lg">
            <div className="grid h-32 place-items-center bg-[#F8F9FA]">
              {r.mime.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.url} alt={r.filename} className="h-full w-full object-cover" />
              ) : r.mime.startsWith("audio/") ? (
                <audio controls src={r.url} className="w-11/12" />
              ) : (
                <Icon name={r.mime === "application/pdf" ? "doc" : "book"} size={36} className="text-[#6C757D]" />
              )}
            </div>
            <div className="p-4">
              <p className="truncate text-sm font-bold" title={r.filename}>{r.filename}</p>
              <p className="mt-1 text-xs text-[#6C757D]">{r.mime} · {human(r.bytes)}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={async () => { await navigator.clipboard.writeText(`${location.origin}${r.url}`); setSuccess("লিংক কপি হয়েছে"); }} className="rounded bg-slate-100 px-3 py-1.5 text-xs font-bold">লিংক কপি</button>
                <a href={r.url} target="_blank" className="rounded bg-slate-100 px-3 py-1.5 text-xs font-bold">খুলুন</a>
                <button onClick={async () => { if (!confirm("ফাইলটি মুছবেন?")) return; await fetch(r.url, { method: "DELETE" }); await load(); }} className="rounded bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600">মুছুন</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="col-span-full rounded-lg border border-dashed border-slate-300 py-14 text-center text-sm text-[#6C757D]">কোনো ফাইল নেই।</p>}
      </div>
    </div>
  );
}
