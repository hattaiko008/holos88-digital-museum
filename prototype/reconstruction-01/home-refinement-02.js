(() => {
  const toggle=document.querySelector('[data-museum-nav-toggle]');
  const nav=document.querySelector('#museum-navigation');
  if(toggle&&nav){
    const close=()=>{toggle.setAttribute('aria-expanded','false');nav.classList.remove('is-open')};
    toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open)});
    nav.addEventListener('click',event=>{if(event.target.closest('a'))close()});
    addEventListener('resize',()=>{if(innerWidth>760)close()});
  }

  document.querySelectorAll('.museum-nav-item>button').forEach(button=>{
    button.addEventListener('click',()=>{
      const open=button.getAttribute('aria-expanded')!=='true';
      document.querySelectorAll('.museum-nav-item>button').forEach(item=>item.setAttribute('aria-expanded','false'));
      button.setAttribute('aria-expanded',String(open));
    });
  });
  document.addEventListener('click',event=>{
    if(!event.target.closest('.museum-nav-item'))document.querySelectorAll('.museum-nav-item>button').forEach(item=>item.setAttribute('aria-expanded','false'));
  });

  const workDialog=document.querySelector('[data-work-dialog]');
  document.querySelectorAll('[data-work-open]').forEach(button=>button.addEventListener('click',()=>workDialog?.showModal()));
  document.querySelector('[data-work-close]')?.addEventListener('click',()=>workDialog.close());
  workDialog?.addEventListener('click',event=>{if(event.target===workDialog)workDialog.close()});

})();
