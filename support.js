// FAQ 데이터
const faqData = [
    {
        id: 1,
        category: 'account',
        question: '회원가입은 어떻게 하나요?',
        answer: 'WAVE SPACE 홈페이지 우측 상단의 "회원가입" 버튼을 클릭하여 가입할 수 있습니다. 이메일 인증 후 간단한 정보를 입력하면 가입이 완료됩니다. 신규 가입 시 3,000P의 웰컴 포인트가 지급됩니다.',
    },
    {
        id: 2,
        category: 'account',
        question: '비밀번호를 잊어버렸어요',
        answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하세요. 가입 시 사용한 이메일 주소를 입력하면 비밀번호 재설정 링크가 발송됩니다. 메일이 오지 않는다면 스팸함을 확인해주세요.',
    },
    {
        id: 3,
        category: 'point',
        question: '포인트는 어떻게 충전하나요?',
        answer: '마이페이지 > 포인트 > 충전하기 메뉴에서 충전할 수 있습니다. 신용카드, 계좌이체, 간편결제 등 다양한 결제 수단을 지원합니다. 충전 금액에 따라 추가 보너스 포인트가 지급됩니다.',
    },
    {
        id: 4,
        category: 'point',
        question: '포인트 유효기간이 있나요?',
        answer: '포인트 유효기간은 충전일로부터 1년입니다. 만료 30일 전에 이메일과 알림으로 안내드립니다. Plus 멤버십 회원은 포인트 유효기간이 2년으로 연장됩니다.',
    },
    {
        id: 5,
        category: 'content',
        question: '자료를 다운로드할 수 없어요',
        answer: '자료 다운로드를 위해서는 해당 자료에 필요한 포인트가 충분해야 합니다. 포인트가 부족한 경우 충전 후 이용해주세요. 또한 일부 자료는 Plus 멤버십 회원만 이용 가능합니다.',
    },
    {
        id: 6,
        category: 'content',
        question: '게시글 작성 시 주의사항이 있나요?',
        answer: '커뮤니티 가이드라인을 준수해주세요. 욕설, 비방, 광고성 글은 삭제될 수 있으며, 반복 위반 시 이용이 제한될 수 있습니다. 분양 관련 정보는 출처를 명확히 기재해주세요.',
    },
    {
        id: 7,
        category: 'membership',
        question: 'Plus 멤버십 혜택은 무엇인가요?',
        answer: 'Plus 멤버십 회원은 프리미엄 자료 무제한 다운로드, 포인트 2배 적립, AI 보고서 생성 무제한, 전용 배지 제공, 우선 고객지원 등의 혜택을 받을 수 있습니다.',
    },
    {
        id: 8,
        category: 'membership',
        question: '멤버십 결제는 어떻게 하나요?',
        answer: '마이페이지 > Plus 멤버십 메뉴에서 가입할 수 있습니다. 월간/연간 요금제를 선택할 수 있으며, 연간 결제 시 2개월 무료 혜택이 제공됩니다.',
    },
    {
        id: 9,
        category: 'etc',
        question: '탈퇴는 어떻게 하나요?',
        answer: '마이페이지 > 설정 > 회원탈퇴 메뉴에서 탈퇴할 수 있습니다. 탈퇴 시 보유 포인트와 작성한 게시글은 모두 삭제되며, 동일 이메일로 30일간 재가입이 제한됩니다.',
    },
    {
        id: 10,
        category: 'etc',
        question: '모바일 앱은 없나요?',
        answer: 'iOS와 Android 앱을 제공하고 있습니다. App Store 또는 Google Play에서 "WAVE SPACE"를 검색하여 다운로드할 수 있습니다. 웹과 동일한 계정으로 로그인 가능합니다.',
    },
    {
        id: 11,
        category: 'account',
        question: '이메일 주소를 변경하고 싶어요',
        answer: '마이페이지 > 계정설정에서 이메일 주소를 변경할 수 있습니다. 새 이메일 주소로 인증 메일이 발송되며, 인증 완료 후 변경이 적용됩니다.',
    },
    {
        id: 12,
        category: 'point',
        question: '포인트 환불이 가능한가요?',
        answer: '충전한 포인트는 충전일로부터 7일 이내, 미사용 포인트에 한해 환불 가능합니다. 고객센터로 환불 요청을 해주시면 영업일 기준 3-5일 내에 처리됩니다.',
    },
    {
        id: 13,
        category: 'content',
        question: '업로드한 자료를 수정하거나 삭제하고 싶어요',
        answer: '마이페이지 > 내가 올린 자료에서 수정 및 삭제가 가능합니다. 단, 이미 구매된 자료는 삭제만 가능하며, 내용 수정은 불가합니다.',
    },
    {
        id: 14,
        category: 'membership',
        question: '멤버십 자동 갱신을 해제하려면?',
        answer: '마이페이지 > Plus 멤버십 > 자동갱신 설정에서 해제할 수 있습니다. 해제 후에도 현재 결제 기간까지는 멤버십 혜택이 유지됩니다.',
    },
    {
        id: 15,
        category: 'content',
        question: 'AI 보고서는 어떻게 생성하나요?',
        answer: 'AI 보고서 메뉴에서 필요한 정보를 입력하면 자동으로 생성됩니다. 무료 회원은 월 3회, Plus 회원은 무제한 이용 가능합니다.',
    },
];

// DOM 요소 (초기에는 null일 수 있음)
let faqList;
let categoryBtns;
let searchInput;
let keywordTags;

// 현재 선택된 카테고리 및 페이지
let currentCategory = 'all';
let currentPage = 1;
const itemsPerPage = 10;

