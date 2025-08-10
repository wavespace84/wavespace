// hall-of-fame-enhanced.js - 50개 테스트 계정 기반 명예의 전당

import { mockUsers, getTopUsers } from './mockUsers.js';

// 월별 TOP 영업왕 데이터 생성
function generateMonthlyTop() {
    const months = ['2024년 12월', '2024년 11월', '2024년 10월', '2024년 9월'];
    const monthlyData = {};
    
    months.forEach(month => {
        // 각 월별로 랜덤하게 상위 10명 선택
        const shuffled = [...mockUsers].sort(() => 0.5 - Math.random());
        monthlyData[month] = shuffled.slice(0, 10).map((user, index) => ({
            rank: index + 1,
            name: user.name,
            nickname: user.nickname,
            avatar: user.avatar,
            team: ['강남지점', '서초지점', '송파지점', '마포지점', '용산지점'][Math.floor(Math.random() * 5)],
            contracts: Math.floor(Math.random() * 30) + 10,
            amount: (Math.floor(Math.random() * 50) + 20) + '억',
            points: Math.floor(Math.random() * 5000) + 10000,
            badge: index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'
        }));
    });
    
    return monthlyData;
}

// 분야별 전문가 데이터 생성
function generateExperts() {
    const categories = {
        '아파트 분양': mockUsers.slice(0, 5),
        '오피스텔': mockUsers.slice(5, 10),
        '상가/상업시설': mockUsers.slice(10, 15),
        '지식산업센터': mockUsers.slice(15, 20),
        '전원주택': mockUsers.slice(20, 25)
    };
    
    const experts = {};
    Object.keys(categories).forEach(category => {
        experts[category] = categories[category].map((user, index) => ({
            rank: index + 1,
            name: user.name,
            nickname: user.nickname,
            avatar: user.avatar,
            experience: Math.floor(Math.random() * 10) + 3 + '년',
            speciality: category,
            successRate: Math.floor(Math.random() * 30) + 70 + '%',
            totalContracts: Math.floor(Math.random() * 500) + 100
        }));
    });
    
    return experts;
}

// 누적 실적 랭킹 데이터 생성
function generateAllTimeRanking() {
    return mockUsers.map((user, index) => ({
        rank: index + 1,
        name: user.name,
        nickname: user.nickname,
        avatar: user.avatar,
        joinDate: user.joinDate,
        totalContracts: Math.floor(Math.random() * 1000) + 100,
        totalAmount: (Math.floor(Math.random() * 500) + 100) + '억',
        avgMonthly: Math.floor(Math.random() * 20) + 5 + '건',
        level: user.level,
        points: user.points
    })).sort((a, b) => b.totalContracts - a.totalContracts).slice(0, 20);
}

// 이달의 신인왕 데이터 생성
function generateRookies() {
    const rookies = mockUsers
        .filter(user => {
            const joinDate = new Date(user.joinDate);
            const monthsAgo = (new Date() - joinDate) / (1000 * 60 * 60 * 24 * 30);
            return monthsAgo < 6; // 6개월 미만 신입
        })
        .slice(0, 5)
        .map((user, index) => ({
            rank: index + 1,
            name: user.name,
            nickname: user.nickname,
            avatar: user.avatar,
            joinDate: user.joinDate,
            monthlyContracts: Math.floor(Math.random() * 10) + 3,
            growth: '+' + (Math.floor(Math.random() * 200) + 50) + '%',
            potential: ['매우 높음', '높음', '보통'][Math.floor(Math.random() * 2)]
        }));
    
    return rookies;
}

// 팀별 성과 데이터 생성
function generateTeamPerformance() {
    const teams = ['강남지점', '서초지점', '송파지점', '마포지점', '용산지점', '성동지점'];
    
    return teams.map((team, index) => ({
        rank: index + 1,
        teamName: team,
        memberCount: Math.floor(Math.random() * 10) + 5,
        monthlyTarget: Math.floor(Math.random() * 50) + 30 + '건',
        achievement: Math.floor(Math.random() * 50) + 80 + '%',
        totalContracts: Math.floor(Math.random() * 100) + 50,
        avgPerMember: (Math.floor(Math.random() * 10) + 5).toFixed(1)
    }));
}

// 데이터 초기화
const monthlyTop = generateMonthlyTop();
const experts = generateExperts();
const allTimeRanking = generateAllTimeRanking();
const rookies = generateRookies();
const teamPerformance = generateTeamPerformance();

// 현재 선택된 월
let currentMonth = '2024년 12월';
let currentCategory = '아파트 분양';

