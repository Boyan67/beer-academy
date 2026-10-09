import { Beer, Eye, Flame, Flower2, Hop, Microscope, Snowflake, Sparkles, Thermometer, Wheat } from "lucide-react";

import { HOP_STAGES } from "@/lib/beer-guide/hops";
import { MALT_IMAGES } from "@/lib/beer-guide/malts";
import { METRIC_LIST } from "@/lib/beer-guide/metrics";
import { SENSORY_ASPECTS } from "@/lib/beer-guide/sensory";
import type { GlassShape, MaltKey } from "@/lib/beer-guide/types";
import { choiceFirstRight as pick, trueFalse as tf } from "@/course/questions";
import type { Card, Lesson, Question, Step } from "@/course/types";

const card = (c: Omit<Extract<Card, { kind: "text" }>, "kind">): Step => ({ card: { kind: "text", ...c } });
const ask = (q: Question): Step => ({ question: q });

/** A basics lesson: steps built per start, the pool is every question in it. */
function lesson(id: string, title: string, visual: Lesson["visual"], build: () => Step[]): Lesson {
  return {
    id: `basics:${id}`,
    title,
    visual,
    steps: build,
    pool: () => build().flatMap((s) => ("question" in s ? [s.question] : [])),
  };
}

/** Extra line per metric, on top of the guide's own one-line hint. */
const METRIC_MORE: Record<string, string> = {
  og: "Колкото по-висока е, толкова повече храна има маята — и толкова по-силна може да стане бирата. Вода = 1.000.",
  fg: "Разликата между OG и FG е захарта, превърната в алкохол. Ниско FG = суха бира, високо FG = плътна и сладникава.",
  ibu: "Светъл лагер е около 20, американска IPA — 40 до 70. Над 100 езикът вече не усеща разлика.",
  ebc: "Пилзнерът е около 6, кехлибарените лагери — 20–30, стаутът — над 60. Американците ползват SRM ≈ EBC / 2.",
  abv: "Повечето бири са между 4 и 6%. Doppelbock и имперският стаут стигат до 10–12%.",
  bugu: "Същата горчивина се усеща различно в плътна и в лека бира — BU:GU ги изравнява.",
};

const numbers = lesson("numbers", "Числата", { glass: "tumbler", ebc: [8, 12] }, () => [
  card({
    title: "Шест числа описват всяка бира",
    body: "Плътност преди и след ферментация, горчивина, цвят, алкохол и баланс. С тях можеш да прочетеш един стил още преди да го опиташ.",
    icon: Sparkles,
  }),
  ...METRIC_LIST.slice(0, 3).map((m) => card({ title: `${m.label} — ${m.name}`, body: `${m.hint} ${METRIC_MORE[m.key]}`, icon: m.icon })),
  ask(pick("numbers:ibu", "Какво измерва IBU?", ["Горчивината", "Алкохола", "Цвета", "Плътността"], "International Bitterness Units — горчивината от хмела.")),
  ask(
    pick(
      "numbers:fg",
      "Две бири започват с еднакво OG. Тази с по-ниско FG е…",
      ["По-суха и по-силна", "По-сладка и по-лека", "По-тъмна", "По-горчива"],
      "Маята е изяла повече захар → повече алкохол, по-сухо тяло.",
    ),
  ),
  ...METRIC_LIST.slice(3).map((m) => card({ title: `${m.label} — ${m.name}`, body: `${m.hint} ${METRIC_MORE[m.key]}`, icon: m.icon })),
  ask(pick("numbers:ebc", "Коя скала описва цвета?", ["EBC", "IBU", "ABV", "OG"], "EBC — European Brewery Convention. SRM е американската.")),
  ask(
    pick(
      "numbers:bugu",
      "Бира с BU:GU 0.9 ще е…",
      ["Хмелова и горчива", "Малцова и сладка", "Кисела", "Опушена"],
      "Под 0.4 — малцово, над 0.8 — хмелово.",
    ),
  ),
  ask(tf("numbers:abv", "12% ABV е типично за светъл лагер.", false, "Светлите лагери са около 4.5–5.5%. 12% стига имперският стаут.")),
]);

