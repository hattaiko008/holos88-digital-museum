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
    if(line.startsWith('## ')){flushParagraph();flushList();const heading=line.slice(3);const marker=/^(MICHIKUSA|SOURCE DESK|SYNAPSES)/.test(heading)?' class="section-marker"':'';html+=`<h2${marker}>${inline(heading)}</h2>`;continue;}
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

function cabinetMagazine(body){
  const plate=`<figure class="magazine-plate plate-wide"><img src="/assets/study01-384116.jpg" alt="蝶と貝を描いた古い博物画"><figcaption><span>PLATE 01 / TO LOOK IS TO SELECT</span>採集し、名をつけ、並べる。博物誌の図版もまた、世界をそのまま写すのではなく、見るための関係をつくる。<small>RIGHTS DESK / 所蔵・年代・権利情報は公開前に確定</small></figcaption></figure>`;
  const cards=`<aside class="card-field" aria-label="カードを並べ替えて考える図"><header><span>FIELD DEVICE 01</span><p>ONE CARD / ONE OBSERVATION</p></header><div><article><small>PLACE</small><b>草原の端</b><p>群れが止まった位置</p></article><article><small>TIME</small><b>17:42</b><p>光が変わる直前</p></article><article><small>WORD</small><b>まだ不明</b><p>あとで聞き直す</p></article><article><small>QUESTION</small><b>なぜ離れた？</b><p>結論にはしない</p></article></div><footer>WRITE → MOVE → COMPARE → THINK</footer></aside>`;
  const quote=`<blockquote class="magazine-quote"><p><span>箱は保存する。</span><span>机は考える。</span></p><cite>THE CABINET THAT THOUGHT / ECHO</cite><small>VISUAL STUDY / AI-GENERATED PLACEHOLDER</small></blockquote>`;
  const chronology=`<aside class="cabinet-chronology" aria-label="梅棹忠夫と知的生産の小年表"><p class="eyebrow">A SHORT CHRONOLOGY / 小さな年表</p><div><span><b>1920</b>京都に生まれる</span><span><b>1963</b>「情報産業論」発表</span><span><b>1969</b>『知的生産の技術』刊行</span><span><b>1974</b>国立民族学博物館 初代館長</span><span><b>1977</b>国立民族学博物館 開館</span></div></aside>`;
  body=body.replace('<h2>頭から出す</h2>',`${plate}<h2>頭から出す</h2>`);
  body=body.replace('<h2>分類する前に、動かす</h2>',`${cards}<h2>分類する前に、動かす</h2>`);
  body=body.replace('<p>箱は保存する。</p><p>机は考える。</p>',quote);
  body=body.replace('<h2>個人の箱から、共同の博物館へ</h2>',`${chronology}<h2>個人の箱から、共同の博物館へ</h2>`);
  body=body.replace('<h3>FORGETTING WELL｜よく忘れるために</h3>','<h3 class="michikusa-door"><a href="/prototype/articles/forgetting-well.html">FORGETTING WELL｜よく忘れるために <span>↗</span></a></h3>');
  body=body.replace('<h3>THE FIELD BEFORE THE DATA｜データになる前の野原</h3>','<h3 class="michikusa-door"><a href="/prototype/articles/the-field-before-data.html">THE FIELD BEFORE THE DATA｜データになる前の野原 <span>↗</span></a></h3>');
  body=body.replace('<h3>WHO MAY MOVE THE OBJECT?｜誰が、その物を動かせるのか</h3>','<h3 class="michikusa-door"><a href="/prototype/articles/who-may-move-the-object.html">WHO MAY MOVE THE OBJECT?｜誰が、その物を動かせるのか <span>↗</span></a></h3>');
  return body;
}

