# 회원가입 시 Supabase 테이블 업데이트 문제 해결 가이드

## 문제 상황
회원가입은 성공하지만 Supabase의 users 테이블에 프로필 정보가 생성되지 않는 문제

## 원인
`authService.js`에서 호출하는 `create_signup_profile` RPC 함수가 데이터베이스에 정의되어 있지 않음

## 해결 방법

### 1. Supabase 대시보드 접속
- https://app.supabase.com 접속
- 프로젝트 선택 (sishloxzcqapontycuyz)

### 2. SQL Editor에서 다음 파일 실행
- **SQL Editor** 메뉴 클릭
- 아래 파일의 내용을 복사하여 붙여넣고 **RUN** 클릭

```
sql/create_signup_profile.sql
```

### 3. 실행 확인
SQL 실행 후 다음을 확인:
- `create_signup_profile` 함수가 생성됨
- `user_badges` 테이블에 `auth_user_id` 컬럼이 추가됨
- 필요한 권한이 설정됨

### 4. 테스트
1. `test-signup-debug.html` 파일을 브라우저에서 열기
2. 테스트 정보로 회원가입 시도
3. Supabase 대시보드에서 다음 확인:
   - **Authentication > Users**: auth.users 테이블에 사용자 생성
   - **Table Editor > users**: public.users 테이블에 프로필 생성
   - **Table Editor > point_history**: 가입 보너스 1000P 기록
   - **Table Editor > user_badges**: Free 뱃지 지급 (있는 경우)

### 5. 기존 사용자 동기화 (선택사항)
이미 auth.users에는 있지만 public.users에 프로필이 없는 경우:

```sql
SELECT sync_existing_auth_users();
```

## 추가 정보

### 함수 기능
- `create_signup_profile`: 회원가입 시 프로필 생성
- `sync_existing_auth_users`: 기존 auth 사용자 동기화

### 자동 처리 내용
- 신규 가입 보너스 1000P 지급
- Free 뱃지 자동 지급 (뱃지가 존재하는 경우)
- 포인트 내역 자동 기록

### 주의사항
- SMTP 설정이 없는 경우 개발용 이메일 형식 사용 중
- 프로덕션 환경에서는 반드시 SMTP 설정 필요 (docs/SUPABASE_SETUP.md 참조)