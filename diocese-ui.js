const MY_DIOCESE_STORAGE_KEY='oai_my_diocese_name';
function getMyDioceseName(){
  try{return (localStorage.getItem(MY_DIOCESE_STORAGE_KEY)||'').trim();}
  catch(e){return '';}
}
function isMyDioceseName(name){
  const mine=getMyDioceseName();
  return !!(mine&&name&&mine===name);
}
function appendMyDioceseBadge(target){
  if(!target)return null;
  const badge=document.createElement('span');
  badge.className='lv-my-diocese-badge';
  badge.textContent='나의 교구';
  target.appendChild(badge);
  return badge;
}
function buildListView(){
  const gws=[
    {key:'서울관구',col:'#2563EB',dioceses:['서울대교구','인천교구','수원교구','의정부교구','원주교구','춘천교구','대전교구']},
    {key:'대구관구',col:'#B7791F',dioceses:['대구대교구','청주교구','안동교구','마산교구','부산교구']},
    {key:'광주관구',col:'#7C3AED',dioceses:['광주대교구','전주교구','제주교구']},
    {key:'군종교구',col:'#4A5568',dioceses:['군종교구']},
  ];
  const wrap=document.getElementById('list-content');
  wrap.innerHTML='';
  const myName=getMyDioceseName();
  if(myName && DIOCESE_META[myName]){
    wrap.appendChild(makeRow((DIOCESE_META[myName]&&DIOCESE_META[myName].region)||'', myName));
  }
  gws.forEach(function(g){
    g.dioceses.forEach(function(dName){
      if(myName && dName === myName) return;
      const m=DIOCESE_META[dName];if(!m)return;
      const isArchdiocese=dName.includes('대교구');
      const dets=(m.detail||[]).filter(function(x){return x.trim()!==m.region.trim();});
      const regionFull=m.region+(dets.length?'·'+dets.join('·'):'');

      const isMine=isMyDioceseName(dName);
      const card=document.createElement('div');card.className='lv-card'+(isMine?' my-diocese-card':'');

      const top=document.createElement('div');top.className='lv-top';
      const bdg=document.createElement('span');bdg.className='lv-bdg';
      bdg.style.background=g.col;
      bdg.textContent=g.key;
      const op=document.createElement('span');op.className='lv-op';
      if(isMine) appendMyDioceseBadge(op);
      top.appendChild(bdg);top.appendChild(op);

      const body=document.createElement('div');body.className='lv-body';
      const ico=document.createElement('div');ico.className='lv-ico';
      ico.textContent='⛪';
      const info=document.createElement('div');info.className='lv-info';
      const nm=document.createElement('div');nm.className='lv-name';
      if(dName==='춘천교구' || dName==='부산교구'){
        nm.textContent=dName+' · '+(m.parishes||0)+'개 본당(해외본당 제외)';
      }else{
        nm.textContent=(dName==='군종교구')?dName:(dName+' · '+(m.parishes||0)+'개 본당');
      }
      if(isMine) appendMyDioceseBadge(nm);
      const rg=document.createElement('div');rg.className='lv-rg';
      rg.innerHTML='📍 '+m.region;
      info.appendChild(nm);info.appendChild(rg);
      const pc=document.createElement('div');pc.className='lv-parish-count';
      pc.innerHTML='<span>본당</span><b>'+(m.parishes||0)+'개</b>';
      const dets2=(m.detail||[]).filter(function(x){return x.trim()!==m.region.trim();});
      if(dets2.length){
        const dt=document.createElement('div');dt.className='lv-det';
        dt.textContent=dets2.join(' / ');info.appendChild(dt);
      }
      body.appendChild(ico);body.appendChild(info);

      const foot=document.createElement('div');foot.className='lv-foot';
      const url=document.createElement('span');url.className='lv-url';
      url.textContent=m.url?m.url.replace(/^https?:\/\//,'').replace(/\/$/,''):'홈페이지 없음';
      const arr=document.createElement('span');arr.className='lv-arr';arr.textContent='›';
      foot.appendChild(url);
      if(m.priestUrl){
        const priestBtn=document.createElement('button');
        priestBtn.type='button';
        priestBtn.className='lv-priest-link';
        priestBtn.textContent='✝ 사제찾기';
        priestBtn.dataset.dioUrl=m.priestUrl;
        priestBtn.dataset.dioSource='priest';
        priestBtn.dataset.dioKey=dName;
        foot.appendChild(priestBtn);
      }
      foot.appendChild(arr);

      card.appendChild(top);card.appendChild(body);card.appendChild(foot);
      if(m.url){
        card.dataset.dioUrl = m.url;
        card.dataset.dioSource = 'list';
        card.dataset.dioKey = dName;
      }
      wrap.appendChild(card);
    });
  });
}




(function(){
  var KEY='prayer_font_size', BASE=16;
  function currentScale(){
    var px=parseInt(localStorage.getItem(KEY)||BASE,10);
    if(!px || px<13 || px>30) px=BASE;
    return px/BASE;
  }
  window.dioApplySharedFont=function(){
    var scale=currentScale();
    document.documentElement.style.setProperty('--dio-font-scale', String(scale));
  };
  window.addEventListener('storage', function(e){ if(e.key===KEY) window.dioApplySharedFont(); });
  window.dioApplySharedFont();
})();

document.querySelectorAll('.tab').forEach(function(t){
  t.addEventListener('click',function(){
    document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('on');});
    t.classList.add('on');
    const tab=t.dataset.tab;
    document.getElementById('map-view').classList.toggle('on',tab==='gwangu');
    document.getElementById('search-view').classList.toggle('on',tab==='search');
    document.getElementById('list-view').classList.toggle('on',tab==='list');
    if(tab==='search'){
      var si=document.getElementById('si');
      if(si){
        var focusSearchInput=function(){
          try{ si.focus({preventScroll:true}); }
          catch(e){ try{ si.focus(); }catch(_){} }
        };
        focusSearchInput();
        setTimeout(focusSearchInput,60);
      }
    }
    if(tab!=='list'){
      try{ sessionStorage.setItem('listScroll',document.getElementById('list-view').scrollTop); }catch(e){}
    }
    document.getElementById('gw-bar').style.display=tab==='gwangu'?'flex':'none';
    if(tab==='gwangu'){
      document.querySelectorAll('.dp').forEach(function(p){
        const fc=p.getAttribute('data-color')||p.getAttribute('fill');
        if(fc){p.setAttribute('fill',fc);p.setAttribute('stroke',fc);}
        p.setAttribute('stroke-width','0.8');
        p.style.opacity='1';p.style.filter='';
      });
      document.querySelectorAll('#labels text[data-gw]').forEach(function(lbl){
        lbl.setAttribute('fill','#111');lbl.setAttribute('stroke','rgba(255,255,255,0.9)');
      });
      vx=55;vy=130;vw=380;vh=600;setVB();
      document.querySelectorAll('.gb').forEach(function(b){b.classList.remove('on');b.style.background='white';});
      document.querySelector('.gb-all').classList.add('on');
      document.querySelector('.gb-all').style.background='#555';
    }
    if(tab==='list' && !document.getElementById('list-content').hasChildNodes()){buildListView();}
    hideCard();
  });
});

