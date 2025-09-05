/**
 * WAVE SPACE - 모달 관리 시스템
 * 모든 페이지에서 공통으로 사용하는 모달 관리 유틸리티
 */

/**
 * 모달 매니저 클래스
 * 모달의 생성, 표시, 숨김, 제거를 통합 관리
 */
class ModalManager {
    constructor() {
        this.modals = new Map(); // 활성 모달들을 추적
        this.zIndexBase = 1000;
        this.currentZIndex = this.zIndexBase;
        this.bodyScrollPosition = 0;
        
        // 키보드 이벤트 리스너 등록
        this.setupGlobalEventListeners();
    }

    /**
     * 전역 이벤트 리스너 설정
     */
    setupGlobalEventListeners() {
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modals.size > 0) {
                this.closeTopModal();
            }
        });

        // 뒤로가기 버튼으로 모달 닫기
        window.addEventListener('popstate', () => {
            if (this.modals.size > 0) {
                this.closeTopModal();
            }
        });
    }

    /**
     * 모달 생성 및 표시
     * @param {string} id - 모달 고유 ID
     * @param {Object} options - 모달 옵션
     * @returns {HTMLElement} 생성된 모달 요소
     */
    create(id, options = {}) {
        const config = {
            title: options.title || '',
            content: options.content || '',
            size: options.size || 'medium', // small, medium, large, fullscreen
            closable: options.closable !== false,
            backdrop: options.backdrop !== false,
            keyboard: options.keyboard !== false,
            className: options.className || '',
            buttons: options.buttons || [],
            onShow: options.onShow || null,
            onHide: options.onHide || null,
            onDestroy: options.onDestroy || null,
            ...options
        };

        // 이미 존재하는 모달 확인
        if (this.modals.has(id)) {
            console.warn(`모달 '${id}'가 이미 존재합니다.`);
            return this.modals.get(id).element;
        }

        // 모달 요소 생성
        const modal = this.createModalElement(id, config);
        
        // 모달 정보 저장
        this.modals.set(id, {
            element: modal,
            config: config,
            zIndex: ++this.currentZIndex
        });

        // DOM에 추가
        document.body.appendChild(modal);

        // 표시
        this.show(id);

        return modal;
    }

    /**
     * 모달 HTML 요소 생성
     */
    createModalElement(id, config) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = `wave-modal ${config.size} ${config.className}`;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', `${id}-title`);

        // 모달 구조 생성
        modal.innerHTML = `
            <!-- 백드롭 -->
            <div class="modal-backdrop" ${config.backdrop ? 'data-dismiss="modal"' : ''}></div>
            
            <!-- 모달 컨테이너 -->
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <!-- 헤더 -->
                    ${config.title || config.closable ? `
                        <div class="modal-header">
                            ${config.title ? `<h4 class="modal-title" id="${id}-title">${config.title}</h4>` : ''}
                            ${config.closable ? `
                                <button type="button" class="modal-close" data-dismiss="modal" aria-label="닫기">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    <!-- 본문 -->
                    <div class="modal-body">
                        ${config.content}
                    </div>
                    
                    <!-- 푸터 -->
                    ${config.buttons.length > 0 ? `
                        <div class="modal-footer">
                            ${config.buttons.map(btn => `
                                <button type="button" class="btn ${btn.className || 'btn-secondary'}" 
                                        data-action="${btn.action || ''}"
                                        ${btn.dismiss ? 'data-dismiss="modal"' : ''}>
                                    ${btn.text}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // 이벤트 리스너 등록
        this.setupModalEventListeners(modal, id, config);

        return modal;
    }

    /**
     * 모달 이벤트 리스너 설정
     */
    setupModalEventListeners(modal, id, config) {
        // 닫기 버튼 클릭
        modal.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hide(id);
            });
        });

        // 액션 버튼 클릭
        modal.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                if (action && config[action] && typeof config[action] === 'function') {
                    const result = config[action](e, this);
                    
                    // 액션 함수가 false를 반환하지 않으면 모달 닫기
                    if (result !== false && e.target.getAttribute('data-dismiss') === 'modal') {
                        this.hide(id);
                    }
                }
            });
        });

        // 백드롭 클릭 시 닫기 (옵션이 활성화된 경우)
        if (config.backdrop) {
            const backdrop = modal.querySelector('.modal-backdrop');
            backdrop?.addEventListener('click', () => {
                this.hide(id);
            });
        }
    }

    /**
     * 모달 표시
     */
    show(id) {
        const modalInfo = this.modals.get(id);
        if (!modalInfo) {
            console.warn(`모달 '${id}'를 찾을 수 없습니다.`);
            return;
        }

        const { element, config, zIndex } = modalInfo;

        // body 스크롤 방지
        if (this.modals.size === 1) { // 첫 번째 모달인 경우
            this.bodyScrollPosition = window.pageYOffset;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${this.bodyScrollPosition}px`;
            document.body.style.width = '100%';
        }

        // z-index 설정
        element.style.zIndex = zIndex;

        // 애니메이션과 함께 표시
        element.classList.add('showing');
        
        requestAnimationFrame(() => {
            element.classList.add('show');
            element.classList.remove('showing');
            
            // 포커스 설정
            const firstFocusable = element.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            firstFocusable?.focus();
            
            // onShow 콜백 실행
            if (config.onShow && typeof config.onShow === 'function') {
                config.onShow(element, this);
            }
        });

        console.log(`✅ 모달 '${id}' 표시됨`);
    }

    /**
     * 모달 숨김
     */
    hide(id) {
        const modalInfo = this.modals.get(id);
        if (!modalInfo) {
            console.warn(`모달 '${id}'를 찾을 수 없습니다.`);
            return;
        }

        const { element, config } = modalInfo;

        // onHide 콜백 실행
        if (config.onHide && typeof config.onHide === 'function') {
            const result = config.onHide(element, this);
            // 콜백이 false를 반환하면 숨김 취소
            if (result === false) {
                return;
            }
        }

        // 애니메이션과 함께 숨김
        element.classList.add('hiding');
        element.classList.remove('show');

        setTimeout(() => {
            element.classList.remove('hiding');
            
            // 모달 제거
            this.destroy(id);
            
        }, 300); // 애니메이션 시간과 일치

        console.log(`✅ 모달 '${id}' 숨겨짐`);
    }

    /**
     * 모달 완전 제거
     */
    destroy(id) {
        const modalInfo = this.modals.get(id);
        if (!modalInfo) {
            return;
        }

        const { element, config } = modalInfo;

        // onDestroy 콜백 실행
        if (config.onDestroy && typeof config.onDestroy === 'function') {
            config.onDestroy(element, this);
        }

        // DOM에서 제거
        element.remove();
        
        // 모달 정보 제거
        this.modals.delete(id);

        // 마지막 모달인 경우 body 스크롤 복원
        if (this.modals.size === 0) {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, this.bodyScrollPosition);
        }

        console.log(`🗑️ 모달 '${id}' 제거됨`);
    }

    /**
     * 맨 위 모달 닫기
     */
    closeTopModal() {
        if (this.modals.size === 0) return;

        // 가장 높은 z-index를 가진 모달 찾기
        let topModal = null;
        let maxZIndex = 0;

        for (const [id, info] of this.modals) {
            if (info.zIndex > maxZIndex && info.config.keyboard !== false) {
                maxZIndex = info.zIndex;
                topModal = id;
            }
        }

        if (topModal) {
            this.hide(topModal);
        }
    }

    /**
     * 모든 모달 닫기
     */
    closeAll() {
        for (const id of this.modals.keys()) {
            this.hide(id);
        }
    }

    /**
     * 확인 다이얼로그
     */
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            const id = `confirm-${Date.now()}`;
            
            this.create(id, {
                title: options.title || '확인',
                content: `<p class="confirm-message">${message}</p>`,
                size: options.size || 'small',
                buttons: [
                    {
                        text: options.cancelText || '취소',
                        className: 'btn-secondary',
                        dismiss: true,
                        action: 'onCancel'
                    },
                    {
                        text: options.confirmText || '확인',
                        className: options.confirmClass || 'btn-primary',
                        dismiss: true,
                        action: 'onConfirm'
                    }
                ],
                onConfirm: () => {
                    resolve(true);
                },
                onCancel: () => {
                    resolve(false);
                }
            });
        });
    }

    /**
     * 알림 다이얼로그
     */
    alert(message, options = {}) {
        return new Promise((resolve) => {
            const id = `alert-${Date.now()}`;
            
            this.create(id, {
                title: options.title || '알림',
                content: `<p class="alert-message">${message}</p>`,
                size: options.size || 'small',
                buttons: [
                    {
                        text: options.buttonText || '확인',
                        className: 'btn-primary',
                        dismiss: true,
                        action: 'onClose'
                    }
                ],
                onClose: () => {
                    resolve();
                }
            });
        });
    }

    /**
     * 로딩 모달
     */
    showLoading(message = '로딩 중...', id = 'loading-modal') {
        this.create(id, {
            content: `
                <div class="loading-container text-center">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin fa-2x"></i>
                    </div>
                    <p class="loading-message mt-3">${message}</p>
                </div>
            `,
            size: 'small',
            closable: false,
            backdrop: false,
            className: 'loading-modal'
        });
        
        return id;
    }

    /**
     * 로딩 모달 숨김
     */
    hideLoading(id = 'loading-modal') {
        this.hide(id);
    }

    /**
     * 모달 존재 여부 확인
     */
    exists(id) {
        return this.modals.has(id);
    }

    /**
     * 활성 모달 개수 반환
     */
    getActiveCount() {
        return this.modals.size;
    }

    /**
     * 모달 정보 반환
     */
    getModal(id) {
        return this.modals.get(id) || null;
    }
}

