# PWA V4-1 구조 진단 보고서

기준 파일: `pwa_V3-129_myfaith_cancel_previous_step_full.zip`

작업 성격: **기능 수정 없음 / 구조 진단 전용**

이번 단계에서는 앱 동작 파일을 수정하지 않고, V4 경량화·표준화·중복 제거를 위한 진단 파일만 추가했습니다.

## 1. 핵심 판단

- 현재 앱은 기능은 풍부하지만 `app.js`, `style.css`, `patches.js`, `diocese.html`에 로직과 보정 코드가 많이 누적되어 있습니다.

- 특히 `style.css`의 selector 중복, `app.js/core.js`의 뒤로가기 함수 중복, `patches.js`의 사후 보정 로직이 향후 수정 난이도를 높이는 주요 원인입니다.

- V4의 목표는 별도 앱 분리가 아니라 **하나의 PWA 유지 + 공통 엔진 + 카테고리 모듈 + 패치 제거**입니다.

- 성당·성지·피정의집 지도/길찾기는 가장 위험하므로 후반 단계에서만 정리해야 합니다.


## 2. 파일 규모와 역할

| 파일 | 크기 | 줄 수 | 역할/판단 |
|---|---:|---:|---|
| `KakaoTalk_20260514_134255658_04.jpg` | 24,547 | - | 데이터/이미지/보조 파일 |
| `admin-notify.html` | 3,856 | 68 | 데이터/이미지/보조 파일 |
| `app.js` | 335,988 | 6896 | 커버, 지도, 성당·성지·피정의집, 외부링크, 새로고침, 나의 신앙생활 등 핵심 로직 대부분 |
| `constants.js` | 2,781 | 64 | 공통 상수 일부 |
| `core.js` | 9,025 | 209 | 앱 종료/커버 back trap 등 초기 공통 뒤로가기 성격 코드 |
| `diocese.html` | 275,548 | 2724 | 관구·교구 전용 iframe 화면. 지역검색, 중복지역, 사제찾기, 지도/카드 렌더링 포함 |
| `firebase-firestore-rules-qa-private.rules` | 1,548 | 42 | 데이터/이미지/보조 파일 |
| `firebase-messaging-sw.js` | 1,230 | 32 | 데이터/이미지/보조 파일 |
| `firestore.rules.sample` | 1,548 | 42 | 데이터/이미지/보조 파일 |
| `icon-192x192.png` | 9,810 | - | 데이터/이미지/보조 파일 |
| `icon-512x512-maskable.png` | 39,108 | - | 데이터/이미지/보조 파일 |
| `icon-512x512.png` | 52,021 | - | 데이터/이미지/보조 파일 |
| `index.html` | 59,382 | 966 | 커버/공통 DOM/설치 안내/메뉴/스크립트 로딩을 담당하는 진입 파일 |
| `ios-install-step1-kakao-bottom-buttons.png` | 9,740 | - | 데이터/이미지/보조 파일 |
| `ios-install-step2-safari-open.png` | 415,303 | - | 데이터/이미지/보조 파일 |
| `ios-install-step3-share-menu.png` | 117,502 | - | 데이터/이미지/보조 파일 |
| `ios-install-step4-home-screen.png` | 62,006 | - | 데이터/이미지/보조 파일 |
| `manifest.json` | 889 | 39 | 데이터/이미지/보조 파일 |
| `parishes-andong.js` | 7,621 | 6 | 데이터/이미지/보조 파일 |
| `parishes-busan.js` | 25,198 | 6 | 데이터/이미지/보조 파일 |
| `parishes-cheongju.js` | 15,227 | 6 | 데이터/이미지/보조 파일 |
| `parishes-chuncheon.js` | 13,522 | 6 | 데이터/이미지/보조 파일 |
| `parishes-daegu.js` | 39,215 | 6 | 데이터/이미지/보조 파일 |
| `parishes-daejeon.js` | 30,681 | 6 | 데이터/이미지/보조 파일 |
| `parishes-gwangju.js` | 25,576 | 6 | 데이터/이미지/보조 파일 |
| `parishes-incheon.js` | 25,796 | 6 | 데이터/이미지/보조 파일 |
| `parishes-jeju.js` | 5,572 | 6 | 데이터/이미지/보조 파일 |
| `parishes-jeonju.js` | 20,901 | 6 | 데이터/이미지/보조 파일 |
| `parishes-masan.js` | 12,289 | 6 | 데이터/이미지/보조 파일 |
| `parishes-military.js` | 406 | 6 | 데이터/이미지/보조 파일 |
| `parishes-seoul.js` | 31,763 | 6 | 데이터/이미지/보조 파일 |
| `parishes-suwon.js` | 49,781 | 6 | 데이터/이미지/보조 파일 |
| `parishes-uijeongbu.js` | 18,637 | 6 | 데이터/이미지/보조 파일 |
| `parishes-wonju.js` | 11,294 | 6 | 데이터/이미지/보조 파일 |
| `parishes.js` | 301 | 5 | 데이터/이미지/보조 파일 |
| `patches.js` | 68,759 | 1470 | 뒤로가기·기도문·스와이프·설치 안내 등 사후 보정/임시 보강 성격 로직 |
| `prayer.js` | 209,391 | 831 | 주요기도문 목록/본문/즐겨찾기/글자크기/교구별 기도 표시 |
| `privacy.html` | 15,444 | 359 | 개인정보처리방침 화면 |
| `qa-firebase.html` | 41,863 | 1105 | 문의·건의 접수 화면/Firebase 관련 화면 |
| `retreats.js` | 29,827 | 9 | 데이터/이미지/보조 파일 |
| `shrines.js` | 38,566 | 2 | 데이터/이미지/보조 파일 |
| `style.css` | 247,143 | 5993 | 전체 화면 디자인, 카테고리별 모드 CSS, 최근 수정 CSS와 중복 보정이 함께 존재 |
| `sw-update.js` | 6,766 | 114 | 서비스워커 등록/캐시 갱신/백그라운드 새로고침 보조 |
| `sw.js` | 3,438 | 100 | PWA 캐시 서비스워커 |
| `web.js` | 46,740 | 955 | 가톨릭 정보/웹사이트 목록, 즐겨찾기, 외부링크 상태 복원 |

