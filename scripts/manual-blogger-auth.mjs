import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const bloggerDir = path.join(repoRoot, 'blog-options', 'blogger');
const envPath = path.join(bloggerDir, '.env');
const redirectUri = process.env.BLOGGER_MANUAL_REDIRECT_URI ?? 'https://developers.google.com/oauthplayground';

await ensureEnvFile();
await loadEnvFile(envPath);

if (!process.env.BLOGGER_CLIENT_ID) {
  throw new Error('BLOGGER_CLIENT_ID ausente em blog-options/blogger/.env');
}

if (!process.env.BLOGGER_CLIENT_SECRET) {
  throw new Error('BLOGGER_CLIENT_SECRET ausente em blog-options/blogger/.env');
}

const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', process.env.BLOGGER_CLIENT_ID);
authUrl.searchParams.set('redirect_uri', redirectUri);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/blogger');
authUrl.searchParams.set('access_type', 'offline');
authUrl.searchParams.set('prompt', 'consent');
authUrl.searchParams.set('include_granted_scopes', 'true');

console.log('Abra este link no navegador e conclua o login com a conta do Blogger:\n');
console.log(authUrl.toString());
console.log('');
console.log('Depois da autorizacao, copie a URL final do navegador e rode:');
console.log('node scripts/manual-blogger-auth.mjs "COLE_A_URL_FINAL_AQUI"');
console.log('');

const inputValue = process.argv[2]?.trim();
if (!inputValue) {
  process.exit(0);
}

const callbackUrl = new URL(inputValue);
const code = callbackUrl.searchParams.get('code');
const error = callbackUrl.searchParams.get('error');

if (error) {
  throw new Error(`Google OAuth retornou erro: ${error}`);
}

if (!code) {
  throw new Error('Nao encontrei o parametro code na URL informada.');
}

const tokenPayload = await exchangeCodeForTokens({
  code,
  clientId: process.env.BLOGGER_CLIENT_ID,
  clientSecret: process.env.BLOGGER_CLIENT_SECRET,
  redirectUri,
});

if (!tokenPayload.refresh_token) {
  throw new Error('Google nao retornou refresh_token. Rode novamente e aprove o consentimento completo.');
}

await upsertEnvValue('BLOGGER_REFRESH_TOKEN', tokenPayload.refresh_token);

const profileResponse = await fetch('https://www.googleapis.com/blogger/v3/users/self', {
  headers: {
    authorization: `Bearer ${tokenPayload.access_token}`,
    accept: 'application/json',
  },
});

if (!profileResponse.ok) {
  throw new Error(`Falha ao consultar perfil Blogger: ${profileResponse.status} ${await profileResponse.text()}`);
}

const profile = await profileResponse.json();
if (profile.id) {
  await upsertEnvValue('GOOGLE_PROFILE_ID', profile.id);
}

const blogsResponse = await fetch('https://www.googleapis.com/blogger/v3/users/self/blogs', {
  headers: {
    authorization: `Bearer ${tokenPayload.access_token}`,
    accept: 'application/json',
  },
});

if (!blogsResponse.ok) {
  throw new Error(`Falha ao listar blogs: ${blogsResponse.status} ${await blogsResponse.text()}`);
}

const blogsPayload = await blogsResponse.json();
const blogs = Array.isArray(blogsPayload.items) ? blogsPayload.items : [];

console.log('OAuth manual concluido com sucesso.');
if (profile.id) {
  console.log(`Perfil autenticado: ${profile.id}`);
}

if (blogs.length === 0) {
  console.log('Nenhum blog encontrado nessa conta. Crie o blog no Blogger e depois rode npm run blogger:list');
  process.exit(0);
}

console.log('');
console.log('Blogs encontrados:');
for (const blog of blogs) {
  console.log(`- ${blog.name} | id=${blog.id} | url=${blog.url}`);
}

if (!process.env.BLOGGER_BLOG_ID && blogs.length === 1) {
  await upsertEnvValue('BLOGGER_BLOG_ID', blogs[0].id);
  console.log('');
  console.log(`BLOGGER_BLOG_ID salvo automaticamente: ${blogs[0].id}`);
}

async function exchangeCodeForTokens({ code, clientId, clientSecret, redirectUri }) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao trocar code por token: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function ensureEnvFile() {
  try {
    await fs.access(envPath);
  } catch {
    const examplePath = path.join(bloggerDir, '.env.example');
    await fs.copyFile(examplePath, envPath);
  }
}

async function loadEnvFile(filePath) {
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
}

async function upsertEnvValue(key, value) {
  const content = await fs.readFile(envPath, 'utf8');
  const pattern = new RegExp(`^${escapeRegExp(key)}=.*$`, 'm');
  const line = `${key}=${value}`;

  let nextContent;
  if (pattern.test(content)) {
    nextContent = content.replace(pattern, line);
  } else {
    nextContent = `${content.trimEnd()}\n${line}\n`;
  }

  await fs.writeFile(envPath, nextContent, 'utf8');
  process.env[key] = value;
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
