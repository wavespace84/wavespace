// 공지사항 페이지 - 원본 디자인 + Supabase 연동 버전
// 원본 디자인을 유지하면서 실제 데이터베이스에서 데이터 가져오기

// 전역 변수
let currentPage = 1;
let currentNoticeIndex = 0;
let currentFilteredNotices = [];
const itemsPerPage = 10;
let filteredNotices = [];
let allNotices = [];

// 권한 체크
let userRole = 'user';
let hasWritePermission = false;

// DOM 요소
let searchInput, categoryTabs, noticeList, pagination, writeNoticeBtn;

// 카테고리 필터
let selectedCategory = 'all';

// 페이지 로드 시 초기화 - 성능 측정 포함
document.addEventListener('DOMContentLoaded', async () => {
    const pageStartTime = performance.now();
    console.log('🚀 공지사항 페이지 초기화 시작...');
    
    try {
        // DOM 요소 초기화 시간 측정
        const domStartTime = performance.now();
        
        searchInput = document.getElementById('searchInput');
        categoryTabs = document.querySelectorAll('.checkbox-tab');
        noticeList = document.getElementById('noticeList');
        pagination = document.getElementById('paginationContainer');
        writeNoticeBtn = document.getElementById('writeNoticeBtn');

        const domTime = Math.round(performance.now() - domStartTime);
        console.log(`📊 DOM 요소 초기화 완료 (${domTime}ms)`);

        // Supabase 서비스 대기
        const servicesStartTime = performance.now();
        await waitForServices();
        const servicesTime = Math.round(performance.now() - servicesStartTime);
        console.log(`📊 서비스 초기화 완료 (${servicesTime}ms)`);
        
        // 사용자 권한 확인
        const permissionStartTime = performance.now();
        await checkUserPermission();
        const permissionTime = Math.round(performance.now() - permissionStartTime);
        console.log(`📊 권한 확인 완료 (${permissionTime}ms)`);
        
        // UI 설정
        const uiStartTime = performance.now();
        setupWriteButton();
        setupEventListeners();
        const uiTime = Math.round(performance.now() - uiStartTime);
        console.log(`📊 UI 설정 완료 (${uiTime}ms)`);
        
        // 데이터 로드
        const dataStartTime = performance.now();
        await loadNoticesFromSupabase();
        const dataTime = Math.round(performance.now() - dataStartTime);
        console.log(`📊 데이터 로드 완료 (${dataTime}ms)`);
        
        // 전체 초기화 시간
        const totalTime = Math.round(performance.now() - pageStartTime);
        
        console.log('✅ 공지사항 페이지 초기화 완료');
        console.log(`📈 성능 요약:`);
        console.log(`   - 전체 시간: ${totalTime}ms`);
        console.log(`   - DOM 초기화: ${domTime}ms`);
        console.log(`   - 서비스 초기화: ${servicesTime}ms`);
        console.log(`   - 권한 확인: ${permissionTime}ms`);
        console.log(`   - UI 설정: ${uiTime}ms`);
        console.log(`   - 데이터 로드: ${dataTime}ms`);
        
        // 성능 데이터를 전역 변수로 저장 (디버깅용)
        window.noticePagePerformance = {
            total: totalTime,
            dom: domTime,
            services: servicesTime,
            permission: permissionTime,
            ui: uiTime,
            data: dataTime,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        const errorTime = Math.round(performance.now() - pageStartTime);
        console.error(`❌ 공지사항 페이지 초기화 실패 (${errorTime}ms):`, error);
        showErrorMessage('페이지 로딩 중 오류가 발생했습니다.');
    }
});

/**
 * 서비스 대기 함수 - 병렬 처리로 최적화
 */
async function waitForServices() {
    const startTime = performance.now();
    console.log('⏳ 서비스 초기화 시작 (병렬 처리)...');
    
    // Supabase 초기화 대기 (필수)
    const waitForSupabase = async () => {
        const timeout = 3000; // 3초로 단축
        const interval = 50;   // 50ms 간격으로 더 자주 체크
        const maxAttempts = timeout / interval;
        
        for (let i = 0; i < maxAttempts; i++) {
            if (window.WaveSupabase && window.WaveSupabase.getClient) {
                console.log('✅ WaveSupabase 준비 완료');
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        
        console.warn('⚠️ Supabase 초기화 타임아웃');
        return false;
    };
    
    // Supabase가 준비될 때까지 기다림
    const supabaseReady = await waitForSupabase();
    if (!supabaseReady) {
        console.warn('⚠️ Supabase 초기화 실패, 제한된 기능으로 동작');
    }
    
    // 필수 서비스들을 병렬로 초기화
    const initializeServices = async () => {
        const promises = [];
        
        // NoticeService 초기화
        if (!window.noticeService && supabaseReady) {
            promises.push(
                (async () => {
                    try {
                        console.log('📦 NoticeService 초기화 시작...');
                        window.noticeService = new NoticeService();
                        await window.noticeService.init();
                        console.log('✅ NoticeService 초기화 완료');
                        return 'noticeService';
                    } catch (error) {
                        console.error('❌ NoticeService 초기화 실패:', error);
                        return null;
                    }
                })()
            );
        }
        
        // FeedbackService 초기화
        if (!window.feedbackService && supabaseReady) {
            promises.push(
                (async () => {
                    try {
                        console.log('📦 FeedbackService 초기화 시작...');
                        window.feedbackService = new FeedbackService();
                        await window.feedbackService.init();
                        console.log('✅ FeedbackService 초기화 완료');
                        return 'feedbackService';
                    } catch (error) {
                        console.error('❌ FeedbackService 초기화 실패:', error);
                        return null;
                    }
                })()
            );
        }
        
        // AuthService는 이미 초기화되어 있을 가능성이 높으므로 별도 처리
        const checkAuthService = () => {
            if (window.authService) {
                console.log('✅ AuthService 이미 준비됨');
                return 'authService';
            } else {
                console.warn('⚠️ AuthService 준비되지 않음');
                return null;
            }
        };
        
        // 모든 서비스 초기화를 병렬로 실행
        const results = await Promise.allSettled(promises);
        const authResult = checkAuthService();
        
        // 결과 정리
        const successfulServices = results
            .filter(result => result.status === 'fulfilled' && result.value)
            .map(result => result.value);
        
        if (authResult) successfulServices.push(authResult);
        
        const endTime = performance.now();
        const initTime = Math.round(endTime - startTime);
        
        console.log(`📊 서비스 초기화 완료: ${successfulServices.length}개 성공 (${initTime}ms)`);
        console.log(`✅ 초기화된 서비스:`, successfulServices);
        
        // 최소한 NoticeService가 있어야 정상 동작
        if (window.noticeService) {
            console.log('✅ 필수 서비스 준비 완료 - 페이지 로드 진행');
        } else {
            console.warn('⚠️ NoticeService 초기화 실패 - 제한된 기능으로 동작');
        }
    };
    
    await initializeServices();
}

/**
 * 사용자 권한 확인
 */
async function checkUserPermission() {
    try {
        if (window.authService) {
            const isLoggedIn = window.authService.isLoggedIn();
            console.log('ℹ️ 로그인 상태:', isLoggedIn);
            
            if (isLoggedIn) {
                const localUser = window.authService.getLocalUser();
                const isAdminUser = window.authService.isAdmin();
                
                console.log('ℹ️ 로컬 사용자 정보:', localUser);
                console.log('ℹ️ 관리자 여부:', isAdminUser);
                
                userRole = localUser.role || 'user';
                hasWritePermission = isAdminUser;
                
                console.log(`✅ 사용자 권한 확인: 역할=${userRole}, 쓰기권한=${hasWritePermission}`);
            } else {
                console.log('ℹ️ 비로그인 사용자');
                userRole = 'user';
                hasWritePermission = false;
            }
        } else {
            console.log('⚠️ AuthService를 사용할 수 없음');
            userRole = 'user';
            hasWritePermission = false;
        }
        
        console.log(`🔐 최종 권한: 역할=${userRole}, 쓰기권한=${hasWritePermission}`);
        
    } catch (error) {
        console.error('사용자 권한 확인 실패:', error);
        userRole = 'user';
        hasWritePermission = false;
    }
}

/**
 * 글쓰기 버튼 설정
 */
function setupWriteButton() {
    if (writeNoticeBtn) {
        if (hasWritePermission) {
            console.log('✅ 관리자 - 글쓰기 버튼 표시');
            writeNoticeBtn.style.display = 'flex';
        } else {
            console.log('ℹ️ 일반 사용자 - 글쓰기 버튼 숨김');
            writeNoticeBtn.style.display = 'none';
        }
    }
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // 검색 이벤트
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterNotices, 300));
    }

    // 카테고리 탭 클릭 이벤트 (checkbox-tab 스타일)
    categoryTabs.forEach((tab) => {
        const input = tab.querySelector('input[type="radio"]');

        tab.addEventListener('click', (e) => {
            // 모든 탭에서 active 클래스 제거
            categoryTabs.forEach((t) => {
                t.classList.remove('active');
                const tInput = t.querySelector('input[type="radio"]');
                if (tInput) tInput.checked = false;
            });
            // 클릭한 탭에 active 클래스 추가
            tab.classList.add('active');
            if (input) input.checked = true;
            // 선택된 카테고리 업데이트
            selectedCategory = tab.dataset.category;
            filterNotices();
        });
    });

    // 글쓰기 버튼 클릭
    if (writeNoticeBtn) {
        writeNoticeBtn.addEventListener('click', openWriteModal);
    }

    // 모달 닫기 버튼 이벤트 리스너 설정
    const modalCloseBtn = document.getElementById('modalClose');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeNoticeModal);
    }

    // 모달 오버레이 클릭으로 닫기
    const noticeModal = document.getElementById('noticeModal');
    if (noticeModal) {
        noticeModal.addEventListener('click', (e) => {
            if (e.target === noticeModal) {
                closeNoticeModal();
            }
        });
    }

    // 글쓰기 모달 닫기 버튼
    const writeModalClose = document.getElementById('writeModalClose');
    if (writeModalClose) {
        writeModalClose.addEventListener('click', closeWriteModal);
    }

    // 글쓰기 모달 오버레이 클릭으로 닫기
    const writeModal = document.getElementById('writeModal');
    if (writeModal) {
        writeModal.addEventListener('click', (e) => {
            if (e.target === writeModal) {
                closeWriteModal();
            }
        });
    }

    // 의견 관련 이벤트 리스너 설정
    setupFeedbackEventListeners();
}

