// 🏢 시장조사 페이지 모듈 - ES6 모듈 시스템 적용
// 설계자: Architecture + Frontend Specialist | 중복 코드 제거 및 접근성 강화

import { eventSystem } from '../core/eventSystem.js';
import { stateManager } from '../core/stateManager.js';

export class MarketResearchPage {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {};

        // 중앙화된 데이터 사용 (중복 제거)
        this.regionData = window.WaveSpaceData?.regionData || {};
        this.regionNames = window.WaveSpaceData?.regionNames || {};

        console.log('[MarketResearch] 시장조사 페이지 모듈 초기화');
    }

    // 🚀 페이지 초기화
    async init() {
        try {
            await this.setupEventListeners();
            this.loadSavedData();
            this.initializeFormValidation();
            this.setupAccessibility();

            // UI 상태 복원
            const savedStep = stateManager.getState('market-research-step', 1);
            this.goToStep(savedStep);

            console.log('[MarketResearch] 페이지 초기화 완료');
        } catch (error) {
            window.WaveSpaceData?.errorHandler?.log('error', '시장조사 페이지 초기화 실패', {
                error: error.message,
            });
        }
    }

    // 🎭 이벤트 리스너 설정
    async setupEventListeners() {
        // 1단계: 지역 선택
        const regionSelect = document.getElementById('region-select');
        if (regionSelect) {
            eventSystem.on(regionSelect, 'change', (e) => {
                this.handleRegionChange(e.target.value);
            });
        }

        // 2단계: 상품 유형 선택
        const productCheckboxes = document.querySelectorAll('input[name=\"product-type\"]');
        productCheckboxes.forEach((checkbox) => {
            eventSystem.on(checkbox, 'change', (e) => {
                this.handleProductTypeChange(e.target.value, e.target.checked);
            });
        });

        // 3단계: 예산 입력 (디바운스 적용)
        const budgetInput = document.getElementById('budget-input');
        if (budgetInput) {
            eventSystem.on(
                budgetInput,
                'input',
                (e) => {
                    this.handleBudgetChange(e.target.value);
                },
                { debounce: 300 }
            );
        }

        // 네비게이션 버튼
        const nextBtn = document.getElementById('next-step-btn');
        const prevBtn = document.getElementById('prev-step-btn');

        if (nextBtn) {
            eventSystem.on(nextBtn, 'click', () => this.nextStep());
        }
        if (prevBtn) {
            eventSystem.on(prevBtn, 'click', () => this.prevStep());
        }

        // 폼 제출
        const form = document.getElementById('market-research-form');
        if (form) {
            eventSystem.on(form, 'submit', (e) => {
                e.preventDefault();
                this.submitForm();
            });
        }
    }

    // 🌏 지역 변경 처리 (중앙화된 데이터 사용)
    handleRegionChange(regionCode) {
        const subRegionSelect = document.getElementById('sub-region-select');
        if (!subRegionSelect) return;

        // 안전한 데이터 접근
        const subRegions = window.WaveSpaceData.dataUtils?.getSubRegions(regionCode) || [];

        // 하위 지역 옵션 업데이트
        subRegionSelect.innerHTML = '<option value=\"\">세부 지역 선택</option>';
        subRegions.forEach((region) => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            subRegionSelect.appendChild(option);
        });

        // 상태 저장
        this.formData.region = regionCode;
        this.saveFormData();

        // 접근성: 스크린 리더 안내
        this.announceToScreenReader(
            `${this.regionNames[regionCode]} 지역이 선택되었습니다. ${subRegions.length}개의 세부 지역이 있습니다.`
        );
    }

    // 🏠 상품 유형 변경 처리
    handleProductTypeChange(productType, checked) {
        if (!this.formData.productTypes) {
            this.formData.productTypes = [];
        }

        if (checked) {
            this.formData.productTypes.push(productType);
        } else {
            const index = this.formData.productTypes.indexOf(productType);
            if (index > -1) {
                this.formData.productTypes.splice(index, 1);
            }
        }

        this.saveFormData();
        this.updateStepProgress();
    }

    // 💰 예산 변경 처리
    handleBudgetChange(value) {
        // 숫자만 허용
        const numericValue = value.replace(/[^0-9]/g, '');

        this.formData.budget = numericValue;
        this.saveFormData();

        // 실시간 포맷팅
        const budgetInput = document.getElementById('budget-input');
        if (budgetInput && numericValue) {
            budgetInput.value = parseInt(numericValue).toLocaleString() + '만원';
        }
    }

    // ➡️ 다음 단계
    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.goToStep(this.currentStep + 1);
            }
        }
    }

    // ⬅️ 이전 단계
    prevStep() {
        if (this.currentStep > 1) {
            this.goToStep(this.currentStep - 1);
        }
    }

    // 🎯 특정 단계로 이동
    goToStep(step) {
        if (step < 1 || step > this.totalSteps) return;

        // 현재 단계 숨기기
        const currentStepEl = document.querySelector(`[data-step=\"${this.currentStep}\"]`);
        if (currentStepEl) {
            currentStepEl.classList.add('hidden');
        }

        // 새 단계 보이기
        const newStepEl = document.querySelector(`[data-step=\"${step}\"]`);
        if (newStepEl) {
            newStepEl.classList.remove('hidden');

            // 포커스 관리 (접근성)
            const firstInput = newStepEl.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }

        this.currentStep = step;
        this.updateStepIndicator();

        // 상태 저장
        stateManager.setState('market-research-step', step);

        // 접근성: 단계 변경 안내
        this.announceToScreenReader(`${step}단계로 이동했습니다. ${this.getStepTitle(step)}`);
    }

    // 📊 단계 표시기 업데이트
    updateStepIndicator() {
        try {
            // 단계 표시기 찾기
            const stepIndicators = document.querySelectorAll('.step-indicator .step') ||
                                 document.querySelectorAll('.progress-step') ||
                                 document.querySelectorAll('[data-step-indicator]');

            // 단계 표시기가 없으면 콘솔에 상태만 로그
            if (!stepIndicators || stepIndicators.length === 0) {
                console.log(`📊 현재 단계: ${this.currentStep}/${this.totalSteps}`);
                return;
            }

            // 모든 단계 표시기 업데이트
            stepIndicators.forEach((indicator, index) => {
                const stepNumber = index + 1;
                
                // 클래스 초기화
                indicator.classList.remove('active', 'completed', 'current');
                
                if (stepNumber < this.currentStep) {
                    // 완료된 단계
                    indicator.classList.add('completed');
                } else if (stepNumber === this.currentStep) {
                    // 현재 단계
                    indicator.classList.add('active', 'current');
                }

                // 접근성을 위한 aria 속성 업데이트
                if (stepNumber === this.currentStep) {
                    indicator.setAttribute('aria-current', 'step');
                } else {
                    indicator.removeAttribute('aria-current');
                }
            });

            // 진행률 바 업데이트 (있는 경우)
            const progressBar = document.querySelector('.progress-bar-fill') ||
                               document.querySelector('[data-progress-bar]');
            
            if (progressBar) {
                const progressPercent = (this.currentStep / this.totalSteps) * 100;
                progressBar.style.width = `${progressPercent}%`;
                progressBar.setAttribute('aria-valuenow', this.currentStep);
                progressBar.setAttribute('aria-valuetext', `${this.currentStep}단계 / 총 ${this.totalSteps}단계`);
            }

            console.log(`📊 단계 표시기 업데이트: ${this.currentStep}/${this.totalSteps}`);

        } catch (error) {
            console.error('❌ updateStepIndicator 오류:', error);
            // 오류 발생 시 기본 동작
            console.log(`📊 현재 단계: ${this.currentStep}/${this.totalSteps} (표시기 업데이트 실패)`);
        }
    }

    // ✅ 현재 단계 유효성 검증
    validateCurrentStep() {
        switch (this.currentStep) {
        case 1:
            if (!this.formData.region) {
                this.showValidationError('지역을 선택해주세요.');
                return false;
            }
            break;
        case 2:
            if (!this.formData.productTypes || this.formData.productTypes.length === 0) {
                this.showValidationError('하나 이상의 상품 유형을 선택해주세요.');
                return false;
            }
            break;
        case 3:
            if (!this.formData.budget || parseInt(this.formData.budget) < 1000) {
                this.showValidationError('예산을 1,000만원 이상 입력해주세요.');
                return false;
            }
            break;
        }
        return true;
    }

    // 💾 폼 데이터 저장
    saveFormData() {
        stateManager.setState('market-research-form', this.formData, { persist: true });
    }

    // 📂 저장된 데이터 로드
    loadSavedData() {
        const savedData = stateManager.getState('market-research-form', {});
        this.formData = { ...savedData };

        // UI에 데이터 복원
        this.restoreFormUI();
    }

    // 🎨 UI 복원
    restoreFormUI() {
        if (this.formData.region) {
            const regionSelect = document.getElementById('region-select');
            if (regionSelect) {
                regionSelect.value = this.formData.region;
                this.handleRegionChange(this.formData.region);
            }
        }

        if (this.formData.productTypes) {
            this.formData.productTypes.forEach((type) => {
                const checkbox = document.querySelector(
                    `input[name=\"product-type\"][value=\"${type}\"]`
                );
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
    }

    // 📋 폼 유효성 검증 초기화
    initializeFormValidation() {
        // 실시간 유효성 검증 설정
        const form = document.getElementById('market-research-form');
        if (form) {
            // HTML5 기본 유효성 검증 활성화
            form.setAttribute('novalidate', false);
            
            // 필수 입력 필드들에 대한 검증 설정
            const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
            requiredFields.forEach(field => {
                // 입력 시 실시간 검증
                field.addEventListener('blur', (e) => {
                    this.validateField(e.target);
                });
                
                field.addEventListener('input', (e) => {
                    // 에러 상태인 경우에만 실시간 재검증
                    if (e.target.classList.contains('invalid')) {
                        this.validateField(e.target);
                    }
                });
            });
        }
        
        console.log('[MarketResearch] 폼 유효성 검증 초기화 완료');
    }

    // 📝 개별 필드 유효성 검증
    validateField(field) {
        const isValid = field.checkValidity();
        
        if (isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
            this.clearFieldError(field);
        } else {
            field.classList.remove('valid');
            field.classList.add('invalid');
            this.showFieldError(field, field.validationMessage);
        }
        
        return isValid;
    }

    // 🚨 필드 에러 표시
    showFieldError(field, message) {
        // 기존 에러 메시지 제거
        this.clearFieldError(field);
        
        // 새 에러 메시지 추가
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }

    // 🧹 필드 에러 제거
    clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    // ♿ 접근성 설정
    setupAccessibility() {
        // ARIA 레이블 설정
        const form = document.getElementById('market-research-form');
        if (form) {
            form.setAttribute('aria-label', '시장조사 설문 폼');
        }

        // 단계 인디케이터에 ARIA 설정
        const stepIndicators = document.querySelectorAll('.step-indicator');
        stepIndicators.forEach((indicator, index) => {
            indicator.setAttribute('aria-label', `${index + 1}단계`);
            indicator.setAttribute('role', 'tab');
        });
    }

    // 📢 스크린 리더 안내
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-9999px';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // 🚨 유효성 검증 오류 표시
    showValidationError(message) {
        window.WaveSpaceData?.errorHandler?.showUserError(message);
        this.announceToScreenReader(`오류: ${message}`);
    }

    // 📋 폼 제출
    async submitForm() {
        if (!this.validateCurrentStep()) {
            return;
        }

        try {
            // 제출 데이터 준비
            const submitData = {
                ...this.formData,
                timestamp: new Date().toISOString(),
                version: '1.0',
            };

            // 성공 처리
            this.showSuccessMessage();

            // 상태 초기화
            stateManager.removeState('market-research-form');
            stateManager.removeState('market-research-step');
        } catch (error) {
            window.WaveSpaceData?.errorHandler?.log('error', '시장조사 폼 제출 실패', {
                error: error.message,
                formData: this.formData,
            });
            this.showValidationError('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }

    // ✨ 성공 메시지 표시
    showSuccessMessage() {
        const message = '시장조사 설문이 성공적으로 제출되었습니다!';
        this.announceToScreenReader(message);

        // 성공 알림 UI 표시
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.textContent = message;

        const form = document.getElementById('market-research-form');
        if (form) {
            form.parentNode.insertBefore(successDiv, form);
            setTimeout(() => successDiv.remove(), 5000);
        }
    }

    // 정리
    cleanup() {
        eventSystem.cleanup();
        console.log('[MarketResearch] 페이지 정리 완료');
    }
}

// 페이지별 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.body.dataset.page === 'market-research') {
            window.marketResearchPage = new MarketResearchPage();
            window.marketResearchPage.init();
        }
    });
} else {
    if (document.body.dataset.page === 'market-research') {
        window.marketResearchPage = new MarketResearchPage();
        window.marketResearchPage.init();
    }
}
