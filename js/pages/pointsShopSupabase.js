/**
 * WAVE SPACE - 포인트 상점 Supabase 연동
 * 포인트 시스템 및 상품 관리
 */

import { supabase } from '../config/supabase.js';
import { authService } from '../services/authService.js';

class PointsShopManager {
    constructor() {
        this.currentUser = null;
        this.shopItems = [];
        this.userPoints = 0;
        this.currentCategory = 'all';
        this.purchaseHistory = [];
        this.isLoading = false;
        this.init();
    }

    async init() {
        try {
            await authService.init();
            this.currentUser = await authService.getCurrentUser();
            
            if (this.currentUser) {
                await this.loadUserPoints();
                await this.loadPurchaseHistory();
            }
            
            this.setupEventListeners();
            await this.loadShopItems();
            this.updateAuthUI();
            this.setupRealtimeSubscription();
        } catch (error) {
            console.error('포인트 상점 초기화 오류:', error);
        }
    }

    setupEventListeners() {
        // 카테고리 필터
        const categoryBtns = document.querySelectorAll('.category-btn, .filter-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category || 'all';
                this.filterByCategory(category);
            });
        });

        // 포인트 충전 버튼
        const chargeBtn = document.querySelector('.charge-points-btn');
        if (chargeBtn) {
            chargeBtn.addEventListener('click', () => this.showChargeModal());
        }

        // 구매 내역 보기
        const historyBtn = document.querySelector('.purchase-history-btn');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => this.showPurchaseHistory());
        }
    }

    async updateAuthUI() {
        const userInfo = document.querySelector('.user-info, .points-info');
        const pointsDisplay = document.querySelector('.user-points, .current-points');

        if (this.currentUser) {
            if (userInfo) {
                userInfo.innerHTML = `
                    <div class="user-profile">
                        <img src="${this.currentUser.profile_image_url || '/assets/default-avatar.png'}" 
                             alt="프로필" class="profile-avatar">
                        <div class="user-details">
                            <span class="username">${this.currentUser.username}</span>
                            <span class="user-points">${this.formatNumber(this.userPoints)} P</span>
                        </div>
                    </div>
                `;
            }

            if (pointsDisplay) {
                pointsDisplay.innerHTML = `
                    <div class="points-summary">
                        <div class="current-points">
                            <span class="points-label">보유 포인트</span>
                            <span class="points-value">${this.formatNumber(this.userPoints)} P</span>
                        </div>
                        <div class="points-actions">
                            <button class="btn btn-primary charge-points-btn" onclick="pointsShopManager.showChargeModal()">
                                <i class="fas fa-plus"></i> 충전
                            </button>
                            <button class="btn btn-secondary purchase-history-btn" onclick="pointsShopManager.showPurchaseHistory()">
                                <i class="fas fa-history"></i> 내역
                            </button>
                        </div>
                    </div>
                `;
            }
        } else {
            // 로그인 필요 메시지
            if (pointsDisplay) {
                pointsDisplay.innerHTML = `
                    <div class="login-required">
                        <p>포인트 상점을 이용하려면 로그인이 필요합니다.</p>
                        <a href="login.html" class="btn btn-primary">로그인</a>
                    </div>
                `;
            }
        }
    }

    async loadUserPoints() {
        if (!this.currentUser) return;

        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('points')
                .eq('id', this.currentUser.id)
                .single();

            if (error) throw error;

            this.userPoints = user.points || 0;
            this.updatePointsDisplay();

        } catch (error) {
            console.error('사용자 포인트 로딩 오류:', error);
        }
    }

    async loadShopItems() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoading();

            let query = supabase
                .from('shop_items')
                .select(`
                    id,
                    name,
                    description,
                    price,
                    category,
                    item_type,
                    image_url,
                    is_available,
                    stock_quantity,
                    purchase_limit,
                    discount_rate,
                    is_featured,
                    created_at
                `)
                .eq('is_available', true)
                .order('is_featured', { ascending: false })
                .order('created_at', { ascending: false });

            if (this.currentCategory !== 'all') {
                query = query.eq('category', this.currentCategory);
            }

            const { data: items, error } = await query;

            if (error) throw error;

            this.shopItems = items || [];
            this.renderShopItems();

        } catch (error) {
            console.error('상점 아이템 로딩 오류:', error);
            this.showError('상점 아이템을 불러올 수 없습니다.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    renderShopItems() {
        const container = document.querySelector('.shop-items, .items-grid');
        if (!container) return;

        if (this.shopItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>상품이 없습니다</h3>
                    <p>곧 새로운 상품이 추가될 예정입니다!</p>
                </div>
            `;
            return;
        }

        const itemsHTML = this.shopItems.map(item => `
            <div class="shop-item ${item.is_featured ? 'featured' : ''}" data-item-id="${item.id}">
                ${item.discount_rate > 0 ? `<div class="discount-badge">${item.discount_rate}% OFF</div>` : ''}
                
                <div class="item-image">
                    <img src="${item.image_url || '/assets/default-item.png'}" alt="${item.name}" />
                    ${item.item_type === 'digital' ? '<div class="digital-badge">디지털</div>' : ''}
                </div>

                <div class="item-content">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-description">${item.description}</p>
                    
                    <div class="item-details">
                        ${item.stock_quantity !== null ? `
                            <div class="stock-info">
                                <i class="fas fa-box"></i>
                                재고: ${item.stock_quantity}개
                            </div>
                        ` : ''}
                        
                        ${item.purchase_limit > 0 ? `
                            <div class="limit-info">
                                <i class="fas fa-exclamation-circle"></i>
                                구매 제한: ${item.purchase_limit}개
                            </div>
                        ` : ''}
                    </div>

                    <div class="item-price">
                        ${item.discount_rate > 0 ? `
                            <span class="original-price">${this.formatNumber(item.price)} P</span>
                            <span class="discounted-price">
                                ${this.formatNumber(Math.floor(item.price * (1 - item.discount_rate / 100)))} P
                            </span>
                        ` : `
                            <span class="price">${this.formatNumber(item.price)} P</span>
                        `}
                    </div>

                    <div class="item-actions">
                        ${this.currentUser ? `
                            <button class="btn btn-primary purchase-btn" 
                                    ${this.canPurchase(item) ? '' : 'disabled'}
                                    onclick="pointsShopManager.purchaseItem('${item.id}')">
                                ${this.getPurchaseButtonText(item)}
                            </button>
                        ` : `
                            <a href="login.html" class="btn btn-primary">
                                로그인 후 구매
                            </a>
                        `}
                        <button class="btn btn-secondary wishlist-btn" 
                                onclick="pointsShopManager.toggleWishlist('${item.id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = itemsHTML;
    }

    async purchaseItem(itemId) {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        const item = this.shopItems.find(i => i.id === itemId);
        if (!item) return;

        const finalPrice = item.discount_rate > 0 
            ? Math.floor(item.price * (1 - item.discount_rate / 100))
            : item.price;

        if (this.userPoints < finalPrice) {
            alert('포인트가 부족합니다.');
            return;
        }

        if (!confirm(`${item.name}을(를) ${this.formatNumber(finalPrice)} P로 구매하시겠습니까?`)) {
            return;
        }

        try {
            // 구매 트랜잭션 실행
            const { data, error } = await supabase.rpc('purchase_item', {
                p_user_id: this.currentUser.id,
                p_item_id: itemId,
                p_quantity: 1,
                p_final_price: finalPrice
            });

            if (error) throw error;

            // 성공 처리
            this.userPoints -= finalPrice;
            this.updatePointsDisplay();
            await this.loadPurchaseHistory();
            this.showSuccess('구매가 완료되었습니다!');

            // 아이템이 재고 제한이 있다면 목록 새로고침
            if (item.stock_quantity !== null) {
                await this.loadShopItems();
            }

        } catch (error) {
            console.error('구매 처리 오류:', error);
            if (error.message.includes('insufficient_points')) {
                this.showError('포인트가 부족합니다.');
            } else if (error.message.includes('out_of_stock')) {
                this.showError('재고가 부족합니다.');
            } else if (error.message.includes('purchase_limit_exceeded')) {
                this.showError('구매 제한을 초과했습니다.');
            } else {
                this.showError('구매 처리 중 오류가 발생했습니다.');
            }
        }
    }

    async loadPurchaseHistory() {
        if (!this.currentUser) return;

        try {
            const { data: history, error } = await supabase
                .from('point_transactions')
                .select(`
                    id,
                    transaction_type,
                    points,
                    description,
                    created_at,
                    shop_items (name, image_url)
                `)
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            this.purchaseHistory = history || [];

        } catch (error) {
            console.error('구매 내역 로딩 오류:', error);
        }
    }

    showPurchaseHistory() {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        const historyHTML = this.purchaseHistory.map(transaction => `
            <div class="transaction-item ${transaction.transaction_type}">
                <div class="transaction-info">
                    <div class="transaction-type">
                        ${this.getTransactionIcon(transaction.transaction_type)}
                        ${this.getTransactionTypeLabel(transaction.transaction_type)}
                    </div>
                    <div class="transaction-description">${transaction.description}</div>
                </div>
                <div class="transaction-points ${transaction.points > 0 ? 'positive' : 'negative'}">
                    ${transaction.points > 0 ? '+' : ''}${this.formatNumber(transaction.points)} P
                </div>
                <div class="transaction-date">
                    ${this.formatDate(transaction.created_at)}
                </div>
            </div>
        `).join('');

        const modalHTML = `
            <div class="history-modal" id="historyModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>포인트 사용 내역</h3>
                        <button class="modal-close" onclick="pointsShopManager.closeHistoryModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="history-list">
                            ${historyHTML || '<p class="empty-message">거래 내역이 없습니다.</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('historyModal').style.display = 'flex';
    }

    closeHistoryModal() {
        const modal = document.getElementById('historyModal');
        if (modal) {
            modal.remove();
        }
    }

    showChargeModal() {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login.html';
            return;
        }

        // 포인트 충전 페이지로 이동
        window.location.href = 'points-charge.html';
    }

    async toggleWishlist(itemId) {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const { data: wishlist, error: checkError } = await supabase
                .from('user_wishlist')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('item_id', itemId)
                .single();

            if (wishlist) {
                // 위시리스트에서 제거
                const { error } = await supabase
                    .from('user_wishlist')
                    .delete()
                    .eq('user_id', this.currentUser.id)
                    .eq('item_id', itemId);

                if (error) throw error;
                this.showSuccess('위시리스트에서 제거했습니다.');
            } else {
                // 위시리스트에 추가
                const { error } = await supabase
                    .from('user_wishlist')
                    .insert({
                        user_id: this.currentUser.id,
                        item_id: itemId,
                        created_at: new Date().toISOString()
                    });

                if (error) throw error;
                this.showSuccess('위시리스트에 추가했습니다.');
            }

            // UI 업데이트
            this.updateWishlistUI(itemId);

        } catch (error) {
            console.error('위시리스트 처리 오류:', error);
            this.showError('위시리스트 처리 중 오류가 발생했습니다.');
        }
    }

    updateWishlistUI(itemId) {
        const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
        const wishlistBtn = itemElement?.querySelector('.wishlist-btn');
        
        if (wishlistBtn) {
            wishlistBtn.classList.toggle('active');
            const icon = wishlistBtn.querySelector('i');
            if (icon.classList.contains('fas')) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            } else {
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
        }
    }

    async filterByCategory(category) {
        this.currentCategory = category;
        
        // 필터 버튼 활성화 업데이트
        document.querySelectorAll('.category-btn, .filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        await this.loadShopItems();
    }

    setupRealtimeSubscription() {
        // 실시간 포인트 변경 알림
        if (this.currentUser) {
            const pointsChannel = supabase
                .channel(`user-points-${this.currentUser.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'users',
                        filter: `id=eq.${this.currentUser.id}`
                    },
                    (payload) => {
                        console.log('포인트 변경:', payload.new);
                        this.handlePointsUpdate(payload.new);
                    }
                )
                .subscribe();
        }

        // 실시간 상점 아이템 업데이트
        const shopChannel = supabase
            .channel('shop-items')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'shop_items'
                },
                (payload) => {
                    console.log('상점 아이템 업데이트:', payload);
                    this.handleShopUpdate(payload);
                }
            )
            .subscribe();
    }

    handlePointsUpdate(updatedUser) {
        this.userPoints = updatedUser.points || 0;
        this.updatePointsDisplay();
        
        // 포인트 변경 알림
        this.showNotification(`포인트가 업데이트되었습니다: ${this.formatNumber(this.userPoints)} P`);
    }

    handleShopUpdate(payload) {
        // 상점 아이템 실시간 업데이트
        if (payload.eventType === 'INSERT' && payload.new.is_available) {
            this.showNotification('새로운 상품이 추가되었습니다!');
            this.loadShopItems();
        } else if (payload.eventType === 'UPDATE') {
            const index = this.shopItems.findIndex(item => item.id === payload.new.id);
            if (index !== -1) {
                this.shopItems[index] = payload.new;
                this.renderShopItems();
            }
        }
    }

    updatePointsDisplay() {
        const pointsElements = document.querySelectorAll('.user-points, .points-value');
        pointsElements.forEach(el => {
            el.textContent = `${this.formatNumber(this.userPoints)} P`;
        });

        // 구매 버튼 상태 업데이트
        document.querySelectorAll('.purchase-btn').forEach(btn => {
            const itemElement = btn.closest('.shop-item');
            const itemId = itemElement.dataset.itemId;
            const item = this.shopItems.find(i => i.id === itemId);
            
            if (item) {
                const canPurchase = this.canPurchase(item);
                btn.disabled = !canPurchase;
                btn.textContent = this.getPurchaseButtonText(item);
            }
        });
    }

    canPurchase(item) {
        if (!this.currentUser) return false;
        if (!item.is_available) return false;
        if (item.stock_quantity !== null && item.stock_quantity <= 0) return false;
        
        const finalPrice = item.discount_rate > 0 
            ? Math.floor(item.price * (1 - item.discount_rate / 100))
            : item.price;
            
        return this.userPoints >= finalPrice;
    }

    getPurchaseButtonText(item) {
        if (!item.is_available) return '판매 중단';
        if (item.stock_quantity !== null && item.stock_quantity <= 0) return '품절';
        if (!this.canPurchase(item)) return '포인트 부족';
        return '구매하기';
    }

    getTransactionIcon(type) {
        const icons = {
            'purchase': '<i class="fas fa-shopping-cart"></i>',
            'charge': '<i class="fas fa-plus-circle"></i>',
            'reward': '<i class="fas fa-gift"></i>',
            'bonus': '<i class="fas fa-star"></i>',
            'refund': '<i class="fas fa-undo"></i>'
        };
        return icons[type] || '<i class="fas fa-circle"></i>';
    }

    getTransactionTypeLabel(type) {
        const labels = {
            'purchase': '구매',
            'charge': '충전',
            'reward': '보상',
            'bonus': '보너스',
            'refund': '환불'
        };
        return labels[type] || '기타';
    }

    // 유틸리티 함수들
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toLocaleString();
    }

    showLoading() {
        const loadingEl = document.querySelector('.loading, .shop-loading');
        if (loadingEl) {
            loadingEl.style.display = 'block';
        }
    }

    hideLoading() {
        const loadingEl = document.querySelector('.loading, .shop-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    showError(message) {
        if (window.notificationService) {
            window.notificationService.showToast(message, 'error');
        } else {
            alert(`오류: ${message}`);
        }
    }

    showSuccess(message) {
        if (window.notificationService) {
            window.notificationService.showToast(message, 'success');
        } else {
            alert(`성공: ${message}`);
        }
    }

    showNotification(message) {
        if (window.notificationService) {
            window.notificationService.showToast(message, 'info');
        }
    }
}

// 전역 인스턴스 생성
window.pointsShopManager = new PointsShopManager();

// 기존 points-shop.js와의 호환성을 위한 전역 함수들
window.purchaseItem = (itemId) => window.pointsShopManager.purchaseItem(itemId);
window.toggleWishlist = (itemId) => window.pointsShopManager.toggleWishlist(itemId);
window.filterByCategory = (category) => window.pointsShopManager.filterByCategory(category);
window.showChargeModal = () => window.pointsShopManager.showChargeModal();
window.showPurchaseHistory = () => window.pointsShopManager.showPurchaseHistory();