const STORAGE_KEY='holos88.lifeSpecimens.v1';
const STEP_KEY='holos88.lifeExperiment.v1';
const RELATIONSHIP_KEY='holos88.lifeRelationships.v1';
const DIRECTION_KEY='holos88.lifeDirections.v1';
const panels=[...document.querySelectorAll('[data-panel]')];
const navButtons=[...document.querySelectorAll('[data-view]')];
const form=document.querySelector('#specimen-form');
const list=document.querySelector('#specimen-list');
const count=document.querySelector('#specimen-count');
const stepForm=document.querySelector('#step-form');
const activeStep=document.querySelector('#active-step');
const methodShelf=document.querySelector('#method-shelf');
const voicesForm=document.querySelector('#voices-form');
const thirdQuestionText=document.querySelector('#third-question-text');
const relationshipForm=document.querySelector('#relationship-form');
const relationshipMap=document.querySelector('#relationship-map');
let currentFilter='ALL';
const thirdQuestions=[
  '正解ではなく実験に変えると、何ができますか。',
  '10年後の自分は、この問題を何と呼ぶでしょう。',
  '誰にも説明しなくてよいなら、何を残しますか。',
  '成功と引き換えに失うものは何ですか。',
  '反対の選択にある知恵は何ですか。',
  '人間以外の生き物なら、何を急がないでしょう。'
];

const parse=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const specimens=()=>parse(STORAGE_KEY,[]);
const saveSpecimens=value=>localStorage.setItem(STORAGE_KEY,JSON.stringify(value));
const relationships=()=>parse(RELATIONSHIP_KEY,[]);
const saveRelationships=value=>localStorage.setItem(RELATIONSHIP_KEY,JSON.stringify(value));
const directions=()=>parse(DIRECTION_KEY,{});
const saveDirections=value=>localStorage.setItem(DIRECTION_KEY,JSON.stringify(value));
const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const weatherMark=value=>({'晴れ':'○','薄曇り':'◐','雨':'╱','風':'≈','嵐':'✳','わからない':'?'}[value]||'·');

function showToast(message){
  const old=document.querySelector('.toast'); if(old) old.remove();
  const toast=document.createElement('div'); toast.className='toast'; toast.textContent=message;
  document.body.append(toast); window.setTimeout(()=>toast.remove(),2600);
}

function showPanel(name){
  panels.forEach(panel=>{const active=panel.dataset.panel===name; panel.hidden=!active; panel.classList.toggle('is-active',active)});
  navButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===name)));
  if(name==='collection') renderSpecimens();
  if(name==='connect') renderRelationships();
  if(name==='step') renderStep();
  document.querySelector(`[data-panel="${name}"]`).scrollIntoView({behavior:'smooth',block:'start'});
}
navButtons.forEach(button=>button.addEventListener('click',()=>showPanel(button.dataset.view)));

form.elements.observedOn.value=new Date().toISOString().slice(0,10);
form.addEventListener('submit',event=>{
  event.preventDefault();
  const data=new FormData(form);
  const all=specimens();
  const item={
    id:`LS-${String(Date.now()).slice(-8)}`,
    createdAt:new Date().toISOString(),
    observedOn:data.get('observedOn'),place:data.get('place').trim(),season:data.get('season'),
    weather:data.get('weather')||'わからない',observation:data.get('observation').trim(),areas:data.getAll('areas')
  };
  all.unshift(item); saveSpecimens(all); form.reset();
  form.elements.observedOn.value=new Date().toISOString().slice(0,10);
  form.elements.season.value='秋'; showToast('標本を、この端末に収蔵しました。'); showPanel('collection');
});

