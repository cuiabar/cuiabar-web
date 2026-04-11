import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFile = path.resolve(__dirname, '../src/data/knowledgeArticlesCms.ts');
const apiUrl = (process.env.BLOG_CMS_API_URL || 'https://blog.cuiabar.com/api/blog/posts?format=knowledge').trim();

const renderCmsFile = (articles) => {
  const serialized = JSON.stringify(articles, null, 2);
  return `import type { KnowledgeArticle } from './types';

// Arquivo gerado automaticamente por scripts/sync-blog-content-from-cloudflare-native.mjs
// Nao editar manualmente: o conteudo sera sobrescrito na proxima sincronizacao.
export const knowledgeArticlesCms: KnowledgeArticle[] = ${serialized};
`;
};

const main = async () => {
  const response = await fetch(apiUrl, {
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha ao buscar posts do CMS Cloudflare (${response.status}): ${text}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error('Resposta inesperada do CMS Cloudflare: esperado um array de artigos.');
  }

  await writeFile(outputFile, renderCmsFile(payload), 'utf8');
  console.log(`[sync-blog-content-from-cloudflare-native] ${payload.length} artigo(s) sincronizado(s) de ${apiUrl}.`);
};

main().catch((error) => {
  console.error('[sync-blog-content-from-cloudflare-native] erro:', error.message);
  process.exit(1);
});