// FAQ 렌더링
function renderFAQ(category = 'all', searchTerm = '', scrollToTop = false) {
    let filteredFAQ = faqData;

    // 카테고리 필터링
    if (category !== 'all') {
        filteredFAQ = filteredFAQ.filter((item) => item.category === category);
    }

    // 검색어 필터링
    if (searchTerm && searchTerm.trim()) {
        // 검색어를 공백으로 분리하여 개별 단어로 만듦
        const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);

        // 각 FAQ 항목에 대해 점수 계산
        filteredFAQ = filteredFAQ
            .map((item) => {
                const questionLower = item.question.toLowerCase();
                const answerLower = item.answer.toLowerCase();
                let score = 0;

                // 각 검색어에 대해 점수 계산
                searchWords.forEach((word) => {
                    // 질문에 단어가 포함되면 2점
                    if (questionLower.includes(word)) {
                        score += 2;
                    }
                    // 답변에 단어가 포함되면 1점
                    if (answerLower.includes(word)) {
                        score += 1;
                    }
                });

                // 전체 검색어가 질문에 정확히 포함되면 보너스 점수
                if (questionLower.includes(searchTerm.toLowerCase())) {
                    score += 3;
                }

                return { ...item, searchScore: score };
            })
            // 점수가 0보다 큰 항목만 필터링
            .filter((item) => item.searchScore > 0)
            // 점수가 높은 순으로 정렬
            .sort((a, b) => b.searchScore - a.searchScore);
    }

    // FAQ 리스트 렌더링
    faqList.innerHTML = '';

    if (filteredFAQ.length === 0) {
        faqList.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--gray-500);">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p style="font-size: 16px;">검색 결과가 없습니다.</p>
            </div>
        `;
        renderPagination(0);
        return;
    }

    // 페이지네이션 적용
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFAQ = filteredFAQ.slice(startIndex, endIndex);

    paginatedFAQ.forEach((item, index) => {
        const faqItem = createFAQItem(item);
        // 애니메이션 효과
        setTimeout(() => {
            faqItem.style.opacity = '1';
            faqItem.style.transform = 'translateY(0)';
        }, index * 50);
        faqList.appendChild(faqItem);
    });

    // 페이지네이션 렌더링
    renderPagination(filteredFAQ.length);

    // 스크롤 제거 - 사용자가 원하지 않음
    // if (scrollToTop) {
    //     const faqSection = document.getElementById('faq');
    //     if (faqSection) {
    //         const mainContent = document.querySelector('.main-content');
    //         if (mainContent) {
    //             // 헤더 높이를 고려하여 FAQ 섹션이 페이지 상단에 위치하도록
    //             const headerHeight = 80; // 헤더 높이
    //             const sectionTop = faqSection.offsetTop - headerHeight;
    //             mainContent.scrollTop = sectionTop;
    //         }
    //     }
    // }
}

// FAQ 아이템 생성
function createFAQItem(item) {
    const div = document.createElement('div');
    div.className = 'faq-item';
    div.style.opacity = '0';
    div.style.transform = 'translateY(20px)';
    div.style.transition = 'all 0.3s ease';

    // 카테고리 한글 변환
    const categoryNames = {
        account: '계정관리',
        point: '포인트',
        content: '콘텐츠',
        membership: '멤버십',
        etc: '기타',
    };

    div.innerHTML = `
        <button class="faq-question">
            <div class="faq-question-text">
                <span class="faq-badge">${categoryNames[item.category]}</span>
                <span>${item.question}</span>
            </div>
            <i class="fas fa-chevron-down faq-arrow"></i>
        </button>
        <div class="faq-answer">
            ${item.answer}
        </div>
    `;

    // 클릭 이벤트
    const questionBtn = div.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
        // 현재 FAQ가 이미 열려있는지 확인
        const isActive = div.classList.contains('active');
        
        // 모든 FAQ 항목 닫기
        const allFaqItems = document.querySelectorAll('.faq-item');
        allFaqItems.forEach(faqItem => {
            faqItem.classList.remove('active');
        });
        
        // 현재 클릭한 항목이 닫혀있었다면 열기
        if (!isActive) {
            div.classList.add('active');
        }
    });

    return div;
}

// 페이지네이션 렌더링
function renderPagination(totalItems) {
    const pagination = document.getElementById('faqPagination');
    if (!pagination) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    pagination.innerHTML = '';
    pagination.className = 'pagination-underline';

    if (totalPages <= 1) return;

    // 처음 버튼
    const firstBtn = createPaginationLink(
        '처음',
        () => {
            currentPage = 1;
            renderFAQ(currentCategory, searchInput.value, true);
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
                renderFAQ(currentCategory, searchInput.value, true);
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
                renderFAQ(currentCategory, searchInput.value, true);
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
                renderFAQ(currentCategory, searchInput.value, true);
            }
        },
        currentPage === totalPages
    );
    pagination.appendChild(nextBtn);

    // 끝 버튼
    const lastBtn = createPaginationLink(
        '끝',
        () => {
            currentPage = totalPages;
            renderFAQ(currentCategory, searchInput.value, true);
        },
        currentPage === totalPages
    );
    pagination.appendChild(lastBtn);
}

// 페이지네이션 링크 생성
function createPaginationLink(text, onClick, disabled, active = false) {
    const link = document.createElement('a');
    link.href = 'javascript:void(0)'; // # 대신 javascript:void(0) 사용
    link.textContent = text;
    if (disabled) link.className = 'disabled';
    if (active) link.className = 'active';
    link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // 이벤트 버블링 방지 추가
        if (!disabled) onClick();
        return false; // 추가 보호
    });
    return link;
}

// 부드러운 스크롤 함수 - 전역 스코프로 이동
window.smoothScrollTo = function (targetId, offset = 100) {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) {
        console.error('대상 요소를 찾을 수 없습니다:', targetId);
        return;
    }

    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

    // 브라우저가 smooth scroll을 지원하는 경우
    if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth',
        });
    } else {
        // 지원하지 않는 경우 폴리필
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 800;
        let start = null;

        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);

            const easing =
                progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            window.scrollTo(0, startPosition + distance * easing);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }
};

// 초기 렌더링
document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 초기화
    faqList = document.getElementById('faqList');
    categoryBtns = document.querySelectorAll('.checkbox-tab');
    searchInput = document.getElementById('supportSearchInput');
    keywordTags = document.querySelectorAll('.keyword-tag');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const faqSearchBtn = document.getElementById('faqSearchBtn');

    // FAQ 렌더링
    renderFAQ();

    // 카테고리 버튼 이벤트 (checkbox-tab 스타일)
    categoryBtns.forEach((btn) => {
        const input = btn.querySelector('input[type="radio"]');

        btn.addEventListener('click', () => {
            // 활성 버튼 변경
            categoryBtns.forEach((b) => {
                b.classList.remove('active');
                const bInput = b.querySelector('input[type="radio"]');
                if (bInput) bInput.checked = false;
            });
            btn.classList.add('active');
            if (input) input.checked = true;

            // FAQ 필터링 (페이지를 1로 리셋)
            currentCategory = btn.dataset.category;
            currentPage = 1;
            renderFAQ(currentCategory, searchInput.value);

            // FAQ 섹션으로 스크롤
            const faqSection = document.getElementById('faq');
            if (faqSection) {
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    // 헤더 높이를 고려하여 FAQ 섹션이 페이지 상단에 위치하도록
                    const headerHeight = 80; // 헤더 높이
                    const sectionTop = faqSection.offsetTop - headerHeight;
                    mainContent.scrollTo({
                        top: sectionTop,
                        behavior: 'smooth',
                    });
                }
            }
        });
    });

    // 검색 기능
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                // 검색어가 변경되면 모든 키워드 태그 비활성화
                keywordTags.forEach((t) => t.classList.remove('active'));

                // 검색어가 있으면 X 버튼 표시
                if (e.target.value.trim()) {
                    clearSearchBtn.style.display = 'flex';
                } else {
                    clearSearchBtn.style.display = 'none';
                }

                currentPage = 1; // 검색 시 첫 페이지로
                renderFAQ(currentCategory, e.target.value);
            }, 300);
        });

        // 엔터 키 처리
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();

                // 모든 키워드 태그 비활성화
                keywordTags.forEach((t) => t.classList.remove('active'));

                // FAQ 섹션으로 스크롤
                const faqSection = document.getElementById('faq');
                if (faqSection) {
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        // 헤더 높이를 고려하여 FAQ 섹션이 페이지 상단에 위치하도록
                        const headerHeight = 80; // 헤더 높이
                        const sectionTop = faqSection.offsetTop - headerHeight;
                        mainContent.scrollTo({
                            top: sectionTop,
                            behavior: 'smooth',
                        });
                    }
                }
            }
        });
    }

    // 검색어 초기화 버튼
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            keywordTags.forEach((t) => t.classList.remove('active'));
            currentPage = 1;
            // 전체 카테고리를 유지하면서 검색어만 초기화
            renderFAQ(currentCategory, '');

            // 검색 입력창에 포커스
            searchInput.focus();
        });
    }

    // 검색 버튼 클릭
    if (faqSearchBtn) {
        faqSearchBtn.addEventListener('click', () => {
            // 모든 키워드 태그 비활성화
            keywordTags.forEach((t) => t.classList.remove('active'));

            // FAQ 섹션으로 스크롤
            const faqSection = document.getElementById('faq');
            if (faqSection) {
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    // 헤더 높이를 고려하여 FAQ 섹션이 페이지 상단에 위치하도록
                    const headerHeight = 80; // 헤더 높이
                    const sectionTop = faqSection.offsetTop - headerHeight;
                    mainContent.scrollTo({
                        top: sectionTop,
                        behavior: 'smooth',
                    });
                }
            }
        });
    }

    // 키워드 태그 클릭
    keywordTags.forEach((tag) => {
        tag.addEventListener('click', () => {
            // 이미 활성화된 태그를 다시 클릭한 경우
            if (tag.classList.contains('active')) {
                // 태그 비활성화
                tag.classList.remove('active');
                // 검색어 초기화
                searchInput.value = '';
                clearSearchBtn.style.display = 'none';
                currentPage = 1;
                // 전체 FAQ 표시
                renderFAQ(currentCategory, '');
            } else {
                // 모든 키워드 태그의 활성 상태 제거
                keywordTags.forEach((t) => t.classList.remove('active'));
                // 클릭한 태그 활성화
                tag.classList.add('active');

                // data-search 속성이 있으면 그 값을 사용, 없으면 텍스트 내용 사용
                const searchKeyword = tag.dataset.search || tag.textContent;
                searchInput.value = searchKeyword;
                clearSearchBtn.style.display = 'flex'; // X 버튼 표시
                currentPage = 1;
                renderFAQ(currentCategory, searchKeyword);

                // 키워드 클릭 시에도 스크롤
                const faqSection = document.getElementById('faq');
                if (faqSection) {
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        setTimeout(() => {
                            // 헤더 높이를 고려하여 FAQ 섹션이 페이지 상단에 위치하도록
                            const headerHeight = 80; // 헤더 높이
                            const sectionTop = faqSection.offsetTop - headerHeight;
                            mainContent.scrollTo({
                                top: sectionTop,
                                behavior: 'smooth',
                            });
                        }, 100);
                    }
                }
            }
        });
    });

    // 퀵 메뉴 이벤트 위임 방식으로 처리
    const quickMenu = document.querySelector('.quick-menu');
    if (quickMenu) {
        quickMenu.addEventListener('click', (e) => {
            // quick-item 또는 그 하위 요소를 클릭했는지 확인
            const quickItem = e.target.closest('.quick-item');
            if (!quickItem) return;

            const href = quickItem.getAttribute('href');

            if (href === '#write-inquiry') {
                e.preventDefault();
                // 문의글쓰기 - 내 문의 관리로 스크롤
                const myInquiriesSection = document.getElementById('my-inquiries');

                if (myInquiriesSection) {
                    // main-content 요소를 스크롤해야 할 수도 있음
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        // main-content 내에서의 상대적 위치 계산
                        const sectionTop = myInquiriesSection.offsetTop;
                        const currentScroll = mainContent.scrollTop;
                        const targetScroll = sectionTop - 80; // 80px 여백

                        // 부드러운 스크롤 애니메이션
                        const startTime = Date.now();
                        const duration = 800;
                        const distance = targetScroll - currentScroll;

                        function animateScroll() {
                            const elapsed = Date.now() - startTime;
                            const progress = Math.min(elapsed / duration, 1);

                            // easeInOutCubic
                            const easing =
                                progress < 0.5
                                    ? 4 * progress * progress * progress
                                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                            mainContent.scrollTop = currentScroll + distance * easing;

                            if (progress < 1) {
                                requestAnimationFrame(animateScroll);
                            } else {
                                // 스크롤 완료 후 새 문의하기 버튼에 포커스 및 애니메이션
                                const newInquiryBtn = document.getElementById('newInquiryBtn');
                                if (newInquiryBtn) {
                                    newInquiryBtn.focus();
                                    newInquiryBtn.style.animation = 'pulse 1s ease-in-out';
                                    setTimeout(() => {
                                        newInquiryBtn.style.animation = '';
                                    }, 1000);
                                }
                            }
                        }

                        requestAnimationFrame(animateScroll);
                    }
                }
            } else if (href === '#live-chat') {
                e.preventDefault();
                // 실시간문의 팝업 열기
                openLiveChatModal();
            }
        });
    }

    // 이용가이드 박스 클릭 이벤트
    const guideQuickItem = document.getElementById('guideQuickItem');
    if (guideQuickItem) {
        guideQuickItem.addEventListener('click', (e) => {
            e.preventDefault();
            openGuideModal();
        });
    }

    // 오픈채팅방 안내 박스 클릭 이벤트
    const openchatQuickItem = document.getElementById('openchatQuickItem');
    if (openchatQuickItem) {
        openchatQuickItem.addEventListener('click', (e) => {
            e.preventDefault();
            openOpenchatModal();
        });
    }

    // 이용가이드 모달 관련 요소
    const guideModal = document.getElementById('guideModal');
    const guideModalClose = document.getElementById('guideModalClose');
    const guideTabs = document.querySelectorAll('.guide-tab');
    const guidePanels = document.querySelectorAll('.guide-panel');

    // 이용가이드 모달 열기
    function openGuideModal() {
        if (guideModal) {
            guideModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // 이용가이드 모달 닫기
    function closeGuideModal() {
        if (guideModal) {
            guideModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // 모달 닫기 버튼 이벤트
    if (guideModalClose) {
        guideModalClose.addEventListener('click', closeGuideModal);
    }

    // 모달 외부 클릭 시 닫기
    if (guideModal) {
        guideModal.addEventListener('click', (e) => {
            if (e.target === guideModal) {
                closeGuideModal();
            }
        });
    }

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && guideModal && guideModal.classList.contains('active')) {
            closeGuideModal();
        }
    });

    // 가이드 탭 전환 기능
    guideTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // 모든 탭과 패널 비활성화
            guideTabs.forEach((t) => t.classList.remove('active'));
            guidePanels.forEach((p) => p.classList.remove('active'));

            // 클릭한 탭과 해당 패널 활성화
            tab.classList.add('active');
            const targetPanel = document.getElementById(targetTab + 'Panel');
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    // URL 해시가 있으면 해당 섹션으로 부드럽게 스크롤
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        setTimeout(() => {
            window.smoothScrollTo(targetId, 80);
        }, 100);
    }

    // 내 문의 관리 섹션 초기화
    initMyInquiries();

    // 실시간문의 모달 초기화
    initLiveChatModal();

    // 오픈채팅방 모달 초기화
    initOpenchatModal();
});

// 오픈채팅방 모달 기능
function initOpenchatModal() {
    const openchatModal = document.getElementById('openchatModal');
    const openchatModalClose = document.getElementById('openchatModalClose');

    // 전역 사용자 정보 사용
    const userInfo = globalUserInfo;

    // 모달 닫기 버튼
    if (openchatModalClose) {
        openchatModalClose.addEventListener('click', closeOpenchatModal);
    }

    // 모달 외부 클릭 시 닫기
    if (openchatModal) {
        openchatModal.addEventListener('click', (e) => {
            if (e.target === openchatModal) {
                closeOpenchatModal();
            }
        });
    }

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && openchatModal && openchatModal.classList.contains('active')) {
            closeOpenchatModal();
        }
    });

    // 오픈채팅방 입장 버튼 이벤트
    const roomJoinBtns = document.querySelectorAll('.room-join-btn');
    roomJoinBtns.forEach((btn) => {
        const roomType = btn.dataset.room;

        // 매니저는 모든 채팅방 접근 가능
        if (!userInfo.isManager) {
            // 버튼 활성화/비활성화 처리
            if (roomType === 'planning') {
                // 기획방은 기획파트 실무자만 가능 - 항상 인증코드 요청하기 버튼 표시
                btn.innerHTML = '<i class="fas fa-key"></i><span>인증코드 요청하기</span>';
                btn.disabled = false; // 버튼은 활성화 상태로 유지
            } else if (roomType === 'sales') {
                // 영업방은 영업파트만 가능
                if (userInfo.memberCategory !== 'sales' && userInfo.memberCategory !== 'business') {
                    btn.disabled = true;
                }
            } else if (roomType === 'consultant') {
                // 청약상담사방은 청약상담 파트만 가능
                if (
                    userInfo.memberCategory !== 'consultant' &&
                    userInfo.memberCategory !== 'business'
                ) {
                    btn.disabled = true;
                }
            }
            // 비즈니스방은 모든 회원 가능
        }

        btn.addEventListener('click', function () {
            const roomUrl = this.dataset.url;

            if (roomType === 'planning' && !userInfo.isManager) {
                // 매니저가 아닌 경우 기획실무자 소통방 참여코드 문의 - 실시간문의 팝업 열기
                closeOpenchatModal(); // 현재 모달 닫기
                setTimeout(() => {
                    openLiveChatModal();
                    // 오픈채팅방 참여 문의 자동 선택
                    setTimeout(() => {
                        const openchatInquiryBtn = document.querySelector(
                            '.inquiry-type-btn[data-type="오픈채팅방 참여 문의"]'
                        );
                        if (openchatInquiryBtn) {
                            openchatInquiryBtn.click();
                        }
                    }, 100);
                }, 300);
            } else if (roomUrl || (roomType === 'planning' && userInfo.isManager)) {
                // 다른 방은 바로 입장
                window.open(roomUrl, '_blank');
            }
        });
    });
}

// 오픈채팅방 모달 열기
function openOpenchatModal() {
    const openchatModal = document.getElementById('openchatModal');
    if (openchatModal) {
        openchatModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// 오픈채팅방 모달 닫기
function closeOpenchatModal() {
    const openchatModal = document.getElementById('openchatModal');
    if (openchatModal) {
        openchatModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 내 문의 관리 기능
function initMyInquiries() {
    const inquiryTabs = document.querySelectorAll('.inquiry-tab');
    const inquiryList = document.getElementById('inquiryList');
    const newInquiryBtn = document.getElementById('newInquiryBtn');

    // 탭 클릭 이벤트
    inquiryTabs.forEach((tab) => {
        tab.addEventListener('click', async () => {
            inquiryTabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            // 데이터 재로드 전에 빠르게 UI 반영
            renderInquiries(tab.dataset.status);
        });
    });

    // 새 문의하기 버튼
    if (newInquiryBtn) {
        newInquiryBtn.addEventListener('click', openInquiryModal);
    }

    // 문의 모달 초기화 (데이터 로드 포함)
    initInquiryModal();
}

// 전역 변수로 선언하여 다른 함수에서도 접근 가능하도록 함
let kakaoChatBtn;
let userInquiryContent = ''; // 사용자가 작성한 문의내용 저장
let hasCopied = false; // 복사하기 버튼 클릭 여부

// Supabase 클라이언트
let supabase;
let currentUser;

// Supabase 초기화
function initSupabase() {
    if (window.WaveSupabase) {
        supabase = window.WaveSupabase.getClient();
        currentUser = authService?.getCurrentUser();
        console.log('Support.js Supabase 초기화 완료');
        return true;
    }
    return false;
}

// 실시간문의 모달 기능
function initLiveChatModal() {
    const liveChatModal = document.getElementById('liveChatModal');
    const liveChatModalClose = document.getElementById('liveChatModalClose');
    const inquiryTypeBtns = document.querySelectorAll('.inquiry-type-btn');
    const inquiryFormSection = document.getElementById('inquiryFormSection');
    const selectedInquiryType = document.getElementById('selectedInquiryType');
    const inquiryTextArea = document.getElementById('inquiryTextArea');
    const copyInquiryBtn = document.getElementById('copyInquiryBtn');
    kakaoChatBtn = document.getElementById('kakaoChatBtn');

    let currentInquiryType = '';

    // 전역 사용자 정보 사용
    const userInfo = globalUserInfo;

    // 문의 유형 버튼 클릭
    inquiryTypeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            // 모든 버튼 비활성화
            inquiryTypeBtns.forEach((b) => b.classList.remove('active'));
            // 클릭한 버튼 활성화
            btn.classList.add('active');

            // 문의 유형 설정
            currentInquiryType = btn.dataset.type;
            selectedInquiryType.textContent = currentInquiryType;

            // 폼 섹션 표시
            inquiryFormSection.style.display = 'block';

            // 사용자 정보 표시
            document.getElementById('userId').textContent = userInfo.userId;
            document.getElementById('userNickname').textContent = userInfo.nickname;
            document.getElementById('phoneLastDigits').textContent = userInfo.phoneLastDigits;
            document.getElementById('memberType').textContent = userInfo.memberType;

            // 문의 양식 업데이트
            updateInquiryText();

            // 복사하기 초기화 및 버튼 비활성화
            hasCopied = false;
            kakaoChatBtn.disabled = true;
            kakaoChatBtn.style.opacity = '0.5';
            kakaoChatBtn.style.cursor = 'not-allowed';
        });
    });

    // 문의 양식 텍스트 업데이트
    function updateInquiryText() {
        // 현재 입력된 내용에서 사용자가 작성한 부분만 추출
        const currentValue = inquiryTextArea.value;
        const oldBaseText = inquiryTextArea.dataset.baseText || '';
        if (currentValue.startsWith(oldBaseText)) {
            userInquiryContent = currentValue.substring(oldBaseText.length);
        }

        let baseText = `[실시간문의]
