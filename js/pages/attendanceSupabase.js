/**
 * WAVE SPACE - 출석체크 페이지 Supabase 연동
 * 일일 출석 시스템 및 연속 출석 보상
 */

import { supabase } from '../config/supabase.js';
import { authService } from '../services/authService.js';

class AttendanceManager {
    constructor() {
        this.currentUser = null;
        this.attendanceData = null;
        this.attendanceHistory = [];
        this.currentMonth = new Date();
        this.streakData = null;
        this.isLoading = false;
        this.init();
    }

    async init() {
        try {
            await authService.init();
            this.currentUser = await authService.getCurrentUser();
            
            if (this.currentUser) {
                await this.loadAttendanceData();
                await this.loadAttendanceHistory();
                await this.loadStreakData();
            }
            
            this.setupEventListeners();
            this.updateAuthUI();
            this.renderCalendar();
            this.setupRealtimeSubscription();
        } catch (error) {
            console.error('출석체크 페이지 초기화 오류:', error);
        }
    }

    setupEventListeners() {
        // 출석 체크 버튼
        const checkInBtn = document.querySelector('.check-in-btn, .attendance-btn');
        if (checkInBtn) {
            checkInBtn.addEventListener('click', () => this.checkIn());
        }

        // 달력 네비게이션
        const prevBtn = document.querySelector('.calendar-prev');
        const nextBtn = document.querySelector('.calendar-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateMonth(-1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateMonth(1));
        }

        // 출석 통계 새로고침
        const refreshBtn = document.querySelector('.refresh-stats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshStats());
        }
    }

    async updateAuthUI() {
        const userInfo = document.querySelector('.user-info, .attendance-user-info');
        
        if (this.currentUser) {
            if (userInfo) {
                userInfo.innerHTML = `
                    <div class="user-profile">
                        <img src="${this.currentUser.profile_image_url || '/assets/default-avatar.png'}" 
                             alt="프로필" class="profile-avatar">
                        <div class="user-details">
                            <span class="username">${this.currentUser.username}</span>
                            <span class="user-points">${this.formatNumber(this.currentUser.points || 0)} P</span>
                            ${this.streakData ? `<span class="attendance-streak">${this.streakData.current_streak}일 연속</span>` : ''}
                        </div>
                    </div>
                `;
            }

            // 출석 상태 표시
            this.updateAttendanceStatus();
        } else {
            if (userInfo) {
                userInfo.innerHTML = `
                    <div class="login-required">
                        <p>출석체크를 하려면 로그인이 필요합니다.</p>
                        <a href="login.html" class="btn btn-primary">로그인</a>
                    </div>
                `;
            }
        }
    }

    async loadAttendanceData() {
        if (!this.currentUser) return;

        try {
            // 오늘 출석 여부 확인
            const today = new Date().toISOString().split('T')[0];
            
            const { data: attendance, error } = await supabase
                .from('user_attendance')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('attendance_date', today)
                .single();

            if (error && error.code !== 'PGRST116') { // Not found error is OK
                throw error;
            }

            this.attendanceData = attendance;

        } catch (error) {
            console.error('출석 데이터 로딩 오류:', error);
        }
    }

