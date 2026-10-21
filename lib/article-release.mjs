// Reuse the canonical ARTICLE ID and saved publication settings.
// No network or deployment side effect: builds only the explicitly approved article.
import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {resolve,dirname,sep} from 'node:path';
import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
export async function applyArticleReleases(root){
 const ledger=JSON.parse(await readFile(resolve(root,'content/editorial-status.json'),'utf8'));
 const applied=[];
 const safe=rel=>{const p=resolve(root,rel);if(!p.startsWith(resolve(root)+sep))throw Error('release path escaped project');return p;};
 for(const a of ledger.articles.filter(x=>x.publicationPreparation?.status==='release-authorized')){
  const p=a.publicationPreparation,approval=p.approval,id=a.file.replace(/\.html$/,'');
  if(!/^[a-z0-9-]+$/.test(id)||!['approved','published'].includes(a.stage)||approval?.actor!=='ECHO'||approval?.decision!=='publish'||!approval.exactUserText?.trim()||!approval.approvedAt)throw Error('Explicit article publication approval is missing');
  const [template,master]=await Promise.all([readFile(safe(p.template),'utf8'),readFile(safe(p.master),'utf8')]);
  if(hash(template)!==p.templateSha256||hash(master)!==p.masterSha256||approval.templateSha256!==p.templateSha256||approval.masterSha256!==p.masterSha256)throw Error('Article changed after publication approval');
  if(!p.target.canonicalUrl||!p.target.thumbnail||!Object.values(a.checks).every(x=>x===true))throw Error('Publication settings or QA incomplete');
  const dest=safe('prototype/reconstruction-01/articles/'+id+'.html');
  const schema={"@context":"https://schema.org","@type":"Article",headline:p.target.title,description:p.target.description,author:{'@type':'Person',name:'ECHO'},publisher:{'@type':'Organization',name:'HOLOS 88'},image:'https://holos88.com'+p.target.thumbnail,mainEntityOfPage:p.target.canonicalUrl,datePublished:approval.approvedAt,inLanguage:'ja'};
  const html=template.replace(/<meta name="robots" content="[^"]*">/g,'').replace(/<p class="preview-label">[\s\S]*?<\/p>/g,'').replace('data-publication-state="held"','data-publication-state="published"').replace('</head>','<script type="application/ld+json">'+JSON.stringify(schema).replace(/</g,'\\u003c')+'</script></head>');
  await mkdir(dirname(dest),{recursive:true});await writeFile(dest,html);
  await cp(safe('content/assets/articles/'+id),safe('dist/assets/articles/'+id),{recursive:true});
  applied.push(id);
 }
 return applied;
}
