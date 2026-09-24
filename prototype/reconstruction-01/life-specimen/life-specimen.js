const STORAGE_KEY='holos88.lifeSpecimens.v1';
const STEP_KEY='holos88.lifeExperiment.v1';
const RELATIONSHIP_KEY='holos88.lifeRelationships.v1';
const panels=[...document.querySelectorAll('[data-panel]')];
const navButtons=[...document.querySelectorAll('[data-view]')];
const form=document.querySelector('#specimen-form');
const list=document.querySelector('#specimen-list');
const count=document.querySelector('#specimen-count');
const stepForm=document.querySelector('#step-form');
const activeStep=document.querySelector('#active-step');
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
    relationshipMap.innerHTML=`<div class="sample-banner"><p><b>SAMPLE MAP</b><span>これは見本です。あなたの記録には保存されません。</span></p><button type="button" id="close-sample-map">CLOSE SAMPLE <span>見本を閉じる</span></button></div>${buildAreaMap(sampleSpecimens,sampleLinks)}${buildNetwork(sampleSpecimens,sampleLinks)}${sampleCards()}`;
    wireAreaMap(sampleSpecimens,sampleLinks);
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
  relationshipMap.innerHTML=buildAreaMap(all,links)+buildNetwork(all,links)+links.map(link=>`<article class="relationship-card">
    <div class="relationship-node"><span>${escapeHtml(link.from)}</span><p>${escapeHtml(specimenLabel(byId[link.from]).split('｜').slice(1).join('｜'))}</p></div>
    <div class="relationship-line"><i></i><strong>${escapeHtml(link.relation)}</strong><i></i></div>
    <div class="relationship-node"><span>${escapeHtml(link.to)}</span><p>${escapeHtml(specimenLabel(byId[link.to]).split('｜').slice(1).join('｜'))}</p></div>
    ${link.note?`<p class="relationship-note">NOTE / ${escapeHtml(link.note)}</p>`:''}
    <button type="button" data-delete-link="${escapeHtml(link.id)}">UNLINK / 線を外す</button>
  </article>`).join('');
  relationshipMap.querySelectorAll('[data-delete-link]').forEach(button=>button.addEventListener('click',()=>{saveRelationships(relationships().filter(link=>link.id!==button.dataset.deleteLink));renderRelationships();showToast('関係線を外しました。')}));
  wireAreaMap(all,links);
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
  const experiment={question:data.get('question').trim(),action:data.get('action').trim(),when:data.get('when'),observe:data.get('observe').trim(),createdAt:new Date().toISOString()};
  localStorage.setItem(STEP_KEY,JSON.stringify(experiment));renderStep();showToast('72時間の実験を置きました。');
});

function renderStep(){
  const step=parse(STEP_KEY,null);
  if(!step){activeStep.innerHTML='';return}
  const when=new Date(step.when); const valid=!Number.isNaN(when.valueOf());
  activeStep.innerHTML=`<article class="experiment"><p class="catalogue">ACTIVE EXPERIMENT</p><p class="due">${valid?when.toLocaleString('ja-JP',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'日時未設定'}</p><h3>${escapeHtml(step.action)}</h3>${step.question?`<p>QUESTION / ${escapeHtml(step.question)}</p>`:''}${step.observe?`<p>OBSERVE / ${escapeHtml(step.observe)}</p>`:''}<button type="button" id="complete-step">CLOSE / 実験を閉じる</button></article>`;
  document.querySelector('#complete-step').addEventListener('click',()=>{localStorage.removeItem(STEP_KEY);renderStep();showToast('実験を閉じました。気づきを標本に残してみましょう。')});
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
