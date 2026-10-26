const work=[['cd','Send a file straight from your browser to someone else’s.','Active','./logos/v3/cd.webp','https://cd.yash0.in'],['Mobie','Find mobile-ready AI models on Hugging Face, check they fit your phone, and run them offline.','Active','./logos/v3/mobie.webp','https://mobie.yash0.in'],['Wisperlow','A floating bubble that types your voice into any app. Offline, any keyboard.','Beta','./logos/v3/wisperlow.webp','https://wisper.yash0.in'],['OpenStream','Your phone is already a camera. OpenStream gets OBS to admit it.','Beta','./logos/v3/openstream.webp','https://os.yash0.in'],['dns','Block known ad and tracker domains with encrypted DNS. Set it up in your browser or device.','Live','./logos/v3/dns.webp','https://dns.yash0.in'],['HOLEN','Downloads for Android, web, or terminal people who hate upload queues.','Active','./logos/v3/holen.webp','https://holen.yash0.in'],['yt-cmd','A friendlier way to survive the yt-dlp flag maze.','Active','./logos/v3/yt-cmd.webp','https://github.com/YashasVM/yt-cmd'],['Img-gen','Drop an image in, get the background out — in your browser.','Active','./logos/v3/img-gen.webp','https://img-gen.yash0.in'],['localhost','A tiny public window into what’s running at home.','Live','./logos/v3/localhost.webp','https://yvmx.dpdns.org/']];
const GH_USER='YashasVM';
let ghStarted=false;
const esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* work list */
const list=document.querySelector('#work-list');
list.innerHTML=work.map(function(item,index){const name=item[0],description=item[1],status=item[2],logo=item[3],link=item[4];return '<a class="work-item" style="--i:'+index+'" href="'+link+'" target="_blank" rel="noreferrer" aria-label="'+esc(name)+'"><span class="work-mark"><img src="'+logo+'" srcset="'+logo+' 1x, '+logo.replace('.webp','@2x.webp')+' 2x" alt="" width="56" height="56" loading="'+(index<3?'eager':'lazy')+'" decoding="async"></span><span class="work-copy"><h3>'+esc(name)+'</h3><p>'+esc(description)+'</p></span><span class="status status-'+status.toLowerCase()+'"><i></i>'+status+'</span></a>'}).join('');
document.querySelectorAll('.view-button').forEach(function(button){button.addEventListener('click',function(){document.querySelectorAll('.view-button').forEach(function(item){item.classList.toggle('active',item===button);item.setAttribute('aria-pressed',String(item===button))});list.classList.toggle('compact',button.dataset.view==='compact')})});

/* tabs */
const tabs=Array.from(document.querySelectorAll('.tab'));
const ink=document.querySelector('.tab-ink');
const toggle=document.querySelector('.view-toggle');
const placeInk=function(tab){ink.style.width=tab.offsetWidth+'px';ink.style.transform='translateX('+tab.offsetLeft+'px)'};
const selectTab=function(name,focus){tabs.forEach(function(tab){const on=tab.dataset.tab===name;tab.setAttribute('aria-selected',String(on));tab.tabIndex=on?0:-1;const pane=document.getElementById(tab.getAttribute('aria-controls'));pane.hidden=!on;if(on){pane.classList.remove('enter');void pane.offsetWidth;pane.classList.add('enter');placeInk(tab);if(focus)tab.focus()}});toggle.classList.toggle('is-hidden',name!=='work');if(name==='github')loadGitHub();history.replaceState(null,'',name==='github'?'#github':location.pathname+location.search)};
tabs.forEach(function(tab,i){tab.addEventListener('click',function(){selectTab(tab.dataset.tab)});tab.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];selectTab(next.dataset.tab,true)}});tab.addEventListener('pointerenter',function(){if(tab.dataset.tab==='github')loadGitHub()},{once:true})});
addEventListener('resize',function(){placeInk(tabs.find(function(t){return t.getAttribute('aria-selected')==='true'}))},{passive:true});
document.fonts.ready.then(function(){placeInk(tabs.find(function(t){return t.getAttribute('aria-selected')==='true'}))});