## 3. JS 구조 진단

| 파일 | 함수 수 | 고유 함수 수 | addEventListener 수 | 주요 이벤트 |
|---|---:|---:|---:|---|
| `app.js` | 464 | 449 | 71 | click:19, pageshow:8, DOMContentLoaded:7, focus:6, load:6, visibilitychange:4, error:4, resize:4 |
| `core.js` | 17 | 17 | 0 |  |
| `firebase-messaging-sw.js` | 0 | 0 | 1 | notificationclick:1 |
| `patches.js` | 94 | 87 | 42 | DOMContentLoaded:9, load:8, pageshow:6, click:3, touchstart:2, touchend:2, pointerdown:2, popstate:1 |
| `prayer.js` | 37 | 37 | 11 | touchstart:2, touchmove:2, touchend:2, click:2, touchcancel:1, pageshow:1, visibilitychange:1 |
| `sw-update.js` | 8 | 8 | 2 | visibilitychange:1, DOMContentLoaded:1 |
| `sw.js` | 7 | 7 | 3 | install:1, activate:1, fetch:1 |
| `web.js` | 41 | 41 | 5 | click:3, pageshow:1, DOMContentLoaded:1 |

### 3-1. 중복 함수명 후보

아래는 이름이 중복되어 있거나, 역할이 겹칠 가능성이 큰 항목입니다. 삭제가 아니라 **소유 파일을 정한 뒤 이관**해야 합니다.

