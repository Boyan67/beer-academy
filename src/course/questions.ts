import { BEER_STYLES, FAMILIES } from "@/lib/beer-guide/styles";
import { METRICS, formatRange, midpoint } from "@/lib/beer-guide/metrics";
import type { BeerStyle, GlassShape, Range } from "@/lib/beer-guide/types";
import type { Answer, Option, Question } from "@/course/types";

export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const sample = <T,>(items: readonly T[], n: number) => shuffle(items).slice(0, n);

/** Puts the right option among the distractors at a random spot. */
function choice(
  base: Omit<Extract<Question, { kind: "choice" }>, "kind" | "options" | "answer">,
  right: Option,
  wrong: Option[],
): Question {
  const options = shuffle([right, ...wrong]);
  return { kind: "choice", ...base, options, answer: options.indexOf(right) };
}

export function trueFalse(id: string, prompt: string, isTrue: boolean, explain: string): Question {
  return {
    kind: "choice",
    id,
    prompt,
    explain,
    options: [{ label: "Вярно" }, { label: "Грешно" }],
    answer: isTrue ? 0 : 1,
  };
}

/** Hand-written choice: `options[0]` is the right one. */
export function choiceFirstRight(id: string, prompt: string, options: (string | Option)[], explain: string, visual?: Question["visual"]): Question {
  const [right, ...wrong] = options.map((o) => (typeof o === "string" ? { label: o } : o));
  return choice({ id, prompt, explain, visual }, right, wrong);
}

export function checkAnswer(q: Question, a: Answer | undefined): boolean {
  if (a === undefined) return false;
  switch (q.kind) {
    case "choice":
      return a === q.answer;
    case "slider":
      return typeof a === "number" && a >= q.answer[0] - 1e-9 && a <= q.answer[1] + 1e-9;
    case "multi": {
      const picked = [...(a as number[])].sort();
      const right = [...q.answer].sort();
      return picked.length === right.length && picked.every((v, i) => v === right[i]);
    }
    case "order":
      return (a as number[]).every((v, i) => v === q.answer[i]);
  }
}

const overlaps = (a: Range, b: Range) => a[0] <= b[1] && b[0] <= a[1];

/** Same family first — telling a helles from a pils is harder than from a stout. */
function others(style: BeerStyle, ok: (s: BeerStyle) => boolean = () => true) {
  const rest = shuffle(BEER_STYLES.filter((s) => s.slug !== style.slug && ok(s)));
  return [...rest.filter((s) => s.family === style.family), ...rest.filter((s) => s.family !== style.family)];
}

const maskName = (text: string, name: string) =>
  name.split(" / ").reduce((t, n) => t.replaceAll(n, "▁▁▁"), text);

/** Canonical base malt, so "German Pilsner Malt" and "Pilsner Malt" don't compete. */
export function baseMalt(name: string): string {
  if (/pilsner/i.test(name)) return "Пилзнер малц";
  if (/pale|maris otter/i.test(name)) return "Пейл ейл малц";
  if (/wheat/i.test(name)) return "Пшеничен малц";
  if (/rauch/i.test(name)) return "Опушен малц (Rauchmalz)";
  if (/vienna/i.test(name)) return "Виенски малц";
  if (/munich/i.test(name)) return "Мюнхенски малц";
  return name;
}
export const GLASS_NAMES: Record<GlassShape, string> = {
  tumbler: "Шейкър",
  weizen: "Вайцен",
  pilsner: "Пилзнер",
  stange: "Щанге",
  pint: "Пинта",
  tulip: "Лале",
  mug: "Халба",
  footed: "Бокал",
};

const BASE_MALTS = ["Пилзнер малц", "Пейл ейл малц", "Пшеничен малц", "Виенски малц", "Мюнхенски малц", "Опушен малц (Rauchmalz)"];

