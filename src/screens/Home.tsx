import { ArrowLeft, Award, Check, ChevronRight, Flame, Lock, Play, Star } from "lucide-react";

import { VisualView } from "@/components/Cards";
import { COURSES, courseLessons, getCourse } from "@/course/courses";
import type { Course, Visual } from "@/course/types";
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

const COURSE_ART: Record<string, Visual> = {
  basics: { glass: "tumbler", ebc: [12, 20] },
  lagers: { glass: "pilsner", ebc: [4, 8] },
  ales: { glass: "tulip", ebc: [30, 60] },
};

function StatsBar() {
  const { xp, xpByDay, dailyGoal, name } = useProgress();
  const days = streak(xpByDay, dailyGoal);
  const today = xpByDay[dayKey()] ?? 0;
  const level = levelFor(xp);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">{name ? `Здравей, ${name}` : "Бира Академия"}</p>
          <p className="text-2xl font-extrabold">{level.name}</p>
        </div>
        <div className="flex gap-2 text-sm font-bold">
          <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5" title="Поредни дни">
            <Flame size={18} className={days > 0 ? "text-accent" : "text-muted"} fill={days > 0 ? "currentColor" : "none"} />
            {days}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5" title="Общо XP">
            <Star size={18} className="text-accent" fill="currentColor" />
            {xp}
          </span>
        </div>
      </div>
      <div className="rounded-2xl bg-surface p-4">
        <div className="mb-2 flex justify-between text-sm font-semibold">
          <span>Дневна цел</span>
          <span className="tabular-nums text-muted">
            {Math.min(today, dailyGoal)} / {dailyGoal} XP
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-raised">
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
    <div className="space-y-6 p-4 pt-[max(20px,env(safe-area-inset-top))]">
      <StatsBar />

      {next && (
        <button
          type="button"
          onClick={() => go(`#/lesson/${next.lesson.id}`)}
          className="flex w-full items-center gap-4 rounded-2xl bg-surface p-3 text-left ring-2 ring-accent/60 hover:ring-accent"
        >
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-brand">
            {next.lesson.visual && <VisualView v={next.lesson.visual} className="h-14" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-accent">Продължи</p>
            <p className="truncate text-lg font-extrabold">{next.lesson.title}</p>
            <p className="truncate text-sm text-muted">{next.lesson.description}</p>
          </div>
          <span className="mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
            <Play size={20} fill="currentColor" />
          </span>
        </button>
      )}

      <h2 className="text-xl font-extrabold">Курсове</h2>
      {COURSES.map((c) => {
        const states = lessonStates(c, completed);
        const done = states.filter((s) => s.done).length;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => go(`#/course/${c.id}`)}
            className="w-full overflow-hidden rounded-2xl bg-surface text-left ring-1 ring-line hover:ring-muted/60"
          >
            <div className="relative flex h-36 items-center justify-center bg-raised">
              <VisualView v={COURSE_ART[c.id]} className="h-24" />
              {certificates[c.id] && (
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-black/40 px-2 py-1 text-xs font-bold text-accent">
                  <Award size={14} /> Сертификат
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <h3 className="flex-1 text-xl font-extrabold">{c.title}</h3>
                <ChevronRight className="text-muted" size={20} />
              </div>
              <p className="mt-1 text-[15px] text-muted">{c.description}</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-raised">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(done / states.length) * 100}%` }} />
                </div>
                <span className="text-sm font-bold tabular-nums text-muted">
                  {done}/{states.length} урока
                </span>
              </div>
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
  const done = [...states.values()].filter((s) => s.done).length;
  const cert = certificates[course.id];

  return (
    <div>
      <div className="bg-raised px-4 pb-6 pt-[max(14px,env(safe-area-inset-top))]">
        <button type="button" onClick={() => go("#/")} aria-label="Назад" className="rounded-full p-1 text-ink/80 hover:text-ink">
          <ArrowLeft size={26} />
        </button>
        <div className="mt-2 flex justify-center">
          <VisualView v={COURSE_ART[course.id]} className="h-28" />
        </div>
      </div>
      <div className="space-y-8 p-4 pt-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold">{course.title}</h1>
          <p className="text-[17px] text-muted">{course.description}</p>
          <p className="text-sm font-bold text-muted">
            {done} от {states.size} урока завършени
          </p>
        </header>

        {course.chapters.map((ch) => (
          <section key={ch.title} className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted">{ch.title}</h2>
            {ch.lessons.map((l) => {
              const s = states.get(l.id)!;
              return (
                <button
                  key={l.id}
                  type="button"
                  disabled={!s.open}
                  onClick={() => go(`#/lesson/${l.id}`)}
                  className="flex w-full items-center gap-4 rounded-2xl bg-surface p-3 text-left ring-1 ring-line enabled:hover:ring-muted/60 disabled:opacity-45"
                >
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand">
                    {l.visual && <VisualView v={l.visual} className="h-11" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{l.title}</span>
                    <span className="block truncate text-sm text-muted">{l.description}</span>
                  </span>
                  {s.done ? (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-good/15 text-good">
                      <Check size={18} strokeWidth={3} />
                    </span>
                  ) : s.open ? (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
                      <Play size={15} fill="currentColor" />
                    </span>
                  ) : (
                    <Lock size={18} className="mr-1.5 shrink-0 text-muted" />
                  )}
                </button>
              );
            })}
          </section>
        ))}

        <section className="rounded-2xl bg-brand p-5">
          <div className="flex items-center gap-3">
            <Award size={32} className="text-accent" />
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
              className="flex-1 rounded-xl bg-accent py-3 font-extrabold text-on-accent enabled:hover:bg-accent-hover disabled:opacity-40"
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
    </div>
  );
}

export function NotFound() {
  return (
    <div className="p-8 text-center">
      <p className="mb-4 text-lg font-bold">Тази страница не съществува.</p>
      <button type="button" onClick={() => go("#/")} className="rounded-xl bg-accent px-5 py-3 font-bold text-on-accent">
        Към началото
      </button>
    </div>
  );
}
