"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

const FIELDS: Array<{
  key: string;
  label: string;
  hint?: string;
  rows?: number;
  group: string;
}> = [
  { group: "SEO", key: "seo_title", label: "SEO টাইটেল (ব্রাউজার ট্যাব ও সার্চে দেখায়)" },
  { group: "SEO", key: "seo_description", label: "SEO মেটা ডেসক্রিপশন", rows: 3 },
  { group: "SEO", key: "seo_keywords", label: "SEO কীওয়ার্ড (কমা দিয়ে আলাদা)", rows: 2 },
  { group: "SEO", key: "site_name", label: "সাইটের নাম" },
  { group: "হোমপেজ", key: "hero_badge", label: "হিরো ব্যাজ টেক্সট" },
  { group: "হোমপেজ", key: "hero_title_1", label: "হেডলাইন, লাইন ১" },
  { group: "হোমপেজ", key: "hero_title_2", label: "হেডলাইন, লাইন ২" },
  { group: "হোমপেজ", key: "hero_title_accent", label: "হেডলাইন, লাল অংশ" },
  { group: "হোমপেজ", key: "hero_subtitle", label: "হিরো সাবটাইটেল", rows: 3 },
  { group: "হোমপেজ", key: "cta_title", label: "CTA শিরোনাম" },
  { group: "হোমপেজ", key: "cta_subtitle", label: "CTA সাবটাইটেল", rows: 2 },
  { group: "ফুটার", key: "footer_about", label: "ফুটার পরিচিতি", rows: 3 },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setValues(d))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    const body = { ...values };
    if (customKey.trim()) body[customKey.trim()] = customValue;
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      setNotice("সংরক্ষিত হয়েছে। সাইটে সাথে সাথেই কার্যকর।");
      setCustomKey("");
      setCustomValue("");
      setTimeout(() => setNotice(""), 3000);
    } else {
      setNotice("সংরক্ষণ ব্যর্থ হয়েছে");
    }
  };

  const input =
    "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#E51A24] focus:ring-2 focus:ring-red-100";

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card rounded-lg p-5">
            <div className="shimmer h-4 w-1/3 rounded" />
            <div className="shimmer mt-2.5 h-9 w-full rounded" />
          </div>
        ))}
      </div>
    );
  }

  const groups = Array.from(new Set(FIELDS.map((f) => f.group)));

  return (
    <div>
      <div className="anim-fade-up flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">সেটিংস</h1>
          <p className="mt-1 text-sm text-[#6C757D]">
            SEO, হেডলাইন, বর্ণনাসহ সাইটের যেকোনো টেক্সট এখান থেকে বদলান
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

      {notice && (
        <p className="anim-fade-in mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          {notice}
        </p>
      )}

      <div className="mt-7 space-y-8">
        {groups.map((g) => (
          <section key={g} className="card rounded-lg p-7">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Icon
                name={g === "SEO" ? "globe" : g === "ফুটার" ? "doc" : "screen"}
                size={18}
                className="text-[#E51A24]"
              />
              {g}
            </h2>
            <div className="mt-5 space-y-4">
              {FIELDS.filter((f) => f.group === g).map((f) => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-slate-700">
                    {f.label}
                  </label>
                  {f.rows ? (
                    <textarea
                      rows={f.rows}
                      value={values[f.key] ?? ""}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, [f.key]: e.target.value }))
                      }
                      className={input}
                    />
                  ) : (
                    <input
                      value={values[f.key] ?? ""}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, [f.key]: e.target.value }))
                      }
                      className={input}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* custom key-value */}
        <section className="card rounded-lg p-7">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Icon name="plus" size={18} className="text-[#E51A24]" />
            কাস্টম সেটিং যোগ করুন
          </h2>
          <p className="mt-1 text-sm text-[#6C757D]">
            নতুন কী-ভ্যালু যোগ করলে তা সেটিংস API-তে পাওয়া যাবে।
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">কী</label>
              <input
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="contact_email"
                className={input}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">মান</label>
              <input
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="hello@example.com"
                className={input}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