문의유형: ${currentInquiryType}
아이디: ${userInfo.userId}
닉네임: ${userInfo.nickname}
연락처 뒤 4자리: ${userInfo.phoneLastDigits}
회원유형: ${userInfo.memberType}`;

        // 오픈채팅방 참여 문의인 경우 추가 정보 표시
        if (currentInquiryType === '오픈채팅방 참여 문의') {
            const memberCategoryMap = {
                planning: '분양기획',
                sales: '분양영업',
                consultant: '청약상담',
                business: '비즈니스',
            };
            baseText += `
회원분류: ${memberCategoryMap[userInfo.memberCategory] || '기타'}`;

            // 분양기획파트인 경우 실무자인증 여부 추가
            if (userInfo.memberCategory === 'planning') {
                baseText += `
실무자인증: ${userInfo.isVerified ? '완료' : '미완료'}`;
            }
        }

        baseText += `

문의내용: `;

        inquiryTextArea.value = baseText + userInquiryContent;
        inquiryTextArea.dataset.baseText = baseText; // 기본 텍스트 저장

        // 커서를 문의내용 끝으로 이동
        inquiryTextArea.focus();
        const cursorPos = baseText.length + userInquiryContent.length;
        inquiryTextArea.setSelectionRange(cursorPos, cursorPos);
    }

    // 텍스트 영역 입력 제한
    inquiryTextArea.addEventListener('input', (e) => {
        const baseText = inquiryTextArea.dataset.baseText || '';
        const currentValue = e.target.value;

        // 기본 텍스트가 삭제되었는지 확인
        if (!currentValue.startsWith(baseText)) {
            // 기본 텍스트를 복원하고 사용자 입력을 추가
            const userInput = currentValue.replace(baseText, '');
            e.target.value = baseText + userInput;
        }

        // 사용자가 작성한 내용 실시간 저장
        if (currentValue.startsWith(baseText)) {
            userInquiryContent = currentValue.substring(baseText.length);
        }
    });

    // 복사하기 버튼
    copyInquiryBtn.addEventListener('click', () => {
        inquiryTextArea.select();
        document.execCommand('copy');

        // 복사 완료 표시
        const originalText = copyInquiryBtn.innerHTML;
        copyInquiryBtn.innerHTML = '<i class="fas fa-check"></i><span>복사완료!</span>';
        copyInquiryBtn.style.backgroundColor = '#10b981';
        copyInquiryBtn.style.color = '#ffffff';

        // 복사했으므로 채팅문의 버튼 활성화
        hasCopied = true;
        kakaoChatBtn.disabled = false;
        kakaoChatBtn.style.opacity = '1';
        kakaoChatBtn.style.cursor = 'pointer';

        setTimeout(() => {
            copyInquiryBtn.innerHTML = originalText;
            copyInquiryBtn.style.backgroundColor = '';
            copyInquiryBtn.style.color = '';
        }, 2000);
    });

    // 1:1 채팅문의 버튼
    kakaoChatBtn.addEventListener('click', () => {
        if (hasCopied) {
            window.open('https://open.kakao.com/o/seGv8SVe', '_blank');
        } else {
            if (window.showWarningMessage) {
                showWarningMessage('먼저 복사하기 버튼을 눌러주세요.');
            } else {
                alert('먼저 복사하기 버튼을 눌러주세요.');
            }
        }
    });

    // 모달 닫기
    if (liveChatModalClose) {
        liveChatModalClose.addEventListener('click', closeLiveChatModal);
    }

    // 모달 외부 클릭 시 닫기
    if (liveChatModal) {
        liveChatModal.addEventListener('click', (e) => {
            if (e.target === liveChatModal) {
                closeLiveChatModal();
            }
        });
    }

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && liveChatModal && liveChatModal.classList.contains('active')) {
            closeLiveChatModal();
        }
    });
}

// 실시간문의 모달 열기
function openLiveChatModal() {
    const liveChatModal = document.getElementById('liveChatModal');
    if (liveChatModal) {
        liveChatModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // 폼 초기화
        document.getElementById('inquiryFormSection').style.display = 'none';
        document.querySelectorAll('.inquiry-type-btn').forEach((btn) => {
            btn.classList.remove('active');
        });
        document.getElementById('inquiryTextArea').value = '';
        userInquiryContent = ''; // 사용자 작성 내용 초기화

        // 복사 상태 및 버튼 상태 초기화
        hasCopied = false;
        if (kakaoChatBtn) {
            kakaoChatBtn.disabled = true;
            kakaoChatBtn.style.opacity = '0.5';
            kakaoChatBtn.style.cursor = 'not-allowed';
        }
    }
}

// 실시간문의 모달 닫기
function closeLiveChatModal() {
    const liveChatModal = document.getElementById('liveChatModal');
    if (liveChatModal) {
        liveChatModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 문의하기 모달 기능
let inquiryModal, detailModal;
let myInquiriesData = [];
let currentEditingId = null;
let currentInquiryIndex = 0;
let currentFilteredInquiries = [];

// 로딩 상태 관리
let isLoading = false;

// 전역 사용자 정보 (authService에서 가져옴)
function getGlobalUserInfo() {
    const localUser = authService?.getLocalUser() || {};
    const authUser = authService?.getCurrentUser();
    
    return {
        userId: localUser.username || localUser.id || 'guest',
        nickname: localUser.nickname || localUser.username || '사용자',
        phoneLastDigits: localUser.phone ? localUser.phone.slice(-4) : '0000',
        memberType: localUser.is_premium ? 'Plus 회원' : '일반 회원',
        memberCategory: getMemberCategory(localUser.member_type),
        isVerified: localUser.is_practitioner || false,
        isManager: localUser.role === 'admin' || false,
        authUserId: authUser?.id
    };
}

function getMemberCategory(memberType) {
    const categoryMap = {
        '분양기획': 'planning',
        '분양영업': 'sales', 
        '청약상담': 'consultant',
        '관계사': 'business',
        '일반': 'business'
    };
    return categoryMap[memberType] || 'business';
}

// 문의 데이터 로드 (Supabase에서)
async function loadInquiries() {
    if (!supabase || !currentUser) {
        console.error('Supabase 또는 사용자 정보가 없습니다');
        myInquiriesData = [];
        return;
    }
    
    try {
        setLoadingState(true);
        const userProfile = authService?.getLocalUser();
        
        if (!userProfile || !userProfile.id) {
            console.error('사용자 프로필을 찾을 수 없습니다');
            myInquiriesData = [];
            return;
        }
        
        const { data, error } = await supabase
            .from('inquiries')
            .select('*')
            .eq('user_id', userProfile.id)
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('문의 데이터 로드 실패:', error);
            if (window.showErrorMessage) {
                showErrorMessage('문의 목록을 불러올 수 없습니다.');
            }
            myInquiriesData = [];
            return;
        }
        
        myInquiriesData = data || [];
        console.log('문의 데이터 로드 성공:', myInquiriesData.length, '건');
        
    } catch (error) {
        console.error('문의 데이터 로드 중 오류:', error);
        myInquiriesData = [];
    } finally {
        setLoadingState(false);
    }
}

// 로딩 상태 설정
function setLoadingState(loading) {
    isLoading = loading;
    const inquiryList = document.getElementById('inquiryList');
    if (!inquiryList) return;
    
    if (loading) {
        inquiryList.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--gray-500);">
                <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p style="font-size: 16px;">문의 목록을 불러오고 있습니다...</p>
            </div>
        `;
    }
}