| 함수명 | 발견 위치 | 판단 |
|---|---|---|
| `finish` | app.js:433, app.js:1697, app.js:2038, app.js:2112, app.js:2167, app.js:2481, patches.js:1239 | 중복/역할 겹침 후보 |
| `$` | app.js:2424, patches.js:970, patches.js:1129, patches.js:1275 | 중복/역할 겹침 후보 |
| `run` | app.js:935, app.js:2402, app.js:5912, patches.js:391 | 중복/역할 겹침 후보 |
| `now` | app.js:278, app.js:6295, sw-update.js:16 | 작은 유틸 중복. 공통 util 후보 |
| `POOL` | app.js:4868, app.js:5232 | 중복/역할 겹침 후보 |
| `_armCoverExitWindow` | app.js:643, core.js:27 | 뒤로가기/종료 핵심 중복. core.js와 app.js 중 소유권 정리 필요 |
| `_clearCoverExitArmed` | app.js:637, core.js:21 | 뒤로가기/종료 핵심 중복. core.js와 app.js 중 소유권 정리 필요 |
| `_ensureAppBackTrap` | app.js:710, core.js:118 | 뒤로가기/종료 핵심 중복. core.js와 app.js 중 소유권 정리 필요 |
| `_ensureCoverBackTrap` | app.js:675, core.js:99 | 뒤로가기/종료 핵심 중복. core.js와 app.js 중 소유권 정리 필요 |
| `_isAppScreenActive` | app.js:671, core.js:55 | 뒤로가기/종료 핵심 중복. core.js와 app.js 중 소유권 정리 필요 |
| `_isCoverExitArmed` | app.js:650, core.js:34 | 뒤로가기/종료 핵심 중복. core.js와 app.js 중 소유권 정리 필요 |
| `_isCoverScreenVisible` | app.js:656, core.js:43 | 뒤로가기/종료 핵심 중복. core.js와 app.js 중 소유권 정리 필요 |
| `_resetAppBackTrap` | app.js:724, core.js:124 | 뒤로가기/종료 핵심 중복. core.js와 app.js 중 소유권 정리 필요 |
| `_resetCoverBackTrap` | app.js:692, core.js:107 | 뒤로가기/종료 핵심 중복. core.js와 app.js 중 소유권 정리 필요 |
| `_resetCoverExitReady` | app.js:627, core.js:11 | 뒤로가기/종료 핵심 중복. core.js와 app.js 중 소유권 정리 필요 |
| `_showBackToast` | app.js:2720, core.js:133 | 뒤로가기/종료 핵심 중복. core.js와 app.js 중 소유권 정리 필요 |
| `attemptAppExit` | app.js:2752, core.js:164 | 뒤로가기/종료 핵심 중복. core.js와 app.js 중 소유권 정리 필요 |
| `boot` | patches.js:866, patches.js:1319 | 중복/역할 겹침 후보 |
| `close` | app.js:1171, app.js:1245 | 중복/역할 겹침 후보 |
| `closeExitDlg` | app.js:2769, core.js:175 | 뒤로가기/종료 핵심 중복. core.js와 app.js 중 소유권 정리 필요 |
| `closeGuideModals` | patches.js:104, patches.js:1152 | 중복/역할 겹침 후보 |
| `doExit` | app.js:2775, core.js:183 | 뒤로가기/종료 핵심 중복. core.js와 app.js 중 소유권 정리 필요 |
| `done` | app.js:765, app.js:2281 | 중복/역할 겹침 후보 |
| `el` | patches.js:656, patches.js:782 | 중복/역할 겹침 후보 |
| `hideModal` | app.js:1311, app.js:1480 | 중복/역할 겹침 후보 |
| `init` | app.js:1486, patches.js:1075 | 중복/역할 겹침 후보 |
| `isGuideModalOpen` | patches.js:101, patches.js:1149 | 중복/역할 겹침 후보 |
| `isHorizontalSwipe` | patches.js:990, prayer.js:769 | 중복/역할 겹침 후보 |
| `isRefreshDialogOpen` | patches.js:89, patches.js:1146 | 중복/역할 겹침 후보 |
| `isTypingTarget` | patches.js:1130, sw-update.js:17 | 작은 유틸 중복. 공통 util 후보 |
| `prelim` | app.js:4869, app.js:5233 | 중복/역할 겹침 후보 |
| `prepareExternalUrl` | app.js:1611, web.js:311 | 외부링크 처리 중복. web.js 또는 common external 모듈로 통합 후보 |
| `showModal` | app.js:1301, app.js:1471 | 중복/역할 겹침 후보 |
| `sorted` | app.js:4903, app.js:5259 | 중복/역할 겹침 후보 |

