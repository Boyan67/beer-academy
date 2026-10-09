import { useState } from "react";
import confetti from "canvas-confetti";
import { Award, Brain, RotateCcw, Star, Target, Timer } from "lucide-react";

import Player, { type Result } from "@/components/Player";
import { PASS_SCORE, TEST_SECONDS, TEST_SIZE, courseLessons, findLesson, getCourse, learnThenQuiz, testQuestions } from "@/course/courses";
import { sample } from "@/course/questions";
import { XP } from "@/progress";
import { dueReviews, useProgress } from "@/store";
import { NotFound, go, lessonStates } from "@/screens/Home";

const celebrate = () => confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, disableForReducedMotion: true });

function Done({
  title,
  result,
  xp,
  children,
}: {
  title: string;
  result: Result;
  xp: number;
  children: React.ReactNode;
}) {
  const pct = result.total ? Math.round((result.correct / result.total) * 100) : 100;
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center duration-500 animate-in fade-in zoom-in-95">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <div className="grid w-full grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4">
          <Star className="mx-auto text-amber-500" fill="currentColor" />
          <p className="mt-1 text-2xl font-extrabold tabular-nums">+{xp}</p>
          <p className="text-sm text-stone-500">XP</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <Target className="mx-auto text-emerald-600" />
          <p className="mt-1 text-2xl font-extrabold tabular-nums">{pct}%</p>
          <p className="text-sm text-stone-500">
            {result.correct} от {result.total} верни
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2">{children}</div>
    </div>
  );
}

const primaryBtn = "w-full rounded-xl bg-brand py-3.5 text-[17px] font-extrabold text-white hover:bg-brand-hover";
const secondaryBtn = "w-full rounded-xl border-2 border-stone-300 bg-white py-3 font-bold text-stone-700 hover:border-stone-400";

export function LessonScreen({ id }: { id: string }) {
  const found = findLesson(id);
  const finishLesson = useProgress((s) => s.finishLesson);
  const [steps] = useState(() => learnThenQuiz(found?.lesson.steps() ?? []));
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
        {next ? (
          <button type="button" className={primaryBtn} onClick={() => go(`#/lesson/${next.id}`)}>
            Следващ: {next.title}
          </button>
        ) : (
          <button type="button" className={primaryBtn} onClick={() => go(`#/course/${course.id}`)}>
            Към финалния тест
          </button>
        )}
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
      steps={steps}
      mode="lesson"
      onExit={() => go(`#/course/${course.id}`)}
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
  return <Player steps={session.map((r) => ({ question: r.q }))} mode="review" onExit={() => go("#/review")} onFinish={setResult} />;
}

export function ReviewScreen() {
  const review = useProgress((s) => s.review);
  const due = dueReviews(review);
  const later = Object.values(review).filter((r) => !due.includes(r));

  const nextDue = later.length ? Math.min(...later.map((r) => r.due)) : undefined;
  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand/10 text-brand">
        <Brain size={40} />
      </span>
      <h1 className="text-2xl font-extrabold">Преговор</h1>
      {due.length ? (
        <>
          <p className="text-stone-600">
            {due.length} {due.length === 1 ? "въпрос чака" : "въпроса чакат"} да ги затвърдиш. Верен отговор → въпросът се връща след 1, 3, 7 и 21 дни.
          </p>
          <button type="button" className={primaryBtn} onClick={() => go("#/review/go")}>
            Започни ({Math.min(due.length, REVIEW_SIZE)})
          </button>
        </>
      ) : (
        <p className="text-stone-600">
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
    const score = result.correct / result.total;
    const passed = score >= PASS_SCORE;
    return (
      <Done title={passed ? "Издържа!" : "Почти…"} result={result} xp={result.correct * XP.correct}>
        {passed ? (
          <button type="button" className={primaryBtn} onClick={() => go(`#/cert/${course.id}`)}>
            <Award className="-mt-1 mr-2 inline" size={20} />
            Виж сертификата
          </button>
        ) : (
          <>
            <p className="text-stone-600">Трябват ти {Math.round(PASS_SCORE * 100)}%. Прегледай грешките в Преговор и опитай пак.</p>
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
        steps={questions.map((q) => ({ question: q }))}
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
      <Award size={56} className="text-accent" />
      <h1 className="text-2xl font-extrabold">Финален тест: {course.title}</h1>
      <ul className="space-y-1 text-stone-700">
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
