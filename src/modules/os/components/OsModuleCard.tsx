import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { OsModule } from '../data/types';

type OsModuleCardProps = {
  module: OsModule;
};

export const OsModuleCard = ({ module }: OsModuleCardProps) => (
  <Link
    to={module.path}
    className="group block rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
  >
    <span className={`mb-4 block h-1.5 w-16 rounded-full ${module.accent}`} />
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">{module.title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
      </div>
      <ArrowRight aria-hidden="true" className="mt-1 h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-950" />
    </div>
  </Link>
);
