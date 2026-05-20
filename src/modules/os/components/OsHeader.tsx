type OsHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export const OsHeader = ({ eyebrow = 'Manual interno', title, description }: OsHeaderProps) => (
  <header className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p>
    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
    <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{description}</p>
  </header>
);