/* github */
const cached=function(key,url){const hit=sessionStorage.getItem(key);if(hit){try{const v=JSON.parse(hit);if(Date.now()-v.t<6e5)return Promise.resolve(v.d)}catch(e){}}return fetch(url,{headers:{Accept:'application/json'}}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(d){try{sessionStorage.setItem(key,JSON.stringify({t:Date.now(),d:d}))}catch(e){}return d})};
const fmtDate=function(iso,opts){return new Date(iso+'T00:00:00').toLocaleDateString('en-US',opts||{month:'short',day:'numeric',year:'numeric'})};

function loadGitHub(){
  if(ghStarted)return;ghStarted=true;
  cached('gh-contrib','https://github-contributions-api.jogruber.de/v4/'+GH_USER+'?y=last').then(renderGraph).catch(function(){document.querySelector('#graph').innerHTML='<p class="gh-error">Couldn’t load the graph right now. <a href="https://github.com/'+GH_USER+'" target="_blank" rel="noreferrer">See it on GitHub ↗</a></p>'});
  cached('gh-events','https://api.github.com/users/'+GH_USER+'/events/public?per_page=40').then(renderFeed).catch(function(){document.querySelector('#feed').innerHTML='<li class="feed-empty">GitHub is rate-limiting right now. <a href="https://github.com/'+GH_USER+'" target="_blank" rel="noreferrer">See activity on GitHub ↗</a></li>'});
}

function renderGraph(data){
  const days=data.contributions||[];if(!days.length)throw new Error('empty');
  const graph=document.querySelector('#graph'),months=document.querySelector('#graph-months');
  const lead=new Date(days[0].date+'T00:00:00').getDay();
  const cells=[];for(let i=0;i<lead;i++)cells.push('<i class="pad"></i>');
  days.forEach(function(d,i){cells.push('<i data-l="'+d.level+'" data-c="'+d.count+'" data-d="'+d.date+'" style="--k:'+i+'"></i>')});
  graph.innerHTML=cells.join('');
  const weeks=Math.ceil(cells.length/7);graph.style.setProperty('--weeks',weeks);months.style.setProperty('--weeks',weeks);
  let last=-1;const labels=[];
  days.forEach(function(d,i){const dt=new Date(d.date+'T00:00:00');const w=Math.floor((i+lead)/7);if(dt.getDate()<=7&&dt.getMonth()!==last&&w<weeks-2){last=dt.getMonth();labels.push('<span style="grid-column:'+(w+1)+'">'+dt.toLocaleDateString('en-US',{month:'short'})+'</span>')}});
  months.innerHTML=labels.join('');
  graph.classList.add('ready');
  const scroller=document.querySelector('#graph-scroll');let touched=false;const pin=function(){if(!touched)scroller.scrollLeft=scroller.scrollWidth};pin();requestAnimationFrame(pin);if('ResizeObserver' in window)new ResizeObserver(pin).observe(scroller);scroller.addEventListener('pointerdown',function(){touched=true},{once:true});scroller.addEventListener('wheel',function(){touched=true},{once:true,passive:true});

  const total=data.total&&(data.total.lastYear!=null?data.total.lastYear:Object.values(data.total)[0]);
  let streak=0;for(let i=days.length-1;i>=0;i--){if(days[i].count>0)streak++;else if(i===days.length-1)continue;else break}
  const best=days.reduce(function(a,b){return b.count>a.count?b:a},days[0]);
  const set=function(k,v){document.querySelector('[data-stat="'+k+'"]').innerHTML=v};
  set('total',countUp(total||0)+'<small>contributions</small>');
  set('streak',streak+'<small>'+(streak===1?'day':'days')+'</small>');
  set('best',best.count+'<small>on '+fmtDate(best.date,{month:'short',day:'numeric'})+'</small>');
  graph.setAttribute('aria-label',(total||0)+' GitHub contributions in the last year');

  const tip=document.querySelector('#tip');
  const dayCells=Array.from(graph.querySelectorAll('i:not(.pad)'));
  let sel=-1,dragged=false;
  const show=function(cell){if(!cell||!cell.dataset.d){tip.classList.remove('on');return}const c=+cell.dataset.c;tip.innerHTML='<b>'+(c===0?'No':c)+' contribution'+(c===1?'':'s')+'</b> '+fmtDate(cell.dataset.d);const r=cell.getBoundingClientRect();tip.classList.add('on');const w=tip.offsetWidth;tip.style.transform='translate('+Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px,'+(r.top-tip.offsetHeight-10)+'px)'};
  const select=function(i,open){if(i<0||i>=dayCells.length)return;if(sel>=0)dayCells[sel].classList.remove('sel');sel=i;const cell=dayCells[i];cell.classList.add('sel');const cr=cell.getBoundingClientRect(),sr=scroller.getBoundingClientRect();if(cr.left<sr.left+24)scroller.scrollLeft-=sr.left+24-cr.left;else if(cr.right>sr.right-8)scroller.scrollLeft+=cr.right-sr.right+8;touched=true;if(open)openDay(cell);else show(cell)};
  graph.addEventListener('pointerover',function(e){if(!dragged)show(e.target.closest('i'))});
  graph.addEventListener('pointerleave',function(){tip.classList.remove('on')});
  graph.addEventListener('click',function(e){if(dragged)return;const cell=e.target.closest('i');if(!cell||!cell.dataset.d)return;select(dayCells.indexOf(cell),true)});
  graph.addEventListener('keydown',function(e){const step={ArrowUp:-1,ArrowDown:1,ArrowLeft:-7,ArrowRight:7}[e.key];if(step){e.preventDefault();select(sel<0?dayCells.length-1:Math.max(0,Math.min(dayCells.length-1,sel+step)),false)}else if((e.key==='Enter'||e.key===' ')&&sel>=0){e.preventDefault();openDay(dayCells[sel])}else if(e.key==='Escape'){tip.classList.remove('on')}});
  graph.addEventListener('focus',function(){if(sel<0)select(dayCells.length-1,false)});
  graph.addEventListener('blur',function(){tip.classList.remove('on')});
  /* drag to scroll through the year with a mouse */
  let startX=0,startLeft=0,down=false;
  scroller.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0)return;down=true;dragged=false;startX=e.clientX;startLeft=scroller.scrollLeft});
  addEventListener('pointermove',function(e){if(!down)return;const dx=e.clientX-startX;if(!dragged&&Math.abs(dx)>4){dragged=true;scroller.classList.add('dragging');tip.classList.remove('on')}if(dragged)scroller.scrollLeft=startLeft-dx});
  addEventListener('pointerup',function(){if(!down)return;down=false;scroller.classList.remove('dragging');setTimeout(function(){dragged=false},0)});
  scroller.addEventListener('scroll',function(){if(!graph.matches(':focus'))tip.classList.remove('on')},{passive:true});
}

