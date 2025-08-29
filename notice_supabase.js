// 공지사항 페이지 - Supabase 연동 버전
// mockNotices 대신 실제 데이터베이스에서 데이터 가져오기

// 전역 변수
let currentPage = 1;
let currentNoticeIndex = 0;
let currentFilteredNotices = [];
const itemsPerPage = 10;
let filteredNotices = [];
let allNotices = [];
let currentCategory = '전체';
let currentSearch = '';

// 권한 체크
let userRole = 'user';
let hasWritePermission = false;

// DOM 요소
let searchInput, categoryTabs, noticeList, pagination, writeNoticeBtn;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // DOM 요소 초기화
        searchInput = document.getElementById('searchInput');
        categoryTabs = document.querySelectorAll('.checkbox-tab');
        noticeList = document.getElementById('noticeList');
        pagination = document.getElementById('pagination');
        writeNoticeBtn = document.getElementById('writeNoticeBtn');

        console.log('🔄 공지사항 페이지 초기화 중...');

        // Supabase 서비스 대기
        await waitForServices();
        
        // 사용자 권한 확인
        await checkUserPermission();
        
        // 플로팅 글쓰기 버튼 표시/숨김 처리
        setupWriteButton();
        
        // 이벤트 리스너 설정
        setupEventListeners();
        
        // 초기 데이터 로드
        await loadNotices();
        
        console.log('✅ 공지사항 페이지 초기화 완료');
        
    } catch (error) {
        console.error('❌ 페이지 초기화 실패:', error);
        showErrorMessage('페이지 로딩 중 오류가 발생했습니다.');
    }
});

/**
 * 서비스 대기
 */
async function waitForServices() {
    let attempts = 0;
    const maxAttempts = 100; // 10초 대기
    
    while ((!window.noticeService || !window.authService) && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!window.noticeService) {
        throw new Error('NoticeService를 로드할 수 없습니다.');
    }
    
    if (!window.authService) {
        console.warn('AuthService를 로드할 수 없습니다. 권한 체크가 제한됩니다.');
    }
}

/**
 * 사용자 권한 확인
 */
async function checkUserPermission() {
    try {
        // AuthService를 통한 실제 권한 확인
        if (window.authService && typeof authService.getLocalUser === 'function') {
            const localUser = authService.getLocalUser();
            const isLoggedIn = authService.isLoggedIn();
            const isAdmin = authService.isAdmin();
            
            if (isLoggedIn && localUser && localUser.role) {
                userRole = localUser.role;
                // 오직 admin 역할만 쓰기 권한 부여
                hasWritePermission = userRole === 'admin';
                console.log(`✅ 로그인 사용자: ${localUser.username || localUser.email} (${userRole})`);
            } else if (localUser && Object.keys(localUser).length > 0) {
                // 로컬 스토리지에는 있지만 로그인 상태가 아닌 경우
                userRole = localUser.role || 'user';
                hasWritePermission = isAdmin;
                console.log(`ℹ️ 로컬 사용자: ${userRole}, 관리자: ${isAdmin}`);
            } else {
                // 비로그인 사용자
                userRole = 'user';
                hasWritePermission = false;
                console.log('ℹ️ 비로그인 사용자');
            }
        } else {
            // AuthService가 없는 경우 권한 없음으로 처리
            userRole = 'user';
            hasWritePermission = false;
            console.warn('⚠️ AuthService를 사용할 수 없어 일반 사용자로 처리됩니다.');
        }

        console.log(`🔐 최종 권한: 역할=${userRole}, 쓰기권한=${hasWritePermission}`);
        
    } catch (error) {
        console.error('❌ 권한 확인 실패:', error);
        userRole = 'user';
        hasWritePermission = false;
    }
}

/**
 * 플로팅 글쓰기 버튼 설정
 */
function setupWriteButton() {
    if (writeNoticeBtn) {
        if (hasWritePermission) {
            writeNoticeBtn.style.display = 'block';
            console.log('✅ 관리자 권한 확인 - 글쓰기 버튼 표시');
        } else {
            writeNoticeBtn.style.display = 'none';
            console.log('ℹ️ 일반 사용자 - 글쓰기 버튼 숨김');
        }
    }
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // 검색 기능
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // 카테고리 필터
    if (categoryTabs) {
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', handleCategoryChange);
        });
    }

    // 새로고침 버튼
    const refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => loadNotices(true));
    }

    // 플로팅 글쓰기 버튼
    if (writeNoticeBtn && hasWritePermission) {
        writeNoticeBtn.addEventListener('click', openWriteModal);
    }
    
    // 글쓰기 모달 닫기 버튼
    const writeModalClose = document.getElementById('writeModalClose');
    if (writeModalClose) {
        writeModalClose.addEventListener('click', closeWriteModal);
    }
}

/**
 * 공지사항 데이터 로드
 */
