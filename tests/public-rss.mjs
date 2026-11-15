import assert from 'node:assert/strict';
import {makeRss, selectItems} from '../scripts/generate-public-rss.mjs';

const base={file:'a-question.html',title:'問い & <答え>',series:'MICHIKUSA',stage:'published',updated:'2026-10-20',checks:{text:true,sources:true,visuals:true,layout:true,links:true}};
assert.equal(selectItems([base]).length,1);
assert.equal(selectItems([{...base,stage:'approved'}]).length,0);
assert.equal(selectItems([{...base,series:'LIFE NOTE'}]).length,0);
assert.equal(selectItems([{...base,file:'../secret.html'}]).length,0);
assert.equal(selectItems([{...base,checks:{...base.checks,sources:false}}]).length,0);
const rss=makeRss([base]);
assert.match(rss,/問い &amp; &lt;答え&gt;/);
assert.match(rss,/https:\/\/holos88.com\/prototype\/articles\/a-question.html/);
assert.ok(!rss.includes('<script'));
console.log('RSS safety: seven checks passed');
