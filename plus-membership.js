// 요금제 토글
const pricingToggle = document.getElementById('pricingToggle');
const toggleLabels = document.querySelectorAll('.toggle-label');
const priceAmounts = document.querySelectorAll('.amount');

// 토글 버튼 클릭 이벤트
pricingToggle.addEventListener('click', function () {
    this.classList.toggle('active');

    // 레이블 활성화 상태 변경
    toggleLabels.forEach((label) => {
        label.classList.toggle('active');
    });

    // 가격 변경
    const isYearly = this.classList.contains('active');
    priceAmounts.forEach((amount) => {
        const monthlyPrice = amount.dataset.monthly;
        const yearlyPrice = amount.dataset.yearly;

        if (isYearly && yearlyPrice) {
            amount.textContent = yearlyPrice;
            // 연간 결제 시 월 단위로 표시
            const period = amount.nextElementSibling;
            if (period) {
                period.textContent = '/년';
            }
        } else if (monthlyPrice) {
            amount.textContent = monthlyPrice;
            const period = amount.nextElementSibling;
            if (period) {
                period.textContent = '/월';
            }
        }
    });
});

// FAQ 토글
const faqItems = document.querySelectorAll('.membership-faq .faq-item');

faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
        // 다른 FAQ 닫기
        faqItems.forEach((otherItem) => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });

        // 현재 FAQ 토글
        item.classList.toggle('active');
    });
});

// 부드러운 스크롤
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    });
});

// 가입 버튼 클릭 이벤트
const joinButtons = document.querySelectorAll('.join-btn, .cta-btn');
const selectButtons = document.querySelectorAll('.select-btn');

joinButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        if (window.showInfoMessage) {
            showInfoMessage('Plus 멤버십 가입 페이지로 이동합니다.');
        } else {
            alert('Plus 멤버십 가입 페이지로 이동합니다.');
        }
    });
});

selectButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        const card = btn.closest('.pricing-card');
        const planName = card.querySelector('h3').textContent;

        if (planName === 'Enterprise') {
            if (window.showInfoMessage) {
                showInfoMessage('Enterprise 플랜 문의 페이지로 이동합니다.');
            } else {
                alert('Enterprise 플랜 문의 페이지로 이동합니다.');
            }
        } else {
            if (window.showSuccessMessage) {
                showSuccessMessage(`${planName} 플랜을 선택하셨습니다. 결제 페이지로 이동합니다.`);
            } else {
                alert(`${planName} 플랜을 선택하셨습니다. 결제 페이지로 이동합니다.`);
            }
        }
    });
});

// 스크롤 애니메이션
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 애니메이션 대상 요소들
const animatedElements = document.querySelectorAll('.benefit-card, .pricing-card');

animatedElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(el);
});
