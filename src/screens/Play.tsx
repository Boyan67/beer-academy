import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { ArrowLeft, Award, Brain, CircleCheck, Clock, ListChecks, RotateCcw, Star, Target, Timer } from "lucide-react";

import { Exercise, VisualView } from "@/components/Cards";
import Player, { type Result } from "@/components/Player";
import {
  PASS_SCORE,
  TEST_SECONDS,
  TEST_SIZE,
  courseLessons,
  findLesson,
  getCourse,
  lessonXp,
  readMinutes,
  splitLesson,
  testQuestions,
} from "@/course/courses";
import { sample } from "@/course/questions";
import { XP } from "@/progress";
import { dueReviews, useProgress } from "@/store";
import { NotFound, go, lessonStates } from "@/screens/Home";

const celebrate = () => confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, disableForReducedMotion: true });

export const primaryBtn =
  "w-full rounded-xl bg-accent py-4 text-[17px] font-extrabold text-on-accent transition-colors hover:bg-accent-hover";
export const secondaryBtn = "w-full rounded-xl border-2 border-line py-3.5 font-bold text-ink hover:border-muted";

function Done({ title, result, xp, children }: { title: string; result: Result; xp: number; children: React.ReactNode }) {
  const pct = result.total ? Math.round((result.correct / result.total) * 100) : 100;
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center duration-500 animate-in fade-in zoom-in-95">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <div className="grid w-full grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface p-4">
          <Star className="mx-auto text-accent" fill="currentColor" />
          <p className="mt-1 text-2xl font-extrabold tabular-nums">+{xp}</p>
          <p className="text-sm text-muted">XP</p>
        </div>
        <div className="rounded-2xl bg-surface p-4">
          <Target className="mx-auto text-good" />
          <p className="mt-1 text-2xl font-extrabold tabular-nums">{pct}%</p>
          <p className="text-sm text-muted">
            {result.correct} от {result.total} верни
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-3">{children}</div>
    </div>
  );
}

/** 0–1 of the page scrolled, plus raw offset. */
function useScroll() {
  const [s, set] = useState({ y: 0, progress: 0 });
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      set({ y: scrollY, progress: max > 0 ? Math.min(1, scrollY / max) : 1 });
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return s;
}

