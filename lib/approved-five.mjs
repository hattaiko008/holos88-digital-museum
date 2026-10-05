import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';

const slugs=['wadokei','duration','germination','moon-to-stars','kaleidoscope'];

const objects=[
  ['seed-anatomy-grew-1682','SEED ANATOMY / 1682','豆を含むさまざまな種子の内部構造を示した植物解剖図。','https://iiif.wellcomecollection.org/image/M0012483/full/760,/0/default.jpg','Nehemiah Grew『The Anatomy of Plants』（1682）。Wellcome Collection / Public Domain Mark。','duration','plate-seed-anatomy-grew-1682'],
  ['duration-seed-observation','BROCCOLI SEEDS','白い紙の上に並ぶブロッコリーの種。','/assets/seed.jpg','Miguel Tremblay、2013年 / Wikimedia Commons / CC0 1.0。発芽中の写真ではありません。','duration','article-text'],
  ['crocus-germination-1886','CROCUS GERMINATION / 1886','クロッカスの発芽段階を示す植物図版。','https://commons.wikimedia.org/wiki/Special:Redirect/file/Germination_of_Crocus_aureus.png?width=960','George Maw『A Monograph of the Genus Crocus』（1886）Plate C / Public Domain。','germination','plate-germination'],
  ['seedling-development-1688','SEEDLING DEVELOPMENT / 1688','植物の胚と幼植物が育つ段階を示した植物学図版。','https://iiif.wellcomecollection.org/image/M0016635/full/760,/0/default.jpg','Antoni van Leeuwenhoek『Vervolg der brieven』（1688）。Wellcome Collection / Public Domain Mark。','germination','article-text'],
  ['germination-encyclopaedia-1906','GERMINATION / 1906','胚の発達段階を並べた植物学図版。','https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Germinationa.jpg/1280px-Germinationa.jpg','The New International Encyclopædia（1906）/ Public Domain。','germination','article-text'],
  ['flamsteed-atlas-1795-a','FLAMSTEED ATLAS / I','18世紀末の星図。星座像と星の位置を示す。','https://pdr-assets.b-cdn.net/collections/the-celestial-atlas-of-flamsteed-1795/7500096114_8785e3fe56_o.jpg?height=1200&width=600','Atlas Céleste de Flamstéed（1795）/ US Naval Observatory / Public Domain。','moon-to-stars','article-text'],
  ['flamsteed-atlas-1795-b','FLAMSTEED ATLAS / II','18世紀末の星図。星を結ぶ星座像を描く。','https://pdr-assets.b-cdn.net/collections/the-celestial-atlas-of-flamsteed-1795/7500096608_eb84ed09ca_o.jpg?height=1200&width=600','Atlas Céleste de Flamstéed（1795）/ US Naval Observatory / Public Domain。','moon-to-stars','article-text'],
  ['mannendokei-1851','MANNEN DOKEI / 1851','季節に応じて時刻の目盛りを動かす万年時計。','https://commons.wikimedia.org/wiki/Special:Redirect/file/1851Wadokei.JPG','田中久重、1851年。写真：PHG / Wikimedia Commons / Public Domain。','wadokei','seasonal-clock'],
  ['brewster-kaleidoscope-frontispiece-1870','THE KALEIDOSCOPE / 1870','David Brewsterの著書に収められた口絵。','https://www.gutenberg.org/cache/epub/74417/images/frontis.jpg','David Brewster, The Kaleidoscope（1870）/ Project Gutenberg / Public Domain in the USA。','kaleidoscope','article-text']
];

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export async function buildApprovedFive(){
  const source=new URL('../content/templates/approved-five/',import.meta.url);
  const target=new URL('../prototype/reconstruction-01/',import.meta.url);
  await mkdir(new URL('articles/',target),{recursive:true});
  for(const slug of slugs)await cp(new URL(`${slug}.html`,source),new URL(`articles/${slug}.html`,target),{force:true});
  await cp(new URL('approved-five.css',source),new URL('approved-five.css',target),{force:true});
  await mkdir(new URL('assets/',target),{recursive:true});
  await cp(new URL('brewster-1870-fig45.jpg',source),new URL('assets/brewster-1870-fig45.jpg',target),{force:true});

  const collectionUrl=new URL('collection.html',target);
  let collection=await readFile(collectionUrl,'utf8');
  collection=collection.replace(/<section class="approved-five-objects" id="approved-five-objects">[\s\S]*?<\/section><style>[\s\S]*?<\/style>/,'');
  {
    const cards=objects.map(([id,title,alt,image,credit,slug,anchor])=>`<a id="${id}" class="approved-object-card" href="/prototype/articles/${slug}.html#${anchor}"><figure><img src="${esc(image)}" alt="${esc(alt)}" loading="lazy"></figure><small>OBJECT / VISUAL COLLECTION</small><b>${esc(title)}</b><em>${esc(alt)}</em><p>${esc(credit)}</p><span>記事で見る ↗</span></a>`).join('');
    const aliases='<span id="collection-wadokei"></span><span id="collection-duration"></span><span id="collection-germination"></span><span id="collection-moon-to-stars"></span><span id="collection-kaleidoscope"></span>';
    const block=`<section class="approved-five-objects" id="approved-five-objects">${aliases}<header><p>OBJECTS FROM FIVE WINDOWS</p><h2>図版から、<br>記事へ戻る。</h2><span>公開5記事から収蔵した図版・資料</span></header><div>${cards}</div></section><style>.approved-five-objects{padding:clamp(4rem,8vw,8rem) 3vw;border-top:1px solid;scroll-margin-top:1rem}.approved-five-objects>span[id]{display:block;position:relative;top:-1rem}.approved-five-objects>header{display:grid;grid-template-columns:.4fr 1fr .6fr;align-items:end;gap:2rem;margin-bottom:3rem}.approved-five-objects h2{margin:0;font:400 clamp(3rem,7vw,7rem)/.85 var(--serif);letter-spacing:-.05em}.approved-five-objects header p,.approved-five-objects header span{font:9px/1.7 var(--sans);letter-spacing:.12em}.approved-five-objects>div{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid;border-left:1px solid}.approved-object-card{padding:1rem;border-right:1px solid;border-bottom:1px solid;color:inherit;text-decoration:none}.approved-object-card figure{height:240px;margin:0 0 1.2rem;background:#eee8dc;display:grid;place-items:center}.approved-object-card img{width:100%;height:100%;object-fit:contain}.approved-object-card small,.approved-object-card span{display:block;font:8px/1.7 var(--sans);letter-spacing:.12em}.approved-object-card b{display:block;margin:.8rem 0;font:400 1.5rem/1.1 var(--serif)}.approved-object-card em,.approved-object-card p{display:block;font:11px/1.8 var(--jp);font-style:normal}.approved-object-card span{margin-top:1rem}@media(max-width:760px){.approved-five-objects>header,.approved-five-objects>div{grid-template-columns:1fr}.approved-five-objects>header{align-items:start}.approved-object-card figure{height:210px}}</style><script>addEventListener('load',()=>{const target=document.getElementById(location.hash.slice(1));if(target)setTimeout(()=>target.scrollIntoView(),80)})</script>`;
    collection=collection.replace('<!--ARTICLE_CARDS_END--></div>',`<!--ARTICLE_CARDS_END--></div>${block}`);
    await writeFile(collectionUrl,collection);
  }
}
