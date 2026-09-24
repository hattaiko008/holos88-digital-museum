(()=>{
  const root=document.querySelector('[data-reading-trail]');
  if(!root)return;
  const key='holos88-reading-trail-v1';
  const current={slug:root.dataset.slug,title:root.dataset.title,titleJa:root.dataset.titleJa,href:location.pathname,visitedAt:new Date().toISOString(),saved:false};
  let trail=[];
  try{trail=JSON.parse(localStorage.getItem(key)||'[]')}catch{trail=[]}
  const previous=trail.find(item=>item.slug===current.slug);
  current.saved=Boolean(previous?.saved);
  trail=[current,...trail.filter(item=>item.slug!==current.slug)].slice(0,88);
  const save=()=>localStorage.setItem(key,JSON.stringify(trail));
  const button=root.querySelector('[data-trail-save]');
  const list=root.querySelector('[data-trail-list]');
  const render=()=>{
    button.setAttribute('aria-pressed',String(current.saved));
    button.textContent=current.saved?'SAVED ★':'SAVE THIS WINDOW ☆';
    list.innerHTML='';
    const display=[...trail.filter(item=>item.saved),...trail.filter(item=>!item.saved).slice(0,8)];
    display.forEach((item,index)=>{
      const li=document.createElement('li');
      const a=document.createElement('a');
      a.href=item.href;
      const number=document.createElement('span');
      number.textContent=String(index+1).padStart(2,'0');
      const copy=document.createElement('span');
      const strong=document.createElement('strong');
      strong.textContent=item.title;
      const small=document.createElement('small');
      small.textContent=item.titleJa;
      copy.append(strong,small);
      const mark=document.createElement('b');
      mark.textContent=item.saved?'★':'↗';
      a.append(number,copy,mark);
      li.append(a);
      list.append(li);
    });
  };
  button.addEventListener('click',()=>{
    current.saved=!current.saved;
    trail=trail.map(item=>item.slug===current.slug?{...item,saved:current.saved}:item);
    save();render();
  });
  save();render();
})();
