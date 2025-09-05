/**
 * NameCard 컴포넌트 로더
 * 사용자 프로필 카드 (아바타, 아이디, 대표뱃지)
 */

class NameCardLoader {
    constructor() {
        this.instanceCounter = 0;
        this.instances = new Map();
        this.templates = new Map();
        this.defaultConfig = {
            user: {
                name: '사용자명',
                id: null,
                role: null,
                company: null,
                avatar: null,
                status: null,
                location: null,
                joinDate: null,
                bio: null
            },
            badges: {
                primary: null,
                secondary: []
            },
            stats: {
                show: false,
                posts: 0,
                followers: 0,
                points: 0
            },
            actions: {
                show: false,
                primary: null,
                secondary: null,
                menu: true
            },
            layout: 'horizontal', // horizontal, vertical, list, compact
            theme: 'default',
            size: 'medium',
            interactive: false,
            showStatus: false,
            showMeta: false,
            showContent: false,
            avatarSize: 48,
            fallbackIcon: 'fas fa-user',
            statusColors: {
                online: '#10b981',
                offline: '#ef4444',
                away: '#f59e0b',
                busy: '#ef4444'
            },
            callbacks: {
                onMount: null,
                onClick: null,
                onAvatarClick: null,
                onActionClick: null,
                onBadgeClick: null
            }
        };
        this.badgePresets = {
            '실무자': { color: 'success', text: '실무자' },
            '관리자': { color: 'warning', text: '관리자' },
            'VIP': { color: 'purple', text: 'VIP' },
            '신규': { color: 'info', text: '신규' },
            '베테랑': { color: 'primary', text: '베테랑' }
        };
        this.loadTemplate();
    }

    async loadTemplate() {
        if (this.templates.has('name-card')) return;

        try {
            const response = await fetch('/components/name-card.html');
            if (!response.ok) throw new Error('Template loading failed');
            
            const template = await response.text();
            this.templates.set('name-card', template);
        } catch (error) {
            console.error('[NameCardLoader] 템플릿 로딩 실패:', error);
            this.createFallbackTemplate();
        }
    }

    createFallbackTemplate() {
        const fallbackTemplate = `
            <div class="wave-name-card" id="wave-name-card">
                <div class="name-card-avatar" id="name-card-avatar">
                    <img src="" alt="" id="avatar-image" style="display: none;">
                    <div class="avatar-fallback" id="avatar-fallback">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="avatar-status" id="avatar-status" style="display: none;">
                        <span class="status-dot"></span>
                    </div>
                </div>

                <div class="name-card-info">
                    <div class="user-name" id="user-name">사용자명</div>
                    <div class="user-id" id="user-id" style="display: none;">@username</div>
                    <div class="user-role" id="user-role" style="display: none;">실무자</div>
                    <div class="user-company" id="user-company" style="display: none;">회사명</div>
                    <div class="user-meta" id="user-meta" style="display: none;">
                        <span class="meta-item" id="user-location">서울, 한국</span>
                        <span class="meta-separator">•</span>
                        <span class="meta-item" id="user-joined">2024년 1월 가입</span>
                    </div>
                </div>

                <div class="name-card-badges" id="name-card-badges">
                    <div class="primary-badge" id="primary-badge" style="display: none;">
                        <span class="badge-text">실무자</span>
                    </div>
                    <div class="secondary-badges" id="secondary-badges" style="display: none;"></div>
                </div>

                <div class="name-card-actions" id="name-card-actions" style="display: none;">
                    <button type="button" class="action-btn primary" id="action-primary">
                        <i class="fas fa-plus"></i>
                        <span>팔로우</span>
                    </button>
                    <button type="button" class="action-btn secondary" id="action-secondary">
                        <i class="fas fa-envelope"></i>
                    </button>
                    <button type="button" class="action-btn menu" id="action-menu">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>

                <div class="name-card-stats" id="name-card-stats" style="display: none;">
                    <div class="stat-item" id="stat-posts">
                        <span class="stat-value">0</span>
                        <span class="stat-label">게시물</span>
                    </div>
                    <div class="stat-item" id="stat-followers">
                        <span class="stat-value">0</span>
                        <span class="stat-label">팔로워</span>
                    </div>
                    <div class="stat-item" id="stat-points">
                        <span class="stat-value">0</span>
                        <span class="stat-label">포인트</span>
                    </div>
                </div>

                <div class="name-card-content" id="name-card-content" style="display: none;">
                    <div class="content-text" id="content-text">자기소개나 추가 정보가 여기에 표시됩니다.</div>
                </div>
            </div>
        `;
        this.templates.set('name-card', fallbackTemplate);
    }