function renderSpecimens(){
  const all=specimens(); count.textContent=all.length;
  const shown=currentFilter==='ALL'?all:all.filter(item=>item.areas.includes(currentFilter));
  if(!shown.length){list.innerHTML='<p class="empty">まだ標本がありません。<br>今日ひっかかった一言から、置いてみましょう。</p>';return}
  list.innerHTML=shown.map(item=>`<article class="specimen-card">
    <header><span class="id">${escapeHtml(item.id)}</span><time class="date">${escapeHtml(item.observedOn)}</time></header>
    <p class="weather" aria-label="心身の天気 ${escapeHtml(item.weather)}">${weatherMark(item.weather)}</p>
    <blockquote>${escapeHtml(item.observation)}</blockquote>
    ${item.place?`<p class="place">PLACE / ${escapeHtml(item.place)}</p>`:''}
    <div class="tags">${item.areas.map(area=>`<span>${escapeHtml(area)}</span>`).join('')||'<span>UNCLASSIFIED</span>'}</div>
    <button type="button" data-delete="${escapeHtml(item.id)}">DELETE / 削除</button>
  </article>`).join('');
  list.querySelectorAll('[data-delete]').forEach(button=>button.addEventListener('click',()=>{
    const next=specimens().filter(item=>item.id!==button.dataset.delete); saveSpecimens(next); renderSpecimens(); showToast('標本を削除しました。');
    saveRelationships(relationships().filter(link=>link.from!==button.dataset.delete&&link.to!==button.dataset.delete));
  }));
}

document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  currentFilter=button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  renderSpecimens();
}));

document.querySelector('#clear-button').addEventListener('click',()=>{
  if(!specimens().length)return;
  if(window.confirm('この端末に保存した標本と関係線を、すべて削除しますか？')){localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(RELATIONSHIP_KEY);renderSpecimens();showToast('すべて削除しました。')}
});

function specimenLabel(item){
  const first=(item.observation||'').split('\n')[0].replace(/^QUESTION｜/,'');
  return `${item.id}｜${first.slice(0,38)}${first.length>38?'…':''}`;
}

function buildNetwork(all,links){
  const byId=Object.fromEntries(all.map(item=>[item.id,item]));
  const ids=[...new Set(links.flatMap(link=>[link.from,link.to]))];
  if(ids.length<2)return '';
  const degree=Object.fromEntries(ids.map(id=>[id,0]));
  links.forEach(link=>{degree[link.from]+=1;degree[link.to]+=1});
  const center=[...ids].sort((a,b)=>degree[b]-degree[a])[0];
  const others=ids.filter(id=>id!==center);
  const positions={[center]:{x:450,y:260}};
  others.forEach((id,index)=>{
    const angle=-Math.PI/2+(Math.PI*2*index/others.length);
    positions[id]={x:450+Math.cos(angle)*315,y:260+Math.sin(angle)*185};
  });
  const relationLines=links.map(link=>{
    const a=positions[link.from],b=positions[link.to]; if(!a||!b)return '';
    const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
    return `<g class="map-link"><line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" marker-end="url(#arrow)"></line><rect x="${mx-48}" y="${my-12}" width="96" height="22" rx="11"></rect><text x="${mx}" y="${my+4}">${escapeHtml(link.relation)}</text></g>`;
  }).join('');
  const nodes=ids.map(id=>{
    const item=byId[id],p=positions[id]; const raw=specimenLabel(item).split('｜').slice(1).join('｜');
    const snippet=raw.length>15?`${raw.slice(0,15)}…`:raw;
    return `<g class="map-node${id===center?' is-center':''}" transform="translate(${p.x} ${p.y})"><circle r="${id===center?72:58}"></circle><text class="node-id" y="-10">${escapeHtml(id)}</text><text class="node-label" y="14">${escapeHtml(snippet)}</text><title>${escapeHtml(raw)}</title></g>`;
  }).join('');
  return `<figure class="network-figure"><figcaption><span>RELATIONSHIP NETWORK</span><strong>${ids.length} specimens / ${links.length} connections</strong><small>もっとも多く結ばれた標本を、中心に表示しています。</small></figcaption><svg viewBox="0 0 900 520" role="img" aria-label="収蔵した標本の関係地図"><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker></defs>${relationLines}${nodes}</svg></figure>`;
}

const sampleSpecimens=[
  {id:'SAMPLE-01',observation:'自分で選べる時間が足りない',areas:['TIME']},
  {id:'SAMPLE-02',observation:'家族の用事を、先回りして引き受けている',areas:['HOME','RELATIONSHIPS','TIME']},
  {id:'SAMPLE-03',observation:'パートナーと話したあとは少し力が戻る',areas:['RELATIONSHIPS','BODY']},
  {id:'SAMPLE-04',observation:'仕事の締切が重なると、夜まで頭が止まらない',areas:['WORK','TIME','BODY']},
  {id:'SAMPLE-05',observation:'疲れると、最初に肩と眠りへ出る',areas:['BODY']}
];

