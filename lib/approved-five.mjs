import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';

const slugs=['wadokei','duration','germination','moon-to-stars','kaleidoscope'];
const objects=[
  ['collection-kaleidoscope','collection-article-kaleidoscope','KALEIDOSCOPE','同じ欠片を、少しだけ回してみる。','/prototype/assets/brewster-1870-fig45.jpg','kaleidoscope','plate-kaleidoscope','H88-A4002 · IMAGE / RELATIONSHIP'],
  ['collection-moon-to-stars','collection-article-moon-to-stars','MOON TO STARS','月を見たあと、星を待つ。','/assets/moon.jpg','moon-to-stars','plate-moon-to-stars','H88-A4230 · MOON / STARS'],
  ['collection-germination','collection-article-germination','GERMINATION','芽が出るのは、種が決めた日ではない。','https://commons.wikimedia.org/wiki/Special:Redirect/file/Germination_of_Crocus_aureus.png?width=960','germination','plate-germination','H88-A8162 · BOTANY / TIME'],
  ['collection-duration','collection-article-duration','DURATION','待つことは、何もしないことではない。','https://iiif.wellcomecollection.org/image/M0012483/full/760,/0/default.jpg','duration','plate-seed-anatomy-grew-1682','H88-A6149 · TIME / PHILOSOPHY'],
  ['collection-wadokei','collection-article-wadokei','WADOKEI','季節に合わせて、時計を動かす。','https://collectionapi.metmuseum.org/api/collection/v1/iiif/56792/130506/main-image','wadokei','plate-wadokei','H88-A5919 · TIME / EDO'],
  ['brewster-kaleidoscope-frontispiece-1870','', 'THE KALEIDOSCOPE / 1870','David Brewsterの著書に収められた口絵。','https://www.gutenberg.org/cache/epub/74417/images/frontis.jpg','kaleidoscope','article-text','OBJECT · VISUAL COLLECTION'],
  ['mannendokei-1851','', 'MANNEN DOKEI / 1851','季節に応じて時刻の目盛りを動かす万年時計。','https://commons.wikimedia.org/wiki/Special:Redirect/file/1851Wadokei.JPG','wadokei','seasonal-clock','OBJECT · VISUAL COLLECTION'],
  ['flamsteed-atlas-1795-b','', 'FLAMSTEED ATLAS / II','星を結ぶ星座像を描いた18世紀末の星図。','https://pdr-assets.b-cdn.net/collections/the-celestial-atlas-of-flamsteed-1795/7500096608_eb84ed09ca_o.jpg?height=1200&width=600','moon-to-stars','article-text','OBJECT · VISUAL COLLECTION'],
  ['flamsteed-atlas-1795-a','', 'FLAMSTEED ATLAS / I','星座像と星の位置を示した18世紀末の星図。','https://pdr-assets.b-cdn.net/collections/the-celestial-atlas-of-flamsteed-1795/7500096114_8785e3fe56_o.jpg?height=1200&width=600','moon-to-stars','article-text','OBJECT · VISUAL COLLECTION'],
  ['germination-encyclopaedia-1906','', 'GERMINATION / 1906','胚の発達段階を並べた植物学図版。','https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Germinationa.jpg/1280px-Germinationa.jpg','germination','article-text','OBJECT · VISUAL COLLECTION'],
  ['seedling-development-1688','', 'SEEDLING DEVELOPMENT / 1688','植物の胚と幼植物が育つ段階を示した図版。','https://iiif.wellcomecollection.org/image/M0016635/full/760,/0/default.jpg','germination','article-text','OBJECT · VISUAL COLLECTION'],
  ['crocus-germination-1886','', 'CROCUS GERMINATION / 1886','クロッカスの発芽段階を示す植物図版。','https://commons.wikimedia.org/wiki/Special:Redirect/file/Germination_of_Crocus_aureus.png?width=960','germination','plate-germination','OBJECT · VISUAL COLLECTION'],
  ['duration-seed-observation','', 'BROCCOLI SEEDS','白い紙の上に並ぶブロッコリーの種。','/assets/seed.jpg','duration','article-text','OBJECT · VISUAL COLLECTION'],
  ['seed-anatomy-grew-1682','', 'SEED ANATOMY / 1682','さまざまな種子の内部構造を示した植物解剖図。','https://iiif.wellcomecollection.org/image/M0012483/full/760,/0/default.jpg','duration','plate-seed-anatomy-grew-1682','OBJECT · VISUAL COLLECTION']
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
  collection=collection.replace(/<section class="approved-five-objects" id="approved-five-objects">[\s\S]*?<\/section><style>[\s\S]*?<\/style>(?:<script>[\s\S]*?<\/script>)?/,'');
  const cards=objects.map(([id,alias,title,caption,image,slug,anchor,label],index)=>`<a id="${id}" class="article-derived-card approved-object-card visual-variant-${index%6}" href="/prototype/articles/${slug}.html#${anchor}">${alias?`<span id="${alias}" hidden></span>`:''}<figure><img src="${esc(image)}" alt="${esc(caption)}" loading="lazy"></figure><small>${esc(label)}</small><b>${esc(title)}</b><em>${esc(caption)}</em></a>`).join('');
  collection=collection.replace('<!--ARTICLE_CARDS_START-->','<!--ARTICLE_CARDS_START-->'+cards);
  await writeFile(collectionUrl,collection);
}
