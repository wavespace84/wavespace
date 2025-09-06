/**
 * 구인구직 섹션 로더
 * 채용공고 데이터 로딩 및 카테고리 필터링
 */
class JobListingsLoader {
    constructor() {
        this.supabase = null;
        this.isInitialized = false;
        this.currentCategory = 'all';
        this.jobData = [];
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    async setup() {
        try {
            await this.waitForSupabase();
            await this.loadJobListings();
            this.setupCategoryButtons();
            this.isInitialized = true;
            console.log('[JobListingsLoader] 구인구직 로더 초기화 완료');
        } catch (error) {
            console.error('[JobListingsLoader] 초기화 오류:', error);
            this.loadMockData();
        }
    }

    async waitForSupabase() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5초 대기

            const checkSupabase = () => {
                attempts++;
                if (window.supabase) {
                    this.supabase = window.supabase;
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Supabase 로딩 실패'));
                } else {
                    setTimeout(checkSupabase, 100);
                }
            };

            checkSupabase();
        });
    }

    async loadJobListings() {
        try {
            // 최신 채용공고 로드 (활성 상태만)
            const { data, error } = await this.supabase
                .from('job_postings')
                .select(`
                    id, title, company_name, position_type, location, salary_range,
                    employment_type, required_experience, deadline, created_at, is_urgent,
                    company:companies(name, logo_url, is_verified)
                `)
                .eq('is_active', true)
                .gte('deadline', new Date().toISOString())
                .order('is_urgent', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(6);

            if (data && data.length > 0) {
                this.jobData = data;
                this.renderJobListings(data);
            } else {
                this.loadMockData();
            }
        } catch (error) {
            console.error('[JobListingsLoader] 채용공고 로딩 실패:', error);
            this.loadMockData();
        }
    }

    setupCategoryButtons() {
        const categoryButtons = document.querySelectorAll('.category-btn');
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // 활성 버튼 상태 변경
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // 카테고리 필터링
                const category = button.dataset.category;
                this.currentCategory = category;
                this.filterJobListings(category);
            });
        });
    }

    filterJobListings(category) {
        let filteredData = this.jobData;
        
        if (category !== 'all') {
            filteredData = this.jobData.filter(job => 
                job.position_type === category
            );
        }
        
        this.renderJobListings(filteredData);
    }

    renderJobListings(jobs) {
        const container = document.getElementById('job-listings-container');
        if (!container) return;

        if (jobs.length === 0) {
            container.innerHTML = `
                <div class="no-jobs">
                    <i class="fas fa-briefcase"></i>
                    <p>현재 해당 카테고리의 채용공고가 없습니다.</p>
                    <small>새로운 기회가 곧 등록될 예정입니다!</small>
                </div>
            `;
            return;
        }

        container.innerHTML = jobs.map(job => `
            <div class="job-item ${job.is_urgent ? 'urgent' : ''}" onclick="location.href='sales-recruit.html?job=${job.id}'">
                <div class="job-header">
                    <div class="job-company">
                        ${job.company?.logo_url ? 
                            `<img src="${job.company.logo_url}" alt="${job.company?.name || job.company_name}" class="company-logo">` : 
                            `<div class="company-logo-placeholder">${(job.company?.name || job.company_name).charAt(0)}</div>`
                        }
                        <div class="company-info">
                            <h4 class="company-name">
                                ${job.company?.name || job.company_name}
                                ${job.company?.is_verified ? '<i class="fas fa-check-circle verified"></i>' : ''}
                            </h4>
                            <span class="job-location">${job.location}</span>
                        </div>
                    </div>
                    <div class="job-badges">
                        ${job.is_urgent ? '<span class="urgent-badge">급구</span>' : ''}
                        <span class="type-badge ${job.position_type}">${this.getPositionTypeName(job.position_type)}</span>
                    </div>
                </div>

                <div class="job-content">
                    <h3 class="job-title">${job.title}</h3>
                    <div class="job-details">
                        <div class="job-detail">
                            <i class="fas fa-won-sign"></i>
                            <span>${job.salary_range || '협의'}</span>
                        </div>
                        <div class="job-detail">
                            <i class="fas fa-briefcase"></i>
                            <span>${this.getEmploymentTypeName(job.employment_type)}</span>
                        </div>
                        <div class="job-detail">
                            <i class="fas fa-user-tie"></i>
                            <span>${job.required_experience || '경력무관'}</span>
                        </div>
                    </div>
                </div>

                <div class="job-footer">
                    <div class="job-meta">
                        <span class="job-posted">${this.getTimeAgo(job.created_at)}</span>
                        <span class="job-deadline">마감 ${this.formatDeadline(job.deadline)}</span>
                    </div>
                    <button class="apply-btn">
                        지원하기 <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getPositionTypeName(type) {
        const typeMap = {
            planning: '분양기획',
            sales: '분양영업',
            consulting: '청약상담',
            partner: '관계사',
            general: '일반'
        };
        return typeMap[type] || type;
    }

    getEmploymentTypeName(type) {
        const typeMap = {
            fulltime: '정규직',
            contract: '계약직',
            parttime: '파트타임',
            freelance: '프리랜서'
        };
        return typeMap[type] || type;
    }

    getTimeAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now - past;
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) return '오늘';
        if (diffDays === 1) return '1일 전';
        if (diffDays < 7) return `${diffDays}일 전`;
        return `${Math.floor(diffDays / 7)}주 전`;
    }

    formatDeadline(deadlineString) {
        const deadline = new Date(deadlineString);
        const now = new Date();
        const diffMs = deadline - now;
        const diffDays = Math.ceil(diffMs / 86400000);

        if (diffDays <= 0) return '마감';
        if (diffDays === 1) return 'D-1';
        if (diffDays <= 7) return `D-${diffDays}`;
        
        return deadline.toLocaleDateString('ko-KR', { 
            month: 'numeric', 
            day: 'numeric' 
        });
    }

    loadMockData() {
        console.log('[JobListingsLoader] 임시 데이터 로딩 시작');
        
        const mockJobs = [
            {
                id: 1,
                title: "서울 강남권 래미안 분양기획 담당자 모집",
                company_name: "대한주택공사",
                position_type: "planning",
                location: "서울 강남구",
                salary_range: "연 4,500~6,000만원",
                employment_type: "fulltime",
                required_experience: "경력 3~7년",
                deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                is_urgent: true,
                company: { name: "대한주택공사", is_verified: true }
            },
            {
                id: 2,
                title: "분양영업 시니어 매니저 (인천 청라지구)",
                company_name: "현대건설",
                position_type: "sales",
                location: "인천 서구",
                salary_range: "연 5,000~7,500만원",
                employment_type: "fulltime",
                required_experience: "경력 5~10년",
                deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                is_urgent: false,
                company: { name: "현대건설", is_verified: true }
            },
            {
                id: 3,
                title: "청약상담 전문가 (분당/판교 신도시)",
                company_name: "삼성물산",
                position_type: "consulting",
                location: "경기 성남시",
                salary_range: "연 3,800~5,200만원",
                employment_type: "fulltime",
                required_experience: "경력 2~5년",
                deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                is_urgent: false,
                company: { name: "삼성물산", is_verified: true }
            },
            {
                id: 4,
                title: "관계사 협업 담당자 (부산 해운대 프로젝트)",
                company_name: "롯데건설",
                position_type: "partner",
                location: "부산 해운대구",
                salary_range: "연 4,200~5,800만원",
                employment_type: "contract",
                required_experience: "경력 3~8년",
                deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                is_urgent: true,
                company: { name: "롯데건설", is_verified: true }
            },
            {
                id: 5,
                title: "분양영업 팀장급 (김포 한강신도시)",
                company_name: "GS건설",
                position_type: "sales",
                location: "경기 김포시",
                salary_range: "연 6,000~8,000만원",
                employment_type: "fulltime",
                required_experience: "경력 7~12년",
                deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                is_urgent: false,
                company: { name: "GS건설", is_verified: true }
            },
            {
                id: 6,
                title: "분양기획 주임/대리 (광명시흥 신도시)",
                company_name: "포스코건설",
                position_type: "planning",
                location: "경기 광명시",
                salary_range: "연 3,500~4,800만원",
                employment_type: "fulltime",
                required_experience: "경력 1~4년",
                deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                is_urgent: false,
                company: { name: "포스코건설", is_verified: true }
            }
        ];

        this.jobData = mockJobs;
        this.renderJobListings(mockJobs);
    }

    destroy() {
        this.isInitialized = false;
        console.log('[JobListingsLoader] 구인구직 로더 정리 완료');
    }
}

// 전역 접근 가능하도록 window 객체에 등록
window.JobListingsLoader = JobListingsLoader;

// 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (!window.jobListingsLoader) {
        window.jobListingsLoader = new JobListingsLoader();
    }
});