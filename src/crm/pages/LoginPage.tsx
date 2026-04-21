import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crmRequest } from '../api';

type GoogleAccountsApi = {
  accounts: {
    id: {
      initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
      renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
    };
  };
};

type AuthConfig = {
  authMode: 'google_only' | 'local_password';
  googleClientId: string | null;
  allowedEmails: string[];
};

export const LoginPage = ({ onLoggedIn }: { onLoggedIn: () => Promise<void> }) => {
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    crmRequest<{ ok: true } & AuthConfig>('/api/auth/config')
      .then((response) =>
        setConfig({ authMode: response.authMode, googleClientId: response.googleClientId, allowedEmails: response.allowedEmails }),
      )
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : 'Falha ao carregar a autenticacao.'),
      );
  }, []);

  useEffect(() => {
    const clientId = config?.googleClientId;
    if (!clientId || !buttonRef.current) {
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity="true"]');
    const boot = () => {
      const googleAccounts = window.google as unknown as GoogleAccountsApi | undefined;
      if (!googleAccounts || !buttonRef.current) {
        return;
      }
      buttonRef.current.innerHTML = '';
      const buttonWidth = Math.max(240, Math.min(buttonRef.current.clientWidth || 360, 360));
      googleAccounts.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }: { credential: string }) => {
          try {
            setError(null);
            await crmRequest('/api/auth/google/verify', { method: 'POST', body: JSON.stringify({ credential }) });
            await onLoggedIn();
            navigate('/');
          } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Falha ao autenticar com Google.');
          }
        },
      });
      googleAccounts.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        text: 'continue_with',
        shape: 'rectangular',
        size: 'large',
        width: buttonWidth,
        logo_alignment: 'left',
      });
    };

    if (existing) {
      boot();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = boot;
    document.head.appendChild(script);
  }, [config, navigate, onLoggedIn]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 [font-family:Inter,system-ui,-apple-system,Segoe_UI,Roboto,Helvetica,Arial,sans-serif]">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-[1.1fr,0.9fr]">
          <section className="border-b border-slate-200 bg-gradient-to-br from-sky-600 to-sky-700 px-8 py-10 text-white md:border-b-0 md:border-r">
            <p className="text-xs uppercase tracking-[0.22em] text-sky-100">crm.cuiabar.com</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight">Cuiabar CRM</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-sky-100">
              Painel interno para campanhas, contatos, reservas e operação de marketing com foco em eficiência e rastreabilidade.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-sky-100/95">
              <li>✅ Autenticação Google segura</li>
              <li>✅ Gestão de campanhas e entregabilidade</li>
              <li>✅ Operação diária de reservas e CRM</li>
            </ul>
          </section>

          <section className="px-8 py-10">
            <h2 className="text-xl font-semibold text-slate-900">Entrar no CRM</h2>
            <p className="mt-2 text-sm text-slate-600">Use a conta Google autorizada pela gerência para continuar.</p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="w-full max-w-[360px] min-h-[48px]" ref={buttonRef} />
            </div>

            {!config?.googleClientId ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Falta configurar <code className="font-semibold">GOOGLE_AUTH_CLIENT_ID</code>.
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <a href="https://cuiabar.com" target="_blank" rel="noreferrer" className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-slate-700 transition hover:bg-slate-100">
                Ir para o site público ↗
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
