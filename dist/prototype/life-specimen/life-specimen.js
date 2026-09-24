const STORAGE_KEY='holos88.lifeSpecimens.v1';
const STEP_KEY='holos88.lifeExperiment.v1';
const panels=[...document.querySelectorAll('[data-panel]')];
const navButtons=[...document.querySelectorAll('[data-view]')];
const form=document.querySelector('#specimen-form');
const list=document.querySelector('#specimen-list');
const count=document.querySelector('#specimen-count');
const stepForm=document.querySelector('#step-form');
const activeStep=document.querySelector('#active-step');
let currentFilter='ALL';

const parse=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const specimens=()=>parse(STORAGE_KEY,[]);
const saveSpecimens=value=>localStorage.setItem(STORAGE_KEY,JSON.stringify(value));
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
  }));
}

document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  currentFilter=button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  renderSpecimens();
}));

document.querySelector('#clear-button').addEventListener('click',()=>{
  if(!specimens().length)return;
  if(window.confirm('この端末に保存した標本を、すべて削除しますか？')){localStorage.removeItem(STORAGE_KEY);renderSpecimens();showToast('すべて削除しました。')}
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

renderSpecimens(); renderStep();
