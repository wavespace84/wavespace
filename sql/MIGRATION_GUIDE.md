# WAVE SPACE RLS 무한 재귀 문제 해결 가이드

## 🚨 문제 개요

### 발생한 에러
```
code: '42P17'
message: 'infinite recursion detected in policy for relation "users"'
```

### 원인
1. **RLS 정책의 순환 참조**: users 테이블의 RLS 정책이 관리자 권한을 체크하기 위해 users 테이블을 다시 조회하면서 무한 재귀 발생
2. **스키마 불일치**: 
   - `schema.sql`: users 테이블의 PK는 `id` (UUID 타입)
   - `authService.js`: `auth_user_id`로 조회 시도
   - 일부 SQL 파일들이 존재하지 않는 `auth_user_id` 컬럼 참조

## 🛠️ 해결 방안

### 1. 관리자 권한 체크 함수 생성
SECURITY DEFINER 함수를 사용하여 RLS를 우회하고 순환 참조를 방지합니다.

```sql
-- get_user_role: 사용자 역할 반환
-- is_admin: 관리자 여부 확인  
-- is_admin_or_moderator: 관리자/모더레이터 여부 확인
```

### 2. RLS 정책 재작성
순환 참조를 제거하고 새로운 권한 체크 함수를 사용합니다.

```sql
-- 기존: EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
-- 변경: is_admin(auth.uid())
```

### 3. 프론트엔드 코드 수정
`authService.js`가 올바른 컬럼을 사용하도록 수정합니다.

```javascript
// 기존: .eq('auth_user_id', authUserId)
// 변경: .eq('id', authUserId)
```

## 📝 적용 절차

### 사전 준비
1. **백업 생성**: Supabase 대시보드에서 데이터베이스 백업
2. **현재 상태 확인**: 
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT * FROM users LIMIT 5;
   ```

### 적용 단계

#### 1단계: Supabase SQL Editor 접속
1. [Supabase Dashboard](https://app.supabase.com) 로그인
2. 프로젝트 선택
3. SQL Editor 탭 클릭

#### 2단계: 마이그레이션 실행
1. `sql/INTEGRATED_MIGRATION.sql` 파일 내용 복사
2. SQL Editor에 붙여넣기
3. "Run" 버튼 클릭
4. 성공 메시지 확인

#### 3단계: 프론트엔드 배포
1. 수정된 `authService.js` 파일이 이미 적용됨
2. 브라우저 캐시 삭제 (Ctrl+F5)

### 테스트 절차

#### 1. 기본 기능 테스트
- [ ] 로그인 성공 확인
- [ ] 프로필 정보 로드 확인
- [ ] 회원가입 프로세스 테스트

#### 2. 권한 테스트
```sql
-- 관리자 권한 확인
SELECT is_admin(auth.uid());

-- 사용자 역할 확인
SELECT get_user_role(auth.uid());
```

#### 3. RLS 정책 테스트
```sql
-- 본인 프로필 조회
SELECT * FROM users WHERE id = auth.uid();

-- 다른 사용자 프로필 조회 (공개 정보만)
SELECT username, nickname, level FROM users WHERE id != auth.uid();
```

## 🔄 롤백 절차

문제 발생 시:

1. **즉시 롤백**:
   ```sql
   -- 새로운 함수 삭제
   DROP FUNCTION IF EXISTS is_admin(UUID);
   DROP FUNCTION IF EXISTS is_admin_or_moderator(UUID);
   DROP FUNCTION IF EXISTS get_user_role(UUID);
   ```

2. **이전 버전으로 복구**:
   - `sql/rls_policies.sql` 파일 실행
   - 주의: 무한 재귀 문제가 다시 발생할 수 있음

3. **프론트엔드 롤백**:
   - Git에서 이전 버전의 `authService.js` 복구

## 📊 모니터링

### 성공 지표
- 콘솔에 "infinite recursion" 에러가 없음
- 로그인/회원가입이 정상 작동
- 프로필 로드 시간 < 500ms

### 주의사항
- RLS 정책 변경은 즉시 적용됨
- 활성 세션이 있는 사용자는 재로그인 필요할 수 있음
- 캐시 문제로 인해 브라우저 새로고침 필요

## 🆘 문제 해결

### 여전히 무한 재귀 에러가 발생하는 경우
1. 모든 RLS 정책이 업데이트되었는지 확인
2. 다른 테이블의 RLS 정책도 확인
3. Supabase 로그 확인

### 로그인이 안 되는 경우
1. users 테이블의 id 컬럼 확인
2. auth.users와의 연결 확인
3. RLS 정책 임시 비활성화 후 테스트

### 성능 저하가 발생하는 경우
1. 인덱스 생성 확인
2. 함수 실행 계획 분석
3. 연결 풀 설정 확인

## 📞 지원

추가 지원이 필요한 경우:
- Supabase Discord 커뮤니티
- GitHub Issues에 문제 보고
- 개발팀에 연락