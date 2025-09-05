/**
 * DataTableLoader - 데이터 테이블 컴포넌트 로더
 * 
 * 기능:
 * - 정렬 가능한 컬럼 지원
 * - 필터링 및 검색 기능
 * - 페이지네이션 통합
 * - 체크박스 선택 지원
 * - 컬럼 표시/숨김 설정
 * - 데이터 내보내기
 * - 반응형 디자인
 * - 로딩 및 빈 상태 관리
 * 
 * @author AI Assistant
 * @created 2025-09-05
 */

class DataTableLoader {
    constructor() {
        this.instances = new Map();
        this.isInitialized = false;
    }

    /**
     * 데이터 테이블 컴포넌트 로드 및 초기화
     * @param {string} containerId - 컨테이너 ID
     * @param {Object} options - 설정 옵션
     * @returns {Promise<Object>} 테이블 인스턴스
     */
    async loadDataTable(containerId, options = {}) {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Container with ID '${containerId}' not found`);
            }

            // 기본 설정
            const config = {
                title: '데이터 테이블',
                subtitle: null,
                data: [],
                columns: [],
                showHeader: true,
                showFilters: true,
                showSearch: true,
                showSort: true,
                showColumnToggle: true,
                showExport: false,
                showPagination: true,
                showSelection: false,
                showActions: false,
                pageSize: 10,
                pageSizeOptions: [10, 20, 50, 100],
                sortable: true,
                filterable: true,
                searchable: true,
                selectable: false,
                variant: 'default', // default, compact, striped, bordered
                loading: false,
                loadingText: '데이터를 불러오는 중...',
                emptyTitle: '데이터가 없습니다',
                emptyDescription: '표시할 데이터가 없습니다.',
                showEmptyAction: false,
                emptyActionText: '데이터 추가',
                onSort: null,
                onFilter: null,
                onSearch: null,
                onPageChange: null,
                onSelect: null,
                onRowClick: null,
                onAction: null,
                onExport: null,
                onEmptyAction: null,
                ...options
            };

            // HTML 템플릿 로드
            if (!this.isInitialized) {
                await this.loadTemplate();
                this.isInitialized = true;
            }

            // 테이블 인스턴스 생성
            const instance = await this.createInstance(container, config);
            this.instances.set(containerId, instance);

            return instance;

        } catch (error) {
            console.error('데이터 테이블 로드 오류:', error);
            throw error;
        }
    }

    /**
     * HTML 템플릿 로드
     */
    async loadTemplate() {
        try {
            const response = await fetch('/components/data-table.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.template = await response.text();
        } catch (error) {
            console.error('데이터 테이블 템플릿 로드 실패:', error);
            throw error;
        }
    }

    /**
     * 테이블 인스턴스 생성
     * @param {HTMLElement} container - 컨테이너 엘리먼트
     * @param {Object} config - 설정
     * @returns {Object} 인스턴스
     */
    async createInstance(container, config) {
        // 템플릿 삽입
        container.innerHTML = this.template;

        // 테이블 엘리먼트 설정
        const tableEl = container.querySelector('.wave-data-table');
        
        // 변형 클래스 적용
        if (config.variant !== 'default') {
            tableEl.classList.add(config.variant);
        }

        // 인스턴스 객체 생성
        const instance = {
            container,
            config,
            elements: this.getElements(container),
            sortState: { column: null, direction: 'asc' },
            filterState: {},
            searchState: '',
            selectedRows: new Set(),
            
            // 공개 메서드
            setData: (data) => this.setData(instance, data),
            setColumns: (columns) => this.setColumns(instance, columns),
            render: () => this.renderTable(instance),
            sort: (column, direction) => this.sortData(instance, column, direction),
            filter: (filters) => this.filterData(instance, filters),
            search: (query) => this.searchData(instance, query),
            selectAll: (select) => this.selectAllRows(instance, select),
            selectRow: (index, select) => this.selectRow(instance, index, select),
            getSelectedRows: () => this.getSelectedRows(instance),
            clearSelection: () => this.clearSelection(instance),
            showLoading: () => this.showLoading(instance),
            hideLoading: () => this.hideLoading(instance),
            exportData: (format) => this.exportData(instance, format),
            refresh: () => this.refreshTable(instance),
            destroy: () => this.destroyInstance(container.id)
        };

        // 이벤트 리스너 설정
        this.setupEventListeners(instance);

        // 초기 렌더링
        this.renderTable(instance);

        return instance;
    }

    /**
     * DOM 엘리먼트 참조 가져오기
     * @param {HTMLElement} container - 컨테이너
     * @returns {Object} 엘리먼트 참조
     */
    getElements(container) {
        return {
            table: container.querySelector('.wave-data-table'),
            header: container.querySelector('.table-header'),
            title: container.querySelector('#table-title-text'),
            subtitle: container.querySelector('#table-subtitle-text'),
            totalCount: container.querySelector('#table-total-count'),
            actions: container.querySelector('#table-actions'),
            filters: container.querySelector('.table-filters'),
            searchContainer: container.querySelector('#table-search-container'),
            searchInput: container.querySelector('#table-search-input'),
            searchClear: container.querySelector('#table-search-clear'),
            filterSelects: container.querySelector('#table-filter-selects'),
            sortContainer: container.querySelector('#table-sort-container'),
            sortSelect: container.querySelector('#table-sort-select'),
            columnToggle: container.querySelector('#table-column-toggle'),
            columnToggleBtn: container.querySelector('#table-column-toggle-btn'),
            columnDropdown: container.querySelector('#table-column-dropdown'),
            exportActions: container.querySelector('#table-export-actions'),
            exportBtn: container.querySelector('#table-export-btn'),
            tableContainer: container.querySelector('#table-container'),
            dataTable: container.querySelector('#data-table'),
            thead: container.querySelector('#table-thead'),
            tbody: container.querySelector('#table-tbody'),
            loading: container.querySelector('#table-loading'),
            empty: container.querySelector('#table-empty'),
            emptyAction: container.querySelector('#table-empty-action'),
            footer: container.querySelector('.table-footer'),
            selectedInfo: container.querySelector('#table-selected-info'),
            selectedCount: container.querySelector('#table-selected-count'),
            selectedActions: container.querySelector('#table-selected-actions'),
            pagination: container.querySelector('#table-pagination'),
            columnModal: container.querySelector('#table-column-modal'),
            columnModalClose: container.querySelector('#table-column-modal-close'),
            columnList: container.querySelector('#table-column-list'),
            columnModalCancel: container.querySelector('#table-column-modal-cancel'),
            columnModalApply: container.querySelector('#table-column-modal-apply')
        };
    }

    /**
     * 이벤트 리스너 설정
     * @param {Object} instance - 인스턴스
     */
    setupEventListeners(instance) {
        const { elements, config } = instance;

        // 검색 이벤트
        if (elements.searchInput) {
            let searchTimeout;
            elements.searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchData(instance, e.target.value);
                }, 300);
            });

            // 검색 클리어
            elements.searchClear?.addEventListener('click', () => {
                elements.searchInput.value = '';
                this.searchData(instance, '');
            });
        }

        // 정렬 선택
        elements.sortSelect?.addEventListener('change', (e) => {
            const [column, direction] = e.target.value.split(':');
            if (column && direction) {
                this.sortData(instance, column, direction);
            }
        });

        // 컬럼 토글
        elements.columnToggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.columnDropdown?.classList.toggle('show');
        });

        // 컬럼 드롭다운 외부 클릭
        document.addEventListener('click', () => {
            elements.columnDropdown?.classList.remove('show');
        });

        // 내보내기
        elements.exportBtn?.addEventListener('click', () => {
            this.exportData(instance, 'csv');
        });

        // 빈 상태 액션
        elements.emptyAction?.addEventListener('click', () => {
            if (config.onEmptyAction) {
                config.onEmptyAction(instance);
            }
        });

        // 컬럼 모달
        elements.columnModalClose?.addEventListener('click', () => {
            this.hideColumnModal(instance);
        });

        elements.columnModalCancel?.addEventListener('click', () => {
            this.hideColumnModal(instance);
        });

        elements.columnModalApply?.addEventListener('click', () => {
            this.applyColumnSettings(instance);
        });

        // 모달 백드롭 클릭
        elements.columnModal?.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.hideColumnModal(instance);
            }
        });
    }

    /**
     * 테이블 렌더링
     * @param {Object} instance - 인스턴스
     */
    renderTable(instance) {
        const { config, elements } = instance;
        
        // 헤더 설정
        this.renderHeader(instance);
        
        // 필터 설정
        this.renderFilters(instance);
        
        // 테이블 헤더 렌더링
        this.renderTableHeader(instance);
        
        // 테이블 데이터 렌더링
        this.renderTableBody(instance);
        
        // 선택 정보 업데이트
        this.updateSelectionInfo(instance);
        
        // 상태 업데이트
        this.updateTableState(instance);
    }

    /**
     * 헤더 렌더링
     * @param {Object} instance - 인스턴스
     */
    renderHeader(instance) {
        const { config, elements } = instance;

        if (config.showHeader && elements.header) {
            elements.header.style.display = 'block';
            
            if (elements.title) {
                elements.title.textContent = config.title;
            }
            
            if (elements.totalCount) {
                elements.totalCount.textContent = config.data.length.toLocaleString();
            }
            
            if (config.subtitle && elements.subtitle) {
                elements.subtitle.textContent = config.subtitle;
            }
        } else if (elements.header) {
            elements.header.style.display = 'none';
        }
    }

    /**
     * 필터 렌더링
     * @param {Object} instance - 인스턴스
     */
    renderFilters(instance) {
        const { config, elements } = instance;

        if (config.showFilters && elements.filters) {
            elements.filters.style.display = 'flex';
            
            // 검색 표시/숨김
            if (elements.searchContainer) {
                elements.searchContainer.style.display = config.showSearch ? 'block' : 'none';
            }
            
            // 정렬 표시/숨김
            if (elements.sortContainer) {
                elements.sortContainer.style.display = config.showSort ? 'block' : 'none';
                this.renderSortOptions(instance);
            }
            
            // 컬럼 토글 표시/숨김
            if (elements.columnToggle) {
                elements.columnToggle.style.display = config.showColumnToggle ? 'block' : 'none';
            }
            
            // 내보내기 표시/숨김
            if (elements.exportActions) {
                elements.exportActions.style.display = config.showExport ? 'block' : 'none';
            }
            
        } else if (elements.filters) {
            elements.filters.style.display = 'none';
        }
    }

    /**
     * 정렬 옵션 렌더링
     * @param {Object} instance - 인스턴스
     */
    renderSortOptions(instance) {
        const { config, elements } = instance;
        
        if (!elements.sortSelect || !config.columns) return;

        elements.sortSelect.innerHTML = '<option value="">정렬 방식</option>';
        
        config.columns.forEach(column => {
            if (column.sortable !== false) {
                const optionAsc = document.createElement('option');
                optionAsc.value = `${column.key}:asc`;
                optionAsc.textContent = `${column.title} 오름차순`;
                elements.sortSelect.appendChild(optionAsc);
                
                const optionDesc = document.createElement('option');
                optionDesc.value = `${column.key}:desc`;
                optionDesc.textContent = `${column.title} 내림차순`;
                elements.sortSelect.appendChild(optionDesc);
            }
        });
    }

    /**
     * 테이블 헤더 렌더링
     * @param {Object} instance - 인스턴스
     */
    renderTableHeader(instance) {
        const { config, elements } = instance;
        
        if (!elements.thead || !config.columns) return;

        let headerHTML = '<tr>';
        
        // 체크박스 컬럼
        if (config.showSelection) {
            headerHTML += `
                <th class="checkbox-cell">
                    <input type="checkbox" id="select-all" title="전체 선택">
                </th>
            `;
        }

        // 데이터 컬럼들
        config.columns.forEach(column => {
            if (column.hidden) return;
            
            const sortable = column.sortable !== false && config.sortable;
            const sortClass = sortable ? 'sortable-header' : '';
            const sorted = instance.sortState.column === column.key ? 
                `sorted ${instance.sortState.direction}` : '';
            
            headerHTML += `
                <th data-column="${column.key}" class="${sortClass} ${sorted}">
                    ${sortable ? `
                        <div class="sortable-header ${sorted}">
                            <span>${column.title}</span>
                            <span class="sort-icon ${instance.sortState.column === column.key ? instance.sortState.direction : ''}"></span>
                        </div>
                    ` : column.title}
                </th>
            `;
        });

        // 액션 컬럼
        if (config.showActions) {
            headerHTML += '<th class="actions-cell">액션</th>';
        }

        headerHTML += '</tr>';
        elements.thead.innerHTML = headerHTML;

        // 헤더 이벤트 리스너 설정
        this.setupHeaderEvents(instance);
    }

    /**
     * 헤더 이벤트 리스너 설정
     * @param {Object} instance - 인스턴스
     */
    setupHeaderEvents(instance) {
        const { elements } = instance;

        // 전체 선택 체크박스
        const selectAllCheckbox = elements.thead.querySelector('#select-all');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.selectAllRows(instance, e.target.checked);
            });
        }

        // 정렬 가능한 헤더 클릭
        const sortableHeaders = elements.thead.querySelectorAll('.sortable-header');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.closest('th').dataset.column;
                const currentDirection = instance.sortState.column === column ? 
                    instance.sortState.direction : 'asc';
                const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
                
                this.sortData(instance, column, newDirection);
            });
        });
    }

    /**
     * 테이블 바디 렌더링
     * @param {Object} instance - 인스턴스
     */
    renderTableBody(instance) {
        const { config, elements } = instance;
        
        if (!elements.tbody) return;

        // 필터된 데이터 가져오기
        const filteredData = this.getFilteredData(instance);
        
        if (filteredData.length === 0) {
            this.showEmptyState(instance);
            return;
        }

        this.hideEmptyState(instance);

        let bodyHTML = '';
        
        filteredData.forEach((row, index) => {
            const originalIndex = config.data.indexOf(row);
            const isSelected = instance.selectedRows.has(originalIndex);
            
            bodyHTML += `<tr data-index="${originalIndex}" class="${isSelected ? 'selected' : ''}">`;
            
            // 체크박스 컬럼
            if (config.showSelection) {
                bodyHTML += `
                    <td class="checkbox-cell">
                        <input type="checkbox" ${isSelected ? 'checked' : ''} 
                               data-row-index="${originalIndex}">
                    </td>
                `;
            }

            // 데이터 컬럼들
            config.columns.forEach(column => {
                if (column.hidden) return;
                
                let cellContent = this.formatCellContent(row[column.key], column, row);
                bodyHTML += `<td>${cellContent}</td>`;
            });

            // 액션 컬럼
            if (config.showActions) {
                bodyHTML += `
                    <td class="actions-cell">
                        <div class="row-actions">
                            <button type="button" class="row-action-btn" data-action="edit" data-index="${originalIndex}" title="편집">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button type="button" class="row-action-btn danger" data-action="delete" data-index="${originalIndex}" title="삭제">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
            }

