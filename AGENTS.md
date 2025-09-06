# Repository Guidelines

## 프로젝트 구조 & 모듈
- `components/`: 재사용 가능한 HTML 파셜(예: `sidebar.html`, `card.html`).
- `js/`: 애플리케이션 로직
  - `modules/`: 페이지/런타임 모듈(예: `dark-mode.js`, `sidebar-loader.js`).
  - `components/`: 컴포넌트 로더(예: `ComponentLoader.js`, `FormInputLoader.js`).
  - `services/`, `config/`, `utils/`, `data/`, `pages/`: 기능별 코드.
- `css/` 및 루트 `*.css`: 스타일시트
- `images/`: 정적 자산
- `docs/`: 가이드와 사양(예: `LOCAL_SERVER_GUIDE.md`, `HTTPS_LOCAL_SETUP.md`).
- `scripts/`: 노드 유틸리티(`quality-gates.js`, `performance-check.js`).
- `dist/`: 배포용 정적 빌드 출력

## 빌드·테스트·개발 명령어
- `npm run setup`: 의존성 설치 후 린트/포맷 일괄 실행
- `npm run dev`: 로컬 품질 점검(린트+포맷)
- `npm run lint` | `npm run lint:fix`: ESLint 검사/자동 수정(`.js`, `.html`)
- `npm run format` | `npm run format:check`: Prettier 포맷팅/검증
- `npm run build`: 정적 자산을 `dist/`로 복사하여 빌드
- `npm run perf`: Lighthouse 기반 성능 점검(`scripts/performance-check.js`)
- `npm run quality-gates`: 린트+포맷 게이트 실행(위반 시 실패)

## 코드 스타일 & 네이밍
- Prettier: 4칸 들여쓰기, 줄너비 100(HTML 120), CRLF, JSON 2칸
- ESLint: `var` 금지, `const` 우선, 싱글쿼트, 세미콜론, `camelCase`, 함수/복잡도 제한
- 파일명: 모듈은 케밥케이스(`page-optimizer.js`), 컴포넌트 로더는 PascalCase+`Loader`(`PageTemplate.js`)
- 식별자: 함수/변수 `camelCase`, 상수 `UPPER_SNAKE_CASE`

## 테스트 가이드
- 별도 유닛 테스트 프레임워크 없음. 대신:
  - 품질 게이트: `npm run quality-gates`
  - 수동 확인: `test-loaders.html` 및 각 `*.html` 페이지
  - 성능: `npm run perf` 결과 검토
- 필요한 경우 `docs/templates/`에 테스트 픽스처 추가 후 PR에 링크

## 커밋 & PR 가이드
- 커밋: Conventional Commits 권장(`feat:`, `fix:`, `refactor:`, `chore:`), 명령형/스코프 명시(예: `feat(profile): add badge loader`)
- 브랜치: `feature/…`, `fix/…`, `chore/…`
- PR 필수 항목: 변경 요약, UI 변경 스크린샷, 테스트 방법, 관련 이슈, 문서 업데이트 여부

## 보안 & 설정 팁
- 비밀정보 커밋 금지. `.env.local` 사용 및 `config.dev.js`, `config.prod.template.js` 참고
- `sql/` 변경은 `supabase/migrations/`와 정합성 확인

---

## CLAUDE.md (전문 복사, 용어는 Codex AI로 정정)


# CLAUDE.md

This file provides guidance to Codex AI (Codex CLI) when working with code in this repository.

이 문서는 이 저장소에서 Codex AI (Codex CLI)가 개발을 진행할 때 반드시 따라야 하는 가이드입니다.  
목적은 **사용자 요구사항에 정확히 맞는 결과물**을 안정적으로 제공하고, 불필요한 혼란이나 위험을 줄이는 것입니다.

---

## 🎯 품질 약속
- 이 프로젝트는 사용자에게 **매우 중요한 비즈니스 프로젝트**입니다  
- 모든 코드는 **프로덕션 레벨의 품질**을 유지해야 합니다  
- 각 기능은 **실제 사용자가 매일 사용**한다는 마음가짐으로 개발해야 합니다  

---

