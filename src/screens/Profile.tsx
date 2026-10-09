import { useRef } from "react";
import { Award, Download, Flame, RotateCcw, Upload } from "lucide-react";

import { COURSES } from "@/course/courses";
import { LEVELS, addDays, dayKey, levelFor, streak } from "@/progress";
import { exportBackup, importBackup, useProgress } from "@/store";
import { go } from "@/screens/Home";

const GOALS = [
  { xp: 30, label: "Спокойно", hint: "~ половин урок" },
  { xp: 80, label: "Редовно", hint: "~ 1 урок" },
  { xp: 160, label: "Сериозно", hint: "~ 2 урока" },
];

export function Profile() {
  const s = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const level = levelFor(s.xp);
  const days = streak(s.xpByDay, s.dailyGoal);
  const week = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 6));

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportBackup()], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `bira-akademia-${dayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const restore = async (file?: File) => {
    if (!file) return;
    try {
      importBackup(await file.text());
      alert("Прогресът е възстановен.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Неуспешно възстановяване.");
    }
  };

  return (
    <div className="space-y-5 p-4 pt-[max(16px,env(safe-area-inset-top))]">
      <h1 className="text-2xl font-extrabold">Профил</h1>

      <label className="block rounded-2xl bg-white p-4">
        <span className="text-sm font-bold text-stone-600">Име (за сертификатите)</span>
        <input
          className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2"
          key={s.name}
          defaultValue={s.name}
          placeholder="Име и фамилия"
          onBlur={(e) => s.set({ name: e.target.value.trim() })}
        />
      </label>

      <section className="rounded-2xl bg-white p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold">{level.name}</h2>
          <span className="text-sm font-bold tabular-nums text-stone-500">{s.xp} XP</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-stone-100">
          <div className="h-full rounded-full bg-accent" style={{ width: `${level.progress * 100}%` }} />
        </div>
        <p className="mt-1.5 text-sm text-stone-500">
          {level.next ? `${level.toNext} XP до ${level.next}` : "Достигна върха!"} · Ниво {level.index + 1} от {LEVELS.length}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-4">
        <div className="flex items-center gap-2">
          <Flame className="text-accent" fill="currentColor" size={22} />
          <h2 className="text-lg font-extrabold">
            {days} {days === 1 ? "ден" : "дни"} поред
          </h2>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center">
          {week.map((d) => {
            const hit = (s.xpByDay[dayKey(d)] ?? 0) >= s.dailyGoal;
            return (
              <div key={dayKey(d)}>
                <div className="text-xs font-bold uppercase text-stone-500">{d.toLocaleDateString("bg-BG", { weekday: "narrow" })}</div>
                <div
                  className={`mx-auto mt-1 flex h-9 w-9 items-center justify-center rounded-full ${hit ? "bg-accent text-white" : "bg-stone-100 text-stone-300"}`}
                >
                  <Flame size={16} fill={hit ? "currentColor" : "none"} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <fieldset className="rounded-2xl bg-white p-4">
        <legend className="sr-only">Дневна цел</legend>
        <h2 className="mb-3 text-lg font-extrabold">Дневна цел</h2>
        <div className="grid grid-cols-3 gap-2">
          {GOALS.map((g) => (
            <button
              key={g.xp}
              type="button"
              aria-pressed={s.dailyGoal === g.xp}
              onClick={() => s.set({ dailyGoal: g.xp })}
              className={`rounded-xl border-2 p-2.5 ${s.dailyGoal === g.xp ? "border-brand bg-brand/5" : "border-stone-200"}`}
            >
              <div className="font-bold">{g.label}</div>
              <div className="text-sm tabular-nums text-stone-500">{g.xp} XP</div>
              <div className="text-xs text-stone-400">{g.hint}</div>
            </button>
          ))}
        </div>
      </fieldset>

      {COURSES.some((c) => s.certificates[c.id]) && (
        <section className="rounded-2xl bg-white p-4">
          <h2 className="mb-2 text-lg font-extrabold">Сертификати</h2>
          {COURSES.filter((c) => s.certificates[c.id]).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => go(`#/cert/${c.id}`)}
              className="flex w-full items-center gap-2 rounded-lg py-2 text-left font-semibold hover:bg-stone-50"
            >
              <Award className="text-accent" size={20} /> {c.title}
              <span className="ml-auto text-sm text-stone-500">{Math.round(s.certificates[c.id].score * 100)}%</span>
            </button>
          ))}
        </section>
      )}

      <section className="space-y-2 rounded-2xl bg-white p-4">
        <h2 className="text-lg font-extrabold">Резервно копие</h2>
        <p className="text-sm text-stone-500">Прогресът се пази само на това устройство. Свали копие, за да го пренесеш или да не го загубиш.</p>
        <div className="flex gap-2">
          <button type="button" onClick={download} className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-stone-200 py-2.5 font-bold hover:border-stone-300">
            <Download size={18} /> Свали
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-stone-200 py-2.5 font-bold hover:border-stone-300"
          >
            <Upload size={18} /> Възстанови
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => restore(e.target.files?.[0])} />
        </div>
        <button
          type="button"
          onClick={() => confirm("Изтриване на целия прогрес? Това не може да се върне.") && s.reset()}
          className="flex items-center gap-1.5 pt-2 text-sm font-semibold text-rose-600 hover:underline"
        >
          <RotateCcw size={14} /> Изтрий прогреса
        </button>
      </section>
    </div>
  );
}
