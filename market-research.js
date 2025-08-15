// 시장조사서 페이지 JavaScript - PRD 요구사항 완전 구현

document.addEventListener('DOMContentLoaded', function() {
    
    // ===========================================
    // 1. 전역 데이터 정의
    // ===========================================
    
    // 지역별 시/군/구 데이터 (전국)
    const regionData = {
        '서울': {
            districts: ['강남구', '서초구', '송파구', '강동구', '마포구', '용산구', '성동구', '광진구', '종로구', '중구', '영등포구', '동작구', '관악구', '서대문구', '은평구', '노원구', '도봉구', '강북구', '성북구', '중랑구', '동대문구', '광진구', '구로구', '금천구', '양천구', '강서구'],
            documentCount: 156
        },
        '부산': {
            districts: ['해운대구', '수영구', '남구', '동래구', '부산진구', '사하구', '강서구', '기장군', '중구', '서구', '동구', '영도구', '사상구', '북구', '금정구', '연제구'],
            documentCount: 87
        },
        '대구': {
            districts: ['수성구', '중구', '동구', '북구', '달서구', '달성군', '남구', '서구'],
            documentCount: 45
        },
        '인천': {
            districts: ['연수구', '남동구', '서구', '중구', '미추홀구', '부평구', '계양구', '동구', '강화군', '옹진군'],
            documentCount: 62
        },
        '광주': {
            districts: ['서구', '북구', '광산구', '남구', '동구'],
            documentCount: 28
        },
        '대전': {
            districts: ['유성구', '서구', '중구', '동구', '대덕구'],
            documentCount: 31
        },
        '울산': {
            districts: ['남구', '중구', '동구', '북구', '울주군'],
            documentCount: 24
        },
        '세종': {
            districts: ['세종시'],
            documentCount: 18
        },
        '경기': {
            districts: ['성남시', '수원시', '용인시', '고양시', '화성시', '남양주시', '부천시', '안산시', '평택시', '시흥시', '김포시', '광명시', '광주시', '군포시', '이천시', '양주시', '안성시', '포천시', '의왕시', '여주시', '양평군', '동두천시', '과천시', '구리시', '오산시', '하남시', '파주시', '의정부시', '가평군', '연천군'],
            documentCount: 243
        },
        '강원': {
            districts: ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군'],
            documentCount: 35
        },
        '충북': {
            districts: ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'],
            documentCount: 22
        },
        '충남': {
            districts: ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군'],
            documentCount: 38
        },
        '전북': {
            districts: ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'],
            documentCount: 27
        },
        '전남': {
            districts: ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군'],
            documentCount: 31
        },
        '경북': {
            districts: ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '군위군', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군'],
            documentCount: 42
        },
        '경남': {
            districts: ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군'],
            documentCount: 51
        },
        '제주': {
            districts: ['제주시', '서귀포시'],
            documentCount: 23
        }
    };

    // 상품 유형 데이터 (PRD 8개 유형)
    const productTypes = [
        { id: 'apartment', name: '아파트', color: '#3b82f6' },
        { id: 'officetel', name: '오피스텔', color: '#8b5cf6' },
        { id: 'commercial', name: '상가', color: '#ec4899' },
        { id: 'knowledge', name: '지식산업센터', color: '#10b981' },
        { id: 'urban', name: '도시형생활주택', color: '#f59e0b' },
        { id: 'studio', name: '원룸/투룸', color: '#ef4444' },
        { id: 'villa', name: '빌라/연립', color: '#06b6d4' },
        { id: 'land', name: '토지', color: '#84cc16' }
    ];

    // 샘플 문서 데이터 (실제는 서버에서 가져옴)
    const sampleDocuments = [
        {
            id: 1,
            title: '강남구 삼성동 아파트 시장조사서',
            type: 'apartment',
            region: '서울',
            district: '강남구',
            location: '서울 강남구 삼성동',
            date: '2024.01.15',
            fileSize: '12.5MB',
            fileType: 'PDF',
            pages: 45,
            views: 234,
            downloads: 45,
            points: 500,
            isPremium: false,
            author: '김분석',
            description: '삼성동 일대 아파트 시장 동향 및 가격 분석'
        },
        {
            id: 2,
            title: '판교 테크노밸리 오피스텔 시장분석',
            type: 'officetel',
            region: '경기',
            district: '성남시',
            location: '경기 성남시 분당구',
            date: '2024.01.14',
            fileSize: '8.3MB',
            fileType: 'PPT',
            pages: 32,
            views: 189,
            downloads: 32,
            points: 300,
            isPremium: true,
            author: '이전문',
            description: '판교 테크노밸리 오피스텔 투자 가치 분석'
        }
        // 더 많은 샘플 데이터...
    ];

    // 사용자 데이터 (localStorage에서 가져옴)
    let userData = {
        isVerified: localStorage.getItem('userVerified') === 'true',
        isPlusMember: localStorage.getItem('userPlusMember') === 'true',
        points: parseInt(localStorage.getItem('userPoints') || '1250'),
        recentSearches: JSON.parse(localStorage.getItem('recentSearches') || '[]'),
        downloadHistory: JSON.parse(localStorage.getItem('downloadHistory') || '[]')
    };

    // ===========================================
    // 2. 지도 기능 구현
    // ===========================================
    
    let selectedRegion = null;
    let selectedDistricts = [];
    let selectedProductTypes = ['all'];
    
    // 지도 초기화
    function initializeMap() {
        const mapContainer = document.querySelector('.korea-map');
        if (!mapContainer) return;
        
        // 지도 HTML 생성 (SVG 또는 이미지맵 사용)
        let mapHTML = '<div class="map-regions">';
        
        Object.keys(regionData).forEach(region => {
            const data = regionData[region];
            mapHTML += `
                <div class="region-marker" data-region="${region}" data-count="${data.documentCount}">
                    <span class="region-name">${region}</span>
                    <span class="doc-count">${data.documentCount}</span>
                </div>
            `;
        });
        
        mapHTML += '</div>';
        mapContainer.innerHTML = mapHTML;
        
        // 지역 마커 이벤트 리스너
        document.querySelectorAll('.region-marker').forEach(marker => {
            marker.addEventListener('click', function() {
                selectRegion(this.dataset.region);
            });
        });
    }
    
    // 지역 선택
    function selectRegion(region) {
        selectedRegion = region;
        selectedDistricts = [];
        
        // 지역 마커 활성화
        document.querySelectorAll('.region-marker').forEach(marker => {
            marker.classList.remove('active');
            if (marker.dataset.region === region) {
                marker.classList.add('active');
            }
        });
        
        // 지역 정보 업데이트
        updateRegionInfo(region);
        
        // 세부 지역 체크박스 생성
        createDistrictCheckboxes(region);
        
        // 문서 필터링
        filterDocuments();
    }
    
    // 지역 정보 업데이트
    function updateRegionInfo(region) {
        const regionName = document.querySelector('.region-name');
        const totalDocs = document.querySelector('.stat-value');
        
        if (regionName) {
            regionName.textContent = region ? `${region} 지역` : '전체 지역';
        }
        
        if (totalDocs && region && regionData[region]) {
            totalDocs.textContent = `${regionData[region].documentCount}개`;
        }
    }
    
    // 세부 지역 체크박스 생성
    function createDistrictCheckboxes(region) {
        const container = document.createElement('div');
        container.className = 'district-checkboxes';
        
        if (region && regionData[region]) {
            const districts = regionData[region].districts;
            
            let checkboxHTML = '<div class="district-grid">';
            districts.forEach(district => {
                checkboxHTML += `
                    <label class="district-checkbox">
                        <input type="checkbox" value="${district}" data-region="${region}">
                        <span class="checkbox-box"></span>
                        <span class="checkbox-label">${district}</span>
                    </label>
                `;
            });
            checkboxHTML += '</div>';
            
            container.innerHTML = checkboxHTML;
            
            // 기존 체크박스 영역 교체
            const existingContainer = document.querySelector('.district-checkboxes');
            if (existingContainer) {
                existingContainer.replaceWith(container);
            } else {
                const mapSection = document.querySelector('.map-section');
                if (mapSection) {
                    mapSection.appendChild(container);
                }
            }
            
            // 체크박스 이벤트 리스너
            container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        selectedDistricts.push(this.value);
                    } else {
                        selectedDistricts = selectedDistricts.filter(d => d !== this.value);
                    }
                    filterDocuments();
                });
            });
        }
    }
    
    // ===========================================
    // 3. 상품 유형 필터 구현
    // ===========================================
    
    // 상품 유형 필터 초기화
    function initializeProductFilters() {
        const checkboxTabs = document.querySelector('.checkbox-tabs');
        if (!checkboxTabs) return;
        
        // 8개 상품 유형 추가
        let filterHTML = `
            <label class="checkbox-tab active" data-filter="all">
                <input type="radio" name="research-filter" checked>
                <span class="tab-check"></span>
                <span>전체</span>
            </label>
        `;
        
        productTypes.forEach(type => {
            filterHTML += `
                <label class="checkbox-tab" data-filter="${type.id}">
                    <input type="radio" name="research-filter">
                    <span class="tab-check"></span>
                    <span>${type.name}</span>
                </label>
            `;
        });
        
        checkboxTabs.innerHTML = filterHTML;
        
        // 필터 이벤트 리스너
        checkboxTabs.querySelectorAll('.checkbox-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const filter = this.dataset.filter;
                
                // 활성화 상태 변경
                checkboxTabs.querySelectorAll('.checkbox-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // 필터 적용
                selectedProductTypes = filter === 'all' ? ['all'] : [filter];
                filterDocuments();
            });
        });
    }
    
    // ===========================================
    // 4. 문서 필터링 및 검색
    // ===========================================
    
    function filterDocuments() {
        const searchKeyword = document.getElementById('searchInput')?.value.toLowerCase() || '';
        
        let filteredDocs = [...sampleDocuments];
        
        // 지역 필터
        if (selectedRegion) {
            filteredDocs = filteredDocs.filter(doc => doc.region === selectedRegion);
            
            // 세부 지역 필터
            if (selectedDistricts.length > 0) {
                filteredDocs = filteredDocs.filter(doc => 
                    selectedDistricts.includes(doc.district)
                );
            }
        }
        
        // 상품 유형 필터
        if (!selectedProductTypes.includes('all')) {
            filteredDocs = filteredDocs.filter(doc => 
                selectedProductTypes.includes(doc.type)
            );
        }
        
        // 키워드 검색
        if (searchKeyword) {
            filteredDocs = filteredDocs.filter(doc => 
                doc.title.toLowerCase().includes(searchKeyword) ||
                doc.location.toLowerCase().includes(searchKeyword) ||
                doc.description.toLowerCase().includes(searchKeyword)
            );
        }
        
        // 결과 표시
        displayDocuments(filteredDocs);
    }
    
    // 문서 표시
    function displayDocuments(documents) {
        const grid = document.getElementById('documentGrid');
        if (!grid) return;
        
        if (documents.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>검색 결과가 없습니다.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        documents.forEach(doc => {
            const typeInfo = productTypes.find(t => t.id === doc.type);
            html += `
                <div class="document-card" data-id="${doc.id}">
                    <div class="document-header">
                        <span class="document-type" style="background: ${typeInfo?.color || '#666'}">
                            ${typeInfo?.name || '기타'}
                        </span>
                        ${doc.isPremium ? '<span class="premium-badge">Plus</span>' : ''}
                        <div class="document-menu">
                            <button class="menu-btn">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                    </div>
                    <h3 class="document-title">${doc.title}</h3>
                    <p class="document-description">${doc.description}</p>
                    <div class="document-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${doc.location}</span>
                    </div>
                    <div class="document-info">
                        <span class="info-item">
                            <i class="fas fa-file"></i> ${doc.fileType}
                        </span>
                        <span class="info-item">
                            <i class="fas fa-hdd"></i> ${doc.fileSize}
                        </span>
                        <span class="info-item">
                            <i class="fas fa-file-alt"></i> ${doc.pages}페이지
                        </span>
                    </div>
                    <div class="document-meta">
                        <span class="document-date">${doc.date}</span>
                        <div class="document-stats">
                            <span class="stat">
                                <i class="fas fa-eye"></i> ${doc.views}
                            </span>
                            <span class="stat">
                                <i class="fas fa-download"></i> ${doc.downloads}
                            </span>
                            <span class="stat points">
                                <i class="fas fa-coins"></i> ${doc.points}P
                            </span>
                        </div>
                    </div>
                    <div class="document-actions">
                        <button class="btn-preview" data-id="${doc.id}">
                            <i class="fas fa-eye"></i> 미리보기
                        </button>
                        <button class="btn-download ${doc.isPremium ? 'premium' : ''}" data-id="${doc.id}" data-points="${doc.points}">
                            <i class="fas fa-download"></i> 다운로드
                        </button>
                    </div>
                </div>
            `;
        });
        
        grid.innerHTML = html;
        
        // 액션 버튼 이벤트 리스너 재등록
        attachDocumentActions();
    }
    
    // ===========================================
    // 5. 권한 체크 및 포인트 시스템
    // ===========================================
    
    function checkUserPermissions() {
        // 실무자 인증 체크
        if (!userData.isVerified) {
            return {
                allowed: false,
                reason: '실무자 인증이 필요합니다.',
                action: 'verification'
            };
        }
        
        return { allowed: true };
    }
    
    function checkPointRequirement(requiredPoints) {
        if (userData.points < requiredPoints) {
            return {
                allowed: false,
                reason: `포인트가 부족합니다. (필요: ${requiredPoints}P, 보유: ${userData.points}P)`,
                action: 'charge'
            };
        }
        
        return { allowed: true };
    }
    
    function deductPoints(amount) {
        userData.points -= amount;
        localStorage.setItem('userPoints', userData.points);
        
        // UI 업데이트
        const pointsDisplay = document.querySelector('.user-points');
        if (pointsDisplay) {
            pointsDisplay.textContent = `• ${userData.points}P`;
        }
    }
    
    // ===========================================
    // 6. 문서 액션 (다운로드, 미리보기)
    // ===========================================
    
    function attachDocumentActions() {
        // 다운로드 버튼
        document.querySelectorAll('.btn-download').forEach(btn => {
            btn.addEventListener('click', handleDownload);
        });
        
        // 미리보기 버튼
        document.querySelectorAll('.btn-preview').forEach(btn => {
            btn.addEventListener('click', handlePreview);
        });
    }
    
    function handleDownload(e) {
        e.preventDefault();
        
        const docId = this.dataset.id;
        const requiredPoints = parseInt(this.dataset.points);
        const isPremium = this.classList.contains('premium');
        
        // Plus 멤버십 체크
        if (isPremium && !userData.isPlusMember) {
            if (confirm('Plus Membership 가입이 필요합니다.\n가입 페이지로 이동하시겠습니까?')) {
                window.location.href = 'plus-membership.html';
            }
            return;
        }
        
        // 권한 체크
        const permissionCheck = checkUserPermissions();
        if (!permissionCheck.allowed) {
            if (confirm(`${permissionCheck.reason}\n인증 페이지로 이동하시겠습니까?`)) {
                window.location.href = 'verification.html';
            }
            return;
        }
        
        // 포인트 체크
        const pointCheck = checkPointRequirement(requiredPoints);
        if (!pointCheck.allowed) {
            if (confirm(`${pointCheck.reason}\n충전 페이지로 이동하시겠습니까?`)) {
                window.location.href = 'point-charge.html';
            }
            return;
        }
        
        // 다운로드 확인
        if (confirm(`${requiredPoints} 포인트를 사용하여 다운로드하시겠습니까?`)) {
            // 포인트 차감
            deductPoints(requiredPoints);
            
            // 다운로드 기록 저장
            const downloadRecord = {
                docId: docId,
                date: new Date().toISOString(),
                points: requiredPoints
            };
            userData.downloadHistory.push(downloadRecord);
            localStorage.setItem('downloadHistory', JSON.stringify(userData.downloadHistory));
            
            // 다운로드 카운트 증가
            const card = this.closest('.document-card');
            const downloadStat = card.querySelector('.stat:nth-child(2)');
            if (downloadStat) {
                const count = parseInt(downloadStat.textContent.match(/\d+/)[0]) + 1;
                downloadStat.innerHTML = `<i class="fas fa-download"></i> ${count}`;
            }
            
            // 다운로드 시작
            alert('다운로드가 시작되었습니다.');
            // 실제 파일 다운로드 로직
        }
    }
    
    function handlePreview(e) {
        e.preventDefault();
        
        const docId = this.dataset.id;
        const doc = sampleDocuments.find(d => d.id == docId);
        
        if (!doc) return;
        
        // 조회수 증가
        const card = this.closest('.document-card');
        const viewStat = card.querySelector('.stat:first-child');
        if (viewStat) {
            const count = parseInt(viewStat.textContent.match(/\d+/)[0]) + 1;
            viewStat.innerHTML = `<i class="fas fa-eye"></i> ${count}`;
        }
        
        // 미리보기 모달 표시
        showPreviewModal(doc);
    }
    
    function showPreviewModal(doc) {
        // 미리보기 모달 HTML 생성
        const modal = document.createElement('div');
        modal.className = 'preview-modal';
        modal.innerHTML = `
            <div class="preview-content">
                <div class="preview-header">
                    <h2>${doc.title}</h2>
                    <button class="preview-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="preview-body">
                    <div class="preview-info">
                        <p><strong>위치:</strong> ${doc.location}</p>
                        <p><strong>작성일:</strong> ${doc.date}</p>
                        <p><strong>작성자:</strong> ${doc.author}</p>
                        <p><strong>파일:</strong> ${doc.fileType} / ${doc.fileSize} / ${doc.pages}페이지</p>
                    </div>
                    <div class="preview-description">
                        <h3>문서 설명</h3>
                        <p>${doc.description}</p>
                    </div>
                    <div class="preview-sample">
                        <h3>미리보기</h3>
                        <p>문서의 처음 2페이지만 미리보기로 제공됩니다.</p>
                        <div class="sample-content">
                            <!-- 실제 미리보기 내용 -->
                            <img src="sample-page-1.jpg" alt="미리보기 1페이지">
                            <img src="sample-page-2.jpg" alt="미리보기 2페이지">
                        </div>
                    </div>
                </div>
                <div class="preview-footer">
                    <button class="btn-download-modal" data-id="${doc.id}" data-points="${doc.points}">
                        <i class="fas fa-download"></i>
                        ${doc.points}P로 다운로드
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 모달 닫기 이벤트
        modal.querySelector('.preview-close').addEventListener('click', () => {
            modal.remove();
        });
        
        // 모달 외부 클릭시 닫기
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // 다운로드 버튼
        modal.querySelector('.btn-download-modal').addEventListener('click', handleDownload);
    }
    
    // ===========================================
    // 7. 최근 검색 기록 관리
    // ===========================================
    
    function addToRecentSearches(keyword) {
        if (!keyword) return;
        
        // 중복 제거
        userData.recentSearches = userData.recentSearches.filter(s => s !== keyword);
        
        // 최신 검색어를 앞에 추가
        userData.recentSearches.unshift(keyword);
        
        // 최대 10개까지만 저장
        if (userData.recentSearches.length > 10) {
            userData.recentSearches = userData.recentSearches.slice(0, 10);
        }
        
        // localStorage 저장
        localStorage.setItem('recentSearches', JSON.stringify(userData.recentSearches));
        
        // UI 업데이트
        displayRecentSearches();
    }
    
    function displayRecentSearches() {
        const container = document.querySelector('.recent-searches');
        if (!container) return;
        
        let html = '<h4>최근 검색어</h4><div class="recent-tags">';
        
        userData.recentSearches.slice(0, 5).forEach(keyword => {
            html += `
                <span class="recent-tag" data-keyword="${keyword}">
                    ${keyword}
                    <button class="tag-remove">
                        <i class="fas fa-times"></i>
                    </button>
                </span>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // 이벤트 리스너
        container.querySelectorAll('.recent-tag').forEach(tag => {
            // 태그 클릭시 검색
            tag.addEventListener('click', function(e) {
                if (!e.target.classList.contains('tag-remove')) {
                    const keyword = this.dataset.keyword;
                    document.getElementById('searchInput').value = keyword;
                    performSearch(keyword);
                }
            });
            
            // 삭제 버튼
            tag.querySelector('.tag-remove').addEventListener('click', function(e) {
                e.stopPropagation();
                const keyword = tag.dataset.keyword;
                userData.recentSearches = userData.recentSearches.filter(s => s !== keyword);
                localStorage.setItem('recentSearches', JSON.stringify(userData.recentSearches));
                tag.remove();
            });
        });
    }
    
    // ===========================================
    // 8. 검색 기능
    // ===========================================
    
    function performSearch(keyword) {
        if (!keyword) return;
        
        // 최근 검색어에 추가
        addToRecentSearches(keyword);
        
        // 필터링 적용
        filterDocuments();
    }
    
    // 검색 입력 이벤트
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value.trim());
            }
        });
    }
    
    // ===========================================
    // 9. 업로드 기능
    // ===========================================
    
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    const modalClose = document.getElementById('modalClose');
    const cancelBtn = document.getElementById('cancelBtn');
    const submitBtn = document.getElementById('submitBtn');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    
    let selectedFile = null;
    
    // 업로드 버튼 클릭
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            // 실무자 인증 체크
            const permissionCheck = checkUserPermissions();
            if (!permissionCheck.allowed) {
                if (confirm(`${permissionCheck.reason}\n인증 페이지로 이동하시겠습니까?`)) {
                    window.location.href = 'verification.html';
                }
                return;
            }
            
            uploadModal.classList.add('active');
        });
    }
    
    // 모달 닫기
    function closeUploadModal() {
        uploadModal.classList.remove('active');
        selectedFile = null;
        document.getElementById('uploadForm').reset();
    }
    
    if (modalClose) modalClose.addEventListener('click', closeUploadModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeUploadModal);
    
    // 파일 업로드 영역
    if (fileUploadArea) {
        fileUploadArea.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function(e) {
            handleFileSelect(e.target.files);
        });
        
        // 드래그 앤 드롭
        fileUploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        fileUploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
        });
        
        fileUploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            handleFileSelect(e.dataTransfer.files);
        });
    }
    
    function handleFileSelect(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        const maxSize = 50 * 1024 * 1024; // 50MB
        
        // 파일 크기 체크
        if (file.size > maxSize) {
            alert('파일 크기는 50MB를 초과할 수 없습니다.');
            return;
        }
        
        // 파일 형식 체크
        const allowedTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx'];
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExt)) {
            alert('PDF, PPT, DOC, XLS 파일만 업로드 가능합니다.');
            return;
        }
        
        selectedFile = file;
        
        // 파일 정보 표시
        const uploadText = fileUploadArea.querySelector('.upload-text');
        const uploadHint = fileUploadArea.querySelector('.upload-hint');
        
        uploadText.textContent = file.name;
        uploadHint.textContent = `${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }
    
    // 업로드 제출
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            const title = document.getElementById('documentTitle').value;
            const type = document.getElementById('documentType').value;
            const location = document.getElementById('documentLocation').value;
            
            if (!title || !type || !location) {
                alert('필수 항목을 모두 입력해주세요.');
                return;
            }
            
            if (!selectedFile) {
                alert('파일을 선택해주세요.');
                return;
            }
            
            // 업로드 처리 (실제는 서버로 전송)
            console.log('업로드 데이터:', {
                title,
                type,
                location,
                file: selectedFile
            });
            
            // 성공 메시지
            alert('시장조사서가 성공적으로 업로드되었습니다.\n검토 후 100P가 지급됩니다.');
            
            // 포인트 지급 (시뮬레이션)
            userData.points += 100;
            localStorage.setItem('userPoints', userData.points);
            
            closeUploadModal();
        });
    }
    
    // ===========================================
    // 10. 초기화
    // ===========================================
    
    function initialize() {
        console.log('시장조사서 페이지 초기화 시작');
        
        // 지도 초기화
        initializeMap();
        
        // 상품 유형 필터 초기화
        initializeProductFilters();
        
        // 최근 검색어 표시
        displayRecentSearches();
        
        // 초기 문서 표시
        displayDocuments(sampleDocuments);
        
        console.log('시장조사서 페이지 초기화 완료');
    }
    
    // 페이지 로드시 초기화
    initialize();
    
    // ===========================================
    // 11. Nav-Selector 이벤트 핸들러 추가
    // ===========================================
    
    // 지역 선택 nav-selector 이벤트
    const regionNavSelectors = document.querySelectorAll('.filter-row:first-of-type .nav-selector');
    regionNavSelectors.forEach(selector => {
        selector.addEventListener('click', function() {
            // 이전 선택 제거
            regionNavSelectors.forEach(s => s.classList.remove('selected'));
            // 현재 선택 추가
            this.classList.add('selected');
            
            const selectedValue = this.dataset.value;
            const selectedText = this.querySelector('span').textContent;
            
            // 시군구 표시 처리
            if (selectedValue !== 'all' && regionData[selectedText]) {
                showSubRegions(selectedText);
                updateSelectedRegions(selectedText);
            } else {
                hideSubRegions();
                hideSelectedRegions();
            }
            
            // 문서 필터링
            filterDocuments();
        });
    });
    
    // 상품유형 선택 nav-selector 이벤트
    const productNavSelectors = document.querySelectorAll('.filter-row:nth-of-type(2) .nav-selector');
    productNavSelectors.forEach(selector => {
        selector.addEventListener('click', function() {
            // 이전 선택 제거
            productNavSelectors.forEach(s => s.classList.remove('selected'));
            // 현재 선택 추가
            this.classList.add('selected');
            
            // 문서 필터링
            filterDocuments();
        });
    });
});

// 미리보기 팝업 함수 - 전역 스코프에 정의
window.openPreview = function(docId) {
    console.log('openPreview 호출됨, docId:', docId);
    const modal = document.getElementById('previewModal');
    
    if (!modal) {
        console.error('미리보기 모달을 찾을 수 없습니다');
        alert('미리보기 모달을 찾을 수 없습니다');
        return;
    }
    
    // 모달 표시 - 강제로 스타일 적용
    modal.style.display = 'block';
    modal.classList.add('active');
    console.log('모달 표시 완료');
    console.log('모달 클래스 리스트:', modal.classList.toString());
    console.log('모달 display 스타일:', window.getComputedStyle(modal).display);
    
    const documents = {
        1: {
            title: '강남구 삼성동 아파트 시장조사서',
            type: '아파트',
            location: '서울 강남구 삼성동',
            date: '2024.01.15'
        },
        2: {
            title: '판교 테크노밸리 오피스텔 시장분석',
            type: '오피스텔',
            location: '경기 성남시 분당구',
            date: '2024.01.14'
        },
        3: {
            title: '홍대입구역 상권 분석 보고서',
            type: '상가',
            location: '서울 마포구 서교동',
            date: '2024.01.13'
        },
        4: {
            title: '가산디지털단지 지식산업센터 현황',
            type: '지식산업센터',
            location: '서울 금천구 가산동',
            date: '2024.01.12'
        },
        5: {
            title: '해운대 신도시 아파트 시장 동향',
            type: '아파트',
            location: '부산 해운대구',
            date: '2024.01.11'
        },
        6: {
            title: '여의도 IFC 오피스텔 투자 분석',
            type: '오피스텔',
            location: '서울 영등포구 여의도동',
            date: '2024.01.10'
        }
    };
    
    const doc = documents[docId];
    if (doc) {
        // 문서 정보 업데이트
        const titleEl = document.getElementById('previewTitle');
        const typeEl = document.getElementById('previewType');
        const locationEl = document.getElementById('previewLocation');
        const dateEl = document.getElementById('previewDate');
        
        if (titleEl) titleEl.textContent = doc.title;
        if (typeEl) typeEl.textContent = doc.type;
        if (locationEl) locationEl.textContent = doc.location;
        if (dateEl) dateEl.textContent = doc.date;
        
        console.log('미리보기 정보 업데이트 완료');
    } else {
        console.error('문서를 찾을 수 없습니다:', docId);
    }
};

// 미리보기 닫기
document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('previewClose');
    const modal = document.getElementById('previewModal');
    const overlay = document.querySelector('.preview-overlay');
    
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            modal.style.display = 'none';
        });
    }
    
    if (overlay && modal) {
        overlay.addEventListener('click', function() {
            modal.classList.remove('active');
            modal.style.display = 'none';
        });
    }
});

// 줌 인/아웃 기능
let currentZoom = 1;

document.addEventListener('DOMContentLoaded', function() {
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const fullscreenBtn = document.getElementById('fullscreen');
    const previewImage = document.getElementById('previewImage');
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function() {
            currentZoom = Math.min(currentZoom + 0.2, 3);
            if (previewImage) {
                previewImage.style.transform = `scale(${currentZoom})`;
            }
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function() {
            currentZoom = Math.max(currentZoom - 0.2, 0.5);
            if (previewImage) {
                previewImage.style.transform = `scale(${currentZoom})`;
            }
        });
    }
    
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function() {
            const modal = document.getElementById('previewModal');
            if (!document.fullscreenElement) {
                modal.requestFullscreen();
                this.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                document.exitFullscreen();
                this.innerHTML = '<i class="fas fa-expand"></i>';
            }
        });
    }
});

// 썸네일 클릭시 메인 이미지 변경 - 전역 스코프에 정의
window.changePreviewImage = function(element, pageNum) {
    console.log('changePreviewImage 호출됨, pageNum:', pageNum);
    
    // 모든 썸네일에서 active 클래스 제거
    document.querySelectorAll('.thumbnail-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 클릭한 썸네일에 active 클래스 추가
    element.classList.add('active');
    
    // 메인 이미지 변경
    const mainImage = document.getElementById('previewMainImage');
    if (mainImage) {
        mainImage.src = `https://via.placeholder.com/500x700/2E8CE6/FFFFFF?text=페이지${pageNum}`;
        console.log('메인 이미지 변경 완료');
    } else {
        console.error('메인 이미지 요소를 찾을 수 없습니다');
    }
};