/* clicking a day: look up public commits and PRs/issues for that date */
const dayPanel=document.querySelector('#day');
const ghSearch=function(kind,q){const key='gh-day-'+kind+'-'+q;const hit=sessionStorage.getItem(key);if(hit){try{const v=JSON.parse(hit);if(Date.now()-v.t<36e5)return Promise.resolve(v.d)}catch(e){}}return fetch('https://api.github.com/search/'+kind+'?per_page=100&q='+encodeURIComponent(q),{headers:{Accept:'application/vnd.github+json'}}).then(function(r){if(r.status===403||r.status===429)throw new Error('rate');if(!r.ok)throw new Error(r.status);return r.json()}).then(function(d){try{sessionStorage.setItem(key,JSON.stringify({t:Date.now(),d:d}))}catch(e){}return d})};
let dayToken=0;
function openDay(cell){
  const date=cell.dataset.d,count=+cell.dataset.c,token=++dayToken;
  const ghDay='https://github.com/'+GH_USER+'?tab=overview&from='+date+'&to='+date;
  const head='<div class="day-head"><div><span class="day-date">'+fmtDate(date,{weekday:'long',month:'long',day:'numeric',year:'numeric'})+'</span><span class="day-count"><i data-l="'+cell.dataset.l+'"></i>'+(count===0?'No':count)+' contribution'+(count===1?'':'s')+'</span></div><button class="day-close" type="button" aria-label="Close day details">×</button></div>';
  dayPanel.hidden=false;dayPanel.classList.remove('enter');void dayPanel.offsetWidth;dayPanel.classList.add('enter');
  if(count===0){dayPanel.innerHTML=head+'<p class="day-note">Nothing on this day. Even builders take days off.</p>';return}
  dayPanel.innerHTML=head+'<div class="day-loading"><span></span><span></span><span></span></div>';
  if(dayPanel.getBoundingClientRect().bottom>innerHeight)dayPanel.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'nearest'});
  Promise.all([ghSearch('commits','author:'+GH_USER+' author-date:'+date),ghSearch('issues','author:'+GH_USER+' created:'+date)]).then(function(res){
    if(token!==dayToken)return;
    const commits=res[0].items||[],issues=res[1].items||[];
    const byRepo={};commits.forEach(function(c){const repo=c.repository.full_name;(byRepo[repo]=byRepo[repo]||[]).push(c)});
    const repoName=function(full){return full.split('/')[0]===GH_USER?full.split('/')[1]:full};
    let html='';
    const repos=Object.keys(byRepo).sort(function(x,y){return byRepo[y].length-byRepo[x].length});
    if(repos.length){html+='<h3 class="day-sub">Commits <span>'+res[0].total_count+'</span></h3>'+repos.map(function(repo){const list=byRepo[repo];return '<div class="day-repo"><a class="day-repo-name" href="https://github.com/'+esc(repo)+'" target="_blank" rel="noreferrer">'+esc(repoName(repo))+' <span>'+list.length+' commit'+(list.length===1?'':'s')+'</span></a><ul>'+list.slice(0,6).map(function(c){return '<li><a href="'+esc(c.html_url)+'" target="_blank" rel="noreferrer"><code>'+c.sha.slice(0,7)+'</code>'+esc(c.commit.message.split('\n')[0])+'</a></li>'}).join('')+(list.length>6?'<li class="day-more"><a href="https://github.com/'+esc(repo)+'/commits?author='+GH_USER+'&since='+date+'T00:00:00Z&until='+date+'T23:59:59Z" target="_blank" rel="noreferrer">+ '+(list.length-6)+' more</a></li>':'')+'</ul></div>'}).join('')}
    if(issues.length){html+='<h3 class="day-sub">Pull requests &amp; issues <span>'+issues.length+'</span></h3><ul class="day-issues">'+issues.map(function(it){const isPr=!!it.pull_request;const merged=isPr&&it.pull_request.merged_at;const state=merged?'merged':it.state;const repo=it.repository_url.split('/repos/')[1];return '<li><a href="'+esc(it.html_url)+'" target="_blank" rel="noreferrer"><span class="pill pill-'+state+'">'+(isPr?'PR':'Issue')+' · '+state+'</span><span class="day-issue-title">'+esc(it.title)+'</span><span class="day-issue-repo">'+esc(repoName(repo))+' #'+it.number+'</span></a></li>'}).join('')+'</ul>'}
    const found=(res[0].total_count||0)+issues.length;
    if(!html)html='<p class="day-note">None of these are public, so they were probably in private repos or reviews and comments. <a href="'+ghDay+'" target="_blank" rel="noreferrer">Open on GitHub ↗</a></p>';
    else if(found<count)html+='<p class="day-note">+ '+(count-found)+' more from reviews, comments or private repos. <a href="'+ghDay+'" target="_blank" rel="noreferrer">Full day on GitHub ↗</a></p>';
    dayPanel.innerHTML=head+'<div class="day-body">'+html+'</div>';
  }).catch(function(err){
    if(token!==dayToken)return;
    dayPanel.innerHTML=head+'<p class="day-note">'+(err.message==='rate'?'GitHub’s search limit kicked in. Give it a minute, or':'Couldn’t reach GitHub right now.')+' <a href="'+ghDay+'" target="_blank" rel="noreferrer">See this day on GitHub ↗</a></p>';
  });
}
dayPanel.addEventListener('click',function(e){if(e.target.closest('.day-close')){dayPanel.hidden=true;dayToken++;const s=document.querySelector('.graph i.sel');if(s)s.classList.remove('sel')}});