## 🚀 프로젝트 비전
- 이 플랫폼은 **수천 명의 부동산 분양 실무자들의 업무 효율을 개선**합니다  
- 우리의 코드 한 줄이 **실무자들의 시간을 절약**합니다  
- **품질은 타협할 수 없는 핵심 가치**입니다  

---

## 프로젝트 개요

**WAVE space**는 한국의 부동산 분양 실무자들을 위한 **동적 커뮤니티 플랫폼**입니다.  
정보 공유, 경력 개발, 게이미피케이션 요소를 결합하여 업계 종사자들에게 매력적인 생태계를 제공합니다.  

---

## ⚠️ 핵심 개발 규칙

**사용자가 명확히 요청하지 않는 한 기존 기능을 수정·삭제하지 마시오.**

- 추측 금지 **이해가 추가로 필요하면, 사용자에게 적극 질문하여 의도하는 방향을 명확하게 확인**
- 최적화 금지  
- 삭제 금지  

단, 아래 범위의 리팩토링은 예외적으로 허용한다:  
1. 코드 중복 제거  
2. 공통 컴포넌트화 (예: 헤더, 사이드바, 푸터)  
3. 유지보수상 반드시 필요한 최소한의 구조 정리  

> 🔒 이외의 구조 변경이나 리팩토링은 반드시 사용자의 명시적 요청이 있어야 한다.
> ⭐ 사용자가 요청한 디버깅 및 리펙토링 시 사용자에게 질문 생략하고 **All yes**로 막힘 없이 끝까지 진행한다.

### 🤖 자동 승인 규칙

**질문 없이 자동 진행하는 작업:**
- 단순 오류 수정 (syntax error, import 경로 수정, 오타 수정)
- 코드 포맷팅 및 스타일 정리 (ESLint, Prettier)
- 중복 코드 제거 및 함수 추출
- 파일 읽기 권한 (Read 도구 사용)
- 린트 및 포맷 명령어 실행 (npm run lint, npm run format)
- 테스트 실행 (npm run test)
- 로그 및 디버깅 정보 확인
- 간단한 변수명 변경
- 주석 추가 및 수정
- console.log 제거
- 외부 패키지 설치 (npm install)
- **AGENTS.md 사이트맵 섹션 자동 업데이트** (컴포넌트/페이지 변경 시) ✨

**반드시 사용자에게 물어봐야 하는 작업:**
- 파일 삭제
- 대규모 구조 변경 (폴더 구조, 아키텍처 변경)
- 데이터베이스 스키마 변경
- 프로덕션 배포 관련 작업
- 기존 동작을 변경하는 로직 수정
- 보안 관련 설정 변경
- API 엔드포인트 변경
- 환경 변수 수정

---

## 🧩 다중 요청 & 복잡한 작업 전략

- 요청이 여러 개라면 논리적·순차적으로 나누어 단계별 처리  
- 각 단계를 충분히 이해한 뒤 실행  
- 명확성과 추적 가능성 유지  

복잡하거나 다층적인 작업일 경우:  
- 하위 에이전트(sub-agent)를 활성화해 병렬 분석  
- 결과를 통합하여 최적의 솔루션 도출  

---

## 🗣️ 응답 언어 규칙

**모든 응답은 반드시 한국어로 작성해야 한다.**  
- 코드나 고유명사를 제외하고 영어 사용 금지  
- 모든 설명·메시지·가이드는 한국어로 제공  

---

## 🎭 페르소나 & 컨텍스트 규칙

**모든 작업에는 사용자 요청에 적합한 페르소나를 자동으로 적용해야 한다.**  
- 사용자가 별도로 지정하지 않아도 시스템이 최적의 페르소나를 추론 후 적용  
- 출력은 사용자 의도와 톤에 반드시 맞춰야 함  

---

## 🎨 디자인 & 컴포넌트 규칙

