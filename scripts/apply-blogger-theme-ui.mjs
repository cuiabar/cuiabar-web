import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const themeDir = path.join(repoRoot, 'blog-options', 'blogger', 'theme');
const blogId = '3100817897924506570';
const profileDir = path.join(process.env.LOCALAPPDATA ?? 'C:/Users/usuario/AppData/Local', 'CuiabarBloggerAutomation');
const loginEmail = process.env.BLOGGER_LOGIN_EMAIL?.trim();
const loginPassword = process.env.BLOGGER_LOGIN_PASSWORD?.trim();
const generatedThemePath = path.join(themeDir, 'cuiabar-blogger-theme.xml');

const [headSnippet, skinCss] = await Promise.all([
  fs.readFile(path.join(themeDir, 'blogger-head-snippet.html'), 'utf8'),
  fs.readFile(path.join(themeDir, 'cuiabar-blogger-skin.css'), 'utf8'),
]);

const context = await chromium.launchPersistentContext(profileDir, {
  headless: false,
  viewport: { width: 1440, height: 920 },
});

const page = context.pages()[0] || await context.newPage();

try {
  await page.goto(`https://www.blogger.com/blog/posts/${blogId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await waitForLogin(page);
  await page.goto(`https://www.blogger.com/blog/themes/${blogId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await page.waitForTimeout(3000);
  await captureDebug(page, 'blogger-theme-page');

  const moreActionsButton = page.getByLabel(/Mais ações/i).first();
  if (!(await moreActionsButton.isVisible().catch(() => false))) {
    throw new Error('Nao encontrei o botao "Mais ações" na pagina de tema do Blogger.');
  }

  await moreActionsButton.click({ timeout: 15000 });
  await page.waitForTimeout(1200);
  const editHtmlControl = page.getByText(/Editar HTML/i).first();
  await editHtmlControl.click({ timeout: 15000 });

  await page.waitForTimeout(5000);
  await captureDebug(page, 'blogger-theme-editor');

  const editorInfo = await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    const codeMirror = document.querySelector('.CodeMirror');
    const aceEditor = document.querySelector('.ace_editor');
    return {
      title: document.title,
      hasTextarea: Boolean(textarea),
      textareaLength: textarea?.value?.length ?? 0,
      hasCodeMirror: Boolean(codeMirror),
      hasAce: Boolean(aceEditor),
      bodyPreview: document.body.innerText.slice(0, 1200),
    };
  });

  console.log(JSON.stringify(editorInfo, null, 2));

  if (!editorInfo.hasTextarea && !editorInfo.hasCodeMirror && !editorInfo.hasAce) {
    throw new Error('Nao encontrei um editor HTML reconhecivel no painel do Blogger.');
  }

  const updateResult = await page.evaluate(
    ({ headSnippet, skinCss }) => {
      const normalizeHead = (input) => input.trim();
      const normalizeCss = (input) => input.trim();
      const injectIntoXml = (xml) => {
        let updated = xml;

        if (!updated.includes('theme-color" content="#ac5427"')) {
          updated = updated.replace('</head>', `${normalizeHead(headSnippet)}\n</head>`);
        }

        if (!updated.includes('--cuiabar-bg: #f9f3ea;')) {
          if (updated.includes('<b:skin><![CDATA[')) {
            updated = updated.replace('<b:skin><![CDATA[', `<b:skin><![CDATA[\n${normalizeCss(skinCss)}\n`);
          } else if (updated.includes('</head>')) {
            updated = updated.replace('</head>', `<style>\n${normalizeCss(skinCss)}\n</style>\n</head>`);
          }
        }

        return updated;
      };

      const codeMirrorHost = document.querySelector('.CodeMirror');
      if (codeMirrorHost?.CodeMirror) {
        const nextValue = injectIntoXml(codeMirrorHost.CodeMirror.getValue());
        codeMirrorHost.CodeMirror.setValue(nextValue);
        return { mode: 'codemirror', length: nextValue.length };
      }

      const aceTextarea = document.querySelector('.ace_text-input');
      const aceEditor = window.ace?.edit?.(document.querySelector('.ace_editor'));
      if (aceEditor) {
        const nextValue = injectIntoXml(aceEditor.getValue());
        aceEditor.setValue(nextValue, -1);
        return { mode: 'ace', length: nextValue.length };
      }

      const textarea = document.querySelector('textarea');
      if (textarea) {
        const nextValue = injectIntoXml(textarea.value);
        textarea.value = nextValue;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        return { mode: 'textarea', length: nextValue.length };
      }

      return { mode: 'unknown', length: 0 };
    },
    { headSnippet, skinCss },
  );

  console.log('Editor update result:', JSON.stringify(updateResult));

  const currentEditorCheck = await page.evaluate(() => {
    const cm = document.querySelector('.CodeMirror')?.CodeMirror;
    const value = cm ? cm.getValue() : (document.querySelector('textarea')?.value || '');
    return {
      hasThemeColor: value.includes('theme-color" content="#ac5427"') || value.includes("theme-color' content='#ac5427'"),
      hasCuiabarCss: value.includes('--cuiabar-bg: #f9f3ea;'),
      hasMoranga: value.includes('Moranga'),
      valueLength: value.length,
    };
  });
  console.log('Editor in-memory check:', JSON.stringify(currentEditorCheck));

  const generatedXml = await page.evaluate(() => {
    const cm = document.querySelector('.CodeMirror')?.CodeMirror;
    return cm ? cm.getValue() : (document.querySelector('textarea')?.value || '');
  });
  await fs.writeFile(generatedThemePath, generatedXml, 'utf8');

  await page.goto(`https://www.blogger.com/blog/themes/${blogId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(3000);
  await captureDebug(page, 'blogger-theme-restore-page');
  await page.getByLabel(/Mais ações/i).first().click({ timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.getByText(/Restaurar/i).first().click({ timeout: 15000 });
  await page.waitForTimeout(1200);
  await page.locator('input[type="file"]#restoreFileInput').setInputFiles(generatedThemePath);
  const uploadButton = page.locator('[aria-label*="Fazer upload"], [aria-label*="FAZER UPLOAD"]').first();
  if (await uploadButton.isVisible().catch(() => false)) {
    await uploadButton.click({ timeout: 15000, force: true });
  } else {
    await page.evaluate(() => {
      const target = [...document.querySelectorAll('[aria-label]')].find((node) =>
        /Fazer upload/i.test(node.getAttribute('aria-label') || ''),
      );
      if (target) {
        target.click();
      }
    });
  }
  await page.waitForTimeout(8000);
  await captureDebug(page, 'blogger-theme-restored');

  await page.goto(`https://www.blogger.com/blog/themes/${blogId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(3000);
  await page.getByLabel(/Mais ações/i).first().click({ timeout: 15000 });
  await page.waitForTimeout(800);
  await page.getByText(/Editar HTML/i).first().click({ timeout: 15000 });
  await page.waitForTimeout(4000);

  const persistedInfo = await page.evaluate(() => {
    const cm = document.querySelector('.CodeMirror')?.CodeMirror;
    const value = cm ? cm.getValue() : (document.querySelector('textarea')?.value || document.body?.innerText || '');
    return {
      hasThemeColor: value.includes('theme-color" content="#ac5427"') || value.includes("theme-color' content='#ac5427'"),
      hasCuiabarCss: value.includes('--cuiabar-bg: #f9f3ea;'),
      hasMoranga: value.includes('Moranga'),
      valueLength: value.length,
    };
  });

  console.log('Persisted theme check:', JSON.stringify(persistedInfo));
  if (!persistedInfo.hasCuiabarCss) {
    throw new Error('O tema nao persistiu no XML do Blogger depois do salvamento.');
  }

  console.log('Tema base aplicado no editor do Blogger.');
} finally {
  await context.close();
}

