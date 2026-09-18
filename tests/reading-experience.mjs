import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createCoverState} from '../dist/cover-state.js';
const root=new URL('../',import.meta.url);
const d=JSON.parse(await readFile(new URL('content/articles.json',root),'utf8'));
for(const a of d.articles.filter(a=>a.master)){
 const raw=await readFile(new URL(a.master.path,root),'utf8');
 assert.equal(createHash('sha256').update(raw).digest('hex'),a.master.sha256);
 const expected=raw.split(/\r?\n/).slice(a.master.body_start_line-1,a.master.body_end_line).filter(x=>x&&x!=='SOURCE WINDOW');
 const actual=a.body.flatMap(b=>b.type==='source'?[a.sources.find(s=>s.id===b.source_id).summary]:b.type==='flow'?b.items:b.type==='break'?[]:[b.text]);
 assert.deepEqual(actual,expected,'Publication master text and paragraph order: '+a.id);
 const html=await readFile(new URL('dist'+a.route,root),'utf8');
 for(const b of a.body.filter(b=>b.emphasis==='strong'))assert(html.includes(`<strong>${b.text}</strong>`));
 assert.equal((html.match(/class="source-window"/g)||[]).length,a.sources.length);
 assert.equal((html.match(/class="flow-insert"/g)||[]).length,a.body.filter(b=>b.type==='flow').length);
 assert(a.sources.every(s=>s.url===null&&s.verification_status==='pending-source-desk'));
 assert(!html.includes('本文準備中'));
 assert(!html.includes('class="satori-view"'));assert(!html.includes('<audio'));
}
const state=createCoverState(false);const seq=[state.index];for(let i=0;i<6;i++){state.advance();seq.push(state.index);}
assert.deepEqual(seq,[0,1,2,3,4,4,4]);assert.equal(state.automatic,false);
state.select(0);state.advance();assert.equal(state.index,0);assert.equal(state.automatic,false);
const reduced=createCoverState(true);reduced.advance();assert.equal(reduced.index,0);reduced.select(4);reduced.advance();assert.equal(reduced.index,4);
const stopped=createCoverState(false);stopped.stop();stopped.advance();assert.equal(stopped.index,0);
const h=JSON.parse(await readFile(new URL('content/home.json',root),'utf8'));
assert.equal(h.cover.interval_ms,12000);assert.equal(h.cover.scenes.length,5);assert.equal(h.orbit.objects.length,6);
const logo=await readFile(new URL('dist'+h.orbit.logo.src,root));assert.equal(createHash('sha256').update(logo).digest('hex'),h.orbit.logo.sha256);
const home=await readFile(new URL('dist/index.html',root),'utf8');
for(const a of d.articles)assert(home.includes(`href="${a.route}"`));
assert(!/<section[^>]+class="cover-scene[^>]+hidden/.test(home),'Static covers accessible without JS');
assert(!home.includes('autoplay'));
console.log('PASS: exact publication masters, emphasis, source windows, flow maps, optional empty fields, original logo, no-loop cover state, manual/reduced-motion stop, static article links.');

assert(home.includes('<h2>THE ARCHAEOLOGY OF FEAR</h2><p class="cover-subtitle">恐怖の考古学</p>'));
assert(home.indexOf('data-cover data-interval') < home.indexOf('id="article-windows"'));
