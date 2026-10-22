"use client";

import { useEffect, useRef } from "react";

// Renders administrator-authored HTML, including inline scripts and widgets.
export default function RawHtml({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html;
    // innerHTML does not execute scripts; recreate them explicitly.
    const scripts = Array.from(el.querySelectorAll("script"));
    for (const old of scripts) {
      const script = document.createElement("script");
      for (const attr of Array.from(old.attributes)) {
        script.setAttribute(attr.name, attr.value);
      }
      script.text = old.text;
      old.replaceWith(script);
    }
  }, [html]);

  return <div ref={ref} className={className} />;
}
