/* myfaith.js — 나의 신앙생활 전용 JS */
'use strict';

(function(){
  window.bindMyFaithLifePanel = function(on){
    var DIO_KEY = 'oai_my_diocese_name';
    var PARISH_KEY = 'oai_my_parish_data';
    var NO_PARISH_NAME = '본당 선택 안함';
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
    var menuBtn = document.getElementById('cover-menu-myfaith-btn');
    var setupBanner = document.getElementById('my-diocese-setup-banner');
    var modal = document.getElementById('my-diocese-modal');
    var body = document.getElementById('my-diocese-list');
    var title = document.getElementById('my-diocese-title');
    var subtitle = modal ? modal.querySelector('.my-diocese-subtitle') : null;
    if(!btn || !modal || !body) return;

    var state = 'info';
    var tempDiocese = '';
    var tempParish = null;
    var stableHeight = 0;
    var setupBannerRefreshTimer = null;

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
          url:String(item.url || ''),
          none:isNoParishItem(item)
        }));
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function noParishItem(dioceseName){
      return {name:NO_PARISH_NAME, diocese:String(dioceseName || ''), addr:'', hp:'', url:'', none:true};
    }
    function isNoParishItem(item){
      return !!(item && (item.none === true || String(item.name || '') === NO_PARISH_NAME));
    }
    function cloneParish(item){
      if(!item || !item.name) return null;
      return {
        name:String(item.name || ''),
        diocese:String(item.diocese || ''),
        addr:String(item.addr || ''),
        hp:String(item.hp || ''),
        url:String(item.url || ''),
        none:isNoParishItem(item)
      };
    }
    function safeText(x){
      return String(x || '').replace(/[&<>"']/g, function(c){
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c);
      });
    }
    function alertMsg(msg){
      try{ alert(msg); }catch(_e){}
    }
    function setHeader(main, sub){
      if(title){
        title.textContent = main || '나의 신앙생활';
        try{ title.setAttribute('data-myfaith-title', title.textContent); }catch(_e){}
      }
      if(subtitle) subtitle.textContent = sub || '';
    }
    function setBodyMode(name){
      body.className = name || 'my-faith-body';
      body.innerHTML = '';
    }
    function bindMyFaithClick(el, fn){
      if(!el || typeof fn !== 'function') return;
      el.addEventListener('click', function(e){
        if(e && e.preventDefault) e.preventDefault();
        if(e && e.stopPropagation) e.stopPropagation();
        try{ document.activeElement && document.activeElement.blur && document.activeElement.blur(); }catch(_e){}
        fn(e);
        return false;
      }, false);
    }
    function smallButton(label, fn){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'my-faith-small-btn';
      b.textContent = label;
      bindMyFaithClick(b, function(){ fn && fn(); });
      return b;
    }
    function rowButton(label, fn, disabled, cls){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'my-faith-row-btn' + (cls ? (' ' + cls) : '');
      b.textContent = label;
      if(disabled) b.disabled = true;
      else bindMyFaithClick(b, function(){ fn && fn(); });
      return b;
    }
    function listSection(t, c){
      var sec = document.createElement('section');
      sec.className = 'my-faith-section my-faith-list-section ' + (c || '');
      var h = document.createElement('h3');
      h.textContent = t;
      sec.appendChild(h);
      return sec;
    }
    function appendRow(sec, label, value, status, buttonLabel, fn, disabled, cls){
      var row = document.createElement('div');
      row.className = 'my-faith-list-row' + (disabled ? ' is-disabled' : '') + (status ? (' has-status-' + status) : '');
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
      if(buttonLabel) row.appendChild(rowButton(buttonLabel, fn, disabled, cls));
      sec.appendChild(row);
      return row;
    }
    function appendPrivacyNote(){
      var note = document.createElement('div');
      note.className = 'my-faith-inline-privacy-note';
      note.textContent = '선택한 교구와 본당 정보는 이 기기 안에만 저장되며, 외부로 수집되거나 전송되지 않습니다.';
      body.appendChild(note);
    }
    function appendConfirmButton(onConfirm){
      var wrap = document.createElement('div');
      wrap.className = 'my-faith-inline-confirm';
      var ok = document.createElement('button');
      ok.type = 'button';
      ok.className = 'my-faith-confirm-btn';
      ok.textContent = '확인';
      bindMyFaithClick(ok, function(){
        var result = true;
        if(typeof onConfirm === 'function') result = onConfirm();
        if(result === false || result === 'stay') return;
        closeModal();
      });
      wrap.appendChild(ok);
      body.appendChild(wrap);
    }
    function updateMyFaithViewport(){
      try{
        var vv = window.visualViewport || null;
        var layoutH = Math.round(document.documentElement.clientHeight || window.innerHeight || 0);
        var innerH = Math.round(window.innerHeight || 0);
        var visibleH = Math.round((vv && vv.height) || innerH || layoutH || 0);
        var candidateH = Math.max(layoutH || 0, innerH || 0, visibleH || 0);
        if(candidateH && candidateH > stableHeight) stableHeight = candidateH;
        if(!stableHeight) stableHeight = candidateH || visibleH || 0;
        var active = document.activeElement || null;
        var focusedInput = !!(active && modal.contains(active) && /^(INPUT|TEXTAREA|SELECT)$/i.test(active.tagName || ''));
        var keyboardLikely = focusedInput || !!(stableHeight && visibleH && visibleH < stableHeight - 120) || !!(vv && Math.round(vv.offsetTop || 0) > 0);
        if(visibleH > 0) modal.style.setProperty('--my-faith-vh', visibleH + 'px');
        modal.style.setProperty('--my-faith-visible-vh', visibleH + 'px');
        modal.classList.toggle('keyboard-open', keyboardLikely);
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function isElementVisible(el){
      try{
        if(!el || el.hidden) return false;
        if(el.getAttribute && el.getAttribute('aria-hidden') === 'true') return false;
        var cs = window.getComputedStyle ? window.getComputedStyle(el) : null;
        if(cs && (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0')) return false;
        return true;
      }catch(_e){ return false; }
    }
    function isInstallGuideVisible(){
      return isElementVisible(document.getElementById('pwa-install-btn')) ||
             isElementVisible(document.getElementById('ios-kakao-safari-banner'));
    }
    function updateSetupBanner(){
      try{
        var showBanner = !selectedName() && !isInstallGuideVisible();
        var coverEl = document.getElementById('cover');
        if(coverEl) coverEl.classList.toggle('my-diocese-setup-active', showBanner);
        if(!setupBanner) return;
        setupBanner.hidden = !showBanner;
        setupBanner.classList.toggle('show', showBanner);
        setupBanner.setAttribute('aria-hidden', showBanner ? 'false' : 'true');
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function scheduleSetupBannerUpdate(){
      try{
        if(setupBannerRefreshTimer) clearTimeout(setupBannerRefreshTimer);
        setupBannerRefreshTimer = setTimeout(function(){ setupBannerRefreshTimer = null; updateSetupBanner(); }, 40);
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function bindSetupBannerVisibilityWatch(){
      try{
        ['pwa-install-btn','ios-kakao-safari-banner'].forEach(function(id){
          var el = document.getElementById(id);
          if(!el || el.__myDioceseSetupWatchBound) return;
          el.__myDioceseSetupWatchBound = true;
          new MutationObserver(scheduleSetupBannerUpdate).observe(el, {attributes:true, attributeFilter:['style','hidden','class','aria-hidden']});
        });
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function updateButton(){
      btn.innerHTML = '<span class="cover-faith-cross" aria-hidden="true">✞</span><span class="diocese-btn-label">나의 신앙생활</span>';
      btn.setAttribute('aria-label', '나의 신앙생활 열기');
      updateSetupBanner();
    }
    function refreshDependentViews(){
      try{ if(typeof _renderDioFilterBars === 'function') _renderDioFilterBars(_mode); }catch(_e){}
      try{ if(typeof window.webRenderCats === 'function') window.webRenderCats(); }catch(_e){}
      try{ if(typeof window.webRenderList === 'function') window.webRenderList(); }catch(_e){}
      try{ if(typeof window.prRefreshVisibleCats === 'function') window.prRefreshVisibleCats(); }catch(_e){}
    }
    function clearTemp(){
      tempDiocese = '';
      tempParish = null;
      state = 'info';
    }
    function startEdit(){
      tempDiocese = '';
      tempParish = null;
      state = 'edit-diocese';
      renderEdit();
    }
    function cancelEdit(){
      clearTemp();
      if(selectedName()) renderInfo();
      else closeModal();
    }
    function commitEdit(){
      var name = String(tempDiocese || '').trim();
      var parish = cloneParish(tempParish);
      if(!name){
        alertMsg('교구를 선택해 주세요.');
        state = 'edit-diocese';
        renderEdit();
        return false;
      }
      if(!parish || !parish.name) parish = noParishItem(name);
      if(isNoParishItem(parish)) parish.diocese = name;
      setSelectedName(name);
      setSelectedParish(parish);
      clearTemp();
      updateButton();
      refreshDependentViews();
      renderInfo();
      return true;
    }
    function getSelectedDioceseCode(name){
      name = String(name || tempDiocese || '').trim();
      if(!name) return null;
      try{ if(typeof _PARISH_DIO_CODE_MAP !== 'undefined' && _PARISH_DIO_CODE_MAP && _PARISH_DIO_CODE_MAP[name]) return _PARISH_DIO_CODE_MAP[name]; }catch(_e){}
      try{
        for(var code in _DIO){
          if(Object.prototype.hasOwnProperty.call(_DIO, code) && _DIO[code] === name) return code;
        }
      }catch(_e){}
      return null;
    }
    function getParishItems(){
      try{ if(Array.isArray(PARISHES) && PARISHES.length) return PARISHES; }catch(_e){}
      return [];
    }
    function sortParishItems(items){
      return items.slice().sort(function(a, b){ return String(a && a.name || '').localeCompare(String(b && b.name || ''), 'ko'); });
    }
    function goExternal(url){
      url = String(url || '').trim();
      if(!url) return;
      try{
        if(typeof prepareExternalUrl === 'function') url = prepareExternalUrl(url);
        else if(typeof normalizeCatholicExternalUrl === 'function') url = normalizeCatholicExternalUrl(url);
      }catch(_e){}
      url = String(url || '').trim();
      if(!url) return;
      try{ document.activeElement && document.activeElement.blur && document.activeElement.blur(); }catch(_e){}
      try{
        var opened = window.open(url, '_blank', 'noopener,noreferrer');
        if(opened){
          try{ opened.focus && opened.focus(); }catch(_e){}
          return;
        }
      }catch(_e){}
      alertMsg('새 창 열기가 차단되었습니다. 브라우저의 팝업 차단을 해제한 뒤 다시 눌러 주세요.');
    }

    function appendDiocesePicker(sec){
      var grid = document.createElement('div');
      grid.className = 'my-faith-inline-diocese-grid';
      dioceses.forEach(function(name){
        var item = document.createElement('button');
        item.type = 'button';
        item.className = 'my-faith-inline-diocese-option' + (tempDiocese === name ? ' selected' : '');
        item.textContent = name;
        item.setAttribute('aria-pressed', tempDiocese === name ? 'true' : 'false');
        bindMyFaithClick(item, function(){
          tempDiocese = name;
          tempParish = null;
          state = 'edit-parish';
          renderEdit();
        });
        grid.appendChild(item);
      });
      sec.appendChild(grid);
    }
    function appendParishDisabledHint(sec){
      var wrap = document.createElement('div');
      wrap.className = 'my-faith-inline-parish-disabled';
      wrap.innerHTML = '<div class="my-faith-inline-note">본당 선택은 교구를 먼저 선택한 뒤 가능합니다.</div><div class="my-faith-inline-disabled-input">본당명 또는 주소 검색</div><div class="my-faith-inline-empty">교구를 먼저 선택해 주세요.</div>';
      sec.appendChild(wrap);
    }
    function appendParishSearch(sec){
      if(!tempDiocese){ appendParishDisabledHint(sec); return; }
      var wrap = document.createElement('div');
      wrap.className = 'my-faith-inline-parish-search';
      var input = document.createElement('input');
      input.type = 'search';
      input.className = 'my-faith-search-input my-faith-inline-search-input';
      input.placeholder = '본당명 또는 주소 검색';
      var results = document.createElement('div');
      results.className = 'my-faith-search-results my-faith-inline-search-results';
      var tools = document.createElement('div');
      tools.className = 'my-faith-tools my-faith-inline-parish-tools';
      tools.appendChild(smallButton('선택 안함', function(){
        tempParish = noParishItem(tempDiocese);
        renderEdit();
      }));
      wrap.appendChild(input);
      wrap.appendChild(results);
      wrap.appendChild(tools);
      sec.appendChild(wrap);

      function draw(){
        var q = String(input.value || '').trim().toLowerCase();
        var items = getParishItems().filter(function(p){ return p && p.diocese === tempDiocese; });
        if(q){
          items = items.filter(function(p){
            return String((p.name || '') + ' ' + (p.addr || '') + ' ' + (p.diocese || '')).toLowerCase().indexOf(q) >= 0;
          });
        }
        items = sortParishItems(items);
        results.innerHTML = '';
        if(!items.length){
          results.innerHTML = '<div class="my-faith-empty">검색 결과가 없습니다.</div>';
          return;
        }
        items.forEach(function(p){
          var card = document.createElement('button');
          card.type = 'button';
          card.className = 'my-faith-parish-result' + (tempParish && tempParish.name === p.name && tempParish.diocese === p.diocese ? ' selected' : '');
          card.innerHTML = '<strong>' + safeText(p.name) + '</strong><span>' + safeText(p.diocese || '') + (p.addr ? ' · ' + safeText(p.addr) : '') + '</span>';
          bindMyFaithClick(card, function(){
            tempParish = cloneParish(p);
            renderEdit();
          });
          results.appendChild(card);
        });
      }
      input.addEventListener('input', draw);
      input.addEventListener('focus', function(){ try{ modal.classList.add('keyboard-open'); updateMyFaithViewport(); }catch(_e){} });
      input.addEventListener('blur', function(){ setTimeout(updateMyFaithViewport, 180); });

      var code = getSelectedDioceseCode(tempDiocese);
      if(code && typeof _ensureParishDioceseDataLoaded === 'function'){
        results.innerHTML = '<div class="my-faith-empty">' + safeText(tempDiocese) + ' 본당 정보를 불러오는 중입니다...</div>';
        _ensureParishDioceseDataLoaded(code).then(function(){ draw(); }).catch(function(){ draw(); });
      }else if(typeof _ensureParishDataLoaded === 'function'){
        results.innerHTML = '<div class="my-faith-empty">성당 정보를 불러오는 중입니다...</div>';
        _ensureParishDataLoaded().then(function(){ draw(); }).catch(function(){ draw(); });
      }else{
        draw();
      }
      setTimeout(updateMyFaithViewport, 80);
    }

    function appendEditChoiceCard(sec, label, value, buttonLabel, fn, cls){
      var card = document.createElement('div');
      card.className = 'my-faith-edit-choice-card' + (cls ? (' ' + cls) : '');
      var main = document.createElement('div');
      main.className = 'my-faith-edit-choice-main';
      var k = document.createElement('span');
      k.className = 'my-faith-edit-choice-label';
      k.textContent = label || '';
      var v = document.createElement('strong');
      v.className = 'my-faith-edit-choice-value';
      v.textContent = value || '';
      main.appendChild(k);
      main.appendChild(v);
      card.appendChild(main);
      if(buttonLabel){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'my-faith-edit-choice-btn';
        b.textContent = buttonLabel;
        bindMyFaithClick(b, function(){ fn && fn(); });
        card.appendChild(b);
      }
      sec.appendChild(card);
      return card;
    }
    function appendEditLabel(sec, text){
      var label = document.createElement('div');
      label.className = 'my-faith-edit-sub-label';
      label.textContent = text || '';
      sec.appendChild(label);
      return label;
    }
    function appendEditActions(){
      var wrap = document.createElement('div');
      wrap.className = 'my-faith-edit-actions';
      var ok = document.createElement('button');
      ok.type = 'button';
      ok.className = 'my-faith-confirm-btn my-faith-edit-confirm-btn';
      ok.textContent = '확인';
      bindMyFaithClick(ok, function(){ commitEdit(); });
      var cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'my-faith-small-btn my-faith-edit-cancel-btn';
      cancel.textContent = '취소';
      bindMyFaithClick(cancel, cancelEdit);
      wrap.appendChild(ok);
      wrap.appendChild(cancel);
      body.appendChild(wrap);
    }
    function renderEdit(){
      if(state !== 'edit-parish') state = 'edit-diocese';
      setHeader('나의 설정', '교구와 본당을 선택해 주세요');
      setBodyMode('my-faith-body my-faith-home-list-body my-faith-edit-accordion-body');

      var settings = listSection('나의 설정', 'my-faith-settings-section my-faith-setup-editor');

      if(state === 'edit-diocese'){
        appendRow(settings, '내 교구', '교구를 먼저 선택해 주세요.', 'needed', '', null, false, 'my-faith-row-btn-set');
        appendDiocesePicker(settings);
      }else{
        appendRow(settings, '내 교구', tempDiocese, 'done', '다시 선택', function(){
          tempDiocese = '';
          tempParish = null;
          state = 'edit-diocese';
          renderEdit();
        }, false, 'my-faith-row-btn-set');

        if(tempParish && tempParish.name){
          appendRow(settings, '내 본당', isNoParishItem(tempParish) ? '선택하지 않아도 저장할 수 있습니다.' : tempParish.name, 'done', '다시 선택', function(){
            tempParish = null;
            state = 'edit-parish';
            renderEdit();
          }, false, 'my-faith-row-btn-set');
        }else{
          appendRow(settings, '내 본당', '선택하지 않아도 저장할 수 있습니다.', 'done', '', null, false, 'my-faith-row-btn-set');
          appendParishSearch(settings);
        }
      }

      body.appendChild(settings);
      appendEditActions();
      appendPrivacyNote();
      try{ body.scrollTop = 0; }catch(_e){}
    }
    function renderInfo(){
      var name = selectedName();
      if(!name){ startEdit(); return; }
      var info = DIO_INFO[name] || null;
      var parish = selectedParish();
      setHeader('나의 신앙생활', '내 교구·본당 정보를 확인');
      setBodyMode('my-faith-body my-faith-home-list-body');

      var quick = listSection('내 교구·본당 정보', 'my-faith-quick-section');
      appendRow(quick, name + ' 홈페이지', '', '', '열기', function(){ if(info && info.home) goExternal(info.home); }, !(info && info.home), 'my-faith-row-btn-open');
      appendRow(quick, name + ' 사제 찾기', '', '', '열기', function(){ if(info && info.priest) goExternal(info.priest); }, !(info && info.priest), 'my-faith-row-btn-open');
      if(!parish || isNoParishItem(parish)){
        appendRow(quick, '내 본당', NO_PARISH_NAME, '', '변경', startEdit, false, 'my-faith-row-btn-set');
      }else{
        if(parish.hp){
          var parishHomeRow = appendRow(quick, parish.name + ' 홈페이지', '', '', '열기', function(){ goExternal(parish.hp); }, false, 'my-faith-row-btn-open');
          if(parishHomeRow) parishHomeRow.classList.add('my-faith-parish-info-row');
        }
        if(parish.url){
          var parishDetailRow = appendRow(quick, parish.name + ' 상세정보', '', '', '열기', function(){ goExternal(parish.url); }, false, 'my-faith-row-btn-open');
          if(parishDetailRow) parishDetailRow.classList.add('my-faith-parish-info-row');
        }
      }
      body.appendChild(quick);

      appendConfirmButton();
      var changeWrap = document.createElement('div');
      changeWrap.className = 'my-faith-change-settings-wrap';
      var changeBtn = document.createElement('button');
      changeBtn.type = 'button';
      changeBtn.className = 'my-faith-change-settings-btn';
      changeBtn.textContent = '교구·본당 변경';
      bindMyFaithClick(changeBtn, startEdit);
      changeWrap.appendChild(changeBtn);
      body.appendChild(changeWrap);
      appendPrivacyNote();
      try{ body.scrollTop = 0; }catch(_e){}
    }
    function closeModal(){
      clearTemp();
      modal.classList.remove('show','keyboard-open','return-settling');
      modal.setAttribute('aria-hidden', 'true');
      try{ document.body.classList.remove('modal-open'); }catch(_e){}
      try{ modal.style.removeProperty('--my-faith-vh'); modal.style.removeProperty('--my-faith-visible-vh'); }catch(_e){}
      stableHeight = 0;
      try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ if(typeof window._resetCoverBackTrap === 'function') window._resetCoverBackTrap('my-faith-close'); }catch(e){ console.warn('[가톨릭길동무]', e); }
      updateSetupBanner();
    }
    function openModal(){
      if(selectedName()) renderInfo();
      else startEdit();
      updateMyFaithViewport();
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      try{ document.body.classList.add('modal-open'); }catch(_e){}
      try{
        if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
        if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed();
        if(typeof window._pushCoverOverlayBackTrap === 'function') window._pushCoverOverlayBackTrap('my-faith', 'my-faith-open');
      }catch(e){ console.warn('[가톨릭길동무]', e); }
      setTimeout(updateMyFaithViewport, 80);
    }

    window.isMyFaithLifeModalOpen = function(){
      try{ return !!(modal && modal.classList.contains('show')); }catch(_e){ return false; }
    };
    window.closeMyFaithLifeModal = function(){ closeModal(); };
    window.refreshMyDioceseSetupBanner = scheduleSetupBannerUpdate;

    if(window.visualViewport){
      window.visualViewport.addEventListener('resize', function(){ if(modal.classList.contains('show')) updateMyFaithViewport(); }, {passive:true});
    }
    window.addEventListener('resize', function(){ if(modal.classList.contains('show')) updateMyFaithViewport(); }, {passive:true});

    bindSetupBannerVisibilityWatch();
    updateButton();
    ['beforeinstallprompt','appinstalled','pageshow','load','resize'].forEach(function(ev){
      try{ window.addEventListener(ev, scheduleSetupBannerUpdate, {passive:true}); }catch(_e){ window.addEventListener(ev, scheduleSetupBannerUpdate); }
    });
    setTimeout(scheduleSetupBannerUpdate, 120);
    setTimeout(scheduleSetupBannerUpdate, 600);

    function openFromButton(e){
      if(e && e.preventDefault) e.preventDefault();
      if(e && e.stopPropagation) e.stopPropagation();
      try{ if(typeof window.closeCoverMenuPopup === 'function') window.closeCoverMenuPopup(); }catch(_e){}
      openModal();
    }
    on(btn, 'click', openFromButton);
    if(setupBanner) on(setupBanner, 'click', openFromButton);
    if(menuBtn) on(menuBtn, 'click', openFromButton);
    on('my-diocese-close', 'click', function(e){ if(e && e.preventDefault) e.preventDefault(); closeModal(); });
    modal.addEventListener('click', function(e){
      if(e && e.target && e.target.getAttribute && e.target.getAttribute('data-my-diocese-close') === 'true') closeModal();
    });
    document.addEventListener('keydown', function(e){ if(e && e.key === 'Escape' && modal.classList.contains('show')) closeModal(); });
  };
})();