// 문의 모달 초기화
function initInquiryModal() {
    inquiryModal = document.getElementById('inquiryModal');
    detailModal = document.getElementById('inquiryDetailModal');

    // 모달 닫기 버튼
    const inquiryModalClose = document.getElementById('inquiryModalClose');
    const detailModalClose = document.getElementById('detailModalClose');
    const cancelBtn = document.getElementById('inquiryCancel');

    if (inquiryModalClose) {
        inquiryModalClose.addEventListener('click', closeInquiryModal);
    }

    if (detailModalClose) {
        detailModalClose.addEventListener('click', closeDetailModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeInquiryModal);
    }

    // 모달 외부 클릭 시 닫기
    if (inquiryModal) {
        inquiryModal.addEventListener('click', (e) => {
            if (e.target === inquiryModal) {
                closeInquiryModal();
            }
        });
    }

    if (detailModal) {
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) {
                closeDetailModal();
            }
        });
    }

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (inquiryModal && inquiryModal.classList.contains('active')) {
                closeInquiryModal();
            }
            if (detailModal && detailModal.classList.contains('active')) {
                closeDetailModal();
            }
        }
    });

    // 문의 제출 폼
    const inquirySubmitForm = document.getElementById('inquirySubmitForm');
    if (inquirySubmitForm) {
        inquirySubmitForm.addEventListener('submit', handleInquirySubmit);
    }

    // Supabase 초기화 및 데이터 로드
    if (initSupabase()) {
        loadInquiries().then(() => {
            renderInquiries();
        }).catch((error) => {
            console.error('문의 데이터 로드 실패:', error);
        });
    } else {
        console.error('Supabase 초기화 실패');
        // 재시도 로직
        setTimeout(async () => {
            if (initSupabase()) {
                await loadInquiries();
                renderInquiries();
            }
        }, 1000);
    }
}

