# 로그인 가이드

## 현재 사용 가능한 계정

### Admin 계정
- **아이디**: admin
- **이메일**: test23@wavespace.internal
- **비밀번호**: (Supabase 대시보드에서 설정한 비밀번호)

## 로그인 문제 해결

### 문제 상황
1. `test1` 사용자가 존재하지 않음
2. Supabase의 SMTP 설정이 되어있지 않아 새 계정 생성이 어려움

### 해결 방법

#### 방법 1: Admin 계정 사용
1. 로그인 페이지에서 아이디: `admin` 입력
2. 비밀번호는 Supabase 대시보드에서 설정한 것 사용

#### 방법 2: Supabase 대시보드에서 직접 사용자 생성
1. Supabase 대시보드 접속
2. Authentication > Users 메뉴
3. "Invite User" 또는 "Create User" 버튼 클릭
4. 다음 정보로 사용자 생성:
   - Email: test1@example.com
   - Password: test1234!
5. 생성된 사용자의 ID를 복사
6. SQL Editor에서 다음 쿼리 실행:
```sql
INSERT INTO public.users (
    auth_user_id,
    username,
    full_name,
    email,
    phone,
    member_type,
    points,
    level,
    role
) VALUES (
    '생성된_사용자_ID',
    'test1',
    '테스트 사용자1',
    'test1@example.com',
    '010-1234-5678',
    '일반',
    1000,
    1,
    'user'
);
```

#### 방법 3: 테스트용 비밀번호 재설정
Supabase 대시보드에서 admin 사용자의 비밀번호를 `admin1234!`로 재설정한 후 사용

## 로그인 프로세스

1. **Username 기반 로그인**:
   - 아이디 입력 → RPC 함수로 이메일 조회 → Auth 로그인

2. **Email 기반 로그인**:
   - 이메일 직접 입력 → Auth 로그인

## 기술적 설명

### RPC 함수 동작
- `get_user_by_username` 함수가 정상 작동 중
- username으로 사용자 정보를 조회하여 실제 이메일을 반환

### 현재 구현 상태
- ✅ RPC 함수 생성 완료
- ✅ 로그인 로직 구현 완료
- ✅ Fallback 메커니즘 구현
- ❌ 새 사용자 생성 (SMTP 설정 필요)

## 추가 설정 필요사항

1. **SMTP 설정** (프로덕션 환경):
   - Supabase 대시보드 > Settings > Auth
   - SMTP 서버 정보 입력

2. **이메일 확인 비활성화** (개발 환경):
   - Supabase 대시보드 > Authentication > Settings
   - "Confirm email" 옵션 비활성화