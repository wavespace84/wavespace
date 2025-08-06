# WAVE space 디자인 시스템

이 문서는 WAVE space 프로덕트의 일관된 디자인을 유지하기 위한 포괄적인 디자인 시스템입니다.
최신 웹 기술과 디자인 트렌드를 반영하여 전문가를 위한 고급스럽고 효율적인 사용자 경험을 제공합니다.

## 디자인 원칙

1. **Professional Density**: 전문가가 장시간 사용해도 피로하지 않은 밀도 높은 UI
2. **Modern Aesthetics**: 그라디언트, 글래스모피즘, 부드러운 애니메이션을 활용한 현대적 디자인
3. **Performance First**: 시각적 효과와 성능의 균형을 고려한 최적화
4. **Accessibility**: 모든 사용자가 접근 가능한 포용적 디자인

## 1. 색상 (Color Palette)

WAVE space의 브랜드 아이덴티티를 나타내는 색상 팔레트입니다.

### Primary Colors (주요 색상)
- **Primary Blue**: `#0066FF` - 버튼, 링크, 활성화된 요소 등 핵심 상호작용에 사용됩니다.
- **Deep Blue**: `#0A2540` - 어두운 배경의 배너나 강조 영역에 사용됩니다.
- **Bright Blue**: `#0099FF` - 호버 상태나 인터랙티브 요소의 강조에 사용됩니다.
- **Sky Blue**: `#00CCFF` - 그라디언트 끝점, 밝은 강조색

### Gradient System (그라디언트)
- **Primary Gradient**: `linear-gradient(135deg, #0066FF 0%, #0099FF 100%)` - 메인 CTA 버튼, 히어로 섹션
- **Extended Gradient**: `linear-gradient(135deg, #0066FF 0%, #0099FF 50%, #00CCFF 100%)` - 히어로 텍스트, 특별 강조
- **Subtle Gradient**: `linear-gradient(180deg, #F0F5FF 0%, #FFFFFF 100%)` - 섹션 배경, 카드 호버
- **Dark Gradient**: `linear-gradient(to bottom, #1a1a1a 0%, #000000 100%)` - 푸터, 다크 섹션
- **Glow Gradient**: `radial-gradient(circle, rgba(0,102,255,0.2) 0%, transparent 70%)` - 글로우 효과

### Secondary Colors (보조 색상)
- **Light Blue**: `#F0F5FF` - 주요 색상의 배경이나 은은한 하이라이트에 사용됩니다.
- **Purple**: `#7B61FF` - 특정 이벤트나 배너에 포인트 색상으로 사용됩니다.
- **Teal**: `#00D4AA` - 성공 상태, 완료 표시에 사용됩니다.
- **Orange**: `#FF6B35` - 경고, 주의가 필요한 요소에 사용됩니다.

### Neutral Colors (중립 색상)
- **Black**: `#0A0A0A` - 메인 텍스트 (더 부드러운 검정색)
- **Gray-900**: `#1A1A1A` - 제목, 강조 텍스트
- **Gray-800**: `#333333` - 본문 텍스트
- **Gray-700**: `#4D4D4D` - 보조 텍스트
- **Gray-600**: `#666666` - 라벨, 플레이스홀더
- **Gray-500**: `#808080` - 비활성 텍스트
- **Gray-400**: `#B3B3B3` - 구분선, 비활성 테두리
- **Gray-300**: `#D9D9D9` - 입력 필드 테두리
- **Gray-200**: `#E6E6E6` - 카드 테두리, 구분선
- **Gray-100**: `#F5F5F5` - 섹션 배경
- **Gray-50**: `#FAFAFA` - 페이지 배경
- **White**: `#FFFFFF` - 카드, 컨테이너 배경

### Semantic Colors (의미 색상)
- **Success**: `#00D4AA` - 성공 메시지, 완료 상태
- **Warning**: `#FFB800` - 경고 메시지, 주의 상태
- **Error**: `#FF3B30` - 오류 메시지, 실패 상태
- **Info**: `#0099FF` - 정보 메시지, 도움말

