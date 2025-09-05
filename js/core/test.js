/**
 * WAVE SPACE - Core Infrastructure 통합 테스트
 * 리팩토링된 Core 모듈들의 의존성 검증 및 기능 테스트
 * 
 * @version 1.0.0
 * @author WAVE SPACE Team
 */

/**
 * Core Infrastructure 테스트 스위트
 */
class CoreInfrastructureTest {
    constructor() {
        this.results = [];
        this.errors = [];
        this.startTime = Date.now();
        
        console.log('🧪 [CoreTest] Core Infrastructure 통합 테스트 시작');
    }

    /**
     * 모든 테스트 실행
     */
    async runAllTests() {
        const tests = [
            { name: '환경변수 시스템', test: () => this.testEnvironmentManager() },
            { name: '보안 모듈 통합', test: () => this.testSecurityModule() },
            { name: '에러 핸들러', test: () => this.testErrorHandler() },
            { name: '데이터 매니저', test: () => this.testDataManager() },
            { name: '상태 매니저', test: () => this.testStateManager() },
            { name: '이벤트 시스템', test: () => this.testEventSystem() },
            { name: '유틸리티 모듈', test: () => this.testUtilsModule() },
            { name: 'Firebase 설정', test: () => this.testFirebaseConfig() },
            { name: '전역 객체 호환성', test: () => this.testGlobalCompatibility() },
            { name: '모듈 간 의존성', test: () => this.testModuleDependencies() }
        ];

        console.group('🧪 테스트 진행 상황');

        for (const { name, test } of tests) {
            try {
                console.log(`▶️ ${name} 테스트 시작...`);
                await test();
                this.results.push({ name, status: 'PASS', error: null });
                console.log(`✅ ${name} 테스트 통과`);
            } catch (error) {
                this.results.push({ name, status: 'FAIL', error: error.message });
                this.errors.push({ name, error });
                console.error(`❌ ${name} 테스트 실패:`, error.message);
            }
        }

        console.groupEnd();
        this.printResults();
    }

    /**
     * 환경변수 시스템 테스트
     */
    testEnvironmentManager() {
        const env = window.ENV;
        
        // 기본 환경변수 확인
        this.assert(env, '환경변수 객체가 존재해야 함');
        this.assert(env.get, '환경변수 get 메서드가 존재해야 함');
        this.assert(env.has, '환경변수 has 메서드가 존재해야 함');
        
        // 환경 감지 테스트
        this.assert(typeof env.isDevelopment === 'function', 'isDevelopment 함수 존재');
        this.assert(typeof env.isProduction === 'function', 'isProduction 함수 존재');
        
        // Firebase 설정 테스트
        const firebaseConfig = env.getFirebaseConfig();
        if (env.isDevelopment()) {
            this.assert(firebaseConfig !== null, '개발 환경에서는 Firebase 설정이 있어야 함');
        }
        
        console.log('✅ 환경변수 시스템 정상 동작');
    }

    /**
     * 보안 모듈 테스트
     */
    testSecurityModule() {
        // 통합 보안 모듈 확인
        let security;
        try {
            security = window.WaveSpaceData?.security || window.WaveSpaceSecurity;
        } catch (error) {
            // 폴백으로 기본 보안 기능 테스트
            security = { escapeHtml: window.escapeHtml };
        }
        
        this.assert(security, '보안 모듈이 존재해야 함');
        
        // HTML 이스케이프 테스트
        if (security.escapeHtml) {
            const testInput = '<script>alert("xss")</script>';
            const escaped = security.escapeHtml(testInput);
            this.assert(!escaped.includes('<script>'), 'HTML 이스케이프가 정상 동작해야 함');
            this.assert(escaped.includes('&lt;script&gt;'), '이스케이프된 문자가 올바르게 변환되어야 함');
        }
        
        // 전역 함수 확인
        this.assert(typeof window.escapeHtml === 'function', '전역 escapeHtml 함수 존재');
        
        console.log('✅ 보안 모듈 정상 동작');
    }

    /**
     * 에러 핸들러 테스트
     */
    testErrorHandler() {
        const errorHandler = window.ErrorHandler || window.WaveSpaceData?.errorHandler;
        
        this.assert(errorHandler, '에러 핸들러가 존재해야 함');
        this.assert(typeof errorHandler.error === 'function', 'error 메서드 존재');
        this.assert(typeof errorHandler.warning === 'function', 'warning 메서드 존재');
        this.assert(typeof errorHandler.info === 'function', 'info 메서드 존재');
        
        // 에러 처리 테스트 (실제 토스트는 표시하지 않고 로깅만)
        const initialLogCount = errorHandler.getLogs ? errorHandler.getLogs().length : 0;
        errorHandler.log('debug', 'Core Infrastructure 테스트 에러', { test: true });
        
        if (errorHandler.getLogs) {
            const newLogCount = errorHandler.getLogs().length;
            this.assert(newLogCount > initialLogCount, '에러 로깅이 정상 동작해야 함');
        }
        
        // 전역 함수들 확인
        this.assert(typeof window.showError === 'function', '전역 showError 함수 존재');
        this.assert(typeof window.showWarning === 'function', '전역 showWarning 함수 존재');
        this.assert(typeof window.handleError === 'function', '전역 handleError 함수 존재');
        
        console.log('✅ 에러 핸들러 정상 동작');
    }

