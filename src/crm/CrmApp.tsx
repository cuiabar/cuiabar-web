import { useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { crmRequest } from './api';
import { CrmContext } from './context';
import { Button } from './components';
import { AuditPage } from './pages/AuditPage';
import { BootstrapPage } from './pages/BootstrapPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { ContactsPage } from './pages/ContactsPage';
import { DashboardPage } from './pages/DashboardPage';
import { DeliverabilityPage } from './pages/DeliverabilityPage';
import { ListsPage } from './pages/ListsPage';
import { LoginPage } from './pages/LoginPage';
import { ReportsPage } from './pages/ReportsPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { SegmentsPage } from './pages/SegmentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { UsersPage } from './pages/UsersPage';
import type { BootstrapStatus, SessionPayload } from './types';

const hasRole = (roles: string[], role: string) => roles.includes(role);

const withBase = (basePath: string, path = '') => {
  const normalizedBase = basePath === '/' ? '' : basePath.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return path ? `${normalizedBase}${normalizedPath}` || '/' : normalizedBase || '/';
};

const CrmShell = ({
  basePath,
  session,
  onLogout,
  children,
}: {
  basePath: string;
  session: SessionPayload;
  onLogout: () => Promise<void>;
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();
  const isManager = hasRole(session.user?.roles ?? [], 'gerente');
  const items = [
    { label: 'Dashboard', to: withBase(basePath) },
    { label: 'Contatos', to: withBase(basePath, 'contacts') },
    { label: 'Reservas', to: withBase(basePath, 'reservations') },
    { label: 'Listas', to: withBase(basePath, 'lists') },
    { label: 'Segmentos', to: withBase(basePath, 'segments') },
    { label: 'Templates', to: withBase(basePath, 'templates') },
    { label: 'Campanhas', to: withBase(basePath, 'campaigns') },
    { label: 'Relatorios', to: withBase(basePath, 'reports') },
    { label: 'Entregabilidade', to: withBase(basePath, 'deliverability') },
    ...(isManager ? [{ label: 'Usuarios', to: withBase(basePath, 'users') }, { label: 'Auditoria', to: withBase(basePath, 'audit') }, { label: 'Configuracoes', to: withBase(basePath, 'settings') }] : []),
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_20%),linear-gradient(135deg,#020617,#0f172a_55%,#111827)] text-white">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 xl:grid-cols-[280px,1fr]">
        <aside className="border-b border-white/10 bg-slate-950/75 p-5 xl:border-b-0 xl:border-r">
          <button className="text-left" onClick={() => navigate(withBase(basePath))}>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">crm.cuiabar.com</p>
            <h1 className="mt-3 text-2xl font-semibold">Cuiabar CRM</h1>
          </button>
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">{session.user?.displayName}</p>
            <p className="mt-1 text-xs text-slate-400">{session.user?.email}</p>
            <p className="mt-3 text-xs text-slate-500">Uso interno. Enviar apenas para contatos com consentimento.</p>
          </div>
          <nav className="mt-6 space-y-2">
            {items.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm transition ${isActive ? 'bg-amber-300 text-slate-950' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-8">
            <Button
              className="w-full"
              variant="ghost"
              onClick={async () => {
                await onLogout();
                navigate(withBase(basePath, 'login'));
              }}
            >
              Sair
            </Button>
          </div>
        </aside>

        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export const CrmApp = ({ basePath = '' }: { basePath?: string }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [bootstrap, setBootstrap] = useState<BootstrapStatus | null>(null);
  const [session, setSession] = useState<SessionPayload | null>(null);

  const refreshSession = async () => {
    const [bootstrapResponse, sessionResponse] = await Promise.all([
      crmRequest<BootstrapStatus>('/api/bootstrap/status'),
      crmRequest<SessionPayload>('/api/auth/session'),
    ]);
    setBootstrap(bootstrapResponse);
    setSession(sessionResponse);
  };

  useEffect(() => {
    setLoading(true);
    refreshSession()
      .catch(() => {
        setBootstrap({ ok: true, requiresBootstrap: false, tokenConfigured: false });
        setSession({ ok: true, authenticated: false, user: null, csrfToken: null });
      })
      .finally(() => setLoading(false));
  }, [location.pathname]);

  const contextValue = useMemo(
    () => ({
      session,
      bootstrap,
      csrfToken: session?.csrfToken ?? null,
      user: session?.user ?? null,
      refreshSession,
    }),
    [bootstrap, session],
  );

  const requireSetup = bootstrap?.requiresBootstrap;
  const isAuthenticated = session?.authenticated;
  const loginPath = withBase(basePath, 'login');
  const setupPath = withBase(basePath, 'setup');

  if (loading || !bootstrap || !session) {
    return <div className="grid min-h-screen place-items-center bg-slate-950 text-sm text-slate-300">Carregando CRM...</div>;
  }

  const protectedElement = (page: React.ReactNode, managerOnly = false) => {
    if (requireSetup) {
      return <Navigate to={setupPath} replace />;
    }
    if (!isAuthenticated) {
      return <Navigate to={loginPath} replace />;
    }
    if (managerOnly && !hasRole(session.user?.roles ?? [], 'gerente')) {
      return <Navigate to={withBase(basePath)} replace />;
    }

    return (
      <CrmShell
        basePath={basePath}
        session={session}
        onLogout={async () => {
          await crmRequest('/api/auth/logout', { method: 'POST' }, session.csrfToken);
          await refreshSession();
        }}
      >
        {page}
      </CrmShell>
    );
  };

  return (
    <CrmContext.Provider value={contextValue}>
      <Routes>
        <Route path={setupPath} element={requireSetup ? <BootstrapPage onCompleted={refreshSession} /> : <Navigate to={withBase(basePath)} replace />} />
        <Route path={loginPath} element={!requireSetup && !isAuthenticated ? <LoginPage onLoggedIn={refreshSession} /> : <Navigate to={withBase(basePath)} replace />} />
        <Route path={withBase(basePath)} element={protectedElement(<DashboardPage />)} />
        <Route path={withBase(basePath, 'contacts')} element={protectedElement(<ContactsPage />)} />
        <Route path={withBase(basePath, 'reservations')} element={protectedElement(<ReservationsPage />)} />
        <Route path={withBase(basePath, 'lists')} element={protectedElement(<ListsPage />)} />
        <Route path={withBase(basePath, 'segments')} element={protectedElement(<SegmentsPage />)} />
        <Route path={withBase(basePath, 'templates')} element={protectedElement(<TemplatesPage />)} />
        <Route path={withBase(basePath, 'campaigns')} element={protectedElement(<CampaignsPage />)} />
        <Route path={withBase(basePath, 'reports')} element={protectedElement(<ReportsPage />)} />
        <Route path={withBase(basePath, 'deliverability')} element={protectedElement(<DeliverabilityPage />)} />
        <Route path={withBase(basePath, 'users')} element={protectedElement(<UsersPage />, true)} />
        <Route path={withBase(basePath, 'audit')} element={protectedElement(<AuditPage />, true)} />
        <Route path={withBase(basePath, 'settings')} element={protectedElement(<SettingsPage />, true)} />
        <Route path="*" element={<Navigate to={requireSetup ? setupPath : isAuthenticated ? withBase(basePath) : loginPath} replace />} />
      </Routes>
    </CrmContext.Provider>
  );
};
