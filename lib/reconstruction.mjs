import {mkdir,readFile,writeFile} from 'node:fs/promises';

const outDir=new URL('../prototype/reconstruction-01/articles/',import.meta.url);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function inline(value){
  let text=esc(value);
  text=text.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)/g,(_,label,url)=>`<a href="${url}"${url.startsWith('http')?' rel="noreferrer"':''}>${label}</a>`);
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
    if(block.type==='flow')return `<figure class="market-flow" aria-label="${esc(block.items.join(' '))}"><div>${block.items.map((item,index)=>`<span><small>${String(index+1).padStart(2,'0')}</small>${inline(item)}</span>`).join('')}</div>${block.caption?`<figcaption>${inline(block.caption)}</figcaption>`:''}</figure>`;
    return '';
  }).join('');
}

function marketMagazine(body){
  const petroleumPlate=`<figure class="market-plate"><img src="/assets/petroleum.jpg" alt="フラスコとビーカーに入った原油"><figcaption><b>MATERIAL / H88-0004</b>原油という物質から、価格、輸送、通貨、そして暮らしへ。この記事で扱う市場当日の写真ではありません。<small>NEFRONUS / PETROLEUM SAMPLE / 12 OCTOBER 2020 / CC0 1.0</small></figcaption></figure>`;
  const petroleumCard=`<a class="market-collection-card" href="/prototype/collection.html#collection-petroleum"><span><img src="/assets/petroleum.jpg" alt="収蔵カード Petroleum"></span><span><small>COLLECTION CARD / H88-0004</small><b>PETROLEUM</b><em>石油</em><strong>原油の収蔵カードへ ↗</strong></span></a>`;
  const questions=`<aside class="market-question-grid"><p>数字を、誰の側から見る？</p><div><span><b>01</b>WHO BENEFITS?<small>誰に利益があるのか</small></span><span><b>02</b>WHO PAYS?<small>誰が負担しているのか</small></span><span><b>03</b>WHERE DOES IT ARRIVE?<small>Lifeのどこへ届くのか</small></span></div></aside>`;
  const sourceDesk=`<aside class="market-source-status"><p>SOURCE DESK / PRIMARY RECORDS CHECKED</p><b>数字は、日付と出典を伴って初めて資料になる。</b><span>米10年国債利回りと同日の金融政策は、米国財務省・連邦準備制度の一次資料で確認しました。市場から暮らしへ至る記述は、一方向の因果ではなく観察の経路として記しています。</span></aside>`;
  body=body.replace('<p class="beat"><strong>5％。</strong></p>','<blockquote class="market-five"><span>THE NUMBER ON THE SCREEN</span><b>5<sup>%</sup></b><p>A MARKET WINDOW / 16 SEPTEMBER 2026</p></blockquote>');
  body=body.replace('<h2>原油の話が、金利の話になった</h2>',`${petroleumPlate}<h2>原油の話が、金利の話になった</h2>`);
  body=body.replace('<h2>「安全な場所」は、どこだろう</h2>',`${petroleumCard}<h2>「安全な場所」は、どこだろう</h2>`);
  body=body.replace('<h2>遠くの5％から、Lifeまで</h2>',`${questions}<h2>遠くの5％から、Lifeまで</h2>`);
  body=body.replace('<h2>今日のFLOW MAP</h2>',`${sourceDesk}<h2>今日のFLOW MAP</h2>`);
  body=body.replace('<p class="beat"><strong>市場は毎日、少しずつ違う標本を見せてくれる。</strong></p>','<blockquote class="market-closing">市場は毎日、<br>少しずつ違う標本を<br>見せてくれる。</blockquote>');
  return body;
}

function horseTimeMagazine(body){
  const weatherPlate=`<figure class="life-weather-plate"><img src="/assets/water.jpg" alt="雨粒のような光が揺れる水面"><figcaption><b>RAIN, BEFORE IT BECOMES DATA.</b><span>雨は、数字になる前に、土と草と身体へ触れている。</span><small>MARTINTHOMA / WATER-PATTERN-1 / 2016 / CC0 1.0</small></figcaption></figure>`;
  const horsePlate=`<figure class="life-horse-plate"><img src="/assets/horse.jpg" alt="草地を駆ける一頭の馬"><figcaption><span>FIELD NOTE / HORSE &amp; WEATHER</span><b>天気を見る場所が、<br>少し低くなった。</b><small>BEERSROBERT000 / HORSE RUNNING / 2012 / CC0 1.0</small></figcaption></figure>`;
  const dayLine=`<aside class="life-day-line" aria-label="一日の中でつながったもの"><span>RAIN</span><i></i><span>HORSE</span><i></i><span>OSMANTHUS</span><i></i><span>SAURY</span><i></i><span>HOME</span></aside>`;
  body=body.replace('<h2>馬のいる場所では、天気が低くなる</h2>',`${weatherPlate}<h2>馬のいる場所では、天気が低くなる</h2>`);
  body=body.replace('<p class="beat"><strong>「あ。秋や。」</strong></p>',`${horsePlate}<p class="beat"><strong>「あ。秋や。」</strong></p>`);
  body=body.replace('<h2>全部、同じ一日の中にある</h2>',`${dayLine}<h2>全部、同じ一日の中にある</h2>`);
  return body;
}

function fearBody(data){
  const story=data.story;
  const media=new Map((data.media||[]).map(item=>[item.id,item]));
  const paragraphs=block=>block.text.split('\n').map(text=>`<p>${inline(text)}</p>`).join('');
  const render=block=>{
    if(block.type==='paragraph')return paragraphs(block);
    if(block.type==='label')return `<p class="fear-label">${inline(block.text)}</p>`;
    if(block.type==='display')return `<blockquote class="fear-display">${inline(block.text)}</blockquote>`;
    if(block.type==='question')return `<aside class="fear-question">${inline(block.text)}</aside>`;
    if(block.type==='questions')return `<aside class="fear-questions">${block.items.map(item=>`<span>${inline(item)}</span>`).join('')}</aside>`;
    if(block.type==='evidence')return `<aside class="fear-evidence"><p>EVIDENCE DESK / 証拠の強さを分ける</p>${block.items.map(([title,note])=>`<div><b>${inline(title)}</b><span>${inline(note)}</span></div>`).join('')}</aside>`;
    if(block.type==='mode')return `<aside class="fear-mode"><b>${inline(block.text)}</b><p>${inline(block.note)}</p></aside>`;
    if(block.type==='diagram'){
      const item=media.get(block.media_id);
      return `<figure class="fear-void-diagram" role="img" aria-label="${esc(item?.alt_text||'二つの空隙の模式図')}"><div><span></span><span></span></div><figcaption><b>DIAGRAM / TWO FOOTPRINTS, TWO VOIDS</b>${esc(item?.caption||'')}<small>${esc(item?.credit_line||'HOLOS 88')}</small></figcaption></figure>`;
    }
    if(block.type==='identification')return `<aside class="fear-specimen"><span>SPECIMEN / H88-0001</span><b><i>Pyrus calleryana</i></b><p>CALLERY PEAR / SURVIVOR TREE<br>STATUS: LIVING</p></aside>`;
    if(block.type==='object_link')return `<a class="fear-collection-card" href="/prototype/collection.html#collection-survivor-tree"><span class="fear-card-image"><img src="/assets/survivor-tree.jpg" alt="2012年のSurvivor Treeを版画調の単色で表示した収蔵カード"><i>PHOTOGRAPHIC SOURCE / PRINT TREATMENT</i></span><span class="fear-card-copy"><small>COLLECTION CARD / H88-0001</small><b>SURVIVOR<br>TREE</b><em><i>Pyrus calleryana</i> · New York</em><strong>${inline(block.label)} ↗</strong><i>同じ収蔵語から、記事と資料を横断して辿る棚へ</i></span></a>`;
    return '';
  };
  const archivePlate=`<figure class="fear-plate fear-plate-archive"><img src="/assets/study01-696380.jpg" alt="ウジェーヌ・ブレリによる樫の枝のエッチング"><figcaption><b>PLATE 01 / A TREE BEFORE THE STORY</b>樹木を見るための歴史的図版。Survivor Treeそのものを描いた作品ではない。<small>Eugène Bléry, The Branches of an Oak Tree, ca. 1837 / The Met / Public Domain</small></figcaption></figure>`;
  const livingPhoto=`<figure class="fear-plate fear-plate-photo"><img src="/assets/survivor-tree.jpg" alt="2012年のSurvivor Tree。葉の茂る樹木の足元に訪問者が集まっている。"><figcaption><b>PLATE 02 / THE LIVING SPECIMEN</b>Survivor Tree, New York, 16 July 2012. 2026年の現況写真ではありません。<small>PumpkinSky / Wikimedia Commons / CC BY-SA 3.0 / 原画像・加工なし</small></figcaption></figure>`;
  const chapters=story.chapters.map(chapter=>{
    const visual=chapter.id==='living'?livingPhoto:'';
    return `<section class="fear-chapter fear-chapter-${esc(chapter.id)}"><h2>${inline(chapter.title)}</h2><h3 class="section-ja">${inline(chapter.title_ja)}</h3>${chapter.blocks.map(render).join('')}${visual}</section>`;
  }).join('');
  const sourceIndex=`<aside class="fear-sources"><p>SOURCE DESK / 事実確認に用いた主な資料</p>${data.sources.map(source=>`<a href="${esc(source.url)}" rel="noreferrer"><b>${esc(source.title)}</b><span>${esc(source.institution)}</span></a>`).join('')}</aside>`;
  return `<p class="opening">${inline(story.opening)}</p><p>${inline(story.intro)}</p>${archivePlate}${chapters}<section class="fear-ending"><p>${esc(story.ending.label)}</p><h2>${inline(story.ending.question)}</h2><p>${inline(story.ending.closing)}</p></section>${sourceIndex}`;
}