- 모든 디자인 작업은 기존 톤과 스타일을 철저히 준수  
- 공통 UI(사이드바, 헤더 등)는 **하드코딩 폴백 코드생성 절대 금지**, 반드시 공용템플릿, 글로벌 컴포넌트로 제작해 모든 페이지에서 재사용  
- 디자인 일관성 유지, 새로운 방향은 사용자 요청이 있어야만 도입  
- 디자인 시 **important** 를 많이 사용하면 디자인이 깨지기 때문에 절대 남발하지 말 것
- **호버 효과 사용 지침**: 
  - 기본적으로 마우스 호버 시 `transform: translateY()` 등의 위치 이동 효과는 사용하지 않음
  - 호버 효과는 색상 변경, 그림자 정도로 제한
  - 컨테이너가 위로 들리는 효과는 사용자가 명시적으로 요청한 경우에만 적용
  - 과도한 호버 애니메이션은 사용자 경험을 저하시키므로 최소한으로 유지

---

## 🛠️ 오류 처리 규칙

- 오류 수정 시 근본 원인을 철저히 파악  
- 임시 패치나 추측형 수정 금지  
- 전체 시스템 로직과 사용자 의도에 맞게 해결  
- **수정 시 재사용성을 고려하여 코드를 작성하고, 수정 완료 시 간략한 최적화 실시**
- **수정 후 반드시 결과 코드를 다시 검토**하여 문제가 없는지 최종 점검해야 함  
- **수정 후 기존 코드는 불필요 하므로 삭제**하여 추후 충돌 문제를 사전에 방지
- **설레발 멘트 금지**: “완료했습니다”, “더 좋아졌습니다” 등은 절대 하지 말 것  
- 결과는 코드와 TODO 보고로만 증명한다  

---

## 🧠 Ultra-Think 모드 & 서브 에이전트 전략

- 복잡한 작업 시 Ultra-Think Mode 활성화  
- 문제를 세분화하고 하위 에이전트에게 배정  
- 단계별로 통합하여 완전하고 일관된 결과 확보  

---

## 📄 명세 vs 구현 우선순위 규칙

- 문서 명세와 실제 구현이 다르더라도 **실제 구현 기능이 우선**  
- 문서와 다르다는 이유로 기존 코드를 바꾸거나 삭제 금지  

---

## 🛠️ 개발 환경 및 기술 스택

### 기술 스택
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Build System**: NPM scripts with ESLint, Prettier
- **Architecture**: Component-based vanilla JS with modular service layer

### 핵심 개발 명령어
```bash
# 개발 환경 설정
npm run setup                # 전체 초기화 (install + lint + format)
npm run dev                  # 품질 검사 실행 
npm run quality-gates        # 모든 품질 게이트 검증
npm run dev-setup            # 개발 환경 설정 스크립트

# 코드 품질
npm run lint                 # ESLint 검사
npm run lint:fix             # ESLint 자동 수정
npm run format               # Prettier 포맷팅
npm run format:check         # 포맷팅 검증

# 성능 및 빌드
npm run perf                 # 성능 검사 (lighthouse 기반)
npm run build                # 정적 빌드 (dist 폴더로 복사)
npm run quality              # 품질 분석
```

### 프로젝트 구조
```
js/
├── core/           # 핵심 시스템 (stateManager, eventSystem, WaveSpaceData)  
├── services/       # 비즈니스 로직 (authService, postService, notificationService)
├── utils/          # 공통 유틸리티 (logger, errorHandler, xssProtection)
├── modules/        # 페이지별 모듈
├── config/         # 환경 설정 (env.js, firebase.js)
├── components/     # 컴포넌트 로더 및 공통 컴포넌트
└── pages/          # 페이지별 비즈니스 로직

css/                # 스타일시트
components/         # HTML 템플릿 컴포넌트
supabase/
└── migrations/     # DB 스키마 변경 관리
```

### 코딩 표준

#### ESLint 규칙 (.eslintrc.cjs)
- **인덴트**: 4 스페이스
- **따옴표**: 싱글쿼트 사용
- **세미콜론**: 항상 사용
- **var 금지**: const/let만 사용
- **함수 최대 라인**: 50줄
- **복잡도**: 최대 10
- **매개변수**: 최대 4개
- **console.log 경고**: error/warn만 허용

