import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const articleById=(d,id)=>{const a=d.articles.find(a=>a.id===id);if(!a)throw Error('Unknown article '+id);return a;};
const windowName=(d,a)=>d.windows.find(w=>w.id===a.window).label;
const authorName=(d,a)=>a.author_ids.map(id=>d.authors.find(x=>x.id===id).name).join(' / ');
const object=(d,id)=>d.collection.objects.find(o=>o.id===id);
export const objectRoute=o=>o.id==='H88-0001'?'/objects/survivor-tree.html':'/?object='+encodeURIComponent(o.slug)+'#collection';
export async function loadArticles(collection){
 const d=JSON.parse(await readFile(new URL('content/articles.json',root),'utf8'));d.collection=collection;
 d.feature=JSON.parse(await readFile(new URL('content/specimen-002.json',root),'utf8'));
 for(const group of [d.articles,d.authors,d.windows])if(new Set(group.map(x=>x.id)).size!==group.length)throw Error('Duplicate article system ID');
 if(new Set(d.articles.map(a=>a.route)).size!==d.articles.length)throw Error('Duplicate article route');
 for(const a of d.articles){
  if(!d.windows.some(w=>w.id===a.window)||a.author_ids.some(id=>!d.authors.some(x=>x.id===id)))throw Error('Unknown window/author');
  if(!/^\/(articles|stories)\/[a-z0-9-]+\.html$/.test(a.route))throw Error('Invalid route');
  if(a.accent_color&&!/^#[0-9a-f]{6}$/i.test(a.accent_color))throw Error('Invalid accent');
  [...a.related_stories,...a.related_specimens].forEach(x=>articleById(d,x.id));
  a.related_collections.forEach(x=>{if(!object(d,x.id))throw Error('Unknown collection '+x.id);});
  if(a.body_ref){if(a.body_ref!=='content/specimen-002.json')throw Error('Unsupported body adapter');await access(new URL(a.body_ref,root));}
  for(const s of a.sources)if(s.url ? !/^https:\/\//.test(s.url) : s.verification_status!=='pending-source-desk')throw Error('Source needs HTTPS URL or explicit pending status');
  for(const m of a.images){if(!m.source_url||!m.rights||!m.alt_text||!/^\/assets\/[\w.-]+$/.test(m.src))throw Error('Media needs rights, source, alt and local asset');await access(new URL('dist'+m.src,root));}
 }
 return d;
}
export function byline(d,a){return `<p class="article-byline">${esc(windowName(d,a))} <span>${esc(a.byline||('WRITTEN BY '+authorName(d,a)))}</span>${a.date?` · <time datetime="${esc(a.date)}">${esc(a.date_label||a.date)}</time>`:''}${a.status==='placeholder'?' · 本文準備中':''}</p>`;}
const articleLink=(d,a)=>`<a href="${esc(a.route)}">${esc(a.title)} <span aria-hidden="true">↗</span></a><small>${esc(windowName(d,a))} / ${esc(authorName(d,a))}${a.status==='placeholder'?' · 本文準備中':''}</small>`;
export function entryMedia(d,a){
 const ref=a.entry_media;if(!ref)return null;
 if(ref.feature_media_id){const m=d.feature.media.find(m=>m.id===ref.feature_media_id);if(!m)throw Error('Unknown feature media');return m;}
 const o=object(d,ref.collection_id);if(!o)throw Error('Unknown entry media');const m=o.image;
 return m.src?{src:'/'+m.src,alt_text:m.alt,creator:m.creator,title:m.title,date:m.date,source_url:m.sourceUrl,rights:m.rights,license:m.licenseUrl,caption:ref.caption||`収蔵資料：${o.title}${ref.role==='collection-preview'?' ／ 記事用画像は選定中':''}`} : null;
}
export const mediaCredit=m=>m?`<span>${esc(m.caption||m.title)}</span><span>${esc(m.creator)} / ${esc(m.date)} · <a href="${esc(m.source_url)}">Source</a>${m.license?` · <a href="${esc(m.license)}">${esc(m.rights)}</a>`:''}</span>`:'';
export function articleWindows(d){return `<section class="article-windows wrap" id="article-windows" aria-labelledby="windows-title"><div class="read-heading"><p class="eyebrow">READ / ARTICLE WINDOWS</p><h2 id="windows-title">三つの窓から、世界へ。</h2></div><div class="window-entries">${d.articles.map((a,i)=>{const m=entryMedia(d,a);return `<article class="window-entry entry-${a.window}"><a class="window-plane" href="${esc(a.route)}"><span class="entry-number" aria-hidden="true">0${i+1}</span>${m?`<img src="${esc(m.src)}" alt="${esc(m.alt_text)}" loading="lazy" width="800" height="600">`:''}<div class="entry-copy"><p class="eyebrow">${esc(windowName(d,a))} / ${esc(authorName(d,a))}</p>${a.display_kicker?`<p class="entry-display">${esc(a.display_kicker)}</p>`:''}<h3>${esc(a.title)}</h3>${a.subtitle?`<p>${esc(a.subtitle)}</p>`:''}<small>${a.status==='placeholder'?'本文準備中':a.body_ref?'SPECIMEN 002':'READ THE STORY'} <span aria-hidden="true">↗</span></small></div></a>${m?`<p class="entry-credit">${mediaCredit(m)}</p>`:''}</article>`;}).join('')}</div></section>`;}
export function optionalWindows(a){return a.satori_view?.body?.length?`<aside class="satori-view"><p class="eyebrow">SATORI’S VIEW</p>${a.satori_view.body.map(b=>{if(b.type!=='paragraph')throw Error('Unsupported Satori block');return `<p>${esc(b.text)}</p>`;}).join('')}</aside>`:'';}
export function sourceWindow(s){return `<aside class="source-window" aria-label="SOURCE WINDOW"><p class="eyebrow">SOURCE WINDOW</p>${s?`${s.url?`<cite><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.institution||s.name)} — ${esc(s.title)} ↗</a></cite>`:''}${s.summary?`<p class="source-summary">${esc(s.summary)}</p>`:''}${s.verification_status==='pending-source-desk'?'<small class="source-pending">SOURCE DESK / 出典確認中</small>':''}`:'<p>資料準備中。本文の入稿後に、参照した資料名とリンクを表示します。</p>'}</aside>`;}
function relatedDoor(d,a){const m=entryMedia(d,a);return `<a class="related-door" href="${esc(a.route)}">${m?`<img src="${esc(m.src)}" alt="${esc(m.alt_text)}" width="180" height="140" loading="lazy">`:''}<span>${esc(a.title)}<small>${esc(windowName(d,a))} / ${esc(authorName(d,a))}${a.status==='placeholder'?' · 本文準備中':''}</small></span><span aria-hidden="true">↗</span></a>${m?`<p class="entry-credit">${mediaCredit(m)}</p>`:''}`;}
export function articleConnections(d,a){return `<section class="article-connections" aria-label="記事から世界へ"><p class="eyebrow">RELATED STORY</p><h2>別の窓へ、寄り道。</h2><div class="connection-stories">${a.related_stories.map(x=>`<div>${relatedDoor(d,articleById(d,x.id))}<p>${esc(x.reason)}</p></div>`).join('')}</div><p class="eyebrow">INTO THE COLLECTION</p><ul>${a.related_collections.map(x=>`<li><a href="${esc(objectRoute(object(d,x.id)))}">${esc(object(d,x.id).title)} ↗</a><p>${esc(x.reason)}</p></li>`).join('')}${a.related_specimens.map(x=>`<li>${articleLink(d,articleById(d,x.id))}<p>${esc(x.reason)}</p></li>`).join('')}</ul><a href="/#collection">← EXPLORE THE COLLECTION</a></section>`;}
export function collectionArticleLinks(d){return Object.fromEntries(d.collection.objects.map(o=>[o.id,d.articles.filter(a=>a.related_collections.some(x=>x.id===o.id)).map(a=>({title:a.title,route:a.route,window:windowName(d,a),author:authorName(d,a),status:a.status}))]));}
export function objectArticles(d,id){const articles=d.articles.filter(a=>a.related_collections.some(x=>x.id===id));return `<section class="article-connections"><p class="eyebrow">FROM THIS OBJECT</p><h2>この標本から、別の窓へ。</h2>${articles.map(a=>`<p>${articleLink(d,a)}</p>`).join('')}</section>`;}
function renderBlock(a,b){
 if(b.type==='paragraph')return `<p${b.emphasis==='strong'?' class="emphasized-passage"':''}>${b.emphasis==='strong'?`<strong>${esc(b.text)}</strong>`:esc(b.text)}</p>`;
 if(b.type==='break')return '<hr class="reading-break">';
 if(b.type==='display')return `<p class="body-display">${esc(b.text)}</p>`;
 if(b.type==='flow')return `<figure class="flow-insert">${b.caption?`<figcaption>${esc(b.caption)}</figcaption>`:''}<ol>${b.items.map(x=>`<li><strong>${esc(x)}</strong></li>`).join('')}</ol></figure>`;
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
 const m=entryMedia(d,a);
 const html=`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(a.title)} — HOLOS 88</title><meta name="description" content="${esc(a.subtitle||a.title)}"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/articles.css"><link rel="stylesheet" href="/reading.css"></head><body class="article-page window-${esc(a.window)}"${a.accent_color?` style="--article-accent:${esc(a.accent_color)}"`:''}><a class="skip-link" href="#main">本文へ移動</a>${header}<main id="main" class="wrap"><nav class="article-breadcrumb" aria-label="パンくず"><a href="/#article-windows">Article Windows</a> / ${esc(windowName(d,a))}</nav><article><header class="article-opening">${byline(d,a)}${a.display_kicker?`<p class="article-display">${esc(a.display_kicker)}</p>`:''}<h1>${esc(a.title)}</h1>${a.subtitle?`<p class="article-subtitle">${esc(a.subtitle)}</p>`:''}</header>${m?`<figure class="article-frontispiece"><img src="${esc(m.src)}" alt="${esc(m.alt_text)}" width="1000" height="700"><figcaption>${mediaCredit(m)}</figcaption></figure>`:''}<div class="article-body">${a.status==='placeholder'?'<section class="article-placeholder"><h2>本文準備中</h2><p>この記事の本文は、まだ収蔵されていません。</p><p>タイトルと、資料・標本へつながる入口を展示しています。</p></section>':''}${a.body.map(b=>renderBlock(a,b)).join('')}${a.sources.filter(s=>!a.body.some(b=>b.type==='source'&&b.source_id===s.id)).map(s=>sourceWindow(s)).join('')}${a.closing_credit?.length?`<p class="closing-credit">${a.closing_credit.map(x=>`<strong>${esc(x)}</strong>`).join('<br>')}</p>`:''}</div>${optionalWindows(a)}${articleConnections(d,a)}${a.revision?`<p class="article-revision">更新：${esc(a.revision.date)} · ${esc(a.revision.note)}</p>`:''}</article></main>${footer}</body></html>`;
 await writeFile(new URL('dist'+a.route,root),html);
 }
 console.log(`Built Article System: ${d.windows.length} windows / ${d.articles.length} articles / ${d.articles.filter(a=>a.status==='publication-master').length} publication masters.`);
}
