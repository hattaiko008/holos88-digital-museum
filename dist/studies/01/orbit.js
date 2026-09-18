import {orbitPositions} from './orbit-geometry.js';
const field=document.querySelector('.study-orbit');
const cover=document.querySelector('[data-cover]');
const items=[...field.querySelectorAll('[data-orbit-item]')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let seconds=0,previous=null;
// A shared slow revolution plus bounded, individual phase variation preserves
// minimum separation. Each plate stays upright; image and label travel together.
function paint(){
 const {width,height}=field.getBoundingClientRect();
 orbitPositions(width,height,seconds).forEach((position,i)=>{
  items[i].style.left=`${position.x}px`;
  items[i].style.top=`${position.y}px`;
 });
}
function tick(now){
 const moving=cover.classList.contains('orbit-drifting')&&!reduced.matches&&!document.hidden&&!field.matches(':hover')&&!field.matches(':focus-within');
 if(moving&&previous!==null)seconds+=Math.min((now-previous)/1000,.1);
 previous=now;if(moving)paint();requestAnimationFrame(tick);
}
new ResizeObserver(paint).observe(field);paint();requestAnimationFrame(tick);