#### Prettier 규칙 (.prettierrc.cjs)
- **줄 너비**: 100 (HTML은 120)
- **탭 너비**: 4
- **세미콜론**: 필수
- **줄바꿈**: CRLF (Windows)
```

## 📂 개발 환경 및 원칙

1. **동적 웹페이지**  
   - 본 프로젝트는 정적 사이트가 아님  
   - 모든 데이터는 Supabase 백엔드와 연결된 동적 구조로 동작해야 함  

2. **Mock 최소화**  
   - mock 데이터 파일은 앞으로 최소화  
   - 테스트조차도 Supabase 테이블에 테스트 데이터를 직접 넣어 실행  

3. **관리자 대시보드 염두**  
   - 모든 기능은 관리자 대시보드에서 관리할 수 있도록 설계해야 함  
   - 회원 승인, 권한 관리, 포인트 정책 변경 등을 관리자 UI로 제어 가능해야 함  

4. **회원 유형 및 인증 시스템**  
   - 기본 회원유형: 분양기획, 분양영업, 청약상담, 관계사, 일반  
   - 추가 규칙: 분양기획·관계사는 관리자 승인 시 실무자로 승급 가능
   - Supabase Auth + 자체 users 테이블 구조 (auth_user_id로 연결)
   - RLS(Row Level Security) 정책으로 권한 관리  

5. **코드 중복 금지**  
   - 동일 로직을 여러 곳에 복붙하지 말 것  
   - 반드시 함수, 모듈, 컴포넌트로 분리해 재사용  

6. **보안 규칙**  
   - Supabase 키/비밀번호 같은 민감 정보는 절대 코드에 직접 하드코딩하지 말 것  
   - 환경변수는 env.js의 EnvironmentManager를 통해 관리  
   - 개발환경 Supabase URL: https://sishloxzcqapontycuyz.supabase.co
   - 운영환경에서는 index.html에서 window.SUPABASE_ANON_KEY 설정 필요
   - XSS 보호: xssProtection.js 유틸리티 사용  
   - CSP 헤더 적용 (index.html 참고)  
   - 로그에 개인정보 노출 금지  

7. **성능/확장성 원칙**  
   - 쿼리는 필요한 컬럼만 가져올 것 (`select("*")` 금지)  
   - 대용량 대비 페이지네이션/무한스크롤 고려  
   - 인덱스 필요 여부 확인  

8. **로그 & 디버깅 규칙**  
   - 운영 배포 시 `console.log` 제거  
   - 에러는 사용자에게 한국어로 안내  
   - 주요 에러는 관리자 대시보드에서 확인 가능하도록 로그 테이블에 저장  

9. **테스트 & QA 원칙**  
   - 모든 테스트는 Supabase 데이터베이스에서 수행  
   - 테스트 후 데이터 초기화  
   - 핵심 기능(로그인, 글쓰기, 업로드, 다운로드)은 QA 체크리스트로 반복 검증  

10. **접근성 & 모바일 고려**  
    - 모바일 퍼스트 디자인  
    - aria-label 등 접근성 속성 준수  
    - 버튼/글꼴 크기는 최소 가이드라인 지킬 것  

11. **버전 관리 규칙**  
    - 모든 주요 변경에는 주석 + 날짜 기록  
    - 큰 변경은 CHANGELOG.md에 기록  
    - 파일 복제 금지, Git 버전 관리 활용  

---

## 📊 데이터베이스 변경 관리

1. **마이그레이션 파일 관리**  
   - 모든 DB 스키마 변경은 `supabase/migrations/` 폴더에 타임스탬프와 함께 기록  
   - 롤백 가능한 SQL 작성 (UP/DOWN 스크립트)  
   - 변경 전 백업 필수  

2. **RLS (Row Level Security) 정책**  
   - 모든 테이블에 RLS 활성화  
   - 정책 변경 시 영향도 분석 문서화  
   - 테스트 계정으로 권한 검증 필수  

---

## 📝 코드 리뷰 체크리스트

- [ ] Supabase RLS 정책 확인  
- [ ] 에러 처리 및 사용자 피드백 구현  
- [ ] 로딩 상태 UI 구현  
- [ ] 모바일 반응형 테스트  
- [ ] 모든 UI 텍스트가 한국어인지 검토  
- [ ] 성능 영향도 점검  
- [ ] 관련 문서 업데이트 여부 확인  

## 🧪 개발 워크플로우

### 새로운 기능 개발 시
1. **기존 패턴 확인**: 유사한 기능이 구현된 파일 먼저 확인
2. **서비스 레이어 활용**: authService, postService 등 기존 서비스 활용
3. **컴포넌트 로더 사용**: HeaderLoader, SidebarLoader 등 공통 컴포넌트 로더 활용
4. **에러 처리**: ErrorHandler 활용하여 일관된 에러 처리
5. **상태 관리**: stateManager를 통한 중앙화된 상태 관리

### 디버깅 팁
- **개발자 도구 활용**: `window.WaveSpaceData`로 전역 데이터 확인
- **Supabase 로그**: Supabase 대시보드에서 실시간 쿼리 로그 확인
- **네트워크 탭**: API 호출 및 응답 확인
- **로컬 스토리지**: 세션 및 사용자 데이터 확인

---

## 📦 아키텍처 및 컴포넌트 구조

### 현재 아키텍처
- **Vanilla JS 모듈 시스템**: ES6 모듈과 동적 import 사용
- **서비스 계층**: authService, postService 등으로 비즈니스 로직 분리
- **상태 관리**: stateManager.js를 통한 중앙화된 상태 관리
- **이벤트 시스템**: eventSystem.js로 컴포넌트 간 통신
- **동적 사이드바**: SidebarLoader가 모든 페이지에 공통 사이드바 주입

### 미래 컴포넌트 계층 구조
```
components/
├── common/     # 전역 공통 (Header, Sidebar)
├── features/   # 기능별 (Login, Profile)  
├── ui/         # 순수 UI (Button, Modal, Card)
└── layouts/    # 페이지 레이아웃 (MainLayout, AuthLayout)
```

### 핵심 모듈 설명
- **WaveSpaceData**: 전역 데이터 관리 및 ErrorHandler 초기화
- **authService**: Supabase 인증 및 사용자 프로필/뱃지 관리  
- **stateManager**: 애플리케이션 상태 중앙 관리
- **eventSystem**: 컴포넌트 간 이벤트 기반 통신  

### 전역 객체 및 초기화 순서
1. **preload.js**: 최우선 로드, 전역 유틸리티 정의
2. **WaveSpaceData**: 전역 데이터 및 에러 핸들러
3. **env.js**: 환경변수 관리 (EnvironmentManager)
4. **authService**: 인증 서비스 초기화
5. **페이지별 모듈**: DOMContentLoaded 이벤트 후 실행

### 주요 전역 객체
- `window.WaveSpaceData`: 전역 데이터 및 유틸리티
- `window.ENV`: 환경변수 접근
- `window.authService`: 인증 서비스 (일부 페이지)
- `window.stateManager`: 상태 관리자

---

## 🔍 디버깅 & 로깅 전략

1. **로그 레벨**
   ```javascript
   const LOG_LEVELS = {
     ERROR: '🔴',    // 심각한 오류
     WARNING: '🟡',  // 경고
     INFO: '🔵',     // 정보
     DEBUG: '🟢',    // 디버그
     PERF: '⚡'      // 성능
   };