const MALTS: { key: MaltKey; name: string; body: string }[] = [
  { key: "pilsner", name: "Пилзнер малц", body: "Най-светлата основа — 2–4 EBC. Чист, зърнен, леко меден. Гръбнакът на почти всички лагери." },
  { key: "pale-ale", name: "Пейл ейл малц", body: "Изпечен малко по-силно — бисквита и хляб. Основата на британските и американските ейлове." },
  { key: "wheat", name: "Пшеничен малц", body: "Много протеини → плътна пяна, мътност и копринено тяло. Задължителен за Weissbier." },
  { key: "vienna", name: "Виенски малц", body: "По-високо изпечен — препечен хляб и кехлибарен цвят. Душата на Vienna Lager и Märzen." },
  { key: "cara-munich", name: "Мюнхенски и карамелени малцове", body: "Сладост, тяло и цвят — от мед до тофи. Влизат на малки дози, иначе бирата натежава." },
  { key: "roasted-barley", name: "Печен ечемик и черни малцове", body: "Печени до черно — кафе, шоколад и цвят. 1–2% оцветяват ирландския червен ейл, 10% правят стаута." },
  { key: "oats", name: "Люспи — овес и ечемик", body: "Не са малцувани. Дават кадифено тяло и мътност — Hazy IPA, Irish Stout." },
];

const malts = lesson("malts", "Малцът", { glass: "pint", ebc: [16, 28] }, () => [
  card({
    title: "Малцът е душата на бирата",
    body: "Зърното покълва, после се суши и пече. Колкото по-силно е печено, толкова по-тъмен е цветът и по-силен е вкусът. Малцът дава захарта за алкохола, цвета, тялото и половината вкус.",
    icon: Wheat,
  }),
  ...MALTS.slice(0, 4).map((m) => card({ title: m.name, body: m.body, visual: { img: MALT_IMAGES[m.key] } })),
  ask(pick("malts:img1", "Кой малц е това?", ["Пшеничен малц", "Печен ечемик", "Виенски малц", "Люспи"], MALTS[2].body, { img: MALT_IMAGES.wheat })),
  ask(pick("malts:foam", "Кой малц дава мътност и плътна пяна?", ["Пшеничен", "Пилзнер", "Виенски", "Карамелен"], "Протеините в пшеницата.")),
  ...MALTS.slice(4).map((m) => card({ title: m.name, body: m.body, visual: { img: MALT_IMAGES[m.key] } })),
  ask(pick("malts:img2", "Кой малц е това?", ["Печен ечемик", "Пилзнер малц", "Пейл ейл малц", "Пшеничен малц"], MALTS[5].body, { img: MALT_IMAGES["roasted-barley"] })),
  ask(pick("malts:coffee", "Откъде идва кафето в стаута?", ["Печен ечемик", "Хмел", "Мая", "Пшеница"], "Печеното до черно зърно.")),
  ask(tf("malts:share", "Карамелените малцове обикновено са над половината от рецептата.", false, "Влизат на 5–15% — иначе бирата става сиропена.")),
]);

