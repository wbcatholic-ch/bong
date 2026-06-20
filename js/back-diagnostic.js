
(function(){
  'use strict';
  if(window.__OAI_BACK_DIAG__) return;
  window.__OAI_BACK_DIAG__ = true;
  window.__OAI_BACK_DIAG_BLOCK_EXIT__ = true;

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
  function myFaithOpen(){
    try{ return !!document.querySelector('.my-diocese-modal.show'); }catch(_e){ return false; }
  }
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
    var st = null;
    try{ st = history.state; }catch(_e){}
    var forceUntil = 0;
    try{ forceUntil = Number(window.__oaiForceNextCoverBackToastUntil || sessionStorage.getItem('oai_force_next_cover_back_toast_until') || 0); }catch(_e){}
    return 'state=' + JSON.stringify(st) +
      ' | cover=' + coverVisible() +
      ' | app=' + appActive() +
      ' | myFaith=' + myFaithOpen() +
      ' | exitReady=' + !!window._exitReady +
      ' | armed=' + exitArmed() +
      ' | force=' + (!!(forceUntil && Date.now && Date.now() < forceUntil));
  }
  function box(){
    var el = $('oai-back-diag');
    if(el) return el;
    el = document.createElement('div');
    el.id = 'oai-back-diag';
    el.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483646;max-height:46vh;overflow:auto;background:rgba(10,14,30,.94);color:#fff;border:2px solid #f7c948;border-radius:12px;padding:8px 10px;font:11px/1.35 monospace;white-space:pre-wrap;box-shadow:0 12px 30px rgba(0,0,0,.35);';
    el.innerHTML = '<b>BACK DIAG</b> · 앱 종료 차단 중\n';
    document.body.appendChild(el);
    return el;
  }
  function log(msg){
    try{
      var line = '[' + now() + '] ' + msg + '\n' + stateText();
      var el = box();
      el.textContent = 'BACK DIAG · 앱 종료 차단 중\n' + line + '\n\n' + el.textContent.replace(/^BACK DIAG[^\n]*\n/, '').slice(0, 3500);
      try{ sessionStorage.setItem('oai_back_diag_last', el.textContent); }catch(_e){}
      console.warn('[BACK-DIAG]', line);
    }catch(e){ try{ console.warn('[BACK-DIAG-ERR]', e); }catch(_e){} }
  }

  function install(){
    try{
      var old = sessionStorage.getItem('oai_back_diag_last');
      box();
      if(old) $('oai-back-diag').textContent = old;
    }catch(_e){}
    log('DIAG loaded');

    window.addEventListener('popstate', function(){ log('EVENT popstate capture'); }, true);
    window.addEventListener('popstate', function(){ setTimeout(function(){ log('EVENT popstate bubble after'); }, 0); }, false);
    document.addEventListener('backbutton', function(){ log('EVENT backbutton capture'); }, true);
    document.addEventListener('backbutton', function(){ setTimeout(function(){ log('EVENT backbutton bubble after'); }, 0); }, false);

    var wrapTry = 0;
    function wrap(){
      wrapTry++;
      if(typeof window._showBackToast === 'function' && !window._showBackToast.__diagWrapped){
        var origToast = window._showBackToast;
        var wrappedToast = function(){
          log('CALL _showBackToast before');
          var res = origToast.apply(this, arguments);
          log('CALL _showBackToast after result=' + res);
          return res;
        };
        wrappedToast.__diagWrapped = true;
        window._showBackToast = wrappedToast;
        log('wrapped _showBackToast');
      }
      if(typeof window.doExit === 'function' && !window.doExit.__diagWrapped){
        var origExit = window.doExit;
        var wrappedExit = function(){
          log('CALL doExit BLOCKED');
          if(!window.__OAI_BACK_DIAG_BLOCK_EXIT__) return origExit.apply(this, arguments);
          try{
            var warn = document.createElement('div');
            warn.textContent = '진단용: 앱 종료를 차단했습니다. 로그를 캡처해 주세요.';
            warn.style.cssText = 'position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:2147483647;background:#b91c1c;color:#fff;padding:10px 14px;border-radius:999px;font-weight:900;font-size:13px;box-shadow:0 10px 24px rgba(0,0,0,.25);';
            document.body.appendChild(warn);
            setTimeout(function(){ try{ warn.remove(); }catch(_e){} }, 2600);
          }catch(_e){}
          return false;
        };
        wrappedExit.__diagWrapped = true;
        window.doExit = wrappedExit;
        log('wrapped doExit');
      }
      if(wrapTry < 40 && (!(window._showBackToast && window._showBackToast.__diagWrapped) || !(window.doExit && window.doExit.__diagWrapped))){
        setTimeout(wrap, 250);
      }
    }
    wrap();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();
})();
