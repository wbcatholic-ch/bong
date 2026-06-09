# AUDIT V4-60 - 중복/패치 잔여 지도

기준 파일: pwa_V4-59_route_choice_overlay_css_dedupe_full.zip

이번 단계는 실행 코드 수정 없이, 다음 제거 순서를 정하기 위한 전체 재점검입니다.

## CSS 중복 요약
- `style.css`: 4526줄, selector 769개, 중복 selector 후보 60개
- `css/cover-modals.css`: 239줄, selector 28개, 중복 selector 후보 0개
- `css/diocese.css`: 575줄, selector 206개, 중복 selector 후보 20개
- `css/module-common.css`: 304줄, selector 21개, 중복 selector 후보 0개
- `css/my-diocese.css`: 86줄, selector 19개, 중복 selector 후보 0개
- `css/myfaith.css`: 221줄, selector 61개, 중복 selector 후보 4개
- `css/overlays.css`: 166줄, selector 23개, 중복 selector 후보 2개
- `css/pilgrimage.css`: 106줄, selector 44개, 중복 selector 후보 0개
- `css/prayer.css`: 272줄, selector 68개, 중복 selector 후보 0개
- `css/web.css`: 155줄, selector 49개, 중복 selector 후보 0개

## 즉시 조심해야 할 영역
- `style.css`: 커버, 지도 색상/카테고리 모드, 검색 모달, 로딩/안정막 관련 중복이 아직 많음.
- `css/diocese.css`: 관구·교구 화면 내부의 header/search/duplicate-warning 중복이 많음. 실제 화면이 민감하므로 다음 후보로는 “CSS만” 먼저 처리.
- `css/myfaith.css`: 남은 중복은 대부분 홈 화면/작은 화면 media override라 바로 제거하지 않음.
- `css/overlays.css`: route-choice의 media override가 중복으로 잡히지만 작은 화면용 정상 override라 제거하지 않음.

## 다음 권장 제거 순서
1. V4-61: `diocese.css` 관구·교구 헤더/탭/검색창 중복 CSS 정리. JS 수정 없음.
2. V4-62: `diocese.css` 중복지역 안내 박스 CSS 정리. 위치가 민감하므로 값 변경 없이 기준 위치만 단일화.
3. V4-63: `style.css` 커버 booting/cover-main-block 중복 정리. 커버 밀림과 연결되어 값 변경 없이 중복만 제거.
4. V4-64: `style.css` 검색 모달 `#sm-tab-bar`, `.sm-x`, `.sheet-x` 중복 정리.
5. V4-65 이후: 카테고리 모드 색상 중복은 지도/정보카드와 연결되어 별도 진단 후 진행.

## 보류할 영역
- 지도/길찾기 JS 본체
- 현재위치/거리 계산
- 출발지/도착지 마커 상태
- 뒤로가기 controller