const hops = lesson("hops", "Хмелът", { glass: "tulip", ebc: [10, 16] }, () => [
  card({
    title: "Хмелът е подправката",
    body: "Шишарките на хмела дават горчивина, аромат и пазят бирата от развала. Едно и също растение — три съвсем различни ефекта според това кога влиза.",
    icon: Hop,
  }),
  card({
    title: HOP_STAGES[0].label,
    body: "В началото на варенето, 60+ минути. Алфа киселините се изомеризират — това е горчивината. Ароматът се изварява напълно.",
    icon: Flame,
  }),
  card({
    title: HOP_STAGES[1].label,
    body: "Последните минути и whirlpool. Малко горчивина, много вкус — цитрус, билки, цветя.",
    icon: Flower2,
  }),
  ask(pick("hops:bitter", "Кога хмелът дава най-много горчивина?", ["В началото на варенето", "След ферментацията", "При бутилиране", "Никога"], "Дългото кипене изомеризира алфа киселините.")),
  card({
    title: HOP_STAGES[2].label,
    body: "Студено, след ферментацията. Само аромат — почти никаква горчивина. Тайната на IPA и Hazy IPA.",
    icon: Snowflake,
  }),
  card({
    title: "Благороден срещу американски",
    body: "Немските и чешките сортове (Saaz, Hallertau, Tettnang) са фини — билки, цветя, пипер. Американските (Cascade, Citra) са силни — цитрус, бор, тропически плодове.",
    icon: Sparkles,
  }),
  ask(tf("hops:dry", "Сухото охмеляване вдига значително горчивината.", false, "Без кипене няма изомеризация — само аромат.")),
  ask(pick("hops:saaz", "Saaz е…", ["Благороден чешки хмел", "Американски хмел", "Вид малц", "Белгийска мая"], "Душата на чешкия пилзнер.")),
  ask(pick("hops:cascade", "Кой аромат е типичен за американския хмел?", ["Цитрус и бор", "Банан и карамфил", "Кафе", "Дим"], "Cascade и сие.")),
]);

const yeast = lesson("yeast", "Маята", { glass: "weizen", ebc: [4, 12] }, () => [
  card({
    title: "Маята прави бирата",
    body: "Пивоварът прави сладка пивна мъст. Бирата я прави маята — изяжда захарта и оставя алкохол, CO₂ и стотици ароматни молекули.",
    icon: Microscope,
  }),
  card({
    title: "Ейл — горна ферментация",
    body: "Топло, около 18–22 °C, бързо. Маята оставя естери (плодове) и понякога феноли (карамфил, пипер). Стаут, IPA, Weissbier, всички белгийци.",
    icon: Thermometer,
  }),
  card({
    title: "Лагер — долна ферментация",
    body: "Студено, около 8–12 °C, бавно, после седмици лагеруване. Чист, изчистен профил — малцът и хмелът са на сцената.",
    icon: Snowflake,
  }),
  ask(pick("yeast:lager", "При каква температура ферментира лагерът?", ["8–12 °C", "18–22 °C", "30–35 °C", "0 °C"], "Студено и бавно — затова е толкова чист.")),
  ask(pick("yeast:produce", "Какво НЕ прави маята?", ["Горчивина", "Алкохол", "CO₂", "Плодови естери"], "Горчивината идва от хмела.")),
  card({
    title: "Естери и феноли",
    body: "Бананът в Weissbier и пиперът в Saison не са добавени — те са на маята. Температурата е регулатор: по-топло → повече аромати.",
    icon: Sparkles,
  }),
  card({
    title: "Бактериите",
    body: "Lactobacillus изяжда захар и оставя млечна киселина. Така се правят Berliner Weisse и Gose — кисели, но чисти.",
    icon: Microscope,
  }),
  ask(tf("yeast:banana", "Бананът в Weissbier идва от добавени плодове.", false, "Идва от маята — изоамил ацетат.")),
  ask(pick("yeast:sour", "Кой микроорганизъм прави Berliner Weisse кисела?", ["Lactobacillus", "Лагерна мая", "Brettanomyces", "Хмелът"], "Млечнокисели бактерии.")),
]);

