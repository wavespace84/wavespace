// 명예의전당 페이지 JavaScript

// 5개 분야별 데이터
// 점수 집계 기준:
// - 출첵리더: 1일부터 매일 점수 집계 (1등 3000점, 2등 2900점 ~ 30등 1000점, 30등 밖 0점)
// - 소통리더: (게시글 * 3점) + (댓글 * 1점)
// - 답변리더: (답변 * 1점) + (채택 * 5점)
// - 정보리더: 월간 자료 업로드 포인트 획득 순위
// - 추천리더: 추천인당 2500점
const rankingData = {
    attendance: [
        { name: '장성실', score: 3000, change: 0, changeType: 'same' }, // 1등
        { name: '서매일', score: 2900, change: 1, changeType: 'up' }, // 2등
        { name: '남부지런', score: 2800, change: 1, changeType: 'down' }, // 3등
        { name: '강출석', score: 2700, change: 2, changeType: 'up' }, // 4등
        { name: '박정시', score: 2600, change: 1, changeType: 'down' }, // 5등
    ],
    communication: [
        { name: '최전문가', score: 356, change: 1, changeType: 'up' }, // 게시글 89개(267점) + 댓글 89개(89점)
        { name: '정과장', score: 307, change: 1, changeType: 'down' }, // 게시글 76개(228점) + 댓글 79개(79점)
        { name: '강대리', score: 260, change: 3, changeType: 'up' }, // 게시글 65개(195점) + 댓글 65개(65점)
        { name: '김영업', score: 234, change: 0, changeType: 'same' }, // 게시글 58개(174점) + 댓글 60개(60점)
        { name: '이기획', score: 203, change: 2, changeType: 'down' }, // 게시글 51개(153점) + 댓글 50개(50점)
    ],
    answer: [
        { name: '송선생', score: 936, change: 0, changeType: 'same' }, // 답변 156개(156점) + 채택 156개(780점)
        { name: '윤멘토', score: 858, change: 1, changeType: 'up' }, // 답변 143개(143점) + 채택 143개(715점)
        { name: '한교수', score: 792, change: 1, changeType: 'down' }, // 답변 132개(132점) + 채택 132개(660점)
        { name: '최전문가', score: 726, change: 2, changeType: 'up' }, // 답변 121개(121점) + 채택 121개(605점)
        { name: '정멘토', score: 660, change: 1, changeType: 'down' }, // 답변 110개(110점) + 채택 110개(550점)
    ],
    information: [
        { name: '오데이터', score: 45000, change: 2, changeType: 'up' }, // 월간 포인트 획득량
        { name: '유분석', score: 42000, change: 0, changeType: 'same' },
        { name: '구리서치', score: 38000, change: 2, changeType: 'down' },
        { name: '김정보', score: 35000, change: 1, changeType: 'up' },
        { name: '이자료', score: 32000, change: 1, changeType: 'down' },
    ],
    referral: [
        { name: '김영업', score: 80000, change: 2, changeType: 'up' }, // 32명 추천
        { name: '이기획', score: 70000, change: 1, changeType: 'down' }, // 28명 추천
        { name: '박팀장', score: 60000, change: 0, changeType: 'same' }, // 24명 추천
        { name: '최전문가', score: 55000, change: 3, changeType: 'up' }, // 22명 추천
        { name: '정과장', score: 50000, change: 1, changeType: 'down' }, // 20명 추천
    ],
};

// 포인트 보상 정보
const rewards = {
    1: 100000,
    2: 50000,
    3: 20000,
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('hall-of-fame.js 로드됨');

    // 초기화
    initializeHallOfFame();
});

// 현재 월 표시
function updateCurrentMonth() {
    const monthInfo = document.querySelector('.month-info span');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    monthInfo.textContent = `${year}년 ${month}월`;
}