// CSS 스타일 추가 - 지도 관련 스타일만 추가
const marketResearchStyles = document.createElement('style');
marketResearchStyles.textContent = `
    /* 지도 스타일 */
    .map-regions {
        position: relative;
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        padding: 20px;
    }
    
    .region-marker {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
    }
    
    .region-marker:hover {
        border-color: #0066ff;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 102, 255, 0.2);
    }
    
    .region-marker.active {
        background: #0066ff;
        border-color: #0066ff;
        color: white;
    }
    
    .region-name {
        display: block;
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 4px;
    }
    
    .doc-count {
        display: inline-block;
        padding: 2px 8px;
        background: #f3f4f6;
        border-radius: 100px;
        font-size: 12px;
        color: #6b7280;
    }
    
    .region-marker.active .doc-count {
        background: white;
        color: #0066ff;
    }
    
    /* 세부 지역 체크박스 */
    .district-checkboxes {
        margin-top: 20px;
        padding: 16px;
        background: #f9fafb;
        border-radius: 8px;
    }
    
    .district-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }
    
    .district-checkbox {
        display: flex;
        align-items: center;
        padding: 8px;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .district-checkbox:hover {
        background: #f3f4f6;
    }
    
    .district-checkbox input {
        margin-right: 8px;
    }
    
    /* 프리미엄 배지 */
    .premium-badge {
        display: inline-block;
        padding: 2px 8px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 100px;
        font-size: 11px;
        font-weight: 600;
    }
    
    /* 문서 정보 */
    .document-description {
        font-size: 13px;
        color: #6b7280;
        margin: 8px 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .document-info {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin: 12px 0;
        padding: 12px 0;
        border-top: 1px solid #f3f4f6;
        border-bottom: 1px solid #f3f4f6;
    }
    
    .info-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #6b7280;
    }
    
    .info-item i {
        font-size: 11px;
        color: #9ca3af;
    }
    
    /* 문서 액션 버튼 */
    .document-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
    }
    
    .btn-preview,
    .btn-download {
        flex: 1;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
    }
    
    .btn-preview {
        background: white;
        border: 1px solid #e5e7eb;
        color: #374151;
    }
    
    .btn-preview:hover {
        background: #f9fafb;
    }
    
    .btn-download {
        background: #0066ff;
        border: none;
        color: white;
    }
    
    .btn-download:hover {
        background: #0052cc;
    }
    
    .btn-download.premium {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    /* 포인트 표시 */
    .stat.points {
        color: #f59e0b;
        font-weight: 600;
    }
    
    
    /* 최근 검색어 */
    .recent-searches {
        margin-top: 20px;
        padding: 16px;
        background: #f9fafb;
        border-radius: 8px;
    }
    
    .recent-searches h4 {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 12px;
    }
    
    .recent-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    
    .recent-tag {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 100px;
        font-size: 13px;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .recent-tag:hover {
        border-color: #0066ff;
        color: #0066ff;
    }
    
    .tag-remove {
        margin-left: 8px;
        width: 16px;
        height: 16px;
        border: none;
        background: transparent;
        color: #9ca3af;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .tag-remove:hover {
        color: #ef4444;
    }
    
    /* 검색 결과 없음 */
    .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: #6b7280;
    }
    
    .no-results i {
        font-size: 48px;
        margin-bottom: 16px;
        color: #d1d5db;
    }
    
    .no-results p {
        font-size: 16px;
    }
`;
document.head.appendChild(marketResearchStyles);