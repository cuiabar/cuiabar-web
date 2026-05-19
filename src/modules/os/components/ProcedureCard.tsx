import type { Procedure } from '../data/types';

type ProcedureCardProps = {
  procedure: Procedure;
};

export const ProcedureCard = ({ procedure }: ProcedureCardProps) => (
  <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm" id={procedure.id}>
    <div className="flex flex-wrap gap-2">
      {procedure.tags.map((tag) => (
        <span key={tag} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          {tag}
        </span>
      ))}
    </div>
    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">{procedure.title}</h2>

    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Objetivo</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">{procedure.objective}</p>
      </section>
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Quando usar</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">{procedure.whenToUse}</p>
      </section>
    </div>

    <section className="mt-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Procedimento</h3>
      <ol className="mt-3 space-y-2">
        {procedure.steps.map((step) => (
          <li key={step} className="rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
            {step}
          </li>
        ))}
      </ol>
    </section>

    <section className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Script sugerido</h3>
      <p className="mt-2 text-sm leading-6 text-slate-800">{procedure.script}</p>
    </section>

    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Checklist</h3>
        <ul className="mt-3 space-y-2">
          {procedure.checklist.map((item) => (
            <li key={item} className="text-sm leading-6 text-slate-700">
              <span className="mr-2 text-slate-400">□</span>
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Erros comuns</h3>
        <ul className="mt-3 space-y-2">
          {procedure.commonErrors.map((item) => (
            <li key={item} className="text-sm leading-6 text-slate-700">
              <span className="mr-2 text-rose-500">!</span>
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>

    <section className="mt-5 border-t border-slate-200 pt-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Acao corretiva</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">{procedure.correctiveAction}</p>
    </section>
  </article>
);