// 실시간 데이터 업데이트 시뮬레이션
function simulateRealtimeUpdate() {
    const categories = ['referral', 'communication', 'answer', 'information', 'attendance'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryData = rankingData[randomCategory];

    // 이전 순위 저장
    const prevRanking = categoryData.map((user, idx) => ({
        name: user.name,
        index: idx,
    }));

    // 점수 변경 시뮬레이션
    if (Math.random() > 0.3) {
        // 2-5위 중에서 랜덤하게 선택 (1등은 제외)
        const candidateIndices = [1, 2, 3, 4]; // 2위~5위
        const randomIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
        let scoreIncrease;

        if (randomCategory === 'attendance') {
            // 출석리더는 점수가 고정되어 있으므로 변동 없음
            return;
        } else if (randomCategory === 'communication') {
            // 게시글 작성(3점) 또는 댓글(1점)
            scoreIncrease = Math.random() > 0.7 ? 3 : 1;
        } else if (randomCategory === 'answer') {
            // 답변(1점) 또는 채택(5점)
            scoreIncrease = Math.random() > 0.8 ? 5 : 1;
        } else if (randomCategory === 'information') {
            // 자료 업로드 포인트 (1000~5000점)
            scoreIncrease = Math.floor(Math.random() * 5 + 1) * 1000;
        } else if (randomCategory === 'referral') {
            // 추천 1명 (2500점)
            scoreIncrease = 2500;
        }

        categoryData[randomIndex].score += scoreIncrease;

        // 점수 기준으로 정렬
        categoryData.sort((a, b) => b.score - a.score);

        // 변동 정보 업데이트
        categoryData.forEach((user, newIndex) => {
            const prevData = prevRanking.find((p) => p.name === user.name);
            if (prevData) {
                const prevIndex = prevData.index;
                if (prevIndex !== newIndex) {
                    user.change = Math.abs(prevIndex - newIndex);
                    user.changeType = prevIndex > newIndex ? 'up' : 'down';
                } else {
                    user.change = 0;
                    user.changeType = 'same';
                }
            }
        });

        // 실제로 순위 변동이 있었을 때만 업데이트
        const hasChange = categoryData.some((user) => user.change > 0);
        if (hasChange) {
            console.log(`${randomCategory} 카테고리 순위 변동 발생!`);
            updateCategoryRankings(randomCategory, true);
        }
    }
}

// 카테고리별 랭킹 업데이트
function updateCategoryRankings(category, animate = false) {
    const categoryElement = document.querySelector(`[data-category="${category}"]`);
    if (!categoryElement) return;

    const rankingList = categoryElement.querySelector('.ranking-list-new');
    const data = rankingData[category];

    // 이전 1등 이름 저장
    const previousFirst = rankingList.querySelector('.ranking-item-new.first .name')?.textContent;

    // 애니메이션 시 카테고리 섹션에 updating 클래스 추가
    if (animate) {
        categoryElement.classList.add('updating');
        setTimeout(() => {
            categoryElement.classList.remove('updating');
        }, 500);
    }

    // 점수 기준으로 정렬 (높은 점수가 상위)
    data.sort((a, b) => b.score - a.score);

    // 애니메이션을 위한 기존 아이템 정보 저장
    const existingItems = rankingList.querySelectorAll('.ranking-item-new');
    const oldPositions = new Map();
    const oldScores = new Map();

    if (animate && existingItems.length > 0) {
        // 각 아이템의 현재 위치 저장
        existingItems.forEach((item, index) => {
            const name = item.querySelector('.name').textContent;
            const rect = item.getBoundingClientRect();

            oldPositions.set(name, {
                top: rect.top,
                height: rect.height,
                oldIndex: index,
                element: item,
            });
        });
    }

    // 새로운 순위로 아이템 재생성
    const newElements = [];

    // 새로운 랭킹 아이템 생성 (상위 5명 표시)
    data.slice(0, 5).forEach((user, index) => {
        const rankClass =
            index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : 'fourth-fifth';
        const badgeClass =
            index === 0
                ? 'gold'
                : index === 1
                    ? 'silver'
                    : index === 2
                        ? 'bronze'
                        : index < 5
                            ? 'blue'
                            : 'gray';
        const reward = rewards[index + 1] || 0; // 4, 5등은 포인트 없음

        const userBadge = getUserBadge(category, index);
        const changeIcon = getChangeIcon(user.changeType);

        // 카테고리별 점수 표시
        const scoreText = `${user.score.toLocaleString()}점`;

        const rankIcon =
            index === 0
                ? '<i class="fas fa-crown"></i>'
                : index === 1
                    ? '<i class="fas fa-medal"></i>'
                    : index === 2
                        ? '<i class="fas fa-award"></i>'
                        : `<span style="font-weight: 700; font-size: 16px;">${index + 1}</span>`; // 4, 5등은 숫자 표시

        const rankingItem = document.createElement('div');
        rankingItem.className = `ranking-item-new ${rankClass}`;
        rankingItem.setAttribute('data-category', category);
        rankingItem.setAttribute('data-name', user.name);
        rankingItem.innerHTML = `
            <div class="rank-badge ${badgeClass}">${rankIcon}</div>
            <div class="user-info-new">
                <div class="user-avatar">
                    <span>${user.name[0]}</span>
                </div>
                <div class="user-details">
                    <span class="name">${user.name}</span>
                </div>
            </div>
            <div class="score-display">${scoreText}</div>
            <div class="change-indicator ${user.changeType}">
                ${changeIcon}
                ${user.change > 0 ? `<span>${user.change}</span>` : ''}
            </div>
        `;

        newElements.push({ element: rankingItem, user: user, index: index });
    });

    // 애니메이션 처리
    if (animate && oldPositions.size > 0) {
        // 기존 아이템 모두 제거
        rankingList.innerHTML = '';

        // FLIP 애니메이션 적용
        newElements.forEach(({ element: newItem, user, index }) => {
            const oldData = oldPositions.get(user.name);

            if (oldData) {
                // 기존 사용자
                rankingList.appendChild(newItem);

                // 점수 변경 애니메이션은 제거 (HTML 구조와 다름)

                // 순위 변경 애니메이션
                if (oldData.oldIndex !== index) {
                    console.log(`${user.name}: ${oldData.oldIndex + 1}위 → ${index + 1}위`);

                    // 새 위치의 좌표 가져오기
                    const newRect = newItem.getBoundingClientRect();

                    // 이동 거리 계산
                    const deltaY = oldData.top - newRect.top;
                    console.log(`이동 거리: ${deltaY}px`);

                    // 즉시 이전 위치로 이동 (transition 없이)
                    newItem.style.transition = 'none';
                    newItem.style.transform = `translateY(${deltaY}px)`;

                    // 브라우저가 변경사항을 적용하도록 강제
                    newItem.offsetHeight;

                    // 애니메이션 시작
                    requestAnimationFrame(() => {
                        newItem.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                        newItem.style.transform = 'translateY(0)';

                        // 강조 효과
                        newItem.classList.add('rank-changed');
                        console.log(`${user.name}에 rank-changed 클래스 추가됨`);
                        setTimeout(() => {
                            newItem.classList.remove('rank-changed');
                            console.log(`${user.name}에서 rank-changed 클래스 제거됨`);
                        }, 1500);
                    });
                }

                // 1등이 변경되었는지 확인
                if (index === 0 && previousFirst && previousFirst !== user.name) {
                    newItem.classList.add('new-champion');
                    console.log(`새로운 1등 탄생! ${user.name}`);
                    setTimeout(() => {
                        newItem.classList.remove('new-champion');
                    }, 2000);
                }
            } else {
                // 새로 진입한 사용자
                rankingList.appendChild(newItem);
                newItem.style.opacity = '0';
                newItem.style.transform = 'translateX(-20px)';

                requestAnimationFrame(() => {
                    newItem.style.transition = 'all 0.6s ease';
                    newItem.style.opacity = '1';
                    newItem.style.transform = 'translateX(0)';
                });
            }
        });
    } else {
        // 애니메이션 없이 그냥 추가
        rankingList.innerHTML = '';
        newElements.forEach(({ element }) => {
            rankingList.appendChild(element);
        });
    }
}

// 점수 카운팅 애니메이션
function animateScoreCount(element, start, end) {
    const duration = 1000; // 1초 동안 애니메이션
    const startTime = Date.now();
    const diff = end - start;

    function updateScore() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // easing function for smooth animation
        const easeOutQuad = progress * (2 - progress);
        const currentScore = Math.floor(start + diff * easeOutQuad);

        element.textContent = `${currentScore}점`;

        if (progress < 1) {
            requestAnimationFrame(updateScore);
        } else {
            element.textContent = `${end}점`;
            // 완료시 번쩍임 효과
            element.style.color = 'var(--primary-blue)';
            element.style.fontWeight = '800';
            setTimeout(() => {
                element.style.color = '';
                element.style.fontWeight = '700';
            }, 300);
        }
    }

    updateScore();
}

