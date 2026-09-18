import assert from 'node:assert/strict';
import {orbitPositions} from '../dist/studies/01/orbit-geometry.js';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
const a=JSON.parse(await read('content/articles.json')).articles[0];
const plan=JSON.parse(await read('content/studies/reading-01.json'));
assert.equal(plan.groups.flat().map(i=>a.body[i].text).join(''),a.body.slice(0,12).map(b=>b.text).join(''));
const overlap=(a,b)=>Math.abs(a.x-b.x)<a.w/2+b.w/2&&Math.abs(a.y-b.y)<a.h/2+b.h/2;
for(const [w,h,nw,nh,l] of [[354,660,80,110,140],[1040,650,140,160,250]]){
 for(let t=0;t<10000;t+=.5){
  const p=orbitPositions(w,h,t).map(x=>({...x,w:nw,h:nh}));
  for(const item of p){assert(item.x-nw/2>=0&&item.x+nw/2<=w&&item.y-nh/2>=0&&item.y+nh/2<=h);assert(!overlap(item,{x:w/2,y:h/2,w:l,h:l}),'logo collision');}
  for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)assert(!overlap(p[i],p[j]),'plate collision');
 }
}
const html=await read('dist/studies/01/index.html');
assert(html.includes('study-credits'));assert.equal((html.match(/data-orbit-item=/g)||[]).length,3);
for(const media of JSON.parse(await read('content/studies/orbit-01.json')))assert(media.rights==='Public Domain'&&media.source_url&&media.institution&&media.date&&media.creator);
console.log('PASS study01: original text preserved, rights metadata, 20,000 sampled orbit positions per viewport without collisions/overflow.');