const areaNames={WORK:'仕事',BODY:'身体',RELATIONSHIPS:'関係',HOME:'暮らし',MONEY:'お金',TIME:'時間'};

function buildAreaMap(all,links,metric='attention'){
  const ids=new Set(all.map(item=>item.id));
  const values=Object.fromEntries(Object.keys(areaNames).map(area=>[area,0]));
  if(metric==='attention'){
    all.forEach(item=>(item.areas||[]).forEach(area=>{if(area in values)values[area]+=1}));
  }else{
    const byId=Object.fromEntries(all.map(item=>[item.id,item]));
    links.filter(link=>ids.has(link.from)&&ids.has(link.to)).forEach(link=>{
      [...new Set([...(byId[link.from].areas||[]),...(byId[link.to].areas||[])])].forEach(area=>{if(area in values)values[area]+=1});
    });
  }
  const max=Math.max(1,...Object.values(values));
  const positions={WORK:[150,115],BODY:[450,90],RELATIONSHIPS:[750,115],HOME:[150,310],MONEY:[450,335],TIME:[750,310]};
  const circles=Object.entries(areaNames).map(([area,jp])=>{
    const [x,y]=positions[area],value=values[area],r=34+(value/max)*42;
    return `<g class="area-bubble${value===max&&value>0?' is-largest':''}" transform="translate(${x} ${y})"><circle r="${r}"></circle><text class="area-en" y="-5">${area}</text><text class="area-jp" y="15">${jp}</text><text class="area-value" y="${r+19}">${value}</text></g>`;
  }).join('');
  const explanation=metric==='attention'?'記録に登場した回数':'関係線に含まれた回数';
  return `<section class="area-map" data-current-metric="${metric}"><header><div><span>CATEGORY LENS</span><strong>LIFE AREAS</strong><small>円の大きさ＝${explanation}。大切さの順位ではありません。</small></div><div class="area-map-controls" role="group" aria-label="円の大きさを決める物差し"><button type="button" data-area-metric="attention" aria-pressed="${metric==='attention'}">ATTENTION<span>登場回数</span></button><button type="button" data-area-metric="connection" aria-pressed="${metric==='connection'}">CONNECTION<span>接続回数</span></button></div></header><svg viewBox="0 0 900 420" role="img" aria-label="六つの生活領域を円の大きさで示した地図">${circles}</svg></section>`;
}

function wireAreaMap(all,links){
  document.querySelectorAll('[data-area-metric]').forEach(button=>button.addEventListener('click',()=>{
    const current=document.querySelector('.area-map'); if(!current)return;
    current.outerHTML=buildAreaMap(all,links,button.dataset.areaMetric); wireAreaMap(all,links);
  }));
}

