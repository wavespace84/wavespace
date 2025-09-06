/**
 * LayoutManager - HTML 레이아웃 및 컴포넌트 관리자
 * 공통 레이아웃 템플릿을 관리하고 페이지별 커스터마이징을 지원합니다.
 */

class LayoutManager {
    constructor() {
        this.templateCache = new Map();
        this.componentCache = new Map();
        this.defaultConfig = {
            title: 'WAVE SPACE',
            description: '대한민국 No.1 분양실무자 대표 커뮤니티',
            keywords: '분양, 부동산, 실무자, 커뮤니티, 분양영업, 분양기획',
            pageName: 'index'
        };
    }

    /**
     * 페이지 설정 생성
     */
    createPageConfig(options = {}) {
        return {
            ...this.defaultConfig,
            ...options,
            url: window.location.href
        };
    }

    /**
     * 템플릿 변수 치환
     */
    replaceTemplateVariables(template, config) {
        const variables = {
            PAGE_TITLE: config.title,
            PAGE_DESCRIPTION: config.description,
            PAGE_KEYWORDS: config.keywords,
            PAGE_NAME: config.pageName,
            PAGE_URL: config.url,
            ADDITIONAL_CSS: config.additionalCSS || '',
            ADDITIONAL_SCRIPTS: config.additionalScripts || '',
            PAGE_CONTENT: config.content || ''
        };

        let result = template;
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, value);
        });

        return result;
    }

    /**
     * 컴포넌트 로드
     */
    async loadComponent(componentPath) {
        if (this.componentCache.has(componentPath)) {
            return this.componentCache.get(componentPath);
        }

        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`컴포넌트 로드 실패: ${componentPath}`);
            }

            const html = await response.text();
            this.componentCache.set(componentPath, html);
            return html;
            
        } catch (error) {
            console.error('컴포넌트 로드 오류:', error);
            return null;
        }
    }

    /**
     * 베이스 레이아웃 로드
     */
    async loadBaseLayout() {
        const cacheKey = 'base-layout';
        if (this.templateCache.has(cacheKey)) {
            return this.templateCache.get(cacheKey);
        }

        try {
            const layoutHtml = await this.loadComponent('components/base-layout.html');
            if (layoutHtml) {
                // template 태그에서 실제 내용 추출
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = layoutHtml;
                const template = tempDiv.querySelector('#base-layout-template');
                
                if (template) {
                    const content = template.innerHTML;
                    this.templateCache.set(cacheKey, content);
                    return content;
                }
            }
            return null;
        } catch (error) {
            console.error('베이스 레이아웃 로드 실패:', error);
            return null;
        }
    }

    /**
     * 페이지 렌더링
     */
    async renderPage(pageConfig) {
        try {
            const baseLayout = await this.loadBaseLayout();
            if (!baseLayout) {
                throw new Error('베이스 레이아웃을 로드할 수 없습니다.');
            }

            const config = this.createPageConfig(pageConfig);
            const renderedHtml = this.replaceTemplateVariables(baseLayout, config);
            
            return renderedHtml;
        } catch (error) {
            console.error('페이지 렌더링 실패:', error);
            return null;
        }
    }

    /**
     * 동적 컴포넌트 주입
     */
    async injectComponent(containerId, componentPath, data = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`컨테이너를 찾을 수 없습니다: ${containerId}`);
            return false;
        }

        try {
            let componentHtml = await this.loadComponent(componentPath);
            if (!componentHtml) return false;

            // 데이터 바인딩
            if (Object.keys(data).length > 0) {
                componentHtml = this.replaceTemplateVariables(componentHtml, data);
            }

            container.innerHTML = componentHtml;
            
            // 컴포넌트 로드 완료 이벤트 발생
            this.dispatchComponentLoadedEvent(containerId, componentPath);
            
            return true;
        } catch (error) {
            console.error('컴포넌트 주입 실패:', error);
            return false;
        }
    }

    /**
     * 컴포넌트 로드 완료 이벤트 발생
     */
    dispatchComponentLoadedEvent(containerId, componentPath) {
        const event = new CustomEvent('componentLoaded', {
            detail: {
                containerId,
                componentPath,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 페이지별 CSS 로드
     */
    loadPageCSS(cssFiles) {
        const cssLinks = Array.isArray(cssFiles) ? cssFiles : [cssFiles];
        
        cssLinks.forEach(cssFile => {
            // 이미 로드된 CSS인지 확인
            if (document.querySelector(`link[href="${cssFile}"]`)) {
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssFile;
            link.type = 'text/css';
            
            // 버전 쿼리 파라미터 추가
            if (!cssFile.includes('?')) {
                link.href += '?v=7';
            }
            
            document.head.appendChild(link);
        });
    }

    /**
     * 페이지별 스크립트 로드
     */
    async loadPageScript(scriptFile) {
        return new Promise((resolve, reject) => {
            // 이미 로드된 스크립트인지 확인
            if (document.querySelector(`script[src="${scriptFile}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = scriptFile;
            script.type = 'text/javascript';
            
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`스크립트 로드 실패: ${scriptFile}`));
            
            document.head.appendChild(script);
        });
    }

    /**
     * 메타태그 업데이트
     */
    updateMetaTags(config) {
        const metaTags = {
            'description': config.description,
            'keywords': config.keywords,
            'og:title': `${config.title} - WAVE space`,
            'og:description': config.description,
            'og:url': config.url
        };

        Object.entries(metaTags).forEach(([name, content]) => {
            let metaTag = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
            
            if (metaTag) {
                metaTag.setAttribute('content', content);
            } else {
                metaTag = document.createElement('meta');
                if (name.startsWith('og:')) {
                    metaTag.setAttribute('property', name);
                } else {
                    metaTag.setAttribute('name', name);
                }
                metaTag.setAttribute('content', content);
                document.head.appendChild(metaTag);
            }
        });

        // 타이틀 업데이트
        document.title = `${config.title} - WAVE space`;
    }

    /**
     * 페이지 초기화
     */
    async initializePage(pageConfig) {
        try {
            const config = this.createPageConfig(pageConfig);
            
            // 메타태그 업데이트
            this.updateMetaTags(config);
            
            // 페이지별 CSS 로드
            if (config.css) {
                this.loadPageCSS(config.css);
            }
            
            // 페이지별 스크립트 로드
            if (config.scripts) {
                const scripts = Array.isArray(config.scripts) ? config.scripts : [config.scripts];
                for (const script of scripts) {
                    await this.loadPageScript(script);
                }
            }
            
            // 기본 컴포넌트들 로드
            await this.loadDefaultComponents();
            
            // 페이지 로딩 완료 표시
            document.body.classList.remove('page-loading');
            
            console.log(`✅ 페이지 초기화 완료: ${config.title}`);
            
        } catch (error) {
            console.error('페이지 초기화 실패:', error);
        }
    }

    /**
     * 기본 컴포넌트들 로드
     */
    async loadDefaultComponents() {
        const components = [
            { containerId: 'sidebar-container', path: 'components/sidebar.html' },
            { containerId: 'header-container', path: 'components/header.html' }
        ];

        const loadPromises = components.map(({ containerId, path }) => 
            this.injectComponent(containerId, path)
        );

        await Promise.all(loadPromises);
    }

    /**
     * 캐시 클리어
     */
    clearCache() {
        this.templateCache.clear();
        this.componentCache.clear();
    }

    /**
     * 반응형 브레이크포인트 유틸리티
     */
    getBreakpoint() {
        const width = window.innerWidth;
        
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        if (width < 1440) return 'desktop';
        return 'wide';
    }

}

// 전역으로 내보내기
window.LayoutManager = LayoutManager;

// 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.layoutManager = new LayoutManager();
});

export default LayoutManager;