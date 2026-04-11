import { createApp, runScheduledWork } from './app';
import type { Env } from './types';

const app = createApp();
const BLOG_EDITOR_PATH = '/editor';
const BLOG_API_PATH = '/api/blog';
const BURGER_HOST = 'burger.cuiabar.com';
const BURGER_SITE_PATH = '/burger-site/';
const BURGER_CANONICAL_URL = `https://${BURGER_HOST}/`;
const BURGER_REDIRECT_PATHS = new Set(['/burger', '/burguer', '/burguer-cuiabar', '/burger-site', '/burger-site/']);

const isEditorRequest = (url: URL) => url.hostname === 'blog.cuiabar.com' && (url.pathname === BLOG_EDITOR_PATH || url.pathname.startsWith(`${BLOG_EDITOR_PATH}/`));
const isBlogApiRequest = (url: URL) => url.hostname === 'blog.cuiabar.com' && (url.pathname === BLOG_API_PATH || url.pathname.startsWith(`${BLOG_API_PATH}/`));
const isEditorApiRequest = (url: URL) => url.hostname === 'blog.cuiabar.com' && (url.pathname === `${BLOG_EDITOR_PATH}${BLOG_API_PATH}` || url.pathname.startsWith(`${BLOG_EDITOR_PATH}${BLOG_API_PATH}/`));
const hasFileExtension = (pathname: string) => /\.[a-z0-9]+$/i.test(pathname);
const isBurgerAssetRequest = (pathname: string) =>
  hasFileExtension(pathname) ||
  pathname.startsWith('/assets/') ||
  pathname.startsWith('/fonts/') ||
  pathname.startsWith('/burguer/');

const stripEditorPrefix = (pathname: string) => {
  const nextPath = pathname.slice(BLOG_EDITOR_PATH.length);
  return nextPath.length > 0 ? nextPath : '/';
};

const rewriteEditorLocation = (location: string, publicOrigin: string, upstreamOrigin: string) => {
  if (!location) {
    return location;
  }

  if (location.startsWith('./')) {
    return `${publicOrigin}${BLOG_EDITOR_PATH}/${location.slice(2)}`;
  }

  if (!location.startsWith('http://') && !location.startsWith('https://') && !location.startsWith('/')) {
    return `${publicOrigin}${BLOG_EDITOR_PATH}/${location}`;
  }

  if (location.startsWith('/')) {
    return `${publicOrigin}${BLOG_EDITOR_PATH}${location}`;
  }

  if (location.startsWith(upstreamOrigin)) {
    return `${publicOrigin}${BLOG_EDITOR_PATH}${location.slice(upstreamOrigin.length)}`;
  }

  return location;
};

const proxyEditorRequest = async (request: Request, env: Env) => {
  const upstreamBase = (env.BLOG_EDITOR_UPSTREAM_URL ?? '').trim().replace(/\/$/, '');

  if (!upstreamBase) {
    return new Response('BLOG_EDITOR_UPSTREAM_URL nao configurado.', { status: 503 });
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(upstreamBase);
  upstreamUrl.pathname = stripEditorPrefix(incomingUrl.pathname);
  upstreamUrl.search = incomingUrl.search;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.set('x-forwarded-host', incomingUrl.host);
  headers.set('x-forwarded-proto', incomingUrl.protocol.replace(':', ''));
  headers.set('x-forwarded-prefix', BLOG_EDITOR_PATH);
  headers.set('x-forwarded-uri', incomingUrl.pathname + incomingUrl.search);

  const proxiedRequest = new Request(upstreamUrl.toString(), {
    method: request.method,
    headers,
    body: request.body,
    redirect: 'manual',
  });

  const response = await fetch(proxiedRequest);
  const responseHeaders = new Headers(response.headers);
  const location = responseHeaders.get('location');

  if (location) {
    responseHeaders.set('location', rewriteEditorLocation(location, incomingUrl.origin, upstreamUrl.origin));
  }

  responseHeaders.set('x-robots-tag', 'noindex, nofollow');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
};

const rewriteEditorApiRequest = (request: Request) => {
  const url = new URL(request.url);
  url.pathname = url.pathname.replace(`${BLOG_EDITOR_PATH}${BLOG_API_PATH}`, BLOG_API_PATH);

  return new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: request.redirect,
  });
};

const buildBurgerSitemap = () =>
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BURGER_CANONICAL_URL}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

const rewriteBurgerAssetRequest = (request: Request) => {
  const assetUrl = new URL(request.url);

  if (assetUrl.pathname === '/' || assetUrl.pathname === '/index.html') {
    assetUrl.pathname = `${BURGER_SITE_PATH}index.html`;
  }

  return new Request(assetUrl.toString(), request);
};

const handleBurgerHostRequest = (request: Request, env: Env, ctx: ExecutionContext) => {
  const url = new URL(request.url);
  const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';

  if (url.pathname.startsWith('/api/')) {
    return app.fetch(request, env, ctx);
  }

  if (url.pathname === '/robots.txt') {
    return new Response(`User-agent: *\nAllow: /\nSitemap: ${BURGER_CANONICAL_URL}sitemap.xml\n`, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=1800',
      },
    });
  }

  if (url.pathname === '/sitemap.xml') {
    return new Response(buildBurgerSitemap(), {
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=1800',
      },
    });
  }

  if (BURGER_REDIRECT_PATHS.has(normalizedPath)) {
    return Response.redirect(BURGER_CANONICAL_URL, 301);
  }

  if (isBurgerAssetRequest(url.pathname)) {
    return env.ASSETS.fetch(rewriteBurgerAssetRequest(request));
  }

  return env.ASSETS.fetch(rewriteBurgerAssetRequest(request));
};

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (url.hostname === BURGER_HOST) {
      return handleBurgerHostRequest(request, env, ctx);
    }

    if (isEditorRequest(url)) {
      if ((env.BLOG_EDITOR_MODE ?? '').trim().toLowerCase() === 'proxy' && (env.BLOG_EDITOR_UPSTREAM_URL ?? '').trim()) {
        return proxyEditorRequest(request, env);
      }
      if (isEditorApiRequest(url)) {
        return app.fetch(rewriteEditorApiRequest(request), env, ctx);
      }
      return app.fetch(request, env, ctx);
    }

    if (isBlogApiRequest(url)) {
      return app.fetch(request, env, ctx);
    }

    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/c/') ||
      pathname.startsWith('/o/') ||
      pathname.startsWith('/unsubscribe/') ||
      pathname.startsWith('/oauth/') ||
      pathname.startsWith('/go/') ||
      pathname === '/ifood' ||
      pathname === '/99food'
    ) {
      return app.fetch(request, env, ctx);
    }

    return env.ASSETS.fetch(request);
  },
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runScheduledWork(env));
  },
};
