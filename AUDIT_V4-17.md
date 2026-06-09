# AUDIT_V4-17.md — overlays.css 분리

## 작업 목적

PWA V4-16 기준에서 `style.css`에 남아 있던 독립적인 오버레이 CSS를 분리했습니다.
이번 단계는 기능 변경이 아니라 CSS 위치 분리입니다.

## 분리한 파일

- `css/overlays.css`

## 이동한 CSS 영역

1. 기도문 공식 원문 외부 이동/복귀 안내 오버레이
   - `#pr-external-guide`
   - `.pr-external-guide-card`
   - `.pr-external-guide-cross`
   - `.pr-external-guide-text`
   - `html.pr-external-guide-active ...` 보조 스타일

2. 길찾기 출발지/도착지 선택 오버레이
   - `#route-choice-modal`
   - `.route-choice-backdrop`
   - `.route-choice-panel`
   - `.route-choice-title`
   - `.route-choice-desc`
   - `.route-choice-actions`
   - `.route-choice-btn.*`

## 변경 원칙

- 기존 CSS 값을 바꾸지 않았습니다.
- 선택창 색상, 크기, 여백, z-index 값을 유지했습니다.
- 기도문 외부 이동 안내와 길찾기 선택창의 기능 JS는 건드리지 않았습니다.
- 지도/길찾기 핵심 로직은 수정하지 않았습니다.

## 버전 처리

- V4-16 → V4-17
- `index.html`에 `css/overlays.css?v=V4-17` 로드 추가
- `sw.js` 선캐시 목록에 `css/overlays.css?v=V4-17` 추가
- `sw-update.js`, `app.js` 동적 호출 버전 갱신

## 다음 단계 추천

다음 단계는 `style.css`에 남아 있는 커버 교구설정 배너/내 교구 우선 표시 CSS를 별도 파일로 분리하거나, 순례길·웹사이트 카드 CSS 분리를 진행하는 것이 안전합니다.
성당·성지·피정의집 지도 공통화는 아직 뒤로 미루는 것이 좋습니다.
