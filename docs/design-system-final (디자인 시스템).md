# WAVE SPACE Design System - Complete Guide

## 🎯 디자인 철학

WAVE SPACE는 부동산 분양 전문가를 위한 프리미엄 플랫폼으로, 깔끔하고 전문적인 라이트 테마 디자인을 추구합니다.

### 핵심 원칙
1. **목적 중심 디자인**: 모든 시각 요소는 명확한 목적을 가져야 함
2. **성능 우선**: 아름다움보다 빠른 로딩과 부드러운 인터랙션
3. **접근성**: 모든 사용자가 편안하게 사용할 수 있는 인터페이스
4. **일관성**: 예측 가능한 사용자 경험
5. **깔끔함**: 흰색 배경의 클린한 디자인

## 🏗️ 아키텍처

### 스타일 스코핑 전략
```
글로벌 CSS (최소화)
├── 디자인 토큰 (CSS 변수)
├── 리셋 스타일
└── 접근성 기본값

컴포넌트 스타일 (주력)
├── Tailwind 유틸리티
├── CSS Modules
└── 컴포넌트별 스코프
```

### 파일 구조
```
lib/
├── styles/
│   ├── design-tokens.ts    # 타입 안전 디자인 토큰
│   └── animations.ts       # 애니메이션 시스템
├── hooks/
│   └── use-animation.ts    # 애니메이션 훅
components/
├── ui/                     # 재사용 컴포넌트
│   ├── premium-card.tsx
│   ├── gradient-button.tsx
│   └── animated-container.tsx
```

## 🎨 디자인 토큰

### 컬러 시스템
```typescript
// TypeScript로 관리되는 타입 안전 컬러
const colors = {
  background: {
    primary: '#FFFFFF',    // 메인 배경색 (순수 흰색)
    secondary: '#F9FAFB',  // 보조 배경색 (약간의 회색톤)
  },
  brand: {
    primary: '#0066FF',    // 신뢰와 전문성
    secondary: '#0099FF',  // 활력과 혁신
  },
  semantic: {
    success: '#22c55e',    // 긍정적 피드백
    warning: '#f59e0b',    // 주의 필요
    error: '#ef4444',      // 오류 상태
  }
}
```

### 타이포그래피
```css
/* Fluid Typography - 모든 디바이스 대응 */
--text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
```

### 스페이싱 (8px Grid)
```
4px  (space-1)  - 미세 조정
8px  (space-2)  - 컴포넌트 내부
16px (space-4)  - 요소 간격
24px (space-6)  - 섹션 구분
```

## 🎬 애니메이션 시스템

### 성능 원칙
1. **GPU 가속 속성만 사용**
   ```css
   /* Good */
   transform: translateX(100px);
   opacity: 0.5;
   
   /* Bad - 리플로우 발생 */
   left: 100px;
   width: 200px;
   ```

2. **목적이 있는 애니메이션**
   - ✅ 상태 변화 피드백
   - ✅ 주의 유도
   - ✅ 콘텐츠 계층 표현
   - ❌ 단순 장식

3. **일관된 타이밍**
   ```typescript
   const transitions = {
     fast: '150ms',    // 즉각적 피드백
     base: '200ms',    // 일반 전환
     slow: '300ms',    // 복잡한 변화
   }
   ```

### 사용 예시
```tsx
// 스크롤 애니메이션
<AnimatedContainer
  animation="fadeInUp"
  threshold={0.2}
  stagger={100}
>
  <Card />
</AnimatedContainer>

// 호버 인터랙션
<button className="transition-all duration-200 hover:scale-105">
  클릭하세요
</button>
```

## 🧩 컴포넌트 라이브러리

### 사이드바
```tsx
// 그림자 효과로 입체감 강조
<div className="bg-white shadow-xl">
  {/* 사이드바 콘텐츠 */}
</div>
```

### PremiumCard
```tsx
<PremiumCard variant="interactive" size="lg">
  <PremiumCardHeader>
    <PremiumCardTitle>제목</PremiumCardTitle>
  </PremiumCardHeader>
  <PremiumCardContent>내용</PremiumCardContent>
</PremiumCard>
```

### GradientButton
```tsx
<GradientButton variant="default" size="lg" fullWidth>
  시작하기
</GradientButton>
```

### GlassCard
```tsx
<GlassCard blur="md" opacity={80} borderGlow>
  투명한 카드 효과
</GlassCard>
```

## 📱 반응형 전략

### 브레이크포인트
- **Mobile First**: 기본 스타일은 모바일 기준
- **sm (640px)**: 태블릿 세로
- **md (768px)**: 태블릿 가로
- **lg (1024px)**: 노트북
- **xl (1280px)**: 데스크톱

### 적응형 컴포넌트
```tsx
// 디바이스별 최적화된 레이아웃
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 자동으로 열 수가 조정됨 */}
</div>
```

### 배경 처리 원칙
- **기본 배경**: 항상 `bg-white` 사용
- **섹션 구분**: 필요시 `bg-gray-50` 사용
- **카드/컴포넌트**: 흰색 배경에 `border` 또는 `shadow` 활용
- **절대 사용 금지**: `bg-muted` 같은 애매한 색상

## ♿ 접근성

### 필수 체크리스트
- ✅ 키보드 네비게이션 지원
- ✅ 스크린 리더 호환
- ✅ 충분한 색상 대비 (WCAG AA)
- ✅ 포커스 표시 명확
- ✅ 애니메이션 비활성화 옵션

### Reduced Motion 대응
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🚀 성능 최적화

### CSS 번들 최소화
1. **PurgeCSS**: 사용하지 않는 스타일 제거
2. **Critical CSS**: 중요 스타일 인라인
3. **Code Splitting**: 페이지별 스타일 분리

### 애니메이션 성능
```typescript
// 성능 모니터링 훅
const { fps, isLowPerformance } = useAnimationPerformance()

// 저성능 디바이스 대응
if (isLowPerformance) {
  disableComplexAnimations()
}
```

## 📋 체크리스트

### 새 컴포넌트 개발 시
- [ ] Tailwind 유틸리티 우선 사용
- [ ] 글로벌 스타일 추가 금지
- [ ] TypeScript 타입 정의
- [ ] 접근성 테스트
- [ ] 성능 프로파일링
- [ ] 흰색 배경 기준 대비 확인

### 애니메이션 추가 시
- [ ] 목적 정의
- [ ] GPU 가속 속성만 사용
- [ ] 60FPS 확인
- [ ] reduced-motion 대응
- [ ] 모바일 테스트

## 🔧 개발자 도구

### VS Code 추천 확장
- Tailwind CSS IntelliSense
- PostCSS Language Support
- CSS Modules

### 디버깅 도구
```typescript
// 애니메이션 FPS 체크
if (process.env.NODE_ENV === 'development') {
  showFPSMeter()
}

// 스타일 충돌 감지
detectGlobalStyleConflicts()
```

## 📚 추가 리소스

- [Tailwind CSS 문서](https://tailwindcss.com)
- [Web.dev 성능 가이드](https://web.dev/performance)
- [WCAG 접근성 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)
- [Chrome DevTools 애니메이션 디버깅](https://developer.chrome.com/docs/devtools/)

---

이 가이드를 따라 개발하면 성능 좋고, 접근성 높으며, 유지보수가 쉬운 WAVE SPACE를 구축할 수 있습니다.