/** Every generated question for one style. Lessons pick from it; tests use all. */
export function styleQuestions(s: BeerStyle): Question[] {
  const qs: Question[] = [];
  const glass = s.glass ?? "tumbler";
  const id = (k: string) => `${k}:${s.slug}`;

  qs.push(
    choice(
      { id: id("summary"), prompt: `За кой стил става дума?\n\n„${maskName(s.summary, s.name)}“`, explain: `Това е ${s.name}.` },
      { label: s.name },
      others(s).slice(0, 3).map((o) => ({ label: o.name })),
    ),
  );

  // Distinguishable by glass or by colour, or the question has two right answers.
  const distinct = (o: BeerStyle) => (o.glass ?? "tumbler") !== glass || !overlaps(o.stats.ebc, s.stats.ebc);
  qs.push(
    choice(
      {
        id: id("glass"),
        prompt: "Коя бира би била в тази чаша, с този цвят?",
        visual: { glass, ebc: s.stats.ebc },
        explain: `${s.name}: ${formatRange(s.stats.ebc, METRICS.ebc)} EBC.`,
      },
      { label: s.name },
      others(s, distinct)
        .slice(0, 3)
        .map((o) => ({ label: o.name })),
    ),
  );

  // Picture answers: four glasses filled with this style's colour.
  const glassOption = (shape: GlassShape) => ({ label: GLASS_NAMES[shape], visual: { glass: shape, ebc: s.stats.ebc } });
  qs.push(
    choice(
      { id: id("serve"), prompt: `В коя чаша традиционно се сервира ${s.name}?`, explain: `${s.name} се налива в чаша ${GLASS_NAMES[glass]}.` },
      glassOption(glass),
      sample((Object.keys(GLASS_NAMES) as GlassShape[]).filter((g) => g !== glass), 3).map(glassOption),
    ),
  );

  const abv = (r: Range) => formatRange(r, METRICS.abv);
  qs.push(
    choice(
      { id: id("abv"), prompt: `Какъв е типичният алкохол на ${s.name}?`, explain: `${s.name}: ${abv(s.stats.abv)}.` },
      { label: abv(s.stats.abv) },
      others(s, (o) => Math.abs(midpoint(o.stats.abv) - midpoint(s.stats.abv)) >= 1)
        .filter((o, i, arr) => arr.findIndex((x) => abv(x.stats.abv) === abv(o.stats.abv)) === i)
        .slice(0, 3)
        .map((o) => ({ label: abv(o.stats.abv) })),
    ),
  );

  // Wrong aromas must be clearly wrong: taken from beers of a very different
  // colour, skipping vague hop/malt notes and anything sharing a word with ours.
  const ownWords = new Set(Object.values(s.sensory).flat().join(" ").toLowerCase().split(/[\s,]+/).filter((w) => w.length > 3));
  const decoys = [...new Set(others(s, (o) => Math.abs(midpoint(o.stats.ebc) - midpoint(s.stats.ebc)) >= 20).flatMap((o) => o.sensory.aroma))]
    .filter((a) => !/хмел|малц|чист/i.test(a) && !a.toLowerCase().split(/[\s,]+/).some((w) => ownWords.has(w)))
    .slice(0, 3);
  const aromaOptions = shuffle([...s.sensory.aroma, ...decoys]);
  qs.push({
    kind: "multi",
    id: id("aroma"),
    prompt: `Кои аромати са типични за ${s.name}? Избери всички верни.`,
    options: aromaOptions.map((label) => ({ label })),
    answer: s.sensory.aroma.map((a) => aromaOptions.indexOf(a)),
    explain: `Аромат: ${s.sensory.aroma.join(", ")}.`,
  });

  qs.push({
    kind: "slider",
    id: id("ibu"),
    prompt: `Колко горчива е ${s.name}? Плъзни до типичния IBU.`,
    min: 0,
    max: 100,
    step: 1,
    unit: "IBU",
    answer: s.stats.ibu,
    explain: `${s.name}: ${formatRange(s.stats.ibu, METRICS.ibu)} IBU.`,
  });

  const bitterer = others(s, (o) => !overlaps(o.stats.ibu, s.stats.ibu))[0];
  if (bitterer) {
    const more = midpoint(bitterer.stats.ibu) > midpoint(s.stats.ibu) ? bitterer : s;
    qs.push(
      choice(
        {
          id: id("bitter"),
          prompt: "Коя е по-горчива?",
          explain: `${s.name}: ${formatRange(s.stats.ibu, METRICS.ibu)} IBU, ${bitterer.name}: ${formatRange(bitterer.stats.ibu, METRICS.ibu)} IBU.`,
        },
        { label: more.name },
        [{ label: (more === s ? bitterer : s).name }],
      ),
    );
  }

  // Three or four styles whose colour midpoints sit clearly apart.
  const ladder = [s];
  for (const o of others(s)) {
    if (ladder.length === 4) break;
    if (ladder.every((l) => Math.abs(midpoint(l.stats.ebc) - midpoint(o.stats.ebc)) >= 8)) ladder.push(o);
  }
  if (ladder.length >= 3) {
    const items = shuffle(ladder);
    const sorted = [...items].sort((a, b) => midpoint(a.stats.ebc) - midpoint(b.stats.ebc));
    qs.push({
      kind: "order",
      id: id("color"),
      prompt: "Подреди по цвят — от най-светлата до най-тъмната.",
      items: items.map((x) => x.name),
      answer: sorted.map((x) => items.indexOf(x)),
      hint: ["Светла", "Тъмна"],
      explain: sorted.map((x) => `${x.name} (${formatRange(x.stats.ebc, METRICS.ebc)} EBC)`).join(" → "),
    });
  }

  const main = [...s.malts].sort((a, b) => midpoint(b.share) - midpoint(a.share))[0];
  const ownMalts = new Set(s.malts.map((m) => baseMalt(m.name)));
  qs.push(
    choice(
      { id: id("malt"), prompt: `Кой малц е основата на ${s.name}?`, explain: s.malt },
      { label: baseMalt(main.name) },
      sample(BASE_MALTS.filter((m) => !ownMalts.has(m)), 3).map((label) => ({ label })),
    ),
  );

  const dry = s.hopSchedule.dryHop.length > 0;
  qs.push(
    trueFalse(
      id("dryhop"),
      `${s.name} традиционно се охмелява сухо (dry hop).`,
      dry,
      dry ? `Да — сухо охмеляване с ${s.hopSchedule.dryHop.join(", ")}.` : `Не. ${s.hops}`,
    ),
  );

  qs.push(
    choice(
      { id: id("family"), prompt: `${s.name} е…`, explain: `${s.name} е ${FAMILIES[s.family].short.toLowerCase()}. ${s.yeast}` },
      { label: FAMILIES[s.family].short },
      [{ label: FAMILIES[s.family === "lager" ? "ale" : "lager"].short }],
    ),
  );

  return qs;
}
