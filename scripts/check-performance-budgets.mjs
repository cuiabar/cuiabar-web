import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

const formatKb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const assertFileSize = (relativePath, maxBytes, errors, reports) => {
  const absolutePath = path.join(rootDir, relativePath);
  const stats = statSync(absolutePath);

  reports.push(`${relativePath}: ${formatKb(stats.size)} / budget ${formatKb(maxBytes)}`);

  if (stats.size > maxBytes) {
    errors.push(`${relativePath} is ${formatKb(stats.size)}, above budget ${formatKb(maxBytes)}.`);
  }
};

const findAsset = (directoryPath, matcher) => {
  const files = readdirSync(directoryPath);
  const match = files.find((file) => matcher.test(file));

  if (!match) {
    throw new Error(`Unable to find asset matching ${matcher} in ${directoryPath}.`);
  }

  return match;
};

const errors = [];
const reports = [];

const distAssetsDir = path.join(rootDir, 'dist', 'assets');
const mainJs = findAsset(distAssetsDir, /^index-.*\.js$/);
const mainCss = findAsset(distAssetsDir, /^index-.*\.css$/);
const reservationsJs = findAsset(distAssetsDir, /^ReservationsApp-.*\.js$/);

assertFileSize(path.join('dist', 'assets', mainJs), 180 * 1024, errors, reports);
assertFileSize(path.join('dist', 'assets', mainCss), 85 * 1024, errors, reports);
assertFileSize(path.join('dist', 'assets', reservationsJs), 45 * 1024, errors, reports);

[
  ['public/logo-villa-cuiabar.png', 120 * 1024],
  ['public/favicon.png', 40 * 1024],
  ['public/home/home-salao-dia-da-mulher.jpg', 260 * 1024],
  ['public/home/home-salao-dia-da-mulher.webp', 220 * 1024],
  ['public/home/home-mascote-salao.jpg', 100 * 1024],
  ['public/home/home-mascote-salao.webp', 70 * 1024],
  ['public/prorefeicao/hero-parmegiana.png', 220 * 1024],
  ['public/prorefeicao/hero-parmegiana.webp', 35 * 1024],
  ['public/prorefeicao/costela.png', 220 * 1024],
  ['public/prorefeicao/costela.webp', 35 * 1024],
  ['public/prorefeicao/chorizo.png', 220 * 1024],
  ['public/prorefeicao/chorizo.webp', 35 * 1024],
  ['public/fonts/Moranga-Regular.woff2', 50 * 1024],
  ['public/fonts/Moranga-Medium.woff2', 50 * 1024],
  ['public/fonts/Moranga-Bold.woff2', 50 * 1024],
  ['public/fonts/Moranga-Black.woff2', 45 * 1024],
].forEach(([relativePath, maxBytes]) => assertFileSize(relativePath, maxBytes, errors, reports));

const globalCss = readFileSync(path.join(rootDir, 'src', 'styles', 'global.css'), 'utf8');

if (/\.otf|opentype/i.test(globalCss)) {
  errors.push('src/styles/global.css still references OTF fonts on the critical path.');
} else {
  reports.push('src/styles/global.css: using WOFF2-only Moranga declarations.');
}

console.log('Performance budgets');
for (const report of reports) {
  console.log(`- ${report}`);
}

if (errors.length > 0) {
  console.error('\nPerformance budget failures');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('\nAll performance budgets passed.');
