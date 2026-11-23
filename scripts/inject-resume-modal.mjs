import { readFile, writeFile } from 'node:fs/promises';

const sourcePath = new URL('../src/content/resume-modal.html', import.meta.url);
const pages = [
  new URL('../public/index.html', import.meta.url),
  new URL('../public/about/index.html', import.meta.url),
  new URL('../public/portfolio/index.html', import.meta.url),
  new URL('../public/readme/index.html', import.meta.url),
];
const startMarker = '<!-- resume-modal:start -->';
const endMarker = '<!-- resume-modal:end -->';
const source = await readFile(sourcePath, 'utf8');
const replacements = [];

for (const page of pages) {
  const html = await readFile(page, 'utf8');
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start || html.indexOf(startMarker, start + startMarker.length) !== -1 || html.indexOf(endMarker, end + endMarker.length) !== -1) {
    throw new Error(`Cannot inject resume modal: expected exactly one ordered marker pair in ${page.pathname}`);
  }
  const contentStart = html.indexOf('\n', start + startMarker.length);
  if (contentStart === -1 || contentStart >= end) {
    throw new Error(`Cannot inject resume modal: malformed marker lines in ${page.pathname}`);
  }
  replacements.push({ page, html, contentStart: contentStart + 1, end });
}

for (const { page, html, contentStart, end } of replacements) {
  await writeFile(page, html.slice(0, contentStart) + source + html.slice(end));
}
