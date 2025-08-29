# SMS 인증 문제 해결 가이드

Firebase SMS 인증에서 발생하는 reCAPTCHA 관련 오류 해결 방법입니다.

## 🚨 주요 문제: 프로토콜 불일치 (HTTP ↔ HTTPS)

현재 `localhost:8000` (HTTP)에서 Google reCAPTCHA (HTTPS) 간 보안 정책으로 인한 접근 차단이 발생하고 있습니다.

## ⚡ 즉시 해결 방법

### 1. HTTPS 로컬 서버 사용 (권장)

**VS Code Live Server 사용:**
1. VS Code에서 Live Server 확장 설치
2. 설정에서 `Live Server > Settings: Use Local Ip` 활성화
3. 설정에서 `Live Server > Settings: Use Https` 활성화
4. HTML 파일 우클릭 → "Open with Live Server"

**Node.js http-server 사용:**
```bash
npm install -g http-server
# 인증서 생성 (한 번만)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
# HTTPS 서버 시작
http-server -S -C cert.pem -K key.pem -p 8000
```

### 2. Firebase 콘솔 도메인 승인

Firebase Console > Authentication > Settings > Authorized domains에서 다음 도메인 추가:
- `localhost`
- `127.0.0.1`
- `localhost:8000`
- 현재 사용 중인 도메인

### 3. reCAPTCHA 재시도 로직 개선

기존 코드를 개선하여:
- ✅ 프로토콜 자동 감지 및 에러 메시지 개선
- ✅ 사용자에게 명확한 해결책 제시
- ✅ 보안 오류 상세 진단 추가
- ✅ 자동 재시도 및 복구 로직 강화

## 🔧 개선된 기능

### 자동 환경 감지
```javascript
// 프로토콜 및 환경 체크
const protocol = location.protocol;
const hostname = location.hostname;

if (protocol !== 'https:' && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // 명확한 에러 메시지와 해결책 제공
}
```

### 에러 분류 및 대응
```javascript
if (error.name === 'SecurityError') {
    console.error('💡 SecurityError: 프로토콜 불일치(HTTP/HTTPS) 문제');
} else if (error.message.includes('protocol')) {
    console.error('💡 프로토콜 오류: HTTPS와 HTTP 간 통신 문제');
} else if (error.message.includes('domain')) {
    console.error('💡 도메인 오류: Firebase 콘솔에서 현재 도메인을 승인하세요');
}
```

## 🎯 테스트 방법

1. **HTTPS 환경에서 테스트**
   - VS Code Live Server HTTPS 모드
   - 또는 `https://localhost:5500` 접속

2. **Firebase Console 확인**
   - 프로젝트: wavespace-sms
   - Authentication > Settings > Authorized domains
   - 현재 도메인이 추가되어 있는지 확인

3. **브라우저 개발자 도구 확인**
   - Console 탭에서 에러 메시지 확인
   - 이제 더 명확한 해결책이 표시됩니다

## 🚀 최종 권장사항

1. **HTTPS 로컬 서버 사용** (가장 확실한 해결책)
2. Firebase Console에서 도메인 승인 추가
3. 개선된 reCAPTCHA 에러 핸들링 활용
4. 문제 지속 시 페이지 새로고침 시도

## 📞 추가 도움

문제가 지속될 경우:
1. 브라우저 캐시 삭제
2. 다른 브라우저에서 테스트
3. 네트워크 연결 상태 확인
4. Firebase 프로젝트 상태 확인