import {readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://holos88.com';
const checks = ['text','sources','visuals','layout','links'];
const personal = /hachico|life note|personal essay|from where i/i;

function xml(value) {
  return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
}

export function selectItems(articles) {
  return articles.filter(a =>
    a.stage === 'published' &&
    checks.every(c => a.checks?.[c] === true) &&
    /^[a-z0-9-]+\.html$/.test(a.file ?? '') &&
    !personal.test([a.title,a.series,a.location].join(' '))
  );
}

export function makeRss(articles) {
  const items = selectItems(articles).slice().sort((a,b) =>
    String(b.updated ?? '').localeCompare(String(a.updated ?? ''))).slice(0,24);
  const body = items.map(a => {
    const link = BASE + '/prototype/articles/' + a.file;
    const updated = /^\d{4}-\d{2}-\d{2}/.test(a.updated ?? '') ?
      '<pubDate>' + new Date(a.updated.slice(0,10) + 'T00:00:00+09:00').toUTCString() + '</pubDate>' : '';
    return '    <item><title>' + xml(a.title) + '</title><link>' + xml(link) +
      '</link><guid isPermaLink="true">' + xml(link) + '</guid>' + updated +
      '<description>' + xml('HOLOS 88｜' + (a.series || 'Digital Museum')) +
      '</description></item>';
  }).join('\n');
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0"><channel><title>HOLOS 88｜Digital Museum</title>\n' +
    '<link>' + BASE + '/</link>\n' +
    '<description>確認済みの公開記事。個人エッセイと未承認作品は含めません。</description>\n' +
    '<language>ja</language>\n' + body + '\n</channel></rss>\n';
}

export async function writeRss(root) {
  const data = JSON.parse(await readFile(path.join(root,'content/editorial-status.json'),'utf8'));
  const dist = path.join(root,'.pages-dist');
  const viable = [];
  for (const article of selectItems(data.articles)) {
    const file = path.join(dist,'prototype/articles',article.file);
    try {
      if (!(await stat(file)).isFile()) continue;
      const html = await readFile(file,'utf8');
      if (!html.includes(BASE + '/prototype/articles/' + article.file)) continue;
      viable.push(article);
    } catch { continue; }
  }
  await writeFile(path.join(dist,'feed.xml'), makeRss(viable), 'utf8');
  console.log('HOLOS public RSS prepared from ' + viable.length + ' published archive entries');
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  await writeRss(path.resolve(process.cwd()));
}
