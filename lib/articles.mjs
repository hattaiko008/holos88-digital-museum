import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const articleById=(d,id)=>{const a=d.articles.find(a=>a.id===id);if(!a)throw Error('Unknown article '+id);return a;};
const windowName=(d,a)=>d.windows.find(w=>w.id===a.window).label;
const authorName=(d,a)=>a.author_ids.map(id=>d.authors.find(x=>x.id===id).name).join(' / ');
const object=(d,id)=>d.collection.objects.find(o=>o.id===id);
const objectRoute=o=>o.id==='H88-0001'?'/objects/survivor-tree.html':'/?object='+encodeURIComponent(o.slug)+'#collection';
export async function loadArticles(collection){
 const d=JSON.parse(await readFile(new URL('content/articles.json',root),'utf8'));d.collection=collection;
 for(const group of [d.articles,d.authors,d.windows])if(new Set(group.map(x=>x.id)).size!==group.length)throw Error('Duplicate article system ID');
 if(new Set(d.articles.map(a=>a.route)).size!==d.articles.length)throw Error('Duplicate article route');
 for(const a of d.articles){
  if(!d.windows.some(w=>w.id===a.window)||a.author_ids.some(id=>!d.authors.some(x=>x.id===id)))throw Error('Unknown window/author');
  if(!/^\/(articles|stories)\/[a-z0-9-]+\.html$/.test(a.route))throw Error('Invalid route');
  if(a.accent_color&&!/^#[0-9a-f]{6}$/i.test(a.accent_color))throw Error('Invalid accent');
  [...a.related_stories,...a.related_specimens].forEach(x=>articleById(d,x.id));
  a.related_collections.forEach(x=>{if(!object(d,x.id))throw Error('Unknown collection '+x.id);});
  if(a.body_ref){if(a.body_ref!=='content/specimen-002.json')throw Error('Unsupported body adapter');await access(new URL(a.body_ref,root));}
  for(const s of a.sources)if(!/^https:\/\//.test(s.url))throw Error('Source needs HTTPS URL');
  for(const m of a.images){if(!m.source_url||!m.rights||!m.alt_text||!/^\/assets\/[\w.-]+$/.test(m.src))throw Error('Media needs rights, source, alt and local asset');await access(new URL('dist'+m.src,root));}
 }
 return d;
}
export function byline(d,a){return `<p class="article-byline">${esc(windowName(d,a))} <span>/ ${esc(authorName(d,a))}</span>${a.date?` · <time datetime="${esc(a.date)}">${esc(a.date)}</time>`:''}${a.status==='placeholder'?' · 本文準備中':''}</p>`;}
const articleLink=(d,a)=>`<a href="${esc(a.route)}">${esc(a.title)} <span aria-hidden="true">↗</span></a><small>${esc(windowName(d,a))} / ${esc(authorName(d,a))}${a.status==='placeholder'?' · 本文準備中':''}</small>`;
export function articleWindows(d){return `<section class="article-windows wrap" id="article-windows" aria-labelledby="windows-title"><p class="eyebrow">ARTICLE WINDOWS</p><h2 id="windows-title">三つの窓から、世界へ。</h2><div class="window-entries">${d.articles.map(a=>`<article><p class="eyebrow">${esc(windowName(d,a))}</p><p>${esc(authorName(d,a))}</p><h3><a href="${esc(a.route)}">${esc(a.title)} ↗</a></h3>${a.subtitle?`<p>${esc(a.subtitle)}</p>`:''}${a.status==='placeholder'?'<small>本文準備中 / Sample</small>':'<small>SPECIMEN 002 / 編集草稿</small>'}</article>`).join('')}</div></section>`;}
export function sourceWindow(s){return `<aside class="source-window" aria-label="SOURCE WINDOW"><p class="eyebrow">SOURCE WINDOW</p>${s?`<cite><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.institution||s.name)} — ${esc(s.title)} ↗</a></cite>${s.summary?`<p>${esc(s.summary)}</p>`:''}`:'<p>資料準備中。本文の入稿後に、参照した資料名とリンクを表示します。</p>'}</aside>`;}
export function articleConnections(d,a){return `<section class="article-connections" aria-label="記事から世界へ"><p class="eyebrow">RELATED STORY</p><h2>別の窓へ、寄り道。</h2><div class="connection-stories">${a.related_stories.map(x=>`<div>${articleLink(d,articleById(d,x.id))}<p>${esc(x.reason)}</p></div>`).join('')}</div><p class="eyebrow">INTO THE COLLECTION</p><ul>${a.related_collections.map(x=>`<li><a href="${esc(objectRoute(object(d,x.id)))}">${esc(object(d,x.id).title)} ↗</a><p>${esc(x.reason)}</p></li>`).join('')}${a.related_specimens.map(x=>`<li>${articleLink(d,articleById(d,x.id))}<p>${esc(x.reason)}</p></li>`).join('')}</ul><a href="/#collection">← EXPLORE THE COLLECTION</a></section>`;}
export function collectionArticleLinks(d){return Object.fromEntries(d.collection.objects.map(o=>[o.id,d.articles.filter(a=>a.related_collections.some(x=>x.id===o.id)).map(a=>({title:a.title,route:a.route,window:windowName(d,a),author:authorName(d,a),status:a.status}))]));}
export function objectArticles(d,id){const articles=d.articles.filter(a=>a.related_collections.some(x=>x.id===id));return `<section class="article-connections"><p class="eyebrow">FROM THIS OBJECT</p><h2>この標本から、別の窓へ。</h2>${articles.map(a=>`<p>${articleLink(d,a)}</p>`).join('')}</section>`;}
function renderBlock(a,b){
 if(b.type==='paragraph')return `<p>${esc(b.text)}</p>`;
 if(b.type==='heading')return `<h2>${esc(b.text)}</h2>`;
 if(b.type==='source'){const s=a.sources.find(x=>x.id===b.source_id);if(!s)throw Error('Unknown source block');return sourceWindow(s);}
 if(b.type==='image'){const m=a.images.find(x=>x.id===b.media_id);if(!m)throw Error('Unknown media block');return `<figure><img src="${esc(m.src)}" alt="${esc(m.alt_text)}" loading="lazy"><figcaption>${esc(m.caption)}<br>${esc(m.creator)} / ${esc(m.date)} · <a href="${esc(m.source_url)}">${esc(m.rights)} / Source ↗</a>${m.license?` · <a href="${esc(m.license)}">License ↗</a>`:''}</figcaption></figure>`;}
 throw Error('Unknown article block '+b.type);
}
export async function buildArticles(d){
 const home=await readFile(new URL('home.template.html',root),'utf8');
 const header=home.match(/<header[\s\S]*?<\/header>/)[0].replaceAll('href="#','href="/#');
 const footer=home.match(/<footer[\s\S]*?<\/footer>/)[0].replaceAll('href="#','href="/#').replace('HOME / PROTOTYPE 01','A MUSEUM OF RELATIONSHIPS');
 await mkdir(new URL('dist/articles/',root),{recursive:true});
 for(const a of d.articles.filter(a=>!a.body_ref)){
 const html=`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(a.title)} — HOLOS 88</title><meta name="description" content="${esc(a.subtitle||a.title)}"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/articles.css"></head><body class="article-page window-${esc(a.window)}"${a.accent_color?` style="--article-accent:${esc(a.accent_color)}"`:''}><a class="skip-link" href="#main">本文へ移動</a>${header}<main id="main" class="wrap"><nav class="article-breadcrumb" aria-label="パンくず"><a href="/#article-windows">Article Windows</a> / ${esc(windowName(d,a))}</nav><article><header class="article-opening">${byline(d,a)}<h1>${esc(a.title)}</h1>${a.subtitle?`<p class="article-subtitle">${esc(a.subtitle)}</p>`:''}</header><div class="article-body">${a.status==='placeholder'?'<section class="article-placeholder"><h2>本文準備中</h2><p>この記事の本文は、まだ収蔵されていません。</p><p>タイトルと、資料・標本へつながる入口を展示しています。</p></section>':''}${a.body.map(b=>renderBlock(a,b)).join('')}${a.sources.length?a.sources.map(s=>sourceWindow(s)).join(''):sourceWindow(null)}</div>${articleConnections(d,a)}${a.revision?`<p class="article-revision">更新：${esc(a.revision.date)} · ${esc(a.revision.note)}</p>`:''}</article></main>${footer}</body></html>`;
 await writeFile(new URL('dist'+a.route,root),html);
 }
 console.log('Built Article System: 3 windows / 3 article records (2 placeholder, 1 existing feature).');
}