let vx=55,vy=130,vw=380,vh=600,dragging=false,px=0,py=0;
const svg=document.getElementById('map-svg');
function setVB(){svg.setAttribute('viewBox',`${vx} ${vy} ${vw} ${vh}`);}
function zoom(f){
  const cx=vx+vw/2,cy=vy+vh/2;
  vw=Math.max(80,Math.min(1800,vw/f));
  vh=Math.max(100,Math.min(2250,vh/f));
  vx=cx-vw/2;vy=cy-vh/2;setVB();
}
function resetZoom(){vx=55;vy=130;vw=380;vh=600;setVB();}
svg.addEventListener('mousedown',e=>{if(e.target.classList.contains('dp'))return;dragging=true;px=e.clientX;py=e.clientY;});
window.addEventListener('mousemove',e=>{
  if(!dragging)return;
  const rect=svg.getBoundingClientRect(),sx=vw/rect.width,sy=vh/rect.height;
  vx-=(e.clientX-px)*sx;vy-=(e.clientY-py)*sy;px=e.clientX;py=e.clientY;setVB();
});
window.addEventListener('mouseup',()=>{dragging=false;});
let _zoomTarget=null, _zoomRAF=null;
function _applyZoom(nw,nh,mx,my,rx,ry){
  vw=Math.max(80,Math.min(1800,nw));
  vh=Math.max(100,Math.min(2250,nh));
  vx=mx-rx*vw; vy=my-ry*vh;
  setVB();
}
svg.addEventListener('wheel',e=>{
  e.preventDefault();
  const rect=svg.getBoundingClientRect();
  const rx=(e.clientX-rect.left)/rect.width;
  const ry=(e.clientY-rect.top)/rect.height;
  const mx=rx*vw+vx, my=ry*vh+vy;
  const delta=e.deltaY<0?-1:1;
  const f=delta<0?0.82:1.22;
  const nw=vw*f, nh=vh*f;
  if(_zoomRAF)cancelAnimationFrame(_zoomRAF);
  _zoomRAF=requestAnimationFrame(()=>{ _applyZoom(nw,nh,mx,my,rx,ry); _zoomRAF=null; });
},{passive:false});
let t0=null,t1=null,dpTap=null;
let dioSuppressClickUntil=0;
const DIO_TAP_LIMIT_PX=8;
const DIO_PAN_START_PX=10;
const DIO_PAN_DAMPING=.82;
let dioPressedEl=null, dioPressTimer=null;
function clearDioPressed(){
  if(dioPressTimer){ clearTimeout(dioPressTimer); dioPressTimer=null; }
  if(dioPressedEl){ try{ dioPressedEl.classList.remove('oai-dio-pressed'); }catch(_){} dioPressedEl=null; }
}
function setDioPressed(el){
  clearDioPressed();
  if(!el) return;
  dioPressedEl=el;
  try{ el.classList.add('oai-dio-pressed'); }catch(_){}
}
function scheduleDioPressed(el){
  clearDioPressed();
  if(!el) return;
  dioPressTimer=setTimeout(function(){ setDioPressed(el); },55);
}
function clearDioTouch(){ t0=null; t1=null; dpTap=null; clearDioPressed(); }
svg.addEventListener('click',e=>{
  if(dioSuppressClickUntil && Date.now()<dioSuppressClickUntil){
    e.preventDefault();
    e.stopImmediatePropagation();
  }
},true);
svg.addEventListener('touchstart',e=>{
  e.preventDefault();
  dpTap=null;
  if(e.touches.length===1){
    const t=e.touches[0];
    if(e.target && e.target.classList && e.target.classList.contains('dp')){
      dpTap={el:e.target,x:t.clientX,y:t.clientY,moved:false};
      scheduleDioPressed(e.target);
    }
    dragging=false;
    t0={x:t.clientX,y:t.clientY,vx,vy,started:false};
    t1=null;
  }
  if(e.touches.length===2){
    const cx=(e.touches[0].clientX+e.touches[1].clientX)/2;
    const cy=(e.touches[0].clientY+e.touches[1].clientY)/2;
    const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    const rect=svg.getBoundingClientRect();
    const rx=(cx-rect.left)/rect.width;
    const ry=(cy-rect.top)/rect.height;
    t1={d,vw,vh,vx,vy,cx,cy,rx,ry,mx:rx*vw+vx,my:ry*vh+vy};
    t0=null; dpTap=null;
  }
},{passive:false});
svg.addEventListener('touchmove',e=>{
  e.preventDefault();
  const rect=svg.getBoundingClientRect();
  if(dpTap && e.touches.length===1){
    const dx=e.touches[0].clientX-dpTap.x, dy=e.touches[0].clientY-dpTap.y;
    if(Math.hypot(dx,dy)>DIO_TAP_LIMIT_PX){ dpTap.moved=true; clearDioPressed(); }
  }
  if(e.touches.length===1&&t0){
    const dx=e.touches[0].clientX-t0.x, dy=e.touches[0].clientY-t0.y;
    if(!t0.started && Math.hypot(dx,dy)<DIO_PAN_START_PX) return;
    t0.started=true;
    if(dpTap){ dpTap.moved=true; clearDioPressed(); }
    dioSuppressClickUntil=Date.now()+450;
    const sx=vw/rect.width,sy=vh/rect.height;
    vx=t0.vx-(dx*DIO_PAN_DAMPING)*sx;
    vy=t0.vy-(dy*DIO_PAN_DAMPING)*sy;
    setVB();
  }
  if(e.touches.length===2&&t1){
    dioSuppressClickUntil=Date.now()+450;
    const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    const f=t1.d/d;
    const nw=Math.max(80,Math.min(1800,t1.vw*f));
    const nh=Math.max(100,Math.min(2250,t1.vh*f));
    vx=t1.mx-t1.rx*nw;
    vy=t1.my-t1.ry*nh;
    vw=nw; vh=nh;
    setVB();
  }
},{passive:false});
svg.addEventListener('touchend',e=>{
  e.preventDefault();
  const dioTapped = !!(dpTap && !dpTap.moved && e.touches.length===0);
  if(dioTapped){
    dioSuppressClickUntil=Date.now()+450;
    setDioPressed(dpTap.el);
    showCard(dpTap.el);
    setTimeout(clearDioPressed,130);
  }
  if(e.touches.length===0){
    t0=null; t1=null; dpTap=null;
    if(!dioTapped) clearDioPressed();
  }
},{passive:false});
svg.addEventListener('touchcancel',clearDioTouch,{passive:true});

