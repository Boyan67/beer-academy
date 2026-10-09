/** Pure progress rules — no React, no storage, so the test can hit them directly. */

export const XP = { correct: 10, lesson: 20, perfect: 10 } as const;

export const LEVELS = [
  { xp: 0, name: "Новак" },
  { xp: 150, name: "Любител" },
  { xp: 500, name: "Домашен пивовар" },
  { xp: 1200, name: "Пивовар" },
  { xp: 2500, name: "Сомелиер" },
  { xp: 4500, name: "Брюмайстор" },
] as const;

export function levelFor(xp: number) {
  const index = LEVELS.findLastIndex((l) => xp >= l.xp);
  const next = LEVELS[index + 1];
  const from = LEVELS[index].xp;
  return {
    index,
    name: LEVELS[index].name,
    next: next?.name,
    /** 0–1 towards the next level; 1 at the top. */
    progress: next ? (xp - from) / (next.xp - from) : 1,
    toNext: next ? next.xp - xp : 0,
  };
}

/** Local calendar day — a streak should flip at the user's midnight, not UTC's. */
export function dayKey(date: Date = new Date()): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
}

/**
 * Consecutive goal-hitting days ending today — or yesterday, so the streak
 * doesn't read 0 every morning before the first lesson.
 */
export function streak(xpByDay: Record<string, number>, goal: number, today: Date = new Date()): number {
  const hit = (d: Date) => (xpByDay[dayKey(d)] ?? 0) >= goal;
  let day = hit(today) ? today : addDays(today, -1);
  let count = 0;
  while (hit(day)) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

/** Leitner boxes: days until the next review after a right answer in box n. */
export const INTERVALS = [1, 3, 7, 21];
const DAY = 24 * 60 * 60 * 1000;

export type ReviewItem<Q> = { q: Q; box: number; due: number };

/** Returns the updated item, or null once it has graduated out of the last box. */
export function nextReview<Q>(item: ReviewItem<Q>, correct: boolean, now: number): ReviewItem<Q> | null {
  if (!correct) return { ...item, box: 0, due: now };
  if (item.box >= INTERVALS.length) return null;
  return { ...item, box: item.box + 1, due: now + INTERVALS[item.box] * DAY };
}
