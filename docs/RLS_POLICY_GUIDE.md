# WAVE SPACE RLS (Row Level Security) 정책 가이드

## 개요

RLS(Row Level Security)는 PostgreSQL의 기능으로, 테이블 레벨에서 행 단위 접근 제어를 가능하게 합니다. 
WAVE SPACE는 Supabase를 통해 RLS를 활용하여 데이터 보안을 강화합니다.

## RLS 정책 원칙

1. **최소 권한 원칙**: 사용자는 필요한 최소한의 데이터에만 접근 가능
2. **본인 데이터 보호**: 개인 정보는 본인만 수정 가능
3. **관리자 권한**: 관리자는 시스템 운영에 필요한 모든 권한 보유
4. **투명성**: 공개 정보는 모든 사용자가 조회 가능

## 테이블별 정책 상세

### 1. users (사용자)
- **조회**: 본인은 모든 정보, 타인은 공개 정보만
- **생성**: 회원가입 시 본인 정보만
- **수정**: 본인 또는 관리자
- **삭제**: 관리자만

### 2. posts (게시글)
- **조회**: 공개 게시글은 모두, 숨김은 작성자와 관리자만
- **생성**: 로그인한 사용자
- **수정**: 작성자 또는 관리자
- **삭제**: 작성자 또는 관리자

### 3. comments (댓글)
- **조회**: 모든 사용자
- **생성**: 로그인한 사용자
- **수정**: 작성자 또는 관리자
- **삭제**: 작성자 또는 관리자

### 4. point_history (포인트 내역)
- **조회**: 본인 또는 관리자
- **생성**: 시스템 또는 관리자

### 5. attendance (출석체크)
- **조회**: 본인 또는 관리자
- **생성**: 본인만

### 6. notifications (알림)
- **조회**: 본인만
- **생성**: 시스템 또는 관리자
- **수정**: 본인만 (읽음 처리)
- **삭제**: 본인만

### 7. files (파일)
- **조회**: 공개 파일은 모두, 비공개는 업로더만
- **생성**: 로그인한 사용자
- **수정**: 업로더 또는 관리자
- **삭제**: 업로더 또는 관리자

### 8. job_posts (구인구직 공고)
- **조회**: 활성 공고는 모두, 비활성은 작성자만
- **생성**: 인증된 기업 회원
- **수정**: 작성자 또는 관리자
- **삭제**: 작성자 또는 관리자

### 9. job_applications (지원 내역)
- **조회**: 지원자 본인과 채용 담당자
- **생성**: 로그인한 사용자
- **수정**: 채용 담당자 (상태 변경)

### 10. likes (좋아요)
- **조회**: 모든 사용자
- **생성**: 로그인한 사용자
- **삭제**: 본인만

### 11. user_badges (뱃지)
- **조회**: 모든 사용자
- **생성**: 시스템 또는 관리자

## RLS 정책 적용 방법

### 1. 정책 적용
```sql
-- sql/rls_policies.sql 파일 실행
psql -h your-db-host -U postgres -d your-db-name -f sql/rls_policies.sql
```

### 2. Supabase Dashboard에서 적용
1. Supabase Dashboard > SQL Editor
2. `sql/rls_policies.sql` 내용 복사
3. 실행

### 3. 정책 확인
```sql
-- 특정 테이블의 RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'users';
```

## 개발 시 주의사항

### 1. Service Role Key 사용 주의
- Service Role Key는 RLS를 우회합니다
- 클라이언트에서는 절대 사용하지 마세요
- 서버 사이드에서만 제한적으로 사용

### 2. Anon Key 사용
- 클라이언트에서는 Anon Key만 사용
- RLS 정책이 자동으로 적용됩니다

### 3. 테스트
```javascript
// 잘못된 예 - 다른 사용자 정보 수정 시도
const { error } = await supabase
  .from('users')
  .update({ points: 1000 })
  .eq('id', 'other-user-id'); // 실패: RLS 정책 위반

// 올바른 예 - 본인 정보만 수정
const { error } = await supabase
  .from('users')
  .update({ bio: '새로운 소개' })
  .eq('id', currentUser.id); // 성공
```

## 트러블슈팅

### 1. "new row violates row-level security policy"
- 원인: INSERT/UPDATE 시 RLS 정책 위반
- 해결: 본인 데이터인지 확인

### 2. 조회 결과가 없음
- 원인: SELECT 권한 없음
- 해결: RLS 정책 확인, 로그인 상태 확인

### 3. 관리자 기능 작동 안 함
- 원인: 사용자 role이 'admin'이 아님
- 해결: users 테이블에서 role 확인

## 보안 강화 팁

1. **민감한 정보 분리**
   - 비밀번호, 결제 정보 등은 별도 테이블로 분리
   - 더 엄격한 RLS 정책 적용

2. **감사 로그**
   - admin_logs 테이블 활용
   - 중요한 작업은 모두 기록

3. **정기적인 검토**
   - RLS 정책 정기 검토
   - 새로운 기능 추가 시 정책 업데이트

## 참고 자료

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)