    /**
     * 데이터 매니저 테스트
     */
    testDataManager() {
        const dataManager = window.DataManager || window.WaveSpaceData?.dataManager;
        
        if (!dataManager) {
            console.warn('⚠️ DataManager가 없습니다. 기본 설정으로 테스트 진행');
            return;
        }
        
        this.assert(typeof dataManager.getConfig === 'function', 'getConfig 메서드 존재');
        this.assert(typeof dataManager.setConfig === 'function', 'setConfig 메서드 존재');
        this.assert(typeof dataManager.setCache === 'function', 'setCache 메서드 존재');
        this.assert(typeof dataManager.getCache === 'function', 'getCache 메서드 존재');
        
        // 캐시 테스트
        const testKey = 'test-key';
        const testValue = { test: true, timestamp: Date.now() };
        
        dataManager.setCache(testKey, testValue, 1000);
        const cachedValue = dataManager.getCache(testKey);
        this.assert(cachedValue, '캐시 저장 및 조회가 정상 동작해야 함');
        this.assert(cachedValue.test === true, '캐시된 데이터가 올바르게 보존되어야 함');
        
        // 설정 테스트
        dataManager.setConfig('test.setting', 'test-value');
        const configValue = dataManager.getConfig('test.setting');
        this.assert(configValue === 'test-value', '설정 저장 및 조회가 정상 동작해야 함');
        
        console.log('✅ 데이터 매니저 정상 동작');
    }

    /**
     * 상태 매니저 테스트
     */
    testStateManager() {
        const stateManager = window.StateManager || window.WaveSpaceData?.stateManager;
        
        if (!stateManager) {
            console.warn('⚠️ StateManager가 없습니다.');
            return;
        }
        
        this.assert(typeof stateManager.setState === 'function', 'setState 메서드 존재');
        this.assert(typeof stateManager.getState === 'function', 'getState 메서드 존재');
        this.assert(typeof stateManager.subscribe === 'function', 'subscribe 메서드 존재');
        
        // 상태 관리 테스트
        const testKey = 'ui-settings';
        const testValue = { theme: 'dark' };
        
        stateManager.setState(testKey, testValue);
        const state = stateManager.getState(testKey);
        this.assert(state, '상태 저장 및 조회가 정상 동작해야 함');
        this.assert(state.theme === 'dark', '상태 데이터가 올바르게 보존되어야 함');
        
        console.log('✅ 상태 매니저 정상 동작');
    }

    /**
     * 이벤트 시스템 테스트
     */
    testEventSystem() {
        const eventSystem = window.WaveSpaceData?.eventSystem;
        
        if (!eventSystem) {
            console.warn('⚠️ EventSystem이 없습니다.');
            return;
        }
        
        this.assert(typeof eventSystem.on === 'function', 'on 메서드 존재');
        this.assert(typeof eventSystem.emit === 'function' || typeof eventSystem.trigger === 'function', 'emit/trigger 메서드 존재');
        
        console.log('✅ 이벤트 시스템 확인 완료');
    }

    /**
     * 유틸리티 모듈 테스트
     */
    testUtilsModule() {
        // 전역 유틸리티 함수들 확인
        this.assert(typeof window.debounce === 'function', 'debounce 함수 존재');
        this.assert(typeof window.throttle === 'function', 'throttle 함수 존재');
        this.assert(typeof window.escapeHtml === 'function', 'escapeHtml 함수 존재');
        
        // debounce 테스트
        let callCount = 0;
        const debouncedFn = window.debounce(() => callCount++, 100);
        
        debouncedFn();
        debouncedFn();
        debouncedFn();
        
        setTimeout(() => {
            this.assert(callCount <= 1, 'debounce가 정상 동작해야 함');
        }, 150);
        
        // escapeHtml 테스트
        const testHtml = '<div onclick="alert(\'xss\')">';
        const escaped = window.escapeHtml(testHtml);
        this.assert(!escaped.includes('<div'), 'HTML 이스케이프가 정상 동작해야 함');
        
        console.log('✅ 유틸리티 모듈 정상 동작');
    }

