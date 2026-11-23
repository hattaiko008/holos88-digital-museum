import {readFile,writeFile,mkdir,readdir,open,unlink,rename,appendFile,access} from 'node:fs/promises';
import {resolve,relative,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {hash,fingerprint,escape,dateJST,addDays,validDay,planFixed,rankInventory,proseLint,readyForCFO} from '../lib/editorial-v1.mjs';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
const read=p=>readFile(resolve(ROOT,p),'utf8');
const json=async p=>JSON.parse(await read(p));
async function atomic(p,x){await mkdir(dirname(p),{recursive:true});await writeFile(p+'.tmp',typeof x==='string'?x:JSON.stringify(x,null,2)+'\n');await rename(p+'.tmp',p);}
async function files(dir){let out=[];for(const e of await readdir(resolve(ROOT,dir),{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())out.push(...await files(p));else if(/\.(md|txt)$/.test(p))out.push(p);}return out;}
const plain=s=>s.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const localAssets=s=>s.replace(/(["'])\/prototype\//g,'$1/prototype/reconstruction-01/').replace(/(["'])\/assets\//g,'$1/dist/assets/');
async function ref(p){return {path:p,sha256:hash(await readFile(resolve(ROOT,p)))};}
export async function run({targetDate,outDir,now=new Date(),ignorePublicationAudit=false}={}){
  const policy=await json('content/production/editorial-v1.json'),day=targetDate||addDays(dateJST(now),1);
  if(!validDay(day))throw Error('Invalid target date');
  const state=resolve(ROOT,outDir||policy.stateDirectory);
  if(!state.startsWith(resolve(ROOT,'work/')+'/'))throw Error('Private work output required');
  await mkdir(state,{recursive:true});
  const log=async data=>appendFile(resolve(state,'events.jsonl'),JSON.stringify({at:new Date().toISOString(),...data})+'\n');
  let lock;try{lock=await open(resolve(state,'run.lock'),'wx');}catch(e){await log({event:'run-lock-blocked',targetDate:day,error:e.code});throw e;}
  try{
    const status=await json(policy.canonicalStatus),taxonomy=await json(policy.canonicalTaxonomy),approvals=await json('content/approved-echo-text.json');
    const manuscripts=await files('content/drafts'),masters=await files('content/masters');
    const texts={},masterRefs={},inventory=[];
    // Prefer exact slug; only use legacy filename prefixes where unambiguous. Never merge same-title drafts.
    for(const p of [...manuscripts,...masters]){
      const text=await read(p),name=p.split('/').at(-1).replace(/\.(md|txt)$/,'');
      inventory.push({path:p,sha256:hash(text),characters:Array.from(text).length});
      for(const a of status.articles){
        const id=a.file.replace(/\.html$/,'');
        if(name===id || (!texts[id]&&name===id+'-draft-01')){texts[id]=text;masterRefs[id]=p;}
      }
    }
    const duplicates=inventory.filter((x,i)=>inventory.findIndex(y=>y.sha256===x.sha256)!==i);
    const history=[];
    for(const e of await readdir(state,{withFileTypes:true}))if(e.isDirectory()){
      try{history.push(JSON.parse(await readFile(resolve(state,e.name,'handoff.json'),'utf8')));}catch(e){if(e.code!=='ENOENT')throw e;}
    }
    let publicationAudit=null;
    if(!ignorePublicationAudit)try{
      const audit=await json(relative(ROOT,resolve(state,'publication-audit.json'))),age=+new Date(now)-Date.parse(audit.checkedAt);
      if(age>=0&&age<=86400000&&audit.sourceSha256===hash(await read(policy.canonicalStatus)))publicationAudit=audit;
    }catch(e){if(e.code!=='ENOENT')throw e;}
    const publishedIds=[...approvals.articles.filter(x=>x.publishedCommit).map(x=>x.slug),...(publicationAudit?.results||[]).filter(x=>x.state==='publicly-accessible'&&x.httpStatus===200&&x.titleMatches).map(x=>x.articleId)];
    const ranked=rankInventory({articles:status.articles,taxonomy,texts,holds:policy.holds,history,day,publishedIds});
    const home=await read('prototype/reconstruction-01/index.html');
    const inputRefs=await Promise.all(['content/production/editorial-v1.json',policy.canonicalStatus,policy.canonicalTaxonomy,'content/approved-echo-text.json',policy.postingDesk].map(ref));
    inputRefs.push(await ref('scripts/editorial-v1.mjs'),await ref('lib/editorial-v1.mjs'));
    if(publicationAudit)inputRefs.push(await ref(relative(ROOT,resolve(state,'publication-audit.json'))));
    const inputHash=fingerprint(inputRefs),jobs=planFixed(day,policy),produced=[];
    const previousStock=history.find(h=>h.line==='inventory'&&h.targetDate===day&&ranked.some(r=>r.articleId===h.articleId&&r.exclusion.every(x=>x==='already in private work queue')));
    const candidate=previousStock?ranked.find(a=>a.articleId===previousStock.articleId):ranked.find(a=>!a.exclusion.length);
    if(previousStock){
      const current=ranked.find(x=>x.articleId===previousStock.articleId),old=previousStock.fixedPlan.selection;
      jobs.push({...previousStock.fixedPlan,selection:{...old,freshness:current.freshness,factors:{...old.factors,freshness:current.factors.freshness},score:old.score-old.factors.freshness+current.factors.freshness}});
    }
    else if(candidate)jobs.push({line:'inventory',kind:'ARTICLE',targetDate:day,articleId:candidate.articleId,genre:candidate.genre,selection:candidate});
    else await log({event:'inventory-blocked',reason:'No eligible manuscript; no forced genre fill',targetDate:day});
    for(const job of jobs){
      const sourceRefs=[...inputRefs];let html='',text='',errors=[],design=null,sourcePage=null;
      if(job.line==='inventory'){
        errors.push('Actual publication state requires current URL/log review; canonical approved is insufficient');
        sourcePage='prototype/reconstruction-01/articles/'+job.articleId+'.html';
        try{
          const original=await read(sourcePage);html=localAssets(original);text=texts[job.articleId];
          sourceRefs.push(await ref(sourcePage),await ref(masterRefs[job.articleId]));
          design={id:'existing-article/'+job.articleId,reference:sourcePage,sha256:hash(original),mode:'unchanged-existing-layout',approval:'existing reference; current artifact still requires review'};
          // Detect stale editorial instructions and obvious placeholders; do not auto-rewrite any master.
          if(/AI.GENERATED PLACEHOLDER|実資料画像準備中|rights[^\n]{0,20}null|未確認|要確認|公開前に確認/i.test(original))errors.push('Unresolved source/rights/placeholder markers');
          if(job.selection.freshness!=='EVERGREEN')errors.push(job.selection.freshness+': current fact/season check required; revision proposal only');
          if(/subscriber|paid|有料/.test(original))errors.push('Paid boundary must be independently verified');
        }catch(e){if(e.code!=='ENOENT')throw e;errors.push('Existing assembled article missing');}
      }else if(['C','T'].includes(job.kind)){
        let dialog=home.match(new RegExp('<dialog[^>]*id="ct-'+job.kind+'"[\\s\\S]*?</dialog>'))?.[0];
        const intakePath=resolve(state,'intake',job.targetDate+'-'+job.kind+'.json');
        let intake;
        try{intake=JSON.parse(await readFile(intakePath,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
        if(intake){
          if(!dialog||typeof intake.title!=='string'||typeof intake.subtitle!=='string'||!Array.isArray(intake.paragraphs)||!intake.paragraphs.length||intake.paragraphs.some(x=>typeof x!=='string'||!x.trim()))throw Error('Invalid private C/T intake');
          dialog=dialog.replace(/<h2>[\s\S]*?<\/h2>/,()=>'<h2>'+escape(intake.title)+'</h2>')
            .replace(/<p class="ct-subtitle">[\s\S]*?<\/p>/,()=>'<p class="ct-subtitle">'+escape(intake.subtitle)+'</p>')
            .replace(/<div class="ct-prose">[\s\S]*?<\/div>/,()=>'<div class="ct-prose">'+intake.paragraphs.map(x=>'<p>'+escape(x)+'</p>').join('')+'</div>')
            .replace(/<p class="ct-source">[\s\S]*?<\/p>/,'<p class="ct-source">新規草稿・非公開・出典／CFO／ECHO確認前</p>');
          sourceRefs.push(await ref(relative(ROOT,intakePath)));
        }
        const body=dialog?.match(/<div class="ct-prose">([\s\S]*?)<\/div>/)?.[1];
        if(!body)errors.push('No existing C/T prose adapter');
        else{
          text=plain(body);const count=Array.from(text).length,[min,max]=policy.lengths[job.kind];
          if(count<min||count>max)errors.push('C/T length outside requested range: '+count);
          const repeated=history.find(h=>h.kind===job.kind&&h.targetDate!==job.targetDate&&h.contentSha256===hash(text));
          if(repeated){errors.push('Existing C/T seed exhausted; new writing required');text='';}
          else{
            const prose=dialog.replace(/^<dialog[^>]*>/,'<main class="ct-dialog" style="display:block;position:static;margin:auto;border:0;max-height:none">').replace(/<\/dialog>$/,'</main>').replace(/<button[\s\S]*?<\/button>/,'');
            html=`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${job.kind} 非公開確認</title><link rel="stylesheet" href="/prototype/reconstruction-01/today-ct.css"></head><body>${localAssets(prose)}</body></html>`;
          }
          sourceRefs.push(await ref('prototype/reconstruction-01/index.html'));
          design={id:'today-ct/'+job.kind,reference:'prototype/reconstruction-01/today-ct.css',mode:'existing-type-and-prose'};
        }
      }else if(job.kind==='DAILY ALMANAC'){
        // Preserve the seven-page design. Never relabel the old astronomical/astrological/Maya data as today's.
        sourceRefs.push(await ref(policy.calendar.designReference));
        html=localAssets(await read(policy.calendar.designReference));
        errors.push('Saved 2026-10-10 design reference only; target-day data not rendered','Japanese lunisolar/rokuyo/season and astronomical source reconciliation pending',policy.calendar.maya);
        design={id:'daily-seven-pages',reference:policy.calendar.designReference,mode:'unchanged-historical-reference-only'};
      }else errors.push(job.blocker||'No verified writing/research adapter; issue brief only');
      if(design?.reference?.endsWith('.css'))sourceRefs.push(await ref(design.reference));
      if(design&&job.line==='inventory')sourceRefs.push(await ref('prototype/reconstruction-01/prototype.css'));
      const styleWarnings=proseLint(text);errors.push(...styleWarnings);
      if(html)html=html.replace(/<head>/,'<head><meta name="robots" content="noindex,nofollow">');
      const contentSha256=hash(text),jobHash=fingerprint({job,inputHash,sourceRefs,contentSha256,htmlHash:hash(html)});
      const id='v1-'+job.kind.replace(/[^A-Z]/g,'').toLowerCase()+'-'+job.targetDate+'-'+jobHash.slice(0,12),dir=resolve(state,id);
      const existing=history.find(h=>h.id===id);
      if(existing){
        let intact=true;for(const f of ['packet.json','review-pack.json',...(html?['preview.html']:[])])try{await access(resolve(state,id,f));}catch{intact=false;}
        if(intact){produced.push({id,status:existing.status,duplicatePrevented:true});continue;}
      }
      // One immutable version per content/source hash. Approval and verification are never carried across versions.
      await mkdir(dir,{recursive:true});
      if(html)await atomic(resolve(dir,'preview.html'),html);
      const artifactSha256=hash(html||JSON.stringify(job));
      const packet={articleId:job.articleId||'fixed-'+job.kind.toLowerCase().replaceAll(' ','-')+'-'+job.targetDate,medium:job.line==='inventory'?'website':job.kind,account:null,text,assets:[],sourceRefs,timezone:policy.timezone,publishAt:null,targetDate:job.targetDate};
      const pack={articleId:packet.articleId,design:design?.id||null,sourcePage,artifactSha256,componentChecks:{existingLayout:!!html,length:!!text&&!errors.some(x=>x.startsWith('C/T length'))},errors,requiredChecks:policy.manualChecks,revisionProposal:job.selection?.freshness!=='EVERGREEN'&&job.line==='inventory'?{originalUnchanged:true,classification:job.selection.freshness,changes:[],reason:'季節・ニュースとの適合を再調査してから本文差分を作成。日付や季節語の機械置換は禁止。'}:null,...readyForCFO({artifactSha256,requiredChecks:policy.manualChecks,errors})};
      const handoff={id,line:job.line,kind:job.kind,phase:job.phase,targetDate:job.targetDate,articleId:packet.articleId,genre:job.genre,contentSha256,inputHash,packetSha256:fingerprint(packet),artifactSha256,status:html&&text?'verification-pending':'blocked',complete:false,scheduled:false,published:false,previewRef:html?relative(ROOT,resolve(dir,'preview.html')):null,pending:pack.pendingChecks,trace:[{desk:'コハク',action:'既存正本の収集・分類のみ'},{desk:'ライちゃん',action:text?'既存原文の読出し。新規執筆・改変なし':'執筆adapter不足'},{desk:'デザちゃん',action:design?'既存誌面を保持':'誌面未作成'},{desk:'CHATO/Cocoon',action:'非公開パケット・ハッシュ・不足を統合'},{desk:'CHATO CFO',action:'品質ゲート完了後に審査。受領未確認'},{desk:'ECHO',action:'CFO承認後、対象・本文・素材・媒体・日時の明示承認'}],handoffMode:'shared files; Dots/other chat delivery not connected',executor:'deterministic adapter; desk names do not assert another agent participated',fixedPlan:job};
      await atomic(resolve(dir,'approval-request.json'),{packetSha256:fingerprint(packet),artifactSha256,articleId:packet.articleId,targetDate:job.targetDate,medium:packet.medium,account:packet.account,publishAt:packet.publishAt,assets:packet.assets,cfo:{actor:'CHATO CFO',decision:'pending',evidenceRef:null},echo:{actor:'ECHO',decision:'pending',evidenceRef:null,exactUserText:null},release:'blocked',note:'Quality checks and CFO review must finish before ECHO is asked. An empty field, silence, prior approval, or production completion never grants release.'});
      await atomic(resolve(dir,'packet.json'),packet);await atomic(resolve(dir,'review-pack.json'),pack);await atomic(resolve(dir,'handoff.json'),handoff);
      await log({event:'job-saved',id,status:handoff.status,packetSha256:handoff.packetSha256});produced.push({id,status:handoff.status,duplicatePrevented:false});
    }
    const audit={schemaVersion:1,targetDate:day,executedAt:new Date().toISOString(),execution:{host:process.env.GITHUB_ACTIONS==='true'?'github-actions':'local',event:process.env.GITHUB_EVENT_NAME||'manual-local',runUrl:process.env.GITHUB_RUN_ID?`https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`:null,commit:process.env.GITHUB_SHA||null},sourceRefs:inputRefs,canonicalCount:status.articles.length,manuscripts:{count:inventory.length,exactDuplicateCount:duplicates.length,manifest:inventory},selection:ranked,fixedPlan:jobs.filter(j=>j.line==='fixed'),jobs:produced,cloudRecurringVerified:false,cfoReady:produced.filter(x=>x.status==='cfo-review').length,scheduled:false,published:false};
    await atomic(resolve(state,'run-manifest.json'),audit);
    const changed=produced.filter(x=>!x.duplicatePrevented);
    await log({event:'run-complete',targetDate:day,changed:changed.length,duplicatePrevented:produced.length-changed.length});
    const links=produced.map(x=>`<li>${x.status==='verification-pending'?`<a href="${escape(x.id)}/preview.html">${escape(x.id)}</a>`:escape(x.id)} — ${escape(x.status)}</li>`).join('');
    await atomic(resolve(state,'index.html'),`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>HOLOS 88 非公開編集室</title><body><h1>非公開編集室 / ${day}</h1><p>品質検証中。CFO・ECHO承認未取得。公開・予約なし。ALMANACリンクは10月10日保存デザインで、対象日データではありません。</p><ul>${links}</ul><p>不足・証跡：run-manifest.json / 各review-pack.json。リンクのない未制作号は固定計画のみです。</p></body></html>`);
    return {targetDate:day,changed:changed.length,jobs:produced,manifest:relative(ROOT,resolve(state,'run-manifest.json')),scheduled:false,published:false};
  }catch(e){await log({event:'run-failed',error:e.message,retry:'at most 2 repaired attempts; no automatic unsafe retry'});throw e;}
  finally{await lock.close();await unlink(resolve(state,'run.lock'));}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log(JSON.stringify(await run({targetDate:process.argv[2],outDir:process.argv[3]})));}
  catch(e){console.error(JSON.stringify({status:'failed',error:e.message,scheduled:false,published:false}));process.exitCode=1;}
}
