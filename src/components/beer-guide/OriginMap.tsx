import { project } from "@/lib/beer-guide/map";
import { MAP_DATA } from "@/lib/beer-guide/map-data";
import type { Origin } from "@/lib/beer-guide/origins";

type Props = {
  origin: Origin;
  className?: string;
};

/** An outline map with the style's birthplace pinned and its country shaded. */
export default function OriginMap({ origin, className }: Props) {
  const map = MAP_DATA[origin.region];
  const countries: Record<string, string> = map.countries;
  const [x, y] = project(origin.region, origin.lat, origin.lon);
  // Text goes on whichever side has room.
  const left = x > map.width * 0.62;

  return (
    <svg
      viewBox={`0 0 ${map.width} ${map.height}`}
      className={className}
      role="img"
      aria-label={`Карта: ${origin.place}`}
    >
      <rect width={map.width} height={map.height} rx={12} fill="#e6eef0" />
      <path d={map.land} fill="#fbfaf8" stroke="#c9c5c0" strokeWidth={0.8} strokeLinejoin="round" />
      <path d={countries[origin.country]} fill="#cf6911" fillOpacity={0.14} />
      <path d={map.borders} fill="none" stroke="#d6d3d1" strokeWidth={0.7} strokeLinejoin="round" />

      <circle cx={x} cy={y} r={14} fill="#cf6911" opacity={0.25} className="pin-pulse" style={{ transformOrigin: `${x}px ${y}px` }} />
      <circle cx={x} cy={y} r={6} fill="#cf6911" stroke="white" strokeWidth={2.5} />

      <text
        x={left ? x - 13 : x + 13}
        y={y + 5}
        textAnchor={left ? "end" : "start"}
        className="fill-stone-900 text-[15px] font-extrabold"
        stroke="white"
        strokeWidth={4}
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {origin.place}
      </text>
    </svg>
  );
}
