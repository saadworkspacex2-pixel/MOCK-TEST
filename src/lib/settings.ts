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
};

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
