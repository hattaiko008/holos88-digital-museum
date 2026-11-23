// Read-only audit of known canonical article URLs. Evidence is derived work state, not another article ledger.
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {hash} from '../lib/editorial-v1.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const status=JSON.parse(await readFile(resolve(root,'content/editorial-status.json'),'utf8'));
const rows=status.articles.filter(a=>/^[a-z0-9-]+\.html$/.test(a.file));
const results=[];
async function worker(){while(rows.length){const a=rows.shift(),url='https://holos88.com/prototype/articles/'+a.file;let result;
 try{
  const res=await fetch(url,{signal:AbortSignal.timeout(15000),redirect:'follow'}),body=await res.text();
  const title=body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'';
  const titleMatches=title.includes(a.title),publiclyAccessible=res.status===200&&titleMatches&&new URL(res.url).hostname==='holos88.com';
  result={articleId:a.file.replace(/\.html$/,''),url,finalUrl:res.url,httpStatus:res.status,titleMatches,bodySha256:hash(body),state:publiclyAccessible?'publicly-accessible':'unknown'};
 }catch(e){result={articleId:a.file.replace(/\.html$/,''),url,state:'unknown',error:e.name};}
 results.push(result);
}}
await Promise.all(Array.from({length:4},worker));
results.sort((a,b)=>a.articleId.localeCompare(b.articleId));
const out=resolve(root,'work/editorial-line/v1');await mkdir(out,{recursive:true});
const audit={checkedAt:new Date().toISOString(),source:'content/editorial-status.json',sourceSha256:hash(await readFile(resolve(root,'content/editorial-status.json'))),results,note:'200 and matching title proves public accessibility, not editorial approval. Non-200 or unknown never proves unpublished. Canonical status and public files were not modified.'};
await writeFile(resolve(out,'publication-audit.json.tmp'),JSON.stringify(audit,null,2)+'\n');await rename(resolve(out,'publication-audit.json.tmp'),resolve(out,'publication-audit.json'));
console.log(JSON.stringify({checked:results.length,publiclyAccessible:results.filter(x=>x.state==='publicly-accessible').length,unknown:results.filter(x=>x.state==='unknown').length,canonicalModified:false,published:false}));
