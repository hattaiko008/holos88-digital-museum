import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Public input contains selected opening paragraphs only, never the paid manuscript.
export async function buildMemberWindowPreviews(){
  const data=JSON.parse(await readFile(new URL('content/member-window-previews.json',root),'utf8'));
  const template=await readFile(new URL('content/templates/member-window-preview.html',root),'utf8');
  const folder=new URL('prototype/reconstruction-01/member-windows/',root);
  await mkdir(folder,{recursive:true});
  const freeMaster=await readFile(new URL('content/drafts/she-creates/body-clock-free.md',root),'utf8');
  const freeTemplate=await readFile(new URL('content/templates/she-creates/body-clock-free.html',root),'utf8');
  const figure=await readFile(new URL('content/templates/she-creates/body-clock-free-figure.html',root),'utf8');
  const body=freeMaster.split('\n---')[0].split('\n\n').filter(p=>p&&!p.startsWith('# '));
  let heading=0;
  const freeHtml=body.map((p,i)=>{
    if(p.startsWith('## ')){
      heading++;
      return (heading===2?figure:'')+`<h2>${esc(p.slice(3))}</h2>`;
    }
    return `<p${i===0?' class="opening"':''}>${esc(p)}</p>`;
  }).join('\n')+'<div class="member-invitation"><a href="/prototype/member-windows/body-clock-observation-notes-member.html">会員向け観察ノートの冒頭を読む ↗</a><br>有料版は掲載準備中です。</div>';
  await writeFile(new URL('body-clock-free.html',folder),freeTemplate.replace('<main ', '<main id="article-top" ').replace('{{FREE_BODY}}',()=>freeHtml));
  await writeFile(new URL('prototype/reconstruction-01/articles/the-body-keeps-more-than-one-clock.html',root),freeTemplate.replace('{{FREE_BODY}}',()=>freeHtml));
  const drafts=data.items.filter(item=>item.status==='review-draft');
  for(const item of drafts){
    if(!/^[a-z0-9-]+$/.test(item.slug)||!item.opening?.length)throw new Error('Missing public opening: '+item.slug);
    const values={TITLE:esc(item.title),TITLE_DISPLAY:item.title.split(/(?<=、)/).map(part=>`<span class="title-phrase">${esc(part)}</span>`).join(''),SERIES:esc(item.series),OPENING:item.opening.map(p=>`<p>${esc(p)}</p>`).join('\n'),OUTLINE:item.outline.map(p=>`<li>${esc(p)}</li>`).join(''),SUBSTACK:esc(data.substack),PATREON:esc(data.patreon),FREE_ARTICLE:esc(item.sourceArticle)};
    const html=template.replace(/\{\{([A-Z_]+)\}\}/g,(_,key)=>{
      if(!(key in values))throw new Error('Unknown preview slot: '+key);
      return values[key];
    });
    await writeFile(new URL(item.slug+'.html',folder),html);
  }
  console.log(`Built member opening previews: ${drafts.length}; planned manuscripts remain queued.`);
}
