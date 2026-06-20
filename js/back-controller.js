

(function(){
  'use strict';
  if(window.__BACK_CTRL__) return;
  window.__BACK_CTRL__ = true;
  window.__OAI_FULL_BACK_CTRL_ACTIVE__ = true;

  var _href = location.href.split('#')[0];

  /* 진단 표시 코드는 V8-1-14-42-MYFAITH-CAPTURE-FIRST-TOAST에서 제거했습니다. */


  function armCoverBackTrap(reason, opts){
    try{
      opts = opts || {};
      var href = location.href.split('#')[0];
      _href = href;
      var st = history.state;
      if(!opts.force && st && st._p === 1 && st.oai_cover_trap) return;
      history.replaceState({_p:0, oai_cover_root:reason||'cover-root'}, '', href);
      history.pushState({_p:1, oai_cover_trap:reason||'cover-trap'}, '', href);
    }catch(e){
      console.warn("[가톨릭길동무]", e);
    }
  }
  try{ window._oaiArmCoverBackTrap = armCoverBackTrap; }catch(_e){}

  try{
    var refreshReason = '';
    try{
      var compactUntil = Number(sessionStorage.getItem('oai_refresh_history_compact_until') || 0);
      if(compactUntil && Date.now && Date.now() < compactUntil){
        refreshReason = sessionStorage.getItem('oai_refresh_history_compact_reason') || 'refresh';
      }
      sessionStorage.removeItem('oai_refresh_history_compact_until');
      sessionStorage.removeItem('oai_refresh_history_compact_reason');
    }catch(_e){}
    if(refreshReason){
      history.replaceState({_p:1, oai_cover_trap: refreshReason}, '', _href);
    }else{
      armCoverBackTrap('init', {force:true});
    }
  }catch(e){ console.warn("[가톨릭길동무]", e); }

  function $b(id){ return document.getElementById(id); }
  function coverVisible(){
    try{
      if(typeof window._isCoverScreenVisible === 'function') return window._isCoverScreenVisible();
      var cover = $b('cover');
      if(!cover) return !document.documentElement.classList.contains('app-active');
      if(cover.classList.contains('hidden')) return false;
      var st = window.getComputedStyle ? window.getComputedStyle(cover) : null;
      if(st && (st.display === 'none' || st.visibility === 'hidden')) return false;
      return true;
    }catch(e){ return false; }
  }
  function hasOpenAppSurface(){
    try{
      var ids = ['diocese-view','missa-view','prayer-view','qna-view'];
      for(var i=0;i<ids.length;i++){
        var el = $b(ids[i]);
        if(el && el.classList && el.classList.contains('open')) return true;
      }
      if(document.querySelector('.module-view.open')) return true;
      if(isMyFaithOpen()) return true;
      if(document.querySelector('#info-card.open,#sheet-route.open,#route-choice-modal.open,#srch-modal.open,.sheet.open,.trail-sheet.open,#shrine-visit-modal.show,#shrine-auto-visit-modal.show,#shrine-visit-detail-view.show,#shrine-visit-cards-modal.show')) return true;
      try{ if(typeof _activeTab !== 'undefined' && _activeTab) return true; }catch(_e){}
      try{ if(typeof _routeMode !== 'undefined' && (_routeMode || _rS || _rE)) return true; }catch(_e){}
      var app = $b('app');
      if(app && document.documentElement.classList.contains('app-active')) return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    return false;
  }

  function hasVisibleAppLayer(){
    try{
      var ids = ['diocese-view','missa-view','prayer-view','qna-view'];
      for(var i=0;i<ids.length;i++){
        var el = $b(ids[i]);
        if(el && el.classList && el.classList.contains('open')) return true;
      }
      if(document.querySelector('.module-view.open')) return true;
      if(isMyFaithOpen()) return true;
      if(document.querySelector('#info-card.open,#sheet-route.open,#route-choice-modal.open,#srch-modal.open,.sheet.open,.trail-sheet.open,#shrine-visit-modal.show,#shrine-auto-visit-modal.show,#shrine-visit-detail-view.show,#shrine-visit-cards-modal.show')) return true;
      if(isGuideModalOpen()) return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    return false;
  }

  function isCoverOnlyVisible(){
    try{ return coverVisible() && !hasVisibleAppLayer(); }catch(e){ return false; }
  }

  function stabilizeCoverFirstBack(reason){
    try{
      if(!isCoverOnlyVisible()) return false;
      if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
      if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed();
      if(typeof window._clearHardCoverExitFlags === 'function') window._clearHardCoverExitFlags(reason || 'cover-return-stabilize');
      if(typeof window._forceNextCoverBackToast === 'function') window._forceNextCoverBackToast(reason || 'cover-return-stabilize');
      armCoverBackTrap(reason || 'cover-return-stabilize', {force:true});
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
  }

  function appActive(){
    try{ if(hasOpenAppSurface()) return true; }catch(e){}
    try{ if(typeof window._isAppScreenActive === 'function') return window._isAppScreenActive(); }catch(e){}
    return document.documentElement.classList.contains('app-active') && !coverVisible();
  }

  function isRefreshDialogOpen(){
    try{ return !!document.getElementById('oai-refresh-content-dialog'); }catch(e){ return false; }
  }

  function isMyFaithOpen(){
    try{ return !!document.querySelector('.my-diocese-modal.show'); }catch(e){ return false; }
  }
  function closeMyFaithInternal(reason){
    try{
      if(typeof window.closeMyFaithLifeInternalBack === 'function') window.closeMyFaithLifeInternalBack(reason || 'my-faith-back');
      else if(typeof window.closeMyFaithLifeModal === 'function') window.closeMyFaithLifeModal();
      else {
        var el = document.querySelector('.my-diocese-modal.show');
        if(el){ el.classList.remove('show','keyboard-open','return-settling'); el.setAttribute('aria-hidden','true'); }
        var cover = document.getElementById('cover');
        document.documentElement.classList.remove('app-active','parish-mode','retreat-mode');
        if(cover){ cover.style.display=''; cover.style.opacity=''; cover.style.pointerEvents=''; }
      }
      if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
      if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed();
      if(typeof window._clearHardCoverExitFlags === 'function') window._clearHardCoverExitFlags(reason || 'my-faith-back');
      armCoverBackTrap(reason || 'my-faith-back', {force:true});
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
  }
  function now(){ return Date.now ? Date.now() : new Date().getTime(); }
  function suppressNextCoverBackToast(ms, reason){
    try{
      window.__OAI_SUPPRESS_COVER_BACK_TOAST_UNTIL__ = now() + (ms || 600);
      window.__OAI_SUPPRESS_COVER_BACK_TOAST_REASON__ = reason || 'cover-state-reset';
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  function consumeSuppressedCoverBackToast(){
    try{
      var until = Number(window.__OAI_SUPPRESS_COVER_BACK_TOAST_UNTIL__ || 0);
      if(until && now() < until){
        window.__OAI_SUPPRESS_COVER_BACK_TOAST_UNTIL__ = 0;
        window.__OAI_SUPPRESS_COVER_BACK_TOAST_REASON__ = '';
        if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
        if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed();
        armCoverBackTrap('suppressed-cover-popstate');
        return true;
      }
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    return false;
  }
  try{ window._oaiSuppressNextCoverBackToast = suppressNextCoverBackToast; }catch(_e){}
  function closeRefreshDialog(){
    try{
      var el = document.getElementById('oai-refresh-content-dialog');
      if(!el) return false;
      if(el.parentNode) el.parentNode.removeChild(el);
      if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
  }
  function isGuideModalOpen(){
    try{ return !!document.querySelector('.guide-modal.show') || !!document.querySelector('.cover-menu-modal.show') || isRefreshDialogOpen(); }catch(e){ return false; }
  }
  function closeGuideModals(){
    try{
      var rd = $b('oai-refresh-content-dialog');
      if(rd && rd.parentNode){ rd.parentNode.removeChild(rd); return; }
      if(typeof window.closeMyFaithLifeModal === 'function' && typeof window.isMyFaithLifeModalOpen === 'function' && window.isMyFaithLifeModalOpen()){
        window.closeMyFaithLifeModal();
        return 'myfaith';
      }
      if(typeof window.closeCoverMenuPopup === 'function' && typeof window.isCoverMenuPopupOpen === 'function' && window.isCoverMenuPopupOpen()){
        window.closeCoverMenuPopup();
        return;
      }
      var mq = $b('mass-quick-modal');
      if(mq && mq.classList.contains('show') && typeof window.closeMassQuickMenu === 'function'){
        window.closeMassQuickMenu();
      } else {
        document.querySelectorAll('.guide-modal.show').forEach(function(el){
          el.classList.remove('show');
          el.setAttribute('aria-hidden','true');
        });
      }
      if(typeof window.resetGuideManualScroll === 'function') window.resetGuideManualScroll();
      if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
      if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed();
      if(typeof window._clearHardCoverExitFlags === 'function') window._clearHardCoverExitFlags('guide-modal-close');
      if(typeof window._forceNextCoverBackToast === 'function') window._forceNextCoverBackToast('guide-modal-close');
      if(typeof window._resetCoverBackTrap === 'function') window._resetCoverBackTrap('guide-modal-close');
      else armCoverBackTrap('guide-modal-close', {force:true});
      return 'guide';
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }

  function callGTC(){
    if(typeof window.goToCover === 'function') window.goToCover();
    else {
      document.documentElement.classList.remove('app-active','parish-mode','retreat-mode');
      var cv = $b('cover'); if(cv) cv.style.display = '';
    }
  }

  function closeGeneralModuleToCover(reason){
    var diocese = $b('diocese-view');
    if(diocese && diocese.classList.contains('open')){
      if(typeof window.closeDioceseView === 'function') window.closeDioceseView();
      else {
        diocese.classList.remove('open');
        callGTC();
      }
      return true;
    }

    var mods = document.querySelectorAll('.module-view.open');
    if(mods.length){
      mods[mods.length-1].classList.remove('open');
      callGTC();
      return true;
    }
    return false;
  }

  try{ window._oaiCloseGeneralModuleToCover = closeGeneralModuleToCover; }catch(_e){}

  function closeModuleInnerLayer(){
    var trailSheet = null;
    try{ trailSheet = document.querySelector('.trail-sheet.open'); }catch(_e){}
    if(trailSheet){
      try{
        if(typeof window.trailCloseSheet === 'function') window.trailCloseSheet();
        else trailSheet.classList.remove('open');
      }catch(e){
        try{ trailSheet.classList.remove('open'); }catch(_e){}
        console.warn('[가톨릭길동무]', e);
      }
      return true;
    }
    return false;
  }

  function isDioceseViewOpen(){
    try{ var el=$b('diocese-view'); return !!(el && el.classList && el.classList.contains('open')); }catch(e){ return false; }
  }
  function closeDioceseViewToCoverDirect(reason){
    try{
      if(typeof window.closeDioceseView === 'function') window.closeDioceseView();
      else { var el=$b('diocese-view'); if(el) el.classList.remove('open'); callGTC(); }
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
  }

  function closeExtOrModule(){
    var missa = $b('missa-view');
    if(missa && missa.classList.contains('open')){
      if(typeof window.closeMissa === 'function') window.closeMissa();
      else missa.classList.remove('open');
      return true;
    }
    var prayer = $b('prayer-view');
    if(prayer && prayer.classList.contains('open')){
      if(typeof window._oaiPrayerBackHandle === 'function') return window._oaiPrayerBackHandle('closeExtOrModule-prayer');
      if(typeof window.closePrayerView === 'function') window.closePrayerView();
      else prayer.classList.remove('open');
      callGTC();
      return true;
    }
    return closeGeneralModuleToCover('back-general-module');
  }

  function closeLayer(){
    var el;

    el = $b('shrine-visit-modal');
    if(el && el.classList && el.classList.contains('show')){
      if(typeof window._closeShrineVisitModal === 'function') window._closeShrineVisitModal({fromBackController:true});
      else { el.classList.remove('show'); el.setAttribute('aria-hidden','true'); }
      return true;
    }

    el = $b('shrine-auto-visit-modal');
    if(el && el.classList && el.classList.contains('show')){
      if(typeof window._closeShrineAutoVisitModal === 'function') window._closeShrineAutoVisitModal({fromBackController:true});
      else { el.classList.remove('show'); el.setAttribute('aria-hidden','true'); }
      return true;
    }

    el = $b('shrine-visit-detail-view');
    if(el && el.classList && el.classList.contains('show')){
      if(typeof window._closeShrineVisitDetail === 'function') window._closeShrineVisitDetail({fromBackController:true});
      else { el.classList.remove('show'); el.setAttribute('aria-hidden','true'); }
      return true;
    }

    el = $b('shrine-visit-cards-modal');
    if(el && el.classList && el.classList.contains('show')){
      if(typeof window._closeShrineVisitCardsModal === 'function') window._closeShrineVisitCardsModal({fromBackController:true});
      else { el.classList.remove('show'); el.setAttribute('aria-hidden','true'); }
      return true;
    }

    el = $b('exit-dlg');
    if(el && el.classList.contains('open')){ el.classList.remove('open'); return true; }

    el = $b('route-choice-modal');
    if(el && el.classList.contains('open')){
      if(typeof window._closeInfoRouteChoice==='function') window._closeInfoRouteChoice();
      else el.classList.remove('open');
      return true;
    }

    el = $b('srch-modal');
    if(el && el.classList.contains('open')){
      if(typeof window.closeSearchModal==='function') window.closeSearchModal();
      else el.classList.remove('open');
      return true;
    }

    el = $b('sheet-route');
    try{
      if((el && el.classList.contains('open')) || _routeMode || _rS || _rE){
        var dest = (_rE && _rE.lat) ? Object.assign({}, _rE) : null;
        try{ if(typeof window.resetRoute==='function') window.resetRoute(); }catch(e){ console.warn("[가톨릭길동무]", e); }
        try{ _routeMode = false; }catch(e){ console.warn("[가톨릭길동무]", e); }
        if(el) el.classList.remove('open');
        try{ if(_activeTab==='route') _activeTab=null; if(typeof _updateTabBtns==='function') _updateTabBtns(null); }catch(e){ console.warn("[가톨릭길동무]", e); }
        if(dest){
          setTimeout(function(){
            try{
              var items = (typeof _getCurrentItems==='function') ? _getCurrentItems() : [];
              var idx = (typeof dest.idx==='number' && dest.idx>=0) ? dest.idx : items.findIndex(function(p){return Number(p.lat)===Number(dest.lat)&&Number(p.lng)===Number(dest.lng);});
              var item = idx>=0 ? items[idx] : null;
              if(item){
                if(_mode==='shrine' && typeof _selectShrineMarker==='function') _selectShrineMarker(idx);
                else if(_mode==='parish' && typeof _selectParishMarker==='function') _selectParishMarker(item);
                else if(typeof _selectRetreatMarker==='function') _selectRetreatMarker(item);
                if(typeof _showInfoCard==='function') _showInfoCard(item, idx);
                if(typeof _focusMarkerAboveInfoCard==='function') _focusMarkerAboveInfoCard(item);
              }
            }catch(e){ console.warn("[가톨릭길동무]", e); }
          }, 90);
        }
        return true;
      }
    }catch(e){ console.warn("[가톨릭길동무]", e); }

    el = $b('info-card');
    if(el && el.classList.contains('open')){
      if(typeof window.closeInfoCard==='function') window.closeInfoCard();
      else{ el.classList.remove('open'); el.style.display='none'; }
      return true;
    }

    try{ if(_activeTab && typeof closeTab==='function'){ closeTab(_activeTab); return true; } }catch(e){ console.warn("[가톨릭길동무]", e); }

    var tsh = document.querySelector('.trail-sheet.open');
    if(tsh){ tsh.classList.remove('open'); return true; }

    var sheets = document.querySelectorAll('.sheet.open');
    if(sheets.length){ sheets[sheets.length-1].classList.remove('open'); return true; }

    return false;
  }

  var _restoring = false;

  function myFaithForceToastActive(){
    try{
      var until = Number(window.__OAI_MYFAITH_FORCE_FIRST_COVER_TOAST_UNTIL__ || sessionStorage.getItem('oai_myfaith_force_first_cover_toast_until') || 0);
      return !!(until && Date.now && Date.now() < until);
    }catch(e){ return false; }
  }

  function handleMyFaithFirstCoverBack(reason, evt){
    try{
      if(!myFaithForceToastActive()) return false;
      if(isMyFaithOpen()) return false;
      if(!isCoverOnlyVisible()) return false;
      if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
      if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed();
      if(typeof window._showBackToast === 'function') window._showBackToast();
      else {
        try{
          var t=document.createElement('div');
          t.id='_bt';
          t.textContent='한 번 더 누르면 앱이 종료됩니다';
          t.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(14,21,53,.94);color:#fff;padding:12px 24px;border-radius:24px;font-size:14px;font-weight:800;z-index:99999;white-space:nowrap;pointer-events:none;box-shadow:0 14px 36px rgba(0,0,0,.32);';
          document.body.appendChild(t);
          setTimeout(function(){ if(t && t.parentNode) t.parentNode.removeChild(t); }, 2500);
        }catch(_e){}
      }
      armCoverBackTrap(reason || 'my-faith-first-cover-toast', {force:true});
      if(evt){
        try{ if(evt.preventDefault) evt.preventDefault(); }catch(_e){}
        try{ if(evt.stopImmediatePropagation) evt.stopImmediatePropagation(); else if(evt.stopPropagation) evt.stopPropagation(); }catch(_e){}
      }
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
  }

  window.addEventListener('popstate', function(evt){
    handleMyFaithFirstCoverBack('my-faith-cover-pop-capture', evt);
  }, true);

  window.addEventListener('popstate', function(){
    if(window._appExiting) return;

    if(_restoring){
      _restoring = false;
      try{
        var _mfCb = window.__OAI_AFTER_RESTORE_MY_FAITH_CB__;
        var _mfUntil = Number(window.__OAI_AFTER_RESTORE_MY_FAITH_UNTIL__ || 0);
        if(typeof _mfCb === 'function' && (!_mfUntil || Date.now() < _mfUntil)){
          window.__OAI_AFTER_RESTORE_MY_FAITH_CB__ = null;
          window.__OAI_AFTER_RESTORE_MY_FAITH_UNTIL__ = 0;
          setTimeout(function(){ try{ _mfCb(); }catch(e){ console.warn('[가톨릭길동무]', e); } }, 0);
          return;
        }
        window.__OAI_AFTER_RESTORE_MY_FAITH_CB__ = null;
        window.__OAI_AFTER_RESTORE_MY_FAITH_UNTIL__ = 0;
      }catch(e){ console.warn('[가톨릭길동무]', e); }
      if(typeof window._oaiPrayerRunPendingCoverReset === 'function' && window._oaiPrayerRunPendingCoverReset()) return;
      if(typeof window._oaiPrayerRunPendingQuickPopup === 'function') window._oaiPrayerRunPendingQuickPopup();
      try{
        if(coverVisible() && !appActive()){
          if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
          if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed();
          armCoverBackTrap('restore-cover-after-module');
        }
      }catch(e){ console.warn('[가톨릭길동무]', e); }
      return;
    }

    try{
      var mqPopUntil = Number(window.__OAI_MQ_STATE_POPPING__ || 0);
      if(mqPopUntil && Date.now() < mqPopUntil){
        window.__OAI_MQ_STATE_POPPING__ = 0;
        var cb = window.__OAI_AFTER_MQ_STATE_POP__;
        window.__OAI_AFTER_MQ_STATE_POP__ = null;
        if(typeof cb === 'function') setTimeout(cb, 0);
        return;
      }
    }catch(e){ console.warn('[가톨릭길동무]', e); }

    if(typeof window._oaiPrayerIsReturnPopupOpen === 'function' && window._oaiPrayerIsReturnPopupOpen()){
      var coverCb = function(){ if(typeof window._oaiPrayerResetToCover === 'function') window._oaiPrayerResetToCover('prayer-popup-cover-after-restore'); };
      try{
        window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET__ = coverCb;
        window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET_UNTIL__ = Date.now() + 1800;
        _restoring = true;
        history.go(1);
        setTimeout(function(){
          try{
            if(window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET__ === coverCb){
              _restoring = false;
              window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET__ = null;
              window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET_UNTIL__ = 0;
              coverCb();
            }
          }catch(e){ console.warn('[가톨릭길동무]', e); }
        }, 160);
      }catch(e){
        _restoring = false;
        console.warn('[가톨릭길동무]', e);
        coverCb();
      }
      return;
    }

    if(closeRefreshDialog()){
      try{ armCoverBackTrap('refresh-dialog-close', {force:true}); }catch(e){ console.warn('[가톨릭길동무]', e); }
      return;
    }

    if(isMyFaithOpen()){
      var myFaithCb = function(){
        closeMyFaithInternal('my-faith-popstate');
      };
      try{
        window.__OAI_AFTER_RESTORE_MY_FAITH_CB__ = myFaithCb;
        window.__OAI_AFTER_RESTORE_MY_FAITH_UNTIL__ = Date.now() + 1800;
        _restoring = true;
        history.go(1);
        setTimeout(function(){
          try{
            if(window.__OAI_AFTER_RESTORE_MY_FAITH_CB__ === myFaithCb){
              _restoring = false;
              window.__OAI_AFTER_RESTORE_MY_FAITH_CB__ = null;
              window.__OAI_AFTER_RESTORE_MY_FAITH_UNTIL__ = 0;
              myFaithCb();
            }
          }catch(e){ console.warn('[가톨릭길동무]', e); }
        }, 160);
      }catch(e){
        _restoring = false;
        console.warn('[가톨릭길동무]', e);
        myFaithCb();
      }
      return;
    }

    if(isGuideModalOpen()){
      var closedGuideType = closeGuideModals();
      try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ if(typeof window._resetCoverBackTrap === 'function') window._resetCoverBackTrap('guide-modal-close'); else armCoverBackTrap('guide-modal-close'); }catch(e){ console.warn("[가톨릭길동무]", e); }
      return;
    }

    if(isDioceseViewOpen()){
      closeDioceseViewToCoverDirect('diocese-popstate-direct');
      return;
    }

    if(!appActive()){
      if(consumeSuppressedCoverBackToast()) return;
      var exiting = false;
      if(typeof window._showBackToast==='function') exiting = window._showBackToast() === true;
      if(!exiting){ armCoverBackTrap('cover-toast'); }
      return;
    }

    _restoring = true;
    try{ history.go(1); }catch(e){ _restoring = false; console.warn("[가톨릭길동무]", e); }

    if(typeof window._oaiPrayerBackHandle === 'function' && window._oaiPrayerBackHandle('prayer-popstate')) return;
    if(closeModuleInnerLayer()){ return; }
    if(closeExtOrModule()){ return; }
    if(closeLayer()){ return; }
    callGTC();
  }, false);

  document.addEventListener('backbutton', function(evt){
    if(handleMyFaithFirstCoverBack('my-faith-cover-hardware-capture', evt)) return;
    if(typeof window._oaiPrayerBackHandle === 'function' && window._oaiPrayerBackHandle('prayer-hardware-back')) return;
    if(closeRefreshDialog()){ try{ armCoverBackTrap('refresh-dialog-hardware', {force:true}); }catch(e){} return; }
    if(isMyFaithOpen()){
      closeMyFaithInternal('my-faith-hardware');
      return;
    }

    if(isGuideModalOpen()){
      var closedGuideType = closeGuideModals();
      try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(e){}
      try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(e){}
      try{ if(typeof window._resetCoverBackTrap === 'function') window._resetCoverBackTrap('guide-modal-hardware'); else armCoverBackTrap('guide-modal-hardware'); }catch(e){}
      return;
    }
    if(isDioceseViewOpen()){
      closeDioceseViewToCoverDirect('diocese-hardware-direct');
      return;
    }
    if(!appActive()){
      if(consumeSuppressedCoverBackToast()) return;
      if(typeof window._showBackToast==='function') window._showBackToast();
      return;
    }
    if(closeModuleInnerLayer()){ return; }
    if(closeExtOrModule()){ return; }
    if(closeLayer()){ return; }
    callGTC();
  }, false);

  window.addEventListener('pageshow', function(){
    try{
      if(stabilizeCoverFirstBack('pageshow-cover-return')) return;
      var st = history.state;
      if(st && st._p === 1) return;  // 트랩 유지 중이면 스킵
      if(!appActive()) armCoverBackTrap('pageshow-cover');
      else { history.replaceState({_p:0}, '', _href); history.pushState({_p:1}, '', _href); }
    }catch(e){ console.warn("[가톨릭길동무]", e); }
  }, true);

  window.addEventListener('focus', function(){
    try{ setTimeout(function(){ stabilizeCoverFirstBack('focus-cover-return'); }, 40); }catch(e){ console.warn('[가톨릭길동무]', e); }
  }, true);

  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'visible'){
      try{ setTimeout(function(){ stabilizeCoverFirstBack('visible-cover-return'); }, 60); }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
  }, true);

})();