// 문의 모달 열기
function openInquiryModal(inquiryId = null) {
    if (!inquiryModal) return;
    
    // 로그인 찍
    if (!authService?.isLoggedIn()) {
        if (window.showWarningMessage) {
            showWarningMessage('로그인이 필요한 기능입니다.');
        } else {
            alert('로그인이 필요한 기능입니다.');
        }
        return;
    }

    inquiryModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const form = document.getElementById('inquirySubmitForm');
    const modalTitle = inquiryModal.querySelector('#inquiryModalTitle');
    const submitBtn = document.getElementById('inquirySubmitText');

    if (inquiryId) {
        // 수정 모드
        currentEditingId = inquiryId;
        const inquiry = myInquiriesData.find((i) => i.id === inquiryId);

        if (inquiry) {
            modalTitle.textContent = '문의 수정';
            submitBtn.textContent = '수정하기';

            // 폼 데이터 채우기
            form.category.value = inquiry.category;
            form.title.value = inquiry.title;
            form.content.value = inquiry.content;
            form.inquiryId.value = inquiry.id;
        }
    } else {
        // 새 문의 모드
        currentEditingId = null;
        modalTitle.textContent = '새 문의하기';
        submitBtn.textContent = '문의 등록';
        form.reset();
        form.inquiryId.value = '';
    }
}

