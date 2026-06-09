# AUDIT_V4-3 — 공통 UI CSS 표준화 1단계

## 기준
- 입력 기준: PWA V4-2 CSS 토큰화 버전
- 출력 버전: PWA V4-3 common UI CSS 1단계
- 목적: 디자인 변경 없이 반복되는 공통 UI 수치와 색상값을 의미 토큰으로 묶는다.

## 이번 단계에서 한 일
1. `style.css`의 `:root`에 V4-3 공통 컴포넌트 토큰을 추가했다.
2. X/닫기 버튼에 반복되는 크기, 테두리, 배경값 일부를 토큰으로 연결했다.
3. 웹사이트/순례길 카드 간격과 웹사이트 카드의 warm card 색상/테두리/그림자 일부를 토큰으로 연결했다.
4. `filter-bar` 안에 중복되어 있던 동일한 `border-bottom` 선언 1개를 제거했다.
5. 런타임 버전 쿼리와 서비스워커 캐시 버전을 V4-3으로 올렸다.

## 의도적으로 하지 않은 일
- 지도/길찾기/현재위치 로직 수정 없음
- 뒤로가기/앱 종료 흐름 수정 없음
- 나의 신앙생활 저장/취소 로직 수정 없음
- 관구·교구 `diocese.html` 내부 구조 수정 없음
- `patches.js` 정리 없음
- CSS selector 대량 병합 없음

## 새로 추가한 주요 토큰
- `--v4-close-size`
- `--v4-close-size-sm`
- `--v4-close-border`
- `--v4-close-bg`
- `--v4-radius-pill`
- `--v4-radius-card`
- `--v4-card-gap`
- `--v4-list-pad-x`
- `--v4-list-pad-bottom`
- `--v4-card-bg-warm`
- `--v4-card-border-warm`
- `--v4-card-shadow-soft`

## 다음 단계 제안
V4-4에서는 기능 로직을 건드리지 말고 `나의 신앙생활` CSS 범위를 먼저 별도 섹션으로 정리하거나, `app.js` 내 나의 신앙생활 함수 목록을 독립 모듈화 준비표로 분류하는 것이 안전하다.