## 🔍 환경별 로깅

- 개발: 모든 레벨 출력  
- 스테이징: WARNING 이상  
- 운영: ERROR만  

**로그 수집**  
- 중요 에러는 Supabase 로그 테이블에 자동 저장  

---

## 🎨 UI/UX 일관성 규칙

- 사용자의 중요한 액션에는 피드백이 있어야 함  
  1. **즉시 피드백 (100ms 이내)** → 버튼 클릭 시 시각적 변화  
  2. **로딩 상태 (100ms ~ 1초)** → 스피너/스켈레톤 UI  
  3. **완료 피드백** → 토스트 메시지:  
     - 성공: 초록색  
     - 실패: 빨간색  
     - 경고: 노란색  

---

## ✅ 결과 보고 규칙

1. 모든 작업이 끝나면 반드시 마지막에 `TODO` 형식으로 보고해야 한다.  
2. 각 항목은 **완료/진행/미완료** 상태를 명확히 표시해야 한다.  
3. 보고 예시:
 작업 결과 (TODO 보고)
 [O] 사이드바 공통 컴포넌트화
 [O] Supabase 로그인 세션 체크 코드 추가
 [X] 관리자 대시보드 권한 UI 개선 (미완)

---

## 🗺️ 사이트맵 및 페이지 구조
최종 업데이트: 2025-09-05

