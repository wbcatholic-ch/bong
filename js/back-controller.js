(function(){
  'use strict';
  if(window.__OAI_NEW_BACK_CONTROLLER__) return;
  window.__OAI_NEW_BACK_CONTROLLER__ = true;
  window.__BACK_CTRL__ = true;
  window.__OAI_FULL_BACK_CTRL_ACTIVE__ = false;
  var state={stage:'stage1-skeleton',currentBase:'cover',currentLayer:'',currentContent:'',currentModal:'',lastReason:''};
  function href(){ try{ return location.href.split('#')[0]; }catch(_e){ return location.href; } }
  function arm(reason, opts){ try{ opts=opts||{}; var st=history.state||{}; if(!opts.force&&st&&st.oai_back_stage1===1) return; history.replaceState({oai_back_stage1_root:1,reason:reason||'stage1-root'},'',href()); history.pushState({oai_back_stage1:1,reason:reason||'stage1-trap'},'',href()); }catch(e){ console.warn('[가톨릭길동무]', e); } }
  function setState(next){ try{ next=next||{}; Object.keys(next).forEach(function(k){ state[k]=next[k]; }); }catch(e){ console.warn('[가톨릭길동무]', e); } }
  function getState(){ return {stage:state.stage,currentBase:state.currentBase,currentLayer:state.currentLayer,currentContent:state.currentContent,currentModal:state.currentModal,lastReason:state.lastReason}; }
  function handleBack(reason){ try{ state.lastReason=reason||'back'; arm('stage1-handle-back', {force:true}); return true; }catch(e){ console.warn('[가톨릭길동무]', e); return true; } }
  function enterCover(reason){ try{ setState({currentBase:'cover', currentLayer:'', currentContent:'', currentModal:''}); arm(reason||'enter-cover', {force:true}); return true; }catch(e){ console.warn('[가톨릭길동무]', e); return true; } }
  window.OAI_BACK={arm:arm,handleBack:handleBack,enterCover:enterCover,setState:setState,getState:getState};
  window.oaiArmBackBlocker=arm;
  window.__oaiArmEarlyCoverBackGuard=arm;
  window._oaiArmCoverBackTrap=function(){ arm('legacy-arm-ignored'); };
  window._oaiSuppressNextCoverBackToast=function(){};
  window.addEventListener('popstate', function(e){ try{ if(e&&e.preventDefault)e.preventDefault(); if(e&&e.stopImmediatePropagation)e.stopImmediatePropagation(); else if(e&&e.stopPropagation)e.stopPropagation(); }catch(_e){} handleBack('popstate'); }, true);
  document.addEventListener('backbutton', function(e){ try{ if(e&&e.preventDefault)e.preventDefault(); if(e&&e.stopImmediatePropagation)e.stopImmediatePropagation(); else if(e&&e.stopPropagation)e.stopPropagation(); }catch(_e){} handleBack('hardware-back'); }, true);
  window.addEventListener('pageshow', function(){ arm('pageshow'); }, true);
  window.addEventListener('focus', function(){ setTimeout(function(){ arm('focus'); }, 0); }, true);
  enterCover('init-cover');
})();
