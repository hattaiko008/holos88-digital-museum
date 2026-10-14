(() => {
  const box=document.querySelector('.thinking-box');
  if(!box)return;
  const grid=box.querySelector('[data-thought-grid]');
  const cards=[...grid.querySelectorAll('[data-thought-card]')];
  const status=box.querySelector('[data-thought-status]');
  const draw=box.querySelector('[data-thought-draw]');
  if(draw && cards.length>=3){
    const choose=()=>{
      const pool=[...cards];
      for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
      grid.replaceChildren(...pool.slice(0,3));
    };
    choose();draw.hidden=false;
    draw.addEventListener('click',()=>{choose();status.textContent=`三枚を選びました。収蔵 ${cards.length}枚から、重複なし。`;});
  }
  const form=box.querySelector('.thought-filter');
  if(form){
    form.hidden=false;
    form.querySelector('select').addEventListener('change',event=>{
      let count=0;
      for(const card of cards){card.hidden=!!event.target.value&&!card.dataset.fields.split(' ').includes(event.target.value);if(!card.hidden)count++;}
      status.textContent=`${count}枚を表示 / 収蔵 ${cards.length}枚`;
    });
  }
})();
