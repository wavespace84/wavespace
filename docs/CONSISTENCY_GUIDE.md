# WAVE SPACE 일관성 가이드

## 🎯 프로젝트 일관성 유지 원칙

### 1. 파일 구조 패턴
```
페이지명.html       # HTML 구조
페이지명.css        # 페이지 전용 스타일
페이지명.js         # 페이지 전용 스크립트
js/페이지명.js      # 모듈화된 스크립트
```

### 2. CSS 작성 규칙
- **common.css 우선**: 공통 스타일은 common.css에 정의
- **BEM 네이밍**: `.block__element--modifier` 패턴 사용
- **CSS 변수 활용**: 색상, 간격은 CSS 변수로 관리
- **Glass Morphism**: 카드 컴포넌트에 일관되게 적용
```css
.card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### 3. JavaScript 패턴
- **ES6 모듈**: import/export 사용
- **이벤트 위임**: 동적 요소는 부모에 이벤트 바인딩
- **localStorage 활용**: 사용자 데이터, 설정 저장
- **한국어 변수명 지양**: 주석은 한국어, 코드는 영어
```javascript
// 사용자 포인트 업데이트
function updateUserPoints(points) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    userData.points = points;
    localStorage.setItem('userData', JSON.stringify(userData));
}
```

### 4. HTML 구조 패턴
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>페이지명 - WAVE SPACE</title>
    <link rel="stylesheet" href="common.css">
    <link rel="stylesheet" href="페이지명.css">
</head>
<body data-page="페이지명">
    <!-- 헤더 -->
    <div id="header-container"></div>
    
    <!-- 사이드바 -->
    <div id="sidebar-container"></div>
    
    <!-- 메인 컨텐츠 -->
    <main class="main-content">
        <!-- 페이지별 컨텐츠 -->
    </main>
    
    <script type="module" src="js/main.js"></script>
    <script src="페이지명.js"></script>
</body>
</html>
```

### 5. 색상 팔레트 (엄격히 준수)
```css
:root {
    --primary: #0066FF;
    --primary-bright: #0099FF;
    --primary-sky: #00CCFF;
    --success: #4CAF50;
    --warning: #FF9800;
    --danger: #f44336;
    --text-primary: #1a1a1a;
    --text-secondary: #666;
    --bg-light: #f8f9fa;
    --bg-white: #ffffff;
}
```

### 6. 반응형 브레이크포인트
```css
/* 모바일 우선 */
@media (min-width: 640px) { /* 태블릿 */ }
@media (min-width: 1024px) { /* 데스크톱 */ }
```

### 7. 아이콘 사용
- **Font Awesome 6**: 일관된 아이콘 사용
- **크기**: 16px(small), 20px(default), 24px(large)

### 8. 애니메이션 표준
```css
.transition-default {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 9. 사용자 경험 원칙
- **즉각적 피드백**: 모든 액션에 시각적 피드백
- **부드러운 전환**: 애니메이션으로 상태 변화 표시
- **한국어 UI**: 모든 텍스트 한국어로 표시
- **모바일 최적화**: 터치 친화적 UI (최소 44px 터치 영역)

### 10. 데이터 관리
- **mockUsers.js**: 테스트용 사용자 데이터
- **localStorage**: 세션 간 데이터 유지
- **JSON 형식**: 모든 데이터 저장/불러오기

### 11. 페이지 추가 시 체크리스트
- [ ] HTML 파일 생성 (템플릿 구조 준수)
- [ ] CSS 파일 생성 (common.css 임포트)
- [ ] JS 파일 생성 (필요시)
- [ ] 사이드바 메뉴 추가
- [ ] 반응형 테스트
- [ ] 한국어 텍스트 검증
- [ ] Glass Morphism 효과 적용
- [ ] localStorage 연동

### 12. 커밋 메시지 규칙
- feat: 새로운 기능 추가
- fix: 버그 수정
- style: CSS/UI 변경
- refactor: 코드 개선
- docs: 문서 수정
- test: 테스트 관련

## 📌 핵심 원칙
**"일관성 > 완벽함"** - 기존 패턴을 따르는 것이 새로운 최적화보다 중요