# AUDIT V4-19 - my-diocese.css load registration fix

## 작업 목적
V4-18에서 `css/my-diocese.css` 파일은 생성되고 Service Worker 선캐시 목록에는 포함되어 있었지만, `index.html`의 실제 stylesheet 로드 목록에는 빠져 있었다.

이번 단계는 기능/디자인 변경이 아니라, 이미 분리된 나의 교구/본당 설정 CSS 파일이 실제 앱 실행 시 로드되도록 연결을 보정하는 단계이다.

## 변경 내용
- `index.html`에 `css/my-diocese.css?v=V4-19` stylesheet 로드 추가
- 런타임/캐시 버전을 V4-19로 통일
  - `index.html`
  - `app.js`
  - `sw.js`
  - `sw-update.js`
  - `manifest.json`

## 의도적으로 건드리지 않은 부분
- 나의 신앙생활 JS 저장/확인/취소 로직
- 교구/본당 변경 동작
- 지도/길찾기
- 뒤로가기/앱 종료
- 관구·교구 검색/중복지역 처리
- 기도문
- WebView/Android 파일

## 확인 포인트
- 나의 신앙생활 → 교구·본당 변경 화면 디자인이 V4-18에서 의도한 CSS 기준으로 표시되는지
- `css/my-diocese.css?v=V4-19`가 Network/소스에서 로드되는지
- 나의 교구 배지/교구 선택 카드/본당 선택 카드 스타일이 정상인지
- 기능 동작은 V4-18과 동일해야 함