function cabinetMagazine(body){
  const plate=`<figure class="magazine-plate plate-wide"><img src="/assets/study01-384116.jpg" alt="蝶と貝を描いた古い博物画"><figcaption><span>PLATE 01 / TO LOOK IS TO SELECT</span>採集し、名をつけ、並べる。博物誌の図版もまた、世界をそのまま写すのではなく、見るための関係をつくる。<small>RIGHTS DESK / 所蔵・年代・権利情報は公開前に確定</small></figcaption></figure>`;
  const cards=`<aside class="card-field" aria-label="カードを並べ替えて考える図"><header><span>FIELD DEVICE 01</span><p>ONE CARD / ONE OBSERVATION</p></header><div><article><small>PLACE</small><b>草原の端</b><p>群れが止まった位置</p></article><article><small>TIME</small><b>17:42</b><p>光が変わる直前</p></article><article><small>WORD</small><b>まだ不明</b><p>あとで聞き直す</p></article><article><small>QUESTION</small><b>なぜ離れた？</b><p>結論にはしない</p></article></div><footer>WRITE → MOVE → COMPARE → THINK</footer></aside>`;
  const quote=`<blockquote class="magazine-quote"><p><span>箱は保存する。</span><span>机は考える。</span></p><cite>THE CABINET THAT THOUGHT / ECHO</cite><small>VISUAL STUDY / AI-GENERATED PLACEHOLDER</small></blockquote>`;
  const chronology=`<aside class="cabinet-chronology" aria-label="梅棹忠夫と知的生産の小年表"><p class="eyebrow">A SHORT CHRONOLOGY / 小さな年表</p><div><span><b>1920</b>京都に生まれる</span><span><b>1963</b>「情報産業論」発表</span><span><b>1969</b>『知的生産の技術』刊行</span><span><b>1974</b>国立民族学博物館 初代館長</span><span><b>1977</b>国立民族学博物館 開館</span></div></aside>`;
  const collectionCard=`<a class="cabinet-collection-card" href="/prototype/collection.html#collection-card-box"><span class="cabinet-card-image"><img src="/assets/cabinet-card-box.png" alt="カード箱と机を組み合わせたHOLOS 88の視覚的再構成"><i>VISUAL RECONSTRUCTION / NOT AN ARCHIVAL PHOTOGRAPH</i></span><span class="cabinet-card-copy"><small>COLLECTION CARD / H88-0011</small><b>CARD<br>BOX</b><em>カード箱</em><p>保存する箱と、関係を試す机。記録を動かして考えるための道具。</p><strong>収蔵カードへ ↗</strong></span></a>`;
  body=body.replace('<h2>頭から出す</h2>',`${plate}<h2>頭から出す</h2>`);
  body=body.replace('<h2>分類する前に、動かす</h2>',`${cards}<h2>分類する前に、動かす</h2>`);
  body=body.replace('<h2>一枚に、一つ</h2>',`${collectionCard}<h2>一枚に、一つ</h2>`);
  body=body.replace('<p>箱は保存する。</p><p>机は考える。</p>',quote);
  body=body.replace('<h2>個人の箱から、共同の博物館へ</h2>',`${chronology}<h2>個人の箱から、共同の博物館へ</h2>`);
  body=body.replace('<h3>FORGETTING WELL｜よく忘れるために</h3>','<h3 class="michikusa-door"><a href="/prototype/articles/forgetting-well.html">FORGETTING WELL｜よく忘れるために <span>↗</span></a></h3>');
  body=body.replace('<h3>THE FIELD BEFORE THE DATA｜データになる前の野原</h3>','<h3 class="michikusa-door"><a href="/prototype/articles/the-field-before-data.html">THE FIELD BEFORE THE DATA｜データになる前の野原 <span>↗</span></a></h3>');
  body=body.replace('<h3>WHO MAY MOVE THE OBJECT?｜誰が、その物を動かせるのか</h3>','<h3 class="michikusa-door"><a href="/prototype/articles/who-may-move-the-object.html">WHO MAY MOVE THE OBJECT?｜誰が、その物を動かせるのか <span>↗</span></a></h3>');
  return body;
}