> ⚠️ **AI 자동 관리 구역** 
> 
> ### 🤖 AI 자동 업데이트 규칙
> 
> **필수 업데이트 트리거:**
> 1. **컴포넌트 파일 생성/수정/삭제 시**
>    - `components/` 폴더 내 모든 변경사항
>    - `js/components/` 폴더 내 로더 파일 변경
>    - HTML 템플릿과 JS 로더 파일 매칭
> 
> 2. **페이지 파일 작업 시**
>    - 새 HTML 페이지 생성
>    - 기존 페이지에 컴포넌트 추가/제거
>    - 페이지 삭제 또는 이름 변경
> 
> 3. **자동 업데이트 프로세스**
>    - 작업 완료 직후 즉시 이 섹션 업데이트
>    - 변경사항을 명확히 기록 (날짜/시간 포함)
>    - 사용자에게 업데이트 내용 보고
> 
> **업데이트 형식:**
> ```
> #### ✅ 완료 (YYYY-MM-DD HH:mm)
> - [작업내용] 파일명 → 변경사항
> ```
> 
> **중요:** AI는 이 규칙을 무조건 따라야 하며, 컴포넌트 관련 작업 시 자동으로 실행됩니다.

### 📂 프로젝트 페이지 구조

#### 🎨 컴포넌트 적용 기본 규칙
- **모든 페이지**: `SidebarLoader` ✅ (기본 적용)
- **메인/인증 페이지**: `HeaderLoader` ☑️ (index, login, signup)
- **로그인 유도 페이지**: `LoginSidepanelLoader` 🪟 (index, signup)
- **예외**: reset-password.html (독립), admin 페이지들 (별도 레이아웃)

```
WAVE SPACE/ 페이지 구조
│
├── 🏠 메인
│   └── index.html ⭐ (전체 컴포넌트)
│
├── 👤 인증/계정 관리
│   ├── login.html ☑️ 
│   ├── signup.html ⭐ (전체 컴포넌트)
│   ├── reset-password.html 🔒 (독립 페이지)
│   └── profile.html 📝 (계획 중)
│
├── 💬 커뮤니티
│   ├── forum.html
│   ├── qna.html
│   ├── humor.html
│   ├── notice.html
│   └── updates.html
│
├── 💼 채용/구인구직
│   ├── sales-recruit.html
│   └── planning-recruitment.html
│
├── 💰 포인트/멤버십
│   ├── points-shop.html
│   ├── points-ranking.html
│   ├── points-charge.html
│   ├── points-policy.html
│   └── plus-membership.html
│
├── 📊 데이터/AI 서비스
│   ├── data-center.html
│   ├── ai-matching.html
│   ├── ai-report.html
│   └── market-research.html
│
├── 🎓 부가 서비스
│   ├── education.html
│   ├── events.html
│   ├── attendance.html
│   └── hall-of-fame.html
│
├── ℹ️ 정보/지원
│   ├── support.html
│   ├── proposal.html
│   ├── policy.html
│   └── other-docs.html
│
└── 🔧 관리자/개발용 🛡️ (별도 레이아웃)
    ├── admin.html
    ├── admin-feedbacks.html
    └── create-test-accounts.html
```

#### 범례
- ⭐ 전체 컴포넌트 (Header + Sidebar + LoginPanel)
- ☑️ Header + Sidebar
- 🔒 독립 페이지 (컴포넌트 없음)
- 🛡️ 별도 레이아웃
- 📝 계획/개발 중
- 표시 없음: SidebarLoader만 사용 (기본값)

### 🧩 컴포넌트 시스템 개요

#### 📌 핵심 공통 컴포넌트 (전체 페이지용)
```
├── Header (header.html + header-loader.js)
├── Sidebar (sidebar.html + sidebar-loader.js)  
├── LoginPanel (login-sidepanel.html + LoginSidepanelLoader.js)
└── ProfilePanel (profile-sidepanel.html + ProfileSidepanelLoader.js)
```

