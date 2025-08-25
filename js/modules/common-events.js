// 공통 이벤트 처리 모듈
// 페이지네이션과 필터 클릭 시 화면 움직임 방지

document.addEventListener('DOMContentLoaded', function() {
    // 페이지네이션 링크 처리
    function handlePaginationLinks() {
        document.querySelectorAll('.pagination a, .pagination-underline a, .page-numbers a').forEach(link => {
            // 기존 이벤트 리스너 제거 후 새로 추가
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            newLink.addEventListener('click', function(e) {
                if (this.getAttribute('href') === '#') {
                    e.preventDefault();
                }
            });
        });
    }

    // checkbox-tab 필터 처리
    function handleCheckboxTabs() {
        document.querySelectorAll('.checkbox-tab').forEach(tab => {
            // 이미 처리된 탭은 건너뛰기
            if (tab.dataset.preventDefaultAdded) return;
            
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
            }, true);
            
            tab.dataset.preventDefaultAdded = 'true';
        });
    }

    // 정렬 버튼 처리
    function handleSortButtons() {
        document.querySelectorAll('.sort-btn, .sort-controls button').forEach(btn => {
            // 이미 처리된 버튼은 건너뛰기
            if (btn.dataset.preventDefaultAdded) return;
            
            btn.addEventListener('click', function(e) {
                e.preventDefault();
            }, true);
            
            btn.dataset.preventDefaultAdded = 'true';
        });
    }

    // 초기 실행
    handlePaginationLinks();
    handleCheckboxTabs();
    handleSortButtons();

    // DOM 변경 감지 (동적으로 추가되는 요소 처리)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                handlePaginationLinks();
                handleCheckboxTabs();
                handleSortButtons();
            }
        });
    });

    // body 전체 감시
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Export functions for manual use
window.CommonEvents = {
    preventPaginationDefault: function() {
        document.querySelectorAll('.pagination a, .pagination-underline a, .page-numbers a').forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.getAttribute('href') === '#') {
                    e.preventDefault();
                }
            });
        });
    },
    preventFilterDefault: function() {
        document.querySelectorAll('.checkbox-tab').forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
            }, true);
        });
    }
};