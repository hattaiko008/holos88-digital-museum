'use strict';
const data=JSON.parse(document.getElementById('collection-data').textContent);
const search=document.getElementById('search');
const filters=[...document.querySelectorAll('[data-filter]')];
const cards=[...document.querySelectorAll('[data-slug]')];
let activeFilter='ALL';
const normalize=s=>String(s??'').normalize('NFKC').toLocaleLowerCase().trim();
function filterCollection(){
  const terms=normalize(search.value).split(/\s+/).filter(Boolean);
  let count=0;
  cards.forEach(card=>{
    const o=data.objects.find(o=>o.slug===card.dataset.slug);
    const haystack=normalize([o.title,o.titleJa,o.id,o.caption,o.place,o.species,...o.types].join(' '));
    const visible=(activeFilter==='ALL'||o.types.includes(activeFilter))&&terms.every(t=>haystack.includes(t));
    card.hidden=!visible;if(visible)count++;
  });
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===activeFilter)));
  document.getElementById('result-count').textContent=`${count} ${count===1?'object':'objects'}`;
  document.getElementById('empty').hidden=count>0;
  document.getElementById('reset').hidden=activeFilter==='ALL'&&!search.value;
  return count;
}
function resetCollection(){search.value='';activeFilter='ALL';filterCollection();search.focus();}
search.addEventListener('input',filterCollection);
document.getElementById('search-form').addEventListener('submit',e=>{e.preventDefault();filterCollection();document.getElementById('collection').scrollIntoView({block:'start'});});
filters.forEach(button=>button.addEventListener('click',()=>{activeFilter=button.dataset.filter;filterCollection();}));
document.getElementById('reset').addEventListener('click',resetCollection);
document.getElementById('empty-reset').addEventListener('click',resetCollection);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function showRelation(id){
  const relation=data.relationshipPreview.find(r=>r.id===id);if(!relation)return;
  document.querySelectorAll('[data-relation]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.relation===id)));
  document.getElementById('relation-copy').innerHTML=`<h3>${escape(relation.heading)}</h3><p>${escape(relation.text)}</p>`;
}
document.querySelectorAll('[data-relation]').forEach(b=>b.addEventListener('click',()=>showRelation(b.dataset.relation)));
showRelation(data.relationshipPreview[0].id);
const dialog=document.getElementById('object-dialog');
let returnFocus=null;
function showObject(slug,michikusa=false){
  const o=data.objects.find(o=>o.slug===slug);if(!o)return;
  returnFocus=document.activeElement;
  const im=o.image;
  document.getElementById('dialog-kicker').textContent=michikusa?'MICHIKUSA🌱 / 道草':'COLLECTION / 標本プレビュー';
  document.getElementById('dialog-content').innerHTML=`${im.src?`<img class="dialog-image" src="${escape(im.src)}" alt="${escape(im.alt)}">`:'<p>IMAGE FORTHCOMING / 画像準備中</p>'}<h2 id="dialog-title">${escape(o.title)}</h2><p>${escape(o.titleJa)} · ${escape(o.caption)}</p>${michikusa?'<p>目の前の小さな種から、これから育つ世界を想像する。一本の樹木との出会いは、まだ見ぬ生命への入口にもなる。</p>':''}<dl><dt>Object ID</dt><dd>${escape(o.id)}</dd><dt>Type</dt><dd>${escape(o.types.join(' / '))}</dd>${o.place?`<dt>Place</dt><dd>${escape(o.place)}</dd>`:''}${o.species?`<dt>Species</dt><dd><i>${escape(o.species)}</i></dd>`:''}${im.src?`<dt>Image title</dt><dd>${escape(im.title)}</dd><dt>Creator / Date</dt><dd>${escape(im.creator)} / ${escape(im.date)}</dd>${im.institution?`<dt>Institution</dt><dd>${escape(im.institution)}</dd>`:''}<dt>Rights</dt><dd><a href="${escape(im.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escape(im.rights)} ↗</a></dd><dt>Source</dt><dd><a href="${escape(im.sourceUrl)}" target="_blank" rel="noopener noreferrer">Wikimedia Commons — 画像の出典 ↗</a></dd>`:'<dt>Image</dt><dd>出典と利用条件を確認した画像を準備しています。</dd>'}</dl>`;
  const stories=data.articleLinks?.[o.id]||[];
  if(stories.length)document.getElementById('dialog-content').insertAdjacentHTML('beforeend',`<section class="article-connections"><p class="eyebrow">FROM THIS OBJECT / この標本から読む</p>${stories.map(a=>`<p><a href="${escape(a.route)}">${escape(a.title)} ↗</a><br><small>${escape(a.window)} / ${escape(a.author)}${a.status==='placeholder'?' · 本文準備中':''}</small></p>`).join('')}</section>`);
  dialog.showModal();
}
document.querySelectorAll('[data-object]').forEach(b=>b.addEventListener('click',()=>showObject(b.dataset.object)));
document.getElementById('michikusa-open').addEventListener('click',()=>showObject('seed',true));
document.getElementById('dialog-close').addEventListener('click',()=>dialog.close());
document.getElementById('dialog-return').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>returnFocus?.focus({preventScroll:true}));
if(document.modelContext?.registerTool){
  try{Promise.resolve(document.modelContext.registerTool({name:'filter_holos_collection',description:'Filter the visible HOME collection by search text and an exploration type.',inputSchema:{type:'object',properties:{query:{type:'string'},type:{type:'string',enum:['ALL',...data.exploreBy]}},required:['query','type'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input||typeof input.query!=='string'||!['ALL',...data.exploreBy].includes(input.type))throw new Error('Invalid query or type');search.value=input.query;activeFilter=input.type;return {count:filterCollection(),query:search.value,type:activeFilter};}})).catch(()=>{});}catch{}
}

// Stable collection destinations also work after reload or a shared local link.
const requestedObject=new URLSearchParams(location.search).get("object");
if(requestedObject){
  showObject(requestedObject);
  returnFocus=[...document.querySelectorAll('[data-object]')].find(b=>b.dataset.object===requestedObject)||document.getElementById('search');
}
