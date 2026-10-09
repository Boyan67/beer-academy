import { ebcToColor } from "@/lib/beer-guide/metrics";
import type { GlassShape, Range } from "@/lib/beer-guide/types";

type ShapeSpec = {
  /** Coordinate space these paths are drawn in. Always 2:3. */
  viewBox?: string;
  /**
   * Closed path the beer is clipped to: the body outline plus the rim's lower
   * arc, so the head's surface follows the ellipse rather than a flat line.
   */
  clip: string;
  /** Paths stroked over the fill: body, rim, foot, rings, handle. */
  strokes: string[];
  strokeWidth?: number;
  /** Where the head starts and the liquid begins. */
  foamTop: number;
  foamBottom: number;
  /**
   * Where the liquid stops. Only needed when the clip path runs past the
   * bottom of the bowl, e.g. down a stem.
   */
  liquidBottom?: number;
};

/** 2:3, matching every shape below. */
const DEFAULT_VIEW_BOX = "0 0 256 384";
const DEFAULT_STROKE = 7.5;

/**
 * Each glass is drawn the same way: an open body outline, a separate rim drawn
 * as a flattened ellipse so you look into the glass, and whatever base detail
 * the piece calls for. The clip closes the body with the rim's lower arc.
 */
const BODY = {
  tumbler:
    "M68 44 C72 140, 76 236, 80 312 C80 330, 88 342, 102 342 L154 342 C168 342, 176 330, 176 312 C180 236, 184 140, 188 44",
  weizen:
    "M64 44 C56 84, 56 116, 62 148 C70 196, 86 234, 92 272 C95 302, 92 324, 84 342 L172 342 C164 324, 161 302, 164 272 C170 234, 186 196, 194 148 C200 116, 200 84, 192 44",
  pilsner:
    "M72 44 C80 140, 92 250, 100 330 C101 342, 108 350, 118 350 L138 350 C148 350, 155 342, 156 330 C164 250, 176 140, 184 44",
  stange:
    "M94 40 L98 326 C98 340, 104 348, 114 348 L142 348 C152 348, 158 340, 158 326 L162 40",
  pint:
    "M70 44 C71 62, 72 78, 73 92 C62 104, 62 126, 75 138 C81 208, 87 276, 90 316 C90 332, 98 342, 110 342 L146 342 C158 342, 166 332, 166 316 C169 276, 175 208, 181 138 C194 126, 194 104, 183 92 C184 78, 185 62, 186 44",
  tulip:
    "M78 38 C84 54, 88 66, 90 78 C70 98, 60 132, 68 164 C76 196, 102 216, 120 236 L120 302 C120 314, 102 322, 86 332 C78 338, 80 346, 90 346 L166 346 C176 346, 178 338, 170 332 C154 322, 136 314, 136 302 L136 236 C154 216, 180 196, 188 164 C196 132, 186 98, 166 78 C168 66, 172 54, 178 38",
  mug: "M50 54 L52 318 C52 334, 62 344, 76 344 L136 344 C150 344, 160 334, 160 318 L162 54",
  footed:
    "M62 48 C58 90, 58 128, 64 166 C70 204, 82 238, 91 272 C99 304, 102 338, 102 374 C102 404, 98 430, 91 450 L165 450 C158 430, 154 404, 154 374 C154 338, 157 304, 165 272 C174 238, 186 204, 192 166 C198 128, 198 90, 194 48",
};

/** Lower half of each rim ellipse — reused to close the clip. */
const RIM_UNDER = {
  tumbler: "C174 56, 82 56, 68 44",
  weizen: "C177 57, 79 57, 64 44",
  pilsner: "C171 55, 85 55, 72 44",
  stange: "C154 48, 102 48, 94 40",
  pint: "C172 56, 84 56, 70 44",
  tulip: "C166 48, 90 48, 78 38",
  mug: "C149 65, 63 65, 50 54",
  footed: "C178 62, 78 62, 62 48",
};

/** Full rim ellipse, drawn on top of the head. */
const RIM = {
  tumbler: `M68 44 C82 32, 174 32, 188 44 ${RIM_UNDER.tumbler}`,
  weizen: `M64 44 C79 31, 177 31, 192 44 ${RIM_UNDER.weizen}`,
  pilsner: `M72 44 C85 33, 171 33, 184 44 ${RIM_UNDER.pilsner}`,
  stange: `M94 40 C102 32, 154 32, 162 40 ${RIM_UNDER.stange}`,
  pint: `M70 44 C84 32, 172 32, 186 44 ${RIM_UNDER.pint}`,
  tulip: `M78 38 C90 28, 166 28, 178 38 ${RIM_UNDER.tulip}`,
  mug: `M50 54 C63 43, 149 43, 162 54 ${RIM_UNDER.mug}`,
  footed: `M62 48 C78 35, 178 35, 194 48 ${RIM_UNDER.footed}`,
};

