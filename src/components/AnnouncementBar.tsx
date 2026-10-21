"use client";

import { useEffect, useState } from "react";

export default function AnnouncementBar({
  text,
  ctaLabel,
  ctaUrl,
  deadline,
}: {
  text: string;
  ctaLabel: string;
  ctaUrl: string;
  deadline: string;
}) {
  const [left, setLeft] = useState("");

  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) {
        setLeft("সময় শেষ");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLeft(`${h}ঘ ${m}মি ${s}সে`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [deadline]);

  return (
    <div className="bg-[#E51A24] text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-5 py-3 text-sm font-semibold">
        <span className="anim-marquee whitespace-nowrap">{text}</span>
        {left && <span className="rounded bg-white/15 px-3 py-1 font-mono text-xs">{left}</span>}
        {ctaLabel && ctaUrl && (
          <a href={ctaUrl} className="rounded bg-white px-4 py-1.5 text-xs font-bold text-[#E51A24]">
            {ctaLabel}
          </a>
        )}
      </div>
    </div>
  );
}
