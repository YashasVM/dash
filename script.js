const work=[
 {id:'cd',name:'cd',description:'Send a file straight from your browser to someone else’s.',status:'Active',logo:'./logos/cd-v2.png',live:'https://cd.yash0.in',docs:'./docs/products/cd/'},
 {id:'holen',name:'HOLEN',description:'Downloads for Android, web, or terminal people who hate upload queues.',status:'Active',logo:'./logos/holen-v2.png',live:'https://holen.yash0.in',docs:'./docs/products/holen/'},
 {id:'wisper-low',name:'Wisper Low',description:'Offline dictation with a tiny Windows overlay and no cloud detour.',status:'Prototype',logo:'./logos/wisper-low-v2.png',live:'https://wisper-low.yash0.in',docs:'./docs/products/wisper-low/'},
 {id:'openstream',name:'OpenStream',description:'Your phone is already a camera. OpenStream gets OBS to admit it.',status:'Beta',logo:'./logos/openstream-v2.png',live:'https://openstream.yash0.in',docs:'./docs/products/openstream/'},
 {id:'yt-cmd',name:'yt-cmd',description:'A friendlier way to survive the yt-dlp flag maze.',status:'Active',logo:'./logos/yt-cmd-v2.png',live:'https://github.com/YashasVM/yt-cmd',docs:'./docs/products/yt-cmd/',source:'https://github.com/YashasVM/yt-cmd',repo:'YashasVM/yt-cmd'},
 {id:'img-gen',name:'Img-gen',description:'Drop an image in, get the background out — in your browser.',status:'Active',logo:'./logos/img-gen-v2.png',live:'https://img-gen.yash0.in',docs:'./docs/products/img-gen/'},
 {id:'localhost',name:'localhost',description:'A tiny public window into what’s running at home.',status:'Live',logo:'./logos/localhost-v2.png',live:'https://yvmx.dpdns.org/',docs:'./docs/products/localhost/'}
];
const canvas=document.querySelector('.pixel-canvas');
const context=canvas?canvas.getContext('2d',{alpha:false}):null;
let pixelWidth=0,pixelHeight=0,animationTimer=0,lastDraw=0,resizeTimer=0;
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const smallScreen=window.matchMedia('(max-width: 600px)');
function resizePixels(){if(!canvas)return;const scale=3;pixelWidth=Math.max(1,Math.ceil(innerWidth/scale));pixelHeight=Math.max(1,Math.ceil(innerHeight*.47/scale));canvas.width=pixelWidth;canvas.height=pixelHeight}
function hash(x,y){const value=Math.sin(x*127.1+y*311.7)*43758.5453;return value-Math.floor(value)}
function valueNoise(x,y){const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);const a=hash(x0,y0),b=hash(x0+1,y0),c=hash(x0,y0+1),d=hash(x0+1,y0+1);return a+(b-a)*sx+((c+(d-c)*sx)-(a+(b-a)*sx))*sy}
function fractalNoise(x,y){return valueNoise(x,y)*.56+valueNoise(x*2.1+9,y*2.1-4)*.28+valueNoise(x*4.4-7,y*4.4+11)*.16}
const dither=[[0,.5,.125,.625],[.75,.25,.875,.375],[.1875,.6875,.0625,.5625],[.9375,.4375,.8125,.3125]];
function drawPixels(time){if(!canvas||!context)return;if(reduceMotion&&lastDraw){return}if(!reduceMotion&&time-lastDraw<45){return}lastDraw=time;const image=context.createImageData(pixelWidth,pixelHeight),data=image.data,t=reduceMotion?0:time*.0018;
  for(let y=0;y<pixelHeight;y++)for(let x=0;x<pixelWidth;x++){const nx=x/pixelWidth,ny=y/pixelHeight;const warp=fractalNoise(nx*5.5+t*.08,ny*5.5-t*.03);const heat=fractalNoise(nx*22+warp*2.8+t*.12,ny*12-warp*2.1-t*.05)*1.65+fractalNoise(nx*5-t*.05,ny*3+t*.03)*.45-ny*1.2;const amount=Math.max(0,Math.min(1,(heat-.05)/1.72));const scaled=amount*5;const level=Math.min(5,Math.floor(scaled)+(scaled%1>dither[y&3][x&3]?1:0));const palette=[[5,2,2],[16,3,2],[42,3,2],[86,5,2],[157,12,2],[232,42,4]][level];const i=(y*pixelWidth+x)*4;data[i]=palette[0];data[i+1]=palette[1];data[i+2]=palette[2];data[i+3]=255}
  context.putImageData(image,0,0)
}
function syncPixelMotion(){if(!canvas)return;if(reduceMotion||!smallScreen.matches){if(animationTimer){window.clearInterval(animationTimer);animationTimer=0}return}if(!animationTimer){animationTimer=window.setInterval(function(){drawPixels(performance.now())},50)}}
resizePixels();window.addEventListener('resize',function(){resizePixels();window.clearTimeout(resizeTimer);resizeTimer=window.setTimeout(function(){lastDraw=0;drawPixels(performance.now())},100);syncPixelMotion()},{passive:true});if(smallScreen.addEventListener){smallScreen.addEventListener('change',function(){resizePixels();lastDraw=0;drawPixels(performance.now());syncPixelMotion()})}window.setTimeout(function(){drawPixels(performance.now())},0);syncPixelMotion();
const devQuotes=['It works on my machine. Ship the machine.','A good commit message is a tiny time machine.','There is no bug too small to become a personality trait.','The best debugging tool is a snack and a fresh pair of eyes.','Keep it simple enough that future-you can fix it at 2 a.m.'];
const eventButton=document.querySelector('.event-button');
const devQuote=document.querySelector('#dev-quote');
let lastDevQuoteIndex=-1;
if(eventButton&&devQuote){eventButton.addEventListener('click',function(){let quoteIndex=Math.floor(Math.random()*devQuotes.length);while(devQuotes.length>1&&quoteIndex===lastDevQuoteIndex){quoteIndex=Math.floor(Math.random()*devQuotes.length)}lastDevQuoteIndex=quoteIndex;devQuote.textContent='“'+devQuotes[quoteIndex]+'”';devQuote.hidden=false;eventButton.setAttribute('aria-expanded','true')})}
const list=document.querySelector('#work-list');
const state={filter:'All',sort:'curated',kbIndex:-1};
function clickCounts(){try{return JSON.parse(localStorage.getItem('yashas-clicks')||'{}')}catch(_){return{}}}
function recordClick(id){try{const counts=clickCounts();counts[id]=(counts[id]||0)+1;localStorage.setItem('yashas-clicks',JSON.stringify(counts))}catch(_){}}
function visibleWork(){const counts=clickCounts();let items=work.filter(function(item){return state.filter==='All'||item.status===state.filter});if(state.sort==='popular'){items=items.slice().sort(function(a,b){return(counts[b.id]||0)-(counts[a.id]||0)})}return items}
function statusDotClass(status){if(status==='Active'||status==='Live')return 'dot-on';if(status==='Beta')return 'dot-beta';return 'dot-off'}
function updateCounts(){
  const counts={All:work.length};
  work.forEach(function(item){counts[item.status]=(counts[item.status]||0)+1});
  document.querySelectorAll('[data-count]').forEach(function(el){el.textContent=counts[el.dataset.count]||0});
}
updateCounts();
function escapeHtml(text){return String(text).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function renderWork(){
  if(!list)return;
  const items=visibleWork();
  state.kbIndex=-1;
  if(!items.length){list.innerHTML='<p class="work-empty">Nothing with that status yet. Try another filter.</p>';return}
  list.innerHTML=items.map(function(item,index){
    const sourceLink=item.source&&item.source!==item.live?' <a class="row-link" href="'+item.source+'" target="_blank" rel="noreferrer" data-stop>source ↗</a>':'';
    const stars=item.repo?' <span class="stars" data-stars="'+item.repo+'" hidden></span>':'';
    return '<div class="work-item" data-id="'+item.id+'" data-index="'+index+'" style="animation-delay:'+Math.min(index*35,245)+'ms">'
      +'<a class="work-mark work-main" href="'+item.live+'" target="_blank" rel="noreferrer" aria-label="'+escapeHtml(item.name)+' — open live site" tabindex="-1"><img src="'+item.logo+'" alt="" width="48" height="48" loading="'+(index<2?'eager':'lazy')+'" decoding="async"></a>'
      +'<span class="work-copy"><h3><a class="work-main" href="'+item.live+'" target="_blank" rel="noreferrer" data-id="'+item.id+'">'+escapeHtml(item.name)+'</a>'+stars+'</h3><p>'+escapeHtml(item.description)+'</p>'
      +'<span class="row-links"><a class="row-link" href="'+item.docs+'" data-stop>docs →</a>'+sourceLink+'</span></span>'
      +'<span class="date"><span class="status-dot '+statusDotClass(item.status)+'" data-dot="'+item.id+'" title="'+item.status+'"></span>'+item.status+'</span>'
      +'<button class="expand-button" type="button" aria-expanded="false" aria-label="Expand description for '+escapeHtml(item.name)+'" data-expand>▸</button>'
      +'</div>'
  }).join('');
  list.classList.remove('enter');void list.offsetWidth;list.classList.add('enter');
  hydrateStars();
}
if(list){
  list.addEventListener('click',function(event){
    const expand=event.target.closest('[data-expand]');
    if(expand){const row=expand.closest('.work-item');const open=row.classList.toggle('expanded');expand.setAttribute('aria-expanded',String(open));return}
    const main=event.target.closest('a.work-main');
    if(main&&main.dataset.id){recordClick(main.dataset.id)}
  });
  renderWork();
}
document.querySelectorAll('[data-filter]').forEach(function(button){button.addEventListener('click',function(){
  document.querySelectorAll('[data-filter]').forEach(function(item){item.classList.toggle('active',item===button);item.setAttribute('aria-pressed',String(item===button))});
  state.filter=button.dataset.filter;renderWork();
})});
const sortButton=document.querySelector('#sort-button');
if(sortButton){sortButton.addEventListener('click',function(){
  state.sort=state.sort==='curated'?'popular':'curated';
  sortButton.textContent=state.sort==='curated'?'sort: curated':'sort: popular';
  sortButton.title=state.sort==='curated'?'Show curated order':'Popular ranks by your visits on this device';
  renderWork();
})}
document.querySelectorAll('.view-button[data-view]').forEach(function(button){button.addEventListener('click',function(){document.querySelectorAll('.view-button[data-view]').forEach(function(item){item.classList.toggle('active',item===button)});if(list){list.classList.toggle('compact',button.dataset.view==='compact')}})});
function hydrateStars(){
  document.querySelectorAll('[data-stars]').forEach(function(el){
    const repo=el.dataset.stars;
    fetch('https://api.github.com/repos/'+repo,{headers:{'Accept':'application/vnd.github+json'}})
      .then(function(response){if(!response.ok)throw new Error('stars unavailable');return response.json()})
      .then(function(data){if(typeof data.stargazers_count==='number'){el.hidden=false;el.textContent='★ '+data.stargazers_count;el.title=data.stargazers_count+' stars on GitHub'}})
      .catch(function(){el.remove()});
  });
}
fetch('./api/site-status',{headers:{'Accept':'application/json'}})
  .then(function(response){if(!response.ok)throw new Error('status unavailable');return response.json()})
  .then(function(data){
    const sites=data&&Array.isArray(data.sites)?data.sites:[];
    const checked=data&&data.checkedAt?new Date(data.checkedAt):null;
    const stamp=document.querySelector('#status-stamp');
    if(stamp&&checked&&!isNaN(checked)){stamp.textContent='Checked '+checked.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});stamp.hidden=false}
    sites.forEach(function(site){
      document.querySelectorAll('[data-dot="'+site.id+'"]').forEach(function(dot){
        dot.classList.remove('dot-on','dot-beta','dot-off');
        dot.classList.add(site.live?'dot-live':'dot-down');
        dot.title=site.live?'Live right now':'Unreachable on last check';
      });
    });
  })
  .catch(function(){});