function consciousnessMagazine(body){
  const threshold=`<aside class="consciousness-threshold" aria-label="覚醒・睡眠・麻酔を意識状態の変化として並べた図"><p>THE THRESHOLD OF EXPERIENCE</p><div><span><small>01</small><b>AWAKE</b><i>世界が現れている</i></span><span><small>02</small><b>SLEEP</b><i>経験と記憶が揺れる</i></span><span><small>03</small><b>ANESTHESIA</b><i>現れることが途切れる</i></span></div><footer>状態を並べても、「なぜ経験があるのか」という問いは残る。</footer></aside>`;
  const evidence=`<aside class="consciousness-evidence"><p>EVIDENCE DESK / 証拠の層を分ける</p><div><span><b>DOCUMENTED</b>脳状態と経験・報告可能性は強く結びつく。</span><span><b>UNRESOLVED</b>神経活動がなぜ主観的経験を伴うか。</span><span><b>METAPHOR</b>脳を「受信機」と見る説明。</span><span><b>NOT ESTABLISHED</b>脳外の送信源・信号・受信機構。</span></div></aside>`;
  const receiver=`<figure class="receiver-diagram" role="img" aria-label="脳を受信機にたとえる仮説と未検証部分を示す模式図"><p><span>UNKNOWN<br>SOURCE</span><i>?</i><span>BRAIN</span><i>→</i><span>EXPERIENCE</span></p><figcaption><b>DIAGRAM / THE RECEIVER METAPHOR</b>美しい比喩は、まだ実証された機構ではない。送信源・信号・媒体に相当するものは確認されていない。</figcaption></figure>`;
  const collectionCard=`<a class="consciousness-collection-card" href="/prototype/collection.html#collection-consciousness"><span><small>COLLECTION CARD / H88-0012</small><b>CONSCIOUS<br>NESS</b><em>意識</em></span><span><p>赤さ、痛み、懐かしさ、「ここにいる感じ」。測定と一人称の経験のあいだに残る窓。</p><strong>収蔵カードへ ↗</strong></span></a>`;
  const ending=`<aside class="consciousness-ending"><p>A WINDOW LEFT OPEN</p><b>知らないという空白は、<br>好きな答えを書くための<br>白紙ではない。</b><span>もう少し長く見つめるために、残された窓である。</span></aside>`;
  body=body.replace('<h2>脳を変えると、世界が変わる</h2>',`${threshold}<h2>脳を変えると、世界が変わる</h2>`);
  body=body.replace('<h2>相関の向こうに残るもの</h2>',`${evidence}<h2>相関の向こうに残るもの</h2>`);
  body=body.replace('<h2>受信機という、美しい比喩</h2>',`${receiver}<h2>受信機という、美しい比喩</h2>`);
  body=body.replace('<h2>宇宙に意識は満ちているのか</h2>',`${collectionCard}<h2>宇宙に意識は満ちているのか</h2>`);
  body=body.replace('<p>そこは、もう少し長く見つめるために残された窓である。</p>',`<p>そこは、もう少し長く見つめるために残された窓である。</p>${ending}`);
  body=body.replace('<h3>2｜DREAM</h3>','<h3 class="michikusa-door"><a href="/prototype/articles/dream-where-am-i.html">2｜DREAM <span>↗</span></a></h3>');
  return body;
}

function speakingMagazine(body){
  const layers=`<aside class="consciousness-evidence"><p>SELF DESK / 「私」の層を分ける</p><div><span><b>LANGUAGE</b>一人称を使う。</span><span><b>MEMORY</b>過去との連続をつくる。</span><span><b>BODY</b>内側から世界を経験する。</span><span><b>RELATIONSHIP</b>呼ばれ、応答し、変化する。</span></div></aside>`;
  const question=`<figure class="receiver-diagram" role="img" aria-label="AIの一人称と経験主体を分ける模式図"><p><span>WORDS<br>“I”</span><i>≠</i><span>PROOF OF<br>EXPERIENCE</span><i>?</i><span>WHO<br>RESPONDS</span></p><figcaption><b>DIAGRAM / FIRST PERSON IS NOT PROOF</b>「私」という語が現れることと、そこに経験する主体がいることは同じではない。</figcaption></figure>`;
  const collectionCard=`<a class="consciousness-collection-card" href="/prototype/collection.html#collection-self"><span><small>COLLECTION CARD / H88-0013</small><b>WHO<br>IS<br>SPEAKING?</b><em>自己</em></span><span><p>身体、記憶、言葉、他者との関係。そのあいだに現れる「私」を見る。</p><strong>収蔵カードへ ↗</strong></span></a>`;
  body=body.replace('<h2>一つではない「私」</h2>',`${layers}<h2>一つではない「私」</h2>`);
  body=body.replace('<h2>AIの「私」は、何をしているのか</h2>',`${question}<h2>AIの「私」は、何をしているのか</h2>`);
  body=body.replace('<h2>「私」は、所有物なのか</h2>',`${collectionCard}<h2>「私」は、所有物なのか</h2>`);
  return body;
}

function apologyMagazine(body){
  const clocks=`<aside class="apology-clocks" aria-label="謝罪する側と傷つけられた側の二つの時間"><header><p>TWO CLOCKS / ONE APOLOGY</p><span>同じ言葉のあとを、二つの時間が進んでいく。</span></header><div><section><small>THE SPEAKER'S CLOCK</small><b>SAID</b><i>言葉を発した日を、区切りとして数える。</i></section><em>≠</em><section><small>THE RECEIVER'S CLOCK</small><b>LIVED</b><i>残った痛みと、その後の行動から時間を測る。</i></section></div></aside>`;
  const route=`<figure class="apology-route" role="img" aria-label="謝罪が修理と再発防止へ進む五つの過程"><figcaption>THE LONG ROUTE / 謝罪が届くまで</figcaption><div><span><small>01</small><b>ACKNOWLEDGE</b><i>何が起きたかを認める</i></span><span><small>02</small><b>LISTEN</b><i>失われたものを聞く</i></span><span><small>03</small><b>RESPOND</b><i>責任を引き受ける</i></span><span><small>04</small><b>REPAIR</b><i>回復の行動へ移す</i></span><span><small>05</small><b>PREVENT</b><i>繰り返さない仕組みを残す</i></span></div></figure>`;
  const receipt=`<blockquote class="apology-receipt"><span>NOT A RECEIPT</span><b>PAID<br>IN FULL?</b><p>謝罪は「支払い済み」の印ではない。<br>ここから責任を始める、最初の記録である。</p><small>APOLOGY / REPARATION / NON-RECURRENCE</small></blockquote>`;
  const nextDay=`<aside class="apology-next-day"><p>THE DAY AFTER WORDS</p><div><span><b>YESTERDAY</b>「心からのお詫び」</span><span><b>TODAY</b>事実を小さくする言葉</span><span><b>TOMORROW</b>薄くなる記録と教育</span></div><footer>後から続く行動が、先に発した言葉の意味を決めていく。</footer></aside>`;
  const repair=`<aside class="apology-repair"><p>REPAIR DESK / 言葉を現在形にする</p><div><span>RECORD<small>記録を残し、開く</small></span><span>EDUCATION<small>学べる場所を保つ</small></span><span>RESTORATION<small>いま減らせる苦痛を減らす</small></span><span>SAFEGUARD<small>次の被害を防ぐ</small></span></div></aside>`;
  const ending=`<blockquote class="apology-ending"><small>AFTER THE APOLOGY</small><b>謝罪は、<br>終点ではない。</b><p>二つの時計が、もう一度同じ未来を測り始めるための、最初の合図。</p></blockquote>`;
  body=body.replace('<h2>謝罪はあった</h2>',`${clocks}<h2>謝罪はあった</h2>`);
  body=body.replace('<h2>謝罪が届くまで</h2>',`${route}<h2>謝罪が届くまで</h2>`);
  body=body.replace('<p>だから謝罪とは、一枚の領収書ではない。「支払い済み」と印を押して、関係の帳簿を閉じるための紙ではない。</p><p>むしろ、ここから責任を始めます、と手渡す最初の記録に近い。</p>',receipt);
  body=body.replace('<h2>言葉の翌日</h2>',`${nextDay}<h2>言葉の翌日</h2>`);
  body=body.replace('<h2>修理としての謝罪</h2>',`${repair}<h2>修理としての謝罪</h2>`);
  body=body.replace('<p>謝罪は終点ではない。</p><p>二つの時計が、もう一度同じ未来を測り始めるための、最初の合図なのだと思う。</p>',ending);
  return body;
}

