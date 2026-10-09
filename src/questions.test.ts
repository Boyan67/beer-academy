import { describe, expect, it } from "vitest";

import { COURSES, courseLessons, learnThenQuiz } from "@/course/courses";
import { checkAnswer } from "@/course/questions";
import type { Question } from "@/course/types";
import { project } from "@/lib/beer-guide/map";
import { MAP_DATA } from "@/lib/beer-guide/map-data";
import { ORIGINS } from "@/lib/beer-guide/origins";
import { BEER_STYLES } from "@/lib/beer-guide/styles";
import { addDays, dayKey, levelFor, nextReview, streak } from "@/progress";

const lessons = COURSES.flatMap(courseLessons);

describe("content", () => {
  it("every style is in exactly one lesson", () => {
    const ids = lessons.map((l) => l.id).filter((id) => id.startsWith("style:"));
    expect(ids.sort()).toEqual(BEER_STYLES.map((s) => `style:${s.slug}`).sort());
  });

  // Generators shuffle, so run each a few times to shake out unlucky draws.
  it.each(lessons.map((l) => [l.id, l] as const))("%s builds sound questions", (_, lesson) => {
    for (let run = 0; run < 20; run++) {
      const pool = lesson.pool();
      const steps = lesson.steps();
      expect(pool.length).toBeGreaterThanOrEqual(lesson.id.startsWith("style:") ? 8 : 4);
      expect(steps.filter((s) => "question" in s).length).toBeGreaterThanOrEqual(4);
      expect(new Set(pool.map((q) => q.id)).size).toBe(pool.length);

      for (const q of pool) {
        if (q.kind === "choice" || q.kind === "multi") {
          expect(q.options.length, q.id).toBeGreaterThanOrEqual(2);
          expect(new Set(q.options.map((o) => o.label)).size, `${q.id} duplicate options`).toBe(q.options.length);
        }
        if (q.kind === "choice") expect(q.options[q.answer], q.id).toBeDefined();
        if (q.kind === "multi") expect(q.answer.every((i) => i >= 0), q.id).toBe(true);
        if (q.kind === "order") expect([...q.answer].sort()).toEqual(q.items.map((_, i) => i));
        if (q.kind === "match") {
          expect(new Set(q.left).size, q.id).toBe(q.left.length);
          expect(new Set(q.right).size, q.id).toBe(q.right.length);
          expect([...q.answer].sort()).toEqual(q.right.map((_, i) => i));
        }
        // Picture options hide their names until checked, so no two may look alike.
        if (q.kind === "choice" && q.options.some((o) => o.visual)) {
          expect(q.options.every((o) => o.visual), `${q.id} mixes pictures and text`).toBe(true);
          const looks = q.options.map((o) => o.visual!);
          for (let a = 0; a < looks.length; a++)
            for (let b = a + 1; b < looks.length; b++) {
              const [x, y] = [looks[a], looks[b]];
              const sameGlass = x.glass && x.glass === y.glass && x.ebc![0] <= y.ebc![1] && y.ebc![0] <= x.ebc![1];
              expect(sameGlass || (x.img && x.img === y.img), `${q.id}: options ${a} and ${b} look the same`).toBeFalsy();
            }
        }
      }
    }
  });
});

it("every style has an origin on its map", () => {
  for (const s of BEER_STYLES) {
    const o = ORIGINS[s.slug];
    expect(o, s.slug).toBeDefined();
    const map = MAP_DATA[o.region];
    expect((map.countries as Record<string, string>)[o.country], `${s.slug} country`).toBeTruthy();
    const [x, y] = project(o.region, o.lat, o.lon);
    expect(x > 10 && x < map.width - 10 && y > 10 && y < map.height - 10, `${s.slug} pin off the map`).toBe(true);
  }
});

