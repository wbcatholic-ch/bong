
'use strict';

function hideCoverAndRun(callback) {
  try{
    document.querySelectorAll('.module-view.open,#prayer-view.open,#diocese-view.open,#missa-view.open').forEach(function(v){v.classList.remove('open');});
    var pd=document.getElementById('prayer-detail'); if(pd) pd.classList.remove('show');
    if(typeof closeAllTabs==='function') closeAllTabs();
    if(typeof closeInfoCard==='function') closeInfoCard();
    window.__OAI_PRAYER_COVER_NEEDS_FIRST_TOAST__ = false;
    sessionStorage.removeItem('oai_prayer_cover_needs_first_toast');
  }catch(e){ console.warn("[가톨릭길동무]", e); }
  window._noAutoNearby = false;
  var cv = document.getElementById('cover');
  if (cv) cv.style.display = 'none';
  document.documentElement.classList.add('app-active');
  if (callback) requestAnimationFrame(function(){ setTimeout(callback, 0); });
}


var OAI_EXTERNAL_LEAVE_HOLD_MS = 6000;
var OAI_EXTERNAL_LEAVE_HARD_MS = 6500;
var OAI_EXTERNAL_RETURN_MIN_MS = 1500;
var OAI_EXTERNAL_RETURN_MAX_MS = 4500;
var OAI_EXTERNAL_RETURN_STABLE_TICKS = 4;
var OAI_REFRESH_VEIL_MS = 1000;
var OAI_REFRESH_CARRY_MS = 3000;
var OAI_REFRESH_PROGRESS_HOLD_MS = 10000;
var OAI_REFRESH_PRE_NAV_HOLD_MS = 2500;

function markExternalReturnStabilize(kind){
  try{
    var now = Date.now ? Date.now() : new Date().getTime();
    var stamp = String(now);
    sessionStorage.setItem('oai_external_nav_started_at', stamp);
    sessionStorage.setItem('oai_external_nav_kind', kind || 'external');
    sessionStorage.setItem('oai_external_nav_pending', '1');
    sessionStorage.setItem('oai_external_nav_hold_until', String(now + OAI_EXTERNAL_LEAVE_HOLD_MS));
    sessionStorage.setItem('oai_external_nav_force_release_at', String(now + OAI_EXTERNAL_LEAVE_HARD_MS));
    document.documentElement.classList.add('oai-external-leaving');
    if(typeof oaiHoldStabilityVeil === 'function') oaiHoldStabilityVeil('external-leave', OAI_EXTERNAL_LEAVE_HOLD_MS);
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}

function oaiIsRefreshVeilReason(reason){
  return /refresh|reload|background/i.test(String(reason || ''));
}
function oaiRefreshVeilVisibleUntil(){
  try{
    var stored = parseInt(sessionStorage.getItem('oai_refresh_veil_visible_until') || '0', 10) || 0;
    var local = parseInt(window.__oaiRefreshVeilLocalVisibleUntil || '0', 10) || 0;
    return Math.max(stored, local);
  }catch(_e){ return parseInt(window.__oaiRefreshVeilLocalVisibleUntil || '0', 10) || 0; }
}
function oaiReleaseStabilityVeil(){
  try{
    var root = document.documentElement;
    var reason = root.getAttribute('data-oai-stability-reason') || '';
    if(oaiIsRefreshVeilReason(reason)){
      var minUntil = oaiRefreshVeilVisibleUntil();
      var now = Date.now ? Date.now() : new Date().getTime();
      if(minUntil && now < minUntil){
        clearTimeout(window.__oaiStabilityVeilTimer);
        window.__oaiStabilityVeilTimer = setTimeout(oaiReleaseStabilityVeil, Math.max(80, Math.min(900, minUntil - now)));
        return;
      }
    }
    if(reason === 'external-leave'){
      var pending = false, pageHidden = false, forceAt = 0;
      try{
        pending = sessionStorage.getItem('oai_external_nav_pending') === '1';
        pageHidden = sessionStorage.getItem('oai_external_nav_pagehide') === '1' || document.visibilityState === 'hidden';
        forceAt = parseInt(sessionStorage.getItem('oai_external_nav_force_release_at') || '0', 10) || 0;
      }catch(_e){}
      if(pending && pageHidden){
        clearTimeout(window.__oaiStabilityVeilTimer);
        window.__oaiStabilityVeilTimer = setTimeout(oaiReleaseStabilityVeil, 900);
        return;
      }
      if(pending && !pageHidden && forceAt && Date.now && Date.now() < forceAt){
        clearTimeout(window.__oaiStabilityVeilTimer);
        window.__oaiStabilityVeilTimer = setTimeout(oaiReleaseStabilityVeil, Math.min(900, Math.max(120, forceAt - Date.now())));
        return;
      }
      if(pending && !pageHidden && forceAt && Date.now && Date.now() >= forceAt){
        try{
          sessionStorage.removeItem('oai_external_nav_pending');
          sessionStorage.removeItem('oai_external_nav_hold_until');
          sessionStorage.removeItem('oai_external_nav_force_release_at');
        }catch(_e){}
      }
    }
    clearTimeout(window.__oaiStabilityVeilTimer);
    if(root.classList.contains('oai-stability-veil') && !root.classList.contains('oai-stability-veil-releasing')){
      root.classList.add('oai-stability-veil-releasing');
      setTimeout(function(){
        try{
          root.classList.remove('oai-stability-veil','oai-external-return-freeze','oai-external-leaving','oai-stability-veil-releasing');
          root.removeAttribute('data-oai-stability-reason');
          try{ sessionStorage.removeItem('oai_refresh_veil_visible_until'); window.__oaiRefreshVeilLocalVisibleUntil = 0; }catch(_e){}
        }catch(_e){}
      }, 180);
    }else{
      root.classList.remove('oai-stability-veil','oai-external-return-freeze','oai-external-leaving','oai-stability-veil-releasing');
      root.removeAttribute('data-oai-stability-reason');
      try{ sessionStorage.removeItem('oai_refresh_veil_visible_until'); window.__oaiRefreshVeilLocalVisibleUntil = 0; }catch(_e){}
    }
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}
function oaiHoldStabilityVeil(reason, duration){
  try{
    var root = document.documentElement;
    var d = duration || 420;
    root.classList.remove('oai-stability-veil-releasing');
    root.classList.add('oai-stability-veil');
    root.setAttribute('data-oai-stability-reason', reason || 'stabilize');
    clearTimeout(window.__oaiStabilityVeilTimer);
    window.__oaiStabilityVeilTimer = setTimeout(oaiReleaseStabilityVeil, d);
    clearTimeout(window.__oaiStabilityVeilHardTimer);
    var hard = (reason === 'external-leave') ? OAI_EXTERNAL_LEAVE_HARD_MS : Math.max(d + 650, 2200);
    window.__oaiStabilityVeilHardTimer = setTimeout(oaiReleaseStabilityVeil, hard);
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}
window.oaiHoldStabilityVeil = oaiHoldStabilityVeil;
window.oaiReleaseStabilityVeil = oaiReleaseStabilityVeil;

function oaiMarkRefreshHistoryCompact(reason){
  try{
    var now = Date.now ? Date.now() : new Date().getTime();
    sessionStorage.setItem('oai_refresh_history_compact_until', String(now + 10 * 60 * 1000));
    sessionStorage.setItem('oai_refresh_history_compact_reason', reason || 'refresh');
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function oaiPrepareRefreshVeil(reason, duration, carryDuration, showBeforeNavigation, beforeNavigationHold, carryToNextDocument){
  try{
    var d = Math.max(260, duration || OAI_REFRESH_VEIL_MS);
    var carry = Math.max(d + 1200, carryDuration || OAI_REFRESH_CARRY_MS || d);
    var now = Date.now ? Date.now() : new Date().getTime();
    var carryToNext = (carryToNextDocument !== false);
    if(carryToNext){
      sessionStorage.setItem('oai_refresh_veil_until', String(now + carry));
      sessionStorage.setItem('oai_refresh_veil_hold_ms', String(d));
      sessionStorage.removeItem('oai_refresh_veil_visible_until');
      sessionStorage.setItem('oai_refresh_veil_reason', reason || 'refresh');
    }else{
      sessionStorage.removeItem('oai_refresh_veil_until');
      sessionStorage.removeItem('oai_refresh_veil_hold_ms');
      sessionStorage.removeItem('oai_refresh_veil_reason');
      sessionStorage.removeItem('oai_refresh_veil_visible_until');
    }
    oaiMarkRefreshHistoryCompact(reason || 'refresh');
    if(showBeforeNavigation === true){
      var preHold = Math.max(d, beforeNavigationHold || d);
      window.__oaiRefreshVeilLocalVisibleUntil = now + d;
      if(carryToNext) sessionStorage.setItem('oai_refresh_veil_visible_until', String(now + d));
      oaiHoldStabilityVeil(reason || 'refresh', preHold);
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function oaiAfterRefreshVeilPaint(callback){
  try{
    var run=function(){ setTimeout(function(){ try{ callback(); }catch(e){ console.warn('[가톨릭길동무]', e); } }, 90); };
    if(window.requestAnimationFrame){ requestAnimationFrame(function(){ requestAnimationFrame(run); }); }
    else setTimeout(run, 32);
  }catch(e){ try{ callback(); }catch(_e){} }
}
function oaiApplyPendingRefreshVeil(){
  try{
    var root = document.documentElement;
    var now = Date.now ? Date.now() : new Date().getTime();
    var until = parseInt(sessionStorage.getItem('oai_refresh_veil_until') || '0', 10) || 0;
    var holdMs = parseInt(sessionStorage.getItem('oai_refresh_veil_hold_ms') || '0', 10) || 0;
    var reason = sessionStorage.getItem('oai_refresh_veil_reason') || 'refresh-return';
    if(until > now){
      var showFor = Math.max(260, holdMs || Math.min(1200, Math.max(260, until - now)));
      var visibleUntil = parseInt(sessionStorage.getItem('oai_refresh_veil_visible_until') || '0', 10) || 0;
      var minVisibleUntil = now + showFor;
      if(!visibleUntil || visibleUntil < minVisibleUntil) visibleUntil = minVisibleUntil;
      try{ sessionStorage.setItem('oai_refresh_veil_visible_until', String(visibleUntil)); }catch(_e){}

      if(root.classList.contains('oai-stability-veil') && oaiIsRefreshVeilReason(root.getAttribute('data-oai-stability-reason') || reason)){
        root.classList.remove('oai-stability-veil-releasing');
        root.setAttribute('data-oai-stability-reason', reason || 'refresh-return');
        root.removeAttribute('data-oai-refresh-early-veil');
        clearTimeout(window.__oaiStabilityVeilTimer);
        window.__oaiStabilityVeilTimer = setTimeout(oaiReleaseStabilityVeil, Math.max(0, visibleUntil - now));
        clearTimeout(window.__oaiStabilityVeilHardTimer);
        window.__oaiStabilityVeilHardTimer = setTimeout(oaiReleaseStabilityVeil, Math.max(1600, visibleUntil - now + 900));
      }else{
        try{ sessionStorage.setItem('oai_refresh_veil_visible_until', String(now + showFor)); }catch(_e){}
        oaiHoldStabilityVeil(reason || 'refresh-return', showFor);
      }
      setTimeout(function(){
        try{
          sessionStorage.removeItem('oai_refresh_veil_until');
          sessionStorage.removeItem('oai_refresh_veil_hold_ms');
          sessionStorage.removeItem('oai_refresh_veil_reason');
        }catch(_e){}
      }, Math.max(300, Math.max(visibleUntil - now, showFor) + 320));
    }else if(until){
      sessionStorage.removeItem('oai_refresh_veil_until');
      sessionStorage.removeItem('oai_refresh_veil_hold_ms');
      sessionStorage.removeItem('oai_refresh_veil_reason');
      sessionStorage.removeItem('oai_refresh_veil_visible_until');
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
window.oaiPrepareRefreshVeil = oaiPrepareRefreshVeil;
window.oaiMarkRefreshHistoryCompact = oaiMarkRefreshHistoryCompact;
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', oaiApplyPendingRefreshVeil, {once:true});
else oaiApplyPendingRefreshVeil();


function oaiInternalReturnNoEffectPending(){
  try{
    var until = parseInt(sessionStorage.getItem('oai_internal_return_no_effect_until') || '0', 10) || 0;
    var now = Date.now ? Date.now() : new Date().getTime();
    return sessionStorage.getItem('oai_internal_return_no_effect_once') === '1' || (until && now < until);
  }catch(_e){ return false; }
}
function oaiClearInternalReturnEffects(reason){
  try{
    var root = document.documentElement;
    root.classList.remove(
      'oai-internal-no-return-effect',
      'oai-cover-booting',
      'oai-cover-resizing',
      'oai-returning',
      'oai-diocese-returning',
      'oai-external-return-freeze',
      'oai-external-leaving',
      'oai-stability-veil',
      'oai-stability-veil-releasing',
      'oai-category-entering',
      'oai-category-dissolve',
      'oai-category-dissolving'
    );
    root.removeAttribute('data-oai-stability-reason');
    root.removeAttribute('data-oai-external-return-early');
    root.removeAttribute('data-oai-refresh-early-veil');
    var veil = document.getElementById('oai-category-entry-veil');
    if(veil){ veil.style.opacity=''; veil.className=''; }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{
    clearTimeout(window.__oaiStabilityVeilTimer);
    clearTimeout(window.__oaiStabilityVeilHardTimer);
    clearTimeout(window.__oaiCategoryDissolveTimer);
    clearTimeout(window.__oaiCategoryVeilTimer);
    sessionStorage.removeItem('oai_internal_return_no_effect_once');
    sessionStorage.removeItem('oai_internal_return_no_effect_until');
    sessionStorage.removeItem('oai_internal_page_nav');
    sessionStorage.removeItem('oai_external_nav_started_at');
    sessionStorage.removeItem('oai_external_nav_pagehide');
    sessionStorage.removeItem('oai_external_nav_kind');
    sessionStorage.removeItem('oai_external_nav_pending');
    sessionStorage.removeItem('oai_external_nav_hold_until');
    sessionStorage.removeItem('oai_external_nav_force_release_at');
    sessionStorage.removeItem('oai_refresh_veil_until');
    sessionStorage.removeItem('oai_refresh_veil_hold_ms');
    sessionStorage.removeItem('oai_refresh_veil_reason');
    sessionStorage.removeItem('oai_refresh_veil_visible_until');
    window.__oaiRefreshVeilLocalVisibleUntil = 0;
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function oaiConsumeInternalReturnNoEffect(reason){
  try{
    if(oaiInternalReturnNoEffectPending()){
      oaiClearInternalReturnEffects(reason || 'internal-return');
      return true;
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  return false;
}
window.oaiClearInternalReturnEffects = oaiClearInternalReturnEffects;
window.oaiConsumeInternalReturnNoEffect = oaiConsumeInternalReturnNoEffect;

function oaiClearExternalNavigationState(opts){
  opts = opts || {};
  try{
    var html = document.documentElement;
    html.classList.remove('oai-navigating-out','oai-external-return-prepaint','oai-external-return-stabilize','oai-missa-return-stabilize','oai-external-leaving');
    html.removeAttribute('data-oai-external-return-early');
    if(!opts.keepVeil){
      html.classList.remove('oai-external-return-freeze');
      var reason = html.getAttribute('data-oai-stability-reason') || '';
      if(!oaiIsRefreshVeilReason(reason)){
        html.classList.remove('oai-stability-veil','oai-stability-veil-releasing');
        html.removeAttribute('data-oai-stability-reason');
      }
    }
    sessionStorage.removeItem('oai_external_nav_started_at');
    sessionStorage.removeItem('oai_external_nav_pagehide');
    sessionStorage.removeItem('oai_external_nav_kind');
    sessionStorage.removeItem('oai_external_nav_pending');
    sessionStorage.removeItem('oai_external_nav_hold_until');
    sessionStorage.removeItem('oai_external_nav_force_release_at');
  }catch(e){ console.warn("[가톨릭길동무]", e); }
  try{
    var v = document.getElementById('oai-nav-veil');
    if(v && v.parentNode) v.parentNode.removeChild(v);
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}

function oaiSmoothNavigate(url, kind){
  if(!url) return;
  try{
    if(typeof normalizeCatholicExternalUrl === 'function') url = normalizeCatholicExternalUrl(url);
    else url = String(url || '').trim();
  }catch(_e){ url = String(url || '').trim(); }
  if(!url) return;
  try{ document.activeElement && document.activeElement.blur && document.activeElement.blur(); }catch(e){ console.warn("[가톨릭길동무]", e); }
  try{ markExternalReturnStabilize(kind || 'external'); }catch(e){ console.warn("[가톨릭길동무]", e); }
  setTimeout(function(){
    try{ location.assign(url); }catch(e){ try{ location.href = url; }catch(_){ } }
  }, 70);
}

function oaiMeasureExternalViewport(){
  try{
    var vv = window.visualViewport || null;
    return [
      Math.round(window.innerWidth || 0),
      Math.round(window.innerHeight || 0),
      Math.round(vv && vv.height ? vv.height : 0),
      Math.round(vv && vv.offsetTop ? vv.offsetTop : 0),
      Math.round(window.scrollY || document.documentElement.scrollTop || 0)
    ].join('|');
  }catch(_e){ return '0'; }
}
function oaiReleasePassiveVeil(){
  try{
    if(oaiConsumeInternalReturnNoEffect('passive-internal-return')) return;
    var reason = document.documentElement.getAttribute('data-oai-stability-reason') || '';
    if(/external-leave|external-return/i.test(reason)) return;
    oaiReleaseStabilityVeil();
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function oaiGetExternalNavInfo(){
  try{
    var now = Date.now ? Date.now() : new Date().getTime();
    var ts = parseInt(sessionStorage.getItem('oai_external_nav_started_at') || '0', 10) || 0;
    var pending = sessionStorage.getItem('oai_external_nav_pending') === '1';
    var pageHidden = sessionStorage.getItem('oai_external_nav_pagehide') === '1';
    var forceAt = parseInt(sessionStorage.getItem('oai_external_nav_force_release_at') || '0', 10) || 0;
    return {now:now, ts:ts, pending:pending, pageHidden:pageHidden, forceAt:forceAt};
  }catch(_e){ return {now:0, ts:0, pending:false, pageHidden:false, forceAt:0}; }
}
function oaiHasExternalReturnPending(){
  try{
    var info = oaiGetExternalNavInfo();
    return !!(info.ts && info.pageHidden && info.now && info.now - info.ts < 10 * 60 * 1000);
  }catch(_e){ return false; }
}
function oaiExternalReturnKind(){
  try{ return String(sessionStorage.getItem('oai_external_nav_kind') || ''); }catch(_e){ return ''; }
}
function oaiIsMyFaithExternalReturn(){
  return oaiExternalReturnKind() === 'my-faith-life';
}
function oaiIsExternalLeaveStillOpening(){
  try{
    var info = oaiGetExternalNavInfo();
    return !!(info.pending && !info.pageHidden && info.forceAt && info.now && info.now < info.forceAt);
  }catch(_e){ return false; }
}
function oaiStartExternalReturnStabilize(){
  try{
    var root = document.documentElement;
    if(window.__oaiExternalReturnStabilizing) return true;
    window.__oaiExternalReturnStabilizing = true;
    root.classList.remove('oai-stability-veil-releasing');
    root.classList.add('oai-external-return-freeze');
    root.removeAttribute('data-oai-external-return-early');
    oaiHoldStabilityVeil('external-return', OAI_EXTERNAL_RETURN_MAX_MS);

    var started = Date.now ? Date.now() : new Date().getTime();
    var minUntil = started + OAI_EXTERNAL_RETURN_MIN_MS;
    var maxUntil = started + OAI_EXTERNAL_RETURN_MAX_MS;
    var last = oaiMeasureExternalViewport();
    var stableCount = 0;
    clearInterval(window.__oaiExternalReturnStableTimer);

    function finish(){
      try{
        clearInterval(window.__oaiExternalReturnStableTimer);
        window.__oaiExternalReturnStabilizing = false;
        oaiClearExternalNavigationState({keepVeil:true});
        oaiReleaseStabilityVeil();
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    window.__oaiExternalReturnStableTimer = setInterval(function(){
      try{
        var now = Date.now ? Date.now() : new Date().getTime();
        var cur = oaiMeasureExternalViewport();
        if(cur === last) stableCount++;
        else { stableCount = 0; last = cur; }
        if(now >= minUntil && stableCount >= OAI_EXTERNAL_RETURN_STABLE_TICKS){ finish(); return; }
        if(now >= maxUntil){ finish(); return; }
      }catch(e){ console.warn('[가톨릭길동무]', e); finish(); }
    }, 120);
    setTimeout(function(){
      try{ if(window.__oaiExternalReturnStabilizing) finish(); }catch(_e){}
    }, OAI_EXTERNAL_RETURN_MAX_MS + 260);
    return true;
  }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
}
function applyExternalReturnStabilize(){
  try{
    if(oaiConsumeInternalReturnNoEffect('apply-internal-return')) return;
    if(oaiHasExternalReturnPending()){
      if(oaiIsMyFaithExternalReturn()){
        oaiClearExternalNavigationState();
        try{ if(typeof window.oaiResumeMyFaithAfterExternal === 'function') window.oaiResumeMyFaithAfterExternal(); }catch(_e){}
        return;
      }
      oaiStartExternalReturnStabilize();
      return;
    }
    if(oaiIsExternalLeaveStillOpening()){
      return;
    }
    oaiClearExternalNavigationState();
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}

window.addEventListener('pageshow', applyExternalReturnStabilize, true);
window.addEventListener('pageshow', function(){ setTimeout(oaiReleasePassiveVeil, 2600); }, true);
window.addEventListener('focus', function(){ setTimeout(applyExternalReturnStabilize, 40); setTimeout(oaiReleasePassiveVeil, 2600); }, true);
window.addEventListener('pagehide', function(){
  try{ if(sessionStorage.getItem('oai_external_nav_pending') === '1') sessionStorage.setItem('oai_external_nav_pagehide','1'); }catch(e){ console.warn("[가톨릭길동무]", e); }
}, true);
document.addEventListener('visibilitychange', function(){
  try{
    if(document.visibilityState === 'hidden' && sessionStorage.getItem('oai_external_nav_pending') === '1') sessionStorage.setItem('oai_external_nav_pagehide','1');
    if(document.visibilityState === 'visible') setTimeout(applyExternalReturnStabilize, 60);
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}, true);

document.addEventListener('click', function(e){
  try{
    if(e.defaultPrevented) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if(!a) return;
    if(a.hasAttribute('download')) return;
    var raw = a.getAttribute('href') || '';
    if(!raw || raw.charAt(0)==='#' || /^(tel:|mailto:|sms:|javascript:)/i.test(raw)) return;
    var u = new URL(raw, location.href);
    if(u.origin === location.origin) return;
    if(typeof a.onclick === 'function') return;
    e.preventDefault();
    e.stopPropagation();
    oaiSmoothNavigate(u.toString(), 'anchor-external');
  }catch(err){ console.warn('[가톨릭길동무]', err); }
}, true);


function oaiSetMainMapLayerHidden(hidden){
  try{
    document.documentElement.classList.toggle('oai-hide-main-map-layer', !!hidden);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
window.oaiSetMainMapLayerHidden = oaiSetMainMapLayerHidden;




function _faithQuickOrder(target){
  if(target==='hymn') return 1;
  if(target==='bible') return 2;
  if(target==='prayer') return 3;
  if(target==='missa') return 4;
  return 9;
}
function _syncFaithQuickNav(current){
  try{
    document.querySelectorAll('.faith-quick-nav').forEach(function(nav){
      nav.dataset.current=current||'';
      nav.querySelectorAll('[data-faith-target]').forEach(function(btn){
        const target=btn.getAttribute('data-faith-target');
        btn.style.order=String(_faithQuickOrder(target));
        btn.style.display=(target===current)?'none':'inline-flex';
      });
    });
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _openFaithFrameView(kind,url,title){
  try{ localStorage.setItem('oai_last_'+kind+'_url', url); }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{ if(typeof _resetCoverExitReady==='function') _resetCoverExitReady(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{ if(typeof _clearCoverExitArmed==='function') _clearCoverExitArmed(); }catch(e){ console.warn('[가톨릭길동무]', e); }

  function showFaithFrame(){
    const view=$('missa-view');
    const frame=$('missa-frame');
    const titleEl=$('missa-bar-title');
    if(!view || !frame){ oaiSmoothNavigate(url, kind); return; }
    try{ document.querySelectorAll('.module-view.open,#prayer-view.open,#diocese-view.open,#trail-view.open,#web-view.open').forEach(function(v){ v.classList.remove('open'); }); }catch(e){ console.warn('[가톨릭길동무]', e); }
    try{ if(typeof closeAllTabs==='function') closeAllTabs(); }catch(e){ console.warn('[가톨릭길동무]', e); }
    try{ if(typeof closeInfoCard==='function') closeInfoCard(); }catch(e){ console.warn('[가톨릭길동무]', e); }
    try{ if(typeof oaiSetMainMapLayerHidden==='function') oaiSetMainMapLayerHidden(true); }catch(e){ console.warn('[가톨릭길동무]', e); }
    if(titleEl) titleEl.textContent=title;
    view.dataset.faithCurrent=kind;
    view.classList.add('open');
    _syncFaithQuickNav(kind);
    // 외부 신앙 화면은 iframe 로딩과 전환 효과가 겹치면 화면이 흔들릴 수 있어 진입 애니메이션을 생략한다.
    frame.src=url;
  }

  function run(){
    const cover=$('cover');
    if(cover && cover.style.display !== 'none') hideCoverAndRun(showFaithFrame);
    else showFaithFrame();
  }

  const mq=$('mass-quick-modal');
  if(mq && mq.classList.contains('show') && typeof _hideMassQuickMenuOnly==='function'){
    _hideMassQuickMenuOnly(run,{deferHideUntilAfter:true});
    return;
  }
  run();
}
function _openFaithQuickTarget(target){
  try{
    const mv=$('missa-view');
    if(mv) mv.classList.remove('open');
    const pv=$('prayer-view');
    if(pv && target!=='prayer') pv.classList.remove('open');
    if(target==='prayer'){
      try{ if(typeof oaiSetMainMapLayerHidden==='function') oaiSetMainMapLayerHidden(false); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ _setPrayerQuickReturn(true); }catch(e){ console.warn('[가톨릭길동무]', e); }
      if(typeof openPrayerBook==='function') openPrayerBook({fromMassQuick:true, instant:true});
      return;
    }
    if(target==='missa'){ openMissa(); return; }
    if(target==='hymn'){ openCatholicHymn(); return; }
    if(target==='bible'){ openCatholicBible(); return; }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function openMissa(){
  const today=new Date();
  const yyyy=today.getFullYear();
  const mm=String(today.getMonth()+1).padStart(2,'0');
  const dd=String(today.getDate()).padStart(2,'0');
  const url='https://missa.cbck.or.kr/DailyMissa/'+yyyy+mm+dd;
  _openFaithFrameView('missa', url, '✝ 매일미사');
}

function _setMassQuickReturn(on){
  try{
    window.__MASS_QUICK_RETURN__ = !!on;
    if(on){
      var stamp = String(Date.now());
      sessionStorage.setItem('oai_mass_quick_return','1');
      sessionStorage.setItem('oai_mass_quick_return_ts', stamp);
      localStorage.setItem('oai_mass_quick_return','1');
      localStorage.setItem('oai_mass_quick_return_ts', stamp);
    }else{
      sessionStorage.removeItem('oai_mass_quick_return');
      sessionStorage.removeItem('oai_mass_quick_return_ts');
      localStorage.removeItem('oai_mass_quick_return');
      localStorage.removeItem('oai_mass_quick_return_ts');
    }
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}
function _setPrayerQuickReturn(on){
  try{
    window.__MASS_QUICK_FROM_PRAYER__ = !!on;
    window.__OAI_PRAYER_FROM_QUICK_LOCK__ = !!on;
    if(on){
      var stamp = String(Date.now());
      sessionStorage.setItem('oai_prayer_quick_return','1');
      sessionStorage.setItem('oai_prayer_quick_return_ts', stamp);
      sessionStorage.setItem('oai_prayer_from_quick_lock','1');
    }else{
      sessionStorage.removeItem('oai_prayer_quick_return');
      sessionStorage.removeItem('oai_prayer_quick_return_ts');
      sessionStorage.removeItem('oai_prayer_from_quick_lock');
    }
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}
function _clearPrayerQuickReturn(){ _setPrayerQuickReturn(false); }
function _isFreshMassQuickReturnStore(store){
  try{
    if(!store || store.getItem('oai_mass_quick_return') !== '1') return false;
    var ts = parseInt(store.getItem('oai_mass_quick_return_ts') || '0', 10) || 0;
    if(!ts) return true;
    return Date.now() - ts < 5 * 60 * 1000;
  }catch(e){ return false; }
}
function _isFreshPrayerQuickReturn(){
  try{
    if(sessionStorage.getItem('oai_prayer_quick_return') !== '1') return false;
    var ts = parseInt(sessionStorage.getItem('oai_prayer_quick_return_ts') || '0', 10) || 0;
    if(!ts) return true;
    return Date.now() - ts < 30 * 60 * 1000;
  }catch(e){ return false; }
}
function _shouldMassQuickReturn(){
  try{
    return window.__MASS_QUICK_RETURN__ === true ||
      _isFreshMassQuickReturnStore(sessionStorage) ||
      _isFreshMassQuickReturnStore(localStorage);
  }catch(e){ console.warn("[가톨릭길동무]", e); return window.__MASS_QUICK_RETURN__ === true; }
}
function _shouldPrayerQuickReturn(){
  try{
    return window.__MASS_QUICK_FROM_PRAYER__ === true ||
      window.__OAI_PRAYER_FROM_QUICK_LOCK__ === true ||
      sessionStorage.getItem('oai_prayer_from_quick_lock') === '1' ||
      _isFreshPrayerQuickReturn();
  }catch(e){ console.warn("[가톨릭길동무]", e); return window.__MASS_QUICK_FROM_PRAYER__ === true || window.__OAI_PRAYER_FROM_QUICK_LOCK__ === true; }
}
function _isPageReloadNavigation(){
  try{
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation');
    if(nav && nav[0] && nav[0].type === 'reload') return true;
  }catch(e){ console.warn("[가톨릭길동무]", e); }
  try{ return performance.navigation && performance.navigation.type === 1; }
  catch(e){ return false; }
}
function _clearMassQuickReturnForReload(){
  try{
    window.__MASS_QUICK_RETURN__ = false;
    sessionStorage.removeItem('oai_mass_quick_return');
    sessionStorage.removeItem('oai_mass_quick_return_ts');
    localStorage.removeItem('oai_mass_quick_return');
    localStorage.removeItem('oai_mass_quick_return_ts');
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}
if(_isPageReloadNavigation()){
  _clearMassQuickReturnForReload();
  _clearPrayerQuickReturn();
}

function _armMassQuickHistoryTrap(opts){
  try{
    opts = opts || {};
    var href = location.href.split('#')[0];
    if(opts && opts.skip){
      return;
    }
    // V6-127: 매일미사/성가/성경에서 배너로 복귀한 경우, 배너 뒤로가기가 바로 앱종료로 빠지지 않도록
    // cover root + mass quick trap을 다시 명확히 만든다.
    if(opts && opts.force){
      history.replaceState({_p:0, oai_cover_root:opts.reason||'mass-quick-root'}, '', href);
      history.pushState({_p:1, oai_mass_quick:1, oai_from_faith:opts.fromFaith?1:0}, '', href);
      return;
    }
    history.pushState({_p:1, oai_mass_quick:1}, '', href);
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}
function _hideMassQuickMenuOnly(afterHidden, opts){
  const modal=document.getElementById('mass-quick-modal');
  var deferHideUntilAfter = !!(opts && opts.deferHideUntilAfter);
  _resetCoverExitReady();
  _clearCoverExitArmed();

  function hideQuickModal(){
    if(modal){
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden','true');
    }
  }

  if(!deferHideUntilAfter) hideQuickModal();

  function done(){
    try{
      if(typeof afterHidden === 'function') afterHidden();
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    finally{
      if(deferHideUntilAfter){
        if(window.requestAnimationFrame) requestAnimationFrame(hideQuickModal);
        else setTimeout(hideQuickModal, 0);
      }
    }
  }

  try{
    var st = history.state;
    if(st && st.oai_mass_quick){
      window.__OAI_MQ_STATE_POPPING__ = Date.now() + 1200;
      window.__OAI_AFTER_MQ_STATE_POP__ = done;
      history.back();
      setTimeout(function(){
        try{
          if(window.__OAI_AFTER_MQ_STATE_POP__ === done){
            window.__OAI_MQ_STATE_POPPING__ = 0;
            window.__OAI_AFTER_MQ_STATE_POP__ = null;
            done();
          }
        }catch(e){ console.warn('[가톨릭길동무]', e); }
      }, 220);
      return true;
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }

  if(typeof afterHidden === 'function'){
    if(window.requestAnimationFrame) requestAnimationFrame(done);
    else setTimeout(done, 0);
  }
  return false;
}
function _isCoverAlreadyVisibleForQuickMenu(){
  try{
    var cover=document.getElementById('cover');
    return !!(cover && !document.documentElement.classList.contains('app-active') && getComputedStyle(cover).display !== 'none');
  }catch(e){ return false; }
}
function _setPrayerPopupReturnSource(on){
  try{
    window.__MASS_QUICK_POPUP_FROM_PRAYER__ = !!on;
    if(on) sessionStorage.setItem('oai_mass_quick_popup_from_prayer','1');
    else sessionStorage.removeItem('oai_mass_quick_popup_from_prayer');
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _isPrayerPopupReturnSource(){
  try{
    return window.__MASS_QUICK_POPUP_FROM_PRAYER__ === true ||
      sessionStorage.getItem('oai_mass_quick_popup_from_prayer') === '1';
  }catch(e){ return window.__MASS_QUICK_POPUP_FROM_PRAYER__ === true; }
}

function _markPrayerCoverNeedsFirstToast(on){
  try{
    window.__OAI_PRAYER_COVER_NEEDS_FIRST_TOAST__ = !!on;
    if(on) sessionStorage.setItem('oai_prayer_cover_needs_first_toast','1');
    else sessionStorage.removeItem('oai_prayer_cover_needs_first_toast');
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _consumePrayerCoverNeedsFirstToast(){
  try{
    var on = window.__OAI_PRAYER_COVER_NEEDS_FIRST_TOAST__ === true ||
      sessionStorage.getItem('oai_prayer_cover_needs_first_toast') === '1';
    if(on) _markPrayerCoverNeedsFirstToast(false);
    return !!on;
  }catch(e){ return window.__OAI_PRAYER_COVER_NEEDS_FIRST_TOAST__ === true; }
}
function _forceCoverAfterPrayerQuickPopup(){
  try{
    var modal=document.getElementById('mass-quick-modal');
    if(modal){
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden','true');
      try{ delete modal.dataset.returnSource; }catch(_e){}
    }
    var pv=document.getElementById('prayer-view');
    var pd=document.getElementById('prayer-detail');
    if(pd) pd.classList.remove('show');
    if(pv){
      pv.classList.remove('open');
      try{ delete pv.dataset.quickSource; }catch(_e){}
    }
    document.querySelectorAll('.module-view.open,#diocese-view.open,#missa-view.open').forEach(function(v){ v.classList.remove('open'); });
    document.documentElement.classList.remove('app-active','parish-mode','retreat-mode');
    if(typeof oaiSetMainMapLayerHidden==='function') oaiSetMainMapLayerHidden(false);
    var cv=document.getElementById('cover');
    if(cv){
      cv.style.display='';
      cv.style.opacity='';
      cv.style.pointerEvents='';
      cv.scrollTop=0;
    }
    _setPrayerPopupReturnSource(false);
    _setMassQuickReturn(false);
    _clearPrayerQuickReturn();
    _resetCoverExitReady();
    _clearCoverExitArmed();
    _markPrayerCoverNeedsFirstToast(false);
    try{
      window.__OAI_PRAYER_POPUP_COVER_GUARD_UNTIL__ = 0;
      window.__OAI_PRAYER_COVER_FORCE_FIRST_TOAST_UNTIL__ = Date.now() + 10000;
    }catch(_e){}
    function prime(reason){
      try{
        if(document.documentElement.classList.contains('app-active')) return;
        var mq=document.getElementById('mass-quick-modal');
        if(mq && mq.classList.contains('show')) return;
        _resetCoverExitReady();
        _clearCoverExitArmed();
        if(typeof _resetCoverBackTrap === 'function') _resetCoverBackTrap(reason);
        else _ensureCoverBackTrap();
      }catch(_e){}
    }
    prime('prayer-popup-cover');
    if(window.requestAnimationFrame) requestAnimationFrame(function(){ prime('prayer-popup-cover-raf'); });
    setTimeout(function(){ prime('prayer-popup-cover-settle-80'); }, 80);
    setTimeout(function(){ prime('prayer-popup-cover-settle-220'); }, 220);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _openPrayerReturnQuickMenuStable(){
  try{
    var modal=document.getElementById('mass-quick-modal');
    var cv=document.getElementById('cover');
    var pv=document.getElementById('prayer-view');
    var pd=document.getElementById('prayer-detail');
    if(pd) pd.classList.remove('show');
    if(pv){
      pv.classList.remove('open');
      try{ delete pv.dataset.quickSource; }catch(_e){}
    }
    document.documentElement.classList.remove('app-active','parish-mode','retreat-mode');
    if(typeof oaiSetMainMapLayerHidden==='function') oaiSetMainMapLayerHidden(false);
    if(cv){
      cv.style.display='';
      cv.style.opacity='';
      cv.style.pointerEvents='';
      cv.scrollTop=0;
    }
    _resetCoverExitReady();
    _clearCoverExitArmed();
    _setPrayerPopupReturnSource(true);
    _setMassQuickReturn(false);
    _clearPrayerQuickReturn();
    if(modal){
      try{ modal.dataset.returnSource='prayer'; }catch(_e){}
    }
    try{ if(typeof _ensureCoverBackTrap === 'function') _ensureCoverBackTrap('prayer-return-popup'); }catch(_e){}
    openMassQuickMenu({keepReturn:true, fromPrayerReturn:true});
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _schedulePrayerReturnQuickMenuStable(){
  var called=false;
  function run(){
    if(called) return;
    called=true;
    try{
      window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP__ = null;
      window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP_UNTIL__ = 0;
    }catch(_e){}
    if(window.requestAnimationFrame) requestAnimationFrame(_openPrayerReturnQuickMenuStable);
    else setTimeout(_openPrayerReturnQuickMenuStable, 0);
  }
  try{
    window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP__ = run;
    window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP_UNTIL__ = Date.now() + 1800;
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  setTimeout(function(){
    try{
      if(window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP__ === run) run();
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }, 90);
}
function _returnToMassQuickMenu(source){
  var fromPrayer = source === 'prayer' || (source && source.fromPrayer);
  if(fromPrayer){
    try{ _setPrayerPopupReturnSource(true); }catch(e){ console.warn('[가톨릭길동무]', e); }
    _resetCoverExitReady();
    _clearCoverExitArmed();
    _clearMassQuickReturnForReload();
    _clearPrayerQuickReturn();
    _schedulePrayerReturnQuickMenuStable();
    return;
  }
  if(!_isCoverAlreadyVisibleForQuickMenu() && typeof goToCover==='function'){
    goToCover();
  }
  _resetCoverExitReady();
  _clearCoverExitArmed();
  _clearMassQuickReturnForReload();
  _clearPrayerQuickReturn();
  var open = function(){
    try{ openMassQuickMenu({keepReturn:true, fromFaithReturn:source === 'faith'}); }
    catch(e){ console.warn('[가톨릭길동무]', e); }
  };
  if(window.requestAnimationFrame) requestAnimationFrame(open);
  else setTimeout(open, 0);
}
function openMassQuickMenu(opts){
  const modal=document.getElementById('mass-quick-modal');
  if(!modal) return;
  if(opts && opts.fromPrayerReturn) _setPrayerPopupReturnSource(true);
  else if(!(opts && opts.keepReturn)) _setPrayerPopupReturnSource(false);
  try{
    if(opts && opts.fromPrayerReturn) modal.dataset.returnSource = 'prayer';
    else if(opts && opts.fromFaithReturn) modal.dataset.returnSource = 'faith';
    else if(!(opts && opts.keepReturn)) delete modal.dataset.returnSource;
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  if(!(opts && opts.keepReturn)) _setMassQuickReturn(false);
  _resetCoverExitReady();
  _clearCoverExitArmed();
  _armMassQuickHistoryTrap((opts && opts.fromPrayerReturn) ? {reason:'prayer-return', skip:true} : ((opts && opts.fromFaithReturn) ? {reason:'faith-return', skip:true, fromFaith:true} : null));
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  try{ if(typeof oaiEnterPopup === 'function') oaiEnterPopup(modal); }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function closeMassQuickMenu(opts){
  const modal=document.getElementById('mass-quick-modal');
  var fromPrayerReturn = _isPrayerPopupReturnSource();
  var fromFaithReturn = false;
  try{
    if(modal && modal.dataset && modal.dataset.returnSource === 'prayer') fromPrayerReturn = true;
    if(modal && modal.dataset && modal.dataset.returnSource === 'faith') fromFaithReturn = true;
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  _setMassQuickReturn(false);
  _clearPrayerQuickReturn();
  _resetCoverExitReady();
  _clearCoverExitArmed();
  if(modal){
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
    try{ delete modal.dataset.returnSource; }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  if(fromPrayerReturn){
    _forceCoverAfterPrayerQuickPopup();
    return;
  }
  if(fromFaithReturn){
    // V6-128: 매일미사/성경에서 돌아온 배너는 기도문 복귀 배너처럼 history가 아니라 직접 커버로 돌린다.
    try{ if(typeof goToCover === 'function') goToCover(); }catch(e){ console.warn('[가톨릭길동무]', e); }
    try{ if(typeof _ensureCoverBackTrap === 'function') _ensureCoverBackTrap('faith-return-popup-cover'); }catch(e){ console.warn('[가톨릭길동무]', e); }
    return;
  }
  _ensureCoverBackTrap();
}

function openCatholicHymn(){
  const url='https://maria.catholic.or.kr/mobile/sungga/sungga.asp';

  function launchExternalHymn(){
    try{
      var view=$('missa-view');
      if(view){
        view.classList.remove('open');
        try{ delete view.dataset.faithCurrent; delete view.dataset.faithReturn; }catch(_e){}
      }
      var frame=$('missa-frame');
      if(frame){
        try{ frame.contentWindow && frame.contentWindow.location && frame.contentWindow.location.replace('about:blank'); }
        catch(_e){ frame.src='about:blank'; }
      }
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    try{ if(typeof oaiSetMainMapLayerHidden === 'function') oaiSetMainMapLayerHidden(false); }catch(e){ console.warn('[가톨릭길동무]', e); }

    // V6-128: 가톨릭성가도 다른 외부페이지와 동일한 공통 외부 이동/복귀 보호막을 사용한다.
    // 성가 전용 보호창(oai-hymn-protective-window)과 별도 복귀 플래그는 만들지 않는다.
    if(typeof oaiSmoothNavigate === 'function'){
      oaiSmoothNavigate(url, 'hymn-external');
      return;
    }
    try{ if(typeof markExternalReturnStabilize === 'function') markExternalReturnStabilize('hymn-external'); }catch(e){ console.warn('[가톨릭길동무]', e); }
    try{ location.assign(url); }
    catch(e){ try{ location.href = url; }catch(_e){ console.warn('[가톨릭길동무]', _e); } }
  }

  try{
    const modal=document.getElementById('mass-quick-modal');
    if(modal && modal.classList.contains('show') && typeof _hideMassQuickMenuOnly === 'function'){
      _hideMassQuickMenuOnly(launchExternalHymn, {deferHideUntilAfter:false});
      return;
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  launchExternalHymn();
}
function openCatholicBible(){
  const url='https://maria.catholic.or.kr/mobile/bible/read/bible_list.asp';
  _openFaithFrameView('bible', url, '📖 성경');
}
var _massQuickResumeTimer = null;
var _massQuickResumeBusy = false;
function _resumeMassQuickReturnIfNeeded(){
  try{
    if(!_shouldMassQuickReturn()) return false;
    if(document.documentElement.classList.contains('app-active')) return false;
    var mq = document.getElementById('mass-quick-modal');
    if(mq && mq.classList.contains('show')){
      _clearMassQuickReturnForReload();
      return true;
    }
    if(_massQuickResumeBusy) return true;
    if(_massQuickResumeTimer) clearTimeout(_massQuickResumeTimer);
    _massQuickResumeBusy = true;
    _massQuickResumeTimer = setTimeout(function(){
      try{
        _massQuickResumeTimer = null;
        if(_shouldMassQuickReturn() && !document.documentElement.classList.contains('app-active')){
          _returnToMassQuickMenu();
        }
      }catch(e){ console.warn("[가톨릭길동무]", e); }
      finally{
        setTimeout(function(){ _massQuickResumeBusy = false; }, 250);
      }
    }, 0);
    return true;
  }catch(e){ console.warn("[가톨릭길동무]", e); return false; }
}
function _tryResumeMassQuickSoon(){
  try{
    if(_resumeMassQuickReturnIfNeeded()) return true;
  }catch(e){ console.warn("[가톨릭길동무]", e); }
  return false;
}
window.addEventListener('pageshow', function(){
  var handled = _tryResumeMassQuickSoon();
  if(!handled){
    try{ _clearMassQuickReturnForReload(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  setTimeout(_tryResumeMassQuickSoon, 80);
}, true);
document.addEventListener('visibilitychange', function(){
  if(document.visibilityState === 'visible'){
    _tryResumeMassQuickSoon();
    setTimeout(_tryResumeMassQuickSoon, 120);
  }
}, true);
window.addEventListener('focus', function(){
  _tryResumeMassQuickSoon();
  setTimeout(_tryResumeMassQuickSoon, 120);
}, true);
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(_tryResumeMassQuickSoon, 80); }, {once:true});
else setTimeout(_tryResumeMassQuickSoon, 80);
window.addEventListener('load', function(){ setTimeout(_tryResumeMassQuickSoon, 80); }, {once:true});
try{ window._shouldMassQuickReturn=_shouldMassQuickReturn; window._shouldPrayerQuickReturn=_shouldPrayerQuickReturn; window._setPrayerQuickReturn=_setPrayerQuickReturn; window._clearMassQuickReturnForReload=_clearMassQuickReturnForReload; window._clearPrayerQuickReturn=_clearPrayerQuickReturn; window._returnToMassQuickMenu=_returnToMassQuickMenu; window._closePrayerAndReturn=_closePrayerAndReturn; window._resetCoverExitReady=_resetCoverExitReady; window._clearCoverExitArmed=_clearCoverExitArmed; window._isCoverScreenVisible=_isCoverScreenVisible; window._isAppScreenActive=_isAppScreenActive; window._ensureCoverBackTrap=_ensureCoverBackTrap; window._ensureAppBackTrap=_ensureAppBackTrap; window._resetAppBackTrap=_resetAppBackTrap; window._hideMassQuickMenuOnly=_hideMassQuickMenuOnly; window._setPrayerPopupReturnSource=_setPrayerPopupReturnSource; window._isPrayerPopupReturnSource=_isPrayerPopupReturnSource; window._forceCoverAfterPrayerQuickPopup=_forceCoverAfterPrayerQuickPopup; window._resetCoverBackTrap=_resetCoverBackTrap; window._consumePrayerCoverNeedsFirstToast=_consumePrayerCoverNeedsFirstToast; window.openMassQuickMenu=openMassQuickMenu; window.closeMassQuickMenu=closeMassQuickMenu; }catch(e){ console.warn('[가톨릭길동무]', e); }


function oaiFormatCoverVersionHtml(version, suffixText){
  function esc(x){ return String(x).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] || c); }); }
  var main = esc(suffixText || '새로고침');
  var ver = esc(version || '');
  if(!ver) return main;
  return '<span class="refresh-version-main">' + main + '</span><span class="refresh-version-sub">' + ver + '</span>';
}
function oaiSetCoverRefreshButtonLabel(btn, version, suffixText){
  if(!btn) return;
  var displayVersion = btn.getAttribute('data-display-version') || version || '';
  try{ btn.innerHTML = oaiFormatCoverVersionHtml(displayVersion, suffixText); }
  catch(_e){ btn.textContent = (suffixText || '새로고침') + (displayVersion ? ' ' + displayVersion : ''); }
}
function _runRefreshAppFilesOnly(){
  var btn = document.getElementById('cover-update-btn');
  try{
    if(btn){
      btn.disabled = true;
      oaiSetCoverRefreshButtonLabel(btn, btn.getAttribute('data-target-version') || 'V1', '새로고침 중');
    }
    if(document.activeElement && document.activeElement.blur) document.activeElement.blur();
    sessionStorage.setItem('oai_soft_refresh_requested', String(Date.now ? Date.now() : new Date().getTime()));
    try{ if(typeof oaiMarkRefreshHistoryCompact === 'function') oaiMarkRefreshHistoryCompact('short-refresh'); }catch(_e){}
    try{ _clearMassQuickReturnForReload(); }catch(_e){}
  }catch(e){
    console.warn('[가톨릭길동무]', e);
  }
  try{
    if(typeof oaiPrepareRefreshVeil === 'function')
      oaiPrepareRefreshVeil('short-refresh', OAI_REFRESH_VEIL_MS, OAI_REFRESH_CARRY_MS, true, OAI_REFRESH_PRE_NAV_HOLD_MS, false);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  oaiAfterRefreshVeilPaint(function(){
    try{
      location.reload();
    }catch(e){
      location.href = location.href.split('#')[0];
    }
  });
}
function _showRefreshContentDialog(onConfirm){
  try{
    var old = document.getElementById('oai-refresh-content-dialog');
    if(old && old.parentNode) old.parentNode.removeChild(old);

    var ua = (navigator.userAgent || '').toLowerCase();
    var isIOSRefresh = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var cfg = isIOSRefresh ? {
      backdropPad:'20px', panelW:'min(94vw,390px)', panelPad:'21px 17px 16px',
      title:'19px', titleLH:'1.16', titleMb:'9px',
      lead:'13px', leadLH:'1.42', leadMb:'9px',
      desc:'12.5px', descLH:'1.42', descMb:'11px',
      note:'11.8px', noteLH:'1.38', notePad:'8px 9px', noteMb:'15px',
      btnH:'40px', btnMin:'94px', btnFs:'14px', okPad:'0 17px', cancelPad:'0 15px',
      keepWords:true
    } : {
      backdropPad:'22px', panelW:'min(92vw,380px)', panelPad:'22px 18px 17px',
      title:'21px', titleLH:'1.2', titleMb:'10px',
      lead:'15px', leadLH:'1.55', leadMb:'10px',
      desc:'14px', descLH:'1.55', descMb:'12px',
      note:'12.5px', noteLH:'1.45', notePad:'8px 10px', noteMb:'16px',
      btnH:'42px', btnMin:'96px', btnFs:'15px', okPad:'0 18px', cancelPad:'0 16px',
      keepWords:false
    };
    var wordStyle = cfg.keepWords ? ';word-break:keep-all;overflow-wrap:normal;' : '';

    var wrap = document.createElement('div');
    wrap.id = 'oai-refresh-content-dialog';
    wrap.setAttribute('role','dialog');
    wrap.setAttribute('aria-modal','true');
    wrap.setAttribute('aria-label','Refresh Content');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:10090;display:flex;align-items:center;justify-content:center;background:rgba(14,21,53,.36);padding:' + cfg.backdropPad + ';box-sizing:border-box;-webkit-text-size-adjust:100%;text-size-adjust:100%;';
    wrap.innerHTML = '<div style="width:' + cfg.panelW + ';background:#fffaf2;border:1px solid rgba(212,170,106,.42);border-radius:20px;box-shadow:0 18px 42px rgba(14,21,53,.24);padding:' + cfg.panelPad + ';text-align:center;font-family:inherit;color:#1f2937;box-sizing:border-box;-webkit-text-size-adjust:100%;text-size-adjust:100%' + wordStyle + '">' +
      '<div style="font-size:' + cfg.title + ';font-weight:900;line-height:' + cfg.titleLH + ';margin-bottom:' + cfg.titleMb + ';letter-spacing:-.02em;">Refresh Content</div>' +
      '<div style="font-size:' + cfg.lead + ';font-weight:800;line-height:' + cfg.leadLH + ';color:#475569;margin-bottom:' + cfg.leadMb + ';letter-spacing:-.03em' + wordStyle + '">앱 화면을 안정형으로 다시 불러옵니다.</div>' +
      '<div style="font-size:' + cfg.desc + ';font-weight:700;line-height:' + cfg.descLH + ';color:#64748b;margin-bottom:' + cfg.descMb + ';letter-spacing:-.03em' + wordStyle + '">캐시와 설치 상태는 삭제하지 않습니다.<br>글자 크기와 즐겨찾기도 그대로 유지됩니다.</div>' +
      '<div style="font-size:' + cfg.note + ';font-weight:800;line-height:' + cfg.noteLH + ';color:#8A6A2F;background:#fff4d7;border:1px solid rgba(212,170,106,.45);border-radius:12px;padding:' + cfg.notePad + ';margin-bottom:' + cfg.noteMb + ';letter-spacing:-.035em' + wordStyle + '">문제가 계속되면 새로고침 버튼을 더 길게 눌러<br>앱 캐시 초기화를 실행할 수 있습니다.</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;">' +
      '<button type="button" data-oai-refresh-cancel="1" style="height:' + cfg.btnH + ';min-width:' + cfg.btnMin + ';padding:' + cfg.cancelPad + ';border:1px solid #d8d1c5;border-radius:999px;background:#fff;color:#475569;font-family:inherit;font-size:' + cfg.btnFs + ';font-weight:850;">취소</button>' +
      '<button type="button" data-oai-refresh-ok="1" style="height:' + cfg.btnH + ';min-width:' + cfg.btnMin + ';padding:' + cfg.okPad + ';border:0;border-radius:999px;background:#1f2a44;color:#fff;font-family:inherit;font-size:' + cfg.btnFs + ';font-weight:900;">확인</button>' +
      '</div></div>';
    function close(){ try{ if(wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap); }catch(_e){} }
    wrap.addEventListener('click', function(e){ if(e.target === wrap) close(); }, true);
    var cancel = wrap.querySelector('[data-oai-refresh-cancel]');
    var ok = wrap.querySelector('[data-oai-refresh-ok]');
    if(cancel) cancel.onclick = function(e){ e.preventDefault(); close(); };
    if(ok) ok.onclick = function(e){ e.preventDefault(); close(); if(typeof onConfirm === 'function') onConfirm(); };
    document.body.appendChild(wrap);
    setTimeout(function(){ try{ if(ok) ok.focus(); }catch(_e){} }, 0);
  }catch(e){
    console.warn('[가톨릭길동무]', e);
    if(typeof onConfirm === 'function') onConfirm();
  }
}
function refreshAppFilesOnly(){
  _showRefreshContentDialog(_runRefreshAppFilesOnly);
}
window.refreshAppFilesOnly = refreshAppFilesOnly;

async function _runClearAppFilesCacheCompletely(){
  try{
    if(typeof oaiPrepareRefreshVeil === 'function')
      oaiPrepareRefreshVeil('long-refresh-progress', OAI_REFRESH_VEIL_MS, OAI_REFRESH_CARRY_MS, true, OAI_REFRESH_PROGRESS_HOLD_MS, false);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{
    if(typeof oaiMarkRefreshHistoryCompact === 'function') oaiMarkRefreshHistoryCompact('long-refresh-progress');
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  await new Promise(function(resolve){ oaiAfterRefreshVeilPaint(resolve); });
  try{
    if(window.caches && caches.keys){
      var keys = await caches.keys();
      await Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }
    if(navigator.serviceWorker && navigator.serviceWorker.getRegistrations){
      var regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(function(r){ return r.unregister(); }));
    }
  }catch(e){
    console.warn('[가톨릭길동무]', e);
  }
  try{
    location.reload();
  }catch(e){
    location.href = location.href.split('#')[0];
  }
}
function _showCacheClearDialog(onConfirm){
  try{
    var old = document.getElementById('oai-cache-clear-dialog');
    if(old && old.parentNode) old.parentNode.removeChild(old);
    var wrap = document.createElement('div');
    wrap.id = 'oai-cache-clear-dialog';
    wrap.setAttribute('role','dialog');
    wrap.setAttribute('aria-modal','true');
    wrap.setAttribute('aria-label','앱 캐시 초기화');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:10095;display:flex;align-items:center;justify-content:center;background:rgba(14,21,53,.46);padding:22px;box-sizing:border-box;';
    wrap.innerHTML = '<div style="width:min(92vw,390px);background:#fffaf2;border:2px solid rgba(212,170,106,.70);border-radius:20px;box-shadow:0 18px 46px rgba(14,21,53,.30);padding:22px 18px 17px;text-align:center;font-family:inherit;color:#1f2937;box-sizing:border-box;">' +
      '<div style="font-size:21px;font-weight:950;line-height:1.2;margin-bottom:10px;color:#1f2a44;">앱 캐시 초기화</div>' +
      '<div style="font-size:15px;font-weight:800;line-height:1.55;color:#475569;margin-bottom:10px;">앱 파일 캐시를 삭제하고 다시 불러옵니다.</div>' +
      '<div style="font-size:14px;font-weight:700;line-height:1.55;color:#64748b;margin-bottom:12px;">화면이 이상하게 꼬였을 때만 사용하세요.<br>글자 크기와 즐겨찾기는 유지됩니다.</div>' +
      '<div style="font-size:12.5px;font-weight:800;line-height:1.45;color:#8A3B20;background:#fff1e8;border:1px solid rgba(194,65,12,.22);border-radius:12px;padding:8px 10px;margin-bottom:16px;">인터넷이 약하면 다시 불러오는 데 시간이 걸릴 수 있습니다.</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;">' +
      '<button type="button" data-oai-cache-cancel="1" style="height:42px;min-width:96px;padding:0 16px;border:1px solid #d8d1c5;border-radius:999px;background:#fff;color:#475569;font-family:inherit;font-size:15px;font-weight:850;">취소</button>' +
      '<button type="button" data-oai-cache-ok="1" style="height:42px;min-width:120px;padding:0 18px;border:0;border-radius:999px;background:#1f2a44;color:#fff;font-family:inherit;font-size:15px;font-weight:900;">초기화</button>' +
      '</div></div>';
    function close(){ try{ if(wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap); }catch(_e){} }
    wrap.addEventListener('click', function(e){ if(e.target === wrap) close(); }, true);
    var cancel = wrap.querySelector('[data-oai-cache-cancel]');
    var ok = wrap.querySelector('[data-oai-cache-ok]');
    if(cancel) cancel.onclick = function(e){ e.preventDefault(); close(); };
    if(ok) ok.onclick = function(e){ e.preventDefault(); close(); if(typeof onConfirm === 'function') onConfirm(); };
    document.body.appendChild(wrap);
    setTimeout(function(){ try{ if(cancel) cancel.focus(); }catch(_e){} }, 0);
  }catch(e){
    console.warn('[가톨릭길동무]', e);
    if(typeof onConfirm === 'function') onConfirm();
  }
}
function clearAppFilesCacheCompletely(){
  _showCacheClearDialog(_runClearAppFilesCacheCompletely);
}
window.clearAppFilesCacheCompletely = clearAppFilesCacheCompletely;

function syncCoverUpdateVersionState(){
  try{
    var btn = document.getElementById('cover-update-btn');
    var box = document.getElementById('cover-update-box');
    var marker = document.getElementById('oai-build-marker');
    if(!btn || !box) return;
        var target = btn.getAttribute('data-target-version') || 'V1';
    var current = '';
    if(window.APP_VERSION) current = String(window.APP_VERSION).trim();
    if(!current && marker) current = String(marker.textContent || '').trim();
    if(!current) current = target;
    var mismatch = current !== target;
    oaiSetCoverRefreshButtonLabel(btn, target, mismatch ? '업데이트 필요' : '새로고침');
    box.classList.toggle('update-needed', mismatch);
    if(marker){
      marker.textContent = target || 'V1';
      marker.setAttribute('hidden', 'hidden');
      marker.setAttribute('aria-hidden','true');
      marker.style.display = 'none';
      marker.style.visibility = 'hidden';
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
window.syncCoverUpdateVersionState = syncCoverUpdateVersionState;
document.addEventListener('DOMContentLoaded', function(){
  syncCoverUpdateVersionState();
  setTimeout(syncCoverUpdateVersionState, 250);
  setTimeout(syncCoverUpdateVersionState, 900);
}, true);
window.addEventListener('load', syncCoverUpdateVersionState, true);

(function(){
  'use strict';
  var HIDE_DAYS = 7;
  var MAX_LATER_COUNT = 3;
  var KEY_COUNT = 'catholicGuideLaterCount';
  var KEY_HIDE_UNTIL = 'catholicGuideHideUntil';
  var KEY_DISABLED = 'catholicGuideAutoDisabled';
  var KEY_INSTALLED_SHOWN = 'catholicGuideInstalledIntroShown';
  var SOFT_REFRESH_KEY = 'oai_soft_refresh_requested';
  var FAVORITES_RESET_NOTICE_KEY = 'catholicV2SFavoritesResetNoticeShown';
  var skipAutoPopupsThisLoad = false;

  function now(){ return Date.now ? Date.now() : new Date().getTime(); }
  function isStandaloneApp(){
    try{ if(window.navigator.standalone === true) return true; }catch(e){}
    try{ return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches); }catch(e){}
    return false;
  }
  function isKakaoBrowser(){
    try{ return (navigator.userAgent || '').toLowerCase().indexOf('kakaotalk') > -1; }catch(e){ return false; }
  }
  function hasRecentSoftRefreshRequest(){
    try{
      var raw = sessionStorage.getItem(SOFT_REFRESH_KEY);
      var t = parseInt(raw || '0', 10) || 0;
      return !!t && (now() - t) < 120000;
    }catch(e){ return false; }
  }
  function clearSoftRefreshRequest(){
    try{ sessionStorage.removeItem(SOFT_REFRESH_KEY); }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  function getInt(key){
    try{ return parseInt(localStorage.getItem(key) || '0', 10) || 0; }catch(e){ return 0; }
  }
  function setVal(key, value){ try{ localStorage.setItem(key, String(value)); }catch(e){ console.warn('[가톨릭길동무]', e); } }
  function isCoverVisible(){
    try{
      var cover=document.getElementById('cover');
      return !!cover && !document.documentElement.classList.contains('app-active') && cover.style.display !== 'none';
    }catch(e){ return false; }
  }
  function resetGuideScroll(id){
    try{
      var root=document.getElementById(id);
      if(!root) return;
      root.scrollTop=0;
      root.querySelectorAll('.guide-panel,.guide-card-list').forEach(function(el){ el.scrollTop=0; });
      var panel=root.querySelector('.guide-panel');
      if(panel) panel.scrollIntoView({block:'center', inline:'nearest'});
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  function showModal(id){
    var el=document.getElementById(id);
    if(!el) return;
    resetGuideScroll(id);
    el.classList.add('show');
    el.setAttribute('aria-hidden','false');
    try{ if(typeof oaiEnterPopup==='function') oaiEnterPopup(el); }catch(e){ console.warn('[가톨릭길동무]', e); }
    setTimeout(function(){ resetGuideScroll(id); }, 0);
    try{ document.activeElement && document.activeElement.blur && document.activeElement.blur(); }catch(e){}
  }
  function hideModal(id){
    var el=document.getElementById(id);
    if(!el) return;
    el.classList.remove('show');
    el.setAttribute('aria-hidden','true');
  }
  function openGuideManual(){
    hideModal('guide-intro-modal');
    showModal('guide-manual-modal');
    try{
      if(history && history.pushState && !(history.state && history.state.oai_guide_manual)){
        history.pushState({_p:1, oai_guide_manual:true}, '', location.href);
      }
    }catch(_e){}
    setVal(KEY_HIDE_UNTIL, now() + HIDE_DAYS*24*60*60*1000);
  }
  function closeGuideManual(){
    hideModal('guide-manual-modal');
    try{
      if(history.state && history.state.oai_guide_manual){
        history.replaceState({_p:1, oai_cover_trap:'guide-confirm'}, '', location.href);
      }
    }catch(_e){}
  }
  function closeIntroLater(){
    hideModal('guide-intro-modal');
    var count = getInt(KEY_COUNT) + 1;
    setVal(KEY_COUNT, count);
    if(count >= MAX_LATER_COUNT){
      setVal(KEY_DISABLED, '1');
    }else{
      setVal(KEY_HIDE_UNTIL, now() + HIDE_DAYS*24*60*60*1000);
    }
  }
  function isGuideModalOpen(id){
    var el=document.getElementById(id);
    return !!(el && el.classList.contains('show') && el.getAttribute('aria-hidden') !== 'true');
  }
  function hideFavoritesResetNotice(){
    var el=document.getElementById('favorites-reset-notice-banner');
    if(el){
      el.classList.remove('show');
      el.setAttribute('hidden', '');
    }
  }
  function closeFavoritesResetNotice(){
    var el=document.getElementById('favorites-reset-notice-banner');
    var wasOpen=!!(el && el.classList.contains('show') && !el.hasAttribute('hidden'));
    hideFavoritesResetNotice();
    if(wasOpen) setVal(FAVORITES_RESET_NOTICE_KEY, '1');
  }
  function shouldShowFavoritesResetNotice(){
    return false;
  }
  function maybeShowFavoritesResetNotice(){
    if(shouldShowFavoritesResetNotice()){
      var el=document.getElementById('favorites-reset-notice-banner');
      if(el){
        el.removeAttribute('hidden');
        el.classList.add('show');
      }
    }
  }
  function shouldShowIntro(forceRefresh){
    return false;
  }
  function maybeShowIntro(){
    var forceRefresh = hasRecentSoftRefreshRequest();
    if(forceRefresh){
      skipAutoPopupsThisLoad = true;
      try{ if(typeof closeMassQuickMenu === 'function') closeMassQuickMenu(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ hideModal('guide-intro-modal'); hideModal('guide-manual-modal'); hideFavoritesResetNotice(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      clearSoftRefreshRequest();
      return;
    }
    if(shouldShowIntro(false)){
      setVal(KEY_INSTALLED_SHOWN, '1');
      showModal('guide-intro-modal');
    }
  }
  try{
}catch(e){ console.warn('[가톨릭길동무]', e); }

  function bindGuide(){
    var btn=document.getElementById('cover-guide-btn');
    if(btn) btn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); openGuideManual(); });
    var detail=document.getElementById('guide-open-detail-btn');
    if(detail) detail.addEventListener('click', function(e){ e.preventDefault(); openGuideManual(); });
    var later=document.getElementById('guide-later-btn');
    if(later) later.addEventListener('click', function(e){ e.preventDefault(); closeIntroLater(); });
    var ok=document.getElementById('guide-ok-btn');
    if(ok) ok.addEventListener('click', function(e){ e.preventDefault(); closeGuideManual(); });
    var favOk=document.getElementById('favorites-reset-notice-ok');
    if(favOk) favOk.addEventListener('click', function(e){ e.preventDefault(); closeFavoritesResetNotice(); });
    document.querySelectorAll('[data-guide-close]').forEach(function(el){
      el.addEventListener('click', function(e){
        e.preventDefault();
        var target=el.getAttribute('data-guide-close');
        if(target==='intro') closeIntroLater();
        else if(target==='manual') closeGuideManual();
      });
    });


    document.addEventListener('keydown', function(e){
      if(e.key !== 'Escape') return;
      hideModal('guide-intro-modal');
      hideModal('guide-manual-modal');
      closeFavoritesResetNotice();
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', bindGuide, {once:true});
  else bindGuide();
  window.openGuideManual = openGuideManual;
  window.resetGuideManualScroll = function(){ resetGuideScroll('guide-manual-modal'); };
})();

function closeMissa(){
  const view=$('missa-view');
  if(view){
    view.classList.remove('open');
    try{ delete view.dataset.faithCurrent; delete view.dataset.faithReturn; }catch(e){ console.warn("[가톨릭길동무]", e); }
  }
  try{
    var frame=$('missa-frame');
    if(frame){
      try{ frame.contentWindow && frame.contentWindow.location && frame.contentWindow.location.replace('about:blank'); }
      catch(_e){ frame.src='about:blank'; }
    }
  }catch(e){ console.warn("[가톨릭길동무]", e); }
  try{ if(typeof oaiSetMainMapLayerHidden==='function') oaiSetMainMapLayerHidden(false); }catch(e){ console.warn("[가톨릭길동무]", e); }
  // V6-127: 매일미사/가톨릭성가/성경은 진입 경로와 관계없이 뒤로가기/닫기 시 미사 중 빠른 사용 배너로 복귀한다.
  try{ _setMassQuickReturn(false); _clearPrayerQuickReturn(); }catch(e){ console.warn("[가톨릭길동무]", e); }
  if(typeof _returnToMassQuickMenu==='function') _returnToMassQuickMenu('faith');
  else if(typeof openMassQuickMenu==='function'){
    if(typeof goToCover==='function') goToCover();
    openMassQuickMenu({keepReturn:true});
  }else if(typeof goToCover==='function') goToCover();
}
function missaLoaded(){
}

function openPrayerBook(opts){
  if(opts && opts.fromMassQuick){
    try{
      _setPrayerQuickReturn(true);
      window.__OAI_PRAYER_FROM_QUICK_LOCK__ = true;
      sessionStorage.setItem('oai_prayer_from_quick_lock','1');
    }catch(e){ console.warn("[가톨릭길동무]", e); }
  }
  try{ if(typeof _resetCoverExitReady==='function') _resetCoverExitReady(); }catch(e){ console.warn("[가톨릭길동무]", e); }
  try{ if(typeof _clearCoverExitArmed==='function') _clearCoverExitArmed(); }catch(e){ console.warn("[가톨릭길동무]", e); }
  const view=$('prayer-view');
  if(!view) return;
  try{
    if(opts && opts.fromMassQuick) view.dataset.quickSource = 'mass';
    else delete view.dataset.quickSource;
  }catch(e){ console.warn("[가톨릭길동무]", e); }
  const cv=$('cover');
  if(cv){ cv.style.opacity='0'; cv.style.display='none'; }
  document.documentElement.classList.add('app-active');
  try{
    if(typeof window._oaiArmPrayerBackTrap==='function') window._oaiArmPrayerBackTrap('prayer-open');
    else if(typeof _ensureAppBackTrap==='function') _ensureAppBackTrap('prayer-open');
  }catch(e){ console.warn("[가톨릭길동무]", e); }
  if(typeof oaiSetMainMapLayerHidden==='function') oaiSetMainMapLayerHidden(true);
  view.classList.add('open');
  _syncFaithQuickNav('prayer');
  var restore = !!(opts && opts.restore);
  if(!restore && typeof oaiEnterView==='function') oaiEnterView(view);
  var setupDelay = (opts && opts.instant) ? 0 : 50;
  var runPrayerSetup=function(){
    setTimeout(function(){
      if(typeof window.initPrayerView==='function') try{window.initPrayerView();}catch(e){ console.warn("[가톨릭길동무]", e); }
      try{ if(typeof window.prEnsureTabsVisible==='function') window.prEnsureTabsVisible(); }catch(e){ console.warn("[가톨릭길동무]", e); }
      if(!(opts&&opts.restore) && typeof showPrayerListOnly==='function') try{showPrayerListOnly({skipRestore:true});}catch(e){ console.warn("[가톨릭길동무]", e); }
      setTimeout(function(){ try{ if(typeof window.prEnsureTabsVisible==='function') window.prEnsureTabsVisible(); }catch(e){ console.warn("[가톨릭길동무]", e); } }, 120);
      try{
        if(typeof window._oaiArmPrayerBackTrap==='function') window._oaiArmPrayerBackTrap('prayer-list-ready');
        else if(typeof _ensureAppBackTrap==='function') _ensureAppBackTrap('prayer-list-ready');
      }catch(e){ console.warn("[가톨릭길동무]", e); }
      var list=document.getElementById('prayer-list-view'); if(list) list.scrollTop=0;
      var tabs=document.getElementById('prayer-tabs'); if(tabs) tabs.scrollLeft=0;
    }, setupDelay);
  };
  if(typeof window.ensurePrayerModuleLoaded==='function'){
    window.ensurePrayerModuleLoaded().then(runPrayerSetup).catch(function(err){
      console.warn('[가톨릭길동무]', err);
      var ul=document.getElementById('pr-list-ul');
      if(ul) ul.innerHTML='<div class="pr-empty">기도문을 불러오지 못했습니다.<br>새로고침 후 다시 시도해 주세요.</div>';
    });
  } else {
    runPrayerSetup();
  }
}
function closePrayerView(){
  const view=$('prayer-view');
  const detail=$('prayer-detail');
  if(detail) detail.classList.remove('show');
  if(view){
    view.classList.remove('open');
    try{ delete view.dataset.quickSource; }catch(e){ console.warn("[가톨릭길동무]", e); }
  }
}
function _closePrayerAndReturn(){
  try{
    if(typeof window._oaiPrayerListToPopupOrCover === 'function'){
      window._oaiPrayerListToPopupOrCover('prayer-close-button');
      return;
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  // V6-127: 주요기도문 리스트는 진입 경로와 관계없이 미사 중 빠른 사용 배너로 복귀한다.
  _returnToMassQuickMenu('prayer');
}




function openDioceseView(opts){
  var view=document.getElementById('diocese-view');
  var frame=document.getElementById('diocese-frame');
  var loading=document.getElementById('diocese-loading');
  if(!view||!frame) return;
  var restore = !!(opts && opts.restore);
  var needsLoad = (!frame.src || frame.src==='about:blank' || !frame._loaded);
  if(typeof oaiSetMainMapLayerHidden==='function') oaiSetMainMapLayerHidden(true);
  view.classList.add('open');
  if(!restore && typeof oaiEnterView==='function') oaiEnterView(view);
  if(loading) loading.style.display = needsLoad ? 'flex' : 'none';
  if(needsLoad){
    frame.onload=function(){
      if(loading) loading.style.display='none'; frame._loaded=true;
      try{ frame.contentWindow && frame.contentWindow.dioApplySharedFont && frame.contentWindow.dioApplySharedFont(); }catch(e){ console.warn("[가톨릭길동무]", e); }
      if(!restore) try{ frame.contentWindow && frame.contentWindow.resetDioceseFirstPage && frame.contentWindow.resetDioceseFirstPage(); }catch(e){ console.warn("[가톨릭길동무]", e); }
      if(typeof dioceseLoaded==='function') dioceseLoaded();
    };
    frame.src='diocese.html?v=WebView-Clean-128';
  }else if(!restore){
    try{ frame.contentWindow && frame.contentWindow.resetDioceseFirstPage && frame.contentWindow.resetDioceseFirstPage(); }catch(e){ console.warn("[가톨릭길동무]", e); }
  }
}
function closeDioceseView(){
  var view=document.getElementById('diocese-view');
  if(typeof goToCover==='function') goToCover();
  if(view) view.classList.remove('open');
}
function dioceseLoaded(){
  var loading=document.getElementById('diocese-loading');
  if(loading) loading.style.display='none';
}
const CORE_RETURN_KEY='catholic_core_return_v1';
function saveCoreReturnState(extra){
  let mapCenter = null, mapLevel = null;
  try{
    if(_map && window.kakao && kakao.maps){
      const c = _map.getCenter();
      mapCenter = {lat: c.getLat(), lng: c.getLng()};
      mapLevel = _map.getLevel();
    }
  }catch(e){ console.warn("[가톨릭길동무]", e); }
  const state={
    mode:_mode||'shrine',
    activeTab: _activeTab||'',
    filterDio:_filterDio||'all',
    listSrch:_listSrch||'',
    infoIdx:(_curInfoItem&&Number.isInteger(_curInfoItem.idx))?_curInfoItem.idx:-1,
    fromRegion:!!_curFromRegion,
    mapCenter: mapCenter,
    mapLevel: mapLevel
  };
  try{ sessionStorage.setItem(CORE_RETURN_KEY, JSON.stringify(Object.assign(state, extra||{}))); }catch(e){ console.warn("[가톨릭길동무]", e); }
}
function normalizeCatholicExternalUrl(url){
  url = String(url || '').trim();
  if(!url) return '';

  try{
    if(typeof _decUrl === 'function') url = _decUrl(url);
  }catch(e){ console.warn("[가톨릭길동무]", e); }

  url = url.replace(/^hthttp:\/\//i, 'http://').replace(/^hthttps:\/\//i, 'https://').replace(/^http\/\//i, 'http://').replace(/^https\/\//i, 'https://');
  if(url.indexOf('//') === 0) url = 'https:' + url;
  if(!/^https?:\/\//i.test(url)) url = 'https://' + url.replace(/^\/+/, '');

  try{
    var u = new URL(url);
    u.pathname = u.pathname.replace(/\/\/+/g, '/');
    var host = u.hostname.toLowerCase();
    if(host === 'wjcatholic.or.kr') u.hostname = 'www.wjcatholic.or.kr';
    if(host === 'caincheon.or.kr') u.hostname = 'www.caincheon.or.kr';
    if(host === 'www.cathms.kr') u.hostname = 'cathms.kr';
    if(u.hostname.toLowerCase() === 'cathms.kr') u.protocol = 'https:';
    return u.toString();
  }catch(e){ return url; }
}
function prepareExternalUrl(url){
  url = (typeof normalizeCatholicExternalUrl === 'function')
        ? normalizeCatholicExternalUrl(url)
        : String(url || '').trim();
  return url || null;
}
function openCoreExternalUrl(url, extra){
  url = prepareExternalUrl(url);
  if(!url) return;
  saveCoreReturnState(extra);
  oaiSmoothNavigate(url, 'core-external');
}

const DIOCESE_RETURN_KEY='catholic_diocese_external_return_v1';
function openDioceseExternal(url, state){
  url = prepareExternalUrl(url);
  if(!url) return false;
  try{
    var payload=JSON.stringify(state || {});
    sessionStorage.setItem(DIOCESE_RETURN_KEY, payload);
    localStorage.setItem(DIOCESE_RETURN_KEY, payload);
    window.__OAI_DIOCESE_EXTERNAL_LEAVING__ = true;
    var frame=document.getElementById('diocese-frame');
    if(frame && frame.contentWindow){
      try{ frame.contentWindow.__OAI_DIO_EXTERNAL_LEAVING__ = true; frame.contentWindow.__OAI_DIO_EXTERNAL_LEAVING_TS__ = Date.now ? Date.now() : new Date().getTime(); }catch(_e){}
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{ if(typeof markExternalReturnStabilize === 'function') markExternalReturnStabilize('diocese-external'); }catch(_e){}
  try{ location.assign(url); }
  catch(e){ try{ location.href = url; }catch(_e){ console.warn('[가톨릭길동무]', _e); return false; } }
  return true;
}
window.openDioceseExternal = openDioceseExternal;
function oaiIsCoverIntroResetActive(){
  try{
    var root=document.documentElement;
    return root.classList.contains('oai-first-entry-intro') ||
           root.classList.contains('oai-cover-resetting-to-intro') ||
           root.classList.contains('oai-cover-booting');
  }catch(_e){ return false; }
}

function _finishDioceseExternalReturn(frame){
  try{
    var w = frame && frame.contentWindow;
    if(w){
      w.__OAI_DIO_EXTERNAL_LEAVING__ = false;
      w.__OAI_DIO_PARENT_RETURNING__ = false;
      if(typeof w.oaiReleaseDioceseStability === 'function') w.oaiReleaseDioceseStability({silent:true});
    }
  }catch(_e){}
  try{ sessionStorage.removeItem(DIOCESE_RETURN_KEY); localStorage.removeItem(DIOCESE_RETURN_KEY); }catch(_e){}
  window.__OAI_DIOCESE_EXTERNAL_LEAVING__ = false;
  window.__OAI_DIOCESE_RESTORING__ = false;
}
function restoreDioceseExternalState(opts){
  opts = opts || {};
  var raw=null, state=null;
  try{ raw=sessionStorage.getItem(DIOCESE_RETURN_KEY) || localStorage.getItem(DIOCESE_RETURN_KEY); }catch(e){ console.warn('[가톨릭길동무]', e); }
  if(!raw || window.__OAI_DIOCESE_RESTORING__) return false;

  try{ state=JSON.parse(raw); }catch(e){ state={}; }

  try{
    var root=document.documentElement;
    root.classList.remove('oai-diocese-returning');
    var view=document.getElementById('diocese-view');
    var frame=document.getElementById('diocese-frame');
    var alreadyOpen=!!(view && view.classList.contains('open'));
    var frameAlive=!!(frame && frame.contentWindow);

    if(alreadyOpen && frameAlive){
      var preserved=false;
      try{
        var w=frame.contentWindow;
        if(w && typeof w.isDioceseReturnPreserved === 'function') preserved = !!w.isDioceseReturnPreserved(state || {});
        else if(w && w.__OAI_DIO_EXTERNAL_LEAVING__) preserved = true;
      }catch(_e){ preserved=false; }
      if(preserved){
        _finishDioceseExternalReturn(frame);
        return true;
      }
    }

    window.__OAI_DIOCESE_RESTORING__ = true;
    try{ sessionStorage.removeItem(DIOCESE_RETURN_KEY); localStorage.removeItem(DIOCESE_RETURN_KEY); }catch(e){ console.warn('[가톨릭길동무]', e); }

    function finish(){
      try{ root.classList.remove('oai-diocese-returning'); }catch(_e){}
      window.__OAI_DIOCESE_RESTORING__ = false;
    }
    function restoreInFrame(){
      try{
        frame=document.getElementById('diocese-frame');
        var w=frame && frame.contentWindow;
        if(w){
          w.__OAI_DIO_EXTERNAL_LEAVING__ = false;
          w.__OAI_DIO_PARENT_RETURNING__ = true;
        }
        if(w && typeof w.restoreDioceseReturnState === 'function'){
          w.restoreDioceseReturnState(state || {});
          setTimeout(finish, 120);
          return true;
        }
      }catch(e){ console.warn('[가톨릭길동무]', e); }
      return false;
    }

    if(!alreadyOpen && typeof openDioceseView === 'function') openDioceseView({restore:true});
    if(!alreadyOpen && typeof oaiSetMainMapLayerHidden === 'function') oaiSetMainMapLayerHidden(true);
    var tries=0;
    var timer=setInterval(function(){
      tries++;
      if(restoreInFrame()){ clearInterval(timer); return; }
      if(tries>10){ clearInterval(timer); finish(); }
    }, 70);
  }catch(e){ console.warn('[가톨릭길동무]', e); window.__OAI_DIOCESE_RESTORING__ = false; }
  return true;
}
window.addEventListener('pageshow', function(ev){
  try{
    if(oaiIsCoverIntroResetActive()) return;
    var hasReturn=sessionStorage.getItem(DIOCESE_RETURN_KEY) || localStorage.getItem(DIOCESE_RETURN_KEY);
    if(hasReturn){
      document.documentElement.classList.remove('oai-diocese-returning');
      var view=document.getElementById('diocese-view');
      var frame=document.getElementById('diocese-frame');
      if(view && view.classList.contains('open') && frame && frame.contentWindow){
        var state=null;
        try{ state=JSON.parse(hasReturn); }catch(_e){ state={}; }
        var preserved=false;
        try{
          var w=frame.contentWindow;
          if(w && typeof w.isDioceseReturnPreserved === 'function') preserved = !!w.isDioceseReturnPreserved(state || {});
          else if(w && w.__OAI_DIO_EXTERNAL_LEAVING__) preserved = true;
        }catch(_e){ preserved=false; }
        if(preserved){
          _finishDioceseExternalReturn(frame);
          return;
        }
      }
    }
  }catch(ex){}
  setTimeout(function(){ restoreDioceseExternalState({persisted: !!(ev && ev.persisted)}); }, 20);
}, true);
window.addEventListener('focus', function(){
}, true);


function clearRouteNoFocus(){
  try{
    if(_mode==='shrine'){
      if(_rS&&_rS.idx>=0&&_markers[_rS.idx]) _markers[_rS.idx].marker.setImage(_mkrImg(_typeColor(_markers[_rS.idx].shrine.type),false));
      if(_rE&&_rE.idx>=0&&_markers[_rE.idx]) _markers[_rE.idx].marker.setImage(_mkrImg(_typeColor(_markers[_rE.idx].shrine.type),false));
    }
    _rS=null; _rE=null; _routeMode=false;
    if(typeof _setRouteLabel==='function'){ _setRouteLabel('start',''); _setRouteLabel('end',''); }
    var rs=document.getElementById('rs-result'); if(rs) rs.style.display='none';
    var sBtn=document.getElementById('rs-search-btn'); if(sBtn) sBtn.style.display='none';
    if(_polyline){ _polyline.setMap(null); _polyline=null; }
    if(typeof _clearRouteTmpMarkers==='function') _clearRouteTmpMarkers();
    if(typeof _showJukrimgulParkingMkr==='function') _showJukrimgulParkingMkr(false);
    var guide=document.getElementById('route-guide'); if(guide) guide.classList.remove('on');
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}
function restoreCoreReturnState(){
  let raw=null;
  try{ raw=sessionStorage.getItem(CORE_RETURN_KEY); }catch(e){ console.warn("[가톨릭길동무]", e); }
  if(!raw) return false;
  let state=null;
  try{ state=JSON.parse(raw); }catch(e){ console.warn("[가톨릭길동무]", e); }
  try{ sessionStorage.removeItem(CORE_RETURN_KEY); }catch(e){ console.warn("[가톨릭길동무]", e); }
  if(!state||!state.mode) return false;

  _mode=state.mode;
  _filterDio=state.filterDio||'all';
  _listSrch=state.listSrch||'';
  _screen='map';
  if(typeof oaiSetMainMapLayerHidden==='function') oaiSetMainMapLayerHidden(false);
  document.documentElement.classList.add('app-active');
  document.documentElement.classList.toggle('parish-mode',_mode==='parish');
  document.documentElement.classList.toggle('retreat-mode',_mode==='retreat');
  const cover=$('cover'); if(cover) cover.style.display='none';
  document.documentElement.classList.add('oai-returning');
  closeAllTabs();
  closeInfoCard();
  clearRouteNoFocus();
  window._noAutoNearby = true;
  const mapEl=$('map');
  const needMapLoad = (!_map || !mapEl || !mapEl.children || !mapEl.children.length);
  if(needMapLoad){
    _resetMapState();
    _mapInited=true;
    _loadMap();
  }
  const restoreDelay = needMapLoad ? 650 : 30;
  try{
    if(typeof oaiHoldStabilityVeil === 'function'){
      oaiHoldStabilityVeil('core-external-return', Math.max(900, restoreDelay + 700));
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  setTimeout(()=>{
    _restoreMapMarkers();
    if(Number.isInteger(state.infoIdx) && state.infoIdx>=0){
      try{
        const _item = _getCurrentItems()[state.infoIdx];
        if(_item){
          _curFromRegion = !!state.fromRegion;
          if(_mode==='shrine') _selectShrineMarker(state.infoIdx);
          else if(_mode==='parish') _selectParishMarker(_item);
          else _selectRetreatMarker(_item);
          const ic=$('info-card');
          if(ic){ ic.classList.add('no-anim'); }
          _showInfoCard(_item, state.infoIdx);
          _focusMarkerAboveInfoCard(_item);
          requestAnimationFrame(()=>{ if(ic) ic.classList.remove('no-anim'); });
        }
      }catch(e){ console.warn("[가톨릭길동무]", e); }
    } else {
      if(state.mapCenter && _map){
        try{
          _map.setCenter(new _LL(state.mapCenter.lat, state.mapCenter.lng));
          if(state.mapLevel) _map.setLevel(state.mapLevel);
        }catch(e){ console.warn("[가톨릭길동무]", e); }
      }
      if(state.activeTab){
        setTimeout(()=>{ try{ openTab(state.activeTab); }catch(e){ console.warn("[가톨릭길동무]", e); } },120);
      }
    }
    setTimeout(()=>{ document.documentElement.classList.remove('oai-returning'); }, 520);
  },restoreDelay);
  return true;
}
window.addEventListener('pageshow', function(e){
  setTimeout(()=>{
    if(oaiIsCoverIntroResetActive()) return;
    if(restoreCoreReturnState()) return;
    if(_screen==='map' && (!_map || !$('map')?.children.length)){
      const reopenTab=_activeTab||'';
      _resetMapState();
      _mapInited=true;
      window._noAutoNearby = true;
      _loadMap();
      setTimeout(()=>{ if(reopenTab) openTab(reopenTab); },700);
    }
  },0);
});

let _SH_RAW = [];

const _DIO={'SE':'서울대교구','SW':'수원교구','DG':'대구대교구','DJ':'대전교구','GJ':'광주대교구','IC':'인천교구','BS':'부산교구','JJ':'전주교구','UJ':'의정부교구','CJ':'청주교구','MS':'마산교구','CC':'춘천교구','WJ':'원주교구','AD':'안동교구','JE':'제주교구','ML':'군종교구'};
const _URL_T={'1':'http://cafe.daum.net/','2':'https://cafe.daum.net/','3':'http://cafe.naver.com/','4':'https://cafe.naver.com/','5':'http://www.','6':'https://www.','7':'http://','8':'https://','P1':'https://www.casuwon.or.kr','P2':'https://www.daegu-archdiocese.or.kr','P3':'https://www.djcatholic.or.kr','P4':'https://www.gjcatholic.or.kr','P5':'http://www.caincheon.or.kr','P6':'https://www.catholicbusan.or.kr','P7':'https://www.jcatholic.or.kr','P8':'http://www.ucatholic.or.kr','P9':'https://www.cdcj.or.kr','PA':'https://cathms.kr','PB':'https://aos.catholic.or.kr','PC':'https://www.diocesejeju.or.kr','PD':'https://www.gunjong.or.kr','PE':'https://sd.uca.or.kr','PR':'https://www.cbck.or.kr/Directory/Retreat/'};
function _decUrl(u){if(!u)return '';const t=_URL_T[u.slice(0,2)];if(t)return t+u.slice(2);const t1=_URL_T[u[0]];return t1?t1+u.slice(1):u;}
function _unpack(raw){return raw.map((r,i)=>({_idx:i,name:r[0],diocese:_DIO[r[1]]||r[1],addr:r[2],tel:r[3]||'',hp:_decUrl(r[4]||''),url:_decUrl(r[5]||''),lat:r[6],lng:r[7]}));}

let PARISHES=[];
let _parishRawLoaded=false;
let _parishDioIndexReady=false;
let _parishDataLoadPromise=null;
let _parishAllDataLoadPromise=null;
const _PARISH_SPLIT_LAZY_MODE=true;

const _PARISH_DIOCESE_ORDER=[
  'SE','IC','SW','UJ','CC','WJ','DJ','CJ',
  'DG','BS','AD','MS','GJ','JJ','JE','ML'
];
const _PARISH_DIOCESE_ASSETS={
  'SE':'parishes-seoul.js',
  'IC':'parishes-incheon.js',
  'SW':'parishes-suwon.js',
  'UJ':'parishes-uijeongbu.js',
  'CC':'parishes-chuncheon.js',
  'WJ':'parishes-wonju.js',
  'DJ':'parishes-daejeon.js',
  'CJ':'parishes-cheongju.js',
  'DG':'parishes-daegu.js',
  'BS':'parishes-busan.js',
  'AD':'parishes-andong.js',
  'MS':'parishes-masan.js',
  'GJ':'parishes-gwangju.js',
  'JJ':'parishes-jeonju.js',
  'JE':'parishes-jeju.js',
  'ML':'parishes-military.js'
};
const _PARISH_DIOCESE_LOAD_STATE={};
const _PARISH_DIOCESE_LOAD_PROMISES={};
const _PARISH_ASSET_VERSION='WebView-Clean-128';
function _getParishDioceseAsset(code){
  return _PARISH_DIOCESE_ASSETS[code] || null;
}
function _getParishDioceseRawStore(){
  try{ return window._PA_DIO_RAW || null; }catch(e){ console.warn('[가톨릭길동무]', e); }
  return null;
}
function _getParishRawByDioceseCode(code){
  const store=_getParishDioceseRawStore();
  if(store && Array.isArray(store[code])) return store[code];
  const raw=_getLegacyParishRawGlobal();
  if(!Array.isArray(raw) || !code) return [];
  return raw.filter(function(r){ return r && r[1]===code; });
}
function _rememberParishDioceseLoaded(code){
  if(code) _PARISH_DIOCESE_LOAD_STATE[code]=true;
  return _PARISH_DIOCESE_LOAD_STATE;
}
function _isParishDioceseReady(code){
  return !!(code && _PARISH_DIOCESE_LOAD_STATE[code] && _getParishRawByDioceseCode(code).length);
}
function _areAllParishDiocesesReady(){
  return _PARISH_DIOCESE_ORDER.every(function(code){ return _isParishDioceseReady(code); });
}
function _rememberAllParishDiocesesLoadedFromRaw(raw){
  if(!Array.isArray(raw)) return _PARISH_DIOCESE_LOAD_STATE;
  raw.forEach(function(r){
    if(r && r[1]) _rememberParishDioceseLoaded(r[1]);
  });
  return _PARISH_DIOCESE_LOAD_STATE;
}
function _mergeLoadedParishRaw(){
  const merged=[];
  const store=_getParishDioceseRawStore();
  _PARISH_DIOCESE_ORDER.forEach(function(code){
    const part=store && Array.isArray(store[code]) ? store[code] : [];
    if(part.length) merged.push.apply(merged, part);
  });
  return merged;
}
function _getLegacyParishRawGlobal(){
  try{ if(Array.isArray(window._PA_RAW) && window._PA_RAW.length) return window._PA_RAW; }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{ if(typeof _PA_RAW!=='undefined' && Array.isArray(_PA_RAW) && _PA_RAW.length) return _PA_RAW; }catch(e){ console.warn('[가톨릭길동무]', e); }
  return null;
}
function _getParishRawGlobal(){
  const legacy=_getLegacyParishRawGlobal();
  if(Array.isArray(legacy) && legacy.length) return legacy;
  const merged=_mergeLoadedParishRaw();
  return merged.length ? merged : null;
}
function _buildParishList(raw){
  raw = Array.isArray(raw) ? raw : [];
  return raw.map((r,i)=>({
    _idx:i,
    name:r[0],
    diocese:_DIO[r[1]]||r[1],
    addr:r[2],
    tel:r[3]||'',
    hp:_decUrl(r[4]||''),
    url:_decUrl(r[5]||''),
    lat:r[6],
    lng:r[7]
  }));
}
function _setParishRawData(raw, loaded){
  raw = Array.isArray(raw) ? raw : [];
  PARISHES=_buildParishList(raw);
  _parishRawLoaded=loaded !== false && raw.length > 0;
  if(_parishRawLoaded) _rememberAllParishDiocesesLoadedFromRaw(raw);
  if(_parishDioIndexReady && typeof _rebuildParishDioIndex==='function') _rebuildParishDioIndex();
  return PARISHES;
}
function _refreshParishDataFromLoadedDioceses(){
  const raw=_getParishRawGlobal() || [];
  return _setParishRawData(raw, raw.length>0);
}
function _initParishDataFromGlobal(){
  return _refreshParishDataFromLoadedDioceses();
}
function _showParishDataLoadingMessage(msg){
  try{
    const listBody=document.getElementById('list-body');
    if(listBody && _mode==='parish') listBody.innerHTML='<div class="empty-msg">'+(msg||'성당 정보를 불러오는 중입니다...')+'</div>';
    const nearbyBody=document.getElementById('nearby-body');
    if(nearbyBody && _mode==='parish' && _activeTab==='nearby') nearbyBody.innerHTML='<div class="empty-msg">'+(msg||'성당 정보를 불러오는 중입니다...')+'</div>';
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _afterParishDataLoaded(){
  try{
    if(_mode==='parish'){
      if(_activeTab==='list') renderList();
      if(_activeDio) _showParishDioMkrs(_activeDio);
      _syncParishDioLabels();
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _ensureParishDioceseDataLoaded(code){
  if(!code) return Promise.reject(new Error('교구 코드가 없습니다.'));
  if(_isParishDioceseReady(code)) return Promise.resolve(_refreshParishDataFromLoadedDioceses());
  if(_PARISH_DIOCESE_LOAD_PROMISES[code]) return _PARISH_DIOCESE_LOAD_PROMISES[code];
  const asset=_getParishDioceseAsset(code);
  if(!asset) return Promise.reject(new Error('교구 데이터 파일을 찾을 수 없습니다: '+code));
  _PARISH_DIOCESE_LOAD_PROMISES[code]=new Promise(function(resolve,reject){
    const already=document.querySelector('script[data-parish-dio="'+code+'"]');
    function finish(){
      const raw=_getParishRawByDioceseCode(code);
      if(raw && raw.length){
        _rememberParishDioceseLoaded(code);
        resolve(_refreshParishDataFromLoadedDioceses());
      }else{
        reject(new Error('성당 교구 데이터가 비어 있습니다: '+code));
      }
    }
    if(already){
      already.addEventListener('load', finish, {once:true});
      already.addEventListener('error', function(){ reject(new Error('성당 교구 데이터 로드 실패: '+code)); }, {once:true});
      setTimeout(function(){ try{ if(_getParishRawByDioceseCode(code).length) finish(); }catch(_e){} },0);
      return;
    }
    const sc=document.createElement('script');
    sc.src=asset+'?v='+_PARISH_ASSET_VERSION;
    sc.dataset.parishDio=code;
    sc.onload=finish;
    sc.onerror=function(){ reject(new Error('성당 교구 데이터 로드 실패: '+code)); };
    document.head.appendChild(sc);
  }).then(function(result){
    delete _PARISH_DIOCESE_LOAD_PROMISES[code];
    _afterParishDataLoaded();
    return result;
  }).catch(function(err){
    delete _PARISH_DIOCESE_LOAD_PROMISES[code];
    throw err;
  });
  return _PARISH_DIOCESE_LOAD_PROMISES[code];
}
function _ensureAllParishDiocesesLoaded(){
  if(_areAllParishDiocesesReady()) return Promise.resolve(_refreshParishDataFromLoadedDioceses());
  if(_parishAllDataLoadPromise) return _parishAllDataLoadPromise;
  _showParishDataLoadingMessage('전체 성당 정보를 불러오는 중입니다...');
  _parishAllDataLoadPromise=Promise.all(_PARISH_DIOCESE_ORDER.map(function(code){
    return _ensureParishDioceseDataLoaded(code);
  })).then(function(){
    _parishAllDataLoadPromise=null;
    return _refreshParishDataFromLoadedDioceses();
  }).catch(function(err){
    _parishAllDataLoadPromise=null;
    throw err;
  });
  return _parishAllDataLoadPromise;
}
function _ensureParishDataLoaded(){
  if(_parishRawLoaded && PARISHES.length) return Promise.resolve(PARISHES);
  if(_parishDataLoadPromise) return _parishDataLoadPromise;
  _parishDataLoadPromise=_ensureAllParishDiocesesLoaded().catch(function(err){
    _parishDataLoadPromise=null;
    throw err;
  });
  return _parishDataLoadPromise;
}
_initParishDataFromGlobal();

const _PRAYER_ASSET_VERSION='WebView-Clean-128';
let _prayerModuleLoadPromise=null;
function _isPrayerModuleReady(){
  return typeof window.initPrayerView === 'function' &&
         typeof window.prRenderList === 'function' &&
         typeof window.prAdjustFont === 'function';
}
function _showPrayerLoadingMessage(msg){
  const body=document.getElementById('pr-list-ul');
  if(body) body.innerHTML='<div class="pr-empty">'+(msg||'기도문을 불러오는 중입니다...')+'</div>';
}
function ensurePrayerModuleLoaded(){
  if(_isPrayerModuleReady()) return Promise.resolve(true);
  if(_prayerModuleLoadPromise) return _prayerModuleLoadPromise;
  _showPrayerLoadingMessage('기도문을 불러오는 중입니다...');
  _prayerModuleLoadPromise=new Promise(function(resolve,reject){
    const existing=document.querySelector('script[data-prayer-loader="true"],script[src*="prayer.js"]');
    function finish(){
      if(_isPrayerModuleReady()) resolve(true);
      else reject(new Error('기도문 모듈이 준비되지 않았습니다.'));
    }
    if(existing){
      existing.addEventListener('load', finish, {once:true});
      existing.addEventListener('error', function(){ reject(new Error('기도문 모듈 로드 실패')); }, {once:true});
      setTimeout(function(){ try{ if(_isPrayerModuleReady()) finish(); }catch(_e){} }, 0);
      return;
    }
    const sc=document.createElement('script');
    sc.src='prayer.js?v='+_PRAYER_ASSET_VERSION;
    sc.dataset.prayerLoader='true';
    sc.onload=finish;
    sc.onerror=function(){ reject(new Error('기도문 모듈 로드 실패')); };
    document.head.appendChild(sc);
  }).catch(function(err){
    _prayerModuleLoadPromise=null;
    throw err;
  });
  return _prayerModuleLoadPromise;
}
try{ window.ensurePrayerModuleLoaded=ensurePrayerModuleLoaded; }catch(e){ console.warn('[가톨릭길동무]', e); }

let _RT_RAW = [];
let _retreatRawLoaded = false;
let _retreatDataLoadPromise = null;
const _RETREAT_ASSET_VERSION='V1';

let RETREATS = [];
function _buildRetreatList(raw){
  return _unpack(Array.isArray(raw) ? raw : []);
}
function _getRetreatRawGlobal(){
  try{ if(Array.isArray(window._RT_RAW)) return window._RT_RAW; }catch(e){ console.warn('[가톨릭길동무]', e); }
  return null;
}
function _setRetreatRawData(raw, loaded){
  _RT_RAW = Array.isArray(raw) ? raw : [];
  RETREATS = _buildRetreatList(_RT_RAW);
  _retreatRawLoaded = loaded !== false && _RT_RAW.length > 0;
  return RETREATS;
}
function _initRetreatDataFromGlobal(){
  const raw=_getRetreatRawGlobal();
  return _setRetreatRawData(raw || [], !!raw);
}
function _ensureRetreatDataLoaded(){
  const existingRaw=_getRetreatRawGlobal();
  if(existingRaw && (!_retreatRawLoaded || !RETREATS.length)) _setRetreatRawData(existingRaw, true);
  if(_retreatRawLoaded && RETREATS.length) return Promise.resolve(RETREATS);
  if(_retreatDataLoadPromise) return _retreatDataLoadPromise;
  _retreatDataLoadPromise=new Promise(function(resolve,reject){
    const already=document.querySelector('script[data-retreat-loader="true"],script[src*="retreats.js"]');
    function finish(){
      const raw=_getRetreatRawGlobal();
      if(raw && raw.length){ resolve(_setRetreatRawData(raw, true)); }
      else reject(new Error('피정의집 데이터가 비어 있습니다.'));
    }
    if(already){
      already.addEventListener('load', finish, {once:true});
      already.addEventListener('error', function(){ reject(new Error('피정의집 데이터 로드 실패')); }, {once:true});
      setTimeout(function(){ try{ if(_getRetreatRawGlobal()) finish(); }catch(_e){} }, 0);
      return;
    }
    const sc=document.createElement('script');
    sc.src='retreats.js?v='+_RETREAT_ASSET_VERSION;
    sc.dataset.retreatLoader='true';
    sc.onload=finish;
    sc.onerror=function(){ reject(new Error('피정의집 데이터 로드 실패')); };
    document.head.appendChild(sc);
  }).catch(function(err){
    _retreatDataLoadPromise=null;
    throw err;
  });
  return _retreatDataLoadPromise;
}
try{ window._setRetreatRawData=_setRetreatRawData; }catch(e){ console.warn('[가톨릭길동무]', e); }
_initRetreatDataFromGlobal();
function _getCurrentItems(){return _mode==='shrine'?SHRINES:(_mode==='retreat'?RETREATS:PARISHES);}
function _getModeTypeText(){return _mode==='shrine'?'성지':(_mode==='retreat'?'피정의 집':'성당');}
function _getModeTypeLabel(item){return _mode==='shrine'?item.type:(_mode==='retreat'?'🏔 피정의 집':'⛪ 성당');}
const _RETREAT_DIO_COLORS={'SE':'#c0392b','IC':'#c0392b','SW':'#c0392b','UJ':'#c0392b','CC':'#1565c0','WJ':'#1565c0','DJ':'#c0392b','CJ':'#1565c0','DG':'#1b7a3e','AD':'#1b7a3e','BS':'#1565c0','MS':'#1b7a3e','GJ':'#1b7a3e','JJ':'#1b7a3e','JE':'#1b7a3e','ML':'#c0392b'};
const OAI_CATHEDRAL_CATEGORY_COLOR = '#3F4752';
const OAI_RETREAT_CATEGORY_COLOR = '#3F6F5A';
const OAI_RETREAT_LIST_DOT_COLOR = '#c0392b';
function _getRetreatColor(item){return OAI_RETREAT_CATEGORY_COLOR;}
function _getModeMarkerColor(item){return _mode==='shrine'?(TC[item.type]||'#555'):(_mode==='retreat'?_getRetreatColor(item):OAI_CATHEDRAL_CATEGORY_COLOR);}
function _getRouteGuideTarget(){return _mode==='shrine'?'성지':(_mode==='retreat'?'피정의 집':'성당');}
const OAI_ROUTE_VISUAL_DELAY_MS = 260;

const JSKEY = (window.APP_CONFIG && window.APP_CONFIG.KAKAO_JS_KEY) || '';
const KAKAO_REST_PROXY_URL = (window.APP_CONFIG && window.APP_CONFIG.KAKAO_REST_PROXY_URL) || '';
(function(){
  if(!JSKEY || !KAKAO_REST_PROXY_URL){
    console.warn(
      '[가톨릭길동무] Kakao 설정이 비어 있습니다.\n' +
      '  JS 키는 도메인 제한 후 공개 코드에 둘 수 있고, REST 호출은 Worker 프록시 URL로 연결해야 합니다.'
    );
  }
})();
function _appendQueryToUrl(url, params){
  const qs = new URLSearchParams(params || {}).toString();
  if(!qs) return url;
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + qs;
}
function _kakaoRestProxyUrl(endpoint, params){
  if(!KAKAO_REST_PROXY_URL) return '';
  return _appendQueryToUrl(KAKAO_REST_PROXY_URL, Object.assign({ endpoint: endpoint }, params || {}));
}
function _kakaoRestFetch(endpoint, params){
  const url = _kakaoRestProxyUrl(endpoint, params);
  if(!url) return Promise.reject(new Error('missing kakao rest proxy url'));
  return fetch(url, { method:'GET', credentials:'omit', cache:'no-store' });
}
function _kakaoDirectionsFetch(origin, destination){
  return _kakaoRestFetch('directions', { origin: origin, destination: destination, priority:'RECOMMEND' });
}
function _kakaoKeywordFetch(query, size, page){
  var params = { query: query, size: String(size || 10) };
  if(page) params.page = String(page);
  return _kakaoRestFetch('keyword', params);
}
function _dedupeKakaoDocs(groups, max){
  var seen = {};
  var docs = [];
  (groups || []).forEach(function(list){
    (list || []).forEach(function(d){
      var key = d.id || [d.place_name, d.x, d.y, d.road_address_name || d.address_name || ''].join('|');
      if(seen[key]) return;
      seen[key] = true;
      docs.push(d);
    });
  });
  return docs.slice(0, max);
}
function _kakaoKeywordDocsFromRest(query, max){
  var pages = Math.ceil(max / 15);
  var jobs = [];
  for(var page=1; page<=pages; page++){
    var size = Math.min(15, max - ((page - 1) * 15));
    jobs.push(
      _kakaoKeywordFetch(query, size, page)
        .then(function(r){ return r.json(); })
        .then(function(data){ return (data && data.documents) ? data.documents : []; })
        .catch(function(){ return []; })
    );
  }
  return Promise.all(jobs).then(function(groups){ return _dedupeKakaoDocs(groups, max); });
}
function _kakaoKeywordDocsFromJs(query, max){
  return new Promise(function(resolve){
    try{
      if(!(window.kakao && kakao.maps && kakao.maps.services && kakao.maps.services.Places)){
        resolve([]);
        return;
      }
      var places = new kakao.maps.services.Places();
      var pageLimit = Math.ceil(max / 15);
      var groups = [];
      var pageCount = 0;
      var settled = false;

      function done(){
        if(settled) return;
        settled = true;
        resolve(_dedupeKakaoDocs(groups, max));
      }

      var searchOpts = { size: 15 };
      try{ if(kakao.maps.services.SortBy && kakao.maps.services.SortBy.ACCURACY) searchOpts.sort = kakao.maps.services.SortBy.ACCURACY; }catch(_e){}
      places.keywordSearch(query, function(data, status, pagination){
        try{
          var OK = kakao.maps.services.Status.OK;
          if(status === OK && data && data.length){
            groups.push(data);
            pageCount += 1;
            if(_dedupeKakaoDocs(groups, max).length >= max){ done(); return; }
            if(pagination && pagination.hasNextPage && pageCount < pageLimit){
              setTimeout(function(){
                try{ pagination.nextPage(); }catch(_e){ done(); }
              }, 80);
              return;
            }
          }
        }catch(e){
          console.warn('[가톨릭길동무]', e);
        }
        done();
      }, searchOpts);

      setTimeout(done, 4200);
    }catch(e){
      console.warn('[가톨릭길동무]', e);
      resolve([]);
    }
  });
}
function _kakaoKeywordDocs(query, limit){
  var max = Math.max(1, parseInt(limit || 10, 10) || 10);
  return _kakaoKeywordDocsFromRest(query, max).then(function(restDocs){
    restDocs = restDocs || [];
    if(restDocs.length >= max) return restDocs.slice(0, max);
    return _kakaoKeywordDocsFromJs(query, max).then(function(jsDocs){
      return _dedupeKakaoDocs([restDocs, jsDocs || []], max);
    }).catch(function(){ return restDocs.slice(0, max); });
  }).catch(function(){
    return _kakaoKeywordDocsFromJs(query, max).then(function(jsDocs){ return (jsDocs || []).slice(0, max); });
  });
}
const KAKAO_PLACE_SEARCH_DISPLAY_LIMIT = 30;
const TC    = {'성지':'#c0392b','순례지':'#1565c0','순교 사적지':'#1b7a3e'};
const _DIOS=[['all','전체'],['서울대교구','서울'],['인천교구','인천'],['수원교구','수원'],['의정부교구','의정부'],['춘천교구','춘천'],['원주교구','원주'],['대전교구','대전'],['청주교구','청주'],['대구대교구','대구'],['안동교구','안동'],['부산교구','부산'],['마산교구','마산'],['광주대교구','광주'],['전주교구','전주'],['제주교구','제주'],['군종교구','군종']];
const MY_DIOCESE_STORAGE_KEY='oai_my_diocese_name';
function _getMyDioceseName(){
  try{
    const name=(localStorage.getItem(MY_DIOCESE_STORAGE_KEY)||'').trim();
    if(!name || name==='군종교구') return '';
    return _DIOS.some(function(x){ return x[0]===name; }) ? name : '';
  }catch(e){ return ''; }
}
function _orderedDiosForMode(mode){
  const base=_DIOS.slice();
  const reorderModes={shrine:true, parish:true, retreat:true};
  if(!reorderModes[mode]) return base;
  const mine=_getMyDioceseName();
  if(!mine) return base;
  const mineRow=base.find(function(x){ return x[0]===mine; });
  if(!mineRow) return base;
  const rest=base.slice(1).filter(function(x){ return x[0]!==mine; });
  return [base[0], mineRow].concat(rest);
}
function _orderedGroupEntriesForMyDiocese(groups){
  const entries=Object.entries(groups||{});
  const mine=_getMyDioceseName();
  if(!mine || entries.length<2) return entries;
  return entries.slice().sort(function(a,b){
    const aa=a[0]===mine ? 0 : 1;
    const bb=b[0]===mine ? 0 : 1;
    return aa-bb;
  });
}
function _isMyDioceseName(dio){
  const mine=_getMyDioceseName();
  return !!(mine && dio && dio===mine);
}
function _myDioceseFilterLabel(label, dio){
  return _isMyDioceseName(dio) ? `${label}<span class="my-dio-filter-badge">나의 교구</span>` : label;
}
function _setDioHeading(el, dio){
  if(!el) return;
  const mine=_isMyDioceseName(dio);
  el.className='dio-hd'+(mine?' my-diocese-dio-hd':'');
  el.textContent='';
  el.appendChild(document.createTextNode(dio || ''));
  if(mine){
    const badge=document.createElement('span');
    badge.className='my-dio-heading-badge';
    badge.textContent='나의 교구';
    el.appendChild(badge);
  }
}
function _renderDioFilterBars(mode){
  const fb=$('list-filter-bar'), sm=$('sm-filter-bar');
  if(!fb || !sm) return;
  const rows=_orderedDiosForMode(mode);
  const mine=_getMyDioceseName();
  const sig=String(mode||'')+'|'+mine+'|'+rows.map(function(x){ return x[0]; }).join(',');
  if(fb.dataset.dioSig===sig && sm.dataset.dioSig===sig && fb.children.length && sm.children.length) return;
  fb.innerHTML='';
  sm.innerHTML='';
  rows.forEach(function(row,i){
    const v=row[0], l=row[1], isMine=_isMyDioceseName(v);
    const extra=isMine?' my-diocese-filter-btn':'';
    fb.innerHTML+=`<button class="filter-btn${i?'':' active'}${extra}" onclick="setDioFilter('${v}',this)">${_myDioceseFilterLabel(l,v)}</button>`;
    sm.innerHTML+=`<button class="sm-fb${i?'':' on'}${extra}" onclick="setSmDio('${v}',this)">${_myDioceseFilterLabel(l,v)}</button>`;
  });
  fb.dataset.dioSig=sig;
  sm.dataset.dioSig=sig;
}

const _SU='https://www.cbck.or.kr/Catholic/Shrine/Read?seq=';
const _navCache = new Map();
const _NAV_CONCURRENCY = 5;
let _navActive = 0;
const _navQueue = [];

function _navFetch(origin, dest) {
  const key = `${origin}→${dest}`;
  if (_navCache.has(key)) return Promise.resolve(_navCache.get(key));
  return new Promise((resolve) => {
    function run() {
      _navActive++;
      _kakaoDirectionsFetch(origin, dest)
        .then(r => r.json())
        .then(data => {
          const route = data.routes?.[0];
          const val = (route && route.result_code === 0)
            ? { km: route.summary.distance / 1000, dur: route.summary.duration }
            : null;
          if (val) _navCache.set(key, val);
          resolve(val);
        })
        .catch(() => resolve(null))
        .finally(() => {
          _navActive--;
          if (_navQueue.length) _navQueue.shift()();
        });
    }
    if (_navActive < _NAV_CONCURRENCY) run();
    else _navQueue.push(run);
  });
}
const $=id=>document.getElementById(id);
const $$=s=>document.querySelectorAll(s);
const _GEO=navigator.geolocation;
const _GO1={enableHighAccuracy:true,timeout:30000,maximumAge:30000};
const _GO2={enableHighAccuracy:false,timeout:25000,maximumAge:600000};
const _GO3={enableHighAccuracy:false,timeout:40000,maximumAge:600000};
const _EC=encodeURIComponent;
const _NS='xmlns="http://www.w3.org/2000/svg"';
const _svgUrl=s=>'data:image/svg+xml;charset=utf-8,'+_EC(s);
const _isMob=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const _isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
const _TY={'A':'성지','B':'순례지','C':'순교 사적지'};

let _shrineRawLoaded = false;
let _shrineDataLoadPromise = null;
const _SHRINE_ASSET_VERSION='WebView-Clean-128';
let SHRINES = [];
let JUKRIMGUL_IDX = -1;
function _decodeShrineHomePage(hp){
  if(!hp) return '';
  if(_URL_T[hp.slice(0,2)]) return _URL_T[hp.slice(0,2)] + hp.slice(2);
  if(_URL_T[hp[0]]) return _URL_T[hp[0]] + hp.slice(1);
  return hp;
}
function _buildShrineList(raw){
  return (Array.isArray(raw) ? raw : []).map(function(src){
    const s = Object.assign({}, src);
    if(s.hp) s.hp = _decodeShrineHomePage(s.hp);
    if(_DIO[s.diocese]) s.diocese = _DIO[s.diocese];
    if(_TY[s.type]) s.type = _TY[s.type];
    return s;
  });
}
function _getShrineRawGlobal(){
  try{ if(Array.isArray(window._SH_RAW)) return window._SH_RAW; }catch(e){ console.warn('[가톨릭길동무]', e); }
  return null;
}
function _rebuildShrineSpecialIndexes(){
  try{ JUKRIMGUL_IDX = SHRINES.findIndex(function(s){ return s && s.name === '죽림굴'; }); }catch(e){ JUKRIMGUL_IDX = -1; }
}
function _setShrineRawData(raw, loaded){
  _SH_RAW = Array.isArray(raw) ? raw : [];
  SHRINES = _buildShrineList(_SH_RAW);
  _shrineRawLoaded = loaded !== false && _SH_RAW.length > 0;
  _rebuildShrineSpecialIndexes();
  return SHRINES;
}
function _initShrineDataFromGlobal(){
  const raw = _getShrineRawGlobal();
  return _setShrineRawData(raw || _SH_RAW || [], !!(raw || (_SH_RAW && _SH_RAW.length)));
}
function _ensureShrineDataLoaded(){
  const existingRaw=_getShrineRawGlobal();
  if(existingRaw && (!_shrineRawLoaded || !SHRINES.length)) _setShrineRawData(existingRaw, true);
  if(_shrineRawLoaded && SHRINES.length) return Promise.resolve(SHRINES);
  if(_shrineDataLoadPromise) return _shrineDataLoadPromise;
  _shrineDataLoadPromise=new Promise(function(resolve,reject){
    const already=document.querySelector('script[data-shrine-loader="true"],script[src*="shrines.js"]');
    function finish(){
      const raw=_getShrineRawGlobal();
      if(raw && raw.length){ resolve(_setShrineRawData(raw, true)); }
      else reject(new Error('성지 데이터가 비어 있습니다.'));
    }
    if(already){
      already.addEventListener('load', finish, {once:true});
      already.addEventListener('error', function(){ reject(new Error('성지 데이터 로드 실패')); }, {once:true});
      setTimeout(function(){ try{ if(_getShrineRawGlobal()) finish(); }catch(_e){} }, 0);
      return;
    }
    const sc=document.createElement('script');
    sc.src='shrines.js?v='+_SHRINE_ASSET_VERSION;
    sc.dataset.shrineLoader='true';
    sc.onload=finish;
    sc.onerror=function(){ reject(new Error('성지 데이터 로드 실패')); };
    document.head.appendChild(sc);
  }).catch(function(err){
    _shrineDataLoadPromise=null;
    throw err;
  });
  return _shrineDataLoadPromise;
}
try{ window._setShrineRawData = _setShrineRawData; }catch(e){ console.warn('[가톨릭길동무]', e); }
_initShrineDataFromGlobal();
const AppState = {
  map:              null,
  markers:          [],
  retreatMarkers:   [],
  myMkr:            null,
  myLat:            null,
  myLng:            null,
  jukrimgulParkMkr: null,
  startTmpMkr:      null,
  wayTmpMkr:        null,
  way2TmpMkr:       null,
  way3TmpMkr:       null,
  endTmpMkr:        null,
  paSelMkr:         null,
  selIdx:           -1,
  polyline:         null,

  mode:       'shrine',
  screen:     'cover',
  activeTab:  null,

  filterDio:  'all',
  listSrch:   '',

  regionLat:       null,
  regionLng:       null,
  regionName:      '',
  regionPlaceName: '',
  regionCache:     [],
  regionMarker:    null,

  nearbyCache: [],
  nearbyParishMarkers: [],
  nearbyRequestSeq: 0,
  nearbyRequestMode: null,
  categoryEntryCenteredAt: 0,
  categoryEntryCenteredMode: null,
  categoryEntryCenteredSource: '',

  routeMode:        false,
  rS:               null,
  rW:               null,
  routeWaypointEnabled: false,
  rW2:              null,
  routeWaypoint2Enabled: false,
  rW3:              null,
  routeWaypoint3Enabled: false,
  routeWaypointSummaryExpanded: false,
  rE:               null,
  routeRegionStart: null,
  routeInfoRestoreBlockedUntil: 0,

  smRole: 'start',
  smDio:  'all',

  curInfoItem:   null,
  curFromRegion: false,

  kakaoLaunching: false,
  mapInited:      false,
  dp:             null,

  exitReady: false,
  exitTimer: null,

  dioMkrs:            {},
  dioOverlays:        {},
  activeDio:          null,
  parishSysInited:    false,
  parishIdleListener: null,
  parishDioUserZoomTouched: false,
  parishDioProgrammaticMoveUntil: 0,

  smPlaceDebounce: null,
  smTab: 'cat',
};

(function installStateProxy() {
  const map = [
    ['_map',              'map'],
    ['_markers',          'markers'],
    ['_retreatMarkers',   'retreatMarkers'],
    ['_myMkr',            'myMkr'],
    ['_myLat',            'myLat'],
    ['_myLng',            'myLng'],
    ['_jukrimgulParkMkr', 'jukrimgulParkMkr'],
    ['_startTmpMkr',      'startTmpMkr'],
    ['_wayTmpMkr',        'wayTmpMkr'],
    ['_way2TmpMkr',       'way2TmpMkr'],
    ['_way3TmpMkr',       'way3TmpMkr'],
    ['_endTmpMkr',        'endTmpMkr'],
    ['_paSelMkr',         'paSelMkr'],
    ['_selIdx',           'selIdx'],
    ['_polyline',         'polyline'],
    ['_mode',             'mode'],
    ['_screen',           'screen'],
    ['_activeTab',        'activeTab'],
    ['_filterDio',        'filterDio'],
    ['_listSrch',         'listSrch'],
    ['_regionLat',        'regionLat'],
    ['_regionLng',        'regionLng'],
    ['_regionName',       'regionName'],
    ['_regionPlaceName',  'regionPlaceName'],
    ['_regionCache',      'regionCache'],
    ['_regionMarker',     'regionMarker'],
    ['_nearbyCache',      'nearbyCache'],
    ['_routeMode',        'routeMode'],
    ['_rS',               'rS'],
    ['_rW',               'rW'],
    ['_routeWaypointEnabled','routeWaypointEnabled'],
    ['_rW2',              'rW2'],
    ['_routeWaypoint2Enabled','routeWaypoint2Enabled'],
    ['_rW3',              'rW3'],
    ['_routeWaypoint3Enabled','routeWaypoint3Enabled'],
    ['_routeWaypointSummaryExpanded','routeWaypointSummaryExpanded'],
    ['_rE',               'rE'],
    ['_routeRegionStart', 'routeRegionStart'],
    ['_routeInfoRestoreBlockedUntil', 'routeInfoRestoreBlockedUntil'],
    ['_smRole',           'smRole'],
    ['_smDio',            'smDio'],
    ['_curInfoItem',      'curInfoItem'],
    ['_curFromRegion',    'curFromRegion'],
    ['_kakaoLaunching',   'kakaoLaunching'],
    ['_mapInited',        'mapInited'],
    ['_dp',               'dp'],
    ['_exitReady',        'exitReady'],
    ['_exitTimer',        'exitTimer'],
    ['_dioMkrs',             'dioMkrs'],
    ['_dioOverlays',         'dioOverlays'],
    ['_activeDio',           'activeDio'],
    ['_parishSysInited',     'parishSysInited'],
    ['_parishIdleListener',  'parishIdleListener'],
    ['_parishDioUserZoomTouched', 'parishDioUserZoomTouched'],
    ['_parishDioProgrammaticMoveUntil', 'parishDioProgrammaticMoveUntil'],
    ['_smPlaceDebounce',  'smPlaceDebounce'],
    ['_smTab',            'smTab'],
  ];
  map.forEach(function([legacyName, stateKey]) {
    Object.defineProperty(window, legacyName, {
      get: function() { return AppState[stateKey]; },
      set: function(v) { AppState[stateKey] = v; },
      configurable: true,
      enumerable: false,
    });
  });
})();

const JUKRIMGUL_PARKING = {lat:35.550726, lng:129.014589, name:'죽림굴주차장', kw:'죽림굴주차장'};
(function(){
  var root = document.documentElement;
  var vv = window.visualViewport || null;
  var stableH = 0;
  var _kbOpen = false;
  function _num(v){ v = Math.round(v || 0); return isFinite(v) ? v : 0; }
  function _activeEditable(){
    try{
      var el = document.activeElement;
      if(!el) return false;
      var tag = (el.tagName || '').toUpperCase();
      if(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      return !!el.isContentEditable;
    }catch(_e){ return false; }
  }
  function _measure(){
    var layoutH = _num(root && root.clientHeight);
    var innerH = _num(window.innerHeight);
    var visibleH = _num(vv && vv.height);
    var h = Math.max(layoutH, innerH, visibleH);
    return {layoutH:layoutH, innerH:innerH, visibleH:visibleH || innerH || layoutH, maxH:h};
  }
  function _set(open){
    open = !!open;
    if(open === _kbOpen) return;
    _kbOpen = open;
    root.classList.toggle('kb-open', open);
  }
  function updateKeyboardState(){
    try{
      var m = _measure();
      var focused = _activeEditable();
      if(!focused && m.maxH && m.maxH > stableH) stableH = m.maxH;
      if(!stableH) stableH = m.maxH || m.visibleH || 0;
      var ratioBase = Math.max(stableH || 0, m.innerH || 0, m.layoutH || 0);
      var byHeight = !!(ratioBase && m.visibleH && m.visibleH < ratioBase - 120);
      var byOffset = !!(vv && _num(vv.offsetTop) > 0);
      var byFocusShrink = !!(focused && ratioBase && m.visibleH && m.visibleH < ratioBase - 80);
      _set(byHeight || byOffset || byFocusShrink);
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  window.__oaiUpdateKeyboardState = updateKeyboardState;
  if(vv){
    vv.addEventListener('resize', updateKeyboardState, {passive:true});
    vv.addEventListener('scroll', updateKeyboardState, {passive:true});
  }
  window.addEventListener('resize', updateKeyboardState, {passive:true});
  document.addEventListener('focusin', function(){ setTimeout(updateKeyboardState, 40); setTimeout(updateKeyboardState, 220); }, true);
  document.addEventListener('focusout', function(){ setTimeout(updateKeyboardState, 120); setTimeout(updateKeyboardState, 360); }, true);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', updateKeyboardState);
  else updateKeyboardState();
})();
(function(){
  function measureSA(){
  const b=document.createElement('div');
  b.style.cssText='position:fixed;bottom:0;left:0;width:1px;height:env(safe-area-inset-bottom,0px);pointer-events:none;visibility:hidden;';
  document.body.appendChild(b);
  const sb=b.offsetHeight||0;
  document.body.removeChild(b);
  if(sb>0) document.documentElement.style.setProperty('--sb',sb+'px');
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',measureSA):measureSA();
  window.addEventListener('resize',measureSA);
})();
(function(){
  const c=$('cv-stars');
  if(!c) return;
  for(let i=0;i<22;i++){
  const s=document.createElement('span');
  s.className='cv-star';
  const sz=Math.random()*4+2;
  s.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${(Math.random()*3).toFixed(1)}s;animation-duration:${(2+Math.random()*3).toFixed(1)}s;`;
  c.appendChild(s);
  }
})();
(function(){
  if(window.navigator.standalone===true||window.matchMedia('(display-mode:standalone)').matches) return;
  if(/iphone|ipad|ipod/i.test(navigator.userAgent)){
  return;
  }
})();

function triggerPwaInstall(){ return false; }




function oaiEnterView(el){
  if(!el) return;
  try{
    var root=document.documentElement;
    if(root.classList.contains('oai-returning')) return;
    el.classList.remove('oai-enter-ready','oai-enter-show','oai-popup-ready','oai-popup-show','oai-prepaint-view');
    if(el.id === 'app') return;
    var veil=document.getElementById('oai-category-entry-veil');
    if(!veil) return;
    var ms=parseInt(getComputedStyle(root).getPropertyValue('--oai-category-enter-ms'),10) || 700;
    clearTimeout(window.__oaiCategoryDissolveTimer);
    clearTimeout(window.__oaiCategoryVeilTimer);
    veil.style.opacity='1';
    veil.className='soft';
    root.classList.remove('oai-category-dissolving');
    root.classList.add('oai-category-entering','oai-category-dissolve');
    try{ void veil.offsetHeight; }catch(_e){}
    var show=function(){
      try{
        root.classList.add('oai-category-dissolving');
        veil.style.opacity='0';
        window.__oaiCategoryDissolveTimer=setTimeout(function(){
          try{
            root.classList.remove('oai-category-entering','oai-category-dissolve','oai-category-dissolving');
            veil.style.opacity='';
            veil.className='';
          }catch(e){ console.warn("[가톨릭길동무]", e); }
        }, ms + 120);
      }catch(e){ console.warn("[가톨릭길동무]", e); }
    };
    if(window.requestAnimationFrame) requestAnimationFrame(show);
    else setTimeout(show,16);
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}

function oaiEnterPopup(el){
  if(!el) return;
  try{
    var root=document.documentElement;
    if(root.classList.contains('oai-returning')) return;
    el.classList.remove('oai-popup-ready','oai-popup-show','oai-enter-ready','oai-enter-show','oai-prepaint-view');
    el.classList.add('oai-popup-ready');
    try{ void el.offsetHeight; }catch(_e){}
    var ms=parseInt(getComputedStyle(root).getPropertyValue('--oai-popup-enter-ms'),10) || 500;
    var show=function(){
      try{
        el.classList.add('oai-popup-show');
        clearTimeout(el.__oaiPopupTimer);
        el.__oaiPopupTimer=setTimeout(function(){
          try{ el.classList.remove('oai-popup-ready','oai-popup-show','oai-prepaint-view'); }catch(e){ console.warn("[가톨릭길동무]", e); }
        }, ms + 120);
      }catch(e){ console.warn("[가톨릭길동무]", e); }
    };
    if(window.requestAnimationFrame) requestAnimationFrame(show);
    else setTimeout(show,16);
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}


function oaiShowCategoryEntryVeil(mode){
  try{
    var veil=document.getElementById('oai-category-entry-veil');
    if(!veil) return;
    veil.className = mode || 'shrine';
    document.documentElement.classList.add('oai-category-entering');
    clearTimeout(window.__oaiCategoryVeilTimer);
    window.__oaiCategoryVeilTimer=setTimeout(oaiHideCategoryEntryVeil, 700);
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}
function oaiHideCategoryEntryVeil(){
  try{
    clearTimeout(window.__oaiCategoryVeilTimer);
    var root=document.documentElement;
    var veil=document.getElementById('oai-category-entry-veil');
    if(veil){ veil.style.opacity='0'; }
    setTimeout(function(){
      try{
        root.classList.remove('oai-category-entering');
        if(veil){ veil.style.opacity=''; veil.className=''; }
      }catch(e){ console.warn("[가톨릭길동무]", e); }
    }, 230);
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}



function _beginNearbyRequest(){
  try{
    if(AppState){
      AppState.nearbyRequestSeq=(Number(AppState.nearbyRequestSeq)||0)+1;
      AppState.nearbyRequestMode=_mode;
      return {seq:AppState.nearbyRequestSeq, mode:_mode};
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  return {seq:0, mode:_mode};
}
function _cancelNearbyRequests(){
  try{
    if(AppState){
      AppState.nearbyRequestSeq=(Number(AppState.nearbyRequestSeq)||0)+1;
      AppState.nearbyRequestMode=null;
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _isNearbyRequestCurrent(token){
  try{
    if(!token || !AppState) return false;
    if(Number(token.seq)!==Number(AppState.nearbyRequestSeq)) return false;
    if(String(token.mode||'')!==String(_mode||'')) return false;
    if(_screen!=='map' || _activeTab!=='nearby') return false;
    return true;
  }catch(e){ return false; }
}

function oaiPreopenNearbySheetForCategory(){
  try{
    if(!(_mode==='shrine' || _mode==='parish' || _mode==='retreat')) return;
    _updateSheetPanelTitles();
    ['list','region','route'].forEach(function(n){
      var s=$('sheet-'+n);
      if(s){
        s.classList.remove('open','from-left','from-right','exit-left','exit-right','oai-preopen-nearby');
      }
    });
    var sheet=$('sheet-nearby');
    var body=$('nearby-body');
    if(sheet){
      sheet.style.display='';
      sheet.classList.remove('from-left','from-right','exit-left','exit-right');
      sheet.classList.add('open','oai-preopen-nearby');
    }
    if(body){
      body.innerHTML='<div class="empty-msg">📍 위치 권한 상태를 확인하는 중...</div>';
      try{ body.scrollTop=0; }catch(_e){}
    }
    if(typeof _updateTabBtns==='function') _updateTabBtns('nearby');
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function startApp(mode){
  if(mode==='shrine' && (!_shrineRawLoaded || !SHRINES.length)){
    _mode='shrine';
    try{ _cancelNearbyRequests(); }catch(e){ console.warn('[가톨릭길동무]', e); }
    try{
      const cover=$('cover');
      if(cover) cover.style.display='none';
      if(typeof oaiSetMainMapLayerHidden==='function') oaiSetMainMapLayerHidden(false);
      document.documentElement.classList.add('app-active');
      document.documentElement.classList.remove('parish-mode','retreat-mode');
      const mapEl=$('map');
      if(mapEl) mapEl.innerHTML='<div class="map-loading"><div class="map-loading-icon">✝</div><div class="map-loading-txt">성지 정보를 불러오는 중...</div></div>';
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    _ensureShrineDataLoaded().then(function(){ startApp('shrine'); }).catch(function(err){
      console.warn('[가톨릭길동무] 성지 데이터 로드 실패', err);
      try{ alert('성지 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.'); }catch(_e){}
      try{ if(typeof goToCover==='function') goToCover(); }catch(_e){}
      try{ if(typeof oaiHideCategoryEntryVeil==='function') oaiHideCategoryEntryVeil(); }catch(_e){}
    });
    return;
  }
  if(mode==='retreat' && (!_retreatRawLoaded || !RETREATS.length)){
    _mode='retreat';
    try{ _cancelNearbyRequests(); }catch(e){ console.warn('[가톨릭길동무]', e); }
    try{
      const cover=$('cover');
      if(cover) cover.style.display='none';
      if(typeof oaiSetMainMapLayerHidden==='function') oaiSetMainMapLayerHidden(false);
      document.documentElement.classList.add('app-active','retreat-mode');
      document.documentElement.classList.remove('parish-mode');
      const mapEl=$('map');
      if(mapEl) mapEl.innerHTML='<div class="map-loading"><div class="map-loading-icon">✝</div><div class="map-loading-txt">피정의집 정보를 불러오는 중...</div></div>';
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    _ensureRetreatDataLoaded().then(function(){ startApp('retreat'); }).catch(function(err){
      console.warn('[가톨릭길동무] 피정의집 데이터 로드 실패', err);
      try{ alert('피정의집 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.'); }catch(_e){}
      try{ if(typeof goToCover==='function') goToCover(); }catch(_e){}
      try{ if(typeof oaiHideCategoryEntryVeil==='function') oaiHideCategoryEntryVeil(); }catch(_e){}
    });
    return;
  }
  if(mode==='parish' && !_PARISH_SPLIT_LAZY_MODE && (!_parishRawLoaded || !PARISHES.length)){
    _mode='parish';
    try{ _cancelNearbyRequests(); }catch(e){ console.warn('[가톨릭길동무]', e); }
    try{
      const cover=$('cover');
      if(cover) cover.style.display='none';
      if(typeof oaiSetMainMapLayerHidden==='function') oaiSetMainMapLayerHidden(false);
      document.documentElement.classList.add('app-active','parish-mode');
      document.documentElement.classList.remove('retreat-mode');
      const mapEl=$('map');
      if(mapEl) mapEl.innerHTML='<div class="map-loading"><div class="map-loading-icon">✝</div><div class="map-loading-txt">성당 정보를 불러오는 중...</div></div>';
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    _ensureParishDataLoaded().then(function(){ startApp('parish'); }).catch(function(err){
      console.warn('[가톨릭길동무] 성당 데이터 로드 실패', err);
      try{ alert('성당 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.'); }catch(_e){}
      try{ if(typeof goToCover==='function') goToCover(); }catch(_e){}
      try{ if(typeof oaiHideCategoryEntryVeil==='function') oaiHideCategoryEntryVeil(); }catch(_e){}
    });
    return;
  }
  _mode=mode;
  try{ _cancelNearbyRequests(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  _filterDio='all';
  _listSrch='';
  window._noAutoNearby = false;
  try{ _clearRegionMarker(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  _regionLat=null; _regionLng=null; _regionCache=[];
  _regionName=''; _regionPlaceName='';
  _routeRegionStart=null;
  _nearbyCache=[];
  _curFromRegion=false;
  _curInfoItem=null;
  closeAllTabs();
  closeInfoCard();
  resetRoute();
  const _ls=$('list-srch-inp'); if(_ls) _ls.value='';
  const _lsx=$('list-srch-x'); if(_lsx) _lsx.style.display='none';
  _renderDioFilterBars(mode);
  $$('.filter-btn').forEach((b,i)=>b.classList.toggle('active',i===0));
  $$('.sm-fb').forEach((b,i)=>b.classList.toggle('on',i===0));

  _screen='map';
  try{ if(window._historyEnterMap) window._historyEnterMap(); }catch(e){ console.warn("[가톨릭길동무]", e); }
  $('cover').style.display='none';
  if(typeof oaiSetMainMapLayerHidden==='function') oaiSetMainMapLayerHidden(false);
  document.documentElement.classList.add('app-active');
  document.documentElement.classList.toggle('parish-mode',mode==='parish');
  document.documentElement.classList.toggle('retreat-mode',mode==='retreat');
  const _setTxt=(id,v)=>{const el=$(id);if(el)el.textContent=v;};
  const listLbl = mode==='parish' ? '성당찾기' : (mode==='retreat' ? '피정의집 찾기' : '성지찾기');
  const listSearchInput=$('list-srch-inp');
  if(listSearchInput){
    const ph = mode==='parish' ? '선택 교구 성당명, 주소 검색' : '이름, 주소 검색';
    listSearchInput.placeholder = ph;
    listSearchInput.setAttribute('aria-label', ph);
  }
  _setTxt('tab-nearby-lbl', '내주변');
  _setTxt('tab-list-lbl', listLbl);
  $('legend').style.display = mode==='shrine'?'block':'none';
  if(mode==='shrine' || mode==='retreat'){
    try{ oaiPreopenNearbySheetForCategory(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  }

  _resetMapState();
  _mapInited=true;
  requestAnimationFrame(function(){ setTimeout(_loadMap, 0); });
}

function _resetMapState(){
  try{ _clearRegionMarker(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  if(_map){ try{_map=null;}catch(e){ console.warn("[가톨릭길동무]", e); } }
  _markers=[];
  _retreatMarkers=[];
  _dioMkrs={};
  _dioOverlays={};
  _activeDio=null;
  _parishSysInited=false;
  _parishDioUserZoomTouched=false;
  _parishDioProgrammaticMoveUntil=0;
  try{ if(AppState) AppState.nearbyParishDioCode=null; }catch(e){ console.warn('[가톨릭길동무]',e); }
  if(_parishIdleListener){ try{kakao.maps.event.removeListener(_parishIdleListener);}catch(e){ console.warn('[가톨릭길동무]',e); } _parishIdleListener=null; }
  _paSelMkr=null;
  try{ _clearParishNearbyMarkers(); }catch(e){ console.warn('[가톨릭길동무]',e); }
  _myMkr=null;
  _myLat=null; _myLng=null;
  const mapEl=$('map');
  if(mapEl) mapEl.innerHTML='';
  _mapInited=false;
}
function goToCover(){
  try{
    if(typeof oaiHoldStabilityVeil === 'function'){
      var hasDioceseView = !!document.querySelector('#diocese-view.open');
      var hasClosableView = !!document.querySelector('#web-view.open,#trail-view.open,#diocese-view.open,#missa-view.open');
      if(hasClosableView){
        oaiHoldStabilityVeil(hasDioceseView ? 'diocese-cover-return' : 'view-close', hasDioceseView ? 720 : 360);
      }
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  closeTab(_activeTab);
  closeInfoCard();
  resetRoute();
  _markers.forEach(m=>{if(m)try{m.marker.setMap(null);}catch(e){ console.warn("[가톨릭길동무]", e); }});
  _retreatMarkers.forEach(o=>{try{o.marker.setMap(null);}catch(e){ console.warn("[가톨릭길동무]", e); }});
  Object.values(_dioMkrs).forEach(arr=>arr.forEach(mk=>{try{mk.setMap(null);}catch(e){ console.warn("[가톨릭길동무]", e); }}));
  if(_paSelMkr){try{_paSelMkr.setMap(null);}catch(e){ console.warn("[가톨릭길동무]", e); } _paSelMkr=null;}
  try{ _clearRegionMarker(); }catch(e){ console.warn('[가톨릭길동무]',e); }
  try{ _clearParishNearbyMarkers(); }catch(e){ console.warn('[가톨릭길동무]',e); }
  if(_myMkr){try{_myMkr.setMap(null);}catch(e){ console.warn("[가톨릭길동무]", e); } _myMkr=null;}
  _screen='cover';
  if(typeof oaiSetMainMapLayerHidden==='function') oaiSetMainMapLayerHidden(false);
  document.documentElement.classList.remove('app-active','parish-mode','retreat-mode');
  const _coverEl=$('cover');
  if(_coverEl){
    _coverEl.style.display='';
    _coverEl.style.opacity='';
    _coverEl.style.pointerEvents='';
    _coverEl.scrollTop=0;
  }
  try{ if(typeof _resetCoverExitReady === 'function') _resetCoverExitReady(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{ if(typeof _clearCoverExitArmed === 'function') _clearCoverExitArmed(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{
    if(typeof window.oaiSettleCoverSize === 'function'){
      window.oaiSettleCoverSize('cover-return');
      setTimeout(function(){ window.oaiSettleCoverSize('cover-return-late'); }, 180);
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function _loadMap(){
  const wrap=$('map');
  wrap.innerHTML='<div class="map-loading"><div class="map-loading-icon">✝</div><div class="map-loading-txt">지도를 불러오는 중...</div></div>';
  if(window.kakao&&window.kakao.maps){
    try{kakao.maps.load(_onMapReady);}catch(e){_mapError(e.message);}
    return;
  }
  const sc=document.createElement('script');
  sc.src=`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${JSKEY}&autoload=false&libraries=services`;
  const timer=setTimeout(()=>_mapError('카카오내비 로딩 시간 초과'),20000);
  sc.onload=()=>{clearTimeout(timer);try{kakao.maps.load(_onMapReady);}catch(e){_mapError(e.message);}};
  sc.onerror=()=>{clearTimeout(timer);_mapError(`도메인 등록 필요: ${location.hostname}`);};
  document.head.appendChild(sc);
}

function _mapError(msg){
  const m=$('map');
  m.innerHTML=`<div class="map-loading"><div style="font-size:40px;margin-bottom:16px">🗺️</div><div style="font-size:15px;font-weight:700;color:var(--gold);margin-bottom:12px">지도를 불러올 수 없습니다</div><div style="font-size:12px;color:rgba(255,255,255,.7);line-height:1.8;max-width:280px;word-break:keep-all">${msg}</div></div>`;
  _markers=new Array(SHRINES.length).fill(null);
  renderList();
  openTab('nearby');
  if(typeof oaiHideCategoryEntryVeil==='function') setTimeout(oaiHideCategoryEntryVeil, 260);
}

function _onMapReady(){
 const KM=kakao.maps;window._LL=KM.LatLng;window._MM=KM.Marker;window._MI=KM.MarkerImage;window._SZ=KM.Size;window._PT=KM.Point;window._LB=KM.LatLngBounds;window._PL=KM.Polyline;window._CO=KM.CustomOverlay;window._EL=KM.event.addListener;
  _map=new kakao.maps.Map($('map'),{
  center:new _LL(36.2,127.9),level:8
  });
  try{ _applyCachedCurrentCenterOnCategoryEntry(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  kakao.maps.event.addListener(_map,'click',()=>{
  closeInfoCard();
  document.activeElement?.blur();
  });
  if(_mode==='shrine'){
    _buildShrineMarkers();
  } else {
    _markers=new Array(SHRINES.length).fill(null);
  }
  renderList();
  _autoLocate();
  if(_mode==='parish') { _buildParishDioSystem(); _syncParishDioLabels(); }
  else if(_mode==='retreat') _buildRetreatMarkers();
  if(!window._noAutoNearby){
    var preopenedNearbySheet = $('sheet-nearby');
    var usePreopenedNearby = (_mode==='shrine' || _mode==='retreat') && preopenedNearbySheet && preopenedNearbySheet.classList.contains('oai-preopen-nearby');
    if(usePreopenedNearby){
      try{ _clearRouteSwitchInfoCard('preopened-nearby'); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ resetRoute({fresh:true}); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ _clearRouteSwitchInfoCard('preopened-nearby-after-reset'); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ _exitRouteMode(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ _restoreMapMarkers(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      _resetTabWork('nearby');
      _activeTab='nearby';
      preopenedNearbySheet.style.display='';
      preopenedNearbySheet.classList.remove('from-left','from-right','exit-left','exit-right','oai-preopen-nearby');
      preopenedNearbySheet.classList.add('open');
      _updateTabBtns('nearby');
      _loadNearby();
      setTimeout(function(){ _scrollSheetTop('nearby'); }, 30);
    }else{
      openTab('nearby');
    }
  }
  window._noAutoNearby = false;
  if(typeof oaiHideCategoryEntryVeil==='function') setTimeout(oaiHideCategoryEntryVeil, 260);
}

function _modeTargetLabel(){
  return _mode==='parish'?'성당':(_mode==='retreat'?'피정의 집':'성지');
}
function _updateSheetPanelTitles(){
  const noun=_modeTargetLabel();
  const near=$('nearby-sheet-title');
  const list=$('list-sheet-title');
  const region=$('region-sheet-title');
  if(near) near.textContent='내 주변 '+noun+' 10곳';
  if(list) list.textContent=noun+' 찾기';
  if(region) region.textContent='지역검색';
}
function closeSheetPanelOnly(name){
  if(!name) return;
  _blurAll && _blurAll();
  _closeSheetOnly(name);
  if(_activeTab===name) _activeTab=null;
  _updateTabBtns(null);
  if(name==='nearby'){
    try{ _applyNearbyOverviewMapView('nearby-sheet-close'); }catch(e){ console.warn('[가톨릭길동무]', e); }
    setTimeout(function(){
      try{ _applyNearbyOverviewMapView('nearby-sheet-close-settle'); }catch(e){ console.warn('[가톨릭길동무]', e); }
    }, 180);
  }
}

function closeRouteSheetByX(){
  _blurAll && _blurAll();
  _closeSheetOnly('route');
  if(_activeTab==='route') _activeTab=null;
  _updateTabBtns(null);
  setTimeout(function(){
    try{ resetRoute(); }catch(e){ console.warn('[가톨릭길동무]', e); }
    _routeMode=false;
    try{ _exitRouteMode(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  }, OAI_ROUTE_VISUAL_DELAY_MS);
}

function closeCategoryToCoverFromMap(){
  _blurAll && _blurAll();
  if(typeof goToCover === 'function') goToCover();
}

function _blockRouteInfoRestore(reason, ms){
  try{
    const now = Date.now ? Date.now() : new Date().getTime();
    _routeInfoRestoreBlockedUntil = now + (ms || 1400);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _isRouteInfoRestoreBlocked(){
  try{
    const now = Date.now ? Date.now() : new Date().getTime();
    return !!(_routeInfoRestoreBlockedUntil && now < _routeInfoRestoreBlockedUntil);
  }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
}
function _clearRouteSwitchInfoCard(reason){
  try{ _blockRouteInfoRestore(reason || 'tab-switch', 1600); }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{ if(typeof _hideInfoRouteRoleChoice === 'function') _hideInfoRouteRoleChoice(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{ closeInfoCard({keepMap:true}); }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{ _curFromRegion=false; }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{
    const card=$('info-card');
    if(card){
      card.classList.remove('open','no-anim');
      card.style.removeProperty('display');
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  [0, 80, 220, 520].forEach(function(delay){
    setTimeout(function(){
      try{
        if(!_isRouteInfoRestoreBlocked()) return;
        if(typeof _hideInfoRouteRoleChoice === 'function') _hideInfoRouteRoleChoice();
        closeInfoCard({keepMap:true});
        const card=$('info-card');
        if(card) card.classList.remove('open','no-anim');
        _curFromRegion=false;
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }, delay);
  });
}

function zoomCategoryMap(delta){
  if(!_map || typeof _map.getLevel !== 'function' || typeof _map.setLevel !== 'function') return;
  try{
    const cur = _map.getLevel();
    const next = Math.max(1, Math.min(14, cur + delta));
    if(next !== cur) _map.setLevel(next);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}


function openTab(name, opts){
  opts = opts || {};
  var shouldAutoFocusKeyboard = opts.keyboard === true;
  if(_activeTab===name){
    if(name!=='route') _clearRouteSwitchInfoCard('same-tab-'+name);
    else { try{ closeInfoCard({keepMap:true}); }catch(e){ console.warn('[가톨릭길동무]', e); } _curFromRegion=false; }
    if(shouldAutoFocusKeyboard){
      if(name==='list') oaiFocusSearchKeyboardInput('list-srch-inp');
      else if(name==='region') oaiFocusSearchKeyboardInput('region-inp');
    }
    return;
  }
  _updateSheetPanelTitles();
  const prevName = _activeTab;
  const dir = window._swipeDir || null;

  if(prevName && dir){
    const prevSheet = $('sheet-'+prevName);
    if(prevSheet && prevSheet.classList.contains('open')){
      prevSheet.classList.add(dir === 'right' ? 'exit-left' : 'exit-right');
      setTimeout(()=>{
        prevSheet.style.transition = 'none';
        prevSheet.classList.remove('open','exit-left','exit-right');
        void prevSheet.offsetHeight;
        prevSheet.style.transition = '';
      }, 280);
    } else {
      _closeSheetOnly(prevName);
    }
  } else {
    _closeSheetOnly(prevName);
  }

  if(name!=='route') {
    _clearRouteSwitchInfoCard('open-tab-'+name);
    resetRoute({fresh:true});
    _clearRouteSwitchInfoCard('after-reset-'+name);
  } else {
    try{ closeInfoCard({keepMap:true}); }catch(e){ console.warn('[가톨릭길동무]', e); }
    _curFromRegion=false;
  }
  _exitRouteMode();
  if(name==='route' && _routeRegionStart && _routeRegionStart.lat && _regionCache && _regionCache.length){
    try{ _showRegionItemsOnMap(_regionCache, _routeRegionStart.lat, _routeRegionStart.lng, {center:false}); }catch(e){ console.warn('[가톨릭길동무]', e); }
  }else if(!(_mode==='parish' && name==='nearby')) _restoreMapMarkers();
  else { try{ _clearParishNearbyMarkers(); }catch(e){ console.warn('[가톨릭길동무]',e); } }
  if(name!=='nearby') try{ _cancelNearbyRequests(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  _resetTabWork(name);
  _activeTab=name;

  const sheet=$('sheet-'+name);
  if(sheet){ sheet.classList.remove('oai-preopen-nearby'); }
  if(sheet && dir){
    sheet.classList.add('from-'+dir);
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        sheet.classList.remove('from-right','from-left');
        sheet.classList.add('open');
      });
    });
  } else {
    if(sheet){ sheet.style.display=''; sheet.classList.add('open'); }
  }

  _updateTabBtns(name);
  if(name==='nearby')     _loadNearby();
  else if(name==='list')  {
    renderList();
    if(shouldAutoFocusKeyboard){
      oaiFocusSearchKeyboardInput('list-srch-inp');
      if(dir) oaiFocusSearchKeyboardInput('list-srch-inp', 120);
    }
  }
  else if(name==='region'){
    if(shouldAutoFocusKeyboard){
      oaiFocusSearchKeyboardInput('region-inp');
      if(dir) oaiFocusSearchKeyboardInput('region-inp', 120);
    }
  }
  else if(name==='route') _enterRouteMode();
  setTimeout(()=>_scrollSheetTop(name), 30);
}

function closeTab(name){
  if(!name) return;
  if(name==='nearby') try{ _cancelNearbyRequests(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  let _routeDest = null;
  let _routeRegionStartKeep = null;
  if(name === 'route' && _rE && _rE.lat){
    _routeDest = Object.assign({}, _rE);
    if(_routeRegionStart && _routeRegionStart.lat) _routeRegionStartKeep = Object.assign({}, _routeRegionStart);
  }
  _closeSheetOnly(name);
  if(_activeTab===name) _activeTab=null;
  _updateTabBtns(null);
  if(name==='route'){
    setTimeout(function(){
      try{ resetRoute(); }catch(e){ console.warn("[가톨릭길동무]", e); }
      _routeMode=false;
      if(_isRouteInfoRestoreBlocked && _isRouteInfoRestoreBlocked()){
        _routeDest=null;
        try{ closeInfoCard({keepMap:true}); }catch(e){ console.warn('[가톨릭길동무]', e); }
      }
      if(_routeDest){
        const items = _getCurrentItems();
        const idx = (typeof _routeDest.idx==='number' && _routeDest.idx>=0)
          ? _routeDest.idx
          : items.findIndex(p=>Number(p.lat)===Number(_routeDest.lat) && Number(p.lng)===Number(_routeDest.lng));
        if(idx>=0){
          const item=items[idx];
          if(item) setTimeout(()=>{
            try{
              if(_mode==='shrine') _selectShrineMarker(idx);
              else if(_mode==='parish') _selectParishMarker(item);
              else _selectRetreatMarker(item);
              if(_routeRegionStartKeep && _routeRegionStartKeep.lat){
                _routeRegionStart = Object.assign({}, _routeRegionStartKeep);
                _regionLat = _routeRegionStartKeep.lat;
                _regionLng = _routeRegionStartKeep.lng;
                _regionPlaceName = _routeRegionStartKeep.placeName || _routeRegionStartKeep.name || _regionPlaceName;
                _regionName = _routeRegionStartKeep.placeName || _routeRegionStartKeep.name || _regionName;
                _curFromRegion = true;
              }
              _showInfoCard(item,idx);
              _focusMarkerAboveInfoCard(item);
            }catch(e){ console.warn("[가톨릭길동무]", e); }
          }, 90);
        }
      }
    }, OAI_ROUTE_VISUAL_DELAY_MS);
  } else {
    _restoreMapMarkers();
  }
}

function _closeSheetOnly(name){
  if(!name) return;
  $('sheet-'+name)?.classList.remove('open');
}

function closeAllTabs(){
  try{ _cancelNearbyRequests(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  ['nearby','list','region','route'].forEach(n=>_closeSheetOnly(n));
  _activeTab=null;
  _updateTabBtns(null);
}

function _scrollSheetTop(name){
  const sheet=$('sheet-'+name);
  if(sheet) sheet.scrollTop=0;
  const body = name==='nearby' ? $('nearby-body') : name==='list' ? $('list-body') : name==='region' ? $('region-body') : name==='route' ? $('sheet-route') : null;
  if(body) body.scrollTop=0;
}

function _resetTabWork(name){
  document.activeElement&&document.activeElement.blur&&document.activeElement.blur();
  if(name!=='route'){
    _listSrch='';
    const lsi=$('list-srch-inp'); if(lsi) lsi.value='';
    const lsx=$('list-srch-x'); if(lsx) lsx.style.display='none';
    _filterDio='all';
    $$('.filter-btn').forEach((b,i)=>b.classList.toggle('active', i===0 || b.textContent.trim()==='전체'));
    try{ _clearRegionMarker(); }catch(e){ console.warn('[가톨릭길동무]', e); }
    _regionLat=null;_regionLng=null;_regionCache=[];
    _routeRegionStart=null;
    const ri=$('region-inp'); if(ri) ri.value='';
    const rb=$('region-body');
    if(rb) rb.innerHTML=_regionGuideHtml();
  }
  _scrollSheetTop(name);
}

function toggleTab(name){
  if(_activeTab===name){
    if(name!=='route') _clearRouteSwitchInfoCard('toggle-same-'+name);
    else closeInfoCard({keepMap:true});
    _resetTabWork(name);
    if(name==='nearby') _loadNearby();
    else if(name==='list') { renderList(); oaiFocusSearchKeyboardInput('list-srch-inp'); }
    else if(name==='region'){
      try{ _clearRegionMarker(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      _regionLat=null;_regionLng=null;_regionCache=[];
      const ri=$('region-inp'); if(ri) ri.value='';
      const rb=$('region-body');
      if(rb) rb.innerHTML=_regionGuideHtml();
      oaiFocusSearchKeyboardInput('region-inp');
    }
    else if(name==='route'){ resetRoute({fresh:true}); _enterRouteMode(); }
    setTimeout(()=>_scrollSheetTop(name),30);
    return;
  }
  if(name!=='route') _clearRouteSwitchInfoCard('toggle-open-'+name);
  else { try{ closeInfoCard({keepMap:true}); }catch(e){ console.warn('[가톨릭길동무]', e); } _curFromRegion=false; }
  if(name==='route') resetRoute({fresh:true});
  openTab(name, {keyboard:true});
}

function _updateTabBtns(active){
  let activeBtn = null;
  $$('.tab-btn').forEach(b=>{
    const on = b.dataset.tab===active;
    b.classList.toggle('active', on);
    if(on) activeBtn = b;
  });
  if(activeBtn){
    try{ activeBtn.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'}); }catch(e){ console.warn("[가톨릭길동무]", e); }
  }
  try{ if(typeof window.oaiKeepActiveTabsVisible === 'function') window.oaiKeepActiveTabsVisible('map-tab'); }catch(e){ console.warn("[가톨릭길동무]", e); }
}

function oaiScrollActiveTabIntoView(container, behavior){
  try{
    if(!container) return false;
    var active = container.querySelector('.active,.on,[aria-selected="true"],[aria-pressed="true"]');
    if(!active) return false;
    if(active === container) return false;
    active.scrollIntoView({behavior: behavior || 'smooth', block:'nearest', inline:'center'});
    return true;
  }catch(e){ console.warn("[가톨릭길동무]", e); return false; }
}
function oaiKeepActiveTabsVisible(reason){
  try{
    var selectors = [
      '#tabbar',
      '#prayer-tabs',
      '#web-cats',
      '.trail-tabs',
      '.qna-tabs',
      '#srch-modal #sm-tab-bar',
      '#sm-tab-bar'
    ];
    selectors.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(container){
        oaiScrollActiveTabIntoView(container, reason === 'instant' ? 'auto' : 'smooth');
      });
    });
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}
window.oaiKeepActiveTabsVisible = oaiKeepActiveTabsVisible;
document.addEventListener('click', function(e){
  try{
    var t = e.target;
    if(!t || !t.closest) return;
    if(!t.closest('.tab-btn,.pr-tab,.web-cat-btn,.trail-tab,.qna-tab,.sm-tab,.filter-btn')) return;
    setTimeout(function(){ oaiKeepActiveTabsVisible('click'); }, 30);
    setTimeout(function(){ oaiKeepActiveTabsVisible('click-late'); }, 220);
  }catch(err){ console.warn("[가톨릭길동무]", err); }
}, true);

function _getInfoCardCenterTargetY(mapH){
  return Math.round((mapH || 700) * 0.34);
}
function _setMapCenterByInfoCardStandard(pos){
  if(!_map || !pos) return false;
  try{
    const mapEl = $('map-wrap') || $('map');
    const mapH = (mapEl && (mapEl.clientHeight || mapEl.offsetHeight)) || window.innerHeight || 700;
    const proj = _map.getProjection && _map.getProjection();
    if(proj && proj.containerPointFromCoords && proj.coordsFromContainerPoint){
      const p = proj.containerPointFromCoords(pos);
      const centerY = Math.round(mapH / 2);
      const targetY = _getInfoCardCenterTargetY(mapH);
      const point = (window.kakao && kakao.maps && kakao.maps.Point)
        ? new kakao.maps.Point(p.x, p.y + (centerY - targetY))
        : {x:p.x, y:p.y + (centerY - targetY)};
      const newCenter = proj.coordsFromContainerPoint(point);
      if(newCenter){ _map.setCenter(newCenter); return true; }
    }
    _map.setCenter(pos);
    return true;
  }catch(e){ console.warn("[가톨릭길동무]", e); }
  return false;
}

function _isGalaxyRegularCompactViewport(){
  try{
    const doc=document.documentElement;
    const w=Math.min(window.innerWidth||9999, doc&&doc.clientWidth||9999);
    const h=Math.min(window.innerHeight||9999, doc&&doc.clientHeight||9999);
    return !(doc&&doc.classList&&doc.classList.contains('ios-device')) && w<=370 && h<=820;
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  return false;
}

function _nearbyOverviewLevel(){
  return _isGalaxyRegularCompactViewport() ? 9 : 8;
}

function _setMapCenterAtContainerY(pos, targetY){
  if(!_map || !pos) return false;
  try{
    const mapEl = $('map-wrap') || $('map');
    const mapH = (mapEl && (mapEl.clientHeight || mapEl.offsetHeight)) || window.innerHeight || 700;
    const proj = _map.getProjection && _map.getProjection();
    if(proj && proj.containerPointFromCoords && proj.coordsFromContainerPoint){
      const p = proj.containerPointFromCoords(pos);
      const centerY = Math.round(mapH / 2);
      const goalY = Math.max(80, Math.min(mapH - 80, Math.round(targetY || centerY)));
      const point = (window.kakao && kakao.maps && kakao.maps.Point)
        ? new kakao.maps.Point(p.x, p.y + (centerY - goalY))
        : {x:p.x, y:p.y + (centerY - goalY)};
      const newCenter = proj.coordsFromContainerPoint(point);
      if(newCenter){ _map.setCenter(newCenter); return true; }
    }
    _map.setCenter(pos);
    return true;
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  return false;
}

function _applyRouteCurrentLocationViewport(source){
  if(!_isGalaxyRegularCompactViewport()) return false;
  if(!_map || !_routeMode || _polyline || _rE || typeof _LL==='undefined') return false;
  const lat = (_rS && _rS.lat) || _myLat;
  const lng = (_rS && _rS.lng) || _myLng;
  if(!lat || !lng) return false;
  try{
    const pos = new _LL(lat,lng);
    if(typeof _map.setLevel==='function') _map.setLevel(_nearbyOverviewLevel());
    const mapEl = $('map-wrap') || $('map');
    const mapH = (mapEl && (mapEl.clientHeight || mapEl.offsetHeight)) || window.innerHeight || 700;
    const rs = $('sheet-route');
    let sheetH = 0;
    if(rs && rs.classList && rs.classList.contains('open')){
      const r = rs.getBoundingClientRect ? rs.getBoundingClientRect() : null;
      sheetH = Math.ceil((r && r.height) || rs.offsetHeight || 0);
    }
    const visibleH = Math.max(260, mapH - sheetH);
    const targetY = Math.round(visibleH / 2);
    _setMapCenterAtContainerY(pos, targetY);
    setTimeout(function(){
      try{
        if(_screen==='map' && _routeMode && !_polyline && !_rE && _map){
          if(typeof _map.setLevel==='function') _map.setLevel(_nearbyOverviewLevel());
          _setMapCenterAtContainerY(pos, targetY);
        }
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }, 140);
    return true;
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  return false;
}

function _centerCategoryMapOnLocation(lat, lng, source){
  if(!_map || !lat || !lng || typeof _LL==='undefined') return false;
  if(!(_mode==='shrine' || _mode==='parish' || _mode==='retreat')) return false;
  try{
    const pos = new _LL(lat, lng);
    if(typeof _map.setLevel === 'function'){
      _map.setLevel(_nearbyOverviewLevel());
    }
    _map.setCenter(pos);
    try{ _markCategoryEntryCurrentCentered(source || 'category-entry-current'); }catch(_e){}
    setTimeout(function(){
      try{
        if(_screen==='map' && (_mode==='shrine' || _mode==='parish' || _mode==='retreat') && _map && !_curInfoItem && !_routeMode){
          if(typeof _map.setLevel === 'function') _map.setLevel(_nearbyOverviewLevel());
          _map.setCenter(pos);
        }
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }, 90);
    if(_isGalaxyRegularCompactViewport && _isGalaxyRegularCompactViewport()){
      setTimeout(function(){
        try{
          if(_screen==='map' && (_mode==='shrine' || _mode==='parish' || _mode==='retreat') && _map && !_curInfoItem && !_routeMode){
            if(typeof _map.setLevel === 'function') _map.setLevel(_nearbyOverviewLevel());
            _map.setCenter(pos);
          }
        }catch(e){ console.warn('[가톨릭길동무]', e); }
      }, 260);
    }
    return true;
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  return false;
}

function _applyNearbyOverviewMapView(source){
  if(!_map || typeof _LL==='undefined') return false;
  if(!(_mode==='shrine' || _mode==='parish' || _mode==='retreat')) return false;
  if(_screen!=='map' || _routeMode || _curInfoItem) return false;
  const lat = _myLat, lng = _myLng;
  if(!lat || !lng) return false;
  try{
    const pos = new _LL(lat, lng);
    if(typeof _map.setLevel === 'function') _map.setLevel(_nearbyOverviewLevel());
    _map.setCenter(pos);
    try{ _markCategoryEntryCurrentCentered(source || 'nearby-overview'); }catch(_e){}
    setTimeout(function(){
      try{
        if(_screen==='map' && (_mode==='shrine' || _mode==='parish' || _mode==='retreat') && !_routeMode && !_curInfoItem && _map){
          if(typeof _map.setLevel === 'function') _map.setLevel(_nearbyOverviewLevel());
          _map.setCenter(pos);
        }
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }, 110);
    if(_isGalaxyRegularCompactViewport && _isGalaxyRegularCompactViewport()){
      setTimeout(function(){
        try{
          if(_screen==='map' && (_mode==='shrine' || _mode==='parish' || _mode==='retreat') && !_routeMode && !_curInfoItem && _map){
            if(typeof _map.setLevel === 'function') _map.setLevel(_nearbyOverviewLevel());
            _map.setCenter(pos);
          }
        }catch(e){ console.warn('[가톨릭길동무]', e); }
      }, 360);
    }
    return true;
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  return false;
}
function _markCategoryEntryCurrentCentered(source){
  try{
    if(AppState){
      AppState.categoryEntryCenteredAt = Date.now ? Date.now() : new Date().getTime();
      AppState.categoryEntryCenteredMode = _mode;
      AppState.categoryEntryCenteredSource = source || '';
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _recentCategoryEntryCurrentCenter(ms){
  try{
    if(!AppState) return false;
    const t = Number(AppState.categoryEntryCenteredAt || 0);
    if(!t) return false;
    if(String(AppState.categoryEntryCenteredMode || '') !== String(_mode || '')) return false;
    return ((Date.now ? Date.now() : new Date().getTime()) - t) < (ms || 2500);
  }catch(e){ return false; }
}
function _applyCachedCurrentCenterOnCategoryEntry(){
  try{
    if(!_map || !(_mode==='shrine' || _mode==='parish' || _mode==='retreat')) return false;
    if(_myLat && _myLng) return _centerCategoryMapOnLocation(_myLat, _myLng, 'active-current');
    if(typeof _readLastGeo === 'function'){
      const cached = _readLastGeo(24*60*60*1000);
      if(cached) return _centerCategoryMapOnLocation(cached.lat, cached.lng, 'cached-current');
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  return false;
}

function _biasCurrentMapCenterToInfoCardStandard(){
  if(!_map || typeof _map.getCenter!=='function') return false;
  try{ return _setMapCenterByInfoCardStandard(_map.getCenter()); }
  catch(e){ console.warn("[가톨릭길동무]", e); }
  return false;
}
function _setBoundsByInfoCardStandard(bounds, top, right, bottom, left){
  if(!_map || !bounds) return false;
  try{
    _map.setBounds(bounds, top, right, bottom, left);
    _biasCurrentMapCenterToInfoCardStandard();
    return true;
  }catch(e1){
    try{
      _map.setBounds(bounds);
      _biasCurrentMapCenterToInfoCardStandard();
      return true;
    }catch(e2){ console.warn("[가톨릭길동무]", e2); }
  }
  return false;
}

function _getRouteBoundsPadding(){
  const mapEl = $('map-wrap') || $('map');
  const mapH = (mapEl && (mapEl.clientHeight || mapEl.offsetHeight)) || window.innerHeight || 700;
  const tabH = ($('tabbar') && $('tabbar').offsetHeight) || 54;
  const sheet = $('sheet-route');
  let sheetH = 0;
  try{
    if(sheet && sheet.classList.contains('open')){
      const r = sheet.getBoundingClientRect ? sheet.getBoundingClientRect() : null;
      sheetH = Math.ceil((r && r.height) || sheet.offsetHeight || 0);
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  const bottomMin = 172;
  const bottomMax = Math.max(210, Math.round(mapH * 0.62));
  const bottom = Math.min(bottomMax, Math.max(bottomMin, sheetH + 28));
  return { top: tabH + 12, right: 52, bottom: bottom, left: 52 };
}
function _fitRouteBounds(bounds, opts){
  if(!_map || !bounds) return false;
  const pad = _getRouteBoundsPadding();
  try{
    _map.setBounds(bounds, pad.top, pad.right, pad.bottom, pad.left);
    if(opts && opts.repeat){
      setTimeout(function(){ try{ const p=_getRouteBoundsPadding(); _map.setBounds(bounds, p.top, p.right, p.bottom, p.left); }catch(e){ console.warn('[가톨릭길동무]', e); } }, 90);
      setTimeout(function(){ try{ const p=_getRouteBoundsPadding(); _map.setBounds(bounds, p.top, p.right, p.bottom, p.left); }catch(e){ console.warn('[가톨릭길동무]', e); } }, 260);
    }
    return true;
  }catch(e1){
    try{ _map.setBounds(bounds); return true; }
    catch(e2){ console.warn('[가톨릭길동무]', e2); }
  }
  return false;
}

function _focusMarkerAboveInfoCard(item){
  if(!_map || !item || !item.lat || !item.lng) return;
  try{
    if(_mode==='parish' && !_routeMode){
      if(typeof _focusParishPointAround==='function' && _focusParishPointAround(item.lat,item.lng,{level:6,aboveInfoCard:true,noZoom:true})) return;
    }
    _setMapCenterByInfoCardStandard(new _LL(item.lat,item.lng));
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}

function selectItem(idx, opts={}){
  const items = _getCurrentItems();
  const item  = items[idx];
  if(!item) return;
  const fromSearchList = !!(_listSrch && _listSrch.trim());
  _curFromRegion = !!(opts.fromRegion && _regionLat);
  closeAllTabs();
  if(_mode==='shrine'){
  if(opts.fromRegion){
   if(!_showRegionSelectionMapIfActive()) _restoreAllCategoryMarkersForSelection();
  } else if(fromSearchList){
   _restoreAllCategoryMarkersForSelection();
  } else if(opts.fromNearby && _nearbyCache.length>0){
   _showItemsOnMap(_nearbyCache);
  } else {
   _restoreMapMarkers();
  }
  _selectShrineMarker(idx);
  } else if(_mode==='parish') {
  if(opts.fromRegion) _showRegionSelectionMapIfActive();
  _selectParishMarker(item);
  } else {
  if(opts.fromRegion){
   if(!_showRegionSelectionMapIfActive()) _restoreAllCategoryMarkersForSelection();
  } else if(fromSearchList) _restoreAllCategoryMarkersForSelection();
  _selectRetreatMarker(item);
  }
  _showInfoCard(item, idx);
  _focusMarkerAboveInfoCard(item);
}

function _fitInfoCardButtons(){
  try{
    const btns=document.querySelectorAll('#info-card .ic-link-btn,#info-card .ic-route-btn,#info-card .ic-tel-btn,#info-card .btn-kakao-nav');
    btns.forEach(btn=>{
      btn.style.fontSize='14px';
      btn.style.letterSpacing='-.035em';
      btn.style.whiteSpace='nowrap';
      let size=14;
      while(size>11 && btn.scrollWidth>btn.clientWidth){
        size-=0.5;
        btn.style.fontSize=size+'px';
      }
    });
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}

function _showInfoCard(item, idx){
  _curInfoItem = {item, idx};

  $('ic-name').textContent = item.name;
  $('ic-sub').textContent  = item.diocese;
  $('ic-type').textContent = _mode==='shrine' ? item.type : (_mode==='retreat' ? '피정의 집' : '성당');
  $('ic-addr').textContent = item.addr;
  let noteEl=$('ic-note');
  if(!noteEl){
  noteEl=document.createElement('div');
  noteEl.id='ic-note';
  noteEl.style.cssText='margin:6px 14px 0;padding:8px 10px;background:#fff8e1;border-left:3px solid #f39c12;border-radius:6px;font-size:12px;color:#7a4f00;line-height:1.55;display:none;';
  $('ic-addr').closest('.ic-addr-row').insertAdjacentElement('afterend', noteEl);
  }
  if(item.note){noteEl.textContent=item.note;noteEl.style.display='block';}
  else noteEl.style.display='none';
  const telBtn=$('ic-tel-link');
  const routeBtn=document.querySelector('.ic-route-btn');
  if(item.tel){
  $('ic-tel').textContent=item.tel;
  telBtn.href='tel:'+item.tel.replace(/[^0-9+]/g,'');
  _show(telBtn);
  } else {
  _hide(telBtn);
  }
  const distCol=$('ic-dist-col');
  const distEl=$('ic-dist');
  distCol.classList.remove('ready');
  distEl.textContent='—';
  if(_myLat && item.lat){
  const _snap=item;
  (async()=>{
   try{
    const res=await _kakaoDirectionsFetch(`${_myLng},${_myLat}`, `${_snap.lng},${_snap.lat}`);
    if(!res.ok) throw new Error('fail');
    const data=await res.json();
    const route=data.routes?.[0];
    if(route&&route.result_code===0){
     const km=(route.summary.distance/1000).toFixed(1);
     if(_curInfoItem&&_curInfoItem.item===_snap){
      distEl.textContent=km+' km';
      distCol.classList.add('ready');
     }
    }
   }catch(e){ console.warn("[가톨릭길동무]", e); }
  })();
  }
  const hp=$('ic-hp');
  if(item.hp){
    const hpUrl = normalizeCatholicExternalUrl(item.hp);
    hp.href = hpUrl;
    hp.target = '_self';
    hp.rel = 'noopener';
    hp.onclick = function(e){
      e.preventDefault();
      e.stopPropagation();
      openCoreExternalUrl(hpUrl,{infoIdx:idx, source:'homepage'});
    };
    _show(hp);
  }
  else _hide(hp);
  const guide=$('ic-guide');
  if(_mode==='shrine'){
    if(item.seq){ guide.onclick=()=>openCoreExternalUrl(_SU+item.seq,{infoIdx:idx}); guide.textContent='성지 상세페이지'; _show(guide);}
    else _hide(guide);
  } else {
    if(item.url){ guide.onclick=()=>openCoreExternalUrl(item.url,{infoIdx:idx}); guide.textContent=(_mode==='retreat'?'피정의 집 상세페이지':'성당 상세페이지'); _show(guide);}
    else _hide(guide);
  }
  const linksRow=$('ic-links-row');
  if(linksRow) (item.hp||(item.seq&&_mode==='shrine')||item.url)?_show(linksRow):_hide(linksRow);

  $('info-card').classList.add('open');
  setTimeout(_fitInfoCardButtons, 0);
  setTimeout(_fitInfoCardButtons, 80);
}

function closeInfoCard(opts){
  opts = opts || {};
  const wasItem = _curInfoItem;
  const card = $('info-card');
  if(card) card.classList.remove('open');
  _curInfoItem=null;
  _curFromRegion=false;
  if(_mode==='shrine') _clearShrineMarkerSel();
  else {
    if(_paSelMkr){try{_paSelMkr.setMap(null);}catch(e){ console.warn("[가톨릭길동무]", e); }  _paSelMkr=null;}
  }
  if(!opts.keepMap && wasItem && wasItem.item && wasItem.item.lat && _map){
    try{ _focusMarkerAboveInfoCard(wasItem.item); }catch(e){ console.warn("[가톨릭길동무]", e); }
  }
}

function _hideInfoRouteRoleChoice(){
  try{
    const el=document.getElementById('route-role-choice');
    if(el) el.classList.remove('open');
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function _ensureInfoRouteRoleChoice(){
  let modal=document.getElementById('route-role-choice');
  if(modal) return modal;
  modal=document.createElement('div');
  modal.id='route-role-choice';
  modal.className='route-role-choice';
  modal.innerHTML=`<div class="route-role-choice-panel" role="dialog" aria-modal="true" aria-label="경로검색 위치 선택">
    <div class="rrc-title">경로검색 위치 선택</div>
    <div class="rrc-desc" id="rrc-desc">선택한 장소를 출발지 또는 도착지로 설정하세요.</div>
    <div class="rrc-actions">
      <button type="button" class="rrc-btn rrc-start" data-role="start">출발지로 설정</button>
      <button type="button" class="rrc-btn rrc-end" data-role="end">도착지로 설정</button>
    </div>
    <button type="button" class="rrc-cancel" data-role="cancel">취소</button>
  </div>`;
  modal.addEventListener('click',function(e){
    if(e.target===modal || (e.target && e.target.dataset && e.target.dataset.role==='cancel')){
      _hideInfoRouteRoleChoice();
      return;
    }
    const btn=e.target && e.target.closest ? e.target.closest('[data-role]') : null;
    if(!btn) return;
    const role=btn.dataset.role;
    if(role==='start'){
      _hideInfoRouteRoleChoice();
      _openInfoCardRouteAsStart();
    }else if(role==='end'){
      _hideInfoRouteRoleChoice();
      _openInfoCardRouteAsDestination();
    }
  });
  document.body.appendChild(modal);
  return modal;
}

function _showInfoRouteRoleChoice(){
  if(!_curInfoItem) return;
  const item=_curInfoItem.item;
  if(!item || !item.lat || !item.lng) return;
  const modal=_ensureInfoRouteRoleChoice();
  const desc=document.getElementById('rrc-desc');
  if(desc) desc.textContent=`${item.name}을(를) 출발지 또는 도착지로 설정하세요.`;
  modal.classList.add('open');
}

function _openInfoCardRouteAsStart(){
  if(!_curInfoItem) return;
  const {item, idx}=_curInfoItem;
  if(!item.lat||!item.lng) return;
  closeInfoCard({keepMap:true});
  _routeRegionStart=null;
  openTab('route');
  _hide($('rs-result'));
  if(_polyline){ _polyline.setMap(null); _polyline=null; }
  _clearRouteTmpMarkers();
  _rS={idx, name:item.name, lat:item.lat, lng:item.lng};
  _rE=null;
  _setRouteLabel('start', item.name);
  _setRouteLabel('end', '');
  if(_mode==='shrine' && idx>=0 && _markers[idx]){
    _markers[idx].marker.setImage(_mkrImgRoute('#ff0000','출'));
    _setRouteMarkerZ(idx,'start');
  }
  _refreshRouteTmpMarkers();
  _enterRouteMode();
  _showRouteGuideText(`도착 ${_getRouteGuideTarget()}를 탭하세요`);
  _updateSearchBtn();
}

function _openInfoCardRouteAsDestination(){
  if(!_curInfoItem) return;
  const {item, idx}=_curInfoItem;
  if(!item.lat||!item.lng) return;

  function doRoute(spLat, spLng, spName){
  closeInfoCard({keepMap:true});
  openTab('route');
  _rS={idx:-1, name:spName, lat:spLat, lng:spLng, isRegionStart:!!(_routeRegionStart && Number(_routeRegionStart.lat)===Number(spLat) && Number(_routeRegionStart.lng)===Number(spLng))};
  _rE={idx, name:item.name, lat:item.lat, lng:item.lng};
  _setRouteLabel('start', spName);
  _setRouteLabel('end', item.name);
  if(_mode==='shrine'){
   if(idx>=0&&_markers[idx]){ _markers[idx].marker.setImage(_mkrImgRoute('#0000ff','도')); _setRouteMarkerZ(idx,'end'); }
   if(_rS.idx>=0&&_markers[_rS.idx]){ _markers[_rS.idx].marker.setImage(_mkrImgRoute('#ff0000','출')); _setRouteMarkerZ(_rS.idx,'start'); }
  }
  _refreshRouteTmpMarkers();
  _enterRouteMode();
  setTimeout(function(){ try{ _calcRoute(); }catch(e){ console.warn('[가톨릭길동무]', e); } }, OAI_ROUTE_VISUAL_DELAY_MS);
  }
  if(_curFromRegion && _regionLat){
  const placeName = _regionPlaceName || _regionName || '검색지';
  const name=`📍 ${placeName}`;
  _routeRegionStart={lat:_regionLat,lng:_regionLng,name:name,placeName:placeName};
  doRoute(_regionLat, _regionLng, name);
  return;
  }
  _routeRegionStart=null;
  if(_myLat){
  doRoute(_myLat, _myLng, '현위치');
  } else {
  if(!_GEO){ alert('위치 정보를 지원하지 않습니다.'); return; }
  _requestCurrentPositionStable(
   function(p){ _setMyLoc(p.coords.latitude, p.coords.longitude); doRoute(p.coords.latitude, p.coords.longitude, '현위치'); },
   function(err){ alert(_geoErrorMessage(err)); }
  );
  }
}

function _hasExplicitRouteStartForInfoCard(){
  try{
    if(_curFromRegion && _regionLat && _regionLng) return true;
    if(_routeRegionStart && _routeRegionStart.lat && _routeRegionStart.lng) return true;
    if(!_rS || !_rS.lat || !_rS.lng) return false;
    if(_isRouteImplicitCurrentStartHidden && _isRouteImplicitCurrentStartHidden()) return false;
    return true;
  }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
}

function openInAppRoute(){
  if(_hasExplicitRouteStartForInfoCard && _hasExplicitRouteStartForInfoCard()) _openInfoCardRouteAsDestination();
  else _showInfoRouteRoleChoice();
}

function openKakaoNav(){
  if(!_curInfoItem) return;
  const {item,idx}=_curInfoItem;
  const isJuk = _mode==='shrine' && idx === JUKRIMGUL_IDX && JUKRIMGUL_IDX >= 0;
  const navItem = isJuk ? {...item, lat:JUKRIMGUL_PARKING.lat, lng:JUKRIMGUL_PARKING.lng, kw:JUKRIMGUL_PARKING.kw, name:JUKRIMGUL_PARKING.name} : item;
  const ep=_EC(navItem.kw||navItem.name);
  function launch(spLat,spLng,spName){
  const spLabel=_EC(spName||'현위치');
  const w=spLat?`https://map.kakao.com/link/from/${spLabel},${spLat},${spLng}/to/${ep},${navItem.lat},${navItem.lng}`:
         `https://map.kakao.com/link/to/${ep},${navItem.lat},${navItem.lng}`;
  const a=spLat?`kakaomap://route?sp=${spLat},${spLng}&ep=${navItem.lat},${navItem.lng}&by=CAR`:
         `kakaomap://route?ep=${navItem.lat},${navItem.lng}&by=CAR`;
  _kakaoLaunch(w,a);
  }
  if(_curFromRegion && _regionLat && _regionLng) launch(_regionLat,_regionLng,_regionPlaceName||_regionName||'검색지');
  else if(_myLat) launch(_myLat,_myLng);
  else if(_GEO){
  _requestCurrentPositionStable(function(p){ launch(p.coords.latitude,p.coords.longitude); },
   function(){ launch(null,null); },{noRefine:true});
  } else launch(null,null);
}

function _mkrImgRetreat(color,big){
  const w=big?40:28,h=big?52:36;
  const svg=big?
  `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52"><path d="M20 0C8.954 0 0 8.954 0 20c0 14.21 20 32 20 32S40 34.21 40 20C40 8.954 31.046 0 20 0z" fill="${color}"/><circle cx="20" cy="20" r="9" fill="white" opacity="0.95"/><text x="20" y="25" text-anchor="middle" font-size="14" fill="${color}" font-family="serif" font-weight="bold">✦</text></svg>`:
  `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.268 0 0 6.268 0 14c0 9.941 14 22 14 22S28 23.941 28 14C28 6.268 21.732 0 14 0z" fill="${color}" opacity="0.9"/><circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/><text x="14" y="18" text-anchor="middle" font-size="10" fill="${color}" font-family="serif" font-weight="bold">✦</text></svg>`;
  return new _MI(_svgUrl(svg),new _SZ(w,h),{offset:new _PT(w/2,h)});
}
function _mkrImg(color,big){
  const w=big?40:28,h=big?52:36;
  const crossBig = `<g fill="#fff" opacity="0.96"><rect x="18.45" y="10.5" width="3.1" height="18.5" rx="1.1"/><rect x="13.4" y="16.3" width="13.2" height="3.1" rx="1.1"/></g>`;
  const crossSmall = `<g fill="#fff" opacity="0.96"><rect x="12.85" y="7.8" width="2.3" height="12.8" rx="0.8"/><rect x="9.6" y="11.7" width="8.8" height="2.3" rx="0.8"/></g>`;
  const svg=big?
  `<svg ${_NS} width="40" height="52" viewBox="0 0 40 52"><path d="M20 0C8.954 0 0 8.954 0 20c0 14.21 20 32 20 32S40 34.21 40 20C40 8.954 31.046 0 20 0z" fill="${color}"/>${crossBig}</svg>`:
  `<svg ${_NS} width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.268 0 0 6.268 0 14c0 9.941 14 22 14 22S28 23.941 28 14C28 6.268 21.732 0 14 0z" fill="${color}" opacity="0.92"/>${crossSmall}</svg>`;
  return new _MI(_svgUrl(svg),new _SZ(w,h),{offset:new _PT(w/2,h)});
}

function _mkrImgRoute(color,label){
  const c=label==='출' ? '#FF0000' : (label==='도' ? '#005BFF' : (color||'#005BFF'));
  const svg=`<svg ${_NS} width='36' height='46' viewBox='0 0 36 46'><ellipse cx='18' cy='43' rx='8' ry='3' fill='rgba(0,0,0,0.25)'/><path d='M18 2C9 2 2 9 2 18C2 28 18 42 18 42C18 42 34 28 34 18C34 9 27 2 18 2Z' fill='${c}' stroke='white' stroke-width='2.5'/><circle cx='18' cy='18' r='10' fill='white' opacity='0.9'/><text x='18' y='23' font-size='13' font-weight='900' fill='${c}' text-anchor='middle' font-family='Arial,sans-serif'>${label}</text></svg>`;
  return new _MI(_svgUrl(svg),new _SZ(36,46),{offset:new _PT(18,44)});
}




function _routeOverlayFontSize(label){
  return String(label||'').length>1 ? '12px' : '15px';
}
function _routePointOverlayHtml(color,label){
  const c=color||'#f39c12';
  const fs=_routeOverlayFontSize(label);
  return '<div class="oai-route-point-overlay" style="width:42px;height:54px;position:relative;pointer-events:none;filter:drop-shadow(0 2px 4px rgba(0,0,0,.28));">'
    + '<svg xmlns="http://www.w3.org/2000/svg" width="42" height="54" viewBox="0 0 42 54" aria-hidden="true">'
    + '<ellipse cx="21" cy="51" rx="9" ry="3" fill="rgba(0,0,0,.24)"/>'
    + '<path d="M21 2C10.5 2 2 10.5 2 21c0 12.2 19 30 19 30s19-17.8 19-30C40 10.5 31.5 2 21 2z" fill="'+c+'" stroke="#fff" stroke-width="3"/>'
    + '<circle cx="21" cy="21" r="11" fill="#fff" opacity=".94"/>'
    + '<text x="21" y="25.5" font-size="'+fs+'" font-weight="900" fill="'+c+'" text-anchor="middle" font-family="Arial,sans-serif">'+String(label||'')+'</text>'
    + '</svg></div>';
}
function _clearRoutePointOverlays(){
  try{
    const list=window._oaiRoutePointOverlays||[];
    list.forEach(function(ov){ try{ ov.setMap(null); }catch(_e){} });
    window._oaiRoutePointOverlays=[];
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _addRoutePointOverlay(point,role){
  try{
    if(!point || !point.lat || !point.lng || !window._CO || !_map) return;
    const label=_routeRoleShort(role);
    const color=_routeRoleColor(role);
    const ov=new _CO({
      position:new _LL(point.lat,point.lng),
      content:_routePointOverlayHtml(color,label),
      xAnchor:0.5,
      yAnchor:1,
      zIndex:100000 + (role==='start'?40:(role==='end'?20:_routeWaypointIndex(role)*10))
    });
    ov.setMap(_map);
    if(!window._oaiRoutePointOverlays) window._oaiRoutePointOverlays=[];
    window._oaiRoutePointOverlays.push(ov);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _refreshRoutePointOverlays(){
  _clearRoutePointOverlays();
  if(!_routeMode && !_polyline) return;
  if(_rS && _rS.lat && _rS.lng && !_isRouteImplicitCurrentStartHidden()) _addRoutePointOverlay(_rS,'start');
  if(_rW && _rW.lat && _rW.lng) _addRoutePointOverlay(_rW,'waypoint');
  if(_rW2 && _rW2.lat && _rW2.lng) _addRoutePointOverlay(_rW2,'waypoint2');
  if(_rW3 && _rW3.lat && _rW3.lng) _addRoutePointOverlay(_rW3,'waypoint3');
  if(_rE && _rE.lat && _rE.lng) _addRoutePointOverlay(_rE,'end');
}

function _setRouteMarkerZ(idx, role){
  try{
    if(idx>=0 && _markers && _markers[idx] && _markers[idx].marker){
      _markers[idx].marker.setZIndex(role==='start'?10040:10030);
    }
    if(idx>=0 && _retreatMarkers){
      const r=_retreatMarkers.find(o=>o && o.index===idx);
      if(r && r.marker) r.marker.setZIndex(role==='start'?10040:10030);
    }
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}


function _isRouteWaypointRole(role){ return role==='waypoint' || role==='waypoint2' || role==='waypoint3'; }
function _routeWaypointIndex(role){ if(role==='waypoint3') return 3; if(role==='waypoint2') return 2; return 1; }
function _routeWaypointColor(role){ if(role==='waypoint3') return '#b45309'; if(role==='waypoint2') return '#d97706'; return '#f39c12'; }
function _routeRoleColor(role){ if(role==='start') return '#E53935'; if(role==='waypoint3') return '#b45309'; if(role==='waypoint2') return '#d97706'; if(role==='waypoint') return '#f39c12'; return '#2E7D32'; }
function _routeRoleShort(role){ if(role==='start') return '출'; if(role==='waypoint3') return '경3'; if(role==='waypoint2') return '경2'; if(role==='waypoint') return '경1'; return '도'; }
function _routeSearchTitle(role,noun){ if(role==='start') return `🔵 출발 ${noun} 검색`; if(role==='waypoint3') return `🟠 경유지3 ${noun} 검색`; if(role==='waypoint2') return `🟠 경유지2 ${noun} 검색`; if(role==='waypoint') return `🟠 경유지1 ${noun} 검색`; return `🔴 도착 ${noun} 검색`; }
function _routeWaypointMarkerText(role){ if(role==='waypoint3') return '경3'; if(role==='waypoint2') return '경2'; return '경1'; }
function _routePointCancelTitle(role){ if(role==='start') return '출발지를 취소하시겠습니까?'; if(role==='end') return '도착지를 취소하시겠습니까?'; return '경유지' + _routeWaypointIndex(role) + '을 취소하시겠습니까?'; }
function _routePointCancelButtonText(role){ if(role==='start') return '출발지 취소'; if(role==='end') return '도착지 취소'; return '경유지' + _routeWaypointIndex(role) + ' 취소'; }
function _getRoutePointByRole(role){ if(role==='start') return _rS; if(role==='waypoint') return _rW; if(role==='waypoint2') return _rW2; if(role==='waypoint3') return _rW3; if(role==='end') return _rE; return null; }
function _setRoutePointByRole(role,obj){ if(role==='start') _rS=obj; else if(role==='waypoint') _rW=obj; else if(role==='waypoint2') _rW2=obj; else if(role==='waypoint3') _rW3=obj; else if(role==='end') _rE=obj; }
function _getRouteWaypointEnabledByRole(role){ if(role==='waypoint3') return _routeWaypoint3Enabled; if(role==='waypoint2') return _routeWaypoint2Enabled; return _routeWaypointEnabled; }
function _setRouteWaypointEnabledByRole(role,enabled){ if(role==='waypoint3') _routeWaypoint3Enabled=!!enabled; else if(role==='waypoint2') _routeWaypoint2Enabled=!!enabled; else _routeWaypointEnabled=!!enabled; }
function _nextAvailableWaypointRole(){ if(!(_routeWaypointEnabled || (_rW&&_rW.lat&&_rW.lng))) return 'waypoint'; if(!(_routeWaypoint2Enabled || (_rW2&&_rW2.lat&&_rW2.lng))) return 'waypoint2'; if(!(_routeWaypoint3Enabled || (_rW3&&_rW3.lat&&_rW3.lng))) return 'waypoint3'; return null; }
function _getRouteWaypoints(){ const list=[]; if(_rW&&_rW.lat&&_rW.lng) list.push(_rW); if(_rW2&&_rW2.lat&&_rW2.lng) list.push(_rW2); if(_rW3&&_rW3.lat&&_rW3.lng) list.push(_rW3); return list; }
function _routePointReady(point){ return !!(point && point.lat && point.lng); }
function _pendingRouteWaypointRole(){ if(_routeWaypointEnabled && !_routePointReady(_rW)) return 'waypoint'; if(_routeWaypoint2Enabled && !_routePointReady(_rW2)) return 'waypoint2'; if(_routeWaypoint3Enabled && !_routePointReady(_rW3)) return 'waypoint3'; return null; }
function _routePointName(point){ return point && point.name ? point.name : ''; }
function _syncRoutePointLabels(){ _setRouteLabel('start',_routePointName(_rS)); _setRouteLabel('waypoint',_routePointName(_rW)); _setRouteLabel('waypoint2',_routePointName(_rW2)); _setRouteLabel('waypoint3',_routePointName(_rW3)); _setRouteLabel('end',_routePointName(_rE)); _syncRouteWaypointBox(); }
function _expandRouteWaypointSummary(){
  const routeWaypoints=_getRouteWaypoints();
  if(!routeWaypoints.length) return;
  _routeWaypointSummaryExpanded=true;
  _routeWaypointEnabled=!!(_routeWaypointEnabled || (_rW&&_rW.lat&&_rW.lng));
  _routeWaypoint2Enabled=!!(_routeWaypoint2Enabled || (_rW2&&_rW2.lat&&_rW2.lng));
  _routeWaypoint3Enabled=!!(_routeWaypoint3Enabled || (_rW3&&_rW3.lat&&_rW3.lng));
  _syncRoutePointLabels();
  _syncRouteWaypointBox();
}
function _collapseRouteWaypointSummary(){ _routeWaypointSummaryExpanded=false; _syncRouteWaypointBox(); }
function _setRouteWaypointEnabled(enabled){ _routeWaypointEnabled=!!enabled; _syncRouteWaypointBoxes(); }
function _setRouteWaypoint2Enabled(enabled){ _routeWaypoint2Enabled=!!enabled; _syncRouteWaypointBoxes(); }
function _setRouteWaypoint3Enabled(enabled){ _routeWaypoint3Enabled=!!enabled; _syncRouteWaypointBoxes(); }
function _routeSetDisplay(el,displayValue){ if(el) el.style.setProperty('display',displayValue,'important'); }
function _syncRouteWaypointSummaryBox(summaryBox,summaryLbl,summaryVisible,routeWaypoints){
  if(!summaryBox) return;
  summaryBox.style.display=summaryVisible?'flex':'none';
  if(summaryVisible){
    const summaryText='경유지 '+routeWaypoints.length+'곳 · '+routeWaypoints.map(function(p,idx){ return (idx+1)+'. '+((p&&p.name)||('경유지'+(idx+1))); }).join(' → ');
    if(summaryLbl) summaryLbl.textContent=summaryText;
    summaryBox.setAttribute('title', '눌러서 경유지 박스 펼치기 · '+summaryText);
    summaryBox.setAttribute('role','button');
    summaryBox.setAttribute('tabindex','0');
    summaryBox.setAttribute('aria-label','경유지 요약 박스 펼치기');
  }else{
    if(summaryLbl) summaryLbl.textContent='경유지 없음';
    summaryBox.removeAttribute('title');
    summaryBox.removeAttribute('role');
    summaryBox.removeAttribute('tabindex');
    summaryBox.removeAttribute('aria-label');
  }
}
function _syncRouteWaypointStateClasses(stack,sheet,state){
  if(stack){
    stack.classList.toggle('has-waypoint', !state.summaryVisible && state.w1Visible);
    stack.classList.toggle('has-waypoint2', !state.summaryVisible && state.w2Visible);
    stack.classList.toggle('has-waypoint3', !state.summaryVisible && state.w3Visible);
    stack.classList.toggle('has-waypoint-summary', state.summaryVisible);
  }
  if(sheet){
    sheet.classList.toggle('route-result-showing', state.resultShowing);
    sheet.classList.toggle('route-multi-waypoint-input', state.multiWaypointInput);
    sheet.classList.toggle('route-basic-input', state.basicRouteInput);
  }
}
function _syncRouteWaypointBoxes(){
  const stack=$('rs-top') ? $('rs-top').querySelector('.rs-route-stack') : document.querySelector('.rs-route-stack');
  const sheet=$('sheet-route');
  const routeWaypoints=_getRouteWaypoints();
  const p1Ready=_routePointReady(_rW), p2Ready=_routePointReady(_rW2), p3Ready=_routePointReady(_rW3);
  // 경유지는 반드시 1 → 2 → 3 순서로만 표시한다.
  if(!(_routeWaypointEnabled || p1Ready)){ _routeWaypoint2Enabled=false; _routeWaypoint3Enabled=false; }
  if(!(_routeWaypoint2Enabled || p2Ready)){ _routeWaypoint3Enabled=false; }
  const rawW1Visible=!!(_routeWaypointEnabled || p1Ready);
  const rawW2Visible=!!((_routeWaypoint2Enabled || p2Ready) && rawW1Visible);
  const rawW3Visible=!!((_routeWaypoint3Enabled || p3Ready) && rawW2Visible);
  const resultShowing=_isRouteResultShowing();
  const summaryExpanded=!!_routeWaypointSummaryExpanded;
  const summaryVisible=!!(resultShowing && routeWaypoints.length && !summaryExpanded);
  // 경로 결과 화면에서는 실제 좌표가 있는 경유지만 표시한다.
  const w1Visible=!!(resultShowing ? p1Ready : rawW1Visible);
  const w2Visible=!!(resultShowing ? (p1Ready && p2Ready) : rawW2Visible);
  const w3Visible=!!(resultShowing ? (p1Ready && p2Ready && p3Ready) : rawW3Visible);
  const multiWaypointInput=!!(!resultShowing && !summaryVisible && (w2Visible || w3Visible || routeWaypoints.length >= 2));
  const summaryBox=$('rs-waypoints-summary-box'), summaryLbl=$('rs-waypoints-summary-lbl');
  const box1=$('rs-waypoint-box'), box2=$('rs-waypoint2-box'), box3=$('rs-waypoint3-box');
  const add1=$('rs-add-waypoint-btn'), add2=$('rs-add-waypoint2-btn'), add3=$('rs-add-waypoint3-btn');
  const tools0=$('rs-start-waypoint-tools'), tools1=$('rs-waypoint-end-tools'), tools2=$('rs-waypoint2-end-tools'), tools3=$('rs-waypoint3-end-tools');
  const wx1=$('rs-waypoint-x'), wx2=$('rs-waypoint2-x'), wx3=$('rs-waypoint3-x');
  const basicRouteInput=!!(!resultShowing && !w1Visible && !w2Visible && !w3Visible);
  _syncRouteWaypointStateClasses(stack,sheet,{summaryVisible,w1Visible,w2Visible,w3Visible,resultShowing,multiWaypointInput,basicRouteInput});
  _syncRouteWaypointSummaryBox(summaryBox,summaryLbl,summaryVisible,routeWaypoints);
  _routeSetDisplay(box1,(!summaryVisible && w1Visible)?'flex':'none'); _routeSetDisplay(box2,(!summaryVisible && w2Visible)?'flex':'none'); _routeSetDisplay(box3,(!summaryVisible && w3Visible)?'flex':'none');
  // 결과 화면에서도 경유지 요약 상태가 아니면 +경유지 버튼 흐름을 유지한다.
  _routeSetDisplay(add1,(!summaryVisible && !w1Visible)?'inline-flex':'none'); _routeSetDisplay(add2,(!summaryVisible && w1Visible && !w2Visible)?'inline-flex':'none'); _routeSetDisplay(add3,(!summaryVisible && w2Visible && !w3Visible)?'inline-flex':'none');
  _routeSetDisplay(tools0,summaryVisible?'none':'block'); _routeSetDisplay(tools1,(!summaryVisible && w1Visible)?'block':'none'); _routeSetDisplay(tools2,(!summaryVisible && w2Visible)?'block':'none'); _routeSetDisplay(tools3,(!summaryVisible && w3Visible)?'block':'none');
  _routeSetDisplay(wx1,(!summaryVisible && w1Visible)?'inline-flex':'none'); _routeSetDisplay(wx2,(!summaryVisible && w2Visible)?'inline-flex':'none'); _routeSetDisplay(wx3,(!summaryVisible && w3Visible)?'inline-flex':'none');
}
function _ensureRouteWaypointBox(role){ role=role||_nextAvailableWaypointRole()||'waypoint'; _setRouteWaypointEnabledByRole(role,true); _setRouteLabel(role,_routePointName(_getRoutePointByRole(role))); _refreshRouteTmpMarkers(); if(!_getRoutePointByRole(role)) _showRouteGuideText('지도에서 경유지'+_routeWaypointIndex(role)+' 마커를 선택하거나 경유지 박스를 눌러 검색하세요'); }
function _beginWaypointAddMode(role){ role=role||_nextAvailableWaypointRole(); if(!role){ _showRouteGuideText('경유지는 현재 3곳까지 추가할 수 있습니다.'); return; } _ensureRouteWaypointBox(role); if(_polyline) _clearVisibleRouteResultOnly(); _scheduleRouteSelectionMarkerRestore(); _refreshRouteTmpMarkers(); _showRouteGuideText('지도에서 경유지'+_routeWaypointIndex(role)+'를 선택하거나 경유지 박스를 눌러 검색하세요'); }
function _syncRouteWaypointBox(){ _routeWaypointEnabled=!!(_routeWaypointEnabled || (_rW&&_rW.lat&&_rW.lng)); _routeWaypoint2Enabled=!!(_routeWaypoint2Enabled || (_rW2&&_rW2.lat&&_rW2.lng)); _routeWaypoint3Enabled=!!(_routeWaypoint3Enabled || (_rW3&&_rW3.lat&&_rW3.lng)); _syncRouteWaypointBoxes(); }
function _routePointMatchesItem(point,item,idx){ if(!point||!item) return false; if(typeof point.idx==='number' && point.idx>=0 && point.idx===idx) return true; return Number(point.lat)===Number(item.lat) && Number(point.lng)===Number(item.lng) && String(point.name||'')===String(item.name||''); }
function _setRoutePointFromItem(role,item,idx){
  const oldPoint=_getRoutePointByRole(role);
  _restoreRoutePointMarker(oldPoint);
  if(_isRouteWaypointRole(role)) _setRouteWaypointEnabledByRole(role,true);
  if(role==='start') _routeRegionStart=null;
  _clearRouteTmpMarkers();
  const obj={idx:idx,name:item.name,lat:item.lat,lng:item.lng};
  _setRoutePointByRole(role,obj);
  if(_mode==='shrine' && idx>=0 && _markers[idx]){
    if(role==='start') _markers[idx].marker.setImage(_mkrImgRoute('#ff0000','출'));
    else if(_isRouteWaypointRole(role)) _markers[idx].marker.setImage(_mkrImgRoute(_routeWaypointColor(role),_routeWaypointMarkerText(role)));
    else _markers[idx].marker.setImage(_mkrImgRoute(_typeColor(item.type),'도'));
    _setRouteMarkerZ(idx,role);
  }
  _setRouteLabel(role,item.name);
  _restoreMarkersWhenRouteNotDisplayed();
  _reapplyShrineRouteMarkerImages();
  _refreshRouteTmpMarkers();
  _scheduleRouteMarkerRefresh();
  if(_rS&&_rE){ _hideRouteGuide(); _updateSearchBtn(); } else if(!_rS) _showRouteGuideText(`출발 ${_getRouteGuideTarget()}를 탭하세요`); else if(!_rE) _showRouteGuideText(`도착 ${_getRouteGuideTarget()}를 탭하세요`);
  if(!_activeTab||_activeTab!=='route') openTab('route');
  _scheduleRouteMarkerRefresh();
}
function _swapRouteObjects(a,b){ const av=_getRoutePointByRole(a), bv=_getRoutePointByRole(b); _setRoutePointByRole(a,bv||null); _setRoutePointByRole(b,av||null); if(_isRouteWaypointRole(a)) _setRouteWaypointEnabledByRole(a,!!bv); if(_isRouteWaypointRole(b)) _setRouteWaypointEnabledByRole(b,!!av); _syncRoutePointLabels(); _repaintRoutePointMarkers(); }
function _repaintRoutePointMarkers(){ try{ _clearVisibleRouteResultOnly(); _clearRouteTmpMarkers(); _restoreMarkersWhenRouteNotDisplayed(); if(_mode==='shrine'){ if(_rS&&_rS.idx>=0&&_markers[_rS.idx]){ _markers[_rS.idx].marker.setImage(_mkrImgRoute('#ff0000','출')); _setRouteMarkerZ(_rS.idx,'start'); } if(_rW&&_rW.idx>=0&&_markers[_rW.idx]){ _markers[_rW.idx].marker.setImage(_mkrImgRoute(_routeWaypointColor('waypoint'),_routeWaypointMarkerText('waypoint'))); _setRouteMarkerZ(_rW.idx,'waypoint'); } if(_rW2&&_rW2.idx>=0&&_markers[_rW2.idx]){ _markers[_rW2.idx].marker.setImage(_mkrImgRoute(_routeWaypointColor('waypoint2'),_routeWaypointMarkerText('waypoint2'))); _setRouteMarkerZ(_rW2.idx,'waypoint2'); } if(_rW3&&_rW3.idx>=0&&_markers[_rW3.idx]){ _markers[_rW3.idx].marker.setImage(_mkrImgRoute(_routeWaypointColor('waypoint3'),_routeWaypointMarkerText('waypoint3'))); _setRouteMarkerZ(_rW3.idx,'waypoint3'); } if(_rE&&_rE.idx>=0&&_markers[_rE.idx]){ _markers[_rE.idx].marker.setImage(_mkrImgRoute(_typeColor(_markers[_rE.idx].shrine.type),'도')); _setRouteMarkerZ(_rE.idx,'end'); } } _refreshRouteTmpMarkers(); }catch(e){ console.warn('[가톨릭길동무]', e); } }


function _clearRouteTmpMarkers(){
  _clearRoutePointOverlays();
  if(_startTmpMkr){ _startTmpMkr.setMap(null); _startTmpMkr=null; }
  if(_wayTmpMkr){ _wayTmpMkr.setMap(null); _wayTmpMkr=null; }
  if(_way2TmpMkr){ _way2TmpMkr.setMap(null); _way2TmpMkr=null; }
  if(_way3TmpMkr){ _way3TmpMkr.setMap(null); _way3TmpMkr=null; }
  if(_endTmpMkr){ _endTmpMkr.setMap(null); _endTmpMkr=null; }
}
function _routeEndMarkerColor(){
  if(_mode==='shrine' && _rE && _rE.idx>=0 && _markers[_rE.idx] && _markers[_rE.idx].shrine){
    return _typeColor(_markers[_rE.idx].shrine.type);
  }
  return '#0000ff';
}
function _refreshRouteTmpMarkers(){
  if(!_map) return;
  _clearRouteTmpMarkers();
  const hideImplicitStartMarker = _isRouteImplicitCurrentStartHidden();
  const hideRegionStartMarker = !!(_rS && _rS.isRegionStart && _regionLat && _regionLng);
  const routeResultShowing=!!(_polyline || ($('rs-result') && $('rs-result').style.display !== 'none'));
  const needStart = !!(_rS && !hideImplicitStartMarker && !hideRegionStartMarker && (_mode!=='shrine' || _rS.idx<0 || !_markers[_rS.idx] || routeResultShowing));
  // WebView: 경유지 마커는 기존 성지/성당/피정 마커 이미지 복원 흐름에
  // 다시 덮일 수 있으므로, 선택된 경유지는 항상 별도 임시 마커로 한 번 더 표시한다.
  // 이렇게 해야 Android WebView에서 경유지1/2/3 박스에는 들어갔는데 지도에는 경1/경2/경3이
  // 보이지 않는 문제가 생기지 않는다.
  const needWaypoint = !!(_rW && _rW.lat && _rW.lng);
  const needWaypoint2 = !!(_rW2 && _rW2.lat && _rW2.lng);
  const needWaypoint3 = !!(_rW3 && _rW3.lat && _rW3.lng);
  const needEnd = !!(_rE && (_mode!=='shrine' || _rE.idx<0 || !_markers[_rE.idx] || routeResultShowing));
  if(needStart){ _startTmpMkr = new _MM({position:new _LL(_rS.lat,_rS.lng), image:_mkrImgRoute('#ff0000','출'), zIndex:340}); _startTmpMkr.setMap(_map); try{ kakao.maps.event.addListener(_startTmpMkr,'click',function(){ _showRouteCancelConfirm('start'); }); }catch(_e){} }
  if(needWaypoint){ _wayTmpMkr = new _MM({position:new _LL(_rW.lat,_rW.lng), image:_mkrImgRoute(_routeWaypointColor('waypoint'),_routeWaypointMarkerText('waypoint')), zIndex:10030}); _wayTmpMkr.setMap(_map); try{ kakao.maps.event.addListener(_wayTmpMkr,'click',function(){ _showRouteCancelConfirm('waypoint'); }); }catch(_e){} }
  if(needWaypoint2){ _way2TmpMkr = new _MM({position:new _LL(_rW2.lat,_rW2.lng), image:_mkrImgRoute(_routeWaypointColor('waypoint2'),_routeWaypointMarkerText('waypoint2')), zIndex:10020}); _way2TmpMkr.setMap(_map); try{ kakao.maps.event.addListener(_way2TmpMkr,'click',function(){ _showRouteCancelConfirm('waypoint2'); }); }catch(_e){} }
  if(needWaypoint3){ _way3TmpMkr = new _MM({position:new _LL(_rW3.lat,_rW3.lng), image:_mkrImgRoute(_routeWaypointColor('waypoint3'),_routeWaypointMarkerText('waypoint3')), zIndex:10010}); _way3TmpMkr.setMap(_map); try{ kakao.maps.event.addListener(_way3TmpMkr,'click',function(){ _showRouteCancelConfirm('waypoint3'); }); }catch(_e){} }
  if(needEnd){ _endTmpMkr = new _MM({position:new _LL(_rE.lat,_rE.lng), image:_mkrImgRoute(_routeEndMarkerColor(),'도'), zIndex:320}); _endTmpMkr.setMap(_map); try{ kakao.maps.event.addListener(_endTmpMkr,'click',function(){ _showRouteCancelConfirm('end'); }); }catch(_e){} }
  _refreshRoutePointOverlays();
  _syncRouteWaypointBox();
  _raiseMyLocationMarker();
}

function _scheduleRouteMarkerRefresh(){
  try{
    _reapplyShrineRouteMarkerImages();
    _refreshRouteTmpMarkers();
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  [80, 260, 520].forEach(function(ms){
    setTimeout(function(){
      try{
        _reapplyShrineRouteMarkerImages();
        _refreshRouteTmpMarkers();
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }, ms);
  });
}

function _typeColor(t){return t==='성지'?'#c0392b':t==='순례지'?'#1565c0':'#1b7a3e';}

function _mkrImgRegion(){
  const color='#7B2FBE';
  const svg=`<svg ${_NS} width="42" height="54" viewBox="0 0 42 54">
    <ellipse cx="21" cy="51" rx="8" ry="3" fill="rgba(0,0,0,.22)"/>
    <path d="M21 1C9.95 1 1 9.95 1 21c0 14.2 20 31 20 31s20-16.8 20-31C41 9.95 32.05 1 21 1z" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="21" cy="21" r="10.5" fill="white" opacity=".95"/>
    <circle cx="21" cy="21" r="5.2" fill="${color}" opacity=".95"/>
  </svg>`;
  return new _MI(_svgUrl(svg),new _SZ(42,54),{offset:new _PT(21,52)});
}
function _clearRegionMarker(){
  try{ if(_regionMarker){ _regionMarker.setMap(null); _regionMarker=null; } }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _showRegionMarker(lat,lng,name){
  if(!_map||!lat||!lng||typeof _LL==='undefined'||typeof _MM==='undefined') return;
  try{
    _clearRegionMarker();
    _regionMarker=new _MM({
      position:new _LL(lat,lng),
      image:_mkrImgRegion(),
      title:name||'검색 위치',
      zIndex:500
    });
    _regionMarker.setMap(_map);
    try{
      kakao.maps.event.addListener(_regionMarker,'click',function(){
        if(_routeMode && _rS && _rS.isRegionStart && Number(_rS.lat)===Number(lat) && Number(_rS.lng)===Number(lng)){
          _showRouteCancelConfirm('start');
        }
      });
    }catch(_e){}
    _raiseMyLocationMarker();
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _regionMapLevelFor(items, lat, lng){
  let maxKm=0;
  try{
    (items||[]).forEach(function(p){
      if(!p||!p.lat||!p.lng) return;
      maxKm=Math.max(maxKm, calcDist(lat,lng,p.lat,p.lng));
    });
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  if(maxKm<=1.8) return 5;
  if(maxKm<=3.5) return 6;
  if(maxKm<=7) return 7;
  if(maxKm<=14) return 8;
  if(maxKm<=28) return 9;
  if(maxKm<=55) return 10;
  if(maxKm<=95) return 11;
  return 12;
}
function _centerRegionMap(lat,lng,items){
  if(!_map||!lat||!lng||typeof _LL==='undefined') return;
  try{
    const pos=new _LL(lat,lng);
    if(typeof _map.setLevel==='function') _map.setLevel(_regionMapLevelFor(items,lat,lng));
    _map.setCenter(pos);
    setTimeout(function(){ try{ if(_map) _map.setCenter(pos); }catch(e){ console.warn('[가톨릭길동무]', e); } }, 80);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _showRegionParishMarkers(items){
  if(_mode!=='parish'||!_map||!Array.isArray(items)||typeof _LL==='undefined') return;
  try{
    _clearParishNearbyMarkers();
    try{ _hideDioOverlays(); }catch(_e){}
    Object.keys(_dioMkrs||{}).forEach(function(code){
      (_dioMkrs[code]||[]).forEach(function(mk){ try{ mk.setMap(null); }catch(e){ console.warn('[가톨릭길동무]', e); } });
    });
    _activeDio=null;
    if(_paSelMkr){ try{ _paSelMkr.setMap(null); }catch(e){ console.warn('[가톨릭길동무]', e); } _paSelMkr=null; }
    if(!items.length) return;
    const arr=[];
    items.forEach(function(p){
      if(!p||!p.lat||!p.lng||p.lat===0||p.lng===0) return;
      const idx=PARISHES.indexOf(p);
      const mk=new _MM({
        position:new _LL(p.lat,p.lng),
        image:_mkrImg(OAI_CATHEDRAL_CATEGORY_COLOR,false),
        title:p.name,
        zIndex:60
      });
      kakao.maps.event.addListener(mk,'click',function(){
        if(_routeMode) _selectRouteItem(idx);
        else selectItem(idx,{fromRegion:true});
      });
      mk.setMap(_map);
      arr.push(mk);
    });
    if(AppState) AppState.nearbyParishMarkers=arr;
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _showRegionItemsOnMap(items, lat, lng, opts){
  opts=opts||{};
  if(!_map||!lat||!lng) return;
  const list=Array.isArray(items)?items.filter(function(p){ return p&&p.lat&&p.lng&&p.lat!==0&&p.lng!==0; }):[];
  try{
    if(_mode==='shrine'){
      _clearShrineMarkerSel();
      _markers.forEach(function(m){
        if(!m||!m.marker||!m.shrine) return;
        const on=list.indexOf(m.shrine)>=0;
        m.marker.setMap(on?_map:null);
        if(on){
          m.marker.setImage(_mkrImg(_typeColor(m.shrine.type),false));
          m.marker.setZIndex(40);
        }
      });
    }else if(_mode==='retreat'){
      if(!_retreatMarkers.length) _buildRetreatMarkers();
      _retreatMarkers.forEach(function(o){
        if(!o||!o.marker||!o.item) return;
        const on=list.indexOf(o.item)>=0;
        o.marker.setMap(on?_map:null);
        if(on){
          o.marker.setImage(_mkrImgRetreat('#2e7d32',false));
          o.marker.setZIndex(45);
        }
      });
      if(_paSelMkr){ try{ _paSelMkr.setMap(null); }catch(e){ console.warn('[가톨릭길동무]', e); } _paSelMkr=null; }
    }else if(_mode==='parish'){
      _showRegionParishMarkers(list);
    }
    _showRegionMarker(lat,lng,_regionPlaceName||_regionName||'검색 위치');
    if(opts.center!==false) _centerRegionMap(lat,lng,list);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function showRegionPlaceOnMap(){
  if(!_regionLat||!_regionLng) return;
  try{
    document.activeElement&&document.activeElement.blur&&document.activeElement.blur();
    _showRegionItemsOnMap(_regionCache||[], _regionLat, _regionLng, {center:true});
    _closeSheetOnly('region');
    if(_activeTab==='region') _activeTab=null;
    _updateTabBtns(null);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
try{ window.showRegionPlaceOnMap=showRegionPlaceOnMap; }catch(e){ console.warn('[가톨릭길동무]', e); }

function _isRegionItemContextActive(item){
  try{
    if(!item || !_regionLat || !_regionLng || !_routeRegionStart || !_routeRegionStart.lat) return false;
    if(!Array.isArray(_regionCache) || !_regionCache.length) return false;
    if(_regionCache.indexOf(item) >= 0) return true;
    return _regionCache.some(function(p){
      return p && Number(p.lat)===Number(item.lat) && Number(p.lng)===Number(item.lng) && p.name===item.name;
    });
  }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
}

function _showRegionSelectionMapIfActive(){
  try{
    if(_regionLat && _regionLng && _regionCache && _regionCache.length){
      _showRegionItemsOnMap(_regionCache, _regionLat, _regionLng, {center:false});
      return true;
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  return false;
}

function _buildShrineMarkers(){
  _markers=new Array(SHRINES.length).fill(null);
  const BATCH=30;
  let idx=0;
  function next(){
  const end=Math.min(idx+BATCH,SHRINES.length);
  for(let i=idx;i<end;i++){
   const s=SHRINES[i];
   if(!s.lat||!s.lng||s.lat<33||s.lat>38||s.lng<124||s.lng>132) continue;
   const mk=new _MM({
    position:new _LL(s.lat,s.lng),
    image:_mkrImg(_typeColor(s.type),false),title:s.name
   });
   mk.setMap(_map);
   (function(index){
    kakao.maps.event.addListener(mk,'click',()=>{
     if(_routeMode) _selectRouteItem(index);
     else selectItem(index,{fromRegion:_isRegionItemContextActive(SHRINES[index])});
    });
   })(i);
   _markers[i]={marker:mk,shrine:s,index:i};
  }
  idx=end;
  if(idx<SHRINES.length) requestAnimationFrame(next);
  }
  requestAnimationFrame(next);
}

function _clearShrineMarkers(){
  _markers.forEach(m=>{if(m)m.marker.setMap(null);});
}

function _restoreMapMarkers(){
  if(_mode==='parish'){
    try{ _clearParishNearbyMarkers(); }catch(e){ console.warn('[가톨릭길동무]',e); }
    const keepCode = (AppState && AppState.nearbyParishDioCode) || _activeDio || null;
    if(keepCode){
      if(_activeDio && _activeDio!==keepCode){
        try{ _hideParishDioMkrs(_activeDio); }catch(e){ console.warn('[가톨릭길동무]',e); }
      }
      _activeDio=keepCode;
      _showParishDioMkrs(keepCode);
      _syncParishDioLabels();
      return;
    }
    _syncParishDioLabels();
    try{ _showCurrentParishDioIfIdle(); }catch(e){ console.warn('[가톨릭길동무]',e); }
    return;
  }
  if(_mode==='retreat'){
    _restoreRetreatMarkers();
    return;
  }
  _markers.forEach(m=>{
  if(!m) return;
  const s=m.shrine;
  const ok=(_filterDio==='all'||s.diocese===_filterDio)&&
      (!_listSrch||s.name.includes(_listSrch)||s.diocese.includes(_listSrch)||s.addr.includes(_listSrch));
  m.marker.setMap(ok?_map:null);
  });
}

function _restoreAllCategoryMarkersForSelection(){
  if(!_map) return;
  if(_mode==='shrine'){
    _markers.forEach(m=>{
      if(!m||!m.marker) return;
      try{
        m.marker.setMap(_map);
        m.marker.setImage(_mkrImg(_typeColor(m.shrine.type),false));
        m.marker.setZIndex(1);
      }catch(e){ console.warn("[가톨릭길동무]", e); }
    });
    _selIdx=-1;
    return;
  }
  if(_mode==='retreat'){
    if(!_retreatMarkers.length) _buildRetreatMarkers();
    _retreatMarkers.forEach(o=>{
      if(!o||!o.marker) return;
      try{
        o.marker.setMap(_map);
        o.marker.setImage(_mkrImgRetreat('#2e7d32',false));
        o.marker.setZIndex(45);
      }catch(e){ console.warn("[가톨릭길동무]", e); }
    });
    if(_paSelMkr){try{_paSelMkr.setMap(null);}catch(e){ console.warn("[가톨릭길동무]", e); } _paSelMkr=null;}
  }
}


function _restoreRouteSelectionMarkersAfterReset(){
  try{
    if(!_map) return;
    if(_mode==='parish'){
      try{ _clearRegionResultMarkers && _clearRegionResultMarkers(); }catch(_e){}
      _restoreMapMarkers();
    }else if(_mode==='shrine'){
      if(!_markers || !_markers.some(function(m){ return !!(m&&m.marker); })){
        try{ _buildShrineMarkers(); }catch(_e){}
      }
      _restoreAllCategoryMarkersForSelection();
    }else if(_mode==='retreat'){
      if(!_retreatMarkers || !_retreatMarkers.length){
        try{ _buildRetreatMarkers(); }catch(_e){}
      }
      _restoreAllCategoryMarkersForSelection();
    }else{
      _restoreMapMarkers();
    }
    if(_routeRegionStart && _routeRegionStart.lat && _routeRegionStart.lng){
      try{ _showRegionPlaceMarker(_routeRegionStart.lat,_routeRegionStart.lng,_routeRegionStart.placeName || _routeRegionStart.name || _regionPlaceName || _regionName || '검색지'); }catch(_e){}
    }else if(_regionLat && _regionLng && _regionMarker){
      try{ _showRegionPlaceMarker(_regionLat,_regionLng,_regionPlaceName||_regionName||'검색지'); }catch(_e){}
    }
    try{ _reapplyShrineRouteMarkerImages(); }catch(_e){}
    try{ _refreshRouteTmpMarkers(); }catch(_e){}
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _scheduleRouteSelectionMarkerRestore(){
  try{ _restoreRouteSelectionMarkersAfterReset(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  [80,240,520].forEach(function(ms){ setTimeout(function(){ try{ _restoreRouteSelectionMarkersAfterReset(); }catch(e){ console.warn('[가톨릭길동무]', e); } }, ms); });
}


function _restoreMarkersWhenRouteNotDisplayed(){
  if(!_map) return;
  try{
    if(_polyline) return;
    if(_mode==='shrine' || _mode==='retreat'){
      _restoreAllCategoryMarkersForSelection();
    }else{
      _restoreMapMarkers();
    }

    if(_mode==='shrine'){
      _reapplyShrineRouteMarkerImages();
    }
    _refreshRouteTmpMarkers();
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function _selectShrineMarker(idx){
  if(_selIdx>=0&&_markers[_selIdx]){
  _markers[_selIdx].marker.setImage(_mkrImg(_typeColor(_markers[_selIdx].shrine.type),false));
  _markers[_selIdx].marker.setZIndex(1);
  }
  if(idx>=0&&_markers[idx]){
  _markers[idx].marker.setImage(_mkrImg('#FFE500',true));
  _markers[idx].marker.setZIndex(10);
  }
  _selIdx=idx;
  _raiseMyLocationMarker();
}

function _clearShrineMarkerSel(){
  if(_selIdx>=0&&_markers[_selIdx]){
  _markers[_selIdx].marker.setImage(_mkrImg(_typeColor(_markers[_selIdx].shrine.type),false));
  _markers[_selIdx].marker.setZIndex(1);
  }
  _selIdx=-1;
}


function _clearParishNearbyMarkers(){
  try{
    const arr=(AppState && AppState.nearbyParishMarkers) || [];
    arr.forEach(function(mk){ try{ mk.setMap(null); }catch(e){ console.warn('[가톨릭길동무]',e); } });
    if(AppState) AppState.nearbyParishMarkers=[];
  }catch(e){ console.warn('[가톨릭길동무]',e); }
}

function _fitParishNearbyBounds(items, lat, lng){
  if(_mode!=='parish' || !_map || !Array.isArray(items) || !items.length || typeof _LB==='undefined' || typeof _LL==='undefined') return false;
  try{
    const bounds=new _LB();
    let count=0;
    if(lat && lng){ bounds.extend(new _LL(lat,lng)); count++; }
    items.forEach(function(p){
      if(!p || !p.lat || !p.lng || p.lat===0 || p.lng===0) return;
      bounds.extend(new _LL(p.lat,p.lng));
      count++;
    });
    if(count>1){
      _markParishDioProgrammaticMove(1500);
      if(typeof _setBoundsByInfoCardStandard==='function') return _setBoundsByInfoCardStandard(bounds, 84, 54, 142, 54);
      _map.setBounds(bounds, 84, 54, 142, 54);
      return true;
    }
    const anchor=items.find(function(p){ return p && p.lat && p.lng && p.lat!==0 && p.lng!==0; });
    if(anchor) return _focusParishPointAround(anchor.lat,anchor.lng,{level:6});
  }catch(e){ console.warn('[가톨릭길동무]',e); }
  return false;
}

function _showParishNearbyMarkersOnMap(items, lat, lng, phase){
  if(_mode!=='parish' || !_map || !Array.isArray(items) || !items.length || typeof _LL==='undefined') return;
  try{
    const anchor = items.find(function(p){ return p && p.lat && p.lng && p.lat!==0 && p.lng!==0; });
    const code = anchor ? _parishDioCodeOf(anchor) : '';
    if(!code){
      _clearParishNearbyMarkers();
      return;
    }

    _clearParishNearbyMarkers();

    if(_activeDio && _activeDio!==code){
      try{ _hideParishDioMkrs(_activeDio); }catch(e){ console.warn('[가톨릭길동무]',e); }
    }

    if(_paSelMkr){ try{ _paSelMkr.setMap(null); }catch(e){ console.warn('[가톨릭길동무]',e); } _paSelMkr=null; }
    _activeDio = code;
    _showParishDioMkrs(code);
    _syncParishDioLabels();

    const lastCode = AppState ? AppState.nearbyParishDioCode : null;
    if(lastCode!==code || phase==='est'){
      if(AppState) AppState.nearbyParishDioCode = code;
      _fitParishNearbyBounds(items, lat, lng);
    }
  }catch(e){ console.warn('[가톨릭길동무]',e); }
}

function _showItemsOnMap(items){
  _markers.forEach(m=>{if(m)m.marker.setMap(null);});
  const bounds=new _LB();
  items.forEach(s=>{
  const i=SHRINES.indexOf(s);
  if(i>=0&&_markers[i]){
   _markers[i].marker.setMap(_map);
   if(s.lat&&s.lng) bounds.extend(new _LL(s.lat,s.lng));
  }
  });
  if(typeof _setBoundsByInfoCardStandard==='function'){
    _setBoundsByInfoCardStandard(bounds,60,60,60,60);
  }else{
    try{_map.setBounds(bounds,60,60,60,60);}catch(e){ console.warn("[가톨릭길동무]", e); }
  }
}

function _showAllShrinesOnMapWithNearbyBounds(items, lat, lng){
  if(_mode!=='shrine' || !_map) return;
  try{
    _clearShrineMarkerSel();
    _markers.forEach(function(m){
      if(!m || !m.marker || !m.shrine) return;
      const s=m.shrine;
      const valid=s.lat&&s.lng&&s.lat>=33&&s.lat<=38&&s.lng>=124&&s.lng<=132;
      m.marker.setMap(valid?_map:null);
      if(valid){
        m.marker.setImage(_mkrImg(_typeColor(s.type),false));
        m.marker.setZIndex(1);
      }
    });

    if(!Array.isArray(items) || !items.length || typeof _LB==='undefined' || typeof _LL==='undefined') return;
    const bounds=new _LB();
    let count=0;
    if(lat && lng){ bounds.extend(new _LL(lat,lng)); count++; }
    items.forEach(function(s){
      if(!s || !s.lat || !s.lng) return;
      bounds.extend(new _LL(s.lat,s.lng));
      count++;
    });
    if(count>1){
      if(typeof _setBoundsByInfoCardStandard==='function') _setBoundsByInfoCardStandard(bounds,60,60,142,60);
      else _map.setBounds(bounds,60,60,142,60);
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _selectParishMarker(p){
  if(_paSelMkr){try{_paSelMkr.setMap(null);}catch(e){ console.warn("[가톨릭길동무]", e); }  _paSelMkr=null;}
  if(!_map||!p.lat||!p.lng) return null;
  const dioCode=_parishDioCodeOf(p);
  if(dioCode && _parishSysInited){
    if(_activeDio && _activeDio!==dioCode) _hideParishDioMkrs(_activeDio);
    _activeDio=dioCode;
    _showParishDioMkrs(dioCode);
    _syncParishDioLabels();
  }else if(dioCode){
    _ensureParishMarkerZoom();
  }
  _paSelMkr=new _MM({position:new _LL(p.lat,p.lng),image:_mkrImg('#FFE500',true),zIndex:200});
  _paSelMkr.setMap(_map);
  _raiseMyLocationMarker();
  return dioCode;
}

const _DIO_CFG={
  'SE':{n:'서울대교구',lat:37.565,lng:126.988,c:'#C0392B'},
  'IC':{n:'인천교구',  lat:37.478,lng:126.626,c:'#2471A3'},
  'SW':{n:'수원교구',  lat:37.180,lng:127.018,c:'#7D3C98'},
  'UJ':{n:'의정부교구',lat:37.740,lng:127.058,c:'#CA6F1E'},
  'CC':{n:'춘천교구',  lat:37.875,lng:127.720,c:'#117A65'},
  'WJ':{n:'원주교구',  lat:37.340,lng:127.960,c:'#1E8449'},
  'DJ':{n:'대전교구',  lat:36.352,lng:127.378,c:'#B03A2E'},
  'CJ':{n:'청주교구',  lat:36.630,lng:127.490,c:'#4A235A'},
  'DG':{n:'대구대교구',lat:35.870,lng:128.585,c:'#1A5276'},
  'AD':{n:'안동교구',  lat:36.570,lng:128.725,c:'#9A7D0A'},
  'BS':{n:'부산교구',  lat:35.155,lng:129.065,c:'#6E2F1A'},
  'MS':{n:'마산교구',  lat:35.225,lng:128.580,c:'#6C3483'},
  'GJ':{n:'광주대교구',lat:35.158,lng:126.895,c:'#1A5276'},
  'JJ':{n:'전주교구',  lat:35.820,lng:127.145,c:'#1D6A39'},
  'JE':{n:'제주교구',  lat:33.490,lng:126.530,c:'#B7950B'},
  'ML':{n:'군종교구',  lat:37.530,lng:126.972,c:'#5D6D7E'},

};

const _PARISH_DIO_CODE_MAP={'서울대교구':'SE','인천교구':'IC','수원교구':'SW','의정부교구':'UJ',
  '춘천교구':'CC','원주교구':'WJ','대전교구':'DJ','청주교구':'CJ','대구대교구':'DG',
  '안동교구':'AD','부산교구':'BS','마산교구':'MS','광주대교구':'GJ','전주교구':'JJ',
  '제주교구':'JE','군종교구':'ML'};
function _parishDioCodeOf(p){
  return p && p.diocese ? (_PARISH_DIO_CODE_MAP[p.diocese] || null) : null;
}

function _isParishDioBoundsOutlier(p, code){
  if(!p) return false;
  const name=String(p.name||'');
  const addr=String(p.addr||'');
  if(code==='IC' && (addr.indexOf('인천 옹진군')>=0 || name.indexOf('백령')>=0 || addr.indexOf('백령')>=0 || name.indexOf('대청')>=0 || addr.indexOf('대청')>=0 || name.indexOf('연평')>=0 || addr.indexOf('연평')>=0 || name.indexOf('덕적')>=0 || addr.indexOf('덕적')>=0)) return true;
  if(code==='DG' && (addr.indexOf('울릉')>=0 || name.indexOf('울릉')>=0)) return true;
  return false;
}

let _PA_BY_DIO={};
function _rebuildParishDioIndex(){
  const m={};
  PARISHES.forEach(p=>{
    const code=_parishDioCodeOf(p)||'ETC';
    (m[code]||(m[code]=[])).push(p);
  });
  _PA_BY_DIO=m;
  return _PA_BY_DIO;
}
_parishDioIndexReady=true;
_rebuildParishDioIndex();


function _dioLabelSize(lvl){
  if(lvl<=4) return 18; if(lvl===5) return 16;
  if(lvl===6) return 15; if(lvl===7) return 14;
  if(lvl===8) return 13; return 12;
}

function _markParishDioProgrammaticMove(ms){
  try{
    _parishDioProgrammaticMoveUntil=(Date.now?Date.now():new Date().getTime())+(ms||1400);
  }catch(e){ console.warn('[가톨릭길동무]',e); }
}

function _parishDioCenter(code){
  if(!_map||typeof _LL==='undefined') return null;
  const parishes=_PA_BY_DIO[code]||[];
  let minLat=Infinity,maxLat=-Infinity,minLng=Infinity,maxLng=-Infinity,count=0;
  parishes.forEach(function(p){
    if(!p||!p.lat||!p.lng||p.lat===0||p.lng===0) return;
    if(_isParishDioBoundsOutlier(p, code)) return;
    minLat=Math.min(minLat,p.lat); maxLat=Math.max(maxLat,p.lat);
    minLng=Math.min(minLng,p.lng); maxLng=Math.max(maxLng,p.lng);
    count++;
  });
  if(count>0) return new _LL((minLat+maxLat)/2,(minLng+maxLng)/2);
  const cfg=_DIO_CFG[code];
  return cfg ? new _LL(cfg.lat,cfg.lng) : null;
}

function _centerParishDioWithoutZoom(code){
  if(_mode!=='parish'||!_map) return false;
  const center=_parishDioCenter(code);
  if(!center) return false;
  try{
    if(typeof _map.panTo==='function') _map.panTo(center);
    else _map.setCenter(center);
    return true;
  }catch(e){ console.warn('[가톨릭길동무]',e); }
  return false;
}

function _focusParishPointAround(lat, lng, opts){
  opts=opts||{};
  if(_mode!=='parish'||!_map||!lat||!lng||typeof _LL==='undefined') return false;
  const targetLevel = opts.level || 6;
  const pos = new _LL(lat,lng);
  try{
    if(!opts.noZoom && typeof _map.getLevel==='function' && typeof _map.setLevel==='function'){
      const lvl = _map.getLevel();
      if(lvl > targetLevel){
        _markParishDioProgrammaticMove(1300);
        _map.setLevel(targetLevel);
      }
    }
    if(typeof _recentCategoryEntryCurrentCenter==='function' && _recentCategoryEntryCurrentCenter(2600) && !_curInfoItem && !_routeMode){
      _map.setCenter(pos);
      return true;
    }
    if(typeof _setMapCenterByInfoCardStandard==='function'){
      return _setMapCenterByInfoCardStandard(pos);
    }
    _map.setCenter(pos);
    return true;
  }catch(e){ console.warn('[가톨릭길동무]',e); }
  return false;
}

function _buildParishDioSystem(){
  if(_parishSysInited) return;
  _parishSysInited=true;
  const lvl=_map.getLevel();
  Object.entries(_DIO_CFG).forEach(([code,cfg])=>{
    if(code==='ML') return;
    const el=document.createElement('div');
    el.className='dio-label';
    el.dataset.code=code;
    const fs=_dioLabelSize(lvl);
    el.style.cssText=`cursor:pointer;background:rgba(255,255,255,0.92);color:${cfg.c};`+
      `font-size:${fs}px;font-weight:800;padding:4px 9px;border-radius:20px;`+
      `border:2px solid ${cfg.c};white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.18);`+
      `letter-spacing:-.3px;transition:transform .15s;user-select:none;`;
    el.textContent=cfg.n;
    el.addEventListener('click',function(e){
      e.stopPropagation();
      _toggleParishDio(code);
    });
    const ov=new kakao.maps.CustomOverlay({
      position:new _LL(cfg.lat,cfg.lng),
      content:el,
      xAnchor:0.5,yAnchor:0.5,
      zIndex:100
    });
    _dioOverlays[code]=ov;
    try{ ov.setMap(_map); if(typeof ov.setZIndex==='function') ov.setZIndex(10000); }catch(e){ console.warn('[가톨릭길동무]',e); }
  });
  kakao.maps.event.addListener(_map,'zoom_changed',function(){
    const lvl2=_map.getLevel();
    const fs2=_dioLabelSize(lvl2);
    document.querySelectorAll('.dio-label').forEach(el2=>{
      el2.style.fontSize=fs2+'px';
    });
    try{
      const now=Date.now?Date.now():new Date().getTime();
      if(_mode==='parish' && now>_parishDioProgrammaticMoveUntil){
        _parishDioUserZoomTouched=true;
      }
    }catch(e){ console.warn('[가톨릭길동무]',e); }
  });
}

function _isParishRouteLineActive(){
  return _mode==='parish' && !!_polyline;
}
function _showDioOverlays(){
  if(_isParishRouteLineActive()){
    _hideDioOverlays();
    return;
  }
  Object.values(_dioOverlays).forEach(ov=>{ try{ov.setMap(_map);}catch(e){ console.warn("[가톨릭길동무]", e); } });
}
function _hideDioOverlays(){
  Object.values(_dioOverlays).forEach(ov=>{ try{ov.setMap(null);}catch(e){ console.warn("[가톨릭길동무]", e); } });
}

function _syncParishDioLabels(){
  if(_mode!=='parish' || !_map) return;
  if(_isParishRouteLineActive()){
    _hideDioOverlays();
    return;
  }
  if(!_parishSysInited){ try{ _buildParishDioSystem(); }catch(e){ console.warn('[가톨릭길동무]',e); } }
  Object.entries(_dioOverlays||{}).forEach(function(pair){
    const code=pair[0], ov=pair[1];
    try{ ov.setMap(_map); if(typeof ov.setZIndex==='function') ov.setZIndex(10000); }catch(e){ console.warn('[가톨릭길동무]',e); }
    const el = ov && typeof ov.getContent==='function' ? ov.getContent() : null;
    if(el && el.style){
      el.style.display = (code===_activeDio) ? 'none' : '';
      el.style.visibility = 'visible';
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
      el.style.zIndex = '10000';
      el.style.transform = '';
    }
  });
}

function _toggleParishDio(code){
  if(_mode==='parish' && !_isParishDioceseReady(code)){
    _showParishDataLoadingMessage((_DIO[code]||'해당 교구')+' 성당 정보를 불러오는 중입니다...');
    _ensureParishDioceseDataLoaded(code).then(function(){ _toggleParishDio(code); }).catch(function(err){
      console.warn('[가톨릭길동무] 성당 교구 데이터 로드 실패', err);
      try{ alert('성당 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.'); }catch(_e){}
    });
    return;
  }
  if(_activeDio===code){
    _hideParishDioMkrs(code);
    _activeDio=null;
    _syncParishDioLabels();
    return;
  }
  if(_activeDio) _hideParishDioMkrs(_activeDio);
  _activeDio=code;
  _showParishDioMkrs(code);
  _syncParishDioLabels();
  _focusParishDio(code,{fromLabel:true});
}

function _focusParishDio(code, opts){
  opts=opts||{};
  if(opts.fromLabel && _parishDioUserZoomTouched){
    if(_centerParishDioWithoutZoom(code)) return;
  }
  _fitParishDioBounds(code,{reason:'dio-click'});
}

function _fitParishDioBounds(code, opts){
  opts=opts||{};
  if(_mode!=='parish'||!_map||typeof _LB==='undefined'||typeof _LL==='undefined') return false;
  const parishes=_PA_BY_DIO[code]||[];
  let bounds=null, count=0, only=null;
  try{
    parishes.forEach(function(p){
      if(!p||!p.lat||!p.lng||p.lat===0||p.lng===0) return;
      if(_isParishDioBoundsOutlier(p, code)) return;
      only=p;
      const pos=new _LL(p.lat,p.lng);
      if(!bounds) bounds=new _LB();
      bounds.extend(pos);
      count++;
    });
    if(count>1 && bounds){
      _markParishDioProgrammaticMove(1700);
      if(typeof _setBoundsByInfoCardStandard==='function'){
        _setBoundsByInfoCardStandard(bounds, 86, 64, 126, 64);
      }else{
        try{ _map.setBounds(bounds, 86, 64, 126, 64); }
        catch(e1){ _map.setBounds(bounds); }
      }
      setTimeout(function(){
        try{
          if(_mode==='parish' && _activeDio===code && typeof _map.getLevel==='function' && typeof _map.setLevel==='function'){
            var lvl=_map.getLevel();
            if(lvl<8){ _markParishDioProgrammaticMove(1200); _map.setLevel(8); }
          }
        }catch(e2){ console.warn('[가톨릭길동무]',e2); }
      }, opts.delay || 90);
      return true;
    }
    if(count===1 && only){
      if(typeof _map.setLevel==='function'){ _markParishDioProgrammaticMove(1200); _map.setLevel(8); }
      if(typeof _setMapCenterByInfoCardStandard==='function') _setMapCenterByInfoCardStandard(new _LL(only.lat,only.lng));
      else _map.setCenter(new _LL(only.lat,only.lng));
      return true;
    }
    const cfg=_DIO_CFG[code];
    if(cfg){
      if(typeof _map.setLevel==='function'){ _markParishDioProgrammaticMove(1200); _map.setLevel(8); }
      if(typeof _setMapCenterByInfoCardStandard==='function') _setMapCenterByInfoCardStandard(new _LL(cfg.lat,cfg.lng));
      else _map.setCenter(new _LL(cfg.lat,cfg.lng));
      return true;
    }
  }catch(e){ console.warn('[가톨릭길동무]',e); }
  return false;
}

function _ensureParishMarkerZoom(){
  if(_mode!=='parish'||!_map||typeof _map.getLevel!=='function'||typeof _map.setLevel!=='function') return;
  try{
    if(_map.getLevel()>6){ _markParishDioProgrammaticMove(1200); _map.setLevel(6); }
  }catch(e){ console.warn('[가톨릭길동무]',e); }
}
function _showParishDioMkrs(code){
  if(_isParishRouteLineActive()){
    try{ _hideParishDioMkrs(code); }catch(e){ console.warn('[가톨릭길동무]',e); }
    return;
  }
  if(!_dioMkrs[code]){
    const cfg=_DIO_CFG[code]||{c:'#555'};
    const parishes=_PA_BY_DIO[code]||[];
    _dioMkrs[code]=[];
    parishes.forEach(p=>{
      if(!p.lat||!p.lng||p.lat===0||p.lng===0) return;
      const mk=new _MM({
        position:new _LL(p.lat,p.lng),
        image:_mkrImg(cfg.c,false),
        title:p.name,
        zIndex:50
      });
      kakao.maps.event.addListener(mk,'click',function(){
        const idx=PARISHES.indexOf(p);
        if(_routeMode) _selectRouteItem(idx);
        else selectItem(idx,{fromNearby:false,fromRegion:_isRegionItemContextActive(p)});
      });
      _dioMkrs[code].push(mk);
    });
  }
  _updateParishViewport(code);
  if(_parishIdleListener){
    try{kakao.maps.event.removeListener(_parishIdleListener);}catch(e){ console.warn('[가톨릭길동무]',e); }
    _parishIdleListener=null;
  }
  _parishIdleListener=kakao.maps.event.addListener(_map,'idle',function(){
    if(_activeDio===code) _updateParishViewport(code);
  });
}

function _updateParishViewport(code){
  const mkrs=_dioMkrs[code];
  if(!mkrs||!_map) return;
  if(_isParishRouteLineActive()){
    mkrs.forEach(mk=>{
      try{ mk.setMap(null); }catch(e){ console.warn('[가톨릭길동무]',e); }
    });
    return;
  }
  mkrs.forEach(mk=>{
    try{ mk.setMap(_map); }catch(e){ console.warn('[가톨릭길동무]',e); }
  });
}

function _hideParishDioMkrs(code){
  (_dioMkrs[code]||[]).forEach(mk=>{ try{mk.setMap(null);}catch(e){ console.warn('[가톨릭길동무]',e); } });
  if(_parishIdleListener){
    try{kakao.maps.event.removeListener(_parishIdleListener);}catch(e){ console.warn('[가톨릭길동무]',e); }
    _parishIdleListener=null;
  }
}
function _buildRetreatMarkers(){
  if(!_map) return;
  if(!_retreatMarkers.length){
    RETREATS.forEach((p,i)=>{
      if(!p.lat||!p.lng||p.lat===0) return;
      const mk=new _MM({
        position:new _LL(p.lat,p.lng),
        image:_mkrImg('#2e7d32',false),
        title:p.name,
        zIndex:45
      });
      (function(idx){kakao.maps.event.addListener(mk,'click',function(){
        if(_routeMode) _selectRouteItem(idx);
        else selectItem(idx,{fromNearby:false,fromRegion:_isRegionItemContextActive(p)});
      });})(i);
      _retreatMarkers.push({marker:mk,item:p,index:i});
    });
  }
  _retreatMarkers.forEach(o=>o.marker.setMap(_map));
}
function _clearRetreatMarkers(){
  _retreatMarkers.forEach(o=>o.marker.setMap(null));
  if(_paSelMkr){try{_paSelMkr.setMap(null);}catch(e){ console.warn("[가톨릭길동무]", e); } _paSelMkr=null;}
}
function _restoreRetreatMarkers(){
  _retreatMarkers.forEach(o=>{
    const s=o.item;
    const ok=(_filterDio==='all'||s.diocese===_filterDio)&&(!_listSrch||s.name.includes(_listSrch)||s.diocese.includes(_listSrch)||s.addr.includes(_listSrch));
    o.marker.setMap(ok?_map:null);
  });
}
function _selectRetreatMarker(p){
  if(_paSelMkr){try{_paSelMkr.setMap(null);}catch(e){ console.warn("[가톨릭길동무]", e); } _paSelMkr=null;}
  if(!_map||!p.lat||!p.lng) return;
  _paSelMkr=new _MM({position:new _LL(p.lat,p.lng),image:_mkrImgRetreat('#FFE500',true),zIndex:180});
  _paSelMkr.setMap(_map);
  _raiseMyLocationMarker();
}

function _clearParishMarkers(){
  if(_paSelMkr){try{_paSelMkr.setMap(null);}catch(e){ console.warn("[가톨릭길동무]", e); }  _paSelMkr=null;}
  if(_activeDio){ _hideParishDioMkrs(_activeDio); _activeDio=null; }
  document.querySelectorAll('.dio-label').forEach(e=>e.style.transform='');
  _hideDioOverlays();
}

function _isInstalledLikeApp(){
  try{
    if(window.matchMedia && (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches)) return true;
    if(navigator.standalone === true) return true;
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  return false;
}
function _geoPermissionState(){
  try{
    if(!navigator.permissions || !navigator.permissions.query) return Promise.resolve('unknown');
    return navigator.permissions.query({name:'geolocation'}).then(function(result){
      return result && result.state ? result.state : 'unknown';
    }).catch(function(){ return 'unknown'; });
  }catch(e){
    return Promise.resolve('unknown');
  }
}
function _geoRuntimeGuideText(){
  if(_isInstalledLikeApp()){
    return '설정 > 앱 > 가톨릭길동무 > 권한 > 위치에서 “앱 사용 중 허용”과 “정확한 위치 사용”을 켜 주세요.\n그래도 안 되면 설정 > 위치에서 위치 서비스와 Google 위치 정확도를 켠 뒤 앱을 완전히 종료하고 다시 실행해 주세요.';
  }
  return '브라우저 또는 앱의 사이트 설정에서 위치 권한을 허용하고, 휴대폰 위치 서비스와 정확한 위치 사용을 켠 뒤 다시 시도해 주세요.';
}
function _geoDeniedGuideText(){
  if(_isInstalledLikeApp()){
    return '휴대폰 설정 > 앱 > 가톨릭길동무 > 권한 > 위치에서 “앱 사용 중 허용”과 “정확한 위치 사용”을 켠 뒤 앱을 완전히 종료하고 다시 실행해 주세요.';
  }
  return '브라우저 또는 앱의 사이트 설정에서 위치 권한을 허용한 뒤 다시 시도해 주세요.';
}
function _geoErrorMessage(err){
  if(err && err.code===1) return '위치 권한이 꺼져 있습니다.\n' + _geoDeniedGuideText();
  if(err && err.code===2) return '휴대폰에서 현재 위치 신호를 찾지 못했습니다.\n' + _geoRuntimeGuideText();
  if(err && err.code===3) return '위치 확인 시간이 초과되었습니다.\n' + _geoRuntimeGuideText();
  return '위치를 가져올 수 없습니다.\n' + _geoRuntimeGuideText();
}
const OAI_LAST_GEO_KEY='oai_catholic_way_last_geo_v1';
function _saveLastGeo(lat,lng){
  try{
    const la=Number(lat), ln=Number(lng);
    if(!isFinite(la)||!isFinite(ln)) return;
    localStorage.setItem(OAI_LAST_GEO_KEY, JSON.stringify({lat:la,lng:ln,t:Date.now()}));
  }catch(_e){}
}
function _readLastGeo(maxAgeMs){
  try{
    const raw=localStorage.getItem(OAI_LAST_GEO_KEY);
    if(!raw) return null;
    const o=JSON.parse(raw);
    const la=Number(o&&o.lat), ln=Number(o&&o.lng), t=Number(o&&o.t||0);
    if(!isFinite(la)||!isFinite(ln)||!t) return null;
    if(maxAgeMs && Date.now()-t>maxAgeMs) return null;
    return {lat:la,lng:ln,t:t};
  }catch(_e){ return null; }
}
function _warmRefreshNearbyLocation(go){
  if(!_GEO) return;
  _requestCurrentPositionStable(function(p){
    try{
      _setMyLoc(p.coords.latitude,p.coords.longitude);
      if(typeof go==='function') go(p.coords.latitude,p.coords.longitude);
    }catch(e){ console.warn('[가톨릭길동무] 위치 배경 갱신 실패', e); }
  }, function(){}, {noRefine:true});
}
function _requestCurrentPositionStable(onSuccess,onError,opts){
  opts = opts || {};
  if(!_GEO){ if(onError) onError({code:0,message:'geolocation unavailable'}); return; }
  const sequence = opts.auto ? [_GO2] : [_GO2,_GO1,_GO3];
  let i=0;
  let firstErr=null;
  let done=false;
  function ok(pos){
    if(done) return;
    done=true;
    try{ if(onSuccess) onSuccess(pos); }catch(e){ console.warn('[가톨릭길동무]', e); }
    if(!opts.noRefine && !opts.auto){
      try{
        const acc = pos && pos.coords && typeof pos.coords.accuracy === 'number' ? pos.coords.accuracy : 0;
        if(acc && acc > 120){
          _GEO.getCurrentPosition(function(p2){
            try{ if(p2 && p2.coords && typeof p2.coords.accuracy === 'number' && p2.coords.accuracy < acc) _setMyLoc(p2.coords.latitude,p2.coords.longitude); }catch(_e){}
          },function(){},_GO1);
        }
      }catch(_e){}
    }
  }
  function fail(err){
    if(done) return;
    if(err && !firstErr) firstErr=err;
    if(i>=sequence.length){
      done=true;
      try{ if(onError) onError(err || firstErr || {code:0,message:'geolocation failed'}); }catch(e){ console.warn('[가톨릭길동무]', e); }
      return;
    }
    const opt=sequence[i++];
    try{ _GEO.getCurrentPosition(ok, fail, opt); }catch(e){ fail(firstErr || {code:0,message:String(e)}); }
  }
  fail(null);
}
function _nearbyGeoActionHtml(state, err){
  const noun=_modeTargetLabel ? _modeTargetLabel() : '장소';
  const denied = state==='denied' || (err && err.code===1);
  const title = denied ? '위치 권한이 꺼져 있습니다' : (err ? '위치를 찾지 못했습니다' : '내 주변 '+noun+'를 보려면 위치 권한이 필요합니다');
  const icon = denied ? '⚠️' : '📍';
  const msg = denied
    ? _geoDeniedGuideText()
    : (err ? _geoErrorMessage(err) : '아래 버튼을 누르면 위치 권한 요청창이 열립니다. 권한창이 뜨면 허용을 선택해 주세요.\n최신 갤럭시/Google Play 설치앱에서는 “정확한 위치 사용”도 켜져 있어야 안정적으로 찾을 수 있습니다.');
  return `<div class="nearby-permission-card" style="padding:28px 20px;text-align:center;">
    <div style="font-size:36px;margin-bottom:12px">${icon}</div>
    <div style="font-size:15px;font-weight:800;color:#0e1535;margin-bottom:8px">${title}</div>
    <div style="font-size:12px;color:#666;line-height:1.75;margin:0 auto 18px;max-width:330px;word-break:keep-all;white-space:pre-line">${msg}</div>
    <div style="display:flex;flex-direction:column;gap:8px;align-items:center">
      <button onclick="_loadNearby({request:true})" style="background:#0e1535;color:#d4aa6a;border:none;border-radius:20px;padding:10px 22px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;min-width:210px;">위치 다시 찾기</button>
      <button onclick="openTab('region',{keyboard:true})" style="background:#fff;color:#0e1535;border:1.5px solid #d8cbb9;border-radius:20px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;min-width:210px;">지역검색으로 찾기</button>
      <button onclick="openTab('list',{keyboard:true})" style="background:#fff;color:#5b5148;border:1.5px solid #e1d7ca;border-radius:20px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;min-width:210px;">목록에서 찾기</button>
    </div>
  </div>`;
}
function _autoLocate(){
  if(!_GEO) return;

  function runAutoLocate(){
    _requestCurrentPositionStable(function(p){
      _setMyLoc(p.coords.latitude,p.coords.longitude);
      if(_activeTab==='nearby'){
        setTimeout(function(){
          try{ _loadNearby({fromAutoLocate:true}); }catch(e){ console.warn('[가톨릭길동무] 자동 위치 목록 갱신 실패', e); }
        }, 60);
      }
      if(_mode==='shrine'){
        if(typeof _centerCategoryMapOnLocation==='function') _centerCategoryMapOnLocation(p.coords.latitude,p.coords.longitude,'auto-current');
        else { _map.setLevel(8); _map.setCenter(new _LL(p.coords.latitude,p.coords.longitude)); }
      } else if(_mode==='parish'){
        if(typeof _centerCategoryMapOnLocation==='function') _centerCategoryMapOnLocation(p.coords.latitude,p.coords.longitude,'auto-current');
        else { _map.setLevel(6); _map.setCenter(new _LL(p.coords.latitude,p.coords.longitude)); }
      } else if(_mode==='retreat'){
        if(typeof _centerCategoryMapOnLocation==='function') _centerCategoryMapOnLocation(p.coords.latitude,p.coords.longitude,'auto-current');
        else { _map.setLevel(9); _map.setCenter(new _LL(p.coords.latitude,p.coords.longitude)); }
      }
    }, function(){}, {noRefine:true});
  }

  _geoPermissionState().then(function(state){
    if(state==='denied') return;
    if(_isInstalledLikeApp() || state==='granted') {
      setTimeout(runAutoLocate, _isInstalledLikeApp() ? 700 : 100);
    }
  }).catch(function(){
    if(_isInstalledLikeApp()) setTimeout(runAutoLocate, 700);
  });
}

function _nearestDioCode(lat,lng){
  if(!_DIO_CFG) return null;
  let best=null,bestD=Infinity;
  Object.entries(_DIO_CFG).forEach(([code,cfg])=>{
    if(code==='ML') return;
    if(!cfg.lat||!cfg.lng) return;
    const d=Math.pow(lat-cfg.lat,2)+Math.pow(lng-cfg.lng,2);
    if(d<bestD){bestD=d;best=code;}
  });
  return best;
}
function _showCurrentParishDioIfIdle(){
  if(_activeTab==='nearby' || (_nearbyCache && _nearbyCache.length)) return;
  if(_mode!=='parish'||!_map||!_myLat||!_myLng||_paSelMkr||_routeMode||_rS||_rE) return;
  if(!_parishSysInited) return;
  const code=_nearestDioCode(_myLat,_myLng);
  if(!code) return;
  if(!_isParishDioceseReady(code)){
    _ensureParishDioceseDataLoaded(code).then(function(){ _showCurrentParishDioIfIdle(); }).catch(function(err){ console.warn('[가톨릭길동무] 현재 위치 교구 로드 실패', err); });
    return;
  }
  try{
    if(_activeDio && _activeDio!==code) _hideParishDioMkrs(_activeDio);
    _ensureParishMarkerZoom();
    _activeDio=code;
    _showParishDioMkrs(code);
    _syncParishDioLabels();
    if(typeof _focusParishPointAround==='function') _focusParishPointAround(_myLat,_myLng,{level:6});
    document.querySelectorAll('.dio-label').forEach(e=>{e.style.transform='';e.style.display='';});
    const clickedEl=_dioOverlays[code]?.getContent?.();
    if(clickedEl){clickedEl.style.display='none';}
  }catch(e){ console.warn("[가톨릭길동무]", e); }
}
function _raiseMyLocationMarker(){
  try{
    if(_myMkr && typeof _myMkr.setZIndex === 'function') _myMkr.setZIndex(260);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _setMyLoc(lat,lng){
  _myLat=lat;_myLng=lng;
  _saveLastGeo(lat,lng);
  if(typeof kakao==='undefined'||!_map) return;
  if(_myMkr) _myMkr.setMap(null);
  const svg=`<svg ${_NS} width='34' height='34' viewBox='0 0 34 34'><circle cx='17' cy='17' r='15' fill='#1a73e8' opacity='.18'/><circle cx='17' cy='17' r='9' fill='#1a73e8' stroke='white' stroke-width='2'/><circle cx='17' cy='17' r='3.8' fill='white'/></svg>`;
  _myMkr=new _MM({
  position:new _LL(lat,lng),
  image:new _MI(_svgUrl(svg),
   new _SZ(34,34),{offset:new _PT(17,17)}),
  zIndex:260
  });
  _myMkr.setMap(_map);
  _raiseMyLocationMarker();
  setTimeout(_showCurrentParishDioIfIdle, 80);
}

function goMyLoc(){
  if(!_GEO) return alert('위치 정보를 지원하지 않습니다.');
  _requestCurrentPositionStable(function(p){
  _setMyLoc(p.coords.latitude,p.coords.longitude);
  _map.setLevel(7);
  if(typeof _setMapCenterByInfoCardStandard==='function') _setMapCenterByInfoCardStandard(new _LL(p.coords.latitude,p.coords.longitude));
  else _map.setCenter(new _LL(p.coords.latitude,p.coords.longitude));
  },function(err){
  alert(_geoErrorMessage(err));
  });
}

function _loadNearby(opts){
  opts = opts || {};
  const req = opts._nearbyReq || _beginNearbyRequest();
  const body=$('nearby-body');
  if(!body) return;

  const isCurrent=()=>_isNearbyRequestCurrent(req);
  const setBody=(html)=>{ if(isCurrent() && body) body.innerHTML=html; };

  if(!_GEO){
    setBody(`<div style="padding:28px 20px;text-align:center;">
      <div style="font-size:36px;margin-bottom:12px">⚠️</div>
      <div style="font-size:15px;font-weight:800;color:#0e1535;margin-bottom:8px">위치 기능을 지원하지 않습니다</div>
      <div style="font-size:12px;color:#666;line-height:1.75;margin-bottom:18px">이 기기 또는 현재 실행 환경에서 위치 기능을 사용할 수 없습니다.<br>지역검색이나 목록에서 찾아 주세요.</div>
      <button onclick="openTab('region',{keyboard:true})" style="background:#0e1535;color:#d4aa6a;border:none;border-radius:20px;padding:10px 22px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;">지역검색으로 찾기</button>
    </div>`);
    return;
  }

  const go=(lat,lng,extra)=>{
    if(!isCurrent()) return;
    extra = extra || {};
    _myLat=lat;_myLng=lng;
    _saveLastGeo(lat,lng);
    const distOpts={token:req, silent:extra.silent===true, keepCurrentList:extra.keepCurrentList===true};
    if(_mode==='shrine') _loadNearbyShrines(lat,lng,distOpts);
    else if(_mode==='retreat') _loadNearbyRetreats(lat,lng,distOpts);
    else _loadNearbyParishes(lat,lng,distOpts);
  };

  if(_myLat && _myLng) { go(_myLat,_myLng); return; }

  if(!opts.request){
    setBody('<div class="empty-msg">📍 현재 위치를 준비하는 중입니다...<br>잠시만 기다려 주세요.</div>');
    _geoPermissionState().then(function(state){
      if(!isCurrent()) return;
      if(_myLat && _myLng){ go(_myLat,_myLng); return; }

      if(state!=='denied'){
        const cached=_readLastGeo(24*60*60*1000);
        if(cached){
          go(cached.lat,cached.lng);
          setTimeout(function(){
            try{
              if(isCurrent()) _warmRefreshNearbyLocation(function(lat,lng){ go(lat,lng,{silent:true,keepCurrentList:true}); });
            }catch(e){ console.warn('[가톨릭길동무] 저장 위치 갱신 실패', e); }
          }, 500);
          return;
        }
      }

      if(state==='granted' || _isInstalledLikeApp()){
        setTimeout(function(){
          try{
            if(!isCurrent()) return;
            if(_myLat && _myLng){ go(_myLat,_myLng); return; }
            _loadNearby({request:true, granted:state==='granted', retryCount:0, fromInitial:true, _nearbyReq:req});
          }catch(e){
            console.warn('[가톨릭길동무] 첫 위치 확인 시작 실패', e);
            setBody(_nearbyGeoActionHtml('unknown'));
          }
        }, _isInstalledLikeApp() ? 900 : 1200);
      }else{
        setBody(_nearbyGeoActionHtml(state));
      }
    }).catch(function(){
      if(!isCurrent()) return;
      if(_isInstalledLikeApp()){
        setTimeout(function(){
          try{
            if(isCurrent()) _loadNearby({request:true, granted:false, retryCount:0, fromInitial:true, _nearbyReq:req});
          }catch(e){ setBody(_nearbyGeoActionHtml('unknown')); }
        }, 900);
      }else{
        setBody(_nearbyGeoActionHtml('unknown'));
      }
    });
    return;
  }

  const retryCount = Number(opts.retryCount || 0);
  setBody(retryCount
    ? '<div class="empty-msg">📍 위치 응답이 늦어 자동으로 다시 확인하는 중입니다...<br>잠시만 기다려 주세요.</div>'
    : '<div class="empty-msg">📍 위치를 확인하는 중...</div>');

  _requestCurrentPositionStable(function(p){
    if(!isCurrent()) return;
    _setMyLoc(p.coords.latitude,p.coords.longitude);
    go(p.coords.latitude,p.coords.longitude);
  },function(err){
    if(!isCurrent()) return;
    if(_myLat && _myLng){
      go(_myLat,_myLng);
      return;
    }
    const cached=_readLastGeo(12*60*60*1000);
    if(cached && retryCount>=1){
      go(cached.lat,cached.lng);
      setTimeout(function(){
        try{
          if(isCurrent()) _warmRefreshNearbyLocation(function(lat,lng){ go(lat,lng,{silent:true,keepCurrentList:true}); });
        }catch(e){ console.warn('[가톨릭길동무] 저장 위치 갱신 실패', e); }
      }, 800);
      return;
    }
    if(err && (err.code===2 || err.code===3) && retryCount<4){
      const delays=[1800,3600,6500,9000];
      const delay=delays[Math.min(retryCount,delays.length-1)];
      setBody('<div class="empty-msg">📍 위치 응답이 늦어 자동으로 다시 확인하는 중입니다...<br>잠시만 기다려 주세요.</div>');
      setTimeout(function(){
        try{
          if(!isCurrent()) return;
          if(_myLat && _myLng){ go(_myLat,_myLng); return; }
          _loadNearby({request:true, granted:opts.granted===true, retryCount:retryCount+1, _nearbyReq:req});
        }catch(e){
          console.warn('[가톨릭길동무] 위치 자동 재시도 실패', e);
          setBody(_nearbyGeoActionHtml(null, err));
        }
      }, delay);
      return;
    }
    setBody(_nearbyGeoActionHtml(null, err));
  });
}

function _loadNearbyWithDist(lat,lng,items,getIdx,getColor,getLabel,opts){
  opts = opts || {};
  const token=opts.token || null;
  const isCurrent=()=>!token || _isNearbyRequestCurrent(token);
  const body=$('nearby-body');
  if(!isCurrent()) return;
  const POOL=items.filter(p=>p.lat&&p.lng);
  const prelim=POOL.map(p=>({p,d:calcDist(lat,lng,p.lat,p.lng)})).sort((a,b)=>a.d-b.d).slice(0,20);

  if(!prelim.length){
    if(body && isCurrent()) body.innerHTML='<div class="empty-msg">표시할 장소가 없습니다.</div>';
    return;
  }

  if(body && isCurrent() && !(opts.silent && opts.keepCurrentList === true)){
    body.innerHTML='<div class="empty-msg nearby-distance-loading">📍 정확한 거리를 계산중입니다.<div class="distance-loading-cross" aria-hidden="true">✝</div></div>';
  }


  const results=new Array(prelim.length).fill(null);
  let done=0;

  prelim.forEach((x,i)=>{
    _navFetch(`${lng},${lat}`,`${x.p.lng},${x.p.lat}`)
    .then(val=>{ if(isCurrent()) results[i]=val||{km:x.d*1.35,dur:null}; })
    .catch(()=>{ if(isCurrent()) results[i]={km:x.d*1.35,dur:null}; })
    .finally(()=>{
      if(!isCurrent()) return;
      done++;
      if(done===prelim.length){
        _renderNearbyDone(prelim,results,getIdx,getColor,getLabel,'final',token,opts);
      }
    });
  });
}
function _renderNearbyDone(prelim,results,getIdx,getColor,getLabel,phase,token,opts){
  opts = opts || {};
  if(token && !_isNearbyRequestCurrent(token)) return;
  const sorted=prelim.map((x,i)=>({x,r:results[i]||{km:x.d*1.35,dur:null}})).sort((a,b)=>a.r.km-b.r.km).slice(0,10);
  _nearbyCache=sorted.map(o=>o.x.p);
  if(phase==='final'&&_mode==='shrine'&&_map) _showAllShrinesOnMapWithNearbyBounds(_nearbyCache,_myLat,_myLng);
  if(phase==='final'&&_mode==='parish'&&_map) _showParishNearbyMarkersOnMap(_nearbyCache,_myLat,_myLng,phase);
  if(phase==='final'&&(_mode==='shrine'||_mode==='parish'||_mode==='retreat')&&_map){
    try{ _applyNearbyOverviewMapView('nearby-final-overview'); }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  const body=$('nearby-body');
  if(!body) return;
  if(token && !_isNearbyRequestCurrent(token)) return;
  if(opts.silent === true && opts.keepCurrentList === true){
    return;
  }
  const scrollTop=body.scrollTop||0;
  body.innerHTML=sorted.map((o,i)=>{
    const idx=getIdx(o.x.p);
    const c=getColor(o.x.p);
    const lbl=getLabel(o.x.p);
    const km=o.r.km.toFixed(1);
    const isEst=(phase==='est');
    const distTxt=isEst?`~${km}km`:`🚗${km}km`;
    const dur=(!isEst&&o.r.dur)?`<span style="font-size:10px;color:#aaa;font-weight:400;margin-left:3px">${_fmtTime(o.r.dur)}</span>`:'';
    return `<div class="nearby-item" onclick="selectItem(${idx},{fromNearby:true})"><div class="nearby-num" style="background:${c}!important">${i+1}</div><div class="nearby-info"><div class="nearby-name">${o.x.p.name}</div><div class="nearby-addr">${o.x.p.addr.substring(0,26)}${o.x.p.addr.length>26?'…':''}</div></div><div class="nearby-meta"><div class="nearby-type" style="background:${c}18!important;color:${c}!important">${lbl}</div><div class="nearby-dist" style="color:${isEst?'#aaa':c}!important">${distTxt}${dur}</div></div></div>`;
  }).join('');
  if(phase==='final') body.scrollTop=scrollTop;
}
function _loadNearbyShrines(lat,lng,opts){
  _loadNearbyWithDist(lat,lng,SHRINES,p=>SHRINES.indexOf(p),p=>TC[p.type]||'#555',p=>p.type,opts);
}
function _loadNearbyParishes(lat,lng,opts){
  opts = opts || {};
  const token=opts.token || null;
  const isCurrent=()=>!token || _isNearbyRequestCurrent(token);
  if(!isCurrent()) return;
  if(!_areAllParishDiocesesReady()){
    const body=$('nearby-body');
    if(body && isCurrent()) body.innerHTML='<div class="empty-msg nearby-distance-loading">📍 위치 확인 완료<br>전체 성당 정보를 불러오는 중입니다...</div>';
    _ensureAllParishDiocesesLoaded().then(function(){
      if(isCurrent()) _loadNearbyParishes(lat,lng,opts);
    }).catch(function(err){
      console.warn('[가톨릭길동무] 전체 성당 데이터 로드 실패', err);
      if(body && isCurrent()) body.innerHTML='<div class="empty-msg">성당 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.</div>';
    });
    return;
  }
  _loadNearbyWithDist(lat,lng,PARISHES,p=>PARISHES.indexOf(p),()=>OAI_CATHEDRAL_CATEGORY_COLOR,()=>'⛪ 성당',opts);
}
function _loadNearbyRetreats(lat,lng,opts){
  _loadNearbyWithDist(lat,lng,RETREATS,p=>RETREATS.indexOf(p),p=>_getRetreatColor(p),()=>'🏔 피정의 집',opts);
}

function renderList(){
  const body=$('list-body');
  if(!body) return;
  const items = _getCurrentItems();
  const q=_listSrch;
  const groups={};
  items.forEach((s,i)=>{
  if(_mode==='shrine' && (!s.lat||!s.lng||s.lat<33||s.lat>38)) return;
  const matchDio = _mode==='parish' ? (_filterDio==='all'||s.diocese===_filterDio) : (q?true:(_filterDio==='all'||s.diocese===_filterDio));
  if(!matchDio) return;
  if(q){
    const nq=q.replace(/\s+/g,'');
    const nameNorm=String(s.name||'').replace(/\s+/g,'');
    const dioNorm=String(s.diocese||'').replace(/\s+/g,'');
    const addrNorm=String(s.addr||'').replace(/\s+/g,'');
    let matchAll=false;
    if(_mode==='parish'){
      matchAll = nameNorm.startsWith(nq) || addrNorm.includes(nq);
    } else {
      const tokens=q.trim().split(/\s+/);
      matchAll=tokens.length>=2
        ?tokens.every(t=>{const nt=t.replace(/\s+/g,'');return nameNorm.includes(nt)||dioNorm.includes(nt)||addrNorm.includes(nt);})
        :nameNorm.includes(nq)||dioNorm.includes(nq)||addrNorm.includes(nq);
    }
    if(!matchAll) return;
  }
  if(!groups[s.diocese]) groups[s.diocese]=[];
  groups[s.diocese].push({s,i});
  });
  if(Object.keys(groups).length===0){
  if(_mode==='parish' && !PARISHES.length) body.innerHTML='<div class="empty-msg">교구를 선택해 주세요.</div>';
  else if(_mode==='parish' && q && _filterDio!=='all') body.innerHTML='<div class="empty-msg">선택한 교구 안에 검색 결과가 없습니다</div>';
  else body.innerHTML='<div class="empty-msg">검색 결과가 없습니다</div>';
  return;
  }
  if(q){
    const nq=q.replace(/\s+/g,'');
    function _score(name){
      const n=name.replace(/\s+/g,'');
      if(n===nq)           return 0;
      if(n.startsWith(nq)) return 1;
      return 3;
    }
    Object.keys(groups).forEach(dio=>{
      groups[dio].sort((a,b)=>_score(a.s.name)-_score(b.s.name));
    });
    const dioOrder=Object.keys(groups).sort((a,b)=>{
      const sa=groups[a].reduce((m,x)=>Math.min(m,_score(x.s.name)),9);
      const sb=groups[b].reduce((m,x)=>Math.min(m,_score(x.s.name)),9);
      return sa-sb;
    });
    body.innerHTML='';
    dioOrder.forEach(dio=>{
      const hd=document.createElement('div');
      _setDioHeading(hd,dio);
      body.appendChild(hd);
      groups[dio].forEach(({s,i})=>{
        const c=_getModeMarkerColor(s);
        const dotColor=(_mode==='retreat')?OAI_RETREAT_LIST_DOT_COLOR:c;
        const d=document.createElement('div');
        d.className='list-item';
        d.innerHTML=`<div class="li-dot" style="background:${dotColor}"></div>
    <div class="li-info"><div class="li-name">${s.name}</div><div class="li-sub">${s.addr.substring(0,28)}${s.addr.length>28?'…':''}</div></div>
    <span class="li-badge" style="background:${c}18!important;color:${c}!important">${_mode==='shrine'?s.type:(_mode==='retreat'?'피정의 집':'성당')}</span>`;
        d.onclick=()=>selectItem(i);
        body.appendChild(d);
      });
    });
    return;
  }

  body.innerHTML='';
  _orderedGroupEntriesForMyDiocese(groups).forEach(([dio,items])=>{
    const hd=document.createElement('div');
    _setDioHeading(hd,dio);
    body.appendChild(hd);
    items.forEach(({s,i})=>{
      const c=_getModeMarkerColor(s);
      const dotColor=(_mode==='retreat')?OAI_RETREAT_LIST_DOT_COLOR:c;
      const d=document.createElement('div');
      d.className='list-item';
      d.innerHTML=`<div class="li-dot" style="background:${dotColor}"></div>
    <div class="li-info"><div class="li-name">${s.name}</div><div class="li-sub">${s.addr.substring(0,28)}${s.addr.length>28?'…':''}</div></div>
    <span class="li-badge" style="background:${c}18!important;color:${c}!important">${_mode==='shrine'?s.type:(_mode==='retreat'?'피정의 집':'성당')}</span>`;
      d.onclick=()=>selectItem(i);
      body.appendChild(d);
    });
  });

}

function onListSearch(v){
  _listSrch=v.trim();
  $('list-srch-x').style.display=v?'block':'none';
  renderList();
  setTimeout(()=>_scrollSheetTop('list'),0);
}
function clearListSearch(){
  _listSrch='';
  $('list-srch-inp').value='';
  $('list-srch-x').style.display='none';
  renderList();
  setTimeout(()=>_scrollSheetTop('list'),0);
}
function setDioFilter(v,btn){
  if(_mode==='parish'){
    const code = v==='all' ? null : (_PARISH_DIO_CODE_MAP[v]||null);
    if(v==='all' && !_areAllParishDiocesesReady()){
      _filterDio=v;
      $$('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn?.classList.add('active');
      _showParishDataLoadingMessage('전체 성당 정보를 불러오는 중입니다...');
      _ensureAllParishDiocesesLoaded().then(function(){ setDioFilter(v,btn); }).catch(function(err){ console.warn('[가톨릭길동무] 전체 성당 데이터 로드 실패', err); });
      return;
    }
    if(code && !_isParishDioceseReady(code)){
      _filterDio=v;
      $$('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn?.classList.add('active');
      _showParishDataLoadingMessage((_DIO[code]||v)+' 성당 정보를 불러오는 중입니다...');
      _ensureParishDioceseDataLoaded(code).then(function(){ setDioFilter(v,btn); }).catch(function(err){ console.warn('[가톨릭길동무] 성당 교구 데이터 로드 실패', err); });
      return;
    }
  }
  _filterDio=v;
  $$('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn?.classList.add('active');
  _listSrch='';
  const inp=$('list-srch-inp');
  if(inp){inp.value='';$('list-srch-x').style.display='none';}
  renderList();
  setTimeout(()=>_scrollSheetTop('list'),0);
  if(v!=='all'&&DIOCESE_CENTER[v]&&_map){
  if(_mode==='parish'){
    const code=_PARISH_DIO_CODE_MAP[v]||null;
    if(code){
      try{
        if(_activeDio && _activeDio!==code) _hideParishDioMkrs(_activeDio);
        _activeDio=code;
        _showParishDioMkrs(code);
        _syncParishDioLabels();
        if(_fitParishDioBounds(code,{reason:'list-filter'})) return;
      }catch(e){ console.warn('[가톨릭길동무]',e); }
    }
  }
  const dc=DIOCESE_CENTER[v];
  _map.setLevel(dc.mob||10);
  if(typeof _setMapCenterByInfoCardStandard==='function') _setMapCenterByInfoCardStandard(new _LL(dc.lat,dc.lng));
  else _map.setCenter(new _LL(dc.lat,dc.lng));
  } else if(v==='all'&&_map){
  _map.setLevel(8);
  if(typeof _setMapCenterByInfoCardStandard==='function') _setMapCenterByInfoCardStandard(new _LL(36.2,127.9));
  else _map.setCenter(new _LL(36.2,127.9));
  }
}

function _regionHtmlEsc(v){
  return String(v == null ? '' : v).replace(/[&<>"]/g, function(ch){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch];
  });
}
function _regionAttrEsc(v){
  return _regionHtmlEsc(v).replace(/'/g, '&#39;');
}

function _regionModeLabel(){
  return _mode==='parish' ? '성당' : (_mode==='retreat' ? '피정의 집' : '성지');
}
function _regionGuideHtml(){
  return '<div class="empty-msg region-guide-empty">🏞 여행지나 숙소 지역을 검색하면<br>근처 ' + _regionModeLabel() + ' 목록이 나타납니다</div>';
}

const DIOCESE_CENTER={
  '서울대교구':{lat:37.53,lng:126.97,mob:10},'인천교구':{lat:37.60,lng:126.55,mob:10},
  '수원교구':{lat:37.20,lng:127.05,mob:10},'의정부교구':{lat:37.85,lng:127.05,mob:10},
  '춘천교구':{lat:37.90,lng:128.00,mob:10},'원주교구':{lat:37.20,lng:128.00,mob:10},
  '대전교구':{lat:36.45,lng:126.80,mob:10},'청주교구':{lat:36.70,lng:127.80,mob:10},
  '대구대교구':{lat:35.90,lng:128.50,mob:10},'안동교구':{lat:36.60,lng:128.50,mob:10},
  '부산교구':{lat:35.50,lng:129.00,mob:10},'마산교구':{lat:35.25,lng:128.30,mob:10},
  '광주대교구':{lat:35.10,lng:126.90,mob:10},'전주교구':{lat:35.75,lng:127.00,mob:10},
  '제주교구':{lat:33.40,lng:126.50,mob:10},
  '군종교구':{lat:37.53,lng:126.97,mob:10},
};

function onRegionInp(v){
  const body=$('region-body');
  if(!v.trim()){
    body.innerHTML=_regionGuideHtml();
  }
}
function doRegionSearch(){
  const inp=$('region-inp');
  const q=(inp.value||'').trim();
  if(!q) return;
  inp.blur();
  const body=$('region-body');
  if(_mode==='parish' && !_areAllParishDiocesesReady()){
    body.innerHTML='<div class="empty-msg">⛪ 전체 성당 정보를 불러오는 중입니다...</div>';
    _ensureAllParishDiocesesLoaded().then(function(){ doRegionSearch(); }).catch(function(err){
      console.warn('[가톨릭길동무] 전체 성당 데이터 로드 실패', err);
      body.innerHTML='<div class="empty-msg">성당 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.</div>';
    });
    return;
  }
  body.innerHTML='<div class="empty-msg">🔍 장소 검색 중...</div>';
  _kakaoKeywordDocs(q, KAKAO_PLACE_SEARCH_DISPLAY_LIMIT)
  .then(docs=>{
    if(!docs.length){ _showRegionFallback(q); return; }
    let html='<div style="padding:8px 14px 4px;font-size:11px;font-weight:700;color:#888;background:#f8f9fc;border-bottom:1px solid #eee;">📍 지역을 선택하세요</div>';
    docs.forEach(d=>{
      const nm=d.place_name||'', ad=d.road_address_name||d.address_name||'';
      const cat=d.category_name||'', url=d.place_url||'';
      html+=`<div class="region-place-cand nearby-item" data-lat="${parseFloat(d.y)}" data-lng="${parseFloat(d.x)}" data-name="${_regionAttrEsc(nm)}" data-addr="${_regionAttrEsc(ad)}" data-cat="${_regionAttrEsc(cat)}" data-url="${_regionAttrEsc(url)}"><div class="sm-place-icon" aria-hidden="true">📍</div><div class="nearby-info"><div class="nearby-name">${_regionHtmlEsc(nm)}</div>${ad?`<div class="nearby-addr">${_regionHtmlEsc(ad)}</div>`:''}</div></div>`;
    });
    body.innerHTML=html;
    body.onclick=function(e){
      const cand=e.target.closest('.region-place-cand');
      if(!cand) return;
      body.onclick=null;
      const clat=parseFloat(cand.dataset.lat),clng=parseFloat(cand.dataset.lng),cname=cand.dataset.name;
      const caddr=cand.dataset.addr||'', ccat=cand.dataset.cat||'', curl=cand.dataset.url||'';
      _regionLat=clat;_regionLng=clng;_regionName=cname;_regionPlaceName=cname;
      _routeRegionStart={lat:clat,lng:clng,name:'📍 '+cname,placeName:cname};
      body.innerHTML='<div class="empty-msg nearby-distance-loading">📍 정확한 거리를 계산중입니다.<div class="distance-loading-cross" aria-hidden="true">✝</div></div>';
      _showRegionResults(cname,clat,clng,{place_name:cname,road_address_name:caddr,address_name:caddr,category_name:ccat,place_url:curl});
      if(_map) _showRegionItemsOnMap([],clat,clng,{center:true});
    };
  }).catch(()=>_showRegionFallback(q));
}

function _showRegionResults(q,lat,lng,doc){
  const items=_getCurrentItems();
  const POOL=items.filter(s=>s.lat&&s.lng);
  const prelim=POOL.map(s=>({s,d:calcDist(lat,lng,s.lat,s.lng)})).sort((a,b)=>a.d-b.d).slice(0,20);
  const placeName=doc.place_name||q;
  const placeAddr=doc.road_address_name||doc.address_name||'';
  const placeCat=doc.category_name?doc.category_name.split(' > ').pop():'';
  const placeUrl=doc.place_url||'';
  const isParish=_mode==='parish',isRetreat=_mode==='retreat';
  _regionLat=lat; _regionLng=lng; _regionName=placeName; _regionPlaceName=placeName;
  _routeRegionStart={lat:lat,lng:lng,name:'📍 '+placeName,placeName:placeName};
  const safePlaceName=_regionHtmlEsc(placeName);
  const safePlaceAddr=_regionHtmlEsc(placeAddr);
  const safePlaceCat=_regionHtmlEsc(placeCat);
  const infoCard=`<div class="region-info-card"><div class="ric-hd"><div class="ric-icon">📍</div><div class="ric-name-wrap"><div class="ric-name">${safePlaceName}</div>${placeAddr?`<div class="ric-addr">${safePlaceAddr}</div>`:''}${placeCat?`<div class="ric-cat">${safePlaceCat}</div>`:''}</div><button type="button" class="ric-map-link" onclick="showRegionPlaceOnMap()">지도 보기</button></div></div>`;
  const listHd=`<div class="region-list-hd">${isParish?'⛪ 근처 성당':(isRetreat?'🏔 근처 피정의 집':'✝ 근처 성지')} <span style="font-size:13px;font-weight:500;color:#aaa">· 자동차 거리순 10곳</span></div>`;
  $('region-body').innerHTML=infoCard+listHd+'<div id="rg-loading" class="region-distance-loading">📍 정확한 거리를 계산중입니다.<div class="distance-loading-cross" aria-hidden="true">✝</div></div><div id="rg-list" style="background:#fff"></div>';
  if(!prelim.length){
    _regionCache=[];
    if(_map) _showRegionItemsOnMap([],lat,lng,{center:true});
    const loadEl=$('rg-loading');
    const rgl=$('rg-list');
    if(loadEl) loadEl.style.display='none';
    if(rgl) rgl.innerHTML='<div class="empty-msg">주변에 표시할 '+_regionModeLabel()+' 정보가 없습니다</div>';
    return;
  }
  const results=new Array(prelim.length).fill(null);let done=0;
  prelim.forEach((x,i)=>{
    _navFetch(`${lng},${lat}`,`${x.s.lng},${x.s.lat}`)
    .then(val=>{results[i]=val||{km:x.d*1.35,dur:null};})
    .catch(()=>{results[i]={km:x.d*1.35,dur:null};})
    .finally(()=>{ done++;
      if(done===prelim.length){
        const sorted=prelim.map((x,i)=>({x,r:results[i]||{km:x.d*1.35,dur:null}})).sort((a,b)=>a.r.km-b.r.km).slice(0,10);
        _regionCache=sorted.map(o=>o.x.s);
        if(_map) _showRegionItemsOnMap(_regionCache,lat,lng,{center:true});
        const rgl=$('rg-list');
        const loadEl=$('rg-loading');
        if(loadEl) loadEl.style.display='none';
        if(rgl) rgl.innerHTML=sorted.map((o,i)=>{
          const idx=items.indexOf(o.x.s);const c=_getModeMarkerColor(o.x.s);const lbl=_getModeTypeLabel(o.x.s);
          const km=o.r.km.toFixed(1);const dur=o.r.dur?`<span style="font-size:10px;color:#aaa;font-weight:400;margin-left:3px">${_fmtTime(o.r.dur)}</span>`:'';
          return `<div class="region-item" onclick="selectItem(${idx},{fromRegion:true})"><div class="nearby-num" style="background:${c}!important;width:28px;height:28px;font-size:12px">${i+1}</div><div class="nearby-info"><div class="nearby-name">${o.x.s.name}</div><div class="nearby-addr">${o.x.s.addr.substring(0,26)}${o.x.s.addr.length>26?'…':''}</div></div><div class="nearby-meta"><div class="nearby-type" style="background:${c}18!important;color:${c}!important">${lbl}</div><div class="nearby-dist" style="color:${c}!important">🚗${km}km${dur}</div></div></div>`;
        }).join('');
      }
    });
  });
}

function _showRegionFallback(q){
  _regionPlaceName=q;
  _routeRegionStart=null;
  try{ _clearRegionMarker(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  const items=_getCurrentItems();
  var _matched_all=items.filter(function(s){return s.addr.includes(q)||s.name.includes(q)||(s.diocese&&s.diocese.includes(q));});
  _matched_all.sort(function(a,b){
    var an=a.name,bn=b.name;
    var ae=an===q,be=bn===q;
    if(ae&&!be) return -1; if(!ae&&be) return 1;
    var as=an.startsWith(q),bs=bn.startsWith(q);
    if(as&&!bs) return -1; if(!as&&bs) return 1;
    return 0;
  });
  const matched=_matched_all.slice(0,10);
  if(!matched.length){
  $('region-body').innerHTML='<div class="empty-msg">검색 결과가 없습니다</div>';
  return;
  }
  _regionCache=matched;
  const items2=_getCurrentItems();
  const list=matched.map((s,i)=>{
  const idx=items2.indexOf(s);
  const c=_getModeMarkerColor(s);
  return `<div class="region-item" onclick="selectItem(${idx},{fromRegion:true})">
   <div class="nearby-num" style="background:${c}!important;width:26px;height:26px;font-size:12px">${i+1}</div>
   <div class="nearby-info"><div class="nearby-name">${s.name}</div><div class="nearby-addr">${s.addr.substring(0,26)}…</div></div>
   <div class="nearby-meta"><div class="nearby-type" style="background:${c}18!important;color:${c}!important">${_mode==='shrine'?s.type:(_mode==='retreat'?'피정의 집':'성당')}</div></div>
  </div>`;
  }).join('');
  $('region-body').innerHTML=
  `<div style="padding:10px 16px 8px;font-size:12px;font-weight:700;color:#1565c0;background:#fff;border-bottom:1px solid #eee">검색결과 ${matched.length}곳</div>${list}`;
}


function _showRouteGuideText(msg){
  const g=$('route-guide');
  if(!g) return;
  if(_polyline || (_rS && _rE)){
    g.classList.remove('on');
    g.textContent='';
    return;
  }
  g.textContent=msg||'';
  g.classList.add('on');
}

function _hideRouteGuide(){
  const g=$('route-guide');
  if(!g) return;
  g.classList.remove('on');
  g.textContent='';
}

function _setImplicitCurrentLocationStartLabelVisible(visible){
  try{
    if(_rS && (_rS.name === '현재 위치' || _rS.name === '현위치')){
      _setRouteLabel('start', visible ? '현위치' : '');
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function _ensureCurrentLocationStart(){
  if(_rS&&_rS.lat&&_rS.lng) return;
  if(_routeRegionStart&&_routeRegionStart.lat&&_routeRegionStart.lng){
    _rS={idx:-1,name:_routeRegionStart.name||'📍 검색지',lat:_routeRegionStart.lat,lng:_routeRegionStart.lng,isRegionStart:true};
    _setRouteLabel('start',_rS.name);
    _refreshRouteTmpMarkers();
    _updateSearchBtn();
    return;
  }
  if(_myLat&&_myLng){
    _rS={idx:-1,name:'현재 위치',lat:_myLat,lng:_myLng,isImplicitCurrentLocation:true};
    _setRouteLabel('start','');
    _refreshRouteTmpMarkers();
    _updateSearchBtn();
    return;
  }
  if(!_GEO) return;
  _geoPermissionState().then(function(state){
    if(state!=='granted' || (_rS&&_rS.lat&&_rS.lng)) return;
    _requestCurrentPositionStable(function(p){
      _setMyLoc(p.coords.latitude,p.coords.longitude);
      if(!_rS){
        _rS={idx:-1,name:'현재 위치',lat:p.coords.latitude,lng:p.coords.longitude,isImplicitCurrentLocation:true};
        _setRouteLabel('start','');
        _refreshRouteTmpMarkers();
        _updateSearchBtn();
        if(!_rE){
          _showRouteGuideText(`도착 ${_getRouteGuideTarget()}를 탭하세요`);
        }
      }
    },function(){},{noRefine:true});
  }).catch(function(e){ console.warn('[가톨릭길동무] 길찾기 위치 권한 상태 확인 실패', e); });
}

function _enterRouteMode(){
  _routeMode=true;
  const rs=$('sheet-route');
  if(rs){ rs.style.display=''; rs.classList.add('open'); }
  _ensureCurrentLocationStart();
  _syncRouteWaypointBox();
  _restoreMarkersWhenRouteNotDisplayed();
  _showRouteGuideText(_rS?`도착 ${_getRouteGuideTarget()}를 탭하세요`:`출발지를 탭하거나 지도에서 ${_getRouteGuideTarget()}를 선택하세요`);
  setTimeout(function(){ try{ _applyRouteCurrentLocationViewport('route-enter'); }catch(e){ console.warn('[가톨릭길동무]', e); } }, 80);
  setTimeout(function(){ try{ _applyRouteCurrentLocationViewport('route-enter-settle'); }catch(e){ console.warn('[가톨릭길동무]', e); } }, 260);
}

function _exitRouteMode(){
  _routeMode=false;
  _hideRouteGuide();
}

function setMyLocAsStart(){
  _routeRegionStart=null;
  if(!_GEO) return alert('위치 정보를 지원하지 않습니다.');
  _requestCurrentPositionStable(function(p){
  _setMyLoc(p.coords.latitude,p.coords.longitude);
  _clearRouteTmpMarkers();
  if(_mode==='shrine'&&_rS&&_rS.idx>=0&&_markers[_rS.idx]) _markers[_rS.idx].marker.setImage(_mkrImg(_typeColor(_markers[_rS.idx].shrine.type),false));
  _rS={idx:-1,name:'현재 위치',lat:p.coords.latitude,lng:p.coords.longitude,isImplicitCurrentLocation:false};
  _setRouteLabel('start','현위치');
  _refreshRouteTmpMarkers();
  if(_rE) _updateSearchBtn();
  else {
   _showRouteGuideText(`도착 ${_getRouteGuideTarget()}를 탭하세요`);
   setTimeout(function(){ try{ _applyRouteCurrentLocationViewport('route-myloc'); }catch(e){ console.warn('[가톨릭길동무]', e); } }, 80);
  }
  },function(err){ alert(_geoErrorMessage(err)); });
}

function _setRouteLabel(role,name){
  const el=$(`rs-${role}-lbl`);
  if(!el) return;
  const rawName = name || '';
  const emptyText = role==='start' ? '출발지를 선택하세요' : (_isRouteWaypointRole(role) ? ('경유지'+_routeWaypointIndex(role)+'을 선택하세요') : '도착지를 선택하세요');
  el.textContent = rawName || emptyText;
  el.className='rs-lbl'+(rawName?' filled':' empty');
  if(role==='start' && $('rs-start-x')) $('rs-start-x').style.display=rawName?'inline-flex':'none';
  if(role==='end' && $('rs-end-x')) $('rs-end-x').style.display=rawName?'inline-flex':'none';
  if(role==='waypoint' && $('rs-waypoint-x')) $('rs-waypoint-x').style.display=(_routeWaypointEnabled || rawName)?'inline-flex':'none';
  if(role==='waypoint2' && $('rs-waypoint2-x')) $('rs-waypoint2-x').style.display=(_routeWaypoint2Enabled || rawName)?'inline-flex':'none';
  if(role==='waypoint3' && $('rs-waypoint3-x')) $('rs-waypoint3-x').style.display=(_routeWaypoint3Enabled || rawName)?'inline-flex':'none';
  if(_isRouteWaypointRole(role)) _setRouteWaypointEnabledByRole(role, !!(_getRouteWaypointEnabledByRole(role) || rawName));
  _updateSearchBtn();
}

function _routeShouldReserveSearchButtonSpace(){
  try{
    const resultShowing = _isRouteResultShowing();
    if(resultShowing) return false;
    return !!(
      (_rS && _rS.lat && _rS.lng) ||
      (_rE && _rE.lat && _rE.lng) ||
      (_routeWaypointEnabled || _routeWaypoint2Enabled || _routeWaypoint3Enabled) ||
      (_rW && _rW.lat && _rW.lng) ||
      (_rW2 && _rW2.lat && _rW2.lng) ||
      (_rW3 && _rW3.lat && _rW3.lng)
    );
  }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
}

function _setRouteSearchButtonState(btn, mode){
  if(!btn) return;
  if(mode === 'visible'){
    btn.style.display='flex';
    btn.style.visibility='visible';
    btn.style.pointerEvents='auto';
    btn.disabled=false;
    btn.removeAttribute('aria-hidden');
    btn.classList.remove('rs-search-placeholder');
  }else if(mode === 'placeholder'){
    btn.style.display='flex';
    btn.style.visibility='hidden';
    btn.style.pointerEvents='none';
    btn.disabled=true;
    btn.setAttribute('aria-hidden','true');
    btn.classList.add('rs-search-placeholder');
  }else{
    btn.style.display='none';
    btn.style.visibility='';
    btn.style.pointerEvents='';
    btn.disabled=false;
    btn.removeAttribute('aria-hidden');
    btn.classList.remove('rs-search-placeholder');
  }
}

function _updateSearchBtn(){
  const btn=$('rs-search-btn');
  if(!btn) return;
  const filled=!!(_rS&&_rS.lat&&_rS.lng&&_rE&&_rE.lat&&_rE.lng);
  if(filled) _setRouteSearchButtonState(btn,'visible');
  else if(_routeShouldReserveSearchButtonSpace()) _setRouteSearchButtonState(btn,'placeholder');
  else _setRouteSearchButtonState(btn,'hidden');
}

function doSearchRoute(){ document.activeElement&&document.activeElement.blur();
  _routeWaypointSummaryExpanded=false;
  _syncRouteWaypointBox();
  const keepRegionRouteStart = !!(_rS && _rS.isRegionStart && _routeRegionStart && _routeRegionStart.lat && _routeRegionStart.lng);
  if(!keepRegionRouteStart) _routeRegionStart=null;
  _curFromRegion=false;
  if(_rS && (_rS.name === '현재 위치' || _rS.name === '현위치')) _setImplicitCurrentLocationStartLabelVisible(true);
  if(_rS&&_rE) setTimeout(function(){ try{ _calcRoute(); }catch(e){ console.warn('[가톨릭길동무]', e); } }, OAI_ROUTE_VISUAL_DELAY_MS);
}

function _swapRouteAdjacentPair(a,b){
  if(!a || !b) return;
  _clearRouteTmpMarkers();
  _swapRouteObjects(a,b);
  if(_rS && _rS.isImplicitCurrentLocation) _rS.isImplicitCurrentLocation=false;
  _updateSearchBtn();
}
function swapRoute(){
  // 첫 번째 화살표: 바로 위/아래 항목만 교환한다.
  _swapRouteAdjacentPair('start', (_routeWaypointEnabled || _routePointReady(_rW)) ? 'waypoint' : 'end');
}
function swapRouteWaypointEnd(){
  // 경유지1 아래 화살표: 경유지2가 있으면 경유지1↔경유지2, 없으면 경유지1↔도착지.
  _swapRouteAdjacentPair('waypoint', (_routeWaypoint2Enabled || _routePointReady(_rW2)) ? 'waypoint2' : 'end');
}
function swapRouteWaypoint2End(){
  // 경유지2 아래 화살표: 경유지3이 있으면 경유지2↔경유지3, 없으면 경유지2↔도착지.
  _swapRouteAdjacentPair('waypoint2', (_routeWaypoint3Enabled || _routePointReady(_rW3)) ? 'waypoint3' : 'end');
}
function swapRouteWaypoint3End(){ _swapRouteAdjacentPair('waypoint3','end'); }

function clearRoute(role){
  if(role==='start' && _rS){ _restoreRoutePointMarker(_rS); if(_rS.isRegionStart) _routeRegionStart=null; _rS=null; _setRouteLabel('start',''); }
  else if(role==='end' && _rE){ _restoreRoutePointMarker(_rE); _rE=null; _setRouteLabel('end',''); }
  else if(role==='waypoint' || role==='waypoint2' || role==='waypoint3'){
    if(role==='waypoint'){
      _restoreRoutePointMarker(_rW); _rW=_rW2||null; _rW2=_rW3||null; _rW3=null;
      _routeWaypointEnabled=!!_rW; _routeWaypoint2Enabled=!!_rW2; _routeWaypoint3Enabled=false;
    }else if(role==='waypoint2'){
      _restoreRoutePointMarker(_rW2); _rW2=_rW3||null; _rW3=null; _routeWaypoint2Enabled=!!_rW2; _routeWaypoint3Enabled=false;
    }else{
      _restoreRoutePointMarker(_rW3); _rW3=null; _routeWaypoint3Enabled=false;
    }
    _syncRoutePointLabels();
  }else return;
  _clearVisibleRouteResultOnly();
  _clearRouteTmpMarkers();
  _restoreMarkersWhenRouteNotDisplayed();
  _repaintRoutePointMarkers();
  _refreshRouteTmpMarkers();
  if(_rS && !_rE) _showRouteGuideText(`도착 ${_getRouteGuideTarget()}를 탭하세요`);
  else if(!_rS && _rE) _showRouteGuideText(`출발 ${_getRouteGuideTarget()}를 탭하세요`);
  else if(!_rS && !_rE) _showRouteGuideText(`출발지를 탭하거나 지도에서 ${_getRouteGuideTarget()}를 선택하세요`);
  _updateSearchBtn();
}

function _restoreRegionRouteStartAfterReset(regionStart){
  if(!regionStart || !regionStart.lat || !regionStart.lng) return false;
  try{
    _routeRegionStart=Object.assign({}, regionStart);
    _regionLat=regionStart.lat;
    _regionLng=regionStart.lng;
    _regionPlaceName=regionStart.placeName || regionStart.name || _regionPlaceName;
    _regionName=regionStart.placeName || regionStart.name || _regionName;
    _rS={idx:-1,name:regionStart.name || ('📍 ' + (_regionPlaceName || _regionName || '검색지')),lat:regionStart.lat,lng:regionStart.lng,isRegionStart:true};
    _setRouteLabel('start',_rS.name);
    if(_regionCache && _regionCache.length) _showRegionItemsOnMap(_regionCache, regionStart.lat, regionStart.lng, {center:false});
    else _showRegionMarker(regionStart.lat, regionStart.lng, _regionPlaceName || _regionName || '검색 위치');
    return true;
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  return false;
}

function resetRoute(opts){
  opts = opts || {};
  const fromButton = !!opts.fromButton;
  const fresh = !!opts.fresh;
  if(fresh) _routeRegionStart=null;
  const destItem = (!fresh && _rE) ? {lat:_rE.lat, lng:_rE.lng, idx:_rE.idx} : null;
  const regionStart = (!fresh && _routeRegionStart && _routeRegionStart.lat) ? Object.assign({}, _routeRegionStart) : null;

  if(_mode==='shrine'){
    [_rS,_rW,_rW2,_rW3,_rE].forEach(function(p){ if(p&&p.idx>=0&&_markers[p.idx]) _markers[p.idx].marker.setImage(_mkrImg(_typeColor(_markers[p.idx].shrine.type),false)); });
  }
  _rS=_rW=_rW2=_rW3=_rE=null;
  _routeWaypointSummaryExpanded=false;
  _routeWaypointEnabled=_routeWaypoint2Enabled=_routeWaypoint3Enabled=false;
  _setRouteLabel('start','');_setRouteLabel('waypoint','');_setRouteLabel('waypoint2','');_setRouteLabel('waypoint3','');_setRouteLabel('end','');
  _syncRouteWaypointBox();
  _hide($('rs-result'));
  const sBtn=$('rs-search-btn');
  if(sBtn) _setRouteSearchButtonState(sBtn,'hidden');
  if(_polyline){_polyline.setMap(null);_polyline=null;}
  _clearRouteTmpMarkers();
  _showJukrimgulParkingMkr(false);
  _hideRouteGuide();
  _restoreMarkersWhenRouteNotDisplayed();

  if(fromButton){
    if(_activeTab!=='route') openTab('route');
    const rs=$('sheet-route');
    if(rs){ rs.style.display=''; rs.classList.add('open'); }
    closeInfoCard();
    const restoredRegionStart = regionStart ? _restoreRegionRouteStartAfterReset(regionStart) : false;
    if(!restoredRegionStart) _ensureCurrentLocationStart();
    try{
      if(_mode==='shrine') _clearShrineMarkerSel();
      if(_paSelMkr){ try{ _paSelMkr.setMap(null); }catch(_e){} _paSelMkr=null; }
      if(_polyline){ try{ _polyline.setMap(null); }catch(_e){} _polyline=null; }
      _restoreMarkersWhenRouteNotDisplayed();
    }catch(e){ console.warn("[가톨릭길동무]", e); }
    return;
  }

  if(destItem && destItem.lat && _map){
    try{
      const _items=_getCurrentItems();
      const _idx=(typeof destItem.idx==='number' && destItem.idx>=0) ? destItem.idx : _items.findIndex(p=>Number(p.lat)===Number(destItem.lat) && Number(p.lng)===Number(destItem.lng));
      const _item=_idx>=0 ? _items[_idx] : null;
      if(_item){
        if(_mode==='shrine') _selectShrineMarker(_idx);
        else if(_mode==='parish') _selectParishMarker(_item);
        else _selectRetreatMarker(_item);
        _showInfoCard(_item, _idx);
        _focusMarkerAboveInfoCard(_item);
      }
    }catch(e){ console.warn("[가톨릭길동무]", e); }
  }
}

function _isRouteImplicitCurrentStartHidden(){
  try{
    if(!_rS || !_rS.isImplicitCurrentLocation) return false;
    const lbl=$('rs-start-lbl');
    if(!lbl) return true;
    return lbl.classList.contains('empty') || !String(lbl.textContent||'').trim() || String(lbl.textContent||'').indexOf('선택하세요')>=0;
  }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
}


function _routePointMatchesIndex(point, idx){
  try{
    return !!(point && typeof point.idx==='number' && point.idx>=0 && point.idx===idx);
  }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
}

function _hideRouteCancelConfirm(){
  try{
    const el=document.getElementById('route-cancel-confirm');
    if(el) el.classList.remove('open');
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function _ensureRouteCancelConfirm(){
  let modal=document.getElementById('route-cancel-confirm');
  if(modal) return modal;
  modal=document.createElement('div');
  modal.id='route-cancel-confirm';
  modal.className='route-cancel-confirm';
  modal.innerHTML=`<div class="route-cancel-confirm-panel" role="dialog" aria-modal="true" aria-label="길찾기 선택 취소 확인">
    <div class="rcc-title" id="rcc-title">선택을 취소하시겠습니까?</div>
    <div class="rcc-desc" id="rcc-desc">실수로 누르셨다면 유지를 누르세요.</div>
    <div class="rcc-actions">
      <button type="button" class="rcc-btn rcc-keep" data-role="keep">유지</button>
      <button type="button" class="rcc-btn rcc-cancel-point" data-role="cancel-point">선택 취소</button>
    </div>
  </div>`;
  modal.addEventListener('click',function(e){
    if(e.target===modal || (e.target && e.target.dataset && e.target.dataset.role==='keep')){
      _hideRouteCancelConfirm();
      return;
    }
    const btn=e.target && e.target.closest ? e.target.closest('[data-role="cancel-point"]') : null;
    if(!btn) return;
    const role=modal.dataset.cancelRole;
    _hideRouteCancelConfirm();
    _cancelRoutePoint(role);
  });
  document.body.appendChild(modal);
  return modal;
}

function _showRouteCancelConfirm(role){
  if(role!=='start' && role!=='end' && !_isRouteWaypointRole(role)) return false;
  const modal=_ensureRouteCancelConfirm();
  modal.dataset.cancelRole=role;
  const title=document.getElementById('rcc-title');
  const desc=document.getElementById('rcc-desc');
  const cancelBtn=modal.querySelector('[data-role="cancel-point"]');
  if(title) title.textContent=_routePointCancelTitle(role);
  if(desc) desc.textContent='실수로 누르셨다면 유지를 누르세요.';
  if(cancelBtn) cancelBtn.textContent=_routePointCancelButtonText(role);
  modal.classList.add('open');
  return true;
}

function _restoreRoutePointMarker(point){
  if(!point || typeof point.idx!=='number' || point.idx<0) return;
  try{
    if(_mode==='shrine' && _markers && _markers[point.idx] && _markers[point.idx].marker){
      const item=_markers[point.idx].shrine;
      _markers[point.idx].marker.setImage(_mkrImg(_typeColor(item.type),false));
      _markers[point.idx].marker.setZIndex(1);
    }else if(_mode==='retreat' && _retreatMarkers){
      const r=_retreatMarkers.find(function(o){ return o && o.index===point.idx; });
      if(r && r.marker){
        r.marker.setImage(_mkrImgRetreat('#2e7d32',false));
        r.marker.setZIndex(45);
      }
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function _reapplyShrineRouteMarkerImages(){
  try{
    if(_mode!=='shrine') return;
    if(_rS && typeof _rS.idx==='number' && _rS.idx>=0 && _markers && _markers[_rS.idx] && _markers[_rS.idx].marker){ _markers[_rS.idx].marker.setImage(_mkrImgRoute('#ff0000','출')); _setRouteMarkerZ(_rS.idx,'start'); }
    [['waypoint',_rW],['waypoint2',_rW2],['waypoint3',_rW3]].forEach(function(pair){ const role=pair[0], p=pair[1]; if(p&&typeof p.idx==='number'&&p.idx>=0&&_markers&&_markers[p.idx]&&_markers[p.idx].marker){ _markers[p.idx].marker.setImage(_mkrImgRoute(_routeWaypointColor(role),_routeWaypointMarkerText(role))); _setRouteMarkerZ(p.idx,role); } });
    if(_rE && typeof _rE.idx==='number' && _rE.idx>=0 && _markers && _markers[_rE.idx] && _markers[_rE.idx].marker){ const item=_markers[_rE.idx].shrine; _markers[_rE.idx].marker.setImage(_mkrImgRoute(item ? _typeColor(item.type) : '#005BFF','도')); _setRouteMarkerZ(_rE.idx,'end'); }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function _clearVisibleRouteResultOnly(){
  try{
    _routeWaypointSummaryExpanded=false;
    const result=$('rs-result');
    if(result) result.style.display='none';
      const note=$('rs-note');
    if(note){ note.textContent=''; note.style.display='none'; }
    if(_polyline){ _polyline.setMap(null); _polyline=null; }
    _showJukrimgulParkingMkr(false);
    _scheduleRouteSelectionMarkerRestore();
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function _cancelRoutePoint(role){
  if(role!=='start' && role!=='end' && !_isRouteWaypointRole(role)) return;
  try{ clearRoute(role); }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function _selectRouteItem(idx){
  const items=_getCurrentItems();
  const s=items[idx];
  if(!s) return;
  if(_routeMode){
    if(_routePointMatchesItem(_rS,s,idx)){ _showRouteCancelConfirm('start'); return; }
    if(_routePointMatchesItem(_rW,s,idx)){ _showRouteCancelConfirm('waypoint'); return; }
    if(_routePointMatchesItem(_rW2,s,idx)){ _showRouteCancelConfirm('waypoint2'); return; }
    if(_routePointMatchesItem(_rW3,s,idx)){ _showRouteCancelConfirm('waypoint3'); return; }
    if(_routePointMatchesItem(_rE,s,idx)){ _showRouteCancelConfirm('end'); return; }
  }
  const pendingWp=_pendingRouteWaypointRole();
  if(pendingWp && _rS && _rS.lat && _rS.lng){ _setRoutePointFromItem(pendingWp,s,idx); return; }
  const hasStart=!!(_rS && _rS.lat && _rS.lng && !_isRouteImplicitCurrentStartHidden());
  if(!hasStart){ _setRoutePointFromItem('start',s,idx); return; }
  if(pendingWp){ _setRoutePointFromItem(pendingWp,s,idx); return; }
  if(!(_rE&&_rE.lat&&_rE.lng)){ _setRoutePointFromItem('end',s,idx); return; }
  _showRouteGuideText('+ 경유지를 누른 뒤 지도에서 경유지를 선택하세요. 도착지를 바꾸려면 도착지 ×를 눌러주세요.');
}

function _hideParishMarkersForRouteDisplay(){
  if(_mode!=='parish') return;
  try{ _clearParishNearbyMarkers(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{ _hideDioOverlays(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{
    Object.keys(_dioMkrs||{}).forEach(function(code){
      (_dioMkrs[code]||[]).forEach(function(mk){
        try{ mk.setMap(null); }catch(e){ console.warn('[가톨릭길동무]', e); }
      });
    });
    if(_parishIdleListener){
      try{ kakao.maps.event.removeListener(_parishIdleListener); }catch(e){ console.warn('[가톨릭길동무]', e); }
      _parishIdleListener=null;
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{ if(_paSelMkr) _paSelMkr.setMap(null); }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function _hideRetreatMarkersForRouteDisplay(){
  if(_mode!=='retreat') return;
  try{
    (_retreatMarkers||[]).forEach(function(o){
      if(!o || !o.marker) return;
      o.marker.setMap(null);
    });
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function _hideCategoryMarkersForRouteDisplay(){
  if(_mode==='parish') _hideParishMarkersForRouteDisplay();
  else if(_mode==='retreat') _hideRetreatMarkersForRouteDisplay();
}

async function _calcRoute(){
  if(!_rS||!_rE) return;
  _routeWaypointSummaryExpanded=false;
  _hideRouteGuide();
  $('rs-km').textContent='…';
  $('rs-time').textContent='…';
  $('rs-result').style.display='block';
  _syncRouteWaypointBox();
  const sBtn=$('rs-search-btn');
  if(sBtn) _setRouteSearchButtonState(sBtn,'hidden');
  if(_polyline){_polyline.setMap(null);_polyline=null;}
  const isJuk = _mode==='shrine' && _rE.idx === JUKRIMGUL_IDX && JUKRIMGUL_IDX >= 0;
  const navDest = isJuk ? JUKRIMGUL_PARKING : _rE;
  _showJukrimgulParkingMkr(isJuk);
  const note=$('rs-note');
  function setRouteNote(txt, html){
    if(!note) return;
    if(html) note.innerHTML=txt; else note.textContent=txt;
    note.style.display=txt?'block':'none';
  }
  if(isJuk){
    setRouteNote('⚠️ <b>죽림굴주차장</b>까지 경로 안내 · 자동차가 올라가지 못하는 구간이므로 주차장에서 도보로 이동하세요.', true);
  } else {
    setRouteNote('', false);
  }

  const waypoints = _getRouteWaypoints();
  _drawLine(_rS, navDest, null, {fit:false, waypoints:waypoints});

  async function fetchLeg(a,b){
    const res=await _kakaoDirectionsFetch(`${a.lng},${a.lat}`, `${b.lng},${b.lat}`);
    if(!res.ok) throw new Error(res.status);
    const data=await res.json();
    const route=data.routes?.[0];
    if(!route||route.result_code!==0) throw new Error('no route');
    const path=[];
    for(const sec of route.sections||[])
      for(const road of sec.roads||[]){
        const vx=road.vertexes;
        for(let i=0;i<vx.length-1;i+=2) path.push(new _LL(vx[i+1],vx[i]));
      }
    return { distance:route.summary.distance, duration:route.summary.duration, path:path };
  }

  try{
    const routePoints=[_rS].concat(waypoints,[navDest]);
    if(waypoints.length){
      let distance=0, duration=0, path=[];
      for(let i=0;i<routePoints.length-1;i++){
        const leg=await fetchLeg(routePoints[i], routePoints[i+1]);
        distance+=(leg.distance||0);
        duration+=(leg.duration||0);
        path=path.concat(leg.path||[]);
      }
      $('rs-km').textContent=(distance/1000).toFixed(1);
      $('rs-time').textContent=_fmtTime(duration);
      _drawLine(_rS, navDest, path.length>1?path:null, {waypoints:waypoints});
      return;
    }
    const leg=await fetchLeg(_rS, navDest);
    $('rs-km').textContent=(leg.distance/1000).toFixed(1);
    $('rs-time').textContent=_fmtTime(leg.duration);
    _drawLine(_rS, navDest, leg.path.length>1?leg.path:null);
    if(!isJuk) setRouteNote('', false);
  } catch(e){
    const routePoints=[_rS].concat(waypoints,[navDest]);
    let d=0;
    for(let i=0;i<routePoints.length-1;i++){
      d += calcDist(routePoints[i].lat,routePoints[i].lng,routePoints[i+1].lat,routePoints[i+1].lng);
    }
    d *= 1.4;
    $('rs-km').textContent=d.toFixed(1);
    $('rs-time').textContent=_fmtTime(d/70*3600);
    _drawLine(_rS, navDest, null, {fit:true, waypoints:waypoints});
  }
}

function _drawLine(s1,s2,path,opts){
  opts = opts || {};
  const waypoints = Array.isArray(opts.waypoints)
    ? opts.waypoints.filter(p=>p&&p.lat&&p.lng)
    : (opts.via && opts.via.lat && opts.via.lng ? [opts.via] : []);
  _hideRouteGuide();
  if(_polyline) _polyline.setMap(null);
  _clearRouteTmpMarkers();
  const pts=path||([new _LL(s1.lat,s1.lng)].concat(waypoints.map(p=>new _LL(p.lat,p.lng)),[new _LL(s2.lat,s2.lng)]));
  _polyline=new _PL({path:pts,
  strokeWeight:path?6:3,strokeColor:path?'#1a73e8':'#b8965a',
  strokeOpacity:path?0.88:0.7,strokeStyle:path?'solid':'dashed'});
  _polyline.setMap(_map);
  _syncRouteWaypointBox();
  _refreshRouteTmpMarkers();
  _hideCategoryMarkersForRouteDisplay();

  if(path){
  _markers.forEach((m,i)=>{
   if(!m) return;
   const isRoute=(_rS&&_rS.idx===i)||(_rW&&_rW.idx===i)||(_rW2&&_rW2.idx===i)||(_rW3&&_rW3.idx===i)||(_rE&&_rE.idx===i);
   m.marker.setMap(isRoute?_map:null);
  });
  if(_mode==='parish'){
    _hideDioOverlays();
    if(_activeDio) _hideParishDioMkrs(_activeDio);
  } else if(_mode==='retreat'){
    _retreatMarkers.forEach(o=>{
      const isRoute=(_rS&&_rS.idx===o.index)||(_rW&&_rW.idx===o.index)||(_rW2&&_rW2.idx===o.index)||(_rW3&&_rW3.idx===o.index)||(_rE&&_rE.idx===o.index);
      o.marker.setMap(isRoute?_map:null);
    });
  }
  }

  const bounds=new _LB();
  pts.forEach(p=>bounds.extend(p));
  if(s1 && s1.lat && s1.lng) bounds.extend(new _LL(s1.lat,s1.lng));
  waypoints.forEach(function(wp){ bounds.extend(new _LL(wp.lat,wp.lng)); });
  if(s2 && s2.lat && s2.lng) bounds.extend(new _LL(s2.lat,s2.lng));
  if(_startTmpMkr) bounds.extend(new _LL(s1.lat,s1.lng));
  if(_wayTmpMkr && _rW) bounds.extend(new _LL(_rW.lat,_rW.lng));
  if(_way2TmpMkr && _rW2) bounds.extend(new _LL(_rW2.lat,_rW2.lng));
  if(_way3TmpMkr && _rW3) bounds.extend(new _LL(_rW3.lat,_rW3.lng));
  if(_endTmpMkr) bounds.extend(new _LL(s2.lat,s2.lng));
  if(opts.fit !== false){
    if(typeof _fitRouteBounds==='function') _fitRouteBounds(bounds, {repeat:false});
    else { try{_map.setBounds(bounds,80,52,190,52);}catch(e){ console.warn("[가톨릭길동무]", e); } }
  }
}

function _showJukrimgulParkingMkr(show){
  if(_jukrimgulParkMkr){ _jukrimgulParkMkr.setMap(null); _jukrimgulParkMkr=null; }
  if(!show||!_map) return;
  const svg=`<svg ${_NS} width="34" height="44" viewBox="0 0 34 44">
  <ellipse cx="17" cy="42" rx="6" ry="2.5" fill="rgba(0,0,0,.2)"/>
  <path d="M17 0C9.3 0 3 6.3 3 14c0 9.5 14 28 14 28S31 23.5 31 14C31 6.3 24.7 0 17 0z" fill="#7b2fbe"/>
  <circle cx="17" cy="14" r="9" fill="white" opacity=".9"/>
  <text x="17" y="19" text-anchor="middle" font-size="12" font-weight="900" fill="#7b2fbe" font-family="sans-serif">P</text>
  </svg>`;
  _jukrimgulParkMkr = new _MM({
  position: new _LL(JUKRIMGUL_PARKING.lat, JUKRIMGUL_PARKING.lng),
  image: new kakao.maps.MarkerImage(
   'data:image/svg+xml;charset=utf-8,'+_EC(svg),
   new _SZ(34,44),{offset:new _PT(17,44)}
  ),
  title:'죽림굴주차장', zIndex:15
  });
  _jukrimgulParkMkr.setMap(_map);
  if(JUKRIMGUL_IDX>=0 && _markers[JUKRIMGUL_IDX])
  _markers[JUKRIMGUL_IDX].marker.setMap(_map);
}

function _kakaoLaunch(w,a){
 try{ markExternalReturnStabilize('kakao-route'); }catch(e){ console.warn("[가톨릭길동무]", e); }
 if(_isMob){
  _kakaoLaunching=true;
  setTimeout(()=>{_kakaoLaunching=false;},3000);
  const f=document.createElement('iframe');
  f.style.cssText='display:none;width:0;height:0;border:0;position:fixed;';
  document.body.appendChild(f);f.src=a;
  const t=setTimeout(()=>{_kakaoLaunching=false;if(typeof oaiSmoothNavigate==='function') oaiSmoothNavigate(w,'kakao-route'); else location.href=w;},1500);
  window.addEventListener('blur',()=>clearTimeout(t),{once:true});
  setTimeout(()=>{if(document.body.contains(f))document.body.removeChild(f);},2000);
 } else { if(typeof oaiSmoothNavigate==='function') oaiSmoothNavigate(w,'kakao-route'); else location.href=w; }
}
function _routeLinkPointName(point, fallback){
  return _EC((point && (point.kw || point.name)) || fallback || '장소');
}

function _buildKakaoRouteWebLink(start, waypoints, end){
  const points=[start].concat(waypoints || [], [end]).filter(p=>p&&p.lat&&p.lng);
  if(points.length<2) return '';
  if(points.length>2){
    return 'https://map.kakao.com/link/by/car/' + points.map(function(p,i){
      return `${_routeLinkPointName(p, i===0?'출발지':(i===points.length-1?'도착지':'경유지'))},${p.lat},${p.lng}`;
    }).join('/');
  }
  const sp=_routeLinkPointName(start,'출발지');
  const ep=_routeLinkPointName(end,'도착지');
  return `https://map.kakao.com/link/from/${sp},${start.lat},${start.lng}/to/${ep},${end.lat},${end.lng}`;
}

function _launchKakaoRouteWebOnly(w){
  try{ markExternalReturnStabilize('kakao-route'); }catch(e){ console.warn('[가톨릭길동무]', e); }
  if(typeof oaiSmoothNavigate==='function') oaiSmoothNavigate(w,'kakao-route');
  else location.href=w;
}

function doKakaoRoute(){
  if(!_rS||!_rE) return;
  const isJuk = _rE.idx === JUKRIMGUL_IDX && JUKRIMGUL_IDX >= 0;
  const finalDest = isJuk ? JUKRIMGUL_PARKING : _rE;
  const waypoints = _getRouteWaypoints();
  const w=_buildKakaoRouteWebLink(_rS, waypoints, finalDest);
  if(!w) return;

  if(waypoints.length){
    _launchKakaoRouteWebOnly(w);
    return;
  }

  const a=`kakaomap://route?sp=${_rS.lat},${_rS.lng}&ep=${finalDest.lat},${finalDest.lng}&by=CAR`;
  _kakaoLaunch(w,a);
}


function smSwitchTab(tab){
  _smTab=tab;
  $('sm-tab-cat').classList.toggle('active',tab==='cat');
  $('sm-tab-place').classList.toggle('active',tab==='place');
  const activeSmTab = tab==='cat' ? $('sm-tab-cat') : $('sm-tab-place');
  if(activeSmTab){
    try{ activeSmTab.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'}); }catch(e){ console.warn("[가톨릭길동무]", e); }
  }
  $('sm-body').style.display=tab==='cat'?'':'none';
  $('sm-body-place').style.display=tab==='place'?'':'none';
  const inp=$('sm-inp');
  if(tab==='place'){
    if(inp&&inp.value.trim()) _searchKakaoPlace(inp.value.trim());
  } else if(tab==='cat'&&inp){ filterModal(inp.value||''); }
  oaiFocusSearchKeyboardInput('sm-inp');
}

function onSmInp(v){
  if(_smTab==='cat'){ filterModal(v); return; }
  clearTimeout(_smPlaceDebounce);
  if(!v.trim()){ $('sm-body-place').innerHTML='<div class="sm-place-loading">장소명을 입력하세요</div>'; return; }
  $('sm-body-place').innerHTML='<div class="sm-place-loading">🔍 검색 중...</div>';
  _smPlaceDebounce=setTimeout(()=>_searchKakaoPlace(v.trim()),400);
}

function _searchKakaoPlace(q){
  _kakaoKeywordDocs(q, KAKAO_PLACE_SEARCH_DISPLAY_LIMIT)
  .then(docs=>{
    const body=$('sm-body-place');
    if(!body) return;
    if(!docs.length){ body.innerHTML='<div class="sm-place-loading">검색 결과가 없습니다</div>'; return; }
    const cat=docs[0].category_group_name||'';
    body.innerHTML=docs.map(d=>{
      const icon=d.category_group_code==='MT1'?'🏪':d.category_group_code==='SC4'?'🏫':d.category_group_code==='HP8'?'🏥':d.category_group_code==='PM9'?'💊':d.category_group_code==='OL7'?'⛽':'📍';
      const lat=parseFloat(d.y),lng=parseFloat(d.x),nm=d.place_name,ad=d.road_address_name||d.address_name;
      return `<div class="sm-place-item" data-lat="${lat}" data-lng="${lng}" data-name="${nm.replace(/"/g,'&quot;')}" data-addr="${ad.replace(/"/g,'&quot;')}"><div class="sm-place-icon">${icon}</div><div class="sm-place-info"><div class="sm-place-name">${nm}</div><div class="sm-place-addr">${ad}</div></div></div>`;
    }).join('');
  }).catch(()=>{ const b=$('sm-body-place'); if(b) b.innerHTML='<div class="sm-place-loading">검색 실패</div>'; });
}

function selectFromPlaceModal(lat,lng,name,addr){
  closeSearchModal();
  const role=_smRole;
  _clearRouteTmpMarkers();
  const locObj={idx:-1,name:name,lat:lat,lng:lng,isPlace:true};
  if(role==='start'){
    _routeRegionStart=null;
    if(_mode==='shrine'&&_rS&&_rS.idx>=0&&_markers[_rS.idx]) _markers[_rS.idx].marker.setImage(_mkrImg(_typeColor(_markers[_rS.idx].shrine.type),false));
    _rS=locObj;
    _setRouteLabel('start',name);
    _refreshRouteTmpMarkers();
    _enterRouteMode();
    if(_rE) _updateSearchBtn();
    else{ _showRouteGuideText(`도착 ${_getRouteGuideTarget()}를 탭하세요`); }
  } else if(_isRouteWaypointRole(role)) {
    const oldPoint=_getRoutePointByRole(role);
    if(_mode==='shrine'&&oldPoint&&oldPoint.idx>=0&&_markers[oldPoint.idx]) _markers[oldPoint.idx].marker.setImage(_mkrImg(_typeColor(_markers[oldPoint.idx].shrine.type),false));
    _setRouteWaypointEnabledByRole(role,true);
    _setRoutePointByRole(role,locObj);
    _setRouteLabel(role,name);
    _refreshRouteTmpMarkers();
    _hideRouteGuide();
    if(_rS&&_rE) _updateSearchBtn();
  } else {
    if(_mode==='shrine'&&_rE&&_rE.idx>=0&&_markers[_rE.idx]) _markers[_rE.idx].marker.setImage(_mkrImg(_typeColor(_markers[_rE.idx].shrine.type),false));
    _rE=locObj;
    _setRouteLabel('end',name);
    _refreshRouteTmpMarkers();
    _hideRouteGuide();
    if(_rS) _updateSearchBtn();
    else _showRouteGuideText(`출발 ${_getRouteGuideTarget()}를 탭하세요`);
  }
  if(!_activeTab||_activeTab!=='route') openTab('route');
  if(_map) _map.panTo(new _LL(lat,lng));
}
function _isRouteResultShowing(){
  try{ return !!(_polyline || ($('rs-result') && $('rs-result').style.display !== 'none')); }
  catch(e){ return false; }
}

function _hideRouteSheetWhileSearchModalOpen(){
  try{
    const rs=$('sheet-route');
    const modal=$('srch-modal');
    if(!rs || !modal) return;
    const visible = rs.style.display !== 'none' && getComputedStyle(rs).display !== 'none';
    if(visible){
      modal.dataset.routeSheetHidden='1';
      rs.dataset.hiddenBySearchModal='1';
      document.body && document.body.classList.add('route-search-modal-open');
      rs.style.setProperty('display','none','important');
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function _restoreRouteSheetAfterSearchModal(){
  try{
    const rs=$('sheet-route');
    const modal=$('srch-modal');
    if(!rs || !modal) return;
    document.body && document.body.classList.remove('route-search-modal-open');
    if(modal.dataset.routeSheetHidden==='1' || rs.dataset.hiddenBySearchModal==='1'){
      rs.style.removeProperty('display');
      rs.classList.add('open');
      delete modal.dataset.routeSheetHidden;
      delete rs.dataset.hiddenBySearchModal;
      _syncRouteWaypointBox();
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

function _returnRouteResultToInputCard(){
  try{
    if(!_isRouteResultShowing()) return false;
    _clearVisibleRouteResultOnly();
    _routeWaypointSummaryExpanded=false;
    _syncRoutePointLabels();
    _syncRouteWaypointBox();
    _updateSearchBtn();
    const rs=$('sheet-route');
    if(rs){ rs.style.display=''; rs.classList.add('open'); }
    return true;
  }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
}

function _handleRouteInputBoxClick(role){
  if(_returnRouteResultToInputCard()) return;
  openSearchModal(role);
}

function _handleRouteWaypointSummaryClick(){
  if(_returnRouteResultToInputCard()){
    _routeWaypointSummaryExpanded=true;
    _syncRoutePointLabels();
    _syncRouteWaypointBox();
    return;
  }
  _expandRouteWaypointSummary();
}

function openSearchModal(role){
  closeInfoCard({keepMap:true});
  _hideRouteSheetWhileSearchModalOpen();
  _smRole=role;_smDio='all';
  _smTab='cat';
  const catTab=$('sm-tab-cat');
  if(catTab) catTab.textContent=_mode==='shrine'?'성지':_mode==='parish'?'성당':'피정의 집';
  if($('sm-tab-cat')) $('sm-tab-cat').classList.add('active');
  if($('sm-tab-place')) $('sm-tab-place').classList.remove('active');
  requestAnimationFrame(function(){
    try{ $('sm-tab-cat')?.scrollIntoView({behavior:'instant', block:'nearest', inline:'center'}); }catch(e){ console.warn("[가톨릭길동무]", e); }
  });
  if($('sm-body')) $('sm-body').style.display='';
  if($('sm-body-place')) {
    $('sm-body-place').style.display='none';
    $('sm-body-place').innerHTML='';
    if(!$('sm-body-place')._hasDelegate){
      $('sm-body-place')._hasDelegate=true;
      $('sm-body-place').addEventListener('click',function(e){
        const item=e.target.closest('.sm-place-item');
        if(!item) return;
        const lat=parseFloat(item.dataset.lat);
        const lng=parseFloat(item.dataset.lng);
        const name=item.dataset.name;
        const addr=item.dataset.addr;
        selectFromPlaceModal(lat,lng,name,addr);
      });
    }
  }
  const hd=$('srch-modal')?.querySelector('.sm-hd');
  if(hd){
    hd.style.background=_mode==='parish'?'var(--parish-bg)':_mode==='retreat'?'var(--retreat-bg)':'var(--navy)';
  }
  const sfb=$('srch-modal')?.querySelector('.sm-filter');
  if(sfb){
    sfb.style.background=_mode==='parish'?'var(--parish-bg)':_mode==='retreat'?'var(--retreat-bg)':'var(--navy2)';
  }
  $$('.sm-fb').forEach(b=>b.classList.remove('on'));
  document.querySelector('.sm-fb')?.classList.add('on');
  const noun=_getRouteGuideTarget();
  $('sm-title').textContent=_routeSearchTitle(role,noun);
  const smInput=$('sm-inp');
  if(smInput){
    const smPh = _mode==='parish' ? '선택 교구 성당명, 주소 검색' : '이름 또는 장소 입력';
    smInput.placeholder = smPh;
    smInput.setAttribute('aria-label', smPh);
    smInput.value='';
  }
  filterModal('');
  var searchModal=$('srch-modal');
  if(searchModal){
    searchModal.classList.add('open');
    try{ if(typeof oaiEnterPopup==='function') oaiEnterPopup(searchModal); }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  oaiFocusSearchKeyboardInput('sm-inp');
}

function _blurAll(){ try{document.activeElement&&document.activeElement.blur();}catch(e){ console.warn("[가톨릭길동무]", e); } }
function oaiInputIsVisible(el){
  try{
    if(!el) return false;
    if(el.disabled || el.readOnly) return false;
    var r=el.getBoundingClientRect();
    return r.width>0 && r.height>0;
  }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
}
function oaiFocusSearchKeyboardInput(id, delay){
  function run(){
    try{
      var el=document.getElementById(id);
      if(!oaiInputIsVisible(el)) return;
      if(document.activeElement!==el){
        try{ el.focus({preventScroll:true}); }catch(_e){ el.focus(); }
      }
      try{ if(typeof el.select === 'function' && el.value) el.select(); }catch(_e){}
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  if(delay && delay>0) setTimeout(run, delay);
  else { run(); setTimeout(run, 60); }
}
function oaiBlurIfAutoFocusedInput(id){
  setTimeout(function(){
    try{
      var el=document.getElementById(id);
      if(el && document.activeElement===el) el.blur();
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  },0);
}
function closeSearchModal(){
  _blurAll && _blurAll();
  $('srch-modal').classList.remove('open');
  _restoreRouteSheetAfterSearchModal();
}

function routeSearchModalMapSelect(){
  closeSearchModal();
  if(!_activeTab || _activeTab !== 'route') openTab('route');
  const rs=$('sheet-route');
  if(rs){ rs.style.display=''; rs.classList.add('open'); }
  if(_isRouteWaypointRole(_smRole)) _ensureRouteWaypointBox(_smRole);
  if(_routeMode){
    _restoreMarkersWhenRouteNotDisplayed();
    if(_isRouteWaypointRole(_smRole)) _showRouteGuideText(`지도에서 경유지${_routeWaypointIndex(_smRole)}를 선택하세요`);
    else _showRouteGuideText(_rS && !_isRouteImplicitCurrentStartHidden()
      ? `도착 ${_getRouteGuideTarget()}를 탭하세요`
      : `출발 ${_getRouteGuideTarget()}를 탭하거나 지도에서 선택하세요`);
  }
}

function setSmDio(v,btn){
  if(_mode==='parish'){
    const code = v==='all' ? null : (_PARISH_DIO_CODE_MAP[v]||null);
    if(v==='all' && !_areAllParishDiocesesReady()){
      _smDio=v;
      $$('.sm-fb').forEach(b=>b.classList.remove('on'));
      btn?.classList.add('on');
      const body=$('sm-body'); if(body) body.innerHTML='<div style="padding:32px;text-align:center;color:#aaa;font-size:13px">전체 성당 정보를 불러오는 중입니다...</div>';
      _ensureAllParishDiocesesLoaded().then(function(){ setSmDio(v,btn); }).catch(function(err){ console.warn('[가톨릭길동무] 전체 성당 데이터 로드 실패', err); });
      return;
    }
    if(code && !_isParishDioceseReady(code)){
      _smDio=v;
      $$('.sm-fb').forEach(b=>b.classList.remove('on'));
      btn?.classList.add('on');
      const body=$('sm-body'); if(body) body.innerHTML='<div style="padding:32px;text-align:center;color:#aaa;font-size:13px">성당 정보를 불러오는 중입니다...</div>';
      _ensureParishDioceseDataLoaded(code).then(function(){ setSmDio(v,btn); }).catch(function(err){ console.warn('[가톨릭길동무] 성당 교구 데이터 로드 실패', err); });
      return;
    }
  }
  _smDio=v;
  $$('.sm-fb').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on');
  filterModal($('sm-inp')?.value||'');
}

function filterModal(q){
  const body=$('sm-body');
  const groups={};
  _getCurrentItems().forEach((s,i)=>{
  const matchDio=_mode==='parish' ? (_smDio==='all'||s.diocese===_smDio) : (q?true:(_smDio==='all'||s.diocese===_smDio));
  if(!matchDio) return;
  if(q){
    const nq=q.replace(/\s+/g,'');
    const nameNorm=String(s.name||'').replace(/\s+/g,'');
    const dioNorm=String(s.diocese||'').replace(/\s+/g,'');
    const addrNorm=String(s.addr||'').replace(/\s+/g,'');
    let matchAll=false;
    if(_mode==='parish'){
      matchAll = nameNorm.startsWith(nq) || addrNorm.includes(nq);
    } else {
      const tokens=q.trim().split(/\s+/);
      matchAll=tokens.length>=2
        ?tokens.every(t=>{const nt=t.replace(/\s+/g,'');return nameNorm.includes(nt)||dioNorm.includes(nt)||addrNorm.includes(nt);})
        :nameNorm.includes(nq)||dioNorm.includes(nq)||addrNorm.includes(nq);
    }
    if(!matchAll) return;
  }
  if(!s.lat||!s.lng) return;
  if(!groups[s.diocese]) groups[s.diocese]=[];
  groups[s.diocese].push({s,i});
  });
  let html='';
  _orderedGroupEntriesForMyDiocese(groups).forEach(([dio,items])=>{
  const c=_smRole==='start'?'#E53935':'#2E7D32';
  html+=`<div class="sm-grp" style="color:${c}">${dio}</div>`;
  items.forEach(({s,i})=>{
   const tc=_mode==='shrine'?(TC[s.type]||'#555'):_getModeMarkerColor(s);
   const badge=_mode==='shrine'?s.type:(_mode==='retreat'?'피정':'성당');
   html+=`<div class="sm-item" onclick="selectFromModal(${i})"><div class="sm-role" style="background:${c}">${_smRole==='start'?'출':'도'}</div><div class="sm-info"><div class="sm-name">${s.name}</div><div class="sm-sub">${s.addr}</div></div><span class="sm-badge" style="color:${tc};background:${tc}18">${badge}</span></div>`;
  });
  });
  body.innerHTML=html||((_mode==='parish'&&!PARISHES.length)?'<div style="padding:32px;text-align:center;color:#aaa;font-size:13px">교구를 선택해 주세요</div>':((_mode==='parish'&&q&&_smDio!=='all')?'<div style="padding:32px;text-align:center;color:#aaa;font-size:13px">선택한 교구 안에 검색 결과가 없습니다</div>':'<div style="padding:32px;text-align:center;color:#aaa;font-size:13px">검색 결과가 없습니다</div>'));
}

function selectFromModal(idx){
  const s=_getCurrentItems()[idx];
  if(!s) return;
  closeSearchModal();
  const role=_smRole;
  if(role==='start'){
  _routeRegionStart=null;
    if(_mode==='shrine'&&_rS&&_rS.idx>=0&&_markers[_rS.idx]) _markers[_rS.idx].marker.setImage(_mkrImg(_typeColor(_markers[_rS.idx].shrine.type),false));
  _clearRouteTmpMarkers();
  _rS={idx,name:s.name,lat:s.lat,lng:s.lng};
  if(_mode==='shrine'){ _markers[idx]?.marker.setImage(_mkrImgRoute(_typeColor(s.type),'출')); _setRouteMarkerZ(idx,'start'); }
  _setRouteLabel('start',s.name);
  _refreshRouteTmpMarkers();
  _enterRouteMode();
  if(_rE) _updateSearchBtn();
  else {
   _showRouteGuideText(`도착 ${_getRouteGuideTarget()}를 탭하세요`);
  }
  } else if(_isRouteWaypointRole(role)) {
  const oldPoint=_getRoutePointByRole(role);
  if(_mode==='shrine'&&oldPoint&&oldPoint.idx>=0&&_markers[oldPoint.idx]) _markers[oldPoint.idx].marker.setImage(_mkrImg(_typeColor(_markers[oldPoint.idx].shrine.type),false));
  _setRouteWaypointEnabledByRole(role,true);
  _clearRouteTmpMarkers();
  _setRoutePointByRole(role,{idx,name:s.name,lat:s.lat,lng:s.lng});
  if(_mode==='shrine'){ _markers[idx]?.marker.setImage(_mkrImgRoute(_routeWaypointColor(role),_routeWaypointMarkerText(role))); _setRouteMarkerZ(idx,role); }
  _setRouteLabel(role,s.name);
  _refreshRouteTmpMarkers();
  _scheduleRouteMarkerRefresh();
  _hideRouteGuide();
  if(_rS&&_rE) _updateSearchBtn();
  } else {
  if(_mode==='shrine'&&_rE&&_rE.idx>=0&&_markers[_rE.idx]) _markers[_rE.idx].marker.setImage(_mkrImg(_typeColor(_markers[_rE.idx].shrine.type),false));
  _rE={idx,name:s.name,lat:s.lat,lng:s.lng};
  if(_mode==='shrine'){ _markers[idx]?.marker.setImage(_mkrImgRoute(_typeColor(s.type),'도')); _setRouteMarkerZ(idx,'end'); }
  _setRouteLabel('end',s.name);
  _refreshRouteTmpMarkers();
  _hideRouteGuide();
  if(_rS) _updateSearchBtn();
  else _showRouteGuideText(`출발 ${_getRouteGuideTarget()}를 탭하세요`);
  }
  if(!_activeTab||_activeTab!=='route') openTab('route');
  if(s.lat&&s.lng&&_map) _map.panTo(new _LL(s.lat,s.lng));
}

function _fetchDist(lat,lng,iLat,iLng,distId){
 _navFetch(`${lng},${lat}`,`${iLng},${iLat}`)
 .then(val=>{
  if(!val) return;
  const km=val.km.toFixed(1);
  const el=$(distId);if(el)el.innerHTML=`🚗${km}km<span style="font-size:10px;color:#aaa;font-weight:400;margin-left:3px">${_fmtTime(val.dur)}</span>`;
 }).catch(()=>{});
}
function _nearbyHtml(idx,i,name,addr,c,tLabel,distId,estKm){
 if(_mode==='retreat') c=OAI_RETREAT_CATEGORY_COLOR;
 else if(_mode==='parish') c=OAI_CATHEDRAL_CATEGORY_COLOR;
 return `<div class="nearby-item" onclick="selectItem(${idx},{fromNearby:true})"><div class="nearby-num" style="background:${c}!important">${i+1}</div><div class="nearby-info"><div class="nearby-name">${name}</div><div class="nearby-addr">${addr.substring(0,26)}${addr.length>26?'…':''}</div></div><div class="nearby-meta"><div class="nearby-type" style="background:${c}18!important;color:${c}!important">${tLabel}</div><div class="nearby-dist" id="${distId}" style="color:${c}!important">🚗${estKm}km</div></div></div>`;
}
function _regionHtml(idx,i,name,addr,c,tLabel,distId,estKm){
 if(_mode==='retreat') c=OAI_RETREAT_CATEGORY_COLOR;
 else if(_mode==='parish') c=OAI_CATHEDRAL_CATEGORY_COLOR;
 return `<div class="region-item" onclick="selectItem(${idx},{fromRegion:true})"><div class="nearby-num" style="background:${c}!important;width:28px;height:28px;font-size:12px">${i+1}</div><div class="nearby-info"><div class="nearby-name">${name}</div><div class="nearby-addr">${addr.substring(0,26)}${addr.length>26?'…':''}</div></div><div class="nearby-meta"><div class="nearby-type" style="background:${c}18!important;color:${c}!important">${tLabel}</div>${distId?`<div class="nearby-dist" id="${distId}" style="color:${c}!important">🚗${estKm}km</div>`:''}</div></div>`;
}
function _show(el,d){if(el)el.style.display=d||'flex';}
function _hide(el){if(el)el.style.display='none';}
function calcDist(a,b,c,d){
  const R=6371,dL=(c-a)*Math.PI/180,dG=(d-b)*Math.PI/180;
  const x=Math.sin(dL/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dG/2)**2;
  return R*2*Math.asin(Math.sqrt(x));
}
function _fmtTime(s){
  if(!s||s<60) return '1분 미만';
  const m=Math.round(s/60);
  if(m<60) return m+'분';
  return Math.floor(m/60)+'시간'+(m%60?' '+m%60+'분':'');
}
(function(){
  const TABS = ['nearby','list','region','route'];
  let _swSt = null;
  const MIN_DX = 55, MAX_DY = 90;

  function _doMainSwipe(dx){
    if(typeof _screen === 'undefined' || _screen !== 'map') return;
    if(document.getElementById('srch-modal')?.classList.contains('open')) return;
    const idx = (typeof _activeTab !== 'undefined' && _activeTab)
      ? TABS.indexOf(_activeTab) : -1;
    const next = dx < 0
      ? (idx < TABS.length - 1 ? TABS[idx + 1] : TABS[0])
      : (idx > 0 ? TABS[idx - 1] : TABS[TABS.length - 1]);
    window._swipeDir = dx < 0 ? 'right' : 'left';
    if(typeof openTab === 'function') openTab(next, {keyboard: (next === 'list' || next === 'region')});
    window._swipeDir = null;
  }

  function _isFoldWideMapEdgeBack(start, dx, dy, target){
    try{
      if(!start) return false;
      const root = document.documentElement;
      if(root && root.classList && root.classList.contains('ios-device')) return false;
      if(typeof _screen !== 'undefined' && _screen !== 'map') return false;
      if(!(_mode === 'shrine' || _mode === 'parish' || _mode === 'retreat')) return false;
      if(document.getElementById('srch-modal')?.classList.contains('open')) return false;
      if(document.getElementById('route-role-choice')?.classList.contains('open')) return false;
      const vw = Math.round(window.innerWidth || document.documentElement.clientWidth || 0);
      const vh = Math.round(window.innerHeight || document.documentElement.clientHeight || 0);
      if(vw < 600 || Math.min(vw, vh) < 520) return false;
      const startTarget = start.t || target;
      const mapWrap = document.getElementById('map-wrap');
      const mapEl = document.getElementById('map');
      let inMap = false;
      if(startTarget && startTarget.closest){
        inMap = !!(startTarget.closest('#map') || startTarget.closest('#map-wrap'));
      }
      if(!inMap && mapWrap && mapWrap.getBoundingClientRect){
        const r = mapWrap.getBoundingClientRect();
        inMap = start.x >= r.left && start.x <= r.right && start.y >= r.top && start.y <= r.bottom;
      }
      if(!inMap && mapEl && mapEl.getBoundingClientRect){
        const r = mapEl.getBoundingClientRect();
        inMap = start.x >= r.left && start.x <= r.right && start.y >= r.top && start.y <= r.bottom;
      }
      if(!inMap) return false;
      const edge = Math.min(118, Math.max(54, Math.round(vw * 0.105)));
      const fromLeft = start.x <= edge && dx > 0;
      const fromRight = start.x >= (vw - edge) && dx < 0;
      if(!fromLeft && !fromRight) return false;
      if(Math.abs(dx) < 34 || dy > 120) return false;
      if(Math.abs(dx) < dy * 1.02) return false;
      const now = Date.now ? Date.now() : new Date().getTime();
      if(window.__OAI_MAP_BACK_TO_COVER_UNTIL__ && now < window.__OAI_MAP_BACK_TO_COVER_UNTIL__) return false;
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
  }

  function _runFoldWideMapBackToCover(){
    try{
      const now = Date.now ? Date.now() : new Date().getTime();
      window.__OAI_MAP_BACK_TO_COVER_UNTIL__ = now + 1200;
      if(typeof window._oaiMapBackToCover === 'function') return window._oaiMapBackToCover('fold-wide-map-edge');
      if(typeof goToCover === 'function'){ goToCover(); return true; }
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    return false;
  }

  document.addEventListener('touchstart', function(e){
    if(!e.touches || !e.touches[0]) return;
    _swSt = {x: e.touches[0].clientX, y: e.touches[0].clientY, t: e.target};
  }, {passive: true, capture: true});

  document.addEventListener('touchcancel', function(){
    _swSt = null;
  }, {passive: true, capture: true});

  document.addEventListener('touchend', function(e){
    if(!_swSt) return;
    if(!e.changedTouches || !e.changedTouches[0]){ _swSt = null; return; }
    const ex = e.changedTouches[0].clientX;
    const ey = e.changedTouches[0].clientY;
    const dx = ex - _swSt.x;
    const dy = Math.abs(ey - _swSt.y);
    const swStart = _swSt;
    _swSt = null;

    if(_isFoldWideMapEdgeBack(swStart, dx, dy, e.target)){
      _runFoldWideMapBackToCover();
      return;
    }

    if(Math.abs(dx) < MIN_DX || dy > MAX_DY) return;

    const tgt = e.target;

    const tv = document.getElementById('trail-view');
    if(tv?.classList.contains('open')){
      if(tgt.closest('#trail-map') || tgt.closest('.trail-tabs')) return;
      if(typeof trailSetView === 'function')
        trailSetView(dx < 0 ? 'list' : 'map');
      if(typeof window.oaiSwipeAction === 'function') window.oaiSwipeAction(document.getElementById('trail-list') || document.querySelector('#trail-view .trail-panel.on'), dx < 0 ? 'left' : 'right');
      return;
    }

    const wv = document.getElementById('web-view');
    if(wv?.classList.contains('open')){
      return;
    }

    if(tgt.closest('.srch-bar'))   return;
    if(tgt.closest('.filter-bar')) return;
    if(tgt.closest('#map'))        return;
    if(tgt.closest('.sm-body, .sm-body-place')) return;

    const inApp =
      tgt.closest('#nearby-body') ||
      tgt.closest('#list-body')   ||
      tgt.closest('#region-body') ||
      tgt.closest('#sheet-route') ||
      tgt.closest('#info-card');
    if(inApp) _doMainSwipe(dx);

  }, {passive: true});
})();


(function(){
  const LONG_BG_RETURN_MS = 10 * 60 * 1000;
  const MEDIUM_BG_RETURN_MS = 60 * 1000;
  const BG_KEY = 'oai_home_backgrounded_at';
  let _bgIntroRunning = false;
  let _bgReturnStabilizing = false;

  function _now(){ return Date.now ? Date.now() : new Date().getTime(); }

  function _isAppScreenActive(){
    try{ return document.documentElement.classList.contains('app-active'); }
    catch(_e){ return false; }
  }

  function _isExternalReturnContext(){
    try{
      const now = _now();
      const extTs = parseInt(sessionStorage.getItem('oai_external_nav_started_at') || '0', 10) || 0;
      return sessionStorage.getItem('oai_external_nav_pending') === '1' ||
             sessionStorage.getItem('oai_external_nav_pagehide') === '1' ||
             sessionStorage.getItem('oai_my_faith_external_open') === '1' ||
             (extTs && (now - extTs) < LONG_BG_RETURN_MS);
    }catch(_e){ return false; }
  }

  function _isCoverIntroResetActive(){
    try{
      const root = document.documentElement;
      return root.classList.contains('oai-first-entry-intro') ||
             root.classList.contains('oai-cover-resetting-to-intro') ||
             root.classList.contains('oai-cover-booting');
    }catch(_e){ return false; }
  }

  function _clearBgStamp(){
    try{ sessionStorage.removeItem(BG_KEY); }catch(_e){}
  }

  function _markBackgrounded(){
    try{
      if(_isAppScreenActive() && !_isExternalReturnContext()){
        sessionStorage.setItem(BG_KEY, String(_now()));
      }
    }catch(_e){}
  }

  function _stabilizeMediumBackgroundReturn(reason){
    if(_bgReturnStabilizing || _bgIntroRunning) return;
    if(!_isAppScreenActive()) return;
    if(_isExternalReturnContext()) return;
    _bgReturnStabilizing = true;
    const root = document.documentElement;
    try{
      root.classList.remove('oai-background-return-stabilizing-release');
      root.classList.add('oai-background-return-stabilizing');
      root.setAttribute('data-oai-background-return-reason', reason || 'medium-background-return');
    }catch(_e){}

    const settleMap = function(){
      try{
        if(_map && typeof _map.relayout === 'function') _map.relayout();
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    };
    try{
      requestAnimationFrame(function(){
        settleMap();
        requestAnimationFrame(settleMap);
      });
    }catch(_e){
      setTimeout(settleMap, 40);
    }
    setTimeout(settleMap, 180);
    try{ if(typeof window.oaiSettleMyFaithLifeReturn === 'function') window.oaiSettleMyFaithLifeReturn(reason || 'medium-background-return'); }catch(_e){}

    setTimeout(function(){
      try{ root.classList.add('oai-background-return-stabilizing-release'); }catch(_e){}
    }, 260);
    setTimeout(function(){
      try{
        root.classList.remove('oai-background-return-stabilizing','oai-background-return-stabilizing-release');
        root.removeAttribute('data-oai-background-return-reason');
      }catch(_e){}
      _bgReturnStabilizing = false;
    }, 520);
  }

  function _showLongBackgroundReturnIntroToCover(reason){
    if(_bgIntroRunning) return;
    if(!_isAppScreenActive()) return;
    if(_isExternalReturnContext()) return;
    _bgIntroRunning = true;
    _clearBgStamp();

    const root = document.documentElement;
    try{ sessionStorage.setItem('oai_background_intro_return_until', String(_now() + 4200)); }catch(_e){}
    try{
      root.classList.remove('oai-cover-first-reveal','oai-cover-under-intro-reveal','oai-ivory-wipe-transition','oai-internal-no-return-effect');
      root.classList.add('oai-cover-resetting-to-intro','oai-cover-booting','oai-first-entry-intro','oai-background-return-intro');
    }catch(_e){}

    setTimeout(function(){
      try{ root.classList.add('oai-cover-under-intro-reveal'); }catch(_e){}
    }, 1720);

    setTimeout(function(){
      try{
        try{ goToCover(); }catch(e){ console.warn('[가톨릭길동무]', e); }
        try{ _resetMapState(); }catch(e){ console.warn('[가톨릭길동무]', e); }
        root.classList.remove('oai-cover-resetting-to-intro','oai-first-entry-intro','oai-cover-under-intro-reveal','oai-ivory-wipe-transition','oai-background-return-intro');
        root.classList.add('oai-cover-first-reveal');
        try{ sessionStorage.removeItem('oai_background_intro_return_until'); }catch(__e){}
        setTimeout(function(){
          try{ root.classList.remove('oai-cover-first-reveal','oai-cover-booting'); }catch(__e){}
          _bgIntroRunning = false;
          try{ if(typeof _ensureCoverBackTrap === 'function') _ensureCoverBackTrap('long-background-return-cover'); }catch(__e){}
        }, 820);
      }catch(_e){
        try{ sessionStorage.removeItem('oai_background_intro_return_until'); }catch(__e){}
        try{ root.classList.remove('oai-cover-resetting-to-intro','oai-first-entry-intro','oai-cover-under-intro-reveal','oai-background-return-intro','oai-cover-booting'); }catch(__e){}
        _bgIntroRunning = false;
      }
    }, 2150);
  }

  function _checkBackgroundReturn(){
    try{
      if(_isCoverIntroResetActive()) return;
      if(!_isAppScreenActive() || _isExternalReturnContext()){
        _clearBgStamp();
        return;
      }
      const started = parseInt(sessionStorage.getItem(BG_KEY) || '0', 10) || 0;
      const elapsed = started ? (_now() - started) : 0;
      if(started && elapsed >= LONG_BG_RETURN_MS){
        _showLongBackgroundReturnIntroToCover('long-background-return-cover');
      }else if(started && elapsed >= MEDIUM_BG_RETURN_MS){
        _stabilizeMediumBackgroundReturn('medium-background-return');
        _clearBgStamp();
      }else{
        _clearBgStamp();
      }
    }catch(_e){ _clearBgStamp(); }
  }

  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'hidden') _markBackgrounded();
    else _checkBackgroundReturn();
  }, {passive:true});
  window.addEventListener('pagehide', _markBackgrounded, {passive:true});
  window.addEventListener('pageshow', _checkBackgroundReturn, {passive:true});
})();

document.addEventListener('DOMContentLoaded', function bindEvents() {
  function on(id, evt, fn, opts) {
    var el = typeof id === 'string' ? document.getElementById(id) : id;
    if (el) el.addEventListener(evt, fn, opts || false);
  }
  function onQ(sel, evt, fn) {
    document.querySelectorAll(sel).forEach(function(el) { el.addEventListener(evt, fn); });
  }
  function adjustAppFont(delta) {
    if (typeof window.__APP_adjustSharedFont === 'function') {
      window.__APP_adjustSharedFont(delta);
      return;
    }
    if (typeof window.prAdjustFont === 'function') window.prAdjustFont(delta);
  }
  function withPrayerModule(fn) {
    if (typeof window.ensurePrayerModuleLoaded === 'function') {
      window.ensurePrayerModuleLoaded().then(function(){ try{ fn(); }catch(e){ console.warn('[가톨릭길동무]', e); } })
        .catch(function(err){ console.warn('[가톨릭길동무]', err); });
      return;
    }
    try{ fn(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  function prepareSearchKeyboardInput(id) {
    var el = document.getElementById(id);
    if (!el) return null;
    el.setAttribute('autocomplete', 'off');
    el.setAttribute('autocorrect', 'off');
    el.setAttribute('autocapitalize', 'off');
    el.setAttribute('spellcheck', 'false');
    el.setAttribute('inputmode', 'search');
    el.setAttribute('enterkeyhint', 'done');
    el.removeAttribute('autofocus');
    return el;
  }
  function blurSearchKeyboardOnDone(e, afterBlur) {
    if (!e || e.key !== 'Enter' || e.isComposing) return false;
    e.preventDefault();
    e.stopPropagation();
    var target = e.currentTarget || e.target;
    if (typeof afterBlur === 'function') {
      try { afterBlur(target); } catch (err) { console.warn('[가톨릭길동무]', err); }
    }
    setTimeout(function() { try { target && target.blur && target.blur(); } catch (err) { console.warn('[가톨릭길동무]', err); } }, 0);
    return true;
  }
  ['list-srch-inp', 'region-inp', 'sm-inp', 'prayer-search-inp'].forEach(prepareSearchKeyboardInput);

  (function bindMyFaithLifePanel(){
    var DIO_KEY = 'oai_my_diocese_name';
    var PARISH_KEY = 'oai_my_parish_data';
    var dioceses = [
      '서울대교구','대구대교구','광주대교구','수원교구','인천교구',
      '의정부교구','춘천교구','원주교구','대전교구','청주교구',
      '부산교구','마산교구','안동교구','전주교구','제주교구'
    ];
    var DIO_INFO = {
      '서울대교구': {home:'https://aos.catholic.or.kr/index', priest:'https://aos.catholic.or.kr/pro10315'},
      '대구대교구': {home:'https://www.daegu-archdiocese.or.kr/', priest:'https://www.daegu-archdiocese.or.kr/page/priest.html?srl=priest'},
      '광주대교구': {home:'https://www.gjcatholic.or.kr/', priest:'https://www.gjcatholic.or.kr/priest/priests'},
      '수원교구': {home:'https://www.casuwon.or.kr/', priest:'https://www.casuwon.or.kr/priest/priest'},
      '인천교구': {home:'http://www.caincheon.or.kr/', priest:'http://www.caincheon.or.kr/father/father_list.do'},
      '의정부교구': {home:'http://ucatholic.or.kr/', priest:'http://ucatholic.or.kr/bbs/board.php?bo_table=priest'},
      '춘천교구': {home:'https://www.cccatholic.or.kr/', priest:'https://www.cccatholic.or.kr/diocese/priest/priest'},
      '원주교구': {home:'http://www.wjcatholic.or.kr/', priest:'http://www.wjcatholic.or.kr/company/sajedan'},
      '대전교구': {home:'https://www.djcatholic.or.kr/home/', priest:'https://www.djcatholic.or.kr/home/pages/priest_list.php'},
      '청주교구': {home:'https://www.cdcj.or.kr/', priest:'https://www.cdcj.or.kr/diocese/priest/priest'},
      '부산교구': {home:'https://www.catholicbusan.or.kr/', priest:'https://www.catholicbusan.or.kr/clergy/priest'},
      '마산교구': {home:'https://cathms.kr/', priest:'https://cathms.kr/saje'},
      '안동교구': {home:'https://www.acatholic.or.kr/', priest:'https://www.acatholic.or.kr/sub2/sub1.asp'},
      '전주교구': {home:'https://jcatholic.or.kr/index.php', priest:'https://www.jcatholic.or.kr/theme/main/pages/priest.php?st=diocese'},
      '제주교구': {home:'https://www.diocesejeju.or.kr/', priest:'https://www.diocesejeju.or.kr/diocese_father'}
    };
    var btn = document.getElementById('cover-diocese-btn');
    var setupBanner = document.getElementById('my-diocese-setup-banner');
    var modal = document.getElementById('my-diocese-modal');
    var body = document.getElementById('my-diocese-list');
    var title = document.getElementById('my-diocese-title');
    var subtitle = modal ? modal.querySelector('.my-diocese-subtitle') : null;
    if(!btn || !modal || !body) return;
    var myFaithResumeBusy = false;
    var myFaithResumeTimer = null;
    var myFaithStableHeight = 0;
    var myFaithReturnSettling = false;

    function selectedName(){
      try{ return (localStorage.getItem(DIO_KEY) || '').trim(); }catch(e){ return ''; }
    }
    function setSelectedName(name){
      try{ localStorage.setItem(DIO_KEY, String(name || '').trim()); }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function selectedParish(){
      try{
        var raw = localStorage.getItem(PARISH_KEY) || '';
        if(!raw) return null;
        var item = JSON.parse(raw);
        return item && item.name ? item : null;
      }catch(e){ return null; }
    }
    function setSelectedParish(item){
      try{
        if(!item || !item.name){ localStorage.removeItem(PARISH_KEY); return; }
        localStorage.setItem(PARISH_KEY, JSON.stringify({
          name:String(item.name || ''),
          diocese:String(item.diocese || ''),
          addr:String(item.addr || ''),
          hp:String(item.hp || ''),
          url:String(item.url || '')
        }));
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function safeText(x){
      return String(x || '').replace(/[&<>"']/g, function(c){
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c);
      });
    }
    function setHeader(main, sub){
      var heading = main || '나의 신앙생활';
      if(title){
        title.textContent = heading;
        try{ title.setAttribute('data-myfaith-title', heading); }catch(_e){}
      }
      if(subtitle) subtitle.textContent = sub || '';
    }
    function setBodyMode(name){
      body.className = name || 'my-faith-body';
      body.innerHTML = '';
    }
    function updateSetupBanner(){
      try{
        var needsSetup = !(selectedName() && selectedParish());
        var coverEl = document.getElementById('cover');
        if(coverEl) coverEl.classList.toggle('my-diocese-setup-active', needsSetup);
        if(!setupBanner) return;
        setupBanner.hidden = !needsSetup;
        setupBanner.classList.toggle('show', needsSetup);
        setupBanner.setAttribute('aria-hidden', needsSetup ? 'false' : 'true');
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function updateButton(){
      btn.innerHTML = '<span class="cover-faith-cross" aria-hidden="true">✞</span><span class="diocese-btn-label">나의 신앙생활</span>';
      btn.setAttribute('aria-label', '나의 신앙생활 열기');
      btn.classList.remove('has-diocese');
      updateSetupBanner();
    }
    function refreshDependentViews(){
      try{ if(typeof _renderDioFilterBars === 'function') _renderDioFilterBars(_mode); }catch(_e){}
      try{ if(typeof window.webRenderCats === 'function') window.webRenderCats(); }catch(_e){}
      try{ if(typeof window.webRenderList === 'function') window.webRenderList(); }catch(_e){}
    }
    function updateMyFaithViewport(){
      try{
        var vv = window.visualViewport || null;
        var layoutH = Math.round(document.documentElement.clientHeight || window.innerHeight || 0);
        var innerH = Math.round(window.innerHeight || 0);
        var visibleH = Math.round((vv && vv.height) || innerH || layoutH || 0);
        var candidateH = Math.max(layoutH || 0, innerH || 0, visibleH || 0);
        if(candidateH && candidateH > myFaithStableHeight) myFaithStableHeight = candidateH;
        if(!myFaithStableHeight) myFaithStableHeight = candidateH || visibleH || 0;
        var active = document.activeElement || null;
        var focusedInput = !!(active && modal.contains(active) && /^(INPUT|TEXTAREA|SELECT)$/i.test(active.tagName || ''));
        var keyboardLikely = focusedInput || !!(myFaithStableHeight && visibleH && visibleH < myFaithStableHeight - 120) || !!(vv && Math.round(vv.offsetTop || 0) > 0);
        if(myFaithStableHeight > 0) modal.style.setProperty('--my-faith-vh', myFaithStableHeight + 'px');
        if(visibleH > 0) modal.style.setProperty('--my-faith-visible-vh', visibleH + 'px');
        modal.classList.toggle('keyboard-open', keyboardLikely);
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function closeModal(){
      modal.classList.remove('show','keyboard-open','return-settling');
      modal.setAttribute('aria-hidden', 'true');
      try{ document.body.classList.remove('modal-open'); }catch(e){}
      try{ modal.style.removeProperty('--my-faith-vh'); modal.style.removeProperty('--my-faith-visible-vh'); }catch(e){}
      myFaithStableHeight = 0;
      myFaithReturnSettling = false;
      myFaithDraft = null;
      try{ sessionStorage.removeItem('oai_my_faith_external_open'); sessionStorage.removeItem('oai_my_faith_external_ts'); sessionStorage.removeItem('oai_my_faith_scroll_top'); }catch(e){}
      try{
        if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
        if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed();
        if(typeof window._resetCoverBackTrap === 'function') window._resetCoverBackTrap('my-faith-close');
        else if(typeof window._ensureCoverBackTrap === 'function') window._ensureCoverBackTrap('my-faith-close');
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function openModal(opts){
      opts = opts || {};
      if(!opts.keepContent) renderHome();
      updateMyFaithViewport();
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      try{ document.body.classList.add('modal-open'); }catch(e){}
      setTimeout(updateMyFaithViewport, opts.fromExternal ? 180 : 80);
    }
    window.isMyFaithLifeModalOpen = function(){
      try{ return !!(modal && modal.classList.contains('show')); }catch(_e){ return false; }
    };
    window.closeMyFaithLifeModal = function(){
      closeModal();
    };
    function goExternal(url){
      url = String(url || '').trim();
      if(!url) return;
      try{
        if(typeof prepareExternalUrl === 'function') url = prepareExternalUrl(url);
        else if(typeof normalizeCatholicExternalUrl === 'function') url = normalizeCatholicExternalUrl(url);
      }catch(_e){}
      if(!url) return;
      try{ document.activeElement && document.activeElement.blur && document.activeElement.blur(); }catch(_e){}
      try{
        sessionStorage.setItem('oai_my_faith_external_open', '1');
        sessionStorage.setItem('oai_my_faith_external_ts', String(Date.now ? Date.now() : new Date().getTime()));
        sessionStorage.setItem('oai_my_faith_scroll_top', String(body && typeof body.scrollTop === 'number' ? body.scrollTop : 0));
        modal.classList.add('return-settling');
        if(typeof CORE_RETURN_KEY !== 'undefined') sessionStorage.removeItem(CORE_RETURN_KEY);
      }catch(_e){}
      try{
        if(typeof oaiSmoothNavigate === 'function') oaiSmoothNavigate(url, 'my-faith-life');
        else {
          if(typeof markExternalReturnStabilize === 'function') markExternalReturnStabilize('my-faith-life');
          setTimeout(function(){ try{ location.assign(url); }catch(e){ try{ location.href = url; }catch(_e){} } }, 70);
        }
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function actionButton(label, url, extraClass){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'my-faith-action' + (extraClass ? (' ' + extraClass) : '');
      b.textContent = label;
      if(url){
        b.addEventListener('click', function(e){ if(e && e.preventDefault) e.preventDefault(); goExternal(url); });
      }else{
        b.disabled = true;
      }
      return b;
    }
    function smallButton(label, fn){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'my-faith-small-btn';
      b.textContent = label;
      b.addEventListener('click', function(e){ if(e && e.preventDefault) e.preventDefault(); fn && fn(); });
      return b;
    }
    function appendMyFaithPrivacyNote(){
      try{
        var note = document.createElement('div');
        note.className = 'my-faith-inline-privacy-note';
        note.textContent = '선택한 교구와 본당 정보는 이 기기 안에만 저장되며, 외부로 수집되거나 전송되지 않습니다.';
        body.appendChild(note);
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function appendMyFaithConfirmButton(){
      try{
        var wrap = document.createElement('div');
        wrap.className = 'my-faith-inline-confirm';
        var ok = document.createElement('button');
        ok.type = 'button';
        ok.className = 'my-faith-confirm-btn';
        ok.textContent = '확인';
        ok.addEventListener('click', function(e){
          if(e && e.preventDefault) e.preventDefault();
          closeModal();
        });
        wrap.appendChild(ok);
        body.appendChild(wrap);
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    var myFaithDraft = null;
    function hasCompleteMyFaithSetting(){
      return !!(selectedName() && selectedParish());
    }
    function getDioceseCodeByName(dioName){
      dioName = String(dioName || '').trim();
      if(!dioName) return null;
      try{
        if(typeof _PARISH_DIO_CODE_MAP !== 'undefined' && _PARISH_DIO_CODE_MAP && _PARISH_DIO_CODE_MAP[dioName]) return _PARISH_DIO_CODE_MAP[dioName];
      }catch(_e){}
      try{
        for(var code in _DIO){
          if(Object.prototype.hasOwnProperty.call(_DIO, code) && _DIO[code] === dioName) return code;
        }
      }catch(_e){}
      return null;
    }
    function startMyFaithSettings(fromChange){
      myFaithDraft = {
        diocese: '',
        parish: null,
        query: '',
        error: '',
        fromChange: !!fromChange,
        dioceseFolded: false,
        parishFolded: false
      };
      renderMyFaithSettings();
    }
    function cancelMyFaithSettings(){
      try{ document.activeElement && document.activeElement.blur && document.activeElement.blur(); }catch(_e){}
      var shouldReturnInfo = !!(myFaithDraft && myFaithDraft.fromChange && hasCompleteMyFaithSetting());
      myFaithDraft = null;
      if(shouldReturnInfo) renderHome();
      else closeModal();
    }
    function settleMyFaithHomeScroll(){
      try{
        if(!body || !body.classList.contains('my-faith-home-list-body')) return;
        body.classList.remove('my-faith-no-scroll');
        body.scrollTop = 0;

        function contentFitsWithoutScroll(){
          try{
            var bodyRect = body.getBoundingClientRect ? body.getBoundingClientRect() : null;
            if(!bodyRect || !bodyRect.height) return false;
            var children = Array.prototype.slice.call(body.children || []);
            var top = Infinity;
            var bottom = -Infinity;
            children.forEach(function(el){
              try{
                if(!el || el.hidden) return;
                var st = window.getComputedStyle ? window.getComputedStyle(el) : null;
                if(st && st.display === 'none') return;
                var r = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
                if(!r || (!r.height && !r.width)) return;
                top = Math.min(top, r.top);
                bottom = Math.max(bottom, r.bottom);
              }catch(_e){}
            });
            if(!isFinite(top) || !isFinite(bottom)) return false;
            var visualHeight = bottom - top;
            return visualHeight <= (bodyRect.height + 6);
          }catch(_e){
            return false;
          }
        }

        function apply(){
          try{
            body.scrollTop = 0;
            var extra = (body.scrollHeight || 0) - (body.clientHeight || 0);
            if(contentFitsWithoutScroll() || extra <= 42){
              body.scrollTop = 0;
              body.classList.add('my-faith-no-scroll');
            }else{
              body.classList.remove('my-faith-no-scroll');
            }
          }catch(_e){}
        }

        requestAnimationFrame(function(){
          apply();
          requestAnimationFrame(apply);
        });
        setTimeout(apply, 160);
        setTimeout(apply, 360);
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function renderHome(){
      var name = selectedName();
      var info = name ? DIO_INFO[name] : null;
      var parish = selectedParish();
      if(!(name && parish)){
        startMyFaithSettings(false);
        return;
      }
      myFaithDraft = null;
      setHeader('나의 신앙생활', '내 교구·본당 정보를 확인');
      setBodyMode('my-faith-body my-faith-home-list-body my-faith-complete-body');

      function rowButton(label, fn, disabled, cls){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'my-faith-row-btn' + (cls ? (' ' + cls) : '');
        b.textContent = label;
        if(disabled){
          b.disabled = true;
        }else{
          b.addEventListener('click', function(e){
            if(e && e.preventDefault) e.preventDefault();
            fn && fn();
          });
        }
        return b;
      }
      function listSection(title, className){
        var sec = document.createElement('section');
        sec.className = 'my-faith-section my-faith-list-section ' + (className || '');
        var h = document.createElement('h3');
        h.textContent = title;
        sec.appendChild(h);
        return sec;
      }
      function appendRow(sec, label, value, status, buttonLabel, fn, disabled, cls, rowCls){
        var row = document.createElement('div');
        row.className = 'my-faith-list-row' + (disabled ? ' is-disabled' : '') + (status ? (' has-status-' + status) : '') + (rowCls ? (' ' + rowCls) : '');
        var main = document.createElement('div');
        main.className = 'my-faith-row-main';
        var top = document.createElement('div');
        top.className = 'my-faith-row-top';
        var strong = document.createElement('strong');
        strong.textContent = label;
        top.appendChild(strong);
        if(status){
          var badge = document.createElement('span');
          badge.className = 'my-faith-row-status ' + status;
          badge.textContent = status === 'done' ? '설정됨' : '설정 필요';
          top.appendChild(badge);
        }
        main.appendChild(top);
        if(value){
          var sub = document.createElement('span');
          sub.className = 'my-faith-row-sub';
          sub.textContent = value;
          main.appendChild(sub);
        }
        row.appendChild(main);
        row.appendChild(rowButton(buttonLabel, fn, disabled, cls));
        sec.appendChild(row);
      }
      function openIfUrl(url){
        if(url) goExternal(url);
      }

      var quick = listSection('내 교구·본당 정보', 'my-faith-quick-section');
      appendRow(
        quick,
        name ? (name + ' 홈페이지') : '교구 홈페이지',
        '',
        '',
        '열기',
        function(){ openIfUrl(info && info.home); },
        !(info && info.home),
        'my-faith-row-btn-open',
        'my-faith-diocese-info-row'
      );
      appendRow(
        quick,
        name ? (name + ' 사제 찾기') : '교구 사제 찾기',
        '',
        '',
        '열기',
        function(){ openIfUrl(info && info.priest); },
        !(info && info.priest),
        'my-faith-row-btn-open',
        'my-faith-diocese-info-row'
      );
      if(parish && parish.hp){
        appendRow(
          quick,
          parish.name + ' 홈페이지',
          '',
          '',
          '열기',
          function(){ openIfUrl(parish && parish.hp); },
          false,
          'my-faith-row-btn-open',
          'my-faith-parish-info-row'
        );
      }
      appendRow(
        quick,
        parish ? (parish.name + (parish.url ? ' 상세정보' : ' 상세정보 없음')) : '본당 상세정보',
        '',
        '',
        '열기',
        function(){ openIfUrl(parish && parish.url); },
        !(parish && parish.url),
        'my-faith-row-btn-open',
        'my-faith-parish-info-row'
      );
      body.appendChild(quick);

      var changeWrap = document.createElement('div');
      changeWrap.className = 'my-faith-change-wrap';
      var changeBtn = document.createElement('button');
      changeBtn.type = 'button';
      changeBtn.className = 'my-faith-change-btn';
      changeBtn.textContent = '교구·본당 변경';
      changeBtn.addEventListener('click', function(e){
        if(e && e.preventDefault) e.preventDefault();
        startMyFaithSettings(true);
      });
      appendMyFaithConfirmButton();

      changeWrap.appendChild(changeBtn);
      body.appendChild(changeWrap);

      appendMyFaithPrivacyNote();
      settleMyFaithHomeScroll();
    }
    function getParishItems(){
      try{ if(Array.isArray(PARISHES) && PARISHES.length) return PARISHES; }catch(e){}
      return [];
    }
    function getSelectedDioceseCode(){
      return getDioceseCodeByName(selectedName());
    }
    function sortParishItems(items){
      return items.slice().sort(function(a,b){
        return String(a && a.name || '').localeCompare(String(b && b.name || ''), 'ko');
      });
    }
    function renderMyFaithSettings(){
      if(!myFaithDraft){
        myFaithDraft = {diocese:'', parish:null, query:'', error:'', fromChange:false, dioceseFolded:false, parishFolded:false};
      }
      if(typeof myFaithDraft.dioceseFolded !== 'boolean') myFaithDraft.dioceseFolded = false;
      if(typeof myFaithDraft.parishFolded !== 'boolean') myFaithDraft.parishFolded = false;
      setHeader('나의 설정', '교구와 본당을 모두 선택해 주세요');
      setBodyMode('my-faith-body my-faith-home-list-body my-faith-settings-edit-body');

      function makeSection(title, className){
        var sec = document.createElement('section');
        sec.className = 'my-faith-section my-faith-list-section ' + (className || '');
        var h = document.createElement('h3');
        h.textContent = title;
        sec.appendChild(h);
        return sec;
      }
      function appendFoldedPick(sec, label, value, buttonLabel, fn){
        var wrap = document.createElement('div');
        wrap.className = 'my-faith-folded-pick';
        var main = document.createElement('div');
        main.className = 'my-faith-folded-pick-main';
        var small = document.createElement('span');
        small.className = 'my-faith-folded-pick-label';
        small.textContent = label;
        var strong = document.createElement('strong');
        strong.textContent = value || '선택됨';
        main.appendChild(small);
        main.appendChild(strong);
        var change = document.createElement('button');
        change.type = 'button';
        change.className = 'my-faith-folded-pick-change';
        change.textContent = buttonLabel || '변경';
        change.addEventListener('click', function(e){
          if(e && e.preventDefault) e.preventDefault();
          fn && fn();
        });
        wrap.appendChild(main);
        wrap.appendChild(change);
        sec.appendChild(wrap);
      }

      var settings = makeSection('나의 설정', 'my-faith-settings-section my-faith-settings-edit-section');
      if(myFaithDraft.diocese && myFaithDraft.dioceseFolded){
        appendFoldedPick(settings, '내 교구', myFaithDraft.diocese, '교구 변경', function(){
          myFaithDraft.dioceseFolded = false;
          myFaithDraft.error = '';
          renderMyFaithSettings();
        });
      }else{
        var dioBox = document.createElement('div');
        dioBox.className = 'my-faith-pick-options my-faith-diocese-pick-options';
        dioceses.forEach(function(dioName){
          var item = document.createElement('button');
          item.type = 'button';
          item.className = 'my-diocese-option' + (myFaithDraft.diocese === dioName ? ' selected' : '');
          item.textContent = dioName;
          item.setAttribute('aria-pressed', myFaithDraft.diocese === dioName ? 'true' : 'false');
          item.addEventListener('click', function(e){
            if(e && e.preventDefault) e.preventDefault();
            if(myFaithDraft.diocese !== dioName){
              myFaithDraft.diocese = dioName;
              myFaithDraft.parish = null;
              myFaithDraft.query = '';
            }
            myFaithDraft.dioceseFolded = true;
            myFaithDraft.parishFolded = false;
            myFaithDraft.error = '';
            renderMyFaithSettings();
          });
          dioBox.appendChild(item);
        });
        settings.appendChild(dioBox);
      }

      if(!(myFaithDraft.parish && myFaithDraft.parishFolded)){
        var parishTitle = document.createElement('div');
        parishTitle.className = 'my-faith-pick-subtitle';
        parishTitle.textContent = myFaithDraft.diocese ? '본당 선택' : '본당 선택은 교구를 먼저 선택한 뒤 가능합니다.';
        settings.appendChild(parishTitle);
      }

      if(myFaithDraft.parish && myFaithDraft.parishFolded){
        appendFoldedPick(settings, '내 본당', myFaithDraft.parish.name || '', '본당 변경', function(){
          myFaithDraft.parishFolded = false;
          myFaithDraft.error = '';
          renderMyFaithSettings();
        });
      }

      var searchInput = document.createElement('input');
      searchInput.type = 'search';
      searchInput.className = 'my-faith-search-input my-faith-settings-search-input';
      searchInput.placeholder = '본당명 또는 주소 검색';
      searchInput.value = myFaithDraft.query || '';
      searchInput.disabled = !myFaithDraft.diocese;
      if(myFaithDraft.parish && myFaithDraft.parishFolded){
        searchInput.hidden = true;
        searchInput.setAttribute('aria-hidden', 'true');
      }
      settings.appendChild(searchInput);

      var results = document.createElement('div');
      results.className = 'my-faith-search-results my-faith-settings-results';
      if(myFaithDraft.parish && myFaithDraft.parishFolded){
        results.hidden = true;
        results.setAttribute('aria-hidden', 'true');
      }
      settings.appendChild(results);
      body.appendChild(settings);

      var message = document.createElement('div');
      message.className = 'my-faith-settings-message';
      message.textContent = myFaithDraft.error || '';
      if(!myFaithDraft.error) message.setAttribute('aria-hidden', 'true');
      body.appendChild(message);

      var actions = document.createElement('div');
      actions.className = 'my-faith-settings-actions';
      var ok = document.createElement('button');
      ok.type = 'button';
      ok.className = 'my-faith-confirm-btn my-faith-settings-ok-btn';
      ok.textContent = '확인';
      ok.addEventListener('click', function(e){
        if(e && e.preventDefault) e.preventDefault();
        if(!myFaithDraft.diocese || !myFaithDraft.parish){
          myFaithDraft.error = '교구와 본당을 모두 선택해 주세요.';
          renderMyFaithSettings();
          return;
        }
        setSelectedName(myFaithDraft.diocese);
        setSelectedParish(myFaithDraft.parish);
        myFaithDraft = null;
        updateButton();
        refreshDependentViews();
        renderHome();
      });
      var cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'my-faith-cancel-btn';
      cancel.textContent = '취소';
      cancel.addEventListener('click', function(e){
        if(e && e.preventDefault) e.preventDefault();
        cancelMyFaithSettings();
      });
      actions.appendChild(ok);
      actions.appendChild(cancel);
      body.appendChild(actions);
      appendMyFaithPrivacyNote();

      function drawParishes(){
        try{
          if(myFaithDraft.parish && myFaithDraft.parishFolded){
            results.innerHTML = '';
            return;
          }
          var q = String(searchInput.value || '').trim().toLowerCase();
          myFaithDraft.query = searchInput.value || '';
          var items = getParishItems();
          var myDio = myFaithDraft.diocese || '';
          if(myDio){
            items = items.filter(function(p){ return p && p.diocese === myDio; });
          }else{
            items = [];
          }
          if(q){
            items = items.filter(function(p){
              return String((p.name||'') + ' ' + (p.addr||'') + ' ' + (p.diocese||'')).toLowerCase().indexOf(q) >= 0;
            });
          }
          items = sortParishItems(items);
          results.innerHTML = '';
          if(!myDio){
            results.innerHTML = '<div class="my-faith-empty">교구를 먼저 선택해 주세요.</div>';
            return;
          }
          if(!items.length){
            results.innerHTML = '<div class="my-faith-empty">검색 결과가 없습니다.</div>';
            return;
          }
          items.forEach(function(p){
            var card = document.createElement('button');
            card.type = 'button';
            card.className = 'my-faith-parish-result' + (myFaithDraft.parish && myFaithDraft.parish.name === p.name && myFaithDraft.parish.diocese === p.diocese ? ' selected' : '');
            card.innerHTML = '<strong>' + safeText(p.name) + '</strong><span>' + safeText(p.diocese || '') + (p.addr ? ' · ' + safeText(p.addr) : '') + '</span>';
            card.addEventListener('click', function(e){
              if(e && e.preventDefault) e.preventDefault();
              myFaithDraft.parish = p;
              myFaithDraft.parishFolded = true;
              myFaithDraft.scrollToActions = true;
              myFaithDraft.error = '';
              renderMyFaithSettings();
            });
            results.appendChild(card);
          });
        }catch(e){ console.warn('[가톨릭길동무]', e); }
      }

      searchInput.addEventListener('input', function(){
        myFaithDraft.query = searchInput.value || '';
        drawParishes();
      });
      searchInput.addEventListener('focus', function(){
        try{ modal.classList.add('keyboard-open'); updateMyFaithViewport(); }catch(_e){}
      });
      searchInput.addEventListener('blur', function(){
        setTimeout(function(){ try{ updateMyFaithViewport(); }catch(_e){} }, 180);
      });

      if(myFaithDraft.diocese){
        var selectedDioCode = getDioceseCodeByName(myFaithDraft.diocese);
        if(selectedDioCode && typeof _ensureParishDioceseDataLoaded === 'function'){
          results.innerHTML = '<div class="my-faith-empty">' + safeText(myFaithDraft.diocese) + ' 본당 정보를 불러오는 중입니다...</div>';
          _ensureParishDioceseDataLoaded(selectedDioCode).then(function(){ drawParishes(); }).catch(function(){ drawParishes(); });
        }else if(!_parishRawLoaded && typeof _ensureParishDataLoaded === 'function'){
          results.innerHTML = '<div class="my-faith-empty">성당 정보를 불러오는 중입니다...</div>';
          _ensureParishDataLoaded().then(function(){ drawParishes(); }).catch(function(){ drawParishes(); });
        }else{
          drawParishes();
        }
      }else{
        drawParishes();
      }
      setTimeout(updateMyFaithViewport, 80);
      if(myFaithDraft && myFaithDraft.scrollToActions){
        myFaithDraft.scrollToActions = false;
        setTimeout(function(){
          try{
            body.scrollTop = body.scrollHeight;
            var actionsEl = body.querySelector && body.querySelector('.my-faith-settings-actions');
            if(actionsEl && actionsEl.scrollIntoView) actionsEl.scrollIntoView({block:'end', inline:'nearest'});
          }catch(_e){}
        }, 130);
      }
    }
    function renderDioceseList(){
      startMyFaithSettings(false);
    }
    function renderParishSearch(query){
      startMyFaithSettings(false);
      if(myFaithDraft){
        myFaithDraft.query = String(query || '');
        renderMyFaithSettings();
      }
    }

    function runMyFaithAfterExternalResume(){
      try{
        if(myFaithResumeBusy) return false;
        if(sessionStorage.getItem('oai_my_faith_external_open') !== '1') return false;
        myFaithResumeBusy = true;
        myFaithReturnSettling = true;
        var ts = parseInt(sessionStorage.getItem('oai_my_faith_external_ts') || '0', 10) || 0;
        if(ts && Date.now && Date.now() - ts > 10 * 60 * 1000){
          sessionStorage.removeItem('oai_my_faith_external_open');
          sessionStorage.removeItem('oai_my_faith_external_ts');
          sessionStorage.removeItem('oai_my_faith_scroll_top');
          modal.classList.remove('return-settling');
          myFaithReturnSettling = false;
          myFaithResumeBusy = false;
          return false;
        }
        try{ if(typeof CORE_RETURN_KEY !== 'undefined') sessionStorage.removeItem(CORE_RETURN_KEY); }catch(_e){}
        var savedScroll = parseInt(sessionStorage.getItem('oai_my_faith_scroll_top') || '0', 10) || 0;
        try{ sessionStorage.removeItem('oai_my_faith_external_open'); sessionStorage.removeItem('oai_my_faith_external_ts'); sessionStorage.removeItem('oai_my_faith_scroll_top'); }catch(_e){}
        modal.classList.add('return-settling');
        if(!modal.classList.contains('show')){
          setTimeout(function(){
            try{ openModal({fromExternal:true, keepContent: !!(body && body.childElementCount)}); if(body) body.scrollTop = savedScroll; }catch(_e){}
          }, 120);
        }else{
          modal.setAttribute('aria-hidden', 'false');
          try{ document.body.classList.add('modal-open'); }catch(_e){}
          setTimeout(function(){ try{ updateMyFaithViewport(); if(body) body.scrollTop = savedScroll; }catch(_e){} }, 160);
        }
        try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(_e){}
        try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(_e){}
        setTimeout(function(){
          try{ modal.classList.remove('return-settling'); updateMyFaithViewport(); if(body) body.scrollTop = savedScroll; if(body && body.classList.contains('my-faith-home-list-body')) settleMyFaithHomeScroll(); }catch(_e){}
          myFaithReturnSettling = false;
          myFaithResumeBusy = false;
        }, 650);
        return true;
      }catch(e){
        myFaithReturnSettling = false;
        myFaithResumeBusy = false;
        try{ modal.classList.remove('return-settling'); }catch(_e){}
        console.warn('[가톨릭길동무]', e);
        return false;
      }
    }
    function scheduleMyFaithAfterExternalResume(delay){
      try{
        if(sessionStorage.getItem('oai_my_faith_external_open') !== '1') return false;
        if(myFaithResumeTimer) return true;
        myFaithResumeTimer = setTimeout(function(){
          myFaithResumeTimer = null;
          try{ runMyFaithAfterExternalResume(); }catch(e){ console.warn('[가톨릭길동무]', e); }
        }, typeof delay === 'number' ? delay : 80);
        return true;
      }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
    }
    window.oaiResumeMyFaithAfterExternal = scheduleMyFaithAfterExternalResume;
    window.oaiSettleMyFaithLifeReturn = function(reason){
      try{
        if(!modal || !modal.classList.contains('show')) return false;
        var saved = body && typeof body.scrollTop === 'number' ? body.scrollTop : 0;
        modal.classList.add('return-settling');
        updateMyFaithViewport();
        if(body) body.scrollTop = saved;
        setTimeout(function(){
          try{ updateMyFaithViewport(); if(body) body.scrollTop = saved; modal.classList.remove('return-settling'); }catch(_e){}
        }, 260);
        return true;
      }catch(_e){ return false; }
    };
    if(window.visualViewport){
      window.visualViewport.addEventListener('resize', function(){ if(modal.classList.contains('show')) updateMyFaithViewport(); }, {passive:true});
    }
    window.addEventListener('resize', function(){ if(modal.classList.contains('show')) updateMyFaithViewport(); }, {passive:true});
    window.addEventListener('pageshow', function(){ scheduleMyFaithAfterExternalResume(60); }, true);
    document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'visible') scheduleMyFaithAfterExternalResume(80); }, true);
    window.addEventListener('focus', function(){ scheduleMyFaithAfterExternalResume(100); }, true);

    updateButton();
    on(btn, 'click', function(e){
      if(e && e.preventDefault) e.preventDefault();
      if(e && e.stopPropagation) e.stopPropagation();
      openModal();
    });
    if(setupBanner){
      on(setupBanner, 'click', function(e){
        if(e && e.preventDefault) e.preventDefault();
        if(e && e.stopPropagation) e.stopPropagation();
        renderDioceseList();
        openModal({keepContent:true});
      });
    }
    on('my-diocese-close', 'click', function(e){
      if(e && e.preventDefault) e.preventDefault();
      closeModal();
    });
    modal.addEventListener('click', function(e){
      if(e && e.target && e.target.getAttribute && e.target.getAttribute('data-my-diocese-close') === 'true') closeModal();
    });
    document.addEventListener('keydown', function(e){
      if(e && e.key === 'Escape' && modal.classList.contains('show')) closeModal();
    });
  })();

  on('missa-close', 'click', function() { closeMissa(); });

  document.addEventListener('click', function(e){
    const btn=e.target && e.target.closest ? e.target.closest('.faith-quick-btn[data-faith-target]') : null;
    if(!btn) return;
    e.preventDefault();
    e.stopPropagation();
    _openFaithQuickTarget(btn.getAttribute('data-faith-target'));
  }, true);


  on('exit-cancel-btn', 'click', function() { closeExitDlg(); });
  on('exit-ok-btn',     'click', function() { doExit(); });

  on('diocese-close-btn', 'click', function() {
    if (typeof closeDioceseView === 'function') closeDioceseView();
  });
  on('diocese-frame', 'load', function() {
    if (typeof dioceseLoaded === 'function') dioceseLoaded();
  });

  on('prayer-close',  'click', function() { _closePrayerAndReturn(); });
  on('prayer-search-inp', 'input', function() { withPrayerModule(function(){ if(typeof window.prRenderList==='function') window.prRenderList(); }); });
  on('prayer-search-inp', 'keydown', function(e) {
    blurSearchKeyboardOnDone(e, function() {
      withPrayerModule(function(){ if(typeof window.prRenderList==='function') window.prRenderList(); });
    });
  });
  on('pr-sm-btn-1',   'click', function() { withPrayerModule(function(){ if(typeof window.prAdjustFont==='function') window.prAdjustFont(-1); }); });
  on('pr-lg-btn-1',   'click', function() { withPrayerModule(function(){ if(typeof window.prAdjustFont==='function') window.prAdjustFont(1); }); });
  on('pr-sm-btn-2',   'click', function() { withPrayerModule(function(){ if(typeof window.prAdjustFont==='function') window.prAdjustFont(-1); }); });
  on('pr-lg-btn-2',   'click', function() { withPrayerModule(function(){ if(typeof window.prAdjustFont==='function') window.prAdjustFont(1); }); });
  on('pr-detail-star','click', function(e) { var ev=e; withPrayerModule(function(){ if(typeof window.prToggleDetailFav==='function') window.prToggleDetailFav(ev); }); });
  on('pr-back-btn',   'click', function() { try{ history.go(-1); }catch(e){ withPrayerModule(function(){ if(typeof window.prCloseDetail==='function') window.prCloseDetail(); }); } });

  on('cover-sm-btn',  'click', function(e) { e.stopPropagation(); adjustAppFont(-1); });
  on('cover-lg-btn',  'click', function(e) { e.stopPropagation(); adjustAppFont(1); });

  on('cc-1', 'click', function() { if (typeof openMassQuickMenu === 'function') openMassQuickMenu(); });
  on('cc-2', 'click', function() { hideCoverAndRun(function() { if (typeof startApp === 'function') startApp('parish'); }); });
  on('cc-3', 'click', function() { hideCoverAndRun(function() { if (typeof startApp === 'function') startApp('shrine'); }); });
  on('cc-4', 'click', function() { hideCoverAndRun(function() { if (typeof startApp === 'function') startApp('retreat'); }); });
  on('cc-5', 'click', function() { hideCoverAndRun(function() { if (typeof openTrailView === 'function') openTrailView(); }); });
  on('cc-6', 'click', function() { hideCoverAndRun(function() { if (typeof openWebView === 'function') openWebView(); }); });
  on('cc-7', 'click', function() { hideCoverAndRun(function() { openDioceseView(); }); });

  onQ('[data-mass-quick-close]', 'click', function() { closeMassQuickMenu(); });
  on('mass-quick-missa', 'click', function() {
    _setMassQuickReturn(true);
    if (typeof openMissa === 'function') openMissa();
  });
  on('mass-quick-prayer', 'click', function() {
    try{
      document.querySelectorAll('#mass-quick-modal .app-pressing').forEach(function(el){ el.classList.remove('app-pressing'); });
    }catch(e){ console.warn('[가톨릭길동무]', e); }

    _setPrayerQuickReturn(true);
    var openPrayerFromQuick = function(){
      if (typeof openPrayerBook === 'function') openPrayerBook({fromMassQuick:true, instant:true});
      else alert('기도문 기능이 연결되지 않았습니다.');
    };
    if (typeof _hideMassQuickMenuOnly === 'function') _hideMassQuickMenuOnly(openPrayerFromQuick, {deferHideUntilAfter:true});
    else openPrayerFromQuick();
  });
  on('mass-quick-hymn', 'click', function() {
    _setMassQuickReturn(true);
    if (typeof openCatholicHymn === 'function') openCatholicHymn();
  });
  on('mass-quick-bible', 'click', function() {
    _setMassQuickReturn(true);
    if (typeof openCatholicBible === 'function') openCatholicBible();
  });

  (function bindCoverRefreshPressActions(){
    var refreshBtn = document.getElementById('cover-update-btn');
    if(!refreshBtn) return;

    var holdTimer = null;
    var pressStarted = false;
    var longActionFired = false;
    var suppressClickUntil = 0;
    var CACHE_HOLD_MS = 1200;

    function now(){ return Date.now ? Date.now() : new Date().getTime(); }
    function stopEvent(e, preventDefault){
      try{
        if(!e) return;
        e.stopPropagation();
        if(preventDefault && e.cancelable) e.preventDefault();
      }catch(_e){}
    }
    function vibrateShort(){ try{ if(navigator.vibrate) navigator.vibrate(12); }catch(_e){} }
    function vibrateLong(){ try{ if(navigator.vibrate) navigator.vibrate([32, 22, 48]); }catch(_e){} }
    function clearHold(){ if(holdTimer){ clearTimeout(holdTimer); holdTimer = null; } }
    function beginPress(e){
      try{ if(e && e.button !== undefined && e.button !== 0) return; }catch(_e){}
      stopEvent(e, false);
      clearHold();
      pressStarted = true;
      longActionFired = false;
      holdTimer = setTimeout(function(){
        holdTimer = null;
        if(!pressStarted || longActionFired) return;
        longActionFired = true;
        pressStarted = false;
        suppressClickUntil = now() + 1600;
        vibrateLong();
        if(typeof clearAppFilesCacheCompletely === 'function') clearAppFilesCacheCompletely();
      }, CACHE_HOLD_MS);
    }
    function endPress(e){
      stopEvent(e, false);
      pressStarted = false;
      clearHold();
    }
    function cancelPress(e){
      stopEvent(e, false);
      pressStarted = false;
      clearHold();
    }
    function shortRefresh(e){
      stopEvent(e, true);
      if(now() < suppressClickUntil || longActionFired){
        longActionFired = false;
        return;
      }
      pressStarted = false;
      clearHold();
      if(typeof refreshAppFilesOnly === 'function') refreshAppFilesOnly();
    }
    function preventNativePressMenu(e){ stopEvent(e, true); return false; }

    if(window.PointerEvent){
      on(refreshBtn, 'pointerdown', beginPress, {passive:false});
      on(refreshBtn, 'pointerup', endPress, {passive:false});
      on(refreshBtn, 'pointercancel', cancelPress, {passive:false});
      on(refreshBtn, 'pointerleave', function(e){
        try{ if(e && e.pointerType === 'mouse') cancelPress(e); }catch(_e){}
      }, {passive:false});
    }else{
      on(refreshBtn, 'touchstart', beginPress, {passive:true});
      on(refreshBtn, 'touchend', endPress, {passive:true});
      on(refreshBtn, 'touchcancel', cancelPress, {passive:true});
      on(refreshBtn, 'mousedown', beginPress, {passive:false});
      on(refreshBtn, 'mouseup', endPress, {passive:false});
      on(refreshBtn, 'mouseleave', cancelPress, {passive:false});
    }
    on(refreshBtn, 'click', shortRefresh, {capture:true});
    on(refreshBtn, 'contextmenu', preventNativePressMenu, {capture:true});
    on(refreshBtn, 'selectstart', preventNativePressMenu, {capture:true});
    on(refreshBtn, 'dragstart', preventNativePressMenu, {capture:true});
  })();
  on('qna-cover-btn',  'click', function() { openQnaView(); });


  (function(){
    var modal = document.getElementById('cover-menu-modal');
    if(!modal) return;
    function openMenu(){
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      try{ document.body.classList.add('modal-open'); }catch(e){}
    }
    function closeMenu(){
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      try{ document.body.classList.remove('modal-open'); }catch(e){}
    }
    window.closeCoverMenuPopup = closeMenu;
    window.isCoverMenuPopupOpen = function(){
      return !!(modal && modal.classList && modal.classList.contains('show'));
    };
    on('cover-menu-btn', 'click', function(e){
      if(e && e.preventDefault) e.preventDefault();
      openMenu();
    });
    on('cover-menu-close', 'click', function(e){
      if(e && e.preventDefault) e.preventDefault();
      closeMenu();
    });
    modal.addEventListener('click', function(e){
      if(e && e.target && e.target.getAttribute && e.target.getAttribute('data-cover-menu-close') === 'true'){
        closeMenu();
      }
    });
    on('cover-menu-guide-btn', 'click', function(e){
      if(e && e.preventDefault) e.preventDefault();
      closeMenu();
      try{
        if(window.openGuideManual) window.openGuideManual();
        else if(typeof openGuideManual === 'function') openGuideManual();
      }catch(err){ console.warn('[가톨릭길동무]', err); }
    });
    function markInternalPrivacyNavigation(){
      try{
        sessionStorage.setItem('oai_internal_return_no_effect_once','1');
        sessionStorage.setItem('oai_internal_return_no_effect_until', String((Date.now ? Date.now() : new Date().getTime()) + 7000));
        sessionStorage.setItem('oai_internal_page_nav','privacy');
        sessionStorage.removeItem('oai_external_nav_started_at');
        sessionStorage.removeItem('oai_external_nav_pagehide');
        sessionStorage.removeItem('oai_external_nav_kind');
        sessionStorage.removeItem('oai_external_nav_pending');
        sessionStorage.removeItem('oai_external_nav_hold_until');
        sessionStorage.removeItem('oai_external_nav_force_release_at');
        sessionStorage.removeItem('oai_refresh_veil_until');
        sessionStorage.removeItem('oai_refresh_veil_hold_ms');
        sessionStorage.removeItem('oai_refresh_veil_reason');
        sessionStorage.removeItem('oai_refresh_veil_visible_until');
      }catch(_e){}
    }
    on('cover-menu-qna-btn', 'click', function(e){
      if(e && e.preventDefault) e.preventDefault();
      closeMenu();
      try{ openQnaView(); }catch(err){ console.warn('[가톨릭길동무]', err); }
    });
    on('cover-menu-privacy-link', 'click', function(){
      markInternalPrivacyNavigation();
      closeMenu();
    });
    document.addEventListener('keydown', function(e){
      if(e && e.key === 'Escape' && modal.classList.contains('show')) closeMenu();
    });
  })();


  on('tab-btn-nearby', 'click', function() { toggleTab('nearby'); });
  on('tab-btn-list',   'click', function() { toggleTab('list'); });
  on('tab-btn-region', 'click', function() { toggleTab('region'); });
  on('tab-btn-route',  'click', function() { toggleTab('route'); });

  on('nearby-close-btn', 'click', function(e) { e.stopPropagation(); closeSheetPanelOnly('nearby'); });
  on('list-close-btn',   'click', function(e) { e.stopPropagation(); closeSheetPanelOnly('list'); });
  on('region-close-btn', 'click', function(e) { e.stopPropagation(); closeSheetPanelOnly('region'); });
  on('route-close-btn',  'pointerdown', function(e) { if(e){ e.preventDefault(); e.stopPropagation(); } }, {passive:false});
  ['click','pointerup','touchend'].forEach(function(ev){ on('route-close-btn', ev, function(e){ if(e){ e.preventDefault(); e.stopPropagation(); } closeRouteSheetByX(); }, {passive:false}); });
  (function(){
    var routeCloseBtn=document.getElementById('route-close-btn');
    if(!routeCloseBtn || routeCloseBtn.__oaiRouteCloseSafeV624) return;
    routeCloseBtn.__oaiRouteCloseSafeV624=true;
    function stopOnly(e){ if(e){ e.preventDefault(); e.stopPropagation(); } }
    function closeSafe(e){ stopOnly(e); closeRouteSheetByX(); }
    routeCloseBtn.addEventListener('pointerdown', stopOnly, {capture:true, passive:false});
    routeCloseBtn.addEventListener('click', closeSafe, {capture:true, passive:false});
    routeCloseBtn.addEventListener('pointerup', closeSafe, {capture:true, passive:false});
    routeCloseBtn.addEventListener('touchend', closeSafe, {capture:true, passive:false});
  })();
  on('map-category-close-btn', 'click', function(e) { e.stopPropagation(); closeCategoryToCoverFromMap(); });

  on('loc-btn', 'click', function() { goMyLoc(); });

  on('list-srch-inp', 'input', function() { onListSearch(this.value); });
  on('list-srch-inp', 'keydown', function(e) { blurSearchKeyboardOnDone(e, function(inp) { onListSearch(inp.value || ''); }); });
  on('list-srch-x',   'click', function() { clearListSearch(); });

  on('region-inp', 'keydown', function(e) { blurSearchKeyboardOnDone(e, function() { doRegionSearch(); }); });
  on('region-inp', 'input',   function() { onRegionInp(this.value); });
  on('region-search-btn', 'click', function() {
    if (document.activeElement) document.activeElement.blur();
    doRegionSearch();
  });

  on('rs-start-box', 'click', function() { _handleRouteInputBoxClick('start'); });
  on('rs-end-box',   'click', function() { _handleRouteInputBoxClick('end'); });
  on('rs-waypoint-box', 'click', function() { _handleRouteInputBoxClick('waypoint'); });
  on('rs-waypoint2-box', 'click', function() { _handleRouteInputBoxClick('waypoint2'); });
  on('rs-waypoint3-box', 'click', function() { _handleRouteInputBoxClick('waypoint3'); });
  on('rs-waypoints-summary-box', 'click', function(e) { e.stopPropagation(); _handleRouteWaypointSummaryClick(); });
  on('rs-waypoints-summary-box', 'keydown', function(e) { if(e.key==='Enter' || e.key===' '){ e.preventDefault(); _handleRouteWaypointSummaryClick(); } });
  on('rs-add-waypoint-btn', 'click', function(e) { e.stopPropagation(); _beginWaypointAddMode('waypoint'); });
  on('rs-add-waypoint2-btn', 'click', function(e) { e.stopPropagation(); _beginWaypointAddMode('waypoint2'); });
  on('rs-add-waypoint3-btn', 'click', function(e) { e.stopPropagation(); _beginWaypointAddMode('waypoint3'); });
  on('rs-myloc-btn', 'click', function(e) { e.stopPropagation(); setMyLocAsStart(); });
  on('rs-start-x',   'click', function(e) { e.stopPropagation(); clearRoute('start'); });
  on('rs-end-x',     'click', function(e) { e.stopPropagation(); clearRoute('end'); });
  on('rs-waypoint-x','click', function(e) { e.stopPropagation(); clearRoute('waypoint'); });
  on('rs-waypoint2-x','click', function(e) { e.stopPropagation(); clearRoute('waypoint2'); });
  on('rs-waypoint3-x','click', function(e) { e.stopPropagation(); clearRoute('waypoint3'); });
  on('rs-swap-btn',  'click', function() { swapRoute(); });
  on('rs-swap-waypoint-end-btn', 'click', function() { swapRouteWaypointEnd(); });
  on('rs-swap-waypoint2-end-btn', 'click', function() { swapRouteWaypoint2End(); });
  on('rs-swap-waypoint3-end-btn', 'click', function() { swapRouteWaypoint3End(); });
  on('rs-search-btn','click', function() { doSearchRoute(); });
  on('rs-kakao-btn', 'click', function() { doKakaoRoute(); });
  on('rs-reset-btn', 'click', function() { resetRoute({ fromButton: true }); });

  on('ic-close-btn', 'click', function() { closeInfoCard(); });
  on('ic-route-btn', 'click', function() { openInAppRoute(); });
  on('ic-guide',     'click', function() { if (typeof openShrineDetail === 'function') openShrineDetail(); });
  on('ic-kakao-nav', 'click', function() { openKakaoNav(); });

  on('sm-close-btn', 'click', function() { closeSearchModal(); });
  on('sm-map-select-btn', 'click', function() { routeSearchModalMapSelect(); });
  on('sm-inp', 'input', function() { onSmInp(this.value); });
  on('sm-inp', 'keydown', function(e) {
    blurSearchKeyboardOnDone(e, function(inp) {
      var v = (inp && inp.value ? inp.value : '').trim();
      if(_smTab==='place'){
        if(v) _searchKakaoPlace(v);
      } else {
        filterModal(v);
      }
    });
  });

  function closeGeneralModuleByButton(viewId){
    try{
      if(typeof window._oaiCloseGeneralModuleToCover === 'function' && window._oaiCloseGeneralModuleToCover(viewId + '-close-button')) return;
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    var v = document.getElementById(viewId);
    if (v) v.classList.remove('open');
    if (typeof goToCover === 'function') goToCover();
  }
  on('web-close-btn', 'click', function() { closeGeneralModuleByButton('web-view'); });
  on('trail-close-btn', 'click', function() { closeGeneralModuleByButton('trail-view'); });
  on('qna-close-btn', 'click', function() { closeGeneralModuleByButton('qna-view'); });

  on('trail-sh-close-btn', 'click', function() { trailCloseSheet(); });
  on('trail-loc-btn',      'click', function() { trailMyLoc(); });
  on('trail-tab-map',  'click', function() { trailSetView('map'); });
  on('trail-tab-list', 'click', function() { trailSetView('list'); });

  on('qna-tab-write',   'click', function() { qnaShowTab('write'); });

  on('sm-tab-cat',   'click', function() { smSwitchTab('cat'); });
  on('sm-tab-place', 'click', function() { smSwitchTab('place'); });

  on('missa-frame', 'load', function() { if (typeof missaLoaded === 'function') missaLoaded(); });
});


