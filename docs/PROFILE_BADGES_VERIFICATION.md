# 프로필/뱃지 시스템 검증 절차

## 1. 데이터베이스 검증

### 1.1 로그인 후 user_profiles 레코드 확인
```sql
-- Supabase SQL Editor에서 실행
select * from public.user_profiles 
where id = auth.uid();
```

### 1.2 user_badges 조회 테스트 (2단 쿼리)
```sql
-- 프로필 조회
select * from public.user_profiles where id = auth.uid();

-- 뱃지 조회
select ub.*, b.* 
from public.user_badges ub
join public.badges b on ub.badge_id = b.id
where ub.user_id = auth.uid();
```

### 1.3 중첩 조회 테스트 (FK 설정 후)
```sql
-- user_profiles 기반 중첩 조회
select 
  up.*,
  ub.badge_id,
  ub.earned_at,
  b.name as badge_name,
  b.badge_type,
  b.color as badge_color
from public.user_profiles up
left join public.user_badges ub on up.id = ub.user_id
left join public.badges b on ub.badge_id = b.id
where up.id = auth.uid();
```

### 1.4 Storage 버킷 확인
```sql
-- Storage 버킷 목록 확인
select * from storage.buckets where id = 'files';
```

## 2. 브라우저 콘솔 체크리스트

### 2.1 성공 로그 확인
- [ ] "✅ Supabase 연결 성공" 표시
- [ ] "✅ AuthService 초기화 완료" 표시
- [ ] "📁 FileService 초기화 완료" 표시 (Storage 경고 없음)

### 2.2 에러 미발생 확인
- [ ] 400 Bad Request 없음
- [ ] "프로필 생성 결과 확인 불가" 루프 없음
- [ ] REST API 호출 에러 없음
- [ ] preload 경고 없음

### 2.3 로딩 시간 확인
- [ ] "Page load time: XXXms" (양수 값)

## 3. 기능 테스트

### 3.1 신규 회원가입 테스트
1. 새 이메일로 회원가입
2. user_profiles 테이블에 자동 생성 확인
3. 로그인 후 프로필 정상 로드 확인

### 3.2 기존 회원 로그인 테스트
1. 기존 계정으로 로그인
2. 콘솔에 에러 없음 확인
3. 프로필/뱃지 정보 정상 표시

### 3.3 파일 업로드 테스트 (선택)
1. 파일 업로드 기능 사용
2. Storage 'files' 버킷에 저장 확인
3. 에러 없이 완료 확인

## 4. Supabase 마이그레이션 실행 방법

1. Supabase Dashboard에 로그인
2. SQL Editor 페이지로 이동
3. `/supabase/migrations/2025-08-31_fix_profiles_badges.sql` 내용 복사
4. SQL Editor에 붙여넣기
5. "Run" 버튼 클릭하여 실행

### 예상 결과:
- `user_profiles` 테이블 생성
- `badges` 및 `user_badges` 테이블 생성
- auth.users 트리거 설정
- RLS 정책 적용
- Storage 'files' 버킷 생성
- 테스트용 '첫출석' 배지 생성

## 5. 트러블슈팅

### 5.1 "프로필이 이미 존재합니다" 루프
- 이제 PROFILE_EXISTS를 성공으로 처리하므로 해결됨
- 여전히 발생하면 브라우저 캐시 삭제 후 재시도

### 5.2 400 Bad Request 에러
- user_profiles 테이블 사용으로 해결됨
- FK 관계가 올바르게 설정되었는지 확인

### 5.3 Storage 경고
- SQL 마이그레이션 실행 후 'files' 버킷 생성 확인
- Supabase Dashboard > Storage에서 버킷 목록 확인

### 5.4 로딩 시간 음수 값
- performance.now() 사용으로 해결됨
- 브라우저 개발자 도구 > Performance 탭에서 확인 가능