/**
 * 의견 관련 이벤트 리스너 설정
 */
function setupFeedbackEventListeners() {
    // 의견 제출 버튼
    const feedbackSubmit = document.getElementById('feedbackSubmit');
    if (feedbackSubmit) {
        feedbackSubmit.addEventListener('click', submitFeedback);
    }

    // 의견 수정 버튼
    const feedbackEdit = document.getElementById('feedbackEdit');
    if (feedbackEdit) {
        feedbackEdit.addEventListener('click', editFeedback);
    }

    // 의견 텍스트 실시간 문자 수 카운트
    const feedbackText = document.getElementById('feedbackText');
    const charCount = document.getElementById('charCount');
    if (feedbackText && charCount) {
        feedbackText.addEventListener('input', (e) => {
            const count = e.target.value.length;
            charCount.textContent = count;
            
            // 500자 초과 시 스타일 변경
            if (count > 500) {
                charCount.style.color = '#ef4444';
                feedbackSubmit.disabled = true;
            } else {
                charCount.style.color = 'var(--gray-500)';
                if (feedbackSubmit) feedbackSubmit.disabled = false;
            }
        });
    }
}

/**
 * Supabase에서 공지사항 데이터 로드 - 캐시 우선 사용
 */
async function loadNoticesFromSupabase() {
    const loadStartTime = performance.now();
    
    try {
        showLoadingState();
        
        // 1. 먼저 캐시된 데이터 확인
        const cachedData = window.getCachedNoticeData && window.getCachedNoticeData();
        
        if (cachedData && cachedData.length > 0) {
            console.log('📦 캐시된 공지사항 데이터 사용 중...');
            
            // 캐시 데이터를 원본 구조로 변환
            allNotices = cachedData.map(notice => ({
                id: notice.id,
                category: notice.category,
                title: notice.title,
                content: notice.content,
                team: notice.team,
                viewCount: notice.view_count,
                createdAt: notice.created_at ? new Date(notice.created_at).toLocaleDateString('ko-KR') : '-',
                isPinned: notice.is_pinned,
                isNew: notice.is_new || (Date.now() - new Date(notice.created_at).getTime() < 7 * 24 * 60 * 60 * 1000)
            }));

            filteredNotices = [...allNotices];
            renderNotices();
            renderPagination();
            
            const cacheTime = Math.round(performance.now() - loadStartTime);
            console.log(`📊 캐시 데이터 로드 완료: ${allNotices.length}개 (${cacheTime}ms)`);
            
            // 백그라운드에서 최신 데이터 업데이트 시도
            updateNoticesInBackground();
            return;
        }
        
        // 2. 캐시가 없으면 NoticeService 사용
        if (!window.noticeService) {
            throw new Error('NoticeService가 초기화되지 않았습니다.');
        }

        console.log('🔄 Supabase에서 공지사항 데이터 로드 중...');
        const result = await window.noticeService.getNotices({
            limit: 100 // 모든 공지사항을 가져와서 클라이언트에서 필터링
        });

        if (result.error) {
            throw new Error(result.error);
        }

        // 수파베이스 데이터를 원본 구조로 변환
        allNotices = result.data.map(notice => ({
            id: notice.id,
            category: notice.category,
            title: notice.title,
            content: notice.content,
            team: notice.team,
            viewCount: notice.view_count,
            createdAt: notice.createdAt, // 이미 포맷된 날짜
            isPinned: notice.is_pinned,
            isNew: notice.isNew
        }));

        filteredNotices = [...allNotices];
        renderNotices();
        renderPagination();
        
        const loadTime = Math.round(performance.now() - loadStartTime);
        console.log(`📊 실시간 데이터 로드 완료: ${allNotices.length}개 (${loadTime}ms)`);

    } catch (error) {
        console.error('공지사항 로드 실패:', error);
        showErrorMessage('공지사항을 불러오는데 실패했습니다.');
    }
}

