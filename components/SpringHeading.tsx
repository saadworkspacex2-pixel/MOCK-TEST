"use client";

import { animated, useSprings } from "@react-spring/web";
import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type SpringHeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as: HeadingTag;
  children: ReactNode;
};

type ElementWithChildren = {
  className?: string;
  children?: ReactNode;
};

const SPRING_CONFIG = { tension: 140, friction: 24 };
const WORD_STAGGER_MS = 45;

function isAtomicBadgeOrNode(el: ReactElement<ElementWithChildren>): boolean {
  if (typeof el.type !== "string") return true;
  if (el.type === "br") return false;
  const cls = el.props.className ?? "";
  return /\b(bg-|px-|py-|border|rounded|inline-flex|grid)\b/.test(cls);
}

function countWordUnits(node: ReactNode): number {
  let count = 0;
  Children.forEach(node, (child) => {
    if (child === null || child === undefined || typeof child === "boolean") {
      return;
    }
    if (typeof child === "string" || typeof child === "number") {
      const parts = String(child).split(/(\s+)/);
      for (const part of parts) {
        if (part.length > 0 && !/^\s+$/.test(part)) {
          count += 1;
        }
      }
      return;
    }
    if (isValidElement<ElementWithChildren>(child)) {
      if (child.type === "br") return;
      if (isAtomicBadgeOrNode(child)) {
        count += 1;
      } else {
        count += countWordUnits(child.props.children);
      }
    }
  });
  return count;
}

// Site-wide Bangla-safe Spring Blur-In heading primitive.
// Keeps every word as an unbroken text run so Bengali conjuncts (যুক্তবর্ণ)
// and vowel matras (কার) shape natively without ever splitting codepoints.
export default function SpringHeading({
  as: Tag,
  children,
  className = "",
  ...props
}: SpringHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      setReducedMotion(mq.matches);
      if (mq.matches) setHasEntered(true);
    };
    syncMotion();
    mq.addEventListener("change", syncMotion);
    return () => mq.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    if (hasEntered) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasEntered(true);
          io.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasEntered]);

  const unitCount = useMemo(() => countWordUnits(children), [children]);

  const [springs] = useSprings(
    unitCount,
    (index) => ({
      from: { opacity: 0, filter: "blur(8px)" },
      to: {
        opacity: hasEntered ? 1 : 0,
        filter: hasEntered ? "blur(0px)" : "blur(8px)",
      },
      delay: hasEntered && !reducedMotion ? index * WORD_STAGGER_MS : 0,
      config: SPRING_CONFIG,
      immediate: reducedMotion,
    }),
    [hasEntered, unitCount, reducedMotion],
  );

  const cleanedClassName = useMemo(
    () =>
      className
        .split(/\s+/)
        .filter(
          (token) =>
            Boolean(token) &&
            !token.startsWith("anim-") &&
            !token.startsWith("animate-") &&
            !token.startsWith("delay-"),
        )
        .join(" "),
    [className],
  );

  const isFlexContainer = /\b(inline-)?flex\b/.test(cleanedClassName);

  let cursor = 0;

  const renderAnimatedNodes = (
    node: ReactNode,
    wrapTextForFlex: boolean,
  ): ReactNode => {
    return Children.map(node, (child, childIdx) => {
      if (child === null || child === undefined || typeof child === "boolean") {
        return child;
      }

      if (typeof child === "string" || typeof child === "number") {
        const parts = String(child).split(/(\s+)/);
        const rendered = parts.map((part, partIdx) => {
          if (!part) return null;
          if (/^\s+$/.test(part)) {
            return <Fragment key={`ws-${childIdx}-${partIdx}`}>{part}</Fragment>;
          }
          const springStyle = springs[cursor];
          cursor += 1;
          return (
            <animated.span
              key={`wd-${childIdx}-${partIdx}`}
              style={springStyle}
              className="spring-heading-word inline-block"
            >
              {part}
            </animated.span>
          );
        });
        return wrapTextForFlex ? (
          <span key={`tx-${childIdx}`}>{rendered}</span>
        ) : (
          rendered
        );
      }

      if (isValidElement<ElementWithChildren>(child)) {
        if (child.type === "br") {
          return child;
        }
        if (isAtomicBadgeOrNode(child)) {
          const springStyle = springs[cursor];
          cursor += 1;
          return (
            <animated.span
              key={`nd-${childIdx}`}
              style={springStyle}
              className="spring-heading-word inline-flex items-center"
            >
              {child}
            </animated.span>
          );
        }
        return cloneElement(
          child,
          { key: `wr-${childIdx}` },
          renderAnimatedNodes(child.props.children, false),
        );
      }

      return child;
    });
  };

  return (
    <Tag ref={ref} className={cleanedClassName} {...props}>
      {renderAnimatedNodes(children, isFlexContainer)}
    </Tag>
  );
}
