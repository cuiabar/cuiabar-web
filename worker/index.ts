import { createApp, runScheduledWork } from './app';
import type { Env } from './types';

const app = createApp();
const BLOG_EDITOR_PATH = '/editor';
const MEUCUIABAR_LEGACY_PATH = '/meucuiabar';
const MEUCUIABAR_HOST = 'meu.cuiabar.com';
const BURGER_ARCHIVED_HOST = 'burger.cuiabar.com';
const BURGER_N_SMOKE_HOST = 'burgersnsmoke.com';
const BURGER_N_SMOKE_ROOT = `https://${BURGER_N_SMOKE_HOST}/`;
const BURGER_N_SMOKE_PREVIEW_PATH = '/burger-n-smoke';
const BURGER_N_SMOKE_LASTMOD = '2026-05-05';
const BURGER_N_SMOKE_HOME_TITLE = "Burgers N' Smoke | Hamburgueria delivery em Campinas";
const BURGER_N_SMOKE_HOME_DESCRIPTION =
  "Burgers N' Smoke é hamburgueria delivery em Campinas. Sete burgers, Trezentinhas, combos e Pão de Mel da Casa, de quarta a sábado, das 18h às 23h.";
const MAIN_SITE_ORIGIN = 'https://cuiabar.com';

type SatellitePage = {
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  priority: string;
};

const BURGER_N_SMOKE_SATELLITE_PAGES: Record<string, SatellitePage> = {
  '/hamburgueria-campinas': {
    title: "Hamburgueria delivery em Campinas | Burgers N' Smoke",
    description:
      "Burgers N' Smoke é hamburgueria delivery em Campinas para pedido noturno no Jardim Aurélia, com burgers da casa, Trezentinhas, combos e sobremesa artesanal.",
    eyebrow: 'Hamburgueria delivery',
    h1: 'Hamburgueria delivery em Campinas, direto do Jardim Aurélia.',
    intro:
      'Sete burgers, três Trezentinhas de 300g, combos completos e Pão de Mel da Casa para pedir de quarta a sábado, das 18h às 23h.',
    priority: '0.62',
  },
  '/smash-burger-campinas': {
    title: "Burger artesanal em Campinas | Burgers N' Smoke",
    description:
      "Peça burger artesanal em Campinas no Burgers N' Smoke: picanha, costela, frango crocante, queijo derretido e delivery noturno pelos canais oficiais.",
    eyebrow: 'Burger artesanal',
    h1: 'Burger artesanal em Campinas, feito para resolver a fome da noite.',
    intro:
      'Picanha, costela, frango crocante, queijo derretido e molhos da casa em uma operação exclusiva por delivery para Campinas.',
    priority: '0.58',
  },
  '/delivery-burger-campinas': {
    title: "Delivery de burger em Campinas | Burgers N' Smoke",
    description:
      "Delivery de burger em Campinas de quarta a sábado, das 18h às 23h. Peça Burgers N' Smoke pelo iFood, 99Food ou WhatsApp oficial.",
    eyebrow: 'Delivery noturno',
    h1: 'Delivery de burger em Campinas, quarta a sábado à noite.',
    intro:
      'Escolha o burger, feche pelo iFood, 99Food ou WhatsApp e receba em casa. Atendimento exclusivo por delivery, sem retirada no local.',
    priority: '0.64',
  },
  '/burger-defumado-campinas': {
    title: "Burger de costela em Campinas | Burgers N' Smoke",
    description:
      "Burger de costela em Campinas com o Costela na Brasa, Duplo Costela, bacon crocante, queijo cremoso e delivery noturno no Burgers N' Smoke.",
    eyebrow: 'Costela na brasa',
    h1: 'Burger de costela em Campinas com entrega noturna.',
    intro:
      'O Costela na Brasa e o Duplo Costela puxam a linha mais intensa da casa, com bacon crocante, queijo cremoso e molho especial.',
    priority: '0.56',
  },
};

