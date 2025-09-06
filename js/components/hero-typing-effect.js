/**
 * 히어로 섹션 타이핑 효과 컴포넌트
 * WAVE SPACE 랜딩페이지용 동적 메시지 표시
 */
class HeroTypingEffect {
    constructor() {
        this.messages = [
            "환영합니다. 대한민국 No.1 분양실무자 소통공간입니다",
            "구인구직, 분양정보 공유, 전문가 커뮤니티, 다양한 재미까지 한번에!",
            "실무에 특화된 정보 가득, 업무 효율 향상을 지원합니다",
            "다양한 재미요소와 AI를 통해 점점 더 강화되는 기능을 만나보세요"
        ];
        this.currentIndex = 0;
        this.isInitialized = false;
        this.init();
    }

    init() {
        // DOM이 준비되면 초기화
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.createTypingElement();
        this.startTyping();
        this.isInitialized = true;
        console.log('[HeroTypingEffect] 타이핑 효과 초기화 완료');
    }

    createTypingElement() {
        const heroLeft = document.querySelector('.hero-left');
        if (!heroLeft) {
            console.warn('[HeroTypingEffect] .hero-left 요소를 찾을 수 없습니다.');
            return;
        }

        // 타이핑 텍스트 컨테이너 생성
        const typingContainer = document.createElement('div');
        typingContainer.className = 'hero-typing-container';
        typingContainer.innerHTML = `
            <div class="hero-typing-text">
                <span class="typing-text"></span>
                <span class="cursor">|</span>
            </div>
        `;

        // hero-description 다음에 삽입
        const description = heroLeft.querySelector('.hero-description');
        if (description) {
            description.insertAdjacentElement('afterend', typingContainer);
        } else {
            heroLeft.appendChild(typingContainer);
        }
    }

    async startTyping() {
        const textElement = document.querySelector('.typing-text');
        if (!textElement) {
            console.warn('[HeroTypingEffect] .typing-text 요소를 찾을 수 없습니다.');
            return;
        }

        // 무한 루프로 메시지 순환
        while (this.isInitialized) {
            const message = this.messages[this.currentIndex];
            
            try {
                // 타이핑 효과 (50ms 간격)
                for (let i = 0; i <= message.length; i++) {
                    if (!this.isInitialized) break;
                    textElement.textContent = message.slice(0, i);
                    await this.delay(50);
                }
                
                // 메시지 표시 시간 (2초)
                await this.delay(2000);
                
                // 지우기 효과 (30ms 간격)
                for (let i = message.length; i >= 0; i--) {
                    if (!this.isInitialized) break;
                    textElement.textContent = message.slice(0, i);
                    await this.delay(30);
                }
                
                // 다음 메시지로 이동
                this.currentIndex = (this.currentIndex + 1) % this.messages.length;
                
                // 메시지 간 대기 시간 (0.5초)
                await this.delay(500);
                
            } catch (error) {
                console.error('[HeroTypingEffect] 타이핑 효과 오류:', error);
                await this.delay(1000); // 오류 시 1초 대기 후 재시도
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 컴포넌트 정리 (필요시 사용)
    destroy() {
        this.isInitialized = false;
        const typingContainer = document.querySelector('.hero-typing-container');
        if (typingContainer) {
            typingContainer.remove();
        }
        console.log('[HeroTypingEffect] 타이핑 효과 정리 완료');
    }
}

// 전역 접근 가능하도록 window 객체에 등록
window.HeroTypingEffect = HeroTypingEffect;

// 자동 초기화 (DOMContentLoaded 시)
document.addEventListener('DOMContentLoaded', () => {
    if (!window.heroTypingEffect) {
        window.heroTypingEffect = new HeroTypingEffect();
    }
});