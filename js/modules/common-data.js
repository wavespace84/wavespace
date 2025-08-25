// 공통 데이터 모듈 - 전체 프로젝트에서 사용하는 기준 데이터
// 전역 객체로 정의하여 모든 페이지에서 사용 가능

window.WaveSpaceData = window.WaveSpaceData || {};

// 지역 데이터 (광역시도 -> 시군구)
window.WaveSpaceData.regionData = {
    all: [],
    seoul: [
        '강남구',
        '강동구',
        '강북구',
        '강서구',
        '관악구',
        '광진구',
        '구로구',
        '금천구',
        '노원구',
        '도봉구',
        '동대문구',
        '동작구',
        '마포구',
        '서대문구',
        '서초구',
        '성동구',
        '성북구',
        '송파구',
        '양천구',
        '영등포구',
        '용산구',
        '은평구',
        '종로구',
        '중구',
        '중랑구',
    ],
    gyeonggi: [
        '가평군',
        '고양시',
        '과천시',
        '광명시',
        '광주시',
        '구리시',
        '군포시',
        '김포시',
        '남양주시',
        '동두천시',
        '부천시',
        '성남시',
        '수원시',
        '시흥시',
        '안산시',
        '안성시',
        '안양시',
        '양주시',
        '양평군',
        '여주시',
        '연천군',
        '오산시',
        '용인시',
        '의왕시',
        '의정부시',
        '이천시',
        '파주시',
        '평택시',
        '포천시',
        '하남시',
        '화성시',
    ],
    incheon: [
        '강화군',
        '계양구',
        '남동구',
        '동구',
        '미추홀구',
        '부평구',
        '서구',
        '연수구',
        '옹진군',
        '중구',
    ],
    busan: [
        '강서구',
        '금정구',
        '기장군',
        '남구',
        '동구',
        '동래구',
        '부산진구',
        '북구',
        '사상구',
        '사하구',
        '서구',
        '수영구',
        '연제구',
        '영도구',
        '중구',
        '해운대구',
    ],
    daegu: ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
    gwangju: ['광산구', '남구', '동구', '북구', '서구'],
    daejeon: ['대덕구', '동구', '서구', '유성구', '중구'],
    ulsan: ['남구', '동구', '북구', '울주군', '중구'],
    sejong: ['세종시'],
    gangwon: [
        '강릉시',
        '고성군',
        '동해시',
        '삼척시',
        '속초시',
        '양구군',
        '양양군',
        '영월군',
        '원주시',
        '인제군',
        '정선군',
        '철원군',
        '춘천시',
        '태백시',
        '평창군',
        '홍천군',
        '화천군',
        '횡성군',
    ],
    chungbuk: [
        '괴산군',
        '단양군',
        '보은군',
        '영동군',
        '옥천군',
        '음성군',
        '제천시',
        '증평군',
        '진천군',
        '청주시',
        '충주시',
    ],
    chungnam: [
        '계룡시',
        '공주시',
        '금산군',
        '논산시',
        '당진시',
        '보령시',
        '부여군',
        '서산시',
        '서천군',
        '아산시',
        '예산군',
        '천안시',
        '청양군',
        '태안군',
        '홍성군',
    ],
    jeonbuk: [
        '고창군',
        '군산시',
        '김제시',
        '남원시',
        '무주군',
        '부안군',
        '순창군',
        '완주군',
        '익산시',
        '임실군',
        '장수군',
        '전주시',
        '정읍시',
        '진안군',
    ],
    jeonnam: [
        '강진군',
        '고흥군',
        '곡성군',
        '광양시',
        '구례군',
        '나주시',
        '담양군',
        '목포시',
        '무안군',
        '보성군',
        '순천시',
        '신안군',
        '여수시',
        '영광군',
        '영암군',
        '완도군',
        '장성군',
        '장흥군',
        '진도군',
        '함평군',
        '해남군',
        '화순군',
    ],
    gyeongbuk: [
        '경산시',
        '경주시',
        '고령군',
        '구미시',
        '군위군',
        '김천시',
        '문경시',
        '봉화군',
        '상주시',
        '성주군',
        '안동시',
        '영덕군',
        '영양군',
        '영주시',
        '영천시',
        '예천군',
        '울릉군',
        '울진군',
        '의성군',
        '청도군',
        '청송군',
        '칠곡군',
        '포항시',
    ],
    gyeongnam: [
        '거제시',
        '거창군',
        '고성군',
        '김해시',
        '남해군',
        '밀양시',
        '사천시',
        '산청군',
        '양산시',
        '의령군',
        '진주시',
        '창녕군',
        '창원시',
        '통영시',
        '하동군',
        '함안군',
        '함양군',
        '합천군',
    ],
    jeju: ['서귀포시', '제주시'],
};

