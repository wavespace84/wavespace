// 포인트 정책 페이지 JavaScript

class PointsPolicyManager {
    constructor() {
        this.adminPassword = 'admin1234'; // 실제 환경에서는 더 안전한 방식으로 관리
        this.isAdminMode = false;
        this.originalData = null;
        this.currentData = null;
        this.sessionTimeout = null;
        
        this.init();
    }

    init() {
        this.loadPolicyData();
        this.setupEventListeners();
        this.renderTable();
        this.setupCategoryFilter();
    }

    // 새로운 테이블 데이터 구조
    getDefaultPolicyData() {
        return {
            lastUpdated: new Date().toISOString().split('T')[0],
            version: "2.0.0",
            
            // 이용권한 테이블 데이터
            permissions: [
                // 일반활동 관련
                { category: "일반활동", item: "첫로그인", summary: "2,500point", read: "○", write: "-", comment: "-", delete: "-", upload: "-", download: "-" },
                { category: "", item: "지인추천", summary: "1,500point", read: "○", write: "-", comment: "-", delete: "-", upload: "-", download: "-" },
                { category: "", item: "공지읽기", summary: "500point", read: "○", write: "-", comment: "-", delete: "-", upload: "-", download: "-" },
                { category: "", item: "이벤트제안", summary: "(채택 시)", read: "-", write: "○", comment: "-", delete: "-", upload: "-", download: "-" },
                
                // 커뮤니티
                { category: "커뮤니티", item: "명예의전당", summary: "전체 사용자", read: "○", write: "-", comment: "-", delete: "-", upload: "-", download: "-" },
                { category: "", item: "출석체크", summary: "전체 사용자", read: "○", write: "-", comment: "-", delete: "-", upload: "-", download: "-" },
                { category: "", item: "자유게시판", summary: "전체 사용자", read: "○", write: "○", comment: "○", delete: "○", upload: "○", download: "-" },
                { category: "", item: "유머재미", summary: "전체 사용자", read: "○", write: "○", comment: "○", delete: "○", upload: "○", download: "-" },
                { category: "", item: "질문답변", summary: "전체 사용자", read: "○", write: "○", comment: "○", delete: "○", upload: "○", download: "△질문자" },
                
                // 구인구직
                { category: "구인구직", item: "분양기획", summary: "기획파트", read: "△기획", write: "△기획", comment: "△기획", delete: "△기획", upload: "-", download: "-" },
                { category: "", item: "분양영업", summary: "전체 사용자", read: "○", write: "○", comment: "○", delete: "○", upload: "-", download: "-" },
                { category: "", item: "AI 매칭", summary: "전체 사용자", read: "○", write: "○", comment: "○", delete: "○", upload: "-", download: "-" },
                
                // 분양자료
                { category: "분양자료", item: "데이터센터", summary: "전체 사용자", read: "○", write: "-", comment: "-", delete: "-", upload: "-", download: "△Plus" },
                { category: "", item: "시장조사서", summary: "실무자파트", read: "△실무자", write: "△실무자", comment: "△실무자", delete: "△승인", upload: "-", download: "△실무자" },
                { category: "", item: "제안서", summary: "실무자파트", read: "△실무자", write: "△실무자", comment: "△실무자", delete: "△승인", upload: "-", download: "△실무자" },
                { category: "", item: "교육자료", summary: "전체 사용자", read: "○", write: "○", comment: "○", delete: "△승인", upload: "-", download: "○" },
                { category: "", item: "정책 / 기타자료", summary: "전체 사용자", read: "○", write: "○", comment: "○", delete: "△승인", upload: "-", download: "○" },
                { category: "", item: "AI 보고서", summary: "전체 사용자", read: "○", write: "-", comment: "-", delete: "-", upload: "-", download: "△Plus" },
                
                // 포인트
                { category: "포인트", item: "충전하기", summary: "유료", read: "-", write: "-", comment: "-", delete: "-", upload: "-", download: "-" },
                { category: "", item: "상점", summary: "전체 사용자", read: "○", write: "-", comment: "-", delete: "-", upload: "-", download: "-" },
                
                // 미니게임
                { category: "미니게임", item: "모든게임", summary: "전체 사용자", read: "○", write: "-", comment: "-", delete: "-", upload: "-", download: "-" }
            ],
            
            // 포인트 기준 테이블 데이터
            points: [
                // 일반활동 관련
                { category: "일반활동", item: "첫로그인", summary: "2,500point", read: "○", write: "-", comment: "-", delete: "-", upload: "-", download: "-", link: "" },
                { category: "", item: "지인추천", summary: "1,500point", read: "○", write: "-", comment: "-", delete: "-", upload: "-", download: "-", link: "" },
                { category: "", item: "공지읽기", summary: "500point", read: "○", write: "-", comment: "-", delete: "-", upload: "-", download: "-", link: "" },
                { category: "", item: "이벤트제안", summary: "(채택 시)", read: "-", write: "○", comment: "-", delete: "-", upload: "-", download: "-", link: "" },
                
                // 커뮤니티
                { category: "커뮤니티", item: "명예의전당", summary: "-", read: "-", write: "-", comment: "-", delete: "-", upload: "-", download: "-", link: "hall-of-fame.html" },
                { category: "", item: "출석체크", summary: "~1,000point", read: "-", write: "○", comment: "-", delete: "-", upload: "-", download: "-", link: "attendance.html" },
                { category: "", item: "자유게시판", summary: "무한획득", read: "-", write: "100p", comment: "20p", delete: "-", upload: "-", download: "-", link: "forum.html" },
                { category: "", item: "유머재미", summary: "무한획득", read: "-", write: "50p", comment: "10p", delete: "-", upload: "-", download: "-", link: "humor.html" },
                { category: "", item: "질문답변", summary: "무한획득", read: "-", write: "(설정차감)", comment: "(채택획득)", delete: "-", upload: "-", download: "-", link: "qna.html" },
                
                // 구인구직
                { category: "구인구직", item: "분양기획", summary: "무료", read: "-", write: "-", comment: "-", delete: "-", upload: "-", download: "-", link: "planning-recruitment.html" },
                { category: "", item: "분양영업", summary: "무료", read: "-", write: "-", comment: "-", delete: "-", upload: "-", download: "-", link: "sales-recruit.html" },
                { category: "", item: "AI 매칭", summary: "무료", read: "-", write: "-", comment: "-", delete: "-", upload: "-", download: "-", link: "ai-matching.html" },
                
                // 분양자료
                { category: "분양자료", item: "데이터센터", summary: "부분유료", read: "-", write: "-", comment: "-", delete: "-", upload: "-", download: "△Plus", link: "data-center.html" },
                { category: "", item: "시장조사서", summary: "무한획득", read: "-", write: "-", comment: "-", delete: "-", upload: "+5,000p", download: "-12,000p", link: "market-research.html" },
                { category: "", item: "제안서", summary: "무한획득", read: "-", write: "-", comment: "-", delete: "-", upload: "+7,000p", download: "-17,000p", link: "proposal.html" },
                { category: "", item: "교육자료", summary: "무한획득", read: "-", write: "-", comment: "-", delete: "-", upload: "+3,500p", download: "-8,500p", link: "education.html" },
                { category: "", item: "정책 / 기타자료", summary: "무한획득", read: "-", write: "-", comment: "-", delete: "-", upload: "-", download: "-", link: "other-docs.html" },
                { category: "", item: "AI 보고서", summary: "부분유료", read: "-", write: "-", comment: "-", delete: "-", upload: "-", download: "△Plus", link: "ai-report.html" },
                
                // 포인트
                { category: "포인트", item: "충전하기", summary: "유료", read: "-", write: "-", comment: "-", delete: "-", upload: "-", download: "-", link: "points-charge.html" },
                { category: "", item: "상점", summary: "포인트사용", read: "-", write: "-", comment: "-", delete: "-", upload: "-", download: "△Plus", link: "points-shop.html" },
                
                // 미니게임
                { category: "미니게임", item: "모든게임", summary: "게임별", merged: true, mergedText: "모든 게임에서 포인트가 획득/손실될 수 있습니다", link: "#" }
            ]
        };
    }

