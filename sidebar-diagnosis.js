// 사이드바 문제 진단을 위한 유틸리티
window.sidebarDiagnosis = {
    // 현재 사이드바 상태 확인
    checkStatus: function () {
        console.log('=== 사이드바 상태 진단 ===');

        const buttons = document.querySelectorAll('.nav-category-button');
        const categories = document.querySelectorAll('.nav-category');
        const sections = document.querySelectorAll('.nav-section');

        console.log(`카테고리 버튼: ${buttons.length}개`);
        console.log(`카테고리: ${categories.length}개`);
        console.log(`섹션: ${sections.length}개`);

        // 각 버튼의 이벤트 리스너 확인
        buttons.forEach((btn, index) => {
            const hasClick = btn.onclick !== null;
            const category = btn.closest('.nav-category');
            const isActive = category.classList.contains('active');
            console.log(`버튼 ${index + 1}: 클릭이벤트=${hasClick}, active=${isActive}`);
        });

        // 활성화된 카테고리 확인
        const activeCategories = document.querySelectorAll('.nav-category.active');
        console.log(`현재 활성화된 카테고리: ${activeCategories.length}개`);

        return {
            buttons: buttons.length,
            categories: categories.length,
            activeCategories: activeCategories.length,
            initialized: window.debugSidebar ? window.debugSidebar.isInitialized() : false,
        };
    },

    // 사이드바 강제 재초기화
    forceReinit: function () {
        console.log('=== 사이드바 강제 재초기화 ===');
        if (window.debugSidebar) {
            window.debugSidebar.reinitialize();
        } else {
            console.log('디버깅 사이드바 스크립트가 로드되지 않음');
        }
    },

    // 특정 카테고리 강제 토글
    toggleCategory: function (index) {
        const buttons = document.querySelectorAll('.nav-category-button');
        if (buttons[index]) {
            console.log(`카테고리 ${index + 1} 강제 클릭`);
            buttons[index].click();
        } else {
            console.log(`카테고리 ${index + 1}을 찾을 수 없음`);
        }
    },

    // 모든 카테고리 닫기
    closeAll: function () {
        document.querySelectorAll('.nav-category').forEach((cat) => {
            cat.classList.remove('active');
        });
        document.querySelectorAll('.nav-section').forEach((sec) => {
            sec.classList.remove('active', 'next-active');
        });
        console.log('모든 카테고리 닫힘');
    },

    // CSS 충돌 확인
    checkCSS: function () {
        const testElement = document.createElement('div');
        testElement.className = 'nav-category-button';
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        document.body.appendChild(testElement);

        const styles = getComputedStyle(testElement);
        console.log('=== CSS 상태 확인 ===');
        console.log(`pointer-events: ${styles.pointerEvents}`);
        console.log(`display: ${styles.display}`);
        console.log(`visibility: ${styles.visibility}`);

        document.body.removeChild(testElement);
    },

    // 전체 진단 실행
    fullDiagnosis: function () {
        console.clear();
        console.log('🔍 사이드바 전체 진단 시작');

        const status = this.checkStatus();
        this.checkCSS();

        // 자동 수정 제안
        console.log('\n💡 수정 제안:');

        if (status.buttons === 0) {
            console.log('❌ 카테고리 버튼이 없습니다. HTML 구조를 확인하세요.');
        }

        if (!status.initialized) {
            console.log('⚠️ 사이드바가 초기화되지 않았습니다. forceReinit() 실행을 권장합니다.');
        }

        if (status.activeCategories > 1) {
            console.log(
                '⚠️ 여러 카테고리가 동시에 활성화되어 있습니다. closeAll() 실행을 권장합니다.'
            );
        }

        console.log('\n🛠️ 사용 가능한 명령어:');
        console.log('sidebarDiagnosis.forceReinit() - 강제 재초기화');
        console.log('sidebarDiagnosis.toggleCategory(0) - 첫 번째 카테고리 토글');
        console.log('sidebarDiagnosis.closeAll() - 모든 카테고리 닫기');

        return status;
    },
};

// 페이지 로드 후 자동 진단 (개발용)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('📋 자동 사이드바 진단 (3초 후 실행)');
        console.log('수동 진단: sidebarDiagnosis.fullDiagnosis()');
    }, 3000);
});
