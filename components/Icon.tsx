// Original inline SVG icon set for LHBD. 1.5px strokes, currentColor.
const PATHS: Record<string, React.ReactNode> = {
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5" />
      <path d="M8 7h8M8 10.5h5" />
    </>
  ),
  pen: (
    <>
      <path d="m14.5 4.5 5 5L8 21H3v-5L14.5 4.5Z" />
      <path d="m12.5 6.5 5 5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v6a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H4.5a3.5 3.5 0 0 0 3.6 3.5M16 5h3.5a3.5 3.5 0 0 1-3.6 3.5" />
      <path d="M12 14v3M8.5 20h7M10 17h4v3h-4z" />
    </>
  ),
  bolt: <path d="M13 2 5 13.5h5.5L10.5 22l8-11.5H13L13 2Z" />,
  bulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6.5 6.5 0 0 0-3.8 11.8c.8.6 1.3 1.3 1.5 2.2h4.6c.2-.9.7-1.6 1.5-2.2A6.5 6.5 0 0 0 12 3Z" />
    </>
  ),
  screen: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="1.5" />
      <path d="M9 21h6M12 17.5V21M6.5 8h7M6.5 11h4" />
    </>
  ),
  device: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M10.5 5h3M12 18.5h.01" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16v-5M12 16V8M16 16v-8" />
    </>
  ),
  doc: (
    <>
      <path d="M6 2.5h8l4 4V21.5H6V2.5Z" />
      <path d="M14 2.5v4h4M9 12h6M9 15.5h6M9 8.5h2.5" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5v7l6-3.5-6-3.5Z" />
    </>
  ),
  audio: (
    <>
      <path d="M4 10v4h3l5 4V6l-5 4H4Z" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h13l-2.5 4L18 12H5" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5L19.5 7" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  shield: (
    <>
      <path d="M12 2.5 4.5 5.5v6c0 4.6 3.1 8 7.5 10 4.4-2 7.5-5.4 7.5-10v-6L12 2.5Z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5" />
      <path d="M16 5.5a3.5 3.5 0 0 1 0 6.3M17.5 14.8c2 .8 3.2 2.6 3.5 5.2" />
    </>
  ),
  undo: (
    <>
      <path d="M7.5 5 3.5 9l4 4" />
      <path d="M3.5 9H15a5.5 5.5 0 0 1 0 11H9" />
    </>
  ),
  redo: (
    <>
      <path d="m16.5 5 4 4-4 4" />
      <path d="M20.5 9H9a5.5 5.5 0 0 0 0 11h6" />
    </>
  ),
  edit: (
    <>
      <path d="M11 4.5H4.5v15h15V13" />
      <path d="M18.5 3.2 20.8 5.5 12 14.3l-3 .7.7-3 8.8-8.8Z" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 6.5h15M9.5 6V4h5v2M7 6.5l1 14h8l1-14" />
      <path d="M10.5 10v7M13.5 10v7" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3Z" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4.5H5.5v15H14" />
      <path d="M10 12h10.5m-4-4 4 4-4 4" />
    </>
  ),
};

export default function Icon({
  name,
  size = 20,
  className = "",
  strokeWidth = 1.6,
}: {
  name: keyof typeof PATHS | string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name] ?? null}
    </svg>
  );
}
