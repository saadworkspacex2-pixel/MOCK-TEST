"use client";

import { useEffect, useRef, useState } from "react";

const SIZE = 34;
const FOLLOW = 0.16;
const DEFORM = 0.72;

export default function VelocityCursor() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Fine pointers only, and never when reduced motion is requested.
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(finePointer.matches && !reducedMotion.matches);

    update();
    finePointer.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      finePointer.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const element = elementRef.current;
    if (!element) return;

    let raf = 0;
    let visible = false;
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;
    let lastPointerX = currentX;
    let lastPointerY = currentY;
    let lastPointerTime = performance.now();
    let speed = 0;
    let interactive = false;

    const onPointerMove = (event: PointerEvent) => {
      const now = performance.now();
      const elapsed = Math.max(8, now - lastPointerTime);
      const distance = Math.hypot(event.clientX - lastPointerX, event.clientY - lastPointerY);
      const instantaneousSpeed = distance / elapsed;

      targetX = event.clientX;
      targetY = event.clientY;
      speed = Math.min(2, instantaneousSpeed);
      interactive = event.target instanceof Element
        ? Boolean(event.target.closest("a, button, input"))
        : false;

      if (!visible) {
        currentX = targetX;
        currentY = targetY;
        visible = true;
        element.style.opacity = "1";
      }

      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      lastPointerTime = now;
    };

    const onPointerLeave = () => {
      element.style.opacity = "0";
      visible = false;
      speed = 0;
    };

    const render = () => {
      const deltaX = targetX - currentX;
      const deltaY = targetY - currentY;
      currentX += deltaX * FOLLOW;
      currentY += deltaY * FOLLOW;

      // Pointer velocity eases back to zero when movement stops.
      speed *= 0.88;
      const followSpeed = Math.hypot(deltaX, deltaY) / 60;
      const velocity = Math.min(1, Math.max(speed, followSpeed));
      const deformation = velocity * DEFORM;
      const angle = Math.atan2(deltaY, deltaX);
      const interactiveScale = interactive ? 1.18 : 1;
      const scaleX = (1 + deformation) * interactiveScale;
      const scaleY = Math.max(0.42, 1 - deformation * 0.68) * interactiveScale;

      element.style.transform = `translate3d(${currentX - SIZE / 2}px, ${currentY - SIZE / 2}px, 0) rotate(${angle}rad) scale(${scaleX}, ${scaleY})`;
      raf = requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={elementRef}
      className="velocity-cursor"
      aria-hidden="true"
    />
  );
}