    async create(containerId, config = {}) {
        await this.loadTemplate();
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`[NameCardLoader] 컨테이너를 찾을 수 없습니다: ${containerId}`);
            return null;
        }

        const instanceId = `name_card_${++this.instanceCounter}`;
        const mergedConfig = this.mergeConfig(config);
        
        // 템플릿 삽입
        container.innerHTML = this.templates.get('name-card');
        
        // 고유 ID 설정
        const card = container.querySelector('#wave-name-card');
        card.id = instanceId;
        this.updateElementIds(card, instanceId);

        // 인스턴스 생성 및 초기화
        const instance = new NameCardInstance(card, mergedConfig, instanceId);
        this.instances.set(instanceId, instance);

        return instance;
    }

    mergeConfig(userConfig) {
        const config = JSON.parse(JSON.stringify(this.defaultConfig));
        
        Object.keys(userConfig).forEach(key => {
            if (typeof userConfig[key] === 'object' && userConfig[key] !== null && !Array.isArray(userConfig[key])) {
                config[key] = { ...config[key], ...userConfig[key] };
            } else {
                config[key] = userConfig[key];
            }
        });

        return config;
    }

    updateElementIds(card, instanceId) {
        const elements = card.querySelectorAll('[id]');
        elements.forEach(element => {
            const currentId = element.id;
            element.id = `${currentId}_${instanceId.split('_')[2]}`;
        });
    }

    getInstance(instanceId) {
        return this.instances.get(instanceId);
    }

    getAllInstances() {
        return Array.from(this.instances.values());
    }

    destroyInstance(instanceId) {
        const instance = this.instances.get(instanceId);
        if (instance) {
            instance.destroy();
            this.instances.delete(instanceId);
        }
    }

    destroyAll() {
        this.instances.forEach((instance, id) => {
            instance.destroy();
        });
        this.instances.clear();
    }
}

class NameCardInstance {
    constructor(element, config, instanceId) {
        this.element = element;
        this.config = config;
        this.instanceId = instanceId;

        this.elements = {
            avatar: this.element.querySelector('.name-card-avatar'),
            avatarImage: this.element.querySelector('#avatar-image'),
            avatarFallback: this.element.querySelector('.avatar-fallback'),
            avatarStatus: this.element.querySelector('.avatar-status'),
            userName: this.element.querySelector('.user-name'),
            userId: this.element.querySelector('.user-id'),
            userRole: this.element.querySelector('.user-role'),
            userCompany: this.element.querySelector('.user-company'),
            userMeta: this.element.querySelector('.user-meta'),
            userLocation: this.element.querySelector('#user-location'),
            userJoined: this.element.querySelector('#user-joined'),
            badges: this.element.querySelector('.name-card-badges'),
            primaryBadge: this.element.querySelector('.primary-badge'),
            secondaryBadges: this.element.querySelector('.secondary-badges'),
            actions: this.element.querySelector('.name-card-actions'),
            actionPrimary: this.element.querySelector('#action-primary'),
            actionSecondary: this.element.querySelector('#action-secondary'),
            actionMenu: this.element.querySelector('#action-menu'),
            stats: this.element.querySelector('.name-card-stats'),
            statPosts: this.element.querySelector('#stat-posts .stat-value'),
            statFollowers: this.element.querySelector('#stat-followers .stat-value'),
            statPoints: this.element.querySelector('#stat-points .stat-value'),
            content: this.element.querySelector('.name-card-content'),
            contentText: this.element.querySelector('.content-text')
        };

        this.init();
    }

    init() {
        this.applyConfig();
        this.bindEvents();
        this.executeCallback('onMount');
    }

    applyConfig() {
        const { config } = this;
        
        // 레이아웃 및 테마 적용
        let classes = ['wave-name-card'];
        if (config.layout !== 'horizontal') classes.push(config.layout);
        if (config.theme !== 'default') classes.push(config.theme);
        if (config.size !== 'medium') classes.push(config.size);
        if (config.interactive) classes.push('interactive');
        
        this.element.className = classes.join(' ');

        // 사용자 정보 설정
        this.setUserInfo(config.user);
        
        // 뱃지 설정
        this.setBadges(config.badges);
        
        // 통계 설정
        if (config.stats.show) {
            this.setStats(config.stats);
        }
        
        // 액션 설정
        if (config.actions.show) {
            this.setActions(config.actions);
        }
        
        // 추가 콘텐츠
        if (config.showContent && config.user.bio) {
            this.setContent(config.user.bio);
        }
    }

