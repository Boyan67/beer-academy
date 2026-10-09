import { Check, X } from "lucide-react";

import { VisualView } from "@/components/Cards";
import type { Answer, Question } from "@/course/types";

type Props<K extends Question["kind"]> = {
  q: Extract<Question, { kind: K }>;
  answer: Answer | undefined;
  onAnswer: (a: Answer) => void;
  /** Locked and showing what was right. */
  revealed: boolean;
};

export default function QuestionView({ q, ...rest }: Omit<Props<Question["kind"]>, "q"> & { q: Question }) {
  return (
    <div className="space-y-5">
      <h2 className="whitespace-pre-line text-xl font-extrabold leading-snug">{q.prompt}</h2>
      {q.visual && (
        <div className="flex justify-center">
          <VisualView v={q.visual} className="h-40" />
        </div>
      )}
      {q.kind === "choice" && <Choice q={q} {...rest} />}
      {q.kind === "multi" && <Multi q={q} {...rest} />}
      {q.kind === "order" && <Order q={q} {...rest} />}
      {q.kind === "slider" && <Slider q={q} {...rest} />}
    </div>
  );
}

function OptionButton({
  label,
  selected,
  state,
  disabled,
  onClick,
  marker,
}: {
  label: string;
  selected: boolean;
  state?: "right" | "wrong";
  disabled: boolean;
  onClick: () => void;
  marker?: React.ReactNode;
}) {
  const tone =
    state === "right"
      ? "border-emerald-500 bg-emerald-50"
      : state === "wrong"
        ? "border-rose-500 bg-rose-50"
        : selected
          ? "border-brand bg-brand/5"
          : "border-stone-200 bg-white hover:border-stone-300";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-[16px] font-semibold transition-colors ${tone}`}
    >
      {marker}
      <span className="flex-1">{label}</span>
      {state === "right" && <Check className="text-emerald-600" size={20} />}
      {state === "wrong" && <X className="text-rose-600" size={20} />}
    </button>
  );
}

function Choice({ q, answer, onAnswer, revealed }: Props<"choice">) {
  return (
    <div className="space-y-2.5" role="radiogroup">
      {q.options.map((o, i) => (
        <OptionButton
          key={o.label}
          label={o.label}
          selected={answer === i}
          disabled={revealed}
          state={revealed ? (i === q.answer ? "right" : answer === i ? "wrong" : undefined) : undefined}
          onClick={() => onAnswer(i)}
        />
      ))}
    </div>
  );
}

function Multi({ q, answer, onAnswer, revealed }: Props<"multi">) {
  const picked = (answer as number[] | undefined) ?? [];
  const toggle = (i: number) => onAnswer(picked.includes(i) ? picked.filter((p) => p !== i) : [...picked, i]);
  return (
    <div className="space-y-2.5">
      {q.options.map((o, i) => {
        const isPicked = picked.includes(i);
        const isRight = q.answer.includes(i);
        return (
          <OptionButton
            key={o.label}
            label={o.label}
            selected={isPicked}
            disabled={revealed}
            state={revealed ? (isRight ? "right" : isPicked ? "wrong" : undefined) : undefined}
            onClick={() => toggle(i)}
            marker={
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${isPicked ? "border-brand bg-brand text-white" : "border-stone-300"}`}
              >
                {isPicked && <Check size={14} strokeWidth={3} />}
              </span>
            }
          />
        );
      })}
    </div>
  );
}

/** Tap in order; tap a placed item to take it back. */
function Order({ q, answer, onAnswer, revealed }: Props<"order">) {
  const placed = (answer as number[] | undefined) ?? [];
  const left = q.items.map((_, i) => i).filter((i) => !placed.includes(i));
  return (
    <div className="space-y-4">
      <ol className="space-y-2">
        {q.items.map((_, slot) => {
          const item = placed[slot];
          const state = revealed ? (item === q.answer[slot] ? "right" : "wrong") : undefined;
          return (
            <li key={slot}>
              <OptionButton
                label={item === undefined ? "…" : q.items[item]}
                selected={item !== undefined}
                state={state}
                disabled={revealed || item === undefined}
                onClick={() => onAnswer(placed.filter((p) => p !== item))}
                marker={<span className="w-5 text-center font-extrabold text-stone-400">{slot + 1}</span>}
              />
            </li>
          );
        })}
      </ol>
      <div className="flex justify-between px-1 text-xs font-bold uppercase tracking-wider text-stone-500">
        <span>1 = {q.hint[0]}</span>
        <span>
          {q.items.length} = {q.hint[1]}
        </span>
      </div>
      {!revealed && left.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {left.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => onAnswer([...placed, i])}
              className="rounded-full border-2 border-stone-200 bg-white px-4 py-2 font-semibold hover:border-brand"
            >
              {q.items[i]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const sliderStart = (q: Extract<Question, { kind: "slider" }>) =>
  Math.round((q.min + q.max) / 2 / q.step) * q.step;

function Slider({ q, answer, onAnswer, revealed }: Props<"slider">) {
  const value = (answer as number | undefined) ?? sliderStart(q);
  const pct = (v: number) => ((v - q.min) / (q.max - q.min)) * 100;
  return (
    <div className="space-y-3 rounded-2xl bg-white p-5">
      <div className="text-center text-4xl font-extrabold tabular-nums">
        {value} <span className="text-lg text-stone-500">{q.unit}</span>
      </div>
      <div className="relative pt-2">
        {revealed && (
          <div
            className="absolute top-0 h-1.5 rounded-full bg-emerald-500"
            style={{ left: `${pct(q.answer[0])}%`, width: `${pct(q.answer[1]) - pct(q.answer[0])}%` }}
            title="Верният диапазон"
          />
        )}
        <input
          type="range"
          min={q.min}
          max={q.max}
          step={q.step}
          value={value}
          disabled={revealed}
          onChange={(e) => onAnswer(Number(e.target.value))}
          aria-label={q.prompt}
          className="w-full"
        />
      </div>
      <div className="flex justify-between text-sm text-stone-500 tabular-nums">
        <span>{q.min}</span>
        <span>{q.max}</span>
      </div>
    </div>
  );
}
