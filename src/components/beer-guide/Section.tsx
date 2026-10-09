import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  /** Optional control pinned to the right of the header, e.g. an info toggle. */
  action?: React.ReactNode;
  children: React.ReactNode;
};

export default function Section({ icon: Icon, title, action, children }: Props) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Icon size={20} />
        </span>
        <h2 className="text-xl font-extrabold leading-tight">{title}</h2>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </section>
  );
}
