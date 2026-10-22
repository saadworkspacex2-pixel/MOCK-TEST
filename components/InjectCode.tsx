"use client";

import { useEffect } from "react";

// Injects admin-managed header/footer code (analytics, pixels, CSS, widgets).
export default function InjectCode({
  html,
  target,
}: {
  html: string;
  target: "head" | "body";
}) {
  useEffect(() => {
    if (!html.trim()) return;
    const template = document.createElement("template");
    template.innerHTML = html;
    const parent = target === "head" ? document.head : document.body;
    const nodes = Array.from(template.content.childNodes);
    for (const node of nodes) {
      if (node.nodeName === "SCRIPT") {
        const old = node as HTMLScriptElement;
        const script = document.createElement("script");
        for (const attr of Array.from(old.attributes)) {
          script.setAttribute(attr.name, attr.value);
        }
        script.text = old.text;
        parent.appendChild(script);
      } else {
        parent.appendChild(node.cloneNode(true));
      }
    }
  }, [html, target]);

  return null;
}