const directionOptions=[['OBSERVE','もう少し見る'],['KEEP','残す'],['LESS','減らす'],['MORE','増やす'],['RELEASE','手放す']];
const methodPatterns={
  OBSERVE:[
    {en:'COUNT WHAT HAPPENS',jp:'三日だけ数える',why:'感覚だけでは、量や頻度を大きく見積もることがあります。',action:area=>`${area}に関する出来事を、三日間だけ回数で記録する`,observe:'いつ、何の前後で起きたか',fallback:'一日だけ、正の字で数える'},
    {en:'BEFORE / AFTER',jp:'前後の天気を見る',why:'出来事そのものより、その前後に変化が現れることがあります。',action:area=>`${area}に触れる前と後で、身体と気分の天気を一言ずつ記録する`,observe:'力が戻るか、減るか、変わらないか',fallback:'終わった後だけ記録する'},
    {en:'CHECK ONE FACT',jp:'事実を一つ確かめる',why:'想像している条件と、実際の条件が違う可能性があります。',action:area=>`${area}について、数字・期限・相手の意向のどれか一つを確認する`,observe:'確認前と確認後で、考えがどう変わったか',fallback:'確認先と質問文だけを決める'}
  ],
  KEEP:[
    {en:'PROTECT THE TIME',jp:'先に守る',why:'残したいものは、空いた時間へ置くと後回しになりがちです。',action:area=>`${area}を守る時間を、予定表へ20分だけ先に置く`,observe:'何が割り込もうとしたか',fallback:'20分を10分にする'},
    {en:'NAME THE SUPPORT',jp:'支えている条件を知る',why:'続いている理由が分かると、偶然に頼らず残せます。',action:area=>`${area}を支えている人・場所・習慣を三つ書く`,observe:'なくなると最も困る条件は何か',fallback:'一つだけ書く'},
    {en:'MAKE A MINIMUM',jp:'最小版を決める',why:'忙しい週にも残せる大きさが、継続の土台になります。',action:area=>`${area}を続けたと言える最小の形を一つ決め、今週一度行う`,observe:'無理なく再現できたか',fallback:'時間か量を半分にする'}
  ],
  LESS:[
    {en:'REMOVE ONE',jp:'一回だけ減らす',why:'全部やめなくても、一回減らすと実際の影響を観察できます。',action:area=>`${area}に使っている予定や作業を、今週一回だけ減らす`,observe:'困ったことと、戻ってきた時間や力',fallback:'中止せず、時間を半分にする'},
    {en:'DELAY THE YES',jp:'即答をやめる',why:'反射的な承諾を止めると、自分で選ぶ余白が生まれます。',action:area=>`${area}に関する頼まれごとへ「確認して返事します」と一度だけ答える`,observe:'待ったあとの判断が変わったか',fallback:'返事の前に一度深呼吸する'},
    {en:'CHANGE THE ORDER',jp:'順番を変える',why:'量を変えられなくても、順序で負担が変わることがあります。',action:area=>`${area}の用事を一つ、自分の大切な予定の後ろへ移す`,observe:'気分、集中、罪悪感の変化',fallback:'開始を15分だけ遅らせる'}
  ],
  MORE:[
    {en:'PLACE IT FIRST',jp:'先に20分置く',why:'増やしたいものを空き時間へ任せると、なかなか始まりません。',action:area=>`${area}のための20分を、72時間以内の予定表へ先に置く`,observe:'実行できたか、何が割り込んだか',fallback:'20分を10分にする'},
    {en:'PREPARE THE PLACE',jp:'始めやすくしておく',why:'意志より、始めるまでの手間を減らす方が効くことがあります。',action:area=>`${area}を始めるための道具や場所を、今夜ひとつ準備する`,observe:'翌日、始めるまでの時間が短くなったか',fallback:'必要なものを一か所へ集めるだけ'},
    {en:'ASK FOR A SMALL YES',jp:'小さく人を頼る',why:'一人で全部整えるより、小さな協力で現実へ触れられます。',action:area=>`${area}について、一人に15分だけ相談・依頼・予約の連絡をする`,observe:'相手の反応と、自分の身体の反応',fallback:'送る文章の下書きだけ作る'}
  ],
  RELEASE:[
    {en:'STOP ONCE',jp:'一度だけやめる',why:'永久に手放す前に、一度ない状態を経験できます。',action:area=>`${area}で惰性になっていることを、今週一度だけ行わない`,observe:'本当に困ったか、誰が困ったか',fallback:'完全にやめず半分にする'},
    {en:'REMOVE THE CUE',jp:'目に入る入口を外す',why:'行動は意志より、目に入るきっかけに動かされることがあります。',action:area=>`${area}で手放したいものの通知・道具・予定を一つ見えない場所へ移す`,observe:'思い出す回数と、戻ってきた余白',fallback:'通知を一日だけ切る'},
    {en:'NAME THE BOUNDARY',jp:'境界を一文にする',why:'曖昧な違和感を一文にすると、交渉できる条件になります。',action:area=>`${area}で「ここまではする／ここからはしない」を一文で書く`,observe:'誰に、いつ伝える必要があるか',fallback:'まず自分だけが読める場所へ書く'}
  ]
};
const museumWindows={
  WORK:{href:'/articles/horse-time.html',en:'HORSE / LABOR / TIME',jp:'馬と人間のあいだにある、働く身体と時間',note:'仕事を「量」だけで見ず、身体、技術、世話、歴史の関係から眺めます。'},
  BODY:{href:'/stories/archaeology-of-fear.html',en:'BODY HAS ANOTHER CLOCK',jp:'恐怖の考古学',note:'出来事の時間と、身体が生きる時間は同じ速さでは進みません。'},
  RELATIONSHIPS:{href:'/objects/survivor-tree.html',en:'CARE CONTINUES AFTER THE EVENT',jp:'SURVIVOR TREE',note:'関係は一度の出来事ではなく、その後に続く手入れによって育つことがあります。'},
  HOME:{href:'/prototype/life-note.html',en:'RAIN / HORSE / KITCHEN / LIFE',jp:'最近、雨ばっかり。',note:'暮らしの小さな場面から、季節、動物、食べもの、世界へ道草します。'},
  MONEY:{href:'/articles/five-percent.html',en:'FIVE PERCENT, AND BEYOND',jp:'5％という数字の、その向こう',note:'別々の市場の数字が、Lifeでは同じ財布の中で出会います。'},
  TIME:{href:'/articles/horse-time.html',en:'WHOSE TIME IS IT?',jp:'馬の時間、人間の時間',note:'効率だけでは測れない時間を、動物と人間の関係から見直します。'}
};

