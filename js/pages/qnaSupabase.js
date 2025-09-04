/**
 * WAVE SPACE - Q&A 페이지 Supabase 연동
 * 질문답변 게시판의 실제 데이터 연동
 */

import { supabase } from '../config/supabase.js';
import { authService } from '../services/authService.js';
import { postService } from '../services/postService.js';

class QnaManager {
    constructor() {
        this.currentUser = null;
        this.questions = [];
        this.currentFilter = 'all'; // all, answered, unanswered
        this.currentPage = 1;
        this.questionsPerPage = 20;
        this.isLoading = false;
        this.init();
    }

    async init() {
        try {
            await authService.init();
            this.currentUser = await authService.getCurrentUser();
            
            this.setupEventListeners();
            await this.loadQuestions();
            this.updateAuthUI();
            await this.loadQnaStats();
        } catch (error) {
            console.error('Q&A 초기화 오류:', error);
        }
    }

    setupEventListeners() {
        // 질문하기 버튼
        const askBtn = document.querySelector('.ask-btn, .btn-ask, .question-write-btn');
        if (askBtn) {
            askBtn.addEventListener('click', () => this.showAskForm());
        }

        // 필터 버튼들
        const filterBtns = document.querySelectorAll('.filter-btn, .qna-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterQuestions(filter);
            });
        });

        // 검색 기능
        const searchInput = document.querySelector('#qna-search, .search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchQuestions(e.target.value);
                }
            });
        }

        // 정렬 옵션
        const sortSelect = document.querySelector('#sort-select, .sort-options');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortQuestions(e.target.value);
            });
        }
    }

    async updateAuthUI() {
        const userInfo = document.querySelector('.user-info, .profile-section');
        const authBtns = document.querySelector('.auth-buttons');

        if (this.currentUser) {
            // 로그인된 상태
            if (userInfo) {
                userInfo.innerHTML = `
                    <div class="user-profile">
                        <img src="${this.currentUser.profile_image_url || '/assets/default-avatar.png'}" 
                             alt="프로필" class="profile-avatar">
                        <div class="user-details">
                            <span class="username">${this.currentUser.username}</span>
                            <span class="user-points">${this.currentUser.points || 0} P</span>
                            <span class="user-level">Lv.${this.currentUser.level || 1}</span>
                        </div>
                    </div>
                `;
            }

            // 질문하기 버튼 활성화
            const askBtns = document.querySelectorAll('.ask-btn, .btn-ask');
            askBtns.forEach(btn => {
                btn.style.display = 'block';
                btn.disabled = false;
            });
        } else {
            // 로그아웃된 상태 
            if (authBtns) {
                authBtns.innerHTML = `
                    <a href="login.html" class="btn btn-primary">로그인</a>
                    <a href="signup.html" class="btn btn-secondary">회원가입</a>
                `;
            }

            // 질문하기 버튼 비활성화
            const askBtns = document.querySelectorAll('.ask-btn, .btn-ask');
            askBtns.forEach(btn => {
                btn.style.display = 'none';
            });
        }
    }

    async loadQuestions(reset = true) {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            this.showLoading();

            // Q&A 카테고리 ID 조회 (초기에 한번만)
            if (!this.qnaCategoryId) {
                const { data: categories } = await supabase
                    .from('post_categories')
                    .select('id')
                    .eq('slug', 'qna')
                    .single();
                this.qnaCategoryId = categories?.id;
            }

            const options = {
                page: reset ? 1 : this.currentPage,
                limit: this.questionsPerPage,
                category_id: this.qnaCategoryId,
                sort_by: 'created_at',
                sort_order: 'desc'
            };

            // 필터 적용
            if (this.currentFilter === 'answered') {
                options.has_answer = true;
            } else if (this.currentFilter === 'unanswered') {
                options.has_answer = false;
            }

            const result = await postService.getPosts(options);
            
            if (reset) {
                this.questions = result.posts;
                this.currentPage = 1;
            } else {
                this.questions = [...this.questions, ...result.posts];
                this.currentPage++;
            }

            this.renderQuestions();
            this.updatePagination(result.total, result.totalPages);

        } catch (error) {
            console.error('질문 로딩 오류:', error);
            this.showError('질문을 불러올 수 없습니다.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    async loadQnaStats() {
        try {
            // Q&A 통계 조회
            const [totalQuestions, answeredQuestions, myQuestions] = await Promise.all([
                supabase
                    .from('posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('category_id', this.qnaCategoryId),
                supabase
                    .from('posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('category_id', this.qnaCategoryId)
                    .gt('comment_count', 0),
                this.currentUser ? supabase
                    .from('posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('category_id', this.qnaCategoryId)
                    .eq('author_id', this.currentUser.id) : null
            ]);

            // 통계 업데이트
            this.updateQnaStats({
                total: totalQuestions.count || 0,
                answered: answeredQuestions.count || 0,
                unanswered: (totalQuestions.count || 0) - (answeredQuestions.count || 0),
                myQuestions: myQuestions?.count || 0
            });
        } catch (error) {
            console.error('Q&A 통계 로딩 오류:', error);
        }
    }

    updateQnaStats(stats) {
        const totalEl = document.querySelector('#total-questions, .total-count');
        const answeredEl = document.querySelector('#answered-questions, .answered-count');
        const unansweredEl = document.querySelector('#unanswered-questions, .unanswered-count');
        const myQuestionsEl = document.querySelector('#my-questions, .my-questions-count');

        if (totalEl) totalEl.textContent = stats.total;
        if (answeredEl) answeredEl.textContent = stats.answered;
        if (unansweredEl) unansweredEl.textContent = stats.unanswered;
        if (myQuestionsEl) myQuestionsEl.textContent = stats.myQuestions;

        // 답변률 계산
        const answerRate = stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0;
        const answerRateEl = document.querySelector('#answer-rate, .answer-rate');
        if (answerRateEl) answerRateEl.textContent = `${answerRate}%`;
    }

    renderQuestions() {
        const questionsContainer = document.querySelector('.qna-list, .questions-list, .posts-container');
        if (!questionsContainer) return;

        if (this.questions.length === 0) {
            questionsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-question-circle"></i>
                    <h3>질문이 없습니다</h3>
                    <p>궁금한 것이 있다면 첫 질문을 남겨보세요!</p>
                    ${this.currentUser ? '<button class="btn btn-primary" onclick="qnaManager.showAskForm()">질문하기</button>' : ''}
                </div>
            `;
            return;
        }

        const questionsHTML = this.questions.map(question => `
            <article class="qna-item ${question.comment_count > 0 ? 'answered' : 'unanswered'}" 
                     data-question-id="${question.id}">
                <div class="qna-header">
                    <div class="question-status">
                        ${question.comment_count > 0 ? 
        '<span class="status-badge answered">답변완료</span>' : 
        '<span class="status-badge unanswered">답변대기</span>'
}
                        ${question.is_pinned ? '<span class="pinned-badge">📌</span>' : ''}
                    </div>
                    <div class="question-meta">
                        <span class="question-author">${question.users?.username || '익명'}</span>
                        <span class="question-level">Lv.${question.users?.level || 1}</span>
                        <span class="question-date">${this.formatDate(question.created_at)}</span>
                    </div>
                </div>

                <div class="qna-content" onclick="qnaManager.viewQuestion('${question.id}')">
                    <h3 class="question-title">${question.title}</h3>
                    <p class="question-excerpt">${this.truncateText(question.content, 200)}</p>
                </div>

                <div class="qna-footer">
                    <div class="qna-stats">
                        <span class="stat">
                            <i class="fas fa-eye"></i>
                            조회 ${question.view_count || 0}
                        </span>
                        <span class="stat">
                            <i class="fas fa-comment"></i>
                            답변 ${question.comment_count || 0}
                        </span>
                        <span class="stat">
                            <i class="fas fa-heart"></i>
                            ${question.like_count || 0}
                        </span>
                    </div>
                    
                    <div class="qna-actions">
                        ${this.currentUser ? `
                            <button class="action-btn like-btn ${question.user_liked ? 'liked' : ''}" 
                                    onclick="qnaManager.toggleLike('${question.id}')">
                                <i class="fas fa-heart"></i>
                            </button>
                        ` : ''}
                        ${this.canEditQuestion(question) ? `
                            <button class="action-btn edit-btn" onclick="qnaManager.editQuestion('${question.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        ${this.currentUser && question.comment_count === 0 ? `
                            <button class="action-btn answer-btn" onclick="qnaManager.answerQuestion('${question.id}')">
                                <i class="fas fa-reply"></i>
                                답변하기
                            </button>
                        ` : ''}
                    </div>
                </div>
            </article>
        `).join('');

        questionsContainer.innerHTML = questionsHTML;
    }

    async filterQuestions(filter) {
        this.currentFilter = filter;
        
        // 필터 버튼 활성화 업데이트
        document.querySelectorAll('.filter-btn, .qna-filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        await this.loadQuestions(true);
    }

    async searchQuestions(query) {
        if (!query.trim()) {
            await this.loadQuestions(true);
            return;
        }

        try {
            this.showLoading();
            const result = await postService.searchPosts(query, {
                category_id: this.qnaCategoryId
            });
            
            this.questions = result.posts;
            this.renderQuestions();
        } catch (error) {
            console.error('검색 오류:', error);
            this.showError('검색 중 오류가 발생했습니다.');
        } finally {
            this.hideLoading();
        }
    }

    async viewQuestion(questionId) {
        try {
            // 조회수 증가
            await postService.incrementViewCount(questionId);
            
            // 질문 상세 페이지로 이동
            window.location.href = `qna-detail.html?id=${questionId}`;
        } catch (error) {
            console.error('질문 조회 오류:', error);
        }
    }

    async toggleLike(questionId) {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const result = await postService.toggleLike(questionId);
            
            // UI 업데이트
            const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
            const likeBtn = questionElement?.querySelector('.like-btn');
            const likeCount = questionElement?.querySelector('.stat i.fa-heart').parentNode;
            
            if (likeBtn && likeCount) {
                if (result.isLiked) {
                    likeBtn.classList.add('liked');
                } else {
                    likeBtn.classList.remove('liked');
                }
                likeCount.innerHTML = `<i class="fas fa-heart"></i> ${result.likeCount}`;
            }
        } catch (error) {
            console.error('좋아요 처리 오류:', error);
            this.showError('좋아요 처리 중 오류가 발생했습니다.');
        }
    }

    showAskForm() {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login.html';
            return;
        }

        // 질문하기 모달 표시 또는 페이지 이동
        window.location.href = 'post-write.html?category=qna&type=question';
    }

    async answerQuestion(questionId) {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        // 답변 작성 페이지로 이동
        window.location.href = `qna-answer.html?question=${questionId}`;
    }

    async editQuestion(questionId) {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        window.location.href = `post-edit.html?id=${questionId}&type=question`;
    }

    canEditQuestion(question) {
        if (!this.currentUser) return false;
        return question.author_id === this.currentUser.id || authService.isAdmin();
    }

    async sortQuestions(sortBy) {
        try {
            this.showLoading();
            
            const options = {
                page: 1,
                limit: this.questionsPerPage,
                category_id: this.qnaCategoryId,
                sort_by: sortBy === 'latest' ? 'created_at' : 
                    sortBy === 'popular' ? 'like_count' :
                        sortBy === 'views' ? 'view_count' : 'created_at',
                sort_order: 'desc'
            };

            // 필터 적용
            if (this.currentFilter === 'answered') {
                options.has_answer = true;
            } else if (this.currentFilter === 'unanswered') {
                options.has_answer = false;
            }

            const result = await postService.getPosts(options);
            this.questions = result.posts;
            this.currentPage = 1;
            
            this.renderQuestions();
            this.updatePagination(result.total, result.totalPages);
        } catch (error) {
            console.error('정렬 오류:', error);
            this.showError('정렬 중 오류가 발생했습니다.');
        } finally {
            this.hideLoading();
        }
    }

    updatePagination(total, totalPages) {
        const loadMoreBtn = document.querySelector('.load-more-btn, .btn-load-more');
        if (loadMoreBtn) {
            if (this.currentPage >= totalPages) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
                loadMoreBtn.textContent = `더 보기 (${this.questions.length}/${total})`;
            }
        }

        // 페이지 정보 업데이트
        const pageInfo = document.querySelector('.page-info, .qna-stats');
        if (pageInfo) {
            const answered = this.questions.filter(q => q.comment_count > 0).length;
            const answerRate = this.questions.length > 0 ? Math.round((answered / this.questions.length) * 100) : 0;
            
            pageInfo.innerHTML = `
                전체 ${total}개 질문 | 답변률 ${answerRate}%
            `;
        }
    }

    // 실시간 업데이트를 위한 구독 설정
    setupRealtimeSubscription() {
        if (!this.qnaCategoryId) return;

        // 새 질문 알림
        supabase
            .channel('qna-posts')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'posts',
                filter: `category_id=eq.${this.qnaCategoryId}`
            }, (payload) => {
                this.handleNewQuestion(payload.new);
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'posts',
                filter: `category_id=eq.${this.qnaCategoryId}`
            }, (payload) => {
                this.handleQuestionUpdate(payload.new);
            })
            .subscribe();

        // 새 답변 알림
        supabase
            .channel('qna-comments')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'comments'
            }, (payload) => {
                this.handleNewAnswer(payload.new);
            })
            .subscribe();
    }

    handleNewQuestion(newQuestion) {
        // 새 질문이 추가되면 목록 상단에 표시
        if (this.currentFilter === 'all' || this.currentFilter === 'unanswered') {
            this.questions.unshift(newQuestion);
            this.renderQuestions();
            this.showSuccess('새로운 질문이 등록되었습니다!');
        }
    }

    handleQuestionUpdate(updatedQuestion) {
        // 기존 질문 업데이트
        const index = this.questions.findIndex(q => q.id === updatedQuestion.id);
        if (index !== -1) {
            this.questions[index] = updatedQuestion;
            this.renderQuestions();
        }
    }

    handleNewAnswer(newComment) {
        // 답변이 달린 질문의 상태 업데이트
        const questionIndex = this.questions.findIndex(q => q.id === newComment.post_id);
        if (questionIndex !== -1) {
            this.questions[questionIndex].comment_count = (this.questions[questionIndex].comment_count || 0) + 1;
            this.renderQuestions();
        }
    }

    // 유틸리티 함수들
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;
        return date.toLocaleDateString('ko-KR');
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showLoading() {
        const loadingEl = document.querySelector('.loading, .qna-loading');
        if (loadingEl) {
            loadingEl.style.display = 'block';
        }
    }

    hideLoading() {
        const loadingEl = document.querySelector('.loading, .qna-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    showError(message) {
        if (window.notificationService) {
            window.notificationService.showToast(message, 'error');
        } else {
            alert(`오류: ${message}`);
        }
    }

    showSuccess(message) {
        if (window.notificationService) {
            window.notificationService.showToast(message, 'success');
        } else {
            alert(`성공: ${message}`);
        }
    }
}

// 전역 인스턴스 생성
window.qnaManager = new QnaManager();

// 기존 qna.js와의 호환성을 위한 전역 함수들
window.viewQuestion = (questionId) => window.qnaManager.viewQuestion(questionId);
window.toggleLike = (questionId) => window.qnaManager.toggleLike(questionId);
window.showAskForm = () => window.qnaManager.showAskForm();
window.editQuestion = (questionId) => window.qnaManager.editQuestion(questionId);
window.answerQuestion = (questionId) => window.qnaManager.answerQuestion(questionId);