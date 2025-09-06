# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

이 문서는 이 저장소에서 Claude Code (claude.ai/code)가 개발을 진행할 때 반드시 따라야 하는 가이드입니다.  
목적은 **사용자 요구사항에 정확히 맞는 결과물**을 안정적으로 제공하고, 불필요한 혼란이나 위험을 줄이는 것입니다.

---

## 🎯 품질 약속
- 이 프로젝트는 사용자에게 **매우 중요한 비즈니스 프로젝트**입니다  
- 모든 코드는 **프로덕션 레벨의 품질**을 유지해야 합니다  
- 각 기능은 **실제 사용자가 매일 사용**한다는 마음가짐으로 개발해야 합니다  

---

## 🚀 프로젝트 비전
- 이 플랫폼은 **수천 명의 부동산 실무자들의 업무 효율을 개선**합니다  
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

# 코드 품질
npm run lint                 # ESLint 검사
npm run lint:fix             # ESLint 자동 수정
npm run format               # Prettier 포맷팅
npm run format:check         # 포맷팅 검증

# 성능 및 빌드
npm run perf                 # 성능 검사
npm run build                # 정적 빌드
npm run quality              # 품질 분석
```

### 프로젝트 구조
```
js/
├── core/           # 핵심 시스템 (stateManager, eventSystem, WaveSpaceData)  
├── services/       # 비즈니스 로직 (authService, postService, notificationService)
├── utils/          # 공통 유틸리티 (logger, errorHandler, xssProtection)
└── modules/        # 페이지별 모듈

css/                # 스타일시트
components/         # 미래 컴포넌트 
supabase/
└── migrations/     # DB 스키마 변경 관리
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
   - 현재: config.dev.js에 개발용 키 설정 (운영 환경에서는 다른 방식 사용)  
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
> - 이 섹션은 AI가 자동으로 업데이트하여 관리합니다
> - 페이지 추가/삭제/수정 시 반드시 이 섹션을 업데이트해야 합니다
> - 사이트맵 컨포넌트의 변경이 발생한 경우, 클로드.md 파일 내 다른 섹션은 절대 수정하지 않고 이 섹션만 업데이트합니다
> - 모든 변경사항에는 오늘 날짜를 [YYYY-MM-DD / 시간:분] 형식으로 기록합니다
> - 본 사이트맵 페이지 관리는 Ai는 변경사항에 대한 기록만 하며, 해당 내용을 토대로 요청 없는 수정,삭제 등의 추가 작업을 하지 않습니다
> - 본 사이트맵에 대한 내용에 변경 기록이 발생하는 경우, 사용자에게 알려주어야 한다.  
> - 만약 본 사이트맵에 목록에 삭제가 발생한 경우에는 삭제표시만 하고 목록에서 내용을 실제로 삭제하지는 않도록 한다. (목록에서 실제 삭제는 사용자가 직접 관리함)

### 📂 프로젝트 페이지 구조

> - 해더 ☑️, 사이드바 ✅, 로그인사이드패널 🪟, 마이페이지 😎 등 컴포넌트마다 다른 이모지 사용.

```
WAVE SPACE/
│
├── 🏠 메인
│   └── index.html (HeaderLoader ☑️, SidebarLoader ✅, LoginSidepanelLoader 🪟)
│
├── 👤 인증/계정 관리
│   ├── login.html (HeaderLoader ☑️, SidebarLoader ✅)
│   ├── signup.html (HeaderLoader ☑️, SidebarLoader ✅, LoginSidepanelLoader 🪟)
│   ├── reset-password.html (독립 페이지)
│   └── ⚠️ profile.html [미구현] (2025-09-05)
│
├── 💬 커뮤니티
│   ├── forum.html (SidebarLoader ✅)
│   ├── qna.html (SidebarLoader ✅)
│   ├── humor.html (SidebarLoader ✅)
│   ├── notice.html (SidebarLoader ✅)
│   └── updates.html (SidebarLoader ✅)
│
├── 💼 채용/구인구직
│   ├── sales-recruit.html (SidebarLoader ✅)
│   └── planning-recruitment.html (SidebarLoader ✅)
│
├── 💰 포인트/멤버십
│   ├── points-shop.html (SidebarLoader ✅)
│   ├── points-ranking.html (SidebarLoader ✅)
│   ├── points-charge.html (SidebarLoader ✅)
│   ├── points-policy.html (SidebarLoader ✅)
│   └── plus-membership.html (SidebarLoader ✅)
│
├── 📊 데이터/AI 서비스
│   ├── data-center.html (SidebarLoader ✅)
│   ├── ai-matching.html (SidebarLoader ✅)
│   ├── ai-report.html (SidebarLoader ✅)
│   └── market-research.html (SidebarLoader ✅)
│
├── 🎓 부가 서비스
│   ├── education.html (SidebarLoader ✅)
│   ├── events.html (SidebarLoader ✅)
│   ├── attendance.html (SidebarLoader ✅)
│   └── hall-of-fame.html (SidebarLoader ✅)
│
├── ℹ️ 정보/지원
│   ├── support.html (SidebarLoader ✅)
│   ├── proposal.html (SidebarLoader ✅)
│   ├── policy.html (SidebarLoader ✅)
│   └── other-docs.html (SidebarLoader ✅)
│
└── 🔧 관리자/개발용
    ├── admin.html
    ├── admin-feedbacks.html
    └── create-test-accounts.html
```

### 🧩 공통 컴포넌트 현황

```
components/
├── 헤더 시스템 (2개 파일)
│   ├── header.html (템플릿)
│   ├── header-loader.js (현재 사용 ✅)
│   └── header.js (레거시 ⚠️)
├── 사이드바 시스템 (3개 파일)
│   ├── sidebar.html (템플릿)
│   ├── sidebar-loader.js (현재 사용 ✅)
│   ├── sidebar-common.js (유틸리티)
│   └── sidebar.js (레거시 ⚠️)
└── 로그인 패널 시스템 (2개 파일 - 중복!)
    ├── login-sidepanel.html (템플릿)
    ├── LoginSidepanelLoader.js (현재 사용 ✅)
    └── login-sidepanel.js (중복 ⚠️)
```

### 📊 컴포넌트 사용 통계

| 컴포넌트 | 사용 페이지 수 | 상태 | 마지막 업데이트 |
|---------|-------------|------|----------------|
| SidebarLoader | 35개 페이지 | ✅ 정상 | 2025-09-05 |
| HeaderLoader | 3개 페이지 | ✅ 정상 | 2025-09-05 |
| LoginSidepanelLoader | 3개 페이지 | ⚠️ 중복 파일 | 2025-09-05 |

### ⚠️ 이슈 트래킹

#### 🔴 긴급 (2025-09-05)
- `login-sidepanel.js` vs `LoginSidepanelLoader.js` 중복
- 마이페이지(`profile.html`) 누락

#### 🟡 정리 필요 (2025-09-05)
- `header.js` (레거시) → `header-loader.js`로 통합
- `sidebar.js` (레거시) → `sidebar-loader.js`로 통합

---

## 요약

Claude Code는 다음을 반드시 지켜야 한다:  
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
- 사용자가 요청한 디버깅 및 리펙토링 시 사용자에게 질문 생략하고 **All yes**로 막힘 없이 끝까지 진행한다.
- **사이트맵 섹션**: 페이지/컴포넌트 변경 시 반드시 업데이트

> 이 문서는 **개발의 헌법**입니다.  
> 절대 임의로 변경하거나 해석하지 말고, 철저히 준수해야 합니다.