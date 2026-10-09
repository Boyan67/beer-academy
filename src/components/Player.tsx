import { useEffect, useState } from "react";
import { CircleCheck, CircleX, Timer, X } from "lucide-react";

import { CardView } from "@/components/Cards";
import QuestionView, { sliderStart } from "@/components/QuestionView";
import { checkAnswer } from "@/course/questions";
import type { Answer, Question, Step } from "@/course/types";
import { useProgress, type Mode } from "@/store";

export type Result = { correct: number; total: number };

type Props = {
  steps: Step[];
  mode: Mode;
  /** Seconds; tests only. Running out finishes with what's answered. */
  timeLimit?: number;
  onExit: () => void;
  onFinish: (r: Result) => void;
};

const defaultAnswer = (q: Question): Answer | undefined => (q.kind === "slider" ? sliderStart(q) : undefined);

const ready = (q: Question, a: Answer | undefined) =>
  a !== undefined && (q.kind === "order" ? (a as number[]).length === q.items.length : q.kind !== "multi" || (a as number[]).length > 0);

export default function Player({ steps, mode, timeLimit, onExit, onFinish }: Props) {
  const answerQ = useProgress((s) => s.answer);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer | undefined>();
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState<Result>({ correct: 0, total: 0 });
  const [left, setLeft] = useState(timeLimit ?? 0);

  const step = steps[index];
  const q = "question" in step ? step.question : undefined;
  const isRight = q ? checkAnswer(q, answer ?? defaultAnswer(q)) : false;
  const totalQuestions = steps.filter((s) => "question" in s).length;

  useEffect(() => {
    if (!timeLimit) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLimit]);

  // Time's up: unanswered questions count as wrong.
  useEffect(() => {
    if (timeLimit && left === 0) onFinish({ correct: score.correct, total: totalQuestions });
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = (next: Result) => {
    setScore(next);
    setAnswer(undefined);
    setRevealed(false);
    if (index + 1 >= steps.length) onFinish(next);
    else setIndex(index + 1);
  };

  const check = () => {
    if (!q) return;
    answerQ(q, isRight, mode);
    const next = { correct: score.correct + (isRight ? 1 : 0), total: score.total + 1 };
    if (mode === "test") advance(next);
    else {
      setScore(next);
      setRevealed(true);
    }
  };

  const exit = () => {
    if (index === 0 || confirm("Да прекъснеш ли? Прогресът в този урок ще се загуби.")) onExit();
  };

  const primary = !q
    ? { label: index === 0 ? "Започни" : "Напред", onClick: () => advance(score), enabled: true }
    : revealed
      ? { label: "Напред", onClick: () => advance(score), enabled: true }
      : { label: mode === "test" ? "Отговори" : "Провери", onClick: check, enabled: ready(q, answer ?? defaultAnswer(q)) };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-stone-100/95 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur">
        <button type="button" onClick={exit} aria-label="Затвори" className="rounded-full p-1.5 text-stone-500 hover:bg-stone-200">
          <X size={22} />
        </button>
        <div
          className="h-3 flex-1 overflow-hidden rounded-full bg-stone-200"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={index}
        >
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${(index / steps.length) * 100}%` }} />
        </div>
        {timeLimit ? (
          <span className={`flex items-center gap-1 text-sm font-bold tabular-nums ${left < 60 ? "text-rose-600" : "text-stone-600"}`}>
            <Timer size={16} />
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
          </span>
        ) : null}
      </header>

      <main key={index} className="flex-1 px-4 pb-40 pt-2 duration-300 animate-in fade-in slide-in-from-right-4">
        {"question" in step ? (
          <QuestionView q={step.question} answer={answer} onAnswer={setAnswer} revealed={revealed} />
        ) : (
          <CardView card={step.card} />
        )}
      </main>

      <footer
        className={`fixed inset-x-0 bottom-0 z-10 mx-auto max-w-lg border-t px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 ${
          revealed ? (isRight ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50") : "border-stone-200 bg-stone-100"
        }`}
      >
        {revealed && q && (
          <div className="mb-3 flex gap-2.5 duration-200 animate-in slide-in-from-bottom-2" role="status">
            {isRight ? <CircleCheck className="shrink-0 text-emerald-600" /> : <CircleX className="shrink-0 text-rose-600" />}
            <div>
              <p className={`font-extrabold ${isRight ? "text-emerald-700" : "text-rose-700"}`}>
                {isRight ? "Точно така!" : "Не съвсем"}
              </p>
              <p className="text-[15px] leading-snug text-stone-700">{q.explain}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          disabled={!primary.enabled}
          onClick={primary.onClick}
          className={`w-full rounded-xl py-3.5 text-[17px] font-extrabold text-white transition-colors disabled:bg-stone-300 ${
            revealed && !isRight ? "bg-rose-600 hover:bg-rose-700" : revealed ? "bg-emerald-600 hover:bg-emerald-700" : "bg-brand hover:bg-brand-hover"
          }`}
        >
          {primary.label}
        </button>
      </footer>
    </div>
  );
}
