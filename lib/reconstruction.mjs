import {mkdir,readFile,writeFile} from 'node:fs/promises';

const outDir=new URL('../prototype/reconstruction-01/articles/',import.meta.url);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function inline(value){
  let text=esc(value);
  text=text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,'<a href="$2" rel="noreferrer">$1</a>');
  text=text.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  text=text.replace(/\*([^*]+)\*/g,'<em>$1</em>');
  return text;
}

function markdownBody(markdown){
  const lines=markdown.replace(/\r/g,'').split('\n');
  const firstRule=lines.findIndex(line=>line.trim()==='---');
  const body=firstRule>=0?lines.slice(firstRule+1):lines.slice(2);
  let html='',paragraph=[],list=[];
  const flushParagraph=()=>{if(paragraph.length){html+=`<p>${inline(paragraph.join(' '))}</p>`;paragraph=[];}};
  const flushList=()=>{if(list.length){html+=`<ul>${list.map(item=>`<li>${inline(item)}</li>`).join('')}</ul>`;list=[];}};
  for(const raw of body){
    const line=raw.trim();
    if(!line){flushParagraph();flushList();continue;}
    if(line==='---'){flushParagraph();flushList();html+='<hr>';continue;}
    if(line.startsWith('### ')){flushParagraph();flushList();html+=`<h3>${inline(line.slice(4))}</h3>`;continue;}
    if(line.startsWith('## ')){flushParagraph();flushList();html+=`<h2>${inline(line.slice(3))}</h2>`;continue;}
    if(line.startsWith('# ')){flushParagraph();flushList();continue;}
    if(line.startsWith('- ')){flushParagraph();list.push(line.slice(2));continue;}
    if(/^\d+\. /.test(line)){flushParagraph();list.push(line.replace(/^\d+\. /,''));continue;}
    paragraph.push(line.replace(/ {2}$/,''));
  }
  flushParagraph();flushList();
  return html;
}

function jsonBody(article){
  const sources=new Map((article.sources||[]).map(source=>[source.id,source]));
  return (article.body||[]).map(block=>{
    if(block.type==='heading')return `<h2>${inline(block.text)}</h2>`;
    if(block.type==='source'){
      const source=sources.get(block.source_id);
      if(!source)return '';
      return `<aside class="source-window"><p>SOURCE WINDOW</p><p>${inline(source.summary||source.title||source.name||'')}</p>${source.url?`<a href="${esc(source.url)}" rel="noreferrer">SOURCE ↗</a>`:''}</aside>`;
    }
    if(block.type==='paragraph')return `<p${block.emphasis?' class="beat"':''}>${block.emphasis==='strong'?`<strong>${inline(block.text)}</strong>`:inline(block.text)}</p>`;
    return '';
  }).join('');
}

function fearBody(data){
  const story=data.story;
  return `<p class="opening">${inline(story.opening)}</p><p>${inline(story.intro)}</p>`+story.chapters.map(chapter=>`<h2><span>${esc(chapter.number)}</span>${inline(chapter.title)}</h2><p class="section-ja">${inline(chapter.title_ja)}</p>${chapter.blocks.map(block=>block.type==='paragraph'?`<p>${inline(block.text)}</p>`:'').join('')}`).join('')+`<h2>${inline(story.ending.title||'')}</h2><p>${inline(story.ending.text||'')}</p>`;
}

