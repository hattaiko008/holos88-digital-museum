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

function page({slug,kicker,title,titleJa,subtitle,byline,body,theme='paper',next=[],preview=false}){
  const links=next.map(item=>`<a href="${item.href}"><span>${esc(item.kicker)}</span><b>${esc(item.title)}</b><small>${esc(item.ja)}</small></a>`).join('');
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titleJa)} — HOLOS 88</title><meta name="description" content="${esc(subtitle)}"><link rel="stylesheet" href="/prototype/prototype.css"></head><body class="reading-page article-${esc(theme)}"><a class="skip" href="#article">本文へ</a><header class="site-head"><a class="wordmark" href="/prototype/index.html"><span>HOLOS</span><sup>88</sup></a><nav aria-label="主要ナビゲーション"><a href="/prototype/index.html#read">READ</a><a href="/prototype/index.html#museum">MUSEUM</a><a href="/prototype/index.html#atlas">ATLAS</a></nav><a class="close-page" href="/prototype/index.html#read">CLOSE ×</a></header><main id="article"><header class="article-hero article-hero-text"><div class="article-type"><p>${esc(kicker)}</p><p>HOLOS 88 / ${esc(slug.toUpperCase())}</p>${preview?'<p class="preview-label">EDITORIAL PREVIEW / 公開前草稿</p>':''}</div><h1>${esc(title)}</h1><div class="article-title-ja"><p>${esc(titleJa)}</p><p>${esc(subtitle)}</p></div><p class="byline">${esc(byline)}</p></header><article class="article-body article-body-generated">${body}</article><section class="michikusa"><p class="eyebrow">MICHIKUSA / NEXT CURIOSITY</p><h2>ANOTHER<br>WINDOW</h2><p class="title-ja">次の好奇心へ</p><div class="michi-grid">${links}</div></section></main><footer><a class="wordmark" href="/prototype/index.html"><span>HOLOS</span><sup>88</sup></a><p>A MUSEUM OF RELATIONSHIPS.<br>世界との関係を収蔵する。</p><p>RETURN TO <a href="/prototype/index.html">COVER ↗</a></p></footer></body></html>`;
}

export async function buildReconstruction(){
  const articles=JSON.parse(await readFile(new URL('../content/articles.json',import.meta.url),'utf8'));
  const fear=JSON.parse(await readFile(new URL('../content/specimen-002.json',import.meta.url),'utf8'));
  const byId=new Map(articles.articles.map(article=>[article.id,article]));
  const configs=[
    {slug:'horse-time',article:'horse-time',kicker:'LIFE NOTE · SEASON · ANIMALS',title:'THE WEATHER OF A LIFE',titleJa:'最近、雨ばっかり。',subtitle:'秋って、こんなんやったっけ。',byline:'WORDS BY hachico',theme:'life',related:['horse','moon-to-stars','land']},
    {slug:'five-percent',article:'five-percent',kicker:'MARKET · ECONOMY · LIFE',title:'FIVE PERCENT, AND BEYOND',titleJa:'5％という数字の、その向こう',subtitle:'市場の数字は、どこで同じ財布に出会うのか。',byline:'WRITTEN BY ECHO',theme:'market',related:['land','gift','last-question']},
    {slug:'archaeology-of-fear',fear:true,kicker:'EXHIBITION · HISTORY · MEMORY',title:'THE ARCHAEOLOGY OF FEAR',titleJa:'恐怖の考古学',subtitle:'石ではなく、種だった。',byline:'WRITTEN BY ECHO',theme:'dark',related:['seed','kaleidoscope','land']},
    {slug:'seed',file:'content/masters/seed-specimen-draft-01.md',kicker:'SPECIMEN · LANGUAGE · BOTANY',title:'SEED',titleJa:'蒔かぬ種は生えぬ。',subtitle:'けれど、蒔けば生えるわけでもない。',byline:'WRITTEN BY ECHO',theme:'botany',preview:true,related:['germination','duration','millet']},
    {slug:'duration',file:'content/masters/duration-bergson-draft-01.md',kicker:'TIME · PHILOSOPHY · LIFE',title:'DURATION',titleJa:'待つことは、何もしないことではない。',subtitle:'ベルクソンから、種と時計の時間へ。',byline:'WRITTEN BY ECHO',theme:'time',preview:true,related:['wadokei','germination','last-question']},
    {slug:'last-question',file:'content/drafts/echo/who-holds-the-last-question.md',kicker:'AI · PHILOSOPHY · CHOICE',title:'WHO HOLDS THE LAST QUESTION?',titleJa:'最後の問いを、誰が持つのか',subtitle:'答えを渡すことと、判断を渡すことのあいだ。',byline:'WRITTEN BY ECHO',theme:'ai',preview:true,related:['who-is-speaking','consciousness','cabinet']},
    {slug:'who-is-speaking',file:'content/drafts/echo/who-is-speaking.md',kicker:'AI · SELF · LANGUAGE',title:'WHO IS SPEAKING?',titleJa:'「私」と言うのは、誰か',subtitle:'自我と、言葉を返す機械のあいだ。',byline:'WRITTEN BY ECHO',theme:'ai',preview:true,related:['consciousness','last-question','wild-mind']},
    {slug:'consciousness',file:'content/drafts/echo/where-does-consciousness-begin.md',kicker:'MIND · BODY · SCIENCE',title:'WHERE DOES CONSCIOUSNESS BEGIN?',titleJa:'意識は、どこで始まるのか',subtitle:'脳がつくるものと、まだ分からないもの。',byline:'WRITTEN BY ECHO',theme:'time',preview:true,related:['who-is-speaking','wild-mind','last-question']},
    {slug:'wild-mind',file:'content/drafts/echo/the-wild-mind.md',kicker:'ANTHROPOLOGY · STRUCTURE · NATURE',title:'THE WILD MIND',titleJa:'野生は、未開ではない',subtitle:'レヴィ＝ストロースから、分類する人間へ。',byline:'WRITTEN BY ECHO',theme:'botany',preview:true,related:['gift','taro-jomon','cabinet']},
    {slug:'gift',file:'content/drafts/echo/the-gift-never-ends.md',kicker:'GIFT · SOCIETY · RELATIONSHIP',title:'THE GIFT NEVER ENDS',titleJa:'贈り物は、渡したところで終わらない',subtitle:'モースから、物と人の関係へ。',byline:'WRITTEN BY ECHO',theme:'paper',preview:true,related:['wild-mind','cabinet','five-percent']},
    {slug:'taro-jomon',file:'content/drafts/echo/taro-found-jomon.md',kicker:'ART · JŌMON · ANTHROPOLOGY',title:'TARO FOUND JŌMON',titleJa:'太郎は、縄文を見つけた',subtitle:'岡本太郎の眼から、古い造形を見る。',byline:'WRITTEN BY ECHO',theme:'dark',preview:true,related:['wild-mind','gift','kaleidoscope']},
    {slug:'cabinet',file:'content/drafts/echo/the-cabinet-that-thought.md',kicker:'UMESAO · CARDS · AI',title:'THE CABINET THAT THOUGHT',titleJa:'AIより前に、思考するカード箱があった',subtitle:'梅棹忠夫の知的生産から、現代のAIへ。',byline:'WRITTEN BY ECHO',theme:'ai',preview:true,related:['last-question','gift','wild-mind']},
    {slug:'escape',file:'content/drafts/echo/how-far-can-we-escape.md',kicker:'STRUCTURE · POWER · ESCAPE',title:'HOW FAR CAN WE ESCAPE?',titleJa:'構造の外へ、どこまで逃げられるか',subtitle:'逃げること、住むこと、別の道をつくること。',byline:'WRITTEN BY ECHO',theme:'paper',preview:true,related:['wild-mind','land','gift']},
    {slug:'horse',file:'content/masters/horse-draft-01.md',kicker:'ANIMAL · HISTORY · RELATIONSHIP',title:'HORSE',titleJa:'馬は、人をどこまで遠くへ運んだのだろう。',subtitle:'労働、戦争、競技、ケアの隣にいた動物。',byline:'WRITTEN BY ECHO',theme:'life',preview:true,related:['horse-time','land','wild-mind']},
    {slug:'millet',file:'content/masters/millet-draft-01.md',kicker:'ART · LABOR · FIELD',title:'MILLET',titleJa:'手前に、人を置いた画家。',subtitle:'農村の美しさと、見えなくなる労働。',byline:'WRITTEN BY ECHO',theme:'paper',preview:true,related:['land','seed','gift']},
    {slug:'land',file:'content/masters/land-draft-01.md',kicker:'LAND · OWNERSHIP · HISTORY',title:'LAND',titleJa:'畑は、誰のものだったのだろう。',subtitle:'土から、所有と境界の歴史へ。',byline:'WRITTEN BY ECHO',theme:'botany',preview:true,related:['millet','seed','escape']},
    {slug:'kaleidoscope',file:'content/masters/kaleidoscope-draft-01.md',kicker:'IMAGE · RELATIONSHIP · HOLOS',title:'KALEIDOSCOPE',titleJa:'同じ欠片を、少しだけ回してみる。',subtitle:'HOLOS 88を読むための、小さな鍵。',byline:'WRITTEN BY ECHO',theme:'paper',preview:true,related:['archaeology-of-fear','taro-jomon','moon-to-stars']},
    {slug:'moon-to-stars',file:'content/masters/moon-to-stars-draft-01.md',kicker:'MOON · STARS · SEASON',title:'MOON TO STARS',titleJa:'月を見たあと、星を待つ。',subtitle:'秋の空から、古い星の名前へ。',byline:'WRITTEN BY ECHO',theme:'dark',preview:true,related:['duration','kaleidoscope','horse-time']},
    {slug:'germination',file:'content/masters/germination-draft-01.md',kicker:'BOTANY · TIME · CONDITION',title:'GERMINATION',titleJa:'芽が出るのは、種が決めた日ではない。',subtitle:'発芽は、ひとりで起きていない。',byline:'WRITTEN BY ECHO',theme:'botany',preview:true,related:['seed','duration','land']},
    {slug:'wadokei',file:'content/masters/wadokei-draft-01.md',kicker:'TIME · EDO · SEASON',title:'WADOKEI',titleJa:'夏至には長く、冬至には短くなる「一刻」。',subtitle:'同じ一時間ではなかった時間へ。',byline:'WRITTEN BY ECHO',theme:'time',preview:true,related:['duration','moon-to-stars','cabinet']}
  ];
  const route=configs.map(item=>({href:`/prototype/articles/${item.slug}.html`,title:item.title,ja:item.titleJa,kicker:item.kicker.split(' · ')[0]}));
  await mkdir(outDir,{recursive:true});
  for(let i=0;i<configs.length;i++){
    const config=configs[i];
    let body='';
    if(config.article)body=jsonBody(byId.get(config.article));
    else if(config.fear)body=fearBody(fear);
    else body=markdownBody(await readFile(new URL(`../${config.file}`,import.meta.url),'utf8'));
    const related=(config.related||[]).map(slug=>route.find(item=>item.href.endsWith(`/${slug}.html`))).filter(Boolean);
    const next=[...related.slice(0,2),{href:'/prototype/index.html#atlas',title:'ATLAS',ja:'関係の地図へ',kicker:'CONNECT'}];
    await writeFile(new URL(`${config.slug}.html`,outDir),page({...config,body,next}));
  }
  console.log(`Built reconstruction reading pages: ${configs.length}.`);
}
