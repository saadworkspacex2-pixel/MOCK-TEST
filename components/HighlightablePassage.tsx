"use client";

import { useRef, useState, type ReactNode } from "react";

type Highlight = { id: number; start: number; end: number };
type Tooltip = { x: number; y: number; start: number; end: number } | null;

export default function HighlightablePassage({ text }: { text: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [tooltip, setTooltip] = useState<Tooltip>(null);

  const onSelect = () => {
    const selection = window.getSelection();
    const root = container.current;
    if (!selection || !root || selection.isCollapsed || selection.rangeCount === 0) {
      setTooltip(null);
      return;
    }
    const range = selection.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) {
      setTooltip(null);
      return;
    }
    const selected = range.toString().trim();
    if (selected.length < 2) {
      setTooltip(null);
      return;
    }
    const before = range.cloneRange();
    before.selectNodeContents(root);
    before.setEnd(range.startContainer, range.startOffset);
    const start = before.toString().length;
    const end = start + range.toString().length;
    const rect = range.getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: Math.max(12, rect.top - 44),
      start,
      end,
    });
  };

  const applyHighlight = () => {
    if (!tooltip) return;
    setHighlights((old) => [
      ...old.filter((h) => h.end <= tooltip.start || h.start >= tooltip.end),
      { id: Date.now(), start: tooltip.start, end: tooltip.end },
    ]);
    setTooltip(null);
    window.getSelection()?.removeAllRanges();
  };

  const renderText = (): ReactNode => {
    const sorted = [...highlights].sort((a, b) => a.start - b.start);
    const nodes: ReactNode[] = [];
    let cursor = 0;
    for (const h of sorted) {
      if (h.start > cursor) nodes.push(text.slice(cursor, h.start));
      nodes.push(
        <mark key={h.id} className="rounded-sm bg-yellow-200 px-0.5 text-inherit">
          {text.slice(h.start, h.end)}
        </mark>,
      );
      cursor = h.end;
    }
    if (cursor < text.length) nodes.push(text.slice(cursor));
    return nodes;
  };

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-stone-500">টেক্সট সিলেক্ট করে হাইলাইট করুন</p>
        {highlights.length > 0 && (
          <button
            type="button"
            onClick={() => setHighlights([])}
            className="rounded border border-stone-300 px-2.5 py-1 text-[11px] font-semibold text-stone-600"
          >
            হাইলাইট মুছুন ({highlights.length})
          </button>
        )}
      </div>
      <div
        ref={container}
        onMouseUp={onSelect}
        onTouchEnd={onSelect}
        className="space-y-4 whitespace-pre-line text-[16px] font-normal leading-8 text-slate-800 selection:bg-yellow-100"
      >
        {renderText()}
      </div>
      {tooltip && (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={applyHighlight}
          className="fixed z-[70] flex -translate-x-1/2 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <span className="h-3 w-3 rounded-sm bg-yellow-300" />
          Highlight
        </button>
      )}
    </div>
  );
}