## 4. CSS 구조 진단

- `style.css` selector 총 2,032개, 고유 selector 1,384개, 중복 selector 330개입니다.

- 중복의 상당 부분은 `retreat-mode`, `parish-mode`, 보호막/로딩, 커버, 글자 크기 관련 보정으로 보입니다.

- V4-2에서는 디자인 변경 없이 색상·간격·반지름·헤더 높이만 CSS 변수로 묶는 것이 안전합니다.


### 4-1. 중복 selector 상위 후보

| 횟수 | selector | 라인 | 판단 |
|---:|---|---|---|
| 9 | `:root` | 1, 3676, 3750, 3843, 3965, 4021, 4105, 4248, 5188 | CSS 변수 선언이 여러 번 흩어짐. V4-2 최우선 정리 후보 |
| 9 | `html.retreat-mode #tabbar .tab-btn.active` | 331, 3617, 3703, 3783, 3910, 3985, 4061, 4198, 4302 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 9 | `html.retreat-mode .dio-hd` | 3567, 3620, 3714, 3798, 3931, 4001, 4076, 4219, 4285 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 9 | `html.retreat-mode .filter-bar` | 3566, 3599, 3703, 3783, 3910, 3985, 4061, 4198, 4302 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 9 | `html.retreat-mode .li-badge` | 3567, 3624, 3718, 3805, 3939, 4010, 4082, 4229, 4289 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 9 | `html.retreat-mode .nearby-dist` | 3620, 3675, 3714, 3798, 3931, 4001, 4076, 4219, 4285 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 9 | `html.retreat-mode .nearby-num` | 3572, 3673, 3711, 3795, 3924, 3995, 4069, 4207, 4276 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 9 | `html.retreat-mode .nearby-type` | 3567, 3624, 3718, 3805, 3939, 4010, 4082, 4229, 4289 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 9 | `html.retreat-mode .region-list-hd` | 3620, 3675, 3714, 3798, 3931, 4001, 4076, 4219, 4285 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 9 | `html.retreat-mode .region-wrap` | 3566, 3599, 3703, 3783, 3910, 3985, 4061, 4198, 4302 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 9 | `html.retreat-mode .ric-lbl` | 3620, 3675, 3714, 3798, 3931, 4001, 4076, 4219, 4285 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 9 | `html.retreat-mode .sheet-hd` | 3566, 3599, 3703, 3783, 3910, 3985, 4061, 4198, 4302 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 8 | `html.retreat-mode` | 182, 3695, 3766, 3888, 3968, 4042, 4175, 4262 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 8 | `html.retreat-mode .ic-type-badge` | 3624, 3718, 3805, 3939, 4010, 4082, 4229, 4289 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 8 | `html.retreat-mode .ric-hd` | 1317, 3703, 3783, 3910, 3985, 4061, 4198, 4302 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 8 | `html.retreat-mode .sm-hd` | 3599, 3703, 3783, 3910, 3985, 4061, 4198, 4302 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 8 | `html.retreat-mode .srch-bar` | 3566, 3703, 3783, 3910, 3985, 4061, 4198, 4302 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 7 | `#oai-category-entry-veil::after` | 3016, 4364, 4408, 4424, 4488, 4513, 4541 | 보호막/로딩 관련. 기능 영향 가능성이 있어 후반 정리 |
| 7 | `.map-loading-icon` | 1335, 3679, 4358, 4408, 4424, 4468, 4513 | 보호막/로딩 관련. 기능 영향 가능성이 있어 후반 정리 |
| 7 | `html.oai-external-return-freeze::after` | 4364, 4408, 4424, 4438, 4488, 4513, 4541 | 중복 정리 후보 |
| 7 | `html.oai-stability-veil::after` | 3028, 4364, 4408, 4424, 4488, 4513, 4541 | 보호막/로딩 관련. 기능 영향 가능성이 있어 후반 정리 |
| 7 | `html.retreat-mode #region-body .nearby-dist` | 3714, 3798, 3931, 4001, 4076, 4219, 4285 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 7 | `html.retreat-mode #region-body .nearby-type` | 3718, 3805, 3939, 4010, 4082, 4229, 4289 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 7 | `html.retreat-mode #region-body .region-item .nearby-type` | 3718, 3805, 3939, 4010, 4082, 4229, 4289 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 7 | `html.retreat-mode #srch-modal #sm-tab-bar .sm-tab.active` | 1095, 3672, 3739, 3829, 4093, 4245, 4302 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 7 | `html.retreat-mode .filter-btn.active` | 3575, 3611, 3615, 3725, 3834, 3952, 4099 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 7 | `html.retreat-mode .sm-fb.on` | 3577, 3611, 3615, 3725, 3834, 3952, 4099 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 6 | `html.parish-mode .filter-btn.active` | 3556, 3611, 3614, 3725, 3834, 3952 | 중복 정리 후보 |
| 6 | `html.parish-mode .sheet-hd` | 3552, 3557, 3566, 3599, 3683, 4145 | 중복 정리 후보 |
| 6 | `html.parish-mode .sm-fb.on` | 3576, 3611, 3614, 3725, 3834, 3952 | 중복 정리 후보 |
| 6 | `html.retreat-mode #nearby-body .nearby-num` | 3795, 3924, 3995, 4069, 4207, 4276 | 피정의집 모드 CSS 중복 누적. V4 후반부 카테고리 CSS 분리 후보 |
| 5 | `#diocese-loading .missa-spinner` | 4385, 4408, 4424, 4468, 4513 | 보호막/로딩 관련. 기능 영향 가능성이 있어 후반 정리 |
| 5 | `.cv-extra-row` | 3528, 3544, 3544, 3548, 3548 | 중복 정리 후보 |
| 5 | `.filter-btn.active` | 611, 3611, 3725, 3834, 3952 | 중복 정리 후보 |
| 5 | `.sm-fb.on` | 886, 3611, 3725, 3834, 3952 | 중복 정리 후보 |
| 5 | `html.parish-mode` | 156, 3679, 3862, 4115, 4253 | 중복 정리 후보 |

