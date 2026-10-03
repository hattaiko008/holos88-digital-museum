import {readFile, writeFile} from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const escape=text=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline=text=>escape(text).replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)/g,(_,label,url)=>`<a href="${url}"${url.startsWith('http')?' rel="noreferrer"':''}>${label}</a>`);

// Keep approved layout templates, figures, headings and auxiliary desks intact.
// Only paragraph slots receive text from the publication masters.
export async function buildApprovedEchoText(){
  const {articles}=JSON.parse(await readFile(new URL('content/approved-echo-text.json',root),'utf8'));
  for(const item of articles){
    const master=await readFile(new URL(item.master,root),'utf8');
    const start=master.indexOf(item.bodyStart),end=master.indexOf(item.auxiliaryHeading);
    if(start<0||end<=start)throw new Error(`Missing manuscript bounds: ${item.slug}`);
    const prose=master.slice(start,end).replace(/<section\b[\s\S]*?<\/section>/g,'').replace(/\n\n---\s*$/,'').trim();
    const headings=[...prose.matchAll(/^## (.+)$/gm)].map(match=>match[1]);
    if(JSON.stringify(headings)!==JSON.stringify(item.masterHeadings))throw new Error(`Manuscript heading order changed: ${item.slug}`);
    const sections=prose.split(/^## .+$/m);
    if(sections.length!==item.sectionCount)throw new Error(`Section count changed: ${item.slug}`);
    let template=await readFile(new URL(item.template,root),'utf8');
    const refinements=await readFile(new URL('content/templates/approved-echo/reading-refinements.css',root),'utf8');
    template=template.replace('{{READING_REFINEMENTS}}',()=>refinements);
    for(let i=0;i<sections.length;i++){
      const paragraphs=sections[i].trim().split(/\n\s*\n/).filter(Boolean);
      if(paragraphs.some(p=>/^(?:#|---|\*\*STATUS|<!--)/.test(p)))throw new Error(`Unexpected manuscript metadata: ${item.slug}`);
      const slot=`{{BODY_${i}}}`;
      if(template.split(slot).length!==2)throw new Error(`Ambiguous layout slot: ${item.slug} ${i}`);
      template=template.replace(slot,()=>paragraphs.map(p=>`<p>${inline(p.replace(/\n/g,' '))}</p>`).join(''));
    }
    if(/\{\{BODY_\d+\}\}/.test(template))throw new Error(`Unfilled layout slot: ${item.slug}`);
    await writeFile(new URL(`prototype/reconstruction-01/articles/${item.slug}.html`,root),template);
  }
  console.log(`Built approved ECHO paragraph updates: ${articles.length}; layout preserved.`);
}
