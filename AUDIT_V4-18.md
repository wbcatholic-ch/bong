# AUDIT_V4-18

## 작업명
my-diocese CSS 분리 1단계

## 기준
- 입력 기준: PWA V4-17 overlays.css split
- 결과 버전: PWA V4-18

## 작업 내용
- `style.css` 하단에 남아 있던 `my-diocese` 관련 CSS를 새 파일로 분리했습니다.
- 새 파일: `css/my-diocese.css`
- 분리 대상:
  - `.my-diocese-modal`
  - `.my-diocese-backdrop`
  - `.my-diocese-panel`
  - `.my-diocese-head`
  - `.my-diocese-list`
  - `.my-diocese-card`
  - `.filter-my-dio-badge`
  - `.list-my-dio-badge`
  - `.sm-my-dio-badge`
  - 내 교구 우선 표시 관련 보조 CSS

## 의도
- 나의 신앙생활 CSS 분리 후에도 `style.css`에 남아 있던 내 교구/본당 설정 모달 계열 CSS를 독립 파일로 이동했습니다.
- 디자인 수치와 색상은 변경하지 않고, 파일 위치만 분리했습니다.

## 런타임 변경
- 기능 로직 변경 없음
- HTML 구조 변경 없음
- JS 로직 변경 없음

## 버전 처리
- `index.html` 파일 쿼리 버전: V4-18
- `sw.js` 캐시 버전: V4-18
- `sw-update.js` 내부 버전: V4-18
- `app.js` 동적 호출 버전: V4-18
- `sw.js` 선캐시에 `css/my-diocese.css?v=V4-18` 추가

## 확인 항목
1. 나의 신앙생활 → 교구·본당 변경 화면 디자인이 V4-17과 동일한지
2. 교구/본당 선택 카드 간격과 색상이 기존과 같은지
3. 내 교구 우선 표시 배지가 기존과 같은지
4. 교구·본당 변경/확인/취소 흐름이 정상인지
5. 다른 카테고리 디자인이 변하지 않았는지
