const work=[['OpenStream','Android camera to OBS over local Wi-Fi.','Beta','./logos/openstream.svg','https://openstream.yash0.in'],['HOLEN','Private downloads on Android or in your terminal.','Active','./logos/holen.svg','https://holen.yash0.in'],['Wisper Low','Fast, local-first Windows dictation with a tiny overlay.','Prototype','./logos/wisper-low.svg','https://wisper-low.yash0.in'],['cd','Direct browser-to-browser file sharing.','Active','./logos/cd.svg','https://cd.yash0.in'],['yt-cmd','Interactive YouTube downloads in your terminal.','Active','./logos/yt-cmd.svg','https://github.com/YashasVM/yt-cmd'],['Img-gen','Remove image backgrounds locally in your browser.','Active','./logos/img-gen.svg','https://img-gen.yash0.in'],['localhost','A public status page for local services.','Live','./logos/localhost.svg','https://yvmx.dpdns.org/']];
const canvas=document.querySelector('.pixel-canvas');
const context=canvas.getContext('2d');
let pixelWidth=0,pixelHeight=0;
function resizePixels(){pixelWidth=Math.max(1,Math.ceil(innerWidth/3));pixelHeight=Math.max(1,Math.ceil(innerHeight*.47/3));canvas.width=pixelWidth;canvas.height=pixelHeight}
function hash(x,y){const value=Math.sin(x*127.1+y*311.7)*43758.5453;return value-Math.floor(value)}
function valueNoise(x,y){const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);const a=hash(x0,y0),b=hash(x0+1,y0),c=hash(x0,y0+1),d=hash(x0+1,y0+1);return a+(b-a)*sx+((c+(d-c)*sx)-(a+(b-a)*sx))*sy}
function fractalNoise(x,y){return valueNoise(x,y)*.56+valueNoise(x*2.1+9,y*2.1-4)*.28+valueNoise(x*4.4-7,y*4.4+11)*.16}
const dither=[[0,.5,.125,.625],[.75,.25,.875,.375],[.1875,.6875,.0625,.5625],[.9375,.4375,.8125,.3125]];
function drawPixels(){const image=context.createImageData(pixelWidth,pixelHeight),data=image.data,t=0;
  for(let y=0;y<pixelHeight;y++)for(let x=0;x<pixelWidth;x++){const nx=x/pixelWidth,ny=y/pixelHeight;const warp=fractalNoise(nx*5.5+t*.08,ny*5.5-t*.03);const heat=fractalNoise(nx*22+warp*2.8+t*.12,ny*12-warp*2.1-t*.05)*1.65+fractalNoise(nx*5-t*.05,ny*3+t*.03)*.45-ny*1.2;const amount=Math.max(0,Math.min(1,(heat-.05)/1.72));const scaled=amount*5;const level=Math.min(5,Math.floor(scaled)+(scaled%1>dither[y&3][x&3]?1:0));const palette=[[5,2,2],[16,3,2],[42,3,2],[86,5,2],[157,12,2],[232,42,4]][level];const i=(y*pixelWidth+x)*4;data[i]=palette[0];data[i+1]=palette[1];data[i+2]=palette[2];data[i+3]=255}
  context.putImageData(image,0,0)
}
resizePixels();window.addEventListener('resize',function(){resizePixels();drawPixels()});drawPixels();
const list=document.querySelector('#work-list');
list.innerHTML=work.map(function(item){const name=item[0],description=item[1],date=item[2],logo=item[3],link=item[4];return '<a class="work-item" href="'+link+'" target="_blank" rel="noreferrer" aria-label="'+name+'"><span class="work-mark"><img src="'+logo+'" alt="" style="width:100%;height:100%;object-fit:cover" loading="lazy"></span><span class="work-copy"><h3>'+name+'</h3><p>'+description+'</p></span><span class="date">'+date+'</span></a>'}).join('');
document.querySelectorAll('.view-button').forEach(function(button){button.addEventListener('click',function(){document.querySelectorAll('.view-button').forEach(function(item){item.classList.toggle('active',item===button)});list.classList.toggle('compact',button.dataset.view==='compact')})});
