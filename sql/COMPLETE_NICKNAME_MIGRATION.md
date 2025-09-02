# 닉네임 기능 완전 마이그레이션 가이드

## 현재 데이터베이스 구조 분석

현재 프로젝트의 SQL 파일들을 분석한 결과, 다음과 같은 상황입니다:

1. **schema.sql**: 초기 테이블 구조 (users.id가 PRIMARY KEY)
2. **fix_user_signup_rls.sql**: 테이블 구조 변경 (users.auth_user_id 사용)
3. **create_signup_profile.sql**: auth_user_id 기반 RPC 함수

## 마이그레이션 전 확인사항

먼저 현재 데이터베이스의 users 테이블 구조를 확인하세요:

```sql
-- Supabase SQL Editor에서 실행
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
```

## 시나리오별 마이그레이션

### 시나리오 1: 새로운 데이터베이스 (처음 설치)

1. **schema.sql 실행** (이미 nickname 컬럼 포함됨)
2. **fix_user_signup_rls.sql 실행** (테이블 구조 업데이트)
3. **create_signup_profile.sql 또는 update_signup_profile_with_nickname.sql 실행**

### 시나리오 2: 기존 데이터베이스 (nickname 컬럼 없음)

다음 순서로 실행하세요:

#### 1단계: nickname 컬럼 추가
```sql
-- sql/add_nickname_column.sql 내용 실행
ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);
UPDATE users SET nickname = username WHERE nickname IS NULL;
```

#### 2단계: RPC 함수 업데이트
```sql
-- sql/update_signup_profile_with_nickname.sql 내용 실행
-- (기존 create_signup_profile 함수를 nickname 지원 버전으로 교체)
```

#### 3단계: custom_auth.sql 업데이트 (필요시)
현재 custom_auth.sql은 이미 nickname을 지원하도록 수정되었습니다.

## 실행 후 검증

### 1. 테이블 구조 확인
```sql
-- nickname 컬럼이 추가되었는지 확인
SELECT * FROM users LIMIT 1;
```

### 2. RPC 함수 테스트
```sql
-- 함수 파라미터 확인
SELECT proname, proargnames 
FROM pg_proc 
WHERE proname = 'create_signup_profile';
```

### 3. 프론트엔드 테스트
- 새로운 회원가입을 시도해보고 닉네임이 저장되는지 확인
- 로그인 후 헤더에 닉네임이 표시되는지 확인

## 주의사항

1. **auth_user_id vs id**: 
   - 일부 테이블은 `auth_user_id`를 사용하고, 일부는 `id`를 사용합니다
   - 현재 실제 운영 중인 테이블 구조를 확인 후 적절한 마이그레이션을 선택하세요

2. **기존 사용자 닉네임**:
   - 기존 사용자들의 nickname은 username으로 자동 설정됩니다
   - 사용자가 프로필 편집을 통해 변경할 수 있도록 기능 추가를 고려하세요

3. **중복 방지**:
   - nickname은 UNIQUE 제약조건이 있으므로 중복될 수 없습니다
   - 회원가입 시 중복 체크 로직이 이미 구현되어 있습니다

## 롤백 방법 (필요시)

```sql
-- nickname 컬럼 제거
ALTER TABLE users DROP COLUMN IF EXISTS nickname;

-- 인덱스 제거
DROP INDEX IF EXISTS idx_users_nickname;

-- 함수를 원래 버전으로 되돌리기
-- (create_signup_profile.sql의 원본 내용 실행)
```