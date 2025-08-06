# 사람인(Saramin) 디자인 시스템 요약

## 1. 색상 시스템 (Color System)

### Primary Colors (주요 색상)
- **Primary Blue**: `rgb(45, 103, 255)` - 메인 브랜드 색상
- **Secondary Blue**: `rgb(72, 118, 239)` - 보조 파란색
- **Dark Blue**: `rgb(0, 63, 229)` - 진한 파란색 (강조)
- **Light Blue**: `rgb(148, 181, 252)` - 연한 파란색 (배경)

### Neutral Colors (중립 색상)
- **Black**: `rgb(0, 0, 0)` - 텍스트
- **White**: `rgb(255, 255, 255)` - 배경
- **Dark Gray**: `rgb(55, 63, 87)` - 주요 텍스트
- **Medium Gray**: `rgb(92, 102, 123)` - 보조 텍스트
- **Light Gray**: `rgb(215, 220, 229)` - 보더, 구분선
- **Background Gray**: `rgb(244, 246, 250)` - 배경색

## 2. 타이포그래피 (Typography)

### Font Family
```css
font-family: Pretendard, "Malgun Gothic", dotum, gulim, sans-serif;
/* Fallback */
font-family: "Malgun Gothic", arial, sans-serif;
```

### Font Sizes
- **Extra Small**: 13px (보조 텍스트, 캡션)
- **Small**: 14px (일반 텍스트)
- **Medium**: 15px (중요 텍스트)
- **Large**: 16px (제목, 버튼)
- **Extra Large**: 17px (주요 제목)
- **Display**: 36px (대형 디스플레이)

### Font Weights
- **Regular**: 400 (일반 텍스트)
- **Bold**: 700 (강조, 제목)

## 3. 버튼 스타일 (Button Styles)

### 버튼 패턴
1. **투명 배경 + 보더**: 가장 일반적인 스타일 (85%)
2. **둥근 모서리**: border-radius 사용 (25%)
3. **Grid 디스플레이**: 정렬을 위한 grid 사용

### Border Radius Values
- **None**: 0px (기본)
- **Small**: 4px (작은 둥글기)
- **Medium**: 8px, 16px (중간 둥글기)
- **Large**: 20px, 28px (큰 둥글기, 검색창 등)

## 4. 레이아웃 시스템 (Layout System)

### Container
- **Max Width**: 제한 없음 (full width)
- **Padding**: 20px 0px (상하 패딩)

### Navigation
- **Height**: 161px
- **Position**: sticky
- **Z-index**: 100
- **Background**: rgb(255, 255, 255)

### Body
- **Top Padding**: 48px (네비게이션 공간)
- **Width**: 1920px (고정 너비)

## 5. 컴포넌트 패턴 (Component Patterns)

### Cards
- **Background**: 주로 흰색
- **Border**: 1px solid 그레이
- **Border Radius**: 4px ~ 8px
- **Padding**: 다양함 (8px ~ 24px)

### Forms
- **Input Height**: 다양함 (32px ~ 52px)
- **Border**: 1px ~ 2px solid
- **Border Radius**: 4px ~ 28px
- **Padding**: 8px ~ 15px

### Grid System
- Display Grid 적극 활용
- 정렬과 레이아웃을 위한 현대적 접근

## 6. 디자인 원칙

1. **명확한 색상 계층**: 파란색 계열로 브랜드 아이덴티티 구축
2. **일관된 타이포그래피**: Pretendard 폰트로 통일성 유지
3. **투명성과 경계**: 투명 배경 + 보더로 깔끔한 UI 구현
4. **유연한 둥글기**: 용도에 따라 다양한 border-radius 적용
5. **현대적 레이아웃**: Grid와 Flexbox 활용

## 7. CSS 파일 구조

### 핵심 파일
- `pattern.css`: 기본 패턴과 유틸리티
- `components.css`: 재사용 가능한 컴포넌트
- `layout.css`: 전체 레이아웃 구조
- `common_ui_keeping.css`: 공통 UI 요소

### 페이지별 스타일
- `main.css`: 메인 페이지
- `jobs-*.css`: 채용 관련 페이지
- `login.css`: 로그인 페이지

### 기능별 스타일
- `header_default.css`: 헤더
- `gnb_default_override.css`: 글로벌 네비게이션
- `search_panel.css`: 검색 패널

## 8. 주요 특징

1. **모듈화**: CSS 파일을 기능별로 분리하여 관리
2. **버전 관리**: 쿼리 파라미터로 캐시 무효화 (v=20250722142036)
3. **성능 최적화**: 필요한 스타일만 페이지별로 로드
4. **일관성**: 디자인 시스템을 통한 UI 일관성 유지
5. **접근성**: 명확한 색상 대비와 폰트 크기

이 디자인 시스템은 사람인의 브랜드 아이덴티티를 유지하면서도 사용자 경험을 최적화하는 데 중점을 두고 있습니다.