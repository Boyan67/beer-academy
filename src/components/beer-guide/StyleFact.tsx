import { Lightbulb } from "lucide-react";

import Section from "./Section";

type Props = {
  fact: string;
};

export default function StyleFact({ fact }: Props) {
  return (
    <Section icon={Lightbulb} title="Интересен факт" accent="#f59e0b">
      <p className="text-[15px] leading-relaxed text-stone-700">{fact}</p>
    </Section>
  );
}
