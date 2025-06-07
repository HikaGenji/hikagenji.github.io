class HyperliquidLeaderboard {
    constructor() {
        this.apiEndpoint = 'https://stats-data.hyperliquid.xyz/Mainnet/leaderboard';
        this.rawData = [];
        this.processedData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.pageSize = 50;
        this.sortColumn = null;
        this.sortDirection = 'desc';
        this.activeFilters = {};
        this.customFormulas = this.loadCustomFormulas();
        
        this.initializeEventListeners();
        this.loadData();
    }

    initializeEventListeners() {
        // Header controls
        document.getElementById('refreshBtn').addEventListener('click', () => this.loadData());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportCSV());
        document.getElementById('addFormulaBtn').addEventListener('click', () => this.showFormulaModal());
        document.getElementById('retryBtn').addEventListener('click', () => this.loadData());
        
        // Pagination
        document.getElementById('prevBtn').addEventListener('click', () => this.changePage(this.currentPage - 1));
        document.getElementById('nextBtn').addEventListener('click', () => this.changePage(this.currentPage + 1));
        
        // Clear filters
        document.getElementById('clearAllFilters').addEventListener('click', () => this.clearAllFilters());
        
        // Filter modal
        document.getElementById('closeFilterModal').addEventListener('click', () => this.hideFilterModal());
        document.getElementById('cancelFilter').addEventListener('click', () => this.hideFilterModal());
        document.getElementById('applyFilter').addEventListener('click', () => this.applyFilter());
        
        // Position modal
        document.getElementById('closePositionModal').addEventListener('click', () => this.hidePositionModal());
        
        // Formula modal
        document.getElementById('closeFormulaModal').addEventListener('click', () => this.hideFormulaModal());
        document.getElementById('cancelFormula').addEventListener('click', () => this.hideFormulaModal());
        document.getElementById('addFormula').addEventListener('click', () => this.addCustomFormula());
        
        // Close modals on backdrop click
        document.getElementById('filterModal').addEventListener('click', (e) => {
            if (e.target.id === 'filterModal') this.hideFilterModal();
        });
        document.getElementById('positionModal').addEventListener('click', (e) => {
            if (e.target.id === 'positionModal') this.hidePositionModal();
        });
        document.getElementById('formulaModal').addEventListener('click', (e) => {
            if (e.target.id === 'formulaModal') this.hideFormulaModal();
        });
    }

    async loadData() {
        this.showLoading();
        
        // Add a short delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
            // Try to fetch real data first with a timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch(this.apiEndpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.rawData = data.leaderboardRows || [];
            
            if (this.rawData.length === 0) {
                throw new Error('No data received from API');
            }
            
            console.log('Successfully loaded real data from Hyperliquid API');
            
        } catch (error) {
            console.warn('Failed to load real data, using demo data:', error.message);
            
            // Use mock data as fallback
            this.rawData = this.generateMockData();
            
            // Show a notice that we're using demo data
            this.showDemoNotice();
        }
        
        this.processData();
        this.renderTable();
        this.hideLoading();
        document.getElementById('exportBtn').disabled = false;
    }

    showDemoNotice() {
        const notice = document.createElement('div');
        notice.id = 'demo-notice';
        notice.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-warning);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
        `;
        notice.innerHTML = `
            <strong>Demo Mode</strong><br>
            Using sample data - API unavailable
        `;
        document.body.appendChild(notice);
        
        setTimeout(() => {
            const existingNotice = document.getElementById('demo-notice');
            if (existingNotice) existingNotice.remove();
        }, 5000);
    }

    generateMockData() {
        const mockData = [];
        
        for (let i = 0; i < 150; i++) {
            const baseAccountValue = Math.random() * 50000000 + 100000;
            const addressSuffix = i.toString(16).padStart(4, '0');
            
            const mockTrader = {
                ethAddress: `0x${Math.random().toString(16).substr(2, 36)}${addressSuffix}`,
                accountValue: baseAccountValue.toFixed(8),
                displayName: i % 4 === 0 ? null : `Trader${i}`,
                prize: 0,
                windowPerformances: [
                    ['day', {
                        pnl: (Math.random() * 400000 - 200000).toFixed(6),
                        roi: (Math.random() * 0.4 - 0.2).toFixed(10),
                        vlm: (Math.random() * 2000000000).toExponential(6)
                    }],
                    ['week', {
                        pnl: (Math.random() * 2000000 - 1000000).toFixed(6),
                        roi: (Math.random() * 1.0 - 0.5).toFixed(10),
                        vlm: (Math.random() * 10000000000).toExponential(6)
                    }],
                    ['month', {
                        pnl: (Math.random() * 8000000 - 4000000).toFixed(6),
                        roi: (Math.random() * 2.0 - 1.0).toFixed(10),
                        vlm: (Math.random() * 50000000000).toExponential(6)
                    }],
                    ['allTime', {
                        pnl: (Math.random() * 30000000 - 10000000).toFixed(6),
                        roi: (Math.random() * 5.0 - 1.0).toFixed(10),
                        vlm: (Math.random() * 200000000000).toExponential(6)
                    }]
                ]
            };
            mockData.push(mockTrader);
        }
        
        return mockData;
    }

    processData() {
        this.processedData = this.rawData.map((trader, index) => {
            const processed = {
                rank: index + 1,
                ethAddress: trader.ethAddress,
                displayName: trader.displayName || 'Anonymous',
                accountValue: parseFloat(trader.accountValue) || 0,
                prize: trader.prize || 0
            };

            // Initialize all timeframe metrics
            const timeframes = ['24h', '7d', '30d', 'alltime'];
            timeframes.forEach(tf => {
                processed[`pnl_${tf}`] = 0;
                processed[`roi_${tf}`] = 0;
                processed[`volume_${tf}`] = 0;
            });

            // Process windowPerformances
            if (trader.windowPerformances && Array.isArray(trader.windowPerformances)) {
                trader.windowPerformances.forEach(([period, metrics]) => {
                    const timeframe = this.mapPeriodToTimeframe(period);
                    if (timeframe && metrics) {
                        processed[`pnl_${timeframe}`] = parseFloat(metrics.pnl) || 0;
                        processed[`roi_${timeframe}`] = parseFloat(metrics.roi) || 0;
                        processed[`volume_${timeframe}`] = parseFloat(metrics.vlm) || 0;
                    }
                });
            }

            return processed;
        });

        // Apply custom formulas
        this.applyCustomFormulas();
        
        // Apply current filters and sorting
        this.applyFiltersAndSort();
    }

    mapPeriodToTimeframe(period) {
        const mapping = {
            'day': '24h',
            'week': '7d', 
            'month': '30d',
            'allTime': 'alltime'
        };
        return mapping[period];
    }

    applyCustomFormulas() {
        this.customFormulas.forEach(formula => {
            this.processedData.forEach(row => {
                try {
                    row[formula.name] = this.evaluateFormula(formula.expression, row);
                } catch (error) {
                    row[formula.name] = 0;
                }
            });
        });
    }

    evaluateFormula(expression, row) {
        // Simple formula evaluator - replace column names with values
        let formula = expression;
        
        // Replace column names with actual values
        Object.keys(row).forEach(key => {
            if (typeof row[key] === 'number') {
                const regex = new RegExp(`\\b${key}\\b`, 'g');
                formula = formula.replace(regex, row[key]);
            }
        });
        
        // Evaluate the mathematical expression safely
        try {
            // Only allow basic math operations
            if (!/^[0-9+\-*/.() ]+$/.test(formula)) {
                throw new Error('Invalid formula');
            }
            return Function(`"use strict"; return (${formula})`)();
        } catch (error) {
            return 0;
        }
    }

    applyFiltersAndSort() {
        // Apply filters
        this.filteredData = this.processedData.filter(row => {
            return Object.entries(this.activeFilters).every(([column, filter]) => {
                const value = row[column];
                const threshold = filter.value;
                
                switch (filter.operator) {
                    case '=': return Math.abs(value - threshold) < 0.01;
                    case '>': return value > threshold;
                    case '>=': return value >= threshold;
                    case '<': return value < threshold;
                    case '<=': return value <= threshold;
                    default: return true;
                }
            });
        });

        // Apply sorting
        if (this.sortColumn) {
            this.filteredData.sort((a, b) => {
                let aVal = a[this.sortColumn];
                let bVal = b[this.sortColumn];
                
                // Handle string comparisons
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }
                
                let result = 0;
                if (aVal < bVal) result = -1;
                else if (aVal > bVal) result = 1;
                
                return this.sortDirection === 'asc' ? result : -result;
            });
        }

        this.updateFilterDisplay();
        this.currentPage = 1;
    }

    renderTable() {
        const tableBody = document.getElementById('tableBody');
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        tableBody.innerHTML = '';

        pageData.forEach(trader => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="rank-cell">${trader.rank}</td>
                <td class="name-cell">${this.escapeHtml(trader.displayName)}</td>
                <td class="address-cell" onclick="app.showPositionModal('${trader.ethAddress}')">${this.truncateAddress(trader.ethAddress)}</td>
                <td class="number-cell">$${this.formatNumber(trader.accountValue)}</td>
                <td class="number-cell ${trader.pnl_24h >= 0 ? 'positive' : 'negative'}">$${this.formatNumber(trader.pnl_24h)}</td>
                <td class="number-cell ${trader.pnl_7d >= 0 ? 'positive' : 'negative'}">$${this.formatNumber(trader.pnl_7d)}</td>
                <td class="number-cell ${trader.pnl_30d >= 0 ? 'positive' : 'negative'}">$${this.formatNumber(trader.pnl_30d)}</td>
                <td class="number-cell ${trader.pnl_alltime >= 0 ? 'positive' : 'negative'}">$${this.formatNumber(trader.pnl_alltime)}</td>
                <td class="number-cell ${trader.roi_24h >= 0 ? 'positive' : 'negative'}">${this.formatPercentage(trader.roi_24h)}</td>
                <td class="number-cell ${trader.roi_7d >= 0 ? 'positive' : 'negative'}">${this.formatPercentage(trader.roi_7d)}</td>
                <td class="number-cell ${trader.roi_30d >= 0 ? 'positive' : 'negative'}">${this.formatPercentage(trader.roi_30d)}</td>
                <td class="number-cell ${trader.roi_alltime >= 0 ? 'positive' : 'negative'}">${this.formatPercentage(trader.roi_alltime)}</td>
                <td class="number-cell">$${this.formatNumber(trader.volume_24h)}</td>
                <td class="number-cell">$${this.formatNumber(trader.volume_7d)}</td>
                <td class="number-cell">$${this.formatNumber(trader.volume_30d)}</td>
                <td class="number-cell">$${this.formatNumber(trader.volume_alltime)}</td>
                ${this.renderCustomFormulaColumns(trader)}
            `;
            tableBody.appendChild(row);
        });

        this.renderTableHeaders();
        this.updatePagination();
        this.showTable();
    }

    renderCustomFormulaColumns(trader) {
        return this.customFormulas.map(formula => {
            const value = trader[formula.name] || 0;
            return `<td class="number-cell">${this.formatNumber(value)}</td>`;
        }).join('');
    }

    renderTableHeaders() {
        const headerRow = document.getElementById('tableHeader');
        
        // Add custom formula headers
        this.customFormulas.forEach(formula => {
            const existingHeader = headerRow.querySelector(`[data-column="${formula.name}"]`);
            if (!existingHeader) {
                const th = document.createElement('th');
                th.setAttribute('data-column', formula.name);
                th.className = 'sortable filterable';
                th.innerHTML = `
                    <span>${this.escapeHtml(formula.name)}</span>
                    <button class="filter-btn" data-column="${formula.name}">⚙</button>
                `;
                headerRow.appendChild(th);
            }
        });

        // Add event listeners for sorting and filtering
        headerRow.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', (e) => {
                if (!e.target.classList.contains('filter-btn')) {
                    this.sortTable(th.dataset.column);
                }
            });
        });

        headerRow.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showFilterModal(btn.dataset.column);
            });
        });

        // Update sort indicators
        headerRow.querySelectorAll('th').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
            if (th.dataset.column === this.sortColumn) {
                th.classList.add(this.sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            }
        });
    }

    sortTable(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'desc';
        }
        
        this.applyFiltersAndSort();
        this.renderTable();
    }

    showFilterModal(column) {
        document.getElementById('filterColumnName').textContent = column;
        document.getElementById('filterOperator').value = '>=';
        document.getElementById('filterValue').value = '';
        document.getElementById('filterModal').style.display = 'flex';
        
        // Store current column for filter application
        this.currentFilterColumn = column;
    }

    hideFilterModal() {
        document.getElementById('filterModal').style.display = 'none';
        this.currentFilterColumn = null;
    }

    applyFilter() {
        const operator = document.getElementById('filterOperator').value;
        const value = parseFloat(document.getElementById('filterValue').value);
        
        if (isNaN(value)) {
            alert('Please enter a valid number');
            return;
        }

        this.activeFilters[this.currentFilterColumn] = { operator, value };
        this.applyFiltersAndSort();
        this.renderTable();
        this.hideFilterModal();
    }

    removeFilter(column) {
        delete this.activeFilters[column];
        this.applyFiltersAndSort();
        this.renderTable();
    }

    clearAllFilters() {
        this.activeFilters = {};
        this.applyFiltersAndSort();
        this.renderTable();
    }

    updateFilterDisplay() {
        const filtersSection = document.getElementById('filtersSection');
        const filterChips = document.getElementById('filterChips');
        
        if (Object.keys(this.activeFilters).length === 0) {
            filtersSection.style.display = 'none';
            return;
        }

        filtersSection.style.display = 'block';
        filterChips.innerHTML = '';

        Object.entries(this.activeFilters).forEach(([column, filter]) => {
            const chip = document.createElement('div');
            chip.className = 'filter-chip';
            chip.innerHTML = `
                ${column} ${filter.operator} ${this.formatNumber(filter.value)}
                <button class="filter-chip-remove" onclick="app.removeFilter('${column}')">×</button>
            `;
            filterChips.appendChild(chip);
        });
    }

    changePage(page) {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderTable();
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        const startItem = (this.currentPage - 1) * this.pageSize + 1;
        const endItem = Math.min(this.currentPage * this.pageSize, this.filteredData.length);

        document.getElementById('paginationInfo').textContent = 
            `Showing ${startItem}-${endItem} of ${this.filteredData.length} traders`;

        document.getElementById('prevBtn').disabled = this.currentPage === 1;
        document.getElementById('nextBtn').disabled = this.currentPage === totalPages;

        // Render page numbers
        const pageNumbers = document.getElementById('pageNumbers');
        pageNumbers.innerHTML = '';

        const maxPageButtons = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage < maxPageButtons - 1) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => this.changePage(i));
            pageNumbers.appendChild(pageBtn);
        }

        document.getElementById('paginationContainer').style.display = 'flex';
    }

    showPositionModal(ethAddress) {
        const trader = this.processedData.find(t => t.ethAddress === ethAddress);
        if (!trader) return;

        const positionGrid = document.getElementById('positionGrid');
        positionGrid.innerHTML = '';

        const fields = [
            { label: 'Address', value: trader.ethAddress, type: 'address' },
            { label: 'Display Name', value: trader.displayName, type: 'text' },
            { label: 'Account Value', value: trader.accountValue, type: 'currency' },
            { label: 'PNL 24h', value: trader.pnl_24h, type: 'currency' },
            { label: 'PNL 7d', value: trader.pnl_7d, type: 'currency' },
            { label: 'PNL 30d', value: trader.pnl_30d, type: 'currency' },
            { label: 'PNL All Time', value: trader.pnl_alltime, type: 'currency' },
            { label: 'ROI 24h', value: trader.roi_24h, type: 'percentage' },
            { label: 'ROI 7d', value: trader.roi_7d, type: 'percentage' },
            { label: 'ROI 30d', value: trader.roi_30d, type: 'percentage' },
            { label: 'ROI All Time', value: trader.roi_alltime, type: 'percentage' },
            { label: 'Volume 24h', value: trader.volume_24h, type: 'currency' },
            { label: 'Volume 7d', value: trader.volume_7d, type: 'currency' },
            { label: 'Volume 30d', value: trader.volume_30d, type: 'currency' },
            { label: 'Volume All Time', value: trader.volume_alltime, type: 'currency' }
        ];

        fields.forEach(field => {
            const item = document.createElement('div');
            item.className = 'position-item';
            
            let formattedValue;
            switch (field.type) {
                case 'currency':
                    formattedValue = '$' + this.formatNumber(field.value);
                    break;
                case 'percentage':
                    formattedValue = this.formatPercentage(field.value);
                    break;
                case 'address':
                    formattedValue = field.value;
                    break;
                default:
                    formattedValue = field.value;
            }

            item.innerHTML = `
                <h5>${field.label}</h5>
                <div class="value ${field.type === 'currency' || field.type === 'percentage' ? (field.value >= 0 ? 'positive' : 'negative') : ''}">${formattedValue}</div>
            `;
            positionGrid.appendChild(item);
        });

        document.getElementById('positionModal').style.display = 'flex';
    }

    hidePositionModal() {
        document.getElementById('positionModal').style.display = 'none';
    }

    showFormulaModal() {
        document.getElementById('formulaName').value = '';
        document.getElementById('formulaExpression').value = '';
        
        // Populate available columns
        const availableColumns = document.getElementById('availableColumns');
        availableColumns.innerHTML = '';
        
        const columns = ['accountValue', 'pnl_24h', 'pnl_7d', 'pnl_30d', 'pnl_alltime', 
                        'roi_24h', 'roi_7d', 'roi_30d', 'roi_alltime',
                        'volume_24h', 'volume_7d', 'volume_30d', 'volume_alltime'];
        
        columns.forEach(column => {
            const tag = document.createElement('span');
            tag.className = 'column-tag';
            tag.textContent = column;
            tag.addEventListener('click', () => {
                const expressionInput = document.getElementById('formulaExpression');
                expressionInput.value += column;
                expressionInput.focus();
            });
            availableColumns.appendChild(tag);
        });

        document.getElementById('formulaModal').style.display = 'flex';
    }

    hideFormulaModal() {
        document.getElementById('formulaModal').style.display = 'none';
    }

    addCustomFormula() {
        const name = document.getElementById('formulaName').value.trim();
        const expression = document.getElementById('formulaExpression').value.trim();

        if (!name || !expression) {
            alert('Please enter both name and formula');
            return;
        }

        // Check if name already exists
        if (this.customFormulas.find(f => f.name === name)) {
            alert('A formula with this name already exists');
            return;
        }

        this.customFormulas.push({ name, expression });
        this.saveCustomFormulas();
        this.processData();
        this.renderTable();
        this.hideFormulaModal();
    }

    exportCSV() {
        if (this.filteredData.length === 0) return;

        const headers = ['Rank', 'Name', 'Address', 'Account Value', 
                        'PNL 24h', 'PNL 7d', 'PNL 30d', 'PNL All Time',
                        'ROI 24h', 'ROI 7d', 'ROI 30d', 'ROI All Time',
                        'Volume 24h', 'Volume 7d', 'Volume 30d', 'Volume All Time'];
        
        // Add custom formula headers
        this.customFormulas.forEach(formula => {
            headers.push(formula.name);
        });

        const csvContent = [
            headers.join(','),
            ...this.filteredData.map(trader => [
                trader.rank,
                `"${trader.displayName}"`,
                trader.ethAddress,
                trader.accountValue,
                trader.pnl_24h,
                trader.pnl_7d,
                trader.pnl_30d,
                trader.pnl_alltime,
                trader.roi_24h,
                trader.roi_7d,
                trader.roi_30d,
                trader.roi_alltime,
                trader.volume_24h,
                trader.volume_7d,
                trader.volume_30d,
                trader.volume_alltime,
                ...this.customFormulas.map(formula => trader[formula.name] || 0)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hyperliquid-leaderboard-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    loadCustomFormulas() {
        try {
            return JSON.parse(localStorage.getItem('hyperliquid-formulas') || '[]');
        } catch {
            return [];
        }
    }

    saveCustomFormulas() {
        localStorage.setItem('hyperliquid-formulas', JSON.stringify(this.customFormulas));
    }

    formatNumber(num) {
        if (num === 0) return '0';
        const absNum = Math.abs(num);
        
        if (absNum >= 1e9) {
            return (num / 1e9).toFixed(2) + 'B';
        } else if (absNum >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        } else if (absNum >= 1e3) {
            return (num / 1e3).toFixed(2) + 'K';
        } else {
            return num.toFixed(2);
        }
    }

    formatPercentage(num) {
        return (num * 100).toFixed(2) + '%';
    }

    truncateAddress(address) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading() {
        document.getElementById('loadingState').style.display = 'flex';
        document.getElementById('errorState').style.display = 'none';
        document.getElementById('tableWrapper').style.display = 'none';
        document.getElementById('paginationContainer').style.display = 'none';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorState').style.display = 'flex';
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('tableWrapper').style.display = 'none';
        document.getElementById('paginationContainer').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'none';
    }

    showTable() {
        document.getElementById('tableWrapper').style.display = 'block';
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new HyperliquidLeaderboard();
});