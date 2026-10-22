import SpringHeading from "@/components/SpringHeading";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicSections from "@/components/DynamicSections";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "প্রাইভেসি পলিসি | LHBD",
};

const SECTIONS = [
  {
    h: "১. আমরা যা সংগ্রহ করি",
    p: "টেস্ট দেওয়ার সময় আপনি যে নাম লেখেন, আপনার উত্তর, স্কোর, সময় ও জমা দেওয়ার তারিখ সংরক্ষিত হয়। Writing টেস্টে আপনার লেখা জমা থাকে, যাতে ইনস্ট্রাক্টর তা মূল্যায়ন করতে পারেন। এর বাইরে কোনো ব্যক্তিগত তথ্য (ইমেইল, ফোন, ঠিকানা) আমরা চাই না বা রাখি না।",
  },
  {
    h: "২. তথ্য যেভাবে ব্যবহৃত হয়",
    p: "সংগৃহীত তথ্য শুধু ফলাফল দেখানো, লিডারবোর্ড তৈরি ও প্ল্যাটফর্মের মান উন্নয়নে ব্যবহৃত হয়। আপনার নাম ও স্কোর লিডারবোর্ডে প্রকাশ্যে দেখা যায়; প্রকাশ্যে দেখাতে না চাইলে ছদ্মনাম ব্যবহার করতে পারেন।",
  },
  {
    h: "৩. কুকি ও সেশন",
    p: "সাইট চালানোর জন্য ন্যূনতম প্রযুক্তিগত তথ্য ব্যবহৃত হয়: টেস্ট চলাকালীন আপনার নাম ব্রাউজারের সেশন স্টোরেজে থাকে, আর অ্যাডমিন লগইনের জন্য একটি কুকি ব্যবহৃত হয়। বিজ্ঞাপন বা ট্র্যাকিং কুকি আমরা ব্যবহার করি না।",
  },
  {
    h: "৪. তৃতীয় পক্ষ",
    p: "আপনার তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা হস্তান্তর করা হয় না। ফন্ট লোড করার জন্য ব্রাউজার Google Fonts-এর সার্ভারে অনুরোধ পাঠায়; এটি তাদের নিজস্ব নীতিমালার অধীন।",
  },
  {
    h: "৫. তথ্যের নিরাপত্তা",
    p: "সব তথ্য সুরক্ষিত ডেটাবেইসে সংরক্ষিত হয় এবং শুধু প্ল্যাটফর্ম পরিচালনার প্রয়োজনে ব্যবহৃত হয়। সঠিক উত্তর টেস্ট চলাকালীন ব্রাউজারে পাঠানো হয় না; মূল্যায়ন সার্ভারে হয়।",
  },
  {
    h: "৬. তথ্য মুছে ফেলা",
    p: "আপনার কোনো ফলাফল বা লেখা মুছে ফেলতে চাইলে প্ল্যাটফর্ম পরিচালকের সাথে যোগাযোগ করুন; যাচাই সাপেক্ষে তা মুছে দেওয়া হবে।",
  },
  {
    h: "৭. নীতিমালা পরিবর্তন",
    p: "এই নীতিমালা সময়ে সময়ে হালনাগাদ হতে পারে। পরিবর্তন হলে এই পৃষ্ঠাতেই প্রকাশ করা হবে।",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pt-32 pb-24 sm:px-8">
        <div className="anim-fade-up">
          <span className="rounded-full bg-[#E51A24]/[0.08] px-4 py-1.5 text-xs font-bold tracking-wide text-[#E51A24]">
            আইনি
          </span>
          <SpringHeading as="h1" className="mt-5 text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-4xl">
            প্রাইভেসি পলিসি
          </SpringHeading>
          <p className="mt-3 text-sm text-[#6C757D]">
            সর্বশেষ হালনাগাদ: {new Date().getFullYear()}
          </p>
        </div>
        <div className="anim-fade-up delay-200 mt-10 space-y-6">
          {SECTIONS.map((s) => (
            <section key={s.h} className="card rounded-lg p-7">
              <SpringHeading as="h2" className="text-lg font-bold text-[#1A1A1A]">{s.h}</SpringHeading>
              <p className="mt-3 text-sm leading-relaxed text-[#6C757D]">
                {s.p}
              </p>
            </section>
          ))}
        </div>
      </main>
      <DynamicSections page="privacy" />
      <Footer />
    </div>
  );
}