// 지역 이름 매핑
window.WaveSpaceData.regionNames = {
    all: '전국',
    seoul: '서울',
    gyeonggi: '경기',
    incheon: '인천',
    busan: '부산',
    daegu: '대구',
    gwangju: '광주',
    daejeon: '대전',
    ulsan: '울산',
    sejong: '세종',
    gangwon: '강원',
    chungbuk: '충북',
    chungnam: '충남',
    jeonbuk: '전북',
    jeonnam: '전남',
    gyeongbuk: '경북',
    gyeongnam: '경남',
    jeju: '제주',
};

// 상품 유형 데이터 (PRD 8개 유형 + 오피스텔 세분화)
window.WaveSpaceData.productTypes = [
    { id: 'apartment', name: '아파트', color: '#3b82f6' },
    { id: 'officetel-residential', name: '주거형 OT', color: '#8b5cf6' },
    { id: 'officetel-commercial', name: '상업형 OT', color: '#06b6d4' },
    { id: 'villa', name: '빌라/연립', color: '#10b981' },
    { id: 'detached', name: '단독주택', color: '#f59e0b' },
    { id: 'commercial', name: '상업시설', color: '#ef4444' },
    { id: 'knowledge-industry', name: '지식산업센터', color: '#8b5cf6' },
    { id: 'etc', name: '기타', color: '#6b7280' },
];

// 업무 분야 데이터
window.WaveSpaceData.jobFields = [
    '분양기획',
    '분양영업',
    '마케팅',
    '홍보/PR',
    '고객관리',
    '사후관리',
    '기타',
];

// 경력 구분 데이터
window.WaveSpaceData.experienceLevels = [
    { id: 'new', name: '신입(1년 미만)', min: 0, max: 1 },
    { id: 'junior', name: '주니어(1-3년)', min: 1, max: 3 },
    { id: 'middle', name: '미들(3-7년)', min: 3, max: 7 },
    { id: 'senior', name: '시니어(7-15년)', min: 7, max: 15 },
    { id: 'expert', name: '전문가(15년+)', min: 15, max: 100 },
];

// 근무 형태 데이터
window.WaveSpaceData.workTypes = [
    { id: 'permanent', name: '정규직' },
    { id: 'contract', name: '계약직' },
    { id: 'temporary', name: '임시직' },
    { id: 'freelance', name: '프리랜서' },
    { id: 'parttime', name: '시간제' },
];

// 급여 구간 데이터 (만원 단위)
window.WaveSpaceData.salaryRanges = [
    { id: 'under2000', name: '2,000만원 미만', min: 0, max: 2000 },
    { id: '2000-3000', name: '2,000-3,000만원', min: 2000, max: 3000 },
    { id: '3000-4000', name: '3,000-4,000만원', min: 3000, max: 4000 },
    { id: '4000-5000', name: '4,000-5,000만원', min: 4000, max: 5000 },
    { id: '5000-7000', name: '5,000-7,000만원', min: 5000, max: 7000 },
    { id: 'over7000', name: '7,000만원 이상', min: 7000, max: 100000 },
];

// 회사 규모 데이터
window.WaveSpaceData.companySizes = [
    { id: 'startup', name: '스타트업(10명 이하)' },
    { id: 'small', name: '중소기업(10-50명)' },
    { id: 'medium', name: '중견기업(50-300명)' },
    { id: 'large', name: '대기업(300명 이상)' },
];

// 🚨 에러 핸들링 및 로깅 시스템
window.WaveSpaceData.errorHandler = {
    // 에러 로그 저장소
    logs: [],

    // 에러 레벨
    levels: {
        INFO: 'info',
        WARN: 'warn',
        ERROR: 'error',
        CRITICAL: 'critical',
    },

    // 로그 기록
    log: function (level, message, context = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            context: context,
            userAgent: navigator.userAgent,
            url: window.location.href,
        };

        this.logs.push(logEntry);

        // 콘솔 출력 (개발 환경에서만)
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            const consoleMethod =
                level === 'error' || level === 'critical'
                    ? 'error'
                    : level === 'warn'
                      ? 'warn'
                      : 'log';
            console[consoleMethod](`[WAVE SPACE ${level.toUpperCase()}]`, message, context);
        }

        // 로컬스토리지에 최근 100개 로그 저장
        try {
            const recentLogs = this.logs.slice(-100);
            localStorage.setItem('wave-space-error-logs', JSON.stringify(recentLogs));
        } catch (e) {
            console.warn('Failed to save error logs to localStorage:', e);
        }
    },

    // 안전한 함수 실행 래퍼
    safeExecute: function (fn, fallback = null, context = '') {
        try {
            return fn();
        } catch (error) {
            this.log(this.levels.ERROR, `Safe execution failed: ${context}`, {
                error: error.message,
                stack: error.stack,
            });
            return fallback;
        }
    },

    // 사용자 친화적 에러 메시지 표시
    showUserError: function (message, isTemporary = true) {
        // 간단한 토스트 메시지 구현
        const toast = document.createElement('div');
        toast.className = 'wave-error-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(toast);

        // 애니메이션으로 슬라이드 인
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // 자동 제거
        if (isTemporary) {
            setTimeout(() => {
                toast.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 5000);
        }

        return toast;
    },
};

