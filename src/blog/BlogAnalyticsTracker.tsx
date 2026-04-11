import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  decorateOutboundUrl,
  trackContact,
  trackEvent,
  trackPageView,
  trackViewContent,
} from '../lib/analytics';

const getAnchor = (target: EventTarget | null) => {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest('a');
};

const normalizePathname = (pathname: string) => pathname.replace(/\/+$/, '') || '/';

export const BlogAnalyticsTracker = () => {
  const location = useLocation();
  const normalizedPath = normalizePathname(location.pathname);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      trackPageView(`${location.pathname}${location.search}${location.hash}`, document.title);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [location.hash, location.pathname, location.search]);

  useEffect(() => {
    if (normalizedPath === '/') {
      trackViewContent('blog_cuiabar_home', { content_category: 'editorial_hub' });
      return;
    }

    trackViewContent('blog_cuiabar_article', { content_category: 'editorial_article' });
  }, [normalizedPath]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const anchor = getAnchor(event.target);

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute('href');

      if (!href || href.startsWith('#')) {
        return;
      }

      let url: URL;

      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }

      const label = anchor.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) || url.pathname;
      const params = {
        href: url.href,
        label,
        page_path: window.location.pathname,
        content_name: normalizedPath === '/' ? 'blog_home' : 'blog_article',
      };

      if (url.href.includes('whatsapp.com/channel/')) {
        trackEvent('join_whatsapp_channel', params);
        return;
      }

      const normalizedHost = url.hostname.replace(/^www\./, '');

      if (normalizedHost === 'reservas.cuiabar.com') {
        anchor.setAttribute(
          'href',
          decorateOutboundUrl(url.href, {
            content_name: 'blog_editorial',
            destination: 'reservas',
          }),
        );
        trackEvent('click_reservas_portal', params);
        return;
      }

      if (normalizedHost === 'wa.me') {
        anchor.setAttribute(
          'href',
          decorateOutboundUrl(url.href, {
            content_name: 'blog_editorial',
            destination: 'whatsapp',
          }),
        );
        trackContact('whatsapp', params);
        return;
      }

      if (normalizedHost === 'cuiabar.com') {
        if (url.pathname === '/agenda') {
          trackEvent('blog_click_agenda', params);
          return;
        }

        if (url.pathname === '/menu') {
          trackEvent('blog_click_menu', params);
          return;
        }

        if (url.pathname === '/') {
          trackEvent('blog_click_main_site', params);
          return;
        }
      }

      if (url.origin === window.location.origin) {
        trackEvent(normalizedPath === '/' ? 'open_blog_article_page' : 'open_related_blog_article', params);
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [normalizedPath]);

  return null;
};
