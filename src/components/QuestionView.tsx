import { Check, X } from "lucide-react";

import { Figure, VisualView } from "@/components/Cards";
import type { Answer, Option, Question } from "@/course/types";

type Props<K extends Question["kind"]> = {
  q: Extract<Question, { kind: K }>;
  answer: Answer | undefined;
  onAnswer: (a: Answer) => void;
  /** Locked and showing what was right. */
  revealed: boolean;
};

export default function QuestionView({ q, ...rest }: Omit<Props<Question["kind"]>, "q"> & { q: Question }) {
  return (
    <div className="space-y-6">
      {q.visual && (
        <Figure tone={q.visual.img ? "paper" : "brand"}>
          <VisualView v={q.visual} className="h-40" />
        </Figure>
      )}
      <h2 className="whitespace-pre-line text-xl font-bold leading-snug">{q.prompt}</h2>
      {q.kind === "choice" && <Choice q={q} {...rest} />}
      {q.kind === "multi" && <Multi q={q} {...rest} />}
      {q.kind === "order" && <Order q={q} {...rest} />}
      {q.kind === "slider" && <Slider q={q} {...rest} />}
    </div>
  );
}

type Tone = "right" | "wrong" | undefined;

const ring = (selected: boolean, state: Tone) =>
  state === "right"
    ? "border-good bg-good/10"
    : state === "wrong"
      ? "border-bad bg-bad/10"
      : selected
        ? "border-accent bg-accent/10"
        : "border-line hover:border-muted/60";

function OptionButton({
  option,
  selected,
  state,
  revealed,
  onClick,
  marker,
}: {
  option: Option;
  selected: boolean;
  state: Tone;
  revealed: boolean;
  onClick: () => void;
  marker?: React.ReactNode;
}) {
  // Picture answers: the label would give it away, so it only shows once checked.
  if (option.visual) {
    return (
      <button
        type="button"
        disabled={revealed}
        onClick={onClick}
        aria-pressed={selected}
        aria-label={revealed ? option.label : undefined}
        className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-2 transition-colors ${ring(selected, state)}`}
      >
        <span className={`flex h-36 w-full items-center justify-center rounded-xl ${option.visual.img ? "bg-white" : "bg-brand"}`}>
          <VisualView v={option.visual} className="h-28" />
        </span>
        {revealed && <span className="pb-1 text-sm font-bold">{option.label}</span>}
        {state && <StateIcon state={state} className="absolute right-3 top-3" />}
      </button>
    );
  }
  return (
    <button
      type="button"
      disabled={revealed}
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 px-5 py-5 text-left text-[17px] transition-colors ${ring(selected, state)}`}
    >
      {marker}
      <span className="flex-1">{option.label}</span>
      {state && <StateIcon state={state} />}
    </button>
  );
}

const StateIcon = ({ state, className = "" }: { state: "right" | "wrong"; className?: string }) =>
  state === "right" ? <Check className={`text-good ${className}`} size={20} /> : <X className={`text-bad ${className}`} size={20} />;

const layout = (options: Option[]) => (options.some((o) => o.visual) ? "grid grid-cols-2 gap-3" : "space-y-3");

function Choice({ q, answer, onAnswer, revealed }: Props<"choice">) {
  return (
    <div className={layout(q.options)} role="radiogroup">
      {q.options.map((o, i) => (
        <OptionButton
          key={o.label}
          option={o}
          selected={answer === i}
          revealed={revealed}
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
    <div className={layout(q.options)}>
      {q.options.map((o, i) => {
        const isPicked = picked.includes(i);
        return (
          <OptionButton
            key={o.label}
            option={o}
            selected={isPicked}
            revealed={revealed}
            state={revealed ? (q.answer.includes(i) ? "right" : isPicked ? "wrong" : undefined) : undefined}
            onClick={() => toggle(i)}
            marker={
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${isPicked ? "border-accent bg-accent text-on-accent" : "border-muted/50"}`}
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
      <ol className="space-y-2.5">
        {q.items.map((_, slot) => {
          const item = placed[slot];
          return (
            <li key={slot}>
              <OptionButton
                option={{ label: item === undefined ? "…" : q.items[item] }}
                selected={item !== undefined}
                state={revealed ? (item === q.answer[slot] ? "right" : "wrong") : undefined}
                revealed={revealed || item === undefined}
                onClick={() => onAnswer(placed.filter((p) => p !== item))}
                marker={<span className="w-5 text-center font-extrabold text-muted">{slot + 1}</span>}
              />
            </li>
          );
        })}
      </ol>
      <div className="flex justify-between px-1 text-xs font-bold uppercase tracking-wider text-muted">
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
              className="rounded-full border-2 border-line bg-surface px-4 py-2 font-semibold hover:border-accent"
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
    <div className="space-y-3 rounded-2xl border-2 border-line p-5">
      <div className="text-center text-4xl font-extrabold tabular-nums">
        {value} <span className="text-lg text-muted">{q.unit}</span>
      </div>
      <div className="relative pt-2">
        {revealed && (
          <div
            className="absolute top-0 h-1.5 rounded-full bg-good"
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
      <div className="flex justify-between text-sm tabular-nums text-muted">
        <span>{q.min}</span>
        <span>{q.max}</span>
      </div>
    </div>
  );
}
