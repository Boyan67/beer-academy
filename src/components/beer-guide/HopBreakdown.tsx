
import { useState } from "react";
import { Hop, Info, X } from "lucide-react";

import Section from "@/components/beer-guide/Section";
import { HOP_STAGES } from "@/lib/beer-guide/hops";
import type { HopSchedule } from "@/lib/beer-guide/types";

type Props = {
  schedule: HopSchedule;
  /** The full hop bill, revealed by the info icon. */
  text: string;
};

export default function HopBreakdown({ schedule, text }: Props) {
  const [showText, setShowText] = useState(false);
  const stages = HOP_STAGES.filter((stage) => schedule[stage.key].length > 0);

  return (
    <Section
      icon={Hop}
      title="Хмел"
      action={
        <button
          type="button"
          onClick={() => setShowText((open) => !open)}
          aria-expanded={showText}
          aria-label={showText ? "Скрий описанието" : "Покажи пълното описание"}
          className={`-my-2 -mr-2 flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
            showText
              ? "bg-stone-100"
              : "text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          }`}
        >
          {showText ? <X size={16} /> : <Info size={20} />}
        </button>
      }
    >
      {showText && (
        <p className="mb-5 rounded-xl bg-stone-50 p-3.5 text-sm leading-relaxed text-stone-600 duration-300 animate-in fade-in slide-in-from-top-1">
          {text}
        </p>
      )}

      {/* Only the stages the style actually uses; divide-x draws a rule
          between the columns without boxing them in. */}
      <div
        className="grid divide-x divide-stone-200 pt-1"
        style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
      >
        {stages.map((stage) => (
          <div key={stage.key} className="flex flex-col items-center px-2 py-1">
            <div className="text-center text-xs font-semibold uppercase leading-tight tracking-wider text-stone-500">
              {stage.label}
            </div>

            <ul className="mt-3 space-y-2">
              {schedule[stage.key].map((variety) => (
                <li
                  key={variety}
                  className="text-center text-sm font-semibold leading-snug text-stone-800"
                >
                  {variety}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