/**
 * 백그라운드에서 최신 데이터 업데이트
 */
async function updateNoticesInBackground() {
    try {
        if (!window.noticeService) return;
        
        console.log('🔄 백그라운드 데이터 업데이트 시작...');
        const result = await window.noticeService.getNotices({ limit: 100 });
        
        if (result.error) return;
        
        // 데이터 변경 여부 확인
        const newNotices = result.data.map(notice => ({
            id: notice.id,
            category: notice.category,
            title: notice.title,
            content: notice.content,
            team: notice.team,
            viewCount: notice.view_count,
            createdAt: notice.createdAt,
            isPinned: notice.is_pinned,
            isNew: notice.isNew
        }));
        
        // 데이터가 다르면 업데이트
        if (JSON.stringify(allNotices) !== JSON.stringify(newNotices)) {
            console.log('📋 새로운 공지사항 데이터 감지, 업데이트 중...');
            allNotices = newNotices;
            filteredNotices = [...allNotices];
            renderNotices();
            renderPagination();
        }
        
    } catch (error) {
        console.log('백그라운드 업데이트 실패 (정상 동작):', error.message);
    }
}

/**
 * 필터링 함수
 */
function filterNotices() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    filteredNotices = allNotices.filter((notice) => {
        const matchesSearch =
            notice.title.toLowerCase().includes(searchTerm) ||
            notice.content.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || notice.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    currentPage = 1;
    renderNotices();
    renderPagination();
}

/**
 * 공지사항 렌더링 (원본 구조 유지)
 */
function renderNotices() {
    if (!noticeList) return;

    // 상단 고정 게시물과 일반 게시물 분리
    const pinnedNotices = filteredNotices
        .filter((notice) => notice.isPinned)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const regularNotices = filteredNotices
        .filter((notice) => !notice.isPinned)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 일반 게시물만 페이지네이션 적용
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRegularNotices = regularNotices.slice(startIndex, endIndex);

    // 상단 고정 + 현재 페이지의 일반 게시물
    const displayedNotices = [...pinnedNotices, ...paginatedRegularNotices];
    
    // 현재 필터링된 공지사항 목록 저장
    currentFilteredNotices = displayedNotices;

    noticeList.innerHTML = '';

    if (displayedNotices.length === 0) {
        renderEmptyState();
        return;
    }

    displayedNotices.forEach((notice, index) => {
        const noticeElement = createNoticeElement(notice);
        // 애니메이션 효과
        setTimeout(() => {
            noticeElement.style.opacity = '1';
            noticeElement.style.transform = 'translateY(0)';
        }, index * 50);
        noticeList.appendChild(noticeElement);
    });
}

/**
 * 공지사항 요소 생성 (원본 구조)
 */
function createNoticeElement(notice) {
    const noticeItem = document.createElement('div');
    noticeItem.className = `notice-item ${notice.isPinned ? 'pinned' : ''}`;
    noticeItem.style.opacity = '0';
    noticeItem.style.transform = 'translateY(20px)';
    noticeItem.style.transition = 'all 0.3s ease';
    noticeItem.style.cursor = 'pointer';

    // 클릭 이벤트 추가
    noticeItem.addEventListener('click', () => {
        openNoticeModal(notice);
    });

    noticeItem.innerHTML = `
        <div class="notice-header">
            <div class="notice-header-left">
                <div class="notice-badges">
                    <span class="notice-badge category-${notice.category}">${notice.category}</span>
                </div>
                <h3 class="notice-item-title">${escapeHtml(notice.title)}</h3>
                <p class="notice-item-content">${escapeHtml(notice.content ? notice.content.substring(0, 50) + (notice.content.length > 50 ? '...' : '') : '')}</p>
            </div>
            <div class="notice-header-right">
                <span class="notice-date"><i class="fas fa-calendar"></i> ${notice.createdAt}</span>
            </div>
        </div>
    `;

    return noticeItem;
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
                ${searchInput?.value ? '검색 결과가 없습니다.' : '등록된 공지사항이 없습니다.'}
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
 * 페이지네이션 링크 생성 (updates.js와 동일한 함수)
 */
function createPaginationLink(text, onClick, disabled, active = false) {
    const link = document.createElement('a');
    link.href = 'javascript:void(0)';
    link.textContent = text;
    if (disabled) link.className = 'disabled';
    if (active) link.className = 'active';
    link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) onClick();
        return false;
    });
    return link;
}

