import type { PropsWithChildren, ReactNode } from 'react';

export const PageHeader = ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => (
  <div className="flex flex-col gap-4 border-b border-white/12 pb-5 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
      {description ? <p className="mt-2 max-w-3xl text-sm text-slate-300">{description}</p> : null}
    </div>
    {action ? <div className="flex-shrink-0">{action}</div> : null}
  </div>
);

export const Panel = ({ children, className = '' }: PropsWithChildren<{ className?: string }>) => (
  <section className={`rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_10px_30px_-20px_rgba(2,6,23,0.9)] ${className}`}>{children}</section>
);

export const Field = ({
  label,
  children,
  hint,
}: PropsWithChildren<{ label: string; hint?: string }>) => (
  <label className="flex flex-col gap-2 text-sm text-slate-200">
    <span className="font-medium text-slate-100">{label}</span>
    {children}
    {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
  </label>
);

export const InputClassName =
  'w-full rounded-xl border border-white/15 bg-slate-950/85 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  ...props
}: PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }>) => {
  const styles =
    variant === 'primary'
      ? 'bg-sky-500 text-white hover:bg-sky-400'
      : variant === 'danger'
        ? 'bg-rose-500/90 text-white hover:bg-rose-400'
        : 'bg-white/8 text-slate-100 hover:bg-white/14';

  return (
    <button
      type={type}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-400/30 ${styles} disabled:cursor-not-allowed disabled:opacity-50`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'success' | 'warning' | 'danger' }>) => {
  const styles =
    tone === 'success'
      ? 'bg-emerald-500/15 text-emerald-300'
      : tone === 'warning'
        ? 'bg-amber-500/15 text-amber-300'
        : tone === 'danger'
          ? 'bg-rose-500/15 text-rose-300'
          : 'bg-white/10 text-slate-300';

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles}`}>{children}</span>;
};

export const Table = ({ children }: PropsWithChildren) => (
  <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-200">{children}</table>
    </div>
  </div>
);

export const MetricCard = ({ label, value, note }: { label: string; value: string | number; note?: string }) => (
  <Panel className="bg-slate-900/85">
    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    {note ? <p className="mt-2 text-xs text-slate-400">{note}</p> : null}
  </Panel>
);
