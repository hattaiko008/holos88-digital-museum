// Private preparation and approval validation. This module never sends or schedules.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export const digest = packet => sha256(JSON.stringify(packet));
export function sharedSource(raw) {
  const url = new URL(raw);
  if (url.protocol !== 'https:' || url.username || url.password || !['x.com','twitter.com','www.instagram.com','instagram.com'].includes(url.hostname)) throw Error('Only shared X/Instagram HTTPS URLs are accepted');
  const valid = /^(x.com|twitter.com)$/.test(url.hostname) ? /^\/[^/]+\/status\/\d+\/?$/.test(url.pathname) : /^\/(p|reel)\/[-\w]+\/?$/.test(url.pathname);
  if (!valid) throw Error('Share a specific post URL');
  url.search=''; url.hash='';
  return url.href.replace(/\/$/,'');
}
export function validateRelease(packet, records, now=Date.now()) {
  const reasons=[], hash=digest(packet);
  try {
    const policy=JSON.parse(readFileSync(new URL('../content/production/editorial-v1.json',import.meta.url),'utf8'));
    if(policy.schemaVersion!==1||!policy.holds)throw Error('invalid hold policy');
    if(policy.holds[packet.articleId])reasons.push('Current editorial hold: '+policy.holds[packet.articleId].reason);
  } catch {reasons.push('Current editorial hold policy unavailable');}
  const cfo=records?.cfo, echo=records?.echo, checks=records?.checks;
  if (!cfo || cfo.actor!=='CHATO CFO' || cfo.decision!=='approved' || cfo.packetSha256!==hash || !cfo.evidenceRef) reasons.push('Original CHATO CFO approval of this packet required');
  if (!echo || echo.actor!=='ECHO' || echo.decision!=='approved' || echo.packetSha256!==hash || !echo.evidenceRef || !echo.exactUserText) reasons.push('Explicit ECHO approval of exact article, text, assets, account and time required');
  if (packet.medium!=='threads' || packet.account!=='@holos88_hachico') reasons.push('Unsupported medium/account');
  if (packet.timezone!=='Asia/Tokyo' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+09:00$/.test(packet.publishAt||'') || !Number.isFinite(Date.parse(packet.publishAt)) || Date.parse(packet.publishAt)<=now) reasons.push('Future explicit JST time required');
  else if(new Date(Date.parse(packet.publishAt)+9*3600000).toISOString().slice(0,19)!==packet.publishAt.slice(0,19)) reasons.push('Invalid calendar date');
  if (!packet.text || Array.from(packet.text).length>500) reasons.push('Threads text missing or over 500 code points');
  for (const key of ['liveArticle','rights','paidBoundary','liveDuplicateCheck','currentHoldReview','accountMatch']) {
    const c=checks?.[key];
    if (!c || c.passed!==true || c.packetSha256!==hash || !c.evidenceRef || !Number.isFinite(Date.parse(c.checkedAt)) || now-Date.parse(c.checkedAt)>86400000 || Date.parse(c.checkedAt)>now) reasons.push('Current evidence required: '+key);
  }
  return {ready:reasons.length===0,packetSha256:hash,reasons,scheduled:false,published:false};
}
export function followrPlan(packet, records, now) {
  const gate=validateRelease(packet, records, now);
  // Preview ONLY. No API token, company ID or live mutation in this implementation.
  return {...gate, mode:'dry-run-only', request:gate.ready ? {draft:false,auto_publish:true,publish_at:packet.publishAt}:null};
}
