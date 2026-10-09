import type { LucideIcon } from "lucide-react";

/** A min–max window, as printed in the BJCP style tables. */
export type Range = readonly [min: number, max: number];

export const METRIC_KEYS = ["og", "fg", "ibu", "ebc", "abv", "bugu"] as const;

export type MetricKey = (typeof METRIC_KEYS)[number];

export type MetricDefinition = {
  key: MetricKey;
  /** Short axis label used on the spider chart. */
  label: string;
  /** Full name, spelled out in the value grid. */
  name: string;
  /** One line explaining what the number actually means. */
  hint: string;
  unit: string;
  decimals: number;
  /**
   * Global window used to normalise every style onto the same chart, so two
   * styles can be compared by shape alone.
   */
  scale: Range;
  /**
   * Exponent applied after normalising. Values below 1 stretch the low end of
   * the axis — needed for EBC, where most styles sit under 30 but the stouts
   * reach 79 and would flatten everything else.
   */
  curve?: number;
  color: string;
  icon: LucideIcon;
};

/**
 * OG/FG/IBU/ABV come straight from the BJCP 2021 vital statistics. EBC is the
 * published SRM window converted with EBC = SRM x 1.97. BU:GU is derived as the
 * full window the style allows — lowest IBU over the densest wort, highest IBU
 * over the thinnest — so it is reproducible from the other two rows.
 */
export type BeerStyleStats = Record<MetricKey, Range>;

/** Grain photos available in /public/malts. */
export const MALT_KEYS = [
  "pilsner",
  "pale-ale",
  "wheat",
  "vienna",
  "cara-munich",
  "roasted-barley",
  "flakes",
  "oats",
] as const;

export type MaltKey = (typeof MALT_KEYS)[number];

export type MaltComponent = {
  /** Label under the circle — the specific malt, not the photo group. */
  name: string;
  /** Which grain photo to show. */
  malt: MaltKey;
  /** Share of the grist in percent; drives the circle size. */
  share: Range;
};

/**
 * Varieties grouped by when they go in. Any stage may be empty — a pilsner
 * never gets dry hopped, and a hazy IPA barely gets a bittering addition, which
 * is exactly the kind of thing the three columns are there to show.
 */
export type HopSchedule = {
  /** Early in the boil, for bitterness. */
  bittering: string[];
  /** Late boil and whirlpool, for flavour and aroma. */
  flavour: string[];
  /** After fermentation, cold. */
  dryHop: string[];
};

/**
 * The tasting note, split the way a judge fills in a scoresheet: what you see,
 * what you smell, what you taste. A handful of keywords per column, no prose.
 */
export type SensoryProfile = {
  appearance: string[];
  aroma: string[];
  flavour: string[];
};

/** Glassware the style is traditionally served in. */
export type GlassShape =
  | "tumbler"
  | "weizen"
  | "pilsner"
  | "stange"
  | "pint"
  | "tulip"
  | "mug"
  | "footed";

/** Broad grouping used by the filter chips on the listing page. */
export type StyleFamily = "lager" | "ale";

export type KeyTrait = {
  icon: LucideIcon;
  title: string;
  text: string;
};

export type BeerStyle = {
  slug: string;
  name: string;
  /** BJCP category code, e.g. "10A". */
  code: string;
  family: StyleFamily;
  /** Traditional glassware; falls back to the plain tumbler when unset. */
  glass?: GlassShape;
  /** Two sentences, no more — this is a quick-reference guide. */
  summary: string;
  stats: BeerStyleStats;
  /** Appearance, aroma and flavour as keywords. */
  sensory: SensoryProfile;
  /** Grist broken down for the circle chart. Shares are typical, not absolute. */
  malts: MaltComponent[];
  /** The full malt story — tucked behind the info icon. */
  malt: string;
  /** Varieties grouped by addition stage. */
  hopSchedule: HopSchedule;
  /** The full hop story — tucked behind the info icon. */
  hops: string;
  yeast: string;
  /** Fermentation temperature window in °C. */
  fermentation: Range;
  /** Extra note on the fermentation regime (lagering, dry hopping, ...). */
  fermentationNote: string;
  traits: KeyTrait[];
  history: string;
  fact: string;
};