function showMethods(area,choice){
  const jp=areaNames[area],cards=methodPatterns[choice]||methodPatterns.OBSERVE;
  const window=museumWindows[area];
  methodShelf.hidden=false;
  methodShelf.innerHTML=`<header><p><span>HOW / METHOD CARDS</span><strong>${area}｜${jp} × ${choice}</strong></p><small>一つだけ選び、72時間の実験へ置きます。</small></header><div class="method-grid">${cards.map((method,index)=>`<article><p class="method-number">0${index+1}</p><h3>${method.en}</h3><h4>${method.jp}</h4><dl><dt>WHY</dt><dd>${method.why}</dd><dt>HOW</dt><dd>${method.action(jp)}</dd><dt>OBSERVE</dt><dd>${method.observe}</dd><dt>IF NOT</dt><dd>${method.fallback}</dd></dl><button type="button" data-method-index="${index}">TRY THIS METHOD <span>この方法を試す</span></button></article>`).join('')}</div><aside class="museum-window"><div><span>MICHIKUSA / HOLOS MUSEUM</span><h3>${window.en}</h3><p>${window.jp}</p></div><div><p>${window.note}</p><a href="${window.href}" target="_blank" rel="noopener">OPEN ANOTHER WINDOW <span>もう一つの窓を開く ↗</span></a></div></aside>`;
  methodShelf.querySelectorAll('[data-method-index]').forEach(button=>button.addEventListener('click',()=>{
    const method=cards[Number(button.dataset.methodIndex)];
    stepForm.elements.action.value=method.action(jp); stepForm.elements.observe.value=method.observe;
    stepForm.elements.action.focus(); showToast('方法を実験欄へ置きました。自分の言葉に直して使えます。');
  }));
}

function buildDirectionPlanner(sample=false){
  const saved=sample?{WORK:'LESS',BODY:'KEEP',RELATIONSHIPS:'MORE',HOME:'OBSERVE',MONEY:'OBSERVE',TIME:'MORE'}:directions();
  const rows=Object.entries(areaNames).map(([area,jp])=>`<label><b>${area}</b><span>${jp}</span><select data-direction-area="${area}" ${sample?'disabled':''}>${directionOptions.map(([value,label])=>`<option value="${value}" ${saved[area]===value?'selected':''}>${value}｜${label}</option>`).join('')}</select></label>`).join('');
  const focusOptions=Object.entries(areaNames).map(([area,jp])=>`<option value="${area}">${area}｜${jp}</option>`).join('');
  return `<section class="direction-planner${sample?' is-sample':''}"><header><span>DIRECTION LENS</span><h3>KEEP / LESS / MORE / RELEASE</h3><p>円の大きさを見たあとで、向かいたい方向は自分で選びます。</p></header><div class="direction-grid">${rows}</div>${sample?'<div class="sample-direction-note"><p>SAMPLE / TIMEを増やすために、WORKを少し減らし、BODYを守る。円の大きさだけでは見えない「意志」を重ねた例です。</p><button type="button" id="sample-to-methods">SEE THE HOW <span>方法の見本を見る</span></button></div>':`<div class="direction-focus"><label>FOCUS THIS SEASON<span>今季、まず動かす領域</span><select id="direction-focus-area">${focusOptions}</select></label><button type="button" id="direction-to-step">MAKE A 72-HOUR STEP <span>小さな一歩へ進む</span></button></div>`}</section>`;
}

