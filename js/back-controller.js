(function(){
  'use strict';
  /* V6-163 확인용: 기존 popstate/backbutton 컨트롤러를 완전히 비활성화한다. X 버튼만 유지한다. */
  window.__BACK_CTRL__ = true;
  window.__OAI_FULL_BACK_CTRL_ACTIVE__ = false;
  window._oaiArmCoverBackTrap = function(){};
  window._oaiSuppressNextCoverBackToast = function(){};
})();
