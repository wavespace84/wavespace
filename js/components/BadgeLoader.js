/**
 * Badge 컴포넌트 로더
 * 상태/라벨 표시용 뱃지
 */

class BadgeLoader {
    constructor() {
        this.instanceCounter = 0;
        this.instances = new Map();
        this.templates = new Map();
        this.defaultConfig = {
            text: 'Badge',
            type: 'default',
            variant: 'filled',
            size: 'medium',
            color: 'default',
            icon: null,
            count: null,
            closable: false,
            interactive: false,
            pulse: false,
            glow: false,
            gradient: false,
            rounded: false,
            square: false,
            dot: false,
            numeric: false,
            theme: 'light',
            position: 'static',
            maxCount: 99,
            showZero: false,
            animation: {
                enabled: true,
                type: 'fadeIn',
                duration: 300
            },
            callbacks: {
                onClick: null,
                onClose: null,
                onMount: null,
                onDestroy: null
            }
        };
        this.colorPresets = {
            online: { color: 'success', text: '온라인', icon: '●' },
            offline: { color: 'error', text: '오프라인', icon: '●' },
            away: { color: 'warning', text: '자리비움', icon: '●' },
            busy: { color: 'error', text: '바쁨', icon: '●', pulse: true },
            실무자: { color: 'success', text: '실무자' },
            관리자: { color: 'warning', text: '관리자' },
            VIP: { color: 'purple', text: 'VIP' },
            신규: { color: 'info', text: '신규', pulse: true },
            인기: { color: 'error', text: '인기', glow: true }
        };
        this.loadTemplate();
    }

    async loadTemplate() {
        if (this.templates.has('badge')) return;

        try {
            const response = await fetch('/components/badge.html');
            if (!response.ok) throw new Error('Template loading failed');
            
            const template = await response.text();
            this.templates.set('badge', template);
        } catch (error) {
            console.error('[BadgeLoader] 템플릿 로딩 실패:', error);
            this.createFallbackTemplate();
        }
    }

    createFallbackTemplate() {
        const fallbackTemplate = `
            <span class="wave-badge" id="wave-badge">
                <i class="badge-icon" id="badge-icon" style="display: none;"></i>
                <span class="badge-text" id="badge-text">Badge</span>
                <span class="badge-count" id="badge-count" style="display: none;">0</span>
                <button type="button" class="badge-close" id="badge-close" style="display: none;">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `;
        this.templates.set('badge', fallbackTemplate);
    }

