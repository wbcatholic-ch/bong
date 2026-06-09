# AUDIT V4-33 - 공개 배포 불필요 파일 정리

## 기준
- 기준 파일: PWA V4-32
- 결과 파일: PWA V4-33

## 작업 목적
V4-32 배포 정리 이후에도 공개 배포 압축본에 남아 있던 개발/설정 보조 파일을 제거해 배포 파일 묶음을 더 가볍고 안전하게 정리했습니다.

## 제거한 항목
- `firebase-firestore-rules-qa-private.rules`
- `firestore.rules.sample`
- `firebase-functions/` 폴더 전체

## 유지한 항목
- `qa-firebase.html`: 문의·건의 접수 화면이므로 유지
- `firebase-messaging-sw.js`: 향후 알림 기능과 연결될 수 있어 유지
- `admin-notify.html`: 현재 앱 본체에서 직접 노출되는 화면은 아니지만, Firebase 알림 관리자 토큰 생성용 보조 화면으로 남김. 실제 공개 전 필요 없으면 별도 단계에서 제거 가능

## 버전 처리
- 주요 실행/캐시/쿼리 버전: V4-33
- `index.html`, `app.js`, `diocese.html`, `sw.js`, `sw-update.js`, `manifest.json`의 V4-32 표기를 V4-33으로 갱신

## 기능 영향
- 앱 실행 로직은 변경하지 않았습니다.
- 지도, 길찾기, 위치, 기도문, 관구·교구, 나의 신앙생활 기능은 건드리지 않았습니다.
