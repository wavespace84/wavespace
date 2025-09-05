/**
 * StatCard 컴포넌트 로더
 * 통계 정보 표시용 카드
 */

class StatCardLoader {
    constructor() {
        this.instanceCounter = 0;
        this.instances = new Map();
        this.templates = new Map();
        this.chartInstances = new Map();
        this.defaultConfig = {
            title: '',
            value: 0,
            unit: '',
            label: '통계',
            icon: 'fas fa-chart-line',
            theme: 'default',
            size: 'medium',
            showHeader: false,
            showProgress: false,
            showChart: false,
            showSecondaryStats: false,
            showFooter: false,
            animated: true,
            change: null,
            progress: {
                value: 0,
                max: 100,
                label: '진행률',
                type: 'default'
            },
            secondaryStats: [],
            chart: {
                type: 'line',
                data: [],
                colors: ['#3b82f6'],
                height: 40,
                animate: true
            },
            footer: {
                text: '마지막 업데이트: 방금 전',
                action: null
            },
            actions: [],
            format: {
                number: true,
                locale: 'ko-KR',
                decimal: 0,
                currency: false
            },
            realtime: {
                enabled: false,
                interval: 5000,
                url: null,
                autoStart: false
            },
            callbacks: {
                onMount: null,
                onUpdate: null,
                onClick: null,
                onActionClick: null,
                onDataUpdate: null
            }
        };
        this.loadTemplate();
    }

    async loadTemplate() {
        if (this.templates.has('stat-card')) return;

        try {
            const response = await fetch('/components/stat-card.html');
            if (!response.ok) throw new Error('Template loading failed');
            
            const template = await response.text();
            this.templates.set('stat-card', template);
        } catch (error) {
            console.error('[StatCardLoader] 템플릿 로딩 실패:', error);
            this.createFallbackTemplate();
        }
    }

    createFallbackTemplate() {
        const fallbackTemplate = `
            <div class="wave-stat-card" id="wave-stat-card">
                <div class="stat-card-header" id="stat-card-header" style="display: none;">
                    <h4 class="stat-card-title" id="stat-card-title">통계 제목</h4>
                    <div class="stat-card-actions" id="stat-card-actions"></div>
                </div>

                <div class="stat-card-main">
                    <div class="stat-icon" id="stat-icon" style="display: none;">
                        <i class="fas fa-chart-line"></i>
                    </div>

                    <div class="stat-content">
                        <div class="stat-value" id="stat-value">
                            <span class="stat-number" id="stat-number">0</span>
                            <span class="stat-unit" id="stat-unit"></span>
                        </div>
                        
                        <div class="stat-label" id="stat-label">통계 라벨</div>
                        
                        <div class="stat-change" id="stat-change" style="display: none;">
                            <i class="stat-change-icon fas fa-arrow-up"></i>
                            <span class="stat-change-value" id="stat-change-value">0%</span>
                            <span class="stat-change-period" id="stat-change-period">전월 대비</span>
                        </div>
                    </div>
                </div>

                <div class="stat-card-secondary" id="stat-card-secondary" style="display: none;">
                    <div class="secondary-stats" id="secondary-stats"></div>
                </div>

                <div class="stat-card-chart" id="stat-card-chart" style="display: none;">
                    <canvas id="stat-chart-canvas" width="100" height="40"></canvas>
                </div>

                <div class="stat-progress" id="stat-progress" style="display: none;">
                    <div class="progress-info">
                        <span class="progress-label" id="progress-label">진행률</span>
                        <span class="progress-percentage" id="progress-percentage">0%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                    </div>
                </div>

                <div class="stat-card-footer" id="stat-card-footer" style="display: none;">
                    <div class="footer-content" id="footer-content">
                        <span class="footer-text" id="footer-text">마지막 업데이트: 방금 전</span>
                    </div>
                </div>
            </div>
        `;
        this.templates.set('stat-card', fallbackTemplate);
    }

    async create(containerId, config = {}) {
        await this.loadTemplate();
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`[StatCardLoader] 컨테이너를 찾을 수 없습니다: ${containerId}`);
            return null;
        }

        const instanceId = `stat_card_${++this.instanceCounter}`;
        const mergedConfig = this.mergeConfig(config);
        
        // 템플릿 삽입
        container.innerHTML = this.templates.get('stat-card');
        
        // 고유 ID 설정
        const card = container.querySelector('#wave-stat-card');
        card.id = instanceId;
        this.updateElementIds(card, instanceId);

        // 인스턴스 생성 및 초기화
        const instance = new StatCardInstance(card, mergedConfig, instanceId);
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