## 5. patches.js 진단

`patches.js`는 바로 삭제하면 안 됩니다. 먼저 역할별로 본 코드에 흡수할 것과 유지할 것을 나눠야 합니다.

| 영역 | 관련 라인 일부 | 판단 |
|---|---|---|
| 뒤로가기/종료/히스토리 | 1, 2, 7, 18, 19, 33, 34, 41, 44, 45, 50, 52, 53, 54, 58 | 위험 영역. 삭제 금지, 소유권 먼저 정리 |
| 기도문 | 12, 21, 118, 119, 120, 121, 122, 146, 196, 197, 198, 199, 200, 201, 281 | 분류 후 본 코드 이관 후보 |
| 새로고침/보호막 | 56, 58, 60, 62, 63, 65, 66, 90, 94, 106, 584, 586, 621, 870, 939 | 위험 영역. 삭제 금지, 소유권 먼저 정리 |
| 외부링크/복귀 | 27, 43, 72, 75, 77, 78, 80, 81, 82, 85, 86, 90, 95, 98, 99 | 위험 영역. 삭제 금지, 소유권 먼저 정리 |
| 설치안내 | 876, 889, 902, 911, 1210, 1267, 1268, 1354 | 분류 후 본 코드 이관 후보 |
| 터치/스와이프 | 362, 973, 975, 976, 979, 993, 994, 995, 997, 998, 999, 1076, 1102, 1105, 1200 | 분류 후 본 코드 이관 후보 |
| 나의 신앙생활 | 12, 102, 139, 145, 148, 149, 152, 246, 356, 731, 732, 733, 735, 739, 745 | 분류 후 본 코드 이관 후보 |

## 6. 위험 구역 목록

아래 영역은 V4 초반에 기능 수정 또는 삭제를 하면 안 됩니다.

