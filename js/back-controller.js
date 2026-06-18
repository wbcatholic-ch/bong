(function(){
  'use strict';
  if(window.__CGD_NEW_BACK_CTRL__) return;
  window.__CGD_NEW_BACK_CTRL__ = true;

  var armed = false;
  var seq = 1;
  var href = location.href.split('#')[0];
  var handling = false;

  function $(id){ return document.getElementById(id); }
  function warn(e){ try{ console.warn('[가톨릭길동무]', e); }catch(_e){} }
  function visible(el){
    try{
      if(!el) return false;
      if(el.classList && (el.classList.contains('open') || el.classList.contains('show'))) return true;
      var st = window.getComputedStyle ? window.getComputedStyle(el) : null;
      if(!st) return false;
      return st.display !== 'none' && st.visibility !== 'hidden' && Number(st.opacity || 1) !== 0;
    }catch(e){ return false; }
  }
  function coverVisible(){
    try{
      var cover = $('cover');
      if(!cover) return !document.documentElement.classList.contains('app-active');
      if(cover.classList && cover.classList.contains('hidden')) return false;
      var st = window.getComputedStyle ? window.getComputedStyle(cover) : null;
      if(st && (st.display === 'none' || st.visibility === 'hidden')) return false;
      return !document.documentElement.classList.contains('app-active');
    }catch(e){ return false; }
  }
  function appActive(){
    try{
      if(document.querySelector('#missa-view.open,#prayer-view.open,#qna-view.open,#web-view.open,#trail-view.open,#diocese-view.open,.module-view.open')) return true;
      return document.documentElement.classList.contains('app-active') && !coverVisible();
    }catch(e){ return false; }
  }
  function resetExitReady(){
    try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(e){ warn(e); }
    try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(e){ warn(e); }
  }

  var exitReadyUntil = 0;
  var exitToastTimer = 0;
  function clearExitToast(){
    try{
      clearTimeout(exitToastTimer);
      var old = document.getElementById('cgd-exit-toast') || document.getElementById('_bt');
      if(old && old.parentNode) old.parentNode.removeChild(old);
    }catch(e){ warn(e); }
  }
  function attemptExit(){
    try{ window._appExiting = true; }catch(e){ warn(e); }
    clearExitToast();
    exitReadyUntil = 0;
    try{ if(navigator.app && typeof navigator.app.exitApp === 'function'){ navigator.app.exitApp(); return; } }catch(e){ warn(e); }
    try{ window.open('', '_self'); window.close(); }catch(e){ warn(e); }
    try{ document.documentElement.classList.add('app-exiting'); }catch(e){ warn(e); }
    setTimeout(function(){ try{ history.back(); }catch(_e){} }, 30);
  }
  function showExitToast(){
    var now = Date.now ? Date.now() : new Date().getTime();
    if(exitReadyUntil && now < exitReadyUntil){ attemptExit(); return true; }
    exitReadyUntil = now + 2500;
    try{
      if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
      if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed();
    }catch(e){ warn(e); }
    function append(){
      try{
        clearExitToast();
        var t = document.createElement('div');
        t.id = 'cgd-exit-toast';
        t.textContent = '한 번 더 누르면 앱이 종료됩니다';
        t.style.cssText = 'position:fixed;top:50%;left:50%;bottom:auto;transform:translate(-50%,-50%);background:rgba(14,21,53,.94);color:#fff;padding:12px 24px;border-radius:24px;font-size:14px;font-weight:800;z-index:2147483600;white-space:nowrap;pointer-events:none;box-shadow:0 14px 36px rgba(0,0,0,.32);';
        document.body.appendChild(t);
        exitToastTimer = setTimeout(function(){ clearExitToast(); exitReadyUntil = 0; }, 2500);
      }catch(e){ warn(e); }
    }
    if(document.body) append();
    else document.addEventListener('DOMContentLoaded', append, {once:true});
    return false;
  }

  function arm(reason){
    try{
      href = location.href.split('#')[0];
      var st = history.state || null;
      if(st && st.cgd_back_trap && !reason) return;
      history.replaceState({cgd_root:true, reason:reason || 'root'}, '', href);
      history.pushState({cgd_back_trap:true, seq:seq++, reason:reason || 'trap'}, '', href);
      armed = true;
    }catch(e){ warn(e); }
  }
  function toCover(reason){
    try{ if(typeof window.goToCover === 'function') window.goToCover(); }catch(e){ warn(e); }
    try{ document.documentElement.classList.remove('app-active','parish-mode','retreat-mode'); }catch(e){ warn(e); }
    try{ var c=$('cover'); if(c){ c.style.display=''; c.style.opacity=''; c.style.pointerEvents=''; } }catch(e){ warn(e); }
    resetExitReady();
  }
  function closeRefreshDialog(){
    try{ var el=$('oai-refresh-content-dialog'); if(el && el.parentNode){ el.parentNode.removeChild(el); resetExitReady(); return true; } }catch(e){ warn(e); }
    return false;
  }
  function closeTopGuideOrMenu(){
    try{
      if(typeof window.isCoverMenuPopupOpen === 'function' && window.isCoverMenuPopupOpen()){
        if(typeof window.closeCoverMenuPopup === 'function') window.closeCoverMenuPopup();
        resetExitReady();
        return true;
      }
    }catch(e){ warn(e); }
    try{
      if(typeof window.isMyFaithLifeModalOpen === 'function' && window.isMyFaithLifeModalOpen()){
        if(typeof window.closeMyFaithLifeModal === 'function') window.closeMyFaithLifeModal();
        toCover('myfaith-modal');
        return true;
      }
    }catch(e){ warn(e); }
    try{
      var mq=$('mass-quick-modal');
      if(mq && mq.classList.contains('show')){
        if(typeof window.closeMassQuickMenu === 'function') window.closeMassQuickMenu();
        resetExitReady();
        return true;
      }
    }catch(e){ warn(e); }
    try{
      var shown = Array.prototype.slice.call(document.querySelectorAll('.guide-modal.show,.my-diocese-modal.show'));
      if(shown.length){
        shown.forEach(function(el){
          if(el.id === 'mass-quick-modal') return;
          el.classList.remove('show');
          el.setAttribute('aria-hidden','true');
        });
        toCover('guide-modal');
        return true;
      }
    }catch(e){ warn(e); }
    return false;
  }
  function closePrayer(){
    var view=$('prayer-view');
    if(!view || !view.classList.contains('open')) return false;
    try{
      var detail=$('prayer-detail');
      if(detail && detail.classList.contains('show')){
        if(typeof window.prCloseDetail === 'function') window.prCloseDetail({skipTrap:true});
        else detail.classList.remove('show');
        resetExitReady();
        return true;
      }
    }catch(e){ warn(e); }
    try{
      if(typeof window._closePrayerAndReturn === 'function') window._closePrayerAndReturn();
      else if(typeof window.closePrayerView === 'function') { window.closePrayerView(); toCover('prayer-close'); }
      else { view.classList.remove('open'); toCover('prayer-close'); }
      resetExitReady();
      return true;
    }catch(e){ warn(e); return false; }
  }
  function closeMissa(){
    var view=$('missa-view');
    if(!view || !view.classList.contains('open')) return false;
    try{
      if(typeof window.closeMissa === 'function') window.closeMissa();
      else { view.classList.remove('open'); toCover('missa-close'); }
      resetExitReady();
      return true;
    }catch(e){ warn(e); return false; }
  }
  function closeGeneralView(){
    try{
      var q=$('qna-view');
      if(q && q.classList.contains('open')){ q.classList.remove('open'); toCover('qna-close'); return true; }
      var w=$('web-view');
      if(w && w.classList.contains('open')){ w.classList.remove('open'); toCover('web-close'); return true; }
      var t=$('trail-view');
      if(t && t.classList.contains('open')){ t.classList.remove('open'); toCover('trail-close'); return true; }
      var d=$('diocese-view');
      if(d && d.classList.contains('open')){
        if(typeof window.closeDioceseView === 'function') window.closeDioceseView();
        else d.classList.remove('open');
        toCover('diocese-close');
        return true;
      }
    }catch(e){ warn(e); }
    return false;
  }
  function closeMapLayer(){
    var el;
    try{ el=$('route-choice-modal'); if(el && el.classList.contains('open')){ if(typeof window._closeInfoRouteChoice==='function') window._closeInfoRouteChoice(); else el.classList.remove('open'); return true; } }catch(e){ warn(e); }
    try{ el=$('srch-modal'); if(el && el.classList.contains('open')){ if(typeof window.closeSearchModal==='function') window.closeSearchModal(); else el.classList.remove('open'); return true; } }catch(e){ warn(e); }
    try{
      el=$('sheet-route');
      if(el && el.classList.contains('open')){ if(typeof window.resetRoute==='function') window.resetRoute(); el.classList.remove('open'); return true; }
    }catch(e){ warn(e); }
    try{ el=$('info-card'); if(el && el.classList.contains('open')){ if(typeof window.closeInfoCard==='function') window.closeInfoCard(); else { el.classList.remove('open'); el.style.display='none'; } return true; } }catch(e){ warn(e); }
    try{ var sh=document.querySelector('.trail-sheet.open'); if(sh){ sh.classList.remove('open'); return true; } }catch(e){ warn(e); }
    try{ var sheets=document.querySelectorAll('.sheet.open'); if(sheets.length){ sheets[sheets.length-1].classList.remove('open'); return true; } }catch(e){ warn(e); }
    return false;
  }
  function handleBack(source){
    if(handling) return;
    handling = true;
    try{
      if(closeRefreshDialog()){ arm('refresh-close'); return; }
      if(closeTopGuideOrMenu()){ arm('modal-close'); return; }
      if(closePrayer()){ arm('prayer-close'); return; }
      if(closeMissa()){ arm('missa-close'); return; }
      if(closeGeneralView()){ arm('general-close'); return; }
      if(closeMapLayer()){ arm('map-layer-close'); return; }
      if(appActive()){
        toCover('app-active-cover');
        arm('app-active-cover');
        return;
      }
      var exiting = showExitToast();
      if(!exiting) arm('cover-toast');
    }finally{
      setTimeout(function(){ handling=false; }, 80);
    }
  }

  window.addEventListener('popstate', function(){ handleBack('popstate'); }, false);
  document.addEventListener('backbutton', function(){ handleBack('hardware'); }, false);
  window.addEventListener('pageshow', function(){ setTimeout(function(){ arm('pageshow'); }, 0); }, true);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ arm('domready'); }, {once:true});
  else arm('init');
})();