function wireDirectionPlanner(){
  document.querySelectorAll('[data-direction-area]').forEach(select=>select.addEventListener('change',()=>{const next=directions();next[select.dataset.directionArea]=select.value;saveDirections(next);showToast('今の方向を、この端末に記録しました。')}));
  const button=document.querySelector('#direction-to-step'); if(!button)return;
  button.addEventListener('click',()=>{
    const area=document.querySelector('#direction-focus-area').value; const choice=directions()[area]||'OBSERVE';
    const jp=areaNames[area]; const directionLabel=Object.fromEntries(directionOptions)[choice];
    stepForm.elements.question.value=`${area}｜${jp}を「${directionLabel}」方向で考える`;
    stepForm.elements.focusArea.value=area; stepForm.elements.direction.value=choice;
    showMethods(area,choice); showPanel('step');
    showToast('方向を72時間の実験へ渡しました。次は小さな行動を一つ。');
  });
}

function wireSampleMethods(){
  const button=document.querySelector('#sample-to-methods'); if(!button)return;
  button.addEventListener('click',()=>{showMethods('TIME','MORE');stepForm.elements.question.value='TIME｜時間を「増やす」方向で考える';stepForm.elements.focusArea.value='TIME';stepForm.elements.direction.value='MORE';showPanel('step');showToast('TIMEを増やす、三つの方法の見本です。')});
}
const sampleLinks=[
  {id:'SL-01',from:'SAMPLE-02',to:'SAMPLE-01',relation:'奪っている',note:'頼まれる前に動く時間が積み重なっている。'},
  {id:'SL-02',from:'SAMPLE-03',to:'SAMPLE-01',relation:'支えている',note:'話すことで考えが整理され、自分の時間へ戻りやすい。'},
  {id:'SL-03',from:'SAMPLE-04',to:'SAMPLE-01',relation:'奪っている',note:'勤務時間外にも、頭の中では仕事が続いている。'},
  {id:'SL-04',from:'SAMPLE-04',to:'SAMPLE-05',relation:'同時に起きる',note:'締切が重なる週は、肩のこわばりと眠りの浅さも増える。'},
  {id:'SL-05',from:'SAMPLE-05',to:'SAMPLE-03',relation:'原因かもしれない',note:'疲れているほど、会話を避けてしまうことがある。'}
];

function sampleCards(){
  const byId=Object.fromEntries(sampleSpecimens.map(item=>[item.id,item]));
  return sampleLinks.map(link=>`<article class="relationship-card is-sample">
    <div class="relationship-node"><span>${link.from}</span><p>${escapeHtml(byId[link.from].observation)}</p></div>
    <div class="relationship-line"><i></i><strong>${escapeHtml(link.relation)}</strong><i></i></div>
    <div class="relationship-node"><span>${link.to}</span><p>${escapeHtml(byId[link.to].observation)}</p></div>
    <p class="relationship-note">NOTE / ${escapeHtml(link.note)}</p>
  </article>`).join('');
}

function wireSampleButton(){
  const button=document.querySelector('#show-sample-map'); if(!button)return;
  button.addEventListener('click',()=>{
    relationshipMap.innerHTML=`<div class="sample-banner"><p><b>SAMPLE MAP</b><span>これは見本です。あなたの記録には保存されません。</span></p><button type="button" id="close-sample-map">CLOSE SAMPLE <span>見本を閉じる</span></button></div>${buildAreaMap(sampleSpecimens,sampleLinks)}${buildDirectionPlanner(true)}${buildNetwork(sampleSpecimens,sampleLinks)}${sampleCards()}`;
    wireAreaMap(sampleSpecimens,sampleLinks);
    wireSampleMethods();
    document.querySelector('#close-sample-map').addEventListener('click',renderRelationships);
  });
}

