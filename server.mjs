import http from 'node:http';
import {readFile, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, 'dist');
const sourceArticles = path.resolve(import.meta.dirname, 'prototype/reconstruction-01/articles');
const publicArticles = path.resolve(root, 'prototype/articles');
const sourcePages = path.resolve(import.meta.dirname, 'prototype/reconstruction-01');
const publicPages = path.resolve(root, 'prototype');
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
http.createServer(async(req,res)=>{
  try {
    const url = new URL(req.url,'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
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
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) {res.writeHead(403);res.end('Forbidden');return;}
    const body = await readFile(file);
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache'});res.end(body);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(8088,'127.0.0.1',()=>console.log('HOLOS 88: http://127.0.0.1:8088'));
