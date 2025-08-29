-- WAVE SPACE 초기 데이터 삽입
-- 카테고리, 뱃지 등 기본 데이터

-- 게시판 카테고리 초기 데이터
INSERT INTO post_categories (name, slug, description, icon, sort_order) VALUES
('공지사항', 'notice', '중요한 공지사항과 안내사항', 'fas fa-bullhorn', 1),
('자유게시판', 'forum', '자유로운 의견 교환 공간', 'fas fa-comments', 2),
('질문답변', 'qna', '궁금한 점을 묻고 답하는 공간', 'fas fa-question-circle', 3),
('유머재미', 'humor', '재미있는 이야기와 유머', 'fas fa-laugh', 4),
('분양기획', 'planning', '분양기획 관련 정보', 'fas fa-building', 5),
('분양영업', 'sales', '분양영업 관련 정보', 'fas fa-handshake', 6),
('시장조사', 'market', '시장조사 자료 공유', 'fas fa-chart-line', 7),
('교육자료', 'education', '교육 및 학습 자료', 'fas fa-graduation-cap', 8);

-- 뱃지 시스템 초기 데이터 (28개)
INSERT INTO badges (name, description, badge_type, color, condition_type, condition_value) VALUES
-- 활동 기반 뱃지 (5개)
('출첵리더', '이번 달 출석체크 1위', 'normal', '#6B7280', 'auto', '{"type": "monthly_attendance", "rank": 1}'),
('소통리더', '이번 달 댓글 작성 1위', 'normal', '#6B7280', 'auto', '{"type": "monthly_comments", "rank": 1}'),
('답변리더', '이번 달 질문답변 1위', 'normal', '#6B7280', 'auto', '{"type": "monthly_answers", "rank": 1}'),
('정보리더', '이번 달 자료 업로드 1위', 'normal', '#6B7280', 'auto', '{"type": "monthly_uploads", "rank": 1}'),
('추천리더', '이번 달 추천받기 1위', 'normal', '#6B7280', 'auto', '{"type": "monthly_likes", "rank": 1}'),

-- 커뮤니티 공헌 뱃지 (3개)
('해결사', '질문답변 채택률 80% 이상', 'rare', '#0099FF', 'auto', '{"type": "answer_rate", "value": 80}'),
('신고요정', '신고 처리 10회 이상', 'normal', '#6B7280', 'auto', '{"type": "reports", "value": 10}'),
('선한영향력', '모범 활동으로 인정받음', 'premium', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'manual', null),

-- 콘텐츠 중심 뱃지 (4개)
('유머로다스린다', '유머 게시글 추천 100회 이상', 'rare', '#0099FF', 'auto', '{"type": "humor_likes", "value": 100}'),
('재치는나의것', '유머 댓글 추천 50회 이상', 'normal', '#6B7280', 'auto', '{"type": "humor_comment_likes", "value": 50}'),
('정보통', '자료 다운로드 100회 이상', 'normal', '#6B7280', 'auto', '{"type": "downloads", "value": 100}'),
('베스트작가', '베스트 게시글 10회 선정', 'rare', '#0099FF', 'auto', '{"type": "best_posts", "value": 10}'),

-- 성과 기반 뱃지 (4개)
('베테랑', '활동 경력 1년 이상', 'rare', '#0099FF', 'auto', '{"type": "membership_days", "value": 365}'),
('골드회원', '누적 포인트 10만점 이상', 'premium', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 'auto', '{"type": "total_points", "value": 100000}'),
('다이아회원', '누적 포인트 50만점 이상', 'premium', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 'auto', '{"type": "total_points", "value": 500000}'),
('플래티넘', '누적 포인트 100만점 이상', 'premium', 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 'auto', '{"type": "total_points", "value": 1000000}'),

-- 이벤트/챌린지 뱃지 (6개)
('시즌챔피언', '이번 시즌 종합 1위', 'premium', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'manual', null),
('챌린지참여자', '월간 챌린지 참여', 'normal', '#6B7280', 'event', null),
('한정판', '특별 이벤트 기념품', 'premium', 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', 'manual', null),
('얼리어답터', '베타 테스터 참여', 'rare', '#0099FF', 'manual', null),
('런칭기념', '오픈 기념 가입자', 'rare', '#0099FF', 'event', null),
('1주년', '1주년 기념 뱃지', 'premium', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'event', null),

-- VIP 멤버십 뱃지 (3개)
('Free', '무료 회원', 'normal', '#6B7280', 'auto', '{"type": "membership", "level": "free"}'),
('Plus', 'Plus 회원', 'rare', '#0099FF', 'auto', '{"type": "membership", "level": "plus"}'),
('Premium', 'Premium 회원', 'premium', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'auto', '{"type": "membership", "level": "premium"}'),

-- 특수 뱃지 (3개)
('관리자', '사이트 관리자', 'premium', 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', 'manual', null),
('MVP', '이달의 MVP', 'premium', 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)', 'manual', null),
('전설', '전설적인 활동가', 'premium', 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)', 'manual', null);

-- Row Level Security (RLS) 정책 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- 기본 RLS 정책들
-- 사용자는 본인 데이터만 수정 가능
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- 게시글은 모든 인증된 사용자가 조회 가능, 본인만 수정 가능
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = author_id);

-- 댓글도 동일한 정책
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = author_id);

-- 포인트 내역은 본인만 조회 가능
CREATE POLICY "Users can view own points" ON point_history FOR SELECT USING (auth.uid() = user_id);

-- 알림은 본인만 조회 가능
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);