function renderRelationships(){
  const all=specimens();
  const selects=[relationshipForm.elements.from,relationshipForm.elements.to];
  const options=all.map(item=>`<option value="${escapeHtml(item.id)}">${escapeHtml(specimenLabel(item))}</option>`).join('');
  selects.forEach((select,index)=>{const previous=select.value;select.innerHTML=`<option value="">標本を選ぶ</option>${options}`;select.value=previous;if(index===1&&!select.value&&all[1])select.value=all[1].id});
  if(all.length<2){relationshipMap.innerHTML='<div class="empty-map"><p>関係を結ぶには、二つ以上の標本が必要です。<br>まずFIELD NOTEへ、小さな記録を置いてみましょう。</p><button type="button" id="show-sample-map">VIEW SAMPLE MAP <span>見本の関係地図を見る</span></button></div>';wireSampleButton();return}
  const byId=Object.fromEntries(all.map(item=>[item.id,item]));
  const links=relationships().filter(link=>byId[link.from]&&byId[link.to]);
  if(!links.length){relationshipMap.innerHTML='<div class="empty-map"><p>まだ関係線はありません。<br>正解を決めず、「そう見える」を一本だけ結んでみましょう。</p><button type="button" id="show-sample-map">VIEW SAMPLE MAP <span>見本の関係地図を見る</span></button></div>';wireSampleButton();return}
  relationshipMap.innerHTML=buildAreaMap(all,links)+buildDirectionPlanner()+buildNetwork(all,links)+links.map(link=>`<article class="relationship-card">
    <div class="relationship-node"><span>${escapeHtml(link.from)}</span><p>${escapeHtml(specimenLabel(byId[link.from]).split('｜').slice(1).join('｜'))}</p></div>
    <div class="relationship-line"><i></i><strong>${escapeHtml(link.relation)}</strong><i></i></div>
    <div class="relationship-node"><span>${escapeHtml(link.to)}</span><p>${escapeHtml(specimenLabel(byId[link.to]).split('｜').slice(1).join('｜'))}</p></div>
    ${link.note?`<p class="relationship-note">NOTE / ${escapeHtml(link.note)}</p>`:''}
    <button type="button" data-delete-link="${escapeHtml(link.id)}">UNLINK / 線を外す</button>
  </article>`).join('');
  relationshipMap.querySelectorAll('[data-delete-link]').forEach(button=>button.addEventListener('click',()=>{saveRelationships(relationships().filter(link=>link.id!==button.dataset.deleteLink));renderRelationships();showToast('関係線を外しました。')}));
  wireAreaMap(all,links);
  wireDirectionPlanner();
}

relationshipForm.addEventListener('submit',event=>{
  event.preventDefault(); const data=new FormData(relationshipForm);
  const from=data.get('from'),to=data.get('to');
  if(from===to){showToast('別の二つの標本を選んでください。');return}
  const all=relationships();
  all.unshift({id:`RL-${String(Date.now()).slice(-8)}`,from,to,relation:data.get('relation'),note:data.get('note').trim(),createdAt:new Date().toISOString()});
  saveRelationships(all); relationshipForm.elements.note.value=''; renderRelationships(); showToast('標本のあいだに、関係線を結びました。');
});

document.querySelector('#export-button').addEventListener('click',()=>{
  const all=specimens(); if(!all.length){showToast('書き出す標本がありません。');return}
  const lines=['# LIFE SPECIMEN EXPORT','',...all.flatMap(item=>[
    `## ${item.observedOn} / ${item.id}`,'',`- SEASON: ${item.season}`,`- PLACE: ${item.place||'—'}`,`- BODY WEATHER: ${item.weather}`,`- LIFE AREAS: ${item.areas.join(', ')||'UNCLASSIFIED'}`,'',item.observation,''
  ])];
  const blob=new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'}); const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`life-specimens-${new Date().toISOString().slice(0,10)}.md`;a.click();URL.revokeObjectURL(url);
});

stepForm.addEventListener('submit',event=>{
  event.preventDefault(); const data=new FormData(stepForm);
  const experiment={question:data.get('question').trim(),action:data.get('action').trim(),when:data.get('when'),observe:data.get('observe').trim(),focusArea:data.get('focusArea'),direction:data.get('direction'),createdAt:new Date().toISOString()};
  localStorage.setItem(STEP_KEY,JSON.stringify(experiment));renderStep();showToast('72時間の実験を置きました。');
});