const BURGER_N_SMOKE_CANONICAL_PATHS = ['/', ...Object.keys(BURGER_N_SMOKE_SATELLITE_PAGES)];
const BURGER_N_SMOKE_ROBOTS = `User-agent: *\nAllow: /\n\nSitemap: ${BURGER_N_SMOKE_ROOT}sitemap.xml\n`;
const buildBurgerNSmokeCanonicalUrl = (pathname: string) => (pathname === '/' ? BURGER_N_SMOKE_ROOT : `${BURGER_N_SMOKE_ROOT}${pathname.replace(/^\//, '').replace(/\/+$/, '')}/`);
const BURGER_N_SMOKE_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${BURGER_N_SMOKE_CANONICAL_PATHS.map((pathname) => {
  const page = pathname === '/' ? null : BURGER_N_SMOKE_SATELLITE_PAGES[pathname];
  return `  <url>\n    <loc>${buildBurgerNSmokeCanonicalUrl(pathname)}</loc>\n    <lastmod>${BURGER_N_SMOKE_LASTMOD}</lastmod>\n    <changefreq>${pathname === '/' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${pathname === '/' ? '1.0' : page?.priority ?? '0.45'}</priority>\n  </url>`;
}).join('\n')}\n</urlset>\n`;

const BURGER_N_SMOKE_OPENING_HOURS = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '18:00',
    closes: '23:00',
  },
];

const BURGER_N_SMOKE_MENU_ITEMS = [
  'O Classico',
  'O Tradicional',
  'O Bruto',
  'O Costela na Brasa',
  'O Crocante',
  'O Insano',
  'O Duplo Costela',
  'Trezentinha Classica',
  'Trezentinha Costela',
  'Trezentinha Crocante',
  'Pao de Mel da Casa',
];

const buildBurgerNSmokeSchema = (pathname: string) => {
  const page = pathname === '/' ? null : BURGER_N_SMOKE_SATELLITE_PAGES[pathname];
  const url = buildBurgerNSmokeCanonicalUrl(pathname);
  const title = page?.title ?? BURGER_N_SMOKE_HOME_TITLE;
  const description = page?.description ?? BURGER_N_SMOKE_HOME_DESCRIPTION;

  const graph: unknown[] = [
    {
      '@type': 'WebSite',
      '@id': `${BURGER_N_SMOKE_ROOT}#website`,
      name: "Burgers N' Smoke",
      url: BURGER_N_SMOKE_ROOT,
      inLanguage: 'pt-BR',
      publisher: {
        '@id': `${BURGER_N_SMOKE_ROOT}#restaurant`,
      },
    },
    {
      '@type': 'Restaurant',
      '@id': `${BURGER_N_SMOKE_ROOT}#restaurant`,
      name: "Burgers N' Smoke",
      legalName: 'Smoke Union',
      url: BURGER_N_SMOKE_ROOT,
      telephone: '+551933058878',
      priceRange: 'R$',
      servesCuisine: ['Hamburguer', 'Burger artesanal', 'Delivery'],
      areaServed: [
        {
          '@type': 'City',
          name: 'Campinas',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Campinas',
            addressRegion: 'SP',
            addressCountry: 'BR',
          },
        },
        {
          '@type': 'Place',
          name: 'Jardim Aurelia, Campinas/SP',
        },
      ],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Campinas',
        addressRegion: 'SP',
        addressCountry: 'BR',
      },
      openingHoursSpecification: BURGER_N_SMOKE_OPENING_HOURS,
      hasMenu: {
        '@type': 'Menu',
        name: "Cardapio Burgers N' Smoke",
        hasMenuSection: [
          {
            '@type': 'MenuSection',
            name: 'Burgers',
            hasMenuItem: BURGER_N_SMOKE_MENU_ITEMS.slice(0, 7).map((name) => ({
              '@type': 'MenuItem',
              name,
            })),
          },
          {
            '@type': 'MenuSection',
            name: 'Trezentinhas, sobremesa e adicionais',
            hasMenuItem: BURGER_N_SMOKE_MENU_ITEMS.slice(7).map((name) => ({
              '@type': 'MenuItem',
              name,
            })),
          },
        ],
      },
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Atendimento',
          value: 'Exclusivo por delivery, sem retirada no local',
        },
      ],
      parentOrganization: {
        '@type': 'Organization',
        name: 'Smoke Union',
      },
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: {
        '@id': `${BURGER_N_SMOKE_ROOT}#website`,
      },
      about: {
        '@id': `${BURGER_N_SMOKE_ROOT}#restaurant`,
      },
      inLanguage: 'pt-BR',
      dateModified: BURGER_N_SMOKE_LASTMOD,
    },
    {
      '@type': 'FAQPage',
      '@id': `${BURGER_N_SMOKE_ROOT}#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Onde eu peço?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "O pedido pode ser feito pelos canais oficiais do Burgers N' Smoke: iFood, 99Food e WhatsApp.",
          },
        },
        {
          '@type': 'Question',
          name: 'Tem atendimento no local?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Nao. O atendimento e exclusivo por delivery, sem retirada no local.',
          },
        },
        {
          '@type': 'Question',
          name: 'Qual o horario?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Quarta a sabado, das 18h as 23h.',
          },
        },
        {
          '@type': 'Question',
          name: 'Onde fica a operacao?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A operacao fica no Jardim Aurelia, em Campinas/SP, com atendimento exclusivo por delivery.',
          },
        },
      ],
    },
  ];

  if (pathname !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: "Burgers N' Smoke",
          item: BURGER_N_SMOKE_ROOT,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: page?.eyebrow ?? title,
          item: url,
        },
      ],
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
};

const isEditorRequest = (url: URL) => url.hostname === 'blog.cuiabar.com' && (url.pathname === BLOG_EDITOR_PATH || url.pathname.startsWith(`${BLOG_EDITOR_PATH}/`));
const isInternalPortalHost = (hostname: string) => hostname === 'crm.cuiabar.com' || hostname === MEUCUIABAR_HOST;
const normalizePathname = (pathname: string) => (pathname === '/' ? '/' : pathname.replace(/\/+$/, '') || '/');

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

const redirectLegacyMeuCuiabarRoute = (url: URL) => {
  const suffix = url.pathname.slice(MEUCUIABAR_LEGACY_PATH.length);
  const nextPath = suffix.length > 0 ? suffix : '/';
  const destination = new URL(`https://${MEUCUIABAR_HOST}${nextPath}`);
  destination.search = url.search;
  return Response.redirect(destination.toString(), 308);
};

