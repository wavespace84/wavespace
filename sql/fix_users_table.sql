-- WAVE SPACE - users 테이블 스키마 수정
-- 실제 DB 구조와 코드 간의 불일치 해결

-- 1. 누락된 컬럼들 추가
-- nickname 컬럼 추가 (있으면 건너뛰기)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'nickname'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN nickname VARCHAR(50) UNIQUE;
        COMMENT ON COLUMN public.users.nickname IS '사용자 닉네임';
        RAISE NOTICE '✅ nickname 컬럼 추가됨';
    ELSE
        RAISE NOTICE '⚠️ nickname 컬럼이 이미 존재함';
    END IF;
END
$$;

-- is_verified 컬럼 추가 (있으면 건너뛰기)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
        COMMENT ON COLUMN public.users.is_verified IS '계정 인증 여부';
        RAISE NOTICE '✅ is_verified 컬럼 추가됨';
    ELSE
        RAISE NOTICE '⚠️ is_verified 컬럼이 이미 존재함';
    END IF;
END
$$;

-- last_login 컬럼 추가 (있으면 건너뛰기)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'last_login'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
        COMMENT ON COLUMN public.users.last_login IS '마지막 로그인 시간';
        RAISE NOTICE '✅ last_login 컬럼 추가됨';
    ELSE
        RAISE NOTICE '⚠️ last_login 컬럼이 이미 존재함';
    END IF;
END
$$;

-- 2. 기존 데이터 정리 (auth_user_id가 null인 경우)
UPDATE public.users 
SET auth_user_id = id 
WHERE auth_user_id IS NULL;

-- 3. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- 4. RLS (Row Level Security) 정책 확인 및 수정
-- 기존 정책 삭제
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;  
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- 새로운 RLS 정책 생성 (auth_user_id 기준)
CREATE POLICY "users_select_policy" ON users FOR SELECT
USING (
    -- 본인은 모든 정보 조회 가능
    auth.uid() = auth_user_id 
    OR 
    -- 다른 사용자는 공개 정보만 조회 가능
    (auth.uid() IS NOT NULL AND auth.uid() != auth_user_id)
);

CREATE POLICY "users_insert_policy" ON users FOR INSERT
WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "users_update_policy" ON users FOR UPDATE
USING (
    auth.uid() = auth_user_id 
    OR 
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "users_delete_policy" ON users FOR DELETE
USING (EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin'));

-- 5. 데이터 검증
DO $$
DECLARE
    total_users INTEGER;
    null_auth_users INTEGER;
    duplicate_auth_users INTEGER;
BEGIN
    -- 전체 사용자 수
    SELECT COUNT(*) INTO total_users FROM public.users;
    
    -- auth_user_id가 null인 사용자 수
    SELECT COUNT(*) INTO null_auth_users FROM public.users WHERE auth_user_id IS NULL;
    
    -- 중복된 auth_user_id 수
    SELECT COUNT(*) INTO duplicate_auth_users 
    FROM (
        SELECT auth_user_id, COUNT(*) 
        FROM public.users 
        WHERE auth_user_id IS NOT NULL
        GROUP BY auth_user_id 
        HAVING COUNT(*) > 1
    ) duplicates;
    
    RAISE NOTICE '=== 데이터 검증 결과 ===';
    RAISE NOTICE '전체 사용자 수: %', total_users;
    RAISE NOTICE 'auth_user_id가 null인 사용자: %', null_auth_users;
    RAISE NOTICE '중복된 auth_user_id: %', duplicate_auth_users;
    RAISE NOTICE '======================';
    
    IF null_auth_users > 0 THEN
        RAISE WARNING '⚠️ auth_user_id가 null인 사용자가 %명 있습니다.', null_auth_users;
    END IF;
    
    IF duplicate_auth_users > 0 THEN
        RAISE WARNING '⚠️ 중복된 auth_user_id가 %개 있습니다.', duplicate_auth_users;
    END IF;
END
$$;

-- 6. user_badges 테이블도 확인 및 수정 (필요한 경우)
DO $$
BEGIN
    -- user_badges 테이블에 auth_user_id 컬럼이 없으면 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_badges' 
        AND column_name = 'auth_user_id'
    ) THEN
        -- user_badges 테이블이 존재하는 경우에만
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'user_badges'
        ) THEN
            ALTER TABLE public.user_badges 
            ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            
            -- 기존 데이터 마이그레이션
            UPDATE public.user_badges ub
            SET auth_user_id = u.auth_user_id
            FROM public.users u
            WHERE ub.user_id = u.id AND ub.auth_user_id IS NULL;
            
            -- 인덱스 추가
            CREATE INDEX IF NOT EXISTS idx_user_badges_auth_user_id ON public.user_badges(auth_user_id);
            
            RAISE NOTICE '✅ user_badges 테이블에 auth_user_id 컬럼 추가됨';
        END IF;
    END IF;
END
$$;

RAISE NOTICE '🎉 users 테이블 스키마 수정 완료!';