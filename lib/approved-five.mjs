import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';

const slugs=['wadokei','duration','germination','moon-to-stars','kaleidoscope','seed','horse','gift','wild-mind','taro-jomon'];
const objects=[
  ['collection-seed-plate','','DANDELION SEEDS / 1858','タルボットの写真版画に写るタンポポの種。','https://images.metmuseum.org/CRDImages/ph/web-large/DP106960.jpg','seed','plate-seed','H88-A1126 · SEED / LANGUAGE'],
  ['collection-horse-plate','','NIGHT-SHINING WHITE / c.750','韓幹《照夜白》、唐時代の白い馬。','https://images.metmuseum.org/CRDImages/as/web-large/DP153705.jpg','horse','plate-horse','H88-A1129 · ANIMAL / HISTORY'],
  ['collection-gift-plate', '', 'BASKET OF PEONIES / 1810s', '北斎の摺物《牡丹の籠》。', 'https://openaccess-cdn.clevelandart.org/1943.5/1943.5_web.jpg', 'gift', 'plate-gift', 'H88-A1130 · GIFT / SOCIETY'],
  ['collection-wild-mind-plate', '', 'EARTHWORM AND CRICKET / 1788', '歌麿『画本虫撰』の見開き。', 'https://images.metmuseum.org/CRDImages/as/web-large/DP135561.jpg', 'wild-mind', 'plate-wild-mind', 'H88-A1131 · ANTHROPOLOGY / NATURE'],
  ['collection-taro-jomon-plate', '', 'FIRE-FLAME VESSEL / c.2500 BCE', '縄文時代の火焔型土器。', 'https://openaccess-cdn.clevelandart.org/1984.68/1984.68_web.jpg', 'taro-jomon', 'plate-taro-jomon', 'H88-A1132 · ART / JŌMON'],
  ['jomon-fukabachi-met-1975', '', 'DEEP VESSEL / MIDDLE JŌMON', '縄文時代中期の深鉢形土器。', 'https://images.metmuseum.org/CRDImages/as/web-large/DP246459.jpg', 'taro-jomon', 'article-text', 'OBJECT · VISUAL COLLECTION'],
  ['jomon-dogu-met-1978', '', 'DOGŪ / FINAL JŌMON', '縄文時代晩期の小さな土偶。', 'https://images.metmuseum.org/CRDImages/as/web-large/DT10152.jpg', 'taro-jomon', 'article-text', 'OBJECT · VISUAL COLLECTION'],
  ['trobriand-canoe-splashboard-1800s', '', 'CANOE SPLASHBOARD / TROBRIAND', 'トロブリアンド諸島のカヌーの波よけ板。', 'https://openaccess-cdn.clevelandart.org/1966.130/1966.130_web.jpg', 'gift', 'article-text', 'OBJECT · VISUAL COLLECTION'],
  ['durer-adoration-magi-1511', '', 'THE ADORATION OF THE MAGI / 1511', 'デューラーの木版画《東方三博士の礼拝》。', 'https://images.metmuseum.org/CRDImages/dp/web-large/DP816425.jpg', 'gift', 'article-text', 'OBJECT · VISUAL COLLECTION'],
  ['ashoka-tree-study-india-1800s', '', 'ASHOKA TREE / INDIA', '無憂樹の花・葉・さや・種の植物画。', 'https://images.metmuseum.org/CRDImages/is/web-large/DP273291.jpg', 'wild-mind', 'article-text', 'OBJECT · VISUAL COLLECTION'],
  ['merian-capers-gorse-beetle-1693', '', 'CAPERS, GORSE AND A BEETLE / 1693', 'メーリアンの水彩《ケイパーとハリエニシダと甲虫》。', 'https://images.metmuseum.org/CRDImages/dp/web-large/DP822404.jpg', 'wild-mind', 'article-text', 'OBJECT · VISUAL COLLECTION'],
  ['collection-kaleidoscope','collection-article-kaleidoscope','KALEIDOSCOPE','同じ欠片を、少しだけ回してみる。','/prototype/assets/brewster-1870-fig45.jpg','kaleidoscope','plate-kaleidoscope','H88-A4002 · IMAGE / RELATIONSHIP'],
  ['collection-wadokei','collection-article-wadokei','WADOKEI','季節に合わせて、時計を動かす。','https://collectionapi.metmuseum.org/api/collection/v1/iiif/56792/130506/main-image','wadokei','plate-wadokei','H88-A5919 · TIME / EDO'],
  ['collection-moon-to-stars','collection-article-moon-to-stars|flamsteed-atlas-1795-b','FLAMSTEED ATLAS / II','星を結ぶ星座像を描いた18世紀末の星図。','https://pdr-assets.b-cdn.net/collections/the-celestial-atlas-of-flamsteed-1795/7500096608_eb84ed09ca_o.jpg?height=1200&width=600','moon-to-stars','article-text','H88-A4230 · MOON / STARS'],
  ['collection-germination','collection-article-germination|crocus-germination-1886','CROCUS GERMINATION / 1886','クロッカスの発芽段階を示す植物図版。','https://commons.wikimedia.org/wiki/Special:Redirect/file/Germination_of_Crocus_aureus.png?width=960','germination','plate-germination','H88-A8162 · BOTANY / TIME'],
  ['collection-duration','collection-article-duration|seed-anatomy-grew-1682','SEED ANATOMY / 1682','さまざまな種子の内部構造を示した植物解剖図。','https://iiif.wellcomecollection.org/image/M0012483/full/760,/0/default.jpg','duration','plate-seed-anatomy-grew-1682','H88-A6149 · TIME / PHILOSOPHY'],
  ['galle-sower-parable-1574','', 'THE PARABLE OF THE SOWER / 1574','フィリップ・ガレの銅版画《種まく人のたとえ》。','https://openaccess-cdn.clevelandart.org/2023.128/2023.128_web.jpg','seed','article-text','OBJECT · VISUAL COLLECTION'],
  ['suzhou-lotus-water-chestnut-1700','', 'LOTUS SEEDS / SUZHOU','蘇州の多色木版画《蓮の実と菱》。','https://openaccess-cdn.clevelandart.org/2025.113/2025.113_web.jpg','seed','article-text','OBJECT · VISUAL COLLECTION'],
  ['bonheur-horse-fair-1852','', 'THE HORSE FAIR / 1852–55','ローザ・ボヌールの油彩《馬市》。','https://images.metmuseum.org/CRDImages/ep/web-large/DP-23550-001.jpg','horse','article-text','OBJECT · VISUAL COLLECTION'],
  ['rustam-captures-rakhsh-india-1400s','', 'RUSTAM CAPTURES RAKHSH','『王書』の一葉《馬ラクシュをつかまえるルスタム》。','https://images.metmuseum.org/CRDImages/is/web-large/DP215772.jpg','horse','article-text','OBJECT · VISUAL COLLECTION'],
  ['brewster-kaleidoscope-frontispiece-1870','', 'THE KALEIDOSCOPE / 1870','David Brewsterの著書に収められた口絵。','https://www.gutenberg.org/cache/epub/74417/images/frontis.jpg','kaleidoscope','article-text','OBJECT · VISUAL COLLECTION'],
  ['mannendokei-1851','', 'MANNEN DOKEI / 1851','季節に応じて時刻の目盛りを動かす万年時計。','https://commons.wikimedia.org/wiki/Special:Redirect/file/1851Wadokei.JPG','wadokei','seasonal-clock','OBJECT · VISUAL COLLECTION'],
  ['flamsteed-atlas-1795-a','', 'FLAMSTEED ATLAS / I','星座像と星の位置を示した18世紀末の星図。','https://pdr-assets.b-cdn.net/collections/the-celestial-atlas-of-flamsteed-1795/7500096114_8785e3fe56_o.jpg?height=1200&width=600','moon-to-stars','article-text','OBJECT · VISUAL COLLECTION'],
  ['germination-encyclopaedia-1906','', 'GERMINATION / 1906','胚の発達段階を並べた植物学図版。','https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Germinationa.jpg/1280px-Germinationa.jpg','germination','article-text','OBJECT · VISUAL COLLECTION'],
  ['seedling-development-1688','', 'SEEDLING DEVELOPMENT / 1688','植物の胚と幼植物が育つ段階を示した図版。','https://iiif.wellcomecollection.org/image/M0016635/full/760,/0/default.jpg','germination','article-text','OBJECT · VISUAL COLLECTION'],
  ['bergson-portrait-manuel','', 'HENRI BERGSON / PORTRAIT','Henri Manuelによるアンリ・ベルクソンの肖像写真。','https://commons.wikimedia.org/wiki/Special:Redirect/file/Henri_Bergson_02.jpg?width=960','duration','bergson-duration','OBJECT · VISUAL COLLECTION'],
  ['duration-seed-observation','', 'BROCCOLI SEEDS','白い紙の上に並ぶブロッコリーの種。','/assets/seed.jpg','duration','article-text','OBJECT · VISUAL COLLECTION']
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
  const cards=objects.map(([id,aliases,title,caption,image,slug,anchor,label],index)=>`<a id="${id}" class="article-derived-card approved-object-card visual-variant-${index%6}" href="/prototype/articles/${slug}.html#${anchor}">${aliases?aliases.split('|').map(alias=>`<span id="${alias}" hidden></span>`).join(''):''}<figure><img src="${esc(image)}" alt="${esc(caption)}" loading="lazy"></figure><small>${esc(label)}</small><b>${esc(title)}</b><em>${esc(caption)}</em></a>`).join('');
  collection=collection.replace('<!--ARTICLE_CARDS_START-->','<!--ARTICLE_CARDS_START-->'+cards);
  await writeFile(collectionUrl,collection);
}
