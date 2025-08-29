# WAVE SPACE HTTPS 로컬 서버 설정 가이드

## 🔒 Firebase SMS 인증을 위한 HTTPS 설정

Firebase reCAPTCHA는 보안상의 이유로 HTTPS 환경을 권장합니다.
HTTP로 실행 시 Google reCAPTCHA와의 통신에 문제가 발생할 수 있습니다.

## 🚨 현재 문제

### HTTP(localhost:8000) 사용 시 발생하는 에러
- **프로토콜 불일치**: Google reCAPTCHA(HTTPS)와 localhost(HTTP) 간 통신 차단
- **보안 정책 위반**: Mixed Content 정책에 의한 차단
- **reCAPTCHA 재사용 에러**: `auth/internal-error` 발생

## ✅ 해결 방법

### 방법 1: 테스트 모드 사용 (권장 - 개발용)

현재 구현된 테스트 모드를 사용하면 실제 SMS 없이 개발 가능:
- **인증번호**: `123456` (고정)
- **자동 활성화**: file:// 프로토콜 사용 시
- **Mock 응답**: 실제 Firebase 없이 동작

```bash
# file:// 프로토콜로 직접 실행
# 브라우저에서 D:\wavespace\signup.html 열기
```

### 방법 2: HTTPS 로컬 서버 (실제 SMS 테스트)

#### Option A: mkcert 사용 (권장)

1. **mkcert 설치**
```bash
# Windows (Chocolatey)
choco install mkcert

# 또는 수동 다운로드
# https://github.com/FiloSottile/mkcert/releases
```

2. **로컬 인증서 생성**
```bash
# CA 설치
mkcert -install

# 인증서 생성
mkcert localhost 127.0.0.1 ::1
```

3. **HTTPS 서버 실행**
```bash
# Node.js http-server 사용
npx http-server -S -C localhost+2.pem -K localhost+2-key.pem -p 8443

# Python 사용
python https_server.py
```

`https_server.py` 파일:
```python
import http.server
import ssl

server_address = ('localhost', 8443)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket,
                               certfile='./localhost+2.pem',
                               keyfile='./localhost+2-key.pem',
                               server_side=True)
print("HTTPS Server running on https://localhost:8443")
httpd.serve_forever()
```

4. **브라우저 접속**
```
https://localhost:8443/signup.html
```

#### Option B: VS Code Live Server (간편)

1. **Live Server 확장 설치**
2. **설정 파일 생성** (`.vscode/settings.json`)
```json
{
  "liveServer.settings.https": {
    "enable": true,
    "cert": "C:\\path\\to\\localhost.pem",
    "key": "C:\\path\\to\\localhost-key.pem",
    "passphrase": ""
  },
  "liveServer.settings.port": 5500,
  "liveServer.settings.host": "localhost"
}
```

3. **Live Server 실행**
- 우클릭 → "Open with Live Server"
- 자동으로 https://localhost:5500 열림

#### Option C: ngrok (외부 접속 가능)

1. **ngrok 설치**
```bash
# https://ngrok.com/download
```

2. **HTTP 서버 실행**
```bash
python -m http.server 8000
```

3. **ngrok 터널 생성**
```bash
ngrok http 8000
```

4. **HTTPS URL로 접속**
```
https://[생성된-도메인].ngrok.io/signup.html
```

## 🔧 Firebase Console 설정

### 승인된 도메인 추가
1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 선택 → Authentication → Settings
3. Authorized domains 탭
4. 다음 도메인 추가:
   - `localhost`
   - `127.0.0.1`
   - `[ngrok-domain].ngrok.io` (ngrok 사용 시)

### Phone Authentication 설정
1. Authentication → Sign-in method
2. Phone 활성화
3. Test phone numbers 추가 (개발용):
   - 번호: `+821012345678`
   - 인증코드: `123456`

## 📊 환경별 비교

| 환경 | 프로토콜 | SMS 발송 | reCAPTCHA | 용도 |
|------|---------|----------|-----------|------|
| file:// | 파일 | ❌ Mock | ✅ 테스트 | 개발 |
| http://localhost | HTTP | ⚠️ 제한적 | ⚠️ 에러 가능 | 테스트 |
| https://localhost | HTTPS | ✅ 실제 | ✅ 정상 | 실제 테스트 |
| Production | HTTPS | ✅ 실제 | ✅ 정상 | 운영 |

## 🐛 문제 해결

### "auth/internal-error" 에러
- **원인**: reCAPTCHA 재사용 시도
- **해결**: 페이지 새로고침 또는 재발송 버튼 사용

### Mixed Content 에러
- **원인**: HTTP/HTTPS 혼용
- **해결**: HTTPS 사용 또는 테스트 모드 사용

### "Failed to read a named property" 에러
- **원인**: 프로토콜 불일치 (HTTP vs HTTPS)
- **해결**: HTTPS 로컬 서버 사용

## 🎯 권장 개발 워크플로우

1. **일반 개발**: file:// 프로토콜 + 테스트 모드
2. **SMS 테스트**: HTTPS 로컬 서버 + 실제 Firebase
3. **통합 테스트**: ngrok + 실제 핸드폰
4. **프로덕션**: HTTPS 도메인 + 실제 Firebase

---

*Last Updated: 2025-08-29*