## 2. 타이포그래피 (Typography)

가독성을 높이고 정보의 위계를 명확하게 전달하기 위한 폰트 시스템입니다.

### Font Family
- **Primary Font**: `'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Monospace Font**: `'JetBrains Mono', 'Courier New', monospace` (코드, 데이터 표시용)

### Type Scale (Desktop) - Modern Professional
- **Display 1** (히어로 섹션 전용)
  - Font Size: `56px` (데스크톱) / `40px` (모바일)
  - Line Height: `64px` / `48px`
  - Font Weight: `700`
  - Letter Spacing: `-0.025em`
  - Color: `Gray-900` 또는 `Gradient Text`
  - Usage: 메인 랜딩 히어로 타이틀만

- **Display 2** (주요 페이지 타이틀)
  - Font Size: `48px` (데스크톱) / `32px` (모바일)
  - Line Height: `56px` / `40px`
  - Font Weight: `700`
  - Letter Spacing: `-0.02em`
  - Color: `Gray-900`
  - Usage: 섹션 대제목, 페이지 타이틀

- **Heading 1 (H1)**
  - Font Size: `28px`
  - Line Height: `36px`
  - Font Weight: `600`
  - Letter Spacing: `-0.015em`
  - Color: `Gray-900`

- **Heading 2 (H2)**
  - Font Size: `22px`
  - Line Height: `30px`
  - Font Weight: `600`
  - Letter Spacing: `-0.01em`
  - Color: `Gray-900`

- **Heading 3 (H3)**
  - Font Size: `18px`
  - Line Height: `26px`
  - Font Weight: `600`
  - Letter Spacing: `-0.005em`
  - Color: `Gray-900`

- **Heading 4 (H4)**
  - Font Size: `16px`
  - Line Height: `24px`
  - Font Weight: `600`
  - Letter Spacing: `0`
  - Color: `Gray-800`

- **Heading 5 (H5)** - 데이터 테이블 헤더
  - Font Size: `14px`
  - Line Height: `20px`
  - Font Weight: `600`
  - Letter Spacing: `0`
  - Color: `Gray-700`

- **Body Large** - 중요 설명문
  - Font Size: `16px`
  - Line Height: `26px`
  - Font Weight: `400`
  - Color: `Gray-800`

- **Body Regular** - 기본 본문
  - Font Size: `14px`
  - Line Height: `22px`
  - Font Weight: `400`
  - Color: `Gray-700`

- **Body Small** - 보조 텍스트
  - Font Size: `13px`
  - Line Height: `20px`
  - Font Weight: `400`
  - Color: `Gray-600`

- **Caption** - 라벨, 힌트
  - Font Size: `12px`
  - Line Height: `18px`
  - Font Weight: `400`
  - Color: `Gray-600`

- **Micro** - 최소 텍스트
  - Font Size: `11px`
  - Line Height: `16px`
  - Font Weight: `400`
  - Color: `Gray-500`

- **Overline** - 카테고리, 섹션 라벨
  - Font Size: `11px`
  - Line Height: `16px`
  - Font Weight: `600`
  - Letter Spacing: `0.06em`
  - Text Transform: `uppercase`
  - Color: `Gray-600`

### Typography Hierarchy Rules
- **제목 간 대비**: 최소 4px 차이 유지
- **본문-제목 대비**: 본문보다 최소 2px 이상 큰 제목
- **Weight 활용**: 크기보다 굵기로 위계 구분
- **Color 활용**: Gray-900 (강조) → Gray-500 (비활성)

### Professional Context Typography
- **데이터 테이블**: Caption (12px) 헤더, Micro (11px) 셀
- **대시보드 위젯**: H4 (16px) 타이틀, Body Small (13px) 값
- **폼 라벨**: Body Small (13px) 필수, Caption (12px) 선택
- **네비게이션**: Body Regular (14px) 메인, Caption (12px) 서브
- **알림/토스트**: Body Regular (14px) 메시지, Caption (12px) 시간

### Responsive Type Scale (Mobile)
- Display 1: `48px` → `36px`
- Display 2: `36px` → `28px`
- H1: `28px` → `24px`
- H2: `22px` → `20px`
- H3: `18px` → `16px`
- H4: `16px` → `15px`
- H5: `14px` → `13px`
- Body Large: `16px` → `15px`
- Body Regular: `14px` (유지)
- Body Small: `13px` (유지)
- Caption: `12px` (유지)
- Micro: `11px` (유지)

## 3. 컴포넌트 (Components)

자주 사용되는 UI 컴포넌트의 디자인 명세입니다.

### 버튼 (Buttons)

#### Primary Button (Gradient)
- **Default State**
  - Background: `linear-gradient(135deg, #0066FF 0%, #0099FF 100%)`
  - Text Color: `White`
  - Border Radius: `999px` (완전 둥근 모서리)
  - Padding: `12px 24px`
  - Font Size: `14px`
  - Font Weight: `600`
  - Box Shadow: `0 4px 14px 0 rgba(0, 102, 255, 0.25)`
  - Transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

- **Hover State**
  - Background: `linear-gradient(135deg, #0099FF 0%, #00CCFF 100%)`
  - Box Shadow: `0 6px 20px 0 rgba(0, 102, 255, 0.35)`
  - Transform: `translateY(-2px)`

- **Active State**
  - Transform: `translateY(0) scale(0.98)`
  - Box Shadow: `0 2px 8px 0 rgba(0, 102, 255, 0.25)`

#### Secondary Button (Outline)
- **Default State**
  - Background: `White`
  - Text Color: `#0066FF`
  - Border: `2px solid #E6E6E6`
  - Border Radius: `999px`
  - Padding: `10px 22px`
  - Font Size: `14px`
  - Font Weight: `500`
  - Transition: `all 0.3s ease`

- **Hover State**
  - Background: `White`
  - Border Color: `#0066FF`
  - Box Shadow: `0 4px 12px rgba(0, 102, 255, 0.15)`
  - Transform: `translateY(-1px)`

#### Text Button
- **Default State**
  - Background: `transparent`
  - Text Color: `Gray-600`
  - Padding: `8px 12px`
  - Font Size: `14px`
  - Font Weight: `500`
  - Underline: `none`

- **Hover State**
  - Text Color: `Primary Blue`
  - Text Decoration: `underline`
  - Underline Offset: `2px`

#### Icon Button
- **Default State**
  - Width/Height: `36px`
  - Border Radius: `6px`
  - Background: `transparent`
  - Icon Size: `16px`
  - Icon Color: `Gray-600`
  - Transition: `all 0.15s ease`

- **Hover State**
  - Background: `Gray-100`
  - Icon Color: `Gray-800`

#### Compact Button (Dense UI)
- Height: `32px`
- Padding: `6px 12px`
- Font Size: `13px`
- Border Radius: `6px`

### 카드 (Cards)

#### Modern Card (Glass Effect)
- **Default State**
  - Background: `White`
  - Border: `1px solid rgba(0, 102, 255, 0.1)`
  - Border Radius: `16px`
  - Box Shadow: `0 4px 24px rgba(0, 0, 0, 0.06)`
  - Padding: `24px`
  - Transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

- **Hover State**
  - Transform: `translateY(-4px)`
  - Box Shadow: `0 12px 48px rgba(0, 102, 255, 0.15)`
  - Border Color: `rgba(0, 102, 255, 0.2)`

#### Data Card (데이터 표시용)
- **Default State**
  - Background: `Gray-50`
  - Border: `1px solid #E6E6E6`
  - Border Radius: `8px`
  - Padding: `16px`
  - Header: `14px font-weight-600`
  - Value: `20px font-weight-500`
  - Label: `12px Gray-600`

#### Compact Card (목록형)
- Background: `White`
- Border: `1px solid #E6E6E6`
- Border Radius: `8px`
- Padding: `12px 16px`
- Min Height: `64px`
- Hover: `background: Gray-50`

### 테이블 (Tables)

#### Data Table
- **Header**
  - Background: `Gray-50`
  - Height: `40px`
  - Font Size: `13px`
  - Font Weight: `600`
  - Text Color: `Gray-700`
  - Border Bottom: `1px solid #E6E6E6`

- **Row**
  - Height: `44px`
  - Font Size: `13px`
  - Border Bottom: `1px solid #F5F5F5`
  - Hover: `background: Gray-50`

- **Cell**
  - Padding: `12px 16px`
  - Text Color: `Gray-800`

#### Compact Table (Dense)
- Header Height: `32px`
- Row Height: `36px`
- Font Size: `12px`
- Cell Padding: `8px 12px`

### 입력 필드 (Input Fields)

#### Text Input
- **Default State**
  - Background: `White`
  - Border: `1px solid #D9D9D9`
  - Border Radius: `6px`
  - Height: `36px`
  - Padding: `8px 12px`
  - Font Size: `14px`
  - Transition: `all 0.15s ease`
  - Placeholder Color: `Gray-500`

- **Focus State**
  - Border Color: `Primary Blue`
  - Box Shadow: `0 0 0 2px rgba(0, 102, 255, 0.15)`
  - Outline: `none`

- **Error State**
  - Border Color: `Error`
  - Box Shadow: `0 0 0 4px rgba(255, 59, 48, 0.1)`

#### Floating Label Input
- Label Animation: 입력 시 상단으로 이동 및 크기 축소
- Label Transform: `translateY(-24px) scale(0.85)`
- Label Background: 이동 시 배경색 추가로 테두리 관통 효과

#### Search Input
- Icon Position: `left 16px`
- Padding Left: `48px`
- Clear Button: 입력 시 우측에 나타남 (fade in)

### 태그 (Tags)

#### Default Tag
- Background: `Light Blue`
- Text Color: `Primary Blue`
- Border Radius: `9999px`
- Padding: `6px 16px`
- Font Size: `14px`
- Font Weight: `500`
- Transition: `all 0.2s ease`

#### Interactive Tag
- Hover: `scale(1.05)` 및 배경색 진하게
- Click Animation: `scale(0.95)` 후 복귀

#### Status Tags
- **Success**: Background `rgba(0, 212, 170, 0.1)`, Color `Success`
- **Warning**: Background `rgba(255, 184, 0, 0.1)`, Color `Warning`
- **Error**: Background `rgba(255, 59, 48, 0.1)`, Color `Error`
- **Info**: Background `rgba(0, 153, 255, 0.1)`, Color `Info`

### 토글 스위치 (Toggle Switch)
- **Track**
  - Width: `48px`
  - Height: `28px`
  - Border Radius: `9999px`
  - Background (Off): `Gray-300`
  - Background (On): `Primary Blue`
  - Transition: `background 0.3s ease`

- **Thumb**
  - Size: `22px`
  - Background: `White`
  - Box Shadow: `0 2px 8px rgba(0, 0, 0, 0.15)`
  - Transform (Off): `translateX(3px)`
  - Transform (On): `translateX(23px)`
  - Transition: `transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

### 체크박스 (Checkbox)
- **Default**
  - Size: `20px`
  - Border: `2px solid #D9D9D9`
  - Border Radius: `6px`
  - Background: `White`
  - Transition: `all 0.2s ease`

- **Checked**
  - Background: `Primary Blue`
  - Border Color: `Primary Blue`
  - Check Icon: SVG 애니메이션 (stroke-dasharray)

### 라디오 버튼 (Radio Button)
- **Outer Circle**
  - Size: `20px`
  - Border: `2px solid #D9D9D9`
  - Transition: `all 0.2s ease`

- **Inner Dot**
  - Size: `10px`
  - Background: `Primary Blue`
  - Scale Animation: `0 → 1`
  - Opacity Animation: `0 → 1`

## 4. 아이콘 (Iconography)

### Icon System
- **Style**: Outlined (기본), Filled (활성 상태)
- **Sizes**: 16px, 20px, 24px, 32px
- **Stroke Width**: 2px (Outlined)
- **Color**: 컨텍스트에 따라 Gray-600, Gray-800, Primary Blue

### Icon Animation
- **Hover**: `rotate(5deg)` 또는 `scale(1.1)`
- **Click**: `scale(0.9)` 후 bounce back
- **Loading**: `rotate(360deg)` infinite

### Micro-interactions
- **Like Icon**: 클릭 시 하트가 차오르는 fill 애니메이션
- **Bell Icon**: 알림 시 좌우 흔들림 애니메이션
- **Check Icon**: 완료 시 체크 모양 그리기 애니메이션

### Illustrations
- **3D Style**: Blender/Cinema 4D 스타일의 부드러운 3D 일러스트
- **Color Palette**: 브랜드 컬러 기반의 밝고 친근한 색상
- **Animation**: Lottie 또는 SVG 애니메이션으로 동적 효과 추가
- **Usage**: 온보딩, 빈 상태, 성공/오류 페이지, 히어로 섹션

## 5. 레이아웃 (Layout)

### Spacing System - Modern Professional
- **Base Unit**: 4px
- **Scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px
- **Component Spacing**: 
  - XXS: `4px` - 인라인 요소 간격
  - XS: `8px` - 관련 요소 그룹
  - SM: `12px` - 컴포넌트 내부
  - MD: `16px` - 컴포넌트 간격
  - LG: `24px` - 섹션 내부
  - XL: `32px` - 섹션 간격
  - 2XL: `48px` - 페이지 섹션
  - 3XL: `64px` - 큰 섹션 간격
  - 4XL: `80px` - 히어로 섹션

### Grid System
- **Container Max Width**: `1280px`
- **Columns**: 12
- **Gutter**: `24px` (Desktop), `16px` (Mobile)
- **Margin**: `80px` (Desktop), `24px` (Tablet), `16px` (Mobile)

### Border Radius Scale - Professional
- **XS**: `4px` - 체크박스, 작은 태그
- **SM**: `6px` - 아이콘 버튼, 컴팩트 요소
- **MD**: `8px` - 버튼, 입력 필드, 카드
- **LG**: `12px` - 모달, 큰 카드
- **XL**: `16px` - 섹션 컨테이너
- **Full**: `9999px` - 태그, 토글

### Breakpoints
- **Mobile**: `< 640px`
- **Tablet**: `640px - 1024px`
- **Desktop**: `1024px - 1280px`
- **Wide**: `> 1280px`

## 6. 애니메이션 & 트랜지션 (Animation & Transitions)

### Timing Functions
- **Ease Out**: `cubic-bezier(0.0, 0, 0.2, 1)` - 대부분의 애니메이션
- **Ease In Out**: `cubic-bezier(0.4, 0, 0.6, 1)` - 모달, 드로어
- **Spring**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)` - 바운스 효과

### Duration Scale
- **Instant**: `75ms` - 호버 효과
- **Fast**: `150ms` - 버튼, 링크
- **Normal**: `300ms` - 카드, 일반 트랜지션
- **Slow**: `500ms` - 모달, 페이지 전환
- **Slower**: `700ms` - 복잡한 애니메이션

### Common Animations
- **Fade In**: `opacity: 0 → 1`
- **Slide Up**: `translateY(20px) → translateY(0)`
- **Scale**: `scale(0.95) → scale(1)`
- **Rotate**: `rotate(-180deg) → rotate(0)`

### Scroll Animations
- **Parallax**: 배경 이미지 느린 스크롤
- **Reveal**: 스크롤 시 요소 페이드인 + 슬라이드업
- **Progress Bar**: 페이지 스크롤 진행율 표시
- **Sticky Elements**: 스크롤 시 고정되는 요소
- **Viewport Detection**: Intersection Observer 기반 애니메이션 트리거
- **Staggered Reveal**: 순차적 요소 등장 효과 (delay: index * 0.1s)

## 7. 그림자 시스템 (Shadow System)

### Elevation Scale
- **Level 0**: `none` - 평면 요소
- **Level 1**: `0 1px 3px rgba(0, 0, 0, 0.04)` - 카드 기본
- **Level 2**: `0 4px 16px rgba(0, 0, 0, 0.06)` - 호버 카드
- **Level 3**: `0 8px 24px rgba(0, 0, 0, 0.08)` - 드롭다운
- **Level 4**: `0 12px 32px rgba(0, 0, 0, 0.10)` - 모달
- **Level 5**: `0 24px 48px rgba(0, 0, 0, 0.12)` - 팝오버

### Colored Shadows
- **Primary Shadow**: `0 4px 14px rgba(0, 102, 255, 0.25)`
- **Success Shadow**: `0 4px 14px rgba(0, 212, 170, 0.25)`
- **Error Shadow**: `0 4px 14px rgba(255, 59, 48, 0.25)`

## 8. 효과 (Effects)

### Glassmorphism
```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.18);
```

### Gradient Overlays
```css
/* 히어로 오버레이 */
background: linear-gradient(180deg, 
  rgba(10, 37, 64, 0) 0%, 
  rgba(10, 37, 64, 0.8) 100%);

