import { useId } from "react";
import { Landmark, Microscope, Thermometer } from "lucide-react";

import BeerGlass from "@/components/beer-guide/BeerGlass";
import HopBreakdown from "@/components/beer-guide/HopBreakdown";
import MaltBreakdown from "@/components/beer-guide/MaltBreakdown";
import Section from "@/components/beer-guide/Section";
import SensoryProfile from "@/components/beer-guide/SensoryProfile";
import StyleFact from "@/components/beer-guide/StyleFact";
import StyleRadar from "@/components/beer-guide/StyleRadar";
import type { Card, Visual } from "@/course/types";
import { METRIC_LIST, formatRange } from "@/lib/beer-guide/metrics";
import { FAMILIES, getStyleBySlug } from "@/lib/beer-guide/styles";

export function VisualView({ v, className = "h-36" }: { v: Visual; className?: string }) {
  const id = useId().replace(/:/g, "");
  if (v.img) return <img src={v.img} alt="" className={`${className} aspect-square rounded-full object-cover ring-1 ring-black/5`} />;
  if (v.glass) return <BeerGlass id={id} shape={v.glass} ebc={v.ebc ?? [8, 12]} className={className} />;
  return null;
}

export function CardView({ card }: { card: Card }) {
  if (card.kind === "text") {
    const Icon = card.icon;
    return (
      <div className="flex flex-col items-center gap-5 pt-4 text-center">
        {card.visual ? (
          <VisualView v={card.visual} className="h-44" />
        ) : (
          Icon && (
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Icon size={30} />
            </span>
          )
        )}
        <h2 className="text-2xl font-extrabold leading-tight">{card.title}</h2>
        <p className="text-[17px] leading-relaxed text-stone-700">{card.body}</p>
      </div>
    );
  }
  return <StylePartView slug={card.slug} part={card.part} />;
}

function StylePartView({ slug, part }: { slug: string; part: Extract<Card, { kind: "style" }>["part"] }) {
  const s = getStyleBySlug(slug)!;
  switch (part) {
    case "intro":
      return (
        <div className="flex flex-col items-center gap-4 pt-2 text-center">
          <BeerGlass id={`intro-${slug}`} shape={s.glass} ebc={s.stats.ebc} className="h-48" />
          <div className="flex gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
            <span className="rounded-full bg-white px-2.5 py-1">BJCP {s.code}</span>
            <span className="rounded-full bg-white px-2.5 py-1">{FAMILIES[s.family].short}</span>
          </div>
          <h2 className="text-3xl font-extrabold leading-tight">{s.name}</h2>
          <p className="text-[17px] leading-relaxed text-stone-700">{s.summary}</p>
        </div>
      );
    case "stats":
      return (
        <div className="space-y-4">
          <h2 className="text-center text-xl font-extrabold">Числата на {s.name}</h2>
          <StyleRadar stats={s.stats} className="mx-auto w-full max-w-[320px]" />
          <dl className="grid grid-cols-2 gap-2">
            {METRIC_LIST.map((m) => (
              <div key={m.key} className="rounded-xl bg-white p-3">
                <dt className="text-[11px] font-bold uppercase tracking-wider" style={{ color: m.color }}>
                  {m.label} · {m.name}
                </dt>
                <dd className="mt-0.5 text-lg font-extrabold tabular-nums">{formatRange(s.stats[m.key], m)}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "sensory":
      return <SensoryProfile sensory={s.sensory} />;
    case "malts":
      return <MaltBreakdown malts={s.malts} text={s.malt} />;
    case "hops":
      return <HopBreakdown schedule={s.hopSchedule} text={s.hops} />;
    case "yeast":
      return (
        <Section icon={Microscope} title="Мая и ферментация" accent="#7c3aed">
          <p className="text-[15px] leading-relaxed text-stone-700">{s.yeast}</p>
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-stone-50 p-3">
            <Thermometer className="shrink-0 text-accent" size={22} />
            <div>
              <div className="text-lg font-extrabold tabular-nums">
                {s.fermentation[0]}–{s.fermentation[1]} °C
              </div>
              <p className="text-[13px] leading-snug text-stone-600">{s.fermentationNote}</p>
            </div>
          </div>
        </Section>
      );
    case "traits":
      return (
        <div className="space-y-3">
          <h2 className="text-center text-xl font-extrabold">Какво отличава {s.name}</h2>
          {s.traits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3 rounded-xl border border-stone-200 bg-white p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Icon size={20} />
              </span>
              <div>
                <h3 className="font-bold">{title}</h3>
                <p className="text-[15px] leading-relaxed text-stone-700">{text}</p>
              </div>
            </div>
          ))}
        </div>
      );
    case "history":
      return (
        <Section icon={Landmark} title="История" accent="#0e7490">
          <p className="text-[15px] leading-relaxed text-stone-700">{s.history}</p>
        </Section>
      );
    case "fact":
      return <StyleFact fact={s.fact} />;
  }
}