// 문의 모달 닫기
function closeInquiryModal() {
    if (!inquiryModal) return;

    inquiryModal.classList.remove('active');
    document.body.style.overflow = '';
    currentEditingId = null;

    // 폼 초기화
    const form = document.getElementById('inquirySubmitForm');
    if (form) {
        form.reset();
    }
}

// 문의 제출 처리 (Supabase)
async function handleInquirySubmit(e) {
    e.preventDefault();
    
    if (!supabase || !currentUser) {
        if (window.showErrorMessage) {
            showErrorMessage('로그인이 필요합니다.');
        }
        return;
    }
    
    const userProfile = authService?.getLocalUser();
    if (!userProfile || !userProfile.id) {
        if (window.showErrorMessage) {
            showErrorMessage('사용자 정보를 찾을 수 없습니다.');
        }
        return;
    }

    const formData = new FormData(e.target);
    const inquiryData = {
        category: formData.get('category'),
        title: formData.get('title'),
        content: formData.get('content'),
    };

    const inquiryId = formData.get('inquiryId');
    
    try {
        setLoadingState(true);
        
        if (inquiryId) {
            // 수정
            const { error } = await supabase
                .from('inquiries')
                .update({
                    ...inquiryData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', inquiryId)
                .eq('user_id', userProfile.id);
                
            if (error) {
                console.error('문의 수정 실패:', error);
                if (window.showErrorMessage) {
                    showErrorMessage('문의 수정에 실패했습니다.');
                }
                return;
            }
            
            if (window.showSuccessMessage) {
                showSuccessMessage('문의가 수정되었습니다.');
            }
        } else {
            // 새 문의
            const { error } = await supabase
                .from('inquiries')
                .insert([{
                    user_id: userProfile.id,
                    ...inquiryData,
                    status: 'waiting'
                }]);
                
            if (error) {
                console.error('문의 등록 실패:', error);
                if (window.showErrorMessage) {
                    showErrorMessage('문의 등록에 실패했습니다.');
                }
                return;
            }
            
            if (window.showSuccessMessage) {
                showSuccessMessage('문의가 등록되었습니다.');
            }
        }
        
        // 데이터 재로드 및 UI 업데이트
        await loadInquiries();
        renderInquiries();
        closeInquiryModal();
        
    } catch (error) {
        console.error('문의 처리 중 오류:', error);
        if (window.showErrorMessage) {
            showErrorMessage('처리 중 오류가 발생했습니다.');
        }
    } finally {
        setLoadingState(false);
    }
}

// 문의 목록 렌더링
function renderInquiries(status = 'all') {
    const inquiryList = document.getElementById('inquiryList');
    if (!inquiryList) return;
    
    // 로딩 중이면 추가 렌더링 방지
    if (isLoading) return;

    // 필터링
    const filtered =
        status === 'all' ? myInquiriesData : myInquiriesData.filter((i) => i.status === status);
    
    // 현재 필터링된 문의 목록 저장
    currentFilteredInquiries = filtered;

    if (filtered.length === 0) {
        inquiryList.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--gray-500);">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p style="font-size: 16px;">등록된 문의가 없습니다.</p>
                <p style="font-size: 14px; margin-top: 8px;">새 문의하기 버튼을 눌러 문의를 등록해주세요.</p>
            </div>
        `;
        return;
    }

    // 문의 목록 렌더링
    inquiryList.innerHTML = filtered
        .map((inquiry) => {
            const date = new Date(inquiry.created_at);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

            return `
            <div class="inquiry-item" data-inquiry-id="${inquiry.id}">
                <div class="inquiry-item-header">
                    <h3 class="inquiry-item-title">${inquiry.title}</h3>
                    <span class="inquiry-item-status ${inquiry.status}">
                        ${inquiry.status === 'waiting' ? '답변 대기' : '답변 완료'}
                    </span>
                </div>
                <p class="inquiry-item-content">${inquiry.content}</p>
                <div class="inquiry-item-meta">
                    <span><i class="fas fa-tag"></i> ${inquiry.category}</span>
                    <span><i class="fas fa-calendar"></i> ${dateStr}</span>
                </div>
            </div>
        `;
        })
        .join('');

    // 문의 아이템 클릭 이벤트 추가
    const inquiryItems = inquiryList.querySelectorAll('.inquiry-item');
    inquiryItems.forEach((item) => {
        item.addEventListener('click', function () {
            const inquiryId = parseInt(this.dataset.inquiryId);
            openInquiryDetail(inquiryId);
        });
    });
}

// 문의 상세보기 열기
function openInquiryDetail(inquiryId) {
    // 현재 문의 인덱스 찾기
    currentInquiryIndex = currentFilteredInquiries.findIndex(i => i.id === inquiryId);
    
    // 기존 모달이 열려있는지 확인
    if (detailModal && detailModal.classList.contains('active')) {
        updateInquiryDetailModal();
        return;
    }
    
    const inquiry = currentFilteredInquiries[currentInquiryIndex];
    if (!inquiry || !detailModal) return;

    const date = new Date(inquiry.created_at);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    // 상세 내용 채우기
    document.getElementById('detailCategory').textContent = inquiry.category;
    document.getElementById('detailTitle').textContent = inquiry.title;
    document.getElementById('detailDate').textContent = dateStr;
    document.getElementById('detailContent').textContent = inquiry.content;

    // 답변 섹션
    const answerSection = document.getElementById('answerSection');
    if (inquiry.answer) {
        answerSection.innerHTML = `
            <h3><i class="fas fa-comment-dots"></i> 답변</h3>
            <div class="inquiry-answer-content">${inquiry.answer}</div>
        `;
    } else {
        answerSection.innerHTML = `
            <h3><i class="fas fa-comment-dots"></i> 답변</h3>
            <p class="no-answer">아직 답변이 없습니다.</p>
        `;
    }

    // 수정/삭제 버튼 이벤트
    const editBtn = document.getElementById('inquiryEditBtn');
    const deleteBtn = document.getElementById('inquiryDeleteBtn');

    // 답변 완료된 문의는 수정/삭제 불가
    if (inquiry.status === 'completed' || inquiry.answer) {
        if (editBtn) {
            editBtn.disabled = true;
            editBtn.style.opacity = '0.5';
            editBtn.style.cursor = 'not-allowed';
            editBtn.title = '답변 완료된 문의는 수정할 수 없습니다';
        }
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.style.opacity = '0.5';
            deleteBtn.style.cursor = 'not-allowed';
            deleteBtn.title = '답변 완료된 문의는 삭제할 수 없습니다';
        }
    } else {
        if (editBtn) {
            editBtn.disabled = false;
            editBtn.style.opacity = '1';
            editBtn.style.cursor = 'pointer';
            editBtn.onclick = () => {
                closeDetailModal();
                openInquiryModal(inquiryId);
            };
        }

        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.style.opacity = '1';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.onclick = () => {
                if (confirm('정말 이 문의를 삭제하시겠습니까?')) {
                    deleteInquiry(inquiryId);
                }
            };
        }
    }

    // 모달 열기
    detailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 문의 상세 모달 내용만 업데이트
function updateInquiryDetailModal() {
    const inquiry = currentFilteredInquiries[currentInquiryIndex];
    if (!inquiry) return;
    
    const date = new Date(inquiry.created_at);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // 상세 내용 업데이트
    document.getElementById('detailCategory').textContent = inquiry.category;
    document.getElementById('detailTitle').textContent = inquiry.title;
    document.getElementById('detailDate').textContent = dateStr;
    document.getElementById('detailContent').textContent = inquiry.content;
    
    // 답변 섹션 업데이트
    const answerSection = document.getElementById('answerSection');
    if (inquiry.answer) {
        answerSection.innerHTML = `
            <h3><i class="fas fa-comment-dots"></i> 답변</h3>
            <div class="inquiry-answer-content">${inquiry.answer}</div>
        `;
    } else {
        answerSection.innerHTML = `
            <h3><i class="fas fa-comment-dots"></i> 답변</h3>
            <p class="no-answer">아직 답변이 없습니다.</p>
        `;
    }
    
    // 수정/삭제 버튼 이벤트 재설정
    const editBtn = document.getElementById('inquiryEditBtn');
    const deleteBtn = document.getElementById('inquiryDeleteBtn');
    
    if (editBtn) {
        editBtn.onclick = () => {
            closeDetailModal();
            openInquiryModal(inquiry.id);
        };
    }
    
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (confirm('정말 삭제하시겠습니까?')) {
                deleteInquiry(inquiry.id);
            }
        };
    }
    
    // 네비게이션 버튼 상태 업데이트
    updateInquiryNavButtons();
}

// 문의 네비게이션
function navigateInquiry(direction) {
    if (!currentFilteredInquiries || currentFilteredInquiries.length === 0) return;
    
    if (direction === 'prev' && currentInquiryIndex > 0) {
        currentInquiryIndex--;
    } else if (direction === 'next' && currentInquiryIndex < currentFilteredInquiries.length - 1) {
        currentInquiryIndex++;
    }
    
    updateInquiryDetailModal();
}

// 네비게이션 버튼 상태 업데이트
function updateInquiryNavButtons() {
    const prevBtn = document.querySelector('#inquiryDetailModal .modal-nav-btn:nth-child(1)');
    const nextBtn = document.querySelector('#inquiryDetailModal .modal-nav-btn:nth-child(2)');
    
    if (prevBtn) {
        prevBtn.disabled = currentInquiryIndex === 0;
    }
    if (nextBtn) {
        nextBtn.disabled = currentInquiryIndex === currentFilteredInquiries.length - 1;
    }
}

// 문의 상세보기 닫기
function closeDetailModal() {
    if (!detailModal) return;

    detailModal.classList.remove('active');
    document.body.style.overflow = '';
}

// 문의 삭제 (Supabase)
async function deleteInquiry(inquiryId) {
    if (!supabase || !currentUser) {
        if (window.showErrorMessage) {
            showErrorMessage('로그인이 필요합니다.');
        }
        return;
    }
    
    const userProfile = authService?.getLocalUser();
    if (!userProfile || !userProfile.id) {
        if (window.showErrorMessage) {
            showErrorMessage('사용자 정보를 찾을 수 없습니다.');
        }
        return;
    }
    
    try {
        setLoadingState(true);
        
        const { error } = await supabase
            .from('inquiries')
            .delete()
            .eq('id', inquiryId)
            .eq('user_id', userProfile.id);
            
        if (error) {
            console.error('문의 삭제 실패:', error);
            if (window.showErrorMessage) {
                showErrorMessage('문의 삭제에 실패했습니다.');
            }
            return;
        }
        
        if (window.showSuccessMessage) {
            showSuccessMessage('문의가 삭제되었습니다.');
        }
        
        // 데이터 재로드 및 UI 업데이트
        await loadInquiries();
        renderInquiries();
        closeDetailModal();
        
    } catch (error) {
        console.error('문의 삭제 중 오류:', error);
        if (window.showErrorMessage) {
            showErrorMessage('삭제 중 오류가 발생했습니다.');
        }
    } finally {
        setLoadingState(false);
    }
}

// 메시지 표시 함수들
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showWarningMessage(message) {
    showMessage(message, 'warning');
}

function showMessage(message, type = 'info') {
    // 기존 메시지 제거
    const existingMessage = document.querySelector('.message-overlay');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 메시지 오버레이 생성
    const overlay = document.createElement('div');
    overlay.className = `message-overlay ${type}`;
    
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    messageBox.textContent = message;
    
    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);
    
    // 애니메이션을 위해 약간 지연
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        overlay.classList.remove('show');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }, 3000);
    
    // 클릭하면 즉시 제거
    overlay.addEventListener('click', () => {
        overlay.classList.remove('show');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    });
}

// 전역에서 접근 가능하도록 window 객체에 추가
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage;
window.showWarningMessage = showWarningMessage;