async function waitForLogin(page) {
  const alreadyLoggedIn = await page
    .evaluate(() => /Nova postagem|Postagens|Tema|Layout|Configurações/i.test(document.body?.innerText || ''))
    .catch(() => false);
  if (alreadyLoggedIn) {
    return;
  }

  if (loginEmail && loginPassword) {
    await performGoogleLogin(page, loginEmail, loginPassword);
  } else {
    console.log('Aguardando login manual no Google/Blogger...');
  }

  try {
    await page.waitForFunction(
      () => {
        const text = document.body?.innerText || '';
        return /Nova postagem|Posts|Tema|Layout|Configurações/i.test(text);
      },
      { timeout: 10 * 60 * 1000 },
    );
  } catch (error) {
    await captureDebug(page, 'blogger-login-timeout');
    const bodyPreview = await page.locator('body').innerText().catch(() => '');
    console.log('LOGIN_TIMEOUT_BODY_START');
    console.log(bodyPreview.slice(0, 4000));
    console.log('LOGIN_TIMEOUT_BODY_END');
    throw error;
  }
}

async function captureDebug(page, name) {
  const target = path.join(repoRoot, `${name}.png`);
  await page.screenshot({ path: target, fullPage: false });
}

async function performGoogleLogin(page, email, password) {
  await captureDebug(page, 'blogger-login-before');
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
    await captureDebug(page, 'blogger-login-email-filled');
    const nextButton = page.getByRole('button', { name: /Avançar|Next/i }).first();
    if (await nextButton.isVisible().catch(() => false)) {
      await nextButton.click({ timeout: 15000 });
      await page.waitForTimeout(2500);
    }
  }

  const passwordInput = page.locator('input[type="password"]').first();
  try {
    await passwordInput.waitFor({ state: 'visible', timeout: 60000 });
  } catch (error) {
    await captureDebug(page, 'blogger-login-password-timeout');
    const bodyPreview = await page.locator('body').innerText().catch(() => '');
    console.log('PASSWORD_TIMEOUT_BODY_START');
    console.log(bodyPreview.slice(0, 4000));
    console.log('PASSWORD_TIMEOUT_BODY_END');
    throw error;
  }
  await passwordInput.fill(password, { timeout: 15000 });
  await captureDebug(page, 'blogger-login-password-filled');

  const passwordNextButton = page.getByRole('button', { name: /Avançar|Next/i }).first();
  if (await passwordNextButton.isVisible().catch(() => false)) {
    await passwordNextButton.click({ timeout: 15000 });
    await page.waitForTimeout(3500);
  }

  await captureDebug(page, 'blogger-login-after-submit');
}
