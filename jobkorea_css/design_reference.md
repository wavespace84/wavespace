# 잡코리아 스타일 디자인 레퍼런스

## 개요
이 문서는 잡코리아와 같은 구인구직 사이트의 일반적인 디자인 패턴을 기반으로 한 CSS 스타일 가이드입니다.

## 색상 시스템

### Primary Colors
- **Primary Blue**: `#0066cc` - 메인 브랜드 색상
- **Primary Navy**: `#003d7a` - 다크 버전
- **Primary Light Blue**: `#e6f2ff` - 배경색용

### Secondary Colors
- **Orange**: `#ff6600` - 강조, CTA 버튼
- **Green**: `#00a651` - 성공, 긍정적 액션
- **Red**: `#dc3545` - 경고, 에러

### Neutral Colors
- 9단계 그레이 스케일 (gray-100 ~ gray-900)
- 텍스트와 UI 요소에 사용

## 타이포그래피

### 폰트
- 시스템 폰트 우선 사용
- 한글: 맑은 고딕 (Malgun Gothic)
- 영문: Segoe UI, Roboto

### 크기
- 본문: 14px
- 제목: h1(2.5rem) ~ h6(1rem)
- 작은 텍스트: 12px

## 주요 컴포넌트

### 1. 버튼
- Primary: 파란색 배경, 흰색 텍스트
- Secondary: 흰색 배경, 회색 테두리
- 호버 효과: 살짝 위로 이동 + 그림자

### 2. 구직 카드
- 흰색 배경
- 호버시 파란색 테두리
- 회사명, 직무, 메타정보, 태그 포함

### 3. 네비게이션
- 상단 고정
- 흰색 배경
- 활성 메뉴 하단 파란색 바

### 4. 검색 박스
- 연한 파란색 배경
- 큰 입력 필드
- 눈에 띄는 검색 버튼

### 5. 폼 요소
- 둥근 모서리
- 포커스시 파란색 테두리
- 충분한 패딩

## 레이아웃 원칙

1. **카드 기반 디자인**: 정보를 카드 단위로 구성
2. **충분한 여백**: 요소간 시각적 분리
3. **일관된 그림자**: 깊이감 표현
4. **반응형**: 모바일 우선 접근

## 사용 예시

```html
<!-- 구직 카드 -->
<div class="job-card">
  <h3 class="job-card-title">프론트엔드 개발자</h3>
  <p class="job-card-company">테크 컴퍼니</p>
  <div class="job-card-meta">
    <span class="job-card-meta-item">서울 강남구</span>
    <span class="job-card-meta-item">경력 3~5년</span>
    <span class="job-card-meta-item">정규직</span>
  </div>
  <div class="job-card-tags">
    <span class="job-tag">React</span>
    <span class="job-tag">TypeScript</span>
    <span class="job-tag">Node.js</span>
  </div>
</div>

<!-- 버튼 -->
<button class="btn btn-primary">지원하기</button>
<button class="btn btn-secondary">스크랩</button>

<!-- 검색 박스 -->
<div class="search-box">
  <form class="search-form">
    <div class="search-input-group">
      <input type="text" class="search-input" placeholder="직무, 회사명 검색">
    </div>
    <button class="btn btn-primary search-button">검색</button>
  </form>
</div>
```

## 접근성 고려사항

1. **색상 대비**: WCAG AA 기준 충족
2. **포커스 표시**: 명확한 포커스 인디케이터
3. **키보드 네비게이션**: 모든 인터랙티브 요소 접근 가능
4. **의미있는 HTML**: 시맨틱 마크업 사용

## 성능 최적화

1. **CSS 변수 사용**: 테마 변경 용이
2. **최소한의 선택자**: 구체성 낮게 유지
3. **트랜지션**: 부드러운 애니메이션
4. **모바일 최적화**: 미디어 쿼리 활용