    // 데이터 로드 (localStorage에서)
    loadPolicyData() {
        try {
            // 강제로 localStorage 초기화 (카테고리 변경 반영)
            localStorage.removeItem('waveSpacePointsPolicy');
            
            const storedData = localStorage.getItem('waveSpacePointsPolicy');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                // 데이터 구조 검증
                if (parsedData && parsedData.permissions && parsedData.points) {
                    this.currentData = parsedData;
                } else {
                    // 구조가 올바르지 않으면 기본값으로 재설정
                    console.log('[POINTS-POLICY] 저장된 데이터 구조가 올바르지 않아 초기화합니다.');
                    this.currentData = this.getDefaultPolicyData();
                    this.savePolicyData();
                }
            } else {
                this.currentData = this.getDefaultPolicyData();
                this.savePolicyData();
            }
            this.originalData = JSON.parse(JSON.stringify(this.currentData));
        } catch (error) {
            console.error('정책 데이터 로드 실패:', error);
            this.currentData = this.getDefaultPolicyData();
            this.originalData = JSON.parse(JSON.stringify(this.currentData));
        }
    }

    // 데이터 저장 (localStorage에)
    savePolicyData() {
        try {
            this.currentData.lastUpdated = new Date().toISOString().split('T')[0];
            localStorage.setItem('waveSpacePointsPolicy', JSON.stringify(this.currentData));
            this.originalData = JSON.parse(JSON.stringify(this.currentData));
            this.showNotification('정책이 저장되었습니다.', 'success');
        } catch (error) {
            console.error('정책 데이터 저장 실패:', error);
            this.showNotification('저장에 실패했습니다.', 'error');
        }
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 관리자 권한 체크 후 자동 활성화
        if (this.isAdmin()) {
            this.enableAdminMode();
        }

        // 카테고리 필터
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filterByCategory(e.target.value);
        });
    }

    // 관리자 권한 체크
    isAdmin() {
        // 실제 구현시에는 사용자 세션이나 권한을 체크
        // 현재는 localStorage를 이용한 간단한 체크
        const userRole = localStorage.getItem('userRole');
        return userRole === 'admin' || userRole === 'manager';
    }

    // 관리자 모드 자동 활성화
    enableAdminMode() {
        this.adminMode = true;
        document.getElementById('adminModeIndicator').style.display = 'block';
        
        // 관리자 모드 컨트롤 이벤트 추가
        document.getElementById('saveChangesBtn').addEventListener('click', () => {
            this.savePolicyData();
        });

        document.getElementById('cancelChangesBtn').addEventListener('click', () => {
            this.cancelChanges();
        });

        document.getElementById('exitAdminBtn').addEventListener('click', () => {
            this.exitAdminMode();
        });
    }

    // 관리자 모드 종료
    exitAdminMode() {
        this.adminMode = false;
        document.body.classList.remove('admin-mode');
        document.getElementById('adminModeIndicator').style.display = 'none';
        
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }

        this.renderTable();
        this.showNotification('관리자 모드가 종료되었습니다.', 'info');
    }

    // 변경사항 취소
    cancelChanges() {
        if (confirm('변경사항을 취소하시겠습니까?')) {
            this.currentData = JSON.parse(JSON.stringify(this.originalData));
            this.renderTable();
            this.showNotification('변경사항이 취소되었습니다.', 'info');
        }
    }

    // 테이블 렌더링
    renderTable() {
        this.renderPermissionsTable();
        this.renderPointsTable();
    }

    // 이용권한 테이블 렌더링
    renderPermissionsTable() {
        const tbody = document.getElementById('permissionsTableBody');
        tbody.innerHTML = '';

        // 데이터 유효성 검사
        if (!this.currentData || !this.currentData.permissions) {
            console.error('[POINTS-POLICY] currentData 또는 permissions 배열이 없습니다:', this.currentData);
            return;
        }

        let prevCategory = '';
        this.currentData.permissions.forEach((item, index) => {
            const row = document.createElement('tr');
            
            // 카테고리가 있는 경우 category-row 클래스 추가
            if (item.category) {
                row.classList.add('category-row');
                
                // 카테고리가 변경된 경우 첫 번째 행 표시
                if (item.category !== prevCategory && index > 0) {
                    row.classList.add('category-first-row');
                }
                prevCategory = item.category;
            } else {
                // 동일 카테고리 내 행
                row.classList.add('same-category-row');
            }

            // 각 셀 생성
            const cells = [
                this.createCell(item.category, 'category'),
                this.createCell(item.item, 'item'),
                this.createCell(item.summary, 'summary'),
                this.createPermissionCell(item.read),
                this.createPermissionCell(item.write),
                this.createPermissionCell(item.comment),
                this.createPermissionCell(item.delete),
                this.createPermissionCell(item.upload),
                this.createPermissionCell(item.download)
            ];

            cells.forEach(cell => row.appendChild(cell));
            tbody.appendChild(row);
        });
    }

    // 포인트 기준 테이블 렌더링
    renderPointsTable() {
        const tbody = document.getElementById('pointsTableBody');
        tbody.innerHTML = '';

        // 데이터 유효성 검사
        if (!this.currentData || !this.currentData.points) {
            console.error('[POINTS-POLICY] currentData 또는 points 배열이 없습니다:', this.currentData);
            return;
        }

        let prevCategory = '';
        this.currentData.points.forEach((item, index) => {
            const row = document.createElement('tr');
            
            // 카테고리가 있는 경우 category-row 클래스 추가
            if (item.category) {
                row.classList.add('category-row');
                
                // 카테고리가 변경된 경우 첫 번째 행 표시
                if (item.category !== prevCategory && index > 0) {
                    row.classList.add('category-first-row');
                }
                prevCategory = item.category;
            } else {
                // 동일 카테고리 내 행
                row.classList.add('same-category-row');
            }

            // 각 셀 생성
            const categoryCell = this.createCell(item.category, 'category');
            if (item.link && item.category) {
                categoryCell.classList.add('clickable-category');
                categoryCell.addEventListener('click', () => {
                    if (item.link !== '#') {
                        window.location.href = item.link;
                    }
                });
            }

            // 미니게임 특별 처리 (셀 병합)
            if (item.merged) {
                const cells = [
                    categoryCell,
                    this.createCell(item.item, 'item'),
                    this.createCell(item.summary, 'summary')
                ];
                
                // 병합된 셀 생성 (읽기~다운로드 6개 컬럼)
                const mergedCell = document.createElement('td');
                mergedCell.colSpan = 6;
                mergedCell.style.textAlign = 'center';
                mergedCell.style.fontStyle = 'italic';
                mergedCell.style.color = 'var(--gray-600)';
                mergedCell.style.padding = '8px 12px';
                mergedCell.style.fontSize = '12px';
                mergedCell.style.lineHeight = '1.2';
                mergedCell.textContent = item.mergedText;
                
                cells.push(mergedCell);
                cells.forEach(cell => row.appendChild(cell));
            } else {
                // 기존 로직
                const cells = [
                    categoryCell,
                    this.createCell(item.item, 'item'),
                    this.createCell(item.summary, 'summary'),
                    this.createPointCell(item.read),
                    this.createPointCell(item.write),
                    this.createPointCell(item.comment),
                    this.createPointCell(item.delete),
                    this.createPointCell(item.upload),
                    this.createPointCell(item.download)
                ];
                cells.forEach(cell => row.appendChild(cell));
            }

            tbody.appendChild(row);
        });
    }

    // 일반 셀 생성
    createCell(content, type) {
        const cell = document.createElement('td');
        cell.textContent = content;
        if (type === 'category' && content) {
            cell.classList.add('category-cell');
        }
        return cell;
    }

    // 권한 셀 생성
    createPermissionCell(value) {
        const cell = document.createElement('td');
        const symbol = document.createElement('span');
        symbol.className = 'permission-symbol';
        symbol.textContent = value;
        
        if (value === '○') {
            symbol.classList.add('permission-all');
        } else if (value.startsWith('△')) {
            symbol.classList.add('permission-partial');
            // △Plus 특별 처리
            if (value === '△Plus') {
                symbol.classList.add('plus-badge');
            }
        } else {
            symbol.classList.add('permission-none');
        }
        
        cell.appendChild(symbol);
        return cell;
    }

    // 포인트 셀 생성
    createPointCell(value) {
        const cell = document.createElement('td');
        const pointValue = document.createElement('span');
        pointValue.className = 'point-value';
        pointValue.textContent = value;
        
        if (value.includes('+') && value.includes('p')) {
            pointValue.classList.add('point-positive');
        } else if (value.includes('-') && value.includes('p')) {
            pointValue.classList.add('point-negative');
        } else if (value === '○') {
            pointValue.className = 'permission-symbol permission-all';
        } else if (value.startsWith('△')) {
            pointValue.className = 'permission-symbol permission-partial';
            // △Plus 특별 처리
            if (value === '△Plus') {
                pointValue.classList.add('plus-badge');
            }
        } else if (value === '-') {
            pointValue.className = 'permission-symbol permission-none';
        } else {
            pointValue.classList.add('point-special');
        }
        
        cell.appendChild(pointValue);
        return cell;
    }


    // 카테고리 필터 설정
    setupCategoryFilter() {
        const select = document.getElementById('categoryFilter');
        select.innerHTML = '<option value="all">전체 카테고리</option>';
        
        // 데이터 유효성 검사
        if (!this.currentData || !this.currentData.permissions) {
            console.error('[POINTS-POLICY] setupCategoryFilter - currentData 또는 permissions 배열이 없습니다:', this.currentData);
            return;
        }
        
        // 고유한 카테고리 목록 추출
        const categories = new Set();
        this.currentData.permissions.forEach(item => {
            if (item.category) categories.add(item.category);
        });
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }

    // 카테고리별 필터링
    filterByCategory(categoryName) {
        const permissionRows = document.querySelectorAll('#permissionsTableBody tr');
        const pointRows = document.querySelectorAll('#pointsTableBody tr');

        // 기존 visible-last-row 클래스 제거
        document.querySelectorAll('.visible-last-row').forEach(row => {
            row.classList.remove('visible-last-row');
        });

        // 카테고리 그룹 매핑
        const categoryGroups = {
            '일반활동': ['첫로그인', '지인추천', '공지읽기', '이벤트제안'],
            '커뮤니티': ['명예의전당', '출석체크', '자유게시판', '유머재미', '질문답변'],
            '구인구직': ['분양기획', '분양영업', 'AI 매칭'],
            '분양자료': ['데이터센터', '시장조사서', '제안서', '교육자료', '정책 / 기타자료', 'AI 보고서'],
            '포인트': ['충전하기', '상점'],
            '미니게임': ['모든게임']
        };

        [...permissionRows, ...pointRows].forEach(row => {
            if (categoryName === 'all') {
                row.style.display = '';
            } else {
                const categoryCell = row.querySelector('td:first-child');
                const itemCell = row.querySelector('td:nth-child(2)');
                
                let shouldShow = false;
                
                // 직접 카테고리 매치 확인
                if (categoryCell && categoryCell.textContent.trim() === categoryName) {
                    shouldShow = true;
                }
                
                // 그룹 내 항목 매치 확인
                if (!shouldShow && itemCell && categoryGroups[categoryName]) {
                    const itemText = itemCell.textContent.trim();
                    shouldShow = categoryGroups[categoryName].includes(itemText);
                }
                
                row.style.display = shouldShow ? '' : 'none';
            }
        });

        // 각 테이블별로 보이는 마지막 행 찾기 및 클래스 추가
        const visiblePermissionRows = Array.from(permissionRows).filter(row => row.style.display !== 'none');
        const visiblePointRows = Array.from(pointRows).filter(row => row.style.display !== 'none');

        // 마지막 행에 클래스 추가
        if (visiblePermissionRows.length > 0) {
            visiblePermissionRows[visiblePermissionRows.length - 1].classList.add('visible-last-row');
        }
        if (visiblePointRows.length > 0) {
            visiblePointRows[visiblePointRows.length - 1].classList.add('visible-last-row');
        }
    }


    // 알림 표시
    showNotification(message, type = 'info') {
        // 간단한 알림 구현
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: var(--${type === 'success' ? 'success' : type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'primary'}-color);
            color: white;
            border-radius: 6px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.pointsPolicyManager = new PointsPolicyManager();
});

// 필요한 CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(style);

// FAQ 토글 기능 (충전하기 페이지와 동일)
function toggleFaq(button) {
    const faqItem = button.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');
    
    // 모든 FAQ 아이템 닫기
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 클릭한 아이템만 열기 (이미 열려있지 않은 경우)
    if (!isActive) {
        faqItem.classList.add('active');
    }
}