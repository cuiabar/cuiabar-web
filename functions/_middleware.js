const LEGACY_REDIRECTS = new Map([
  ['/bio', '/links'],
  ['/acessos', '/links'],
  ['/canal', '/links'],
  ['/marmita', '/expresso'],
  ['/online-ordering', '/delivery'],
  ['/services-5', '/delivery'],
  ['/pedidos-online', '/delivery'],
  ['/asianrestaurant', '/presencial'],
]);

const PROREFEICAO_HOST = 'prorefeicao.cuiabar.com';
const BURGER_LEGACY_HOSTS = new Set(['burger.cuiabar.com', 'www.burger.cuiabar.com']);
const BURGER_LEGACY_PATHS = new Set([
  '/burger',
  '/burguer',
  '/burguer-cuiabar',
  '/burger-n-smoke',
  '/hamburgueria-campinas',
  '/smash-burger-campinas',
  '/delivery-burger-campinas',
  '/burger-defumado-campinas',
]);
const BURGERS_N_SMOKE_ROOT = 'https://burgersnsmoke.com/';

const normalizePathname = (pathname) => {
  if (pathname === '/') {
    return '/';
  }

  return pathname.replace(/\/+$/, '') || '/';
};

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const normalizedPathname = normalizePathname(url.pathname);

  if (url.hostname === 'www.prorefeicao.cuiabar.com') {
    url.hostname = PROREFEICAO_HOST;
    url.pathname = normalizedPathname;
    return Response.redirect(url.toString(), 301);
  }

  if (url.hostname === 'www.cuiabar.com') {
    url.hostname = 'cuiabar.com';
    url.pathname = normalizedPathname;
    return Response.redirect(url.toString(), 301);
  }

  if (BURGER_LEGACY_HOSTS.has(url.hostname) || BURGER_LEGACY_PATHS.has(normalizedPathname)) {
    return Response.redirect(BURGERS_N_SMOKE_ROOT, 301);
  }

  if (normalizedPathname === '/prorefeicao' && url.hostname === 'cuiabar.com') {
    return Response.redirect(`https://${PROREFEICAO_HOST}/`, 301);
  }

  if (url.hostname === PROREFEICAO_HOST && normalizedPathname === '/prorefeicao') {
    return Response.redirect(`https://${PROREFEICAO_HOST}/`, 301);
  }

  if (url.hostname === PROREFEICAO_HOST && normalizedPathname === '/') {
    const assetUrl = new URL('/prorefeicao/', url.origin);
    const response = await context.env.ASSETS.fetch(assetUrl.toString());

    return new HTMLRewriter()
      .on('link[rel="canonical"]', {
        element(element) {
          element.setAttribute('href', `https://${PROREFEICAO_HOST}/`);
        },
      })
      .on('meta[property="og:url"]', {
        element(element) {
          element.setAttribute('content', `https://${PROREFEICAO_HOST}/`);
        },
      })
      .on('meta[name="twitter:url"]', {
        element(element) {
          element.setAttribute('content', `https://${PROREFEICAO_HOST}/`);
        },
      })
      .transform(response);
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

  return context.next();
}