it("lessons teach first, quiz after", () => {
  for (const l of lessons) {
    const kinds = learnThenQuiz(l.steps()).map((s) => ("card" in s ? "c" : "q")).join("");
    expect(kinds, l.id).toMatch(/^c+q+$/);
  }
});

describe("checkAnswer", () => {
  const choice: Question = { kind: "choice", id: "c", prompt: "", explain: "", options: [{ label: "a" }, { label: "b" }], answer: 1 };
  const multi: Question = { kind: "multi", id: "m", prompt: "", explain: "", options: [{ label: "a" }, { label: "b" }, { label: "c" }], answer: [2, 0] };
  const order: Question = { kind: "order", id: "o", prompt: "", explain: "", items: ["x", "y", "z"], answer: [2, 0, 1], hint: ["", ""] };
  const match: Question = { kind: "match", id: "x", prompt: "", explain: "", left: ["a", "b", "c"], right: ["q", "r", "s"], answer: [1, 2, 0] };
  const slider: Question = { kind: "slider", id: "s", prompt: "", explain: "", min: 0, max: 100, step: 1, unit: "", answer: [40, 70] };

  it("grades every kind", () => {
    expect(checkAnswer(choice, 1)).toBe(true);
    expect(checkAnswer(choice, 0)).toBe(false);
    expect(checkAnswer(choice, undefined)).toBe(false);
    expect(checkAnswer(multi, [0, 2])).toBe(true);
    expect(checkAnswer(multi, [0])).toBe(false);
    expect(checkAnswer(multi, [0, 1, 2])).toBe(false);
    expect(checkAnswer(order, [2, 0, 1])).toBe(true);
    expect(checkAnswer(order, [0, 2, 1])).toBe(false);
    expect(checkAnswer(slider, 40)).toBe(true);
    expect(checkAnswer(slider, 70)).toBe(true);
    expect(checkAnswer(slider, 71)).toBe(false);
    expect(checkAnswer(match, [1, 2, 0])).toBe(true);
    expect(checkAnswer(match, [1, 0, 2])).toBe(false);
    expect(checkAnswer(match, [1, 2, -1])).toBe(false);
  });
});

describe("progress", () => {
  const today = new Date(2026, 9, 9, 10);
  const days = (...offsets: number[]) => Object.fromEntries(offsets.map((o) => [dayKey(addDays(today, -o)), 50]));

  it("counts a streak through yesterday, breaks on a gap", () => {
    expect(streak(days(0, 1, 2), 30, today)).toBe(3);
    expect(streak(days(1, 2), 30, today)).toBe(2); // not played yet today — still alive
    expect(streak(days(0, 2, 3), 30, today)).toBe(1); // skipped yesterday
    expect(streak(days(0, 1), 80, today)).toBe(0); // under the goal
  });

  it("crosses midnight on the local calendar", () => {
    const late = new Date(2026, 9, 9, 23, 59);
    const early = new Date(2026, 9, 10, 0, 1);
    expect(dayKey(late)).toBe("2026-10-09");
    expect(dayKey(early)).toBe("2026-10-10");
    expect(streak({ "2026-10-09": 30 }, 30, early)).toBe(1);
  });

  it("walks Leitner boxes and graduates", () => {
    const now = 1_000;
    let item = nextReview({ q: 1, box: 0, due: 0 }, true, now)!;
    expect(item.box).toBe(1);
    expect(item.due).toBe(now + 86_400_000);
    for (let i = 0; i < 3; i++) item = nextReview(item, true, now)!;
    expect(item.box).toBe(4);
    expect(nextReview(item, true, now)).toBeNull();
    expect(nextReview(item, false, now)).toEqual({ q: 1, box: 0, due: now });
  });

  it("levels up at thresholds", () => {
    expect(levelFor(0).name).toBe("Новак");
    expect(levelFor(149).name).toBe("Новак");
    expect(levelFor(150).name).toBe("Любител");
    expect(levelFor(99_999).progress).toBe(1);
  });
});
