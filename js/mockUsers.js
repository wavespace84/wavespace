// 50개의 테스트 사용자 계정 데이터
export const mockUsers = [
    { id: 1, name: '김철수', nickname: '강남전문가', points: 12500, level: 'gold', avatar: '👨‍💼', joinDate: '2024-01-15', lastActive: '2024-12-27', posts: 45, comments: 128 },
    { id: 2, name: '이영희', nickname: '부동산여왕', points: 15800, level: 'platinum', avatar: '👩‍💼', joinDate: '2023-11-20', lastActive: '2024-12-27', posts: 67, comments: 234 },
    { id: 3, name: '박민수', nickname: '서초구달인', points: 8900, level: 'silver', avatar: '🧑‍💼', joinDate: '2024-02-10', lastActive: '2024-12-26', posts: 28, comments: 89 },
    { id: 4, name: '정수진', nickname: '송파마스터', points: 11200, level: 'gold', avatar: '👤', joinDate: '2024-01-05', lastActive: '2024-12-27', posts: 38, comments: 156 },
    { id: 5, name: '최동현', nickname: '강북전문', points: 7600, level: 'silver', avatar: '👨', joinDate: '2024-03-12', lastActive: '2024-12-25', posts: 22, comments: 67 },
    { id: 6, name: '김서연', nickname: '마포구고수', points: 13400, level: 'gold', avatar: '👩', joinDate: '2023-12-08', lastActive: '2024-12-27', posts: 52, comments: 189 },
    { id: 7, name: '이준호', nickname: '용산프로', points: 9800, level: 'silver', avatar: '🧔', joinDate: '2024-02-28', lastActive: '2024-12-26', posts: 31, comments: 102 },
    { id: 8, name: '박지영', nickname: '성동구베테랑', points: 16500, level: 'platinum', avatar: '👩‍🦰', joinDate: '2023-10-15', lastActive: '2024-12-27', posts: 78, comments: 298 },
    { id: 9, name: '홍길동', nickname: '종로의달인', points: 10500, level: 'gold', avatar: '👨‍🦱', joinDate: '2024-01-20', lastActive: '2024-12-26', posts: 35, comments: 145 },
    { id: 10, name: '김나영', nickname: '중구전문가', points: 8200, level: 'silver', avatar: '👱‍♀️', joinDate: '2024-03-05', lastActive: '2024-12-25', posts: 24, comments: 78 },
    
    { id: 11, name: '이상현', nickname: '노원구달인', points: 11800, level: 'gold', avatar: '👨‍💻', joinDate: '2023-12-20', lastActive: '2024-12-27', posts: 42, comments: 167 },
    { id: 12, name: '박소영', nickname: '도봉구마스터', points: 6900, level: 'bronze', avatar: '👩‍💻', joinDate: '2024-04-01', lastActive: '2024-12-24', posts: 18, comments: 54 },
    { id: 13, name: '정현수', nickname: '은평구프로', points: 14200, level: 'platinum', avatar: '🧑‍🎓', joinDate: '2023-11-01', lastActive: '2024-12-27', posts: 61, comments: 245 },
    { id: 14, name: '김태영', nickname: '서대문전문', points: 9100, level: 'silver', avatar: '👨‍🎓', joinDate: '2024-02-15', lastActive: '2024-12-26', posts: 29, comments: 98 },
    { id: 15, name: '이민정', nickname: '양천구고수', points: 12700, level: 'gold', avatar: '👩‍🎓', joinDate: '2023-12-25', lastActive: '2024-12-27', posts: 48, comments: 178 },
    { id: 16, name: '박재현', nickname: '구로달인', points: 7300, level: 'bronze', avatar: '👷‍♂️', joinDate: '2024-03-20', lastActive: '2024-12-25', posts: 20, comments: 62 },
    { id: 17, name: '최수빈', nickname: '금천프로', points: 10800, level: 'gold', avatar: '👷‍♀️', joinDate: '2024-01-10', lastActive: '2024-12-26', posts: 36, comments: 143 },
    { id: 18, name: '정다은', nickname: '영등포마스터', points: 15300, level: 'platinum', avatar: '💼', joinDate: '2023-10-20', lastActive: '2024-12-27', posts: 72, comments: 267 },
    { id: 19, name: '김현우', nickname: '동작구전문', points: 8500, level: 'silver', avatar: '👨‍🏫', joinDate: '2024-02-20', lastActive: '2024-12-25', posts: 26, comments: 87 },
    { id: 20, name: '이서준', nickname: '관악프로', points: 11500, level: 'gold', avatar: '👩‍🏫', joinDate: '2024-01-01', lastActive: '2024-12-27', posts: 40, comments: 158 },
    
    { id: 21, name: '박하늘', nickname: '서초베테랑', points: 13900, level: 'platinum', avatar: '🙋‍♂️', joinDate: '2023-11-15', lastActive: '2024-12-27', posts: 58, comments: 213 },
    { id: 22, name: '정유진', nickname: '강남구고수', points: 9400, level: 'silver', avatar: '🙋‍♀️', joinDate: '2024-02-05', lastActive: '2024-12-26', posts: 30, comments: 104 },
    { id: 23, name: '김도윤', nickname: '송파달인', points: 7800, level: 'bronze', avatar: '🤵', joinDate: '2024-03-15', lastActive: '2024-12-24', posts: 21, comments: 71 },
    { id: 24, name: '이하린', nickname: '강동프로', points: 12300, level: 'gold', avatar: '👰', joinDate: '2023-12-15', lastActive: '2024-12-27', posts: 46, comments: 172 },
    { id: 25, name: '박시우', nickname: '광진구마스터', points: 10200, level: 'gold', avatar: '👨‍⚕️', joinDate: '2024-01-25', lastActive: '2024-12-26', posts: 34, comments: 138 },
    { id: 26, name: '최지아', nickname: '동대문전문', points: 8800, level: 'silver', avatar: '👩‍⚕️', joinDate: '2024-02-25', lastActive: '2024-12-25', posts: 27, comments: 92 },
    { id: 27, name: '정예준', nickname: '중랑구고수', points: 14700, level: 'platinum', avatar: '👨‍🔬', joinDate: '2023-10-25', lastActive: '2024-12-27', posts: 65, comments: 254 },
    { id: 28, name: '김서윤', nickname: '성북달인', points: 11100, level: 'gold', avatar: '👩‍🔬', joinDate: '2024-01-08', lastActive: '2024-12-26', posts: 37, comments: 151 },
    { id: 29, name: '이주원', nickname: '강북프로', points: 7500, level: 'bronze', avatar: '👨‍🚀', joinDate: '2024-03-08', lastActive: '2024-12-24', posts: 19, comments: 65 },
    { id: 30, name: '박지호', nickname: '도봉베테랑', points: 13200, level: 'gold', avatar: '👩‍🚀', joinDate: '2023-12-01', lastActive: '2024-12-27', posts: 50, comments: 186 },
    
    { id: 31, name: '홍민준', nickname: '노원구마스터', points: 9700, level: 'silver', avatar: '👨‍🎨', joinDate: '2024-02-01', lastActive: '2024-12-26', posts: 32, comments: 108 },
    { id: 32, name: '김윤서', nickname: '은평전문', points: 16200, level: 'platinum', avatar: '👩‍🎨', joinDate: '2023-10-10', lastActive: '2024-12-27', posts: 75, comments: 289 },
    { id: 33, name: '이도현', nickname: '서대문프로', points: 8400, level: 'silver', avatar: '👨‍🍳', joinDate: '2024-02-18', lastActive: '2024-12-25', posts: 25, comments: 83 },
    { id: 34, name: '박수아', nickname: '마포달인', points: 11900, level: 'gold', avatar: '👩‍🍳', joinDate: '2023-12-18', lastActive: '2024-12-27', posts: 43, comments: 164 },
    { id: 35, name: '정건우', nickname: '용산구고수', points: 7100, level: 'bronze', avatar: '🕵️‍♂️', joinDate: '2024-03-25', lastActive: '2024-12-24', posts: 17, comments: 58 },
    { id: 36, name: '김은지', nickname: '중구베테랑', points: 14500, level: 'platinum', avatar: '🕵️‍♀️', joinDate: '2023-11-05', lastActive: '2024-12-27', posts: 63, comments: 248 },
    { id: 37, name: '이성민', nickname: '종로프로', points: 10600, level: 'gold', avatar: '👮‍♂️', joinDate: '2024-01-12', lastActive: '2024-12-26', posts: 39, comments: 148 },
    { id: 38, name: '박예린', nickname: '성동구마스터', points: 8700, level: 'silver', avatar: '👮‍♀️', joinDate: '2024-02-22', lastActive: '2024-12-25', posts: 28, comments: 95 },
    { id: 39, name: '최준서', nickname: '광진달인', points: 12800, level: 'gold', avatar: '💂‍♂️', joinDate: '2023-12-10', lastActive: '2024-12-27', posts: 49, comments: 182 },
    { id: 40, name: '정아인', nickname: '동대문프로', points: 9300, level: 'silver', avatar: '💂‍♀️', joinDate: '2024-02-08', lastActive: '2024-12-26', posts: 33, comments: 112 },
    
    { id: 41, name: '김태훈', nickname: '중랑구전문', points: 15700, level: 'platinum', avatar: '👨‍🏭', joinDate: '2023-10-30', lastActive: '2024-12-27', posts: 70, comments: 276 },
    { id: 42, name: '이소민', nickname: '성북고수', points: 7700, level: 'bronze', avatar: '👩‍🏭', joinDate: '2024-03-10', lastActive: '2024-12-24', posts: 23, comments: 74 },
    { id: 43, name: '박준영', nickname: '강북달인', points: 11400, level: 'gold', avatar: '👨‍🔧', joinDate: '2024-01-18', lastActive: '2024-12-27', posts: 41, comments: 161 },
    { id: 44, name: '홍서영', nickname: '도봉프로', points: 8100, level: 'silver', avatar: '👩‍🔧', joinDate: '2024-02-28', lastActive: '2024-12-25', posts: 26, comments: 81 },
    { id: 45, name: '김민재', nickname: '노원베테랑', points: 13600, level: 'platinum', avatar: '👨‍💻', joinDate: '2023-11-25', lastActive: '2024-12-27', posts: 56, comments: 208 },
    { id: 46, name: '이지우', nickname: '은평구마스터', points: 10100, level: 'gold', avatar: '👩‍💻', joinDate: '2024-01-22', lastActive: '2024-12-26', posts: 35, comments: 135 },
    { id: 47, name: '박현서', nickname: '서대문달인', points: 7400, level: 'bronze', avatar: '🧑‍💼', joinDate: '2024-03-18', lastActive: '2024-12-24', posts: 20, comments: 69 },
    { id: 48, name: '정수현', nickname: '마포프로', points: 12100, level: 'gold', avatar: '👨‍🎤', joinDate: '2023-12-05', lastActive: '2024-12-27', posts: 44, comments: 169 },
    { id: 49, name: '최민서', nickname: '양천구전문', points: 9000, level: 'silver', avatar: '👩‍🎤', joinDate: '2024-02-12', lastActive: '2024-12-26', posts: 31, comments: 106 },
    { id: 50, name: '김지안', nickname: '구로구고수', points: 14000, level: 'platinum', avatar: '🧑‍🎤', joinDate: '2023-11-10', lastActive: '2024-12-27', posts: 59, comments: 221 }
];

// 사용자 레벨 정보
export const userLevels = {
    bronze: { min: 0, max: 7999, color: '#CD7F32', name: '브론즈' },
    silver: { min: 8000, max: 9999, color: '#C0C0C0', name: '실버' },
    gold: { min: 10000, max: 12999, color: '#FFD700', name: '골드' },
    platinum: { min: 13000, max: Infinity, color: '#E5E4E2', name: '플래티넘' }
};

// 랜덤 사용자 선택 함수
export function getRandomUsers(count) {
    const shuffled = [...mockUsers].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// ID로 사용자 찾기
export function getUserById(id) {
    return mockUsers.find(user => user.id === id);
}

// 레벨별 사용자 필터링
export function getUsersByLevel(level) {
    return mockUsers.filter(user => user.level === level);
}

// 활동 점수 기준 상위 사용자
export function getTopUsers(count = 10) {
    return [...mockUsers]
        .sort((a, b) => b.points - a.points)
        .slice(0, count);
}

// 최근 활동 사용자
export function getRecentlyActiveUsers(count = 10) {
    return [...mockUsers]
        .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
        .slice(0, count);
}