@echo off
echo HTTPS 로컬 서버 시작...
echo.
echo 인증서가 없다면 다음 중 하나를 사용하세요:
echo 1. Live Server (VS Code 확장)의 HTTPS 모드
echo 2. Node.js http-server: npm install -g http-server && http-server -S -C cert.pem -K key.pem
echo 3. Python HTTPS: python -m http.server 8000 --bind localhost (인증서 필요)
echo.
echo Firebase 콘솔에서 인증 도메인에 https://localhost:8000 추가 필요
echo.
pause