/* 카드 호버 오버레이 */
background: linear-gradient(135deg, 
  rgba(0, 102, 255, 0.05) 0%, 
  rgba(0, 153, 255, 0.05) 100%);
```

### Glow Effects
```css
/* 버튼 글로우 */
box-shadow: 
  0 0 20px rgba(0, 102, 255, 0.5),
  0 0 40px rgba(0, 102, 255, 0.3);

/* 텍스트 글로우 */
text-shadow: 0 0 20px rgba(0, 102, 255, 0.5);
```

## 9. 다크 모드 (Dark Mode)

### Dark Palette
- **Background**: `#0A0A0A`
- **Surface**: `#1A1A1A`
- **Surface Variant**: `#2A2A2A`
- **Border**: `rgba(255, 255, 255, 0.1)`
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `rgba(255, 255, 255, 0.7)`
- **Text Tertiary**: `rgba(255, 255, 255, 0.5)`

### Dark Mode Adjustments
- 그림자 강도 50% 감소
- 배경 대비 증가
- 채도 20% 감소 (눈의 피로 감소)
- 글로우 효과 강화

## 10. 최신 디자인 패턴 (Modern Design Patterns)

### Animated Backgrounds
```css
/* Blob Animation */
@keyframes blob {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}
.animate-blob { animation: blob 7s infinite; }

/* Gradient Animation */
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

/* Mouse-tracked Blob Animation */
.mouse-blob {
  position: absolute;
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Bounce Animation */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.animate-bounce { animation: bounce 1s infinite; }
```

