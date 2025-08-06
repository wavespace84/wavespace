# WAVE SPACE Design System

## 🎨 디자인 철학

WAVE SPACE는 프리미엄 부동산 분양 플랫폼으로서 전문성, 신뢰성, 그리고 현대적인 미학을 추구합니다.

### 핵심 원칙
1. **일관성 (Consistency)**: 모든 컴포넌트와 페이지에서 동일한 디자인 언어 사용
2. **접근성 (Accessibility)**: 모든 사용자가 쉽게 접근하고 사용할 수 있는 인터페이스
3. **반응성 (Responsiveness)**: 모든 디바이스에서 최적화된 경험 제공
4. **효율성 (Efficiency)**: CSS 변수와 유틸리티 클래스를 통한 빠른 개발

## 🎨 컬러 시스템

### 브랜드 컬러
```css
/* Primary Blue - WAVE SPACE의 신뢰와 전문성 */
--brand-primary: #0066FF
--brand-secondary: #0099FF

/* 그라데이션 */
.text-gradient {
  background: linear-gradient(to right, #0066FF, #0099FF);
}
```

### 시맨틱 컬러
- **Success**: `#22c55e` - 긍정적인 액션, 성공 상태
- **Warning**: `#f59e0b` - 주의가 필요한 상태
- **Error**: `#ef4444` - 오류, 위험 상태
- **Info**: `#3b82f6` - 정보 제공

### 뉴트럴 컬러
Gray 50-900 스케일 사용 (HSL 기반)
- **Gray 50**: 배경, 매우 밝은 영역
- **Gray 100-300**: 보더, 구분선
- **Gray 400-600**: 보조 텍스트
- **Gray 700-900**: 주요 텍스트, 다크 모드 배경

## 📐 타이포그래피

### 폰트 패밀리
```css
--font-family-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui
--font-family-mono: 'JetBrains Mono', 'Courier New', monospace
```

### 폰트 사이즈 (Fluid Typography)
- **text-xs**: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)
- **text-sm**: clamp(0.875rem, 0.8rem + 0.375vw, 1rem)
- **text-base**: clamp(1rem, 0.9rem + 0.5vw, 1.125rem)
- **text-lg**: clamp(1.125rem, 1rem + 0.625vw, 1.25rem)
- **text-xl**: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)
- **text-2xl**: clamp(1.5rem, 1.3rem + 1vw, 1.875rem)
- **text-3xl**: clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem)
- **text-4xl**: clamp(2.25rem, 1.9rem + 1.75vw, 3rem)
- **text-5xl**: clamp(3rem, 2.5rem + 2.5vw, 3.75rem)

### 폰트 웨이트
- **light**: 300
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700
- **extrabold**: 800

## 📏 스페이싱 시스템

8px 기반 스페이싱 시스템
- **space-1**: 4px (0.25rem)
- **space-2**: 8px (0.5rem)
- **space-3**: 12px (0.75rem)
- **space-4**: 16px (1rem)
- **space-5**: 20px (1.25rem)
- **space-6**: 24px (1.5rem)
- **space-8**: 32px (2rem)
- **space-10**: 40px (2.5rem)
- **space-12**: 48px (3rem)
- **space-16**: 64px (4rem)
- **space-20**: 80px (5rem)
- **space-24**: 96px (6rem)
- **space-32**: 128px (8rem)

## 🎯 컴포넌트 스타일

### 카드
```css
/* 기본 카드 */
.card-base {
  @apply bg-card text-card-foreground rounded-lg border shadow-sm;
}

/* 인터랙티브 카드 */
.card-interactive {
  @apply card-base transition-all duration-300 hover:shadow-md hover:-translate-y-0.5;
}

/* 프리미엄 카드 */
.card-premium {
  @apply bg-card text-card-foreground rounded-xl shadow-md 
         transition-all duration-300 hover:shadow-lg hover:-translate-y-1;
}
```

### 버튼
```css
/* Primary Button */
.btn-primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90 
         px-4 py-2 rounded-md shadow-sm hover:shadow-md;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-secondary text-secondary-foreground hover:bg-secondary/80 
         px-4 py-2 rounded-md;
}

/* Gradient Button */
.btn-gradient {
  @apply bg-gradient-to-r from-[#0066FF] to-[#0099FF] text-white 
         px-4 py-2 rounded-md shadow-brand hover:shadow-brand-lg;
}
```

