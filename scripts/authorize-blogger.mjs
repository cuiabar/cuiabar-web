import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const bloggerDir = path.join(repoRoot, 'blog-options', 'blogger');
const envPath = path.join(bloggerDir, '.env');

await ensureEnvFile();
await loadEnvFile(envPath);

if (!process.env.BLOGGER_CLIENT_ID) {
  throw new Error('BLOGGER_CLIENT_ID ausente em blog-options/blogger/.env');
}

const redirectPort = Number.parseInt(process.env.BLOGGER_REDIRECT_PORT ?? '45873', 10);
const redirectPath = '/oauth2/callback';
const redirectUri = `http://127.0.0.1:${redirectPort}${redirectPath}`;
const scope = 'https://www.googleapis.com/auth/blogger';
const state = randomUrlSafe(32);
const codeVerifier = randomUrlSafe(96);
const codeChallenge = base64Url(crypto.createHash('sha256').update(codeVerifier).digest());

const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', process.env.BLOGGER_CLIENT_ID);
authUrl.searchParams.set('redirect_uri', redirectUri);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', scope);
authUrl.searchParams.set('access_type', 'offline');
authUrl.searchParams.set('prompt', 'consent');
authUrl.searchParams.set('include_granted_scopes', 'true');
authUrl.searchParams.set('state', state);
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');

const code = await waitForAuthorizationCode({
  authUrl: authUrl.toString(),
  redirectPort,
  redirectPath,
  expectedState: state,
});

const tokenPayload = await exchangeCodeForTokens({
  code,
  redirectUri,
  codeVerifier,
  clientId: process.env.BLOGGER_CLIENT_ID,
  clientSecret: process.env.BLOGGER_CLIENT_SECRET,
});

if (!tokenPayload.refresh_token) {
  throw new Error('Google nao retornou refresh_token. Rode novamente e confirme a tela de consentimento.');
}

await upsertEnvValue('BLOGGER_REFRESH_TOKEN', tokenPayload.refresh_token);

const profileResponse = await fetch('https://www.googleapis.com/blogger/v3/users/self', {
  headers: {
    authorization: `Bearer ${tokenPayload.access_token}`,
    accept: 'application/json',
  },
});

if (!profileResponse.ok) {
  throw new Error(`Falha ao consultar o perfil do Blogger: ${profileResponse.status} ${await profileResponse.text()}`);
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
  throw new Error(`Falha ao listar blogs apos autenticar: ${blogsResponse.status} ${await blogsResponse.text()}`);
}

const blogsPayload = await blogsResponse.json();
const blogs = Array.isArray(blogsPayload.items) ? blogsPayload.items : [];

console.log('');
console.log('OAuth do Blogger concluido com sucesso.');
if (profile.id) {
  console.log(`Perfil autenticado: ${profile.id}`);
}

if (blogs.length === 0) {
  console.log('Nenhum blog encontrado nesta conta. Crie o blog no Blogger e depois rode: npm run blogger:list');
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

async function waitForAuthorizationCode({ authUrl, redirectPort, redirectPath, expectedState }) {
  console.log('Abrindo o login Google no navegador...');
  console.log(`Se o navegador nao abrir, use este link:\n${authUrl}\n`);

  const browserOpened = openBrowser(authUrl);
  if (!browserOpened) {
    console.log('Nao consegui abrir o navegador automaticamente, mas o link acima funciona.');
  }

  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      try {
        const currentUrl = new URL(request.url, `http://127.0.0.1:${redirectPort}`);
        if (currentUrl.pathname !== redirectPath) {
          response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
          response.end('Rota nao encontrada.');
          return;
        }

        const incomingState = currentUrl.searchParams.get('state');
        const code = currentUrl.searchParams.get('code');
        const error = currentUrl.searchParams.get('error');

        if (error) {
          response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
          response.end(`Google OAuth retornou erro: ${error}`);
          server.close();
          reject(new Error(`Google OAuth retornou erro: ${error}`));
          return;
        }

        if (!code || incomingState !== expectedState) {
          response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
          response.end('Resposta OAuth invalida.');
          server.close();
          reject(new Error('Resposta OAuth invalida ou state divergente.'));
          return;
        }

        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        response.end('<html><body style="font-family:Segoe UI,sans-serif;padding:32px"><h1>Autorizacao concluida</h1><p>Voce pode fechar esta janela e voltar ao terminal.</p></body></html>');
        server.close();
        resolve(code);
      } catch (error) {
        server.close();
        reject(error);
      }
    });

    server.listen(redirectPort, '127.0.0.1', () => {
      console.log(`Aguardando retorno do Google em ${redirectUriForLog(redirectPort, redirectPath)} ...`);
    });

    server.on('error', reject);
  });
}

async function exchangeCodeForTokens({ code, redirectUri, codeVerifier, clientId, clientSecret }) {
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
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
    throw new Error(`Falha ao trocar authorization code por token: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function openBrowser(url) {
  try {
    if (process.platform === 'win32') {
      const child = spawn('cmd', ['/c', 'start', '', url], {
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
      return true;
    }

    if (process.platform === 'darwin') {
      const child = spawn('open', [url], { detached: true, stdio: 'ignore' });
      child.unref();
      return true;
    }

    const child = spawn('xdg-open', [url], { detached: true, stdio: 'ignore' });
    child.unref();
    return true;
  } catch {
    return false;
  }
}

function randomUrlSafe(length) {
  return base64Url(crypto.randomBytes(length)).slice(0, Math.max(43, length));
}

function base64Url(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/g, '');
}

function redirectUriForLog(port, pathName) {
  return `http://127.0.0.1:${port}${pathName}`;
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
