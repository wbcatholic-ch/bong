(function(){
  'use strict';
  /* V6-164 확인용: 기존 back-controller 기능은 사용하지 않고, 뒤로가기 입력은 아무 동작 없이 소비한다. */
  window.__BACK_CTRL__ = true;
  window.__OAI_FULL_BACK_CTRL_ACTIVE__ = false;
  window._oaiArmCoverBackTrap = function(){};
  window._oaiSuppressNextCoverBackToast = function(){};
  if(typeof window.oaiArmBackBlocker === 'function'){
    try{ window.oaiArmBackBlocker(); }catch(_e){}
  }
})();
