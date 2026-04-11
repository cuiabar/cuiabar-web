import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const themeDir = path.join(repoRoot, 'blog-options', 'blogger', 'theme');
const uploadDir = path.join(repoRoot, 'blog-options', 'blogger', 'upload');

const sourceThemePath = path.join(themeDir, 'cuiabar-blogger-theme.xml');
const uploadThemePath = path.join(uploadDir, 'cuiabar-blogger-theme-upload.xml');
const manifestPath = path.join(uploadDir, 'manifest.json');
const checklistPath = path.join(uploadDir, 'COMO-ENVIAR-NO-BLOGGER.md');

const desktopDir = path.join(process.env.USERPROFILE ?? 'C:/Users/usuario', 'Desktop');
const desktopThemePath = path.join(desktopDir, 'Tema Blog Cuiabar.xml');

const xml = await fs.readFile(sourceThemePath, 'utf8');

const checks = {
  hasThemeColor: xml.includes('theme-color" content="#ac5427"') || xml.includes("theme-color' content='#ac5427'"),
  hasBrandCss: xml.includes('--cuiabar-bg: #f9f3ea;'),
  hasMoranga: xml.includes('Moranga'),
  hasCuiabarHero: xml.includes('.cuiabar-home-hero'),
};

const failedChecks = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

if (failedChecks.length > 0) {
  throw new Error(`Tema base incompleto. Falharam as validacoes: ${failedChecks.join(', ')}`);
}

await fs.mkdir(uploadDir, { recursive: true });
await fs.writeFile(uploadThemePath, xml, 'utf8');
await fs.writeFile(desktopThemePath, xml, 'utf8');

const manifest = {
  generatedAt: new Date().toISOString(),
  sourceThemePath,
  uploadThemePath,
  desktopThemePath,
  checks,
  blogDomainTarget: 'blog.cuiabar.com',
  bloggerRestoreFlow: [
    'Blogger > Tema',
    'Mais acoes',
    'Fazer backup antes de trocar',
    'Restaurar',
    'Selecionar o arquivo XML gerado',
    'Confirmar upload',
  ],
};

const checklist = `# Upload manual do tema Cuiabar

Arquivo principal para upload:

- \`cuiabar-blogger-theme-upload.xml\`

Copia adicional na area de trabalho:

- \`Tema Blog Cuiabar.xml\`

Fluxo recomendado no Blogger:

1. Acesse \`Tema\`.
2. Clique em \`Mais acoes\`.
3. Clique em \`Fazer backup\` e salve o tema atual.
4. Clique em \`Restaurar\`.
5. Selecione \`cuiabar-blogger-theme-upload.xml\`.
6. Confirme o upload e aguarde a troca do tema.
7. Revise home, post interno, menu e rodape.

Validacoes incluidas neste XML:

- cor principal Cuiabar no \`<head>\`
- CSS base da marca
- fonte Moranga
- blocos visuais do blog
`;

await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
await fs.writeFile(checklistPath, checklist, 'utf8');

console.log(JSON.stringify({
  ok: true,
  uploadThemePath,
  desktopThemePath,
  manifestPath,
  checklistPath,
  checks,
}, null, 2));
