-- WAVE SPACE 데이터베이스 함수들
-- Supabase PostgreSQL용 함수 생성

-- 1. 사용자 포인트 증가 함수
CREATE OR REPLACE FUNCTION increment_user_points(user_uuid UUID, points_delta INTEGER)
RETURNS INTEGER AS $$
DECLARE
    current_points INTEGER;
BEGIN
    UPDATE users 
    SET points = points + points_delta,
        updated_at = NOW()
    WHERE id = user_uuid
    RETURNING points INTO current_points;
    
    RETURN current_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 사용자 포인트 감소 함수
CREATE OR REPLACE FUNCTION decrement_user_points(user_uuid UUID, points_delta INTEGER)
RETURNS INTEGER AS $$
DECLARE
    current_points INTEGER;
BEGIN
    UPDATE users 
    SET points = GREATEST(0, points - points_delta),
        updated_at = NOW()
    WHERE id = user_uuid
    RETURNING points INTO current_points;
    
    RETURN current_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 게시글 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_view_count(post_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE posts 
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = post_uuid
    RETURNING view_count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 게시글 댓글 수 증가 함수
CREATE OR REPLACE FUNCTION increment_comment_count(post_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE posts 
    SET comment_count = comment_count + 1,
        updated_at = NOW()
    WHERE id = post_uuid
    RETURNING comment_count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 게시글 좋아요 수 증가 함수
CREATE OR REPLACE FUNCTION increment_post_like_count(post_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE posts 
    SET like_count = like_count + 1,
        updated_at = NOW()
    WHERE id = post_uuid
    RETURNING like_count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 게시글 좋아요 수 감소 함수
CREATE OR REPLACE FUNCTION decrement_post_like_count(post_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE posts 
    SET like_count = GREATEST(0, like_count - 1),
        updated_at = NOW()
    WHERE id = post_uuid
    RETURNING like_count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 댓글 좋아요 수 증가 함수
CREATE OR REPLACE FUNCTION increment_comment_like_count(comment_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE comments 
    SET like_count = like_count + 1,
        updated_at = NOW()
    WHERE id = comment_uuid
    RETURNING like_count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 댓글 좋아요 수 감소 함수
CREATE OR REPLACE FUNCTION decrement_comment_like_count(comment_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE comments 
    SET like_count = GREATEST(0, like_count - 1),
        updated_at = NOW()
    WHERE id = comment_uuid
    RETURNING like_count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 사용자 통계 조회 함수
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_posts', (SELECT COUNT(*) FROM posts WHERE author_id = user_uuid),
        'total_comments', (SELECT COUNT(*) FROM comments WHERE author_id = user_uuid),
        'total_likes_received', (
            SELECT COALESCE(SUM(like_count), 0) 
            FROM posts 
            WHERE author_id = user_uuid
        ) + (
            SELECT COALESCE(SUM(like_count), 0) 
            FROM comments 
            WHERE author_id = user_uuid
        ),
        'total_downloads', (SELECT COUNT(*) FROM file_downloads WHERE user_id = user_uuid),
        'total_uploads', (SELECT COUNT(*) FROM files WHERE uploader_id = user_uuid),
        'attendance_streak', (
            SELECT COALESCE(MAX(consecutive_days), 0)
            FROM attendance 
            WHERE user_id = user_uuid 
            AND check_date >= CURRENT_DATE - INTERVAL '30 days'
        ),
        'badges_count', (SELECT COUNT(*) FROM user_badges WHERE user_id = user_uuid)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 월간 활동 리더 조회 함수
CREATE OR REPLACE FUNCTION get_monthly_leaders(target_month DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
    result JSON;
    month_start DATE;
    month_end DATE;
BEGIN
    month_start := DATE_TRUNC('month', target_month);
    month_end := month_start + INTERVAL '1 month' - INTERVAL '1 day';
    
    SELECT json_build_object(
        'attendance_leader', (
            SELECT json_build_object(
                'user_id', user_id,
                'username', u.username,
                'count', COUNT(*)
            )
            FROM attendance a
            JOIN users u ON u.id = a.user_id
            WHERE a.check_date BETWEEN month_start AND month_end
            GROUP BY user_id, u.username
            ORDER BY COUNT(*) DESC
            LIMIT 1
        ),
        'post_leader', (
            SELECT json_build_object(
                'user_id', author_id,
                'username', u.username,
                'count', COUNT(*)
            )
            FROM posts p
            JOIN users u ON u.id = p.author_id
            WHERE p.created_at BETWEEN month_start AND (month_end + INTERVAL '1 day')
            GROUP BY author_id, u.username
            ORDER BY COUNT(*) DESC
            LIMIT 1
        ),
        'comment_leader', (
            SELECT json_build_object(
                'user_id', author_id,
                'username', u.username,
                'count', COUNT(*)
            )
            FROM comments c
            JOIN users u ON u.id = c.author_id
            WHERE c.created_at BETWEEN month_start AND (month_end + INTERVAL '1 day')
            GROUP BY author_id, u.username
            ORDER BY COUNT(*) DESC
            LIMIT 1
        ),
        'like_leader', (
            SELECT json_build_object(
                'user_id', p.author_id,
                'username', u.username,
                'count', SUM(p.like_count)
            )
            FROM posts p
            JOIN users u ON u.id = p.author_id
            WHERE p.created_at BETWEEN month_start AND (month_end + INTERVAL '1 day')
            GROUP BY p.author_id, u.username
            ORDER BY SUM(p.like_count) DESC
            LIMIT 1
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 뱃지 자동 지급 함수
CREATE OR REPLACE FUNCTION auto_award_badges(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    user_stats JSON;
    awarded_badges TEXT[] := '{}';
    badge_record RECORD;
BEGIN
    -- 사용자 통계 조회
    SELECT get_user_stats(user_uuid) INTO user_stats;
    
    -- 자동 지급 가능한 뱃지들 확인
    FOR badge_record IN 
        SELECT id, name, condition_value 
        FROM badges 
        WHERE condition_type = 'auto'
        AND id NOT IN (
            SELECT badge_id 
            FROM user_badges 
            WHERE user_id = user_uuid
        )
    LOOP
        -- 각 뱃지의 조건 확인 후 지급
        -- TODO: 조건별 로직 구현
        NULL;
    END LOOP;
    
    RETURN json_build_object('awarded_badges', awarded_badges);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 검색 함수 (전체 텍스트 검색)
CREATE OR REPLACE FUNCTION search_content(search_query TEXT, content_type TEXT DEFAULT 'all')
RETURNS TABLE(
    id UUID,
    title TEXT,
    content TEXT,
    type TEXT,
    author_username TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    relevance REAL
) AS $$
BEGIN
    IF content_type = 'posts' OR content_type = 'all' THEN
        RETURN QUERY
        SELECT 
            p.id,
            p.title,
            LEFT(p.content, 200) as content,
            'post'::TEXT as type,
            u.username as author_username,
            p.created_at,
            ts_rank(to_tsvector('korean', p.title || ' ' || p.content), 
                    plainto_tsquery('korean', search_query)) as relevance
        FROM posts p
        JOIN users u ON u.id = p.author_id
        WHERE to_tsvector('korean', p.title || ' ' || p.content) @@ plainto_tsquery('korean', search_query)
        AND p.is_hidden = false;
    END IF;
    
    IF content_type = 'files' OR content_type = 'all' THEN
        RETURN QUERY
        SELECT 
            f.id,
            f.original_name as title,
            COALESCE(f.description, '') as content,
            'file'::TEXT as type,
            u.username as author_username,
            f.created_at,
            ts_rank(to_tsvector('korean', f.original_name || ' ' || COALESCE(f.description, '')), 
                    plainto_tsquery('korean', search_query)) as relevance
        FROM files f
        JOIN users u ON u.id = f.uploader_id
        WHERE to_tsvector('korean', f.original_name || ' ' || COALESCE(f.description, '')) @@ plainto_tsquery('korean', search_query);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. 관리자 전용: 사용자 통계 대시보드
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM users),
        'active_users', (SELECT COUNT(*) FROM users WHERE is_active = true),
        'plus_members', (SELECT COUNT(*) FROM users WHERE is_plus_member = true),
        'banned_users', (SELECT COUNT(*) FROM users WHERE status = 'banned'),
        'total_posts', (SELECT COUNT(*) FROM posts),
        'hidden_posts', (SELECT COUNT(*) FROM posts WHERE is_hidden = true),
        'total_comments', (SELECT COUNT(*) FROM comments),
        'total_files', (SELECT COUNT(*) FROM files),
        'total_points_issued', (SELECT COALESCE(SUM(points), 0) FROM users),
        'monthly_new_users', (
            SELECT COUNT(*) FROM users 
            WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
        ),
        'monthly_new_posts', (
            SELECT COUNT(*) FROM posts 
            WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
        ),
        'top_categories', (
            SELECT json_agg(
                json_build_object(
                    'name', c.name,
                    'count', post_counts.count
                )
            )
            FROM (
                SELECT category_id, COUNT(*) as count
                FROM posts 
                WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY category_id
                ORDER BY COUNT(*) DESC
                LIMIT 5
            ) post_counts
            JOIN post_categories c ON c.id = post_counts.category_id
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. 관리자 전용: 사용자 활동 분석
CREATE OR REPLACE FUNCTION get_user_activity_analysis(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'active_users_by_day', (
            SELECT json_agg(
                json_build_object(
                    'date', date_series.date,
                    'count', COALESCE(activity_counts.count, 0)
                )
            )
            FROM (
                SELECT generate_series(
                    CURRENT_DATE - INTERVAL '1 day' * days_back,
                    CURRENT_DATE,
                    INTERVAL '1 day'
                )::date as date
            ) date_series
            LEFT JOIN (
                SELECT 
                    DATE(last_login) as login_date,
                    COUNT(DISTINCT id) as count
                FROM users 
                WHERE last_login >= CURRENT_DATE - INTERVAL '1 day' * days_back
                GROUP BY DATE(last_login)
            ) activity_counts ON date_series.date = activity_counts.login_date
        ),
        'top_contributors', (
            SELECT json_agg(
                json_build_object(
                    'user_id', u.id,
                    'username', u.username,
                    'posts_count', COALESCE(p.posts_count, 0),
                    'comments_count', COALESCE(c.comments_count, 0),
                    'total_likes', COALESCE(p.total_likes, 0)
                )
            )
            FROM users u
            LEFT JOIN (
                SELECT 
                    author_id,
                    COUNT(*) as posts_count,
                    SUM(like_count) as total_likes
                FROM posts 
                WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
                GROUP BY author_id
            ) p ON u.id = p.author_id
            LEFT JOIN (
                SELECT 
                    author_id,
                    COUNT(*) as comments_count
                FROM comments 
                WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
                GROUP BY author_id
            ) c ON u.id = c.author_id
            WHERE (p.posts_count > 0 OR c.comments_count > 0)
            ORDER BY (COALESCE(p.posts_count, 0) + COALESCE(c.comments_count, 0)) DESC
            LIMIT 10
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. 관리자 전용: 시스템 건전성 체크
CREATE OR REPLACE FUNCTION check_system_health()
RETURNS JSON AS $$
DECLARE
    result JSON;
    spam_threshold INTEGER := 10; -- 하루에 게시글 10개 이상이면 스팸 의심
    inactive_threshold INTEGER := 30; -- 30일 미접속시 비활성
BEGIN
    SELECT json_build_object(
        'health_score', 95, -- TODO: 실제 건전성 점수 계산 로직
        'issues', json_build_array(
            -- 스팸 의심 사용자 검출
            (
                SELECT json_build_object(
                    'type', 'potential_spam',
                    'severity', 'medium',
                    'count', COUNT(*),
                    'description', '하루에 ' || spam_threshold || '개 이상 게시글을 작성한 사용자'
                )
                FROM (
                    SELECT author_id, COUNT(*) as daily_posts
                    FROM posts 
                    WHERE created_at >= CURRENT_DATE
                    GROUP BY author_id
                    HAVING COUNT(*) >= spam_threshold
                ) spam_users
            ),
            -- 비활성 사용자 검출
            (
                SELECT json_build_object(
                    'type', 'inactive_users',
                    'severity', 'low',
                    'count', COUNT(*),
                    'description', inactive_threshold || '일 이상 미접속 사용자'
                )
                FROM users 
                WHERE last_login < CURRENT_DATE - INTERVAL '1 day' * inactive_threshold
                OR last_login IS NULL
            )
        ),
        'recommendations', json_build_array(
            json_build_object(
                'action', 'review_spam_users',
                'description', '스팸 의심 사용자 검토 및 조치'
            ),
            json_build_object(
                'action', 'cleanup_inactive',
                'description', '장기 미접속 사용자 정리 검토'
            )
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 권한 부여
GRANT EXECUTE ON FUNCTION increment_user_points TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_user_points TO authenticated;
GRANT EXECUTE ON FUNCTION increment_view_count TO authenticated;
GRANT EXECUTE ON FUNCTION increment_comment_count TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_like_count TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_like_count TO authenticated;
GRANT EXECUTE ON FUNCTION increment_comment_like_count TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_comment_like_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_leaders TO authenticated;
GRANT EXECUTE ON FUNCTION auto_award_badges TO authenticated;
GRANT EXECUTE ON FUNCTION search_content TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_activity_analysis TO authenticated;
GRANT EXECUTE ON FUNCTION check_system_health TO authenticated;