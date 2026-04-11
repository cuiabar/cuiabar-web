import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const bloggerDir = path.join(repoRoot, 'blog-options', 'blogger');
const outDir = path.join(bloggerDir, 'out');

await loadEnvFile(path.join(bloggerDir, '.env'));

const isDryRun = toBoolean(process.env.BLOGGER_DRY_RUN ?? 'false');
const publishMode = (process.env.BLOGGER_PUBLISH_MODE ?? 'draft').toLowerCase();
const maxPosts = Number.parseInt(process.env.BLOGGER_MAX_POSTS ?? '0', 10);
const siteBaseUrl = (process.env.SITE_BASE_URL ?? 'https://cuiabar.com').replace(/\/$/, '');
const blogBaseUrl = (process.env.BLOG_BASE_URL ?? 'https://blog.cuiabar.com').replace(/\/$/, '');

const articles = await loadKnowledgeArticles();
const selectedArticles = Number.isFinite(maxPosts) && maxPosts > 0 ? articles.slice(0, maxPosts) : articles;

if (selectedArticles.length === 0) {
  throw new Error('Nenhum artigo encontrado para publicar no Blogger.');
}

const renderedPosts = selectedArticles.map((article) => ({
  article,
  title: article.title,
  content: renderArticleHtml(article, { siteBaseUrl, blogBaseUrl }),
  labels: buildLabels(article),
}));

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(
  path.join(outDir, 'blogger-post-preview.json'),
  JSON.stringify(
    renderedPosts.map((post) => ({
      slug: post.article.slug,
      title: post.title,
      labels: post.labels,
    })),
    null,
    2,
  ),
  'utf8',
);

for (const post of renderedPosts) {
  const htmlPath = path.join(outDir, `${sanitizeFileName(post.article.slug)}.html`);
  await fs.writeFile(htmlPath, post.content, 'utf8');
}

if (isDryRun) {
  console.log(`Dry run concluido. ${renderedPosts.length} posts renderizados em ${outDir}`);
  process.exit(0);
}