const buildBurgerNSmokeRedirect = (url: URL) => {
  const normalizedPath = normalizePathname(url.pathname);

  if (normalizedPath === '/burger' || normalizedPath === '/burguer' || normalizedPath === '/burguer-cuiabar') {
    return BURGER_N_SMOKE_ROOT;
  }

  if (normalizedPath === BURGER_N_SMOKE_PREVIEW_PATH) {
    return BURGER_N_SMOKE_ROOT;
  }

  if (!BURGER_N_SMOKE_CANONICAL_PATHS.includes(normalizedPath)) {
    return null;
  }

  const destination = new URL(buildBurgerNSmokeCanonicalUrl(normalizedPath));
  destination.search = url.search;
  return destination.toString();
};

const buildPublicSiteRedirect = (url: URL) => {
  const normalizedPath = normalizePathname(url.pathname);
  const burgerRedirect = buildBurgerNSmokeRedirect(url);

  if (burgerRedirect) {
    return burgerRedirect;
  }

  if (normalizedPath === '/blog' || normalizedPath.startsWith('/blog/')) {
    return 'https://cuiabar.com/presencial/';
  }

  if (normalizedPath === '/agenda' || normalizedPath.startsWith('/agenda/') || normalizedPath === '/bar-jardim-aurelia-musica-ao-vivo') {
    return 'https://cuiabar.com/presencial/#agenda-casa';
  }

  if (normalizedPath === '/prorefeicao') {
    return 'https://prorefeicao.cuiabar.com/';
  }

  const mirroredPublicPaths = new Set([
    '/',
    '/menu',
    '/reservas',
    '/vagas',
    '/links',
    '/presencial',
    '/expresso',
    '/espetaria',
    '/delivery',
    '/marmita',
    '/online-ordering',
    '/pedidos-online',
    '/services-5',
    '/bio',
    '/acessos',
    '/canal',
    '/asianrestaurant',
    '/restaurante-jardim-aurelia-campinas',
    '/restaurante-perto-do-enxuto-dunlop',
  ]);

  if (!mirroredPublicPaths.has(normalizedPath)) {
    return null;
  }

  const destination = new URL(MAIN_SITE_ORIGIN);
  destination.pathname = normalizedPath === '/' ? '/' : `${normalizedPath}/`;
  destination.search = url.search;
  return destination.toString();
};

