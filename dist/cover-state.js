// State is deliberately one-way: user interaction never restarts autoplay.
export function createCoverState(reducedMotion=false){
 let index=0,automatic=!reducedMotion;
 return {
  get index(){return index;},get automatic(){return automatic;},
  stop(){automatic=false;},
  select(value){automatic=false;index=Math.max(0,Math.min(4,value));},
  advance(){if(automatic){index=Math.min(4,index+1);if(index===4)automatic=false;}}
 };
}
