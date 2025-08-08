// 공통 컴포넌트 모듈
import { $, $$, on, debounce, storage } from './utils.js';

/**
 * 페이지네이션 컴포넌트
 */
export class Pagination {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            currentPage: 1,
            totalPages: 1,
            visiblePages: 5,
            onPageChange: () => {},
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEvents();
    }
    
    render() {
        const { currentPage, totalPages, visiblePages } = this.options;
        let html = '';
        
        // 이전 버튼
        html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
            <i class="fas fa-chevron-left"></i>
        </button>`;
        
        // 페이지 번호
        const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
        const endPage = Math.min(totalPages, startPage + visiblePages - 1);
        
        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        
        // ... 표시
        if (endPage < totalPages) {
            html += `<span class="page-dots">...</span>`;
            html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        // 다음 버튼
        html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
            <i class="fas fa-chevron-right"></i>
        </button>`;
        
        this.container.innerHTML = html;
    }
    
    attachEvents() {
        on(this.container, 'click', (e) => {
            const btn = e.target.closest('.page-btn');
            if (btn && !btn.disabled) {
                const page = parseInt(btn.dataset.page);
                this.goToPage(page);
            }
        });
    }
    
    goToPage(page) {
        if (page < 1 || page > this.options.totalPages) return;
        
        this.options.currentPage = page;
        this.render();
        this.options.onPageChange(page);
    }
}

/**
 * 검색 컴포넌트
 */
export class SearchBox {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            placeholder: '검색어를 입력하세요',
            onSearch: () => {},
            debounceTime: 300,
            minLength: 2,
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEvents();
    }
    
    render() {
        const html = `
            <div class="search-container">
                <i class="fas fa-search"></i>
                <input type="text" class="search-input" placeholder="${this.options.placeholder}">
                <button class="search-btn">검색</button>
            </div>
        `;
        
        this.container.innerHTML = html;
        this.input = $('.search-input', this.container);
        this.button = $('.search-btn', this.container);
    }
    
    attachEvents() {
        const debouncedSearch = debounce(() => this.search(), this.options.debounceTime);
        
        on(this.input, 'input', debouncedSearch);
        on(this.input, 'keypress', (e) => {
            if (e.key === 'Enter') {
                this.search();
            }
        });
        on(this.button, 'click', () => this.search());
    }
    
    search() {
        const value = this.input.value.trim();
        if (value.length >= this.options.minLength) {
            this.options.onSearch(value);
        }
    }
    
    clear() {
        this.input.value = '';
    }
}

/**
 * 탭 컴포넌트
 */
export class Tabs {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            tabs: [],
            activeTab: 0,
            onTabChange: () => {},
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEvents();
    }
    
    render() {
        const tabsHtml = this.options.tabs.map((tab, index) => `
            <button class="tab-btn ${index === this.options.activeTab ? 'active' : ''}" 
                    data-tab="${index}">
                ${tab.icon ? `<i class="${tab.icon}"></i>` : ''}
                <span>${tab.label}</span>
                ${tab.count !== undefined ? `<span class="count">${tab.count}</span>` : ''}
            </button>
        `).join('');
        
        this.container.innerHTML = `<div class="tabs-wrapper">${tabsHtml}</div>`;
    }
    
    attachEvents() {
        on(this.container, 'click', (e) => {
            const btn = e.target.closest('.tab-btn');
            if (btn) {
                const tabIndex = parseInt(btn.dataset.tab);
                this.selectTab(tabIndex);
            }
        });
    }
    
    selectTab(index) {
        if (index < 0 || index >= this.options.tabs.length) return;
        
        this.options.activeTab = index;
        this.render();
        this.options.onTabChange(this.options.tabs[index], index);
    }
}

/**
 * 모달 컴포넌트
 */
export class Modal {
    constructor(options = {}) {
        this.options = {
            title: '',
            content: '',
            footer: '',
            size: 'medium', // small, medium, large
            closeOnOverlay: true,
            onOpen: () => {},
            onClose: () => {},
            ...options
        };
        
        this.isOpen = false;
        this.init();
    }
    
    init() {
        this.create();
        this.attachEvents();
    }
    
