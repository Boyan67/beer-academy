import type { HopSchedule } from "@/lib/beer-guide/types";

export type HopStage = {
  key: keyof HopSchedule;
  label: string;
};

/** Hot to cold, left to right — the order the hops actually go in. */
export const HOP_STAGES: HopStage[] = [
  {
    key: "bittering",
    label: "Горчивина",
  },
  {
    key: "flavour",
    label: "Вкус",
  },
  {
    key: "dryHop",
    label: "Сухо охмеляване",
  },
];