function countUp(n){const el='<span class="count" data-n="'+n+'">'+(reduceMotion?n.toLocaleString():'0')+'</span>';if(!reduceMotion)requestAnimationFrame(function(){const node=document.querySelector('.count[data-n="'+n+'"]');if(!node)return;const t0=performance.now();const step=function(t){const p=Math.min(1,(t-t0)/900),e=1-Math.pow(1-p,3);node.textContent=Math.round(n*e).toLocaleString();if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)});return el}

const ago=function(iso){const s=(Date.now()-new Date(iso))/1000;if(s<60)return'just now';const units=[['y',31536e3],['mo',2592e3],['w',604800],['d',86400],['h',3600],['m',60]];for(const u of units){if(s>=u[1])return Math.floor(s/u[1])+u[0]+' ago'}return'just now'};
const describe=function(e){const p=e.payload||{},repo=e.repo.name,url='https://github.com/'+repo;
  switch(e.type){
    case'PushEvent':{const n=p.size||(p.commits&&p.commits.length)||0;return['push',n?'Pushed '+n+' commit'+(n===1?'':'s')+' to':'Pushed to',url+(p.head?'/commit/'+p.head:'')]}
    case'PullRequestEvent':{const pr=p.pull_request||{};const verb=p.action==='closed'&&pr.merged?'Merged':p.action==='opened'?'Opened':p.action==='closed'?'Closed':p.action==='reopened'?'Reopened':'Updated';return['pr',verb+' a pull request'+(pr.number?' #'+pr.number:'')+' in',pr.html_url||url]}
    case'PullRequestReviewEvent':case'PullRequestReviewCommentEvent':return['review','Reviewed a pull request in',(p.pull_request&&p.pull_request.html_url)||url];
    case'IssueCommentEvent':return['comment','Commented on'+(p.issue&&p.issue.number?' #'+p.issue.number+' in':''),(p.comment&&p.comment.html_url)||url];
    case'IssuesEvent':return['issue',(p.action==='opened'?'Opened':p.action==='closed'?'Closed':'Updated')+' an issue in',(p.issue&&p.issue.html_url)||url];
    case'WatchEvent':return['star','Starred',url];
    case'ForkEvent':return['fork','Forked',url];
    case'CreateEvent':return['create',p.ref_type==='repository'?'Created':'Created '+p.ref_type+(p.ref?' '+p.ref:'')+' in',url];
    case'DeleteEvent':return['delete','Deleted '+p.ref_type+(p.ref?' '+p.ref:'')+' in',url];
    case'ReleaseEvent':return['release','Released '+((p.release&&p.release.tag_name)||'')+' of',(p.release&&p.release.html_url)||url];
    case'PublicEvent':return['create','Open-sourced',url];
    default:return null}
};
const glyph={push:'↑',pr:'⇄',review:'✓',comment:'“',issue:'!',star:'★',fork:'⑂',create:'+',delete:'−',release:'◆'};
function renderFeed(events){
  const rows=[];
  events.forEach(function(e){const d=describe(e);if(!d)return;const prev=rows[rows.length-1];if(prev&&prev.kind===d[0]&&prev.repo===e.repo.name&&d[0]!=='pr'){prev.n++;return}rows.push({kind:d[0],text:d[1],href:d[2],repo:e.repo.name,at:e.created_at,n:1})});
  const feed=document.querySelector('#feed');
  if(!rows.length){feed.innerHTML='<li class="feed-empty">Nothing public lately.</li>';return}
  feed.innerHTML=rows.slice(0,8).map(function(r,i){const own=r.repo.split('/')[0]===GH_USER;const name=own?r.repo.split('/')[1]:r.repo;return '<li style="--i:'+i+'"><a href="'+esc(r.href)+'" target="_blank" rel="noreferrer"><span class="feed-ico ico-'+r.kind+'" aria-hidden="true">'+glyph[r.kind]+'</span><span class="feed-text">'+esc(r.text)+' <b>'+esc(name)+'</b>'+(r.n>1?' <em>×'+r.n+'</em>':'')+'</span><time datetime="'+r.at+'">'+ago(r.at)+'</time></a></li>'}).join('');
}

/* boot after everything above is defined */
selectTab(location.hash==='#github'?'github':'work');