// 대표 배지 생성 - 스타일가이드 활동배지 적용
function getUserBadge(category, index) {
    const badges = {
        referral: [
            { icon: 'fa-crown', label: '추천리더', color: 'gold' },
            { icon: 'fa-star', label: '추천스타', color: 'silver' },
            { icon: 'fa-award', label: '추천우수', color: 'bronze' },
            { icon: 'fa-user-plus', label: '추천활동', color: 'blue' },
            { icon: 'fa-users', label: '추천참여', color: 'gray' },
        ],
        communication: [
            { icon: 'fa-crown', label: '소통리더', color: 'gold' },
            { icon: 'fa-star', label: '소통스타', color: 'silver' },
            { icon: 'fa-award', label: '소통우수', color: 'bronze' },
            { icon: 'fa-comments', label: '소통활동', color: 'blue' },
            { icon: 'fa-comment', label: '소통참여', color: 'gray' },
        ],
        answer: [
            { icon: 'fa-crown', label: '답변리더', color: 'gold' },
            { icon: 'fa-star', label: '답변스타', color: 'silver' },
            { icon: 'fa-award', label: '답변우수', color: 'bronze' },
            { icon: 'fa-check-circle', label: '답변활동', color: 'blue' },
            { icon: 'fa-lightbulb', label: '답변참여', color: 'gray' },
        ],
        information: [
            { icon: 'fa-crown', label: '정보리더', color: 'gold' },
            { icon: 'fa-star', label: '정보스타', color: 'silver' },
            { icon: 'fa-award', label: '정보우수', color: 'bronze' },
            { icon: 'fa-database', label: '정보활동', color: 'blue' },
            { icon: 'fa-folder', label: '정보참여', color: 'gray' },
        ],
        attendance: [
            { icon: 'fa-crown', label: '출석리더', color: 'gold' },
            { icon: 'fa-star', label: '출석스타', color: 'silver' },
            { icon: 'fa-award', label: '출석우수', color: 'bronze' },
            { icon: 'fa-calendar-check', label: '출석활동', color: 'blue' },
            { icon: 'fa-calendar', label: '출석참여', color: 'gray' },
        ],
    };

    return badges[category][index] || badges[category][4];
}