/** Overview + reading on one scrolling page, like an Uxcel lesson. */
export function LessonScreen({ id }: { id: string }) {
  const found = findLesson(id);
  const completed = useProgress((s) => s.completed);
  const [parts] = useState(() => splitLesson(found?.lesson.steps() ?? []));
  const { y, progress } = useScroll();
  if (!found) return <NotFound />;
  const { course, lesson } = found;
  const state = lessonStates(course, completed).find((s) => s.lesson.id === id);
  if (!state?.open) return <NotFound />;

  const xp = lessonXp(parts.questions.length);
  const best = completed[id];
  const toQuiz = () => go(`#/quiz/${id}`);
  const scrolled = y > 320;

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-20 bg-bg/95 backdrop-blur" style={{ background: scrolled ? undefined : "transparent" }}>
        <div className="flex items-center gap-3 px-4 pb-3 pt-[max(14px,env(safe-area-inset-top))]">
          <button type="button" onClick={() => go(`#/course/${course.id}`)} aria-label="Назад" className="rounded-full p-1 text-ink/80 hover:text-ink">
            <ArrowLeft size={26} />
          </button>
          <h1 className={`flex-1 truncate text-center text-lg font-bold transition-opacity ${scrolled ? "opacity-100" : "opacity-0"}`}>{lesson.title}</h1>
          <span className="rounded-lg bg-black/40 px-2.5 py-1 text-sm font-bold tabular-nums">+{xp} XP</span>
        </div>
        {scrolled && (
          <div className="h-1 bg-raised">
            <div className="h-full bg-accent" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
      </header>

      <div className="-mt-[62px] flex h-72 items-end justify-center border-b border-line bg-raised pb-8">
        {lesson.visual && <VisualView v={lesson.visual} className="h-44" />}
      </div>

      <div className="space-y-5 px-4 pt-7">
        <h2 className="text-3xl font-extrabold leading-tight">{lesson.title}</h2>
        <p className="text-[17px] leading-relaxed text-muted">{lesson.description}</p>
        <div className="flex gap-5 text-muted">
          <span className="flex items-center gap-1.5">
            <Clock size={20} /> ~{readMinutes(parts.cards.length)} мин четене
          </span>
          <span className="flex items-center gap-1.5">
            <ListChecks size={20} /> {parts.questions.length} въпроса
          </span>
        </div>
        {best !== undefined && (
          <p className="flex items-center gap-1.5 font-semibold text-good">
            <CircleCheck size={20} /> Завършен · най-добър резултат {Math.round(best * 100)}%
          </p>
        )}
        <button type="button" className={primaryBtn} onClick={toQuiz}>
          Направо към теста +{xp} XP
        </button>
      </div>

      <div className="mt-8 space-y-12 border-t border-line px-4 pt-8">
        {parts.cards.map((card, i) => (
          <Exercise key={i} card={card} n={i + 1} />
        ))}

        <section className="rounded-2xl bg-surface p-6 text-center">
          <ListChecks className="mx-auto text-accent" size={40} />
          <h2 className="mt-3 text-xl font-extrabold">Готов си за теста</h2>
          <p className="mt-1 text-muted">{parts.questions.length} въпроса върху това, което прочете. Грешните ще се върнат в Преговор.</p>
          <button type="button" className={`${primaryBtn} mt-5`} onClick={toQuiz}>
            Започни теста +{xp} XP
          </button>
        </section>
      </div>

      {scrolled && progress < 0.92 && (
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-lg px-4 pb-[max(16px,env(safe-area-inset-bottom))] duration-200 animate-in slide-in-from-bottom-4">
          <button type="button" className={`${primaryBtn} shadow-lg shadow-black/40`} onClick={toQuiz}>
            Към теста +{xp} XP
          </button>
        </div>
      )}
    </div>
  );
}

/** The lesson's quiz, full-screen. Finishing it completes the lesson. */
export function QuizScreen({ id }: { id: string }) {
  const found = findLesson(id);
  const finishLesson = useProgress((s) => s.finishLesson);
  const [questions] = useState(() => splitLesson(found?.lesson.steps() ?? []).questions);
  const [result, setResult] = useState<Result>();
  if (!found) return <NotFound />;
  const { course, lesson } = found;

  if (result) {
    const perfect = result.correct === result.total;
    const lessons = courseLessons(course);
    const next = lessons[lessons.findIndex((l) => l.id === id) + 1];
    return (
      <Done
        title={perfect ? "Безупречно!" : "Урокът е завършен!"}
        result={result}
        xp={result.correct * XP.correct + XP.lesson + (perfect ? XP.perfect : 0)}
      >
        <button type="button" className={primaryBtn} onClick={() => go(next ? `#/lesson/${next.id}` : `#/course/${course.id}`)}>
          {next ? `Следващ: ${next.title}` : "Към финалния тест"}
        </button>
        <button type="button" className={secondaryBtn} onClick={() => go(`#/course/${course.id}`)}>
          Към курса
        </button>
      </Done>
    );
  }

  const state = lessonStates(course, useProgress.getState().completed).find((s) => s.lesson.id === id);
  if (!state?.open) return <NotFound />;

  return (
    <Player
      questions={questions}
      mode="lesson"
      onExit={() => go(`#/lesson/${id}`)}
      onFinish={(r) => {
        finishLesson(lesson.id, r.total ? r.correct / r.total : 1);
        setResult(r);
        celebrate();
      }}
    />
  );
}

const REVIEW_SIZE = 15;

/** Full-screen, like a lesson — the tab bar would sit on top of the check button. */
export function ReviewSession() {
  const [session] = useState(() => sample(dueReviews(useProgress.getState().review), REVIEW_SIZE));
  const [result, setResult] = useState<Result>();

  if (result) {
    return (
      <Done title="Преговорът е готов" result={result} xp={result.correct * XP.correct}>
        <button type="button" className={primaryBtn} onClick={() => go("#/review")}>
          Обратно
        </button>
      </Done>
    );
  }
  if (!session.length) return <NotFound />;
  return <Player questions={session.map((r) => r.q)} mode="review" onExit={() => go("#/review")} onFinish={setResult} />;
}

export function ReviewScreen() {
  const review = useProgress((s) => s.review);
  const due = dueReviews(review);
  const later = Object.values(review).filter((r) => !due.includes(r));
  const nextDue = later.length ? Math.min(...later.map((r) => r.due)) : undefined;

  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand text-accent">
        <Brain size={48} strokeWidth={1.5} />
      </span>
      <h1 className="text-2xl font-extrabold">Преговор</h1>
      {due.length ? (
        <>
          <p className="text-muted">
            {due.length} {due.length === 1 ? "въпрос чака" : "въпроса чакат"} да ги затвърдиш. Верен отговор → въпросът се връща след 1, 3, 7 и 21 дни.
          </p>
          <button type="button" className={primaryBtn} onClick={() => go("#/review/go")}>
            Започни ({Math.min(due.length, REVIEW_SIZE)})
          </button>
        </>
      ) : (
        <p className="text-muted">
          {nextDue
            ? `Няма въпроси за днес. Следващият преговор: ${new Date(nextDue).toLocaleDateString("bg-BG", { day: "numeric", month: "long" })}.`
            : "Грешните отговори от уроците ще се появяват тук, за да ги затвърдиш."}
        </p>
      )}
    </div>
  );
}

