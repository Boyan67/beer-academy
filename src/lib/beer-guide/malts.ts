import type { MaltKey, Range } from "@/lib/beer-guide/types";

/** Grain photos in /public/malts, one per visual grain group. */
export const MALT_IMAGES: Record<MaltKey, string> = {
  pilsner: "/malts/Pilsner.jpg",
  "pale-ale": "/malts/pale-ale.jpg",
  wheat: "/malts/wheat.jpg",
  vienna: "/malts/Vienna.jpg",
  "cara-munich": "/malts/Cara-munich.jpg",
  "roasted-barley": "/malts/roasted-barley.jpg",
  // No dedicated flaked-barley shot yet; flaked oats read the same visually.
  flakes: "/malts/oats.jpg",
  oats: "/malts/oats.jpg",
};

/** "100%", or "50–70%" for a range. */
export function formatShare([min, max]: Range): string {
  return min === max ? `${min}%` : `${min}–${max}%`;
}

/**
 * Floor that keeps a small addition big enough to still read as a grain photo.
 * It intentionally wins over strict proportionality at the bottom of the scale,
 * so shares below roughly 10% converge on the same size.
 */
const MIN_DIAMETER = 38;

/**
 * Biggest circle we can draw without the row wrapping on a ~320px phone card.
 * Three malts is the most any style in the guide uses.
 */
export function maltTrack(count: number): number {
  if (count <= 1) return 124;
  if (count === 2) return 112;
  return 88;
}

/**
 * The same track for the compare page, where each style only gets half the
 * card. The malts stack there, so each still has the full column width — a
 * lone malt just gets to fill more of it.
 */
export function maltCompareTrack(count: number): number {
  return count <= 1 ? 92 : 72;
}

/**
 * Circle diameter for a grist share. Area is proportional to the percentage
 * (so diameter follows the square root) — a 20% malt reads as a quarter of the
 * area of an 80% one, the way the eye expects. Small additions get a floor so a
 * 2% roasted barley is still a visible, recognisable grain.
 */
export function circleDiameter(
  share: Range,
  largestShare: number,
  count: number,
  track: number = maltTrack(count),
): number {
  const value = (share[0] + share[1]) / 2;
  // A narrower track shrinks the floor with it, so the smallest circle keeps
  // the same weight against its neighbours as it has on the style page.
  const floor = MIN_DIAMETER * (track / maltTrack(count));
  const scaled = track * Math.sqrt(value / largestShare);
  return Math.round(Math.max(floor, scaled));
}
