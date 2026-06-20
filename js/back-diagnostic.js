
(function(){
  'use strict';
  if(window.__OAI_BACK_DIAG__) return;
  window.__OAI_BACK_DIAG__ = true;
  window.__OAI_BACK_DIAG_BLOCK_EXIT__ = true;
  var expanded = false;
  var logs = [];

  function now(){
    try{ return new Date().toLocaleTimeString('ko-KR', {hour12:false}); }catch(_e){ return String(Date.now ? Date.now() : new Date().getTime()); }
  }
  function $(id){ return document.getElementById(id); }
  function coverVisible(){
    try{
      if(typeof window._isCoverScreenVisible === 'function') return !!window._isCoverScreenVisible();
      var c=$('cover'); if(!c) return false;
      var st=getComputedStyle(c);
      return st.display !== 'none' && st.visibility !== 'hidden';
    }catch(_e){ return false; }
  }
  function myFaithOpen(){ try{ return !!document.querySelector('.my-diocese-modal.show'); }catch(_e){ return false; } }
  function appActive(){
    try{ if(typeof window._isAppScreenActive === 'function') return !!window._isAppScreenActive(); }catch(_e){}
    try{ return document.documentElement.classList.contains('app-active'); }catch(_e){ return false; }
  }
  function exitArmed(){
    try{
      var until = Number(window.__oaiCoverExitUntil || sessionStorage.getItem('oai_cover_exit_armed_until') || 0);
      return !!(until && Date.now && Date.now() < until);
    }catch(_e){ return false; }
  }
  function stateText(){
    var st=null; try{ st=history.state; }catch(_e){}
    var forceUntil=0; try{ forceUntil=Number(window.__oaiForceNextCoverBackToastUntil || sessionStorage.getItem('oai_force_next_cover_back_toast_until') || 0); }catch(_e){}
    return 'state=' + JSON.stringify(st) +
      ' | cover=' + coverVisible() +
      ' | app=' + appActive() +
      ' | myFaith=' + myFaithOpen() +
      ' | exitReady=' + !!window._exitReady +
      ' | armed=' + exitArmed() +
      ' | force=' + (!!(forceUntil && Date.now && Date.now() < forceUntil));
  }
  function createPanel(){
    var el = $('oai-back-diag');
    if(el) return el;
    el = document.createElement('div');
    el.id='oai-back-diag';
    el.style.cssText='position:fixed;right:8px;bottom:8px;z-index:2147483646;font:11px/1.35 monospace;color:#fff;pointer-events:auto;';
    el.innerHTML = '<button type="button" id="oai-back-diag-toggle" style="border:2px solid #f7c948;background:rgba(10,14,30,.96);color:#fff;border-radius:999px;padding:7px 10px;font-weight:900;font-size:11px;box-shadow:0 8px 18px rgba(0,0,0,.28);">BACK DIAG</button><div id="oai-back-diag-body" style="display:none;margin-top:6px;width:min(92vw,380px);max-height:38vh;overflow:auto;background:rgba(10,14,30,.96);border:2px solid #f7c948;border-radius:12px;padding:8px 10px;white-space:pre-wrap;box-shadow:0 12px 30px rgba(0,0,0,.35);"></div>';
    document.body.appendChild(el);
    var btn=$('oai-back-diag-toggle');
    if(btn){
      btn.addEventListener('click', function(e){
        if(e && e.preventDefault) e.preventDefault();
        expanded = !expanded;
        render();
      });
    }
    return el;
  }
  function render(){
    createPanel();
    var body=$('oai-back-diag-body');
    var btn=$('oai-back-diag-toggle');
    if(btn) btn.textContent = expanded ? 'BACK DIAG 닫기' : 'BACK DIAG';
    if(body){
      body.style.display = expanded ? 'block' : 'none';
      body.textContent = '앱 종료 차단 중 · 최신 로그 위\n\n' + logs.join('\n\n');
    }
  }
  function log(msg){
    try{
      var line='['+now()+'] '+msg+'\n'+stateText();
      logs.unshift(line);
      logs = logs.slice(0, 24);
      try{ sessionStorage.setItem('oai_back_diag_last', JSON.stringify(logs)); }catch(_e){}
      createPanel();
      if(expanded) render();
      console.warn('[BACK-DIAG]', line);
    }catch(e){ try{ console.warn('[BACK-DIAG-ERR]', e); }catch(_e){} }
  }
  function loadOld(){
    try{
      var old=sessionStorage.getItem('oai_back_diag_last');
      if(old){
        var arr=JSON.parse(old);
        if(Array.isArray(arr)) logs=arr.slice(0,24);
      }
    }catch(_e){}
  }
  function install(){
    loadOld();
    createPanel();
    log('DIAG loaded compact');
    window.addEventListener('popstate', function(){ log('EVENT popstate capture'); }, true);
    window.addEventListener('popstate', function(){ setTimeout(function(){ log('EVENT popstate bubble after'); }, 0); }, false);
    document.addEventListener('backbutton', function(){ log('EVENT backbutton capture'); }, true);
    document.addEventListener('backbutton', function(){ setTimeout(function(){ log('EVENT backbutton bubble after'); }, 0); }, false);
    var wrapTry=0;
    function wrap(){
      wrapTry++;
      if(typeof window._showBackToast === 'function' && !window._showBackToast.__diagWrapped){
        var origToast=window._showBackToast;
        var wrappedToast=function(){ log('CALL _showBackToast before'); var res=origToast.apply(this, arguments); log('CALL _showBackToast after result='+res); return res; };
        wrappedToast.__diagWrapped=true;
        window._showBackToast=wrappedToast;
        log('wrapped _showBackToast');
      }
      if(typeof window.doExit === 'function' && !window.doExit.__diagWrapped){
        var origExit=window.doExit;
        var wrappedExit=function(){
          log('CALL doExit BLOCKED');
          expanded=true; render();
          if(!window.__OAI_BACK_DIAG_BLOCK_EXIT__) return origExit.apply(this, arguments);
          return false;
        };
        wrappedExit.__diagWrapped=true;
        window.doExit=wrappedExit;
        log('wrapped doExit');
      }
      if(wrapTry<40 && (!(window._showBackToast&&window._showBackToast.__diagWrapped)||!(window.doExit&&window.doExit.__diagWrapped))) setTimeout(wrap,250);
    }
    wrap();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();
})();
