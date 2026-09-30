(()=>{
  const panel=document.querySelector('[data-site-search]');
  const openButton=document.querySelector('[data-search-open]');
  if(!panel||!openButton)return;
  const closeButton=panel.querySelector('[data-search-close]');
  const form=panel.querySelector('[data-search-form]');
  const input=panel.querySelector('[data-search-input]');
  const status=panel.querySelector('[data-search-status]');
  const results=panel.querySelector('[data-search-results]');
  const fixed=[
    {title:'FIVE WAYS TO EXPLORE',ja:'年表・地図・読む時間・収蔵品・世界から入る',series:'THE LIVING INDEX',href:'/prototype/layer02-preview.html'},
    {title:'THE LIVING ATLAS',ja:'時間と場所から世界を歩く',series:'ATLAS',href:'/prototype/time-atlas/index.html'},
    {title:'THE OBJECTS',ja:'記事から生まれた象徴物の収蔵庫',series:'MUSEUM',href:'/prototype/collection.html'},
    {title:'WORLDS TO ENTER',ja:'哲学・思想・政治・身体・自然から入る',series:'WORLDS',href:'/prototype/worlds.html'}
  ];
  let catalogue=fixed;
  let returnFocus=null;
  const normalize=value=>String(value||'').normalize('NFKC').toLocaleLowerCase('ja').replace(/\s+/g,' ').trim();
  const searchable=item=>normalize([item.title,item.ja,item.series].join(' '));
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const render=(query='')=>{
    const words=normalize(query).split(' ').filter(Boolean);
    const matches=words.length?catalogue.filter(item=>words.every(word=>searchable(item).includes(word))):fixed;
    status.textContent=words.length?`${matches.length}件の窓が見つかりました。`:'公開中の記事や入口を、言葉から探せます。';
    results.innerHTML=matches.length?matches.slice(0,30).map(item=>`<a href="${escapeHtml(item.href)}"><small>${escapeHtml(item.series||'READ')}</small><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.ja||'')}</span><b aria-hidden="true">↗</b></a>`).join(''):'<p>一致する窓はありません。別の言葉でも探してみてください。</p>';
  };
  const load=async()=>{
    if(catalogue.length>fixed.length)return;
    try{
      const response=await fetch('/prototype/editorial-status.json',{cache:'no-store'});
      if(!response.ok)throw new Error('catalogue unavailable');
      const data=await response.json();
      const articles=(data.articles||[]).filter(item=>['approved','published'].includes(item.stage)).map(item=>({
        title:item.title,
        ja:'',
        series:item.series||'READ',
        href:item.location&&item.location.startsWith('/')?item.location:(item.file.startsWith('pages/')?`/prototype/${item.file.slice(6)}`:`/prototype/articles/${item.file}`)
      }));
      catalogue=[...fixed,...articles];
    }catch(error){
      console.warn('HOLOS search catalogue:',error);
    }
    render(input.value);
  };
  const open=()=>{
    returnFocus=document.activeElement;
    panel.hidden=false;
    document.body.classList.add('search-is-open');
    openButton.setAttribute('aria-expanded','true');
    render(input.value);
    load();
    requestAnimationFrame(()=>input.focus());
  };
  const close=()=>{
    panel.hidden=true;
    document.body.classList.remove('search-is-open');
    openButton.setAttribute('aria-expanded','false');
    if(returnFocus&&returnFocus.focus)returnFocus.focus();
  };
  openButton.addEventListener('click',open);
  closeButton.addEventListener('click',close);
  panel.addEventListener('click',event=>{if(event.target===panel)close()});
  form.addEventListener('submit',event=>{event.preventDefault();render(input.value)});
  input.addEventListener('input',()=>render(input.value));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)close()});
})();