const withInternalPortalHeaders = async (request: Request, env: Env) => {
  const assetResponse = await env.ASSETS.fetch(request);
  const headers = new Headers(assetResponse.headers);
  headers.set('x-robots-tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
  headers.set('cache-control', 'no-store, max-age=0, private');

  return new Response(assetResponse.body, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers,
  });
};

const setContent = (content: string) => ({
  element(element: Element) {
    element.setInnerContent(content);
  },
});

const setAttribute = (name: string, value: string) => ({
  element(element: Element) {
    element.setAttribute(name, value);
  },
});

const replaceJsonLd = (schema: unknown) => {
  let updated = false;
  const json = JSON.stringify(schema).replace(/</g, '\\u003c');

  return {
    element(element: Element) {
      if (updated) {
        element.remove();
        return;
      }

      element.setInnerContent(json);
      updated = true;
    },
  };
};

const setFirstContent = (content: string) => {
  let updated = false;

  return {
    element(element: Element) {
      if (updated) {
        return;
      }

      element.setInnerContent(content);
      updated = true;
    },
  };
};

const rewriteBurgerNSmokeSatellite = (response: Response, pathname: string) => {
  const page = BURGER_N_SMOKE_SATELLITE_PAGES[pathname];

  if (!page) {
    return response;
  }

  const canonicalUrl = buildBurgerNSmokeCanonicalUrl(pathname);

  return new HTMLRewriter()
    .on('title', setContent(page.title))
    .on('script[type="application/ld+json"]', replaceJsonLd(buildBurgerNSmokeSchema(pathname)))
    .on('meta[name="description"]', setAttribute('content', page.description))
    .on('meta[property="og:title"]', setAttribute('content', page.title))
    .on('meta[property="og:description"]', setAttribute('content', page.description))
    .on('meta[property="og:url"]', setAttribute('content', canonicalUrl))
    .on('meta[name="twitter:title"]', setAttribute('content', page.title))
    .on('meta[name="twitter:description"]', setAttribute('content', page.description))
    .on('meta[name="twitter:url"]', setAttribute('content', canonicalUrl))
    .on('link[rel="canonical"]', setAttribute('href', canonicalUrl))
    .on('.smoke-eyebrow', setFirstContent(page.eyebrow))
    .on('h1.smoke-section-title', setFirstContent(page.h1))
    .on('.smoke-section-copy p', setFirstContent(page.intro))
    .transform(response);
};

