import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const envFile = path.join(repoRoot, 'blog-options', 'blogger', '.env');

await loadEnvFile(envFile);

const requiredEnv = ['BLOGGER_CLIENT_ID', 'BLOGGER_REFRESH_TOKEN'];
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

const response = await fetch('https://www.googleapis.com/blogger/v3/users/self/blogs', {
  headers: {
    authorization: `Bearer ${token}`,
    accept: 'application/json',
  },
});

if (!response.ok) {
  throw new Error(`Falha ao listar blogs do Blogger: ${response.status} ${await response.text()}`);
}

const payload = await response.json();
const items = Array.isArray(payload.items) ? payload.items : [];

if (items.length === 0) {
  console.log('Nenhum blog encontrado para a conta autenticada.');
  process.exit(0);
}

console.log('Blogs encontrados no Blogger:\n');
for (const blog of items) {
  console.log(`- ${blog.name}`);
  console.log(`  id: ${blog.id}`);
  console.log(`  url: ${blog.url}`);
  if (blog.published) {
    console.log(`  publicado em: ${blog.published}`);
  }
  console.log('');
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
