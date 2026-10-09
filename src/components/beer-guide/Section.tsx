import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  accent: string;
  /** Optional control pinned to the right of the header, e.g. an info toggle. */
  action?: React.ReactNode;
  children: React.ReactNode;
};

export default function Section({
  icon: Icon,
  title,
  accent,
  action,
  children,
}: Props) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4.5 ">
      <div className="mb-3.5 flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-md"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          <Icon size={17} />
        </span>
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-stone-800">
          {title}
        </h2>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </section>
  );
}
