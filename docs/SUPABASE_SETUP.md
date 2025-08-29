# SUPABASE 데이터베이스 설정 가이드

WAVE SPACE 프로젝트의 Supabase 데이터베이스 설정 방법입니다.

## 🚨 중요: 현재 상태

**현재 문제**: Supabase 데이터베이스에 테이블들이 생성되지 않아 모든 페이지에서 404 에러 발생
- `users` 테이블 없음 → 로그인/회원가입 실패
- `posts` 테이블 없음 → 게시판 기능 실패  
- `point_history` 테이블 없음 → 포인트 시스템 실패
- 기타 모든 기능 테이블 미생성

## ⚠️ SMTP 설정 필수 (2024-2025 변경사항)

**Supabase 정책 변경**: 2024년부터 이메일 인증을 비활성화해도 SMTP 서버 설정이 필수입니다.
SMTP 설정이 없으면 모든 이메일이 "invalid"로 처리되어 회원가입이 실패합니다.

### SMTP 설정 방법

#### 방법 1: Resend 사용 (무료, 권장)
1. **Resend 계정 생성**
   - https://resend.com 접속
   - 무료 계정 생성 (월 100개 이메일 무료)
   - API 키 발급

2. **Supabase SMTP 설정**
   - Supabase Dashboard → Authentication → Settings → SMTP Settings
   - 다음 정보 입력:
     ```
     Host: smtp.resend.com
     Port: 465
     Username: resend
     Password: [Resend API 키]
     Sender email: noreply@yourdomain.com
     Sender name: WAVE SPACE
     ```

3. **이메일 확인 비활성화** (선택)
   - Authentication → Providers → Email
   - "Confirm email" 옵션 끄기
   - Save 클릭

#### 방법 2: 개발 환경 임시 해결책
현재 `authService.js`에 임시 해결책이 구현되어 있습니다:
- 실제 이메일 대신 `username@users.wavespace.com` 형식 사용
- 개발/테스트 환경에서만 사용 권장
- 프로덕션 환경에서는 반드시 SMTP 설정 필요

## ⚡ 빠른 해결 방법

### 1단계: Supabase 대시보드 접속
1. https://app.supabase.com 접속
2. 로그인 후 프로젝트 선택
3. 프로젝트 URL: `https://sishloxzcqapontycuyz.supabase.co`

### 2단계: SQL 파일들을 순서대로 실행

#### 📁 SQL 파일 실행 순서:

```bash
1. sql/schema.sql        # 테이블 생성 (필수)
2. sql/functions.sql     # 데이터베이스 함수
3. sql/initial_data.sql  # 초기 데이터
4. sql/admin_initial_data.sql  # 관리자 데이터
```

#### 🔧 실행 방법:
1. Supabase 대시보드에서 **SQL Editor** 메뉴 선택
2. 각 파일 내용을 복사하여 붙여넣기
3. **RUN** 버튼 클릭하여 실행

### 3단계: 필수 테이블 확인

실행 후 다음 테이블들이 생성되어야 합니다:

#### 👤 사용자 관련:
- `users` - 사용자 정보
- `user_badges` - 사용자 뱃지
- `attendance` - 출석체크
- `point_history` - 포인트 내역

#### 📝 콘텐츠 관련:
- `posts` - 게시글 
- `comments` - 댓글
- `post_categories` - 게시판 카테고리
- `likes` - 좋아요/추천

#### 📁 파일 관련:
- `files` - 파일 저장
- `file_downloads` - 다운로드 내역

#### 🏢 구인구직 관련:
- `job_posts` - 구인공고
- `job_applications` - 지원 내역

#### ⚙️ 시스템:
- `badges` - 뱃지 정의
- `notifications` - 알림
- `reports` - 신고

## 🔐 보안 설정 (RLS)

### Row Level Security 정책 설정

각 테이블에 대해 RLS 정책을 설정해야 합니다:

```sql
-- 예시: users 테이블
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 필수 RLS 정책:
1. **users**: 본인 정보만 조회/수정
2. **posts**: 모든 사용자 조회, 작성자만 수정/삭제
3. **comments**: 모든 사용자 조회, 작성자만 수정/삭제
4. **point_history**: 본인 내역만 조회
5. **attendance**: 본인 출석만 조회/생성

## 📦 Storage 설정

### 파일 업로드용 버킷 생성:

1. **Storage** 메뉴에서 **New bucket** 클릭
2. 버킷 이름: `wave-files`
3. **Public bucket**: 체크 해제 (인증된 사용자만)
4. **File size limit**: 50MB
5. **Allowed MIME types**: PDF, 이미지, Office 문서

### Storage 정책 설정:
```sql
-- 인증된 사용자만 파일 업로드/다운로드
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view files" ON storage.objects
  FOR SELECT USING (auth.role() = 'authenticated');
```

## 🧪 설정 완료 확인

### 테스트 방법:
1. 브라우저 콘솔에서 404 에러 없어짐 확인
2. 회원가입 테스트 → users 테이블에 데이터 생성 확인
3. 로그인 테스트 → 인증 상태 정상 확인
4. 각 페이지별 기능 테스트

### 확인 SQL:
```sql
-- 테이블 존재 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 사용자 수 확인
SELECT COUNT(*) FROM users;

-- 뱃지 데이터 확인
SELECT * FROM badges LIMIT 5;
```

## 💡 문제 해결 팁

### 자주 발생하는 문제:

1. **RLS 정책 오류**: 
   - `new row violates row-level security policy`
   - → RLS 정책을 올바르게 설정했는지 확인

2. **Permission 오류**:
   - → 테이블 권한 설정 확인
   - → anon/authenticated 역할 권한 확인

3. **Foreign Key 오류**:
   - → 참조 테이블이 먼저 생성되었는지 확인
   - → schema.sql 순서대로 실행

## 🚀 설정 완료 후 기대 효과

설정 완료 후:
- ✅ 모든 404 에러 사라짐
- ✅ 회원가입/로그인 정상 작동
- ✅ 게시판, 댓글, 포인트 시스템 작동
- ✅ 파일 업로드/다운로드 작동
- ✅ 출석체크, 뱃지 시스템 작동

---

**다음 단계**: Supabase 대시보드에서 위 SQL 파일들을 순서대로 실행하세요!