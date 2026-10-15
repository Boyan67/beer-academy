import { ebcToColor } from "@/lib/beer-guide/metrics";
import { PROCESS_STEPS } from "@/lib/beer-guide/process";

const STROKE = "#a8a29e";
const ACCENT = "#f2a541";
const MASH = "#d9a95f";
const GRAIN = "#a97a3c";
const WORT = ebcToColor(18);
const BEER = ebcToColor(10);

/** Where each vessel sits: left-to-right on top, back right-to-left below. */
const SPOTS: [number, number][] = [
  [60, 66],
  [180, 66],
  [300, 66],
  [300, 186],
  [180, 186],
  [60, 186],
];

/** Bubbles that rise while the vessel is the current step. */
function Bubbles({ xs, y, color = "white" }: { xs: number[]; y: number; color?: string }) {
  return xs.map((x, i) => (
    <circle key={x} cx={x} cy={y} r={2.5} fill={color} className="brew-bubble" style={{ animationDelay: `${i * 0.45}s` }} />
  ));
}

/** Each vessel drawn in a 76×80 box. */
const VESSELS: ((active: boolean) => React.ReactNode)[] = [
  // Mash tun: porridge of grain and water, with a paddle.
  () => (
    <>
      <rect x={8} y={30} width={60} height={42} rx={4} fill={MASH} />
      {[[20, 44], [34, 58], [50, 48], [58, 62], [26, 64], [44, 38]].map(([cx, cy]) => (
        <ellipse key={`${cx}`} cx={cx} cy={cy} rx={3} ry={2} fill={GRAIN} />
      ))}
      <rect x={8} y={14} width={60} height={60} rx={6} fill="none" stroke={STROKE} strokeWidth={3} />
      <path d="M56 2 L40 54" stroke="#78716c" strokeWidth={3.5} strokeLinecap="round" />
    </>
  ),
  // Lauter tun: clear wort above the grain bed, false bottom, tap.
  () => (
    <>
      <rect x={8} y={28} width={60} height={24} fill={WORT} opacity={0.85} />
      <rect x={8} y={52} width={60} height={14} fill={MASH} />
      {[16, 28, 40, 52, 62].map((cx) => (
        <ellipse key={cx} cx={cx} cy={59} rx={3} ry={2} fill={GRAIN} />
      ))}
      <path d="M10 68 H66" stroke={STROKE} strokeWidth={2} strokeDasharray="3 3" />
      <rect x={8} y={14} width={60} height={60} rx={6} fill="none" stroke={STROKE} strokeWidth={3} />
      <path d="M68 70 H76 V78" fill="none" stroke={STROKE} strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  // Kettle on the flame, hops going in.
  (active) => (
    <>
      <rect x={4} y={26} width={68} height={34} fill={WORT} />
      {active && <Bubbles xs={[16, 30, 46, 60]} y={52} color="#fde68a" />}
      <rect x={4} y={16} width={68} height={46} rx={8} fill="none" stroke={STROKE} strokeWidth={3} />
      <path d="M2 16 H74" stroke={STROKE} strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={52} cy={8} rx={5} ry={6.5} fill="#84cc16" stroke="#4d7c0f" strokeWidth={1.5} />
      <path d="M18 76 L24 64 L30 76 Z M34 76 L40 62 L46 76 Z M50 76 L56 64 L62 76 Z" fill="#f59e0b" />
    </>
  ),
  // Plate chiller: hot wort one way, cold water the other.
  () => (
    <>
      <rect x={14} y={8} width={48} height={66} rx={4} fill="#f0f9ff" stroke={STROKE} strokeWidth={3} />
      <path d="M22 16 H54 V30 H22 V44 H54 V58 H22 V68" fill="none" stroke={WORT} strokeWidth={4} strokeLinejoin="round" />
      <path d="M26 22 H50 M26 37 H50 M26 51 H50 M26 64 H50" stroke="#38bdf8" strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  // Conical fermenter with an airlock.
  (active) => (
    <>
      <path d="M16 22 H60 V48 L38 66 L16 48 Z" fill={BEER} opacity={0.9} />
      {active && <Bubbles xs={[26, 38, 50]} y={50} />}
      <path d="M16 8 H60 V48 L38 66 L16 48 Z" fill="none" stroke={STROKE} strokeWidth={3} strokeLinejoin="round" />
      <path d="M20 54 L16 78 M56 54 L60 78" stroke={STROKE} strokeWidth={3} strokeLinecap="round" />
      <path d="M34 8 V2 M42 8 V2 M34 2 H42" fill="none" stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  // A brown bottle — it keeps the light out.
  () => (
    <>
      <path d="M32 6 H44 V22 C44 28, 54 30, 54 38 V72 C54 76, 50 78, 46 78 H30 C26 78, 22 76, 22 72 V38 C22 30, 32 28, 32 22 Z" fill="#7c4a1e" />
      <rect x={22} y={44} width={32} height={18} fill="#fffdf7" />
      <rect x={30} y={2} width={16} height={6} rx={2} fill={ACCENT} />
    </>
  ),
];

const LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
];

/** The whole brewing line with one step lit; the reading page puts its text underneath. */
export default function ProcessDiagram({ step }: { step: number }) {
  return (
    <svg viewBox="0 0 360 262" className="w-full" role="img" aria-label={`Варене на бира, стъпка ${step + 1}: ${PROCESS_STEPS[step].title}`}>
      {LINKS.map(([a, b]) => {
        const [x1, y1] = SPOTS[a];
        const [x2, y2] = SPOTS[b];
        const vertical = x1 === x2;
        return (
          <line
            key={a}
            x1={vertical ? x1 : x1 + (x2 > x1 ? 42 : -42)}
            y1={vertical ? y1 + 48 : y1 + 10}
            x2={vertical ? x2 : x2 + (x2 > x1 ? -42 : 42)}
            y2={vertical ? y2 - 44 : y2 + 10}
            stroke={b <= step ? ACCENT : "#e7e5e4"}
            strokeWidth={5}
            strokeLinecap="round"
          />
        );
      })}

      {SPOTS.map(([cx, cy], i) => {
        const active = i === step;
        return (
          <g key={i} opacity={i > step ? 0.4 : 1}>
            {active && <circle cx={cx} cy={cy} r={50} fill={ACCENT} opacity={0.12} />}
            <g transform={`translate(${cx - 38} ${cy - 42})`}>{VESSELS[i](active)}</g>
            <text
              x={cx}
              y={cy + 58}
              textAnchor="middle"
              className={`text-[13px] ${active ? "fill-stone-900 font-extrabold" : "fill-stone-500 font-semibold"}`}
            >
              {PROCESS_STEPS[i].title}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
