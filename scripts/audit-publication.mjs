import {readFile,access} from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const status=JSON.parse(await readFile(new URL('content/editorial-status.json',root),'utf8'));
const approved=new Set(status.articles.filter(article=>article.stage==='approved').map(article=>article.file));
const home=await readFile(new URL('dist/prototype/index.html',root),'utf8');
const articleLinks=[...home.matchAll(/href="\/prototype\/articles\/([^"#?]+\.html)/g)].map(match=>match[1]);
const linked=[...new Set(articleLinks)];
const unapproved=linked.filter(file=>!approved.has(file));
const required=[
  'prototype/reconstruction-01/contact.html',
  'prototype/reconstruction-01/privacy.html',
  'prototype/reconstruction-01/terms.html',
  'prototype/reconstruction-01/legal-commercial.html'
];
const missing=[];
for(const file of required){
  try{await access(new URL(file,root));}catch{missing.push(file);}
}

console.log(JSON.stringify({
  approvedArticles:approved.size,
  publishedHomepageArticleLinks:linked.length,
  publishedHomepageUnapprovedLinks:unapproved.length,
  unapproved,
  missingRequiredPages:missing
},null,2));

if(unapproved.length||missing.length)process.exitCode=1;