function renderStep(){
  const step=parse(STEP_KEY,null);
  if(!step){activeStep.innerHTML='';return}
  const when=new Date(step.when); const valid=!Number.isNaN(when.valueOf());
  activeStep.innerHTML=`<article class="experiment"><p class="catalogue">ACTIVE EXPERIMENT</p><p class="due">${valid?when.toLocaleString('ja-JP',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'日時未設定'}</p><h3>${escapeHtml(step.action)}</h3>${step.question?`<p>QUESTION / ${escapeHtml(step.question)}</p>`:''}${step.observe?`<p>OBSERVE / ${escapeHtml(step.observe)}</p>`:''}</article><form id="experiment-review" class="experiment-review"><p class="catalogue">RETURN / EXPERIMENT TO SPECIMEN</p><h3>WHAT DID REALITY SAY?</h3><p class="review-lead">現実は、どんな返事をしましたか。</p><label>WHAT HAPPENED<span>実際に起きたこと</span><textarea name="result" rows="4" maxlength="600" required></textarea></label><div class="review-grid"><label>BODY WEATHER<span>実験後の心身</span><select name="weather"><option>晴れ</option><option>薄曇り</option><option>雨</option><option>風</option><option>嵐</option><option selected>わからない</option></select></label><label>NEXT<span>次はどうしますか</span><select name="next"><option value="CONTINUE">CONTINUE｜続ける</option><option value="CHANGE">CHANGE｜変える</option><option value="CLOSE">CLOSE｜終える</option></select></label></div><label>ONE LINE<span>次の自分へ残す一言・任意</span><input name="note" type="text" maxlength="180"></label><button type="submit">RETURN TO COLLECTION <span>結果を標本として収蔵する</span></button></form>`;
  document.querySelector('#experiment-review').addEventListener('submit',event=>{
    event.preventDefault(); const data=new FormData(event.currentTarget); const all=specimens();
    const next=data.get('next'); const result=data.get('result').trim(); const note=data.get('note').trim();
    const observation=[`EXPERIMENT｜${step.action}`,`WHAT HAPPENED｜${result}`,`NEXT｜${next}`,note&&`ONE LINE｜${note}`].filter(Boolean).join('\n\n');
    all.unshift({id:`EX-${String(Date.now()).slice(-8)}`,createdAt:new Date().toISOString(),observedOn:new Date().toISOString().slice(0,10),place:'',season:'実験',weather:data.get('weather'),observation,areas:step.focusArea?[step.focusArea]:[]});
    saveSpecimens(all); localStorage.removeItem(STEP_KEY); stepForm.reset(); renderStep(); showToast('現実からの返事を、標本として収蔵しました。'); showPanel('collection');
  });
}

document.querySelector('#another-question').addEventListener('click',()=>{
  const current=thirdQuestionText.textContent;
  const available=thirdQuestions.filter(question=>question!==current);
  thirdQuestionText.textContent=available[Math.floor(Math.random()*available.length)];
});

voicesForm.addEventListener('submit',event=>{
  event.preventDefault();
  const data=new FormData(voicesForm); const all=specimens();
  const topic=data.get('topic').trim(); const fact=data.get('fact').trim(); const story=data.get('story').trim();
  const possibility=data.get('possibility').trim(); const hypothesis=data.get('hypothesis').trim();
  const observation=[
    `QUESTION｜${topic}`,
    fact&&`FACT｜${fact}`,
    story&&`STORY｜${story}`,
    possibility&&`POSSIBILITY｜${possibility}`,
    `THIRD QUESTION｜${thirdQuestionText.textContent}`,
    hypothesis&&`HYPOTHESIS｜${hypothesis}`
  ].filter(Boolean).join('\n\n');
  all.unshift({id:`TV-${String(Date.now()).slice(-8)}`,createdAt:new Date().toISOString(),observedOn:new Date().toISOString().slice(0,10),place:'',season:'未分類',weather:'わからない',observation,areas:[]});
  saveSpecimens(all); voicesForm.reset(); thirdQuestionText.textContent=thirdQuestions[0];
  showToast('三つの声を標本として残しました。'); showPanel('collection');
});

renderSpecimens(); renderStep();
