// Pure SVG donut chart (no libraries)
export default function Donut({
  value,
  max = 9,
  size = 120,
  stroke = 12,
  color = "#E51A24",
  track = "#E9ECEF",
  label,
  sublabel,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label: string;
  sublabel?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.22}
          fontWeight="800"
          fill="#1A1A1A"
        >
          {label}
        </text>
        {sublabel && (
          <text
            x="50%"
            y="64%"
            textAnchor="middle"
            fontSize={size * 0.09}
            fontWeight="600"
            fill="#6C757D"
          >
            {sublabel}
          </text>
        )}
      </svg>
    </div>
  );
}
