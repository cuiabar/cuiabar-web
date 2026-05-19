import { BookOpen, ClipboardCheck, Home, Lightbulb, MessageSquareText, ShoppingBag, TrendingUp } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Inicio', path: '/os', icon: Home },
  { label: 'Atendimento', path: '/os/atendimento', icon: MessageSquareText },
  { label: 'Delivery', path: '/os/delivery', icon: ShoppingBag },
  { label: 'POPs', path: '/os/pops', icon: ClipboardCheck },
  { label: 'Conversao', path: '/os/conversao', icon: TrendingUp },
  { label: 'Recomendacoes', path: '/os/recomendacoes', icon: Lightbulb },
];

export const OsSidebar = () => (
  <aside className="border-slate-200 bg-white lg:min-h-screen lg:w-72 lg:border-r">
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-4 lg:border-b-0 lg:px-5 lg:py-6">
      <NavLink to="/os" className="flex items-center gap-3 text-slate-950">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
          <BookOpen aria-hidden="true" className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-sm font-semibold leading-tight">GHCO OS</span>
          <span className="block text-xs text-slate-500">Manual Operacional</span>
        </span>
      </NavLink>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Manual operacional">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/os'}
              className={({ isActive }) =>
                [
                  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                ].join(' ')
              }
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  </aside>
);
