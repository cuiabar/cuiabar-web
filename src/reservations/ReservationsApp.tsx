import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { siteConfig } from '../data/siteConfig';
import { ReservationAnalyticsTracker } from './components/ReservationAnalyticsTracker';
import { ReservationFormPage } from './components/ReservationFormPage';
import { ReservationSuccessPage } from './components/ReservationSuccessPage';

const ReservationChrome = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(178,146,88,0.18),transparent_24%),radial-gradient(circle_at_left,rgba(172,84,39,0.14),transparent_28%),linear-gradient(180deg,#f9f3ea_0%,#f6ede0_52%,#fbf8f1_100%)] text-cocoa">
    <header className="px-4 pt-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-full border border-cocoa/10 bg-white/78 px-4 py-3 shadow-[0_22px_60px_-44px_rgba(51,35,19,0.42)] backdrop-blur sm:px-5">
        <div className="flex items-center gap-3">
          <img src={siteConfig.logoUrl} alt="Logo Cuiabar" width="44" height="44" decoding="async" className="h-11 w-11 rounded-full object-cover shadow-[0_14px_36px_-24px_rgba(51,35,19,0.72)]" />
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-terracotta/80">Subdominio oficial</p>
            <p className="text-sm font-semibold text-cocoa">reservas.cuiabar.com</p>
          </div>
        </div>
        <a href="https://www.cuiabar.com" className="text-sm font-semibold text-cocoa/80 transition hover:text-cocoa">
          Voltar ao site principal
        </a>
      </div>
    </header>
    <main>{children}</main>
    <footer className="px-4 pb-8 pt-2 text-center text-sm text-steel sm:px-6 lg:px-8">
      <p className="mx-auto max-w-3xl">Reserva publica do Cuiabar preparada para mobile, confirmacao organizada e operacao compativel com Cloudflare.</p>
    </footer>
  </div>
);

export const ReservationsApp = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <ReservationChrome>
      <ReservationAnalyticsTracker />
      <Routes>
        <Route path="/" element={<ReservationFormPage />} />
        <Route path="/sucesso/:reservationCode" element={<ReservationSuccessPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ReservationChrome>
  );
};
