(function(){
  'use strict';
  try{
    var required=['DIOCESE_META','OVERLAP_SUMMARY','REGION_OVERLAP_PLAIN','NAME_SAME','SEARCH_DB','GW_OF','DIOCESE_ICO'];
    var missing=[];
    required.forEach(function(name){
      try{
        if(typeof eval(name)==='undefined') missing.push(name);
      }catch(e){ missing.push(name); }
    });
    if(missing.length){
      console.warn('[가톨릭길동무] 교구지도 데이터 로딩 누락:', missing.join(', '));
    }
  }catch(e){
    console.warn('[가톨릭길동무] 교구지도 데이터 점검 실패', e);
  }
})();
