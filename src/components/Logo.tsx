"use client";

import Link from "next/link";
import { useBranding } from "./BrandProvider";

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
}: {
  dark?: boolean;
  href?: string;
}) {
  const brand = useBranding();

  const mark = brand.showLogo ? (
    brand.logoUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={brand.logoUrl}
        alt={brand.name}
        width={brand.width}
        height={brand.height}
        style={{
          width: brand.width,
          height: brand.height,
          borderRadius: brand.radius,
          transform: `translate(${brand.x}px, ${brand.y}px)`,
          objectFit: "contain",
          display: "block",
        }}
      />
    ) : (
      <span
        style={{
          display: "block",
          width: brand.width,
          height: brand.height,
          transform: `translate(${brand.x}px, ${brand.y}px)`,
          borderRadius: brand.radius,
          overflow: "hidden",
        }}
      >
        <LogoMark size={Math.min(brand.width, brand.height)} />
      </span>
    )
  ) : null;

  return (
    <Link href={href} className="group flex items-center gap-2.5">
      {mark}
      {brand.showText && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-extrabold tracking-tight ${
              dark ? "text-white" : "text-[#1A1A1A]"
            }`}
            style={{
              fontFamily: "Manrope, sans-serif",
              fontSize: brand.nameSize,
            }}
          >
            {brand.name}
            <span className="text-[#E51A24]">{brand.nameAccent}</span>
          </span>
          {brand.showTagline && brand.tagline && (
            <span
              className={`mt-1 text-[10px] font-medium tracking-[0.18em] ${
                dark ? "text-white/50" : "text-[#6C757D]"
              }`}
            >
              {brand.tagline}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
