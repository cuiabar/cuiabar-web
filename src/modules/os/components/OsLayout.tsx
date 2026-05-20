import type { ReactNode } from 'react';
import { ProtectedLayout } from './ProtectedLayout';
import { OsSidebar } from './OsSidebar';

type OsLayoutProps = {
  children: ReactNode;
};

export const OsLayout = ({ children }: OsLayoutProps) => (
  <ProtectedLayout>
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="lg:flex">
        <OsSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  </ProtectedLayout>
);
