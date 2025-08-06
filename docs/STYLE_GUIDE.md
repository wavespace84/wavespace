# WAVE space 디자인 스타일 가이드

## 핵심 원칙

### 1. 미니멀리즘과 절제
- **과도한 장식 지양**: 그라데이션, 그림자, 애니메이션 등의 과도한 사용 금지
- **단순함 추구**: 깔끔하고 명확한 디자인으로 사용자 집중도 향상
- **공백 활용**: 충분한 여백으로 콘텐츠의 가독성 확보

### 2. 색상 사용 원칙
- **단색 우선**: 그라데이션보다는 단색 사용을 기본으로 함
- **제한적 색상**: 주요 브랜드 컬러 외 과도한 색상 사용 자제
- **대면적 요소**: 버튼, 카드, 배경 등 넓은 면적에는 단색 또는 매우 미묘한 색상 변화만 허용

## 컬러 팔레트

### Primary Colors
```css
--primary: #0066FF;        /* 메인 블루 */
--primary-dark: #0052CC;   /* 호버/액티브 상태 */
--primary-light: #E6F0FF;  /* 배경색 */
```

### Neutral Colors
```css
--gray-50: #F8F9FA;
--gray-100: #F1F3F5;
--gray-200: #E9ECEF;
--gray-300: #DEE2E6;
--gray-400: #CED4DA;
--gray-500: #ADB5BD;
--gray-600: #6C757D;
--gray-700: #495057;
--gray-800: #343A40;
--gray-900: #212529;
```

### Semantic Colors
```css
--success: #28A745;
--warning: #FFC107;
--error: #DC3545;
--info: #17A2B8;
```

## 컴포넌트 가이드라인

### 버튼
```css
/* 기본 버튼 - 단색 배경 */
.button-primary {
  background-color: var(--primary);
  color: white;
  border: none;
  transition: background-color 0.2s;
}

.button-primary:hover {
  background-color: var(--primary-dark);
}

/* 보조 버튼 - 테두리만 */
.button-secondary {
  background-color: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}

/* 그라데이션 사용 금지 예시 */
/* ❌ 사용하지 않음 */
/* background: linear-gradient(to right, #0066FF, #0099FF); */
```

### 카드
```css
.card {
  background: white;
  border: 1px solid var(--gray-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* 매우 미묘한 그림자만 */
}

/* 호버 효과는 테두리 색상 변경으로 */
.card:hover {
  border-color: var(--primary-light);
}
```

### 배경
```css
/* 메인 배경 - 단색 */
body {
  background-color: var(--gray-50);
}

/* 섹션 구분 - 미묘한 색상 차이 */
.section-alt {
  background-color: white;
}

/* ❌ 그라데이션 배경 사용 금지 */
/* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
```

## 타이포그래피

### 폰트 계층
```css
.heading-1 {
  font-size: 2rem;      /* 32px */
  font-weight: 700;
  color: var(--gray-900);
}

.heading-2 {
  font-size: 1.5rem;    /* 24px */
  font-weight: 600;
  color: var(--gray-900);
}

.heading-3 {
  font-size: 1.25rem;   /* 20px */
  font-weight: 600;
  color: var(--gray-800);
}

.body-text {
  font-size: 1rem;      /* 16px */
  font-weight: 400;
  color: var(--gray-700);
}

.small-text {
  font-size: 0.875rem;  /* 14px */
  font-weight: 400;
  color: var(--gray-600);
}
```

## 애니메이션 가이드라인

### 사용 제한
- 필수적인 피드백 애니메이션만 사용
- 지속 시간: 200ms 이하
- 이징: ease-out 기본

```css
.transition-basic {
  transition: all 0.2s ease-out;
}
```

## 아이콘 사용

### 원칙
- Lucide React 아이콘 통일 사용
- 단색 아이콘만 사용
- 크기: 16px, 20px, 24px 표준화

## 레이아웃 원칙

### 간격
```css
/* 표준 간격 사용 */
--spacing-xs: 0.25rem;  /* 4px */
--spacing-sm: 0.5rem;   /* 8px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */
--spacing-2xl: 3rem;    /* 48px */
```

### 그리드
- 12 컬럼 기본
- 반응형 브레이크포인트: 640px, 768px, 1024px, 1280px

## 금지 사항

### 절대 사용 금지
1. **과도한 그라데이션**: 특히 버튼, 배경, 대면적 요소
2. **네온 효과**: 발광, 네온 색상
3. **과한 그림자**: box-shadow는 최소한으로
4. **화려한 애니메이션**: 바운스, 회전 등
5. **다채로운 색상**: 무지개색, 형광색 등

### 예외 사항
- 로고나 브랜드 아이덴티티에 필수적인 경우
- 사용자 주의가 반드시 필요한 경우 (에러, 경고)
- 데이터 시각화 (차트, 그래프)

## 적용 예시

### ✅ 올바른 예시
```css
/* 심플한 버튼 */
.btn-primary {
  background-color: #0066FF;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
}

/* 깔끔한 카드 */
.card {
  background: white;
  border: 1px solid #E9ECEF;
  border-radius: 8px;
  padding: 24px;
}
```

### ❌ 잘못된 예시
```css
/* 과도한 그라데이션 */
.btn-gradient {
  background: linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1);
}

/* 화려한 효과 */
.card-fancy {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4);
  animation: pulse 2s infinite;
}
```

## 업데이트 내역
- 2024.01.06: 초기 가이드 작성
- 2024.01.06: 그라데이션 최소화 원칙 추가