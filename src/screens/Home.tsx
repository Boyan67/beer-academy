import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Award, ChartNoAxesColumn, Check, ChevronRight, Clock, Flame, ListChecks, Lock, Play, Star, X } from "lucide-react";

import { VisualView } from "@/components/Cards";
import { COURSES, courseLessons, getCourse, readMinutes, splitLesson } from "@/course/courses";
import type { Course, Lesson, Visual } from "@/course/types";
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

/** Whole course reading time, from the same per-lesson estimate the lesson intro shows. */
function courseTime(course: Course) {
  const min = courseLessons(course).reduce((m, l) => m + readMinutes(splitLesson(l.steps()).cards.length), 0);
  return min < 60 ? `${min} мин` : `${Math.round(min / 60)} ч`;
}

/** Bottom sheet previewing the next lesson — reading first, the quiz as the shortcut. */
function LessonSheet({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const parts = useMemo(() => splitLesson(lesson.steps()), [lesson]);
  useEffect(() => ref.current?.showModal(), []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // A click on the backdrop lands on the dialog itself.
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      aria-labelledby="sheet-title"
      className="mx-auto mb-0 mt-auto max-h-none w-full max-w-lg overflow-visible rounded-t-3xl bg-surface text-ink duration-300 animate-in slide-in-from-bottom backdrop:bg-black/60"
    >
      <span className="absolute -top-16 left-1/2 flex h-32 w-32 -translate-x-1/2 items-center justify-center rounded-full bg-raised">
        {lesson.visual && <VisualView v={lesson.visual} className="h-20" />}
      </span>
      <button type="button" onClick={() => ref.current?.close()} aria-label="Затвори" className="absolute right-3 top-3 rounded-full p-1.5 text-muted hover:text-ink">
        <X size={22} />
      </button>
      <div className="border-b border-line px-6 pb-7 pt-20 text-center">
        <h2 id="sheet-title" className="text-2xl font-extrabold leading-tight">
          {lesson.title}
        </h2>
        <p className="mt-3 flex justify-center gap-5 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <Clock size={17} /> ~{readMinutes(parts.cards.length)} мин
          </span>
          <span className="flex items-center gap-1.5">
            <ListChecks size={17} /> {parts.questions.length} въпроса
          </span>
        </p>
      </div>
      <div className="space-y-2 p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <button type="button" onClick={() => go(`#/lesson/${lesson.id}`)} className="w-full rounded-xl bg-accent py-3.5 font-extrabold text-on-accent hover:bg-accent-hover">
          Прочети теорията
        </button>
        <button type="button" onClick={() => go(`#/quiz/${lesson.id}`)} className="w-full py-3 font-bold text-muted hover:text-ink">
          Направо към теста
        </button>
      </div>
    </dialog>
  );
}

export function CourseMap({ id }: { id: string }) {
  const { completed, certificates } = useProgress();
  const course = getCourse(id);
  const time = useMemo(() => course && courseTime(course), [course]);
  const [preview, setPreview] = useState(false);
  if (!course) return <NotFound />;

  const list = lessonStates(course, completed);
  const states = new Map(list.map((s) => [s.lesson.id, s]));
  const done = list.filter((s) => s.done).length;
  const allDone = done === list.length;
  const next = list.find((s) => s.open && !s.done);
  const pct = Math.round((done / list.length) * 100);
  const cert = certificates[course.id];

  return (
    <div>
      <div className="relative flex h-60 items-center justify-center bg-raised pt-[env(safe-area-inset-top)]">
        <button
          type="button"
          onClick={() => go("#/")}
          aria-label="Назад"
          className="absolute left-3 top-[max(12px,env(safe-area-inset-top))] rounded-full p-1 text-ink/80 hover:text-ink"
        >
          <ArrowLeft size={26} />
        </button>
        <VisualView v={COURSE_ART[course.id]} className="h-32" />
      </div>

      <header className="space-y-4 border-b border-line p-4 pb-7 pt-6">
        <nav className="text-sm text-muted">
          <a href="#/" className="hover:text-ink">
            Курсове
          </a>{" "}
          /
        </nav>
        <h1 className="text-3xl font-extrabold leading-tight">{course.title}</h1>
        <p className="text-[15px] leading-relaxed text-muted">{course.description}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <span className="flex items-center gap-2">
            <span className="h-2 w-24 overflow-hidden rounded-full bg-raised">
              <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
            </span>
            {pct}% завършен
          </span>
          <span className="flex items-center gap-1.5">
            <ChartNoAxesColumn size={18} /> {course.level}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={17} /> {time}
          </span>
        </div>
        <button
          type="button"
          onClick={() => (next ? setPreview(true) : go(`#/test/${course.id}`))}
          className="w-full rounded-xl bg-accent py-3.5 font-extrabold text-on-accent hover:bg-accent-hover"
        >
          {next ? (done ? "Продължи обучението" : "Започни курса") : cert ? "Пробвай теста пак" : "Към финалния тест"}
        </button>
        {preview && next && <LessonSheet lesson={next.lesson} onClose={() => setPreview(false)} />}
      </header>

      <div className="space-y-8 p-4 pt-6">
        {course.chapters.map((ch, i) => (
          <section key={ch.title} className="space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Ниво {i + 1}</p>
              <h3 className="mt-1 text-lg font-bold">{ch.title}</h3>
            </div>
            {ch.lessons.map((l) => {
              const s = states.get(l.id)!;
              return (
                <button
                  key={l.id}
                  type="button"
                  disabled={!s.open}
                  onClick={() => go(`#/lesson/${l.id}`)}
                  className="flex w-full items-center gap-4 rounded-2xl p-3 text-left ring-1 ring-line enabled:hover:bg-surface disabled:opacity-45"
                >
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand ring-1 ring-line">
                    {l.visual && <VisualView v={l.visual} className="h-11" />}
                  </span>
                  <span className="min-w-0 flex-1 font-bold leading-snug">{l.title}</span>
                  {s.done ? (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-good text-bg">
                      <Check size={15} strokeWidth={3.5} />
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
