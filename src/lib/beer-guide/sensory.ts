import type { SensoryProfile } from "@/lib/beer-guide/types";

export type SensoryAspect = {
  key: keyof SensoryProfile;
  label: string;
  accent: string;
};

/** In tasting order, left to right — you look, then smell, then drink. */
export const SENSORY_ASPECTS: SensoryAspect[] = [
  {
    key: "appearance",
    label: "Външен вид",
    accent: "#a16207",
  },
  {
    key: "aroma",
    label: "Аромат",
    accent: "#7c3aed",
  },
  {
    key: "flavour",
    label: "Вкус",
    accent: "#be123c",
  },
];
