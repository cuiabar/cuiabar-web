import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const envPath = path.join(repoRoot, 'blog-options', 'blogger', '.env');
const uploadThemePath = path.join(repoRoot, 'blog-options', 'blogger', 'upload', 'cuiabar-blogger-theme-upload.xml');
const profileDir = path.join(process.env.LOCALAPPDATA ?? 'C:/Users/usuario/AppData/Local', 'CuiabarBloggerAutomation');

const envMap = await loadEnv(envPath);
const blogId = process.env.BLOGGER_BLOG_ID?.trim() || envMap.BLOGGER_BLOG_ID?.trim();
const loginEmail = process.env.BLOGGER_LOGIN_EMAIL?.trim();
const loginPassword = process.env.BLOGGER_LOGIN_PASSWORD?.trim();

if (!blogId) {
  throw new Error('BLOGGER_BLOG_ID ausente.');
}

if (!loginEmail || !loginPassword) {
  throw new Error('Defina BLOGGER_LOGIN_EMAIL e BLOGGER_LOGIN_PASSWORD antes de rodar o upload.');
}

await fs.access(uploadThemePath);

const context = await chromium.launchPersistentContext(profileDir, {
  headless: false,
  viewport: { width: 1440, height: 920 },
});

const page = context.pages()[0] || await context.newPage();

