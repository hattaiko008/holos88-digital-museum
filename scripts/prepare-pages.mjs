import {cp, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';

const rawBase = process.env.BASE_PATH ?? '';
const base = rawBase === '/' ? '' : `/${rawBase.replace(/^\/+|\/+$/g, '')}`;
const projectRoot = path.resolve(import.meta.dirname, '..');
const sourceRoot = path.join(projectRoot, 'dist');
const root = path.join(projectRoot, '.pages-dist');
const textExtensions = new Set(['.html', '.css', '.js', '.json', '.svg']);

await rm(root, {recursive: true, force: true});
await cp(sourceRoot, root, {recursive: true});

async function visit(directory) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(target);
      continue;
    }
    if (!textExtensions.has(path.extname(entry.name))) continue;

    const source = await readFile(target, 'utf8');
    const prepared = source
      .replace(/\b(href|src|action)=(["'])\/(?!\/)/g, `$1=$2${base}/`)
      .replace(/(["'])\/(?=(?:articles|objects|stories|assets|studies)(?:\/|[?#]))/g, `$1${base}/`)
      .replace(/(["'])\/(?=[?#])/g, `$1${base}/`);
    if (prepared !== source) await writeFile(target, prepared);
  }
}

await visit(root);
await writeFile(path.join(root, '.nojekyll'), '');
console.log(base
  ? `Prepared GitHub Pages build for ${base}/`
  : 'Prepared GitHub Pages build at the site root.');
