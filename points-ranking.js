// 전체랭킹 페이지 JavaScript

// 현재 사용자 ID (테스트용 - 실제로는 인증 시스템에서 가져와야 함)
const CURRENT_USER_ID = 1; // 김철수 (12500P, 44위 예상)

// 글로벌 상태
let allRankedUsers = [];
let myUserData = null;
let myRank = 0;

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeRanking();
    setupEventListeners();
});

// 초기화 함수
function initializeRanking() {
    console.log('전체랭킹 페이지 초기화 중...');
    
    // mockUsers는 이미 점수 순으로 정렬되어 있음
    allRankedUsers = [...mockUsers];
    
    // 내 사용자 데이터 찾기
    myUserData = allRankedUsers.find(user => user.id === CURRENT_USER_ID);
    myRank = allRankedUsers.findIndex(user => user.id === CURRENT_USER_ID) + 1;
    
    console.log('내 사용자 데이터:', myUserData);
    console.log('내 순위:', myRank);
    
    // 페이지 렌더링
    renderTopThree();
    renderRankingTable();
    renderMyRankCard();
    // renderStats(); // 통계 섹션 제거됨
    updateMyStats();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 내 순위 찾기 버튼들
    const scrollToMyRankBtns = document.querySelectorAll('#scrollToMyRank, #scrollToMyRankBtn');
    scrollToMyRankBtns.forEach(btn => {
        btn.addEventListener('click', scrollToMyRank);
    });
}


// TOP 3 렌더링
function renderTopThree() {
    const top3Users = allRankedUsers.slice(0, 3);
    
    top3Users.forEach((user, index) => {
        const rank = index + 1;
        const podiumItem = document.getElementById(`rank-${rank}`);
        
        if (podiumItem) {
            // 아바타 업데이트
            const avatar = podiumItem.querySelector('.user-avatar span');
            if (avatar) avatar.textContent = user.name.charAt(0);
            
            // 회원유형 업데이트
            const membershipType = podiumItem.querySelector('.membership-type');
            if (membershipType) {
                membershipType.textContent = getUserMembershipType(user);
            }
            
            // 닉네임 업데이트
            const nickname = podiumItem.querySelector('.nickname');
            if (nickname) nickname.textContent = user.nickname;
            
            // 대표배지 업데이트 (텍스트만 표시)
            const badgeContainer = podiumItem.querySelector('.representative-badge-text');
            if (badgeContainer && user.representativeBadge) {
                const badgeName = badgeContainer.querySelector('.badge-name');
                
                if (badgeName) {
                    badgeName.textContent = user.representativeBadge.name;
                }
            }
        }
    });
}

