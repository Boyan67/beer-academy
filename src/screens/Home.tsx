import { Award, ChevronLeft, ChevronRight, Check, Flame, Lock, Play, Star } from "lucide-react";

import { VisualView } from "@/components/Cards";
import { COURSES, courseLessons, getCourse } from "@/course/courses";
import type { Course } from "@/course/types";
import { dayKey, levelFor, streak } from "@/progress";
import { useProgress } from "@/store";

export const go = (path: string) => {
  location.hash = path;
};

/** A lesson opens once the one before it is done. */
export function lessonStates(course: Course, completed: Record<string, number>) {
  const lessons = courseLessons(course);
  return lessons.map((l, i) => ({
    lesson: l,
    done: l.id in completed,
    open: i === 0 || lessons[i - 1].id in completed,
  }));
}

function StatsBar() {
  const { xp, xpByDay, dailyGoal, name } = useProgress();
  const days = streak(xpByDay, dailyGoal);
  const today = xpByDay[dayKey()] ?? 0;
  const level = levelFor(xp);
  return (
    <div className="rounded-2xl bg-brand p-5 text-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/70">{name ? `Здравей, ${name}` : "Бира Академия"}</p>
          <p className="text-xl font-extrabold">{level.name}</p>
        </div>
        <div className="flex gap-3 text-sm font-bold">
          <span className="flex items-center gap-1" title="Поредни дни">
            <Flame size={18} className={days > 0 ? "text-accent" : "text-white/40"} fill={days > 0 ? "currentColor" : "none"} />
            {days}
          </span>
          <span className="flex items-center gap-1" title="Общо XP">
            <Star size={18} className="text-amber-300" fill="currentColor" />
            {xp}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs font-semibold text-white/80">
          <span>Дневна цел</span>
          <span className="tabular-nums">
            {Math.min(today, dailyGoal)} / {dailyGoal} XP
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.min(1, today / dailyGoal) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const { completed, certificates } = useProgress();
  const next = COURSES.flatMap((c) => lessonStates(c, completed)).find((s) => s.open && !s.done);

  return (
    <div className="space-y-5 p-4 pt-[max(16px,env(safe-area-inset-top))]">
      <StatsBar />

      {next && (
        <button
          type="button"
          onClick={() => go(`#/lesson/${next.lesson.id}`)}
          className="flex w-full items-center gap-4 rounded-2xl border-2 border-accent bg-white p-4 text-left"
        >
          {next.lesson.visual && <VisualView v={next.lesson.visual} className="h-16 shrink-0" />}
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-accent">Продължи</p>
            <p className="text-lg font-extrabold">{next.lesson.title}</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white">
            <Play size={20} fill="currentColor" />
          </span>
        </button>
      )}

      <h2 className="px-1 text-sm font-bold uppercase tracking-wider text-stone-500">Курсове</h2>
      {COURSES.map((c) => {
        const states = lessonStates(c, completed);
        const done = states.filter((s) => s.done).length;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => go(`#/course/${c.id}`)}
            className="w-full rounded-2xl border border-stone-200 bg-white p-4 text-left hover:border-stone-300"
          >
            <div className="flex items-center gap-2">
              <h3 className="flex-1 text-lg font-extrabold">{c.title}</h3>
              {certificates[c.id] && <Award className="text-accent" size={22} aria-label="Сертификат" />}
              <ChevronRight className="text-stone-400" size={20} />
            </div>
            <p className="mt-0.5 text-[15px] text-stone-600">{c.description}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                <div className="h-full rounded-full bg-brand" style={{ width: `${(done / states.length) * 100}%` }} />
              </div>
              <span className="text-sm font-bold tabular-nums text-stone-500">
                {done}/{states.length}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function CourseMap({ id }: { id: string }) {
  const { completed, certificates } = useProgress();
  const course = getCourse(id);
  if (!course) return <NotFound />;

  const states = new Map(lessonStates(course, completed).map((s) => [s.lesson.id, s]));
  const allDone = [...states.values()].every((s) => s.done);
  const cert = certificates[course.id];

  return (
    <div className="space-y-6 p-4 pt-[max(16px,env(safe-area-inset-top))]">
      <header className="flex items-center gap-2">
        <button type="button" onClick={() => go("#/")} aria-label="Назад" className="rounded-full p-1.5 hover:bg-stone-200">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-extrabold">{course.title}</h1>
      </header>

      {course.chapters.map((ch) => (
        <section key={ch.title} className="space-y-2">
          <h2 className="px-1 text-sm font-bold uppercase tracking-wider text-stone-500">{ch.title}</h2>
          {ch.lessons.map((l) => {
            const s = states.get(l.id)!;
            return (
              <button
                key={l.id}
                type="button"
                disabled={!s.open}
                onClick={() => go(`#/lesson/${l.id}`)}
                className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 text-left enabled:hover:border-stone-300 disabled:opacity-50"
              >
                {l.visual && <VisualView v={l.visual} className="h-12 shrink-0" />}
                <span className="flex-1 font-bold">{l.title}</span>
                {s.done ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check size={18} strokeWidth={3} />
                  </span>
                ) : s.open ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white">
                    <Play size={15} fill="currentColor" />
                  </span>
                ) : (
                  <Lock size={18} className="mr-1.5 text-stone-400" />
                )}
              </button>
            );
          })}
        </section>
      ))}

      <section className="rounded-2xl bg-brand p-5 text-white">
        <div className="flex items-center gap-3">
          <Award size={28} className="text-accent" />
          <div className="flex-1">
            <h2 className="text-lg font-extrabold">Финален тест</h2>
            <p className="text-sm text-white/70">
              {cert
                ? `Взет с ${Math.round(cert.score * 100)}%`
                : allDone
                  ? "20 въпроса, 10 минути, 80% за сертификат."
                  : "Отключва се, когато завършиш всички уроци."}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={!allDone}
            onClick={() => go(`#/test/${course.id}`)}
            className="flex-1 rounded-xl bg-accent py-3 font-extrabold enabled:hover:bg-accent-dark disabled:opacity-40"
          >
            {cert ? "Пробвай пак" : "Започни теста"}
          </button>
          {cert && (
            <button type="button" onClick={() => go(`#/cert/${course.id}`)} className="flex-1 rounded-xl bg-white/10 py-3 font-extrabold hover:bg-white/20">
              Сертификат
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="p-8 text-center">
      <p className="mb-4 text-lg font-bold">Тази страница не съществува.</p>
      <button type="button" onClick={() => go("#/")} className="rounded-xl bg-brand px-5 py-3 font-bold text-white">
        Към началото
      </button>
    </div>
  );
}
