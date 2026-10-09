import { useEffect, useState } from "react";
import { CircleCheck, CircleX, Timer, X } from "lucide-react";

import QuestionView, { sliderStart } from "@/components/QuestionView";
import { checkAnswer } from "@/course/questions";
import type { Answer, Question } from "@/course/types";
import { useProgress, type Mode } from "@/store";

export type Result = { correct: number; total: number };

type Props = {
  questions: Question[];
  mode: Mode;
  /** Seconds; tests only. Running out finishes with what's answered. */
  timeLimit?: number;
  onExit: () => void;
  onFinish: (r: Result) => void;
};

const defaultAnswer = (q: Question): Answer | undefined => (q.kind === "slider" ? sliderStart(q) : undefined);

const ready = (q: Question, a: Answer | undefined) =>
  a !== undefined && (q.kind === "order" ? (a as number[]).length === q.items.length : q.kind !== "multi" || (a as number[]).length > 0);

/** The quiz screen: one question at a time, check, feedback, next. */
export default function Player({ questions, mode, timeLimit, onExit, onFinish }: Props) {
  const answerQ = useProgress((s) => s.answer);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer | undefined>();
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState<Result>({ correct: 0, total: 0 });
  const [left, setLeft] = useState(timeLimit ?? 0);

  const q = questions[index];
  const current = answer ?? defaultAnswer(q);
  const isRight = checkAnswer(q, current);

  useEffect(() => {
    if (!timeLimit) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLimit]);

  // Time's up: unanswered questions count as wrong.
  useEffect(() => {
    if (timeLimit && left === 0) onFinish({ correct: score.correct, total: questions.length });
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = (next: Result) => {
    setScore(next);
    setAnswer(undefined);
    setRevealed(false);
    if (index + 1 >= questions.length) onFinish(next);
    else setIndex(index + 1);
  };

  const check = () => {
    answerQ(q, isRight, mode);
    const next = { correct: score.correct + (isRight ? 1 : 0), total: score.total + 1 };
    if (mode === "test") advance(next);
    else {
      setScore(next);
      setRevealed(true);
    }
  };

  const exit = () => {
    if (index === 0 || confirm("Да прекъснеш ли? Отговорите дотук ще се загубят.")) onExit();
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-4 bg-bg/95 px-4 pb-4 pt-[max(16px,env(safe-area-inset-top))] backdrop-blur">
        <button type="button" onClick={exit} aria-label="Затвори" className="rounded-full p-1 text-muted hover:text-ink">
          <X size={26} />
        </button>
        <div
          className="h-2.5 flex-1 overflow-hidden rounded-full bg-raised"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={index}
        >
          <div className="h-full rounded-full bg-ink transition-all duration-500" style={{ width: `${(index / questions.length) * 100}%` }} />
        </div>
        {timeLimit ? (
          <span className={`flex items-center gap-1 text-sm font-bold tabular-nums ${left < 60 ? "text-bad" : "text-muted"}`}>
            <Timer size={16} />
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
          </span>
        ) : (
          <span className="text-sm font-bold tabular-nums text-muted">
            {index + 1}/{questions.length}
          </span>
        )}
      </header>

      <main key={index} className="flex-1 px-4 pb-44 pt-2 duration-300 animate-in fade-in slide-in-from-right-4">
        <QuestionView q={q} answer={answer} onAnswer={setAnswer} revealed={revealed} />
      </main>

      <footer
        className={`fixed inset-x-0 bottom-0 z-10 mx-auto max-w-lg px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 ${
          revealed ? (isRight ? "bg-[#17332a]" : "bg-[#3a1f27]") : "bg-bg"
        }`}
      >
        {revealed && (
          <div className="mb-4 flex gap-3 duration-200 animate-in slide-in-from-bottom-2" role="status">
            {isRight ? <CircleCheck className="shrink-0 text-good" size={26} /> : <CircleX className="shrink-0 text-bad" size={26} />}
            <div>
              <p className={`text-lg font-extrabold ${isRight ? "text-good" : "text-bad"}`}>{isRight ? "Точно така!" : "Не съвсем"}</p>
              <p className="text-[15px] leading-snug text-ink/85">{q.explain}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          disabled={!revealed && !ready(q, current)}
          onClick={revealed ? () => advance(score) : check}
          className={`w-full rounded-xl py-4 text-[17px] font-extrabold transition-colors disabled:bg-raised disabled:text-muted ${
            revealed && !isRight ? "bg-bad text-bg" : revealed ? "bg-good text-bg" : "bg-accent text-on-accent hover:bg-accent-hover"
          }`}
        >
          {revealed ? "Напред" : mode === "test" ? "Отговори" : "Провери"}
        </button>
      </footer>
    </div>
  );
}
