(function(){
const SPACING=22,RADIUS=100,MAX_OFFSET=11,LERP=.18;
const canvas=document.getElementById('ambient-dots');
const ctx=canvas?canvas.getContext('2d'):null;
if(canvas&&ctx){
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let dots=[],pointer=null,raf=0,width=0,height=0;
  function draw(){
    ctx.clearRect(0,0,width,height);
    let moving=false;
    for(const dot of dots){
      let tx=0,ty=0,hot=false;
      if(pointer&&!reduceMotion.matches){
        const dx=dot.x-pointer.x,dy=dot.y-pointer.y;
        const dist=Math.hypot(dx,dy);
        if(dist<RADIUS){
          const force=Math.pow(1-dist/RADIUS,2);
          const push=force*MAX_OFFSET/(dist||1);
          tx=dx*push;ty=dy*push;hot=force>.08;
        }
      }
      dot.ox+=(tx-dot.ox)*LERP;dot.oy+=(ty-dot.oy)*LERP;
      if(Math.abs(tx-dot.ox)<.06){dot.ox=tx;}else{moving=true;}
      if(Math.abs(ty-dot.oy)<.06){dot.oy=ty;}else{moving=true;}
      ctx.fillStyle=hot?'rgba(229, 138, 87, .55)':'rgba(229, 95, 48, .26)';
      ctx.fillRect(dot.x+dot.ox,dot.y+dot.oy,1.5,1.5);
    }
    return moving;
  }
  function tick(){
    raf=0;
    if(draw()){raf=requestAnimationFrame(tick);}
  }
  function kick(){
    if(!raf&&!document.hidden){raf=requestAnimationFrame(tick);}
  }
  function layout(){
    const rect=canvas.getBoundingClientRect();
    width=rect.width;height=rect.height;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    dots=[];
    for(let y=SPACING/2;y<height;y+=SPACING){
      for(let x=SPACING/2;x<width;x+=SPACING){
        dots.push({x:x,y:y,ox:0,oy:0});
      }
    }
    draw();
    if(pointer&&!reduceMotion.matches){kick();}
  }
  window.addEventListener('pointermove',function(e){
    if(reduceMotion.matches||e.pointerType==='touch'){return;}
    pointer=e.clientY<height?{x:e.clientX,y:e.clientY}:null;
    kick();
  },{passive:true});
  window.addEventListener('pointerout',function(e){
    if(!e.relatedTarget){pointer=null;kick();}
  });
  window.addEventListener('blur',function(){pointer=null;kick();});
  window.addEventListener('resize',layout,{passive:true});
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){pointer=null;if(raf){cancelAnimationFrame(raf);raf=0;}}
    else{kick();}
  });
  reduceMotion.addEventListener('change',function(){
    pointer=null;
    for(const dot of dots){dot.ox=0;dot.oy=0;}
    draw();
  });
  layout();
}
document.querySelectorAll('.os-tab').forEach(function(tab){tab.addEventListener('click',function(){document.querySelectorAll('.os-tab').forEach(function(t){const on=t===tab;t.classList.toggle('active',on);t.setAttribute('aria-selected',on?'true':'false');});document.querySelectorAll('.term-body').forEach(function(pane){pane.classList.toggle('hidden',pane.dataset.pane!==tab.dataset.os);});const label=document.getElementById('term-label');if(label){label.textContent=tab.dataset.os==='win'?'powershell':'terminal';}});});
document.querySelectorAll('.copy').forEach(function(btn){btn.addEventListener('click',async function(){const cmd=document.getElementById(btn.dataset.copy).textContent.trim();try{await navigator.clipboard.writeText(cmd);btn.textContent='copied ✓';}catch(e){const ta=document.createElement('textarea');ta.value=cmd;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');btn.textContent='copied ✓';}catch(_){btn.textContent='copy failed';}ta.remove();}setTimeout(function(){btn.textContent='copy';},1600);});});
})();
