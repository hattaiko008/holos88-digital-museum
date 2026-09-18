import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {articleById,entryMedia,mediaCredit,objectRoute} from './articles.mjs';
const root=new URL('../',import.meta.url);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function buildCover(d){
 const h=JSON.parse(await readFile(new URL('content/home.json',root),'utf8'));
 if(h.cover.scenes.length!==5||h.cover.scenes[4].kind!=='orbit')throw Error('Cover must end at scene 05 / Orbit');
 if(h.orbit.objects.length<5||h.orbit.objects.length>8)throw Error('Orbit needs 5–8 objects');
 if(h.orbit.logo){const bytes=await readFile(new URL('dist'+h.orbit.logo.src,root));if(createHash('sha256').update(bytes).digest('hex')!==h.orbit.logo.sha256)throw Error('Original logo was changed');}
 const object=id=>{const o=d.collection.objects.find(o=>o.id===id);if(!o)throw Error('Unknown cover object '+id);return o;};
 const scenes=(await Promise.all(h.cover.scenes.map(async(s,i)=>{
  const number=String(i+1).padStart(2,'0');
  if(s.kind==='orbit')return `<section class="cover-scene scene-orbit" id="cover-${s.id}" aria-labelledby="orbit-title" data-scene="${i}"><div class="orbit-heading"><p class="eyebrow">05 / HOLOS ORBIT</p><h2 id="orbit-title">世界の、どこからでも。</h2><p>ひとつの標本から、Museumへ。</p></div><div class="orbit-field">${h.orbit.logo?`<img class="orbit-original" src="${esc(h.orbit.logo.src)}" alt="${esc(h.orbit.logo.alt_text)}" width="1170" height="1084" loading="lazy">`:'<p class="orbit-original">原本ロゴ準備中</p>'}${h.orbit.objects.map((x,n)=>{const o=object(x.collection_id);return `<a class="orbit-object orbit-object-${n}" href="${esc(objectRoute(o))}"><span class="orbit-index">${String(n+1).padStart(2,'0')}</span><span class="orbit-name">${esc(o.title)}</span><span class="orbit-label">${esc(o.titleJa)} / ${esc(o.id)} ↗</span></a>`;}).join('')}</div><div class="orbit-foot"><p>図版準備中 / 標本名から探索できます。<br><span>Original HOLOS / ECHO</span></p><button type="button" class="orbit-motion" hidden aria-pressed="false">ORBITの動きを止める</button><a href="/#collection">EXPLORE THE COLLECTION ↗</a></div></section>`;
  let a,m,title,label,author,url,note;
  if(s.kind==='article'){
   a=articleById(d,s.article_id);m=entryMedia(d,a);title=s.display_title||a.title;label=d.windows.find(w=>w.id===a.window).label;author=a.author_ids.map(id=>d.authors.find(x=>x.id===id).name).join(' / ');url=a.route;note=a.status==='placeholder'?'本文準備中':a.date;
  }else if(s.kind==='collection'){
   const o=object(s.collection_id);m=entryMedia(d,{entry_media:{collection_id:o.id}});title=o.title;label=s.label;author=o.id;url=objectRoute(o);note=o.caption;
  }else throw Error('Unknown cover kind');
  if(m)await access(new URL('dist'+m.src,root));
  return `<section class="cover-scene scene-${esc(s.id)}" id="cover-${esc(s.id)}" data-scene="${i}" aria-label="${number} / ${esc(label)}"><a class="cover-plane" href="${esc(url)}"><div class="cover-copy"><p class="eyebrow">${number} / ${esc(label)}</p><p class="cover-author">${esc(author)}</p>${a?.display_kicker?`<p class="cover-kicker">${esc(a.display_kicker)}</p>`:''}<h2>${esc(title)}</h2>${(s.display_subtitle||a?.subtitle)?`<p class="cover-subtitle">${esc(s.display_subtitle||a.subtitle)}</p>`:''}<span class="cover-read">${s.kind==='article'?'READ THE STORY':'ENTER THE COLLECTION'} <span aria-hidden="true">↗</span></span><small>${esc(note)}</small></div>${m?`<img class="cover-image" src="${esc(m.src)}" alt="${esc(m.alt_text)}" width="1000" height="1000" ${i===0?'fetchpriority="high"':'loading="lazy"'}>`:'<div class="cover-image">画像準備中</div>'}</a><p class="cover-credit">${mediaCredit(m)}</p></section>`;
 }))).join('');
 return `<section class="cover-apparatus wrap" aria-label="HOLOS 88の表紙" data-cover data-interval="${h.cover.interval_ms}"><div class="cover-label"><span>A NATURAL HISTORY OF NOW.</span><span>A MUSEUM OF RELATIONSHIPS</span></div><div class="cover-scenes">${scenes}</div><div class="cover-controls" hidden><nav aria-label="表紙を選ぶ">${h.cover.scenes.map((s,i)=>`<button type="button" data-cover-select="${i}" aria-controls="cover-${s.id}" aria-label="表紙 ${i+1}：${esc(s.kind==='article'?articleById(d,s.article_id).title:s.label)}">0${i+1}</button>`).join('')}</nav><button type="button" data-cover-pause>自動切替を止める</button><p data-cover-status role="status" aria-live="polite">01 / 05</p></div><a class="cover-to-read" href="#article-windows">READ — 三つの窓から、世界へ。 ↓</a></section>`;
}
