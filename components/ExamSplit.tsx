"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

export default function ExamSplit({
  left,
  right,
  initial = 50,
  className = "",
  leftLabel = "Passage",
  rightLabel = "Questions",
}: {
  left: ReactNode;
  right: ReactNode;
  initial?: number;
  className?: string;
  leftLabel?: string;
  rightLabel?: string;
}) {
  const [percent, setPercent] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const [mobilePane, setMobilePane] = useState<"left" | "right">("left");
  const container = useRef<HTMLDivElement>(null);

  const move = useCallback((clientX: number) => {
    const rect = container.current?.getBoundingClientRect();
    if (!rect || rect.width < 1) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPercent(Math.max(28, Math.min(72, next)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (event: PointerEvent) => move(event.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, move]);

  const start = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
    move(event.clientX);
  };

  return (
    <div className={`exam-split-shell ${className}`.trim()}>
      <div
        className="exam-mobile-tabs"
        role="tablist"
        aria-label="Exam panes"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mobilePane === "left"}
          onClick={() => setMobilePane("left")}
          className={mobilePane === "left" ? "is-active" : ""}
        >
          {leftLabel}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePane === "right"}
          onClick={() => setMobilePane("right")}
          className={mobilePane === "right" ? "is-active" : ""}
        >
          {rightLabel}
        </button>
      </div>

      <div
        ref={container}
        className={`exam-split ${dragging ? "is-dragging" : ""}`}
        style={{ "--split-left": `${percent}%` } as CSSProperties}
      >
        <div
          className={`exam-split-pane ${
            mobilePane === "left" ? "is-mobile-active" : "is-mobile-hidden"
          }`}
        >
          {left}
        </div>

        <div
          role="separator"
          aria-label="প্যানেলের আকার বদলান"
          aria-orientation="vertical"
          onPointerDown={start}
          className="exam-split-divider"
        >
          <span className="exam-split-grip" aria-hidden>
            <i />
            <i />
            <i />
          </span>
        </div>

        <div
          className={`exam-split-pane ${
            mobilePane === "right" ? "is-mobile-active" : "is-mobile-hidden"
          }`}
        >
          {right}
        </div>
      </div>
    </div>
  );
}
