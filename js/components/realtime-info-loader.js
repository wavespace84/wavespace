/**
 * 실시간 정보 섹션 로더
 * 뉴스, 청약일정, 교육일정 데이터 로딩 및 표시
 */
class RealtimeInfoLoader {
    constructor() {
        this.refreshInterval = null;
        this.isInitialized = false;
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
            await this.loadAllContent();
            this.startAutoRefresh();
            this.isInitialized = true;
            console.log('[RealtimeInfoLoader] 실시간 정보 로더 초기화 완료');
        } catch (error) {
            console.error('[RealtimeInfoLoader] 초기화 오류:', error);
        }
    }

    async loadAllContent() {
        const promises = [
            this.loadNews(),
            this.loadSubscriptionSchedule(),
            this.loadEducationSchedule()
        ];

        await Promise.allSettled(promises);
    }

    async loadNews() {
        const container = document.getElementById('news-content');
        const updateTime = document.getElementById('news-update-time');
        
        if (!container) {
            console.warn('[RealtimeInfoLoader] 뉴스 컨테이너를 찾을 수 없습니다.');
            return;
        }

        try {
            // 임시 데이터 (실제로는 뉴스 API 연동)
            const mockNews = [
                {
                    title: "강남 집값 상승세, 분양시장에 미치는 영향은?",
                    source: "조선일보",
                    time: "2분전",
                    url: "#"
                },
                {
                    title: "청약홈 개편으로 분양 접수 시스템 변화",
                    source: "매일경제",
                    time: "15분전",
                    url: "#"
                },
                {
                    title: "2024년 하반기 분양시장 전망 발표",
                    source: "한국경제",
                    time: "32분전",
                    url: "#"
                },
                {
                    title: "수도권 신도시 분양가 상한제 완화 논의",
                    source: "연합뉴스",
                    time: "1시간전",
                    url: "#"
                }
            ];

            this.renderNews(container, mockNews);
            updateTime.textContent = '방금 전';

        } catch (error) {
            console.error('[RealtimeInfoLoader] 뉴스 로딩 실패:', error);
            this.showError(container, '뉴스를 불러오는 중 오류가 발생했습니다.');
        }
    }

    async loadSubscriptionSchedule() {
        const container = document.getElementById('subscription-content');
        
        if (!container) {
            console.warn('[RealtimeInfoLoader] 청약 일정 컨테이너를 찾을 수 없습니다.');
            return;
        }

        try {
            // 임시 데이터 (실제로는 청약홈 API 연동)
            const mockSchedule = [
                {
                    date: "12/18",
                    day: "월",
                    title: "힐스테이트 청라국제도시",
                    location: "인천 서구",
                    type: "일반분양"
                },
                {
                    date: "12/19",
                    day: "화",
                    title: "래미안 원베일리",
                    location: "서울 강남구",
                    type: "일반분양"
                },
                {
                    date: "12/20",
                    day: "수",
                    title: "푸르지오 하늘채",
                    location: "경기 성남시",
                    type: "임대분양"
                },
                {
                    date: "12/21",
                    day: "목",
                    title: "센트럴 아이파크",
                    location: "부산 해운대구",
                    type: "일반분양"
                }
            ];

            this.renderSchedule(container, mockSchedule);

        } catch (error) {
            console.error('[RealtimeInfoLoader] 청약 일정 로딩 실패:', error);
            this.showError(container, '청약 일정을 불러오는 중 오류가 발생했습니다.');
        }
    }

    async loadEducationSchedule() {
        const container = document.getElementById('education-content');
        
        if (!container) {
            console.warn('[RealtimeInfoLoader] 교육 일정 컨테이너를 찾을 수 없습니다.');
            return;
        }

        try {
            // 임시 데이터 (실제로는 대한주택건설협회 API 연동)
            const mockEducation = [
                {
                    title: "분양대행자 직무교육",
                    date: "12/22",
                    location: "서울교육센터",
                    status: "접수중"
                },
                {
                    title: "부동산 법규 실무과정",
                    date: "12/25",
                    location: "온라인 교육",
                    status: "접수중"
                },
                {
                    title: "분양마케팅 전략 세미나",
                    date: "12/28",
                    location: "부산교육센터",
                    status: "마감임박"
                },
                {
                    title: "신규 분양제도 안내교육",
                    date: "1/3",
                    location: "대구교육센터",
                    status: "접수예정"
                }
            ];

            this.renderEducation(container, mockEducation);

        } catch (error) {
            console.error('[RealtimeInfoLoader] 교육 일정 로딩 실패:', error);
            this.showError(container, '교육 일정을 불러오는 중 오류가 발생했습니다.');
        }
    }

    renderNews(container, newsData) {
        container.innerHTML = newsData.map(item => `
            <div class="news-item" onclick="window.open('${item.url}', '_blank')">
                <div class="item-time">${item.time}</div>
                <div class="item-content">
                    <div class="item-title">${item.title}</div>
                    <div class="item-source">${item.source}</div>
                </div>
            </div>
        `).join('');
    }

    renderSchedule(container, scheduleData) {
        container.innerHTML = scheduleData.map(item => `
            <div class="schedule-item">
                <div class="item-time">${item.date}<br><small>${item.day}</small></div>
                <div class="item-content">
                    <div class="item-title">${item.title}</div>
                    <div class="item-source">${item.location} · ${item.type}</div>
                </div>
            </div>
        `).join('');
    }

    renderEducation(container, educationData) {
        container.innerHTML = educationData.map(item => `
            <div class="education-item">
                <div class="item-time">${item.date}</div>
                <div class="item-content">
                    <div class="item-title">${item.title}</div>
                    <div class="item-source">${item.location} · 
                        <span class="status ${item.status === '마감임박' ? 'urgent' : ''}">${item.status}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showError(container, message) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    startAutoRefresh() {
        // 5분마다 자동 새로고침
        this.refreshInterval = setInterval(() => {
            if (this.isInitialized) {
                this.loadAllContent();
                console.log('[RealtimeInfoLoader] 자동 새로고침 실행');
            }
        }, 5 * 60 * 1000);
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.isInitialized = false;
        console.log('[RealtimeInfoLoader] 실시간 정보 로더 정리 완료');
    }
}

// 전역 접근 가능하도록 window 객체에 등록
window.RealtimeInfoLoader = RealtimeInfoLoader;

// 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (!window.realtimeInfoLoader) {
        window.realtimeInfoLoader = new RealtimeInfoLoader();
    }
});