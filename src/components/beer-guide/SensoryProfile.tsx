import { Citrus } from "lucide-react";

import Section from "@/components/beer-guide/Section";
import { SENSORY_ASPECTS } from "@/lib/beer-guide/sensory";
import type { SensoryProfile as Profile } from "@/lib/beer-guide/types";

const ACCENT = "#be123c";

type Props = {
  sensory: Profile;
};

/** The tasting note, three columns wide — same layout as the hop schedule. */
export default function SensoryProfile({ sensory }: Props) {
  return (
    <Section icon={Citrus} title="Вкусов профил" accent={ACCENT}>
      {/* divide-x draws a rule between the columns without boxing them in */}
      <div className="grid grid-cols-3 divide-x divide-stone-200 pt-1">
        {SENSORY_ASPECTS.map((aspect) => (
          <div key={aspect.key} className="flex flex-col items-center px-2 py-1">
            <div
              className="text-center text-[12px] font-bold uppercase leading-tight tracking-wider"
              style={{ color: aspect.accent }}
            >
              {aspect.label}
            </div>

            <ul className="mt-3 space-y-2">
              {sensory[aspect.key].map((note) => (
                <li
                  key={note}
                  className="text-center text-[13px] font-semibold leading-snug text-stone-800"
                >
                  {note}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
