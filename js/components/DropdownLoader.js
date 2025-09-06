/**
 * Dropdown 컴포넌트 로더
 * 사용자 정의 드롭다운 선택기
 */

class DropdownLoader {
    constructor() {
        this.instanceCounter = 0;
        this.instances = new Map();
        this.templates = new Map();
        this.defaultConfig = {
            placeholder: '선택해주세요',
            searchable: false,
            multiple: false,
            clearable: true,
            disabled: false,
            position: 'bottom',
            maxHeight: 200,
            emptyMessage: '검색 결과가 없습니다',
            loadingMessage: '로딩 중...',
            theme: 'default',
            size: 'medium',
            validation: {
                required: false,
                message: '필수 선택 항목입니다'
            },
            async: {
                enabled: false,
                url: null,
                searchParam: 'q',
                minSearchLength: 1,
                debounceTime: 300
            },
            callbacks: {
                onChange: null,
                onOpen: null,
                onClose: null,
                onSearch: null,
                onLoad: null,
                onError: null
            }
        };
        this.loadTemplate();
    }

    async loadTemplate() {
        if (this.templates.has('dropdown')) return;

        try {
            const response = await fetch('/components/dropdown.html');
            if (!response.ok) throw new Error('Template loading failed');
            
            const template = await response.text();
            this.templates.set('dropdown', template);
        } catch (error) {
            console.error('[DropdownLoader] 템플릿 로딩 실패:', error);
            this.createFallbackTemplate();
        }
    }

    createFallbackTemplate() {
        const fallbackTemplate = `
            <div class="wave-dropdown" id="wave-dropdown">
                <div class="dropdown-trigger" id="dropdown-trigger">
                    <div class="dropdown-display">
                        <span class="dropdown-label" id="dropdown-label">선택해주세요</span>
                        <i class="dropdown-icon fas fa-chevron-down" id="dropdown-icon"></i>
                    </div>
                    <div class="dropdown-clear" id="dropdown-clear" style="display: none;">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
                
                <div class="dropdown-menu" id="dropdown-menu">
                    <div class="dropdown-search" id="dropdown-search" style="display: none;">
                        <input type="text" class="search-input" placeholder="검색..." id="search-input">
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    
                    <div class="dropdown-loading" id="dropdown-loading" style="display: none;">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>로딩 중...</span>
                    </div>
                    
                    <div class="dropdown-options" id="dropdown-options">
                        <!-- 동적으로 옵션이 추가됩니다 -->
                    </div>
                    
                    <div class="dropdown-empty" id="dropdown-empty" style="display: none;">
                        <i class="fas fa-search"></i>
                        <span>검색 결과가 없습니다</span>
                    </div>
                </div>
                
                <select class="dropdown-native" id="dropdown-native" style="display: none;">
                    <!-- 접근성을 위한 네이티브 select -->
                </select>
            </div>
        `;
        this.templates.set('dropdown', fallbackTemplate);
    }

    async create(containerId, options = {}) {
        await this.loadTemplate();
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`[DropdownLoader] 컨테이너를 찾을 수 없습니다: ${containerId}`);
            return null;
        }

        const instanceId = `dropdown_${++this.instanceCounter}`;
        const config = { ...this.defaultConfig, ...options };
        
        // 템플릿 삽입
        container.innerHTML = this.templates.get('dropdown');
        
        // 고유 ID 설정
        const dropdown = container.querySelector('#wave-dropdown');
        dropdown.id = instanceId;
        this.updateElementIds(dropdown, instanceId);

        // 인스턴스 생성 및 초기화
        const instance = new DropdownInstance(dropdown, config, instanceId);
        this.instances.set(instanceId, instance);

        return instance;
    }

    updateElementIds(dropdown, instanceId) {
        const elements = dropdown.querySelectorAll('[id]');
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
}

class DropdownInstance {
    constructor(element, config, instanceId) {
        this.element = element;
        this.config = config;
        this.instanceId = instanceId;
        this.isOpen = false;
        this.selectedValues = this.config.multiple ? [] : null;
        this.options = [];
        this.filteredOptions = [];
        this.focusedIndex = -1;
        this.searchTimeout = null;
        this.outsideClickHandler = null;
        this.isLoading = false;

        this.elements = {
            trigger: this.element.querySelector('.dropdown-trigger'),
            display: this.element.querySelector('.dropdown-display'),
            label: this.element.querySelector('.dropdown-label'),
            icon: this.element.querySelector('.dropdown-icon'),
            clear: this.element.querySelector('.dropdown-clear'),
            menu: this.element.querySelector('.dropdown-menu'),
            search: this.element.querySelector('.dropdown-search'),
            searchInput: this.element.querySelector('.search-input'),
            loading: this.element.querySelector('.dropdown-loading'),
            optionsContainer: this.element.querySelector('.dropdown-options'),
            empty: this.element.querySelector('.dropdown-empty'),
            native: this.element.querySelector('.dropdown-native')
        };

        this.init();
    }

