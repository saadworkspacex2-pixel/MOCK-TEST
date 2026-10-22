"use client";

import SpringHeading from "@/components/SpringHeading";

import { useEffect, useState } from "react";

type R = {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  url: string;
};

const emptyForm = {
  title: "",
  description: "",
  category: "সাধারণ জ্ঞান",
  type: "article",
  url: "",
};

export default function AdminResourcesPage() {
  const [rows, setRows] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    fetch("/api/resources")
      .then((r) => r.json())
      .then(setRows)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const save = async () => {
    if (!form.title.trim()) {
      setError("শিরোনাম লিখুন");
      return;
    }
    setSaving(true);
    const res = await fetch(
      editingId ? `/api/resources/${editingId}` : "/api/resources",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );
    setSaving(false);
    if (!res.ok) {
      setError("সংরক্ষণ ব্যর্থ হয়েছে");
      return;
    }
    reset();
    await load();
  };

  const remove = async (r: R) => {
    if (!confirm(`"${r.title}" মুছে ফেলবেন?`)) return;
    await fetch(`/api/resources/${r.id}`, { method: "DELETE" });
    if (editingId === r.id) reset();
    await load();
  };

  const input =
    "mt-1.5 w-full rounded-md border border-slate-300 bg-[#F8F9FA] px-4 py-2.5 text-sm outline-none transition focus:border-[#E51A24] focus:ring-2 focus:ring-red-100";

  return (
    <div>
      <div className="anim-fade-up">
        <SpringHeading as="h1" className="text-2xl font-bold">রিসোর্স ম্যানেজ</SpringHeading>
        <p className="mt-1 text-sm text-[#6C757D]">
          নোট, পিডিএফ, ভিডিও ও আর্টিকেল যোগ এবং সম্পাদনা করুন
        </p>
      </div>

      <div className="anim-fade-up delay-100 mt-7 rounded-lg border border-black/[0.07] card p-7">
        <SpringHeading as="h2" className="font-semibold">
          {editingId ? `রিসোর্স #${editingId} সম্পাদনা` : "নতুন রিসোর্স"}
        </SpringHeading>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              শিরোনাম *
            </label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="যেমন: বাংলা ব্যাকরণ শর্টকাট নোট"
              className={input}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">বিবরণ</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              className={input}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">বিভাগ</label>
            <input
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className={input}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">ধরন</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className={input}
            >
              <option value="article">আর্টিকেল</option>
              <option value="pdf">পিডিএফ</option>
              <option value="video">ভিডিও</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">লিংক</label>
            <input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://…"
              className={input}
            />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md btn-red px-6 py-2.5 text-sm font-bold text-white transition disabled:opacity-60"
          >
            {saving ? "সংরক্ষণ হচ্ছে…" : editingId ? "আপডেট " : "যোগ করুন "}
          </button>
          {editingId && (
            <button
              onClick={reset}
              className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              বাতিল
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card rounded-lg p-5">
              <div className="shimmer h-4 w-1/2 rounded" />
              <div className="shimmer mt-2.5 h-3 w-1/3 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-7 space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/[0.07] card px-6 py-4 transition hover:border-slate-300"
            >
              <div className="min-w-0">
                <p className="font-semibold">{r.title}</p>
                <p className="mt-0.5 text-xs text-[#6C757D]">
                  {r.category} •{" "}
                  {r.type === "pdf"
                    ? "পিডিএফ"
                    : r.type === "video"
                      ? "ভিডিও"
                      : "আর্টিকেল"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(r.id);
                    setForm({
                      title: r.title,
                      description: r.description,
                      category: r.category,
                      type: r.type,
                      url: r.url,
                    });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-200"
                >
                  সম্পাদনা
                </button>
                <button
                  onClick={() => remove(r)}
                  className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  মুছুন
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 py-14 text-center text-sm text-[#6C757D]">
              কোনো রিসোর্স নেই।
            </p>
          )}
        </div>
      )}
    </div>
  );
}
