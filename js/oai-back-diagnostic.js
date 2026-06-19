(function(){
  'use strict';
  var VERSION = 'V8-1-14-14-MYFAITH-EXIT-GATE-DIOCESE-STICKY';
  var KEY = 'oai_back_diag_logs_v1';
  var MAX = 120;
  var panel = null;
  var lastTap = 0, tapCount = 0;
  function now(){
    try{ return new Date().toLocaleTimeString('ko-KR',{hour12:false}) + '.' + String(Date.now()%1000).padStart(3,'0'); }
    catch(_e){ return String(Date.now()); }
  }
  function safeJSON(v){
    try{ return JSON.stringify(v); }catch(_e){ return String(v); }
  }
  function ss(k){ try{ return sessionStorage.getItem(k) || ''; }catch(_e){ return ''; } }
  function lsGet(){
    try{ var a=JSON.parse(localStorage.getItem(KEY)||'[]'); return Array.isArray(a)?a:[]; }catch(_e){ return []; }
  }
  function lsSet(a){ try{ localStorage.setItem(KEY, JSON.stringify(a.slice(-MAX))); }catch(_e){} }
  function visible(el){
    try{
      if(!el) return false;
      var st=getComputedStyle(el);
      return st.display !== 'none' && st.visibility !== 'hidden' && st.opacity !== '0';
    }catch(_e){ return !!el; }
  }
  function q(sel){ try{ return document.querySelector(sel); }catch(_e){ return null; } }
  function qa(sel){ try{ return Array.prototype.slice.call(document.querySelectorAll(sel)); }catch(_e){ return []; } }
  function names(nodes){
    return nodes.map(function(n){ return (n.id?('#'+n.id):n.tagName) + (n.className?('.'+String(n.className).trim().replace(/\s+/g,'.')):''); }).slice(0,8).join(',');
  }
  function state(){
    var cover=q('#cover');
    var html=document.documentElement;
    return {
      ver:VERSION,
      loc:(location.pathname||'')+(location.search||'')+(location.hash||''),
      hState:safeJSON(history.state||null).slice(0,220),
      htmlCls:html ? String(html.className||'').slice(0,180) : '',
      bodyCls:document.body ? String(document.body.className||'').slice(0,120) : '',
      cover:visible(cover),
      appActive: !!(html && html.classList && html.classList.contains('app-active')),
      myFaith: !!q('#my-diocese-modal.show'),
      qna: !!q('#qna-view.open'),
      privacy: !!q('#privacy-policy-modal.show'),
      guide: !!q('#guide-manual-modal.show'),
      openViews:names(qa('.module-view.open,.modal.show,.my-diocese-modal.show,.cover-menu-panel.show')),
      forceToast:ss('oai_force_next_cover_back_toast_until'),
      exitArmed:ss('oai_cover_exit_armed_until'),
      hardExit:ss('oai_cover_exit_hard_on_next_back'),
      coverReturn:ss('oai_return_to_cover_reason') || ss('oai_cover_toast_on_return') || ss('oai_myfaith_return_cover_reason')
    };
  }
  function line(ev, extra){
    var st=state();
    var bits=[now(), ev];
    if(extra) bits.push(extra);
    bits.push('cover='+st.cover,'app='+st.appActive,'myfaith='+st.myFaith,'qna='+st.qna,'guide='+st.guide,'privacy='+st.privacy);
    if(st.openViews) bits.push('open=['+st.openViews+']');
    if(st.forceToast) bits.push('forceToast='+st.forceToast);
    if(st.exitArmed) bits.push('armed='+st.exitArmed);
    if(st.coverReturn) bits.push('return='+st.coverReturn);
    bits.push('state='+st.hState);
    return bits.join(' | ');
  }
  function render(){
    if(!panel) return;
    var box=panel.querySelector('.oai-back-diag-lines');
    if(!box) return;
    var a=lsGet();
    box.textContent=a.slice(-70).join('\n');
    box.scrollTop=box.scrollHeight;
  }
  function log(ev, extra){
    var l=line(ev, extra||'');
    var a=lsGet(); a.push(l); lsSet(a);
    try{ console.log('[OAI-BACK-DIAG]', l); }catch(_e){}
    render();
  }
  window.oaiBackDiagLog = log;
  function ensurePanel(){
    if(panel) return panel;
    var css=document.createElement('style');
    css.textContent='\
#oai-back-diag-panel{position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483600;background:rgba(15,23,42,.96);color:#f8fafc;border:2px solid #d4aa6a;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.38);font-family:monospace;font-size:11px;line-height:1.35;max-height:58vh;display:none;overflow:hidden;}\
#oai-back-diag-panel.show{display:block;}\
#oai-back-diag-panel .oai-back-diag-head{display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid rgba(212,170,106,.45);font-family:sans-serif;font-size:13px;font-weight:800;}\
#oai-back-diag-panel .oai-back-diag-head span{flex:1;}\
#oai-back-diag-panel button{border:1px solid rgba(212,170,106,.8);background:#fff;color:#111827;border-radius:8px;font-size:12px;font-weight:800;padding:5px 8px;}\
#oai-back-diag-panel .oai-back-diag-lines{white-space:pre-wrap;overflow:auto;max-height:46vh;padding:8px 10px;}\
';
    document.head.appendChild(css);
    panel=document.createElement('div');
    panel.id='oai-back-diag-panel';
    panel.innerHTML='<div class="oai-back-diag-head"><span>Back 진단 '+VERSION+'</span><button type="button" data-oai-diag-copy>복사</button><button type="button" data-oai-diag-clear>지우기</button><button type="button" data-oai-diag-close>닫기</button></div><div class="oai-back-diag-lines"></div>';
    document.body.appendChild(panel);
    panel.addEventListener('click',function(e){
      var t=e.target;
      if(t && t.hasAttribute('data-oai-diag-close')) panel.classList.remove('show');
      if(t && t.hasAttribute('data-oai-diag-clear')){ lsSet([]); log('diag-clear'); render(); }
      if(t && t.hasAttribute('data-oai-diag-copy')){
        try{ navigator.clipboard.writeText(lsGet().join('\n')); log('diag-copy-ok'); }
        catch(_e){ log('diag-copy-fail'); }
      }
    });
    render();
    return panel;
  }
  window.oaiShowBackDiag = function(){ ensurePanel().classList.add('show'); render(); log('diag-open'); };
  function installWrap(name){
    try{
      var fn=window[name];
      if(typeof fn !== 'function' || fn.__oaiBackDiagWrapped) return;
      var wrapped=function(){
        log('CALL '+name, safeJSON(Array.prototype.slice.call(arguments)).slice(0,160));
        return fn.apply(this, arguments);
      };
      wrapped.__oaiBackDiagWrapped=true;
      window[name]=wrapped;
      log('wrap', name);
    }catch(_e){}
  }
  function installWraps(){
    ['_showBackToast','doExit','attemptAppExit','_forceNextCoverBackToast','_oaiArmCoverBackTrap','_resetCoverExitReady','_clearCoverExitArmed','closeMyFaithLifeModal'].forEach(installWrap);
  }
  window.addEventListener('popstate',function(e){ log('EVENT popstate', safeJSON(e.state||null).slice(0,180)); }, true);
  document.addEventListener('backbutton',function(e){ log('EVENT backbutton', e && e.defaultPrevented ? 'defaultPrevented' : ''); }, true);
  window.addEventListener('pageshow',function(e){ log('EVENT pageshow', e && e.persisted ? 'persisted' : ''); setTimeout(installWraps,0); }, true);
  window.addEventListener('focus',function(){ log('EVENT focus'); setTimeout(installWraps,0); }, true);
  document.addEventListener('visibilitychange',function(){ log('EVENT visibilitychange', document.visibilityState||''); }, true);
  document.addEventListener('click',function(e){
    var t=e.target && e.target.closest ? e.target.closest('button,a,[role="button"]') : e.target;
    if(!t) return;
    var id=t.id||'';
    if(id==='cover-version-label'){
      var n=Date.now(); tapCount=(n-lastTap<1600)?(tapCount+1):1; lastTap=n;
      if(tapCount>=5){ tapCount=0; window.oaiShowBackDiag(); }
    }
    if(id==='cover-diocese-btn' || id==='my-diocese-close' || id==='qna-close-btn' || id==='cover-menu-qna-btn' || id==='cover-menu-privacy-btn'){
      log('CLICK '+id);
    }
    if(t.closest && t.closest('#my-diocese-modal')){
      log('CLICK myfaith-inside', id || (t.textContent||'').trim().slice(0,30));
    }
  }, true);
  setTimeout(function(){ ensurePanel(); installWraps(); log('diag-ready'); }, 300);
  setTimeout(installWraps, 1200);
  setTimeout(installWraps, 3000);
})();
