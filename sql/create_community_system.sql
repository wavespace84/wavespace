-- WAVE SPACE 커뮤니티 시스템 테이블
-- 게시판, 댓글, 좋아요, 신고 시스템 구축
-- 작성일: 2025-01-XX

-- ============================================
-- 1. 게시판 카테고리 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS post_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#0066FF',
    sort_order INTEGER DEFAULT 0,
    
    -- 포인트 정책
    post_points INTEGER DEFAULT 20,
    comment_points INTEGER DEFAULT 5,
    
    -- 설정
    is_active BOOLEAN DEFAULT TRUE,
    requires_auth BOOLEAN DEFAULT TRUE,
    allow_anonymous BOOLEAN DEFAULT FALSE,
    
    -- 관리 설정
    auto_approve BOOLEAN DEFAULT TRUE,
    max_posts_per_day INTEGER DEFAULT 10,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_post_categories_slug ON post_categories(slug);
CREATE INDEX IF NOT EXISTS idx_post_categories_is_active ON post_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_post_categories_sort_order ON post_categories(sort_order);

-- RLS 정책
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자가 활성 카테고리 조회 가능" ON post_categories 
    FOR SELECT USING (is_active = true);

CREATE POLICY "관리자만 카테고리 관리 가능" ON post_categories 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- ============================================
-- 2. 게시글 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL CHECK (length(trim(title)) >= 2),
    content TEXT NOT NULL CHECK (length(trim(content)) >= 5),
    
    -- 분류
    category_id INTEGER NOT NULL REFERENCES post_categories(id),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 상태
    status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'deleted')),
    
    -- 통계
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
    like_count INTEGER DEFAULT 0 CHECK (like_count >= 0),
    comment_count INTEGER DEFAULT 0 CHECK (comment_count >= 0),
    
    -- 특별 표시
    is_pinned BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    
    -- SEO 및 검색
    tags TEXT[] DEFAULT '{}',
    meta_description TEXT,
    search_vector tsvector,
    
    -- 포인트 연동
    points_awarded INTEGER DEFAULT 0,
    
    -- 이미지
    featured_image_url TEXT,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 임시 저장 관련
    is_draft BOOLEAN GENERATED ALWAYS AS (status = 'draft') STORED,
    
    -- 전문검색 인덱스 자동 업데이트
    search_vector_generated tsvector GENERATED ALWAYS AS (
        to_tsvector('korean', COALESCE(title, '') || ' ' || COALESCE(content, ''))
    ) STORED
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_like_count ON posts(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON posts(is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING gin(search_vector_generated);

-- 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_category_status_date ON posts(category_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_status ON posts(author_id, status);

-- RLS 정책
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 게시글 조회 정책
CREATE POLICY "published 게시글은 모든 사용자가 조회 가능" ON posts 
    FOR SELECT USING (
        status = 'published' OR 
        (auth.uid() = author_id) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- 게시글 작성 정책
CREATE POLICY "인증된 사용자만 게시글 작성 가능" ON posts 
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.uid() = author_id AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_verified = true)
    );

-- 게시글 수정 정책
CREATE POLICY "작성자와 관리자만 게시글 수정 가능" ON posts 
    FOR UPDATE USING (
        auth.uid() = author_id OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- 게시글 삭제 정책
CREATE POLICY "작성자와 관리자만 게시글 삭제 가능" ON posts 
    FOR DELETE USING (
        auth.uid() = author_id OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- ============================================
-- 3. 댓글 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- 대댓글용
    
    content TEXT NOT NULL CHECK (length(trim(content)) >= 1 AND length(trim(content)) <= 1000),
    
    -- 상태
    status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'deleted')),
    is_approved BOOLEAN DEFAULT TRUE,
    
    -- 통계
    like_count INTEGER DEFAULT 0 CHECK (like_count >= 0),
    reply_count INTEGER DEFAULT 0 CHECK (reply_count >= 0),
    
    -- 깊이 제한 (대댓글 깊이)
    depth INTEGER DEFAULT 0 CHECK (depth >= 0 AND depth <= 3),
    
    -- 포인트 연동
    points_awarded INTEGER DEFAULT 0,
    
    -- 편집 기록
    is_edited BOOLEAN DEFAULT FALSE,
    edit_count INTEGER DEFAULT 0,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 순서 정렬용
    thread_order INTEGER DEFAULT 0,
    
    -- 멘션 기능
    mentions UUID[] DEFAULT '{}', -- 멘션된 사용자 ID 배열
    
    -- IP 추적 (관리 목적)
    ip_address INET,
    
    CONSTRAINT chk_no_self_parent CHECK (id != parent_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_like_count ON comments(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_comments_mentions ON comments USING gin(mentions);

-- 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_post_status_date ON comments(post_id, status, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_post_parent ON comments(post_id, parent_id);

-- RLS 정책
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 댓글 조회 정책
CREATE POLICY "published 댓글은 모든 사용자가 조회 가능" ON comments 
    FOR SELECT USING (
        status = 'published' OR 
        (auth.uid() = author_id) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- 댓글 작성 정책
CREATE POLICY "인증된 사용자만 댓글 작성 가능" ON comments 
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.uid() = author_id AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_verified = true)
    );

-- 댓글 수정 정책
CREATE POLICY "작성자와 관리자만 댓글 수정 가능" ON comments 
    FOR UPDATE USING (
        auth.uid() = author_id OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- 댓글 삭제 정책
CREATE POLICY "작성자와 관리자만 댓글 삭제 가능" ON comments 
    FOR DELETE USING (
        auth.uid() = author_id OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- ============================================
-- 4. 좋아요 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id UUID NOT NULL,
    
    -- 좋아요 종류 확장 (추후 다양한 이모지 반응 지원)
    reaction_type VARCHAR(20) DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'laugh', 'angry', 'sad')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 중복 방지
    UNIQUE(user_id, target_type, target_id, reaction_type)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at DESC);

-- 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_likes_target_reaction ON likes(target_type, target_id, reaction_type);

-- RLS 정책
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 좋아요 조회 정책
CREATE POLICY "모든 사용자가 좋아요 조회 가능" ON likes FOR SELECT USING (true);

-- 좋아요 생성 정책
CREATE POLICY "인증된 사용자만 좋아요 가능" ON likes 
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND auth.uid() = user_id
    );

-- 좋아요 삭제 정책
CREATE POLICY "사용자는 자신의 좋아요만 삭제 가능" ON likes 
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. 신고 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),
    target_id UUID NOT NULL,
    
    -- 신고 사유
    reason VARCHAR(50) NOT NULL CHECK (reason IN (
        'spam', 'abuse', 'inappropriate', 'copyright', 'misinformation', 
        'harassment', 'violence', 'hate_speech', 'adult_content', 'other'
    )),
    description TEXT CHECK (length(trim(description)) <= 500),
    
    -- 처리 상태
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    
    -- 관리자 처리
    reviewed_by UUID REFERENCES users(id),
    admin_notes TEXT,
    resolution VARCHAR(20) CHECK (resolution IN ('no_action', 'warning', 'content_removed', 'user_suspended', 'user_banned')),
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- IP 추적
    reporter_ip INET,
    
    -- 동일한 대상에 대한 중복 신고 방지
    UNIQUE(reporter_id, target_type, target_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reason ON reports(reason);

-- RLS 정책
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 신고 조회 정책
CREATE POLICY "신고자와 관리자만 신고 내역 조회 가능" ON reports 
    FOR SELECT USING (
        auth.uid() = reporter_id OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- 신고 생성 정책
CREATE POLICY "인증된 사용자만 신고 가능" ON reports 
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND auth.uid() = reporter_id
    );

-- 신고 수정 정책 (관리자만)
CREATE POLICY "관리자만 신고 처리 가능" ON reports 
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- ============================================
-- 6. 트리거 및 함수 생성
-- ============================================

-- 게시글/댓글 좋아요 수 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 좋아요 추가
        IF NEW.target_type = 'post' THEN
            UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.target_id;
        ELSIF NEW.target_type = 'comment' THEN
            UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.target_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 좋아요 제거
        IF OLD.target_type = 'post' THEN
            UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.target_id;
        ELSIF OLD.target_type = 'comment' THEN
            UPDATE comments SET like_count = like_count - 1 WHERE id = OLD.target_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_like_counts
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_like_counts();

-- 댓글 수 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 댓글 추가
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        
        -- 대댓글인 경우 부모 댓글의 reply_count 증가
        IF NEW.parent_id IS NOT NULL THEN
            UPDATE comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 댓글 제거
        UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
        
        -- 대댓글인 경우 부모 댓글의 reply_count 감소
        IF OLD.parent_id IS NOT NULL THEN
            UPDATE comments SET reply_count = reply_count - 1 WHERE id = OLD.parent_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_counts
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_counts();

-- 댓글 깊이 자동 계산 함수
CREATE OR REPLACE FUNCTION calculate_comment_depth()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        -- 부모 댓글의 깊이 + 1
        SELECT depth + 1 INTO NEW.depth
        FROM comments 
        WHERE id = NEW.parent_id;
        
        -- 최대 깊이 제한
        IF NEW.depth > 3 THEN
            RAISE EXCEPTION '댓글 깊이는 최대 3단계까지 가능합니다.';
        END IF;
    ELSE
        NEW.depth := 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_comment_depth
    BEFORE INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION calculate_comment_depth();

-- 업데이트 시간 자동 갱신 트리거들
CREATE TRIGGER update_post_categories_updated_at 
    BEFORE UPDATE ON post_categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 신고 처리 시 reviewed_at 자동 설정
CREATE OR REPLACE FUNCTION set_report_reviewed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status AND NEW.status IN ('resolved', 'dismissed') THEN
        NEW.reviewed_at = NOW();
        NEW.reviewed_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_report_reviewed_at
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION set_report_reviewed_at();

-- ============================================
-- 7. 초기 카테고리 데이터
-- ============================================

INSERT INTO post_categories (name, slug, description, icon, color, sort_order, post_points, comment_points) VALUES
('자유게시판', 'forum', '자유로운 주제로 대화를 나누는 공간입니다.', 'fas fa-comments', '#0066FF', 1, 20, 5),
('유머재미', 'humor', '재미있는 이야기와 유머를 공유하는 공간입니다.', 'fas fa-laugh', '#FF6B6B', 2, 15, 5),
('질문답변', 'qna', '궁금한 점을 질문하고 답변을 받는 공간입니다.', 'fas fa-question-circle', '#4ECDC4', 3, 25, 10),
('정보공유', 'info', '유용한 정보와 팁을 공유하는 공간입니다.', 'fas fa-info-circle', '#45B7D1', 4, 30, 10),
('건의사항', 'suggestion', '플랫폼 개선 건의와 피드백을 주는 공간입니다.', 'fas fa-lightbulb', '#FFA726', 5, 20, 5)
ON CONFLICT (slug) DO NOTHING;

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ 커뮤니티 시스템이 성공적으로 구축되었습니다.';
    RAISE NOTICE '   - post_categories: 게시판 카테고리 관리';
    RAISE NOTICE '   - posts: 게시글 관리 (전문검색, 태그, 상태관리)';
    RAISE NOTICE '   - comments: 댓글 관리 (대댓글, 깊이제한, 멘션)';
    RAISE NOTICE '   - likes: 좋아요 시스템 (다중 반응 지원)';
    RAISE NOTICE '   - reports: 신고 시스템 (관리자 처리 워크플로우)';
    RAISE NOTICE '   - 자동 트리거: 좋아요/댓글 수 실시간 업데이트';
    RAISE NOTICE '   - 초기 카테고리: 자유게시판, 유머재미, Q&A 등';
END $$;