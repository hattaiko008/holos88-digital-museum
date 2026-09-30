(()=>{
  document.querySelectorAll('[data-reader-feedback]').forEach(root=>{
    if(root.dataset.feedbackReady)return;
    root.dataset.feedbackReady='true';
    const form=root.querySelector('form');
    const english=root.dataset.locale==='en';
    const stars=[...root.querySelectorAll('[data-rating]')];
    const clear=root.querySelector('.feedback-rating-clear');
    const comment=form.elements.comment;
    const request=form.elements.request;
    const email=form.elements.email;
    const replyRequested=form.elements.replyRequested;
    const key='holos88-feedback-draft-v1:'+root.dataset.article;
    let saved={};
    try{saved=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
    let rating=Number(saved.rating||(saved.starred?5:0));
    comment.value=saved.comment||'';
    request.value=saved.request||'';
    const paint=()=>stars.forEach(button=>{
      const value=Number(button.dataset.rating);
      button.textContent=value<=rating?'★':'☆';
      button.setAttribute('aria-checked',String(value===rating));
    });
    const remember=()=>localStorage.setItem(key,JSON.stringify({rating,comment:comment.value,request:request.value}));
    paint();
    stars.forEach(button=>button.addEventListener('click',()=>{
      rating=Number(button.dataset.rating);
      paint();remember();
    }));
    clear.addEventListener('click',()=>{rating=0;paint();remember()});
    comment.addEventListener('input',remember);
    request.addEventListener('input',remember);
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      const status=root.querySelector('.feedback-status'),text=comment.value.trim(),next=request.value.trim(),replyEmail=email.value.trim();
      if(form.elements.website.value)return;
      if(!rating&&!text&&!next){status.textContent=english?'Please add stars, a response, or a subject you would like to read next.':'星・感想・読みたいテーマのいずれかを入力してください。';return}
      if(replyRequested.checked&&!replyEmail){status.textContent=english?'Please enter an address if you would like an acknowledgement.':'受領メールを希望する場合は、送り先をご入力ください。';email.focus();return}
      if(replyEmail&&!email.checkValidity()){status.textContent=english?'Please check the email address.':'メールアドレスをご確認ください。';email.focus();return}
      status.textContent=english?'Sending…':'送信しています…';
      try{
        const response=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({article:root.dataset.article,title:root.dataset.title,rating,comment:text,request:next,email:replyRequested.checked?replyEmail:'',replyRequested:replyRequested.checked})});
        if(!response.ok)throw new Error('unavailable');
        const receipt=await response.json();
        status.textContent=english?(receipt.replyQueued?'Thank you. Your response and acknowledgement request have reached the editorial desk.':'Thank you. Your small trace has reached the editorial desk.'):(receipt.replyQueued?'ありがとうございます。小さな足跡と、受領メールのご希望を受け取りました。':'ありがとうございます。小さな足跡を受け取りました。');
        comment.value='';request.value='';email.value='';replyRequested.checked=false;
        localStorage.setItem(key,JSON.stringify({rating,comment:'',request:''}));
      }catch{
        remember();
        const subject=encodeURIComponent((english?'HOLOS 88 response | ':'HOLOS 88 感想｜')+root.dataset.title);
        const body=encodeURIComponent((rating?'評価：'+('★'.repeat(rating))+('☆'.repeat(5-rating))+'\n\n':'')+text+(next?'\n\nもっと読みたいテーマ：'+next:'')+(replyRequested.checked&&replyEmail?'\n\n受領メール希望：'+replyEmail:''));
        status.innerHTML=english?'The receiving desk is being prepared. Your text is saved on this device. <a href="mailto:contact@holos88.com?subject='+subject+'&body='+body+'">Send by email</a>':'送信口を準備中です。入力内容はこの端末に保存しました。 <a href="mailto:contact@holos88.com?subject='+subject+'&body='+body+'">メールで送る</a>';
      }
    });
  });
})();
