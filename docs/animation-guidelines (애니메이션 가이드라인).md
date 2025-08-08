# WAVE SPACE Animation Guidelines

## 개요

WAVE SPACE의 애니메이션 시스템은 성능과 접근성을 최우선으로 고려하여 설계되었습니다. 이 가이드라인은 애니메이션을 효과적이고 일관되게 사용하는 방법을 제공합니다.

## 핵심 원칙

### 1. 목적이 있는 애니메이션
- 사용자의 주의를 안내하기 위해 사용
- 상태 변화를 명확하게 전달
- 공간적 관계를 이해하도록 도움
- 단순한 장식적 목적은 피하기

### 2. 성능 우선
- transform과 opacity 속성만 애니메이션
- GPU 가속 활용 (translate3d, scale3d)
- 60FPS 유지
- 애니메이션 중 레이아웃 재계산 방지

### 3. 접근성 고려
- prefers-reduced-motion 설정 존중
- 키보드 네비게이션 고려
- 스크린 리더 사용자를 위한 대안 제공

## 사용 가이드

### 기본 애니메이션 컨테이너

```tsx
import { AnimatedContainer } from '@/components/ui/animated-container';

// 페이드 인 애니메이션
<AnimatedContainer animation="fadeIn" duration="normal">
  <YourContent />
</AnimatedContainer>

// 슬라이드 업 애니메이션
<AnimatedContainer 
  animation="slideInUp" 
  duration="slow" 
  delay={100}
  threshold={0.2}
>
  <YourContent />
</AnimatedContainer>
```

### 스태거 애니메이션 (리스트)

```tsx
import { StaggeredContainer } from '@/components/ui/animated-container';

<StaggeredContainer 
  staggerDelay={50} 
  animation="slideInUp"
>
  {items.map(item => (
    <div key={item.id}>{item.content}</div>
  ))}
</StaggeredContainer>
```

### 커스텀 애니메이션 훅

```tsx
import { useAnimation } from '@/hooks/use-animation';

function CustomAnimatedComponent() {
  const { progress, animate, isAnimating } = useAnimation({
    duration: 500,
    easing: easeOutExpo,
    onComplete: () => console.log('Animation complete')
  });

  useEffect(() => {
    animate();
  }, []);

  return (
    <div style={{
      opacity: progress,
      transform: `scale(${0.8 + progress * 0.2})`
    }}>
      Content
    </div>
  );
}
```

### 스크롤 트리거 애니메이션

```tsx
import { useScrollAnimation } from '@/hooks/use-animation';

function ScrollTriggeredComponent() {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.3,
    triggerOnce: true
  });

  return (
    <div 
      ref={ref}
      className={isVisible ? 'animate-in' : 'animate-out'}
    >
      Content appears on scroll
    </div>
  );
}
```

## 애니메이션 타이밍

### Duration 가이드라인
- `instant` (0ms): 즉각적인 상태 변화
- `fast` (150ms): 호버 효과, 작은 상호작용
- `normal` (300ms): 대부분의 UI 전환
- `slow` (500ms): 페이지 전환, 큰 요소 이동
- `verySlow` (1000ms): 복잡한 시퀀스, 주목도 높은 효과

### Easing 선택
- `linear`: 일정한 속도 (진행 표시기)
- `easeOut`: 자연스러운 감속 (대부분의 경우)
- `easeInOut`: 부드러운 시작과 끝 (긴 애니메이션)
- `bounce`: 탄성 효과 (주의를 끄는 요소)

## 성능 최적화 팁

### 1. Transform 속성 사용
```css
/* 좋은 예 */
.element {
  transform: translateX(100px);
  opacity: 0.5;
}

/* 피해야 할 예 */
.element {
  left: 100px;
  width: 200px;
}
```

### 2. will-change 신중하게 사용
```tsx
// 애니메이션 시작 전
element.style.willChange = 'transform, opacity';

// 애니메이션 완료 후
element.style.willChange = 'auto';
```

### 3. 애니메이션 일괄 처리
```tsx
// requestAnimationFrame 사용
requestAnimationFrame(() => {
  elements.forEach(el => {
    el.style.transform = 'translateY(0)';
  });
});
```

## 피해야 할 패턴

### 1. 레이아웃 트리거 속성 애니메이션
- width, height
- padding, margin
- top, right, bottom, left
- font-size

### 2. 과도한 애니메이션
- 동시에 너무 많은 요소 애니메이션
- 무한 반복 애니메이션 남용
- 불필요한 장식적 효과

### 3. 접근성 무시
- reduced motion 설정 무시
- 애니메이션에만 의존하는 정보 전달
- 너무 빠르거나 느린 타이밍

## 디버깅 및 모니터링

### FPS 모니터링
```tsx
import { useAnimationPerformance } from '@/hooks/use-animation';

function PerformanceMonitor() {
  const { fps, isPerformant } = useAnimationPerformance();
  
  if (!isPerformant) {
    console.warn(`Low FPS detected: ${fps}`);
  }
}
```

### Chrome DevTools 활용
1. Performance 탭에서 프레임 속도 확인
2. Rendering 탭에서 Paint Flashing 활성화
3. Layers 탭에서 GPU 레이어 확인

## 체크리스트

애니메이션 구현 전 확인사항:

- [ ] 애니메이션의 목적이 명확한가?
- [ ] transform/opacity만 사용하는가?
- [ ] reduced motion 설정을 고려했는가?
- [ ] 60FPS를 유지할 수 있는가?
- [ ] 키보드/스크린리더 사용자를 고려했는가?
- [ ] 필요한 경우에만 will-change를 사용하는가?
- [ ] 애니메이션 후 정리 작업이 있는가?

## 예제 패턴

### 1. 페이지 진입 애니메이션
```tsx
<AnimatedContainer animation="fadeIn" duration="slow">
  <StaggeredContainer staggerDelay={100}>
    <Hero />
    <Features />
    <CTA />
  </StaggeredContainer>
</AnimatedContainer>
```

### 2. 인터랙티브 카드
```tsx
<AnimatedContainer 
  animation="scaleIn" 
  duration="fast"
  className="hover:scale-105 transition-transform"
>
  <Card />
</AnimatedContainer>
```

### 3. 로딩 상태
```tsx
<div className="animate-pulse">
  <Skeleton />
</div>
```

## 결론

애니메이션은 사용자 경험을 향상시키는 강력한 도구입니다. 하지만 과도하거나 부적절한 사용은 오히려 사용성을 해칠 수 있습니다. 항상 사용자의 관점에서 생각하고, 성능과 접근성을 최우선으로 고려하세요.