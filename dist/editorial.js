'use strict';
const editorial=JSON.parse(document.getElementById('editorial-data').textContent);
const room=document.getElementById('michikusa-room');
const drawer=document.getElementById('collection-drawer');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let roomOrigin=null,drawerOrigin=null;
const record=id=>editorial.entities.find(e=>e.id===id);
function openRoom(){
  if(room.open)return;
  roomOrigin={element:document.activeElement,scroll:window.scrollY};
  room.showModal();room.scrollTop=0;
}
document.querySelectorAll('[data-open-detour]').forEach(b=>b.addEventListener('click',openRoom));
document.querySelectorAll('[data-close-detour]').forEach(b=>b.addEventListener('click',()=>room.close()));
room.addEventListener('close',()=>{if(roomOrigin){roomOrigin.element?.focus({preventScroll:true});window.scrollTo({top:roomOrigin.scroll,behavior:'instant'});}});
// Sources in the side room open separately; they never lose the reading location.
room.querySelectorAll('.source-ref').forEach(a=>{const s=editorial.sources.find(s=>'#source-'+s.id===a.getAttribute('href'));if(s){a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';}});
function renderRecord(id){
  const e=record(id);if(!e)return false;
  const m=e.media;
  const relationships=editorial.relationships.filter(r=>r.from_id===id||r.to_id===id);
  const seen=new Set();
  const related=relationships.filter(r=>{const key=r.from_id===id?r.to_id:r.from_id;if(seen.has(key))return false;seen.add(key);return true;});
  document.getElementById('drawer-content').innerHTML=`<p class="eyebrow">${esc(e.kind.toUpperCase())} / ${esc(e.id)}</p>${m?.src?`<img src="${esc(m.src)}" alt="${esc(m.alt_text)}"><p class="drawer-credit">${esc(m.caption||'')}<br>${esc(m.credit_line)} · <a href="${esc(m.source_url)}" target="_blank" rel="noopener noreferrer">Source ↗</a>${m.license?` · <a href="${esc(m.license)}" target="_blank" rel="noopener noreferrer">License ↗</a>`:''}</p>`:''}<h2 id="drawer-title">${esc(e.title)}</h2><p>${esc(e.title_ja)}</p><p>${esc(e.summary)}</p>${e.source_ids.length?`<div class="drawer-sources"><p class="eyebrow">SOURCE</p>${e.source_ids.map(id=>{const s=editorial.sources.find(s=>s.id===id);return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.institution)} / ${esc(s.title)} ↗</a>`;}).join('')}</div>`:'<p class="drawer-path-label">EDITORIAL LENS / 編集上の問い</p>'}${related.length?`<p class="eyebrow">FOLLOW THE RELATIONSHIP</p><div class="drawer-links">${related.map(r=>{const other=record(r.from_id===id?r.to_id:r.from_id);return `<div><button class="entity-label" data-entity="${esc(other.id)}">${esc(other.title)} ↗</button><p class="drawer-path-label">${esc(r.label)}<br>${r.evidence_status==='documented'?'資料に基づく関係':'編集上のつながり'}</p></div>`;}).join('')}</div>`:''}${e.route?`<a class="drawer-onward" href="${esc(e.route)}">OBJECTの収蔵記録へ ↗</a>`:''}`;
  if(e.articles?.length)document.getElementById('drawer-content').insertAdjacentHTML('beforeend',`<section class="article-connections"><p class="eyebrow">FROM THIS OBJECT</p>${e.articles.map(a=>`<p><a href="${esc(a.route)}">${esc(a.title)} ↗</a><small>${esc(a.window)} / ${esc(a.author)}${a.status==='placeholder'?' · 本文準備中':''}</small></p>`).join('')}</section>`);
  drawer.scrollTop=0;
  return true;
}
document.addEventListener('click',event=>{
  const b=event.target.closest('[data-entity]');if(!b)return;
  if(!drawer.open)drawerOrigin=b;
  if(!renderRecord(b.dataset.entity))return;
  if(!drawer.open)drawer.showModal();
  else {const heading=document.getElementById('drawer-title');heading.tabIndex=-1;heading.focus({preventScroll:true});}
});
document.querySelectorAll('[data-close-drawer]').forEach(b=>b.addEventListener('click',()=>drawer.close()));
drawer.addEventListener('close',()=>drawerOrigin?.focus({preventScroll:true}));
// A quiet chapter marker. No animation, no scroll hijacking.
if('IntersectionObserver' in window){
  const links=[...document.querySelectorAll('.chapter-nav a')];
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){links.forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});}},{rootMargin:'-10% 0px -65% 0px',threshold:0});
  document.querySelectorAll('.chapter').forEach(s=>observer.observe(s));
}