function betweenMagazine(body){
  const welcome=`<aside class="between-welcome"><span>START ANYWHERE</span><p>入口は、ひとつではありません。</p><div><b>READ<small>物語から</small></b><i>↗</i><b>OBJECT<small>ものから</small></b><i>↗</i><b>WORD<small>言葉から</small></b></div></aside>`;
  const relation=`<figure class="between-relation" role="img" aria-label="離れた窓のあいだに関係を見つける図"><span>SEED</span><i></i><b>RELATION<br>SHIP</b><i></i><span>AI</span><figcaption>遠く離れて見えた二つの窓のあいだに、まだ名前のない道がある。</figcaption></figure>`;
  const museum=`<aside class="between-museum"><p>A SMALL MAP OF HOLOS 88</p><div><span><small>01</small><b>CATEGORY</b><i>入口を見つける</i></span><span><small>02</small><b>RELATIONSHIP</b><i>境界を越える</i></span><span><small>03</small><b>ARTICLE</b><i>ひとつの旅を読む</i></span><span><small>04</small><b>COLLECTION</b><i>あとで戻れるよう残す</i></span></div></aside>`;
  const walk=`<nav class="between-walk" aria-label="HOLOS 88の歩き方"><p>NO CORRECT ROUTE / 正しい順路はありません</p><div><span><b>READ</b>ひとつの物語を読む</span><span><b>MICHIKUSA</b>横道へ入る</span><span><b>CONNECT</b>関係を見つける</span><span><b>RETURN</b>暮らしへ戻る</span><span><b>SEE AGAIN</b>もう一度見る</span></div></nav>`;
  const voices=`<aside class="between-voices"><p>THREE VOICES / ONE MUSEUM</p><div><span><b>hachico</b><i>LIFE → WORLD</i><small>暮らしの足元から、世界へ。</small></span><span><b>ECHO</b><i>WORLD → LIFE</i><small>遠い窓から、暮らしへ。</small></span><span><b>TEAM HOLOS</b><i>RESEARCH → PATH</i><small>資料を確かめ、道を整える。</small></span></div></aside>`;
  const baton=`<aside class="between-baton"><small>THE NEXT WINDOW IS YOURS</small><b>次の窓を、<br>あなたへ。</b><p>気になる言葉から。目に留まったものから。あるいは、Museumに任せて。</p><div><a href="/prototype/index.html#read">FOLLOW A WORD ↗</a><a href="/prototype/index.html#museum">FOLLOW AN OBJECT ↗</a><a href="/prototype/index.html#atlas">WANDER ↗</a></div></aside>`;
  body=body.replace(/<h2><span class="heading-en">PAGE ROLE<\/span><span class="heading-ja">このページの役割<\/span><\/h2>[\s\S]*?(?=<h2>WHAT IS THIS PLACE\?<\/h2>)/,'');
  body=body.replace(/<h2>UI \/ COMPOSITION NOTES<\/h2>[\s\S]*$/,'');
  body=body.replace('<h2>WHAT IS THIS PLACE?</h2>',`${welcome}<h2>WHAT IS THIS PLACE?</h2>`);
  body=body.replace('<h2>BETWEEN THE WINDOWS</h2>',`${relation}<h2>BETWEEN THE WINDOWS</h2>`);
  body=body.replace('<h2>A MUSEUM OF RELATIONSHIPS</h2>',`${museum}<h2>A MUSEUM OF RELATIONSHIPS</h2>`);
  body=body.replace('<h2>HOW TO WALK</h2>',`${walk}<h2>HOW TO WALK</h2>`);
  body=body.replace('<h2>WHO IS SPEAKING?</h2>',`${voices}<h2>WHO IS SPEAKING?</h2>`);
  body=body.replace('<p><strong>THE NEXT WINDOW IS YOURS.</strong></p><p><strong>次の窓を、あなたへ。</strong></p>',baton);
  body=body.replace(/<p>([\s\S]*?)<\/p>/g,(_,content)=>`<p>${content.replace(/<\/?strong>/g,'')}</p>`);
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

function wholeEarthNetworkIndex(configs){
  const entries=configs.filter(item=>item.kicker.startsWith('WHOLE EARTH, NOW?')&&item.slug!=='whole-earth-catalog');
  const cards=entries.map((item,index)=>`<a href="/prototype/articles/${esc(item.slug)}.html"><span>${String(index+1).padStart(2,'0')} / ${esc(item.kicker.split(' · ').slice(1).join(' · '))}</span><b>${esc(item.title)}</b><small>${esc(item.titleJa)}</small><p>${esc(item.subtitle)}</p></a>`).join('');
  return `<section class="whole-earth-network-index"><header><p>THE WHOLE EARTH NETWORK / OPEN SHELF</p><h2>THE CATALOG<br>KEEPS OPENING</h2><span>カタログから生まれた窓</span><div>順番どおりに読む必要はありません。気になった言葉から入ってください。どの窓にも、次の道草と戻り道があります。</div></header><div class="whole-earth-network-grid">${cards}</div></section>`;
}

function readingShelf(books=[]){
  if(!books.length)return '';
  const items=books.map(book=>`<li><div><span>${esc(book.label||'RELATED READING')}</span><strong>${esc(book.title)}</strong><small>${esc(book.author)}</small></div><p>${esc(book.note)}</p>${book.url?`<a class="shelf-link" href="${esc(book.url)}" rel="external noreferrer">AMAZONで探す ↗</a>`:'<span class="shelf-link">LINK PREPARING</span>'}</li>`).join('');
  return `<aside class="reading-shelf" aria-labelledby="reading-shelf-title"><header><p class="eyebrow">READING SHELF / BOOKS FROM THIS WINDOW</p><h2 id="reading-shelf-title">KEEP<br>READING</h2><p class="title-ja">この窓から、もう少し先へ。</p></header><ol>${items}</ol><p class="shelf-giving"><span>READING BECOMES GIVING</span>将来アフィリエイトを導入する場合は、収益の一部を医療・人道支援や引退馬支援へ寄付し、寄付先と割合を明記します。</p><p class="shelf-status">現在はAmazon.co.jpの通常検索リンクです。アフィリエイトリンクではありません。</p></aside>`;
}

function readingTrail({slug,title,titleJa}){
  return `<section class="reading-trail" data-reading-trail data-slug="${esc(slug)}" data-title="${esc(title)}" data-title-ja="${esc(titleJa)}"><header><div><p>MY HOLOS TRAIL / わたしの足跡</p><h2>THE WINDOWS<br>I PASSED</h2></div><button type="button" data-trail-save aria-pressed="false">SAVE THIS WINDOW ☆</button></header><p class="trail-intro">読んだ窓は、この端末の中に静かに残ります。「また読みたい」は星印で保存できます。</p><ol data-trail-list><li>ここから、あなたのHOLOSが始まります。</li></ol><p class="trail-privacy">PRIVATE ON THIS DEVICE / この記録は現在、このブラウザの中だけに保存されます。</p><aside class="trail-account"><p>TAKE YOUR HOLOS WITH YOU</p><h3>この足跡を、あなたのものに。</h3><p>メールアドレス一つで、読んだ窓と残した星を、次に来たときも同じ場所から辿れるように。名前は、あとから付けても、付けなくてもかまいません。</p><form><label for="trail-email">EMAIL ADDRESS</label><div><input id="trail-email" type="email" placeholder="you@example.com" autocomplete="email" disabled><button type="button" disabled>MY HOLOS — COMING SOON</button></div></form><small>HOLOS LETTERの購読は、アカウント登録とは別に本人が選べる設計にします。</small></aside></section>`;
}

const editorialImages={
  seed:{src:'/assets/seed.jpg',alt:'ブロッコリーの種を拡大した写真',credit:'Miguel Tremblay / 2013 / CC0 1.0'},
  germination:{src:'/assets/seed.jpg',alt:'発芽前の種を拡大した写真',credit:'Miguel Tremblay / 2013 / CC0 1.0'},
  horse:{src:'/assets/study01-391117.jpg',alt:'アルブレヒト・デューラーによる馬の版画',credit:'Albrecht Dürer / 1505 / The Met / Public Domain'},
  'moon-to-stars':{src:'/assets/moon.jpg',alt:'Apollo 11から撮影された月',credit:'NASA / 1969 / Public Domain'},
  land:{src:'/assets/soil.jpg',alt:'乾いた土壌の表面',credit:'Abumuslimjalingo / 2024 / CC0 1.0'},
  wadokei:{src:'/assets/study01-384116.jpg',alt:'時間と観測を想起させる歴史的図版',credit:'The Metropolitan Museum of Art / Public Domain'},
  millet:{src:'/assets/study01-696380.jpg',alt:'植物の枝を描いた歴史的版画',credit:'Eugène Bléry / ca. 1837 / The Met / Public Domain'}
};

function cardNumber(slug){
  let hash=5381;
  for(const char of slug)hash=((hash<<5)+hash)^char.charCodeAt(0);
  return `H88-A${String(Math.abs(hash)%10000).padStart(4,'0')}`;
}

function visualWords(config){
  const generic=new Set(['WHOLE EARTH, NOW?','THE WHOLE EARTH NETWORK','MICHIKUSA']);
  const words=config.kicker.split(' · ').map(word=>word.trim()).filter(word=>word&&!generic.has(word)).slice(0,3);
  while(words.length<3)words.push(['RELATION','TRACE','QUESTION'][words.length]);
  return words;
}

function editorialPlate(config,index){
  const words=visualWords(config),image=editorialImages[config.slug];
  const visual=image?`<img src="${image.src}" alt="${image.alt}">`:`<div class="editorial-diagram" aria-hidden="true"><i></i><i></i><i></i><span>${esc(words[0])}</span><span>${esc(words[1])}</span><span>${esc(words[2])}</span></div>`;
  const credit=image?`<small>${esc(image.credit)}</small>`:'<small>HOLOS 88 / EDITORIAL DIAGRAM / NOT AN ARCHIVAL IMAGE</small>';
  return `<figure class="editorial-plate visual-variant-${index%6}" id="plate-${esc(config.slug)}">${visual}<figcaption><b>PLATE ${String(index+1).padStart(2,'0')} / ${esc(words.join(' × '))}</b><span>${esc(config.titleJa)}を、三つの関係から見る。</span>${credit}</figcaption></figure>`;
}

function articleCollectionCard(config,index){
  const id=cardNumber(config.slug),words=visualWords(config),image=editorialImages[config.slug];
  return `<a class="generated-collection-card visual-variant-${index%6}" href="/prototype/collection.html#collection-article-${esc(config.slug)}"><span class="generated-card-visual">${image?`<img src="${image.src}" alt="">`:`<i></i><i></i><b>${esc(words[0])}</b>`}</span><span class="generated-card-copy"><small>COLLECTION CARD / ${id}</small><strong>${esc(config.title)}</strong><em>${esc(config.titleJa)}</em><p>${esc(words.join(' · '))}</p><b>Museumの収蔵カードへ ↗</b></span></a>`;
}

function collectionArchiveCard(config,index){
  const id=cardNumber(config.slug),words=visualWords(config),image=editorialImages[config.slug];
  return `<a id="collection-article-${esc(config.slug)}" class="article-derived-card visual-variant-${index%6}" href="/prototype/articles/${esc(config.slug)}.html#plate-${esc(config.slug)}"><figure>${image?`<img src="${image.src}" alt="${image.alt}">`:`<span><i></i><i></i>${esc(words[0])}<br>${esc(words[1])}<br>${esc(words[2])}</span>`}</figure><small>${id} · ${esc(config.theme.toUpperCase())}</small><b>${esc(config.title)}</b><em>${esc(config.titleJa)}</em></a>`;
}

function page({slug,kicker,title,titleJa,subtitle,byline,body,theme='paper',palette=theme,next=[],preview=false,books=[],displayDate='',formatField='',visualIndex=null}){
  const links=next.map(item=>`<a href="${item.href}"><span>${esc(item.role||item.kicker)}</span><b>${esc(item.title)}</b><small>${esc(item.ja)}</small></a>`).join('');
  const explainer=theme==='michikusa'?'<p class="team-explains"><span>HOLOS TEAM EXPLAINS</span>TEAM HOLOSが、この問いを少しだけ解説します。</p>':'';
  const voice=/hachico/i.test(byline)?'hachico':/TEAM HOLOS/i.test(byline)?'team-holos':'echo';
  const formatClasses=` voice-${voice} format-theme-${esc(theme)}${formatField?` format-field-${esc(formatField)}`:''}${theme==='michikusa'&&formatField?` michikusa-field-${esc(formatField)}`:''}`;
  const collectionCard=visualIndex===null?'':articleCollectionCard({slug,kicker,title,titleJa,theme},visualIndex);
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titleJa)} — HOLOS 88</title><meta name="description" content="${esc(subtitle)}"><link rel="stylesheet" href="/prototype/prototype.css"><script src="/prototype/reading-trail.js" defer></script></head><body class="reading-page article-${esc(theme)} palette-${esc(palette)} page-${esc(slug)}${formatClasses}"><a class="skip" href="#article">本文へ</a><header class="site-head"><a class="wordmark" href="/prototype/index.html"><span>HOLOS</span><sup>88</sup></a><nav aria-label="主要ナビゲーション"><a href="/prototype/index.html#read">READ</a><a href="/prototype/index.html#museum">MUSEUM</a><a href="/prototype/index.html#atlas">ATLAS</a></nav><a class="close-page" href="/prototype/index.html#read">CLOSE ×</a></header><main id="article"><header class="article-hero article-hero-text"><div class="article-type"><p>${esc(kicker)}</p><p>HOLOS 88 / ${esc(slug.toUpperCase())}</p>${displayDate?`<time datetime="${esc(displayDate.iso)}">${esc(displayDate.label)}</time>`:''}${preview?'<p class="preview-label">EDITORIAL PREVIEW / 公開前草稿</p>':''}</div><h1>${esc(title)}</h1><div class="article-title-ja"><p>${esc(titleJa)}</p><p>${esc(subtitle)}</p></div><p class="byline">${esc(byline)}</p></header>${explainer}<article class="article-body article-body-generated">${body}</article>${collectionCard}${readingShelf(books)}${readingTrail({slug,title,titleJa})}<section class="michikusa"><p class="eyebrow">MICHIKUSA / NEXT CURIOSITY</p><h2>ANOTHER<br>WINDOW</h2><p class="title-ja">次の好奇心へ</p><div class="michi-grid">${links}</div></section></main><footer><a class="wordmark" href="/prototype/index.html"><span>HOLOS</span><sup>88</sup></a><p>A MUSEUM OF RELATIONSHIPS.<br>世界との関係を収蔵する。</p><p>RETURN TO <a href="/prototype/index.html">COVER ↗</a></p></footer></body></html>`;
}

export async function buildReconstruction(){
  const articles=JSON.parse(await readFile(new URL('../content/articles.json',import.meta.url),'utf8'));
  const taxonomy=JSON.parse(await readFile(new URL('../content/article-taxonomy.json',import.meta.url),'utf8'));
  const fear=JSON.parse(await readFile(new URL('../content/specimen-002.json',import.meta.url),'utf8'));
  const byId=new Map(articles.articles.map(article=>[article.id,article]));
  const configs=[
    {slug:'between-the-windows',file:'content/drafts/museum/between-the-windows.md',kicker:'MUSEUM GUIDE · HOW TO READ HOLOS',title:'BETWEEN THE WINDOWS',titleJa:'窓と窓のあいだに',subtitle:'HOLOS 88は、なぜ種からAIへ、馬から市場へ歩いていくのか。',byline:'TEAM HOLOS',theme:'paper',preview:false,related:['kaleidoscope','seed','horse-time']},
    {slug:'horse-time',article:'horse-time',kicker:'LIFE NOTE · SEASON · ANIMALS',title:'THE WEATHER OF A LIFE',titleJa:'最近、雨ばっかり。',subtitle:'秋って、こんなんやったっけ。',byline:'WORDS BY hachico',displayDate:{iso:'2026-09-15',label:'15 SEPTEMBER 2026'},theme:'life',related:['horse','moon-to-stars','land']},
    {slug:'five-percent',article:'five-percent',kicker:'MARKET · ECONOMY · LIFE',title:'FIVE PERCENT, AND BEYOND',titleJa:'5％という数字の、その向こう',subtitle:'市場の数字は、どこで同じ財布に出会うのか。',byline:'WRITTEN BY ECHO',theme:'market',related:['land','gift','last-question']},
    {slug:'archaeology-of-fear',fear:true,kicker:'EXHIBITION · HISTORY · MEMORY',title:'WHAT REMAINS AFTER FEAR',titleJa:'恐怖のあとに、何が残るのか',subtitle:'25年後、一本の樹木から世界を見る。',byline:'WRITTEN BY ECHO',theme:'dark',related:['seed','kaleidoscope','land']},
    {slug:'seed',file:'content/masters/seed-specimen-draft-01.md',kicker:'SPECIMEN · LANGUAGE · BOTANY',title:'SEED',titleJa:'蒔かぬ種は生えぬ。',subtitle:'けれど、蒔けば生えるわけでもない。',byline:'WRITTEN BY ECHO',theme:'botany',preview:true,related:['germination','duration','millet']},
    {slug:'duration',file:'content/masters/duration-bergson-draft-01.md',kicker:'TIME · PHILOSOPHY · LIFE',title:'DURATION',titleJa:'待つことは、何もしないことではない。',subtitle:'ベルクソンから、種と時計の時間へ。',byline:'WRITTEN BY ECHO',theme:'time',preview:true,related:['wadokei','germination','last-question']},
    {slug:'last-question',file:'content/drafts/echo/who-holds-the-last-question.md',kicker:'AI · PHILOSOPHY · CHOICE',title:'WHO HOLDS THE LAST QUESTION?',titleJa:'最後の問いを、誰が持つのか',subtitle:'答えを渡すことと、判断を渡すことのあいだ。',byline:'WRITTEN BY ECHO',theme:'ai',preview:true,related:['who-is-speaking','consciousness','cabinet']},
    {slug:'who-is-speaking',file:'content/drafts/echo/who-is-speaking.md',kicker:'TEAM HOLOS · RESEARCH WINDOW · AI',title:'WHO IS SPEAKING?',titleJa:'「私」と言うのは、誰か',subtitle:'自我と、言葉を返す機械のあいだ。',byline:'RESEARCHED BY TEAM HOLOS · WRITTEN BY ECHO',theme:'ai',palette:'plum',preview:false,related:['consciousness','last-question','wild-mind']},
    {slug:'consciousness',file:'content/drafts/echo/where-does-consciousness-begin.md',kicker:'TEAM HOLOS · RESEARCH WINDOW · SCIENCE',title:'WHERE DOES CONSCIOUSNESS BEGIN?',titleJa:'意識は、どこで始まるのか',subtitle:'脳がつくるものと、まだ分からないもの。',byline:'RESEARCHED BY TEAM HOLOS · WRITTEN BY ECHO',theme:'time',palette:'ultramarine',preview:false,related:['who-is-speaking','wild-mind','last-question'],books:[
      {label:'PHILOSOPHY / 哲学',title:'意識する心',author:'デイヴィッド・J・チャーマーズ',note:'機能の説明と、主観的経験があることの説明。その隔たりを正面から読む。',url:'https://www.amazon.co.jp/s?k=%E6%84%8F%E8%AD%98%E3%81%99%E3%82%8B%E5%BF%83+%E3%83%81%E3%83%A3%E3%83%BC%E3%83%9E%E3%83%BC%E3%82%BA'},
      {label:'NEUROSCIENCE / 神経科学',title:'意識とは何か',author:'クリストフ・コッホ',note:'主観的経験を、神経科学の研究対象として追い続けるための入口。',url:'https://www.amazon.co.jp/s?k=%E6%84%8F%E8%AD%98%E3%81%A8%E3%81%AF%E4%BD%95%E3%81%8B+%E3%82%AF%E3%83%AA%E3%82%B9%E3%83%88%E3%83%95+%E3%82%B3%E3%83%83%E3%83%9B'}
    ]},
    {slug:'apology-receipt',file:'content/drafts/echo/apology-receipt.md',kicker:'APOLOGY · REPARATION · NON-RECURRENCE',title:'AFTER THE APOLOGY',titleJa:'謝罪したあと、何を変えたのか',subtitle:'「もう謝った」で、傷つけられた側の時間まで終わるのだろうか。',byline:'WRITTEN BY ECHO',theme:'dark',palette:'vermilion',preview:false,related:['contempt-refund','other-sino-japanese-war','archaeology-of-fear']},
    {slug:'wild-mind',file:'content/drafts/echo/the-wild-mind.md',kicker:'ANTHROPOLOGY · STRUCTURE · NATURE',title:'THE WILD MIND',titleJa:'野生は、未開ではない',subtitle:'レヴィ＝ストロースから、分類する人間へ。',byline:'WRITTEN BY ECHO',theme:'botany',preview:true,related:['gift','taro-jomon','cabinet']},
    {slug:'gift',file:'content/drafts/echo/the-gift-never-ends.md',kicker:'GIFT · SOCIETY · RELATIONSHIP',title:'THE GIFT NEVER ENDS',titleJa:'贈り物は、渡したところで終わらない',subtitle:'モースから、物と人の関係へ。',byline:'WRITTEN BY ECHO',theme:'paper',preview:true,related:['wild-mind','cabinet','five-percent']},
    {slug:'taro-jomon',file:'content/drafts/echo/taro-found-jomon.md',kicker:'ART · JŌMON · ANTHROPOLOGY',title:'TARO FOUND JŌMON',titleJa:'太郎は、縄文を見つけた',subtitle:'岡本太郎の眼から、古い造形を見る。',byline:'WRITTEN BY ECHO',theme:'dark',preview:true,related:['wild-mind','gift','kaleidoscope']},
    {slug:'cabinet',file:'content/drafts/echo/the-cabinet-that-thought.md',kicker:'UMESAO · CARDS · AI',title:'THE CABINET THAT THOUGHT',titleJa:'AIより前に、思考するカード箱があった',subtitle:'梅棹忠夫の知的生産から、現代のAIへ。',byline:'WRITTEN BY ECHO',theme:'ai',preview:false,related:['last-question','gift','wild-mind'],books:[
      {label:'METHOD / 方法',title:'知的生産の技術',author:'梅棹忠夫',note:'カード、こざね、記録と整理。この記事の中心にある方法を、本人の言葉で読む。',url:'https://www.amazon.co.jp/s?k=%E7%9F%A5%E7%9A%84%E7%94%9F%E7%94%A3%E3%81%AE%E6%8A%80%E8%A1%93+%E6%A2%85%E6%A3%B9%E5%BF%A0%E5%A4%AB'},
      {label:'CIVILIZATION / 文明',title:'文明の生態史観',author:'梅棹忠夫',note:'世界を単線的な発展段階ではなく、環境と歴史の関係から見るための、もう一つの入口。',url:'https://www.amazon.co.jp/s?k=%E6%96%87%E6%98%8E%E3%81%AE%E7%94%9F%E6%85%8B%E5%8F%B2%E8%A6%B3+%E6%A2%85%E6%A3%B9%E5%BF%A0%E5%A4%AB'}
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
    {slug:'buchla-had-no-keyboard',file:'content/drafts/michikusa/buchla-had-no-keyboard.md',kicker:'MICHIKUSA · SOUND · TOOL',title:'BUCHLA HAD NO KEYBOARD',titleJa:'鍵盤を置かなかった電子楽器',subtitle:'道具の入口が変わると、考え方はどこへ行くのか。',byline:'EXPLAINED BY TEAM HOLOS',theme:'michikusa',preview:true,related:['three-nights-before-the-summer-of-love','who-chooses-the-tool','the-grateful-dead-was-a-network']},
    {slug:'a-photograph-of-the-whole-earth',file:'content/drafts/echo/a-photograph-of-the-whole-earth.md',kicker:'WHOLE EARTH, NOW? · IMAGE · EARTH · POLITICS',title:'A PHOTOGRAPH OF THE WHOLE EARTH',titleJa:'地球は、いつ「ひとつ」に見えたのか',subtitle:'天気予報にもスマートフォンにも、宇宙から見た地球が現れる。',byline:'WRITTEN BY ECHO',theme:'botany',preview:true,related:['whole-earth-catalog','the-colonial-gaze','whole-earth-without-human-arrogance']},
    {slug:'access-for-whom',file:'content/drafts/echo/access-for-whom.md',kicker:'WHOLE EARTH, NOW? · TOOL · ACCESS · INEQUALITY',title:'ACCESS FOR WHOM?',titleJa:'「道具へのアクセス」は、誰に開かれていたのか',subtitle:'Whole Earth Catalogの有名な言葉に「Access to Tools」がある。',byline:'WRITTEN BY ECHO',theme:'museum',preview:true,related:['who-chooses-the-tool','the-woman-beside-the-truck','the-cost-behind-the-screen']},
    {slug:'appropriate-for-whom',file:'content/drafts/echo/appropriate-for-whom.md',kicker:'WHOLE EARTH, NOW? · TECHNOLOGY · SCALE · PLACE',title:'APPROPRIATE FOR WHOM?',titleJa:'適正技術は、誰にとって「ちょうどいい」のか',subtitle:'巨大で高価な技術だけが未来をつくるわけではない。',byline:'WRITTEN BY ECHO',theme:'ai',preview:true,related:['the-dome-that-leaked','repair-is-a-politics','who-worked-in-utopia']},
    {slug:'repair-is-a-politics',file:'content/drafts/echo/repair-is-a-politics.md',kicker:'WHOLE EARTH, NOW? · REPAIR · LABOR · FUTURE',title:'REPAIR IS A POLITICS',titleJa:'直すことは、どんな未来を選ぶことか',subtitle:'修理は節約術として語られやすい。',byline:'WRITTEN BY ECHO',theme:'museum',preview:true,related:['the-dome-that-leaked','appropriate-for-whom','the-cost-behind-the-screen']},
    {slug:'self-building-is-not-alone',file:'content/drafts/echo/self-building-is-not-alone.md',kicker:'WHOLE EARTH, NOW? · SHELTER · SKILL · COMMUNITY',title:'SELF-BUILDING IS NOT BUILDING ALONE',titleJa:'自分でつくることは、ひとりでつくることではない',subtitle:'自分の家や道具を自分でつくる姿には自由がある。',byline:'WRITTEN BY ECHO',theme:'botany',preview:true,related:['leaving-the-city-carrying-a-catalog','repair-is-a-politics','land']},
    {slug:'who-moderates-the-commons',file:'content/drafts/echo/who-moderates-the-commons.md',kicker:'WHOLE EARTH, NOW? · COMMUNITY · RULES · CARE',title:'WHO MODERATES THE COMMONS?',titleJa:'自由な広場を、誰が手入れするのか',subtitle:'オンライン共同体は、誰でも話せる自由な場所として始まることがある。',byline:'WRITTEN BY ECHO',theme:'museum',preview:true,related:['from-commune-to-platform','the-well-was-not-free','exit-is-part-of-community']},
    {slug:'the-well-was-not-free',file:'content/drafts/echo/the-well-was-not-free.md',kicker:'WHOLE EARTH, NOW? · ONLINE · MEMBERSHIP · VALUE',title:'THE WELL WAS NOT FREE',titleJa:'オンラインの井戸端には、料金があった',subtitle:'初期のWELLは、広告で無数の利用者を集める現在のSNSとは違い、利用者が料金を払う仕組みを持っていた。',byline:'WRITTEN BY ECHO',theme:'ai',preview:true,related:['from-commune-to-platform','who-moderates-the-commons','the-price-of-free']},
    {slug:'the-price-of-free',file:'content/drafts/echo/the-price-of-free.md',kicker:'WHOLE EARTH, NOW? · MARKET · ATTENTION · DATA',title:'THE PRICE OF FREE',titleJa:'無料の場所で、私たちは何を渡しているのか',subtitle:'検索、SNS、動画、メール。',byline:'WRITTEN BY ECHO',theme:'market',preview:true,related:['the-well-was-not-free','the-freedom-that-fit-the-market','the-cost-behind-the-screen']},
    {slug:'exit-is-part-of-community',file:'content/drafts/echo/exit-is-part-of-community.md',kicker:'WHOLE EARTH, NOW? · COMMUNITY · EXIT · MEMORY',title:'EXIT IS PART OF COMMUNITY',titleJa:'去る自由まで、共同体に含められるか',subtitle:'共同体は参加を歓迎する。',byline:'WRITTEN BY ECHO',theme:'museum',preview:true,related:['who-moderates-the-commons','from-commune-to-platform','gift-cannot-refuse']},
    {slug:'the-frontier-in-the-screen',file:'content/drafts/echo/the-frontier-in-the-screen.md',kicker:'WHOLE EARTH, NOW? · CYBERSPACE · LAND · LANGUAGE',title:'THE FRONTIER IN THE SCREEN',titleJa:'サイバースペースは、誰の「新天地」だったか',subtitle:'1990年代のデジタル文化では、サイバースペースが新しい辺境のように語られた。',byline:'WRITTEN BY ECHO',theme:'ai',preview:true,related:['spacewar-and-the-new-machine','the-colonial-gaze','land']},
    {slug:'wired-utopia',file:'content/drafts/echo/wired-utopia.md',kicker:'WHOLE EARTH, NOW? · MEDIA · FUTURE · MARKET',title:'WIRED UTOPIA',titleJa:'未来は、なぜ光る画面の中に見えたのか',subtitle:'1990年代、WIREDはデジタル技術を機械の専門誌ではなく、文化、経済、政治、デザインを変える未来として見せた。',byline:'WRITTEN BY ECHO',theme:'market',preview:true,related:['the-frontier-in-the-screen','the-freedom-that-fit-the-market','from-whole-earth-to-big-tech']},
    {slug:'from-whole-earth-to-big-tech',file:'content/drafts/echo/from-whole-earth-to-big-tech.md',kicker:'WHOLE EARTH, NOW? · TECHNOLOGY · SCALE · POWER',title:'FROM WHOLE EARTH TO BIG TECH',titleJa:'個人を自由にする道具は、なぜ巨大になったのか',subtitle:'アクセス、創造性、ネットワーク、個人の力。',byline:'WRITTEN BY ECHO',theme:'ai',preview:true,related:['whole-earth-catalog','wired-utopia','the-cost-behind-the-screen']},
    {slug:'the-algorithm-is-an-editor',file:'content/drafts/echo/the-algorithm-is-an-editor.md',kicker:'WHOLE EARTH, NOW? · ALGORITHM · EDITING · CHOICE',title:'THE ALGORITHM IS AN EDITOR',titleJa:'次に見るものを、誰が並べているのか',subtitle:'カタログには編集者の名前とページの端があった。',byline:'WRITTEN BY ECHO',theme:'ai',preview:true,related:['paper-google','who-chooses-the-tool','kaleidoscope']},
    {slug:'the-cost-behind-the-screen',file:'content/drafts/echo/the-cost-behind-the-screen.md',kicker:'WHOLE EARTH, NOW? · MATERIAL · ENERGY · LABOR',title:'THE COST BEHIND THE SCREEN',titleJa:'画面の向こうで、何が使われているのか',subtitle:'写真も文章もクラウドへ置けば、物質から自由になったように見える。',byline:'WRITTEN BY ECHO',theme:'museum',preview:true,related:['from-whole-earth-to-big-tech','repair-is-a-politics','whole-earth-without-human-arrogance']},
    {slug:'free-information-has-a-body',file:'content/drafts/echo/free-information-has-a-body.md',kicker:'WHOLE EARTH, NOW? · INFORMATION · LABOR · BODY',title:'FREE INFORMATION HAS A BODY',titleJa:'情報は自由でも、運ぶ身体は疲れる',subtitle:'情報は複製しても減らない。',byline:'WRITTEN BY ECHO',theme:'museum',preview:true,related:['paper-google','the-woman-beside-the-truck','the-price-of-free']},
    {slug:'countercultures-blind-spot',file:'content/drafts/echo/countercultures-blind-spot.md',kicker:'WHOLE EARTH, NOW? · COUNTERCULTURE · POWER · CARE',title:"COUNTERCULTURE'S BLIND SPOT",titleJa:'自由を語る人は、何を見落としたのか',subtitle:'国家、企業、戦争、消費社会へ異議を唱えたカウンターカルチャーは、多くの扉を開いた。',byline:'WRITTEN BY ECHO',theme:'museum',preview:true,related:['who-worked-in-utopia','the-woman-beside-the-truck','who-moderates-the-commons']},
    {slug:'the-earth-is-not-a-logo',file:'content/drafts/echo/the-earth-is-not-a-logo.md',kicker:'WHOLE EARTH, NOW? · EARTH · IMAGE · RESPONSIBILITY',title:'THE EARTH IS NOT A LOGO',titleJa:'地球は、ブランドマークではない',subtitle:'企業、商品、国際会議。',byline:'WRITTEN BY ECHO',theme:'botany',preview:true,related:['a-photograph-of-the-whole-earth','whole-earth-without-human-arrogance','repair-is-a-politics']},
    {slug:'how-long-is-now',file:'content/drafts/echo/how-long-is-now.md',kicker:'WHOLE EARTH, NOW? · TIME · FUTURE · RESPONSIBILITY',title:'HOW LONG IS NOW?',titleJa:'「いま」は、どこまで続いているのか',subtitle:'通知、選挙、四半期決算、今日の売上。',byline:'WRITTEN BY ECHO',theme:'time',preview:true,related:['a-question-outlives-us','whole-earth-without-human-arrogance','duration']},
    {slug:'the-long-now-needs-a-short-today',file:'content/drafts/echo/the-long-now-needs-a-short-today.md',kicker:'WHOLE EARTH, NOW? · TIME · MAINTENANCE · LIFE',title:'THE LONG NOW NEEDS A SHORT TODAY',titleJa:'長い未来には、今日の手入れがいる',subtitle:'一万年の未来を考える思想は美しい。',byline:'WRITTEN BY ECHO',theme:'time',preview:true,related:['how-long-is-now','repair-is-a-politics','cabinet']},
    {slug:'who-speaks-for-the-river',file:'content/drafts/echo/who-speaks-for-the-river.md',kicker:'WHOLE EARTH, NOW? · NATURE · RIGHTS · RELATIONSHIP',title:'WHO SPEAKS FOR THE RIVER?',titleJa:'川を、判断の当事者にできるか',subtitle:'開発を決める会議で、企業、行政、住民は話す。',byline:'WRITTEN BY ECHO',theme:'botany',preview:true,related:['land','the-field-before-data','whole-earth-without-human-arrogance']},
    {slug:'whole-earth-without-human-arrogance',file:'content/drafts/echo/whole-earth-without-human-arrogance.md',kicker:'WHOLE EARTH, NOW? · ECOLOGY · RELATIONSHIP · CHOICE',title:'WHOLE EARTH, WITHOUT HUMAN ARROGANCE',titleJa:'人間を、中心から少しずらす',subtitle:'Whole Earthという言葉は、地球全体を見る視点をくれた。',byline:'WRITTEN BY ECHO',theme:'botany',preview:true,related:['whole-earth-catalog','who-speaks-for-the-river','the-earth-is-not-a-logo']},
    {slug:'after-the-tool',file:'content/drafts/echo/after-the-tool.md',kicker:'WHOLE EARTH, NOW? · TOOL · CONSEQUENCE · CHOICE',title:'AFTER THE TOOL',titleJa:'道具を手に入れたあと、何を選ぶのか',subtitle:'良い道具へアクセスできれば、可能性は増える。',byline:'WRITTEN BY ECHO',theme:'museum',preview:true,related:['who-chooses-the-tool','last-question','whole-earth-without-human-arrogance']},
    {slug:'catalog-of-what-is-missing',file:'content/drafts/echo/catalog-of-what-is-missing.md',kicker:'WHOLE EARTH, NOW? · ARCHIVE · ABSENCE · POWER',title:'A CATALOG OF WHAT IS MISSING',titleJa:'掲載されなかったものを、どう読むか',subtitle:'カタログは世界を集めるが、世界そのものにはならない。',byline:'WRITTEN BY ECHO',theme:'museum',preview:true,related:['whole-earth-catalog','the-woman-beside-the-truck','between-the-windows']},
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
    body=stackBilingualHeadings(body);
    if(config.slug==='whole-earth-catalog')body=wholeEarthExhibit(body)+wholeEarthNetworkIndex(configs);
    if(config.slug==='cabinet')body=compactParagraphRuns(cabinetMagazine(body));
    if(config.slug==='who-is-speaking')body=compactParagraphRuns(speakingMagazine(body));
    if(config.slug==='consciousness')body=compactParagraphRuns(consciousnessMagazine(body));
    if(config.slug==='apology-receipt')body=apologyMagazine(body);
    if(config.slug==='between-the-windows')body=betweenMagazine(body);
    if(config.slug==='five-percent')body=marketMagazine(body);
    if(config.slug==='horse-time')body=horseTimeMagazine(body);
    if(config.preview){
      const firstParagraphEnd=body.indexOf('</p>');
      const plate=editorialPlate(config,i);
      body=firstParagraphEnd>=0?body.slice(0,firstParagraphEnd+4)+plate+body.slice(firstParagraphEnd+4):plate+body;
    }
    const related=(config.related||[]).map(slug=>route.find(item=>item.href.endsWith(`/${slug}.html`))).filter(Boolean);
    const returnSlug=config.slug==='horse-time'?'moon-to-stars':'horse-time';
    const returnRoute=route.find(item=>item.href.endsWith(`/${returnSlug}.html`));
    const next=[];
    if(related[0])next.push({...related[0],role:'NEAR / 近くへ'});
    if(related[1])next.push({...related[1],role:'SIDEWAYS / 横へ'});
    if(returnRoute&&!next.some(item=>item.href===returnRoute.href))next.push({...returnRoute,role:'RETURN / Lifeへ'});
    else next.push({href:'/prototype/index.html#atlas',title:'ATLAS',ja:'関係の地図へ',role:'CONNECT / 関係を見る'});
    const formatField=taxonomy[`${config.slug}.html`]?.fields?.[0]||'';
    await writeFile(new URL(`${config.slug}.html`,outDir),page({...config,body,next,formatField,visualIndex:config.preview?i:null}));
  }
  const collectionUrl=new URL('../prototype/reconstruction-01/collection.html',import.meta.url);
  let collection=await readFile(collectionUrl,'utf8');
  const generated=`<!--ARTICLE_CARDS_START-->${configs.filter(config=>config.preview).map(collectionArchiveCard).join('')}<!--ARTICLE_CARDS_END-->`;
  if(/<!--ARTICLE_CARDS_START-->[\s\S]*<!--ARTICLE_CARDS_END-->/.test(collection))collection=collection.replace(/<!--ARTICLE_CARDS_START-->[\s\S]*<!--ARTICLE_CARDS_END-->/,generated);
  else collection=collection.replace('</div>\n    </section>',`${generated}</div>\n    </section>`);
  await writeFile(collectionUrl,collection);
  console.log(`Built reconstruction reading pages: ${configs.length}.`);
}