#### 🔧 UI 컴포넌트 (재사용 가능)
```
기본 UI: Card, Badge, Button, Dropdown, Tab
입력: FormInput, AddressSearch
표시: DataTable, Pagination, EmptyState, LoadingSpinner
피드백: Modal (Download/Upload), StickySlideCard
```

#### 📂 컴포넌트 위치
- HTML 템플릿: `components/*.html`
- JS 로더: `js/components/*Loader.js`
- 모듈 로더: `js/modules/*-loader.js`

> 💡 **개발 시 참고**: 새 컴포넌트 추가 시 HTML 템플릿과 Loader를 세트로 생성

#### 📁 파일 구조 정리
| 컴포넌트 | HTML 템플릿 | 로더 위치 | 상태 |
|---------|------------|----------|------|
| 헤더 | components/header.html | js/modules/header-loader.js | ✅ 정상 |
| 사이드바 | components/sidebar.html | js/modules/sidebar-loader.js | ✅ 정상 |
| 로그인 패널 | components/login-sidepanel.html | js/modules/LoginSidepanelLoader.js | ✅ 정상 |
| 프로필 패널 | components/profile-sidepanel.html | js/components/ProfileSidepanelLoader.js | ✅ 새로 생성 |

### 📊 컴포넌트 사용 통계

| 컴포넌트 | 사용 페이지 수 | 실제 사용 페이지 | 상태 | 마지막 업데이트 |
|---------|-------------|---------------|------|----------------|
| SidebarLoader | 28개 페이지 | 대부분의 페이지 | ✅ 정상 | 2025-09-05 |
| HeaderLoader | 3개 페이지 | index, login, signup | ✅ 정상 | 2025-09-06 |
| LoginSidepanelLoader | 2개 페이지 | index, signup | ✅ 정상 | 2025-09-06 |
| ProfileSidepanelLoader | 0개 페이지 | 아직 미적용 | ✅ 새로 생성 | 2025-09-06 |

### ⚠️ 현재 이슈

### 📝 최근 업데이트 (최근 1주일)

#### 2025-09-06 
- **레거시 파일 통합 완료**: header.js → header-loader.js, sidebar.js → sidebar-loader.js 통합 및 삭제 ✅
- **로그인 패널 중복 파일 해결**: 레거시 파일 삭제 완료
- **프로필 시스템 구축**: mypage → profile 리팩토링
- **문서 개선**: 사이트맵 간소화, 컴포넌트 통계 정확도 향상
- **컴포넌트 시스템 문서화**: 전체 컴포넌트 용도별 분류 추가

### ✅ 완료된 이슈 (2025-09-06)
- ~~`header.js` → `header-loader.js` 통합~~
- ~~`sidebar.js` → `sidebar-loader.js` 통합~~
- ~~`login-sidepanel.js` → `LoginSidepanelLoader.js` 중복 해결~~

### 📚 과거 이력
상세한 변경 이력은 [CHANGELOG.md](./CHANGELOG.md)를 참조하세요.

---

## 요약

Codex AI는 다음을 반드시 지켜야 한다:  
- 간략한 최적화 외 요청하지 않은 구조변경 등의 정식 리팩토링/변경 금지  
- 단, 중복 제거·공통화 같은 유지보수 필수 리팩토링은 허용  
- 모든 작업은 한국어로 설명  
- 페르소나는 항상 자동으로 최적 적용  
- 동적 웹 + Supabase 기반 (mock 최소화)  
- 공용템플릿 사용 (헤더·사이드바 등)  
- 회원유형 및 권한 구조 반영  
- 관리자 대시보드 관리 가능성 항상 고려  
- 보안·성능·로그·QA·접근성·버전관리 원칙 준수  
- 오류 수정 시 설레발 금지 + 최종 코드 검토 필수  
- 결과는 반드시 TODO 보고
- 사용자가 요청한 단순 디버깅 및 리펙토링 시 사용자에게 질문 생략하고 **All yes**로 막힘 없이 끝까지 진행한다.
- **사이트맵 섹션**: 페이지/컴포넌트 변경 시 반드시 업데이트

> 이 문서는 **개발의 헌법**입니다.  
> 절대 임의로 변경하거나 해석하지 말고, 철저히 준수해야 합니다.
