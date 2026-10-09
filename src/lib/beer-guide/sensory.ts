import type { SensoryProfile } from "@/lib/beer-guide/types";

export type SensoryAspect = {
  key: keyof SensoryProfile;
  label: string;
};

/** In tasting order, left to right — you look, then smell, then drink. */
export const SENSORY_ASPECTS: SensoryAspect[] = [
  {
    key: "appearance",
    label: "Външен вид",
  },
  {
    key: "aroma",
    label: "Аромат",
  },
  {
    key: "flavour",
    label: "Вкус",
  },
];
