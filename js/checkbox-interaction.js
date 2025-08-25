// 체크박스 인터랙션 JavaScript

// 탭 체크박스 처리
function initCheckboxTabs() {
    const tabs = document.querySelectorAll('.checkbox-tab');

    tabs.forEach((tab) => {
        const input = tab.querySelector('input[type="radio"]');

        // 클릭 이벤트 처리
        tab.addEventListener('click', function (e) {
            // 라디오 버튼이 직접 클릭된 경우가 아니면
            if (e.target.type !== 'radio') {
                e.preventDefault();

                // 다른 탭들의 active 클래스 제거
                tabs.forEach((t) => {
                    t.classList.remove('active');
                    const tInput = t.querySelector('input[type="radio"]');
                    if (tInput) tInput.checked = false;
                });

                // 현재 탭에 active 클래스 추가
                this.classList.add('active');

                // 라디오 버튼 체크
                if (input) {
                    input.checked = true;
                }

                // 체크 애니메이션 트리거
                const checkIcon = this.querySelector('.tab-check');
                if (checkIcon) {
                    // 애니메이션 재시작
                    checkIcon.style.animation = 'none';
                    checkIcon.offsetHeight; // 리플로우 강제
                    checkIcon.style.animation = 'slide-in 0.3s ease-out';
                }

                // 이벤트 발생 (필터링 등을 위해)
                const event = new CustomEvent('tabChanged', {
                    detail: { status: this.dataset.status },
                });
                document.dispatchEvent(event);
            }
        });

        // 라디오 버튼 변경 이벤트
        if (input) {
            input.addEventListener('change', function () {
                if (this.checked) {
                    tabs.forEach((t) => t.classList.remove('active'));
                    tab.classList.add('active');
                }
            });
        }
    });
}

// 버튼 체크박스 처리
function initCheckboxButtons() {
    const buttons = document.querySelectorAll('.checkbox-button');

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            button.classList.toggle('checked');

            // 리플 효과
            if (button.classList.contains('ripple-checkbox')) {
                button.classList.remove('checked');
                void button.offsetWidth; // 리플로우 트리거
                button.classList.add('checked');
            }
        });
    });
}

// 선택 가능한 카드 처리
function initSelectableCards() {
    const cards = document.querySelectorAll('.selectable-card');

    cards.forEach((card) => {
        card.addEventListener('click', () => {
            // 다중 선택 허용
            card.classList.toggle('selected');

            // 선택 인디케이터 애니메이션
            const indicator = card.querySelector('.select-indicator');
            if (indicator && card.classList.contains('selected')) {
                indicator.style.animation = 'icon-pop 0.3s ease-out';
                setTimeout(() => {
                    indicator.style.animation = '';
                }, 300);
            }
        });
    });
}

// 일반 체크박스 처리
function initCheckboxes() {
    const checkboxes = document.querySelectorAll('.checkbox-wrapper');

    checkboxes.forEach((wrapper) => {
        const input = wrapper.querySelector('.checkbox-input');
        const box = wrapper.querySelector('.checkbox-box');

        wrapper.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                input.checked = !input.checked;

                // 체크 애니메이션 트리거
                if (input.checked && box) {
                    box.style.animation = 'none';
                    setTimeout(() => {
                        box.style.animation = '';
                    }, 10);
                }
            }
        });
    });
}

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', () => {
    initCheckboxTabs();
    initCheckboxButtons();
    initSelectableCards();
    initCheckboxes();
});

// 외부에서 사용할 수 있도록 전역 객체에 추가
if (typeof window !== 'undefined') {
    window.CheckboxInteraction = {
        initCheckboxTabs,
        initCheckboxButtons,
        initSelectableCards,
        initCheckboxes,
    };
}