const writingList=document.querySelector('#writing-list');
if(writingList){
  fetch('https://api.yash0.in/posts',{headers:{'Accept':'application/json'}})
    .then(function(response){if(!response.ok)throw new Error('posts unavailable');return response.json()})
    .then(function(data){
      const posts=data&&Array.isArray(data.posts)?data.posts.slice(0,3):[];
      if(!posts.length){writingList.innerHTML='<p class="work-empty">The first post is still compiling. Product docs are the best window in for now.</p>';return}
      writingList.innerHTML=posts.map(function(post,index){
        const date=post.published_at?new Date(post.published_at).toLocaleDateString('en-IN',{month:'short',year:'numeric'}):'';
        return '<a class="writing-item" href="./blog/#'+encodeURIComponent(post.slug)+'"><span class="writing-index">'+String(index+1).padStart(2,'0')+'</span><span class="work-copy"><h3>'+escapeHtml(post.title)+'</h3><p>'+escapeHtml(post.excerpt||'')+'</p></span><span class="date">'+escapeHtml(date)+'</span></a>'
      }).join('');
    })
    .catch(function(){writingList.innerHTML='<p class="work-empty">Writing lives on the <a class="row-link" href="./blog/">blog</a> — it did not load inline just now.</p>'});
}
const palette=document.querySelector('#palette');
const paletteInput=document.querySelector('#palette-input');
const paletteList=document.querySelector('#palette-list');
function paletteEntries(){
  const entries=work.map(function(item){return{group:'Projects',label:item.name,hint:'open live site ↗',href:item.live,external:true}});
  work.forEach(function(item){entries.push({group:'Docs',label:item.name+' docs',hint:'read the docs',href:item.docs,external:false})});
  entries.push({group:'Pages',label:'Now — what I’m doing',hint:'page',href:'./now.html',external:false});
  entries.push({group:'Pages',label:'Uses — the home setup',hint:'page',href:'./uses.html',external:false});
  entries.push({group:'Pages',label:'Writing',hint:'page',href:'./blog/',external:false});
  entries.push({group:'Docs',label:'All docs',hint:'page',href:'./docs/',external:false});
  return entries;
}
let paletteIndex=0;
function renderPalette(query){
  if(!paletteList)return[];
  const q=query.trim().toLowerCase();
  const matches=paletteEntries().filter(function(entry){return !q||entry.label.toLowerCase().includes(q)});
  paletteIndex=0;
  if(!matches.length){paletteList.innerHTML='<p class="work-empty">No match. Try a project name or “docs”.</p>';return matches}
  let html='',lastGroup='',selected=0;
  matches.forEach(function(entry,i){
    if(entry.group!==lastGroup){lastGroup=entry.group;html+='<p class="palette-group">'+escapeHtml(entry.group)+'</p>'}
    html+='<a class="palette-item'+(i===0?' selected':'')+'" href="'+entry.href+'"'+(entry.external?' target="_blank" rel="noreferrer"':'')+' data-pi="'+i+'"><span>'+escapeHtml(entry.label)+'</span><span class="palette-hint">'+escapeHtml(entry.hint)+'</span></a>'
  });
  paletteList.innerHTML=html;
  paletteList.querySelectorAll('.palette-item').forEach(function(item){
    item.addEventListener('mousemove',function(){
      paletteIndex=Number(item.dataset.pi);
      paletteList.querySelectorAll('.palette-item').forEach(function(other){other.classList.toggle('selected',other===item)});
    });
  });
  return matches;
}
let paletteMatches=[];
function openPalette(){if(!palette)return;palette.hidden=false;paletteMatches=renderPalette('');if(paletteInput){paletteInput.value='';window.setTimeout(function(){paletteInput.focus()},0)}document.body.classList.add('palette-open')}
function closePalette(){if(!palette)return;palette.hidden=true;document.body.classList.remove('palette-open')}
const paletteButton=document.querySelector('#palette-button');
if(paletteButton){paletteButton.addEventListener('click',openPalette)}
if(palette){palette.addEventListener('click',function(event){if(event.target===palette)closePalette()})}
if(paletteInput){
  paletteInput.addEventListener('input',function(){paletteMatches=renderPalette(paletteInput.value)});
  paletteInput.addEventListener('keydown',function(event){
    const items=paletteList?Array.from(paletteList.querySelectorAll('.palette-item')):[];
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();
      if(!items.length)return;
      paletteIndex=(paletteIndex+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;
      items.forEach(function(item,index){item.classList.toggle('selected',index===paletteIndex)});
      if(items[paletteIndex]&&items[paletteIndex].scrollIntoView)items[paletteIndex].scrollIntoView({block:'nearest'});
    }else if(event.key==='Enter'){
      event.preventDefault();
      if(items[paletteIndex])items[paletteIndex].click();else if(items[0])items[0].click();
    }
  });
}
function kbRows(){return list?Array.from(list.querySelectorAll('.work-item')):[]}
function focusRow(index){
  const rows=kbRows();if(!rows.length)return;
  state.kbIndex=(index+rows.length)%rows.length;
  rows.forEach(function(row,i){row.classList.toggle('kb-focus',i===state.kbIndex)});
  const link=rows[state.kbIndex].querySelector('a.work-main');
  if(link&&link.focus)link.focus({preventScroll:true});
  rows[state.kbIndex].scrollIntoView({block:'nearest'});
}
document.addEventListener('keydown',function(event){
  const inField=event.target&&(event.target.tagName==='INPUT'||event.target.tagName==='TEXTAREA');
  if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(palette&&palette.hidden)openPalette();else closePalette();return}
  if(palette&&!palette.hidden&&event.key==='Escape'){closePalette();return}
  if(inField||!list)return;
  if(event.key==='j'){event.preventDefault();focusRow(state.kbIndex+1)}
  else if(event.key==='k'){event.preventDefault();focusRow(state.kbIndex-1)}
  else if(event.key==='Enter'&&state.kbIndex>=0){const rows=kbRows();const link=rows[state.kbIndex]?rows[state.kbIndex].querySelector('a.work-main'):null;if(link)link.click()}
  else if((event.key==='e'||event.key==='E')&&state.kbIndex>=0){const rows=kbRows();const button=rows[state.kbIndex]?rows[state.kbIndex].querySelector('[data-expand]'):null;if(button)button.click()}
});
const copyButton=document.querySelector('#copy-link');
if(copyButton){copyButton.addEventListener('click',function(){
  const url='https://test.yash0.in/';
  function done(){copyButton.textContent='copied ✓';window.setTimeout(function(){copyButton.textContent='copy link'},1500)}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url).then(done).catch(done)}else{done()}
})}