/**
 * 페이지네이션 렌더링 (업데이트 페이지와 완전 동일한 구조)
 */
function renderPagination() {
    if (!pagination) return;

    // 고정글을 제외한 일반 게시물만으로 페이지네이션 계산
    const regularNotices = filteredNotices.filter((notice) => !notice.isPinned);
    const totalPages = Math.ceil(regularNotices.length / itemsPerPage);
    
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // 처음 버튼
    const firstBtn = createPaginationLink(
        '처음',
        () => {
            currentPage = 1;
            renderNotices();
            renderPagination();
        },
        currentPage === 1
    );
    pagination.appendChild(firstBtn);

    // 이전 버튼
    const prevBtn = createPaginationLink(
        '이전',
        () => {
            if (currentPage > 1) {
                currentPage--;
                renderNotices();
                renderPagination();
            }
        },
        currentPage === 1
    );
    pagination.appendChild(prevBtn);

    // 페이지 번호들을 담을 컨테이너
    const pageNumbers = document.createElement('div');
    pageNumbers.className = 'page-numbers';

    // 페이지 번호 버튼들
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
        const pageLink = createPaginationLink(
            i,
            () => {
                currentPage = i;
                renderNotices();
                renderPagination();
            },
            false,
            currentPage === i
        );
        pageNumbers.appendChild(pageLink);
    }

    pagination.appendChild(pageNumbers);

    // 다음 버튼
    const nextBtn = createPaginationLink(
        '다음',
        () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderNotices();
                renderPagination();
            }
        },
        currentPage === totalPages
    );
    pagination.appendChild(nextBtn);

    // 마지막 버튼
    const lastBtn = createPaginationLink(
        '마지막',
        () => {
            currentPage = totalPages;
            renderNotices();
            renderPagination();
        },
        currentPage === totalPages
    );
    pagination.appendChild(lastBtn);
}

