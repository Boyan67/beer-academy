import { Lightbulb } from "lucide-react";

import Section from "./Section";

type Props = {
  fact: string;
};

export default function StyleFact({ fact }: Props) {
  return (
    <Section icon={Lightbulb} title="Интересен факт">
      <p className="text-base leading-relaxed text-stone-700">{fact}</p>
    </Section>
  );
}