class StatCardInstance {
    constructor(element, config, instanceId) {
        this.element = element;
        this.config = config;
        this.instanceId = instanceId;
        this.chart = null;
        this.realtimeInterval = null;
        this.animationFrame = null;

        this.elements = {
            header: this.element.querySelector('.stat-card-header'),
            title: this.element.querySelector('.stat-card-title'),
            actions: this.element.querySelector('.stat-card-actions'),
            icon: this.element.querySelector('.stat-icon'),
            iconElement: this.element.querySelector('.stat-icon i'),
            number: this.element.querySelector('.stat-number'),
            unit: this.element.querySelector('.stat-unit'),
            label: this.element.querySelector('.stat-label'),
            change: this.element.querySelector('.stat-change'),
            changeIcon: this.element.querySelector('.stat-change-icon'),
            changeValue: this.element.querySelector('.stat-change-value'),
            changePeriod: this.element.querySelector('.stat-change-period'),
            secondary: this.element.querySelector('.stat-card-secondary'),
            secondaryStats: this.element.querySelector('.secondary-stats'),
            chart: this.element.querySelector('.stat-card-chart'),
            canvas: this.element.querySelector('#stat-chart-canvas'),
            progress: this.element.querySelector('.stat-progress'),
            progressLabel: this.element.querySelector('.progress-label'),
            progressPercentage: this.element.querySelector('.progress-percentage'),
            progressFill: this.element.querySelector('.progress-fill'),
            footer: this.element.querySelector('.stat-card-footer'),
            footerText: this.element.querySelector('.footer-text')
        };

        this.init();
    }

    init() {
        this.applyConfig();
        this.bindEvents();
        this.executeCallback('onMount');
        
        if (this.config.realtime.enabled && this.config.realtime.autoStart) {
            this.startRealtime();
        }
    }

    applyConfig() {
        const { config } = this;
        
        // 테마 및 크기 적용
        let classes = ['wave-stat-card'];
        if (config.theme !== 'default') classes.push(config.theme);
        if (config.size !== 'medium') classes.push(config.size);
        if (config.animated) classes.push('animated');
        
        this.element.className = classes.join(' ');

        // 헤더 설정
        if (config.showHeader && config.title) {
            this.elements.header.style.display = 'block';
            this.elements.title.textContent = config.title;
            this.renderActions();
        }

        // 아이콘 설정
        if (config.icon) {
            this.elements.icon.style.display = 'flex';
            this.elements.iconElement.className = config.icon;
            
            // 테마별 아이콘 색상
            if (config.theme !== 'default') {
                this.elements.icon.classList.add(config.theme);
            }
        }

        // 메인 통계 설정
        this.setValue(config.value);
        this.setUnit(config.unit);
        this.setLabel(config.label);

        // 변화량 설정
        if (config.change) {
            this.setChange(config.change);
        }

        // 보조 통계 설정
        if (config.showSecondaryStats && config.secondaryStats.length > 0) {
            this.elements.secondary.style.display = 'block';
            this.renderSecondaryStats();
        }

        // 차트 설정
        if (config.showChart && config.chart.data.length > 0) {
            this.elements.chart.style.display = 'block';
            this.renderChart();
        }

        // 진행률 설정
        if (config.showProgress) {
            this.elements.progress.style.display = 'block';
            this.setProgress(config.progress.value, config.progress.max);
        }

        // 푸터 설정
        if (config.showFooter) {
            this.elements.footer.style.display = 'block';
            this.elements.footerText.textContent = config.footer.text;
            
            if (config.footer.action) {
                const actionLink = document.createElement('a');
                actionLink.className = 'footer-action';
                actionLink.href = config.footer.action.url || '#';
                actionLink.textContent = config.footer.action.text;
                this.elements.footer.querySelector('.footer-content').appendChild(actionLink);
            }
        }
    }