            bodyHTML += '</tr>';
        });

        elements.tbody.innerHTML = bodyHTML;

        // 바디 이벤트 리스너 설정
        this.setupBodyEvents(instance);
    }

    /**
     * 바디 이벤트 리스너 설정
     * @param {Object} instance - 인스턴스
     */
    setupBodyEvents(instance) {
        const { config, elements } = instance;

        // 행 체크박스
        const rowCheckboxes = elements.tbody.querySelectorAll('input[type="checkbox"]');
        rowCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const rowIndex = parseInt(e.target.dataset.rowIndex);
                this.selectRow(instance, rowIndex, e.target.checked);
            });
        });

        // 행 클릭
        const rows = elements.tbody.querySelectorAll('tr');
        rows.forEach(row => {
            row.addEventListener('click', (e) => {
                // 체크박스나 액션 버튼 클릭은 제외
                if (e.target.closest('input, button')) return;
                
                const rowIndex = parseInt(row.dataset.index);
                if (config.onRowClick) {
                    config.onRowClick(config.data[rowIndex], rowIndex, instance);
                }
            });
        });

        // 액션 버튼
        const actionButtons = elements.tbody.querySelectorAll('.row-action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = button.dataset.action;
                const rowIndex = parseInt(button.dataset.index);
                
                if (config.onAction) {
                    config.onAction(action, config.data[rowIndex], rowIndex, instance);
                }
            });
        });
    }

    /**
     * 셀 내용 포맷팅
     * @param {*} value - 값
     * @param {Object} column - 컬럼 설정
     * @param {Object} row - 행 데이터
     * @returns {string} 포맷된 내용
     */
    formatCellContent(value, column, row) {
        if (value === null || value === undefined) {
            return '';
        }

        // 커스텀 렌더러
        if (column.render && typeof column.render === 'function') {
            return column.render(value, row);
        }

        // 타입별 기본 포맷팅
        switch (column.type) {
            case 'date':
                return new Date(value).toLocaleDateString();
            case 'datetime':
                return new Date(value).toLocaleString();
            case 'number':
                return Number(value).toLocaleString();
            case 'currency':
                return `${Number(value).toLocaleString()}원`;
            case 'boolean':
                return value ? '예' : '아니오';
            case 'badge':
                const badgeClass = column.badgeClass || 'primary';
                return `<span class="badge ${badgeClass}">${value}</span>`;
            default:
                return String(value);
        }
    }

    /**
     * 필터된 데이터 가져오기
     * @param {Object} instance - 인스턴스
     * @returns {Array} 필터된 데이터
     */
    getFilteredData(instance) {
        const { config } = instance;
        let filteredData = [...config.data];

        // 검색 필터링
        if (instance.searchState) {
            const searchLower = instance.searchState.toLowerCase();
            filteredData = filteredData.filter(row => {
                return config.columns.some(column => {
                    if (!column.searchable) return false;
                    const value = String(row[column.key] || '').toLowerCase();
                    return value.includes(searchLower);
                });
            });
        }

        // 컬럼 필터링
        Object.entries(instance.filterState).forEach(([column, filterValue]) => {
            if (filterValue) {
                filteredData = filteredData.filter(row => {
                    return String(row[column]) === String(filterValue);
                });
            }
        });

        // 정렬
        if (instance.sortState.column) {
            const column = config.columns.find(col => col.key === instance.sortState.column);
            if (column) {
                filteredData.sort((a, b) => {
                    const aVal = a[column.key];
                    const bVal = b[column.key];
                    
                    if (aVal === bVal) return 0;
                    
                    let comparison = 0;
                    if (column.type === 'number') {
                        comparison = Number(aVal) - Number(bVal);
                    } else if (column.type === 'date' || column.type === 'datetime') {
                        comparison = new Date(aVal) - new Date(bVal);
                    } else {
                        comparison = String(aVal).localeCompare(String(bVal));
                    }
                    
                    return instance.sortState.direction === 'desc' ? -comparison : comparison;
                });
            }
        }

        return filteredData;
    }

    /**
     * 데이터 설정
     * @param {Object} instance - 인스턴스
     * @param {Array} data - 데이터 배열
     */
    setData(instance, data) {
        instance.config.data = data || [];
        this.renderTable(instance);
    }

    /**
     * 컬럼 설정
     * @param {Object} instance - 인스턴스
     * @param {Array} columns - 컬럼 배열
     */
    setColumns(instance, columns) {
        instance.config.columns = columns || [];
        this.renderTable(instance);
    }

    /**
     * 데이터 정렬
     * @param {Object} instance - 인스턴스
     * @param {string} column - 컬럼명
     * @param {string} direction - 정렬 방향 (asc/desc)
     */
    sortData(instance, column, direction) {
        instance.sortState = { column, direction };
        
        if (instance.config.onSort) {
            instance.config.onSort(column, direction, instance);
        }
        
        this.renderTable(instance);
    }

    /**
     * 데이터 필터링
     * @param {Object} instance - 인스턴스
     * @param {Object} filters - 필터 객체
     */
    filterData(instance, filters) {
        instance.filterState = { ...instance.filterState, ...filters };
        
        if (instance.config.onFilter) {
            instance.config.onFilter(instance.filterState, instance);
        }
        
        this.renderTable(instance);
    }

    /**
     * 데이터 검색
     * @param {Object} instance - 인스턴스
     * @param {string} query - 검색어
     */
    searchData(instance, query) {
        instance.searchState = query;
        
        // 검색 클리어 버튼 표시/숨김
        if (instance.elements.searchClear) {
            instance.elements.searchClear.style.display = query ? 'flex' : 'none';
        }
        
        if (instance.config.onSearch) {
            instance.config.onSearch(query, instance);
        }
        
        this.renderTable(instance);
    }

    /**
     * 전체 행 선택/해제
     * @param {Object} instance - 인스턴스
     * @param {boolean} select - 선택 여부
     */
    selectAllRows(instance, select) {
        if (select) {
            instance.config.data.forEach((_, index) => {
                instance.selectedRows.add(index);
            });
        } else {
            instance.selectedRows.clear();
        }
        
        this.updateSelectionInfo(instance);
        this.renderTableBody(instance);
        
        if (instance.config.onSelect) {
            instance.config.onSelect(this.getSelectedRows(instance), instance);
        }
    }

    /**
     * 특정 행 선택/해제
     * @param {Object} instance - 인스턴스
     * @param {number} index - 행 인덱스
     * @param {boolean} select - 선택 여부
     */
    selectRow(instance, index, select) {
        if (select) {
            instance.selectedRows.add(index);
        } else {
            instance.selectedRows.delete(index);
        }
        
        this.updateSelectionInfo(instance);
        this.updateSelectAllCheckbox(instance);
        
        if (instance.config.onSelect) {
            instance.config.onSelect(this.getSelectedRows(instance), instance);
        }
    }

    /**
     * 선택된 행 가져오기
     * @param {Object} instance - 인스턴스
     * @returns {Array} 선택된 행 데이터
     */
    getSelectedRows(instance) {
        return Array.from(instance.selectedRows).map(index => instance.config.data[index]);
    }

    /**
     * 선택 해제
     * @param {Object} instance - 인스턴스
     */
    clearSelection(instance) {
        instance.selectedRows.clear();
        this.updateSelectionInfo(instance);
        this.renderTableBody(instance);
    }

    /**
     * 선택 정보 업데이트
     * @param {Object} instance - 인스턴스
     */
    updateSelectionInfo(instance) {
        const { elements } = instance;
        const selectedCount = instance.selectedRows.size;
        
        if (elements.selectedInfo) {
            elements.selectedInfo.style.display = selectedCount > 0 ? 'flex' : 'none';
        }
        
        if (elements.selectedCount) {
            elements.selectedCount.textContent = selectedCount;
        }
    }

    /**
     * 전체 선택 체크박스 업데이트
     * @param {Object} instance - 인스턴스
     */
    updateSelectAllCheckbox(instance) {
        const selectAllCheckbox = instance.elements.thead?.querySelector('#select-all');
        if (!selectAllCheckbox) return;
        
        const totalRows = instance.config.data.length;
        const selectedCount = instance.selectedRows.size;
        
        selectAllCheckbox.checked = selectedCount === totalRows && totalRows > 0;
        selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalRows;
    }

    /**
     * 테이블 상태 업데이트
     * @param {Object} instance - 인스턴스
     */
    updateTableState(instance) {
        const { config } = instance;
        
        // 로딩 상태
        if (config.loading) {
            this.showLoading(instance);
        } else {
            this.hideLoading(instance);
        }
        
        // 빈 상태
        const hasData = config.data && config.data.length > 0;
        if (!hasData && !config.loading) {
            this.showEmptyState(instance);
        } else {
            this.hideEmptyState(instance);
        }
    }

    /**
     * 로딩 상태 표시
     * @param {Object} instance - 인스턴스
     */
    showLoading(instance) {
        if (instance.elements.loading) {
            instance.elements.loading.style.display = 'flex';
        }
    }

    /**
     * 로딩 상태 숨김
     * @param {Object} instance - 인스턴스
     */
    hideLoading(instance) {
        if (instance.elements.loading) {
            instance.elements.loading.style.display = 'none';
        }
    }

    /**
     * 빈 상태 표시
     * @param {Object} instance - 인스턴스
     */
    showEmptyState(instance) {
        const { config, elements } = instance;
        
        if (elements.empty) {
            elements.empty.style.display = 'block';
            
            // 빈 상태 액션 버튼
            if (elements.emptyAction) {
                elements.emptyAction.style.display = config.showEmptyAction ? 'inline-flex' : 'none';
                if (config.emptyActionText) {
                    const span = elements.emptyAction.querySelector('span');
                    if (span) span.textContent = config.emptyActionText;
                }
            }
        }
        
        // 테이블 바디 숨김
        if (elements.tbody) {
            elements.tbody.innerHTML = '';
        }
    }

    /**
     * 빈 상태 숨김
     * @param {Object} instance - 인스턴스
     */
    hideEmptyState(instance) {
        if (instance.elements.empty) {
            instance.elements.empty.style.display = 'none';
        }
    }

    /**
     * 데이터 내보내기
     * @param {Object} instance - 인스턴스
     * @param {string} format - 포맷 (csv, json, xlsx)
     */
    exportData(instance, format = 'csv') {
        const { config } = instance;
        const filteredData = this.getFilteredData(instance);
        
        if (config.onExport) {
            config.onExport(filteredData, format, instance);
            return;
        }
        
        // 기본 내보내기 로직
        switch (format) {
            case 'csv':
                this.exportCSV(filteredData, config.columns);
                break;
            case 'json':
                this.exportJSON(filteredData);
                break;
            default:
                console.warn(`Unsupported export format: ${format}`);
        }
    }

    /**
     * CSV 내보내기
     * @param {Array} data - 데이터
     * @param {Array} columns - 컬럼
     */
    exportCSV(data, columns) {
        const headers = columns.filter(col => !col.hidden).map(col => col.title);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                columns.filter(col => !col.hidden)
                    .map(col => `"${String(row[col.key] || '').replace(/"/g, '""')}"`)
                    .join(',')
            )
        ].join('\n');
        
        this.downloadFile(csvContent, 'data.csv', 'text/csv');
    }

    /**
     * JSON 내보내기
     * @param {Array} data - 데이터
     */
    exportJSON(data) {
        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, 'data.json', 'application/json');
    }

    /**
     * 파일 다운로드
     * @param {string} content - 내용
     * @param {string} filename - 파일명
     * @param {string} mimeType - MIME 타입
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * 테이블 새로고침
     * @param {Object} instance - 인스턴스
     */
    refreshTable(instance) {
        this.renderTable(instance);
    }

    /**
     * 컬럼 모달 숨김
     * @param {Object} instance - 인스턴스
     */
    hideColumnModal(instance) {
        if (instance.elements.columnModal) {
            instance.elements.columnModal.style.display = 'none';
        }
    }

    /**
     * 컬럼 설정 적용
     * @param {Object} instance - 인스턴스
     */
    applyColumnSettings(instance) {
        // 컬럼 설정 로직 구현
        this.hideColumnModal(instance);
        this.renderTable(instance);
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
const dataTableLoader = new DataTableLoader();

// 모듈 시스템 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataTableLoader;
}

