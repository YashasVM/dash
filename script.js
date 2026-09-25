const work=[['cd','Send a file straight from your browser to someone else’s.','Active','./logos/cd-v2.png','https://cd.yash0.in'],['HOLEN','Downloads for Android, web, or terminal people who hate upload queues.','Active','./logos/holen-v2.png','https://holen.yash0.in'],['Wisper Low','Offline dictation with a tiny Windows overlay and no cloud detour.','Prototype','./logos/wisper-low-v2.png','https://wisper-low.yash0.in'],['OpenStream','Your phone is already a camera. OpenStream gets OBS to admit it.','Beta','./logos/openstream-v2.png','https://openstream.yash0.in'],['yt-cmd','A friendlier way to survive the yt-dlp flag maze.','Active','./logos/yt-cmd-v2.png','https://github.com/YashasVM/yt-cmd'],['Img-gen','Drop an image in, get the background out — in your browser.','Active','./logos/img-gen-v2.png','https://img-gen.yash0.in'],['localhost','A tiny public window into what’s running at home.','Live','./logos/localhost-v2.png','https://yvmx.dpdns.org/']];
const canvas=document.querySelector('.pixel-canvas');
const context=canvas.getContext('2d',{alpha:false});
let pixelWidth=0,pixelHeight=0,scale=4,image=null,pixels32=null,invW=0,invH=0;
let raf=0,lastFrame=0,emaMs=16,frameCount=0;
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function pickScale(){const px=innerWidth*Math.max(1,innerHeight*.55);const s=Math.sqrt(px/60000);return Math.min(6,Math.max(3,s))}
function resizePixels(){pixelWidth=Math.max(1,Math.ceil(innerWidth/scale));pixelHeight=Math.max(1,Math.ceil(innerHeight*.55/scale));canvas.width=pixelWidth;canvas.height=pixelHeight;image=context.createImageData(pixelWidth,pixelHeight);pixels32=new Uint32Array(image.data.buffer);invW=1/pixelWidth;invH=1/pixelHeight}
function hash(x,y){let h=Math.imul(x,374761393)+Math.imul(y,668265263)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296}
function valueNoise(x,y){const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);const a=hash(x0,y0),b=hash(x0+1,y0),c=hash(x0,y0+1),d=hash(x0+1,y0+1);const ab=a+(b-a)*sx,cd=c+(d-c)*sx;return ab+(cd-ab)*sy}
function fractalNoise(x,y){return valueNoise(x,y)*.56+valueNoise(x*2.1+9,y*2.1-4)*.28+valueNoise(x*4.4-7,y*4.4+11)*.16}
const PAL32=[[5,2,2],[16,3,2],[42,3,2],[86,5,2],[157,12,2],[232,42,4]].map(function(c){return((255<<24)|(c[2]<<16)|(c[1]<<8)|c[0])>>>0});
const dither=[0,.5,.125,.625,.75,.25,.875,.375,.1875,.6875,.0625,.5625,.9375,.4375,.8125,.3125];
function drawPixels(time){const t=reduceMotion?0:time*.0018,data=pixels32;let i=0;
  for(let y=0;y<pixelHeight;y++){const ny=y*invH,rowShade=ny*1.2,ditherRow=(y&3)<<2;for(let x=0;x<pixelWidth;x++){const nx=x*invW;const warp=fractalNoise(nx*5.5+t*.08,ny*5.5-t*.03);let heat=fractalNoise(nx*22+warp*2.8+t*.12,ny*12-warp*2.1-t*.05)*1.65+fractalNoise(nx*5-t*.05,ny*3+t*.03)*.45+(valueNoise(nx*48-t*.3,ny*48+t*.2)-.5)*.24-rowShade;
    let amount=(heat-.05)*.5813953;amount=amount<0?0:amount>1?1:amount;const scaled=amount*5;let level=scaled|0;if(scaled-level>dither[ditherRow|(x&3)])level++;if(level>5)level=5;data[i++]=PAL32[level]}}
  context.putImageData(image,0,0)
}
function loop(now){const dt=now-(lastFrame||now);lastFrame=now;if(dt>0&&dt<250)emaMs=emaMs*.95+Math.min(dt,50)*.05;drawPixels(now);frameCount++;if(frameCount>=90){frameCount=0;if(emaMs>19&&scale<6){scale+=.5;resizePixels()}else if(emaMs<10.5&&scale>3){scale-=.5;resizePixels()}}raf=requestAnimationFrame(loop)}
function start(){scale=pickScale();resizePixels();drawPixels(performance.now());if(reduceMotion)return;lastFrame=performance.now();if(!raf)raf=requestAnimationFrame(loop)}
let resizeTimer=0;window.addEventListener('resize',function(){resizePixels();window.clearTimeout(resizeTimer);resizeTimer=window.setTimeout(function(){if(reduceMotion)drawPixels(performance.now())},120)},{passive:true});
document.addEventListener('visibilitychange',function(){if(document.hidden){if(raf){cancelAnimationFrame(raf);raf=0}}else if(!reduceMotion&&!raf){lastFrame=performance.now();raf=requestAnimationFrame(loop)}});
start();
const list=document.querySelector('#work-list');
list.innerHTML=work.map(function(item,index){const name=item[0],description=item[1],date=item[2],logo=item[3],link=item[4];return '<a class="work-item" href="'+link+'" target="_blank" rel="noreferrer" aria-label="'+name+'"><span class="work-mark"><img src="'+logo+'" alt="" width="48" height="48" loading="'+(index<2?'eager':'lazy')+'" decoding="async"></span><span class="work-copy"><h3>'+name+'</h3><p>'+description+'</p></span><span class="date">'+date+'</span></a>'}).join('');
document.querySelectorAll('.view-button').forEach(function(button){button.addEventListener('click',function(){document.querySelectorAll('.view-button').forEach(function(item){item.classList.toggle('active',item===button)});list.classList.toggle('compact',button.dataset.view==='compact')})});
