export function orbitPositions(width,height,seconds){
 const rx=width<700?width/2-48:width/2-90;
 return [0,1,2].map(i=>{
  const angle=-Math.PI/2+i*2*Math.PI/3+seconds*2*Math.PI/160+.10*Math.sin(seconds*2*Math.PI/[67,89,113][i]);
  return {x:width/2+rx*Math.cos(angle),y:height/2+240*Math.sin(angle)};
 });
}
