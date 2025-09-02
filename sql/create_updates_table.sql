-- WAVE SPACE - Updates 테이블 생성 스크립트
-- 업데이트 정보를 저장하는 테이블과 관련 설정

-- 업데이트 테이블 생성
CREATE TABLE IF NOT EXISTS updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 기능추가, 개선, 버그수정, 보안
    content TEXT NOT NULL,
    version VARCHAR(20),
    released_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_updates_released_at ON updates(released_at DESC);
CREATE INDEX IF NOT EXISTS idx_updates_type ON updates(type);
CREATE INDEX IF NOT EXISTS idx_updates_is_active ON updates(is_active);

-- RLS (Row Level Security) 활성화
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정
-- 1. 모든 사용자가 활성화된 업데이트를 볼 수 있음
CREATE POLICY "업데이트는 모든 사용자가 볼 수 있음" ON updates 
    FOR SELECT 
    USING (is_active = true);

-- 2. 관리자만 업데이트를 작성할 수 있음
CREATE POLICY "관리자만 업데이트 작성 가능" ON updates 
    FOR INSERT 
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- 3. 관리자만 업데이트를 수정할 수 있음
CREATE POLICY "관리자만 업데이트 수정 가능" ON updates 
    FOR UPDATE 
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- 4. 관리자만 업데이트를 삭제할 수 있음
CREATE POLICY "관리자만 업데이트 삭제 가능" ON updates 
    FOR DELETE 
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- 업데이트 시간 자동 갱신 트리거 적용
CREATE TRIGGER update_updates_updated_at 
    BEFORE UPDATE ON updates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 삽입
INSERT INTO updates (title, type, content, version, released_at) VALUES
(
    '🎉 WAVE SPACE 2.0 대규모 업데이트', 
    '기능추가', 
    'WAVE SPACE가 완전히 새로워졌습니다! 더 나은 사용자 경험을 위해 대규모 업데이트를 진행했습니다.

주요 변경사항:
• 새로운 포인트 시스템 도입 - 다양한 활동으로 포인트를 적립하세요
• 명예의 전당 기능 추가 - 우수 회원을 위한 특별한 공간
• AI 매칭 시스템 베타 오픈 - 인공지능이 최적의 인재를 매칭해드립니다
• 모바일 최적화 - 어디서든 편리하게 이용하세요
• 다크모드 지원 - 눈의 피로를 줄여드립니다',
    'v2.0.0',
    NOW() - INTERVAL '7 days'
),
(
    '포인트 시스템 개선 업데이트', 
    '개선', 
    '사용자 여러분의 피드백을 반영하여 포인트 시스템을 개선했습니다.

개선사항:
• 출석체크 포인트 상향 조정 (100P → 150P)
• 연속 출석 보너스 추가 (7일 연속 시 500P 추가 지급)
• 게시글 작성 포인트 세분화 (일반 50P, 우수 100P)
• 포인트 내역 조회 기능 개선
• 포인트 상점 아이템 추가',
    'v2.0.1',
    NOW() - INTERVAL '5 days'
),
(
    '로그인 관련 버그 수정', 
    '버그수정', 
    '일부 사용자가 경험한 로그인 문제를 해결했습니다.

수정사항:
• 소셜 로그인 연동 오류 수정
• 세션 만료 후 자동 로그아웃 문제 해결
• 비밀번호 찾기 이메일 발송 오류 수정
• 모바일 환경에서의 로그인 유지 문제 개선',
    'v2.0.2',
    NOW() - INTERVAL '3 days'
),
(
    '보안 강화 업데이트', 
    '보안', 
    '사용자 정보 보호를 위한 보안 강화 업데이트를 진행했습니다.

보안 강화 내용:
• 2단계 인증 기능 추가 (선택사항)
• 비밀번호 정책 강화 (최소 8자, 특수문자 포함)
• 개인정보 암호화 강화
• 비정상 접속 감지 시스템 도입
• HTTPS 전체 적용',
    'v2.0.3',
    NOW() - INTERVAL '2 days'
),
(
    'UI/UX 개선 업데이트', 
    '개선', 
    '더 나은 사용자 경험을 위해 인터페이스를 개선했습니다.

UI/UX 개선사항:
• 사이드바 애니메이션 최적화
• 페이지 로딩 속도 30% 향상
• 반응형 디자인 개선 (태블릿 대응)
• 폰트 가독성 향상
• 버튼 및 입력 필드 디자인 통일',
    'v2.0.4',
    NOW() - INTERVAL '1 day'
),
(
    '알림 시스템 업데이트', 
    '기능추가', 
    '실시간 알림 기능이 추가되었습니다.

새로운 기능:
• 실시간 푸시 알림 지원
• 알림 설정 커스터마이징
• 댓글, 좋아요, 포인트 적립 알림
• 알림 히스토리 조회 기능
• 방해금지 모드 추가',
    'v2.1.0',
    NOW()
);

-- 테이블 생성 확인 메시지
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'updates') THEN
        RAISE NOTICE '✅ updates 테이블이 성공적으로 생성되었습니다.';
    END IF;
END $$;