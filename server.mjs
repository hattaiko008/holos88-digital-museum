import http from 'node:http';
import {readFile, readdir, writeFile, appendFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, 'dist');
const sourceArticles = path.resolve(import.meta.dirname, 'prototype/reconstruction-01/articles');
const publicArticles = path.resolve(root, 'prototype/articles');
const sourcePages = path.resolve(import.meta.dirname, 'prototype/reconstruction-01');
const publicPages = path.resolve(root, 'prototype');
const editorialStateFile = path.resolve(import.meta.dirname, 'content/editorial-status.json');
const feedbackDirectory = path.resolve(import.meta.dirname, 'content/feedback');
const feedbackInbox = path.resolve(feedbackDirectory, 'inbox.jsonl');
const feedbackReplyQueue = path.resolve(feedbackDirectory, 'reply-queue.jsonl');
const feedbackReplyTemplates = path.resolve(feedbackDirectory, 'auto-reply-templates.json');
const feedbackRate = new Map();
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json'};
const articlePath = (directory, name) => {
  if (!name || path.basename(name) !== name || !name.endsWith('.html')) return null;
  return path.join(directory, name);
};
const editorPath = (name, source = true) => {
  if (!name || !name.includes('/')) return articlePath(source ? sourceArticles : publicArticles, name);
  const [scope, fileName, ...rest] = name.split('/');
  if (scope !== 'pages' || rest.length || path.basename(fileName) !== fileName || !fileName.endsWith('.html')) return null;
  return path.join(source ? sourcePages : publicPages, fileName);
};
const json = (res, status, value) => {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(value));
};
const port=Number(process.env.PORT||8088);
http.createServer(async(req,res)=>{
  try {
    const url = new URL(req.url,'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname === '/api/feedback' && req.method === 'POST') {
      const now=Date.now(),client=req.socket.remoteAddress||'local',recent=(feedbackRate.get(client)||[]).filter(time=>now-time<60_000);
      if(recent.length>=6){json(res,429,{error:'Too many submissions'});return;}
      let body='';
      for await (const chunk of req) {
        body+=chunk;
        if(Buffer.byteLength(body)>20_000){json(res,413,{error:'Feedback is too large'});return;}
      }
      const data=JSON.parse(body),article=String(data.article||''),title=String(data.title||''),comment=String(data.comment||'').trim(),request=String(data.request||'').trim(),rating=Number(data.rating||0),replyRequested=data.replyRequested===true,email=replyRequested?String(data.email||'').trim():'';
      const validEmail=!email||(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&email.length<=254);
      if(!article.endsWith('.html')||article.length>180||title.length>300||comment.length>800||request.length>300||!Number.isInteger(rating)||rating<0||rating>5||(!rating&&!comment&&!request)||!validEmail||(replyRequested&&!email)){json(res,400,{error:'Invalid feedback'});return;}
      await mkdir(feedbackDirectory,{recursive:true});
      const receivedAt=new Date(now).toISOString();
      await appendFile(feedbackInbox,JSON.stringify({article,title,rating,comment,request,replyRequested,receivedAt})+'\n','utf8');
      if(replyRequested){
        const templates=JSON.parse(await readFile(feedbackReplyTemplates,'utf8'));
        const templateId=comment.length>=200?'letter':request?'curiosity':comment?'note':'star';
        const template=templates.find(item=>item.id===templateId)||templates[0];
        await appendFile(feedbackReplyQueue,JSON.stringify({email,article,title,templateId,subject:template.subject,body:template.body,status:'pending-provider',createdAt:receivedAt})+'\n','utf8');
      }
      feedbackRate.set(client,[...recent,now]);
      json(res,201,{received:true,replyQueued:replyRequested});return;
    }
    if (pathname === '/__editor/status' && req.method === 'GET') {
      json(res,200,JSON.parse(await readFile(editorialStateFile,'utf8')));return;
    }
    if (pathname === '/__editor/status' && req.method === 'PUT') {
      let body='';
      for await (const chunk of req) {
        body+=chunk;
        if (Buffer.byteLength(body)>2_000_000) {json(res,413,{error:'Status data is too large'});return;}
      }
      const data=JSON.parse(body);
      if (!data || !Array.isArray(data.articles)) {json(res,400,{error:'Invalid status data'});return;}
      await writeFile(editorialStateFile,JSON.stringify(data,null,2)+'\n','utf8');
      json(res,200,{saved:true});return;
    }
    if (pathname === '/__editor/articles' && req.method === 'GET') {
      const articleNames = (await readdir(sourceArticles)).filter(name => name.endsWith('.html'));
      const pageNames = (await readdir(sourcePages)).filter(name => name.endsWith('.html') && (name.startsWith('watch-the-now-') || name.includes('letter'))).map(name => `pages/${name}`);
      const names = [...articleNames, ...pageNames].sort((a,b)=>a.localeCompare(b,'ja'));
      json(res, 200, {articles:names}); return;
    }
    if (pathname === '/__editor/article' && req.method === 'GET') {
      const file = editorPath(url.searchParams.get('name'), true);
      if (!file) {json(res,400,{error:'Invalid article name'});return;}
      json(res,200,{html:await readFile(file,'utf8')});return;
    }
    if (pathname === '/__editor/article' && req.method === 'PUT') {
      const name = url.searchParams.get('name');
      const sourceFile = editorPath(name,true);
      const publicFile = editorPath(name,false);
      if (!sourceFile || !publicFile) {json(res,400,{error:'Invalid article name'});return;}
      let body='';
      for await (const chunk of req) {
        body+=chunk;
        if (Buffer.byteLength(body)>5_000_000) {json(res,413,{error:'Article is too large'});return;}
      }
      if (!body.includes('<html') || !body.includes('</html>')) {json(res,400,{error:'Invalid HTML'});return;}
      await Promise.all([writeFile(sourceFile,body,'utf8'),writeFile(publicFile,body,'utf8')]);
      json(res,200,{saved:true});return;
    }
    if (pathname.startsWith('/prototype/articles/')) {
      const sourceFile=articlePath(sourceArticles,path.basename(pathname));
      if(sourceFile){
        const body=await readFile(sourceFile);
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(body);return;
      }
    }
    const localEditorialFiles=new Set(['editor-desk.html','editor-desk.css','editor-desk-extra.css','editor-desk.js','prototype.css','reading-trail.js']);
    if(pathname.startsWith('/prototype/')&&localEditorialFiles.has(path.basename(pathname))){
      const sourceFile=path.join(sourcePages,path.basename(pathname));
      const body=await readFile(sourceFile);
      res.writeHead(200,{'Content-Type':types[path.extname(sourceFile)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);return;
    }
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) {res.writeHead(403);res.end('Forbidden');return;}
    const body = await readFile(file);
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache'});res.end(body);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`HOLOS 88: http://127.0.0.1:${port}`));