async function loadNotices(forceRefresh = false) {
    try {
        showLoadingState();

        const response = await noticeService.getNotices({
            page: currentPage,
            limit: itemsPerPage,
            category: currentCategory === '전체' ? null : currentCategory,
            search: currentSearch.trim() || null
        });

        if (response.error) {
            throw new Error(response.error);
        }

        allNotices = response.data || [];
        filteredNotices = [...allNotices];
        
        renderNoticeList();
        renderPagination(response.totalPages || 1, response.total || 0);
        
        console.log(`✅ 공지사항 ${allNotices.length}개 로드 완료`);
        
    } catch (error) {
        console.error('공지사항 로드 실패:', error);
        showErrorMessage('공지사항을 불러오는데 실패했습니다.');
        renderEmptyState();
    }
}

/**
 * 검색 처리
 */
async function handleSearch(e) {
    currentSearch = e.target.value;
    currentPage = 1;
    await loadNotices();
}

/**
 * 카테고리 변경 처리
 */
async function handleCategoryChange(e) {
    e.preventDefault();
    
    // 탭 활성화 상태 변경
    categoryTabs.forEach(tab => tab.classList.remove('active'));
    e.target.classList.add('active');
    
    currentCategory = e.target.textContent.trim();
    currentPage = 1;
    
    await loadNotices();
}

/**
 * 공지사항 목록 렌더링
 */
function renderNoticeList() {
    if (!noticeList) return;

    if (!filteredNotices || filteredNotices.length === 0) {
        renderEmptyState();
        return;
    }

    noticeList.innerHTML = filteredNotices.map((notice, index) => `
        <div class="notice-item ${notice.is_pinned ? 'pinned' : ''}" onclick="openNoticeModal(${index})">
            <div class="notice-header">
                <div class="notice-header-left">
                    <div class="notice-badges">
                        <span class="notice-badge category-${notice.category}">${notice.category}</span>
                        ${notice.is_pinned ? '<span class="notice-badge pinned">📌 고정</span>' : ''}
                        ${notice.isNew ? '<span class="notice-badge new">NEW</span>' : ''}
                    </div>
                    <h3 class="notice-item-title">${escapeHtml(notice.title)}</h3>
                    <p class="notice-item-content">${escapeHtml(notice.content ? notice.content.substring(0, 100) + (notice.content.length > 100 ? '...' : '') : '')}</p>
                </div>
                <div class="notice-header-right">
                    <div class="notice-date">${notice.createdAt}</div>
                    <div class="notice-item-meta">
                        <span><i class="fas fa-user"></i> ${notice.team}</span>
                        <span><i class="fas fa-eye"></i> ${notice.view_count.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * 빈 상태 렌더링
 */
function renderEmptyState() {
    if (!noticeList) return;
    
    noticeList.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📢</div>
            <div class="empty-title">공지사항이 없습니다</div>
            <div class="empty-description">
                ${currentSearch ? '검색 결과가 없습니다.' : '등록된 공지사항이 없습니다.'}
            </div>
        </div>
    `;
}

/**
 * 로딩 상태 표시
 */
function showLoadingState() {
    if (!noticeList) return;
    
    noticeList.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <div>공지사항을 불러오는 중...</div>
        </div>
    `;
}

/**
 * 페이지네이션 렌더링
 */
function renderPagination(totalPages, totalCount) {
    if (!pagination || totalPages <= 1) {
        if (pagination) pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // 이전 페이지 버튼
    paginationHTML += `
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}>이전</button>
    `;

    // 페이지 번호 버튼들
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">${i}</button>
        `;
    }

    // 다음 페이지 버튼
    paginationHTML += `
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}>다음</button>
    `;

    pagination.innerHTML = `
        <div class="pagination-info">
            총 ${totalCount.toLocaleString()}개 공지사항
        </div>
        <div class="pagination-buttons">
            ${paginationHTML}
        </div>
    `;
}

/**
 * 페이지 변경
 */