- 뒤로가기/앱 종료 흐름: app.js, core.js, patches.js에 걸쳐 있어 소유권 정리 전 수정 금지
- 지도/길찾기/보라색 마커/현재위치: 성당·성지·피정의집 공통화는 V4 후반부로 연기
- 관구·교구 지역검색/중복지역 안내 박스: diocese.html 내부에서 안정화된 상태이므로 초기에는 CSS/JS 분리만 검토
- 나의 신앙생활 확인/취소/임시값 저장 흐름: 최근 정상화된 로직이므로 모듈화 전 테스트 케이스 고정 필요
- 서비스워커/캐시: 버전 관리와 연결되어 있어 구조개편 단계별로 별도 확인 필요
- 외부링크 복귀 보호막: pageshow/pagehide/visibilitychange 이벤트가 많아 중복 제거 전 동작 기록 필요
- 문의·건의/Firebase: 공개 전 보안/비공개 접수 구조이므로 리팩터링 범위 밖으로 유지

## 7. 삭제 가능 후보와 보류 후보

현재 단계에서 실제 삭제는 하지 않았습니다. 다음 단계에서 후보별로 검증해야 합니다.

| 후보 | 처리 방향 | 이유 |
|---|---|---|
| 중복 CSS selector | V4-2/V4-3에서 통합 | 같은 selector가 여러 위치에서 덮어써 수정 영향 범위를 예측하기 어려움 |
| 작은 유틸 함수 중복 `now`, `isTypingTarget` 등 | common util로 이동 | 기능 영향이 작아 초기 공통화 후보 |
| app.js와 core.js의 뒤로가기 함수 중복 | 소유권 결정 후 하나로 통합 | 바로 삭제하면 앱 종료/뒤로가기 손상 가능 |
| patches.js 일부 DOMContentLoaded/load 보정 | 본 함수에 흡수 후 제거 | 패치 누적의 핵심 원인 |
| 과거 V3 주석/버전 흔적 | 기능 안정 후 정리 | 현재는 진단 자료로 남겨 두는 것이 안전 |

## 8. V4 권장 작업 순서

| 버전 | 작업 | 범위 |
|---|---|---|
| V4-1 | 구조 진단 | 기능 변경 없음. 본 보고서 생성 |
| V4-2 | CSS 토큰화 | 색상/간격/반지름/헤더 높이 변수화. 디자인 변경 금지 |
| V4-3 | 공통 UI CSS | X 버튼, 헤더, 카드, 검색창, 확인/취소 버튼 표준화 |
| V4-4 | 나의 신앙생활 모듈화 | 최근 안정화된 확인/취소/임시값 흐름을 독립 모듈로 이동 |
| V4-5 | 모달/팝업 공통화 | 메뉴, 주요기능, 미사 빠른 사용, 나의 신앙생활 팝업 구조 정리 |
| V4-6 | patches.js 1차 정리 | 삭제가 아니라 본 코드로 이관. 위험 이벤트는 보류 |
| V4-7 | 순례길/웹사이트 카드 공통화 | 지도와 덜 얽힌 화면부터 정리 |
| V4-8 | 기도문 모듈 정리 | 본문/즐겨찾기/글자크기 흐름 보존 |
| V4-9 | 관구·교구 분리 준비 | diocese.html CSS/JS 분리. 지역검색 로직 보존 |
| V4-10+ | 성당·성지·피정의집 공통화 | 지도/길찾기 포함. 가장 마지막 단계 |

## 9. V4-2 진입 전 체크리스트

- V3-129 또는 그 이후 정상 파일을 구조개편 전 백업으로 고정
- PWA와 WebView를 동시에 수정하지 않기
- V4-2에서는 CSS 변수화만 하고 화면 디자인 변경 금지
- 지도/길찾기/뒤로가기/현재위치/서비스워커 로직은 V4-2에서 수정 금지
- 수정 후 전체 zip과 수정 파일 zip을 따로 제공
- JS 문법 검사와 zip 무결성 검사 유지

## 10. Step 1 자체 점검 결과

- 앱 실행 코드 수정: 없음
- 새로 추가한 파일: `AUDIT_V4-1.md`, `AUDIT_V4-1_raw.json`
- JS 파일 `node --check`: 통과
- HTML inline script `node --check`: 통과
- 다음 단계 권장: `V4-2-css-tokens`