const tasting = lesson("tasting", "Дегустация", { glass: "tulip", ebc: [20, 30] }, () => [
  card({
    title: "Гледай, мирисай, пий",
    body: `Съдиите попълват листа си в този ред: ${SENSORY_ASPECTS.map((a) => a.label.toLowerCase()).join(", ")}. Ароматите избледняват първи, затова се помирисва веднага.`,
    icon: Eye,
  }),
  card({
    title: SENSORY_ASPECTS[0].label,
    body: "Цвят, бистрота, пяна. Мътността може да е дефект — или изискване (Weissbier, Hazy IPA). Пяната издава протеините и газта.",
    icon: Eye,
  }),
  card({
    title: SENSORY_ASPECTS[1].label,
    body: "Завърти чашата и помириши с къси вдишвания. Малц (хляб, карамел), хмел (цитрус, билки), мая (плодове, пипер).",
    icon: Flower2,
  }),
  ask(pick("tasting:order", "Какво правиш първо на дегустация?", ["Гледаш", "Пиеш", "Мирисаш", "Ядеш"], "Гледаш → мирисаш → пиеш.")),
  card({
    title: SENSORY_ASPECTS[2].label,
    body: "Сладост, горчивина, киселинност, тяло, газираност и финал. Издишай през носа след глътката — там е половината вкус.",
    icon: Beer,
  }),
  card({
    title: "Температурата има значение",
    body: "Ледената бира крие вкуса. Лагерите — 4–7 °C, ейловете — 8–12 °C, силните тъмни бири — до 14 °C.",
    icon: Thermometer,
  }),
  ask(tf("tasting:retro", "Голяма част от вкуса всъщност се усеща през носа.", true, "Ретроназално — при издишване след глътката.")),
  ask(tf("tasting:cold", "Колкото по-студена е бирата, толкова повече вкус усещаш.", false, "Студът притъпява ароматите.")),
  ask(pick("tasting:stout", "На каква температура е най-добре имперски стаут?", ["Около 12–14 °C", "Около 0 °C", "Около 4 °C", "Стайна, 25 °C"], "Силните тъмни бири разкриват ароматите си на по-топло.")),
]);

const GLASSES: { shape: GlassShape; name: string; body: string }[] = [
  { shape: "pilsner", name: "Пилзнер", body: "Висока и тясна — показва бистротата и мехурчетата. За пилзнер и Vienna Lager." },
  { shape: "weizen", name: "Вайцен", body: "Висока, извита — побира цялата буйна пяна на пшеничената бира." },
  { shape: "mug", name: "Халба", body: "Дебело стъкло и дръжка — бирата не се затопля от ръката. Helles, Märzen, Dunkel." },
  { shape: "pint", name: "Пинта", body: "Британската чаша — 568 мл. Bitter, porter, stout." },
  { shape: "tulip", name: "Лале", body: "Издута отдолу, стеснена горе — събира аромата. IPA, Saison, имперски стаут." },
  { shape: "footed", name: "Бокал", body: "Широка купа на столче — за белгийските абатски бири и силните лагери." },
  { shape: "stange", name: "Щанге", body: "Тясна права чаша от 0.2 л — за Kölsch и Gose. Бирата е винаги свежа." },
  { shape: "tumbler", name: "Шейкър", body: "Обикновената права чаша. Работи за всичко, но не помага на нищо." },
];

const glasses = lesson("glasses", "Чашите", { glass: "weizen", ebc: [6, 10] }, () => [
  card({
    title: "Чашата не е само за красота",
    body: "Формата решава колко пяна ще се задържи, колко аромат ще стигне до носа и колко бързо ще се затопли бирата.",
    icon: Beer,
  }),
  ...GLASSES.slice(0, 4).map((g) => card({ title: g.name, body: g.body, visual: { glass: g.shape, ebc: [8, 14] } })),
  ask(pick("glasses:weizen", "Как се казва тази чаша?", ["Вайцен", "Пилзнер", "Лале", "Щанге"], GLASSES[1].body, { glass: "weizen", ebc: [6, 12] })),
  ...GLASSES.slice(4).map((g) => card({ title: g.name, body: g.body, visual: { glass: g.shape, ebc: [8, 14] } })),
  ask(pick("glasses:tulip", "Как се казва тази чаша?", ["Лале", "Бокал", "Пинта", "Халба"], GLASSES[4].body, { glass: "tulip", ebc: [12, 20] })),
  ask(pick("glasses:kolsch", "В каква чаша се сервира Kölsch?", ["Щанге", "Халба", "Пинта", "Бокал"], "Тясна, 0.2 л — и келнерът носи нова.")),
  ask(pick("glasses:mug", "Защо халбата има дръжка?", ["Ръката не затопля бирата", "Държи пяната", "Събира аромата", "Само за красота"], GLASSES[2].body)),
]);

export const BASICS_LESSONS = [numbers, malts, hops, yeast, tasting, glasses];
