import {buildCover} from './lib/cover.mjs';
import {loadArticles,articleWindows,buildArticles,collectionArticleLinks} from './lib/articles.mjs';
import { readFile, writeFile, access, cp, mkdir, rm, readdir } from 'node:fs/promises';
import {buildEditorial} from './lib/editorial.mjs';
import {buildReconstruction} from './lib/reconstruction.mjs';
const data = JSON.parse(await readFile(new URL('./collection.json',import.meta.url),'utf8'));
await mkdir(new URL('./dist/assets/collection/',import.meta.url),{recursive:true});
await cp(new URL('./content/assets/collection/',import.meta.url),new URL('./dist/assets/collection/',import.meta.url),{recursive:true,force:true});
await mkdir(new URL('./dist/assets/social/',import.meta.url),{recursive:true});
await cp(new URL('./content/assets/social/',import.meta.url),new URL('./dist/assets/social/',import.meta.url),{recursive:true,force:true});
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const articles=await loadArticles(data);
data.articleLinks=collectionArticleLinks(articles);
const ids = new Set();
for (const o of data.objects) {
  if(ids.has(o.id)) throw new Error('Duplicate object ID');
  ids.add(o.id);
  if(o.image.src) {
    if(!o.image.rights || !o.image.sourceUrl) throw new Error('Missing image rights: '+o.id);
    if(!/^https?:\/\//.test(o.image.src)) await access(new URL('./dist/'+o.image.src,import.meta.url));
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
await rm(new URL('./dist/legacy/',import.meta.url),{recursive:true,force:true});
await mkdir(new URL('./dist/legacy/',import.meta.url),{recursive:true});
const legacyHtml=html.replace(/\b(href|src)="(?!\/|#|[a-z]+:)([^"]+)"/gi,'$1="/$2"');
await writeFile(new URL('./dist/legacy/index.html',import.meta.url),legacyHtml);
console.log(`Built HOME: ${data.objects.length} objects, ${data.objects.filter(o=>o.image.src).length} licensed images.`);
await buildEditorial(data,articles);
await buildArticles(articles);
await buildReconstruction();
await rm(new URL('./dist/prototype/',import.meta.url),{recursive:true,force:true});
await mkdir(new URL('./dist/prototype/',import.meta.url),{recursive:true});
const prototypeSource=new URL('./prototype/reconstruction-01/',import.meta.url);
const prototypeTarget=new URL('./dist/prototype/',import.meta.url);
for(const entry of await readdir(prototypeSource)){
  await cp(new URL(entry,prototypeSource),new URL(entry,prototypeTarget),{recursive:true,force:true});
}
await cp(new URL('./content/editorial-status.json',import.meta.url),new URL('./dist/prototype/editorial-status.json',import.meta.url));
const editorialStatus=JSON.parse(await readFile(new URL('./content/editorial-status.json',import.meta.url),'utf8'));
const approvedArticles=new Set(editorialStatus.articles.filter(article=>['approved','published'].includes(article.stage)).map(article=>article.file));
const taxonomy=JSON.parse(await readFile(new URL('./content/article-taxonomy.json',import.meta.url),'utf8'));
const articleDirectory=new URL('./dist/prototype/articles/',import.meta.url);
const worldLabels={life:'LIFE / 暮らしと生命',earth:'EARTH / 地球と自然',human:'HUMAN / 人間と社会',time:'TIME / 時間と記憶',imagination:'IMAGINATION / 思想と表現',making:'MAKING / 手と技術',cosmos:'COSMOS / 天体と未知'};
const fieldLabels={philosophy:'哲学・思想',politics:'政治・権力',history:'歴史・記憶',science:'科学・自然観察',body:'身体・養生',care:'ケア・関係',technology:'技術・メディア',ecology:'環境・土地',arts:'芸術・表現',economy:'経済・暮らし',museum:'博物館・知識',everyday:'暮らし・エッセイ',culture:'文化・社会'};
const taxonomyBlock=(file,data)=>`<nav class="article-taxonomy" aria-label="この記事の世界とテーマ"><p>WORLDS, FIELDS &amp; THREADS / 関係を辿る</p><div class="article-worlds">${data.worlds.map(world=>`<a href="/prototype/worlds.html#world-${world}">${worldLabels[world]}</a>`).join('')}</div><div class="article-fields">${data.fields.map(field=>`<a href="/prototype/worlds.html#field-${field}">${fieldLabels[field]||field}</a>`).join('')}</div><div class="article-tags">${data.tags.map(tag=>`<span>#${escape(tag)}</span>`).join('')}</div></nav>`;
const feedbackBlock=(file,title)=>`<style>.reader-feedback{--feedback-paper:#e5ddd0;--feedback-ink:#1b1a17;--feedback-line:rgba(27,26,23,.35);margin:0;padding:clamp(4rem,8vw,8rem) clamp(1.2rem,6vw,7rem);display:grid;grid-template-columns:minmax(220px,.72fr) minmax(300px,1.28fr);gap:clamp(2rem,7vw,8rem);background:var(--feedback-paper);color:var(--feedback-ink);border-top:1px solid var(--feedback-line);border-bottom:1px solid var(--feedback-line);font-family:Arial,"Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif}.reader-feedback *{box-sizing:border-box}.reader-feedback-intro>p:first-child{margin:0 0 2rem;font:700 9px/1.5 Arial,sans-serif;letter-spacing:.16em}.reader-feedback h2{margin:0 0 2rem;font:400 clamp(2.8rem,5vw,5.8rem)/.9 Didot,"Bodoni 72","Times New Roman",serif;letter-spacing:-.055em}.reader-feedback-intro>p:last-child{max-width:30rem;font:13px/2 "Yu Mincho","Hiragino Mincho ProN",serif}.reader-feedback form{display:grid;gap:1.5rem}.feedback-rating{margin:0;padding:0;border:0}.feedback-rating legend{margin-bottom:.7rem;font:700 9px/1.5 Arial,sans-serif;letter-spacing:.12em}.feedback-rating>div{min-height:105px;padding:1rem 1.4rem;display:flex;align-items:center;gap:.18rem;border:1px solid var(--feedback-line)}.feedback-rating [data-rating]{padding:.15rem;border:0;background:transparent;color:inherit;font:1.85rem/1 serif;cursor:pointer}.feedback-rating [data-rating]:focus-visible{outline:2px solid;outline-offset:3px}.feedback-rating-clear{margin-left:auto;padding:.5rem;border:0;border-bottom:1px solid;background:transparent;color:inherit;font:9px Arial,sans-serif;cursor:pointer}.reader-feedback label>span{display:block;margin-bottom:.7rem;font:700 9px/1.5 Arial,sans-serif;letter-spacing:.12em}.feedback-email input{width:100%;min-height:48px;padding:.8rem 1rem;border:1px solid var(--feedback-line);border-radius:0;background:rgba(255,255,255,.32);color:inherit;font:14px Arial,sans-serif}.feedback-reply-optin{display:flex;gap:.7rem;align-items:flex-start;font:11px/1.7 "Yu Mincho","Hiragino Mincho ProN",serif}.feedback-reply-optin input{margin-top:.3rem}.feedback-reply-note{margin:-.8rem 0 0;font:9px/1.7 Arial,sans-serif;opacity:.66}.reader-feedback textarea{width:100%;resize:vertical;min-height:145px;padding:1rem;border:1px solid var(--feedback-line);border-radius:0;background:rgba(255,255,255,.32);color:inherit;font:14px/1.9 "Yu Mincho","Hiragino Mincho ProN",serif}.feedback-actions{display:grid;grid-template-columns:auto 1fr;gap:1rem;align-items:center}.feedback-actions>button{padding:1rem 1.3rem;border:0;background:#25231f;color:#f4f0e7;font:700 9px Arial,sans-serif;letter-spacing:.13em;cursor:pointer}.feedback-actions small{font:9px/1.7 Arial,sans-serif;opacity:.66}.feedback-status{min-height:1.7em;margin:0;font:11px/1.7 "Yu Mincho","Hiragino Mincho ProN",serif}.feedback-status a{border-bottom:1px solid}.feedback-honeypot{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;opacity:0!important}@media(max-width:760px){.reader-feedback{grid-template-columns:1fr}.feedback-actions{grid-template-columns:1fr}.feedback-actions>button{width:100%}}</style><section class="reader-feedback" data-reader-feedback data-article="${escape(file)}" data-title="${escape(title)}" aria-labelledby="feedback-${escape(file).replace(/[^a-z0-9]+/gi,'-')}"><div class="reader-feedback-intro"><p>LEAVE A SMALL TRACE / 小さな足跡を残す 【任意】</p><h2 id="feedback-${escape(file).replace(/[^a-z0-9]+/gi,'-')}">この記事は、<br>心に残りましたか。</h2><p>回答はすべて任意です。☆だけ、短い感想だけ、次に読みたいテーマだけでも。いただいた声は公開せず、次の編集と展示づくりに活かします。</p></div><form><fieldset class="feedback-rating"><legend>この窓は、いくつ星でしたか。【任意】</legend><div role="radiogroup" aria-label="記事の星評価"><button type="button" role="radio" aria-checked="false" data-rating="1" aria-label="星1つ">☆</button><button type="button" role="radio" aria-checked="false" data-rating="2" aria-label="星2つ">☆</button><button type="button" role="radio" aria-checked="false" data-rating="3" aria-label="星3つ">☆</button><button type="button" role="radio" aria-checked="false" data-rating="4" aria-label="星4つ">☆</button><button type="button" role="radio" aria-checked="false" data-rating="5" aria-label="星5つ">☆</button><button class="feedback-rating-clear" type="button">選択を外す</button></div></fieldset><label><span>ひとこと、感想を残す【任意】</span><textarea name="comment" maxlength="800" rows="5" placeholder="よかったところ、心に残ったこと、少し違うと感じたことなど。"></textarea></label><label><span>次に、もっと読みたいテーマ【任意】</span><textarea name="request" maxlength="300" rows="2" placeholder="人物、時代、身体、社会のこと。気になる言葉だけでも。"></textarea></label><label class="feedback-email"><span>受領メールの送り先【任意】</span><input type="email" name="email" maxlength="254" autocomplete="email" inputmode="email" placeholder="you@example.com"></label><label class="feedback-reply-optin"><input type="checkbox" name="replyRequested" value="yes"><span>この感想への短い受領メールを希望する【任意】</span></label><p class="feedback-reply-note">感想への受領メール専用です。ニュースレター購読には登録されません。</p><input class="feedback-honeypot" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="feedback-actions"><button type="submit">編集部へ送る ↗</button><small>名前・メールアドレスは不要です。送信しない入力内容は、この端末にだけ保存されます。</small></div><p class="feedback-status" role="status" aria-live="polite"></p></form></section><script src="/prototype/feedback.js" defer></script>`;
const insertFeedback=(document,block)=>{
  const anchors=['<section class="reading-trail"','<section class="next"','<nav class="article-taxonomy"','<section class="michikusa"','</main>','</body>'];
  const positions=anchors.map(anchor=>({anchor,index:document.indexOf(anchor)})).filter(item=>item.index>=0).sort((a,b)=>a.index-b.index);
  return positions.length?document.slice(0,positions[0].index)+block+document.slice(positions[0].index):document+block;
};
for(const file of await readdir(articleDirectory)){
  if(!file.endsWith('.html'))continue;
  const target=new URL(file,articleDirectory);
  if(!approvedArticles.has(file)){await rm(target,{force:true});continue;}
  let article=await readFile(target,'utf8');
  article=article.replace(/<p class="preview-label">[^<]*<\/p>/g,'');
  if(taxonomy[file]&&!article.includes('class="article-taxonomy"')){
    const block=taxonomyBlock(file,taxonomy[file]);
    article=article.includes('<section class="michikusa"')?article.replace('<section class="michikusa"',block+'<section class="michikusa"'):article.replace('</main>',block+'</main>');
  }
  if(!article.includes('data-reader-feedback')){
    const title=editorialStatus.articles.find(item=>item.file===file)?.title||file;
    const block=feedbackBlock(file,title);
    article=insertFeedback(article,block);
  }
  await writeFile(target,article);
}
const unpublished=editorialStatus.articles.filter(article=>article.file.endsWith('.html')&&!article.file.startsWith('pages/')&&!approvedArticles.has(article.file)).map(article=>article.file);
const scrubLinks=html=>{
  for(const file of unpublished){
    const safe=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    html=html.replace(new RegExp(`<a\\b(?=[^>]*href="(?:/prototype/articles/|\\.\\./articles/)${safe}(?:[?#][^"]*)?")[^>]*>[\\s\\S]*?<\\/a>`,'g'),'');
    html=html.replace(new RegExp(`\\{[^{}]*href:'(?:/prototype/articles/|\\.\\./articles/)${safe}(?:[?#][^']*)?'[^{}]*\\},?`,'g'),'');
  }
  return html;
};
const scrubDirectory=async directory=>{
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const target=new URL(entry.name+(entry.isDirectory()?'/':''),directory);
    if(entry.isDirectory()){await scrubDirectory(target);continue;}
    if(!entry.name.endsWith('.html'))continue;
    const html=await readFile(target,'utf8');
    await writeFile(target,scrubLinks(html));
  }
};
await scrubDirectory(new URL('./dist/prototype/',import.meta.url));
await scrubDirectory(new URL('./dist/legacy/',import.meta.url));
for(const entry of await readdir(new URL('./dist/',import.meta.url))){
  if(/^index \d+\.html$/.test(entry))await rm(new URL('./dist/'+entry,import.meta.url),{force:true});
}
const publicArticles=editorialStatus.articles.filter(article=>['approved','published'].includes(article.stage)&&taxonomy[article.file]);
const articleRoute=file=>file.startsWith('pages/')?'/prototype/'+file.split('/').pop():'/prototype/articles/'+file;
const worldsHtml=Object.entries(worldLabels).map(([world,label],index)=>{
  const items=publicArticles.filter(article=>taxonomy[article.file].worlds.includes(world));
  return `<section class="world" id="world-${world}"><header><p>${String(index+1).padStart(2,'0')} / WORLD</p><h2>${label.split(' / ')[0]}</h2><span>${label.split(' / ')[1]} · ${items.length} WINDOWS</span></header><div class="world-grid">${items.map(article=>{const data=taxonomy[article.file];return `<a class="world-card" data-fields="${data.fields.join(' ')}" href="${articleRoute(article.file)}"><small>${data.fields.map(field=>fieldLabels[field]||field).join(' · ')}</small><strong>${escape(article.title)}</strong><em>${data.tags.map(tag=>'#'+escape(tag)).join(' ')}</em><span>OPEN WINDOW ↗</span></a>`}).join('')}</div></section>`;
}).join('');
const fieldNav='<button type="button" data-field="all" aria-pressed="true">すべて</button>'+Object.entries(fieldLabels).map(([id,label])=>`<button id="field-${id}" type="button" data-field="${id}" aria-pressed="false">${label}</button>`).join('');
const worldsPage=`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WORLDS TO ENTER — HOLOS 88</title><meta name="description" content="HOLOS 88の公開記事を、世界・分野・小さなテーマから辿る入口。"><link rel="stylesheet" href="/prototype/prototype.css"><style>body{background:#ece7dc}.worlds-hero{min-height:70vh;padding:8vh 3vw;border-bottom:1px solid;display:grid;grid-template-columns:.7fr 1.3fr;align-items:end}.worlds-hero h1{margin:0;font:400 clamp(5rem,14vw,15rem)/.72 var(--serif);letter-spacing:-.075em}.worlds-hero p{max-width:35rem;font:1rem/2 var(--jp)}.field-nav{padding:2rem 3vw;display:flex;flex-wrap:wrap;gap:.55rem;border-bottom:1px solid}.field-nav button{padding:.65rem;border:1px solid;background:transparent;font:9px var(--sans);letter-spacing:.1em}.field-nav button[aria-pressed="true"]{background:#171714;color:#fff}.world{padding:7rem 3vw;border-bottom:1px solid;scroll-margin-top:1rem}.world header{display:grid;grid-template-columns:.35fr 1.3fr .65fr;align-items:end}.world h2{margin:0;font:400 clamp(4rem,10vw,10rem)/.75 var(--serif);letter-spacing:-.065em}.world header p,.world header span{font:9px var(--sans);letter-spacing:.13em}.world-grid{display:grid;grid-template-columns:repeat(3,1fr);margin-top:3rem;border-top:1px solid;border-left:1px solid}.world-card{min-height:310px;padding:1.35rem;border-right:1px solid;border-bottom:1px solid;display:flex;flex-direction:column}.world-card[hidden]{display:none}.world-card small{font:8px/1.6 var(--sans);letter-spacing:.1em}.world-card strong{margin:auto 0 1.2rem;font:1.45rem/1.45 var(--jp)}.world-card em{font:9px/1.8 var(--sans);font-style:normal;color:#6d3e43}.world-card span{margin-top:1.5rem;font:8px var(--sans);letter-spacing:.12em}@media(max-width:760px){.worlds-hero,.world header{grid-template-columns:1fr}.worlds-hero{gap:2rem}.world-grid{grid-template-columns:1fr}.world{padding:5rem 1rem}.world header span{margin-top:1rem}}</style></head><body><header class="site-head"><a class="wordmark" href="/prototype/index.html"><span>HOLOS</span><sup>88</sup></a><nav><a href="/prototype/index.html#read">READ</a><a href="/prototype/index.html#museum">MUSEUM</a></nav><a class="close-page" href="/prototype/index.html#categories-title">CLOSE ×</a></header><main><section class="worlds-hero"><div><p class="eyebrow">EXPLORE BY RELATIONSHIP</p><h1>WORLDS<br>TO ENTER</h1></div><p>大きな世界から、分野へ。分野から、小さなテーマへ。ひとつの記事を読み終えたら、同じ棚に戻らず、隣の世界へ歩いてみてください。</p></section><nav class="field-nav" aria-label="中分類から探す">${fieldNav}</nav>${worldsHtml}</main><script>(()=>{const buttons=[...document.querySelectorAll('[data-field]')],cards=[...document.querySelectorAll('.world-card')];buttons.forEach(button=>button.addEventListener('click',()=>{const field=button.dataset.field;buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));cards.forEach(card=>card.hidden=field!=='all'&&!card.dataset.fields.split(' ').includes(field));document.querySelectorAll('.world').forEach(world=>world.hidden=![...world.querySelectorAll('.world-card')].some(card=>!card.hidden))}))})();</script></body></html>`;
await writeFile(new URL('./dist/prototype/worlds.html',import.meta.url),worldsPage);
// Keep editorial tooling and unfinished standalone previews out of the public artifact.
const publicStandalone=new Set([
  'index.html','worlds.html','collection.html','contact.html','privacy.html','terms.html','legal-commercial.html',
  'watch-the-now-2026-09-26.html',
  'prototype.css','legal.css','reading-trail.js','feedback.js',
  ...[...approvedArticles].filter(file=>file.startsWith('pages/')).map(file=>file.split('/').pop())
]);
for(const entry of await readdir(prototypeTarget,{withFileTypes:true})){
  if(entry.isFile()&&!publicStandalone.has(entry.name))await rm(new URL(entry.name,prototypeTarget),{force:true});
}
await rm(new URL('./dist/prototype/life-specimen/',import.meta.url),{recursive:true,force:true});
for(const article of editorialStatus.articles.filter(item=>['approved','published'].includes(item.stage)&&item.file.startsWith('pages/'))){
  const file=article.file.split('/').pop(),target=new URL(file,prototypeTarget);
  let document=await readFile(target,'utf8');
  if(!document.includes('data-reader-feedback')){
    const block=feedbackBlock(article.file,article.title);
    document=insertFeedback(document,block);
    await writeFile(target,document);
  }
}

const siteOrigin='https://holos88.com';
const addPublicMeta=(document,urlPath)=>{
  const canonical=siteOrigin+urlPath;
  let output=document.replace(/<meta name="robots" content="[^"]*">/g,'');
  const title=escape(output.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g,' ').trim()||'HOLOS 88 — A MUSEUM OF RELATIONSHIPS');
  const description=escape(output.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1]||'読む。収蔵する。関係を辿る。HOLOS 88は、世界を急いで通り過ぎないためのデジタル・ミュージアムです。');
  const image=`${siteOrigin}/assets/social/holos88-og.png`;
  const type=urlPath.includes('/articles/')?'article':'website';
  const tags=[];
  if(!output.includes('rel="canonical"'))tags.push(`<link rel="canonical" href="${canonical}">`);
  if(!output.includes('rel="icon"'))tags.push('<link rel="icon" href="/assets/social/favicon.svg" type="image/svg+xml">');
  if(!output.includes('rel="apple-touch-icon"'))tags.push('<link rel="apple-touch-icon" href="/assets/social/apple-touch-icon.png">');
  if(!output.includes('rel="manifest"'))tags.push('<link rel="manifest" href="/site.webmanifest">');
  if(!output.includes('property="og:title"'))tags.push(`<meta property="og:title" content="${title}">`);
  if(!output.includes('property="og:description"'))tags.push(`<meta property="og:description" content="${description}">`);
  if(!output.includes('property="og:url"'))tags.push(`<meta property="og:url" content="${canonical}">`);
  if(!output.includes('property="og:site_name"'))tags.push('<meta property="og:site_name" content="HOLOS 88">');
  if(!output.includes('property="og:type"'))tags.push(`<meta property="og:type" content="${type}">`);
  if(!output.includes('property="og:image"'))tags.push(`<meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="HOLOS 88 — A Museum of Relationships">`);
  if(!output.includes('name="twitter:card"'))tags.push('<meta name="twitter:card" content="summary_large_image">');
  if(!output.includes('name="twitter:title"'))tags.push(`<meta name="twitter:title" content="${title}">`);
  if(!output.includes('name="twitter:description"'))tags.push(`<meta name="twitter:description" content="${description}">`);
  if(!output.includes('name="twitter:image"'))tags.push(`<meta name="twitter:image" content="${image}">`);
  if(tags.length)output=output.replace('</head>',tags.join('')+'</head>');
  return output;
};
const publicHtml=[];
const decoratePublicHtml=async(directory,pathPrefix)=>{
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const path=pathPrefix+entry.name;
    const target=new URL(entry.name+(entry.isDirectory()?'/':''),directory);
    if(entry.isDirectory()){await decoratePublicHtml(target,path+'/');continue;}
    if(!entry.name.endsWith('.html'))continue;
    let document=await readFile(target,'utf8');
    document=addPublicMeta(document,path);
    await writeFile(target,document);
    publicHtml.push(path);
  }
};
const englishTarget=new URL('./dist/en/',import.meta.url);
await rm(englishTarget,{recursive:true,force:true});
await cp(new URL('./prototype/reconstruction-01/en/',import.meta.url),englishTarget,{recursive:true,force:true});
await rm(new URL('./dist/prototype/en/',import.meta.url),{recursive:true,force:true});
await decoratePublicHtml(prototypeTarget,'/prototype/');
await decoratePublicHtml(englishTarget,'/en/');

