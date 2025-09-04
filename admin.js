import { supabase } from './js/config/supabase.js';
import { authService } from './js/services/authService.js';
import { adminService } from './js/services/adminService.js';

class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'overview';
        this.charts = {};
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.initEventListeners();
        await this.loadDashboard();
        this.hideLoading();
    }

    async checkAuth() {
        try {
            await authService.init();
            this.currentUser = await authService.getCurrentUser();
            
            if (!this.currentUser) {
                window.location.href = '/login.html';
                return;
            }

            // 관리자 권한 확인 (role이 'admin'인지 확인)
            if (!authService.isAdmin()) {
                alert('관리자 권한이 필요합니다.');
                window.location.href = '/index.html';
                return;
            }

            // adminService에 현재 관리자 ID 설정
            adminService.setCurrentAdminId(this.currentUser.id);
            
            document.getElementById('admin-name').textContent = this.currentUser.username;
        } catch (error) {
            console.error('인증 확인 오류:', error);
            window.location.href = '/login.html';
        }
    }

    initEventListeners() {
        // 메뉴 탭 이벤트
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.dataset.tab;
                this.switchTab(tab);
            });
        });

        // 검색 이벤트
        document.getElementById('user-search')?.addEventListener('input', 
            this.debounce(() => this.searchUsers(), 300)
        );
        document.getElementById('post-search')?.addEventListener('input', 
            this.debounce(() => this.searchPosts(), 300)
        );

        // 필터 이벤트
        document.getElementById('user-filter')?.addEventListener('change', () => this.loadUsers());
        document.getElementById('post-filter')?.addEventListener('change', () => this.loadPosts());
        document.getElementById('category-filter')?.addEventListener('change', () => this.loadPosts());

        // 폼 이벤트
        document.getElementById('system-settings')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSystemSettings();
        });

        document.getElementById('point-settings')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePointSettings();
        });

        document.getElementById('notification-settings')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNotificationSettings();
        });

        // 모달 외부 클릭 시 닫기
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });
    }

    switchTab(tabName) {
        // 메뉴 활성화
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 탭 콘텐츠 표시
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');

        this.currentTab = tabName;
        this.updatePageTitle(tabName);
        this.loadTabData(tabName);
    }

    updatePageTitle(tabName) {
        const titles = {
            overview: '대시보드 개요',
            analytics: '분석',
            users: '사용자 관리',
            members: '플러스 회원 관리',
            badges: '뱃지 관리',
            posts: '게시글 관리',
            files: '파일 관리',
            notices: '공지사항 관리',
            settings: '시스템 설정',
            logs: '시스템 로그'
        };
        document.getElementById('page-title').textContent = titles[tabName] || '관리자';
    }

    async loadTabData(tabName) {
        switch (tabName) {
        case 'overview':
            await this.loadOverview();
            break;
        case 'analytics':
            await this.loadAnalytics();
            break;
        case 'users':
            await this.loadUsers();
            break;
        case 'posts':
            await this.loadPosts();
            break;
        case 'notices':
            await this.loadNotices();
            break;
        case 'settings':
            await this.loadSettings();
            break;
        case 'logs':
            await this.loadLogs();
            break;
        }
    }

    async loadDashboard() {
        await this.loadOverview();
    }

    async loadOverview() {
        try {
            // 전체 통계 로드
            const stats = await this.getOverviewStats();
            this.updateStatsCards(stats);

            // 차트 생성
            await this.createCharts();

            // 최근 활동 로드
            await this.loadRecentActivity();
        } catch (error) {
            console.error('개요 로딩 오류:', error);
            this.showError('개요 데이터를 불러올 수 없습니다.');
        }
    }

    async getOverviewStats() {
        try {
            // adminService의 통합 통계 함수 사용
            const { data } = await supabase.rpc('get_admin_dashboard_stats');
            
            return {
                totalUsers: data?.total_users || 0,
                totalPosts: data?.total_posts || 0,
                plusMembers: data?.plus_members || 0,
                totalPoints: data?.total_points_issued || 0,
                monthlyUsers: data?.monthly_new_users || 0,
                monthlyPosts: data?.monthly_new_posts || 0
            };
        } catch (error) {
            console.error('통계 데이터 로딩 오류:', error);
            return {
                totalUsers: 0,
                totalPosts: 0,
                plusMembers: 0,
                totalPoints: 0,
                monthlyUsers: 0,
                monthlyPosts: 0
            };
        }
    }

    updateStatsCards(stats) {
        document.getElementById('total-users').textContent = stats.totalUsers.toLocaleString();
        document.getElementById('total-posts').textContent = stats.totalPosts.toLocaleString();
        document.getElementById('plus-members').textContent = stats.plusMembers.toLocaleString();
        document.getElementById('total-points').textContent = stats.totalPoints.toLocaleString();
    }

    async createCharts() {
        // 사용자 증가 차트
        const usersData = await this.getUsersGrowthData();
        this.charts.users = new Chart(document.getElementById('users-chart'), {
            type: 'line',
            data: {
                labels: usersData.labels,
                datasets: [{
                    label: '신규 가입자',
                    data: usersData.values,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // 게시글 활동 차트
        const postsData = await this.getPostsActivityData();
        this.charts.posts = new Chart(document.getElementById('posts-chart'), {
            type: 'bar',
            data: {
                labels: postsData.labels,
                datasets: [{
                    label: '게시글 수',
                    data: postsData.values,
                    backgroundColor: '#10b981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    async getUsersGrowthData() {
        try {
            const { data } = await supabase
                .from('users')
                .select('created_at')
                .order('created_at');

            const last7Days = [];
            const counts = [];
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                last7Days.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
                
                const dayStart = new Date(date);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(date);
                dayEnd.setHours(23, 59, 59, 999);
                
                const count = data?.filter(user => {
                    const createdAt = new Date(user.created_at);
                    return createdAt >= dayStart && createdAt <= dayEnd;
                }).length || 0;
                
                counts.push(count);
            }

            return {
                labels: last7Days,
                values: counts
            };
        } catch (error) {
            console.error('사용자 증가 데이터 오류:', error);
            return { labels: [], values: [] };
        }
    }

    async getPostsActivityData() {
        try {
            const { data } = await supabase
                .from('posts')
                .select('created_at')
                .order('created_at');

            const last7Days = [];
            const counts = [];
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                last7Days.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
                
                const dayStart = new Date(date);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(date);
                dayEnd.setHours(23, 59, 59, 999);
                
                const count = data?.filter(post => {
                    const createdAt = new Date(post.created_at);
                    return createdAt >= dayStart && createdAt <= dayEnd;
                }).length || 0;
                
                counts.push(count);
            }

            return {
                labels: last7Days,
                values: counts
            };
        } catch (error) {
            console.error('게시글 활동 데이터 오류:', error);
            return { labels: [], values: [] };
        }
    }

    async loadRecentActivity() {
        try {
            const activities = await this.getRecentActivities();
            this.renderRecentActivities(activities);
        } catch (error) {
            console.error('최근 활동 로딩 오류:', error);
        }
    }

    async getRecentActivities() {
        const [posts, comments, users] = await Promise.all([
            supabase
                .from('posts')
                .select(`
                    id, title, created_at,
                    users!posts_author_id_fkey(username)
                `)
                .order('created_at', { ascending: false })
                .limit(5),
            supabase
                .from('comments')
                .select(`
                    id, content, created_at,
                    users!comments_author_id_fkey(username),
                    posts!comments_post_id_fkey(title)
                `)
                .order('created_at', { ascending: false })
                .limit(5),
            supabase
                .from('users')
                .select('id, username, created_at')
                .order('created_at', { ascending: false })
                .limit(5)
        ]);

        const activities = [];

        posts.data?.forEach(post => {
            activities.push({
                type: 'post',
                icon: 'fas fa-edit',
                title: '새 게시글',
                description: `${post.users.username}님이 "${post.title}" 게시글을 작성했습니다`,
                time: new Date(post.created_at)
            });
        });

        comments.data?.forEach(comment => {
            activities.push({
                type: 'comment',
                icon: 'fas fa-comment',
                title: '새 댓글',
                description: `${comment.users.username}님이 "${comment.posts.title}"에 댓글을 작성했습니다`,
                time: new Date(comment.created_at)
            });
        });

        users.data?.forEach(user => {
            activities.push({
                type: 'user',
                icon: 'fas fa-user-plus',
                title: '신규 가입',
                description: `${user.username}님이 가입했습니다`,
                time: new Date(user.created_at)
            });
        });

        return activities
            .sort((a, b) => b.time - a.time)
            .slice(0, 10);
    }

    renderRecentActivities(activities) {
        const container = document.getElementById('recent-activities');
        
        if (activities.length === 0) {
            container.innerHTML = '<p class="text-center">최근 활동이 없습니다.</p>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                </div>
                <div class="activity-time">
                    ${this.formatRelativeTime(activity.time)}
                </div>
            </div>
        `).join('');
    }

    async loadUsers() {
        try {
            const filter = document.getElementById('user-filter')?.value || 'all';
            const search = document.getElementById('user-search')?.value || '';

            const result = await adminService.getUsers({
                filter: filter,
                search: search,
                page: 1,
                limit: 50
            });

            this.renderUsersTable(result.users);
        } catch (error) {
            console.error('사용자 로딩 오류:', error);
            this.showError('사용자 데이터를 불러올 수 없습니다.');
        }
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('users-tbody');
        
        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">사용자가 없습니다.</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id.slice(0, 8)}...</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="${user.avatar_url || '/assets/default-avatar.png'}" 
                             alt="프로필" style="width: 24px; height: 24px; border-radius: 50%;">
                        ${user.username}
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${user.points?.toLocaleString() || 0}</td>
                <td>
                    <span class="status-badge ${user.is_plus_member ? 'plus' : 'active'}">
                        ${this.getRoleText(user.role)}
                        ${user.is_plus_member ? ' PLUS' : ''}
                    </span>
                </td>
                <td>${new Date(user.created_at).toLocaleDateString('ko-KR')}</td>
                <td>
                    <span class="status-badge ${user.status || 'active'}">
                        ${this.getStatusText(user.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="admin.editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn ban" onclick="admin.toggleUserBan('${user.id}')">
                            <i class="fas fa-ban"></i>
                        </button>
                        <button class="action-btn delete" onclick="admin.deleteUser('${user.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadPosts() {
        try {
            const filter = document.getElementById('post-filter')?.value || 'all';
            const category = document.getElementById('category-filter')?.value || 'all';
            const search = document.getElementById('post-search')?.value || '';

            const result = await adminService.getPosts({
                filter: filter,
                category: category,
                search: search,
                page: 1,
                limit: 50
            });

            this.renderPostsTable(result.posts);
            
            // 카테고리 필터 옵션 로드
            if (!this.categoriesLoaded) {
                await this.loadCategoryOptions();
                this.categoriesLoaded = true;
            }
        } catch (error) {
            console.error('게시글 로딩 오류:', error);
            this.showError('게시글 데이터를 불러올 수 없습니다.');
        }
    }

    renderPostsTable(posts) {
        const tbody = document.getElementById('posts-tbody');
        
        if (!posts || posts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">게시글이 없습니다.</td></tr>';
            return;
        }

        tbody.innerHTML = posts.map(post => `
            <tr>
                <td>${post.id.slice(0, 8)}...</td>
                <td>
                    <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                        ${post.title}
                    </div>
                </td>
                <td>${post.users?.username || '알 수 없음'}</td>
                <td>${post.categories?.name || '미분류'}</td>
                <td>${post.view_count || 0}</td>
                <td>${post.like_count || 0}</td>
                <td>${new Date(post.created_at).toLocaleDateString('ko-KR')}</td>
                <td>
                    <span class="status-badge ${post.is_hidden ? 'draft' : 'published'}">
                        ${post.is_hidden ? '숨김' : '게시됨'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="admin.editPost('${post.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn ${post.is_hidden ? 'edit' : 'ban'}" 
                                onclick="admin.togglePostVisibility('${post.id}')">
                            <i class="fas fa-${post.is_hidden ? 'eye' : 'eye-slash'}"></i>
                        </button>
                        <button class="action-btn delete" onclick="admin.deletePost('${post.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadNotices() {
        try {
            const result = await adminService.getNotices({
                page: 1,
                limit: 50
            });

            this.renderNoticesTable(result.notices);
        } catch (error) {
            console.error('공지사항 로딩 오류:', error);
            this.showError('공지사항 데이터를 불러올 수 없습니다.');
        }
    }

    async loadCategoryOptions() {
        try {
            const { data: categories } = await supabase
                .from('post_categories')
                .select('id, name')
                .eq('is_active', true)
                .order('sort_order');

            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter && categories) {
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categoryFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error('카테고리 로딩 오류:', error);
        }
    }

    async loadAnalytics() {
        try {
            const period = parseInt(document.getElementById('analytics-period')?.value) || 7;
            const analyticsData = await adminService.getAnalyticsData(period);
            
            this.createAnalyticsCharts(analyticsData);
        } catch (error) {
            console.error('분석 데이터 로딩 오류:', error);
            this.showError('분석 데이터를 불러올 수 없습니다.');
        }
    }

    createAnalyticsCharts(data) {
        // 카테고리별 게시글 차트
        if (this.charts.category) {
            this.charts.category.destroy();
        }
        this.charts.category = new Chart(document.getElementById('category-chart'), {
            type: 'doughnut',
            data: {
                labels: data.categories?.labels || [],
                datasets: [{
                    data: data.categories?.data || [],
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // 사용자 활동도 차트
        if (this.charts.activity) {
            this.charts.activity.destroy();
        }
        this.charts.activity = new Chart(document.getElementById('activity-chart'), {
            type: 'line',
            data: {
                labels: data.users?.labels || [],
                datasets: [{
                    label: '신규 사용자',
                    data: data.users?.data || [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }, {
                    label: '새 게시글',
                    data: data.posts?.data || [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    async loadLogs() {
        try {
            const level = document.getElementById('log-level')?.value || 'all';
            const category = document.getElementById('log-category')?.value || 'all';

            const logs = await adminService.getLogs({
                level: level,
                category: category,
                page: 1,
                limit: 100
            });

            this.renderLogs(logs);
        } catch (error) {
            console.error('로그 로딩 오류:', error);
            this.showError('로그 데이터를 불러올 수 없습니다.');
        }
    }

    renderLogs(logs) {
        const container = document.getElementById('log-container');
        
        if (!logs || logs.length === 0) {
            container.innerHTML = '<div class="text-center">로그가 없습니다.</div>';
            return;
        }

        container.innerHTML = logs.map(log => `
            <div class="log-entry ${log.level || 'info'}">
                <span class="log-time">[${new Date(log.created_at).toLocaleString('ko-KR')}]</span>
                <span class="log-level">[${log.level?.toUpperCase() || 'INFO'}]</span>
                <span class="log-action">[${log.action}]</span>
                <span class="log-description">${log.description}</span>
                ${log.users?.username ? `<span class="log-admin">by ${log.users.username}</span>` : ''}
            </div>
        `).join('');
    }

    renderNoticesTable(notices) {
        const tbody = document.getElementById('notices-tbody');
        
        if (!notices || notices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">공지사항이 없습니다.</td></tr>';
            return;
        }

        tbody.innerHTML = notices.map(notice => `
            <tr>
                <td>${notice.id.slice(0, 8)}...</td>
                <td>${notice.title}</td>
                <td>
                    <span class="status-badge ${notice.priority}">
                        ${this.getPriorityText(notice.priority)}
                    </span>
                </td>
                <td>${new Date(notice.created_at).toLocaleDateString('ko-KR')}</td>
                <td>
                    <span class="status-badge ${notice.status}">
                        ${this.getNoticeStatusText(notice.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="admin.editNotice('${notice.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="admin.deleteNotice('${notice.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // 사용자 관리 기능
    createUser() {
        document.getElementById('user-modal-title').textContent = '새 사용자 추가';
        document.getElementById('user-form').reset();
        document.getElementById('edit-user-id').value = '';
        this.openModal('user-modal');
    }

    async editUser(userId) {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            // 모달에 데이터 채우기
            document.getElementById('edit-user-id').value = user.id;
            document.getElementById('edit-username').value = user.username;
            document.getElementById('edit-email').value = user.email;
            document.getElementById('edit-points').value = user.points || 0;
            document.getElementById('edit-rank').value = user.role || 'member';
            document.getElementById('edit-status').value = user.status || 'active';
            document.getElementById('edit-plus-member').checked = user.is_plus_member || false;

            this.openModal('user-modal');
        } catch (error) {
            console.error('사용자 편집 오류:', error);
            this.showError('사용자 정보를 불러올 수 없습니다.');
        }
    }

    async saveUser() {
        try {
            const userId = document.getElementById('edit-user-id').value;
            const userData = {
                username: document.getElementById('edit-username').value,
                email: document.getElementById('edit-email').value,
                points: parseInt(document.getElementById('edit-points').value) || 0,
                role: document.getElementById('edit-rank').value,
                status: document.getElementById('edit-status').value,
                is_plus_member: document.getElementById('edit-plus-member').checked
            };

            await adminService.updateUser(userId, userData);

            this.closeModal();
            await this.loadUsers();
            this.showSuccess('사용자 정보가 업데이트되었습니다.');
        } catch (error) {
            console.error('사용자 저장 오류:', error);
            this.showError('사용자 정보를 저장할 수 없습니다.');
        }
    }

    async toggleUserBan(userId) {
        try {
            const { data: user } = await supabase
                .from('users')
                .select('status, username')
                .eq('id', userId)
                .single();

            if (user.status === 'banned') {
                await adminService.unbanUser(userId);
                this.showSuccess(`${user.username}님이 정지 해제되었습니다.`);
            } else {
                const reason = prompt('정지 사유를 입력하세요:');
                if (reason) {
                    await adminService.banUser(userId, reason);
                    this.showSuccess(`${user.username}님이 정지되었습니다.`);
                }
            }

            await this.loadUsers();
        } catch (error) {
            console.error('사용자 정지/해제 오류:', error);
            this.showError('작업을 완료할 수 없습니다.');
        }
    }

    async deleteUser(userId) {
        if (!confirm('정말 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        try {
            // 관련 데이터 삭제 (posts, comments 등은 CASCADE로 자동 삭제됨)
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            await this.loadUsers();
            this.showSuccess('사용자가 삭제되었습니다.');
        } catch (error) {
            console.error('사용자 삭제 오류:', error);
            this.showError('사용자를 삭제할 수 없습니다.');
        }
    }

    // 게시글 관리 기능
    async togglePostVisibility(postId) {
        try {
            const { data: post } = await supabase
                .from('posts')
                .select('is_hidden, title')
                .eq('id', postId)
                .single();

            if (post.is_hidden) {
                await adminService.showPost(postId);
                this.showSuccess(`"${post.title}" 게시글이 공개되었습니다.`);
            } else {
                await adminService.hidePost(postId);
                this.showSuccess(`"${post.title}" 게시글이 숨김되었습니다.`);
            }

            await this.loadPosts();
        } catch (error) {
            console.error('게시글 상태 변경 오류:', error);
            this.showError('작업을 완료할 수 없습니다.');
        }
    }

    async deletePost(postId) {
        if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await adminService.deletePost(postId);
            await this.loadPosts();
            this.showSuccess('게시글이 삭제되었습니다.');
        } catch (error) {
            console.error('게시글 삭제 오류:', error);
            this.showError('게시글을 삭제할 수 없습니다.');
        }
    }

    // 공지사항 관리
    createNotice() {
        document.getElementById('notice-modal-title').textContent = '새 공지사항 작성';
        document.getElementById('notice-form').reset();
        document.getElementById('edit-notice-id').value = '';
        this.openModal('notice-modal');
    }

    async editNotice(noticeId) {
        try {
            const { data: notice, error } = await supabase
                .from('notices')
                .select('*')
                .eq('id', noticeId)
                .single();

            if (error) throw error;

            document.getElementById('notice-modal-title').textContent = '공지사항 편집';
            document.getElementById('edit-notice-id').value = notice.id;
            document.getElementById('notice-title').value = notice.title;
            document.getElementById('notice-content').value = notice.content;
            document.getElementById('notice-priority').value = notice.priority;
            document.getElementById('notice-status').value = notice.status;

            this.openModal('notice-modal');
        } catch (error) {
            console.error('공지사항 편집 오류:', error);
            this.showError('공지사항을 불러올 수 없습니다.');
        }
    }

    async saveNotice() {
        try {
            const noticeId = document.getElementById('edit-notice-id').value;
            const noticeData = {
                title: document.getElementById('notice-title').value,
                content: document.getElementById('notice-content').value,
                priority: document.getElementById('notice-priority').value,
                status: document.getElementById('notice-status').value
            };

            if (noticeId) {
                await adminService.updateNotice(noticeId, noticeData);
            } else {
                await adminService.createNotice(noticeData);
            }

            this.closeModal();
            await this.loadNotices();
            this.showSuccess('공지사항이 저장되었습니다.');
        } catch (error) {
            console.error('공지사항 저장 오류:', error);
            this.showError('공지사항을 저장할 수 없습니다.');
        }
    }

    async deleteNotice(noticeId) {
        if (!confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await adminService.deleteNotice(noticeId);
            await this.loadNotices();
            this.showSuccess('공지사항이 삭제되었습니다.');
        } catch (error) {
            console.error('공지사항 삭제 오류:', error);
            this.showError('공지사항을 삭제할 수 없습니다.');
        }
    }

    // 설정 관리
    async loadSettings() {
        try {
            const settings = await adminService.getSettings();

            // 폼에 설정값 적용
            document.getElementById('site-title').value = settings.site_title || 'WAVE SPACE';
            document.getElementById('allow-registration').checked = settings.allow_registration !== 'false';
            document.getElementById('allow-guest-read').checked = settings.allow_guest_read !== 'false';
            document.getElementById('daily-point-limit').value = settings.daily_point_limit || '100';
            
            // 포인트 설정
            document.getElementById('points-post').value = settings.points_post || '5';
            document.getElementById('points-comment').value = settings.points_comment || '2';
            document.getElementById('points-attendance').value = settings.points_attendance || '1';
            document.getElementById('points-like').value = settings.points_like || '1';
            
            // 알림 설정
            document.getElementById('enable-notifications').checked = settings.enable_notifications !== 'false';
            document.getElementById('enable-push').checked = settings.enable_push !== 'false';
            document.getElementById('enable-email').checked = settings.enable_email !== 'false';
        } catch (error) {
            console.error('설정 로딩 오류:', error);
        }
    }

    async saveSystemSettings() {
        try {
            const settings = {
                site_title: document.getElementById('site-title').value,
                allow_registration: document.getElementById('allow-registration').checked.toString(),
                allow_guest_read: document.getElementById('allow-guest-read').checked.toString(),
                daily_point_limit: document.getElementById('daily-point-limit').value
            };

            await adminService.updateSettings(settings);
            this.showSuccess('시스템 설정이 저장되었습니다.');
        } catch (error) {
            console.error('설정 저장 오류:', error);
            this.showError('설정을 저장할 수 없습니다.');
        }
    }

    async savePointSettings() {
        try {
            const settings = {
                points_post: document.getElementById('points-post').value,
                points_comment: document.getElementById('points-comment').value,
                points_attendance: document.getElementById('points-attendance').value,
                points_like: document.getElementById('points-like').value
            };

            await adminService.updateSettings(settings);
            this.showSuccess('포인트 설정이 저장되었습니다.');
        } catch (error) {
            console.error('포인트 설정 저장 오류:', error);
            this.showError('포인트 설정을 저장할 수 없습니다.');
        }
    }

    async saveNotificationSettings() {
        try {
            const settings = {
                enable_notifications: document.getElementById('enable-notifications').checked.toString(),
                enable_push: document.getElementById('enable-push').checked.toString(),
                enable_email: document.getElementById('enable-email').checked.toString()
            };

            await adminService.updateSettings(settings);
            this.showSuccess('알림 설정이 저장되었습니다.');
        } catch (error) {
            console.error('알림 설정 저장 오류:', error);
            this.showError('알림 설정을 저장할 수 없습니다.');
        }
    }

    async updateAnalytics() {
        await this.loadAnalytics();
    }

    async clearLogs() {
        if (!confirm('1개월 이전의 로그를 모두 삭제하시겠습니까?')) {
            return;
        }

        try {
            await adminService.clearLogs();
            await this.loadLogs();
            this.showSuccess('로그가 삭제되었습니다.');
        } catch (error) {
            console.error('로그 삭제 오류:', error);
            this.showError('로그를 삭제할 수 없습니다.');
        }
    }

    // 유틸리티 함수
    openModal(modalId) {
        document.getElementById('modal-overlay').classList.add('active');
        document.getElementById(modalId).classList.add('active');
    }

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    getStatusText(status) {
        const statusMap = {
            active: '활성',
            inactive: '비활성',
            banned: '정지'
        };
        return statusMap[status] || '알 수 없음';
    }

    getRoleText(role) {
        const roleMap = {
            member: '일반',
            verified: '인증',
            admin: '관리자'
        };
        return roleMap[role] || '일반';
    }

    getPriorityText(priority) {
        const priorityMap = {
            normal: '일반',
            important: '중요',
            urgent: '긴급'
        };
        return priorityMap[priority] || '일반';
    }

    getNoticeStatusText(status) {
        const statusMap = {
            published: '게시됨',
            draft: '초안',
            archived: '보관'
        };
        return statusMap[status] || '알 수 없음';
    }

    formatRelativeTime(date) {
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

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    hideLoading() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
    }

    showError(message) {
        alert(`오류: ${message}`);
    }

    showSuccess(message) {
        alert(`성공: ${message}`);
    }

    searchUsers() {
        this.loadUsers();
    }

    searchPosts() {
        this.loadPosts();
    }

    async refreshData() {
        await this.loadTabData(this.currentTab);
        this.showSuccess('데이터가 새로고침되었습니다.');
    }

    async exportData() {
        try {
            const data = await this.getExportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `wavespace-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showSuccess('데이터가 내보내졌습니다.');
        } catch (error) {
            console.error('데이터 내보내기 오류:', error);
            this.showError('데이터를 내보낼 수 없습니다.');
        }
    }

    async getExportData() {
        const [users, posts, notices] = await Promise.all([
            supabase.from('users').select('*'),
            supabase.from('posts').select('*'),
            supabase.from('notices').select('*')
        ]);

        return {
            export_date: new Date().toISOString(),
            users: users.data,
            posts: posts.data,
            notices: notices.data
        };
    }
}

// 전역 함수들 (HTML에서 호출)
let admin;

document.addEventListener('DOMContentLoaded', () => {
    admin = new AdminDashboard();
});

window.logout = async () => {
    try {
        await authService.logout();
        window.location.href = '/index.html';
    } catch (error) {
        console.error('로그아웃 오류:', error);
    }
};

window.refreshData = () => admin.refreshData();
window.exportData = () => admin.exportData();
window.createUser = () => admin.createUser();
window.createNotice = () => admin.createNotice();
window.closeModal = () => admin.closeModal();
window.saveUser = () => admin.saveUser();
window.saveNotice = () => admin.saveNotice();
window.updateAnalytics = () => admin.updateAnalytics();
window.clearLogs = () => admin.clearLogs();