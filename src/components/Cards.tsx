import { useId } from "react";
import { Landmark, Lightbulb, Thermometer, type LucideIcon } from "lucide-react";

import BeerGlass from "@/components/beer-guide/BeerGlass";
import HopBreakdown from "@/components/beer-guide/HopBreakdown";
import MaltBreakdown from "@/components/beer-guide/MaltBreakdown";
import SensoryProfile from "@/components/beer-guide/SensoryProfile";
import StyleRadar from "@/components/beer-guide/StyleRadar";
import type { Card, Visual } from "@/course/types";
import { METRIC_LIST, formatRange } from "@/lib/beer-guide/metrics";
import { FAMILIES, getStyleBySlug } from "@/lib/beer-guide/styles";

export function VisualView({ v, className = "h-36" }: { v: Visual; className?: string }) {
  const id = useId().replace(/:/g, "");
  if (v.img) return <img src={v.img} alt="" className={`${className} aspect-square rounded-full object-cover`} />;
  if (v.glass) return <BeerGlass id={id} shape={v.glass} ebc={v.ebc ?? [8, 12]} className={className} />;
  return null;
}

/**
 * Uxcel's illustration frame: a raised border around a coloured panel. `brand`
 * is the dark green the glasses sit on; `paper` hosts the light guide widgets.
 */
export function Figure({ tone = "brand", children }: { tone?: "brand" | "paper"; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-raised p-2">
      <div
        className={`flex min-h-48 flex-col items-center justify-center rounded-xl p-5 ${
          tone === "brand" ? "bg-brand" : "bg-white text-stone-900"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

const IconArt = ({ icon: Icon }: { icon: LucideIcon }) => <Icon size={72} strokeWidth={1.5} className="text-accent" />;

type Section = { title: string; figure?: React.ReactNode; body?: React.ReactNode };

/** One reading section — what Uxcel calls an exercise. */
export function Exercise({ card, n }: { card: Card; n: number }) {
  const { title, figure, body } = section(card);
  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-muted">Част #{n}</p>
        <h2 className="mt-1 text-2xl font-extrabold leading-tight">{title}</h2>
      </div>
      {figure}
      {body && <div className="space-y-4 text-[17px] leading-relaxed text-ink/85">{body}</div>}
    </section>
  );
}

function section(card: Card): Section {
  if (card.kind === "text") {
    return {
      title: card.title,
      figure: card.visual ? (
        <Figure tone={card.visual.img ? "paper" : "brand"}>
          <VisualView v={card.visual} className="h-40" />
        </Figure>
      ) : card.icon ? (
        <Figure>
          <IconArt icon={card.icon} />
        </Figure>
      ) : undefined,
      body: <p>{card.body}</p>,
    };
  }

  const s = getStyleBySlug(card.slug)!;
  switch (card.part) {
    case "intro":
      return {
        title: `Какво е ${s.name}?`,
        figure: (
          <Figure>
            <BeerGlass id={`intro-${s.slug}`} shape={s.glass} ebc={s.stats.ebc} className="h-44" />
            <div className="mt-4 flex gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
              <span className="rounded-full bg-white/10 px-2.5 py-1">BJCP {s.code}</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1">{FAMILIES[s.family].short}</span>
            </div>
          </Figure>
        ),
        body: <p>{s.summary}</p>,
      };
    case "stats":
      return {
        title: "Числата",
        figure: (
          <Figure tone="paper">
            <StyleRadar stats={s.stats} className="w-full max-w-[300px]" />
          </Figure>
        ),
        body: (
          <dl className="grid grid-cols-2 gap-2">
            {METRIC_LIST.map((m) => (
              <div key={m.key} className="rounded-xl bg-surface p-3">
                <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  {m.label} · {m.name}
                </dt>
                <dd className="mt-0.5 text-lg font-extrabold tabular-nums text-ink">{formatRange(s.stats[m.key], m)}</dd>
              </div>
            ))}
          </dl>
        ),
      };
    case "sensory":
      return {
        title: "Вкусов профил",
        figure: (
          <Figure tone="paper">
            <div className="w-full">
              <SensoryProfile sensory={s.sensory} />
            </div>
          </Figure>
        ),
        body: <p>Гледаш, мирисаш, пиеш — в този ред съдиите описват {s.name}.</p>,
      };
    case "malts":
      return {
        title: "Малцът",
        figure: (
          <Figure tone="paper">
            <div className="w-full">
              <MaltBreakdown malts={s.malts} text={s.malt} />
            </div>
          </Figure>
        ),
        body: <p>{s.malt}</p>,
      };
    case "hops":
      return {
        title: "Хмелът",
        figure: (
          <Figure tone="paper">
            <div className="w-full">
              <HopBreakdown schedule={s.hopSchedule} text={s.hops} />
            </div>
          </Figure>
        ),
        body: <p>{s.hops}</p>,
      };
    case "yeast":
      return {
        title: "Мая и ферментация",
        figure: (
          <Figure>
            <Thermometer size={56} strokeWidth={1.5} className="text-accent" />
            <p className="mt-3 text-4xl font-extrabold tabular-nums text-white">
              {s.fermentation[0]}–{s.fermentation[1]} °C
            </p>
          </Figure>
        ),
        body: (
          <>
            <p>{s.yeast}</p>
            <p>{s.fermentationNote}</p>
          </>
        ),
      };
    case "traits":
      return {
        title: `Какво отличава ${s.name}`,
        body: s.traits.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3 rounded-2xl bg-surface p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-accent">
              <Icon size={22} />
            </span>
            <div>
              <h3 className="font-bold text-ink">{title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{text}</p>
            </div>
          </div>
        )),
      };
    case "history":
      return {
        title: "История",
        figure: (
          <Figure>
            <IconArt icon={Landmark} />
          </Figure>
        ),
        body: <p>{s.history}</p>,
      };
    case "fact":
      return {
        title: "Интересен факт",
        body: (
          <div className="flex gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4">
            <Lightbulb className="shrink-0 text-accent" />
            <p>{s.fact}</p>
          </div>
        ),
      };
  }
}