// 🛡️ 보안 유틸리티 (XSS 및 CSRF 보호)
window.WaveSpaceData.security = {
    // HTML 태그 이스케이프 (XSS 방지)
    escapeHtml: (text) => {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // 사용자 입력 검증 및 정화
    sanitizeInput: (input, maxLength = 1000) => {
        if (typeof input !== 'string') return '';

        // 기본 정화
        const sanitized = input
            .trim()
            .substring(0, maxLength)
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // 스크립트 태그 제거
            .replace(/javascript:/gi, '') // JavaScript 프로토콜 제거
            .replace(/on\w+\s*=/gi, ''); // 이벤트 핸들러 제거

        return sanitized;
    },

    // CSRF 토큰 생성
    generateCSRFToken: () => {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    },

    // 안전한 URL 검증
    isValidURL: (url) => {
        try {
            const urlObj = new URL(url);
            return ['http:', 'https:'].includes(urlObj.protocol);
        } catch {
            return false;
        }
    },
};

// 유틸리티 함수들 (에러 핸들링 강화)
window.WaveSpaceData.dataUtils = {
    // 지역 코드로 이름 가져오기
    getRegionName: (code) => {
        return window.WaveSpaceData.errorHandler.safeExecute(
            () => window.WaveSpaceData.regionNames[code] || code,
            code,
            `getRegionName(${code})`
        );
    },

    // 지역의 하위 구역 가져오기
    getSubRegions: (regionCode) => {
        return window.WaveSpaceData.errorHandler.safeExecute(
            () => window.WaveSpaceData.regionData[regionCode] || [],
            [],
            `getSubRegions(${regionCode})`
        );
    },

    // 모든 지역 코드 목록 가져오기
    getAllRegionCodes: () => {
        return window.WaveSpaceData.errorHandler.safeExecute(
            () => Object.keys(window.WaveSpaceData.regionData).filter((key) => key !== 'all'),
            [],
            'getAllRegionCodes'
        );
    },

    // 상품 유형 이름으로 정보 가져오기
    getProductType: (id) => {
        return window.WaveSpaceData.errorHandler.safeExecute(
            () => window.WaveSpaceData.productTypes.find((type) => type.id === id),
            null,
            `getProductType(${id})`
        );
    },

    // 경력 레벨 이름으로 정보 가져오기
    getExperienceLevel: (id) => {
        return window.WaveSpaceData.errorHandler.safeExecute(
            () => window.WaveSpaceData.experienceLevels.find((level) => level.id === id),
            null,
            `getExperienceLevel(${id})`
        );
    },

    // 급여 구간 정보 가져오기
    getSalaryRange: (id) => {
        return window.WaveSpaceData.errorHandler.safeExecute(
            () => window.WaveSpaceData.salaryRanges.find((range) => range.id === id),
            null,
            `getSalaryRange(${id})`
        );
    },

    // 🔄 데이터 유효성 검증
    validateRegionData: () => {
        const errors = [];
        const regionData = window.WaveSpaceData.regionData;

        if (!regionData || typeof regionData !== 'object') {
            errors.push('regionData가 정의되지 않았거나 객체가 아닙니다');
            return errors;
        }

        // 필수 지역 확인
        const requiredRegions = ['seoul', 'gyeonggi', 'incheon', 'busan'];
        requiredRegions.forEach((region) => {
            if (!regionData[region] || !Array.isArray(regionData[region])) {
                errors.push(`필수 지역 데이터가 누락됨: ${region}`);
            }
        });

        return errors;
    },
};

// 🔧 초기화 및 유효성 검증
window.WaveSpaceData.init = function () {
    const errorHandler = this.errorHandler;

    // 데이터 유효성 검증
    const validationErrors = this.dataUtils.validateRegionData();
    if (validationErrors.length > 0) {
        errorHandler.log(errorHandler.levels.ERROR, 'WaveSpaceData 초기화 중 유효성 검증 실패', {
            errors: validationErrors,
        });
    } else {
        errorHandler.log(errorHandler.levels.INFO, 'WaveSpaceData 초기화 완료', {
            regionCount: Object.keys(this.regionData).length,
            productTypeCount: this.productTypes.length,
        });
    }
};

// 전역 에러 핸들러 설정
window.addEventListener('error', (event) => {
    window.WaveSpaceData.errorHandler.log(
        window.WaveSpaceData.errorHandler.levels.ERROR,
        'JavaScript 런타임 에러',
        {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack,
        }
    );
});

// Promise 에러 핸들러 설정
window.addEventListener('unhandledrejection', (event) => {
    window.WaveSpaceData.errorHandler.log(
        window.WaveSpaceData.errorHandler.levels.ERROR,
        'Unhandled Promise Rejection',
        {
            reason: event.reason,
            promise: event.promise,
        }
    );
});

// 페이지 로드 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.WaveSpaceData.init();
    });
} else {
    window.WaveSpaceData.init();
}
