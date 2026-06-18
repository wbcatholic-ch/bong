(function(){
  'use strict';
  if(window.__OAI_NEW_BACK_CONTROLLER__) return;
  window.__OAI_NEW_BACK_CONTROLLER__ = true;
  window.__BACK_CTRL__ = true;
  window.__OAI_FULL_BACK_CTRL_ACTIVE__ = true;

  var state={stage:'V7-0-4-BACK-EVENT-DIAG-CHECK',currentBase:'cover',currentLayer:'',currentContent:'',currentModal:'',lastReason:''};
  var restoring=false;

  function diag(k){ try{ if(typeof window.oaiBackDiagInc === 'function') window.oaiBackDiagInc(k); }catch(_e){} }
  function href(){ try{ return location.href.split('#')[0]; }catch(_e){ return location.href; } }

  function arm(reason, opts){
    try{
      diag('ARM');
      opts=opts||{};
      var st=history.state||{};
      if(!opts.force && st && st.oai_back_stage1===1) return true;
      history.replaceState({oai_back_stage1_root:1,reason:reason||'stage1-root'},'',href());
      history.pushState({oai_back_stage1:1,reason:reason||'stage1-guard'},'',href());
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return true; }
  }

  function setState(next){
    try{ next=next||{}; Object.keys(next).forEach(function(k){ state[k]=next[k]; }); }
    catch(e){ console.warn('[가톨릭길동무]', e); }
  }

  function getState(){
    return {stage:state.stage,currentBase:state.currentBase,currentLayer:state.currentLayer,currentContent:state.currentContent,currentModal:state.currentModal,lastReason:state.lastReason};
  }

  function restoreGuard(reason){
    try{
      diag('REC');
      if(restoring) return true;
      restoring=true;
      try{ history.go(1); }catch(_e){}
      setTimeout(function(){
        try{ arm((reason||'stage1')+'-rearm', {force:true}); }
        catch(e){ console.warn('[가톨릭길동무]', e); }
        restoring=false;
      }, 60);
      return true;
    }catch(e){
      restoring=false;
      try{ arm((reason||'stage1')+'-fallback', {force:true}); }catch(_e){}
      console.warn('[가톨릭길동무]', e);
      return true;
    }
  }

  function handleBack(reason){
    try{
      state.lastReason=reason||'back';
      return restoreGuard(state.lastReason);
    }catch(e){ console.warn('[가톨릭길동무]', e); return true; }
  }

  function enterCover(reason){
    try{
      setState({currentBase:'cover', currentLayer:'', currentContent:'', currentModal:''});
      arm(reason||'enter-cover', {force:true});
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return true; }
  }

  window.OAI_BACK={arm:arm,handleBack:handleBack,enterCover:enterCover,setState:setState,getState:getState};
  window.oaiArmBackBlocker=function(reason, force){ return arm(reason||'compat-arm', {force:!!force}); };
  window.__oaiArmEarlyCoverBackGuard=window.oaiArmBackBlocker;
  window._oaiArmCoverBackTrap=function(reason){ return arm(reason||'legacy-arm-ignored', {force:true}); };
  window._oaiSuppressNextCoverBackToast=function(){};

  window.addEventListener('popstate', function(e){
    diag('POP');
    try{ if(e&&e.preventDefault)e.preventDefault(); if(e&&e.stopImmediatePropagation)e.stopImmediatePropagation(); else if(e&&e.stopPropagation)e.stopPropagation(); }catch(_e){}
    handleBack('popstate');
  }, true);

  document.addEventListener('backbutton', function(e){
    diag('HW');
    try{ if(e&&e.preventDefault)e.preventDefault(); if(e&&e.stopImmediatePropagation)e.stopImmediatePropagation(); else if(e&&e.stopPropagation)e.stopPropagation(); }catch(_e){}
    handleBack('hardware-back');
  }, true);

  window.addEventListener('pageshow', function(){ arm('pageshow', {force:true}); }, true);
  window.addEventListener('focus', function(){ setTimeout(function(){ arm('focus', {force:true}); }, 0); }, true);
  diag('CTRL');
  enterCover('init-cover');
})();
