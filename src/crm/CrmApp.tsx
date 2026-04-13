import { useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { crmRequest } from './api';
import { Button } from './components';
import { CrmContext } from './context';
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

const ensureCrmFont = () => {
  if (document.querySelector('link[data-crm-font="inter"]')) {
    return;
  }

  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://fonts.googleapis.com';
  preconnect.dataset.crmFont = 'inter';

  const preconnectCross = document.createElement('link');
  preconnectCross.rel = 'preconnect';
  preconnectCross.href = 'https://fonts.gstatic.com';
  preconnectCross.crossOrigin = 'anonymous';
  preconnectCross.dataset.crmFont = 'inter';

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  stylesheet.dataset.crmFont = 'inter';

  document.head.append(preconnect, preconnectCross, stylesheet);
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
    { icon: '🏠', label: 'Dashboard', to: withBase(basePath) },
    { icon: '👥', label: 'Contatos', to: withBase(basePath, 'contacts') },
    { icon: '📅', label: 'Reservas', to: withBase(basePath, 'reservations') },
    { icon: '🗂️', label: 'Listas', to: withBase(basePath, 'lists') },
    { icon: '🧩', label: 'Segmentos', to: withBase(basePath, 'segments') },
    { icon: '📝', label: 'Templates', to: withBase(basePath, 'templates') },
    { icon: '📣', label: 'Campanhas', to: withBase(basePath, 'campaigns') },
    { icon: '📊', label: 'Relatórios', to: withBase(basePath, 'reports') },
    { icon: '📬', label: 'Entregabilidade', to: withBase(basePath, 'deliverability') },
    ...(isManager
      ? [
          { icon: '🛡️', label: 'Usuários', to: withBase(basePath, 'users') },
          { icon: '🧾', label: 'Auditoria', to: withBase(basePath, 'audit') },
          { icon: '⚙️', label: 'Configurações', to: withBase(basePath, 'settings') },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#0b1220_45%,#0f172a_100%)] text-white [font-family:Inter,system-ui,-apple-system,Segoe_UI,Roboto,Helvetica,Arial,sans-serif]">
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-sky-600 focus:px-3 focus:py-2 focus:text-white" href="#crm-main-content">
        Pular para conteúdo
      </a>
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 xl:grid-cols-[260px,1fr]">
        <aside className="border-b border-white/10 bg-slate-950/72 p-5 xl:sticky xl:top-0 xl:h-screen xl:border-b-0 xl:border-r">
          <button className="text-left" onClick={() => navigate(withBase(basePath))}>
            <p className="text-xs uppercase tracking-[0.24em] text-sky-300">crm.cuiabar.com</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Cuiabar CRM</h1>
          </button>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">{session.user?.displayName}</p>
            <p className="mt-1 break-all text-xs text-slate-300">{session.user?.email}</p>
            <p className="mt-3 text-xs text-slate-400">Uso interno. Envie apenas para contatos com consentimento.</p>
          </div>

          <nav className="mt-5 grid grid-cols-2 gap-2 xl:grid-cols-1" aria-label="Navegação CRM">
            {items.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive ? 'bg-sky-500 text-white shadow-sm' : 'bg-white/5 text-slate-200 hover:bg-white/10'
                  }`
                }
                to={item.to}
              >
                <span aria-hidden="true" className="text-base leading-none">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 flex gap-2 xl:flex-col">
            <a href="https://cuiabar.com" target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/15 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10">
              Site público ↗
            </a>
            <Button
              className="flex-1"
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

        <main id="crm-main-content" className="p-4 md:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export const CrmApp = ({ basePath = '' }: { basePath?: string }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [bootstrap, setBootstrap] = useState<BootstrapStatus | null>(null);
  const [session, setSession] = useState<SessionPayload | null>(null);

  useEffect(() => {
    ensureCrmFont();
  }, []);

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
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-sm text-slate-300 [font-family:Inter,system-ui,-apple-system,Segoe_UI,Roboto,Helvetica,Arial,sans-serif]">
        Carregando CRM...
      </div>
    );
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
