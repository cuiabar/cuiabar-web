import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist-blog');
const ssrDir = path.resolve(__dirname, '../.ssr-blog');
const buildDate = new Date().toISOString().slice(0, 10);

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const upsertTag = (html, regex, replacement) =>
  regex.test(html)
    ? html.replace(regex, () => replacement)
    : html.replace('</head>', () => `  ${replacement}\n  </head>`);

const injectPrerenderedRoot = (html, prerenderedMarkup) =>
  html.replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${prerenderedMarkup}</div>`);

const loadSsrRenderer = async () => {
  const ssrFiles = await readdir(ssrDir);
  const renderEntry = ssrFiles.find((fileName) => /^render\.(m?js|cjs)$/.test(fileName));

  if (!renderEntry) {
    throw new Error(`SSR render entry not found in ${ssrDir}.`);
  }

  const renderModule = await import(pathToFileURL(path.join(ssrDir, renderEntry)).href);

  if (typeof renderModule.renderRoute !== 'function') {
    throw new Error('SSR render module does not export renderRoute(routePath).');
  }

  if (!renderModule.blogSeoRoutes) {
    throw new Error('SSR render module does not export blogSeoRoutes.');
  }

  return {
    renderRoute: renderModule.renderRoute,
    blogSeoRoutes: renderModule.blogSeoRoutes,
  };
};

const injectRouteMetadata = (html, routeSeo, prerenderedMarkup) => {
  let output = html.replace(/<title>.*?<\/title>/s, () => `<title>${escapeHtml(routeSeo.title)}</title>`);
  output = upsertTag(output, /<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${escapeHtml(routeSeo.description)}" />`);
  output = upsertTag(output, /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(routeSeo.title)}" />`);
  output = upsertTag(output, /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(routeSeo.description)}" />`);
  output = upsertTag(output, /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i, `<meta property="og:image" content="${escapeHtml(routeSeo.image)}" />`);
  output = upsertTag(output, /<meta\s+property="og:image:alt"\s+content=".*?"\s*\/?>/i, `<meta property="og:image:alt" content="${escapeHtml(routeSeo.imageAlt)}" />`);
  output = upsertTag(output, /<meta\s+property="og:image:secure_url"\s+content=".*?"\s*\/?>/i, `<meta property="og:image:secure_url" content="${escapeHtml(routeSeo.image)}" />`);
  output = upsertTag(output, /<meta\s+property="og:site_name"\s+content=".*?"\s*\/?>/i, '<meta property="og:site_name" content="Blog Cuiabar" />');
  output = upsertTag(output, /<meta\s+property="og:type"\s+content=".*?"\s*\/?>/i, `<meta property="og:type" content="${escapeHtml(routeSeo.type)}" />`);
  output = upsertTag(output, /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${escapeHtml(routeSeo.canonicalUrl)}" />`);
  output = upsertTag(output, /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(routeSeo.title)}" />`);
  output = upsertTag(output, /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(routeSeo.description)}" />`);
  output = upsertTag(output, /<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${escapeHtml(routeSeo.image)}" />`);
  output = upsertTag(output, /<meta\s+name="keywords"\s+content=".*?"\s*\/?>/i, `<meta name="keywords" content="${escapeHtml(routeSeo.keywords.join(', '))}" />`);
  output = upsertTag(output, /<meta\s+name="robots"\s+content=".*?"\s*\/?>/i, '<meta name="robots" content="index,follow,max-image-preview:large" />');
  output = upsertTag(output, /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${escapeHtml(routeSeo.canonicalUrl)}" />`);
  output = output.replace(/<script id="route-schema" type="application\/ld\+json">.*?<\/script>\s*/s, '');
  output = output.replace('</head>', () => `  <script id="route-schema" type="application/ld+json">${JSON.stringify(routeSeo.schema)}</script>\n  </head>`);
  return injectPrerenderedRoot(output, prerenderedMarkup);
};

const generateSitemap = (blogSeoRoutes) => {
  const urls = Object.values(blogSeoRoutes)
    .map(
      (routeSeo) => [
        '  <url>',
        `    <loc>${routeSeo.canonicalUrl}</loc>`,
        `    <lastmod>${buildDate}</lastmod>`,
        `    <changefreq>${routeSeo.type === 'article' ? 'monthly' : 'weekly'}</changefreq>`,
        `    <priority>${routeSeo.type === 'article' ? '0.72' : '0.92'}</priority>`,
        '  </url>',
      ].join('\n'),
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};

const main = async () => {
  const baseHtml = await readFile(path.join(distDir, 'index.html'), 'utf8');
  const { renderRoute, blogSeoRoutes } = await loadSsrRenderer();
  const siteOrigin = new URL(blogSeoRoutes['/'].canonicalUrl).origin;

  for (const [routePath, routeSeo] of Object.entries(blogSeoRoutes)) {
    const routeHtml = injectRouteMetadata(baseHtml, routeSeo, await renderRoute(routePath));

    if (routePath === '/') {
      await writeFile(path.join(distDir, 'index.html'), routeHtml, 'utf8');
      continue;
    }

    const routeDir = path.join(distDir, routePath.replace(/^\//, ''));
    await mkdir(routeDir, { recursive: true });
    await writeFile(path.join(routeDir, 'index.html'), routeHtml, 'utf8');
  }

  await rm(path.join(distDir, '_redirects'), { force: true });
  await writeFile(path.join(distDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`, 'utf8');
  await writeFile(path.join(distDir, 'sitemap.xml'), generateSitemap(blogSeoRoutes), 'utf8');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
