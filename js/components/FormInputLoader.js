/**
 * FormInputLoader - 폼 입력 컴포넌트 로더
 * 
 * 기능:
 * - 다양한 입력 타입 지원 (text, email, password, number, textarea, select, checkbox, radio, file, date, time, tags)
 * - 실시간 유효성 검사
 * - 자동완성 지원
 * - 파일 드래그 앤 드롭
 * - 태그 입력
 * - 날짜/시간 선택기
 * - 비밀번호 표시/숨김
 * - 문자 수 카운터
 * - 로딩 상태
 * - 다양한 크기와 스타일
 * 
 * @author AI Assistant
 * @created 2025-09-05
 */

class FormInputLoader {
    constructor() {
        this.instances = new Map();
        this.isInitialized = false;
        this.validators = this.setupValidators();
    }

    /**
     * 폼 입력 컴포넌트 로드 및 초기화
     * @param {string} containerId - 컨테이너 ID
     * @param {Object} options - 설정 옵션
     * @returns {Promise<Object>} 입력 인스턴스
     */
    async loadFormInput(containerId, options = {}) {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Container with ID '${containerId}' not found`);
            }

            // 기본 설정
            const config = {
                type: 'text', // text, email, password, number, textarea, select, checkbox, radio, file, date, time, datetime, tags
                name: '',
                id: '',
                value: '',
                placeholder: '',
                label: '',
                required: false,
                disabled: false,
                readonly: false,
                maxLength: null,
                minLength: null,
                min: null,
                max: null,
                step: null,
                pattern: null,
                accept: null, // 파일 타입용
                multiple: false, // 파일, 선택 등
                size: 'default', // small, default, large
                variant: 'default', // default, success, error
                showLabel: true,
                showRequired: true,
                showOptional: false,
                showCounter: false,
                showClear: false,
                showPasswordToggle: true,
                leftIcon: null,
                rightIcon: null,
                helpText: '',
                errorText: '',
                successText: '',
                loading: false,
                loadingText: '로딩 중...',
                
                // 선택 옵션 (select, radio, checkbox)
                options: [],
                
                // 자동완성
                autocomplete: false,
                autocompleteSource: [], // 배열 또는 함수
                autocompleteMinLength: 2,
                
                // 파일 입력
                fileText: '파일을 선택하거나 드래그하세요',
                fileBrowseText: '파일 선택',
                maxFileSize: 10 * 1024 * 1024, // 10MB
                allowedFileTypes: [],
                
                // 태그 입력
                tags: [],
                tagSeparator: ',',
                maxTags: null,
                
                // 날짜/시간
                dateFormat: 'YYYY-MM-DD',
                timeFormat: 'HH:mm',
                showTime: false,
                
                // 유효성 검사
                validation: {
                    enabled: true,
                    rules: [],
                    validateOnInput: true,
                    validateOnBlur: true
                },
                
                // 이벤트 콜백
                onChange: null,
                onInput: null,
                onFocus: null,
                onBlur: null,
                onValidate: null,
                onFileSelect: null,
                onTagAdd: null,
                onTagRemove: null,
                
                ...options
            };

            // HTML 템플릿 로드
            if (!this.isInitialized) {
                await this.loadTemplate();
                this.isInitialized = true;
            }

            // 입력 인스턴스 생성
            const instance = await this.createInstance(container, config);
            this.instances.set(containerId, instance);

            return instance;

        } catch (error) {
            console.error('폼 입력 로드 오류:', error);
            throw error;
        }
    }

    /**
     * HTML 템플릿 로드
     */
    async loadTemplate() {
        try {
            const response = await fetch('/components/form-input.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.template = await response.text();
        } catch (error) {
            console.error('폼 입력 템플릿 로드 실패:', error);
            throw error;
        }
    }

    /**
     * 입력 인스턴스 생성
     * @param {HTMLElement} container - 컨테이너 엘리먼트
     * @param {Object} config - 설정
     * @returns {Object} 인스턴스
     */
    async createInstance(container, config) {
        // 템플릿 삽입
        container.innerHTML = this.template;

        // 입력 엘리먼트 설정
        const inputEl = container.querySelector('.wave-form-input');
        
        // 크기 및 상태 클래스 적용
        if (config.size !== 'default') {
            inputEl.classList.add(config.size);
        }
        
        if (config.disabled) {
            inputEl.classList.add('disabled');
        }
        
        if (config.readonly) {
            inputEl.classList.add('readonly');
        }

        // 인스턴스 객체 생성
        const instance = {
            container,
            config,
            elements: this.getElements(container),
            value: config.value,
            isValid: true,
            validationErrors: [],
            
            // 공개 메서드
            getValue: () => this.getValue(instance),
            setValue: (value) => this.setValue(instance, value),
            validate: () => this.validateInput(instance),
            focus: () => this.focusInput(instance),
            blur: () => this.blurInput(instance),
            clear: () => this.clearInput(instance),
            setError: (message) => this.setError(instance, message),
            setSuccess: (message) => this.setSuccess(instance, message),
            clearMessages: () => this.clearMessages(instance),
            enable: () => this.enableInput(instance),
            disable: () => this.disableInput(instance),
            showLoading: () => this.showLoading(instance),
            hideLoading: () => this.hideLoading(instance),
            addTag: (tag) => this.addTag(instance, tag),
            removeTag: (tag) => this.removeTag(instance, tag),
            destroy: () => this.destroyInstance(container.id)
        };

        // 입력 요소 초기화
        this.setupInputElement(instance);
        
        // 이벤트 리스너 설정
        this.setupEventListeners(instance);

        // 초기 렌더링
        this.renderInput(instance);

        return instance;
    }

    /**
     * DOM 엘리먼트 참조 가져오기
     * @param {HTMLElement} container - 컨테이너
     * @returns {Object} 엘리먼트 참조
     */
    getElements(container) {
        return {
            wrapper: container.querySelector('.wave-form-input'),
            label: container.querySelector('#input-label'),
            labelText: container.querySelector('#input-label-text'),
            labelRequired: container.querySelector('#input-label-required'),
            labelOptional: container.querySelector('#input-label-optional'),
            inputContainer: container.querySelector('#input-container'),
            input: container.querySelector('#form-input'),
            textarea: container.querySelector('#form-textarea'),
            select: container.querySelector('#form-select'),
            inputGroup: container.querySelector('#input-group'),
            fileWrapper: container.querySelector('#file-input-wrapper'),
            fileInput: container.querySelector('#form-file-input'),
            fileDisplay: container.querySelector('#file-input-display'),
            fileList: container.querySelector('#file-list'),
            iconLeft: container.querySelector('#input-icon-left'),
            iconRight: container.querySelector('#input-icon-right'),
            clearBtn: container.querySelector('#input-clear'),
            passwordToggle: container.querySelector('#password-toggle'),
            loading: container.querySelector('#input-loading'),
            help: container.querySelector('#input-help'),
            helpText: container.querySelector('#input-help-text'),
            error: container.querySelector('#input-error'),
            errorText: container.querySelector('#input-error-text'),
            success: container.querySelector('#input-success'),
            successText: container.querySelector('#input-success-text'),
            counter: container.querySelector('#input-counter'),
            counterText: container.querySelector('#input-counter-text'),
            tagList: container.querySelector('#tag-list'),
            autocomplete: container.querySelector('#autocomplete-dropdown'),
            autocompleteList: container.querySelector('#autocomplete-list'),
            datePicker: container.querySelector('#datetime-picker')
        };
    }

    /**
     * 입력 요소 초기화
     * @param {Object} instance - 인스턴스
     */
    setupInputElement(instance) {
        const { config, elements } = instance;

        // 기본 속성 설정
        const inputElement = this.getActiveInputElement(instance);
        if (inputElement) {
            if (config.name) inputElement.name = config.name;
            if (config.id) inputElement.id = config.id;
            if (config.placeholder) inputElement.placeholder = config.placeholder;
            if (config.required) inputElement.required = config.required;
            if (config.disabled) inputElement.disabled = config.disabled;
            if (config.readonly) inputElement.readOnly = config.readonly;
            if (config.maxLength) inputElement.maxLength = config.maxLength;
            if (config.minLength) inputElement.minLength = config.minLength;
            if (config.min) inputElement.min = config.min;
            if (config.max) inputElement.max = config.max;
            if (config.step) inputElement.step = config.step;
            if (config.pattern) inputElement.pattern = config.pattern;
        }

        // 파일 입력 특수 설정
        if (config.type === 'file' && elements.fileInput) {
            if (config.accept) elements.fileInput.accept = config.accept;
            if (config.multiple) elements.fileInput.multiple = config.multiple;
        }
    }

    /**
     * 활성 입력 요소 가져오기
     * @param {Object} instance - 인스턴스
     * @returns {HTMLElement} 입력 요소
     */
    getActiveInputElement(instance) {
        const { config, elements } = instance;
        
        switch (config.type) {
        case 'textarea':
            return elements.textarea;
        case 'select':
            return elements.select;
        case 'file':
            return elements.fileInput;
        default:
            return elements.input;
        }
    }

    /**
     * 이벤트 리스너 설정
     * @param {Object} instance - 인스턴스
     */
    setupEventListeners(instance) {
        const { config, elements } = instance;
        const inputElement = this.getActiveInputElement(instance);

        // 기본 입력 이벤트
        if (inputElement) {
            inputElement.addEventListener('input', (e) => this.handleInput(instance, e));
            inputElement.addEventListener('change', (e) => this.handleChange(instance, e));
            inputElement.addEventListener('focus', (e) => this.handleFocus(instance, e));
            inputElement.addEventListener('blur', (e) => this.handleBlur(instance, e));
        }

        // 클리어 버튼
        elements.clearBtn?.addEventListener('click', () => {
            this.clearInput(instance);
        });

        // 비밀번호 토글
        elements.passwordToggle?.addEventListener('click', () => {
            this.togglePasswordVisibility(instance);
        });

        // 파일 드래그 앤 드롭
        if (config.type === 'file') {
            this.setupFileEvents(instance);
        }

        // 태그 입력
        if (config.type === 'tags') {
            this.setupTagEvents(instance);
        }

        // 자동완성
        if (config.autocomplete) {
            this.setupAutocompleteEvents(instance);
        }

        // 날짜/시간 선택기
        if (config.type === 'date' || config.type === 'datetime') {
            this.setupDateTimeEvents(instance);
        }
    }

    /**
     * 파일 이벤트 설정
     * @param {Object} instance - 인스턴스
     */
    setupFileEvents(instance) {
        const { elements } = instance;

        // 파일 선택 버튼
        const browseBtn = elements.fileDisplay?.querySelector('.file-browse-btn');
        browseBtn?.addEventListener('click', () => {
            elements.fileInput?.click();
        });

        // 드래그 앤 드롭
        elements.fileDisplay?.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.fileDisplay.classList.add('dragover');
        });

        elements.fileDisplay?.addEventListener('dragleave', () => {
            elements.fileDisplay.classList.remove('dragover');
        });

        elements.fileDisplay?.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.fileDisplay.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            this.handleFileSelect(instance, files);
        });

        // 클릭으로 파일 선택
        elements.fileDisplay?.addEventListener('click', () => {
            elements.fileInput?.click();
        });
    }

    /**
     * 태그 이벤트 설정
     * @param {Object} instance - 인스턴스
     */
    setupTagEvents(instance) {
        const { elements } = instance;

        elements.input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === instance.config.tagSeparator) {
                e.preventDefault();
                const value = e.target.value.trim();
                if (value) {
                    this.addTag(instance, value);
                    e.target.value = '';
                }
            }
        });
    }

    /**
     * 자동완성 이벤트 설정
     * @param {Object} instance - 인스턴스
     */
    setupAutocompleteEvents(instance) {
        const { elements } = instance;
        let debounceTimeout;

        elements.input?.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                this.updateAutocomplete(instance, e.target.value);
            }, 300);
        });

        // 키보드 내비게이션
        elements.input?.addEventListener('keydown', (e) => {
            this.handleAutocompleteKeyboard(instance, e);
        });

        // 외부 클릭으로 드롭다운 닫기
        document.addEventListener('click', (e) => {
            if (!instance.container.contains(e.target)) {
                this.hideAutocomplete(instance);
            }
        });
    }

    /**
     * 날짜/시간 이벤트 설정
     * @param {Object} instance - 인스턴스
     */
    setupDateTimeEvents(instance) {
        // 날짜/시간 선택기 구현
        // 복잡한 로직이므로 기본 구조만 설정
    }

    /**
     * 입력 이벤트 처리
     * @param {Object} instance - 인스턴스
     * @param {Event} e - 이벤트
     */
    handleInput(instance, e) {
        const { config } = instance;
        
        instance.value = e.target.value;
        
        // 카운터 업데이트
        this.updateCounter(instance);
        
        // 클리어 버튼 표시/숨김
        this.updateClearButton(instance);
        
        // 실시간 유효성 검사
        if (config.validation.validateOnInput) {
            this.validateInput(instance);
        }
        
        // 콜백 실행
        if (config.onInput) {
            config.onInput(instance.value, instance);
        }
    }

    /**
     * 변경 이벤트 처리
     * @param {Object} instance - 인스턴스
     * @param {Event} e - 이벤트
     */
    handleChange(instance, e) {
        const { config } = instance;
        
        instance.value = e.target.value;
        
        // 파일 선택 처리
        if (config.type === 'file') {
            this.handleFileSelect(instance, Array.from(e.target.files));
        }
        
        // 콜백 실행
        if (config.onChange) {
            config.onChange(instance.value, instance);
        }
    }

    /**
     * 포커스 이벤트 처리
     * @param {Object} instance - 인스턴스
     * @param {Event} e - 이벤트
     */
    handleFocus(instance, e) {
        const { config } = instance;
        
        // 자동완성 표시
        if (config.autocomplete && e.target.value.length >= config.autocompleteMinLength) {
            this.updateAutocomplete(instance, e.target.value);
        }
        
        // 콜백 실행
        if (config.onFocus) {
            config.onFocus(e, instance);
        }
    }

    /**
     * 블러 이벤트 처리
     * @param {Object} instance - 인스턴스
     * @param {Event} e - 이벤트
     */
    handleBlur(instance, e) {
        const { config } = instance;
        
        // 유효성 검사
        if (config.validation.validateOnBlur) {
            this.validateInput(instance);
        }
        
        // 자동완성 숨김 (지연)
        setTimeout(() => this.hideAutocomplete(instance), 200);
        
        // 콜백 실행
        if (config.onBlur) {
            config.onBlur(e, instance);
        }
    }

    /**
     * 파일 선택 처리
     * @param {Object} instance - 인스턴스
     * @param {Array} files - 파일 배열
     */
    handleFileSelect(instance, files) {
        const { config } = instance;
        
        // 파일 유효성 검사
        const validFiles = files.filter(file => this.validateFile(file, config));
        
        instance.value = config.multiple ? validFiles : validFiles[0] || null;
        
        // 파일 리스트 렌더링
        this.renderFileList(instance, validFiles);
        
        // 콜백 실행
        if (config.onFileSelect) {
            config.onFileSelect(instance.value, instance);
        }
    }

    /**
     * 파일 유효성 검사
     * @param {File} file - 파일 객체
     * @param {Object} config - 설정
     * @returns {boolean} 유효 여부
     */
    validateFile(file, config) {
        // 크기 검사
        if (config.maxFileSize && file.size > config.maxFileSize) {
            return false;
        }
        
        // 타입 검사
        if (config.allowedFileTypes.length > 0) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (!config.allowedFileTypes.includes(fileExtension)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * 파일 리스트 렌더링
     * @param {Object} instance - 인스턴스
     * @param {Array} files - 파일 배열
     */
    renderFileList(instance, files) {
        const { elements } = instance;
        
        if (!elements.fileList || files.length === 0) {
            if (elements.fileList) elements.fileList.style.display = 'none';
            return;
        }
        
        elements.fileList.style.display = 'block';
        elements.fileList.innerHTML = '';
        
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="fas fa-file file-item-icon"></i>
                <div class="file-item-info">
                    <div class="file-item-name">${file.name}</div>
                    <div class="file-item-size">${this.formatFileSize(file.size)}</div>
                </div>
                <button type="button" class="file-item-remove" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // 제거 버튼 이벤트
            const removeBtn = fileItem.querySelector('.file-item-remove');
            removeBtn.addEventListener('click', () => {
                this.removeFile(instance, index);
            });
            
            elements.fileList.appendChild(fileItem);
        });
    }

    /**
     * 파일 크기 포맷팅
     * @param {number} bytes - 바이트
     * @returns {string} 포맷된 크기
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /**
     * 파일 제거
     * @param {Object} instance - 인스턴스
     * @param {number} index - 파일 인덱스
     */
    removeFile(instance, index) {
        const { config } = instance;
        
        if (config.multiple && Array.isArray(instance.value)) {
            instance.value.splice(index, 1);
            this.renderFileList(instance, instance.value);
        } else {
            instance.value = null;
            this.renderFileList(instance, []);
        }
    }

    /**
     * 태그 추가
     * @param {Object} instance - 인스턴스
     * @param {string} tag - 태그
     */
    addTag(instance, tag) {
        const { config } = instance;
        
        if (!config.tags.includes(tag)) {
            if (!config.maxTags || config.tags.length < config.maxTags) {
                config.tags.push(tag);
                this.renderTags(instance);
                
                if (config.onTagAdd) {
                    config.onTagAdd(tag, config.tags, instance);
                }
            }
        }
    }

    /**
     * 태그 제거
     * @param {Object} instance - 인스턴스
     * @param {string} tag - 태그
     */
    removeTag(instance, tag) {
        const { config } = instance;
        const index = config.tags.indexOf(tag);
        
        if (index > -1) {
            config.tags.splice(index, 1);
            this.renderTags(instance);
            
            if (config.onTagRemove) {
                config.onTagRemove(tag, config.tags, instance);
            }
        }
    }

    /**
     * 태그 렌더링
     * @param {Object} instance - 인스턴스
     */
    renderTags(instance) {
        const { config, elements } = instance;
        
        if (!elements.tagList || config.tags.length === 0) {
            if (elements.tagList) elements.tagList.style.display = 'none';
            return;
        }
        
        elements.tagList.style.display = 'flex';
        elements.tagList.innerHTML = '';
        
        config.tags.forEach(tag => {
            const tagItem = document.createElement('div');
            tagItem.className = 'tag-item';
            tagItem.innerHTML = `
                <span>${tag}</span>
                <button type="button" class="tag-remove" data-tag="${tag}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // 제거 버튼 이벤트
            const removeBtn = tagItem.querySelector('.tag-remove');
            removeBtn.addEventListener('click', () => {
                this.removeTag(instance, tag);
            });
            
            elements.tagList.appendChild(tagItem);
        });
    }

    /**
     * 자동완성 업데이트
     * @param {Object} instance - 인스턴스
     * @param {string} query - 쿼리
     */
    async updateAutocomplete(instance, query) {
        const { config, elements } = instance;
        
        if (!query || query.length < config.autocompleteMinLength) {
            this.hideAutocomplete(instance);
            return;
        }
        
        let suggestions = [];
        
        if (typeof config.autocompleteSource === 'function') {
            try {
                suggestions = await config.autocompleteSource(query);
            } catch (error) {
                console.error('자동완성 소스 오류:', error);
                return;
            }
        } else if (Array.isArray(config.autocompleteSource)) {
            suggestions = config.autocompleteSource.filter(item => 
                item.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        this.renderAutocomplete(instance, suggestions);
    }

    /**
     * 자동완성 렌더링
     * @param {Object} instance - 인스턴스
     * @param {Array} suggestions - 제안 목록
     */
    renderAutocomplete(instance, suggestions) {
        const { elements } = instance;
        
        if (!elements.autocomplete || !elements.autocompleteList) return;
        
        if (suggestions.length === 0) {
            this.hideAutocomplete(instance);
            return;
        }
        
        elements.autocompleteList.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = suggestion;
            
            item.addEventListener('click', () => {
                this.setValue(instance, suggestion);
                this.hideAutocomplete(instance);
            });
            
            elements.autocompleteList.appendChild(item);
        });
        
        elements.autocomplete.style.display = 'block';
    }

    /**
     * 자동완성 숨김
     * @param {Object} instance - 인스턴스
     */
    hideAutocomplete(instance) {
        if (instance.elements.autocomplete) {
            instance.elements.autocomplete.style.display = 'none';
        }
    }

    /**
     * 자동완성 키보드 처리
     * @param {Object} instance - 인스턴스
     * @param {KeyboardEvent} e - 키보드 이벤트
     */
    handleAutocompleteKeyboard(instance, e) {
        const { elements } = instance;
        
        if (!elements.autocomplete || elements.autocomplete.style.display === 'none') {
            return;
        }
        
        const items = elements.autocompleteList.querySelectorAll('.autocomplete-item');
        const current = elements.autocompleteList.querySelector('.highlighted');
        let index = current ? Array.from(items).indexOf(current) : -1;
        
        switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            index = Math.min(index + 1, items.length - 1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            index = Math.max(index - 1, 0);
            break;
        case 'Enter':
            if (current) {
                e.preventDefault();
                current.click();
            }
            return;
        case 'Escape':
            this.hideAutocomplete(instance);
            return;
        }
        
        // 하이라이트 업데이트
        items.forEach(item => item.classList.remove('highlighted'));
        if (items[index]) {
            items[index].classList.add('highlighted');
        }
    }

    /**
     * 비밀번호 표시/숨김 토글
     * @param {Object} instance - 인스턴스
     */
    togglePasswordVisibility(instance) {
        const { elements } = instance;
        
        if (elements.input && elements.passwordToggle) {
            const isVisible = elements.input.type === 'text';
            elements.input.type = isVisible ? 'password' : 'text';
            elements.passwordToggle.classList.toggle('visible', !isVisible);
        }
    }

    /**
     * 카운터 업데이트
     * @param {Object} instance - 인스턴스
     */
    updateCounter(instance) {
        const { config, elements } = instance;
        
        if (config.showCounter && elements.counter && elements.counterText) {
            const length = instance.value ? instance.value.length : 0;
            const maxLength = config.maxLength || '∞';
            
            elements.counterText.textContent = `${length} / ${maxLength}`;
            elements.counter.style.display = 'block';
            
            // 최대 길이 초과 시 에러 상태
            if (config.maxLength && length > config.maxLength) {
                elements.wrapper.classList.add('error');
            } else {
                elements.wrapper.classList.remove('error');
            }
        }
    }

    /**
     * 클리어 버튼 업데이트
     * @param {Object} instance - 인스턴스
     */
    updateClearButton(instance) {
        const { config, elements } = instance;
        
        if (config.showClear && elements.clearBtn) {
            const hasValue = instance.value && instance.value.length > 0;
            elements.clearBtn.style.display = hasValue ? 'flex' : 'none';
        }
    }

    /**
     * 입력 렌더링
     * @param {Object} instance - 인스턴스
     */
    renderInput(instance) {
        const { config, elements } = instance;

        // 라벨 설정
        this.renderLabel(instance);
        
        // 입력 타입에 따른 엘리먼트 표시/숨김
        this.renderInputType(instance);
        
        // 아이콘 설정
        this.renderIcons(instance);
        
        // 도움말 및 메시지
        this.renderMessages(instance);
        
        // 초기값 설정
        this.setValue(instance, config.value);
        
        // 상태 업데이트
        this.updateCounter(instance);
        this.updateClearButton(instance);
    }

    /**
     * 라벨 렌더링
     * @param {Object} instance - 인스턴스
     */
    renderLabel(instance) {
        const { config, elements } = instance;
        
        if (config.showLabel && config.label && elements.label) {
            elements.label.style.display = 'block';
            if (elements.labelText) {
                elements.labelText.textContent = config.label;
            }
            
            if (elements.labelRequired) {
                elements.labelRequired.style.display = config.required && config.showRequired ? 'inline' : 'none';
            }
            
            if (elements.labelOptional) {
                elements.labelOptional.style.display = !config.required && config.showOptional ? 'inline' : 'none';
            }
        } else if (elements.label) {
            elements.label.style.display = 'none';
        }
    }

    /**
     * 입력 타입 렌더링
     * @param {Object} instance - 인스턴스
     */
    renderInputType(instance) {
        const { config, elements } = instance;
        
        // 모든 입력 요소 숨김
        elements.input.style.display = 'none';
        elements.textarea.style.display = 'none';
        elements.select.style.display = 'none';
        elements.inputGroup.style.display = 'none';
        elements.fileWrapper.style.display = 'none';
        
        // 타입별 요소 표시
        switch (config.type) {
        case 'textarea':
            elements.textarea.style.display = 'block';
            break;
        case 'select':
            elements.select.style.display = 'block';
            this.renderSelectOptions(instance);
            break;
        case 'checkbox':
        case 'radio':
            elements.inputGroup.style.display = 'block';
            this.renderInputGroup(instance);
            break;
        case 'file':
            elements.fileWrapper.style.display = 'block';
            break;
        case 'tags':
            elements.input.style.display = 'block';
            elements.tagList.style.display = 'flex';
            this.renderTags(instance);
            break;
        default:
            elements.input.style.display = 'block';
            elements.input.type = config.type;
            break;
        }
    }

    /**
     * 선택 옵션 렌더링
     * @param {Object} instance - 인스턴스
     */
    renderSelectOptions(instance) {
        const { config, elements } = instance;
        
        if (!elements.select || !config.options) return;
        
        elements.select.innerHTML = '';
        
        // 빈 옵션
        if (config.placeholder) {
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = config.placeholder;
            emptyOption.disabled = true;
            emptyOption.selected = !config.value;
            elements.select.appendChild(emptyOption);
        }
        
        // 옵션들
        config.options.forEach(option => {
            const optionElement = document.createElement('option');
            
            if (typeof option === 'string') {
                optionElement.value = option;
                optionElement.textContent = option;
            } else {
                optionElement.value = option.value;
                optionElement.textContent = option.label || option.value;
                if (option.disabled) optionElement.disabled = true;
            }
            
            elements.select.appendChild(optionElement);
        });
    }

    /**
     * 입력 그룹 렌더링 (체크박스/라디오)
     * @param {Object} instance - 인스턴스
     */
    renderInputGroup(instance) {
        const { config, elements } = instance;
        
        if (!elements.inputGroup || !config.options) return;
        
        elements.inputGroup.innerHTML = '';
        
        config.options.forEach((option, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'input-option';
            
            const input = document.createElement('input');
            input.type = config.type;
            input.name = config.name || `input-${Date.now()}`;
            
            const label = document.createElement('label');
            
            if (typeof option === 'string') {
                input.value = option;
                input.id = `${config.name || 'input'}-${index}`;
                label.textContent = option;
                label.htmlFor = input.id;
            } else {
                input.value = option.value;
                input.id = `${config.name || 'input'}-${index}`;
                label.textContent = option.label || option.value;
                label.htmlFor = input.id;
                if (option.disabled) input.disabled = true;
            }
            
            // 이벤트 리스너
            input.addEventListener('change', () => {
                this.handleGroupInputChange(instance, input);
            });
            
            wrapper.appendChild(input);
            wrapper.appendChild(label);
            elements.inputGroup.appendChild(wrapper);
        });
    }

    /**
     * 그룹 입력 변경 처리
     * @param {Object} instance - 인스턴스
     * @param {HTMLElement} input - 입력 요소
     */
    handleGroupInputChange(instance, input) {
        const { config } = instance;
        
        if (config.type === 'radio') {
            instance.value = input.value;
        } else if (config.type === 'checkbox') {
            if (!Array.isArray(instance.value)) {
                instance.value = [];
            }
            
            if (input.checked) {
                if (!instance.value.includes(input.value)) {
                    instance.value.push(input.value);
                }
            } else {
                const index = instance.value.indexOf(input.value);
                if (index > -1) {
                    instance.value.splice(index, 1);
                }
            }
        }
        
        if (config.onChange) {
            config.onChange(instance.value, instance);
        }
    }

    /**
     * 아이콘 렌더링
     * @param {Object} instance - 인스턴스
     */
    renderIcons(instance) {
        const { config, elements } = instance;
        
        // 왼쪽 아이콘
        if (config.leftIcon && elements.iconLeft) {
            elements.iconLeft.innerHTML = `<i class="${config.leftIcon}"></i>`;
            elements.iconLeft.style.display = 'block';
            elements.inputContainer.classList.add('has-icon-left');
        }
        
        // 오른쪽 아이콘
        if (config.rightIcon && elements.iconRight) {
            elements.iconRight.innerHTML = `<i class="${config.rightIcon}"></i>`;
            elements.iconRight.style.display = 'block';
            elements.inputContainer.classList.add('has-icon-right');
        }
        
        // 비밀번호 토글
        if (config.type === 'password' && config.showPasswordToggle && elements.passwordToggle) {
            elements.passwordToggle.style.display = 'flex';
        }
        
        // 클리어 버튼
        if (config.showClear && elements.clearBtn) {
            elements.clearBtn.style.display = 'none'; // 초기에는 숨김
        }
    }

    /**
     * 메시지 렌더링
     * @param {Object} instance - 인스턴스
     */
    renderMessages(instance) {
        const { config, elements } = instance;
        
        // 도움말
        if (config.helpText && elements.help && elements.helpText) {
            elements.helpText.textContent = config.helpText;
            elements.help.style.display = 'block';
        }
        
        // 에러 메시지
        if (config.errorText && elements.error && elements.errorText) {
            elements.errorText.textContent = config.errorText;
            elements.error.style.display = 'flex';
            elements.wrapper.classList.add('error');
        }
        
        // 성공 메시지
        if (config.successText && elements.success && elements.successText) {
            elements.successText.textContent = config.successText;
            elements.success.style.display = 'flex';
            elements.wrapper.classList.add('success');
        }
    }

    /**
     * 유효성 검사 설정
     */
    setupValidators() {
        return {
            required: (value, rule) => {
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return rule.message || '필수 입력 항목입니다.';
                }
                return null;
            },
            
            minLength: (value, rule) => {
                if (value && value.length < rule.value) {
                    return rule.message || `최소 ${rule.value}자 이상 입력해주세요.`;
                }
                return null;
            },
            
            maxLength: (value, rule) => {
                if (value && value.length > rule.value) {
                    return rule.message || `최대 ${rule.value}자까지 입력 가능합니다.`;
                }
                return null;
            },
            
            email: (value, rule) => {
                if (value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        return rule.message || '올바른 이메일 형식이 아닙니다.';
                    }
                }
                return null;
            },
            
            url: (value, rule) => {
                if (value) {
                    try {
                        new URL(value);
                    } catch {
                        return rule.message || '올바른 URL 형식이 아닙니다.';
                    }
                }
                return null;
            },
            
            pattern: (value, rule) => {
                if (value) {
                    const regex = new RegExp(rule.value);
                    if (!regex.test(value)) {
                        return rule.message || '입력 형식이 올바르지 않습니다.';
                    }
                }
                return null;
            },
            
            min: (value, rule) => {
                const num = parseFloat(value);
                if (!isNaN(num) && num < rule.value) {
                    return rule.message || `${rule.value} 이상의 값을 입력해주세요.`;
                }
                return null;
            },
            
            max: (value, rule) => {
                const num = parseFloat(value);
                if (!isNaN(num) && num > rule.value) {
                    return rule.message || `${rule.value} 이하의 값을 입력해주세요.`;
                }
                return null;
            }
        };
    }

    /**
     * 유효성 검사 실행
     * @param {Object} instance - 인스턴스
     * @returns {boolean} 유효 여부
     */
    validateInput(instance) {
        const { config } = instance;
        
        if (!config.validation.enabled) return true;
        
        instance.validationErrors = [];
        
        // 기본 HTML5 유효성 검사
        const inputElement = this.getActiveInputElement(instance);
        if (inputElement && !inputElement.checkValidity()) {
            instance.validationErrors.push(inputElement.validationMessage);
        }
        
        // 커스텀 유효성 검사 규칙
        config.validation.rules.forEach(rule => {
            const validator = this.validators[rule.type];
            if (validator) {
                const error = validator(instance.value, rule);
                if (error) {
                    instance.validationErrors.push(error);
                }
            }
        });
        
        // 상태 업데이트
        instance.isValid = instance.validationErrors.length === 0;
        
        if (instance.isValid) {
            this.clearMessages(instance);
            instance.elements.wrapper.classList.remove('error');
            instance.elements.wrapper.classList.add('success');
        } else {
            this.setError(instance, instance.validationErrors[0]);
        }
        
        // 콜백 실행
        if (config.onValidate) {
            config.onValidate(instance.isValid, instance.validationErrors, instance);
        }
        
        return instance.isValid;
    }

    /**
     * 값 가져오기
     * @param {Object} instance - 인스턴스
     * @returns {*} 값
     */
    getValue(instance) {
        return instance.value;
    }

    /**
     * 값 설정
     * @param {Object} instance - 인스턴스
     * @param {*} value - 값
     */
    setValue(instance, value) {
        const { config } = instance;
        
        instance.value = value;
        
        const inputElement = this.getActiveInputElement(instance);
        if (inputElement) {
            if (config.type === 'checkbox' && Array.isArray(value)) {
                // 체크박스 그룹 값 설정
                const checkboxes = instance.elements.inputGroup?.querySelectorAll('input[type="checkbox"]');
                checkboxes?.forEach(checkbox => {
                    checkbox.checked = value.includes(checkbox.value);
                });
            } else if (config.type === 'radio') {
                // 라디오 그룹 값 설정
                const radios = instance.elements.inputGroup?.querySelectorAll('input[type="radio"]');
                radios?.forEach(radio => {
                    radio.checked = radio.value === value;
                });
            } else if (config.type !== 'file') {
                inputElement.value = value || '';
            }
        }
        
        // 상태 업데이트
        this.updateCounter(instance);
        this.updateClearButton(instance);
    }

    /**
     * 입력 포커스
     * @param {Object} instance - 인스턴스
     */
    focusInput(instance) {
        const inputElement = this.getActiveInputElement(instance);
        if (inputElement) {
            inputElement.focus();
        }
    }

    /**
     * 입력 블러
     * @param {Object} instance - 인스턴스
     */
    blurInput(instance) {
        const inputElement = this.getActiveInputElement(instance);
        if (inputElement) {
            inputElement.blur();
        }
    }

    /**
     * 입력 클리어
     * @param {Object} instance - 인스턴스
     */
    clearInput(instance) {
        this.setValue(instance, '');
        
        if (instance.config.onChange) {
            instance.config.onChange('', instance);
        }
    }

    /**
     * 에러 설정
     * @param {Object} instance - 인스턴스
     * @param {string} message - 에러 메시지
     */
    setError(instance, message) {
        const { elements } = instance;
        
        this.clearMessages(instance);
        
        if (elements.error && elements.errorText) {
            elements.errorText.textContent = message;
            elements.error.style.display = 'flex';
            elements.wrapper.classList.add('error');
            elements.wrapper.classList.remove('success');
        }
    }

    /**
     * 성공 설정
     * @param {Object} instance - 인스턴스
     * @param {string} message - 성공 메시지
     */
    setSuccess(instance, message) {
        const { elements } = instance;
        
        this.clearMessages(instance);
        
        if (elements.success && elements.successText) {
            elements.successText.textContent = message;
            elements.success.style.display = 'flex';
            elements.wrapper.classList.add('success');
            elements.wrapper.classList.remove('error');
        }
    }

    /**
     * 메시지 클리어
     * @param {Object} instance - 인스턴스
     */
    clearMessages(instance) {
        const { elements } = instance;
        
        if (elements.error) {
            elements.error.style.display = 'none';
        }
        
        if (elements.success) {
            elements.success.style.display = 'none';
        }
        
        elements.wrapper.classList.remove('error', 'success');
    }

    /**
     * 입력 활성화
     * @param {Object} instance - 인스턴스
     */
    enableInput(instance) {
        instance.config.disabled = false;
        
        const inputElement = this.getActiveInputElement(instance);
        if (inputElement) {
            inputElement.disabled = false;
        }
        
        instance.elements.wrapper.classList.remove('disabled');
    }

    /**
     * 입력 비활성화
     * @param {Object} instance - 인스턴스
     */
    disableInput(instance) {
        instance.config.disabled = true;
        
        const inputElement = this.getActiveInputElement(instance);
        if (inputElement) {
            inputElement.disabled = true;
        }
        
        instance.elements.wrapper.classList.add('disabled');
    }

    /**
     * 로딩 표시
     * @param {Object} instance - 인스턴스
     */
    showLoading(instance) {
        if (instance.elements.loading) {
            instance.elements.loading.style.display = 'block';
        }
        instance.config.loading = true;
    }

    /**
     * 로딩 숨김
     * @param {Object} instance - 인스턴스
     */
    hideLoading(instance) {
        if (instance.elements.loading) {
            instance.elements.loading.style.display = 'none';
        }
        instance.config.loading = false;
    }

    /**
     * 인스턴스 제거
     * @param {string} containerId - 컨테이너 ID
     */
    destroyInstance(containerId) {
        if (this.instances.has(containerId)) {
            const instance = this.instances.get(containerId);
            instance.container.innerHTML = '';
            this.instances.delete(containerId);
        }
    }

    /**
     * 특정 인스턴스 가져오기
     * @param {string} containerId - 컨테이너 ID
     * @returns {Object|null} 인스턴스
     */
    getInstance(containerId) {
        return this.instances.get(containerId) || null;
    }

    /**
     * 모든 인스턴스 제거
     */
    destroyAll() {
        this.instances.forEach((instance, containerId) => {
            this.destroyInstance(containerId);
        });
    }
}

