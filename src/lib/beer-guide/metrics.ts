import { Flame, FlaskConical, Gauge, Hop, Palette, Scale } from "lucide-react";

import type {
  MetricDefinition,
  MetricKey,
  Range,
} from "@/lib/beer-guide/types";
import { METRIC_KEYS } from "@/lib/beer-guide/types";

/**
 * The six axes of the spider chart. `scale` is deliberately shared across all
 * styles in the guide rather than fitted per style — the whole point is that
 * the silhouette of a stout should look different from the silhouette of a
 * helles at a glance.
 */
export const METRICS: Record<MetricKey, MetricDefinition> = {
  og: {
    key: "og",
    label: "OG",
    name: "Начална плътност",
    hint: "Захарите в пивната мъст преди ферментация.",
    unit: "",
    decimals: 3,
    scale: [1.028, 1.115],
    color: "#c2410c",
    icon: Gauge,
  },
  fg: {
    key: "fg",
    label: "FG",
    name: "Крайна плътност",
    hint: "Каквото маята не е изяла — усеща се като плътност.",
    unit: "",
    decimals: 3,
    scale: [1.002, 1.03],
    color: "#0e7490",
    icon: FlaskConical,
  },
  ibu: {
    key: "ibu",
    label: "IBU",
    name: "Горчивина",
    hint: "Изохумулонови киселини от хмела. Над 40 се усеща ясно.",
    unit: "",
    decimals: 0,
    scale: [0, 90],
    color: "#4d7c0f",
    icon: Hop,
  },
  ebc: {
    key: "ebc",
    label: "EBC",
    name: "Цвят",
    hint: "От сламено жълто (4) до непрогледно черно (80).",
    unit: "",
    decimals: 0,
    scale: [0, 80],
    // Compressed: без това всички светли стилове се сливат в една точка.
    curve: 0.5,
    color: "#a16207",
    icon: Palette,
  },
  abv: {
    key: "abv",
    label: "ABV",
    name: "Алкохол",
    hint: "Обемни проценти алкохол в готовата бира.",
    unit: "%",
    decimals: 1,
    scale: [2.8, 12],
    color: "#be123c",
    icon: Flame,
  },
  bugu: {
    key: "bugu",
    label: "BU/GU",
    name: "Баланс",
    hint: "Горчивина спрямо плътност. Под 0.4 — малцово, над 0.8 — хмелово.",
    unit: "",
    decimals: 2,
    scale: [0, 1.3],
    color: "#7c3aed",
    icon: Scale,
  },
};

export const METRIC_LIST: MetricDefinition[] = METRIC_KEYS.map(
  (key) => METRICS[key],
);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Maps a raw value onto 0–1 using the metric's shared scale and curve. */
export function normalise(value: number, metric: MetricDefinition): number {
  const [min, max] = metric.scale;
  const linear = clamp01((value - min) / (max - min));
  return metric.curve ? Math.pow(linear, metric.curve) : linear;
}

export function midpoint([min, max]: Range): number {
  return (min + max) / 2;
}

export function formatValue(value: number, metric: MetricDefinition): string {
  return value.toFixed(metric.decimals) + metric.unit;
}

/** "1.044–1.052", "8–15", "4.3–5.6%" — collapses to one number if equal. */
export function formatRange(range: Range, metric: MetricDefinition): string {
  const [min, max] = range;
  if (min === max) return formatValue(min, metric);
  return `${min.toFixed(metric.decimals)}–${formatValue(max, metric)}`;
}

type ColorStop = { ebc: number; rgb: [number, number, number] };

/**
 * Standard EBC colour chart, as interpolatable stops rather than the usual
 * step lookup — the detail page paints a gradient across a style's whole
 * colour window, so it needs the values in between.
 */
const EBC_STOPS: ColorStop[] = [
  { ebc: 2, rgb: [255, 230, 153] },
  { ebc: 4, rgb: [255, 208, 96] },
  { ebc: 6, rgb: [255, 194, 77] },
  { ebc: 8, rgb: [255, 185, 56] },
  { ebc: 12, rgb: [243, 164, 23] },
  { ebc: 16, rgb: [229, 137, 11] },
  { ebc: 20, rgb: [222, 124, 0] },
  { ebc: 25, rgb: [203, 98, 0] },
  { ebc: 30, rgb: [187, 81, 0] },
  { ebc: 35, rgb: [166, 62, 0] },
  { ebc: 40, rgb: [155, 50, 0] },
  { ebc: 50, rgb: [123, 26, 0] },
  { ebc: 60, rgb: [90, 13, 0] },
  { ebc: 70, rgb: [66, 6, 7] },
  { ebc: 80, rgb: [42, 4, 6] },
  { ebc: 120, rgb: [16, 4, 8] },
];

const toHex = ([r, g, b]: [number, number, number]) =>
  "#" +
  [r, g, b]
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("");

/** Approximate beer colour for an EBC reading. */
export function ebcToColor(ebc: number): string {
  const first = EBC_STOPS[0];
  const last = EBC_STOPS[EBC_STOPS.length - 1];
  if (ebc <= first.ebc) return toHex(first.rgb);
  if (ebc >= last.ebc) return toHex(last.rgb);

  for (let i = 1; i < EBC_STOPS.length; i++) {
    const upper = EBC_STOPS[i];
    if (ebc > upper.ebc) continue;

    const lower = EBC_STOPS[i - 1];
    const t = (ebc - lower.ebc) / (upper.ebc - lower.ebc);
    return toHex([
      lower.rgb[0] + (upper.rgb[0] - lower.rgb[0]) * t,
      lower.rgb[1] + (upper.rgb[1] - lower.rgb[1]) * t,
      lower.rgb[2] + (upper.rgb[2] - lower.rgb[2]) * t,
    ]);
  }

  return toHex(last.rgb);
}
