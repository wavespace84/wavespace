// header-loader.js - 헤더 동적 로드 시스템
// 모든 페이지에서 일관된 헤더 구조를 보장

export class HeaderLoader {
    constructor() {
        this.isLoaded = false;
        this.headerContent = null;
    }

    /**
     * 헤더 템플릿을 로드하고 삽입
     * @param {string} containerId - 헤더를 삽입할 컨테이너 ID (기본: header-container)
     * @returns {Promise<boolean>} 로드 성공 여부
     */
    async loadHeader(containerId = 'header-container') {
        try {
            // 이미 로드된 경우 재사용
            if (this.isLoaded && this.headerContent) {
                return this.insertHeader(containerId);
            }

            // 헤더 템플릿 파일 로드
            const response = await fetch('components/header.html');
            if (!response.ok) {
                throw new Error(`헤더 템플릿 로드 실패: ${response.status}`);
            }

            this.headerContent = await response.text();
            console.log('[HeaderLoader] 로드된 헤더 내용:', this.headerContent.substring(0, 200) + '...');
            this.isLoaded = true;

            return this.insertHeader(containerId);

        } catch (error) {
            console.error('[HeaderLoader] 헤더 로드 실패:', error);
            
            // 폴백: 기본 헤더 구조 생성
            this.createFallbackHeader(containerId);
            return false;
        }
    }

    /**
     * 로드된 헤더 콘텐츠를 컨테이너에 삽입
     * @param {string} containerId 
     * @returns {boolean}
     */
    insertHeader(containerId) {
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error(`[HeaderLoader] 헤더 컨테이너를 찾을 수 없음: #${containerId}`);
            return false;
        }

        container.innerHTML = this.headerContent;
        console.log('[HeaderLoader] 헤더 삽입 성공');
        console.log('[HeaderLoader] 삽입된 HTML:', container.innerHTML.substring(0, 200) + '...');
        return true;
    }

    /**
     * 헤더 로드 실패 시 폴백 헤더 생성
     * @param {string} containerId 
     */
    createFallbackHeader(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <header class="main-header">
                <div class="header-left">
                    <button class="mobile-menu-btn">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>

                <div class="header-right">
                    <!-- 검색 버튼 -->
                    <button class="header-icon-btn">
                        <i class="fas fa-search"></i>
                    </button>

                    <!-- 알림 버튼 -->
                    <button class="header-icon-btn notification-btn">
                        <i class="fas fa-bell"></i>
                        <span class="notification-dot"></span>
                    </button>

                    <!-- 사용자 프로필 -->
                    <div class="user-info" id="userInfoContainer">
                        <!-- AuthService가 동적으로 사용자 정보를 여기에 표시 -->
                    </div>
                </div>
            </header>
        `;

        console.warn('[HeaderLoader] 폴백 헤더 생성됨');
    }

    /**
     * 특정 페이지에서 헤더 자동 로드
     * DOM이 준비된 후 자동으로 실행
     */
    static async autoLoad() {
        const loader = new HeaderLoader();
        
        // DOM 준비 대기
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // 헤더 컨테이너 존재 확인
        const container = document.getElementById('header-container');
        if (container) {
            const success = await loader.loadHeader();
            
            // 헤더 로드 완료 이벤트 발생
            document.dispatchEvent(new CustomEvent('headerLoaded', {
                detail: { success, loader }
            }));
        }
    }
}

// 전역 접근을 위한 내보내기
window.HeaderLoader = HeaderLoader;