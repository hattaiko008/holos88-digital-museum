import {readFile,writeFile} from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const status=JSON.parse(await readFile(new URL('content/editorial-status.json',root),'utf8'));
const file=new URL('content/article-taxonomy.json',root);
const current=JSON.parse(await readFile(file,'utf8'));

const fieldRules=[
  ['philosophy','哲学・思想',/hegel|conscious|who-is-speaking|duration|last-question|question|wild-mind|philosophy|思想|意識|問い/i],
  ['politics','政治・権力',/alliance|judge|red-carpet|trillion|button|politic|power|freedom|war|diplom|law|政治|権力|外交|同盟|国際法/i],
  ['history','歴史・記憶',/archaeology|whole-earth|colonial|jomon|1968|catalog|history|memory|remember|歴史|記憶|縄文/i],
  ['science','科学・自然観察',/brain|body|clock|germination|moon|star|season|skin|earth|river|science|cosmos|脳|月|星|地球|季節/i],
  ['body','身体・養生',/remedy|supplement|body|prescription|diagnose|melancholy|care-notes|skin|nutrition|身体|養生|栄養|植物/i],
  ['care','ケア・関係',/feeding|care|rope|attachment|apology|relationship|gift|chair|境界|謝罪|関係|ケア/i],
  ['technology','技術・メディア',/ai|algorithm|code|platform|wired|tool|screen|information|machine|technology|digital|技術|生成AI/i],
  ['ecology','環境・土地',/land|field|seed|millet|earth|river|soil|plant|horse|環境|土地|植物|馬/i],
  ['arts','芸術・表現',/image|gaze|taro|buchla|music|photograph|imagination|art|表現|写真|音/i],
  ['economy','経済・暮らし',/percent|price|cost|market|trillion|money|econom|supplement|経済|市場|金利|予算/i],
  ['museum','博物館・知識',/cabinet|museum|object|catalog|card|collection|梅棹|収蔵|博物館/i],
  ['everyday','暮らし・エッセイ',/horse-time|potato|chair|life|season|weather|food|暮らし|季節/i]
];
const worldByField={philosophy:['imagination','human'],politics:['human'],history:['time','human'],science:['life','earth'],body:['life'],care:['life','human'],technology:['making','human'],ecology:['earth','life'],arts:['imagination'],economy:['human','life'],museum:['imagination','making'],everyday:['life','time']};
const tagRules=[
  ['AI',/\bai\b|algorithm|platform|wired|code|machine/i],['承認',/hegel|recognition|認められ/i],['境界線',/alliance|rope|boundary|境界/i],['外交',/diplom|red-carpet|alliance|外交/i],['権力',/power|judge|politic|colonial|権力/i],['記憶',/memory|remember|archaeology|記憶/i],['身体',/body|skin|clock|supplement|身体/i],['植物',/plant|seed|germination|remedy|植物|種/i],['季節',/season|moon|melancholy|weather|季節/i],['ケア',/care|feeding|apology|ケア/i],['道具',/tool|cabinet|card|buchla|道具|カード/i],['土地',/land|field|soil|river|土地/i],['市場',/market|percent|price|cost|市場|金利/i],['表現',/image|photograph|gaze|music|taro|表現|写真/i]
];
const unique=values=>[...new Set(values.filter(Boolean))];
for(const article of status.articles){
  const haystack=[article.file,article.title,article.series,article.location].join(' ');
  const matchedFields=fieldRules.filter(([, ,pattern])=>pattern.test(haystack)).map(([id,label])=>({id,label}));
  if(!matchedFields.length)matchedFields.push({id:'culture',label:'文化・社会'});
  const inferredWorlds=unique(matchedFields.flatMap(field=>worldByField[field.id]||['human']));
  const inferredTags=tagRules.filter(([,pattern])=>pattern.test(haystack)).map(([label])=>label);
  const prior=current[article.file]||{};
  current[article.file]={
    worlds:unique([...(prior.worlds||[]),...inferredWorlds]).slice(0,3),
    fields:unique([...(prior.fields||[]).map(field=>typeof field==='string'?field:field.id),...matchedFields.map(field=>field.id)]).slice(0,3),
    tags:unique([...(prior.tags||[]),...inferredTags,article.series]).slice(0,6)
  };
}
const sorted=Object.fromEntries(Object.entries(current).sort(([a],[b])=>a.localeCompare(b,'en')));
await writeFile(file,JSON.stringify(sorted,null,2)+'\n');
console.log(`Tagged ${Object.keys(sorted).length} articles across WORLD / FIELD / THREAD.`);