### Glassmorphism Components
```css
/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(0, 102, 255, 0.1);
}

/* Glass Button */
.glass-button {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}
.glass-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 102, 255, 0.2);
}
```

### Neumorphism (Soft UI)
```css
.neumorphic {
  background: #f0f0f0;
  border-radius: 20px;
  box-shadow: 
    20px 20px 60px #bebebe,
    -20px -20px 60px #ffffff;
}
```

### Micro-interactions
1. **Button Hover**: Scale(1.02) + Shadow + Color transition + Spring animation
2. **Card Hover**: Lift effect(-8px) + Shadow expansion + 3D Perspective rotation
3. **Link Hover**: Underline animation + Color change + Arrow slide
4. **Input Focus**: Border glow with label animation
5. **Icon Hover**: 360° rotation + Scale(1.1) + Wiggle effect
6. **Badge Pulse**: Scale animation (1 → 1.1 → 1) infinite loop
7. **Mouse Tracking**: Mouse position based element movement (parallax * 0.02~0.03)

### Advanced Animations
```css
/* Stagger Animation */
.stagger-item {
  opacity: 0;
  animation: fadeInUp 0.5s ease-out forwards;
}
.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 50ms; }
.stagger-item:nth-child(3) { animation-delay: 100ms; }

/* Smooth Scroll Reveal */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.reveal.active {
  opacity: 1;
  transform: translateY(0);
}

/* 3D Card Tilt */
.card-3d {
  transform-style: preserve-3d;
  transition: transform 0.3s ease-out;
}
.card-3d:hover {
  transform: perspective(1000px) rotateX(-5deg) rotateY(5deg);
}

/* Page Transition */
.page-transition {
  animation: pageEnter 0.4s ease-out;
}
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Framer Motion Configurations
```typescript
// Spring Animation Config
const springConfig = {
  type: "spring",
  stiffness: 400,
  damping: 17
};

