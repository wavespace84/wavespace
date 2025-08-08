// 질문답변 페이지 JavaScript

// 디버그 로그
console.log('qna.js 파일 로드 시작');

document.addEventListener('DOMContentLoaded', function() {
    console.log('qna.js DOMContentLoaded 이벤트 발생');
    
    // 카테고리 탭
    const categoryTabs = document.querySelectorAll('.tab-btn');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const sortSelect = document.querySelector('.sort-select');
    const qnaItems = document.querySelectorAll('.qna-item');
    const pageBtns = document.querySelectorAll('.page-btn:not(:disabled)');

    console.log('카테고리 탭 개수:', categoryTabs.length);
    console.log('Q&A 아이템 개수:', qnaItems.length);

    // 카테고리 탭 클릭 이벤트
    if (categoryTabs.length > 0) {
        // 각 탭에 data-category 속성 설정
        const categoryMap = {
            '전체': 'all',
            '미답변': 'unanswered',
            '답변완료': 'answered',
            '인기질문': 'popular',
            '내질문': 'myquestions'
        };
        
        categoryTabs.forEach((tab) => {
            const tabText = tab.childNodes[0].textContent.trim();
            const category = categoryMap[tabText];
            if (category) {
                tab.setAttribute('data-category', category);
            }
        });
        
        // 초기 게시글 개수 업데이트
        updateCategoryCounts();
        
        categoryTabs.forEach((tab, index) => {
            console.log(`탭 ${index + 1} 등록:`, tab.textContent.trim());
            
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('탭 클릭됨:', this.textContent.trim());
                
                categoryTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const category = this.getAttribute('data-category');
                filterQuestions(category);
            });
        });
    } else {
        console.error('카테고리 탭을 찾을 수 없습니다!');
    }

    // 검색 기능
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    function performSearch() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            console.log(`검색어: ${searchTerm}`);
            // 실제 검색 로직 구현
        }
    }

    // 정렬 변경
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            console.log(`정렬 기준: ${sortBy}`);
            // 정렬 로직 구현
        });
    }

    // 질문하기 플로팅 버튼
    const askBtnFloat = document.querySelector('.ask-btn-float');
    if (askBtnFloat) {
        askBtnFloat.addEventListener('click', function() {
            console.log('질문하기 다이얼로그 열기...');
            alert('질문하기 기능은 로그인 후 이용 가능합니다.');
        });
    }

    // 투표 버튼 이벤트
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const voteCount = this.querySelector('.vote-count');
            if (voteCount) {
                let count = parseInt(voteCount.textContent);
                
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                    voteCount.textContent = count - 1;
                } else {
                    this.classList.add('active');
                    voteCount.textContent = count + 1;
                }
            }
        });
    });

    // 페이지네이션
    pageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const pageNumber = this.textContent;
            if (!this.classList.contains('page-dots')) {
                pageBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                loadPage(pageNumber);
            }
        });
    });

    // Q&A 아이템 클릭 이벤트
    qnaItems.forEach(item => {
        item.addEventListener('click', function() {
            const qnaId = this.dataset.qnaId;
            console.log(`Q&A 상세보기: ${qnaId}`);
            // Q&A 상세 페이지로 이동
        });
    });

    // 필터링 함수
    function filterQuestions(category) {
        console.log(`카테고리별 필터링: ${category}`);
        
        const questions = document.querySelectorAll('.qna-item');
        let visibleCount = 0;
        
        questions.forEach(question => {
            const status = question.querySelector('.qna-status');
            const isAnswered = status && status.classList.contains('answered');
            const isPopular = question.querySelector('.badge-popular');
            
            let shouldShow = false;
            
            switch(category) {
                case 'all':
                    shouldShow = true;
                    break;
                case 'unanswered':
                    shouldShow = !isAnswered;
                    break;
                case 'answered':
                    shouldShow = isAnswered;
                    break;
                case 'popular':
                    shouldShow = isPopular !== null;
                    break;
                case 'myquestions':
                    // 로그인 기능이 구현되면 사용자의 질문만 필터링
                    shouldShow = false;
                    break;
                default:
                    shouldShow = true;
            }
            
            if (shouldShow) {
                question.style.display = '';
                visibleCount++;
            } else {
                question.style.display = 'none';
            }
        });
        
        // 질문이 없을 때 메시지 표시
        const qnaList = document.querySelector('.qna-list');
        let noQuestionsMessage = document.querySelector('.no-questions-message');
        
        if (visibleCount === 0) {
            if (!noQuestionsMessage) {
                noQuestionsMessage = document.createElement('div');
                noQuestionsMessage.className = 'no-questions-message';
                noQuestionsMessage.style.cssText = 'text-align: center; padding: 60px 20px; color: #666;';
                noQuestionsMessage.innerHTML = `
                    <i class="fas fa-question-circle" style="font-size: 48px; color: #ddd; margin-bottom: 16px; display: block;"></i>
                    <p style="font-size: 16px;">해당 카테고리에 질문이 없습니다.</p>
                `;
                qnaList.appendChild(noQuestionsMessage);
            }
            noQuestionsMessage.style.display = 'block';
        } else {
            if (noQuestionsMessage) {
                noQuestionsMessage.style.display = 'none';
            }
        }
        
        // 카테고리별 개수 업데이트
        updateCategoryCounts();
        
        console.log(`${category} 카테고리: ${visibleCount}개 질문 표시`);
    }
    
    // 카테고리별 질문 개수 업데이트
    function updateCategoryCounts() {
        const questions = document.querySelectorAll('.qna-item');
        const counts = {
            all: questions.length,
            unanswered: 0,
            answered: 0,
            popular: 0,
            myquestions: 0
        };
        
        questions.forEach(question => {
            const status = question.querySelector('.qna-status');
            const isAnswered = status && status.classList.contains('answered');
            const isPopular = question.querySelector('.badge-popular');
            
            if (isAnswered) {
                counts.answered++;
            } else {
                counts.unanswered++;
            }
            
            if (isPopular) {
                counts.popular++;
            }
        });
        
        // 탭의 숫자 업데이트
        categoryTabs.forEach(tab => {
            const category = tab.getAttribute('data-category');
            const countSpan = tab.querySelector('.count');
            
            if (countSpan && counts[category] !== undefined) {
                countSpan.textContent = counts[category];
            }
        });
        
        console.log('카테고리별 질문 개수:', counts);
    }

    // 페이지 로드 함수
    function loadPage(pageNumber) {
        console.log(`페이지 ${pageNumber} 로드 중...`);
        // 실제 페이지 로드 로직 구현
    }

    // 베스트 답변 토글
    document.querySelectorAll('.best-answer-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                this.innerHTML = '<i class="fas fa-star"></i> 베스트 답변';
            } else {
                this.classList.add('active');
                this.innerHTML = '<i class="fas fa-star"></i> 베스트 답변 취소';
            }
        });
    });

    // 답변하기 버튼
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('답변하기 버튼 클릭');
            alert('답변하기 기능은 로그인 후 이용 가능합니다.');
        });
    });
});