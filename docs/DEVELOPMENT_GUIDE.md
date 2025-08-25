# 🛠️ WAVE SPACE 개발 가이드

**버전**: 1.0.0  
**최종 업데이트**: 2025-08-20  
**대상 독자**: 개발자, DevOps 엔지니어, 프로젝트 매니저

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [개발 환경 설정](#개발-환경-설정)
3. [개발 워크플로우](#개발-워크플로우)
4. [코딩 표준](#코딩-표준)
5. [빌드 및 배포](#빌드-및-배포)
6. [성능 최적화](#성능-최적화)
7. [문제 해결](#문제-해결)

---

## 🎯 프로젝트 개요

WAVE SPACE는 부동산 분양영업 전문가를 위한 커뮤니티 플랫폼입니다.

### 기술 스택
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Build Tool**: Vite 5.0
- **Code Quality**: ESLint, Prettier
- **CI/CD**: GitHub Actions
- **Deployment**: GitHub Pages / 정적 호스팅

### 아키텍처 특징
- 정적 사이트 생성 (SSG)
- ES6 모듈 시스템
- 컴포넌트 기반 구조
- 성능 최적화 우선

---

## ⚙️ 개발 환경 설정

### 1. 필수 요구사항
```bash
Node.js >= 16.0.0
npm >= 8.0.0
Git >= 2.30.0
```

### 2. 프로젝트 설정
```bash
# 저장소 클론
git clone [repository-url]
cd wavespace

# 자동 환경 설정
npm run setup

# 개발 서버 시작
npm run dev
```

### 3. 환경 변수
`.env.example`을 복사하여 `.env` 파일을 생성하고 필요한 값을 설정하세요.

```bash
# 개발 환경
NODE_ENV=development
VITE_APP_TITLE="WAVE SPACE - 개발"
VITE_DEBUG_MODE=true
```

---

## 🔄 개발 워크플로우

### 브랜치 전략
```
main        ← 프로덕션 릴리스
├─ develop  ← 개발 통합
├─ feature/ ← 기능 개발
├─ hotfix/  ← 긴급 수정
└─ release/ ← 릴리스 준비
```

### 작업 프로세스
1. **이슈 생성**: GitHub Issues에서 작업 정의
2. **브랜치 생성**: `feature/[issue-number]-[description]`
3. **개발**: 로컬에서 개발 및 테스트
4. **품질 검사**: `npm run quality` 실행
5. **커밋**: 컨벤션에 따른 커밋 메시지
6. **Pull Request**: 코드 리뷰 요청
7. **머지**: 승인 후 develop 브랜치로 머지

### 커밋 메시지 컨벤션
```
type(scope): description

feat(auth): 사용자 로그인 기능 추가
fix(sidebar): 메뉴 클릭 시 오류 수정
docs(readme): 설치 가이드 업데이트
style(css): 버튼 스타일 개선
refactor(utils): 공통 함수 리팩토링
test(unit): 유틸리티 함수 테스트 추가
```

---

## 📏 코딩 표준

### JavaScript 스타일
- **모듈 시스템**: ES6 modules 사용
- **함수**: 화살표 함수 선호, 최대 50줄
- **변수**: const > let > var 순서로 선호
- **네이밍**: camelCase, 함수는 동사형

```javascript
// ✅ 좋은 예
const getUserData = async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

// ❌ 나쁜 예
function get_user_data(user_id) {
  var response = fetch('/api/users/' + user_id);
  return response;
}
```

### CSS 스타일
- **방법론**: CSS 모듈 + 유틸리티 클래스
- **네이밍**: BEM 또는 kebab-case
- **색상**: CSS 변수 사용 필수
- **반응형**: Mobile-first 접근

```css
/* ✅ 좋은 예 */
.user-card {
  background-color: var(--color-background-primary);
  border-radius: var(--radius-md);
}

.user-card__title {
  color: var(--color-text-primary);
  font-size: var(--text-lg);
}
```

### HTML 구조
- **시맨틱**: 의미있는 HTML5 태그 사용
- **접근성**: ARIA 속성 적절히 사용
- **성능**: 필수 스크립트만 포함

---

## 🏗️ 빌드 및 배포

### 로컬 빌드
```bash
# 개발 빌드
npm run build

# 성능 분석
npm run analyze

# 미리보기
npm run preview
```

### 배포 프로세스
1. **자동 배포**: `main` 브랜치 푸시 시 자동 배포
2. **수동 배포**: GitHub Actions에서 워크플로우 실행
3. **롤백**: 이전 릴리스 태그로 되돌리기 가능

### 환경별 설정
- **Development**: 디버그 모드, 상세 로그
- **Staging**: 프로덕션과 유사한 환경
- **Production**: 최적화, 압축, 모니터링

---

## ⚡ 성능 최적화

### Core Web Vitals 목표
- **LCP**: < 2.5초
- **FID**: < 100ms  
- **CLS**: < 0.1

### 최적화 전략
```javascript
// 이미지 지연 로딩
<img loading="lazy" src="image.jpg" alt="설명">

// 중요하지 않은 스크립트 지연
<script defer src="non-critical.js"></script>

// CSS 우선순위
<link rel="preload" href="critical.css" as="style">
```

### 모니터링
- **자동 분석**: `npm run perf` 로컬 성능 체크
- **CI/CD**: GitHub Actions에서 번들 크기 모니터링
- **주기적 감사**: 매주 Lighthouse 분석

---

## 🔧 문제 해결

### 자주 발생하는 문제

#### 1. 모듈 로딩 오류
```bash
# 증상: ES6 모듈 import 오류
# 해결: package.json type 확인
"type": "module"
```

#### 2. 빌드 실패
```bash
# 증상: Vite 빌드 오류
# 해결: 캐시 정리 후 재빌드
npm run clean
npm run build
```

#### 3. 성능 저하
```bash
# 진단: 성능 분석 실행
npm run analyze

# 해결: 대용량 파일 확인
# - CSS: 100KB 이하 권장
# - JS: 200KB 이하 권장
# - 이미지: 500KB 이하 권장
```

### 디버깅 도구
- **브라우저**: Chrome DevTools
- **성능**: Lighthouse, Web Vitals
- **코드**: ESLint, Prettier
- **번들**: Vite 빌드 분석

---

## 📞 지원 및 문의

### 개발팀 연락처
- **기술 문의**: 개발팀 Slack 채널
- **버그 리포트**: GitHub Issues
- **긴급 상황**: 24/7 온콜 시스템

### 유용한 링크
- [디자인 시스템](./design-system-final%20(디자인%20시스템).md)
- [제품 요구사항](./PRD%20(제품%20요구사항%20문서).md)
- [일관성 가이드](./CONSISTENCY_GUIDE%20(일관성).md)

---

**문서 관리**: 이 문서는 코드 변경사항과 함께 업데이트됩니다.  
**검토 주기**: 매 릴리스마다 문서 정확성 검토  
**기여 방법**: Pull Request로 문서 개선 제안 환영