// Scroll Animation Hook
const scrollAnimation = {
  initial: { y: 50, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.5, type: "spring", stiffness: 100 }
};

// Mouse Tracking Animation
const mouseTracking = {
  animate: {
    x: mousePosition.x * 0.02,
    y: mousePosition.y * 0.02,
  },
  transition: { type: "spring", damping: 30, stiffness: 200 }
};

// Hero Section Text Animation
const heroTextAnimation = {
  initial: { x: -50, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.6, delay: 0.5 }
};
```

### Modern Layout Patterns
1. **Bento Grid**: 불규칙한 그리드 레이아웃
2. **Card Masonry**: Pinterest 스타일 카드 배치
3. **Sidebar + Content**: 고정 사이드바와 스크롤 콘텐츠
4. **Full-bleed Sections**: 전체 너비 섹션과 제한된 콘텐츠 영역 조합

## 11. 새로 추가된 인터랙티브 요소 (New Interactive Elements)

### Hero Section Enhancements
1. **Gradient Text Animation**: 시러 효과와 함께 그래디언트 텍스트 애니메이션
2. **Floating Badges**: 바운스 애니메이션이 적용된 상태 배지
3. **Statistics Cards**: 호버 시 회전 + 스케일 효과
4. **Parallax Background**: 스크롤 기반 패럴랙스 배경

### Interactive Card Effects
1. **3D Tilt on Hover**: perspective(1000px) rotateX(-5deg) rotateY(5deg)
2. **Progressive Reveal**: Intersection Observer로 구현된 스크롤 기반 등장
3. **Icon Animations**: 360도 회전 + wiggle 효과
4. **Gradient Overlay**: 호버 시 나타나는 그래디언트 오버레이

### Button Improvements
1. **Spring Animations**: Framer Motion spring 기반 효과
2. **Ripple Effect**: 클릭 시 퍼지는 리플 효과
3. **Animated Icons**: 화살표 아이콘 슬라이드 애니메이션

### Page Transitions
1. **Fade + Slide**: opacity + translateY 기반 페이지 전환
2. **Route-based Animations**: 라우트별 다른 애니메이션 적용
3. **Loading States**: 스켈레톤 스크린 + 프로그레스 표시

### News Section 3D Effects
1. **Card Elevation**: 호버 시 3D 상승 효과
2. **Badge Animations**: NEW 배지 펄스 애니메이션
3. **Category Hover**: 카테고리 배지 스케일 효과

## 12. 접근성 고려사항 (Accessibility)

### Color Contrast
- 텍스트와 배경 간 최소 4.5:1 대비율 유지 (WCAG AA)
- 중요 UI 요소는 3:1 이상 대비율

### Focus States
```css
.focusable:focus-visible {
  outline: 2px solid #0066FF;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Support
- 의미 있는 alt 텍스트
- ARIA 레이블 적절히 사용
- 키보드 내비게이션 지원
- Skip links 제공