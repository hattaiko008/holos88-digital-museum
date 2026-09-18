import {buildCover} from './lib/cover.mjs';
import {loadArticles,articleWindows,buildArticles,collectionArticleLinks} from './lib/articles.mjs';
import { readFile, writeFile, access } from 'node:fs/promises';
import {buildEditorial} from './lib/editorial.mjs';
const data = JSON.parse(await readFile(new URL('./collection.json',import.meta.url),'utf8'));
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const articles=await loadArticles(data);
data.articleLinks=collectionArticleLinks(articles);
const ids = new Set();
for (const o of data.objects) {
  if(ids.has(o.id)) throw new Error('Duplicate object ID');
  ids.add(o.id);
  if(o.image.src) {
    if(!o.image.rights || !o.image.sourceUrl) throw new Error('Missing image rights: '+o.id);
    await access(new URL('./dist/'+o.image.src,import.meta.url));
  }
}
const cards = data.objects.map((o,i)=>`<article class="object-card" data-slug="${escape(o.slug)}"><button class="object-button" data-object="${escape(o.slug)}" aria-label="${escape(o.title)} — 標本プレビュー"><span class="object-image ${o.slug==='moon'?'dark':o.slug==='petroleum'?'contain':''}">${o.image.src?`<img src="${escape(o.image.src)}" alt="${escape(o.image.alt)}" width="800" height="800" ${i>3?'loading="lazy"':''}>`:`<span class="object-placeholder"><span class="placeholder-id">${escape(o.id)}</span><span class="placeholder-name">${escape(o.title)}</span><span class="placeholder-label">IMAGE FORTHCOMING / 画像準備中</span></span>`}</span><span class="object-type">${escape(o.types[0])}</span><span class="object-id">${escape(o.id)}</span><h3>${escape(o.title)}</h3><p class="object-caption">${escape(o.caption)}</p></button></article>`).join('\n');
const filters = ['ALL',...data.exploreBy].map(t=>`<button type="button" data-filter="${t}" aria-pressed="${t==='ALL'}">${t}</button>`).join('');
const route = data.relationshipPreview.map((r,i)=>(i?'<span class="arrow" aria-hidden="true">→</span>':'')+`<button type="button" data-relation="${r.id}" aria-pressed="${i===0}">${escape(r.title)}</button>`).join('');
let html=await readFile(new URL('./home.template.html',import.meta.url),'utf8');
html=html.replace('{{COVER}}',await buildCover(articles)).replace('{{ARTICLE_WINDOWS}}',articleWindows(articles)).replace('{{CARDS}}',cards).replace('{{FILTERS}}',filters).replace('{{PATH}}',route).replace('{{DATA}}',JSON.stringify(data).replace(/</g,'\\u003c'));
// Only the approved Survivor Tree entry gains a destination; HOME styling and data stay intact.
html=html.replace(/<button class="object-button" data-object="survivor-tree"([\s\S]*?)<\/button>/,(_match,body)=>`<a class="object-button" href="/objects/survivor-tree.html"${body.replace(' — 標本プレビュー',' — 収蔵記録')}</a>`);
await writeFile(new URL('./dist/index.html',import.meta.url),html);
console.log(`Built HOME: ${data.objects.length} objects, ${data.objects.filter(o=>o.image.src).length} licensed images.`);
await buildEditorial(data,articles);
await buildArticles(articles);
