/**
 * WAVE SPACE - 포맷팅 유틸리티
 * 날짜, 숫자, 텍스트 등의 포맷팅 함수 모음
 */

/**
 * 날짜 포맷터
 */
const DateFormatter = {
    /**
     * 상대적 시간 표시 (몇 분 전, 몇 시간 전 등)
     */
    relative(date) {
        const now = new Date();
        const target = new Date(date);
        const diff = now - target;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
        
        if (seconds < 60) {
            return '방금 전';
        } else if (minutes < 60) {
            return `${minutes}분 전`;
        } else if (hours < 24) {
            return `${hours}시간 전`;
        } else if (days < 7) {
            return `${days}일 전`;
        } else if (days < 30) {
            const weeks = Math.floor(days / 7);
            return `${weeks}주 전`;
        } else if (months < 12) {
            return `${months}개월 전`;
        } else {
            return `${years}년 전`;
        }
    },

    /**
     * 날짜 포맷팅 (YYYY.MM.DD)
     */
    date(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    },

    /**
     * 날짜와 시간 포맷팅 (YYYY.MM.DD HH:mm)
     */
    dateTime(date) {
        const d = new Date(date);
        const dateStr = this.date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${dateStr} ${hours}:${minutes}`;
    },

    /**
     * 요일 포함 날짜 (YYYY.MM.DD (요일))
     */
    dateWithDay(date) {
        const d = new Date(date);
        const dateStr = this.date(date);
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayName = days[d.getDay()];
        return `${dateStr} (${dayName})`;
    },

    /**
     * 시간만 표시 (HH:mm)
     */
    time(date) {
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    },

    /**
     * 오늘/어제/날짜 표시
     */
    smart(date) {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // 날짜 비교 (시간 제외)
        const dStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
        const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
        
        if (dStr === todayStr) {
            return `오늘 ${this.time(date)}`;
        } else if (dStr === yesterdayStr) {
            return `어제 ${this.time(date)}`;
        } else {
            return this.dateTime(date);
        }
    }
};

/**
 * 숫자 포맷터
 */
const NumberFormatter = {
    /**
     * 천단위 콤마
     */
    comma(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * K, M, B 단위로 축약
     */
    compact(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return num.toString();
    },

    /**
     * 퍼센트 표시
     */
    percent(num, decimals = 0) {
        return `${(num * 100).toFixed(decimals)}%`;
    },

    /**
     * 원화 표시
     */
    currency(num) {
        return `₩${this.comma(num)}`;
    },

    /**
     * 파일 크기 표시
     */
    fileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    },

    /**
     * 순위 표시 (1위, 2위, 3위...)
     */
    rank(num) {
        return `${num}위`;
    },

    /**
     * 포인트 표시 (+100P, -50P)
     */
    points(num) {
        const sign = num >= 0 ? '+' : '';
        return `${sign}${this.comma(num)}P`;
    }
};

/**
 * 텍스트 포맷터
 */
const TextFormatter = {
    /**
     * 텍스트 자르기
     */
    truncate(text, length, suffix = '...') {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + suffix;
    },

    /**
     * 이름 마스킹 (홍*동)
     */
    maskName(name) {
        if (!name || name.length < 2) return name;
        if (name.length === 2) {
            return name[0] + '*';
        }
        return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
    },

    /**
     * 이메일 마스킹 (te**@example.com)
     */
    maskEmail(email) {
        if (!email || !email.includes('@')) return email;
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 2) {
            return localPart + '***@' + domain;
        }
        return localPart.substring(0, 2) + '***@' + domain;
    },

    /**
     * 전화번호 마스킹 (010-****-5678)
     */
    maskPhone(phone) {
        if (!phone) return phone;
        const cleaned = phone.replace(/[^0-9]/g, '');
        if (cleaned.length < 10) return phone;
        
        const masked = cleaned.substring(0, 3) + '-****-' + cleaned.substring(cleaned.length - 4);
        return masked;
    },

    /**
     * 전화번호 포맷팅 (010-1234-5678)
     */
    phone(phone) {
        if (!phone) return phone;
        const cleaned = phone.replace(/[^0-9]/g, '');
        
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        }
        
        return phone;
    },

    /**
     * URL에서 도메인 추출
     */
    domain(url) {
        try {
            const u = new URL(url);
            return u.hostname.replace('www.', '');
        } catch (e) {
            return url;
        }
    },

    /**
     * 해시태그 추출
     */
    extractHashtags(text) {
        const regex = /#[가-힣a-zA-Z0-9_]+/g;
        return text.match(regex) || [];
    },

    /**
     * 줄바꿈을 <br>로 변환
     */
    nl2br(text) {
        return text.replace(/\n/g, '<br>');
    },

    /**
     * HTML 태그 제거
     */
    stripTags(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
};

/**
 * 회원 타입 표시
 */
function formatMemberType(type) {
    const types = {
        'personal': '개인회원',
        'corporate': '기업회원',
        'headhunter': '헤드헌터',
        'admin': '관리자'
    };
    return types[type] || type;
}

/**
 * 뱃지 타입 표시
 */
function formatBadgeType(type) {
    const types = {
        'normal': '일반',
        'rare': '레어',
        'premium': '프리미엄'
    };
    return types[type] || type;
}

/**
 * 게시글 카테고리 표시
 */
function formatCategory(slug) {
    const categories = {
        'notice': '공지사항',
        'update': '업데이트',
        'event': '이벤트',
        'forum': '자유게시판',
        'humor': '유머재미',
        'qna': '질문답변'
    };
    return categories[slug] || slug;
}

// 전역으로 사용할 수 있도록 export
window.WaveFormatters = {
    date: DateFormatter,
    number: NumberFormatter,
    text: TextFormatter,
    memberType: formatMemberType,
    badgeType: formatBadgeType,
    category: formatCategory
};