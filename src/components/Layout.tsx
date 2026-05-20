import type { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsTracker } from './AnalyticsTracker';
import { Footer } from './Footer';
import { Header } from './Header';
import { ScrollManager } from './ScrollManager';
import { WhatsAppFloatingButton } from './WhatsAppFloatingButton';

export const Layout = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const isLinksRoute = ['/links', '/bio', '/acessos'].includes(normalizedPath);
  const isDeliveryRoute = normalizedPath === '/delivery';
  const isReservationsRoute = normalizedPath === '/reservas';
  const isOsRoute = normalizedPath === '/os' || normalizedPath.startsWith('/os/');
  const isProRefeicaoHost = hostname === 'prorefeicao.cuiabar.com';
  const isProRefeicaoSurface = isProRefeicaoHost || normalizedPath === '/prorefeicao';

  if (isLinksRoute || isDeliveryRoute || isOsRoute || isProRefeicaoSurface) {
    return (
      <>
        <AnalyticsTracker />
        <ScrollManager />
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo principal
        </a>
        <main id="main-content" tabIndex={-1}>
          <div key={location.pathname} className="page-transition">
            {children}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AnalyticsTracker />
      <ScrollManager />
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <Header hideWhatsAppActions={isReservationsRoute} />
      <main id="main-content" tabIndex={-1} className="pt-24">
        <div key={location.pathname} className="page-transition">
          {children}
        </div>
      </main>
      <Footer hideWhatsAppActions={isReservationsRoute} />
      <WhatsAppFloatingButton hide={isReservationsRoute} />
    </>
  );
};
