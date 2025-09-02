# WAVE SPACE 보안 가이드라인

## XSS 방지 가이드

### 1. 안전한 DOM 조작

#### ❌ 위험한 방법
```javascript
element.innerHTML = `<div>${userInput}</div>`;
```

#### ✅ 안전한 방법
```javascript
// 방법 1: XSS 보호 유틸리티 사용
element.innerHTML = `<div>${safe(userInput)}</div>`;

// 방법 2: textContent 사용
element.textContent = userInput;

// 방법 3: DOM API 사용
const div = document.createElement('div');
div.textContent = userInput;
element.appendChild(div);
```

### 2. XSS 보호 유틸리티 사용법

```javascript
// 기본 사용
const safeName = safe(userName);
const safeHtml = `<div class="user">${safeName}</div>`;

// URL 처리
const safeLink = safeUrl(userProvidedUrl);
const link = `<a href="${safeLink}">링크</a>`;

// 템플릿 리터럴
const html = safeHtml`
    <div class="profile">
        <h3>${userName}</h3>
        <p>${userBio}</p>
    </div>
`;
```

### 3. 신뢰할 수 있는 콘텐츠

Font Awesome 아이콘이나 정적 HTML은 안전합니다:
```javascript
// ✅ 안전 - 정적 콘텐츠
element.innerHTML = '<i class="fas fa-user"></i>';

// ❌ 위험 - 동적 콘텐츠
element.innerHTML = `<i class="${userIcon}"></i>`;

// ✅ 안전하게 수정
element.innerHTML = `<i class="${safe(userIcon)}"></i>`;
```

## API 키 보안

### 1. 환경변수 사용

개발 환경:
```javascript
// config.dev.js
window.SUPABASE_URL = 'your-dev-url';
window.SUPABASE_ANON_KEY = 'your-dev-key';
```

운영 환경:
```javascript
// config.prod.js (gitignore에 추가)
window.SUPABASE_URL = 'your-prod-url';
window.SUPABASE_ANON_KEY = 'your-prod-key';
```

### 2. HTML에서 로드

```html
<!-- 개발 환경 -->
<script src="config.dev.js"></script>

<!-- 운영 환경 (배포 시 변경) -->
<script src="config.prod.js"></script>
```

## 인증 보안

### 1. 클라이언트 사이드 권한 검증 금지

```javascript
// ❌ 위험 - 클라이언트에서 권한 검증
if (user.role === 'admin') {
    showAdminPanel();
}

// ✅ 안전 - 서버에서 권한 검증
const { data, error } = await supabase
    .rpc('check_admin_permission', { user_id: user.id });
if (data) {
    showAdminPanel();
}
```

### 2. 민감 정보 저장

```javascript
// ❌ 위험 - localStorage에 민감 정보 저장
localStorage.setItem('userPassword', password);

// ✅ 안전 - 필요한 정보만 저장
localStorage.setItem('userProfile', JSON.stringify({
    username: user.username,
    points: user.points
}));
```

## 체크리스트

- [ ] 모든 사용자 입력은 `safe()` 함수로 이스케이프
- [ ] innerHTML 사용 시 XSS 보호 적용
- [ ] API 키는 환경변수로 분리
- [ ] 클라이언트 사이드 권한 검증 제거
- [ ] 민감 정보는 서버에만 저장
- [ ] HTTPS 사용 (운영 환경)
- [ ] CSP 헤더 설정 확인