// 랭킹 테이블 렌더링 (1위~100위 전체)
function renderRankingTable() {
    const tableBody = document.getElementById('rankingTableBody');
    const outOf100Divider = document.getElementById('outOf100Divider');
    const myRankOutside = document.getElementById('myRankOutside');
    
    // 전체 100위 사용자 (1위부터 100위까지)
    const top100Users = allRankedUsers.slice(0, 100);
    
    let tableHTML = '';
    
    // 전체 1위~100위 렌더링
    top100Users.forEach((user, index) => {
        const rank = index + 1; // 1위부터 시작
        const isMyRank = user.id === CURRENT_USER_ID;
        const isTopThree = rank <= 3;
        const isTopSeven = rank >= 4 && rank <= 7;
        const rankChange = getRankChange(user.id, rank);
        const userBadge = getUserRepresentativeBadge(user);
        
        // 클래스 조합 - 4~7등 특별 처리 추가
        let rowClasses = 'ranking-row';
        if (isMyRank) rowClasses += ' my-ranking';
        if (isTopThree) rowClasses += ' top-three-row';
        if (isTopThree) rowClasses += ` rank-${rank}`;
        if (isTopSeven) rowClasses += ' top-seven-row';
        
        tableHTML += `
            <div class="${rowClasses}" ${isMyRank ? 'id="myRankRow"' : ''}>
                <div class="col-rank">
                    ${isTopThree ? `<div class="rank-medal rank-${rank}">${rank}</div>` : rank}
                </div>
                <div class="col-user">
                    <div class="user-avatar">
                        <span>${user.name.charAt(0)}</span>
                    </div>
                    <div class="user-details">
                        <div class="user-membership-type">${getUserMembershipType(user)}</div>
                        <div class="nickname">${user.nickname}</div>
                    </div>
                </div>
                <div class="col-badge">
                    <div class="badge-display">
                        <span class="badge-name">ㅣ${userBadge.name}ㅣ</span>
                    </div>
                </div>
                <div class="col-points">${formatPoints(user.points)}</div>
                <div class="col-change">
                    <div class="rank-change rank-change-${rankChange.type}">
                        <span class="change-icon">${rankChange.icon}</span>
                        <span class="change-text">${rankChange.text}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
    
    // 100위권 밖에 내가 있는 경우
    if (myRank > 100) {
        outOf100Divider.style.display = 'block';
        myRankOutside.style.display = 'block';
        
        const rankChange = getRankChange(CURRENT_USER_ID, myRank);
        const userBadge = getUserRepresentativeBadge(myUserData);
        
        myRankOutside.innerHTML = `
            <div class="ranking-row my-ranking" id="myRankRow">
                <div class="col-rank">100위권 밖</div>
                <div class="col-user">
                    <div class="user-avatar">
                        <span>${myUserData.name.charAt(0)}</span>
                    </div>
                    <div class="user-details">
                        <div class="user-membership-type">${getUserMembershipType(myUserData)}</div>
                        <div class="nickname">${myUserData.nickname}</div>
                    </div>
                </div>
                <div class="col-badge">
                    <div class="badge-display">
                        <span class="badge-name">ㅣ${userBadge.name}ㅣ</span>
                    </div>
                </div>
                <div class="col-points">${formatPoints(myUserData.points)}</div>
                <div class="col-change">
                    <div class="rank-change rank-change-${rankChange.type}">
                        <span class="change-icon">${rankChange.icon}</span>
                        <span class="change-text">${rankChange.text}</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        outOf100Divider.style.display = 'none';
        myRankOutside.style.display = 'none';
    }
}

// 내 순위 카드 렌더링
function renderMyRankCard() {
    const myRankCard = document.getElementById('myRankCard');
    const rankStatus = document.getElementById('rankStatus');
    const myRankValue = document.getElementById('myRankValue');
    const myPointsValue = document.getElementById('myPointsValue');
    const nextRankPoints = document.getElementById('nextRankPoints');
    const weeklyChange = document.getElementById('weeklyChange');
    
    // 카드 스타일 변경
    if (myRank <= 100) {
        myRankCard.className = 'my-rank-card top-100';
        rankStatus.className = 'rank-status top-100';
        rankStatus.innerHTML = '<i class="fas fa-trophy"></i><span>TOP 100 진입!</span>';
    } else {
        myRankCard.className = 'my-rank-card out-of-100';
        rankStatus.className = 'rank-status challenge';
        rankStatus.innerHTML = '<i class="fas fa-target"></i><span>100위권 도전하세요!</span>';
    }
    
    // 순위 정보 업데이트
    if (myRank <= 100) {
        myRankValue.textContent = `${myRank}위`;
        // 다음 순위까지 필요한 포인트 계산
        if (myRank > 1) {
            const nextRankUser = allRankedUsers[myRank - 2];
            const pointsNeeded = nextRankUser.points - myUserData.points;
            nextRankPoints.textContent = pointsNeeded > 0 ? `${formatPoints(pointsNeeded)}` : '1등!';
        } else {
            nextRankPoints.textContent = '1등!';
        }
    } else {
        myRankValue.textContent = `100위권 밖`;
        // 100위까지 필요한 포인트 계산
        const rank100User = allRankedUsers[99];
        const pointsNeeded = rank100User.points - myUserData.points;
        nextRankPoints.textContent = `${formatPoints(pointsNeeded)}`;
    }
    
    myPointsValue.textContent = formatPoints(myUserData.points);
    weeklyChange.textContent = '▲2 (상승!)';
    weeklyChange.className = 'value change-up';
}

// 통계 정보 렌더링 (현재 사용 안함 - 통계 섹션 제거됨)
// function renderStats() {
//     const avgPoints = Math.round(allRankedUsers.reduce((sum, user) => sum + user.points, 0) / allRankedUsers.length);
//     const platinumCount = allRankedUsers.filter(user => user.level === 'platinum').length;
//     
//     document.getElementById('avgPoints').textContent = formatPoints(avgPoints);
//     document.getElementById('platinumCount').textContent = `${platinumCount}명`;
//     document.getElementById('topRiser').textContent = '+12';
// }

// 내 순위로 스크롤
function scrollToMyRank() {
    const myRankRow = document.getElementById('myRankRow');
    if (myRankRow) {
        myRankRow.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // 깜빡임 효과 제거 - 스크롤만 적용
    }
}

// 유틸리티 함수들
function formatPoints(points) {
    return points.toLocaleString() + 'P';
}

function getRandomChange() {
    const changes = [
        { type: 'up', text: '▲1' },
        { type: 'up', text: '▲2' },
        { type: 'up', text: '▲3' },
        { type: 'down', text: '▼1' },
        { type: 'down', text: '▼2' },
        { type: 'same', text: '━' },
        { type: 'up', text: 'NEW' }
    ];
    return changes[Math.floor(Math.random() * changes.length)];
}

// 모바일 대응을 위한 리사이즈 이벤트
window.addEventListener('resize', function() {
    // 모바일에서 내 순위 카드 위치 조정 등 필요시 추가
});

// 개발용 디버그 함수들
window.debugRanking = {
    getCurrentRank: () => myRank,
    getAllUsers: () => allRankedUsers,
    switchToUser: (userId) => {
        CURRENT_USER_ID = userId;
        initializeRanking();
    },
    getMyData: () => myUserData
};

// 전일대비 순위 변동 계산
function getRankChange(userId, currentRank) {
    // localStorage에서 전일 랭킹 데이터 가져오기
    const yesterdayRankingKey = 'yesterdayRanking';
    let yesterdayRanking = localStorage.getItem(yesterdayRankingKey);
    
    if (!yesterdayRanking) {
        // 전일 데이터가 없으면 랜덤하게 생성 (실제로는 서버에서 가져와야 함)
        yesterdayRanking = generateYesterdayRankingData();
        localStorage.setItem(yesterdayRankingKey, JSON.stringify(yesterdayRanking));
    } else {
        yesterdayRanking = JSON.parse(yesterdayRanking);
    }
    
    const yesterdayRank = yesterdayRanking[userId] || currentRank + Math.floor(Math.random() * 10) - 5;
    const change = yesterdayRank - currentRank;
    
    if (change > 0) {
        return {
            type: 'up',
            icon: '↑',
            text: `${change}`,
            change: change
        };
    } else if (change < 0) {
        return {
            type: 'down',
            icon: '↓', 
            text: `${Math.abs(change)}`,
            change: change
        };
    } else {
        return {
            type: 'same',
            icon: '━',
            text: '0',
            change: 0
        };
    }
}

// 전일 랭킹 데이터 생성 (테스트용)
function generateYesterdayRankingData() {
    const yesterdayRanking = {};
    allRankedUsers.forEach((user, index) => {
        const currentRank = index + 1;
        // 전일 순위는 현재 순위 기준으로 ±5 정도 변동
        const change = Math.floor(Math.random() * 11) - 5; // -5 ~ +5
        yesterdayRanking[user.id] = Math.max(1, currentRank + change);
    });
    return yesterdayRanking;
}

// 사용자 회원유형 가져오기
function getUserMembershipType(user) {
    // 사용자 ID에 따른 회원유형 매핑 (실제로는 서버에서 가져와야 함)
    const membershipTypes = {
        1: '분양영업',    // 김철수
        2: '분양기획',    // 박영희
        3: '분양영업',    // 이민수
        4: '분양기획',    // 최수진
        5: '분양영업',    // 강혜원
        6: '분양기획',    // 윤대성
        7: '분양영업',    // 조미영
        8: '분양기획',    // 신동욱
        9: '분양영업',    // 홍길동
        10: '분양기획',   // 임지현
        11: '분양영업',   // 장민호
        12: '분양기획'    // 서예린
    };
    
    // 나머지 사용자들은 랜덤으로 배정
    const defaultTypes = ['분양영업', '분양기획'];
    return membershipTypes[user.id] || defaultTypes[user.id % 2];
}

// 사용자의 대표 배지 가져오기
function getUserRepresentativeBadge(user) {
    // 순위에 따른 특별 배지 (1,2,3등 슈퍼리치 배지)
    const currentUserRank = allRankedUsers.findIndex(u => u.id === user.id) + 1;
    
    if (currentUserRank === 1) {
        return {
            name: '슈퍼리치 1등',
            icon: 'fa-crown',
            color: 'gold'
        };
    } else if (currentUserRank === 2) {
        return {
            name: '슈퍼리치 2등', 
            icon: 'fa-medal',
            color: 'silver'
        };
    } else if (currentUserRank === 3) {
        return {
            name: '슈퍼리치 3등',
            icon: 'fa-award',
            color: 'bronze'
        };
    }
    
    // 사용자가 설정한 대표 배지가 있으면 우선 표시
    if (user.representativeBadge) {
        return {
            name: user.representativeBadge.name,
            icon: user.representativeBadge.icon,
            color: user.representativeBadge.color
        };
    }
    
    // 레벨별 기본 배지
    const levelBadges = {
        'platinum': { name: '플래티넘', icon: 'fa-gem', color: '#9CA3AF' },
        'gold': { name: '골드', icon: 'fa-star', color: '#F59E0B' },
        'silver': { name: '실버', icon: 'fa-certificate', color: '#6B7280' },
        'bronze': { name: '브론즈', icon: 'fa-medal', color: '#CD7F32' },
        'iron': { name: '아이언', icon: 'fa-shield-alt', color: '#4B5563' }
    };
    
    return levelBadges[user.level] || { name: '신규', icon: 'fa-user', color: '#9CA3AF' };
}

// 내 통계 정보 업데이트
function updateMyStats() {
    if (!myUserData) return;
    
    // 내 순위 업데이트
    const myRankDisplay = document.getElementById('myRankDisplay');
    if (myRankDisplay) {
        myRankDisplay.textContent = myRank <= 100 ? `${myRank}위` : '100위권 밖';
    }
    
    // 내 포인트 업데이트
    const myPointsDisplay = document.getElementById('myPointsDisplay');
    if (myPointsDisplay) {
        myPointsDisplay.textContent = formatPoints(myUserData.points);
    }
    
    // 순위 변동 현황 업데이트
    const myChangeDisplay = document.getElementById('myChangeDisplay');
    if (myChangeDisplay) {
        const rankChange = getRankChange(CURRENT_USER_ID, myRank);
        
        myChangeDisplay.innerHTML = `
            <span class="change-icon ${rankChange.type}">
                ${rankChange.icon === '↑' ? '▲' : rankChange.icon === '↓' ? '▼' : '━'}
            </span>
            <span class="change-value">${Math.abs(rankChange.change)}위</span>
            <span class="change-desc">(전일대비)</span>
        `;
    }
}

console.log('전체랭킹 페이지 JavaScript 로드 완료');