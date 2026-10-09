import { useState } from "react";
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
      {q.kind === "choice" && (q.options.every((o) => o.visual) ? <Pictures q={q} {...rest} /> : <Choice q={q} {...rest} />)}
      {q.kind === "multi" && <Multi q={q} {...rest} />}
      {q.kind === "order" && <Order q={q} {...rest} />}
      {q.kind === "slider" && <Slider q={q} {...rest} />}
      {q.kind === "match" && <Match q={q} {...rest} />}
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

/** Picture options in a 2×2 grid; the names appear once the answer is checked. */
function Pictures({ q, answer, onAnswer, revealed }: Props<"choice">) {
  return (
    <div className="grid grid-cols-2 gap-2.5" role="radiogroup">
      {q.options.map((o, i) => {
        const state = revealed ? (i === q.answer ? "right" : answer === i ? "wrong" : undefined) : undefined;
        const tone =
          state === "right"
            ? "border-emerald-500 bg-emerald-50"
            : state === "wrong"
              ? "border-rose-500 bg-rose-50"
              : answer === i
                ? "border-brand bg-brand/5"
                : "border-stone-200 bg-white";
        return (
          <button
            key={o.label}
            type="button"
            disabled={revealed}
            onClick={() => onAnswer(i)}
            role="radio"
            aria-checked={answer === i}
            aria-label={o.label}
            className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3 transition-colors ${tone}`}
          >
            <VisualView v={o.visual!} className="h-28" />
            {revealed && <span className="text-center text-sm font-bold leading-tight">{o.label}</span>}
            {state === "right" && <Check className="absolute right-2 top-2 text-emerald-600" size={20} />}
            {state === "wrong" && <X className="absolute right-2 top-2 text-rose-600" size={20} />}
          </button>
        );
      })}
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

/**
 * Each left item gets a slot; tap a chip to fill the active slot (the first
 * empty one unless another is picked), tap a filled slot to empty it.
 */
function Match({ q, answer, onAnswer, revealed }: Props<"match">) {
  const slots = (answer as number[] | undefined) ?? q.left.map(() => -1);
  const [picked, setPicked] = useState<number>();
  const active = picked !== undefined && slots[picked] === -1 ? picked : slots.indexOf(-1);
  const left = q.right.map((_, i) => i).filter((i) => !slots.includes(i));

  const place = (item: number) => {
    onAnswer(slots.map((s, i) => (i === active ? item : s)));
    setPicked(undefined);
  };
  const tap = (slot: number) => {
    if (slots[slot] !== -1) onAnswer(slots.map((s, i) => (i === slot ? -1 : s)));
    setPicked(slot);
  };

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {q.left.map((label, slot) => {
          const item = slots[slot];
          const right = item === q.answer[slot];
          const tone = revealed
            ? right
              ? "border-emerald-500 bg-emerald-50"
              : "border-rose-500 bg-rose-50"
            : item !== -1
              ? "border-brand bg-brand/5"
              : slot === active
                ? "border-accent border-dashed bg-white"
                : "border-stone-200 border-dashed bg-white";
          return (
            <li key={label} className="grid grid-cols-2 items-stretch gap-2">
              <span className="flex items-center rounded-xl bg-stone-200/60 px-3 py-3 text-[15px] font-bold leading-snug">{label}</span>
              <button
                type="button"
                disabled={revealed}
                onClick={() => tap(slot)}
                aria-label={`${label}: ${item === -1 ? "празно" : q.right[item]}`}
                className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-left text-[15px] font-semibold leading-snug transition-colors ${tone}`}
              >
                <span className="flex-1">
                  {item === -1 ? <span className="text-stone-400">…</span> : q.right[item]}
                  {revealed && !right && <span className="block text-[13px] font-bold text-emerald-700">→ {q.right[q.answer[slot]]}</span>}
                </span>
                {revealed && (right ? <Check className="shrink-0 text-emerald-600" size={18} /> : <X className="shrink-0 text-rose-600" size={18} />)}
              </button>
            </li>
          );
        })}
      </ul>
      {!revealed && left.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {left.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => place(i)}
              className="rounded-full border-2 border-stone-200 bg-white px-4 py-2 font-semibold hover:border-brand"
            >
              {q.right[i]}
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
