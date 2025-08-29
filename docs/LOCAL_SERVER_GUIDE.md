# WAVE SPACE 로컬 서버 실행 가이드

## 🔥 Firebase SMS 인증 사용을 위한 로컬 서버 설정

WAVE SPACE의 회원가입 본인인증 기능은 Firebase Authentication을 사용합니다.
보안상의 이유로 Firebase reCAPTCHA는 `file://` 프로토콜에서 작동하지 않으므로, 로컬 서버를 실행해야 합니다.

## 📋 빠른 시작

### 방법 1: Python (권장)
```bash
# Python 3.x
python -m http.server 8000

# Python 2.x (구버전)
python -m SimpleHTTPServer 8000
```
브라우저에서 접속: http://localhost:8000/signup.html

### 방법 2: Node.js
```bash
# npx 사용 (설치 불필요)
npx http-server -p 8000

# 또는 전역 설치 후 사용
npm install -g http-server
http-server -p 8000
```
브라우저에서 접속: http://localhost:8000/signup.html

### 방법 3: VS Code Live Server
1. VS Code에서 `Live Server` 확장 설치
2. HTML 파일에서 우클릭 → "Open with Live Server"
3. 자동으로 브라우저가 열림 (기본 포트: 5500)

## 🛠️ 상세 설정

### Python 서버 옵션
```bash
# 특정 포트 사용
python -m http.server 3000

# 특정 IP 바인딩
python -m http.server 8000 --bind 127.0.0.1

# 디렉토리 지정
python -m http.server 8000 --directory D:\wavespace
```

### Node.js 서버 옵션
```bash
# CORS 활성화
npx http-server -p 8000 --cors

# HTTPS 사용 (자체 서명 인증서)
npx http-server -p 8000 -S -C cert.pem -K key.pem

# 캐시 비활성화
npx http-server -p 8000 -c-1
```

### VS Code Live Server 설정
`.vscode/settings.json` 파일 생성:
```json
{
  "liveServer.settings.port": 8000,
  "liveServer.settings.host": "localhost",
  "liveServer.settings.root": "/",
  "liveServer.settings.https": {
    "enable": false
  }
}
```

## 🔍 문제 해결

### 포트가 이미 사용 중일 때
```bash
# Windows - 포트 사용 프로세스 확인
netstat -ano | findstr :8000

# 프로세스 종료
taskkill /PID <프로세스ID> /F

# 다른 포트 사용
python -m http.server 8080
```

### 방화벽 문제
- Windows Defender 방화벽에서 Python/Node.js 허용
- 안티바이러스 소프트웨어 예외 추가

### Firebase reCAPTCHA 오류
1. http://localhost:8000 또는 http://127.0.0.1:8000 사용
2. file:// 프로토콜 사용 금지
3. Firebase Console에서 도메인 승인 확인

## 🧪 테스트 모드

`file://` 프로토콜로 직접 실행 시:
- 자동으로 테스트 모드 활성화
- 실제 SMS 발송 없이 개발 가능
- 테스트용 reCAPTCHA UI 제공

## 📱 실제 SMS 인증 테스트

1. 로컬 서버 실행 (위 방법 중 택 1)
2. http://localhost:8000/signup.html 접속
3. 회원가입 폼 작성
4. reCAPTCHA 체크
5. 본인인증 버튼 클릭
6. 실제 SMS 수신 및 인증

## 🚀 프로덕션 배포

프로덕션 환경에서는:
- HTTPS 필수
- Firebase Console에서 도메인 승인
- 실제 도메인 사용 (예: https://wavespace.com)

## 📞 지원

문제가 지속될 경우:
1. 브라우저 콘솔 확인 (F12)
2. Firebase Console 설정 확인
3. 네트워크 연결 상태 확인

---

*Last Updated: 2025-08-29*