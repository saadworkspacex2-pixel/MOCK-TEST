"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { brandOf } from "@/lib/branding";

export function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="44" height="44" rx="12" fill="#E51A24" />
      <rect x="10" y="24" width="6" height="10" rx="2" fill="#fff" opacity="0.55" />
      <rect x="19" y="17" width="6" height="17" rx="2" fill="#fff" opacity="0.8" />
      <rect x="28" y="10" width="6" height="24" rx="2" fill="#fff" />
      <circle cx="31" cy="10" r="5.5" fill="#1A1A1A" />
      <path
        d="M28.6 10.1l1.7 1.7 3-3.2"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({
  dark = false,
  href = "/",
  settings: providedSettings,
}: {
  dark?: boolean;
  href?: string;
  settings?: Record<string, string>;
}) {
  const [settings, setSettings] = useState<Record<string, string>>(
    providedSettings ?? {},
  );

  useEffect(() => {
    if (providedSettings) {
      setSettings(providedSettings);
      return;
    }
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => setSettings(data))
      .catch(() => {});
  }, [providedSettings]);

  const brand = brandOf(settings);

  return (
    <Link href={href} className="group flex items-center gap-2.5">
      {brand.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logoUrl}
          alt={settings.site_name || "Logo"}
          width={brand.width}
          height={brand.height}
          className="lhbd-brand-image shrink-0"
          style={{
            width: `${brand.width}px`,
            height: `${brand.height}px`,
            objectFit: brand.objectFit,
          }}
        />
      ) : (
        <span className="transition-transform duration-300 group-hover:rotate-[-5deg] group-hover:scale-105">
          <LogoMark />
        </span>
      )}
      {brand.showText && (
        <span className="flex flex-col leading-none">
          <span
            className={`text-xl font-extrabold tracking-tight ${
              dark ? "text-white" : "text-[#1A1A1A]"
            }`}
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {settings.logo_text || settings.site_name || "LHBD"}
            <span className="text-[#E51A24]">.</span>
          </span>
          <span
            className={`mt-1 text-[10px] font-medium tracking-[0.18em] ${
              dark ? "text-white/50" : "text-[#6C757D]"
            }`}
          >
            {settings.logo_tagline || "মক টেস্ট প্ল্যাটফর্ম"}
          </span>
        </span>
      )}
    </Link>
  );
}
