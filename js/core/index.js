/**
 * WAVE SPACE - Core 모듈 통합 진입점
 * 모든 Core 모듈을 초기화하고 전역 객체 설정
 * 기존 WaveSpaceData.js 역할을 대체
 * 
 * @version 2.0.0
 * @author WAVE SPACE Team
 */

// Core 모듈 임포트
import { errorHandler } from './errorHandler.js';
import { dataManager } from './dataManager.js';
import { stateManager } from './stateManager.js';
import { EventSystem } from './eventSystem.js';
import CoreUtils from './utils.js';

// 보안 모듈 임포트 (이미 생성되어 있음)
let WaveSpaceSecurity;
try {
    const securityModule = await import('./security.js');
    WaveSpaceSecurity = securityModule.default || securityModule.WaveSpaceSecurity;
} catch (error) {
    console.warn('[Core] 보안 모듈을 불러올 수 없습니다:', error.message);
    // 폴백: 기본 보안 클래스 생성
    WaveSpaceSecurity = class {
        escapeHtml(text) {
            return CoreUtils.StringUtils.escapeHtml(text);
        }
        sanitizeInput(input) {
            return this.escapeHtml(input);
        }
    };
}

/**
 * WAVE SPACE 코어 시스템 클래스
 * 기존 WaveSpaceData를 대체하는 통합 관리자
 */
class WaveSpaceCore {
    constructor() {
        this.version = '2.0.0';
        this.initialized = false;
        
        // Core 모듈 참조
        this.errorHandler = errorHandler;
        this.dataManager = dataManager;
        this.stateManager = stateManager;
        this.eventSystem = null; // 지연 초기화
        this.security = null; // 지연 초기화
        this.utils = CoreUtils;
        
        // 레거시 호환성
        this.config = {
            get: (key, defaultValue) => this.dataManager.getConfig(key, defaultValue),
            set: (key, value) => this.dataManager.setConfig(key, value),
            apiEndpoint: '/api',
            version: this.version,
            debug: window.ENV?.isDevelopment() || false
        };
        
        console.log('[WaveSpaceCore] 코어 시스템 생성 완료');
    }

    /**
     * 코어 시스템 초기화
     */
    async init() {
        if (this.initialized) {
            console.warn('[WaveSpaceCore] 이미 초기화되었습니다.');
            return;
        }

        try {
            console.log('[WaveSpaceCore] 초기화 시작...');

            // 이벤트 시스템 초기화
            this.eventSystem = new EventSystem();
            
            // 보안 모듈 초기화
            this.security = new WaveSpaceSecurity();
            
            // 전역 에러 핸들러 설정
            this.setupGlobalErrorHandling();
            
            // 성능 모니터링 설정
            this.setupPerformanceMonitoring();
            
            // 전역 객체 설정
            this.setupGlobalObjects();
            
            this.initialized = true;
            console.log('✅ [WaveSpaceCore] 초기화 완료');
            
            // 초기화 완료 이벤트 발행
            this.dataManager.publish('core:initialized', {
                version: this.version,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ [WaveSpaceCore] 초기화 실패:', error);
            this.errorHandler.critical('코어 시스템 초기화 실패', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * 전역 에러 핸들링 설정
     */
    setupGlobalErrorHandling() {
        // 이미 에러핸들러에서 처리하므로 추가 설정만
        this.dataManager.subscribe('error:critical', (data) => {
            console.error('🚨 Critical error detected:', data);
        });
    }

    /**
     * 성능 모니터링 설정
     */
    setupPerformanceMonitoring() {
        if (!this.config.debug) return;

        // 페이지 로드 성능 측정
        window.addEventListener('load', () => {
            if (performance.timing) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`📊 [Performance] 페이지 로드 시간: ${loadTime}ms`);
                
                this.dataManager.publish('performance:page-load', {
                    loadTime,
                    timestamp: Date.now()
                });
            }
        });

        // 메모리 사용량 모니터링 (Chrome)
        if (performance.memory) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
                    console.warn('⚠️ [Performance] 메모리 사용량이 높습니다:', {
                        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
                    });
                }
            }, 30000); // 30초마다 체크
        }
    }

    /**
     * 전역 객체 설정 (레거시 호환성)
     */
    setupGlobalObjects() {
        // 메인 전역 객체
        window.WaveSpaceData = this;
        window.WaveSpaceCore = this;
        
        // 개별 모듈 접근성
        window.ErrorHandler = this.errorHandler;
        window.DataManager = this.dataManager;
        window.StateManager = this.stateManager;
        
        // 유틸리티 함수들
        window.debounce = this.utils.debounce;
        window.throttle = this.utils.throttle;
        window.escapeHtml = this.utils.escapeHtml;
        
        // 편의 함수들
        window.showError = (message, context) => this.errorHandler.error(message, context);
        window.showWarning = (message, context) => this.errorHandler.warning(message, context);
        window.showInfo = (message, context) => this.errorHandler.info(message, context);
        
        // 레거시 API 유지
        window.handleError = (error, showToast = true) => {
            return this.errorHandler.handleError(error, 'error', showToast);
        };
        
        console.log('[WaveSpaceCore] 전역 객체 설정 완료');
    }

    /**
     * 코어 시스템 상태 확인
     */
    getStatus() {
        return {
            version: this.version,
            initialized: this.initialized,
            modules: {
                errorHandler: !!this.errorHandler,
                dataManager: !!this.dataManager,
                stateManager: !!this.stateManager,
                eventSystem: !!this.eventSystem,
                security: !!this.security,
                utils: !!this.utils
            },
            performance: {
                errorCount: this.errorHandler.getLogs(1).length,
                cacheSize: this.dataManager.cache.size,
                stateSize: this.stateManager.state.size,
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                } : null
            }
        };
    }

    /**
     * 코어 시스템 정리
     */
    cleanup() {
        console.log('[WaveSpaceCore] 정리 시작...');
        
        try {
            // 각 모듈 정리
            this.dataManager?.cleanup();
            this.stateManager?.clearAll();
            this.errorHandler?.clearLogs();
            
            // 전역 객체 정리
            delete window.WaveSpaceData;
            delete window.WaveSpaceCore;
            
            this.initialized = false;
            console.log('[WaveSpaceCore] 정리 완료');
            
        } catch (error) {
            console.error('[WaveSpaceCore] 정리 중 오류:', error);
        }
    }

    /**
     * 디버그 정보 출력
     */
    debug() {
        console.group('🔍 WAVE SPACE Core Debug Info');
        console.log('Status:', this.getStatus());
        console.log('Data Manager:', this.dataManager.getDebugInfo());
        console.log('State Manager:', this.stateManager.getStats());
        console.log('Recent Errors:', this.errorHandler.getLogs(5));
        console.groupEnd();
    }
}

// 전역 인스턴스 생성
const waveSpaceCore = new WaveSpaceCore();

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await waveSpaceCore.init();
    } catch (error) {
        console.error('Core 초기화 실패:', error);
    }
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    waveSpaceCore.cleanup();
});

// 모듈 export
export default waveSpaceCore;
export { waveSpaceCore };
export { errorHandler, dataManager, stateManager, CoreUtils };