// 변동 아이콘 생성
function getChangeIcon(changeType) {
    switch (changeType) {
    case 'up':
        return '<i class="fas fa-arrow-up"></i>';
    case 'down':
        return '<i class="fas fa-arrow-down"></i>';
    case 'same':
        return '<i class="fas fa-minus"></i>';
    default:
        return '';
    }
}

// 카테고리 데이터 속성 추가
function addCategoryDataAttributes() {
    const categories = document.querySelectorAll('.category-section');
    const categoryNames = ['attendance', 'communication', 'answer', 'information', 'referral'];

    categories.forEach((category, index) => {
        if (categoryNames[index]) {
            category.setAttribute('data-category', categoryNames[index]);
        }
    });
}

// 업데이트 애니메이션 스타일 추가
function addUpdateAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .category-section.updating {
            animation: pulse-update 0.5s ease-in-out;
        }
        
        @keyframes pulse-update {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        
        .ranking-item-new {
            position: relative;
        }
        
        .ranking-item-new.rank-changed {
            animation: highlight 1.5s ease-in-out;
        }
        
        @keyframes highlight {
            0% { 
                box-shadow: none;
            }
            50% { 
                box-shadow: 0 0 30px rgba(0, 102, 255, 0.4);
            }
            100% { 
                box-shadow: none;
            }
        }
        
        @keyframes slide-in {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// 역대 랭킹 데이터 (2025년) - 이름만 저장
const historyData = {
    '2025-01': {
        attendance: '장성실',
        communication: '최전문가',
        answer: '송선생',
        information: '오데이터',
        referral: '김영업',
    },
    '2025-02': {
        attendance: '서매일',
        communication: '정과장',
        answer: '윤멘토',
        information: '유분석',
        referral: '이기획',
    },
    '2025-03': {
        attendance: '장성실',
        communication: '강대리',
        answer: '송선생',
        information: '구리서치',
        referral: '박팀장',
    },
    '2025-04': {
        attendance: '남부지런',
        communication: '최전문가',
        answer: '한교수',
        information: '김정보',
        referral: '최전문가',
    },
    '2025-05': {
        attendance: '강출석',
        communication: '김영업',
        answer: '정멘토',
        information: '이자료',
        referral: '정과장',
    },
    '2025-06': {
        attendance: '박정시',
        communication: '이기획',
        answer: '송선생',
        information: '오데이터',
        referral: '김영업',
    },
    '2025-07': {
        attendance: '장성실',
        communication: '정과장',
        answer: '윤멘토',
        information: '유분석',
        referral: '이기획',
    },
    '2025-08': {
        attendance: '서매일',
        communication: '최전문가',
        answer: '한교수',
        information: '구리서치',
        referral: '박팀장',
    },
    '2025-09': {
        attendance: '남부지런',
        communication: '강대리',
        answer: '송선생',
        information: '김정보',
        referral: '최전문가',
    },
    '2025-10': {
        attendance: '강출석',
        communication: '김영업',
        answer: '정멘토',
        information: '이자료',
        referral: '정과장',
    },
    '2025-11': null, // 아직 미확정
    '2025-12': null, // 아직 미확정
};

// 초기화 함수
function initializeHallOfFame() {
    updateCurrentMonth();
    addCategoryDataAttributes();
    addUpdateAnimationStyles();

    // 모든 카테고리 초기 렌더링
    Object.keys(rankingData).forEach((category) => {
        updateCategoryRankings(category);
    });

    // 2초마다 실시간 업데이트 시뮬레이션 (순위 변동 확인)
    setInterval(simulateRealtimeUpdate, 2000);

    // 실시간 표시 (효과 제거)

    // 역대 랭킹 기능 초기화
    initializeHistoryFeature();
}

// 역대 랭킹 기능 초기화
function initializeHistoryFeature() {
    const historyBtn = document.getElementById('historyBtn');
    const historyModal = document.getElementById('historyModal');
    const historyModalClose = document.getElementById('historyModalClose');
    const monthTabs = document.getElementById('monthTabs');
    const historyContent = document.getElementById('historyContent');

    // 월 탭 생성
    createMonthTabs();

    // 플로팅 버튼 클릭 이벤트
    historyBtn.addEventListener('click', () => {
        historyModal.classList.add('active');
        // 기본적으로 가장 최근 확정된 월 표시
        const latestMonth = getLatestConfirmedMonth();
        showMonthHistory(latestMonth);
        setActiveTab(latestMonth);
    });

    // 모달 닫기
    historyModalClose.addEventListener('click', () => {
        historyModal.classList.remove('active');
    });

    // 모달 외부 클릭시 닫기
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.classList.remove('active');
        }
    });
}

