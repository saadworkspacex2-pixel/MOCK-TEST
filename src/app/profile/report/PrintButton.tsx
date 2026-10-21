"use client";

import Icon from "@/components/Icon";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-red inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-bold"
    >
      <Icon name="doc" size={15} /> PDF ডাউনলোড / প্রিন্ট
    </button>
  );
}
