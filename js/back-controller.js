(function(){
  'use strict';
  if(window.__OAI_NO_BACK_CENTRAL__) return;
  window.__OAI_NO_BACK_CENTRAL__ = true;
  window.__BACK_CTRL__ = true;
  window.__OAI_FULL_BACK_CTRL_ACTIVE__ = true;

  var stage = 'V8-0-NO-BACK-X-ONLY-CENTRAL-CHECK';
  var guardHash = '#oai-back-guard';
  var rearming = false;
  var state = {stage:stage, mode:'no-back', currentBase:'', currentLayer:'', currentContent:'', currentModal:''};

  function baseHref(){
    try{ return location.href.split('#')[0]; }
    catch(_e){ return location.href; }
  }
  function guardHref(){ return baseHref() + guardHash; }

  function setState(next){
    try{
      next = next || {};
      Object.keys(next).forEach(function(k){ state[k] = next[k]; });
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }

  function getState(){
    return {
      stage:state.stage,
      mode:state.mode,
      currentBase:state.currentBase,
      currentLayer:state.currentLayer,
      currentContent:state.currentContent,
      currentModal:state.currentModal
    };
  }

  function arm(reason, opts){
    try{
      opts = opts || {};
      if(!opts.force && location.hash === guardHash) return true;
      history.replaceState({oai_no_back_root:1, reason:reason||'no-back-root'}, '', baseHref());
      history.pushState({oai_no_back_guard:1, reason:reason||'no-back-guard'}, '', guardHref());
      return true;
    }catch(e){
      console.warn('[가톨릭길동무]', e);
      return true;
    }
  }

  function consume(reason){
    try{
      if(rearming) return true;
      rearming = true;
      setTimeout(function(){
        try{ arm((reason||'no-back')+'-rearm', {force:true}); }
        catch(e){ console.warn('[가톨릭길동무]', e); }
        rearming = false;
      }, 30);
      return true;
    }catch(e){
      rearming = false;
      try{ arm((reason||'no-back')+'-fallback', {force:true}); }catch(_e){}
      console.warn('[가톨릭길동무]', e);
      return true;
    }
  }

  function handleBack(reason){
    return consume(reason || 'back');
  }

  function stopEvent(e){
    try{
      if(e && e.preventDefault) e.preventDefault();
      if(e && e.stopImmediatePropagation) e.stopImmediatePropagation();
      else if(e && e.stopPropagation) e.stopPropagation();
    }catch(_e){}
  }

  function onBackEvent(e, reason){
    stopEvent(e);
    handleBack(reason);
    return false;
  }

  window.OAI_BACK = {
    arm: arm,
    handleBack: handleBack,
    setState: setState,
    getState: getState,
    enterCover: function(reason){ setState({currentBase:'cover', currentLayer:'', currentContent:'', currentModal:''}); return arm(reason||'enter-cover', {force:true}); }
  };

  window.oaiArmBackBlocker = function(reason, force){ return arm(reason||'compat-arm', {force:!!force}); };
  window.__oaiArmEarlyCoverBackGuard = window.oaiArmBackBlocker;
  window._oaiArmCoverBackTrap = function(reason){ return arm(reason||'legacy-cover-arm', {force:true}); };
  window._oaiSuppressNextCoverBackToast = function(){};
  window._ensureCoverBackTrap = function(reason){ return arm(reason||'ensure-cover-ignored', {force:true}); };
  window._resetCoverBackTrap = function(reason){ return arm(reason||'reset-cover-ignored', {force:true}); };
  window._ensureAppBackTrap = function(reason){ return arm(reason||'ensure-app-ignored', {force:true}); };
  window._resetAppBackTrap = function(reason){ return arm(reason||'reset-app-ignored', {force:true}); };
  window._forceNextCoverBackToast = function(){};

  window.addEventListener('popstate', function(e){ return onBackEvent(e, 'popstate'); }, true);
  window.addEventListener('hashchange', function(e){ return onBackEvent(e, 'hashchange'); }, true);
  document.addEventListener('backbutton', function(e){ return onBackEvent(e, 'hardware-back'); }, true);
  window.addEventListener('pageshow', function(){ arm('pageshow', {force:true}); }, true);
  window.addEventListener('focus', function(){ setTimeout(function(){ arm('focus', {force:true}); }, 0); }, true);

  try{ localStorage.removeItem('oai_back_diag_v704'); localStorage.removeItem('oai_back_diag_v705'); }catch(_e){}
  arm('init', {force:true});
})();
