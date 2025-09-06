# CHANGELOG

WAVE SPACE 프로젝트의 변경 이력을 기록합니다.

## 형식
- 날짜는 YYYY-MM-DD 형식 사용
- 중요도: 🔴 긴급, 🟡 중요, 🟢 일반, ✅ 완료
- 카테고리: [컴포넌트], [기능], [버그수정], [리팩토링], [문서]

---

## 2025-09

### 2025-09-06

#### ✅ 컴포넌트 시스템 개선
- **[컴포넌트] 레거시 파일 통합 완료**
  - `header.js` → `header-loader.js`로 통합 완료
  - `sidebar.js` → `sidebar-loader.js`로 통합 완료
  - 레거시 파일 삭제 및 main.js 정리
  - 헤더 기능(스크롤 동작, 이벤트 핸들러) 모두 통합

- **[컴포넌트] 프로필 시스템 완성**
  - mypage → profile 리팩토링 완료
  - `profile-sidepanel.html` 템플릿 생성
  - `ProfileSidepanelLoader.js` 로더 구현
  - CSS 클래스명 통일 (`mypage-*` → `profile-*`)

- **[컴포넌트] 로그인 사이드패널 중복 파일 제거**
  - 레거시 `login-sidepanel.js` 파일 삭제
  - `LoginSidepanelLoader.js`만 유지
  - 파일 구조 정리 완료

- **[문서] CLAUDE.md 대규모 개선**
  - 컴포넌트 파일 구조 정리 및 실제 위치 반영
  - 사이트맵 컴포넌트 표시 방식 간소화
  - 컴포넌트 사용 통계 정확도 향상

### 2025-09-05

#### ✅ 완료된 이슈
- **[컴포넌트] 레거시 파일 정리 필요**
  - ~~`header.js` (레거시) → `header-loader.js`로 통합 필요~~ ✅ 완료 (2025-09-06)
  - ~~`sidebar.js` (레거시) → `sidebar-loader.js`로 통합 필요~~ ✅ 완료 (2025-09-06)

---

## 이전 버전 이력

이전 버전의 상세한 변경 이력은 git 커밋 로그를 참조하세요.