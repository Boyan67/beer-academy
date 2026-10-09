import { Award, ChevronLeft, Printer, Share2 } from "lucide-react";

import { getCourse } from "@/course/courses";
import { useProgress } from "@/store";
import { NotFound, go } from "@/screens/Home";

export function CertificateScreen({ id }: { id: string }) {
  const course = getCourse(id);
  const cert = useProgress((s) => s.certificates[id]);
  const name = useProgress((s) => s.name);
  const set = useProgress((s) => s.set);
  if (!course || !cert) return <NotFound />;

  const date = new Date(cert.date).toLocaleDateString("bg-BG", { day: "numeric", month: "long", year: "numeric" });
  const text = `Завърших курса „${course.title}“ в Бира Академия с ${Math.round(cert.score * 100)}%! 🍺`;

  return (
    <div className="space-y-5 p-4 pt-[max(16px,env(safe-area-inset-top))]">
      <header className="no-print flex items-center gap-2">
        <button type="button" onClick={() => go(`#/course/${id}`)} aria-label="Назад" className="rounded-full p-1.5 hover:bg-stone-200">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-extrabold">Сертификат</h1>
      </header>

      {!name && (
        <label className="no-print block rounded-2xl bg-white p-4">
          <span className="text-sm font-bold text-stone-600">Как да изпишем името ти?</span>
          <input
            className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2"
            placeholder="Име и фамилия"
            onBlur={(e) => set({ name: e.target.value.trim() })}
          />
        </label>
      )}

      <article className="rounded-2xl border-[6px] border-double border-brand bg-[#fffdf7] px-6 py-10 text-center">
        <Award className="mx-auto text-accent" size={52} />
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.25em] text-stone-500">Бира Академия · Сертификат</p>
        <p className="mt-6 text-sm text-stone-500">Удостоверява, че</p>
        <p className="mt-1 text-3xl font-extrabold text-brand">{name || "…"}</p>
        <p className="mt-4 text-sm text-stone-500">завърши успешно курса</p>
        <p className="mt-1 text-2xl font-extrabold">{course.title}</p>
        <p className="mx-auto mt-2 max-w-xs text-sm text-stone-600">{course.description}</p>
        <div className="mt-8 flex justify-center gap-10 text-sm">
          <div>
            <p className="text-xl font-extrabold tabular-nums">{Math.round(cert.score * 100)}%</p>
            <p className="text-stone-500">резултат</p>
          </div>
          <div>
            <p className="text-xl font-extrabold">{date}</p>
            <p className="text-stone-500">дата</p>
          </div>
        </div>
      </article>

      <div className="no-print flex gap-2">
        <button
          type="button"
          onClick={() => print()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-extrabold text-white hover:bg-brand-hover"
        >
          <Printer size={18} /> PDF / Печат
        </button>
        {"share" in navigator && (
          <button
            type="button"
            onClick={() => navigator.share({ title: "Бира Академия", text }).catch(() => {})}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-extrabold text-white hover:bg-accent-dark"
          >
            <Share2 size={18} /> Сподели
          </button>
        )}
      </div>
    </div>
  );
}