// 전역 인스턴스 생성
const formInputLoader = new FormInputLoader();

// 모듈 시스템 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormInputLoader;
}

// 전역 사용을 위한 window 객체 등록
if (typeof window !== 'undefined') {
    window.FormInputLoader = FormInputLoader;
    window.formInputLoader = formInputLoader;
}

/**
 * 사용 예시:
 * 
 * // 기본 텍스트 입력
 * const textInput = await formInputLoader.loadFormInput('text-input-container', {
 *     type: 'text',
 *     label: '사용자명',
 *     placeholder: '이름을 입력하세요',
 *     required: true,
 *     showCounter: true,
 *     maxLength: 50,
 *     validation: {
 *         rules: [
 *             { type: 'required' },
 *             { type: 'minLength', value: 2 }
 *         ]
 *     }
 * });
 * 
 * // 이메일 입력
 * const emailInput = await formInputLoader.loadFormInput('email-input-container', {
 *     type: 'email',
 *     label: '이메일',
 *     placeholder: 'email@example.com',
 *     leftIcon: 'fas fa-envelope',
 *     showClear: true,
 *     validation: {
 *         rules: [
 *             { type: 'required' },
 *             { type: 'email' }
 *         ]
 *     }
 * });
 * 
 * // 파일 업로드
 * const fileInput = await formInputLoader.loadFormInput('file-input-container', {
 *     type: 'file',
 *     label: '파일 업로드',
 *     multiple: true,
 *     accept: 'image/*',
 *     maxFileSize: 5 * 1024 * 1024,
 *     allowedFileTypes: ['jpg', 'png', 'gif'],
 *     onFileSelect: (files) => {
 *         console.log('선택된 파일:', files);
 *     }
 * });
 * 
 * // 태그 입력
 * const tagInput = await formInputLoader.loadFormInput('tag-input-container', {
 *     type: 'tags',
 *     label: '태그',
 *     placeholder: '태그를 입력하고 Enter를 누르세요',
 *     maxTags: 10,
 *     onTagAdd: (tag, tags) => {
 *         console.log('태그 추가:', tag, tags);
 *     }
 * });
 * 
 * // 자동완성 입력
 * const autocompleteInput = await formInputLoader.loadFormInput('autocomplete-container', {
 *     type: 'text',
 *     label: '도시',
 *     placeholder: '도시명을 입력하세요',
 *     autocomplete: true,
 *     autocompleteSource: async (query) => {
 *         const response = await fetch(`/api/cities?q=${query}`);
 *         return response.json();
 *     }
 * });
 */