// 월 탭 생성
function createMonthTabs() {
    const monthTabs = document.getElementById('monthTabs');
    const months = [
        '1월',
        '2월',
        '3월',
        '4월',
        '5월',
        '6월',
        '7월',
        '8월',
        '9월',
        '10월',
        '11월',
        '12월',
    ];

    months.forEach((month, index) => {
        const monthKey = `2025-${String(index + 1).padStart(2, '0')}`;
        const tab = document.createElement('button');
        tab.className = 'month-tab';
        tab.dataset.month = monthKey;
        tab.innerHTML = month;

        if (historyData[monthKey]) {
            tab.addEventListener('click', () => {
                showMonthHistory(monthKey);
                setActiveTab(monthKey);
            });
        } else {
            tab.disabled = true;
            tab.style.opacity = '0.4';
            tab.style.cursor = 'not-allowed';
        }

        monthTabs.appendChild(tab);
    });
}

// 활성 탭 설정
function setActiveTab(monthKey) {
    const tabs = document.querySelectorAll('.month-tab');
    tabs.forEach((tab) => {
        if (tab.dataset.month === monthKey) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

// 월별 역대 1등 표시 - 심플한 리스트 형태 (부드러운 전환 효과)
function showMonthHistory(monthKey) {
    const historyContent = document.getElementById('historyContent');
    const data = historyData[monthKey];

    // 페이드 아웃 효과
    historyContent.classList.add('transitioning');

    setTimeout(() => {
        if (!data) {
            historyContent.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-calendar-times"></i>
                    <p>아직 확정되지 않은 달입니다.</p>
                </div>
            `;
            historyContent.classList.remove('transitioning');
            historyContent.classList.add('active');
            return;
        }

        const categories = [
            { key: 'attendance', name: '출첵리더', icon: 'fa-calendar-check' },
            { key: 'communication', name: '소통리더', icon: 'fa-comments' },
            { key: 'answer', name: '답변리더', icon: 'fa-check-circle' },
            { key: 'information', name: '정보리더', icon: 'fa-database' },
            { key: 'referral', name: '추천리더', icon: 'fa-user-plus' },
        ];

        historyContent.innerHTML = categories
            .map((category) => {
                const winnerName = data[category.key];
                return `
                <div class="history-list-item">
                    <div class="history-category-icon">
                        <i class="fas ${category.icon}"></i>
                    </div>
                    <div class="history-category-info">
                        <span class="history-category-name">${category.name}</span>
                        <div class="winner-info">
                            <div class="winner-avatar">
                                <span>${winnerName[0]}</span>
                            </div>
                            <span class="winner-name">${winnerName}</span>
                        </div>
                    </div>
                    <div class="winner-badge">
                        <i class="fas fa-trophy"></i>
                        <span>1등</span>
                    </div>
                </div>
            `;
            })
            .join('');

        // 페이드 인 효과
        historyContent.classList.remove('transitioning');
        historyContent.classList.add('active');

        // 애니메이션 완료 후 클래스 정리
        setTimeout(() => {
            historyContent.classList.remove('active');
        }, 300);
    }, 150);
}

// 가장 최근 확정된 월 가져오기
function getLatestConfirmedMonth() {
    const months = Object.keys(historyData).filter((key) => historyData[key] !== null);
    return months[months.length - 1];
}