// CSS 스타일 자동 추가
const addModalStyles = () => {
    if (document.querySelector('#wave-modal-styles')) {
        return; // 이미 추가됨
    }

    const style = document.createElement('style');
    style.id = 'wave-modal-styles';
    style.textContent = `
        .wave-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .wave-modal.showing,
        .wave-modal.show {
            opacity: 1;
            visibility: visible;
        }

        .wave-modal.hiding {
            opacity: 0;
            visibility: hidden;
        }

        .modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            cursor: pointer;
        }

        .modal-dialog {
            position: relative;
            background: white;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            max-height: 90vh;
            overflow-y: auto;
            transform: scale(0.9) translateY(-20px);
            transition: transform 0.3s ease;
        }

        .wave-modal.show .modal-dialog {
            transform: scale(1) translateY(0);
        }

        /* 모달 크기 */
        .wave-modal.small .modal-dialog {
            width: 90%;
            max-width: 400px;
        }

        .wave-modal.medium .modal-dialog {
            width: 90%;
            max-width: 600px;
        }

        .wave-modal.large .modal-dialog {
            width: 95%;
            max-width: 900px;
        }

        .wave-modal.fullscreen .modal-dialog {
            width: 100%;
            height: 100%;
            max-width: none;
            max-height: none;
            border-radius: 0;
        }

        /* 모달 구성요소 */
        .modal-header {
            display: flex;
            align-items: center;
            justify-content: between;
            padding: 20px 24px 0;
            border-bottom: 1px solid #dee2e6;
        }

        .modal-title {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            flex: 1;
        }

        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            line-height: 1;
            padding: 0;
            margin-left: auto;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
        }

        .modal-close:hover {
            opacity: 1;
        }

        .modal-body {
            padding: 20px 24px;
        }

        .modal-footer {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            padding: 0 24px 20px;
            border-top: 1px solid #dee2e6;
        }

        /* 로딩 모달 */
        .loading-modal .modal-dialog {
            box-shadow: none;
            background: transparent;
        }

        .loading-container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .loading-spinner {
            color: #007bff;
        }

        .loading-message {
            margin: 0;
            color: #666;
        }

        /* 반응형 */
        @media (max-width: 768px) {
            .wave-modal .modal-dialog {
                width: 95%;
                margin: 20px auto;
                max-height: calc(100vh - 40px);
            }

            .modal-header,
            .modal-body,
            .modal-footer {
                padding-left: 16px;
                padding-right: 16px;
            }
        }
    `;
    
    document.head.appendChild(style);
};

// 스타일 자동 추가
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addModalStyles);
} else {
    addModalStyles();
}

// 전역 인스턴스 생성
const modalManager = new ModalManager();

// 전역으로 사용할 수 있도록 export
window.ModalManager = modalManager;

export { ModalManager, modalManager };