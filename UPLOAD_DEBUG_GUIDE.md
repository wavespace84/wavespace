# 🚨 시장조사서 업로드 디버깅 가이드

시장조사서 업로드가 실패하는 문제를 해결하기 위한 단계별 디버깅 가이드입니다.

## 🔧 즉시 확인사항

### 1. 브라우저 콘솔 확인
`F12` → `Console` 탭에서 다음 정보를 확인:

```javascript
// 1. Storage 헬스체크
checkStorageHealth()

// 2. 전체 시스템 상태 확인  
console.log('시스템 상태:', {
    hasWaveSupabase: !!window.WaveSupabase,
    hasMarketResearchSupabase: !!window.MarketResearchSupabase,
    currentUser: window.WaveSupabase?.currentUser,
    storageDisabled: window.MarketResearchSupabase?.storageDisabled
});

// 3. 테스트 업로드
testFileUpload()
```

### 2. 예상되는 문제들과 해결책

#### 문제 1: "Storage 기능 비활성화됨"
**원인**: RLS 정책 또는 버킷 권한 문제  
**해결**: 
1. Supabase 대시보드 → Storage → 정책 확인
2. `createBucketGuide()` 실행하여 수동 버킷 생성

#### 문제 2: "사용자 인증 실패"
**원인**: 로그인되지 않은 상태  
**해결**: 
```javascript
// 익명 로그인 시도
await window.WaveSupabase.getClient().auth.signInAnonymously()
```

#### 문제 3: "RLS 정책으로 인한 업로드 실패"
**원인**: Storage 테이블 접근 권한 없음  
**해결**: 이미 정책이 생성되었으므로 페이지 새로고침

#### 문제 4: "파일 크기 초과"
**원인**: 50MB 제한 초과  
**해결**: 파일 크기 확인 후 압축 또는 분할

## 🛠️ 단계별 디버깅

### Step 1: 초기화 상태 확인
```javascript
window.MarketResearchSupabase.checkStorageHealth()
```

### Step 2: 테스트 업로드 실행
```javascript  
window.MarketResearchSupabase.testFileUpload()
```

### Step 3: 실제 파일 업로드 테스트
- `test-storage-upload.html` 페이지 사용
- 작은 PDF 파일로 테스트

### Step 4: 로그 분석
업로드 시 콘솔에서 다음 로그 확인:
- `🚀 파일 업로드 시작`
- `🔐 인증 상태`
- `📤 Storage 업로드 시작`
- `✅ Storage 업로드 성공` 또는 `❌ Storage 업로드 실패`

## 🚑 긴급 해결책

### 방법 1: Storage 강제 재활성화
```javascript
window.MarketResearchSupabase.storageDisabled = false;
window.MarketResearchSupabase.forceCreateBucket();
```

### 방법 2: 익명 인증으로 업로드
```javascript
// 익명 로그인
await window.WaveSupabase.getClient().auth.signInAnonymously();

// 업로드 재시도
// (파일 선택 후 업로드 버튼 클릭)
```

### 방법 3: 수동 버킷 생성
1. https://supabase.com/dashboard 접속
2. 프로젝트 → Storage 메뉴
3. "Create bucket" 클릭
4. 버킷명: `market-research`
5. Public bucket 체크
6. 생성 후 페이지 새로고침

## 📞 문제 보고

위의 모든 방법이 실패할 경우:

1. **콘솔 로그 전체 복사** (`Ctrl+A`, `Ctrl+C`)
2. **오류 메시지 스크린샷**
3. **브라우저 및 OS 정보**
4. **업로드 시도한 파일 정보** (크기, 확장자)

함께 보고해주시면 정확한 원인을 파악할 수 있습니다.

## ⚡ 최신 수정사항 (방금 적용됨)

1. ✅ Storage RLS 정책 생성 완료
2. ✅ 디버깅 로그 대폭 강화
3. ✅ 익명 사용자 자동 인증 추가
4. ✅ 사용자 ID null 문제 해결
5. ✅ 에러 분석 및 해결 가이드 추가

**이제 업로드가 정상적으로 작동해야 합니다!**