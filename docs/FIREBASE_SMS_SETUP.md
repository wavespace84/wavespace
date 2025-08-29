# Firebase SMS 인증 설정 가이드

WAVE SPACE 플랫폼에서 Firebase Authentication을 사용한 실제 SMS 인증 구현을 위한 설정 가이드입니다.

## 🚀 현재 상태

- ✅ Firebase SDK 통합 완료
- ✅ SMS 인증 로직 구현 완료  
- ✅ Mock 모드 fallback 구현 완료
- ✅ reCAPTCHA 통합 완료
- ⚠️ **Firebase 프로젝트 설정 필요** (아래 가이드 참조)

## 📋 Firebase 프로젝트 설정

### 1. Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `wavespace-sms` (또는 원하는 이름)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 2. Authentication 설정
1. Firebase Console에서 프로젝트 선택
2. 왼쪽 메뉴에서 "Authentication" 클릭
3. "시작하기" 클릭
4. "Sign-in method" 탭으로 이동
5. "전화번호" 제공업체 활성화
   - 상태를 "사용 설정됨"으로 변경
   - "저장" 클릭

### 3. 웹 앱 등록
1. 프로젝트 설정(톱니바퀴 아이콘) > "일반" 탭
2. "내 앱" 섹션에서 웹 앱 아이콘(`</>`) 클릭
3. 앱 닉네임: `WAVE SPACE Web`
4. "앱 등록" 클릭
5. Firebase SDK 설정 정보 확인

### 4. 도메인 승인 (배포 시)
1. Authentication > Settings > Authorized domains
2. 실제 도메인 추가 (예: `wavespace.com`)
3. 개발 중에는 `localhost`가 자동으로 포함됨

## 🔧 코드 설정

### Firebase 설정 업데이트
`js/config/firebase.js` 파일에서 설정 정보를 실제 값으로 교체:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // 실제 API 키
    authDomain: "wavespace-sms.firebaseapp.com", // 실제 프로젝트 ID
    projectId: "wavespace-sms", // 실제 프로젝트 ID
    storageBucket: "wavespace-sms.appspot.com", // 실제 프로젝트 ID
    messagingSenderId: "123456789012", // 실제 Sender ID
    appId: "1:123456789012:web:abcdef123456789012" // 실제 App ID
};
```

### 설정 정보 위치
Firebase Console > 프로젝트 설정 > 일반 > SDK 설정 및 구성에서 확인할 수 있습니다.

## 📱 SMS 인증 플로우

### 현재 구현된 기능
1. **전화번호 입력**: 한국 형식 (010-1234-5678)
2. **reCAPTCHA 인증**: 봇 방지를 위한 Google reCAPTCHA
3. **SMS 발송**: Firebase를 통한 실제 SMS 발송
4. **인증코드 확인**: 6자리 숫자 코드 검증
5. **타이머**: 3분 제한시간 및 재발송 기능

### 사용자 경험
1. 전화번호 입력 → 본인인증 버튼 클릭
2. reCAPTCHA 체크박스 체크
3. SMS 수신 대기 (몇 초 ~ 1분)
4. 6자리 인증번호 입력
5. 인증 완료

## 💰 Firebase 무료 할당량

Firebase Authentication의 전화번호 인증은 **월 10,000회 무료**입니다:
- 10,000번의 SMS 인증 시도
- 초과 시 SMS당 $0.01 (약 13원)
- 대부분의 중소규모 서비스에서는 무료 범위 내 사용 가능

## 🔄 Mock 모드 vs 실제 모드

### Mock 모드 (현재 기본값)
- Firebase 설정이 완료되지 않은 경우 자동 활성화
- 콘솔에 6자리 인증번호 출력
- 실제 SMS 발송하지 않음
- 개발 및 테스트 용도

### 실제 모드
- Firebase 설정 완료 후 자동 활성화
- 실제 SMS 발송
- reCAPTCHA 인증 필요
- 프로덕션 환경 사용

## 🛡️ 보안 고려사항

### Firebase 보안 규칙
```javascript
// Firebase Security Rules (Firestore)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### API 키 보호
- 클라이언트 측에서는 API 키가 노출됨 (정상)
- Firebase Console에서 API 키 제한 설정 권장
- 프로덕션에서는 도메인 제한 필수

### Rate Limiting
- Firebase에서 자동으로 rate limiting 적용
- 동일 번호 1분 이내 재요청 제한
- 동일 IP 시간당 요청 수 제한

## 📊 모니터링 및 디버깅

### Firebase Console 모니터링
1. Authentication > 사용자: 가입된 전화번호 확인
2. Usage and billing: SMS 사용량 모니터링
3. 로그: Cloud Functions 로그 확인 (필요시)

### 브라우저 디버깅
```javascript
// 개발자 도구 콘솔에서 확인 가능한 로그
✅ Firebase 초기화 완료
📱 전화번호 인증 서비스 로드됨
🔄 Mock 모드로 동작 (Firebase 미설정시)
```

## ❗ 자주 발생하는 문제

### 1. reCAPTCHA 오류
**증상**: "reCAPTCHA verification failed"
**해결**: 
- 도메인이 Firebase Console에 등록되어 있는지 확인
- 브라우저 광고 차단기 비활성화
- 시크릿 브라우징 모드 해제

### 2. SMS 발송 실패
**증상**: "SMS 발송에 실패했습니다"
**해결**:
- 전화번호 형식 확인 (010-1234-5678)
- Firebase 프로젝트에서 전화번호 인증 활성화 확인
- 무료 할당량 초과 여부 확인

### 3. Mock 모드에서 벗어나지 못함
**증상**: 계속 Mock 인증번호가 콘솔에 출력됨
**해결**:
- `js/config/firebase.js`의 `firebaseConfig` 업데이트 확인
- API 키가 "YOUR_API_KEY_HERE"가 아닌지 확인
- 브라우저 새로고침

## 🚀 배포 시 확인사항

1. **도메인 등록**: Firebase Console에서 실제 도메인 승인
2. **HTTPS 필수**: Firebase는 HTTPS에서만 동작
3. **API 키 제한**: Google Cloud Console에서 API 키 제한 설정
4. **모니터링 설정**: SMS 사용량 알림 설정

## 🔗 참고 자료

- [Firebase Authentication 전화번호 인증 가이드](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase 가격 정보](https://firebase.google.com/pricing)
- [reCAPTCHA 설정 가이드](https://developers.google.com/recaptcha/docs/display)

---

**현재 상태**: Mock 모드로 동작 중. 실제 SMS 발송을 원하시면 위 가이드를 따라 Firebase 설정을 완료하세요.