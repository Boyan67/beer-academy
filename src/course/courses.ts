import { BASICS_LESSONS, BREWING_LESSONS } from "@/course/basics";
import { handwritten } from "@/course/handwritten";
import { sample, shuffle, styleQuestions } from "@/course/questions";
import type { Course, Lesson, Question, Step, StylePart } from "@/course/types";
import { getStyleBySlug } from "@/lib/beer-guide/styles";
import { ClipboardCheck } from "lucide-react";

const part = (slug: string, p: StylePart): Step => ({ card: { kind: "style", slug, part: p } });
const ask = (q: Question): Step => ({ question: q });

/** Learn a bit, check it — the Uxcel rhythm. Six questions per lesson. */
function styleLesson(slug: string): Lesson {
  const style = getStyleBySlug(slug);
  if (!style) throw new Error(`Unknown style: ${slug}`);
  const pool = () => [...styleQuestions(style), ...handwritten(slug)];

  return {
    id: `style:${slug}`,
    title: style.name,
    visual: { glass: style.glass ?? "tumbler", ebc: style.stats.ebc },
    pool,
    steps: () => {
      // "glass:weissbier" → "glass", "story:weissbier:0" → "story:0"
      const qs = new Map(pool().map((q) => [q.id.replace(`:${slug}`, ""), q]));
      const pickOne = (...keys: string[]) => {
        const key = shuffle(keys.filter((k) => qs.has(k)))[0];
        const q = qs.get(key);
        qs.delete(key);
        return q ? [ask(q)] : [];
      };
      return [
        part(slug, "intro"),
        part(slug, "stats"),
        ...pickOne("glass", "abv", "ibu"),
        part(slug, "sensory"),
        ...pickOne("aroma"),
        part(slug, "malts"),
        part(slug, "hops"),
        ...pickOne("malt", "dryhop"),
        part(slug, "yeast"),
        part(slug, "traits"),
        ...pickOne("family", "bitter", "color"),
        part(slug, "history"),
        ...pickOne("story:0"),
        part(slug, "fact"),
        ...pickOne("story:1"),
        ...pickOne("summary", "color", "bitter"),
      ];
    },
  };
}

const chapter = (title: string, slugs: string[]) => ({ title, lessons: slugs.map(styleLesson) });

export const COURSES: Course[] = [
  {
    id: "basics",
    title: "Основи",
    description: "Съставките, варенето, дегустацията, дефектите, чашите и храната.",
    chapters: [
      { title: "Как да четеш бира", lessons: BASICS_LESSONS },
      { title: "От казана до масата", lessons: BREWING_LESSONS },
    ],
  },
  {
    id: "lagers",
    title: "Лагери",
    description: "От пилзнер до балтийски портър — студена ферментация, чист профил.",
    chapters: [
      chapter("Светли", ["german-pils", "czech-premium-pale-lager", "munich-helles"]),
      chapter("Кехлибарени", ["vienna-lager", "marzen", "rauchbier"]),
      chapter("Тъмни и силни", ["schwarzbier", "munich-dunkel", "doppelbock", "baltic-porter"]),
    ],
  },
  {
    id: "ales",
    title: "Ейлове",
    description: "Пшенични, кисели, британски, американски и белгийски.",
    chapters: [
      chapter("Светли и освежаващи", ["kolsch", "weissbier", "witbier", "berliner-weisse", "gose"]),
      chapter("Британски острови", ["best-bitter", "irish-red-ale", "british-strong-ale", "english-porter", "irish-stout", "imperial-stout"]),
      chapter("Американски хмел", ["american-pale-ale", "american-ipa", "hazy-ipa"]),
      chapter("Белгия", ["belgian-pale-ale", "saison", "belgian-dubbel", "belgian-tripel"]),
    ],
  },
];

export const courseLessons = (c: Course) => c.chapters.flatMap((ch) => ch.lessons);
export const getCourse = (id: string) => COURSES.find((c) => c.id === id);

export function findLesson(id: string) {
  for (const course of COURSES) {
    const lesson = courseLessons(course).find((l) => l.id === id);
    if (lesson) return { course, lesson };
  }
}

export const TEST_SIZE = 20;
export const TEST_SECONDS = 10 * 60;
export const PASS_SCORE = 0.8;

/** Twenty random questions from across the whole course. */
export const testQuestions = (c: Course) => sample(courseLessons(c).flatMap((l) => l.pool()), TEST_SIZE);

/** All the theory first, then the quiz — with a breather card between the two. */
export function learnThenQuiz(steps: Step[]): Step[] {
  const cards = steps.filter((s) => "card" in s);
  const questions = steps.filter((s) => "question" in s);
  if (!cards.length || !questions.length) return steps;
  const intermission: Step = {
    card: {
      kind: "text",
      title: "Време за проверка",
      body: `Следват ${questions.length} въпроса върху това, което току-що научи. Грешните ще се върнат в Преговор.`,
      icon: ClipboardCheck,
    },
  };
  return [...cards, intermission, ...questions];
}
