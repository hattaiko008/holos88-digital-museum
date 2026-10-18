// Derived work state only. No public build, API credentials, publishing or scheduling adapter.
import {createHash} from 'node:crypto';
export const hash = x => createHash('sha256').update(x).digest('hex');
export const fingerprint = x => hash(JSON.stringify(x));
export const escape = x => String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function dateJST(now=new Date()) {
  const d=new Date(now);if(!Number.isFinite(+d)) throw Error('Invalid instant');
  return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
}
export function addDays(day,n){return new Date(Date.parse(day+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);}
export function validDay(day){return /^\d{4}-\d{2}-\d{2}$/.test(day)&&addDays(day,0)===day;}
export function planFixed(day,policy){
  if(!validDay(day))throw Error('Invalid target date');
  const jobs=['DAILY ALMANAC','C','T'].map(kind=>({line:'fixed',kind,targetDate:day}));
  const weekday=new Date(day+'T00:00:00Z').getUTCDay();
  const weekly=addDays(day,(policy.weeklyDay-weekday+7)%7);
  jobs.push({line:'fixed',kind:'WATCH THE NOW',targetDate:weekly,prepareFrom:addDays(weekly,-policy.leadDays)});
  // Include both lunar phases independently. A missing event never silently becomes a guessed date.
  for(const phase of ['new','full']){
    const e=policy.calendar.events.find(e=>e.phase===phase&&e.at.slice(0,10)>=day);
    jobs.push(e?{line:'fixed',kind:'SHE CREATES',targetDate:e.at.slice(0,10),phase,eventAt:e.at,prepareFrom:addDays(e.at.slice(0,10),-policy.leadDays)}:{line:'fixed',kind:'SHE CREATES',phase,targetDate:day,blocker:'Lunar source coverage exhausted'});
  }
  return jobs;
}
export function genre(a,t={}){
  const s=[a.series,...(t.tags||[])].join(' ');
  if(/MICHIKUSA/.test(s))return 'MICHIKUSA';
  if(/SHE CREATES|ALMANAC|MOON/.test(s))return 'SHE CREATES';
  if(/LIFE NOTE|HACHICO/.test(s))return 'HACHICO, HERE & THERE.';
  if(/FEATURE|EXHIBITION|MUSEUM GUIDE/.test(s))return 'FEATURE';
  return 'MUSEUM ESSAY';
}
export function freshness(a,t={},text=''){
  // Conservative routing suggestions, never a verified freshness classification.
  if((t.fields||[]).some(v=>['politics','economy','medicine','technology','science'].includes(v))||/現在|今年|最新|速報|大統領|政権|感染|治療|政治|選挙|経済|金融|市場|SNS|プラットフォーム|アルゴリズム/.test(text))return 'TIME-SENSITIVE';
  if(/季節|春|夏|秋|冬|MOON|BOTANY|SEASON/.test(a.series+' '+text))return 'SEASONAL';
  return 'EVERGREEN';
}
export function rankInventory({articles,taxonomy,texts,holds,history=[],day,publishedIds=[]}){
  const used=new Set(history.filter(x=>x.line==='inventory'&&x.status!=='failed').map(x=>x.articleId));
  const knownPublished=new Set(publishedIds);
  const recent=articles.filter(a=>a.stage==='published'&&a.updated>=addDays(day,-7)&&a.updated<=day).map(a=>genre(a,taxonomy[a.file]));
  const uniqueHistory=history.filter((x,i)=>history.findIndex(y=>y.articleId===x.articleId&&y.line===x.line&&y.targetDate===x.targetDate)===i);
  recent.push(...uniqueHistory.filter(x=>x.targetDate>=addDays(day,-7)&&x.targetDate<=day&&x.genre).map(x=>x.genre));
  return articles.map(a=>{
    const articleId=a.file.replace(/\.html$/,''),tax=taxonomy[a.file]||{},text=texts[articleId]||'',g=genre(a,tax),f=freshness(a,tax,text);
    const exclusion=[];
    if(a.file.includes('/'))exclusion.push('not an inventory article');
    if(knownPublished.has(articleId)||a.stage==='published')exclusion.push('already published');
    if(!['approved','final-review','sources','editing','design','writing'].includes(a.stage))exclusion.push('canonical hold or unknown stage');
    if(holds[articleId])exclusion.push(holds[articleId].reason);
    if(used.has(articleId))exclusion.push('already in private work queue');
    if(!text)exclusion.push('master not located');
    const sourceLoad=Object.values(a.checks||{}).filter(v=>v!==true).length;
    const factors={genreGap:20-10*recent.filter(x=>x===g).length,canonicalReadiness:a.stage==='approved'?20:0,age:Math.min(20,Math.max(0,Math.floor((Date.parse(day)-Date.parse(a.updated||day))/86400000))),sourceLoad:-5*sourceLoad,freshness:f==='EVERGREEN'?10:f==='SEASONAL'?-5:-20,season:0};
    // Do not infer hemisphere/region or flowering time. Seasonal fit remains blocked without dated editorial evidence.
    const score=Object.values(factors).reduce((a,b)=>a+b,0);
    return {articleId,file:a.file,title:a.title,genre:g,freshness:f,freshnessVerified:false,stage:a.stage,score,factors,sourceLoad,seasonFit:'unverified',exclusion};
  }).sort((a,b)=>b.score-a.score||a.articleId.localeCompare(b.articleId));
}
export function proseLint(text){
  return ['本質的な価値','新たな可能性を切り拓','静かに寄り添','豊かな未来','いかがでしたか','まとめると'].filter(x=>text.includes(x)).map(x=>'文体の再点検: '+x);
}
export function readyForCFO(pack,evidence={},now=Date.now()){
  const pending=[...(pack.errors||[])];
  for(const key of pack.requiredChecks){
    const ev=evidence[key];
    if(!ev||ev.passed!==true||ev.artifactSha256!==pack.artifactSha256||!ev.evidenceRef||!Number.isFinite(Date.parse(ev.checkedAt))||Date.parse(ev.checkedAt)>now||now-Date.parse(ev.checkedAt)>86400000)pending.push(key);
  }
  return {state:pending.length?'verification-pending':'cfo-review',pendingChecks:[...new Set(pending)],published:false,scheduling:'not-executed'};
}
