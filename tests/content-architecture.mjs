// Integration checks for generated navigation and preservation of the approved collection.
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {loadArticles,collectionArticleLinks} from '../lib/articles.mjs';
const root=new URL('../',import.meta.url),dist=new URL('dist/',root);
const collection=JSON.parse(await readFile(new URL('collection.json',root),'utf8'));
const d=await loadArticles(collection),reverse=collectionArticleLinks(d);
for(const a of d.articles){
 const html=await readFile(new URL('dist'+a.route,root),'utf8');
 assert(html.includes('SOURCE WINDOW'));
 for(const r of a.related_stories)assert(html.includes(`href="${d.articles.find(a=>a.id===r.id).route}"`));
 for(const r of a.related_collections)assert(reverse[r.id].some(x=>x.route===a.route));
 if(a.status==='placeholder'){assert.equal(a.body.length,0);assert.equal(a.date,null);assert(html.includes('本文準備中'));}
}
assert.equal(d.authors.filter(a=>a.name==='ECHO').length,1);
const pages=[];
async function walk(dir){for(const n of await readdir(dir)){const u=new URL(n,dir);if((await stat(u)).isDirectory())await walk(new URL(n+'/',dir));else if(n.endsWith('.html'))pages.push(u);}}
await walk(dist);
let refs=0;
for(const p of pages){
 const html=await readFile(p,'utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const link=m[1].replaceAll('&amp;','&');if(/^(https?:|data:)/.test(link))continue;
  const target=new URL(link,'http://local/'+p.pathname.slice(dist.pathname.length));
  const path=target.pathname==='/'?'index.html':target.pathname.slice(1);const file=new URL(path,dist);await stat(file);
  if(target.hash){const dest=await readFile(file,'utf8');assert(dest.includes(`id="${target.hash.slice(1)}"`),link);}
  if(target.searchParams.has('object'))assert(collection.objects.some(o=>o.slug===target.searchParams.get('object')));
  refs++;
 }
}
const git=process.env.HOLOS_GIT||'git';
for(const f of ['dist/styles.css','dist/editorial.css','collection.json','content/specimen-002.json'])assert.equal(await readFile(new URL(f,root),'utf8'),execFileSync(git,['show','43c1e30:'+f],{cwd:root,encoding:'utf8'}));
const before=execFileSync(git,['show','43c1e30:home.template.html'],{cwd:root,encoding:'utf8'});
const after=(await readFile(new URL('home.template.html',root),'utf8')).replace('<link rel="stylesheet" href="articles.css">','').replace('  {{ARTICLE_WINDOWS}}\n','');assert.equal(after,before);
console.log(`PASS: ${pages.length} pages, ${refs} internal references, bidirectional article links, unique author, placeholders and baseline preservation.`);