    async create(containerId, config = {}) {
        await this.loadTemplate();
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`[BadgeLoader] 컨테이너를 찾을 수 없습니다: ${containerId}`);
            return null;
        }

        const instanceId = `badge_${++this.instanceCounter}`;
        const mergedConfig = this.mergeConfig(config);
        
        // 프리셋 적용
        if (config.preset && this.colorPresets[config.preset]) {
            Object.assign(mergedConfig, this.colorPresets[config.preset], config);
        }

        // 템플릿 삽입
        container.innerHTML = this.templates.get('badge');
        
        // 고유 ID 설정
        const badge = container.querySelector('#wave-badge');
        badge.id = instanceId;
        this.updateElementIds(badge, instanceId);

        // 인스턴스 생성 및 초기화
        const instance = new BadgeInstance(badge, mergedConfig, instanceId);
        this.instances.set(instanceId, instance);

        return instance;
    }

    mergeConfig(userConfig) {
        const config = { ...this.defaultConfig };
        
        // 깊은 복사 for nested objects
        Object.keys(userConfig).forEach(key => {
            if (typeof userConfig[key] === 'object' && userConfig[key] !== null && !Array.isArray(userConfig[key])) {
                config[key] = { ...config[key], ...userConfig[key] };
            } else {
                config[key] = userConfig[key];
            }
        });

        return config;
    }

    updateElementIds(badge, instanceId) {
        const elements = badge.querySelectorAll('[id]');
        elements.forEach(element => {
            const currentId = element.id;
            element.id = `${currentId}_${instanceId.split('_')[1]}`;
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

    // 유틸리티 메소드
    createQuickBadge(text, color = 'default', options = {}) {
        const badgeElement = document.createElement('span');
        badgeElement.className = `wave-badge ${color} ${options.variant || 'filled'} ${options.size || 'medium'}`;
        
        if (options.icon) {
            const iconElement = document.createElement('i');
            iconElement.className = `badge-icon ${options.icon}`;
            badgeElement.appendChild(iconElement);
        }
        
        const textElement = document.createElement('span');
        textElement.className = 'badge-text';
        textElement.textContent = text;
        badgeElement.appendChild(textElement);
        
        if (options.closable) {
            badgeElement.classList.add('closable');
            const closeButton = document.createElement('button');
            closeButton.className = 'badge-close';
            closeButton.innerHTML = '<i class="fas fa-times"></i>';
            badgeElement.appendChild(closeButton);
        }
        
        return badgeElement;
    }
}

class BadgeInstance {
    constructor(element, config, instanceId) {
        this.element = element;
        this.config = config;
        this.instanceId = instanceId;
        this.isVisible = true;
        this.currentCount = config.count || 0;

        this.elements = {
            icon: this.element.querySelector('.badge-icon'),
            text: this.element.querySelector('.badge-text'),
            count: this.element.querySelector('.badge-count'),
            close: this.element.querySelector('.badge-close')
        };

        this.init();
    }

    init() {
        this.applyConfig();
        this.bindEvents();
        this.executeCallback('onMount');
        
        if (this.config.animation.enabled) {
            this.playAnimation('show');
        }
    }

    applyConfig() {
        const { config } = this;
        
        // 기본 클래스 설정
        let classes = ['wave-badge'];
        
        // 색상 및 타입
        if (config.color && config.color !== 'default') {
            classes.push(config.color);
        }
        
        // 변형
        if (config.variant) {
            classes.push(config.variant);
        }
        
        // 크기
        if (config.size && config.size !== 'medium') {
            classes.push(config.size);
        }
        
        // 형태
        if (config.dot) {
            classes.push('dot');
        } else if (config.numeric) {
            classes.push('numeric');
        }
        
        if (config.rounded) classes.push('rounded');
        if (config.square) classes.push('square');
        if (config.interactive) classes.push('interactive');
        if (config.pulse) classes.push('pulse');
        if (config.glow) classes.push('glow');
        if (config.gradient) classes.push('gradient');
        if (config.closable) classes.push('closable');
        
        this.element.className = classes.join(' ');
        
        // 텍스트 설정
        if (config.text) {
            this.elements.text.textContent = config.text;
        }
        
        // 아이콘 설정
        if (config.icon) {
            this.elements.icon.className = `badge-icon ${config.icon}`;
            this.elements.icon.style.display = 'inline';
        } else {
            this.elements.icon.style.display = 'none';
        }
        
        // 카운트 설정
        if (config.count !== null && config.count !== undefined) {
            this.setCount(config.count);
        } else {
            this.elements.count.style.display = 'none';
        }
        
        // 닫기 버튼 설정
        if (config.closable) {
            this.elements.close.style.display = 'inline-flex';
        } else {
            this.elements.close.style.display = 'none';
        }
        
        // 포지션 설정
        if (config.position !== 'static') {
            this.element.style.position = config.position;
        }
    }

    bindEvents() {
        // 클릭 이벤트
        if (this.config.interactive || this.config.callbacks.onClick) {
            this.element.addEventListener('click', (e) => {
                if (e.target.closest('.badge-close')) return;
                this.executeCallback('onClick', { element: this.element, config: this.config });
            });
        }

        // 닫기 버튼 이벤트
        if (this.config.closable) {
            this.elements.close.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
            });
        }

        // 키보드 이벤트 (접근성)
        if (this.config.interactive) {
            this.element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.executeCallback('onClick', { element: this.element, config: this.config });
                }
            });

            // 포커스 지원
            this.element.setAttribute('tabindex', '0');
            this.element.setAttribute('role', 'button');
        }

        if (this.config.closable) {
            this.elements.close.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.close();
                }
            });
        }
    }

    setText(text) {
        this.config.text = text;
        this.elements.text.textContent = text;
    }

    setIcon(icon) {
        this.config.icon = icon;
        if (icon) {
            this.elements.icon.className = `badge-icon ${icon}`;
            this.elements.icon.style.display = 'inline';
        } else {
            this.elements.icon.style.display = 'none';
        }
    }

    setCount(count) {
        this.currentCount = count;
        
        if (count === null || count === undefined || (count === 0 && !this.config.showZero)) {
            this.elements.count.style.display = 'none';
            return;
        }
        
        let displayCount = count;
        if (typeof count === 'number') {
            displayCount = count > this.config.maxCount ? `${this.config.maxCount}+` : count.toString();
        }
        
        this.elements.count.textContent = displayCount;
        this.elements.count.style.display = 'inline';
    }

    incrementCount(amount = 1) {
        if (typeof this.currentCount === 'number') {
            this.setCount(this.currentCount + amount);
        }
    }

    decrementCount(amount = 1) {
        if (typeof this.currentCount === 'number') {
            this.setCount(Math.max(0, this.currentCount - amount));
        }
    }

    setColor(color) {
        // 기존 색상 클래스 제거
        const colorClasses = ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'danger', 'info', 'purple', 'pink', 'indigo', 'teal', 'orange', 'cyan', 'lime', 'amber'];
        colorClasses.forEach(cls => this.element.classList.remove(cls));
        
        // 새 색상 추가
        if (color && color !== 'default') {
            this.element.classList.add(color);
        }
        
        this.config.color = color;
    }

    setVariant(variant) {
        // 기존 변형 클래스 제거
        const variantClasses = ['filled', 'outline', 'solid'];
        variantClasses.forEach(cls => this.element.classList.remove(cls));
        
        // 새 변형 추가
        if (variant) {
            this.element.classList.add(variant);
        }
        
        this.config.variant = variant;
    }

    enable() {
        this.element.classList.remove('disabled');
        if (this.config.interactive) {
            this.element.setAttribute('tabindex', '0');
        }
    }

    disable() {
        this.element.classList.add('disabled');
        this.element.removeAttribute('tabindex');
    }

    show() {
        if (!this.isVisible) {
            this.isVisible = true;
            this.element.style.display = '';
            
            if (this.config.animation.enabled) {
                this.playAnimation('show');
            }
        }
    }

    hide() {
        if (this.isVisible) {
            this.isVisible = false;
            
            if (this.config.animation.enabled) {
                this.playAnimation('hide', () => {
                    this.element.style.display = 'none';
                });
            } else {
                this.element.style.display = 'none';
            }
        }
    }

    close() {
        this.executeCallback('onClose', { element: this.element, config: this.config });
        
        if (this.config.animation.enabled) {
            this.playAnimation('hide', () => {
                this.destroy();
            });
        } else {
            this.destroy();
        }
    }

    playAnimation(type, callback = null) {
        const { animation } = this.config;
        
        this.element.style.transition = `all ${animation.duration}ms ease`;
        
        switch (type) {
            case 'show':
                if (animation.type === 'fadeIn') {
                    this.element.style.opacity = '0';
                    this.element.style.transform = 'scale(0.8)';
                    
                    requestAnimationFrame(() => {
                        this.element.style.opacity = '1';
                        this.element.style.transform = 'scale(1)';
                    });
                } else if (animation.type === 'slideIn') {
                    this.element.style.transform = 'translateX(-10px)';
                    this.element.style.opacity = '0';
                    
                    requestAnimationFrame(() => {
                        this.element.style.transform = 'translateX(0)';
                        this.element.style.opacity = '1';
                    });
                }
                break;
                
            case 'hide':
                if (animation.type === 'fadeOut') {
                    this.element.style.opacity = '0';
                    this.element.style.transform = 'scale(0.8)';
                } else if (animation.type === 'slideOut') {
                    this.element.style.transform = 'translateX(-10px)';
                    this.element.style.opacity = '0';
                }
                
                if (callback) {
                    setTimeout(callback, animation.duration);
                }
                break;
        }
    }

    pulse(duration = 2000) {
        this.element.classList.add('pulse');
        
        if (duration > 0) {
            setTimeout(() => {
                this.element.classList.remove('pulse');
            }, duration);
        }
    }

    glow(duration = 0) {
        this.element.classList.add('glow');
        
        if (duration > 0) {
            setTimeout(() => {
                this.element.classList.remove('glow');
            }, duration);
        }
    }

    clone() {
        const clonedElement = this.element.cloneNode(true);
        return new BadgeInstance(clonedElement, { ...this.config }, `${this.instanceId}_clone`);
    }

    getConfig() {
        return { ...this.config };
    }

    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        this.applyConfig();
    }

    executeCallback(name, data = null) {
        const callback = this.config.callbacks[name];
        if (typeof callback === 'function') {
            try {
                callback.call(this, data);
            } catch (error) {
                console.error(`[BadgeLoader] 콜백 실행 오류 (${name}):`, error);
            }
        }
    }

    destroy() {
        this.executeCallback('onDestroy', { element: this.element });
        
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
const badgeLoader = new BadgeLoader();

// ES6 모듈 export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BadgeLoader;
}

// 전역 객체로도 사용 가능
if (typeof window !== 'undefined') {
    window.BadgeLoader = BadgeLoader;
    window.badgeLoader = badgeLoader;
}