const requiredEnv = ['BLOGGER_CLIENT_ID', 'BLOGGER_REFRESH_TOKEN', 'BLOGGER_BLOG_ID'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Variavel obrigatoria ausente: ${key}`);
  }
}

const token = await getAccessToken({
  clientId: process.env.BLOGGER_CLIENT_ID,
  clientSecret: process.env.BLOGGER_CLIENT_SECRET,
  refreshToken: process.env.BLOGGER_REFRESH_TOKEN,
});

const existingPosts = await listExistingPosts(process.env.BLOGGER_BLOG_ID, token);
const existingTitles = new Set(existingPosts.map((post) => post.title?.trim()).filter(Boolean));

for (const post of renderedPosts) {
  if (existingTitles.has(post.title.trim())) {
    console.log(`Pulando "${post.title}" porque ja existe no Blogger com o mesmo titulo.`);
    continue;
  }

  const query = publishMode === 'publish' ? '?isDraft=false' : '?isDraft=true';
  const response = await fetch(
    `https://www.googleapis.com/blogger/v3/blogs/${process.env.BLOGGER_BLOG_ID}/posts${query}`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        kind: 'blogger#post',
        title: post.title,
        content: post.content,
        labels: post.labels,
        published: normalizePublishedDate(post.article.date),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Falha ao publicar "${post.title}" no Blogger: ${response.status} ${await response.text()}`);
  }

  const createdPost = await response.json();
  console.log(`Publicado: ${post.title}`);
  console.log(`URL: ${createdPost.url ?? '(rascunho sem URL publica ainda)'}`);
  console.log('');
}

async function loadKnowledgeArticles() {
  const cmsArticles = await parseKnowledgeArticleExport(
    path.join(repoRoot, 'src', 'data', 'knowledgeArticlesCms.ts'),
    'knowledgeArticlesCms',
  );

  if (cmsArticles.length > 0) {
    return cmsArticles;
  }

  return parseKnowledgeArticleExport(
    path.join(repoRoot, 'src', 'data', 'knowledgeArticlesSeed.ts'),
    'knowledgeArticlesSeed',
  );
}

async function parseKnowledgeArticleExport(filePath, exportName) {
  const source = await fs.readFile(filePath, 'utf8');
  const compiled = source
    .replace(/^import .*$/gm, '')
    .replace(
      new RegExp(`export\\s+const\\s+${exportName}\\s*:\\s*KnowledgeArticle\\[\\]\\s*=\\s*`),
      'return ',
    )
    .trim();

  return new Function(compiled)();
}

function renderArticleHtml(article, { siteBaseUrl, blogBaseUrl }) {
  const chips = article.keywords
    .slice(0, 6)
    .map((keyword) => `<span class="cuiabar-chip">${escapeHtml(keyword)}</span>`)
    .join('');

  const sections = article.sections
    .map(
      (section) => `
        <section class="cuiabar-section">
          <h2>${escapeHtml(section.title)}</h2>
          <p>${paragraphize(section.body)}</p>
        </section>
      `,
    )
    .join('');

  return `
<!-- cuiabar-slug:${escapeHtml(article.slug)} -->
<article class="cuiabar-post">
  <header class="cuiabar-hero">
    <p class="cuiabar-eyebrow">${escapeHtml(article.eyebrow)}</p>
    <h1>${escapeHtml(article.title)}</h1>
    <p class="cuiabar-summary">${escapeHtml(article.summary)}</p>
    <div class="cuiabar-meta">
      <span>${escapeHtml(article.category)}</span>
      <span>${escapeHtml(article.readTime)}</span>
      <span>${escapeHtml(formatHumanDate(article.date))}</span>
    </div>
    <div class="cuiabar-chip-row">${chips}</div>
    <figure class="cuiabar-cover">
      <img src="${escapeAttribute(resolveImageUrl(article.image, blogBaseUrl, siteBaseUrl))}" alt="${escapeAttribute(article.title)}" />
    </figure>
  </header>

  <div class="cuiabar-intro">
    <p>${paragraphize(article.excerpt)}</p>
  </div>

  <div class="cuiabar-body">
    ${sections}
  </div>

  <aside class="cuiabar-cta-shell">
    <div class="cuiabar-cta-card">
      <p class="cuiabar-cta-kicker">Villa Cuiabar</p>
      <h3>Continue a experiencia fora do post</h3>
      <p>Leve o leitor para reserva, agenda e menu oficial sem perder a identidade do blog.</p>
      <div class="cuiabar-cta-grid">
        <a href="${siteBaseUrl}/reservas">Reservar mesa</a>
        <a href="${siteBaseUrl}/agenda">Ver agenda</a>
        <a href="${siteBaseUrl}/menu">Abrir menu</a>
      </div>
    </div>
  </aside>
</article>
  `.trim();
}

function buildLabels(article) {
  return [
    'cuiabar-sync',
    `slug:${article.slug}`,
    `categoria:${article.category}`,
    ...article.keywords.slice(0, 4),
  ];
}

async function listExistingPosts(blogId, token) {
  const response = await fetch(
    `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?maxResults=500&fetchBodies=false`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Falha ao consultar posts existentes do Blogger: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  return Array.isArray(payload.items) ? payload.items : [];
}

async function loadEnvFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = stripWrappingQuotes(value);
      }
    }
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return;
    }
    throw error;
  }
}

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function toBoolean(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function sanitizeFileName(value) {
  return value.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
}

function normalizePublishedDate(value) {
  if (!value) {
    return undefined;
  }
  if (value.includes('T')) {
    return value;
  }
  return `${value}T09:00:00-03:00`;
}

function formatHumanDate(value) {
  const date = new Date(normalizePublishedDate(value));
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

function resolveImageUrl(image, blogBaseUrl, siteBaseUrl) {
  if (!image) {
    return `${siteBaseUrl}/logo-villa-cuiabar.png`;
  }
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  const normalized = image.startsWith('/') ? image : `/${image}`;
  if (normalized.startsWith('/home/') || normalized.startsWith('/menu/') || normalized.startsWith('/prorefeicao/')) {
    return `${blogBaseUrl}${normalized}`;
  }
  return `${siteBaseUrl}${normalized}`;
}

function paragraphize(text) {
  return escapeHtml(text).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br />');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

async function getAccessToken({ clientId, clientSecret, refreshToken }) {
  const body = new URLSearchParams({
    client_id: clientId,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  if (clientSecret) {
    body.set('client_secret', clientSecret);
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Falha ao obter access token do Google: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  if (!payload.access_token) {
    throw new Error('Google OAuth respondeu sem access_token.');
  }

  return payload.access_token;
}