/**
 * 페이지 변경
 */
function changePage(page) {
    const regularNotices = filteredNotices.filter((notice) => !notice.isPinned);
    const totalPages = Math.ceil(regularNotices.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderNotices();
    renderPagination();
}

/**
 * 공지사항 모달 열기
 */
async function openNoticeModal(notice) {
    try {
        // 현재 공지사항의 인덱스 설정
        currentFilteredNotices = filteredNotices;
        currentNoticeIndex = filteredNotices.findIndex(n => n.id === notice.id);
        
        // 조회수 증가
        if (window.noticeService) {
            window.noticeService.incrementViewCount(notice.id);
        }
        
        // 상세 정보 가져오기
        let detailNotice = notice;
        
        if (window.noticeService) {
            const result = await window.noticeService.getNoticeById(notice.id);
            if (result.data) {
                detailNotice = {
                    ...result.data,
                    isPinned: result.data.is_pinned,
                    isNew: result.data.isNew,
                    viewCount: result.data.view_count,
                    createdAt: result.data.createdAt
                };
            }
        }

        // 모달 내용 업데이트
        const modal = document.getElementById('noticeModal');
        const modalBadges = document.getElementById('modalBadges');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        const modalDate = document.getElementById('modalDate');
        
        // 배지 업데이트
        if (modalBadges) {
            modalBadges.innerHTML = `
                <span class="notice-badge category-${detailNotice.category}">${detailNotice.category}</span>
                ${detailNotice.isPinned ? '<span class="notice-badge pinned">📌 고정</span>' : ''}
                ${detailNotice.isNew ? '<span class="notice-badge new">NEW</span>' : ''}
            `;
        }
        
        // 제목 업데이트
        if (modalTitle) {
            modalTitle.textContent = detailNotice.title;
        }
        
        // 내용 업데이트
        if (modalContent) {
            modalContent.innerHTML = escapeHtml(detailNotice.content).replace(/\n/g, '<br>');
        }
        
        // 날짜 업데이트
        if (modalDate) {
            modalDate.textContent = detailNotice.createdAt;
        }

        // 의견 기능 로드
        await loadFeedbackForNotice(detailNotice.id);

        // 네비게이션 버튼 상태 업데이트
        updateNavigationButtons();

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
        const form = modal.querySelector('#writeNoticeForm');
        if (form) form.reset();
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
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
 * 오류 메시지 표시
 */
function showErrorMessage(message) {
    // 간단한 알림으로 표시 (추후 토스트 메시지로 개선 가능)
    console.error('Error:', message);
    if (noticeList && noticeList.innerHTML.includes('loading-state')) {
        noticeList.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <div class="error-title">오류 발생</div>
                <div class="error-description">${message}</div>
            </div>
        `;
    }
}

/**
 * HTML 이스케이프 함수
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * 디바운스 함수
 */
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

/**
 * 의견 기능 로드
 */
async function loadFeedbackForNotice(noticeId) {
    // 피드백 섹션을 항상 표시하도록 확실히 하기
    const feedbackSection = document.querySelector('.modal-feedback');
    if (feedbackSection) {
        feedbackSection.style.display = 'block';
    }

    if (!window.feedbackService) {
        console.warn('FeedbackService가 초기화되지 않았습니다.');
        // 서비스가 없어도 폼을 표시하되 비활성화
        showFeedbackFormForGuests();
        return;
    }

    try {
        // 현재 사용자의 의견 조회
        const userFeedback = await window.feedbackService.getUserFeedbackByNotice(noticeId);
        
        const feedbackForm = document.querySelector('.feedback-form');
        const feedbackSubmitted = document.getElementById('feedbackSubmitted');
        const feedbackText = document.getElementById('feedbackText');
        const charCount = document.getElementById('charCount');

        // 로그인이 안되어 있거나 에러가 발생한 경우
        if (userFeedback.error && userFeedback.error.includes('로그인이 필요합니다')) {
            showFeedbackFormForGuests();
            return;
        }

        if (userFeedback.data) {
            // 이미 의견을 남긴 경우
            if (feedbackForm) feedbackForm.style.display = 'none';
            if (feedbackSubmitted) {
                feedbackSubmitted.style.display = 'block';
                const submittedContent = document.getElementById('submittedContent');
                if (submittedContent) {
                    submittedContent.innerHTML = `
                        <div style="margin-bottom: 8px;">
                            <span style="font-size: 12px; color: var(--gray-500);">
                                ${window.feedbackService.formatDate(userFeedback.data.created_at)}
                                ${userFeedback.data.is_edited ? ' (수정됨)' : ''}
                            </span>
                        </div>
                        <div>${escapeHtml(userFeedback.data.content)}</div>
                    `;
                }
                
                // 수정 버튼에 의견 ID 저장
                const editBtn = document.getElementById('feedbackEdit');
                if (editBtn) {
                    editBtn.dataset.feedbackId = userFeedback.data.id;
                    editBtn.dataset.originalContent = userFeedback.data.content;
                }
            }
        } else {
            // 의견을 남기지 않은 경우 (로그인된 사용자)
            if (feedbackForm) feedbackForm.style.display = 'block';
            if (feedbackSubmitted) feedbackSubmitted.style.display = 'none';
            if (feedbackText) {
                feedbackText.value = '';
                feedbackText.disabled = false;
                feedbackText.placeholder = '의견을 입력해주세요...';
            }
            if (charCount) charCount.textContent = '0';
            
            // 제출 버튼 활성화
            const submitBtn = document.getElementById('feedbackSubmit');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.display = 'inline-flex';
            }
        }

        // 의견 개수 표시 (관리자용)
        if (hasWritePermission) {
            const feedbackCount = await window.feedbackService.getFeedbackCount(noticeId);
            if (feedbackCount.data > 0) {
                updateFeedbackCountDisplay(feedbackCount.data);
            }
        }

    } catch (error) {
        console.error('의견 로드 실패:', error);
        // 에러가 발생해도 게스트용 폼 표시
        showFeedbackFormForGuests();
    }
}

/**
 * 비로그인 사용자용 피드백 폼 표시
 */
function showFeedbackFormForGuests() {
    const feedbackForm = document.querySelector('.feedback-form');
    const feedbackSubmitted = document.getElementById('feedbackSubmitted');
    const feedbackText = document.getElementById('feedbackText');
    const charCount = document.getElementById('charCount');
    const submitBtn = document.getElementById('feedbackSubmit');

    // 폼을 표시하되 비활성화
    if (feedbackForm) feedbackForm.style.display = 'block';
    if (feedbackSubmitted) feedbackSubmitted.style.display = 'none';
    
    if (feedbackText) {
        feedbackText.value = '';
        feedbackText.disabled = true;
        feedbackText.placeholder = '의견을 남기려면 로그인이 필요합니다.';
    }
    
    if (charCount) charCount.textContent = '0';
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> 로그인 필요';
        submitBtn.style.display = 'inline-flex';
        
        // 로그인 페이지로 이동하는 클릭 이벤트 추가
        submitBtn.onclick = () => {
            window.location.href = 'login.html';
        };
    }
}

/**
 * 의견 제출
 */
async function submitFeedback() {
    const feedbackText = document.getElementById('feedbackText');
    const submitBtn = document.getElementById('feedbackSubmit');
    
    if (!feedbackText || !submitBtn) return;
    
    // 로그인 확인
    if (feedbackText.disabled) {
        // 비로그인 사용자의 경우 로그인 페이지로 이동
        window.location.href = 'login.html';
        return;
    }
    
    const content = feedbackText.value.trim();
    
    if (!content) {
        showFeedbackMessage('의견을 입력해주세요.', 'error');
        return;
    }

    if (content.length > 500) {
        showFeedbackMessage('의견은 500자 이내로 작성해주세요.', 'error');
        return;
    }

    // 현재 공지사항 ID 가져오기
    const modal = document.getElementById('noticeModal');
    const currentNotice = currentFilteredNotices[currentNoticeIndex];
    
    if (!currentNotice) {
        showFeedbackMessage('공지사항 정보를 찾을 수 없습니다.', 'error');
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 제출 중...';

        const result = await window.feedbackService.createFeedback(currentNotice.id, content);
        
        if (result.error) {
            // 로그인 필요 에러의 경우 특별 처리
            if (result.error.includes('로그인이 필요합니다')) {
                showFeedbackMessage('로그인이 필요합니다. 로그인 페이지로 이동합니다.', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            showFeedbackMessage(result.error, 'error');
            return;
        }

        showFeedbackMessage('의견이 성공적으로 제출되었습니다.', 'success');
        
        // 의견 영역 새로고침
        setTimeout(() => {
            loadFeedbackForNotice(currentNotice.id);
        }, 1000);

    } catch (error) {
        console.error('의견 제출 실패:', error);
        showFeedbackMessage('의견 제출 중 오류가 발생했습니다.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 의견 제출';
    }
}

/**
 * 의견 수정
 */
function editFeedback() {
    const editBtn = document.getElementById('feedbackEdit');
    const feedbackForm = document.querySelector('.feedback-form');
    const feedbackSubmitted = document.getElementById('feedbackSubmitted');
    const feedbackText = document.getElementById('feedbackText');
    
    if (!editBtn || !feedbackForm || !feedbackSubmitted || !feedbackText) return;

    const originalContent = editBtn.dataset.originalContent || '';
    
    // 수정 모드로 전환
    feedbackSubmitted.style.display = 'none';
    feedbackForm.style.display = 'block';
    feedbackText.value = originalContent;
    
    // 문자 수 업데이트
    const charCount = document.getElementById('charCount');
    if (charCount) {
        charCount.textContent = originalContent.length;
    }

    // 제출 버튼을 수정 버튼으로 변경
    const submitBtn = document.getElementById('feedbackSubmit');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-edit"></i> 의견 수정';
        submitBtn.onclick = () => updateFeedback(editBtn.dataset.feedbackId);
    }

    feedbackText.focus();
}

/**
 * 의견 업데이트
 */
async function updateFeedback(feedbackId) {
    const feedbackText = document.getElementById('feedbackText');
    const submitBtn = document.getElementById('feedbackSubmit');
    
    if (!feedbackText || !submitBtn || !feedbackId) return;
    
    const content = feedbackText.value.trim();
    
    if (!content) {
        showFeedbackMessage('의견을 입력해주세요.', 'error');
        return;
    }

    if (content.length > 500) {
        showFeedbackMessage('의견은 500자 이내로 작성해주세요.', 'error');
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 수정 중...';

        const result = await window.feedbackService.updateFeedback(feedbackId, content);
        
        if (result.error) {
            showFeedbackMessage(result.error, 'error');
            return;
        }

        showFeedbackMessage('의견이 성공적으로 수정되었습니다.', 'success');
        
        // 의견 영역 새로고침
        const currentNotice = currentFilteredNotices[currentNoticeIndex];
        setTimeout(() => {
            loadFeedbackForNotice(currentNotice.id);
        }, 1000);

    } catch (error) {
        console.error('의견 수정 실패:', error);
        showFeedbackMessage('의견 수정 중 오류가 발생했습니다.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 의견 제출';
        submitBtn.onclick = submitFeedback;
    }
}

/**
 * 의견 메시지 표시
 */
function showFeedbackMessage(message, type = 'info') {
    // 기존 메시지 제거
    const existingMessage = document.querySelector('.feedback-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // 새 메시지 생성
    const messageDiv = document.createElement('div');
    messageDiv.className = `feedback-message feedback-${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    // 의견 섹션에 추가
    const feedbackSection = document.querySelector('.modal-feedback');
    if (feedbackSection) {
        feedbackSection.insertBefore(messageDiv, feedbackSection.firstChild);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }
}

/**
 * 의견 개수 표시 업데이트 (관리자용)
 */
function updateFeedbackCountDisplay(count) {
    const feedbackHeader = document.querySelector('.feedback-header');
    if (feedbackHeader && count > 0) {
        let countSpan = feedbackHeader.querySelector('.feedback-count-admin');
        if (!countSpan) {
            countSpan = document.createElement('span');
            countSpan.className = 'feedback-count-admin';
            countSpan.style.cssText = 'background: var(--primary-blue); color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px;';
            feedbackHeader.querySelector('.feedback-title').appendChild(countSpan);
        }
        countSpan.textContent = `${count}개의 의견`;
    }
}

/**
 * 네비게이션 버튼 상태 업데이트
 */
function updateNavigationButtons() {
    const prevBtn = document.getElementById('modalPrevBtn');
    const nextBtn = document.getElementById('modalNextBtn');
    
    if (!prevBtn || !nextBtn || !currentFilteredNotices || currentFilteredNotices.length === 0) {
        return;
    }

    const totalNotices = currentFilteredNotices.length;
    const currentIndex = currentNoticeIndex;

    // 공지사항이 1개만 있으면 양쪽 모두 비활성화
    if (totalNotices <= 1) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    // 첫 번째 공지사항이면 이전 버튼 비활성화
    prevBtn.disabled = (currentIndex === 0);
    
    // 마지막 공지사항이면 다음 버튼 비활성화
    nextBtn.disabled = (currentIndex === totalNotices - 1);

    // 버튼에 툴팁 추가
    if (currentIndex === 0) {
        prevBtn.title = '첫 번째 공지사항입니다';
    } else {
        prevBtn.title = '이전 공지사항';
    }

    if (currentIndex === totalNotices - 1) {
        nextBtn.title = '마지막 공지사항입니다';
    } else {
        nextBtn.title = '다음 공지사항';
    }

    console.log(`네비게이션 상태: ${currentIndex + 1}/${totalNotices} (이전: ${!prevBtn.disabled}, 다음: ${!nextBtn.disabled})`);
}

/**
 * 공지사항 네비게이션 (이전/다음)
 */
function navigateNotice(direction) {
    if (!currentFilteredNotices || currentFilteredNotices.length === 0) {
        return;
    }

    const currentIndex = currentNoticeIndex;
    let newIndex;

    if (direction === 'prev') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : currentFilteredNotices.length - 1;
    } else if (direction === 'next') {
        newIndex = currentIndex < currentFilteredNotices.length - 1 ? currentIndex + 1 : 0;
    } else {
        return;
    }

    currentNoticeIndex = newIndex;
    const notice = currentFilteredNotices[newIndex];
    
    if (notice && window.noticeService) {
        // 조회수 증가
        window.noticeService.incrementViewCount(notice.id);
        // 모달 업데이트
        openNoticeModal(notice);
    }
}