    bindEvents() {
        // 카드 클릭
        if (this.config.interactive || this.config.callbacks.onClick) {
            this.element.addEventListener('click', (e) => {
                if (e.target.closest('.name-card-actions') || e.target.closest('.name-card-avatar')) {
                    return; // 액션 버튼이나 아바타 클릭은 별도 처리
                }
                this.executeCallback('onClick', {
                    user: this.config.user,
                    element: this.element
                });
            });
        }

        // 아바타 클릭
        this.elements.avatar.addEventListener('click', (e) => {
            e.stopPropagation();
            this.executeCallback('onAvatarClick', {
                user: this.config.user,
                element: this.elements.avatar
            });
        });

        // 액션 버튼 클릭
        this.elements.actions.addEventListener('click', (e) => {
            e.stopPropagation();
            const actionBtn = e.target.closest('.action-btn');
            if (actionBtn) {
                const actionType = actionBtn.classList.contains('primary') ? 'primary' :
                                  actionBtn.classList.contains('secondary') ? 'secondary' : 'menu';
                
                this.executeCallback('onActionClick', {
                    action: actionType,
                    user: this.config.user,
                    element: actionBtn
                });
            }
        });

        // 뱃지 클릭
        this.elements.badges.addEventListener('click', (e) => {
            e.stopPropagation();
            const badge = e.target.closest('.primary-badge, .secondary-badge');
            if (badge) {
                const badgeText = badge.querySelector('.badge-text').textContent;
                this.executeCallback('onBadgeClick', {
                    badge: badgeText,
                    user: this.config.user,
                    element: badge
                });
            }
        });

        // 키보드 접근성
        if (this.config.interactive) {
            this.element.setAttribute('tabindex', '0');
            this.element.setAttribute('role', 'button');
            
            this.element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.executeCallback('onClick', {
                        user: this.config.user,
                        element: this.element
                    });
                }
            });
        }
    }

    setUserInfo(user) {
        // 이름 설정
        this.elements.userName.textContent = user.name;
        
        // 사용자 ID
        if (user.id) {
            this.elements.userId.textContent = `@${user.id}`;
            this.elements.userId.style.display = 'block';
        }
        
        // 역할
        if (user.role) {
            this.elements.userRole.textContent = user.role;
            this.elements.userRole.style.display = 'block';
        }
        
        // 회사
        if (user.company) {
            this.elements.userCompany.textContent = user.company;
            this.elements.userCompany.style.display = 'block';
        }
        
        // 메타 정보
        if (this.config.showMeta && (user.location || user.joinDate)) {
            this.elements.userMeta.style.display = 'flex';
            
            if (user.location) {
                this.elements.userLocation.textContent = user.location;
            } else {
                this.elements.userLocation.style.display = 'none';
            }
            
            if (user.joinDate) {
                this.elements.userJoined.textContent = user.joinDate;
            } else {
                this.elements.userJoined.style.display = 'none';
                this.element.querySelector('.meta-separator').style.display = 'none';
            }
        }
        
        // 아바타 설정
        this.setAvatar(user.avatar);
        
        // 상태 설정
        if (this.config.showStatus && user.status) {
            this.setStatus(user.status);
        }
    }

    setAvatar(avatarUrl) {
        if (avatarUrl) {
            this.elements.avatarImage.src = avatarUrl;
            this.elements.avatarImage.alt = `${this.config.user.name} 프로필`;
            this.elements.avatarImage.style.display = 'block';
            this.elements.avatarFallback.style.display = 'none';
            
            // 이미지 로드 실패 처리
            this.elements.avatarImage.onerror = () => {
                this.elements.avatarImage.style.display = 'none';
                this.elements.avatarFallback.style.display = 'flex';
            };
        } else {
            this.elements.avatarImage.style.display = 'none';
            this.elements.avatarFallback.style.display = 'flex';
            
            // 폴백 아이콘 설정
            const fallbackIcon = this.elements.avatarFallback.querySelector('i');
            fallbackIcon.className = this.config.fallbackIcon;
        }
        
        // 아바타 크기 설정
        const avatarSize = `${this.config.avatarSize}px`;
        this.elements.avatarImage.style.width = avatarSize;
        this.elements.avatarImage.style.height = avatarSize;
        this.elements.avatarFallback.style.width = avatarSize;
        this.elements.avatarFallback.style.height = avatarSize;
    }

    setStatus(status) {
        this.elements.avatarStatus.style.display = 'block';
        this.elements.avatarStatus.className = `avatar-status ${status}`;
        
        const statusDot = this.elements.avatarStatus.querySelector('.status-dot');
        statusDot.style.background = this.config.statusColors[status] || '#6b7280';
    }

    setBadges(badges) {
        // 대표 뱃지
        if (badges.primary) {
            const badge = badges.primary;
            this.elements.primaryBadge.style.display = 'block';
            
            // 프리셋 사용
            if (typeof badge === 'string' && this.badgePresets[badge]) {
                const preset = this.badgePresets[badge];
                this.elements.primaryBadge.className = `primary-badge ${preset.color}`;
                this.elements.primaryBadge.querySelector('.badge-text').textContent = preset.text;
            } else if (typeof badge === 'object') {
                this.elements.primaryBadge.className = `primary-badge ${badge.color || ''}`;
                this.elements.primaryBadge.querySelector('.badge-text').textContent = badge.text;
            } else {
                this.elements.primaryBadge.querySelector('.badge-text').textContent = badge;
            }
        }
        
        // 보조 뱃지들
        if (badges.secondary && badges.secondary.length > 0) {
            this.elements.secondaryBadges.style.display = 'flex';
            this.elements.secondaryBadges.innerHTML = '';
            
            badges.secondary.forEach(badge => {
                const badgeElement = document.createElement('div');
                badgeElement.className = 'secondary-badge';
                
                const textElement = document.createElement('span');
                textElement.className = 'badge-text';
                textElement.textContent = typeof badge === 'string' ? badge : badge.text;
                
                badgeElement.appendChild(textElement);
                this.elements.secondaryBadges.appendChild(badgeElement);
            });
        }
    }

    setStats(stats) {
        this.elements.stats.style.display = 'flex';
        
        this.elements.statPosts.textContent = this.formatNumber(stats.posts);
        this.elements.statFollowers.textContent = this.formatNumber(stats.followers);
        this.elements.statPoints.textContent = this.formatNumber(stats.points);
    }

    setActions(actions) {
        this.elements.actions.style.display = 'flex';
        
        // 주요 액션
        if (actions.primary) {
            const btn = this.elements.actionPrimary;
            btn.querySelector('span').textContent = actions.primary.text;
            
            if (actions.primary.icon) {
                btn.querySelector('i').className = actions.primary.icon;
            }
        } else {
            this.elements.actionPrimary.style.display = 'none';
        }
        
        // 보조 액션
        if (actions.secondary) {
            const btn = this.elements.actionSecondary;
            
            if (actions.secondary.icon) {
                btn.querySelector('i').className = actions.secondary.icon;
            }
            
            if (actions.secondary.text) {
                const textElement = document.createElement('span');
                textElement.textContent = actions.secondary.text;
                btn.appendChild(textElement);
            }
        } else {
            this.elements.actionSecondary.style.display = 'none';
        }
        
        // 메뉴
        if (!actions.menu) {
            this.elements.actionMenu.style.display = 'none';
        }
    }

    setContent(content) {
        if (content) {
            this.elements.content.style.display = 'block';
            this.elements.contentText.textContent = content;
        } else {
            this.elements.content.style.display = 'none';
        }
    }

    updateUser(userData) {
        Object.assign(this.config.user, userData);
        this.setUserInfo(this.config.user);
    }

    updateBadges(badges) {
        Object.assign(this.config.badges, badges);
        this.setBadges(this.config.badges);
    }

    updateStats(stats) {
        Object.assign(this.config.stats, stats);
        this.setStats(this.config.stats);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    setInteractive(interactive) {
        this.config.interactive = interactive;
        
        if (interactive) {
            this.element.classList.add('interactive');
            this.element.setAttribute('tabindex', '0');
            this.element.setAttribute('role', 'button');
        } else {
            this.element.classList.remove('interactive');
            this.element.removeAttribute('tabindex');
            this.element.removeAttribute('role');
        }
    }

    setLayout(layout) {
        // 기존 레이아웃 클래스 제거
        const layoutClasses = ['horizontal', 'vertical', 'list', 'compact'];
        layoutClasses.forEach(cls => this.element.classList.remove(cls));
        
        // 새 레이아웃 적용
        if (layout !== 'horizontal') {
            this.element.classList.add(layout);
        }
        
        this.config.layout = layout;
    }

    setSize(size) {
        // 기존 크기 클래스 제거
        const sizeClasses = ['small', 'medium', 'large'];
        sizeClasses.forEach(cls => this.element.classList.remove(cls));
        
        // 새 크기 적용
        if (size !== 'medium') {
            this.element.classList.add(size);
        }
        
        this.config.size = size;
    }

    show() {
        this.element.style.display = '';
    }

    hide() {
        this.element.style.display = 'none';
    }

    executeCallback(name, data = null) {
        const callback = this.config.callbacks[name];
        if (typeof callback === 'function') {
            try {
                callback.call(this, data);
            } catch (error) {
                console.error(`[NameCardLoader] 콜백 실행 오류 (${name}):`, error);
            }
        }
    }

    destroy() {
        // DOM에서 제거
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        // 참조 정리
        this.element = null;
        this.elements = null;
        this.config = null;
    }
}

// 전역 인스턴스 생성
const nameCardLoader = new NameCardLoader();

// ES6 모듈 export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NameCardLoader;
}

// 전역 객체로도 사용 가능
if (typeof window !== 'undefined') {
    window.NameCardLoader = NameCardLoader;
    window.nameCardLoader = nameCardLoader;
}