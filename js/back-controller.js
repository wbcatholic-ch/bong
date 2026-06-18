(function(){
  'use strict';
  if(window.__GDM_STEP1_BACK_CONTROLLER__) return;
  window.__GDM_STEP1_BACK_CONTROLLER__ = true;
  var VERSION = 'V8-1-2-STEP1-COVER-BACK-CHECK';
  var GUARD_HASH = '#gdm-back-step1';
  var busy = false;
  var lastHandledAt = 0;
  var exitReady = false;
  var exitTimer = 0;
  function baseUrl(){ try{ return location.href.split('#')[0]; }catch(_e){ return location.href; } }
  function guardUrl(){ return baseUrl() + GUARD_HASH; }
  function arm(reason){
    try{
      history.replaceState({gdm_back_root:1, version:VERSION, reason:reason||'root'}, '', baseUrl());
      history.pushState({gdm_back_guard:1, version:VERSION, reason:reason||'guard'}, '', guardUrl());
    }catch(e){ try{ console.warn('[가톨릭길동무]', e); }catch(_e){} }
    return true;
  }
  function stop(e){
    try{
      if(e && e.preventDefault) e.preventDefault();
      if(e && e.stopImmediatePropagation) e.stopImmediatePropagation();
      else if(e && e.stopPropagation) e.stopPropagation();
    }catch(_e){}
  }
  function isCoverVisible(){
    try{
      var cover = document.getElementById('cover');
      if(!cover) return false;
      var html = document.documentElement;
      if(html && html.classList && html.classList.contains('app-active')) return false;
      var cs = window.getComputedStyle ? getComputedStyle(cover) : null;
      if(cs && (cs.display === 'none' || cs.visibility === 'hidden')) return false;
      return true;
    }catch(_e){ return false; }
  }
  function clearToast(){
    try{ clearTimeout(exitTimer); }catch(_e){}
    exitTimer = 0;
    try{ var t = document.getElementById('_bt'); if(t) t.remove(); }catch(_e){}
  }
  function showExitToast(){
    try{
      clearToast();
      exitReady = true;
      var t = document.createElement('div');
      t.id = '_bt';
      t.textContent = '한 번 더 누르면 앱이 종료됩니다';
      t.style.cssText = 'position:fixed;top:50%;left:50%;bottom:auto;transform:translate(-50%,-50%);background:rgba(14,21,53,.94);color:#fff;padding:12px 24px;border-radius:24px;font-size:14px;font-weight:800;z-index:99999;white-space:nowrap;pointer-events:none;box-shadow:0 14px 36px rgba(0,0,0,.32);';
      document.body.appendChild(t);
      exitTimer = setTimeout(function(){ exitReady = false; clearToast(); }, 2500);
    }catch(e){ try{ console.warn('[가톨릭길동무]', e); }catch(_e){} }
  }
  function exitApp(){
    try{
      exitReady = false;
      clearToast();
      try{ window._appExiting = true; }catch(_e){}
      try{ history.replaceState({gdm_back_exit:1, version:VERSION}, '', baseUrl()); }catch(_e){}
      setTimeout(function(){ try{ history.back(); }catch(_e){} }, 40);
    }catch(e){ try{ console.warn('[가톨릭길동무]', e); }catch(_e){} }
    return true;
  }
  function consumeNonCover(reason){
    try{
      exitReady = false;
      clearToast();
      if(busy) return true;
      busy = true;
      setTimeout(function(){ arm(reason || 'non-cover'); busy = false; }, 30);
    }catch(e){ busy=false; try{ arm('non-cover-fallback'); }catch(_e){} }
    return true;
  }
  function handleBack(reason){
    var now = Date.now ? Date.now() : (new Date()).getTime();
    if(now - lastHandledAt < 280) return true;
    lastHandledAt = now;
    if(isCoverVisible()){
      if(exitReady) return exitApp();
      showExitToast();
      arm(reason || 'cover-first-back');
      return true;
    }
    return consumeNonCover(reason || 'back');
  }
  function onBack(e, reason){ stop(e); handleBack(reason); return false; }
  window.OAI_BACK = {
    version: VERSION,
    arm: function(reason){ return arm(reason || 'api-arm'); },
    handleBack: function(reason){ return handleBack(reason || 'api-back'); },
    setState: function(){},
    getState: function(){ return {version:VERSION, step:'cover-only'}; },
    enterCover: function(reason){ return arm(reason || 'enter-cover'); }
  };
  window.addEventListener('popstate', function(e){ return onBack(e, 'popstate'); }, true);
  window.addEventListener('hashchange', function(e){ return onBack(e, 'hashchange'); }, true);
  document.addEventListener('backbutton', function(e){ return onBack(e, 'hardware-back'); }, true);
  window.addEventListener('pageshow', function(){ arm('pageshow'); }, true);
  window.addEventListener('focus', function(){ setTimeout(function(){ arm('focus'); }, 0); }, true);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) arm('visible'); }, true);
  arm('init');
})();
