import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Question } from "@/course/types";
import { XP, dayKey, nextReview, type ReviewItem } from "@/progress";

export type Mode = "lesson" | "review" | "test";

type Data = {
  name: string;
  dailyGoal: number;
  xp: number;
  xpByDay: Record<string, number>;
  /** Lesson id → best score, 0–1. */
  completed: Record<string, number>;
  /** Keyed by question id; the whole question is kept so it can be asked again as-is. */
  review: Record<string, ReviewItem<Question>>;
  certificates: Record<string, { score: number; date: string }>;
};

type Actions = {
  answer: (q: Question, correct: boolean, mode: Mode) => void;
  finishLesson: (id: string, score: number) => void;
  passTest: (courseId: string, score: number) => void;
  set: (patch: Partial<Data>) => void;
  reset: () => void;
};

const INITIAL: Data = {
  name: "",
  dailyGoal: 30,
  xp: 0,
  xpByDay: {},
  completed: {},
  review: {},
  certificates: {},
};

const STORE_KEY = "bira-academy";

export const useProgress = create<Data & Actions>()(
  persist(
    (set) => {
      const gain = (s: Data, amount: number) => {
        const today = dayKey();
        return { xp: s.xp + amount, xpByDay: { ...s.xpByDay, [today]: (s.xpByDay[today] ?? 0) + amount } };
      };

      return {
        ...INITIAL,

        answer: (q, correct, mode) =>
          set((s) => {
            const review = { ...s.review };
            const existing = review[q.id];
            if (mode === "review" && existing) {
              const next = nextReview(existing, correct, Date.now());
              if (next) review[q.id] = next;
              else delete review[q.id];
            } else if (!correct) {
              review[q.id] = { q, box: 0, due: Date.now() };
            }
            return { review, ...(correct ? gain(s, XP.correct) : {}) };
          }),

        finishLesson: (id, score) =>
          set((s) => ({
            completed: { ...s.completed, [id]: Math.max(score, s.completed[id] ?? 0) },
            ...gain(s, XP.lesson + (score === 1 ? XP.perfect : 0)),
          })),

        passTest: (courseId, score) =>
          set((s) => {
            const prev = s.certificates[courseId];
            if (prev && prev.score >= score) return {};
            return { certificates: { ...s.certificates, [courseId]: { score, date: new Date().toISOString() } } };
          }),

        set: (patch) => set(patch),
        reset: () => set(INITIAL),
      };
    },
    { name: STORE_KEY, version: 1 },
  ),
);

export const dueReviews = (review: Data["review"], now = Date.now()) =>
  Object.values(review).filter((r) => r.due <= now);

/** Backup is just the persisted JSON. */
export function exportBackup(): string {
  return localStorage.getItem(STORE_KEY) ?? "{}";
}

export function importBackup(json: string) {
  const parsed = JSON.parse(json);
  const state = parsed?.state;
  if (!state || typeof state.xp !== "number" || typeof state.completed !== "object") {
    throw new Error("Файлът не е резервно копие от Бира Академия.");
  }
  // Only known keys — a hand-edited file shouldn't be able to overwrite actions.
  const known = Object.fromEntries(Object.keys(INITIAL).filter((k) => k in state).map((k) => [k, state[k]]));
  useProgress.setState({ ...INITIAL, ...known });
}
