/**
 * 페이지 템플릿 시스템 - 40개 HTML 파일의 중복 구조 해결
 * 공통 레이아웃과 개별 페이지 콘텐츠 분리
 */
class PageTemplate {
    constructor() {
        this.componentLoader = new ComponentLoader();
        this.pageData = new Map();
    }

    /**
     * 기본 페이지 템플릿 생성
     */
    createBaseTemplate(pageConfig) {
        const { title, description, additionalCSS = [], additionalJS = [] } = pageConfig;
        
        return `
            <!doctype html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta http-equiv="Content-Security-Policy" 
                    content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; font-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' https://sishloxzcqapontycuyz.supabase.co wss://sishloxzcqapontycuyz.supabase.co;" />
                <title>${title} - WAVE space</title>
                <meta name="description" content="${description}" />
                
                <!-- Favicon -->
                <link rel="icon" type="image/x-icon" href="/favicon.ico">
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
                
                <!-- 환경 설정 -->
                <script src="config.dev.js"></script>
                
                <!-- 공통 유틸리티 -->
                <script src="js/utils/xssProtection.js"></script>
                <script src="js/utils/errorHandler.js"></script>
                <script src="js/utils/logger.js"></script>
                <script src="js/utils/common.js"></script>
                <script src="js/utils/formatters.js"></script>
                
                <!-- 기본 CSS (통합) -->
                <link rel="stylesheet" href="css/base.css" />
                <link rel="stylesheet" href="css/components.css" />
                <link rel="stylesheet" href="css/layout.css" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                
                <!-- 페이지별 CSS -->
                ${additionalCSS.map(css => `<link rel="stylesheet" href="${css}" />`).join('\n                ')}
            </head>
            <body data-page="${pageConfig.pageName}">
                <!-- 레이아웃 컨테이너 -->
                <div class="app-container">
                    <!-- 사이드바 컨테이너 -->
                    <div id="sidebar-container"></div>
                    
                    <!-- 메인 컨텐츠 -->
                    <main class="main-content">
                        <!-- 헤더 컨테이너 -->
                        <div id="header-container"></div>
                        
                        <!-- 페이지 컨텐츠 -->
                        <div class="page-content">
                            ${pageConfig.content || '<div id="page-content-placeholder"></div>'}
                        </div>
                    </main>
                </div>
                
                <!-- 공통 JS -->
                <script src="js/components/ComponentLoader.js"></script>
                <script src="js/components/PageTemplate.js"></script>
                <script src="js/modules/preload.js"></script>
                <script src="js/main.js"></script>
                
                <!-- 페이지별 JS -->
                ${additionalJS.map(js => `<script src="${js}"></script>`).join('\n                ')}
                
                <!-- 페이지 초기화 -->
                <script>
                    document.addEventListener('DOMContentLoaded', async () => {
                        console.log('[PageTemplate] DOMContentLoaded 시작');
                        window.componentLoader = new ComponentLoader();
                        console.log('[PageTemplate] loadCommonComponents 호출 전');
                        await window.componentLoader.loadCommonComponents();
                        console.log('[PageTemplate] loadCommonComponents 호출 후');
                        window.componentLoaderReady = true;
                        console.log('[PageTemplate] componentLoaderReady 플래그 설정 완료');
                        document.dispatchEvent(new CustomEvent('componentLoaderReady'));
                        console.log('[PageTemplate] componentLoaderReady 이벤트 발생 완료');
                        
                        // 페이지별 초기화 함수 호출
                        if (window.initPage && typeof window.initPage === 'function') {
                            window.initPage();
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }

    /**
     * 페이지별 설정 데이터
     */
    getPageConfigs() {
        return {
            'index': {
                title: '메인',
                description: '대한민국 No.1 분양실무자 대표 커뮤니티',
                pageName: 'index',
                additionalCSS: ['styles.css'],
                additionalJS: [],
                content: `
                    <div class="hero-section">
                        <h1>WAVE space에 오신 것을 환영합니다</h1>
                        <p class="hero-subtitle">대한민국 최고의 분양실무자 커뮤니티</p>
                        <div class="hero-stats">
                            <div class="stat-item">
                                <span class="stat-number">10,000+</span>
                                <span class="stat-label">회원</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">5,000+</span>
                                <span class="stat-label">게시물</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">99%</span>
                                <span class="stat-label">만족도</span>
                            </div>
                        </div>
                        <div class="hero-actions">
                            <a href="signup.html" class="btn btn-primary">회원가입</a>
                            <a href="forum.html" class="btn btn-secondary">커뮤니티 둘러보기</a>
                        </div>
                    </div>
                `
            },
            'notice': {
                title: '공지사항',
                description: '중요한 공지사항을 확인하세요',
                pageName: 'notice',
                additionalCSS: [],
                additionalJS: ['notice.js']
            },
            'events': {
                title: '이벤트',
                description: '진행중인 이벤트를 확인하세요',
                pageName: 'events',
                additionalCSS: ['events.css'],
                additionalJS: ['events.js']
            },
            'forum': {
                title: '자유게시판',
                description: '자유롭게 의견을 나누는 공간',
                pageName: 'forum',
                additionalCSS: ['forum.css'],
                additionalJS: ['forum.js']
            },
            'market-research': {
                title: '시장조사서',
                description: '전문적인 시장조사 자료',
                pageName: 'market-research',
                additionalCSS: ['market-research.css', 'market-research-minimal.css'],
                additionalJS: ['market-research.js']
            }
            // 나머지 페이지들도 필요에 따라 추가...
        };
    }

    /**
     * 특정 페이지 HTML 생성
     */
    generatePage(pageName) {
        const configs = this.getPageConfigs();
        const config = configs[pageName];
        
        if (!config) {
            console.error(`페이지 설정을 찾을 수 없습니다: ${pageName}`);
            return null;
        }
        
        return this.createBaseTemplate(config);
    }

    /**
     * 동적 페이지 콘텐츠 업데이트
     */
    updatePageContent(content) {
        const contentContainer = document.querySelector('#page-content-placeholder');
        if (contentContainer) {
            contentContainer.innerHTML = content;
        } else {
            console.warn('페이지 콘텐츠 플레이스홀더를 찾을 수 없습니다');
        }
    }

    /**
     * 브레드크럼 생성
     */
    generateBreadcrumb(path) {
        const breadcrumbItems = path.map((item, index) => {
            const isLast = index === path.length - 1;
            return `
                <li class="breadcrumb-item ${isLast ? 'active' : ''}">
                    ${isLast ? 
        `<span>${item.text}</span>` : 
        `<a href="${item.href}">${item.text}</a>`
}
                </li>
            `;
        }).join('');

        return `
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    ${breadcrumbItems}
                </ol>
            </nav>
        `;
    }

    /**
     * 페이지 메타데이터 업데이트
     */
    updatePageMeta(title, description) {
        document.title = `${title} - WAVE space`;
        
        let metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', description);
        } else {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            metaDescription.setAttribute('content', description);
            document.head.appendChild(metaDescription);
        }
    }
}

// 전역으로 내보내기
window.PageTemplate = PageTemplate;