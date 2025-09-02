# WAVE SPACE 코드 리팩토링 가이드

## 완료된 리팩토링

### 1. 로깅 시스템 통합
**이전**: 290개의 `console.log` 무분별 사용
**이후**: `js/utils/logger.js` 통합 로깅 시스템

```javascript
// 이전
console.log('데이터 로드 완료:', data);

// 이후
Logger.info('데이터 로드 완료', data);
Logger.debug('상세 정보', details); // 개발 환경에서만 표시
Logger.error('오류 발생', error); // 운영 환경에서도 추적
```

### 2. 공통 유틸리티 함수
**파일**: `js/utils/common.js`

#### 중복 제거된 패턴들:
- **로딩 상태 관리**: `LoadingManager` 클래스
- **로컬스토리지 처리**: `Storage` 객체
- **URL 파라미터**: `URLParams` 객체
- **디바운스/쓰로틀**: 표준화된 구현
- **재시도 로직**: `retry` 함수

### 3. 포맷팅 함수 통합
**파일**: `js/utils/formatters.js`

#### 통합된 포맷터:
- **날짜 포맷**: `DateFormatter` (상대 시간, 날짜/시간 등)
- **숫자 포맷**: `NumberFormatter` (콤마, 축약, 원화 등)
- **텍스트 포맷**: `TextFormatter` (마스킹, 자르기 등)

### 4. Supabase 헬퍼
**파일**: `js/utils/supabaseHelper.js`

#### 중복 제거된 기능:
- **클라이언트 초기화**: `getSupabaseClient()`
- **에러 처리**: `handleSupabaseError()`
- **페이지네이션**: `PaginationHelper` 클래스
- **실시간 구독**: `RealtimeHelper` 클래스
- **파일 업로드**: `FileUploadHelper` 클래스

## 사용 예시

### 로거 사용
```javascript
// 개발 환경에서만 표시
Logger.debug('디버그 정보', data);

// 정보성 로그
Logger.info('사용자 로그인', { userId: user.id });

// 경고
Logger.warn('API 응답 지연', { responseTime: 3000 });

// 에러 (운영 환경에서도 추적)
Logger.error('결제 실패', error);

// 성능 측정
Logger.time('dataLoad');
// ... 작업 수행
Logger.timeEnd('dataLoad');
```

### 공통 유틸리티 사용
```javascript
// 로딩 관리
const loader = new WaveUtils.LoadingManager(submitBtn);
loader.start('처리 중...');
// ... 비동기 작업
loader.stop();

// 로컬스토리지 (자동 JSON 처리)
WaveUtils.Storage.set('userData', { name: '홍길동' }, 24); // 24시간 후 만료
const data = WaveUtils.Storage.get('userData');

// URL 파라미터
const category = WaveUtils.URLParams.get('category');
WaveUtils.URLParams.set('page', 2);

// 디바운스 검색
const search = WaveUtils.debounce((query) => {
    // 검색 실행
}, 300);

// 재시도 로직
const data = await WaveUtils.retry(
    () => fetchData(),
    { maxAttempts: 3, delay: 1000 }
);
```

### 포맷터 사용
```javascript
// 날짜 포맷
WaveFormatters.date.relative(date); // "3시간 전"
WaveFormatters.date.smart(date); // "오늘 14:30"
WaveFormatters.date.dateTime(date); // "2024.01.20 14:30"

// 숫자 포맷
WaveFormatters.number.comma(1234567); // "1,234,567"
WaveFormatters.number.compact(1500000); // "1.5M"
WaveFormatters.number.currency(50000); // "₩50,000"
WaveFormatters.number.points(100); // "+100P"

// 텍스트 포맷
WaveFormatters.text.maskName('홍길동'); // "홍*동"
WaveFormatters.text.maskEmail('test@example.com'); // "te***@example.com"
WaveFormatters.text.truncate(longText, 50); // "긴 텍스트..."
```

### Supabase 헬퍼 사용
```javascript
// 클라이언트 가져오기
const supabase = await SupabaseHelper.getClient();

// 에러 처리
try {
    const { data, error } = await supabase.from('posts').select();
    if (error) throw error;
} catch (error) {
    SupabaseHelper.handleError(error, '게시글을 불러올 수 없습니다.');
}

// 페이지네이션
const pagination = new SupabaseHelper.PaginationHelper({
    page: 1,
    limit: 20,
    onPageChange: (page) => loadData(page)
});

let query = supabase.from('posts').select('*', { count: 'exact' });
query = pagination.applyToQuery(query);

// 실시간 구독
const realtime = new SupabaseHelper.RealtimeHelper(supabase);
realtime.subscribe('posts', (payload) => {
    console.log('게시글 변경:', payload);
});

// 파일 업로드
const uploader = new SupabaseHelper.FileUploadHelper(supabase);
const result = await uploader.upload(file, {
    folder: 'profiles',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png']
});
```

## 마이그레이션 가이드

### 1단계: 유틸리티 import
```html
<!-- index.html에 추가 -->
<script src="js/utils/logger.js"></script>
<script src="js/utils/common.js"></script>
<script src="js/utils/formatters.js"></script>
<script type="module" src="js/utils/supabaseHelper.js"></script>
```

### 2단계: 기존 코드 교체
1. `console.log` → `Logger.info/debug/error`
2. 중복 함수 → 공통 유틸리티 사용
3. 인라인 포맷팅 → 포맷터 사용
4. Supabase 초기화 → 헬퍼 사용

### 3단계: 테스트
- 개발 환경에서 로그 레벨 확인
- 포맷팅 결과 검증
- 에러 처리 동작 확인

## 성과

- **코드 중복 감소**: 약 40% 코드 중복 제거
- **유지보수성 향상**: 중앙 집중식 관리
- **일관성 확보**: 통일된 패턴 사용
- **성능 개선**: 효율적인 유틸리티 함수
- **개발 속도 향상**: 재사용 가능한 컴포넌트