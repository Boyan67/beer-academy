
import { useState } from "react";
import { Hop, Info, X } from "lucide-react";

import Section from "@/components/beer-guide/Section";
import { HOP_STAGES } from "@/lib/beer-guide/hops";
import type { HopSchedule } from "@/lib/beer-guide/types";

const ACCENT = "#4d7c0f";

type Props = {
  schedule: HopSchedule;
  /** The full hop bill, revealed by the info icon. */
  text: string;
};

export default function HopBreakdown({ schedule, text }: Props) {
  const [showText, setShowText] = useState(false);

  return (
    <Section
      icon={Hop}
      title="Хмел"
      accent={ACCENT}
      action={
        <button
          type="button"
          onClick={() => setShowText((open) => !open)}
          aria-expanded={showText}
          aria-label={showText ? "Скрий описанието" : "Покажи пълното описание"}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
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
        <p className="mb-5 rounded-xl bg-stone-50 p-3.5 text-[14px] leading-relaxed text-stone-600 duration-300 animate-in fade-in slide-in-from-top-1">
          {text}
        </p>
      )}

      {/* divide-x draws a rule between the columns without boxing them in */}
      <div className="grid grid-cols-3 divide-x divide-stone-200 pt-1">
        {HOP_STAGES.map((stage) => {
          const varieties = schedule[stage.key];

          return (
            <div
              key={stage.key}
              className={`flex flex-col items-center px-2 py-1`}
            >
              <div
                className="text-center text-[12px] font-bold uppercase leading-tight tracking-wider"
                style={{ color: stage.accent }}
              >
                {stage.label}
              </div>

              {varieties.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {varieties.map((variety) => (
                    <li
                      key={variety}
                      className="text-center text-[13px] font-semibold leading-snug text-stone-800"
                    >
                      {variety}
                    </li>
                  ))}
                </ul>
              ) : (
                <div
                  className="mt-2.5 text-[13px] text-stone-300"
                  aria-label="Няма добавки на този етап"
                >
                  —
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
