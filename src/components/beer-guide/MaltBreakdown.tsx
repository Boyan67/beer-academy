
import { useState } from "react";
import { Info, Wheat, X } from "lucide-react";

import Section from "@/components/beer-guide/Section";
import {
  MALT_IMAGES,
  circleDiameter,
  formatShare,
  maltTrack,
} from "@/lib/beer-guide/malts";
import type { MaltComponent } from "@/lib/beer-guide/types";

const ACCENT = "#a16207";

type Props = {
  malts: MaltComponent[];
  /** The prose bill, revealed by the info icon. */
  text: string;
};

export default function MaltBreakdown({ malts, text }: Props) {
  const [showText, setShowText] = useState(false);

  const largest = Math.max(
    ...malts.map((malt) => (malt.share[0] + malt.share[1]) / 2),
  );
  const track = maltTrack(malts.length);

  return (
    <Section
      icon={Wheat}
      title="Малц"
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

      <div className="flex items-start justify-center gap-3 py-1">
        {malts.map((malt) => {
          const size = circleDiameter(malt.share, largest, malts.length);

          return (
            <div
              key={malt.name}
              className="flex min-w-0 flex-1 flex-col items-center"
              style={{ maxWidth: track + 24 }}
            >
              {/* Fixed-height track keeps every circle sitting on one baseline,
                  even when a label below wraps to two lines. */}
              <div
                className="flex items-end justify-center"
                style={{ height: track }}
              >
                <div
                  className="relative overflow-hidden rounded-full ring-1 ring-black/5"
                  style={{ width: size, height: size }}
                >
                  <img
                    src={MALT_IMAGES[malt.malt]}
                    alt={malt.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="mt-3 text-lg font-extrabold leading-none tabular-nums text-stone-900">
                {formatShare(malt.share)}
              </div>
              <div className="mt-1 text-center text-[12px] leading-snug text-stone-700">
                {malt.name}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
