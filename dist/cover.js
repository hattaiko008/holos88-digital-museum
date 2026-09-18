import {createCoverState} from './cover-state.js';
const cover=document.querySelector('[data-cover]');
if(cover){
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const state=createCoverState(motion.matches);
 const scenes=[...cover.querySelectorAll('[data-scene]')];
 const buttons=[...cover.querySelectorAll('[data-cover-select]')];
 const pause=cover.querySelector('[data-cover-pause]');
 const status=cover.querySelector('[data-cover-status]');
 const orbitButton=cover.querySelector('.orbit-motion');
 let timer=null,inView=true,orbitPaused=motion.matches;
 const update=()=>{
  scenes.forEach((s,i)=>{s.hidden=i!==state.index;s.inert=i!==state.index;});
  buttons.forEach((b,i)=>b.setAttribute('aria-current',i===state.index?'true':'false'));
  status.textContent=`0${state.index+1} / 05${state.index===4?' — 最後の表紙':''}`;
  pause.disabled=!state.automatic;pause.textContent=state.automatic?'自動切替を止める':'自動切替：停止';
  cover.classList.toggle('orbit-drifting',state.index===4&&!orbitPaused&&!motion.matches&&inView&&!document.hidden);
  orbitButton.textContent=orbitPaused||motion.matches?'ORBITの動きを有効にする':'ORBITの動きを止める';
  orbitButton.setAttribute('aria-pressed',String(orbitPaused||motion.matches));orbitButton.disabled=motion.matches;
 };
 const stop=()=>{state.stop();clearTimeout(timer);update();};
 const schedule=()=>{clearTimeout(timer);if(state.automatic)timer=setTimeout(()=>{state.advance();update();schedule();},Number(cover.dataset.interval)||12000);};
 buttons.forEach((b,i)=>b.addEventListener('click',()=>{state.select(i);clearTimeout(timer);update();}));
 cover.querySelector('.cover-controls nav').addEventListener('keydown',event=>{
  const n=buttons.indexOf(document.activeElement);if(n<0)return;
  const target=event.key==='ArrowRight'?Math.min(4,n+1):event.key==='ArrowLeft'?Math.max(0,n-1):event.key==='Home'?0:event.key==='End'?4:null;
  if(target!==null){event.preventDefault();state.select(target);clearTimeout(timer);update();buttons[target].focus();}
 });
 pause.addEventListener('click',stop);
 cover.addEventListener('focusin',stop);
 cover.addEventListener('pointerenter',stop);
 cover.addEventListener('pointerdown',stop);
 orbitButton.addEventListener('click',()=>{orbitPaused=!orbitPaused;stop();});
 motion.addEventListener('change',()=>{if(motion.matches){orbitPaused=true;stop();}else update();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else update();});
 if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(!inView)stop();else update();},{threshold:0.15}).observe(cover);
 cover.classList.add('cover-ready');cover.querySelector('.cover-controls').hidden=false;orbitButton.hidden=false;
 if(location.hash||new URLSearchParams(location.search).has('object'))state.stop();
 update();schedule();
}
