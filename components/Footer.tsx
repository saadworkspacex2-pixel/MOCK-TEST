import SpringHeading from "@/components/SpringHeading";
import Link from "next/link";
import Logo from "./Logo";
import { getSettings } from "@/lib/settings";

export default async function Footer() {
  const s = await getSettings();
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo dark settings={s} />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/55">
            {s.footer_about}
          </p>
        </div>
        <div>
          <SpringHeading as="h4" className="text-sm font-bold tracking-wide text-white/90">
            লিংক
          </SpringHeading>
          <ul className="mt-5 space-y-3 text-sm text-white/55">
            {[
              { href: "/exams", label: "সব টেস্ট" },
              { href: "/leaderboard", label: "লিডারবোর্ড" },
              { href: "/resources", label: "রিসোর্স" },
              { href: "/admin", label: "অ্যাডমিন প্যানেল" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SpringHeading as="h4" className="text-sm font-bold tracking-wide text-white/90">
            তথ্য
          </SpringHeading>
          <ul className="mt-5 space-y-3 text-sm text-white/55">
            <li>
              <Link href="/terms" className="transition-colors hover:text-white">
                ব্যবহারের শর্তাবলি
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="transition-colors hover:text-white"
              >
                প্রাইভেসি পলিসি
              </Link>
            </li>
            <li>Academic Reading</li>
            <li>Listening ও Writing Task</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} LHBD। সবার জন্য ফ্রি প্রস্তুতি।
        <span className="mx-2 text-white/20">|</span>
        <Link href="/terms" className="transition-colors hover:text-white/70">
          শর্তাবলি
        </Link>
        <span className="mx-2 text-white/20">|</span>
        <Link href="/privacy" className="transition-colors hover:text-white/70">
          প্রাইভেসি
        </Link>
      </div>
    </footer>
  );
}