    bindEvents() {
        // 카드 클릭
        if (this.config.callbacks.onClick) {
            this.element.addEventListener('click', (e) => {
                if (!e.target.closest('.stat-card-actions')) {
                    this.executeCallback('onClick', {
                        element: this.element,
                        config: this.config
                    });
                }
            });
        }

        // 액션 버튼 클릭
        this.elements.actions.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.stat-action-btn');
            if (actionBtn) {
                const action = actionBtn.dataset.action;
                this.executeCallback('onActionClick', { action, element: actionBtn });
            }
        });
    }

    renderActions() {
        this.elements.actions.innerHTML = '';
        
        this.config.actions.forEach(action => {
            const button = document.createElement('button');
            button.className = 'stat-action-btn';
            button.dataset.action = action.id || action.text;
            button.textContent = action.text;
            
            if (action.icon) {
                button.innerHTML = `<i class="${action.icon}"></i> ${action.text}`;
            }
            
            this.elements.actions.appendChild(button);
        });
    }

    renderSecondaryStats() {
        this.elements.secondaryStats.innerHTML = '';
        
        this.config.secondaryStats.forEach(stat => {
            const statElement = document.createElement('div');
            statElement.className = 'secondary-stat';
            
            const valueElement = document.createElement('div');
            valueElement.className = 'secondary-stat-value';
            valueElement.textContent = this.formatNumber(stat.value);
            
            const labelElement = document.createElement('div');
            labelElement.className = 'secondary-stat-label';
            labelElement.textContent = stat.label;
            
            statElement.appendChild(valueElement);
            statElement.appendChild(labelElement);
            this.elements.secondaryStats.appendChild(statElement);
        });
    }

    renderChart() {
        if (!this.elements.canvas) return;

        const ctx = this.elements.canvas.getContext('2d');
        const { chart } = this.config;
        const data = chart.data;
        
        if (data.length === 0) return;

        // 캔버스 크기 설정
        const rect = this.elements.chart.getBoundingClientRect();
        this.elements.canvas.width = rect.width;
        this.elements.canvas.height = chart.height;

        // 데이터 정규화
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;

        const width = this.elements.canvas.width;
        const height = this.elements.canvas.height;
        const stepX = width / (data.length - 1 || 1);
        const padding = 4;

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = chart.colors[0] || '#3b82f6';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (chart.type === 'line') {
            ctx.beginPath();
            data.forEach((value, index) => {
                const x = index * stepX;
                const y = height - padding - ((value - min) / range) * (height - padding * 2);
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        } else if (chart.type === 'bar') {
            const barWidth = stepX * 0.8;
            data.forEach((value, index) => {
                const x = index * stepX - barWidth / 2;
                const barHeight = ((value - min) / range) * (height - padding * 2);
                const y = height - padding - barHeight;
                
                ctx.fillStyle = chart.colors[index % chart.colors.length] || '#3b82f6';
                ctx.fillRect(x, y, barWidth, barHeight);
            });
        }

        this.chart = { ctx, data, config: chart };
    }

    setValue(value, animated = false) {
        const formattedValue = this.formatNumber(value);
        
        if (animated && this.config.animated) {
            this.animateValue(this.config.value || 0, value);
        } else {
            this.elements.number.textContent = formattedValue;
        }
        
        this.config.value = value;
    }

    setUnit(unit) {
        this.config.unit = unit;
        this.elements.unit.textContent = unit;
        this.elements.unit.style.display = unit ? 'inline' : 'none';
    }

    setLabel(label) {
        this.config.label = label;
        this.elements.label.textContent = label;
    }

    setChange(change) {
        this.config.change = change;
        
        if (!change) {
            this.elements.change.style.display = 'none';
            return;
        }

        this.elements.change.style.display = 'flex';
        
        // 변화 유형에 따른 클래스 설정
        const changeClasses = ['stat-change'];
        if (change.value > 0) {
            changeClasses.push('positive');
            this.elements.changeIcon.className = 'stat-change-icon fas fa-arrow-up';
        } else if (change.value < 0) {
            changeClasses.push('negative');
            this.elements.changeIcon.className = 'stat-change-icon fas fa-arrow-down';
        } else {
            changeClasses.push('neutral');
            this.elements.changeIcon.className = 'stat-change-icon fas fa-minus';
        }

        this.elements.change.className = changeClasses.join(' ');
        this.elements.changeValue.textContent = `${Math.abs(change.value)}${change.unit || '%'}`;
        this.elements.changePeriod.textContent = change.period || '전월 대비';
    }

    setProgress(value, max = 100) {
        const percentage = Math.min(100, Math.max(0, (value / max) * 100));
        
        this.config.progress.value = value;
        this.config.progress.max = max;
        
        this.elements.progressLabel.textContent = this.config.progress.label;
        this.elements.progressPercentage.textContent = `${Math.round(percentage)}%`;
        
        // 애니메이션
        if (this.config.animated) {
            this.elements.progressFill.style.transition = 'width 0.5s ease';
        }
        
        this.elements.progressFill.style.width = `${percentage}%`;
        
        // 진행률에 따른 색상 변경
        this.elements.progressFill.className = 'progress-fill';
        if (percentage >= 90) {
            this.elements.progressFill.classList.add('success');
        } else if (percentage >= 70) {
            this.elements.progressFill.classList.add('warning');
        } else if (percentage < 30) {
            this.elements.progressFill.classList.add('danger');
        }
    }

    animateValue(from, to, duration = 1000) {
        const startTime = Date.now();
        const difference = to - from;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentValue = from + (difference * easeOutCubic);
            
            this.elements.number.textContent = this.formatNumber(currentValue);
            
            if (progress < 1) {
                this.animationFrame = requestAnimationFrame(animate);
            } else {
                this.elements.number.textContent = this.formatNumber(to);
            }
        };
        
        animate();
    }

    formatNumber(value) {
        if (typeof value !== 'number') return value;
        
        const { format } = this.config;
        
        if (format.currency) {
            return new Intl.NumberFormat(format.locale, {
                style: 'currency',
                currency: 'KRW',
                minimumFractionDigits: format.decimal
            }).format(value);
        }
        
        if (format.number) {
            return new Intl.NumberFormat(format.locale, {
                minimumFractionDigits: format.decimal,
                maximumFractionDigits: format.decimal
            }).format(value);
        }
        
        return value.toString();
    }

    updateData(data) {
        if (data.value !== undefined) this.setValue(data.value, true);
        if (data.change !== undefined) this.setChange(data.change);
        if (data.progress !== undefined) this.setProgress(data.progress.value, data.progress.max);
        if (data.secondaryStats) {
            this.config.secondaryStats = data.secondaryStats;
            this.renderSecondaryStats();
        }
        if (data.chart) {
            this.config.chart.data = data.chart.data || this.config.chart.data;
            this.renderChart();
        }
        
        // 푸터 업데이트 시간
        if (this.config.showFooter) {
            this.elements.footerText.textContent = data.footerText || `마지막 업데이트: ${new Date().toLocaleTimeString('ko-KR')}`;
        }
        
        this.executeCallback('onDataUpdate', { data, element: this.element });
    }

    async fetchRealtimeData() {
        if (!this.config.realtime.url) return;

        try {
            const response = await fetch(this.config.realtime.url);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            this.updateData(data);
            
        } catch (error) {
            console.error('[StatCardLoader] 실시간 데이터 로딩 실패:', error);
        }
    }

    startRealtime() {
        if (this.realtimeInterval) return;

        this.realtimeInterval = setInterval(() => {
            this.fetchRealtimeData();
        }, this.config.realtime.interval);
        
        // 즉시 한 번 실행
        this.fetchRealtimeData();
    }

    stopRealtime() {
        if (this.realtimeInterval) {
            clearInterval(this.realtimeInterval);
            this.realtimeInterval = null;
        }
    }

    executeCallback(name, data = null) {
        const callback = this.config.callbacks[name];
        if (typeof callback === 'function') {
            try {
                callback.call(this, data);
            } catch (error) {
                console.error(`[StatCardLoader] 콜백 실행 오류 (${name}):`, error);
            }
        }
    }

    destroy() {
        this.stopRealtime();
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // DOM에서 제거
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        // 참조 정리
        this.element = null;
        this.elements = null;
        this.config = null;
        this.chart = null;
    }
}

// 전역 인스턴스 생성
const statCardLoader = new StatCardLoader();

// ES6 모듈 export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatCardLoader;
}

// 전역 객체로도 사용 가능
if (typeof window !== 'undefined') {
    window.StatCardLoader = StatCardLoader;
    window.statCardLoader = statCardLoader;
}