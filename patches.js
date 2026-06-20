
(function(){
  'use strict';
  if(window.__BACK_CTRL__) return;
  window.__BACK_CTRL__ = true;
  window.__OAI_FULL_BACK_CTRL_ACTIVE__ = true;

  var _href = location.href.split('#')[0];

  function armCoverBackTrap(reason, opts){
    try{
      opts = opts || {};
      var href = location.href.split('#')[0];
      _href = href;
      var st = history.state;
      if(st && st._p === 1 && st.oai_cover_trap) return;
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
      var compactUntil = Number(sessionStorage.getItem(SS.REFRESH_HISTORY_COMPACT_UNTIL) || 0);
      if(compactUntil && Date.now && Date.now() < compactUntil){
        refreshReason = sessionStorage.getItem(SS.REFRESH_HISTORY_COMPACT_REASON) || 'refresh';
      }
      sessionStorage.removeItem(SS.REFRESH_HISTORY_COMPACT_UNTIL);
      sessionStorage.removeItem(SS.REFRESH_HISTORY_COMPACT_REASON);
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
  function appActive(){
    try{ if(typeof window._isAppScreenActive === 'function') return window._isAppScreenActive(); }catch(e){}
    return document.documentElement.classList.contains('app-active') && !coverVisible();
  }

  function isRefreshDialogOpen(){
    try{ return !!document.getElementById('oai-refresh-content-dialog'); }catch(e){ return false; }
  }
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
    try{ return !!document.querySelector('.guide-modal.show') || isRefreshDialogOpen(); }catch(e){ return false; }
  }
  function closeGuideModals(){
    try{
      var rd = $b('oai-refresh-content-dialog');
      if(rd && rd.parentNode){ rd.parentNode.removeChild(rd); return; }
      var mq = $b('mass-quick-modal');
      if(mq && mq.classList.contains('show') && typeof window.closeMassQuickMenu === 'function'){
        var fromPrayer = false;
        try{ fromPrayer = !!(mq.dataset && mq.dataset.returnSource === 'prayer'); }catch(e){}
        try{ if(typeof window._isPrayerPopupReturnSource === 'function' && window._isPrayerPopupReturnSource()) fromPrayer = true; }catch(e){}
        window.closeMassQuickMenu();
      } else {
        document.querySelectorAll('.guide-modal.show').forEach(function(el){
          el.classList.remove('show');
          el.setAttribute('aria-hidden','true');
        });
      }
      if(typeof window.resetGuideManualScroll === 'function') window.resetGuideManualScroll();
      if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }

  function callGTC(){
    if(typeof window.goToCover === 'function') window.goToCover();
    else {
      document.documentElement.classList.remove('app-active','parish-mode','retreat-mode');
      var cv = $b('cover'); if(cv) cv.style.display = '';
    }
  }

  function isMainCategoryMapActive(){
    try{
      if(!appActive()) return false;
      if(window._screen !== 'map') return false;
      return window._mode === 'shrine' || window._mode === 'parish' || window._mode === 'retreat';
    }catch(_e){ return false; }
  }
  function isVisiblyOpen(el){
    try{
      if(!el || !el.classList || !el.classList.contains('open')) return false;
      var st = window.getComputedStyle ? window.getComputedStyle(el) : null;
      if(st && (st.display === 'none' || st.visibility === 'hidden')) return false;
      var r = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
      if(!r) return true;
      return r.width > 20 && r.height > 20 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth;
    }catch(_e){ return false; }
  }
  function hasVisibleCategoryLayerForBack(){
    try{
      var el;
      el = $b('exit-dlg'); if(isVisiblyOpen(el)) return true;
      el = $b('srch-modal'); if(isVisiblyOpen(el)) return true;
      el = $b('route-role-choice'); if(isVisiblyOpen(el)) return true;
      el = $b('route-cancel-confirm'); if(isVisiblyOpen(el)) return true;
      el = $b('sheet-route'); if(isVisiblyOpen(el)) return true;
      el = $b('info-card'); if(isVisiblyOpen(el)) return true;
      var routeBusy = false;
      try{ routeBusy = !!(window._routeMode || window._rS || window._rE); }catch(_e){}
      if(routeBusy) return true;
      var names = ['nearby','list','region'];
      for(var i=0;i<names.length;i++){
        el = $b('sheet-' + names[i]);
        if(isVisiblyOpen(el)) return true;
      }
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    return false;
  }
  function shouldMapBackGoStraightToCover(reason){
    try{
      if(!isMainCategoryMapActive()) return false;
      var now = Date.now ? Date.now() : new Date().getTime();
      if(window.__OAI_MAP_BACK_TO_COVER_UNTIL__ && now < window.__OAI_MAP_BACK_TO_COVER_UNTIL__) return true;
      var w = Math.round(window.innerWidth || document.documentElement.clientWidth || 0);
      var h = Math.round(window.innerHeight || document.documentElement.clientHeight || 0);
      if(w >= 600 && Math.min(w, h) >= 520 && !hasVisibleCategoryLayerForBack()) return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    return false;
  }
  function mapBackToCover(reason){
    try{
      var now = Date.now ? Date.now() : new Date().getTime();
      window.__OAI_MAP_BACK_TO_COVER_UNTIL__ = now + 1200;
      callGTC();
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    return false;
  }
  try{ window._oaiMapBackToCover = mapBackToCover; }catch(_e){}

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

  function closeExtOrModule(){
    var missa = $b('missa-view');
    if(missa && missa.classList.contains('open')){
      if(typeof window.closeMissa === 'function') window.closeMissa();
      else missa.classList.remove('open');
      return true;
    }
    var prayer = $b('prayer-view');
    if(prayer && prayer.classList.contains('open')){
      if(typeof handlePrayerBack === 'function') return handlePrayerBack('closeExtOrModule-prayer');
      if(typeof window.closePrayerView === 'function') window.closePrayerView();
      else prayer.classList.remove('open');
      callGTC();
      return true;
    }
    return closeGeneralModuleToCover('back-general-module');
  }

  function isNearbySheetVisiblyOpen(){
    try{
      var sheet = $b('sheet-nearby');
      if(!sheet) return false;
      if(sheet.classList.contains('open') || sheet.classList.contains('oai-preopen-nearby')) return true;
      var st = window.getComputedStyle ? window.getComputedStyle(sheet) : null;
      if(st && st.display !== 'none' && st.visibility !== 'hidden'){
        var r = sheet.getBoundingClientRect ? sheet.getBoundingClientRect() : null;
        if(r && r.height > 40 && r.bottom > 0 && r.top < window.innerHeight) return true;
      }
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    return false;
  }

  function closeNearbySheetBeforeCover(reason){
    try{
      if(!isNearbySheetVisiblyOpen()) return false;
      if(typeof window.closeSheetPanelOnly === 'function') window.closeSheetPanelOnly('nearby');
      else {
        var sheet = $b('sheet-nearby');
        if(sheet) sheet.classList.remove('open','oai-preopen-nearby','from-left','from-right','exit-left','exit-right');
        try{ if(typeof _activeTab !== 'undefined' && _activeTab === 'nearby') _activeTab = null; }catch(_e){}
        try{ if(typeof _updateTabBtns === 'function') _updateTabBtns(null); }catch(_e){}
      }
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
  }

  function closeLayer(){
    var el;
    el = $b('exit-dlg');
    if(el && el.classList.contains('open')){ el.classList.remove('open'); return true; }

    el = $b('srch-modal');
    if(el && el.classList.contains('open')){
      if(typeof window.closeSearchModal==='function') window.closeSearchModal();
      else el.classList.remove('open');
      return true;
    }

    el = $b('route-cancel-confirm');
    if(el && el.classList.contains('open')){
      el.classList.remove('open');
      return true;
    }

    var infoCardEl = $b('info-card');
    var routeSheetEl = $b('sheet-route');
    var infoCardOpen = isVisiblyOpen(infoCardEl);
    var routeSheetOpen = isVisiblyOpen(routeSheetEl);
    if(infoCardOpen && !routeSheetOpen){
      try{
        if(typeof window.closeInfoCard==='function') window.closeInfoCard();
        else{ infoCardEl.classList.remove('open'); infoCardEl.style.display='none'; }
      }catch(e){ console.warn("[가톨릭길동무]", e); }
      try{
        if(_routeMode || _rS || _rE || _polyline){
          if(typeof window.resetRoute==='function') window.resetRoute({fresh:true});
          try{ _routeMode = false; }catch(e){ console.warn("[가톨릭길동무]", e); }
          if(routeSheetEl) routeSheetEl.classList.remove('open');
          try{ if(_activeTab==='route') _activeTab=null; if(typeof _updateTabBtns==='function') _updateTabBtns(null); }catch(e){ console.warn("[가톨릭길동무]", e); }
        }
      }catch(e){ console.warn("[가톨릭길동무]", e); }
      return true;
    }

    try{
      var visibleMainSheetName = null;
      ['nearby','list','region'].some(function(n){
        var sh = $b('sheet-' + n);
        if(isVisiblyOpen(sh)){ visibleMainSheetName = n; return true; }
        return false;
      });
      if(visibleMainSheetName && !routeSheetOpen){
        try{
          if(_routeMode || _rS || _rE || _polyline){
            if(typeof window.resetRoute === 'function') window.resetRoute({fresh:true});
            try{ _routeMode = false; }catch(_e){}
            if(routeSheetEl) routeSheetEl.classList.remove('open');
          }
        }catch(e){ console.warn('[가톨릭길동무]', e); }
        if(typeof window.closeSheetPanelOnly === 'function') window.closeSheetPanelOnly(visibleMainSheetName);
        else if(typeof closeTab === 'function') closeTab(visibleMainSheetName);
        else {
          var mainSheet = $b('sheet-' + visibleMainSheetName);
          if(mainSheet) mainSheet.classList.remove('open');
          try{ if(_activeTab === visibleMainSheetName) _activeTab = null; }catch(_e){}
          try{ if(typeof _updateTabBtns === 'function') _updateTabBtns(null); }catch(_e){}
        }
        return true;
      }
    }catch(e){ console.warn('[가톨릭길동무]', e); }

    el = routeSheetEl;
    try{
      if(routeSheetOpen || _routeMode || _rS || _rE){
        var dest = (!infoCardOpen && _rE && _rE.lat) ? Object.assign({}, _rE) : null;
        try{ if(typeof window.resetRoute==='function') window.resetRoute(dest ? {} : {fresh:true}); }catch(e){ console.warn("[가톨릭길동무]", e); }
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

    if(closeNearbySheetBeforeCover('nearby-sheet-back-first')) return true;

    el = infoCardEl;
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


  function prayerView(){ return $b('prayer-view'); }
  function prayerDetail(){ return $b('prayer-detail'); }
  function prayerPopup(){ return $b('mass-quick-modal'); }
  function isPrayerOpen(){
    var pv = prayerView();
    return !!(pv && pv.classList.contains('open'));
  }
  function isPrayerDetailShowing(){
    var d = prayerDetail();
    return !!(isPrayerOpen() && d && d.classList.contains('show'));
  }
  function isPrayerQuickSource(){
    var pv = prayerView();
    var yes = false;
    try{ if(pv && pv.dataset && pv.dataset.quickSource === 'mass') yes = true; }catch(_e){}
    try{ if(window.__OAI_PRAYER_FROM_QUICK_LOCK__ === true) yes = true; }catch(_e){}
    try{ if(sessionStorage.getItem(SS.PRAYER_FROM_QUICK_LOCK) === '1') yes = true; }catch(_e){}
    try{ if(typeof window._shouldPrayerQuickReturn === 'function' && window._shouldPrayerQuickReturn()) yes = true; }catch(_e){}
    return !!yes;
  }
  function keepPrayerQuickSource(on){
    try{ if(typeof window._setPrayerQuickReturn === 'function') window._setPrayerQuickReturn(!!on); }catch(_e){}
    try{ window.__OAI_PRAYER_FROM_QUICK_LOCK__ = !!on; }catch(_e){}
    try{ if(on) sessionStorage.setItem(SS.PRAYER_FROM_QUICK_LOCK,'1'); else sessionStorage.removeItem(SS.PRAYER_FROM_QUICK_LOCK); }catch(_e){}
    try{
      var pv = prayerView();
      if(pv && pv.dataset){
        if(on) pv.dataset.quickSource = 'mass';
        else delete pv.dataset.quickSource;
      }
    }catch(_e){}
  }
  function isPrayerReturnPopupOpen(){
    var mq = prayerPopup();
    if(!(mq && mq.classList.contains('show'))) return false;
    var yes = false;
    try{ if(mq.dataset && mq.dataset.returnSource === 'prayer') yes = true; }catch(_e){}
    try{ if(typeof window._isPrayerPopupReturnSource === 'function' && window._isPrayerPopupReturnSource()) yes = true; }catch(_e){}
    return !!yes;
  }
  function armPrayerBackTrap(reason){
    try{
      if(isPrayerOpen() && typeof window._ensureAppBackTrap === 'function'){
        window._ensureAppBackTrap(reason || 'prayer-ui-state');
      }
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  function pushPrayerDetailState(reason){ armPrayerBackTrap(reason || 'prayer-detail'); }
  function replacePrayerListState(reason){ armPrayerBackTrap(reason || 'prayer-list'); }
  function hidePrayerOnly(){
    try{
      var d = prayerDetail();
      if(d) d.classList.remove('show');
      var pv = prayerView();
      if(pv){
        pv.classList.remove('open');
        try{ delete pv.dataset.quickSource; }catch(_e){}
      }
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  function showCoverOnlyForPrayer(){
    try{
      document.documentElement.classList.remove('app-active','parish-mode','retreat-mode');
      if(typeof window.oaiSetMainMapLayerHidden === 'function') window.oaiSetMainMapLayerHidden(false);
      var cv = $b('cover');
      if(cv){
        cv.style.display = '';
        cv.style.opacity = '';
        cv.style.pointerEvents = '';
        try{ cv.scrollTop = 0; }catch(_e){}
      }
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  function resetPrayerFlags(){
    try{ if(typeof window._setPrayerPopupReturnSource === 'function') window._setPrayerPopupReturnSource(false); }catch(_e){}
    try{ if(typeof window._clearPrayerQuickReturn === 'function') window._clearPrayerQuickReturn(); }catch(_e){}
    try{ if(typeof window._clearMassQuickReturnForReload === 'function') window._clearMassQuickReturnForReload(); }catch(_e){}
    try{ window.__OAI_PRAYER_FROM_QUICK_LOCK__ = false; }catch(_e){}
    try{ sessionStorage.removeItem(SS.PRAYER_FROM_QUICK_LOCK); }catch(_e){}
    try{ window.__OAI_PRAYER_POPUP_COVER_GUARD_UNTIL__ = 0; }catch(_e){}
    try{ window.__OAI_PRAYER_COVER_FORCE_FIRST_TOAST_UNTIL__ = 0; }catch(_e){}
  }
  function ensureCoverTrapAfterPrayer(reason){
    try{
      if(typeof window._resetCoverBackTrap === 'function') window._resetCoverBackTrap(reason || 'prayer-cover-reset');
      else if(typeof window._ensureCoverBackTrap === 'function') window._ensureCoverBackTrap(reason || 'prayer-cover-reset');
      else {
        var href = location.href.split('#')[0];
        history.replaceState({_p:0, oai_cover_root:reason||'prayer-cover-reset'}, '', href);
        history.pushState({_p:1, oai_cover_trap:reason||'prayer-cover-reset'}, '', href);
      }
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  function settleCoverTrapAfterPrayer(reason){
    function run(tag){
      try{
        if(document.documentElement.classList.contains('app-active')) return;
        var mq = prayerPopup();
        if(mq && mq.classList.contains('show')) return;
        if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
        if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed();
        if(typeof window._ensureCoverBackTrap === 'function') window._ensureCoverBackTrap((reason||'prayer-cover') + '-' + tag);
        else {
          var st = history.state;
          if(!(st && st._p === 1)) ensureCoverTrapAfterPrayer((reason||'prayer-cover') + '-' + tag);
        }
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    run('now');
    setTimeout(function(){ run('after-popstate'); }, 0);
    if(window.requestAnimationFrame) window.requestAnimationFrame(function(){ run('raf'); });
    setTimeout(function(){ run('settle-80'); }, 80);
  }
  function resetPrayerToCover(reason){
    try{
      var mq = prayerPopup();
      if(mq){
        mq.classList.remove('show');
        mq.setAttribute('aria-hidden','true');
        try{ delete mq.dataset.returnSource; }catch(_e){}
      }
      hidePrayerOnly();
      showCoverOnlyForPrayer();
      resetPrayerFlags();
      try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(_e){}
      try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(_e){}
      settleCoverTrapAfterPrayer(reason || 'prayer-cover-reset');
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return true; }
  }
  function prayerDetailToList(reason){
    try{
      var fromQuick = isPrayerQuickSource();
      if(typeof window.prCloseDetail === 'function') window.prCloseDetail({skipTrap:true});
      else {
        var d = prayerDetail();
        if(d) d.classList.remove('show');
      }
      if(typeof window.showPrayerListOnly === 'function') window.showPrayerListOnly();
      try{ if(typeof window.prEnsureTabsVisible === 'function') window.prEnsureTabsVisible(); }catch(_e){}
      keepPrayerQuickSource(!!fromQuick);
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return true; }
  }
  function prayerListToPopupOrCover(reason){
    try{
      // V6-127: 주요기도문 리스트에서는 진입 경로와 관계없이 '미사 중 빠른 사용' 배너로 복귀한다.
      try{ keepPrayerQuickSource(true); }catch(_e){}
      try{ if(typeof window._setPrayerPopupReturnSource === 'function') window._setPrayerPopupReturnSource(true); }catch(_e){}
      try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(_e){}
      try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(_e){}
      if(typeof window._returnToMassQuickMenu === 'function'){
        window._returnToMassQuickMenu('prayer');
        return true;
      }

      hidePrayerOnly();
      showCoverOnlyForPrayer();
      var mq = prayerPopup();
      if(mq){
        try{ mq.dataset.returnSource = 'prayer'; }catch(_e){}
        mq.classList.add('show');
        mq.setAttribute('aria-hidden','false');
      }
      try{ history.pushState({_p:1, oai_mass_quick:1, oai_from_prayer:1}, '', location.href.split('#')[0]); }catch(_e){}
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return true; }
  }
  function handlePrayerBack(reason){
    try{
      if(isPrayerReturnPopupOpen()) return resetPrayerToCover(reason || 'prayer-popup-cover');
      if(isPrayerDetailShowing()) return prayerDetailToList(reason || 'prayer-detail-back');
      if(isPrayerOpen()) return prayerListToPopupOrCover(reason || 'prayer-list-back');
      return false;
    }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
  }
  try{
    window._oaiArmPrayerBackTrap = armPrayerBackTrap;
    window._oaiPrayerPushDetailState = pushPrayerDetailState;
    window._oaiPrayerReplaceListState = replacePrayerListState;
    window._oaiPrayerBackHandle = handlePrayerBack;
    window._oaiPrayerListToPopupOrCover = prayerListToPopupOrCover;
    window._oaiPrayerResetToCover = resetPrayerToCover;
  }catch(_e){}

  function runPendingPrayerQuickPopup(){
    try{
      var cb = window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP__;
      var until = Number(window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP_UNTIL__ || 0);
      if(typeof cb !== 'function') return false;
      if(until && Date.now() > until){
        window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP__ = null;
        window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP_UNTIL__ = 0;
        return false;
      }
      window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP__ = null;
      window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP_UNTIL__ = 0;
      setTimeout(function(){
        try{ cb(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      }, 0);
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
  }

  function runPendingPrayerCoverReset(){
    try{
      var cb = window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET__;
      var until = Number(window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET_UNTIL__ || 0);
      if(typeof cb !== 'function') return false;
      if(until && Date.now() > until){
        window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET__ = null;
        window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET_UNTIL__ = 0;
        return false;
      }
      window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET__ = null;
      window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET_UNTIL__ = 0;
      setTimeout(function(){
        try{ cb(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      }, 0);
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
  }

  window.addEventListener('popstate', function(){
    if(window._appExiting) return;

    try{
      var mapCoverUntil = Number(window.__OAI_MAP_BACK_TO_COVER_UNTIL__ || 0);
      if(mapCoverUntil && Date.now && Date.now() < mapCoverUntil && !appActive()){
        window.__OAI_MAP_BACK_TO_COVER_UNTIL__ = 0;
        if(_restoring) _restoring = false;
        try{ armCoverBackTrap('map-cover-popstate-after-direct', {force:true}); }catch(e){ console.warn('[가톨릭길동무]', e); }
        return;
      }
    }catch(e){ console.warn('[가톨릭길동무]', e); }

    if(_restoring){
      _restoring = false;
      try{
        var _cmCb = window.__OAI_AFTER_RESTORE_COVER_MENU_CB__;
        var _cmUntil = Number(window.__OAI_AFTER_RESTORE_COVER_MENU_UNTIL__ || 0);
        if(typeof _cmCb === 'function' && (!_cmUntil || Date.now() < _cmUntil)){
          window.__OAI_AFTER_RESTORE_COVER_MENU_CB__ = null;
          window.__OAI_AFTER_RESTORE_COVER_MENU_UNTIL__ = 0;
          setTimeout(function(){ try{ _cmCb(); }catch(e){ console.warn('[가톨릭길동무]', e); } }, 0);
          return;
        }
        window.__OAI_AFTER_RESTORE_COVER_MENU_CB__ = null;
        window.__OAI_AFTER_RESTORE_COVER_MENU_UNTIL__ = 0;
      }catch(e){ console.warn('[가톨릭길동무]', e); }
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
      if(runPendingPrayerCoverReset()) return;
      runPendingPrayerQuickPopup();
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

    if(isPrayerReturnPopupOpen()){
      var coverCb = function(){ resetPrayerToCover('prayer-popup-cover-after-restore'); };
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

    if(window.isMyFaithLifeModalOpen && window.isMyFaithLifeModalOpen()){
      var myFaithCb = function(){
        try{ if(typeof window.closeMyFaithLifeModal === 'function') window.closeMyFaithLifeModal(); }catch(e){ console.warn('[가톨릭길동무]', e); }
        try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(e){ console.warn('[가톨릭길동무]', e); }
        try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(e){ console.warn('[가톨릭길동무]', e); }
        try{ if(typeof window._resetCoverBackTrap === 'function') window._resetCoverBackTrap('my-faith-life-close'); else armCoverBackTrap('my-faith-life-close', {force:true}); }catch(e){ console.warn('[가톨릭길동무]', e); }
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
      closeGuideModals();
      try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ if(typeof window._ensureCoverBackTrap === 'function') window._ensureCoverBackTrap('guide-modal'); else armCoverBackTrap('guide-modal'); }catch(e){ console.warn("[가톨릭길동무]", e); }
      return;
    }

    if(window.isCoverMenuPopupOpen && window.isCoverMenuPopupOpen()){
      var menuCb = function(){
        try{ if(typeof window.closeCoverMenuPopup === 'function') window.closeCoverMenuPopup(); }catch(e){ console.warn('[가톨릭길동무]', e); }
        try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(e){}
        try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(e){}
      };
      try{
        window.__OAI_AFTER_RESTORE_COVER_MENU_CB__ = menuCb;
        window.__OAI_AFTER_RESTORE_COVER_MENU_UNTIL__ = Date.now() + 1800;
        _restoring = true;
        history.go(1);
        setTimeout(function(){
          try{
            if(window.__OAI_AFTER_RESTORE_COVER_MENU_CB__ === menuCb){
              _restoring = false;
              window.__OAI_AFTER_RESTORE_COVER_MENU_CB__ = null;
              window.__OAI_AFTER_RESTORE_COVER_MENU_UNTIL__ = 0;
              menuCb();
            }
          }catch(e){ console.warn('[가톨릭길동무]', e); }
        }, 160);
      }catch(e){
        _restoring = false;
        console.warn('[가톨릭길동무]', e);
        menuCb();
        armCoverBackTrap('cover-menu-close-fallback');
      }
      return;
    }

    if(!appActive()){
      var exiting = false;
      if(typeof window._showBackToast==='function') exiting = window._showBackToast() === true;
      if(!exiting){ armCoverBackTrap('cover-toast'); }
      return;
    }

    _restoring = true;
    try{ history.go(1); }catch(e){ _restoring = false; console.warn("[가톨릭길동무]", e); }

    if(shouldMapBackGoStraightToCover('map-popstate')){ mapBackToCover('map-popstate'); return; }
    if(handlePrayerBack('prayer-popstate')) return;
    if(closeModuleInnerLayer()) return;
    if(closeExtOrModule()) return;
    if(closeLayer()) return;
    callGTC();
  }, false);


  document.addEventListener('backbutton', function(){
    if(handlePrayerBack('prayer-hardware-back')) return;
    if(closeRefreshDialog()){ try{ armCoverBackTrap('refresh-dialog-hardware', {force:true}); }catch(e){} return; }
    if(window.isMyFaithLifeModalOpen && window.isMyFaithLifeModalOpen()){
      try{ if(typeof window.closeMyFaithLifeModal === 'function') window.closeMyFaithLifeModal(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(e){}
      try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(e){}
      try{ if(typeof window._resetCoverBackTrap === 'function') window._resetCoverBackTrap('my-faith-life-hardware-close'); else armCoverBackTrap('my-faith-life-hardware-close', {force:true}); }catch(e){}
      return;
    }
    if(isGuideModalOpen()){
      closeGuideModals();
      try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(e){}
      return;
    }
    if(window.isCoverMenuPopupOpen && window.isCoverMenuPopupOpen()){
      try{ if(typeof window.closeCoverMenuPopup === 'function') window.closeCoverMenuPopup(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(e){}
      try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(e){}
      return;
    }
    if(!appActive()){
      if(typeof window._showBackToast==='function') window._showBackToast();
      return;
    }
    if(shouldMapBackGoStraightToCover('map-hardware-back')){ mapBackToCover('map-hardware-back'); return; }
    if(closeModuleInnerLayer()) return;
    if(closeExtOrModule()) return;
    if(closeLayer()) return;
    callGTC();
  }, false);

  window.addEventListener('pageshow', function(){
    try{
      var st = history.state;
      if(st && st._p === 1) return;
      if(!appActive()) armCoverBackTrap('pageshow-cover');
      else { history.replaceState({_p:0}, '', _href); history.pushState({_p:1}, '', _href); }
    }catch(e){ console.warn("[가톨릭길동무]", e); }
  }, true);


})();



(function(){
  'use strict';
  if(window.__APP_PRAYER_VIEW_HELPER__) return;
  window.__APP_PRAYER_VIEW_HELPER__ = true;

  function el(id){ return document.getElementById(id); }
  function blurActive(){ try{ var a=document.activeElement; if(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) a.blur(); }catch(_){ console.warn("[가톨릭길동무] silent catch"); } }

  function showPrayerListOnly(opts){
    blurActive();
    var d=el('prayer-detail');
    if(d) d.classList.remove('show');
    if(opts && opts.skipRestore) return;
    if(typeof window.prRestoreListPosition === 'function'){
      try{ window.prRestoreListPosition(); }catch(_){ console.warn("[가톨릭길동무] silent catch"); }
    }
  }
  try{ window.showPrayerListOnly = showPrayerListOnly; }catch(_){ console.warn("[가톨릭길동무] silent catch"); }
})();




(function(){
  if(window.__APP_PRAYER_SYNC_GUARD__) return;
  window.__APP_PRAYER_SYNC_GUARD__ = true;
  function syncPrayerTabOn(){
    var wrap = document.getElementById('prayer-tabs');
    if(!wrap) return;
    var tabs = wrap.querySelectorAll('.pr-tab');
    if(!tabs || !tabs.length) return;
    var active = null;
    for(var i=0;i<tabs.length;i++){
      var c = tabs[i].style && tabs[i].style.color ? String(tabs[i].style.color).toLowerCase() : '';
      if(c === '#fff' || c === 'white' || c.indexOf('255, 255, 255') > -1){ active = tabs[i]; break; }
    }
    if(!active) active = wrap.querySelector('.pr-tab.on') || tabs[0];
    for(var j=0;j<tabs.length;j++) tabs[j].classList.toggle('on', tabs[j] === active);
  }
  document.addEventListener('click', function(e){
    var t = e.target && e.target.closest ? e.target.closest('#prayer-tabs .pr-tab') : null;
    if(t){
      setTimeout(function(){
        var tabs = document.querySelectorAll('#prayer-tabs .pr-tab');
        for(var i=0;i<tabs.length;i++) tabs[i].classList.remove('on');
        t.classList.add('on');
      }, 0);
      setTimeout(syncPrayerTabOn, 80);
    }
  }, true);
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(syncPrayerTabOn, 300); });
  window.addEventListener('load', function(){ setTimeout(syncPrayerTabOn, 300); });
  (function(){
    var pv = document.getElementById('prayer-view');
    if(!pv){
      document.addEventListener('DOMContentLoaded', function(){
        var el = document.getElementById('prayer-view');
        if(el) new MutationObserver(function(){
          if(el.classList.contains('open')) syncPrayerTabOn();
        }).observe(el, {attributes:true, attributeFilter:['class']});
      }, {once:true});
      return;
    }
    new MutationObserver(function(){
      if(pv.classList.contains('open')) syncPrayerTabOn();
    }).observe(pv, {attributes:true, attributeFilter:['class']});
  })();
})();


(function(){
  if(window.__APP_FAITH_GUARD__) return;
  window.__APP_FAITH_GUARD__ = true;

  function normalizeParishCountText(text){
    text = String(text || '').replace(/\s+/g,' ').trim();
    var m = text.match(/본당\s*수\s*(\d+)\s*개?/);
    if(!m) m = text.match(/(\d+)\s*본당/);
    if(!m) m = text.match(/본당\s*(\d+)\s*개?/);
    if(!m) m = text.match(/(\d+)\s*개/);
    return m ? ('본당 수 ' + m[1] + '개') : text;
  }

  function patchDioceseParishCount(){
    var frame = document.getElementById('diocese-frame');
    if(!frame) return;
    var doc = null;
    try{ doc = frame.contentDocument || (frame.contentWindow && frame.contentWindow.document); }catch(e){ return; }
    if(!doc) return;
    try{
      doc.querySelectorAll('.lv-parish-count,.oai-parish-count,.lv-sec-cnt,.lv-count-line,.oai-parish-count-line').forEach(function(el){
        var t = normalizeParishCountText(el.textContent);
        if(t){ el.textContent = t; el.classList.add('oai-parish-count-line'); }
      });
    }catch(e){ console.warn("[가톨릭길동무]", e); }
  }

  window.addEventListener('load',function(){
    patchDioceseParishCount();
    var frame = document.getElementById('diocese-frame');
    if(frame && !frame.__oaiParishCountFinal20260428){
      frame.__oaiParishCountFinal20260428 = true;
      frame.addEventListener('load',function(){
        setTimeout(patchDioceseParishCount,100);
        setTimeout(patchDioceseParishCount,500);
      });
    }
  });
  document.addEventListener('click',function(){
    setTimeout(patchDioceseParishCount,150);
    setTimeout(patchDioceseParishCount,700);
  },true);
})();





(function(){
  if(window.__APP_FONT_SCALE_GUARD__) return;
  window.__APP_FONT_SCALE_GUARD__=true;
  var QA_URL="qa-firebase.html?v=WebView-Clean-128";
  var FONT_KEY='prayer_font_size';
  var BASE=16;
  var FONT_SIZES=[13,14,15,16,17,18,19,20,21,22,24,26,28,30];
  function el(id){return document.getElementById(id)}
  function clampPx(px){
    px=parseInt(px,10);
    if(FONT_SIZES.indexOf(px)>=0) return px;
    return BASE;
  }
  function getPx(){ return clampPx(localStorage.getItem(FONT_KEY)||BASE); }
  function setPx(px){
    px=clampPx(px);
    try{ localStorage.setItem(FONT_KEY,String(px)); }catch(e){ console.warn("[가톨릭길동무]", e); }
    applyScale();
    return px;
  }
  function adjustSharedFont(delta){
    delta=parseInt(delta,10)||0;
    var cur=getPx();
    var idx=FONT_SIZES.indexOf(cur);
    if(idx<0) idx=FONT_SIZES.indexOf(BASE);
    var next=idx+delta;
    if(next<0) next=0;
    if(next>=FONT_SIZES.length) next=FONT_SIZES.length-1;
    return setPx(FONT_SIZES[next]);
  }
  function applyScale(){
    var px=getPx();
    var scale=px/BASE;
    document.documentElement.classList.add('oai-font-global');
    document.documentElement.style.setProperty('--app-font-scale',String(scale));
    var pv=el('prayer-view');
    if(pv){
      var coverPx=px;
      pv.style.setProperty('--pr-item-fs',coverPx+'px');
      pv.style.setProperty('--pr-body-fs',coverPx+'px');
      pv.style.setProperty('--pr-detail-fs',coverPx+'px');
      pv.style.setProperty('--pr-icon-sz',Math.max(34,Math.round(px*2.2))+'px');
      pv.style.setProperty('--pr-icon-fs',Math.max(17,Math.round(px*1.2))+'px');
    }
    try{
      var df=el('diocese-frame');
      if(df && df.contentWindow && typeof df.contentWindow.dioApplySharedFont==='function') df.contentWindow.dioApplySharedFont();
    }catch(e){ console.warn("[가톨릭길동무]", e); }
  }
  window.__APP_getSharedFontPx=getPx;
  window.__APP_setSharedFontPx=setPx;
  window.__APP_adjustSharedFont=adjustSharedFont;
  window.__APP_applyGlobalFont=applyScale;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', applyScale, {once:true});
  else applyScale();
  window.addEventListener('load', applyScale, {once:true});
  function ensureCoverControls(){
    var cover=el('cover');
    if(!cover) return;
    var box=el('cover-font-controls');
    if(!box){
      box=document.createElement('div');
      box.id='cover-font-controls';
      cover.appendChild(box);
    }
    box.className='pr-font-ctrl';
    box.setAttribute('aria-label','글자 크기 조절');
    box.innerHTML='<button id="cover-sm-btn" class="pr-font-btn pr-sm" type="button" aria-label="글자 작게">가</button><div class="pr-font-divider"></div><button id="cover-lg-btn" class="pr-font-btn pr-lg" type="button" aria-label="글자 크게">가</button>';
    var sm=box.querySelector('.pr-sm'),lg=box.querySelector('.pr-lg');
    if(sm)sm.onclick=function(e){e.preventDefault();e.stopPropagation();adjustSharedFont(-1)};
    if(lg)lg.onclick=function(e){e.preventDefault();e.stopPropagation();adjustSharedFont(1)};
  }
  function setEmojiIcons(){var icons={'cc-1':'✝️','cc-2':'⛪','cc-3':'🙏','cc-4':'🌿','cc-5':'🥾','cc-6':'🌐','cc-7':'🧭'};Object.keys(icons).forEach(function(id){var btn=el(id);if(!btn)return;var wrap=btn.querySelector('.cover-icon-wrap');if(wrap)wrap.innerHTML='<span class="cover-emoji" aria-hidden="true">'+icons[id]+'</span>';});}
  function configureQna(){
    window.QNA_FORM_URL=QA_URL;
    var q=el('qna-list');
    if(q) q.innerHTML='';
  }
  window.qnaOpenFormUrl=function(){ if(typeof window.goQaFirebase==='function') window.goQaFirebase(); else location.href=QA_URL; };
  function wireQnaButton(){var btn=el('qna-cover-btn');if(btn)btn.onclick=function(ev){if(ev)ev.preventDefault();window.openQnaView();};}
  window.openQnaView=function(){
    try{ configureQna(); }catch(e){ console.warn('[가톨릭길동무]', e); }
    location.href=QA_URL;
  };
  window.goQaFirebase=function(){ location.href=QA_URL; };
  window.qnaShowTab=function(){ configureQna(); };
  function boot(){ensureCoverControls();setEmojiIcons();configureQna();wireQnaButton();applyScale();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.addEventListener('load',function(){boot();setTimeout(boot,250);setTimeout(boot,900);},{once:true});window.addEventListener('pageshow',boot);
})();



(function(){
  var coverEl = document.getElementById('cover');
  if(coverEl) coverEl.style.willChange = 'auto';
  
  var observer = new MutationObserver(function(mutations){
    mutations.forEach(function(m){
      if(m.attributeName === 'class'){
        var el = m.target;
        if(el.classList.contains('open')){
          el.style.contain = 'none';
        } else {
          setTimeout(function(){ el.style.contain = ''; }, 300);
        }
      }
    });
  });
  
  ['missa-view','diocese-view','prayer-view','web-view','trail-view','qna-view'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) observer.observe(el, {attributes:true, attributeFilter:['class']});
  });
})();


(function(){
  'use strict';
  if(window.__APP_BACK_ROUTE_GUARD__) return;
  window.__APP_BACK_ROUTE_GUARD__ = true;

  function $(id){return document.getElementById(id);}
  function flash(el, dir){
    if(!el) return;
    el.classList.remove('oai-swipe-left','oai-swipe-right');
    void el.offsetWidth;
    el.classList.add(dir==='right'?'oai-swipe-right':'oai-swipe-left');
    setTimeout(function(){try{el.classList.remove('oai-swipe-left','oai-swipe-right');}catch(e){ console.warn("[가톨릭길동무]", e); }},240);
  }

  function bindWebSwipe(){
    var el=$('web-list');
    if(!el || el.__oaiFinalWebSwipe) return;
    el.__oaiFinalWebSwipe = true;
    var sx=0, sy=0;
    var THRESHOLD = 32;
    var HORIZONTAL_RATIO = 1.03;
    function isHorizontalSwipe(dx, dy){
      return Math.abs(dx) >= THRESHOLD && Math.abs(dx) >= Math.abs(dy) * HORIZONTAL_RATIO;
    }
    el.addEventListener('touchstart', function(e){
      if(!e.touches || !e.touches[0]) return;
      sx=e.touches[0].clientX; sy=e.touches[0].clientY;
    }, {passive:true});
    el.addEventListener('touchend', function(e){
      if(!e.changedTouches || !e.changedTouches[0]) return;
      var dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
      if(!isHorizontalSwipe(dx, dy)) return;
      var tabs=Array.prototype.slice.call(document.querySelectorAll('#web-cats .web-cat-btn'));
      if(!tabs.length) return;
      var cur=tabs.findIndex(function(b){return b.classList.contains('on');});
      if(cur<0) cur=0;
      var next = dx<0 ? (cur+1)%tabs.length : (cur-1+tabs.length)%tabs.length;
      var nextCat = tabs[next].dataset.webCat || tabs[next].id.replace('web-cat_','');
      if(typeof window.setWebCat==='function') window.setWebCat(nextCat);
      else tabs[next].click();
      if(typeof window.oaiSwipeAction==='function') window.oaiSwipeAction($('web-list'), dx<0?'left':'right');
      else flash($('web-list'), dx<0?'left':'right');
    }, {passive:true});
  }

  function restoreYellowMarkerFromRoute(dest){
    if(!dest || !dest.lat) return;
    setTimeout(function(){
      try{
        var items = (typeof _getCurrentItems==='function') ? _getCurrentItems() : [];
        var idx = (typeof dest.idx==='number' && dest.idx>=0) ? dest.idx : items.findIndex(function(p){return Number(p.lat)===Number(dest.lat)&&Number(p.lng)===Number(dest.lng);});
        var item = idx>=0 ? items[idx] : (dest.item || null);
        if(typeof _mode!=='undefined'){
          if(_mode==='shrine' && idx>=0 && typeof _selectShrineMarker==='function') _selectShrineMarker(idx);
          else if(_mode==='parish' && item && typeof _selectParishMarker==='function') _selectParishMarker(item);
          else if(_mode==='retreat' && item && typeof _selectRetreatMarker==='function') _selectRetreatMarker(item);
        }
        if(item && typeof _showInfoCard==='function') _showInfoCard(item, idx);
        if(item && typeof _focusMarkerAboveInfoCard==='function') _focusMarkerAboveInfoCard(item);
      }catch(e){ console.warn("[가톨릭길동무]", e); }
    },90);
  }

  function wrapRouteReset(){
    if(typeof resetRoute!=='function' || resetRoute.__oaiFinalWrapped) return;
    var old = resetRoute;
    resetRoute = function(){
      var dest=null;
      try{
        if(typeof _rE!=='undefined' && _rE && _rE.lat) dest={lat:_rE.lat,lng:_rE.lng,idx:_rE.idx,name:_rE.name};
        else if(typeof _curInfoItem!=='undefined' && _curInfoItem && _curInfoItem.item) dest={lat:_curInfoItem.item.lat,lng:_curInfoItem.item.lng,idx:_curInfoItem.idx,item:_curInfoItem.item,name:_curInfoItem.item.name};
      }catch(e){ console.warn("[가톨릭길동무]", e); }
      var isReselect=false;
      try{ isReselect=!!(arguments[0] && arguments[0].fromButton); }catch(e){ console.warn("[가톨릭길동무]", e); }
      var r = old.apply(this, arguments);
      if(!isReselect) restoreYellowMarkerFromRoute(dest);
      return r;
    };
    resetRoute.__oaiFinalWrapped = true;
    try{ window.resetRoute = resetRoute; }catch(e){ console.warn("[가톨릭길동무]", e); }
  }

  function watchRouteSheet(){
    var rs=$('sheet-route');
    if(!rs || rs.__oaiFinalRouteWatch) return;
    rs.__oaiFinalRouteWatch=true;
    var wasOpen=rs.classList.contains('open');
    new MutationObserver(function(){
      var open=rs.classList.contains('open');
      if(wasOpen && !open){
        var dest=null;
        try{
          if(typeof _rE!=='undefined' && _rE && _rE.lat) dest={lat:_rE.lat,lng:_rE.lng,idx:_rE.idx,name:_rE.name};
          else if(typeof _curInfoItem!=='undefined' && _curInfoItem && _curInfoItem.item) dest={lat:_curInfoItem.item.lat,lng:_curInfoItem.item.lng,idx:_curInfoItem.idx,item:_curInfoItem.item,name:_curInfoItem.item.name};
        }catch(e){ console.warn("[가톨릭길동무]", e); }
        restoreYellowMarkerFromRoute(dest);
      }
      wasOpen=open;
    }).observe(rs,{attributes:true,attributeFilter:['class']});
  }

  function init(){
    bindWebSwipe();
    wrapRouteReset();
    watchRouteSheet();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('load', init);
  window.addEventListener('pageshow', init);
})();
(function(){
  'use strict';
  window.oaiSwipeAction = function(el, dir){
    var ov=document.getElementById('oai-swipe-overlay');
    if(!ov){
      ov=document.createElement('div');
      ov.id='oai-swipe-overlay';
      document.body.appendChild(ov);
    }
    ov.textContent = dir==='left' ? '›' : '‹';
    ov.style.left  = dir==='left' ? 'auto' : '20px';
    ov.style.right = dir==='left' ? '20px' : 'auto';
    ov.classList.remove('active');
    void ov.offsetWidth;
    ov.classList.add('active');
    clearTimeout(ov._t);
    ov._t=setTimeout(function(){ try{ov.classList.remove('active');}catch(e){ console.warn("[가톨릭길동무]", e); } }, 420);
  };
})();
(function(){
  function removeMissaPopupState(){var mv=document.getElementById('missa-view');if(mv&&!document.documentElement.classList.contains('app-active')) mv.classList.remove('open');}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', removeMissaPopupState, {once:true});
  else removeMissaPopupState();
  window.addEventListener('pageshow', removeMissaPopupState);
})();
(function(){
  'use strict';
  if(window.__APP_PULL_REFRESH_CLEAN_V20_8__) return;
  window.__APP_PULL_REFRESH_CLEAN_V20_8__ = true;

  function $(id){ return document.getElementById(id); }
  function isTypingTarget(el){
    if(!el) return false;
    var tag=(el.tagName||'').toLowerCase();
    return tag==='input' || tag==='textarea' || el.isContentEditable;
  }
  function isCoverVisible(){
    var cover=$('cover');
    return !!(cover && !document.documentElement.classList.contains('app-active') && getComputedStyle(cover).display !== 'none');
  }
  function closeTransientViews(){
    try{
      document.querySelectorAll('.module-view.open,#prayer-view.open,#diocese-view.open,#missa-view.open,.sheet.open,.trail-sheet.open,#srch-modal.open,#info-card.open,#exit-dlg.open').forEach(function(v){
        v.classList.remove('open','show');
      });
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  function isRefreshDialogOpen(){
    try{ return !!document.getElementById('oai-refresh-content-dialog'); }catch(e){ return false; }
  }
  function isGuideModalOpen(){
    try{ return !!document.querySelector('.guide-modal.show') || isRefreshDialogOpen(); }catch(e){ return false; }
  }
  function closeGuideModals(){
    try{
      var mq = $('mass-quick-modal');
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
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }

  function hideIndicator(ind){
    if(!ind) return;
    ind.classList.remove('show','ready','refreshing');
    ind.style.removeProperty('transform');
  }
  function setIndicator(ind, state, dy){
    if(!ind) return;
    var y=Math.min(Math.max(dy||0,0),112);
    ind.style.setProperty('transform','translate(-50%,' + Math.round(y * 0.36) + 'px) scale(1)','important');
    ind.classList.add('show');
    ind.classList.toggle('ready', state === 'ready');
    ind.classList.toggle('refreshing', state === 'refreshing');
  }

  window.__oaiSoftCoverRefresh = function(){
    var cover=$('cover'), ind=$('cv-pull-modern');
    try{ if(typeof window._clearMassQuickReturnForReload === 'function') window._clearMassQuickReturnForReload(); }catch(e){ console.warn('[가톨릭길동무]', e); }
    try{
      document.documentElement.classList.remove('app-active','parish-mode','retreat-mode','oai-returning');
      closeTransientViews();
      closeGuideModals();
      if(cover){
        cover.style.display='';
        cover.style.opacity='';
        cover.style.pointerEvents='';
        cover.classList.remove('pulling','refreshing');
        cover.scrollTop=0;
      }
      hideIndicator(ind);
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  };

  function installPullRefresh(){
    var cover=$('cover'), ind=$('cv-pull-modern');
    if(!cover || cover.__oaiPullRefreshDisabledV1_74) return;
    cover.__oaiPullRefreshDisabledV1_74 = true;
    hideIndicator(ind);
  }

  window.addEventListener('pageshow', function(){
    try{
      var ind=$('cv-pull-modern');
      hideIndicator(ind);
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }, true);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installPullRefresh, {once:true});
  else installPullRefresh();
})();

(function(){
  'use strict';
  if(window.__APP_TABS_BACK_GUARD__) return;
  window.__APP_TABS_BACK_GUARD__=true;
  function $(id){return document.getElementById(id);}
  function fixRetreatTabLabel(){
    var lbl=$('tab-list-lbl');
    if(lbl && document.documentElement.classList.contains('retreat-mode')) lbl.textContent='피정의집 찾기';
    document.querySelectorAll('#tabbar .tab-btn').forEach(function(btn){
      btn.style.whiteSpace='nowrap';
      btn.style.minWidth='0';
      btn.style.maxWidth='none';
    });
  }
  var lastCover=false;
  function isCover(){var c=$('cover');return !!(c && !document.documentElement.classList.contains('app-active') && getComputedStyle(c).display!=='none');}
  function clearNativeExitToast(){
    try{window._exitReady=false; clearTimeout(window._exitTimer);}catch(e){ console.warn("[가톨릭길동무]", e); }
    try{var t=$('_bt'); if(t) t.remove(); var t2=$('oai-cover-exit-toast'); if(t2) t2.classList.remove('show');}catch(e){ console.warn("[가톨릭길동무]", e); }
  }
  if(typeof window._resetCoverExitReady !== 'function') window._resetCoverExitReady = clearNativeExitToast;
  function resetNativeExitToastOnCoverEntry(){
    var now=isCover();
    if(now && !lastCover){
      clearNativeExitToast();
      try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(e){ console.warn("[가톨릭길동무]", e); }
    }
    lastCover=now;
  }
  function resetNativeExitToastIfCover(){
    if(isCover()) clearNativeExitToast();
  }
  var oldGTC=window.goToCover;
  if(typeof oldGTC==='function'){
    window.goToCover=function(){
      var r=oldGTC.apply(this,arguments);
      clearNativeExitToast();
      try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(e){ console.warn("[가톨릭길동무]", e); }
      fixRetreatTabLabel();
      resetNativeExitToastIfCover();
      return r;
    };
  }
  function boot(){fixRetreatTabLabel();resetNativeExitToastOnCoverEntry();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('load',function(){boot();setTimeout(boot,200);},{once:true});
  try{new MutationObserver(function(){fixRetreatTabLabel();resetNativeExitToastOnCoverEntry();}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});}catch(e){ console.warn("[가톨릭길동무]", e); }
})();

(function(){
  if(window.__appTouchUxKeyboard20260506) return;
  window.__appTouchUxKeyboard20260506 = true;

  var ACTION_DELAY_MS = 55;
  var FEEDBACK_MS = 190;
  var PRESS_DELAY_MS = 85;
  var MOVE_CANCEL_PX = 7;

  var delayedSelectors = [
    '#cover .cover-card','#cover .cv-hotspot','#cover .cv-btn',
    '#prayer-list-view .pr-item','#prayer-list-view .prayer-item','#prayer-list-view .prayer-card','#prayer-list-view .prayer-list-item','#prayer-list-view .pr-list-item',
    '#trail-list .trail-card',
    '#region-body .list-item','#region-body .nearby-item','#region-body .region-item',
    '#nearby-list .nearby-item','#list-body .list-item',
    '.sheet .list-item','.sheet .nearby-item','.sheet .region-item',
    '.sm-item','.sm-place-item',
    '#web-list .web-card'
  ].join(',');

  var directSelectors = [
    'a','input','textarea','select','label',
    '#mass-quick-modal .mass-quick-btn',
    '.ic-link-btn','.ic-hp-btn','.ic-guide-btn',
    '.btn-kakao-route','.btn-kakao-nav','.c-btn',
    '.trail-foot','.web-card-foot','.trail-sh-foot','.trail-sh-body',
    '#close-btn','.module-close','.sheet-x','.sm-x','.ic-close-btn','.c-x',
    '#qna-cover-btn','.missa-open-link',
    '.btn-primary','.btn-secondary','#write-btn','#sb',
    '.filter-btn','.cat-opt','.tab','.tab-btn','.trail-tab','.web-cat-btn',
    '#prayer-search-input','#prayer-search-bar button'
  ].join(',');

  var activeTouch = null;

  function closest(el, sel){
    try{return el && el.closest ? el.closest(sel) : null;}catch(e){return null;}
  }
  function clearPress(el){
    if(!el) return;
    try{el.classList.remove('app-pressing');}catch(e){ console.warn("[가톨릭길동무]", e); }
    el.__appPressing = false;
  }
  function press(el){
    if(!el || el.__appPressing) return;
    el.__appPressing = true;
    el.classList.add('app-touchable','app-pressing');
    setTimeout(function(){ clearPress(el); }, FEEDBACK_MS);
  }

  var instantPressSelectors = '#mass-quick-modal .mass-quick-btn';
  document.addEventListener('pointerdown', function(e){
    var el = closest(e.target, instantPressSelectors);
    if(!el) return;
    press(el);
  }, true);

  function cancelActive(){
    if(!activeTouch) return;
    activeTouch.canceled = true;
    if(activeTouch.timer){ clearTimeout(activeTouch.timer); activeTouch.timer = null; }
    clearPress(activeTouch.el);
    try{ activeTouch.el.__appTouchCanceledUntil = Date.now() + 350; }catch(e){ console.warn("[가톨릭길동무]", e); }
  }

  document.addEventListener('pointerdown', function(e){
    if(closest(e.target, directSelectors)) return;
    var el = closest(e.target, delayedSelectors);
    if(!el) return;
    activeTouch = { el:el, id:e.pointerId, x:e.clientX, y:e.clientY, canceled:false, timer:null };
    activeTouch.timer = setTimeout(function(){
      if(activeTouch && activeTouch.el === el && !activeTouch.canceled) press(el);
    }, PRESS_DELAY_MS);
  }, true);

  document.addEventListener('pointermove', function(e){
    if(!activeTouch || activeTouch.id !== e.pointerId) return;
    var dx = Math.abs(e.clientX - activeTouch.x);
    var dy = Math.abs(e.clientY - activeTouch.y);
    if(dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) cancelActive();
  }, true);

  document.addEventListener('pointercancel', cancelActive, true);
  document.addEventListener('pointerup', function(e){
    if(!activeTouch || activeTouch.id !== e.pointerId) return;
    if(activeTouch.timer){ clearTimeout(activeTouch.timer); activeTouch.timer = null; }
    if(activeTouch.canceled) clearPress(activeTouch.el);
    activeTouch = null;
  }, true);

  document.addEventListener('click', function(e){
    if(e.__oaiTouchReplay) return;
    if(closest(e.target, directSelectors)) return;
    var el = closest(e.target, delayedSelectors);
    if(!el) return;
    if(el.__appTouchCanceledUntil && Date.now() < el.__appTouchCanceledUntil){
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    if(el.__appClickDelay) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    press(el);
    el.__appClickDelay = true;
    setTimeout(function(){
      try{
        var ev = new MouseEvent('click', {bubbles:true,cancelable:true,view:window});
        ev.__oaiTouchReplay = true;
        el.dispatchEvent(ev);
      }catch(err){
        try{ el.click(); }catch(_e){ console.warn("[가톨릭길동무]", _e); }
      }
      setTimeout(function(){ el.__appClickDelay = false; }, 0);
    }, ACTION_DELAY_MS);
  }, true);

  function disableKeyboardSuggestions(root){
    root = root || document;
    var nodes = root.querySelectorAll ? root.querySelectorAll('input[type="text"], input[type="search"], input:not([type]), textarea') : [];
    nodes.forEach(function(el){
      if(el.type === 'number' || el.type === 'tel' || el.type === 'email') return;
      el.setAttribute('autocomplete','off');
      el.setAttribute('autocorrect','off');
      el.setAttribute('autocapitalize','off');
      el.setAttribute('spellcheck','false');
      el.setAttribute('enterkeyhint','done');
    });
  }
  disableKeyboardSuggestions(document);
  document.addEventListener('DOMContentLoaded', function(){ disableKeyboardSuggestions(document); });
  try{
    var mo = new MutationObserver(function(muts){
      for(var i=0;i<muts.length;i++){
        for(var j=0;j<muts[i].addedNodes.length;j++){
          var n=muts[i].addedNodes[j];
          if(n && n.nodeType===1) disableKeyboardSuggestions(n);
        }
      }
    });
    mo.observe(document.documentElement,{childList:true,subtree:true});
  }catch(e){ console.warn("[가톨릭길동무]", e); }
})();
