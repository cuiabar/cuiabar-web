import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFile = path.resolve(__dirname, '../src/data/knowledgeArticlesCms.ts');

const directusUrl = (process.env.DIRECTUS_URL || '').trim().replace(/\/$/, '');
const directusToken = (process.env.DIRECTUS_TOKEN || '').trim();
const directusAdminEmail = (process.env.DIRECTUS_ADMIN_EMAIL || '').trim();
const directusAdminPassword = (process.env.DIRECTUS_ADMIN_PASSWORD || '').trim();
const collectionName = (process.env.DIRECTUS_BLOG_COLLECTION || 'blog_posts').trim();
const sectionsField = (process.env.DIRECTUS_BLOG_SECTIONS_FIELD || 'sections').trim();
const fieldsQuery = (process.env.DIRECTUS_BLOG_FIELDS || '*').trim();
const strictMode = process.env.CMS_SYNC_STRICT === 'true';

const nowDate = () => new Date().toISOString().slice(0, 10);

const slugify = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const estimateReadTime = (text) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min`;
};

const toSummary = (value, fallback) => {
  const normalized = String(value || '').trim();
  if (normalized) {
    return normalized;
  }
  const fallbackText = String(fallback || '').trim();
  if (!fallbackText) {
    return 'Conteudo editorial da Cuiabar em atualizacao.';
  }
  return fallbackText.slice(0, 220);
};

const mapSection = (section, index) => {
  const title = String(section?.title || '').trim() || `Topico ${index + 1}`;
  const body = String(section?.body || section?.content || '').trim();
  return {
    title,
    body: body || 'Conteudo em atualizacao.',
  };
};

const normalizeSectionsSource = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const resolveImage = (post) => {
  const external = String(post?.cover_image_external_url || post?.image_external_url || '').trim();
  if (external) {
    return external;
  }

  const imageRef = post?.cover_image ?? post?.image ?? null;
  if (!imageRef || typeof imageRef !== 'string') {
    return '/home/home-salao-dia-da-mulher.jpg';
  }
  if (!directusUrl) {
    return '/home/home-salao-dia-da-mulher.jpg';
  }

  return `${directusUrl}/assets/${imageRef}`;
};

const renderCmsFile = (articles) => {
  const serialized = JSON.stringify(articles, null, 2);
  return `import type { KnowledgeArticle } from './types';

// Arquivo gerado automaticamente por scripts/sync-blog-content-from-directus.mjs
// Nao editar manualmente: o conteudo sera sobrescrito na proxima sincronizacao.
export const knowledgeArticlesCms: KnowledgeArticle[] = ${serialized};
`;
};

const resolveAccessToken = async () => {
  if (directusToken) {
    return directusToken;
  }

  if (!directusAdminEmail || !directusAdminPassword) {
    return '';
  }

  const loginResponse = await fetch(`${directusUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: directusAdminEmail,
      password: directusAdminPassword,
    }),
  });

  if (!loginResponse.ok) {
    const message = await loginResponse.text();
    throw new Error(`Falha no login do Directus (${loginResponse.status}): ${message}`);
  }

  const loginPayload = await loginResponse.json();
  return String(loginPayload?.data?.access_token || '').trim();
};

const fetchDirectusPosts = async (accessToken) => {
  const search = new URLSearchParams();
  search.set('limit', '200');
  search.set('sort[]', '-publish_date');
  search.set('fields', fieldsQuery);
  search.set('filter[status][_eq]', 'published');
  search.set(`deep[${sectionsField}][_sort]`, 'sort');

  const endpoint = `${directusUrl}/items/${collectionName}?${search.toString()}`;
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Falha ao buscar conteudo no Directus (${response.status}): ${message}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload?.data)) {
    throw new Error('Resposta inesperada do Directus: campo "data" nao e uma lista.');
  }

  return payload.data;
};

const mapPostToKnowledgeArticle = (post, index) => {
  const title = String(post?.title || '').trim() || `Post ${index + 1}`;
  const slug = slugify(post?.slug || title || `post-${index + 1}`);
  const excerpt = String(post?.excerpt || '').trim();
  const summary = toSummary(post?.summary, excerpt || title);
  const sectionSource = normalizeSectionsSource(post?.[sectionsField]);
  const sections = sectionSource.map(mapSection).filter((section) => section.body.trim().length > 0);
  const keywordList = toArray(post?.keywords);
  const fullText = [title, excerpt, summary, ...sections.map((item) => `${item.title} ${item.body}`)].join(' ');

  return {
    id: String(post?.id || `cms-${index + 1}`),
    title,
    excerpt: excerpt || summary,
    category: String(post?.category || 'Blog'),
    readTime: String(post?.read_time || '').trim() || estimateReadTime(fullText),
    date: String(post?.publish_date || post?.published_at || '').slice(0, 10) || nowDate(),
    image: resolveImage(post),
    slug,
    eyebrow: String(post?.eyebrow || post?.category || 'Editorial').trim() || 'Editorial',
    summary,
    keywords: keywordList.length > 0 ? keywordList : ['blog cuiabar', 'campinas'],
    sections:
      sections.length > 0
        ? sections
        : [
            {
              title: 'Conteudo principal',
              body: summary,
            },
          ],
  };
};

const main = async () => {
  if (!directusUrl) {
    if (strictMode) {
      throw new Error('DIRECTUS_URL e obrigatorio quando CMS_SYNC_STRICT=true.');
    }

    console.warn('[sync-blog-content] Directus nao configurado. Nenhuma alteracao feita no arquivo CMS.');
    return;
  }

  const accessToken = await resolveAccessToken();
  if (!accessToken) {
    if (strictMode) {
      throw new Error(
        'Defina DIRECTUS_TOKEN ou DIRECTUS_ADMIN_EMAIL + DIRECTUS_ADMIN_PASSWORD quando CMS_SYNC_STRICT=true.',
      );
    }
    console.warn('[sync-blog-content] Credenciais do Directus ausentes. Nenhuma alteracao feita no arquivo CMS.');
    return;
  }

  const posts = await fetchDirectusPosts(accessToken);
  const articles = posts.map(mapPostToKnowledgeArticle).filter((article) => article.slug.length > 0);

  await writeFile(outputFile, renderCmsFile(articles), 'utf8');
  console.log(`[sync-blog-content] ${articles.length} artigo(s) sincronizado(s) de ${collectionName}.`);
};

main().catch((error) => {
  console.error('[sync-blog-content] erro:', error.message);
  process.exit(1);
});