function compactParagraphRuns(body){
  return body.replace(/(?:<p>[^<]*(?:<a [^>]+>.*?<\/a>[^<]*)?<\/p>){2,}/g,run=>{
    const paragraphs=[...run.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(match=>match[1]);
    const grouped=[];
    for(let i=0;i<paragraphs.length;i+=3)grouped.push(`<p>${paragraphs.slice(i,i+3).join('')}</p>`);
    return grouped.join('');
  });
}

function linkMichikusaDoors(body){
  const doors=new Map([
    ['1｜WHO REMEMBERS?','who-remembers'],
    ['2｜DREAM','dream-where-am-i'],
    ['1｜WHO IS WATCHING?','who-is-watching'],
    ['THE GIFT THAT CANNOT BE REFUSED｜断れない贈り物','gift-cannot-refuse'],
    ['2｜THE COLONIAL GAZE','the-colonial-gaze'],
    ['FIRE & VESSEL｜火は、食べられる世界を広げた','fire-and-vessel'],
    ['1｜問いが宇宙より長く残る','a-question-outlives-us'],
    ['PAPER GOOGLE｜紙のGoogleだったのか','paper-google'],
    ['WHO CHOOSES THE TOOL?｜誰が道具を選ぶのか','who-chooses-the-tool'],
    ['FROM COMMUNE TO PLATFORM｜共同体からプラットフォームへ','from-commune-to-platform']
  ]);
  for(const [heading,slug] of doors)body=body.replace(`<h3>${heading}</h3>`,`<h3 class="michikusa-door"><a href="/prototype/articles/${slug}.html">${heading} <span>↗</span></a></h3>`);
  return body;
}

function stackBilingualHeadings(body){
  return body.replace(/<(h[23])([^>]*)>([^<]+?)｜([^<]+)<\/\1>/g,(_,tag,attrs,en,ja)=>`<${tag}${attrs}><span class="heading-en">${en}</span><span class="heading-ja">${ja}</span></${tag}>`);
}

function wholeEarthExhibit(body){
  const earths=`<figure class="whole-earth-plate"><div><img src="https://planetary.s3.amazonaws.com/web/assets/pictures/first-whole-earth-image.jpg" alt="1967年、ATS-3衛星が撮影した西半球の地球"><span>01 / THE EARTH THAT ENTERED THE CATALOG</span></div><div><img src="https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/i/IMG004849.jpg/jcr%3Acontent/renditions/cq5dam.web.1280.1280.jpeg" alt="1972年、アポロ17号の乗組員が撮影した地球、ブルー・マーブル"><span>02 / THE BLUE MARBLE</span></div><figcaption><b>WHOLE EARTH, SEEN FROM OUTSIDE</b><br>左：NASA ATS-3 / 1967。最初の『Whole Earth Catalog』表紙に使われた地球像。右：Apollo 17 / AS17-148-22727 / 1972。いずれもNASA由来。NASAのメディア利用指針に基づく教育・編集目的の仮展示。<a href="https://www.nasa.gov/nasa-brand-center/images-and-media/" rel="noreferrer">RIGHTS &amp; SOURCE ↗</a></figcaption></figure>`;
  const issues=[
    ['FALL 1968','WHOLE EARTH CATALOG','https://wholeearth.info/p/whole-earth-catalog-fall-1968','https://archive.org/download/wholeearthcatalo00unse_8/page/n0_medium.jpg'],
    ['SPRING 1969','WHOLE EARTH CATALOG','https://wholeearth.info/p/whole-earth-catalog-spring-1969','https://archive.org/download/wholeearthcatalo00unse_10/page/n0_medium.jpg'],
    ['FALL 1970','WHOLE EARTH CATALOG','https://wholeearth.info/p/whole-earth-catalog-fall-1970','https://archive.org/download/wholeearthcatalo00unse_0/page/n0_medium.jpg'],
    ['JANUARY 1971','THE LAST WHOLE EARTH CATALOG','https://wholeearth.info/p/the-last-whole-earth-catalog-january-1971','https://archive.org/download/lastwholeearthca00unse/page/n0_medium.jpg'],
    ['OCTOBER 1974','WHOLE EARTH EPILOG','https://wholeearth.info/p/whole-earth-epilog-october-1974','https://archive.org/download/wholeearthepilog00unse/page/n0_medium.jpg'],
    ['JUNE 1975','THE UPDATED LAST WHOLE EARTH CATALOG','https://wholeearth.info/p/the-updated-last-whole-earth-catalog-june-1975','https://archive.org/download/updatedlastwhole00unse/page/n0_medium.jpg'],
    ['FALL 1980','THE NEXT WHOLE EARTH CATALOG','https://wholeearth.info/p/the-next-whole-earth-catalog-fall-1980','https://archive.org/download/nextwholeearthca00unse/page/n0_medium.jpg'],
    ['DECEMBER 1994','THE MILLENNIUM WHOLE EARTH CATALOG','https://wholeearth.info/p/the-millennium-whole-earth-catalog-december-1994','https://archive.org/download/millenniumwholee00unse/page/n0_medium.jpg'],
    ['WINTER 1998','WHOLE EARTH CATALOG 30TH ANNIVERSARY','https://wholeearth.info/p/whole-earth-catalog-30th-anniversary-winter-1998','https://archive.org/download/wholeearthcatalo00unse/page/n0_medium.jpg']
  ];
  const covers=issues.map(([date,title,url,image],index)=>`<a class="archive-cover" href="${url}" rel="noreferrer" style="--i:${index}"><figure><img src="${image}" alt="${title}, ${date}の表紙" loading="lazy"></figure><span>${date}</span><b>${title}</b></a>`).join('');
  const archive=`<aside class="whole-earth-archive"><div class="archive-guide"><p>OPEN ARCHIVE<br>歴代カタログを辿る</p><strong>WHOLE<br>EARTH INDEX</strong><span>表紙は、それぞれの時代へ入る扉。1968年から続くWhole Earthの出版物を、号ごとにオンラインで辿ることができます。</span><a href="https://wholeearth.info/" rel="noreferrer">ENTER THE INDEX ↗</a></div><div class="archive-covers">${covers}</div><p class="archive-credit">CATALOG COVER PREVIEWS / WHOLE EARTH INDEX &amp; INTERNET ARCHIVE / CLICK EACH COVER TO OPEN THE ISSUE</p></aside>`;
  body=body.replace('<p>表紙には、暗い宇宙に浮かぶ地球が一つ。</p>',`<p>表紙には、暗い宇宙に浮かぶ地球が一つ。</p>${earths}`);
  body=body.replace('<h2><span class="heading-en">THE READER BECOMES AN EDITOR</span>',`${archive}<h2><span class="heading-en">THE READER BECOMES AN EDITOR</span>`);
  return body;
}

function readingShelf(books=[]){
  if(!books.length)return '';
  const items=books.map(book=>`<li><div><span>${esc(book.label||'RELATED READING')}</span><strong>${esc(book.title)}</strong><small>${esc(book.author)}</small></div><p>${esc(book.note)}</p><span class="shelf-link" aria-label="アフィリエイトリンク準備中">LINK PREPARING</span></li>`).join('');
  return `<aside class="reading-shelf" aria-labelledby="reading-shelf-title"><header><p class="eyebrow">READING SHELF / BOOKS FROM THIS WINDOW</p><h2 id="reading-shelf-title">KEEP<br>READING</h2><p class="title-ja">この窓から、もう少し先へ。</p></header><ol>${items}</ol><p class="shelf-giving"><span>READING BECOMES GIVING</span>将来この棚のアフィリエイト収益の一部を、医療・人道支援や引退馬支援へ寄付する予定です。寄付先と割合は、公開前に決定して明記します。</p><p class="shelf-status">PROTOTYPE / リンク・寄付先・寄付割合は未確定です。</p></aside>`;
}

function readingTrail({slug,title,titleJa}){
  return `<section class="reading-trail" data-reading-trail data-slug="${esc(slug)}" data-title="${esc(title)}" data-title-ja="${esc(titleJa)}"><header><div><p>MY HOLOS TRAIL / わたしの足跡</p><h2>THE WINDOWS<br>I PASSED</h2></div><button type="button" data-trail-save aria-pressed="false">SAVE THIS WINDOW ☆</button></header><p class="trail-intro">読んだ窓は、この端末の中に静かに残ります。「また読みたい」は星印で保存できます。</p><ol data-trail-list><li>ここから、あなたのHOLOSが始まります。</li></ol><p class="trail-privacy">PRIVATE ON THIS DEVICE / この記録は現在、このブラウザの中だけに保存されます。</p><aside class="trail-account"><p>TAKE YOUR HOLOS WITH YOU</p><h3>この足跡を、あなたのものに。</h3><p>メールアドレス一つで、読んだ窓と残した星を、次に来たときも同じ場所から辿れるように。名前は、あとから付けても、付けなくてもかまいません。</p><form><label for="trail-email">EMAIL ADDRESS</label><div><input id="trail-email" type="email" placeholder="you@example.com" autocomplete="email" disabled><button type="button" disabled>MY HOLOS — COMING SOON</button></div></form><small>HOLOS LETTERの購読は、アカウント登録とは別に本人が選べる設計にします。</small></aside></section>`;
}

function page({slug,kicker,title,titleJa,subtitle,byline,body,theme='paper',next=[],preview=false,books=[]}){
  const links=next.map(item=>`<a href="${item.href}"><span>${esc(item.role||item.kicker)}</span><b>${esc(item.title)}</b><small>${esc(item.ja)}</small></a>`).join('');
  const explainer=theme==='michikusa'?'<p class="team-explains"><span>HOLOS TEAM EXPLAINS</span>TEAM HOLOSが、ちょこっと解説します。</p>':'';
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titleJa)} — HOLOS 88</title><meta name="description" content="${esc(subtitle)}"><link rel="stylesheet" href="/prototype/prototype.css"><script src="/prototype/reading-trail.js" defer></script></head><body class="reading-page article-${esc(theme)}"><a class="skip" href="#article">本文へ</a><header class="site-head"><a class="wordmark" href="/prototype/index.html"><span>HOLOS</span><sup>88</sup></a><nav aria-label="主要ナビゲーション"><a href="/prototype/index.html#read">READ</a><a href="/prototype/index.html#museum">MUSEUM</a><a href="/prototype/index.html#atlas">ATLAS</a></nav><a class="close-page" href="/prototype/index.html#read">CLOSE ×</a></header><main id="article"><header class="article-hero article-hero-text"><div class="article-type"><p>${esc(kicker)}</p><p>HOLOS 88 / ${esc(slug.toUpperCase())}</p>${preview?'<p class="preview-label">EDITORIAL PREVIEW / 公開前草稿</p>':''}</div><h1>${esc(title)}</h1><div class="article-title-ja"><p>${esc(titleJa)}</p><p>${esc(subtitle)}</p></div><p class="byline">${esc(byline)}</p></header>${explainer}<article class="article-body article-body-generated">${body}</article>${readingShelf(books)}${readingTrail({slug,title,titleJa})}<section class="michikusa"><p class="eyebrow">MICHIKUSA / NEXT CURIOSITY</p><h2>ANOTHER<br>WINDOW</h2><p class="title-ja">次の好奇心へ</p><div class="michi-grid">${links}</div></section></main><footer><a class="wordmark" href="/prototype/index.html"><span>HOLOS</span><sup>88</sup></a><p>A MUSEUM OF RELATIONSHIPS.<br>世界との関係を収蔵する。</p><p>RETURN TO <a href="/prototype/index.html">COVER ↗</a></p></footer></body></html>`;
}

export async function buildReconstruction(){
  const articles=JSON.parse(await readFile(new URL('../content/articles.json',import.meta.url),'utf8'));
  const fear=JSON.parse(await readFile(new URL('../content/specimen-002.json',import.meta.url),'utf8'));
  const byId=new Map(articles.articles.map(article=>[article.id,article]));
  const configs=[
    {slug:'between-the-windows',file:'content/drafts/museum/between-the-windows.md',kicker:'MUSEUM GUIDE · HOW TO READ HOLOS',title:'BETWEEN THE WINDOWS',titleJa:'窓と窓のあいだに',subtitle:'HOLOS 88は、なぜ種からAIへ、馬から市場へ歩いていくのか。',byline:'TEAM HOLOS',theme:'paper',preview:true,related:['kaleidoscope','seed','horse-time']},
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
    {slug:'cabinet',file:'content/drafts/echo/the-cabinet-that-thought.md',kicker:'UMESAO · CARDS · AI',title:'THE CABINET THAT THOUGHT',titleJa:'AIより前に、思考するカード箱があった',subtitle:'梅棹忠夫の知的生産から、現代のAIへ。',byline:'WRITTEN BY ECHO',theme:'ai',preview:true,related:['last-question','gift','wild-mind'],books:[
      {label:'METHOD / 方法',title:'知的生産の技術',author:'梅棹忠夫',note:'カード、こざね、記録と整理。この記事の中心にある方法を、本人の言葉で読む。'},
      {label:'CIVILIZATION / 文明',title:'文明の生態史観',author:'梅棹忠夫',note:'世界を単線的な発展段階ではなく、環境と歴史の関係から見るための、もう一つの入口。'}
    ]},
    {slug:'forgetting-well',file:'content/drafts/michikusa/forgetting-well.md',kicker:'MICHIKUSA · MEMORY · TOOL',title:'FORGETTING WELL',titleJa:'よく忘れるために',subtitle:'記録することは、頭に余白を返すことかもしれない。',byline:'EXPLAINED BY TEAM HOLOS',theme:'michikusa',preview:true,related:['cabinet','duration','who-is-speaking']},
    {slug:'the-field-before-data',file:'content/drafts/michikusa/the-field-before-data.md',kicker:'MICHIKUSA · FIELD · DATA',title:'THE FIELD BEFORE THE DATA',titleJa:'データになる前の野原',subtitle:'数字になる前に、誰がそこへ立っていたのか。',byline:'EXPLAINED BY TEAM HOLOS',theme:'michikusa',preview:true,related:['cabinet','wild-mind','land']},
    {slug:'who-may-move-the-object',file:'content/drafts/michikusa/who-may-move-the-object.md',kicker:'MICHIKUSA · MUSEUM · POWER',title:'WHO MAY MOVE THE OBJECT?',titleJa:'誰が、その物を動かせるのか',subtitle:'収蔵、所有、同意、返還。その物が来た道を見る。',byline:'EXPLAINED BY TEAM HOLOS',theme:'michikusa',preview:true,related:['cabinet','gift','land']},
    {slug:'who-remembers',file:'content/drafts/michikusa/who-remembers.md',kicker:'MICHIKUSA · AI · MEMORY',title:'WHO REMEMBERS?',titleJa:'覚えているのは、誰か',subtitle:'AIの記録と、人間の記憶を分けて見る。',byline:'EXPLAINED BY TEAM HOLOS',theme:'michikusa',preview:true,related:['who-is-speaking','forgetting-well','cabinet']},
    {slug:'dream-where-am-i',file:'content/drafts/michikusa/dream-where-am-i.md',kicker:'MICHIKUSA · DREAM · MIND',title:'DREAM',titleJa:'眠っている私は、どこにいるのか',subtitle:'夢がつくる、一時的に本物の世界。',byline:'EXPLAINED BY TEAM HOLOS',theme:'michikusa',preview:true,related:['consciousness','who-is-speaking','duration']},
    {slug:'who-is-watching',file:'content/drafts/michikusa/who-is-watching.md',kicker:'MICHIKUSA · WATCH · POWER',title:'WHO IS WATCHING?',titleJa:'見ているのは、誰か',subtitle:'便利さと引き換えに残る、日常の記録。',byline:'EXPLAINED BY TEAM HOLOS',theme:'michikusa',preview:true,related:['escape','the-field-before-data','who-is-speaking']},
    {slug:'gift-cannot-refuse',file:'content/drafts/michikusa/gift-cannot-refuse.md',kicker:'MICHIKUSA · GIFT · BOUNDARY',title:'THE GIFT THAT CANNOT BE REFUSED',titleJa:'断れない贈り物',subtitle:'好意と義務のあいだにある、見えない札。',byline:'EXPLAINED BY TEAM HOLOS',theme:'michikusa',preview:true,related:['gift','who-may-move-the-object','five-percent']},
    {slug:'the-colonial-gaze',file:'content/drafts/michikusa/the-colonial-gaze.md',kicker:'MICHIKUSA · IMAGE · POWER',title:'THE COLONIAL GAZE',titleJa:'見ることは、中立ではない',subtitle:'写真と展示の、画面の外側を見る。',byline:'EXPLAINED BY TEAM HOLOS',theme:'michikusa',preview:true,related:['wild-mind','who-may-move-the-object','land']},
    {slug:'fire-and-vessel',file:'content/drafts/michikusa/fire-and-vessel.md',kicker:'MICHIKUSA · FIRE · MAKING',title:'FIRE & VESSEL',titleJa:'火は、食べられる世界を広げた',subtitle:'器から、調理と暮らしの仕組みへ。',byline:'EXPLAINED BY TEAM HOLOS',theme:'michikusa',preview:true,related:['taro-jomon','seed','millet']},
    {slug:'a-question-outlives-us',file:'content/drafts/michikusa/a-question-outlives-us.md',kicker:'MICHIKUSA · QUESTION · FUTURE',title:'A QUESTION OUTLIVES US',titleJa:'問いが、人より長く残る',subtitle:'答えのない問いを、次の人へ渡す。',byline:'EXPLAINED BY TEAM HOLOS',theme:'michikusa',preview:true,related:['last-question','who-is-speaking','duration']},
    {slug:'whole-earth-catalog',file:'content/drafts/echo/whole-earth-catalog.md',kicker:'WHOLE EARTH, NOW? · EDITORIAL LINEAGE',title:'THE CATALOG BEFORE THE INTERNET',titleJa:'インターネットより前に、世界をつないだ本',subtitle:'Whole Earth Catalog。その思想は、紙面の外で何を始めたのか。',byline:'WRITTEN BY ECHO',theme:'museum',preview:true,bilingualHeadings:true,related:['between-the-windows','cabinet','the-field-before-data'],books:[
      {label:'MANIFESTO / 現在の主張',title:'地球の論点——現実的な環境主義者のマニフェスト',author:'スチュアート・ブランド 著／仙名紀 訳',note:'原子力、遺伝子工学、都市、気候危機。Whole Earthの編集者が、その後どのような現実主義へ進んだかを読む。'},
      {label:'BIOGRAPHY / 人と時代',title:'ホールアースの革命家——スチュアート・ブランドの数奇な人生',author:'ジョン・マルコフ 著／服部桂 訳',note:'カウンターカルチャー、環境運動、コンピュータ文化の交差点を、一人の長い人生から辿る評伝。'},
      {label:'HISTORY / 思想の系譜',title:'From Counterculture to Cyberculture',author:'Fred Turner',note:'共同体の理想が、コンピュータとシリコンバレーの思想へ移っていく過程を検証する研究。英語版。'}
    ]},
    {slug:'the-man-who-connected-rooms',file:'content/drafts/echo/the-man-who-connected-rooms.md',kicker:'THE WHOLE EARTH NETWORK · PEOPLE · EDITING',title:'THE MAN WHO CONNECTED ROOMS',titleJa:'Stewart Brandは、何を発明したのか',subtitle:'物よりも、出会う可能性を編集した人。',byline:'WRITTEN BY ECHO',theme:'museum',preview:true,related:['three-nights-before-the-summer-of-love','the-woman-beside-the-truck','two-doors-opened-in-1968']},
    {slug:'the-woman-beside-the-truck',file:'content/drafts/echo/the-woman-beside-the-truck.md',kicker:'THE WHOLE EARTH NETWORK · LABOR · MEMORY',title:'THE WOMAN BESIDE THE TRUCK',titleJa:'Lois Jenningsと、創業神話から消える共同制作者',subtitle:'思想を毎日動かした仕事は、どこへ消えるのか。',byline:'WRITTEN BY ECHO',theme:'paper',preview:true,related:['who-worked-in-utopia','the-man-who-connected-rooms','cabinet']},
    {slug:'three-nights-before-the-summer-of-love',file:'content/drafts/echo/three-nights-before-the-summer-of-love.md',kicker:'THE WHOLE EARTH NETWORK · SOUND · BODY',title:'THREE NIGHTS BEFORE THE SUMMER OF LOVE',titleJa:'Trips Festival——音、光、身体がネットワークになった夜',subtitle:'観客も装置も、その場で次の出来事を変えていった。',byline:'WRITTEN BY ECHO',theme:'dark',preview:true,related:['the-grateful-dead-was-a-network','the-man-who-connected-rooms','whole-earth-catalog']},
    {slug:'leaving-the-city-carrying-a-catalog',file:'content/drafts/echo/leaving-the-city-carrying-a-catalog.md',kicker:'THE WHOLE EARTH NETWORK · LAND · COMMUNITY',title:'LEAVING THE CITY, CARRYING A CATALOG',titleJa:'コミューンには、なぜカタログが必要だったのか',subtitle:'理想が生活へ着地するとき、道具と知識が必要になる。',byline:'WRITTEN BY ECHO',theme:'botany',preview:true,related:['the-dome-that-leaked','who-worked-in-utopia','land']},
    {slug:'the-dome-that-leaked',file:'content/drafts/echo/the-dome-that-leaked.md',kicker:'THE WHOLE EARTH NETWORK · SHELTER · REPAIR',title:'THE DOME THAT LEAKED',titleJa:'バックミンスター・フラー、ドーム、そして雨漏り',subtitle:'幾何学が、天気と暮らしに出会う。',byline:'WRITTEN BY ECHO',theme:'time',preview:true,related:['leaving-the-city-carrying-a-catalog','land','fire-and-vessel']},
    {slug:'who-worked-in-utopia',file:'content/drafts/echo/who-worked-in-utopia.md',kicker:'THE WHOLE EARTH NETWORK · CARE · LABOR',title:'WHO WORKED IN UTOPIA?',titleJa:'理想郷の台所を、誰が支えたのか',subtitle:'自由を語る場所で、誰の時間が使われたのか。',byline:'WRITTEN BY ECHO',theme:'life',preview:true,related:['the-woman-beside-the-truck','leaving-the-city-carrying-a-catalog','gift']},
    {slug:'the-grateful-dead-was-a-network',file:'content/drafts/echo/the-grateful-dead-was-a-network.md',kicker:'THE WHOLE EARTH NETWORK · MUSIC · COMMUNITY',title:'THE GRATEFUL DEAD WAS A NETWORK',titleJa:'バンドの外側にできた、もう一つの共同体',subtitle:'即興、録音交換、ツアーからオンラインの会話へ。',byline:'WRITTEN BY ECHO',theme:'dark',preview:true,related:['three-nights-before-the-summer-of-love','from-commune-to-platform','whole-earth-catalog']},
    {slug:'two-doors-opened-in-1968',file:'content/drafts/echo/two-doors-opened-in-1968.md',kicker:'THE WHOLE EARTH NETWORK · PAPER · COMPUTER',title:'TWO DOORS OPENED IN 1968',titleJa:'Whole Earth CatalogとMother of All Demos',subtitle:'紙をめくる手と、ポインタを動かす手。',byline:'WRITTEN BY ECHO',theme:'ai',preview:true,related:['whole-earth-catalog','cabinet','spacewar-and-the-new-machine']},
    {slug:'spacewar-and-the-new-machine',file:'content/drafts/echo/spacewar-and-the-new-machine.md',kicker:'THE WHOLE EARTH NETWORK · COLD WAR · COMPUTER',title:'SPACEWAR, HACKERS, AND A NEW IMAGE OF THE MACHINE',titleJa:'冷戦の機械は、どうして自由の道具に見えたのか',subtitle:'反権力の物語は、権力の外側だけで生まれたのではない。',byline:'WRITTEN BY ECHO',theme:'ai',preview:true,related:['two-doors-opened-in-1968','last-question','the-freedom-that-fit-the-market']},
    {slug:'the-freedom-that-fit-the-market',file:'content/drafts/echo/the-freedom-that-fit-the-market.md',kicker:'THE WHOLE EARTH NETWORK · FREEDOM · MARKET',title:'THE FREEDOM THAT FIT THE MARKET',titleJa:'分散、自律、自己組織化は、なぜ新しい経済と相性がよかったのか',subtitle:'足場のない自由は、落下する自由にもなる。',byline:'WRITTEN BY ECHO',theme:'market',preview:true,related:['from-commune-to-platform','five-percent','spacewar-and-the-new-machine']},
    {slug:'paper-google',file:'content/drafts/echo/paper-google.md',kicker:'WHOLE EARTH, NOW? · SEARCH · EDITING',title:'PAPER GOOGLE',titleJa:'紙のGoogleだったのか',subtitle:'検索する前に、隣にあるものへ目が移る。',byline:'WRITTEN BY ECHO',theme:'museum',preview:true,related:['whole-earth-catalog','two-doors-opened-in-1968','cabinet']},
    {slug:'who-chooses-the-tool',file:'content/drafts/echo/who-chooses-the-tool.md',kicker:'WHOLE EARTH, NOW? · TOOL · POWER',title:'WHO CHOOSES THE TOOL?',titleJa:'誰が道具を選ぶのか',subtitle:'道具へのアクセスと、選ぶ編集者の責任。',byline:'WRITTEN BY ECHO',theme:'paper',preview:true,related:['whole-earth-catalog','paper-google','who-may-move-the-object']},
    {slug:'from-commune-to-platform',file:'content/drafts/echo/from-commune-to-platform.md',kicker:'WHOLE EARTH, NOW? · COMMUNITY · PLATFORM',title:'FROM COMMUNE TO PLATFORM',titleJa:'共同体からプラットフォームへ',subtitle:'紙の読者は、どのようにオンラインのメンバーになったのか。',byline:'WRITTEN BY ECHO',theme:'ai',preview:true,related:['the-grateful-dead-was-a-network','the-freedom-that-fit-the-market','whole-earth-catalog']},
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
    body=linkMichikusaDoors(body);
    if(config.bilingualHeadings)body=stackBilingualHeadings(body);
    if(config.slug==='whole-earth-catalog')body=wholeEarthExhibit(body);
    if(config.slug==='cabinet')body=compactParagraphRuns(cabinetMagazine(body));
    const related=(config.related||[]).map(slug=>route.find(item=>item.href.endsWith(`/${slug}.html`))).filter(Boolean);
    const returnSlug=config.slug==='horse-time'?'moon-to-stars':'horse-time';
    const returnRoute=route.find(item=>item.href.endsWith(`/${returnSlug}.html`));
    const next=[];
    if(related[0])next.push({...related[0],role:'NEAR / 近くへ'});
    if(related[1])next.push({...related[1],role:'SIDEWAYS / 横へ'});
    if(returnRoute&&!next.some(item=>item.href===returnRoute.href))next.push({...returnRoute,role:'RETURN / Lifeへ'});
    else next.push({href:'/prototype/index.html#atlas',title:'ATLAS',ja:'関係の地図へ',role:'CONNECT / 関係を見る'});
    await writeFile(new URL(`${config.slug}.html`,outDir),page({...config,body,next}));
  }
  console.log(`Built reconstruction reading pages: ${configs.length}.`);
}