    create() {
        this.modal = document.createElement('div');
        this.modal.className = `modal-overlay ${this.options.size}`;
        this.modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h3 class="modal-title">${this.options.title}</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${this.options.content}
                </div>
                ${this.options.footer ? `
                    <div class="modal-footer">
                        ${this.options.footer}
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(this.modal);
    }
    
    attachEvents() {
        const closeBtn = $('.modal-close', this.modal);
        on(closeBtn, 'click', () => this.close());
        
        if (this.options.closeOnOverlay) {
            on(this.modal, 'click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }
        
        // ESC 키로 닫기
        this.escHandler = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        };
    }
    
    open() {
        if (this.isOpen) return;
        
        this.modal.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        on(document, 'keydown', this.escHandler);
        this.options.onOpen();
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.modal.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
        document.removeEventListener('keydown', this.escHandler);
        this.options.onClose();
    }
    
    destroy() {
        this.close();
        this.modal.remove();
    }
    
    setContent(content) {
        const body = $('.modal-body', this.modal);
        if (body) {
            body.innerHTML = content;
        }
    }
}

/**
 * 토스트 알림
 */
export class Toast {
    static container = null;
    
    static init() {
        if (!Toast.container) {
            Toast.container = document.createElement('div');
            Toast.container.className = 'toast-container';
            document.body.appendChild(Toast.container);
        }
    }
    
    static show(message, type = 'info', duration = 3000) {
        Toast.init();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${Toast.getIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        Toast.container.appendChild(toast);
        
        // 애니메이션
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // 자동 제거
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
    
    static getIcon(type) {
        const icons = {
            info: 'info-circle',
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    static success(message, duration) {
        Toast.show(message, 'success', duration);
    }
    
    static error(message, duration) {
        Toast.show(message, 'error', duration);
    }
    
    static warning(message, duration) {
        Toast.show(message, 'warning', duration);
    }
    
    static info(message, duration) {
        Toast.show(message, 'info', duration);
    }
}

/**
 * 드롭다운 컴포넌트
 */
export class Dropdown {
    constructor(trigger, options = {}) {
        this.trigger = trigger;
        this.options = {
            items: [],
            position: 'bottom', // top, bottom, left, right
            onSelect: () => {},
            ...options
        };
        
        this.isOpen = false;
        this.init();
    }
    
    init() {
        this.create();
        this.attachEvents();
    }
    
    create() {
        this.dropdown = document.createElement('div');
        this.dropdown.className = `dropdown-menu ${this.options.position}`;
        
        const itemsHtml = this.options.items.map((item, index) => {
            if (item.divider) {
                return '<div class="dropdown-divider"></div>';
            }
            return `
                <button class="dropdown-item" data-index="${index}">
                    ${item.icon ? `<i class="${item.icon}"></i>` : ''}
                    <span>${item.label}</span>
                </button>
            `;
        }).join('');
        
        this.dropdown.innerHTML = itemsHtml;
        this.trigger.parentElement.appendChild(this.dropdown);
    }
    
    attachEvents() {
        on(this.trigger, 'click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        on(this.dropdown, 'click', (e) => {
            const item = e.target.closest('.dropdown-item');
            if (item) {
                const index = parseInt(item.dataset.index);
                this.selectItem(index);
            }
        });
        
        on(document, 'click', () => {
            if (this.isOpen) {
                this.close();
            }
        });
    }
    
    toggle() {
        this.isOpen ? this.close() : this.open();
    }
    
    open() {
        this.dropdown.classList.add('active');
        this.isOpen = true;
        this.positionDropdown();
    }
    
    close() {
        this.dropdown.classList.remove('active');
        this.isOpen = false;
    }
    
    selectItem(index) {
        const item = this.options.items[index];
        if (item && !item.divider) {
            this.options.onSelect(item, index);
            this.close();
        }
    }
    
    positionDropdown() {
        const triggerRect = this.trigger.getBoundingClientRect();
        const dropdownRect = this.dropdown.getBoundingClientRect();
        
        // 위치 조정 로직
        switch (this.options.position) {
            case 'top':
                this.dropdown.style.bottom = `${triggerRect.height + 5}px`;
                break;
            case 'bottom':
                this.dropdown.style.top = `${triggerRect.height + 5}px`;
                break;
            case 'left':
                this.dropdown.style.right = `${triggerRect.width + 5}px`;
                break;
            case 'right':
                this.dropdown.style.left = `${triggerRect.width + 5}px`;
                break;
        }
    }
}