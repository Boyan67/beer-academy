import type { HopSchedule } from "@/lib/beer-guide/types";

export type HopStage = {
  key: keyof HopSchedule;
  label: string;
  accent: string;
};

/** Hot to cold, left to right — the order the hops actually go in. */
export const HOP_STAGES: HopStage[] = [
  {
    key: "bittering",
    label: "Bittering",
    accent: "#b45309",
  },
  {
    key: "flavour",
    label: "Flavour",
    accent: "#4d7c0f",
  },
  {
    key: "dryHop",
    label: "Dry hop",
    accent: "#0e7490",
  },
];
