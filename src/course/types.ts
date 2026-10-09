import type { LucideIcon } from "lucide-react";

import type { GlassShape, Range } from "@/lib/beer-guide/types";

/** Something drawn above a prompt or inside an option. */
export type Visual = {
  glass?: GlassShape;
  ebc?: Range;
  img?: string;
};

export type Option = { label: string; visual?: Visual };

type Base = { id: string; prompt: string; visual?: Visual; explain: string };

export type Question = Base &
  (
    | { kind: "choice"; options: Option[]; answer: number }
    | { kind: "multi"; options: Option[]; answer: number[] }
    /** `items` are shown shuffled; `answer` is their indices in the right order. */
    | { kind: "order"; items: string[]; answer: number[]; hint: [string, string] }
    /** Correct anywhere inside `answer`. */
    | { kind: "slider"; min: number; max: number; step: number; unit: string; answer: Range }
  );

/** choice → option index, multi/order → indices, slider → value. */
export type Answer = number | number[];

export type StylePart =
  | "intro"
  | "stats"
  | "sensory"
  | "malts"
  | "hops"
  | "yeast"
  | "traits"
  | "history"
  | "fact";

export type Card =
  | { kind: "text"; title: string; body: string; icon?: LucideIcon; visual?: Visual }
  | { kind: "style"; slug: string; part: StylePart };

export type Step = { card: Card } | { question: Question };

export type Lesson = {
  id: string;
  title: string;
  /** One line under the title on the lesson overview. */
  description: string;
  /** Glass + colour on the lesson node. */
  visual?: Visual;
  /** Built fresh on every start, so retries shuffle. */
  steps: () => Step[];
  /** Everything this lesson can ask — feeds the final test. */
  pool: () => Question[];
};

export type Chapter = { title: string; lessons: Lesson[] };

export type Course = {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
};