    async loadAttendanceHistory() {
        if (!this.currentUser) return;

        try {
            const startOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
            const endOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);

            const { data: history, error } = await supabase
                .from('user_attendance')
                .select(`
                    attendance_date,
                    check_in_time,
                    points_earned,
                    bonus_applied
                `)
                .eq('user_id', this.currentUser.id)
                .gte('attendance_date', startOfMonth.toISOString().split('T')[0])
                .lte('attendance_date', endOfMonth.toISOString().split('T')[0])
                .order('attendance_date', { ascending: true });

            if (error) throw error;

            this.attendanceHistory = history || [];

        } catch (error) {
            console.error('출석 히스토리 로딩 오류:', error);
        }
    }

    async loadStreakData() {
        if (!this.currentUser) return;

        try {
            const { data: streak, error } = await supabase
                .from('user_attendance_stats')
                .select(`
                    current_streak,
                    longest_streak,
                    total_attendance_days,
                    this_month_attendance,
                    last_attendance_date
                `)
                .eq('user_id', this.currentUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            this.streakData = streak;
            this.updateStreakDisplay();

        } catch (error) {
            console.error('연속 출석 데이터 로딩 오류:', error);
        }
    }

    async checkIn() {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login.html';
            return;
        }

        if (this.attendanceData) {
            alert('오늘은 이미 출석체크를 완료했습니다!');
            return;
        }

        try {
            const checkInBtn = document.querySelector('.check-in-btn, .attendance-btn');
            if (checkInBtn) {
                checkInBtn.disabled = true;
                checkInBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 출석 중...';
            }

            // 출석체크 실행
            const { data, error } = await supabase.rpc('process_daily_checkin', {
                p_user_id: this.currentUser.id
            });

            if (error) throw error;

            // 성공 처리
            this.attendanceData = data.attendance;
            this.streakData = data.streak_info;
            
            await this.loadAttendanceHistory();
            this.updateAttendanceStatus();
            this.updateStreakDisplay();
            this.renderCalendar();

            // 출석 완료 애니메이션 및 알림
            this.showCheckInAnimation(data.points_earned, data.bonus_points);
            this.showSuccess(`출석체크 완료! ${data.points_earned + (data.bonus_points || 0)} P 획득`);

        } catch (error) {
            console.error('출석체크 오류:', error);
            if (error.message.includes('already_checked_in')) {
                this.showError('오늘은 이미 출석체크를 완료했습니다.');
            } else {
                this.showError('출석체크 처리 중 오류가 발생했습니다.');
            }
        } finally {
            const checkInBtn = document.querySelector('.check-in-btn, .attendance-btn');
            if (checkInBtn) {
                checkInBtn.disabled = false;
                this.updateCheckInButton();
            }
        }
    }

    updateAttendanceStatus() {
        const statusEl = document.querySelector('.attendance-status');
        const checkInBtn = document.querySelector('.check-in-btn, .attendance-btn');

        if (this.attendanceData) {
            // 이미 출석체크 완료
            if (statusEl) {
                statusEl.innerHTML = `
                    <div class="status-completed">
                        <i class="fas fa-check-circle"></i>
                        <span>오늘 출석체크 완료!</span>
                        <small>${this.formatTime(this.attendanceData.check_in_time)}에 출석</small>
                    </div>
                `;
            }

            if (checkInBtn) {
                checkInBtn.disabled = true;
                checkInBtn.innerHTML = '<i class="fas fa-check"></i> 출석 완료';
                checkInBtn.classList.add('completed');
            }
        } else {
            // 출석체크 대기
            if (statusEl) {
                statusEl.innerHTML = `
                    <div class="status-pending">
                        <i class="fas fa-clock"></i>
                        <span>오늘의 출석체크가 기다리고 있어요!</span>
                    </div>
                `;
            }

            this.updateCheckInButton();
        }
    }

    updateCheckInButton() {
        const checkInBtn = document.querySelector('.check-in-btn, .attendance-btn');
        if (!checkInBtn || !this.currentUser) return;

        if (!this.attendanceData) {
            checkInBtn.disabled = false;
            checkInBtn.innerHTML = '<i class="fas fa-hand-paper"></i> 출석체크';
            checkInBtn.classList.remove('completed');
        }
    }

    renderCalendar() {
        const calendar = document.querySelector('.calendar, .attendance-calendar');
        if (!calendar) return;

        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        // 달력 헤더 업데이트
        const monthHeader = document.querySelector('.calendar-month, .month-display');
        if (monthHeader) {
            monthHeader.textContent = `${year}년 ${month + 1}월`;
        }

        // 달력 생성
        let calendarHTML = '<div class="calendar-grid">';
        
        // 요일 헤더
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        calendarHTML += '<div class="calendar-weekdays">';
        weekdays.forEach(day => {
            calendarHTML += `<div class="weekday">${day}</div>`;
        });
        calendarHTML += '</div>';

        // 날짜 셀들
        calendarHTML += '<div class="calendar-days">';
        
        // 이전 달 빈 날짜들
        for (let i = 0; i < startDayOfWeek; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }

        // 현재 달 날짜들
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const attendance = this.attendanceHistory.find(a => a.attendance_date === dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isAttended = !!attendance;

            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${isAttended ? 'attended' : ''}" 
                     data-date="${dateStr}">
                    <span class="day-number">${day}</span>
                    ${isAttended ? '<i class="fas fa-check attendance-check"></i>' : ''}
                    ${attendance?.bonus_applied ? '<i class="fas fa-star bonus-star"></i>' : ''}
                </div>
            `;
        }

        calendarHTML += '</div></div>';
        calendar.innerHTML = calendarHTML;
    }

    navigateMonth(direction) {
        this.currentMonth = new Date(
            this.currentMonth.getFullYear(),
            this.currentMonth.getMonth() + direction,
            1
        );
        
        this.loadAttendanceHistory().then(() => {
            this.renderCalendar();
        });
    }

    updateStreakDisplay() {
        if (!this.streakData) return;

        const streakElements = {
            current: document.querySelector('.current-streak'),
            longest: document.querySelector('.longest-streak'),
            total: document.querySelector('.total-days'),
            monthly: document.querySelector('.monthly-attendance')
        };

        if (streakElements.current) {
            streakElements.current.textContent = `${this.streakData.current_streak}일`;
        }
        
        if (streakElements.longest) {
            streakElements.longest.textContent = `${this.streakData.longest_streak}일`;
        }
        
        if (streakElements.total) {
            streakElements.total.textContent = `${this.streakData.total_attendance_days}일`;
        }
        
        if (streakElements.monthly) {
            streakElements.monthly.textContent = `${this.streakData.this_month_attendance}일`;
        }
    }

    showCheckInAnimation(basePoints, bonusPoints) {
        const animationHTML = `
            <div class="check-in-animation" id="checkInAnimation">
                <div class="animation-content">
                    <div class="check-mark">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>출석체크 완료!</h2>
                    <div class="points-earned">
                        <div class="base-points">+${basePoints} P</div>
                        ${bonusPoints ? `<div class="bonus-points">보너스 +${bonusPoints} P</div>` : ''}
                    </div>
                    ${this.streakData ? `
                        <div class="streak-info">
                            <i class="fas fa-fire"></i>
                            ${this.streakData.current_streak}일 연속 출석!
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', animationHTML);
        
        // 애니메이션 자동 제거
        setTimeout(() => {
            const animation = document.getElementById('checkInAnimation');
            if (animation) {
                animation.classList.add('fade-out');
                setTimeout(() => animation.remove(), 500);
            }
        }, 3000);
    }

    async refreshStats() {
        if (!this.currentUser) return;

        try {
            this.showLoading();
            await Promise.all([
                this.loadAttendanceData(),
                this.loadAttendanceHistory(),
                this.loadStreakData()
            ]);
            
            this.updateAttendanceStatus();
            this.updateStreakDisplay();
            this.renderCalendar();
            
            this.showSuccess('출석 정보가 새로고침되었습니다.');
        } catch (error) {
            console.error('통계 새로고침 오류:', error);
            this.showError('통계 새로고침 중 오류가 발생했습니다.');
        } finally {
            this.hideLoading();
        }
    }

    setupRealtimeSubscription() {
        if (!this.currentUser) return;

        // 실시간 출석 데이터 업데이트
        const attendanceChannel = supabase
            .channel(`user-attendance-${this.currentUser.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_attendance',
                    filter: `user_id=eq.${this.currentUser.id}`
                },
                (payload) => {
                    console.log('출석 데이터 업데이트:', payload);
                    this.handleAttendanceUpdate(payload);
                }
            )
            .subscribe();

        // 실시간 연속 출석 통계 업데이트
        const statsChannel = supabase
            .channel(`user-attendance-stats-${this.currentUser.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'user_attendance_stats',
                    filter: `user_id=eq.${this.currentUser.id}`
                },
                (payload) => {
                    console.log('출석 통계 업데이트:', payload.new);
                    this.handleStatsUpdate(payload.new);
                }
            )
            .subscribe();
    }

    handleAttendanceUpdate(payload) {
        if (payload.eventType === 'INSERT') {
            // 새 출석 기록 추가
            this.attendanceHistory.push(payload.new);
            this.renderCalendar();
            
            if (payload.new.attendance_date === new Date().toISOString().split('T')[0]) {
                this.attendanceData = payload.new;
                this.updateAttendanceStatus();
            }
        }
    }

    handleStatsUpdate(newStats) {
        this.streakData = newStats;
        this.updateStreakDisplay();
        
        // 연속 출석 마일스톤 알림
        if (newStats.current_streak > 0 && newStats.current_streak % 7 === 0) {
            this.showNotification(`🔥 ${newStats.current_streak}일 연속 출석 달성!`);
        }
    }

    async getAttendanceRewards() {
        if (!this.currentUser) return;

        try {
            const { data: rewards, error } = await supabase
                .from('attendance_rewards')
                .select(`
                    day_requirement,
                    points_reward,
                    item_reward_id,
                    badge_reward_id,
                    is_claimed
                `)
                .eq('user_id', this.currentUser.id)
                .order('day_requirement', { ascending: true });

            if (error) throw error;

            this.renderAttendanceRewards(rewards);

        } catch (error) {
            console.error('출석 보상 조회 오류:', error);
        }
    }

    renderAttendanceRewards(rewards) {
        const container = document.querySelector('.attendance-rewards, .reward-list');
        if (!container || !rewards) return;

        const rewardsHTML = rewards.map(reward => `
            <div class="reward-item ${reward.is_claimed ? 'claimed' : ''}" 
                 data-requirement="${reward.day_requirement}">
                <div class="reward-requirement">
                    ${reward.day_requirement}일 연속
                </div>
                <div class="reward-content">
                    <div class="reward-points">+${reward.points_reward} P</div>
                    ${reward.item_reward_id ? '<div class="reward-item-icon"><i class="fas fa-gift"></i></div>' : ''}
                    ${reward.badge_reward_id ? '<div class="reward-badge-icon"><i class="fas fa-medal"></i></div>' : ''}
                </div>
                <div class="reward-status">
                    ${reward.is_claimed ? '✅ 획득' : (this.streakData?.current_streak >= reward.day_requirement ? '🎁 수령 가능' : '🔒 잠김')}
                </div>
            </div>
        `).join('');

        container.innerHTML = rewardsHTML;
    }

    // 유틸리티 함수들
    formatTime(timeString) {
        const time = new Date(timeString);
        return time.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toLocaleString();
    }

    showLoading() {
        const loadingEl = document.querySelector('.loading, .attendance-loading');
        if (loadingEl) {
            loadingEl.style.display = 'block';
        }
    }

    hideLoading() {
        const loadingEl = document.querySelector('.loading, .attendance-loading');
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

    showNotification(message) {
        if (window.notificationService) {
            window.notificationService.showToast(message, 'info');
        }
    }
}

// 전역 인스턴스 생성
window.attendanceManager = new AttendanceManager();

// 기존 attendance.js와의 호환성을 위한 전역 함수들
window.checkIn = () => window.attendanceManager.checkIn();
window.navigateMonth = (direction) => window.attendanceManager.navigateMonth(direction);
window.refreshStats = () => window.attendanceManager.refreshStats();