const notFound=`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ページが見つかりません — HOLOS 88</title><meta name="robots" content="noindex"><style>body{margin:0;background:#ece7dc;color:#171714;font-family:serif}.wrap{min-height:100vh;display:grid;place-content:center;padding:2rem}.code{font-size:clamp(6rem,24vw,18rem);line-height:.7;letter-spacing:-.08em}.copy{max-width:34rem;font-size:1rem;line-height:2}.links{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:2rem}.links a{color:inherit;border:1px solid;padding:.8rem 1rem;text-decoration:none}</style></head><body><main class="wrap"><p>LOST BETWEEN THE WINDOWS</p><div class="code">404</div><p class="copy">この窓は、移動したか、まだ公開されていません。入口へ戻るか、別の世界を歩いてみてください。</p><nav class="links"><a href="/">HOMEへ</a><a href="/prototype/worlds.html">WORLDS TO ENTERへ</a></nav></main></body></html>`;
await writeFile(new URL('./dist/404.html',import.meta.url),notFound);
await writeFile(new URL('./dist/robots.txt',import.meta.url),`User-agent: *\nAllow: /\nDisallow: /prototype/editor-desk\nDisallow: /prototype/publication-preview.html\nSitemap: ${siteOrigin}/sitemap.xml\n`);
const sitemapPaths=[...new Set(['/',...publicHtml.map(path=>path==='/en/index.html'?'/en/':path).filter(path=>!path.endsWith('/index.html')).sort()])];
const lastmod=new Date().toISOString().slice(0,10);
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths.map(path=>`  <url><loc>${siteOrigin}${path}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
await writeFile(new URL('./dist/sitemap.xml',import.meta.url),sitemap);
await writeFile(new URL('./dist/site.webmanifest',import.meta.url),JSON.stringify({name:'HOLOS 88 — A Museum of Relationships',short_name:'HOLOS 88',start_url:'/',display:'standalone',background_color:'#f1ede3',theme_color:'#162328',icons:[{src:'/assets/social/apple-touch-icon.png',sizes:'512x512',type:'image/png'}]},null,2));
await cp(new URL('./dist/prototype/index.html',import.meta.url),new URL('./dist/index.html',import.meta.url));
const rootHome=await readFile(new URL('./dist/index.html',import.meta.url),'utf8');
await writeFile(new URL('./dist/index.html',import.meta.url),rootHome.replaceAll(`${siteOrigin}/prototype/index.html`,`${siteOrigin}/`));
console.log('Built reconstruction as the public HOME and preserved the legacy HOME at /legacy/.');