const GW_COL={'서울관구':'#1a6bb5','대구관구':'#c05a00','광주관구':'#7a1fa2'};

function animateVB(tx,ty,tw,th,dur=420){
  const sx=vx,sy=vy,sw=vw,sh=vh,s=performance.now();
  function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
  function step(now){
    const t=Math.min((now-s)/dur,1),e=ease(t);
    vx=sx+(tx-sx)*e;vy=sy+(ty-sy)*e;vw=sw+(tw-sw)*e;vh=sh+(th-sh)*e;
    setVB();
    if(t<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const GW_BOUNDS={
  '서울관구':{x1:55,y1:130,x2:410,y2:420},
  '대구관구':{x1:206,y1:256,x2:430,y2:548},
  '광주관구':{x1: 90,y1:389,x2:259,y2:691},
};
const PADDING=18;

function filterGw(btn){
  vx=55;vy=130;vw=380;vh=600;setVB();
  const gw=btn.dataset.gw;
  document.querySelectorAll('.gb').forEach(b=>{
    const on=b.dataset.gw===gw;b.classList.toggle('on',on);
    if(on&&gw)b.style.background=GW_COL[gw];
    else if(on)b.style.background='#555';
    else b.style.background='white';
  });

  function lightenHex(hex,amt=0.82){
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    const lr=Math.round(r+(255-r)*amt),lg=Math.round(g+(255-g)*amt),lb=Math.round(b+(255-b)*amt);
    return `#${lr.toString(16).padStart(2,'0')}${lg.toString(16).padStart(2,'0')}${lb.toString(16).padStart(2,'0')}`;
  }

  if(!gw){
    document.querySelectorAll('.dp').forEach(p=>{
      const fc=p.getAttribute('data-color')||p.getAttribute('fill');
      if(fc){p.setAttribute('fill',fc);p.setAttribute('stroke',fc);}
      p.setAttribute('stroke-width','0.8');
      p.style.opacity='1';
    });
    document.querySelectorAll('#labels text[data-gw]').forEach(t=>{
      t.setAttribute('fill','#111');
      t.setAttribute('stroke','rgba(255,255,255,0.9)');
    });
  } else {
    document.querySelectorAll('.dp').forEach(p=>{
      const fc=p.getAttribute('data-color')||p.getAttribute('fill');
      const same=(p.dataset.gw===gw);
      if(same){
        if(fc){p.setAttribute('fill',fc);p.setAttribute('stroke',fc);}
        p.setAttribute('stroke-width','0.8');
        p.style.opacity='1';
      } else {
        if(fc){
          const lc=lightenHex(fc,0.91);
          p.setAttribute('fill',lc);
          p.setAttribute('stroke',lc);
        }
        p.setAttribute('stroke-width','0.8');
        p.style.opacity='1';
      }
    });
    document.querySelectorAll('#labels text[data-gw]').forEach(t=>{
      if(t.dataset.gw===gw){
        t.setAttribute('fill','#111');
        t.setAttribute('stroke','rgba(255,255,255,0.9)');
      } else {
        t.setAttribute('fill','#ccc');
        t.setAttribute('stroke','rgba(255,255,255,0.3)');
      }
    });
  }

  hideCard();
}

let detOpen=false;
function showCard(el){
  const c=el.dataset.color,t=darkText(c)?'rgba(0,0,0,.82)':'white';
  document.getElementById('c-hd').style.background=c;
  ['c-gw','c-nm','c-rg'].forEach(id=>document.getElementById(id).style.color=t);
  document.getElementById('c-gw').textContent=el.dataset.gw||'';
  document.getElementById('c-nm').textContent=el.dataset.d||'';
  document.getElementById('c-rg').textContent=el.dataset.region||'';
  const cardDioceseName=el.dataset.d||'';
  let myCardBadge=document.getElementById('c-my-diocese-badge');
  if(!myCardBadge){
    myCardBadge=document.createElement('div');
    myCardBadge.id='c-my-diocese-badge';
    myCardBadge.className='c-my-diocese-badge';
    myCardBadge.textContent='나의 교구';
    const closeBtn=document.querySelector('#c-hd .c-x');
    if(closeBtn&&closeBtn.parentNode) closeBtn.parentNode.insertBefore(myCardBadge,closeBtn);
  }
  if(myCardBadge) myCardBadge.style.display=isMyDioceseName(cardDioceseName)?'inline-flex':'none';
  const cn=document.getElementById('c-n');cn.style.color=c;cn.textContent=el.dataset.parishes||'';
  const parishRow=document.getElementById('c-parish-row');
  if(parishRow){ parishRow.style.display=(el.dataset.d==='군종교구')?'none':'flex'; }
  const dl=document.getElementById('c-dtlist');
  try{dl.innerHTML=JSON.parse(el.dataset.detail||'[]').map(x=>`<div class="dd">${x}</div>`).join('');}catch(e){dl.innerHTML='';}
  dl.classList.remove('on');detOpen=false;
  document.getElementById('c-dtbtn').textContent='▶ 상세 지역 보기';
  const url=el.dataset.url;
  const meta=DIOCESE_META[el.dataset.d||'']||{};
  const priestUrl=meta.priestUrl||'';
  const homeBtn=url
    ?`<button type="button" class="c-btn" data-dio-url="${url}" data-dio-source="map" style="background:${c}">↗ 홈페이지 방문</button>`
    :'<div class="c-nurl">홈페이지 없음</div>';
  const priestBtn=priestUrl
    ?`<button type="button" class="c-btn c-priest-btn" data-dio-url="${priestUrl}" data-dio-source="priest">✝ 사제찾기</button>`
    :'';
  document.getElementById('c-act').innerHTML=`<div class="c-action-group">${homeBtn}${priestBtn}</div>`;
  const card=document.getElementById('card');
  const diocese=el.dataset.d||'';
  const topDioceses=['서울대교구','인천교구','수원교구','의정부교구','원주교구','춘천교구','대전교구','청주교구','안동교구'];
  const isMobile=window.innerWidth<=560;
  card.classList.remove('dio-card-top','dio-card-bottom');
  if(isMobile){
    if(topDioceses.includes(diocese)){
      card.classList.add('dio-card-bottom');
      card.style.setProperty('top','auto','important');
      card.style.setProperty('bottom','10px','important');
      card.style.setProperty('right','10px','important');
      card.style.setProperty('left','auto','important');
    } else {
      card.classList.add('dio-card-top');
      card.style.setProperty('top','6px','important');
      card.style.setProperty('bottom','auto','important');
      card.style.setProperty('right','6px','important');
      card.style.setProperty('left','auto','important');
    }
  } else {
    let cx=0.5,cy=0.5;
    try{const bb=el.getBBox();cx=(bb.x+bb.width/2-vx)/vw;cy=(bb.y+bb.height/2-vy)/vh;}catch(e){}
    const onRight=(cx>0.5),onBottom=(cy>0.5);
    card.style.setProperty('right',onRight?'auto':'10px');
    card.style.setProperty('left',onRight?'10px':'auto');
    card.style.setProperty('top',onBottom?'10px':'auto');
    card.style.setProperty('bottom',onBottom?'auto':'50px');
  }
  card.classList.add('on');
  try{
    card.dataset.openedAt=String(Date.now());
    card.dataset.diocese=diocese || '';
  }catch(e){}
}
function toggleDetail(){
  detOpen=!detOpen;
  document.getElementById('c-dtlist').classList.toggle('on',detOpen);
  document.getElementById('c-dtbtn').textContent=detOpen?'▲ 접기':'▶ 상세 지역 보기';
}
function hideCard(){
  const card=document.getElementById('card');
  if(!card)return;
  card.classList.remove('on','dio-card-top','dio-card-bottom');
  try{ delete card.dataset.diocese; }catch(e){}
}
function isCardOpen(){
  const card=document.getElementById('card');
  return !!(card&&card.classList.contains('on'));
}
function isCardProtectedTarget(t){
  return !!(t&&t.closest&&(t.closest('#card')||t.closest('.dp')||t.closest('[data-dio-url]')));
}
function closeCardIfOutside(e){
  if(!isCardOpen())return;
  const t=e&&e.target;
  if(isCardProtectedTarget(t))return;
  const card=document.getElementById('card');
  const openedAt=Number((card&&card.dataset&&card.dataset.openedAt)||0);
  if(openedAt&&Date.now()-openedAt<120)return;
  hideCard();
}

function darkText(hex){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return(r*.299+g*.587+b*.114)>155;
}
document.getElementById('map-svg').addEventListener('click',e=>{
  if(e.target && e.target.classList && e.target.classList.contains('dp')){ showCard(e.target); return; }
  hideCard();
});
document.addEventListener('pointerdown',closeCardIfOutside,true);
document.addEventListener('touchstart',closeCardIfOutside,{capture:true,passive:true});


function makeRow(disp,diocese,overlapDongs){
  const m=DIOCESE_META[diocese];if(!m)return document.createElement('div');
  const url=m.url||'';
  const priestUrl=m.priestUrl||'';
  const isArch=diocese.includes('대교구');
  const gwKey=GW_OF[diocese]||m.gwangu||'';
  const gwCol={'서울관구':'#2563EB','대구관구':'#B7791F','광주관구':'#7C3AED','군종교구':'#64748B'}[gwKey]||'#888';
  const isMine=isMyDioceseName(diocese);
  const card=document.createElement('div');card.className='lv-card'+(isMine?' my-diocese-card':'');
  const top=document.createElement('div');top.className='lv-top';
  const bdg=document.createElement('span');bdg.className='lv-bdg';
  bdg.style.background=gwCol;bdg.textContent=gwKey;
  const op=document.createElement('span');op.className='lv-op';
  if(isMine) appendMyDioceseBadge(op);
  top.appendChild(bdg);top.appendChild(op);
  const body=document.createElement('div');body.className='lv-body';
  const ico=document.createElement('div');ico.className='lv-ico';
  ico.textContent='⛪';
  const info=document.createElement('div');info.className='lv-info';
  const nm=document.createElement('div');nm.className='lv-name';
  nm.textContent=diocese;
  const rg=document.createElement('div');rg.className='lv-rg';rg.innerHTML='📍 '+(disp||m.region);
  info.appendChild(nm);info.appendChild(rg);
  if(overlapDongs&&overlapDongs.length){
    const dt=document.createElement('div');dt.className='lv-det';
    dt.textContent='◾ '+overlapDongs.join(' · ');info.appendChild(dt);
  }
  body.appendChild(ico);body.appendChild(info);
  const foot=document.createElement('div');foot.className='lv-foot';
  const urlEl=document.createElement('span');urlEl.className='lv-url';
  urlEl.textContent=url?url.replace(/^https?:\/\//,'').replace(/\/$/,''):'홈페이지 없음';
  const arr=document.createElement('span');arr.className='lv-arr';arr.textContent='›';
  foot.appendChild(urlEl);
  if(priestUrl){
    const priestBtn=document.createElement('button');
    priestBtn.type='button';
    priestBtn.className='lv-priest-link';
    priestBtn.textContent='✝ 사제찾기';
    priestBtn.dataset.dioUrl=priestUrl;
    priestBtn.dataset.dioSource='priest';
    priestBtn.dataset.dioKey=diocese;
    foot.appendChild(priestBtn);
  }
  foot.appendChild(arr);
  card.appendChild(top);card.appendChild(body);card.appendChild(foot);
  if(url){
    card.dataset.dioUrl = url;
    card.dataset.dioSource = 'list';
    card.dataset.dioKey = diocese;
  }
  return card;
}

function doSearch(){
  try{ document.activeElement && document.activeElement.blur && document.activeElement.blur(); }catch(e){}
  const raw=document.getElementById('si').value.trim();
  const res=document.getElementById('sres');
  if(!raw){res.innerHTML='';return;}

  const q=raw.replace(/\s+/g,'');

  if(Array.isArray(window.AMBIGUOUS_DISTRICT_PLAIN) && AMBIGUOUS_DISTRICT_PLAIN.map(a=>a.replace(/\s+/g,'')).includes(q)){
    res.innerHTML='<div class="se">중구·동구·서구·남구·북구처럼 여러 도시에 있는 구는<br>도시명을 함께 입력하세요.<br><span style="font-size:11px;color:#6B7280">예: 대구 중구, 서울 중구, 부산 남구</span></div>';
    return;
  }

  for(const [city,aliases] of Object.entries(REGION_OVERLAP_PLAIN)){
    if(aliases.map(a=>a.replace(/\s+/g,'')).includes(q)){
      const sm=OVERLAP_SUMMARY[city]||{};
      res.innerHTML='';
      const warn=document.createElement('div');warn.className='sob';
      warn.innerHTML=`<div class="sot">⚠️ <strong>"${city}"</strong> 중복 지역입니다 — 해당 교구를 확인하세요</div>`;
      res.appendChild(warn);
      Object.keys(sm).forEach(function(d){
        if(DIOCESE_META[d]) res.appendChild(makeRow(city,d,sm[d]));
      });
      return;
    }
  }


  for(const [city,groups] of Object.entries(NAME_SAME)){
    if(city==='광주'){
      if(groups.gwangyeok.map(a=>a.replace(/\s+/g,'')).includes(q)){
        res.innerHTML='';res.appendChild(makeRow('광주광역시','광주대교구'));return;
      }
      if(groups.gyeonggi.map(a=>a.replace(/\s+/g,'')).includes(q)){
        res.innerHTML='';res.appendChild(makeRow('경기 광주','수원교구'));return;
      }
    } else if(city==='고성'){
      if(groups.gangwon.map(a=>a.replace(/\s+/g,'')).includes(q)){
        res.innerHTML='';res.appendChild(makeRow('강원 고성','춘천교구'));return;
      }
      if(groups.gyeongnam.map(a=>a.replace(/\s+/g,'')).includes(q)){
        res.innerHTML='';res.appendChild(makeRow('경남 고성','마산교구'));return;
      }
    }
    if(groups.plain.map(a=>a.replace(/\s+/g,'')).includes(q)){
      let rows='';
      res.innerHTML='';
      if(city==='광주'){
        res.appendChild(makeRow('광주광역시','광주대교구'));
        res.appendChild(makeRow('경기 광주','수원교구'));
      } else if(city==='고성'){
        res.appendChild(makeRow('강원 고성','춘천교구'));
        res.appendChild(makeRow('경남 고성','마산교구'));
      }
      return;
    }
  }

  const matched=SEARCH_DB.filter(i=>{
    const aliases=i.aliases||[i.k];
    return aliases.some(alias=>alias.replace(/\s+/g,'')===q);
  });

  const results=matched.length?matched:SEARCH_DB.filter(i=>{
    const aliases=i.aliases||[i.k];
    return aliases.some(alias=>{
      const af=alias.replace(/\s+/g,'');
      return af.includes(q)&&q.length>=2;
    });
  });

  if(!results.length){res.innerHTML=`<div class="se">"${raw}"을 찾을 수 없습니다</div>`;return;}
  const seen=new Set();
  const u=results.filter(i=>{const k=i.k+'|'+i.d;if(seen.has(k))return false;seen.add(k);return true;});
  res.innerHTML='';
  u.slice(0,20).forEach(function(i){
    const m=DIOCESE_META[i.d];if(!m)return;
    res.appendChild(makeRow(i.display||i.k, i.d));
  });
  if(u.length>20){const more=document.createElement('div');more.className='se';more.style.fontSize='11px';more.style.padding='10px 0';more.textContent='상위 20건만 표시';res.appendChild(more);}
}
document.getElementById('si').addEventListener('keydown',e=>{
  if(e.key==='Enter'){
    doSearch();
    try{e.target.blur();document.activeElement&&document.activeElement.blur();}catch(_){}
  }
});
document.addEventListener('click',function(e){
  var a=document.activeElement;
  if(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && e.target!==a){
    try{a.blur();}catch(_){}
  }
},true);

window.addEventListener('pageshow',function(){
});
(function(){
  var SWIPE_TABS=['gwangu','list','search'];
  var sx=0,sy=0,sMoving=false,sLocked=false;
  var THRESHOLD=60;
  function addSwipe(el){
    el.addEventListener('touchstart',function(e){
      sx=e.touches[0].clientX;sy=e.touches[0].clientY;sMoving=false;sLocked=false;
    },{passive:true});
    el.addEventListener('touchmove',function(e){
      if(sLocked)return;
      var dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;
      if(Math.abs(dx)>8||Math.abs(dy)>8){
        sLocked=true;
        var a=Math.abs(Math.atan2(dy,dx)*180/Math.PI);
        sMoving=(a<28||a>152);
      }
    },{passive:true});
    el.addEventListener('touchend',function(e){
      if(!sMoving)return;
      var dx=e.changedTouches[0].clientX-sx;
      if(Math.abs(dx)<THRESHOLD)return;
      var cur=document.querySelector('[data-tab].on');
      if(!cur)return;
      var idx=SWIPE_TABS.indexOf(cur.dataset.tab);
      if(idx<0)return;
      var next=dx<0?Math.min(idx+1,SWIPE_TABS.length-1):Math.max(idx-1,0);
      if(next===idx)return;
      document.querySelector('.tab[data-tab="'+SWIPE_TABS[next]+'"]').click();
    },{passive:true});
  }
  addSwipe(document.getElementById('list-view'));
  addSwipe(document.getElementById('search-view'));
})();
