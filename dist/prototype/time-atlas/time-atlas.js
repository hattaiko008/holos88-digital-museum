const sfMap={date:'1859',title:'ENTRANCE TO SAN FRANCISCO BAY',image:'https://tile.loc.gov/image-services/iiif/service:gmd:gmd436:g4362:g4362s:ct001224/full/1200,/0/default.jpg',alt:'1859年に作成されたサンフランシスコ湾入口の海図',source:'https://www.loc.gov/item/2006635241/',credit:'LIBRARY OF CONGRESS / GEOGRAPHY AND MAP DIVISION / FREE TO USE AND REUSE'};
const edoMap={date:'1678',title:'ZŌHO EDO ŌEZU, EIRI / 増補江戸大絵図 絵入',image:'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/NDL1286182_%E5%A2%97%E8%A3%9C%E6%B1%9F%E6%88%B8%E5%A4%A7%E7%B5%B5%E5%9B%B3_%E7%B5%B5%E5%85%A5.jpg/1280px-NDL1286182_%E5%A2%97%E8%A3%9C%E6%B1%9F%E6%88%B8%E5%A4%A7%E7%B5%B5%E5%9B%B3_%E7%B5%B5%E5%85%A5.jpg',alt:'17世紀後半に刊行された増補江戸大絵図 絵入',source:'https://commons.wikimedia.org/wiki/File:NDL1286182_%E5%A2%97%E8%A3%9C%E6%B1%9F%E6%88%B8%E5%A4%A7%E7%B5%B5%E5%9B%B3_%E7%B5%B5%E5%85%A5.jpg',credit:'NATIONAL DIET LIBRARY / WIKIMEDIA COMMONS / PUBLIC DOMAIN'};
const sfRadio={title:'SOMAFM / GROOVE SALAD',stream:'https://ice2.somafm.com/groovesalad-128-mp3',note:'San Francisco発の独立系インターネットラジオ。HOLOS内では公式公開ストリームを直接再生します。',source:'https://somafm.com/groovesalad/'};

const places=[
  {id:'trips',year:'1966',title:'TRIPS FESTIVAL',location:'SAN FRANCISCO / UNITED STATES',lon:-122.4194,lat:37.7749,note:'音、光、電子楽器、踊る身体。のちに別々の文化と呼ばれるものが、三夜だけ同じ空間にいた。',link:'../articles/whole-earth-catalog.html',map:sfMap,radio:sfRadio},
  {id:'catalog',year:'1968',title:'WHOLE EARTH CATALOG',location:'MENLO PARK / UNITED STATES',lon:-122.1817,lat:37.4529,note:'離れて暮らす人々へ、本、農具、建築、思想を届けた紙のネットワーク。',link:'../articles/whole-earth-catalog.html',map:sfMap,radio:sfRadio},
  {id:'demo',year:'1968',title:'THE MOTHER OF ALL DEMOS',location:'SAN FRANCISCO / UNITED STATES',lon:-122.4075,lat:37.7877,note:'マウス、ハイパーテキスト、共同編集。知識へ触れる新しい身体が、公開の舞台に現れた。',link:'../articles/cabinet.html',map:sfMap,radio:sfRadio},
  {id:'well',year:'1985',title:'THE WELL',location:'SAUSALITO / UNITED STATES',lon:-122.4853,lat:37.8591,note:'Catalogの読者と書き手が、コンピュータの中で話し始めた。紙の共同体は、終わらない会話へ。',link:'../articles/whole-earth-catalog.html',map:sfMap,radio:sfRadio},
  {id:'wired',year:'1993',title:'WIRED',location:'SAN FRANCISCO / UNITED STATES',lon:-122.401,lat:37.797,note:'ネットワーク、自由、未来。カウンターカルチャーの語彙が、デジタル産業の言葉へ翻訳されていく。',link:'../articles/whole-earth-catalog.html',map:sfMap,radio:sfRadio},
  {id:'longnow',year:'1996',title:'THE LONG NOW',location:'SAN FRANCISCO / UNITED STATES',lon:-122.4477,lat:37.806,note:'速くなり続ける技術文化の中へ、1万年という遅い時間を置く。',link:'../articles/duration.html',map:sfMap,radio:sfRadio},
  {id:'edo',year:'1678',title:'EDO ŌEZU',location:'EDO / PRESENT-DAY TOKYO',lon:139.6917,lat:35.6895,note:'城、寺社、土地の所有者。現在の東京とは違う向きと縮尺で、江戸という都市が描かれている。',link:'../articles/wadokei.html',map:edoMap},
  {id:'whole',year:'NOW',title:'WHOLE EARTH',location:'EVERYWHERE / この地球全体',lon:25,lat:5,note:'一つの中心ではなく、無数の場所から見る。次に加わるピンは、あなたが暮らしている場所かもしれない。',link:'../articles/between-the-windows.html'}
];

const root=document.querySelector('#globe');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const storyFields=['#place-year','#place-title','#place-location','#place-note','#place-link'];
let active=places[0];
let mode='story';
let rotation=[105,-28,0];
let auto=!reduced;