### 입력 필드
```css
.input-base {
  @apply flex h-10 w-full rounded-md border border-input bg-background 
         px-3 py-2 text-sm placeholder:text-muted-foreground 
         focus:ring-2 focus:ring-ring;
}
```

### 배지
```css
.badge-primary {
  @apply inline-flex items-center rounded-full px-2.5 py-0.5 
         text-xs font-semibold bg-primary text-primary-foreground;
}
```

## 🌟 그림자 시스템

### 기본 그림자
- **shadow-sm**: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- **shadow**: 0 4px 6px -1px rgb(0 0 0 / 0.1)
- **shadow-md**: 0 10px 15px -3px rgb(0 0 0 / 0.1)
- **shadow-lg**: 0 20px 25px -5px rgb(0 0 0 / 0.1)
- **shadow-xl**: 0 25px 50px -12px rgb(0 0 0 / 0.25)
- **shadow-2xl**: 0 35px 60px -15px rgb(0 0 0 / 0.3)

### 브랜드 그림자
```css
--shadow-brand: 0 10px 40px -10px hsl(216 100% 50% / 0.3);
--shadow-brand-lg: 0 20px 60px -15px hsl(216 100% 50% / 0.4);
```

## 🎬 애니메이션

### 트랜지션
- **transition-fast**: 150ms ease-in-out
- **transition-base**: 200ms ease-in-out
- **transition-slow**: 300ms ease-in-out
- **transition-spring**: 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)

### 키프레임 애니메이션
- `fade-in` / `fade-out`
- `slide-in-from-top` / `slide-in-from-bottom`
- `slide-in-from-left` / `slide-in-from-right`
- `scale-in` / `scale-out`
- `float` - 부드러운 위아래 움직임
- `pulse` - 깜빡임 효과
- `shimmer` - 로딩 상태

## 📱 반응형 디자인

### 브레이크포인트
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### 레이아웃 변수
```css
--container-max: 1280px;
--sidebar-width: 280px;
--header-height: 64px;
```

## 🌓 다크모드

자동으로 시스템 설정을 따르며, 모든 컬러가 다크모드에 최적화되어 있습니다.

```css
/* 라이트 모드 */
--background: 0 0% 100%;
--foreground: var(--gray-900);

/* 다크 모드 */
.dark {
  --background: var(--gray-900);
  --foreground: var(--gray-50);
}
```

## 🔧 유틸리티 클래스

### 텍스트
- `.text-gradient` - 브랜드 그라데이션 텍스트
- `.text-balance` - 텍스트 균형 조정

### 효과
- `.glass-effect` - 유리 효과 (라이트 모드)
- `.glass-effect-dark` - 유리 효과 (다크 모드)
- `.skeleton` - 로딩 스켈레톤

### 스크롤바
- `.scrollbar-thin` - 얇은 커스텀 스크롤바

### 상태 표시
- `.status-online` - 온라인 상태
- `.status-offline` - 오프라인 상태
- `.status-busy` - 바쁨 상태

## 📋 사용 예시

### 카드 컴포넌트
```tsx
<div className="card-premium">
  <h3 className="text-xl font-bold text-gradient">프리미엄 카드</h3>
  <p className="text-muted-foreground">고급스러운 카드 디자인</p>
</div>
```

### 버튼 컴포넌트
```tsx
<button className="btn-gradient">
  시작하기
</button>
```

### 입력 필드
```tsx
<input 
  type="text" 
  className="input-base" 
  placeholder="이메일을 입력하세요"
/>
```

## 🚀 성능 최적화

1. **CSS 변수 사용**: 런타임 테마 변경 가능
2. **Fluid Typography**: 뷰포트 기반 자동 크기 조정
3. **GPU 가속**: transform, opacity 애니메이션 사용
4. **Tree Shaking**: 사용하지 않는 스타일 자동 제거

## 📚 참고사항

- 모든 컬러는 HSL 형식으로 정의되어 투명도 조절이 용이합니다
- 스페이싱은 8px 그리드를 기준으로 일관성을 유지합니다
- 애니메이션은 사용자 경험을 해치지 않는 선에서 절제되게 사용합니다
- 접근성을 위해 충분한 색상 대비를 유지합니다