function page({slug,kicker,title,titleJa,subtitle,byline,body,theme='paper',next=[]}){
  const links=next.map(item=>`<a href="${item.href}"><span>${esc(item.kicker)}</span><b>${esc(item.title)}</b><small>${esc(item.ja)}</small></a>`).join('');
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titleJa)} — HOLOS 88</title><meta name="description" content="${esc(subtitle)}"><link rel="stylesheet" href="/prototype/prototype.css"></head><body class="reading-page article-${esc(theme)}"><a class="skip" href="#article">本文へ</a><header class="site-head"><a class="wordmark" href="/prototype/index.html"><span>HOLOS</span><sup>88</sup></a><nav aria-label="主要ナビゲーション"><a href="/prototype/index.html#read">READ</a><a href="/prototype/index.html#museum">MUSEUM</a><a href="/prototype/index.html#atlas">ATLAS</a></nav><a class="close-page" href="/prototype/index.html#read">CLOSE ×</a></header><main id="article"><header class="article-hero article-hero-text"><div class="article-type"><p>${esc(kicker)}</p><p>HOLOS 88 / ${esc(slug.toUpperCase())}</p></div><h1>${esc(title)}</h1><div class="article-title-ja"><p>${esc(titleJa)}</p><p>${esc(subtitle)}</p></div><p class="byline">${esc(byline)}</p></header><article class="article-body article-body-generated">${body}</article><section class="michikusa"><p class="eyebrow">MICHIKUSA / NEXT CURIOSITY</p><h2>ANOTHER<br>WINDOW</h2><p class="title-ja">次の好奇心へ</p><div class="michi-grid">${links}</div></section></main><footer><a class="wordmark" href="/prototype/index.html"><span>HOLOS</span><sup>88</sup></a><p>A MUSEUM OF RELATIONSHIPS.<br>世界との関係を収蔵する。</p><p>RETURN TO <a href="/prototype/index.html">COVER ↗</a></p></footer></body></html>`;
}

export async function buildReconstruction(){
  const articles=JSON.parse(await readFile(new URL('../content/articles.json',import.meta.url),'utf8'));
  const fear=JSON.parse(await readFile(new URL('../content/specimen-002.json',import.meta.url),'utf8'));
  const byId=new Map(articles.articles.map(article=>[article.id,article]));
  const configs=[
    {slug:'horse-time',article:'horse-time',kicker:'LIFE NOTE · SEASON · ANIMALS',title:'THE WEATHER OF A LIFE',titleJa:'最近、雨ばっかり。',subtitle:'秋って、こんなんやったっけ。',byline:'WORDS BY hachico',theme:'life'},
    {slug:'five-percent',article:'five-percent',kicker:'MARKET · ECONOMY · LIFE',title:'FIVE PERCENT, AND BEYOND',titleJa:'5％という数字の、その向こう',subtitle:'市場の数字は、どこで同じ財布に出会うのか。',byline:'WRITTEN BY ECHO',theme:'market'},
    {slug:'archaeology-of-fear',fear:true,kicker:'EXHIBITION · HISTORY · MEMORY',title:'THE ARCHAEOLOGY OF FEAR',titleJa:'恐怖の考古学',subtitle:'石ではなく、種だった。',byline:'WRITTEN BY ECHO',theme:'dark'},
    {slug:'seed',file:'content/masters/seed-specimen-draft-01.md',kicker:'SPECIMEN · LANGUAGE · BOTANY',title:'SEED',titleJa:'蒔かぬ種は生えぬ。',subtitle:'けれど、蒔けば生えるわけでもない。',byline:'WRITTEN BY ECHO',theme:'botany'},
    {slug:'duration',file:'content/masters/duration-bergson-draft-01.md',kicker:'TIME · PHILOSOPHY · LIFE',title:'DURATION',titleJa:'待つことは、何もしないことではない。',subtitle:'ベルクソンから、種と時計の時間へ。',byline:'WRITTEN BY ECHO',theme:'time'},
    {slug:'last-question',file:'content/drafts/echo/who-holds-the-last-question.md',kicker:'AI · PHILOSOPHY · CHOICE',title:'WHO HOLDS THE LAST QUESTION?',titleJa:'最後の問いを、誰が持つのか',subtitle:'答えを渡すことと、判断を渡すことのあいだ。',byline:'WRITTEN BY ECHO',theme:'ai'}
  ];
  const route=configs.map(item=>({href:`/prototype/articles/${item.slug}.html`,title:item.title,ja:item.titleJa,kicker:item.kicker.split(' · ')[0]}));
  await mkdir(outDir,{recursive:true});
  for(let i=0;i<configs.length;i++){
    const config=configs[i];
    let body='';
    if(config.article)body=jsonBody(byId.get(config.article));
    else if(config.fear)body=fearBody(fear);
    else body=markdownBody(await readFile(new URL(`../${config.file}`,import.meta.url),'utf8'));
    const next=[route[(i+1)%route.length],route[(i+2)%route.length],{href:'/prototype/index.html#atlas',title:'ATLAS',ja:'関係の地図へ',kicker:'CONNECT'}];
    await writeFile(new URL(`${config.slug}.html`,outDir),page({...config,body,next}));
  }
  console.log(`Built reconstruction reading pages: ${configs.length}.`);
}