const closed = (key: keyof typeof BODY) =>
  `${BODY[key]} ${RIM_UNDER[key]} Z`;

const SHAPES: Record<GlassShape, ShapeSpec> = {
  /** Straight shaker tumbler — the default for everything unspecified. */
  tumbler: {
    clip: closed("tumbler"),
    strokes: [BODY.tumbler, RIM.tumbler],
    foamTop: 40,
    foamBottom: 122,
  },
  /** Weizen vase: widest under the rim, waisted, broad foot. */
  weizen: {
    clip: closed("weizen"),
    strokes: [BODY.weizen, RIM.weizen],
    foamTop: 40,
    foamBottom: 132,
  },
  /** Pilsner flute: strongly conical, footless — the pokal is `footed`. */
  pilsner: {
    clip: closed("pilsner"),
    strokes: [BODY.pilsner, RIM.pilsner],
    foamTop: 40,
    foamBottom: 120,
  },
  /** Stange: the tall, narrow Kölsch cylinder. */
  stange: {
    clip: closed("stange"),
    strokes: [BODY.stange, RIM.stange],
    foamTop: 36,
    foamBottom: 104,
  },
  /** Nonic pint, with the ridge a quarter down from the rim. */
  pint: {
    clip: closed("pint"),
    strokes: [BODY.pint, RIM.pint],
    foamTop: 40,
    foamBottom: 120,
  },
  /** Stemmed tulip: bulbous bowl, pinched waist, flared rim. */
  tulip: {
    clip: closed("tulip"),
    strokes: [BODY.tulip, RIM.tulip, "M84 340 C100 346, 156 346, 172 340"],
    foamTop: 34,
    foamBottom: 112,
    liquidBottom: 240,
  },
  /** Beer-garden mug, body shifted left to make room for the handle. */
  mug: {
    clip: closed("mug"),
    strokes: [
      BODY.mug,
      RIM.mug,
      "M162 104 C208 112, 208 240, 162 248",
      "M162 126 C190 134, 190 218, 162 226",
    ],
    foamTop: 50,
    foamBottom: 130,
  },
  /**
   * Footed glass with a flared rim and a ringed base. Drawn in its own taller
   * coordinate space, padded horizontally to the same 2:3 box as the rest.
   */
  footed: {
    viewBox: "-42.7 0 341.3 512",
    clip: closed("footed"),
    strokes: [
      BODY.footed,
      RIM.footed,
      "M91 450 C86 458, 82 467, 82 476 C82 491, 174 491, 174 476 C174 467, 170 458, 165 450",
      "M88 460 C105 470, 151 470, 168 460",
      "M84 476 C103 487, 153 487, 172 476",
    ],
    strokeWidth: 10,
    foamTop: 44,
    foamBottom: 150,
  },
};

type Props = {
  /** EBC window for the style — painted as a gradient, light on top. */
  ebc: Range;
  /** Must be unique per rendered glass; the slug works. */
  id: string;
  /** Glassware the style is served in. */
  shape?: GlassShape;
  className?: string;
};

/** A glass filled with the style's actual colour, straight from its EBC range. */
export default function BeerGlass({
  ebc,
  id,
  shape = "tumbler",
  className,
}: Props) {
  const clipId = `glass-clip-${id}`;
  const fillId = `glass-fill-${id}`;
  const spec = SHAPES[shape];

  const viewBox = spec.viewBox ?? DEFAULT_VIEW_BOX;
  const [boxX, , boxWidth, boxHeight] = viewBox.split(/\s+/).map(Number);
  const liquidBottom = spec.liquidBottom ?? boxHeight;

  return (
    <svg
      viewBox={viewBox}
      className={className}
      role="img"
      aria-label={`Цвят на бирата: ${ebc[0]}–${ebc[1]} EBC`}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={spec.clip} />
        </clipPath>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ebcToColor(ebc[0])} />
          <stop offset="100%" stopColor={ebcToColor(ebc[1])} />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect
          x={boxX}
          y={spec.foamBottom}
          width={boxWidth}
          height={liquidBottom - spec.foamBottom}
          fill={`url(#${fillId})`}
        />
        <rect
          x={boxX}
          y={spec.foamTop}
          width={boxWidth}
          height={spec.foamBottom - spec.foamTop}
          fill="#fffdf7"
        />
      </g>

      {spec.strokes.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="#a8a29e"
          strokeWidth={spec.strokeWidth ?? DEFAULT_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