try {
  await page.goto(`https://www.blogger.com/blog/themes/${blogId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await waitForLogin(page, loginEmail, loginPassword);
  await page.goto(`https://www.blogger.com/blog/themes/${blogId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(3000);
  await capture(page, 'blogger-theme-upload-page');

  await page.getByLabel(/Mais ações/i).first().click({ timeout: 20000 });
  await page.waitForTimeout(1000);
  await page.getByText(/Restaurar/i).first().click({ timeout: 20000 });
  await page.waitForTimeout(1500);
  await capture(page, 'blogger-theme-upload-dialog');

  const restoreInput = page.locator('#restoreFileInput').first();
  await restoreInput.setInputFiles(uploadThemePath);
  await page.waitForTimeout(1500);
  await capture(page, 'blogger-theme-upload-selected-file');

  await clickUpload(page);
  await page.waitForTimeout(6000);
  const uploadBodyEarly = await page.locator('body').innerText().catch(() => '');
  console.log('UPLOAD_BODY_EARLY_START');
  console.log(uploadBodyEarly.slice(0, 3000));
  console.log('UPLOAD_BODY_EARLY_END');
  await page.waitForTimeout(30000);
  await capture(page, 'blogger-theme-upload-after-submit');
  const uploadBodyLate = await page.locator('body').innerText().catch(() => '');
  console.log('UPLOAD_BODY_LATE_START');
  console.log(uploadBodyLate.slice(0, 3000));
  console.log('UPLOAD_BODY_LATE_END');

  const persistedInfo = await verifyTheme(page, blogId);
  console.log(JSON.stringify({ ok: true, persistedInfo, uploadThemePath }, null, 2));
} finally {
  await context.close();
}

async function verifyTheme(page, blogId) {
  await page.goto(`https://www.blogger.com/blog/themes/${blogId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(2500);
  await page.getByLabel(/Mais ações/i).first().click({ timeout: 20000 });
  await page.waitForTimeout(700);
  await page.getByText(/Editar HTML/i).first().click({ timeout: 20000 });
  await page.waitForTimeout(5000);
  await capture(page, 'blogger-theme-upload-verify-editor');

  const persistedInfo = await page.evaluate(() => {
    const cm = document.querySelector('.CodeMirror')?.CodeMirror;
    const value = cm ? cm.getValue() : (document.querySelector('textarea')?.value || document.body?.innerText || '');
    return {
      hasThemeColor: value.includes('theme-color" content="#ac5427"') || value.includes("theme-color' content='#ac5427'"),
      hasBrandCss: value.includes('--cuiabar-bg: #f9f3ea;'),
      hasMoranga: value.includes('Moranga'),
      hasHero: value.includes('.cuiabar-home-hero'),
      valueLength: value.length,
    };
  });

  if (!persistedInfo.hasBrandCss || !persistedInfo.hasMoranga) {
    throw new Error(`Upload concluido sem persistencia confirmada: ${JSON.stringify(persistedInfo)}`);
  }

  return persistedInfo;
}

async function clickUpload(page) {
  const buttonPatterns = [/Fazer upload/i, /^Upload$/i, /Restaurar/i];

  for (const pattern of buttonPatterns) {
    const roleButton = page.getByRole('button', { name: pattern }).first();
    if (await roleButton.isVisible().catch(() => false)) {
      await roleButton.click({ timeout: 15000, force: true });
      return;
    }
  }

  const ariaButton = page.locator('[aria-label*="Fazer upload"], [aria-label*="FAZER UPLOAD"]').first();
  if (await ariaButton.isVisible().catch(() => false)) {
    await ariaButton.click({ timeout: 15000, force: true });
    return;
  }

  const clicked = await page.evaluate(() => {
    const candidates = [...document.querySelectorAll('button, div[role="button"], span[role="button"]')];
    const target = candidates.find((node) => /Fazer upload|Upload/i.test(node.textContent || '') || /Fazer upload/i.test(node.getAttribute('aria-label') || ''));
    if (target) {
      target.click();
      return true;
    }
    return false;
  });

  if (!clicked) {
    throw new Error('Nao encontrei o botao final de upload no dialogo do Blogger.');
  }
}

async function waitForLogin(page, email, password) {
  const alreadyLoggedIn = await page
    .evaluate(() => /Nova postagem|Postagens|Tema|Layout|Configurações/i.test(document.body?.innerText || ''))
    .catch(() => false);
  if (alreadyLoggedIn) {
    return;
  }

  await performGoogleLogin(page, email, password);

  await page.waitForFunction(
    () => {
      const text = document.body?.innerText || '';
      return /Nova postagem|Posts|Tema|Layout|Configurações/i.test(text);
    },
    { timeout: 10 * 60 * 1000 },
  );
}

async function performGoogleLogin(page, email, password) {
  const bodyText = (await page.locator('body').innerText().catch(() => '')) || '';
  if (/FAZER LOGIN|Fazer login|Sign in/i.test(bodyText)) {
    const loginTrigger = page.getByText(/FAZER LOGIN|Fazer login|Sign in/i).first();
    if (await loginTrigger.isVisible().catch(() => false)) {
      await loginTrigger.click({ timeout: 15000 });
      await page.waitForTimeout(2000);
    }
  }

  if (await page.getByText(/Use outra conta|Usar outra conta/i).first().isVisible().catch(() => false)) {
    await page.getByText(/Use outra conta|Usar outra conta/i).first().click({ timeout: 15000 });
    await page.waitForTimeout(1500);
  }

  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill(email, { timeout: 15000 });
    const nextButton = page.getByRole('button', { name: /Avançar|Next/i }).first();
    if (await nextButton.isVisible().catch(() => false)) {
      await nextButton.click({ timeout: 15000 });
      await page.waitForTimeout(2500);
    }
  }

  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.waitFor({ state: 'visible', timeout: 60000 });
  await passwordInput.fill(password, { timeout: 15000 });

  const passwordNextButton = page.getByRole('button', { name: /Avançar|Next/i }).first();
  if (await passwordNextButton.isVisible().catch(() => false)) {
    await passwordNextButton.click({ timeout: 15000 });
    await page.waitForTimeout(3500);
  }
}

async function capture(page, name) {
  const target = path.join(repoRoot, `${name}.png`);
  await page.screenshot({ path: target, fullPage: false });
}

async function loadEnv(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const result = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    result[key] = value;
  }

  return result;
}
