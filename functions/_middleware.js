const LEGACY_REDIRECTS = new Map([
  ['/bio', '/links'],
  ['/acessos', '/links'],
  ['/canal', '/links'],
  ['/burger', '/burguer'],
  ['/burguer-cuiabar', '/burguer'],
  ['/marmita', '/pedidos-online'],
  ['/delivery', '/pedidos-online'],
  ['/online-ordering', '/pedidos-online'],
  ['/services-5', '/pedidos-online'],
  ['/asianrestaurant', '/'],
]);

const BURGER_HOST = 'burger.cuiabar.com';
const BURGER_SITE_PATH = '/burger-site';

const isStaticAssetPath = (pathname) => /\/[^/]+\.[a-z0-9]+$/i.test(pathname);

const normalizePathname = (pathname) => {
  if (pathname === '/') {
    return '/';
  }

  return pathname.replace(/\/+$/, '') || '/';
};

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const normalizedPathname = normalizePathname(url.pathname);

  if (url.hostname === BURGER_HOST) {
    if (normalizedPathname === '/robots.txt') {
      return new Response(`User-agent: *\nAllow: /\n\nSitemap: https://${BURGER_HOST}/sitemap.xml\n`, {
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'public, max-age=3600',
        },
      });
    }

    if (normalizedPathname === '/sitemap.xml') {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          '  <url>\n' +
          `    <loc>https://${BURGER_HOST}/</loc>\n` +
          '    <changefreq>weekly</changefreq>\n' +
          '    <priority>0.9</priority>\n' +
          '  </url>\n' +
          '</urlset>\n',
        {
          headers: {
            'content-type': 'application/xml; charset=utf-8',
            'cache-control': 'public, max-age=3600',
          },
        },
      );
    }

    if (normalizedPathname === '/' || normalizedPathname === '/index.html') {
      return context.next(BURGER_SITE_PATH);
    }

    if (['/burguer', '/burger', '/burguer-cuiabar'].includes(normalizedPathname)) {
      url.pathname = '/';
      return Response.redirect(url.toString(), 301);
    }

    if (!normalizedPathname.startsWith('/api/') && !isStaticAssetPath(normalizedPathname)) {
      url.pathname = '/';
      return Response.redirect(url.toString(), 302);
    }
  }

  if (url.hostname === 'www.cuiabar.com') {
    url.hostname = 'cuiabar.com';
    url.pathname = normalizedPathname;
    return Response.redirect(url.toString(), 301);
  }

  if (normalizedPathname === '/menu' && url.searchParams.has('menu')) {
    url.pathname = '/menu';
    url.searchParams.delete('menu');
    return Response.redirect(url.toString(), 301);
  }

  const redirectTarget = LEGACY_REDIRECTS.get(normalizedPathname);

  if (redirectTarget) {
    url.hostname = 'cuiabar.com';
    url.pathname = redirectTarget;
    return Response.redirect(url.toString(), 301);
  }

  if (normalizedPathname === BURGER_SITE_PATH && url.hostname === 'cuiabar.com') {
    url.hostname = BURGER_HOST;
    url.pathname = '/';
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