// 전역 사용을 위한 window 객체 등록
if (typeof window !== 'undefined') {
    window.DataTableLoader = DataTableLoader;
    window.dataTableLoader = dataTableLoader;
}

/**
 * 사용 예시:
 * 
 * // 기본 테이블
 * const table = await dataTableLoader.loadDataTable('table-container', {
 *     title: '사용자 목록',
 *     columns: [
 *         { key: 'name', title: '이름', sortable: true },
 *         { key: 'email', title: '이메일', sortable: true },
 *         { key: 'role', title: '역할', type: 'badge' },
 *         { key: 'created_at', title: '가입일', type: 'date' }
 *     ],
 *     data: userData,
 *     showSelection: true,
 *     showActions: true
 * });
 * 
 * // 고급 테이블
 * const advancedTable = await dataTableLoader.loadDataTable('advanced-table', {
 *     title: '주문 관리',
 *     columns: [
 *         { key: 'order_id', title: '주문번호' },
 *         { key: 'customer', title: '고객명' },
 *         { key: 'amount', title: '금액', type: 'currency' },
 *         { key: 'status', title: '상태', type: 'badge', render: (value) => {
 *             const colors = { pending: 'warning', completed: 'success', cancelled: 'danger' };
 *             return `<span class="badge ${colors[value]}">${value}</span>`;
 *         }}
 *     ],
 *     data: orderData,
 *     showFilters: true,
 *     showExport: true,
 *     onSort: (column, direction) => {
 *         console.log(`정렬: ${column} ${direction}`);
 *     },
 *     onRowClick: (row) => {
 *         console.log('행 클릭:', row);
 *     },
 *     onAction: (action, row) => {
 *         console.log(`액션 ${action}:`, row);
 *     }
 * });
 */