    init() {
        this.applyConfig();
        this.bindEvents();
        this.updateDisplay();
        
        if (this.config.options) {
            this.setOptions(this.config.options);
        }

        if (this.config.value !== undefined) {
            this.setValue(this.config.value);
        }

        // 콜백 실행
        this.executeCallback('onLoad');
    }

    applyConfig() {
        // 테마 적용
        this.element.className = `wave-dropdown ${this.config.theme} ${this.config.size}`;
        
        if (this.config.disabled) {
            this.element.classList.add('disabled');
        }

        // 플레이스홀더 설정
        this.elements.label.textContent = this.config.placeholder;

        // 검색 기능 설정
        if (this.config.searchable) {
            this.elements.search.style.display = 'block';
            this.elements.searchInput.placeholder = this.config.searchPlaceholder || '검색...';
        }

        // Clear 버튼 설정
        if (!this.config.clearable) {
            this.elements.clear.style.display = 'none';
        }

        // 로딩/빈 메시지 설정
        this.elements.loading.querySelector('span').textContent = this.config.loadingMessage;
        this.elements.empty.querySelector('span').textContent = this.config.emptyMessage;

        // 최대 높이 설정
        this.elements.menu.style.maxHeight = `${this.config.maxHeight}px`;
    }

    bindEvents() {
        // 트리거 클릭
        this.elements.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.config.disabled) {
                this.toggle();
            }
        });

        // Clear 버튼
        this.elements.clear.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clear();
        });

        // 검색 입력
        if (this.config.searchable) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            this.elements.searchInput.addEventListener('keydown', (e) => {
                this.handleKeydown(e);
            });
        }

        // 키보드 네비게이션
        this.element.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;
            this.handleKeydown(e);
        });

        // 외부 클릭 감지
        this.outsideClickHandler = (e) => {
            if (!this.element.contains(e.target)) {
                this.close();
            }
        };

        // Focus/Blur 처리
        this.element.addEventListener('focus', () => {
            if (!this.config.disabled) {
                this.element.classList.add('focused');
            }
        });

        this.element.addEventListener('blur', () => {
            this.element.classList.remove('focused');
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.isOpen || this.config.disabled) return;

        this.isOpen = true;
        this.element.classList.add('open');
        this.elements.icon.style.transform = 'rotate(180deg)';
        
        // 포지션 조정
        this.adjustPosition();
        
        // 외부 클릭 리스너 등록
        document.addEventListener('click', this.outsideClickHandler);
        
        // 검색 입력에 포커스
        if (this.config.searchable) {
            this.elements.searchInput.focus();
        }

        // 비동기 옵션 로드
        if (this.config.async.enabled && this.options.length === 0) {
            this.loadAsyncOptions();
        }

        this.executeCallback('onOpen');
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.element.classList.remove('open');
        this.elements.icon.style.transform = 'rotate(0deg)';
        this.focusedIndex = -1;
        
        // 외부 클릭 리스너 제거
        document.removeEventListener('click', this.outsideClickHandler);
        
        // 검색 입력 초기화
        if (this.config.searchable) {
            this.elements.searchInput.value = '';
            this.filteredOptions = [...this.options];
            this.renderOptions();
        }

        this.executeCallback('onClose');
    }

    adjustPosition() {
        const rect = this.element.getBoundingClientRect();
        const menuHeight = this.config.maxHeight;
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (this.config.position === 'auto') {
            if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
                this.elements.menu.classList.add('dropdown-menu-up');
            } else {
                this.elements.menu.classList.remove('dropdown-menu-up');
            }
        } else if (this.config.position === 'top') {
            this.elements.menu.classList.add('dropdown-menu-up');
        }
    }

    setOptions(options) {
        this.options = options.map((option, index) => ({
            ...option,
            originalIndex: index,
            id: option.id || `option_${index}`
        }));
        
        this.filteredOptions = [...this.options];
        this.renderOptions();
        this.updateNativeSelect();
    }

    renderOptions() {
        const container = this.elements.optionsContainer;
        container.innerHTML = '';

        if (this.filteredOptions.length === 0) {
            this.elements.empty.style.display = 'block';
            return;
        }

        this.elements.empty.style.display = 'none';

        this.filteredOptions.forEach((option, index) => {
            const optionElement = this.createOptionElement(option, index);
            container.appendChild(optionElement);
        });
    }

    createOptionElement(option, index) {
        const element = document.createElement('div');
        element.className = 'dropdown-option';
        element.setAttribute('data-value', option.value);
        element.setAttribute('data-index', index);
        
        if (option.disabled) {
            element.classList.add('disabled');
        }

        if (this.isSelected(option.value)) {
            element.classList.add('selected');
        }

        if (index === this.focusedIndex) {
            element.classList.add('focused');
        }

        // 아이콘
        if (option.icon) {
            const iconElement = document.createElement('i');
            iconElement.className = `option-icon ${option.icon}`;
            element.appendChild(iconElement);
        }

        // 텍스트
        const textElement = document.createElement('span');
        textElement.className = 'option-text';
        textElement.textContent = option.label || option.text || option.value;
        element.appendChild(textElement);

        // 설명
        if (option.description) {
            const descElement = document.createElement('div');
            descElement.className = 'option-description';
            descElement.textContent = option.description;
            element.appendChild(descElement);
        }

        // 선택 표시
        if (this.config.multiple) {
            const checkElement = document.createElement('i');
            checkElement.className = 'option-check fas fa-check';
            element.appendChild(checkElement);
        }

        // 클릭 이벤트
        element.addEventListener('click', () => {
            if (!option.disabled) {
                this.selectOption(option);
            }
        });

        // 마우스 이벤트
        element.addEventListener('mouseenter', () => {
            this.focusedIndex = index;
            this.updateFocusedOption();
        });

        return element;
    }

    selectOption(option) {
        if (this.config.multiple) {
            if (this.isSelected(option.value)) {
                this.selectedValues = this.selectedValues.filter(v => v !== option.value);
            } else {
                this.selectedValues.push(option.value);
            }
        } else {
            this.selectedValues = option.value;
            this.close();
        }

        this.updateDisplay();
        this.updateNativeSelect();
        this.executeCallback('onChange', {
            value: this.selectedValues,
            option: option,
            options: this.getSelectedOptions()
        });
    }

    isSelected(value) {
        if (this.config.multiple) {
            return this.selectedValues.includes(value);
        }
        return this.selectedValues === value;
    }

    getSelectedOptions() {
        if (this.config.multiple) {
            return this.options.filter(opt => this.selectedValues.includes(opt.value));
        }
        return this.options.find(opt => opt.value === this.selectedValues);
    }

    updateDisplay() {
        const selectedOptions = this.getSelectedOptions();
        
        if (!selectedOptions || (Array.isArray(selectedOptions) && selectedOptions.length === 0)) {
            this.elements.label.textContent = this.config.placeholder;
            this.elements.label.classList.add('placeholder');
            this.elements.clear.style.display = 'none';
        } else {
            this.elements.label.classList.remove('placeholder');
            
            if (this.config.multiple) {
                if (selectedOptions.length === 1) {
                    this.elements.label.textContent = selectedOptions[0].label || selectedOptions[0].text;
                } else {
                    this.elements.label.textContent = `${selectedOptions.length}개 선택됨`;
                }
            } else {
                this.elements.label.textContent = selectedOptions.label || selectedOptions.text || selectedOptions.value;
            }
            
            if (this.config.clearable) {
                this.elements.clear.style.display = 'block';
            }
        }
    }

    updateNativeSelect() {
        const nativeSelect = this.elements.native;
        nativeSelect.innerHTML = '';

        // 기본 옵션
        if (!this.config.multiple && this.config.placeholder) {
            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.textContent = this.config.placeholder;
            placeholderOption.disabled = true;
            nativeSelect.appendChild(placeholderOption);
        }

        // 옵션 추가
        this.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label || option.text || option.value;
            optionElement.disabled = option.disabled || false;
            
            if (this.isSelected(option.value)) {
                optionElement.selected = true;
            }
            
            nativeSelect.appendChild(optionElement);
        });

        if (this.config.multiple) {
            nativeSelect.multiple = true;
        }
    }

    handleSearch(query) {
        clearTimeout(this.searchTimeout);
        
        this.searchTimeout = setTimeout(() => {
            if (this.config.async.enabled && query.length >= this.config.async.minSearchLength) {
                this.loadAsyncOptions(query);
            } else {
                this.filterOptions(query);
            }
            
            this.executeCallback('onSearch', { query });
        }, this.config.async.debounceTime);
    }

    filterOptions(query) {
        const normalizedQuery = query.toLowerCase().trim();
        
        if (!normalizedQuery) {
            this.filteredOptions = [...this.options];
        } else {
            this.filteredOptions = this.options.filter(option => {
                const text = (option.label || option.text || option.value).toLowerCase();
                const description = (option.description || '').toLowerCase();
                return text.includes(normalizedQuery) || description.includes(normalizedQuery);
            });
        }
        
        this.focusedIndex = -1;
        this.renderOptions();
    }

    async loadAsyncOptions(query = '') {
        if (!this.config.async.enabled || !this.config.async.url) return;

        this.isLoading = true;
        this.showLoading(true);

        try {
            const url = new URL(this.config.async.url);
            if (query) {
                url.searchParams.set(this.config.async.searchParam, query);
            }

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            const options = Array.isArray(data) ? data : data.options || [];
            
            this.setOptions(options);
            this.showLoading(false);

        } catch (error) {
            console.error('[DropdownLoader] 비동기 옵션 로드 실패:', error);
            this.showLoading(false);
            this.executeCallback('onError', { error, query });
        } finally {
            this.isLoading = false;
        }
    }

    showLoading(show) {
        this.elements.loading.style.display = show ? 'flex' : 'none';
        this.elements.optionsContainer.style.display = show ? 'none' : 'block';
        this.elements.empty.style.display = 'none';
    }

    handleKeydown(e) {
        switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            this.navigateOptions(1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            this.navigateOptions(-1);
            break;
        case 'Enter':
            e.preventDefault();
            if (this.focusedIndex >= 0 && this.filteredOptions[this.focusedIndex]) {
                this.selectOption(this.filteredOptions[this.focusedIndex]);
            }
            break;
        case 'Escape':
            this.close();
            break;
        case 'Tab':
            this.close();
            break;
        }
    }

    navigateOptions(direction) {
        const maxIndex = this.filteredOptions.length - 1;
        
        if (direction > 0) {
            this.focusedIndex = Math.min(this.focusedIndex + 1, maxIndex);
        } else {
            this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
        }
        
        this.updateFocusedOption();
        this.scrollToFocusedOption();
    }

    updateFocusedOption() {
        const options = this.elements.optionsContainer.querySelectorAll('.dropdown-option');
        options.forEach((option, index) => {
            option.classList.toggle('focused', index === this.focusedIndex);
        });
    }

    scrollToFocusedOption() {
        const focusedOption = this.elements.optionsContainer.querySelector('.dropdown-option.focused');
        if (focusedOption) {
            focusedOption.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    clear() {
        this.selectedValues = this.config.multiple ? [] : null;
        this.updateDisplay();
        this.updateNativeSelect();
        this.executeCallback('onChange', {
            value: this.selectedValues,
            option: null,
            options: null
        });
    }

    setValue(value) {
        this.selectedValues = value;
        this.updateDisplay();
        this.updateNativeSelect();
    }

    getValue() {
        return this.selectedValues;
    }

    addOption(option) {
        this.options.push({
            ...option,
            originalIndex: this.options.length,
            id: option.id || `option_${this.options.length}`
        });
        
        this.filteredOptions = [...this.options];
        this.renderOptions();
        this.updateNativeSelect();
    }

    removeOption(value) {
        this.options = this.options.filter(opt => opt.value !== value);
        this.filteredOptions = [...this.options];
        
        // 선택된 값에서도 제거
        if (this.config.multiple) {
            this.selectedValues = this.selectedValues.filter(v => v !== value);
        } else if (this.selectedValues === value) {
            this.selectedValues = null;
        }
        
        this.renderOptions();
        this.updateDisplay();
        this.updateNativeSelect();
    }

    enable() {
        this.config.disabled = false;
        this.element.classList.remove('disabled');
    }

    disable() {
        this.config.disabled = true;
        this.element.classList.add('disabled');
        this.close();
    }

    validate() {
        if (!this.config.validation.required) return { valid: true };

        const hasValue = this.config.multiple 
            ? this.selectedValues && this.selectedValues.length > 0
            : this.selectedValues !== null && this.selectedValues !== undefined && this.selectedValues !== '';

        return {
            valid: hasValue,
            message: hasValue ? '' : this.config.validation.message
        };
    }

    executeCallback(name, data = null) {
        const callback = this.config.callbacks[name];
        if (typeof callback === 'function') {
            try {
                callback.call(this, data);
            } catch (error) {
                console.error(`[DropdownLoader] 콜백 실행 오류 (${name}):`, error);
            }
        }
    }

    destroy() {
        // 이벤트 리스너 제거
        document.removeEventListener('click', this.outsideClickHandler);
        clearTimeout(this.searchTimeout);
        
        // DOM 요소 제거
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        // 참조 정리
        this.element = null;
        this.elements = null;
        this.options = null;
        this.filteredOptions = null;
    }
}

// 전역 인스턴스 생성
const dropdownLoader = new DropdownLoader();

// ES6 모듈 export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DropdownLoader;
}

// 전역 객체로도 사용 가능
if (typeof window !== 'undefined') {
    window.DropdownLoader = DropdownLoader;
    window.dropdownLoader = dropdownLoader;
}