function updatePanel(){
  document.querySelector('#place-number').textContent=`${String(places.indexOf(active)+1).padStart(2,'0')} / ${String(places.length).padStart(2,'0')}`;
  document.querySelector('#place-year').textContent=active.year;
  document.querySelector('#place-title').textContent=active.title;
  document.querySelector('#place-location').textContent=active.location;
  document.querySelector('#place-note').textContent=active.note;
  document.querySelector('#place-link').href=active.link;
  const radio=document.querySelector('#radio-window');
  const map=document.querySelector('#old-map-window');
  radio.hidden=mode!=='radio';
  map.hidden=mode!=='map';
  storyFields.forEach(selector=>document.querySelector(selector).hidden=mode!=='story');

  if(mode==='radio'){
    const station=active.radio;
    document.querySelector('#place-year').hidden=false;
    document.querySelector('#place-year').textContent='LIVE';
    document.querySelector('#place-title').hidden=false;
    document.querySelector('#place-title').textContent=station?'A VOICE FROM HERE':'RADIO CURATION';
    document.querySelector('#place-location').hidden=false;
    document.querySelector('#place-location').textContent=active.location;
    if(station){
      document.querySelector('#radio-title').textContent=station.title;
      document.querySelector('#radio-note').textContent=station.note;
      document.querySelector('#radio-player').src=station.stream;
      document.querySelector('#radio-window a').href=station.source;
      radio.querySelector('audio').hidden=false;
      radio.querySelector('a').hidden=false;
    }else{
      document.querySelector('#radio-title').textContent='STATION FORTHCOMING';
      document.querySelector('#radio-note').textContent='この土地の声を、権利と配信の安定性を確認してから収蔵します。';
      radio.querySelector('audio').hidden=true;
      radio.querySelector('a').hidden=true;
    }
  }

  if(mode==='map'){
    const oldMap=active.map;
    document.querySelector('#place-year').hidden=false;
    document.querySelector('#place-year').textContent=oldMap?.date||'—';
    document.querySelector('#place-title').hidden=false;
    document.querySelector('#place-title').textContent=oldMap?'THIS PLACE, BEFORE':'MAP FORTHCOMING';
    document.querySelector('#place-location').hidden=false;
    document.querySelector('#place-location').textContent=active.location;
    map.hidden=!oldMap;
    if(oldMap){
      document.querySelector('#old-map-image').src=oldMap.image;
      document.querySelector('#old-map-image').alt=oldMap.alt;
      document.querySelector('#old-map-date').textContent=oldMap.date;
      document.querySelector('#old-map-title').textContent=oldMap.title;
      document.querySelector('#old-map-credit').textContent=oldMap.credit;
      document.querySelector('#old-map-source').href=oldMap.source;
    }
  }
}

function setMode(next){
  mode=next;
  document.querySelectorAll('[data-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
  const player=document.querySelector('#radio-player');
  if(mode!=='radio')player.pause();
  updatePanel();
}

function selectPlace(id,projection,render){
  document.querySelector('#radio-player').pause();
  active=places.find(place=>place.id===id)||places[0];
  document.querySelectorAll('[data-place]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.place===active.id)));
  auto=false;
  rotation=[-active.lon,-active.lat,0];
  projection.rotate(rotation);
  updatePanel();
  render();
}

async function init(){
  if(!window.d3||!window.topojson){root.innerHTML='<p class="globe-loading">THE EARTH COULD NOT BE LOADED.</p>';return}
  const world=await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
  const land=topojson.feature(world,world.objects.land);
  root.innerHTML='';
  const svg=d3.select(root).append('svg').attr('viewBox','0 0 760 650').attr('aria-hidden','true');
  const projection=d3.geoOrthographic().translate([380,325]).scale(280).clipAngle(90).precision(.3).rotate(rotation);
  const path=d3.geoPath(projection);
  const sphere={type:'Sphere'};
  const graticule=d3.geoGraticule10();
  svg.append('path').datum(sphere).attr('class','sphere');
  svg.append('path').datum(graticule).attr('class','graticule');
  svg.append('path').datum(land).attr('class','land');
  const pins=svg.append('g').selectAll('g').data(places).join('g').attr('class','pin-group').attr('role','button').attr('aria-label',d=>`${d.year} ${d.title} ${d.location}`).attr('aria-pressed',d=>String(d.id===active.id)).on('click',(_,d)=>selectPlace(d.id,projection,render));
  pins.append('line').attr('class','pin-line');
  pins.append('circle').attr('class','pin-dot').attr('r',4.8);
  pins.append('circle').attr('class','pin-hit').attr('r',18);
  pins.append('text').attr('class','pin-label').attr('dx',9).attr('dy',3).text(d=>d.year);

  function render(){
    svg.select('.sphere').attr('d',path);svg.select('.graticule').attr('d',path);svg.select('.land').attr('d',path);
    pins.each(function(d){
      const point=projection([d.lon,d.lat]);const center=projection.invert([380,325]);const visible=d3.geoDistance([d.lon,d.lat],center)<Math.PI/2;
      d3.select(this).attr('display',visible?null:'none').attr('aria-pressed',String(d.id===active.id));if(!point)return;
      d3.select(this).selectAll('circle').attr('cx',point[0]).attr('cy',point[1]);d3.select(this).select('line').attr('x1',point[0]).attr('y1',point[1]).attr('x2',point[0]).attr('y2',point[1]-17);d3.select(this).select('text').attr('x',point[0]).attr('y',point[1]-18);
    });
  }

  svg.call(d3.drag().on('start',()=>{auto=false}).on('drag',event=>{rotation[0]+=event.dx*.28;rotation[1]=Math.max(-75,Math.min(75,rotation[1]-event.dy*.28));projection.rotate(rotation);render()}));
  document.querySelectorAll('[data-place]').forEach(button=>button.addEventListener('click',()=>selectPlace(button.dataset.place,projection,render)));
  document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
  document.querySelector('#reset-globe').addEventListener('click',()=>{rotation=[105,-28,0];projection.rotate(rotation);auto=!reduced;render()});
  updatePanel();render();
  let previous=performance.now();
  d3.timer(now=>{if(!auto)return;const delta=Math.min(32,now-previous);previous=now;rotation[0]+=.0035*delta;projection.rotate(rotation);render()});
}

init().catch(()=>{root.innerHTML='<p class="globe-loading">THE EARTH COULD NOT BE LOADED.</p>'});
