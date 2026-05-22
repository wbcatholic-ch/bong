/* 가톨릭길동무 core.js — 뒤로가기/종료 상태 관리
   patches.js와 app.js 양쪽에서 참조하는 순수 유틸리티 함수들.
   브라우저 전역(window, history, sessionStorage, document)만 사용하며
   app.js의 다른 함수에 의존하지 않습니다.
   로드 순서: constants.js → core.js → app.js → patches.js */

'use strict';

/* ── 커버 종료 상태 ──────────────────────────────────── */

function _resetCoverExitReady(){
  try{
    window._exitReady = false;
    clearTimeout(window._exitTimer);
    var bt = document.getElementById('_bt');
    if(bt) bt.remove();
    var toast = document.getElementById('oai-cover-exit-toast');
    if(toast) toast.classList.remove('show');
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _clearCoverExitArmed(){
  try{
    window.__oaiCoverExitUntil = 0;
    sessionStorage.removeItem('oai_cover_exit_armed_until');
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _armCoverExitWindow(){
  try{
    var until = Date.now() + 2500;
    window.__oaiCoverExitUntil = until;
    sessionStorage.setItem('oai_cover_exit_armed_until', String(until));
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _isCoverExitArmed(){
  try{
    var until = Number(window.__oaiCoverExitUntil || sessionStorage.getItem('oai_cover_exit_armed_until') || 0);
    return !!(until && Date.now() < until);
  }catch(e){ return false; }
}

/* ── 화면 상태 판단 ─────────────────────────────────── */

function _isCoverScreenVisible(){
  try{
    var cover = document.getElementById('cover');
    if(!cover) return !document.documentElement.classList.contains('app-active');
    if(cover.classList.contains('hidden')) return false;
    var st = window.getComputedStyle ? window.getComputedStyle(cover) : null;
    if(st && (st.display === 'none' || st.visibility === 'hidden')) return false;
    return true;
  }catch(e){
    try{ return !document.documentElement.classList.contains('app-active'); }catch(_e){ return false; }
  }
}
function _isAppScreenActive(){
  try{ if(_isCoverScreenVisible()) return false; }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{ return document.documentElement.classList.contains('app-active'); }catch(e){ return false; }
}

/* ── 커버 Back Trap 관리 ─────────────────────────────── */

function _ensureCoverBackTrap(reason){
  try{
    if(_isAppScreenActive()) return;
    var modal = document.getElementById('mass-quick-modal');
    if(modal && modal.classList.contains('show')) return;
    if(typeof window._oaiArmCoverBackTrap === 'function'){
      window._oaiArmCoverBackTrap(reason || 'app-cover-ensure');
      return;
    }
    var st = history.state;
    if(st && st._p === 1 && st.oai_cover_trap) return;
    var href = location.href.split('#')[0];
    history.replaceState({_p:0, oai_cover_root:reason||'app-cover-ensure'}, '', href);
    history.pushState({_p:1, oai_cover_trap:reason||'app-cover-ensure'}, '', href);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _resetCoverBackTrap(reason){
  try{
    if(_isAppScreenActive()) return;
    var modal = document.getElementById('mass-quick-modal');
    if(modal && modal.classList.contains('show')) return;
    if(typeof window._oaiArmCoverBackTrap === 'function'){
      window._oaiArmCoverBackTrap(reason || 'app-cover-reset');
      return;
    }
    var st = history.state;
    if(st && st._p === 1 && st.oai_cover_trap) return;
    var href = location.href.split('#')[0];
    history.replaceState({_p:0, oai_cover_root:reason||'app-cover-reset'}, '', href);
    history.pushState({_p:1, oai_cover_trap:reason||'app-cover-reset'}, '', href);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

/* ── 앱 내부 Back Trap 관리 ──────────────────────────── */

function _ensureAppBackTrap(reason){
  try{
    if(!_isAppScreenActive()) return;
    var href = location.href.split('#')[0];
    var st = history.state;
    if(st && st._p === 1) return;
    history.replaceState({_p:0, oai_app_trap_from:reason||'app'}, '', href);
    history.pushState({_p:1, oai_app_trap:reason||'app'}, '', href);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function _resetAppBackTrap(reason){
  try{
    if(!_isAppScreenActive()) return;
    var href = location.href.split('#')[0];
    history.replaceState({_p:0, oai_app_root:reason||'app-reset'}, '', href);
    history.pushState({_p:1, oai_app_trap:reason||'app-reset'}, '', href);
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}

/* ── 종료 토스트 / 앱 종료 ───────────────────────────── */

function _showBackToast(){
  try{
    if(typeof _consumePrayerCoverNeedsFirstToast === 'function' && _consumePrayerCoverNeedsFirstToast()){
      window._exitReady = false;
      _clearCoverExitArmed();
      clearTimeout(window._exitTimer);
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
  if(window._exitReady || _isCoverExitArmed()){
    window._exitReady = false;
    _clearCoverExitArmed();
    clearTimeout(window._exitTimer);
    doExit();
    return true;
  }
  window._exitReady = true;
  _armCoverExitWindow();
  var old = document.getElementById('_bt');
  if(old) old.remove();
  var t = document.createElement('div');
  t.id = '_bt';
  t.textContent = '한 번 더 누르면 앱이 종료됩니다';
  t.style.cssText = 'position:fixed;top:50%;left:50%;bottom:auto;transform:translate(-50%,-50%);background:rgba(14,21,53,.94);color:#fff;padding:12px 24px;border-radius:24px;font-size:14px;font-weight:800;z-index:99999;white-space:nowrap;pointer-events:none;box-shadow:0 14px 36px rgba(0,0,0,.32);';
  document.body.appendChild(t);
  window._exitTimer = setTimeout(function(){
    window._exitReady = false;
    _clearCoverExitArmed();
    if(t.parentNode) t.remove();
  }, 2500);
  return false;
}
function attemptAppExit(){
  window._appExiting = true;
  var bt = document.getElementById('_bt');
  if(bt) bt.remove();
  try{ sessionStorage.removeItem('catholic_core_return_v1'); }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{ sessionStorage.removeItem('catholic_integrated_return_v2'); }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{ if(navigator.app && typeof navigator.app.exitApp === 'function'){ navigator.app.exitApp(); return; } }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{ window.open('', '_self'); window.close(); }catch(e){ console.warn('[가톨릭길동무]', e); }
  try{ document.documentElement.classList.add('app-exiting'); }catch(e){ console.warn('[가톨릭길동무]', e); }
  setTimeout(function(){ try{ history.back(); }catch(_e){} }, 40);
}
function closeExitDlg(){
  window._exitReady = false;
  clearTimeout(window._exitTimer);
  var bt = document.getElementById('_bt');
  if(bt) bt.remove();
  var dlg = document.getElementById('exit-dlg');
  if(dlg) dlg.classList.remove('open');
}
function doExit(){
  closeExitDlg();
  attemptAppExit();
}

/* ── window 전역 노출 (patches.js 등 외부에서 window.* 로 접근) ── */
window._resetCoverExitReady   = _resetCoverExitReady;
window._clearCoverExitArmed   = _clearCoverExitArmed;
window._armCoverExitWindow    = _armCoverExitWindow;
window._isCoverExitArmed      = _isCoverExitArmed;
window._isCoverScreenVisible  = _isCoverScreenVisible;
window._isAppScreenActive     = _isAppScreenActive;
window._ensureCoverBackTrap   = _ensureCoverBackTrap;
window._resetCoverBackTrap    = _resetCoverBackTrap;
window._ensureAppBackTrap     = _ensureAppBackTrap;
window._resetAppBackTrap      = _resetAppBackTrap;
window._showBackToast         = _showBackToast;
window.attemptAppExit         = attemptAppExit;
window.closeExitDlg           = closeExitDlg;
window.doExit                 = doExit;

/* ── 초기화: 앱 로드 시 종료 상태 리셋 ── */
window._exitReady = false;
window.__oaiCoverExitUntil = 0;
try{ sessionStorage.removeItem('oai_cover_exit_armed_until'); }catch(_e){}
