"use client";

import { useEffect, useState, type ReactNode } from "react";

export default function ResultReveal({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 850);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 pt-28 pb-24 sm:px-6" aria-live="polite">
        <div className="card rounded-lg p-10 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-[#E51A24]" />
          <p className="mt-5 text-lg font-bold text-[#1A1A1A]">স্কোর হিসাব হচ্ছে</p>
          <p className="mt-2 text-sm text-[#6C757D]">উত্তর, নেগেটিভ মার্কিং ও ব্যান্ড টেবিল যাচাই করা হচ্ছে…</p>
          <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-100">
            <div className="result-loader-bar h-full bg-[#E51A24]" />
          </div>
        </div>
      </div>
    );
  }

  return <div className="anim-fade-in">{children}</div>;
}
