import { METRIC_LIST, midpoint, normalise } from "@/lib/beer-guide/metrics";
import type { BeerStyleStats } from "@/lib/beer-guide/types";

type Variant = "full" | "mini";

type Geometry = {
  width: number;
  height: number;
  cx: number;
  cy: number;
  r: number;
  labelOffset: number;
  rings: number[];
  showLabels: boolean;
  strokeWidth: number;
  dotRadius: number;
  fontSize: number;
};

const GEOMETRY: Record<Variant, Geometry> = {
  full: {
    width: 320,
    height: 300,
    cx: 160,
    cy: 150,
    r: 92,
    labelOffset: 24,
    rings: [0.25, 0.5, 0.75, 1],
    showLabels: true,
    strokeWidth: 2,
    dotRadius: 3.5,
    fontSize: 13,
  },
  mini: {
    width: 100,
    height: 100,
    cx: 50,
    cy: 50,
    r: 40,
    labelOffset: 0,
    rings: [0.5, 1],
    showLabels: false,
    strokeWidth: 1.5,
    dotRadius: 0,
    fontSize: 0,
  },
};

/** Six axes, first one straight up, going clockwise. */
const ANGLES = METRIC_LIST.map(
  (_, i) => -Math.PI / 2 + (Math.PI * 2 * i) / METRIC_LIST.length,
);

type Props = {
  stats: BeerStyleStats;
  variant?: Variant;
  /** Stroke and fill colour for the data shape. */
  accent?: string;
  /** Second style drawn over the first, for side-by-side comparison. */
  compare?: { stats: BeerStyleStats; accent: string };
  className?: string;
};

/**
 * Spider chart of the six BJCP numbers. Every axis is normalised against a
 * window shared by the whole guide (see METRICS), so the silhouette alone is
 * enough to tell a stout from a helles.
 *
 * The shaded band is the style's full min–max range; the solid line is its
 * midpoint.
 */
export default function StyleRadar({
  stats,
  variant = "full",
  accent = "#233329",
  compare,
  className,
}: Props) {
  const g = GEOMETRY[variant];

  const point = (normalised: number, index: number) => ({
    x: g.cx + g.r * normalised * Math.cos(ANGLES[index]),
    y: g.cy + g.r * normalised * Math.sin(ANGLES[index]),
  });

  const path = (normalisedValues: number[]) =>
    normalisedValues
      .map((value, i) => {
        const p = point(value, i);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      })
      .join(" ") + " Z";

  const ringPath = (scale: number) =>
    path(METRIC_LIST.map(() => scale));

  const series = [{ stats, accent }, ...(compare ? [compare] : [])].map(
    (item) => ({
      accent: item.accent,
      lows: METRIC_LIST.map((metric) =>
        normalise(item.stats[metric.key][0], metric),
      ),
      highs: METRIC_LIST.map((metric) =>
        normalise(item.stats[metric.key][1], metric),
      ),
      mids: METRIC_LIST.map((metric) =>
        normalise(midpoint(item.stats[metric.key]), metric),
      ),
    }),
  );

  return (
    <svg
      viewBox={`0 0 ${g.width} ${g.height}`}
      className={className}
      role="img"
      aria-label="Профил на стила по OG, FG, IBU, EBC, ABV и BU/GU"
    >
      {g.rings.map((scale) => (
        <path
          key={scale}
          d={ringPath(scale)}
          fill="none"
          stroke="#d6d3d1"
          strokeWidth="0.9"
        />
      ))}

      {ANGLES.map((angle, i) => (
        <line
          key={i}
          x1={g.cx}
          y1={g.cy}
          x2={g.cx + g.r * Math.cos(angle)}
          y2={g.cy + g.r * Math.sin(angle)}
          stroke="#e7e5e4"
          strokeWidth="0.9"
        />
      ))}

      {series.map((item) => (
        <g key={item.accent}>
          {/* min–max band: outer ring minus inner ring, via even-odd fill */}
          <path
            d={`${path(item.highs)} ${path(item.lows)}`}
            fillRule="evenodd"
            fill={item.accent}
            fillOpacity={compare ? 0.12 : 0.16}
          />

          <path
            d={path(item.mids)}
            fill="none"
            stroke={item.accent}
            strokeWidth={g.strokeWidth}
            strokeLinejoin="round"
          />

          {g.dotRadius > 0 &&
            item.mids.map((value, i) => {
              const p = point(value, i);
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={g.dotRadius}
                  fill={item.accent}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              );
            })}
        </g>
      ))}

      {g.showLabels &&
        METRIC_LIST.map((metric, i) => {
          const angle = ANGLES[i];
          const cos = Math.cos(angle);
          const lx = g.cx + (g.r + g.labelOffset) * cos;
          const ly = g.cy + (g.r + g.labelOffset) * Math.sin(angle);
          const anchor = cos > 0.15 ? "start" : cos < -0.15 ? "end" : "middle";

          return (
            <text
              key={metric.key}
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={g.fontSize}
              fontWeight="700"
              fill={metric.color}
            >
              {metric.label}
            </text>
          );
        })}
    </svg>
  );
}