export function TestScreen({ id }: { id: string }) {
  const course = getCourse(id);
  const passTest = useProgress((s) => s.passTest);
  const completed = useProgress((s) => s.completed);
  const [questions, setQuestions] = useState<ReturnType<typeof testQuestions>>();
  const [result, setResult] = useState<Result>();
  if (!course) return <NotFound />;
  if (!lessonStates(course, completed).every((s) => s.done)) return <NotFound />;

  if (result) {
    const passed = result.correct / result.total >= PASS_SCORE;
    return (
      <Done title={passed ? "Издържа!" : "Почти…"} result={result} xp={result.correct * XP.correct}>
        {passed ? (
          <button type="button" className={primaryBtn} onClick={() => go(`#/cert/${course.id}`)}>
            <Award className="-mt-1 mr-2 inline" size={20} />
            Виж сертификата
          </button>
        ) : (
          <>
            <p className="text-muted">Трябват ти {Math.round(PASS_SCORE * 100)}%. Прегледай грешките в Преговор и опитай пак.</p>
            <button type="button" className={primaryBtn} onClick={() => (setResult(undefined), setQuestions(testQuestions(course)))}>
              <RotateCcw className="-mt-1 mr-2 inline" size={18} />
              Опитай пак
            </button>
          </>
        )}
        <button type="button" className={secondaryBtn} onClick={() => go(`#/course/${course.id}`)}>
          Към курса
        </button>
      </Done>
    );
  }

  if (questions) {
    return (
      <Player
        questions={questions}
        mode="test"
        timeLimit={TEST_SECONDS}
        onExit={() => go(`#/course/${course.id}`)}
        onFinish={(r) => {
          if (r.correct / r.total >= PASS_SCORE) {
            passTest(course.id, r.correct / r.total);
            celebrate();
          }
          setResult(r);
        }}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 p-6 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand text-accent">
        <Award size={48} strokeWidth={1.5} />
      </span>
      <h1 className="text-2xl font-extrabold">Финален тест: {course.title}</h1>
      <ul className="space-y-1.5 text-muted">
        <li>{TEST_SIZE} въпроса от целия курс</li>
        <li className="flex items-center justify-center gap-1">
          <Timer size={16} /> {TEST_SECONDS / 60} минути
        </li>
        <li>Без подсказки — резултатът е накрая</li>
        <li>{Math.round(PASS_SCORE * 100)}% за сертификат</li>
      </ul>
      <button type="button" className={primaryBtn} onClick={() => setQuestions(testQuestions(course))}>
        Започни
      </button>
      <button type="button" className={secondaryBtn} onClick={() => go(`#/course/${course.id}`)}>
        Назад
      </button>
    </div>
  );
}