// 월별 TOP 렌더링
function renderMonthlyTop() {
    const container = document.querySelector('.monthly-top-list');
    if (!container) return;
    
    const data = monthlyTop[currentMonth] || [];
    
    container.innerHTML = data.map(item => `
        <div class="top-item ${item.rank <= 3 ? 'top-3' : ''}">
            <div class="rank-badge">${item.badge} ${item.rank}위</div>
            <div class="member-info">
                <span class="avatar">${item.avatar}</span>
                <div class="member-details">
                    <h4>${item.name} (${item.nickname})</h4>
                    <p>${item.team}</p>
                </div>
            </div>
            <div class="member-stats">
                <div class="stat">
                    <span class="label">계약</span>
                    <span class="value">${item.contracts}건</span>
                </div>
                <div class="stat">
                    <span class="label">금액</span>
                    <span class="value">${item.amount}</span>
                </div>
                <div class="stat">
                    <span class="label">포인트</span>
                    <span class="value">${item.points.toLocaleString()}P</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 전문가 렌더링
function renderExperts() {
    const container = document.querySelector('.experts-list');
    if (!container) return;
    
    const data = experts[currentCategory] || [];
    
    container.innerHTML = data.map(item => `
        <div class="expert-card">
            <div class="expert-avatar">${item.avatar}</div>
            <h4>${item.name}</h4>
            <p class="expert-nick">${item.nickname}</p>
            <div class="expert-stats">
                <span>경력 ${item.experience}</span>
                <span>성공률 ${item.successRate}</span>
            </div>
            <div class="expert-contracts">
                총 ${item.totalContracts}건 계약
            </div>
        </div>
    `).join('');
}

// 누적 랭킹 렌더링
function renderAllTimeRanking() {
    const container = document.querySelector('.alltime-ranking-list');
    if (!container) return;
    
    container.innerHTML = allTimeRanking.map(item => `
        <tr>
            <td>${item.rank}</td>
            <td>
                <div class="member-cell">
                    <span class="avatar-small">${item.avatar}</span>
                    ${item.name}
                </div>
            </td>
            <td>${item.nickname}</td>
            <td>${item.totalContracts}건</td>
            <td>${item.totalAmount}</td>
            <td>${item.avgMonthly}</td>
            <td><span class="level-badge ${item.level}">${item.level.toUpperCase()}</span></td>
        </tr>
    `).join('');
}

// 신인왕 렌더링
function renderRookies() {
    const container = document.querySelector('.rookies-list');
    if (!container) return;
    
    container.innerHTML = rookies.map(item => `
        <div class="rookie-card">
            <div class="rookie-rank">${item.rank}</div>
            <div class="rookie-info">
                <span class="avatar">${item.avatar}</span>
                <div>
                    <h4>${item.name}</h4>
                    <p>${item.nickname}</p>
                    <small>입사: ${item.joinDate}</small>
                </div>
            </div>
            <div class="rookie-stats">
                <div class="stat-item">
                    <span>월 실적</span>
                    <strong>${item.monthlyContracts}건</strong>
                </div>
                <div class="stat-item">
                    <span>성장률</span>
                    <strong class="growth">${item.growth}</strong>
                </div>
            </div>
        </div>
    `).join('');
}

// 팀 성과 렌더링
function renderTeamPerformance() {
    const container = document.querySelector('.team-performance-list');
    if (!container) return;
    
    container.innerHTML = teamPerformance.map(item => `
        <div class="team-card">
            <div class="team-header">
                <h4>${item.teamName}</h4>
                <span class="team-rank">${item.rank}위</span>
            </div>
            <div class="team-stats">
                <div class="stat-row">
                    <span>팀원</span>
                    <strong>${item.memberCount}명</strong>
                </div>
                <div class="stat-row">
                    <span>목표</span>
                    <strong>${item.monthlyTarget}</strong>
                </div>
                <div class="stat-row">
                    <span>달성률</span>
                    <strong class="${parseInt(item.achievement) >= 100 ? 'success' : ''}">${item.achievement}</strong>
                </div>
                <div class="stat-row">
                    <span>총 계약</span>
                    <strong>${item.totalContracts}건</strong>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${item.achievement}"></div>
            </div>
        </div>
    `).join('');
}

// DOMContentLoaded 이벤트
document.addEventListener('DOMContentLoaded', function() {
    console.log('hall-of-fame-enhanced.js 로드 완료');
    
    // 초기 렌더링
    renderMonthlyTop();
    renderExperts();
    renderAllTimeRanking();
    renderRookies();
    renderTeamPerformance();
    
    // 월 선택 이벤트
    const monthSelect = document.querySelector('.month-select');
    if (monthSelect) {
        monthSelect.addEventListener('change', function() {
            currentMonth = this.value;
            renderMonthlyTop();
        });
    }
    
    // 카테고리 탭 이벤트
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.textContent.trim();
            renderExperts();
        });
    });
    
    // 더보기 버튼 이벤트
    const viewMoreBtns = document.querySelectorAll('.view-more-btn');
    viewMoreBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('더 많은 정보를 보려면 플러스 멤버십에 가입하세요!');
        });
    });
});