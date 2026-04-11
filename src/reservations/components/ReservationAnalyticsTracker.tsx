import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent, trackPageView, trackViewContent } from '../../lib/analytics';
import { RESERVATION_ANALYTICS_CONTENT_NAME } from '../constants';

const getReservationStage = (pathname: string) => (pathname.startsWith('/sucesso/') ? 'success' : 'form');

export const ReservationAnalyticsTracker = () => {
  const location = useLocation();
  const reservationStage = getReservationStage(location.pathname);

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    const frame = window.requestAnimationFrame(() => {
      trackPageView(pagePath, document.title);
      trackEvent('reservation_page_view', {
        content_name: RESERVATION_ANALYTICS_CONTENT_NAME,
        content_category: 'reservation',
        reservation_stage: reservationStage,
      });
      trackViewContent(RESERVATION_ANALYTICS_CONTENT_NAME, {
        content_category: 'reservation',
        reservation_stage: reservationStage,
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [location.hash, location.pathname, location.search, reservationStage]);

  return null;
};