const serveBurgerNSmokeHost = async (request: Request, env: Env) => {
  const url = new URL(request.url);
  const normalizedPath = normalizePathname(url.pathname);

  if (url.hostname === `www.${BURGER_N_SMOKE_HOST}`) {
    url.hostname = BURGER_N_SMOKE_HOST;
    url.pathname = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '') || '/';
    return Response.redirect(url.toString(), 301);
  }

  if (url.hostname === BURGER_ARCHIVED_HOST || url.hostname === `www.${BURGER_ARCHIVED_HOST}`) {
    return Response.redirect(BURGER_N_SMOKE_ROOT, 301);
  }

  if (url.pathname === '/robots.txt') {
    return new Response(BURGER_N_SMOKE_ROBOTS, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    });
  }

  if (url.pathname === '/sitemap.xml') {
    return new Response(BURGER_N_SMOKE_SITEMAP, {
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    });
  }

  if (url.pathname === BURGER_N_SMOKE_PREVIEW_PATH) {
    return Response.redirect(BURGER_N_SMOKE_ROOT, 301);
  }

  const canonicalRedirect = buildBurgerNSmokeRedirect(url);

  if (canonicalRedirect && canonicalRedirect !== url.toString()) {
    return Response.redirect(canonicalRedirect, 301);
  }

  if (normalizedPath !== '/') {
    const assetUrl = new URL(request.url);
    assetUrl.pathname = `${BURGER_N_SMOKE_PREVIEW_PATH}/`;
    const assetRequest = new Request(assetUrl.toString(), request);
    const assetResponse = await env.ASSETS.fetch(assetRequest);
    return rewriteBurgerNSmokeSatellite(assetResponse, normalizedPath);
  }

  const assetUrl = new URL(request.url);
  assetUrl.pathname = `${BURGER_N_SMOKE_PREVIEW_PATH}/`;
  const assetRequest = new Request(assetUrl.toString(), request);
  const assetResponse = await env.ASSETS.fetch(assetRequest);

  return new HTMLRewriter()
    .on('title', setContent(BURGER_N_SMOKE_HOME_TITLE))
    .on('script[type="application/ld+json"]', replaceJsonLd(buildBurgerNSmokeSchema('/')))
    .on('meta[name="description"]', setAttribute('content', BURGER_N_SMOKE_HOME_DESCRIPTION))
    .on('meta[property="og:title"]', setAttribute('content', BURGER_N_SMOKE_HOME_TITLE))
    .on('meta[property="og:description"]', setAttribute('content', BURGER_N_SMOKE_HOME_DESCRIPTION))
    .on('link[rel="canonical"]', setAttribute('href', BURGER_N_SMOKE_ROOT))
    .on('meta[property="og:url"]', setAttribute('content', BURGER_N_SMOKE_ROOT))
    .on('meta[name="twitter:title"]', setAttribute('content', BURGER_N_SMOKE_HOME_TITLE))
    .on('meta[name="twitter:description"]', setAttribute('content', BURGER_N_SMOKE_HOME_DESCRIPTION))
    .on('meta[name="twitter:url"]', setAttribute('content', BURGER_N_SMOKE_ROOT))
    .on('meta[property="og:site_name"]', setAttribute('content', "Burgers N' Smoke"))
    .on('meta[name="twitter:site"]', setAttribute('content', '@burgernsmoke'))
    .transform(assetResponse);
};

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (isEditorRequest(url)) {
      return proxyEditorRequest(request, env);
    }

    if (url.hostname === 'crm.cuiabar.com' && (pathname === MEUCUIABAR_LEGACY_PATH || pathname.startsWith(`${MEUCUIABAR_LEGACY_PATH}/`))) {
      return redirectLegacyMeuCuiabarRoute(url);
    }

    if (url.hostname === 'crm.cuiabar.com') {
      const publicSiteRedirect = buildPublicSiteRedirect(url);

      if (publicSiteRedirect) {
        return Response.redirect(publicSiteRedirect, 301);
      }
    }

    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/c/') ||
      pathname.startsWith('/unsubscribe/') ||
      pathname.startsWith('/oauth/') ||
      pathname.startsWith('/go/') ||
      pathname === '/ifood' ||
      pathname === '/99food'
    ) {
      return app.fetch(request, env, ctx);
    }

    if (url.hostname === BURGER_ARCHIVED_HOST || url.hostname === `www.${BURGER_ARCHIVED_HOST}` || url.hostname === BURGER_N_SMOKE_HOST || url.hostname === `www.${BURGER_N_SMOKE_HOST}`) {
      return serveBurgerNSmokeHost(request, env);
    }

    if (isInternalPortalHost(url.hostname)) {
      return withInternalPortalHeaders(request, env);
    }

    return env.ASSETS.fetch(request);
  },
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runScheduledWork(env));
  },
};
