import { db } from "@/db";
import { settings } from "@/db/schema";

export const DEFAULT_SETTINGS: Record<string, string> = {
  site_name: "LHBD",
  seo_title: "LHBD | মক টেস্ট অনলাইন, আসল স্ক্রিন, সঙ্গে সঙ্গে স্কোর",
  seo_description:
    "কম্পিউটার-ডেলিভার্ড পরীক্ষার মতো স্ক্রিনে Reading, Listening, Writing ও Grammar মক টেস্ট। জমা দেওয়ার সঙ্গে সঙ্গেই ব্যান্ড স্কোর, ব্যাখ্যাসহ উত্তর ও লিডারবোর্ড, সব ফ্রি।",
  seo_keywords:
    "মক টেস্ট, mock test, reading test, listening test, writing task, band score, অনলাইন পরীক্ষা",
  hero_badge: "লাইভ টেস্ট চলছে এখন",
  hero_title_1: "মক টেস্ট অনলাইনে।",
  hero_title_2: "আসল স্ক্রিন,",
  hero_title_accent: "সঙ্গে সঙ্গে স্কোর",
  hero_subtitle:
    "কম্পিউটার-ডেলিভার্ড পরীক্ষার মতোই স্ক্রিন। একই ঘড়ি, একই রিভিউ প্যালেট। Reading ও Listening জমা দেওয়ার সঙ্গে সঙ্গেই ব্যান্ড স্কোর, Writing দেখেন ইনস্ট্রাক্টর। সবকিছু ফ্রি।",
  footer_about:
    "কম্পিউটার-ডেলিভার্ড পরীক্ষার মতো স্ক্রিনে Reading, Listening, Writing ও Grammar মক টেস্ট। জমা দেওয়ার সঙ্গে সঙ্গেই ব্যান্ড স্কোর, ব্যাখ্যাসহ উত্তর আর লিডারবোর্ড, সম্পূর্ণ ফ্রি।",
  cta_title: "আজই প্রস্তুতি শুরু করুন",
  cta_subtitle:
    "রেজিস্ট্রেশন নেই, খরচ নেই। নাম লিখে এক ক্লিকেই আসল পরীক্ষার স্ক্রিনে।",
  header_code: "",
  footer_code: "",
  // ---- Branding: logo, favicon, positioning ----
  brand_show_logo: "1",
  brand_logo_url: "",
  brand_logo_width: "38",
  brand_logo_height: "38",
  brand_logo_x: "0",
  brand_logo_y: "0",
  brand_logo_radius: "10",
  brand_show_text: "1",
  brand_name: "LHBD",
  brand_name_accent: ".",
  brand_name_size: "20",
  brand_tagline: "মক টেস্ট প্ল্যাটফর্ম",
  brand_show_tagline: "1",
  // ---- Favicon ----
  favicon_url: "",
  favicon_bg: "#E51A24",
  favicon_color: "#FFFFFF",
  favicon_text: "L",
};

export type Branding = {
  showLogo: boolean;
  logoUrl: string;
  width: number;
  height: number;
  x: number;
  y: number;
  radius: number;
  showText: boolean;
  name: string;
  nameAccent: string;
  nameSize: number;
  tagline: string;
  showTagline: boolean;
};

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function brandingFrom(s: Record<string, string>): Branding {
  return {
    showLogo: s.brand_show_logo !== "0",
    logoUrl: s.brand_logo_url || "",
    width: num(s.brand_logo_width, 38),
    height: num(s.brand_logo_height, 38),
    x: num(s.brand_logo_x, 0),
    y: num(s.brand_logo_y, 0),
    radius: num(s.brand_logo_radius, 10),
    showText: s.brand_show_text !== "0",
    name: s.brand_name || "LHBD",
    nameAccent: s.brand_name_accent ?? ".",
    nameSize: num(s.brand_name_size, 20),
    tagline: s.brand_show_tagline === "0" ? "" : s.brand_tagline || "",
    showTagline: s.brand_show_tagline !== "0",
  };
}

export async function getBranding(): Promise<Branding> {
  return brandingFrom(await getSettings());
}

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await db.select().from(settings);
    const map = { ...DEFAULT_SETTINGS };
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