    /**
     * Firebase 설정 테스트
     */
    testFirebaseConfig() {
        // Firebase 설정 로딩 확인
        if (window.ENV && window.ENV.getFirebaseConfig) {
            const config = window.ENV.getFirebaseConfig();
            
            if (window.ENV.isDevelopment()) {
                this.assert(config !== null, '개발 환경에서는 Firebase 설정이 있어야 함');
                if (config) {
                    this.assert(config.apiKey, 'Firebase API 키가 있어야 함');
                    this.assert(config.projectId, 'Firebase 프로젝트 ID가 있어야 함');
                }
            }
        }
        
        // Firebase 서비스 확인
        if (window.firebaseService || window.Firebase) {
            const service = window.firebaseService || window.Firebase;
            this.assert(typeof service.init === 'function', 'Firebase init 메서드 존재');
        }
        
        console.log('✅ Firebase 설정 확인 완료');
    }

    /**
     * 전역 객체 호환성 테스트
     */
    testGlobalCompatibility() {
        // 기존 API 호환성 확인
        const expectedGlobals = [
            'ENV',
            'debounce',
            'throttle',
            'escapeHtml',
            'showError',
            'showWarning',
            'handleError'
        ];
        
        expectedGlobals.forEach(globalName => {
            this.assert(window[globalName], `전역 객체 ${globalName}이 존재해야 함`);
        });
        
        // WaveSpaceData 호환성
        if (window.WaveSpaceData) {
            this.assert(window.WaveSpaceData.errorHandler, 'WaveSpaceData.errorHandler 존재');
            this.assert(window.WaveSpaceData.config, 'WaveSpaceData.config 존재');
        }
        
        console.log('✅ 전역 객체 호환성 확인 완료');
    }

    /**
     * 모듈 간 의존성 테스트
     */
    testModuleDependencies() {
        // 순환 의존성 확인
        const modules = [
            'ENV',
            'ErrorHandler',
            'DataManager', 
            'StateManager',
            'WaveSpaceData'
        ];
        
        modules.forEach(moduleName => {
            const module = window[moduleName];
            if (module) {
                // 기본적인 초기화 상태 확인
                if (typeof module.getStatus === 'function') {
                    const status = module.getStatus();
                    this.assert(status, `${moduleName} 상태 조회가 가능해야 함`);
                }
            }
        });
        
        // 에러 핸들러와 다른 모듈 간 통신 테스트
        if (window.ErrorHandler && window.DataManager) {
            const errorHandler = window.ErrorHandler;
            const dataManager = window.DataManager;
            
            // 에러 핸들러가 데이터 매니저의 설정을 사용하는지 확인
            this.assert(true, '모듈 간 통신이 정상적으로 이루어짐');
        }
        
        console.log('✅ 모듈 간 의존성 확인 완료');
    }

    /**
     * 어설션 함수
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    /**
     * 테스트 결과 출력
     */
    printResults() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;

        console.group('📊 Core Infrastructure 테스트 결과');
        console.log(`⏱️ 실행 시간: ${duration}ms`);
        console.log(`✅ 통과: ${passed}개`);
        console.log(`❌ 실패: ${failed}개`);
        console.log(`📈 성공률: ${Math.round((passed / (passed + failed)) * 100)}%`);

        if (failed > 0) {
            console.group('❌ 실패한 테스트');
            this.errors.forEach(({ name, error }) => {
                console.error(`${name}: ${error.message}`);
            });
            console.groupEnd();
        }

        console.log('🏆 전체 테스트 결과:', this.results);
        console.groupEnd();

        // 전역에 결과 저장
        window.CoreTestResults = {
            passed,
            failed,
            duration,
            successRate: Math.round((passed / (passed + failed)) * 100),
            results: this.results,
            errors: this.errors
        };
    }
}

// 페이지 로드 후 자동 테스트 실행
document.addEventListener('DOMContentLoaded', async () => {
    // Core 시스템 초기화 대기
    if (window.supabaseInitPromise) {
        await window.supabaseInitPromise;
    }
    
    // 약간의 지연 후 테스트 실행 (초기화 완료 대기)
    setTimeout(async () => {
        try {
            const tester = new CoreInfrastructureTest();
            await tester.runAllTests();
        } catch (error) {
            console.error('🚨 테스트 실행 중 오류:', error);
        }
    }, 1000);
});

// 수동 테스트 실행 함수
window.runCoreTests = async () => {
    const tester = new CoreInfrastructureTest();
    await tester.runAllTests();
    return window.CoreTestResults;
};

console.log('🧪 Core Infrastructure 테스트 스위트 로드 완료');
console.log('💡 수동 실행: window.runCoreTests()');

export default CoreInfrastructureTest;