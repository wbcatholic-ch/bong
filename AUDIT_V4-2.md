# PWA V4-2 CSS 토큰화 보고서

기준 파일: `pwa_V4-1_structure_audit_full.zip`

작업 성격: **기능 변경 없음 / CSS 의미 토큰화 1단계**

## 1. 작업 목표

V4-1 진단에서 확인된 `style.css`의 색상 중복을 줄이기 위해, 시각 디자인을 바꾸지 않고 자주 쓰는 색상값을 의미 있는 CSS 변수로 묶었습니다.

이번 단계는 전체 CSS 정리가 아니라, 앞으로 공통 UI 정리와 중복 selector 정리를 하기 위한 **안전한 준비 단계**입니다.

## 2. 추가한 V4-2 의미 토큰

- `--v4-bg-ivory`
- `--v4-bg-cream`
- `--v4-surface-white`
- `--v4-surface-paper`
- `--v4-header-navy`
- `--v4-parish-gray`
- `--v4-retreat-green`
- `--v4-gold`
- `--v4-brown`
- `--v4-text-strong`
- `--v4-text-main`
- `--v4-text-muted`
- `--v4-line-soft`

## 3. 실제 치환 범위

`:root` 내부의 기존 변수 정의는 최대한 보존했고, 주로 selector 선언부의 직접 색상값만 V4-2 변수로 바꿨습니다.

치환 건수:

- `#111827` → `var(--v4-text-strong)`: 21건
- `#1f2937` → `var(--v4-text-main)`: 18건
- `#1f2a44` → `var(--v4-header-navy)`: 49건
- `#3f6f5a` → `var(--v4-retreat-green)`: 20건
- `#4b5563` → `var(--v4-parish-gray)`: 27건
- `#6b7280` → `var(--v4-text-muted)`: 11건
- `#b7791f` → `var(--v4-brown)`: 10건
- `#d4aa6a` → `var(--v4-gold)`: 21건
- `#e5e7eb` → `var(--v4-line-soft)`: 5건
- `#f5f0e8` → `var(--v4-bg-cream)`: 12건
- `#f5f1e8` → `var(--v4-bg-ivory)`: 17건
- `#fff` → `var(--v4-surface-white)`: 118건
- `#ffffff` → `var(--v4-surface-paper)`: 18건

## 4. 버전 처리

- 파일 쿼리 버전: `V4-2`
- `sw.js` 캐시 버전: `catholic-way-V4-2`
- `sw-update.js` 빌드 버전: `V4-2`
- `app.js` 동적 데이터/화면 호출 버전: `V4-2`

## 5. 건드리지 않은 부분

- 지도/길찾기 로직
- 위치권한/현재위치
- 뒤로가기/앱 종료 흐름
- 나의 신앙생활 저장/취소 로직
- 관구·교구 검색/중복지역 처리
- 기도문 데이터/즐겨찾기
- 문의·건의/Firebase
- WebView 파일/Android 파일

## 6. 다음 단계 제안

다음 단계는 `V4-3 공통 UI CSS 정리`입니다. 단, 바로 selector 삭제를 하지 말고 X 버튼, 헤더, 카드, 검색창처럼 위험도가 낮은 공통 요소부터 정리하는 것이 안전합니다.