async function changePage(page) {
    if (page < 1 || page === currentPage) return;
    
    currentPage = page;
    await loadNotices();
    
    // 스크롤을 맨 위로
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 공지사항 모달 열기
 */
async function openNoticeModal(index) {
    try {
        const notice = filteredNotices[index];
        if (!notice) return;

        // 상세 정보 로드 (조회수 증가 포함)
        const response = await noticeService.getNoticeById(notice.id, true);
        
        if (response.error) {
            throw new Error(response.error);
        }

        const detailNotice = response.data;
        if (!detailNotice) {
            throw new Error('공지사항을 찾을 수 없습니다.');
        }

        // 모달 내용 설정
        const modal = document.getElementById('noticeModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        const modalMeta = document.getElementById('modalMeta');

        if (modalTitle) modalTitle.textContent = detailNotice.title;
        if (modalContent) modalContent.innerHTML = formatContent(detailNotice.content);
        if (modalMeta) {
            modalMeta.innerHTML = `
                <div class="modal-meta-item">
                    <span class="meta-label">카테고리:</span>
                    <span class="meta-value category-${detailNotice.category}">${detailNotice.category}</span>
                </div>
                <div class="modal-meta-item">
                    <span class="meta-label">작성자:</span>
                    <span class="meta-value">${detailNotice.authorName}</span>
                </div>
                <div class="modal-meta-item">
                    <span class="meta-label">작성일:</span>
                    <span class="meta-value">${detailNotice.createdAt}</span>
                </div>
                <div class="modal-meta-item">
                    <span class="meta-label">조회수:</span>
                    <span class="meta-value">${(detailNotice.view_count + 1).toLocaleString()}</span>
                </div>
            `;
        }

        // 관리자 메뉴 설정
        const adminActions = document.querySelector('.admin-actions');
        if (adminActions && hasWritePermission) {
            adminActions.style.display = 'block';
            adminActions.innerHTML = `
                <button class="admin-btn edit-btn" onclick="editNotice('${detailNotice.id}')">수정</button>
                <button class="admin-btn delete-btn" onclick="deleteNotice('${detailNotice.id}')">삭제</button>
            `;
        } else if (adminActions) {
            adminActions.style.display = 'none';
        }

        // 모달 표시
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // 목록에서 조회수 업데이트 (UI만)
        filteredNotices[index].view_count = detailNotice.view_count + 1;
        
    } catch (error) {
        console.error('공지사항 상세 조회 실패:', error);
        showErrorMessage('공지사항을 불러오는데 실패했습니다.');
    }
}

/**
 * 공지사항 모달 닫기
 */
function closeNoticeModal() {
    const modal = document.getElementById('noticeModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

/**
 * 글쓰기 모달 열기
 */
function openWriteModal() {
    if (!hasWritePermission) {
        showErrorMessage('글쓰기 권한이 없습니다.');
        return;
    }

    const modal = document.getElementById('writeModal');
    if (modal) {
        // 폼 초기화
        const form = document.getElementById('noticeForm');
        if (form) form.reset();
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('✅ 글쓰기 모달 열림');
    } else {
        console.error('❌ 글쓰기 모달을 찾을 수 없습니다.');
    }
}

/**
 * 글쓰기 모달 닫기
 */
function closeWriteModal() {
    const modal = document.getElementById('writeModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

/**
 * 공지사항 저장
 */
async function saveNotice() {
    try {
        if (!hasWritePermission) {
            throw new Error('권한이 없습니다.');
        }

        const form = document.getElementById('noticeForm');
        if (!form) throw new Error('폼을 찾을 수 없습니다.');

        const formData = new FormData(form);
        const noticeData = {
            title: formData.get('title')?.trim(),
            content: formData.get('content')?.trim(),
            category: formData.get('category'),
            team: formData.get('team') || '운영팀',
            isPinned: formData.get('pinned') === 'on',
            authorId: authService?.getLocalUser()?.id
        };

        // 유효성 검사
        if (!noticeData.title) throw new Error('제목을 입력해주세요.');
        if (!noticeData.content) throw new Error('내용을 입력해주세요.');
        if (!noticeData.category) throw new Error('카테고리를 선택해주세요.');
        if (!noticeData.team) throw new Error('작성 팀을 선택해주세요.');

        console.log('📝 공지사항 저장 시도:', noticeData);

        // 저장
        const response = await noticeService.createNotice(noticeData);
        
        if (response.error) {
            throw new Error(response.error);
        }

        showSuccessMessage('공지사항이 등록되었습니다.');
        closeWriteModal();
        await loadNotices(true);
        
    } catch (error) {
        console.error('❌ 공지사항 저장 실패:', error);
        showErrorMessage(error.message || '저장 중 오류가 발생했습니다.');
    }
}

/**
 * 공지사항 삭제
 */
async function deleteNotice(noticeId) {
    try {
        if (!hasWritePermission) {
            throw new Error('권한이 없습니다.');
        }

        if (!confirm('정말로 삭제하시겠습니까?')) return;

        const response = await noticeService.deleteNotice(noticeId);
        
        if (response.error) {
            throw new Error(response.error);
        }

        showSuccessMessage('공지사항이 삭제되었습니다.');
        closeNoticeModal();
        await loadNotices(true);
        
    } catch (error) {
        console.error('공지사항 삭제 실패:', error);
        showErrorMessage(error.message || '삭제 중 오류가 발생했습니다.');
    }
}

/**
 * 유틸리티 함수들
 */

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 내용 포맷팅
function formatContent(content) {
    return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 메시지 표시 함수들
function showErrorMessage(message) {
    console.error('Error:', message);
    // Toast 메시지 또는 alert 표시
    if (window.toast && typeof toast.error === 'function') {
        toast.error(message);
    } else {
        alert(message);
    }
}

function showSuccessMessage(message) {
    console.log('Success:', message);
    // Toast 메시지 또는 alert 표시
    if (window.toast && typeof toast.success === 'function') {
        toast.success(message);
    } else {
        alert(message);
    }
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeNoticeModal();
        closeWriteModal();
    }
});

// 모달 외부 클릭으로 닫기
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeNoticeModal();
        closeWriteModal();
    }
});