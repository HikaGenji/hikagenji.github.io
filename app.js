// Global variables
let rawData = [];
let processedData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 25;
let sortColumn = null;
let sortDirection = 'asc';
let columnVisibility = {};
let formulaColumns = [];

// Sample data for fallback
const sampleData = {
    "leaderboardRows": [
        {
            "ethAddress": "0x162cc7c861ebd0c06b3d72319201150482518185",
            "accountValue": "23915296.2258189991",
            "windowPerformances": [
                ["day", {"pnl": "347007.849075", "roi": "0.0182621954", "vlm": "980682602.4590859413"}],
                ["week", {"pnl": "1498760.4442059998", "roi": "0.0559342634", "vlm": "8130771000.0"}],
                ["month", {"pnl": "6522560.4429249987", "roi": "0.2503736772", "vlm": "42163750000.0"}],
                ["allTime", {"pnl": "20613478.1239800006", "roi": "1.3761266178", "vlm": "122710000000.0"}]
            ]
        },
        {
            "ethAddress": "0x8ba1f109551bd432803012645hac136c22c85e05",
            "accountValue": "18750000.5",
            "windowPerformances": [
                ["day", {"pnl": "-125000.50", "roi": "-0.0067", "vlm": "750000000.0"}],
                ["week", {"pnl": "850000.25", "roi": "0.0453", "vlm": "5500000000.0"}],
                ["month", {"pnl": "3200000.75", "roi": "0.1707", "vlm": "28000000000.0"}],
                ["allTime", {"pnl": "12500000.0", "roi": "0.6667", "vlm": "95000000000.0"}]
            ]
        },
        {
            "ethAddress": "0x3c44cdddb6a900fa2b585dd299e03d12fa429236",
            "accountValue": "15632890.75",
            "windowPerformances": [
                ["day", {"pnl": "89000.25", "roi": "0.0057", "vlm": "450000000.0"}],
                ["week", {"pnl": "625000.80", "roi": "0.0400", "vlm": "3200000000.0"}],
                ["month", {"pnl": "2100000.50", "roi": "0.1343", "vlm": "18500000000.0"}],
                ["allTime", {"pnl": "8950000.25", "roi": "0.5726", "vlm": "67000000000.0"}]
            ]
        },
        {
            "ethAddress": "0x742d35cc6634c0532925a3b8a4c23ca52a7e2e4e",
            "accountValue": "12450000.0",
            "windowPerformances": [
                ["day", {"pnl": "156000.75", "roi": "0.0125", "vlm": "320000000.0"}],
                ["week", {"pnl": "-200000.25", "roi": "-0.0161", "vlm": "2100000000.0"}],
                ["month", {"pnl": "1850000.0", "roi": "0.1486", "vlm": "15000000000.0"}],
                ["allTime", {"pnl": "7200000.50", "roi": "0.5783", "vlm": "52000000000.0"}]
            ]
        },
        {
            "ethAddress": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
            "accountValue": "9875432.10",
            "windowPerformances": [
                ["day", {"pnl": "-45000.30", "roi": "-0.0046", "vlm": "180000000.0"}],
                ["week", {"pnl": "425000.60", "roi": "0.0430", "vlm": "1800000000.0"}],
                ["month", {"pnl": "1200000.75", "roi": "0.1215", "vlm": "12000000000.0"}],
                ["allTime", {"pnl": "5675432.10", "roi": "0.5745", "vlm": "41000000000.0"}]
            ]
        },
        {
            "ethAddress": "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
            "accountValue": "8234567.89",
            "windowPerformances": [
                ["day", {"pnl": "75000.50", "roi": "0.0091", "vlm": "250000000.0"}],
                ["week", {"pnl": "320000.25", "roi": "0.0389", "vlm": "1600000000.0"}],
                ["month", {"pnl": "980000.40", "roi": "0.1190", "vlm": "9800000000.0"}],
                ["allTime", {"pnl": "4234567.89", "roi": "0.5142", "vlm": "35000000000.0"}]
            ]
        },
        {
            "ethAddress": "0x9965507d1a55bc6ae40d8f23a5d10fe006640894",
            "accountValue": "7654321.50",
            "windowPerformances": [
                ["day", {"pnl": "-25000.80", "roi": "-0.0033", "vlm": "120000000.0"}],
                ["week", {"pnl": "180000.90", "roi": "0.0235", "vlm": "1200000000.0"}],
                ["month", {"pnl": "765000.60", "roi": "0.0999", "vlm": "7500000000.0"}],
                ["allTime", {"pnl": "3654321.50", "roi": "0.4773", "vlm": "28000000000.0"}]
            ]
        },
        {
            "ethAddress": "0x976ea74026e726554db657fa54763abd0c3a0aa9",
            "accountValue": "6543210.75",
            "windowPerformances": [
                ["day", {"pnl": "32000.25", "roi": "0.0049", "vlm": "160000000.0"}],
                ["week", {"pnl": "285000.50", "roi": "0.0436", "vlm": "1400000000.0"}],
                ["month", {"pnl": "654000.30", "roi": "0.0999", "vlm": "6500000000.0"}],
                ["allTime", {"pnl": "2843210.75", "roi": "0.4346", "vlm": "24000000000.0"}]
            ]
        },
        {
            "ethAddress": "0x14dc79964da2c08b23698b3d3cc7ca32193d9955",
            "accountValue": "5432109.60",
            "windowPerformances": [
                ["day", {"pnl": "54000.70", "roi": "0.0099", "vlm": "210000000.0"}],
                ["week", {"pnl": "-85000.25", "roi": "-0.0156", "vlm": "1100000000.0"}],
                ["month", {"pnl": "543000.80", "roi": "0.0999", "vlm": "5400000000.0"}],
                ["allTime", {"pnl": "2432109.60", "roi": "0.4477", "vlm": "20000000000.0"}]
            ]
        },
        {
            "ethAddress": "0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f",
            "accountValue": "4321098.45",
            "windowPerformances": [
                ["day", {"pnl": "-15000.60", "roi": "-0.0035", "vlm": "90000000.0"}],
                ["week", {"pnl": "216000.75", "roi": "0.0500", "vlm": "900000000.0"}],
                ["month", {"pnl": "432000.90", "roi": "0.0999", "vlm": "4300000000.0"}],
                ["allTime", {"pnl": "1821098.45", "roi": "0.4213", "vlm": "16000000000.0"}]
            ]
        }
    ]
};

// Column definitions
const baseColumns = [
    { key: 'rank', name: 'Rank', type: 'number' },
    { key: 'ethAddress', name: 'Address', type: 'address' },
    { key: 'accountValue', name: 'Account Value', type: 'currency' },
    { key: 'pnl_24h', name: 'PnL 24h', type: 'currency' },
    { key: 'roi_24h', name: 'ROI 24h', type: 'percentage' },
    { key: 'volume_24h', name: 'Volume 24h', type: 'currency' },
    { key: 'pnl_7d', name: 'PnL 7d', type: 'currency' },
    { key: 'roi_7d', name: 'ROI 7d', type: 'percentage' },
    { key: 'volume_7d', name: 'Volume 7d', type: 'currency' },
    { key: 'pnl_30d', name: 'PnL 30d', type: 'currency' },
    { key: 'roi_30d', name: 'ROI 30d', type: 'percentage' },
    { key: 'volume_30d', name: 'Volume 30d', type: 'currency' },
    { key: 'pnl_allTime', name: 'PnL All Time', type: 'currency' },
    { key: 'roi_allTime', name: 'ROI All Time', type: 'percentage' },
    { key: 'volume_allTime', name: 'Volume All Time', type: 'currency' }
];

// Initialize column visibility
function initializeColumnVisibility() {
    baseColumns.forEach(col => {
        columnVisibility[col.key] = true;
    });
}

// Fetch data from API with fallback
async function fetchData() {
    try {
        showLoading();
        
        // Try to fetch from API first
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch('https://stats-data.hyperliquid.xyz/Mainnet/leaderboard', {
                signal: controller.signal,
                mode: 'cors'
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            rawData = data.leaderboardRows || [];
            
            console.log('Successfully fetched live data from API');
            
        } catch (apiError) {
            console.warn('Failed to fetch from API, using sample data:', apiError.message);
            // Use sample data as fallback
            rawData = sampleData.leaderboardRows;
        }
        
        processData();
        updateUI();
        hideLoading();
        
        // Update status info
        document.getElementById('total-traders').textContent = `Total Traders: ${rawData.length}`;
        document.getElementById('last-updated').textContent = `Last Updated: ${new Date().toLocaleString()}`;
        
    } catch (error) {
        console.error('Error in fetchData:', error);
        showError(error.message);
    }
}

// Process raw data into flat structure
function processData() {
    processedData = rawData.map((row, index) => {
        const processed = {
            rank: index + 1,
            ethAddress: row.ethAddress,
            accountValue: parseFloat(row.accountValue) || 0
        };
        
        // Process window performances
        if (row.windowPerformances) {
            row.windowPerformances.forEach(([period, metrics]) => {
                const suffix = period === 'day' ? '24h' : 
                             period === 'week' ? '7d' : 
                             period === 'month' ? '30d' : 'allTime';
                
                processed[`pnl_${suffix}`] = parseFloat(metrics.pnl) || 0;
                processed[`roi_${suffix}`] = parseFloat(metrics.roi) || 0;
                processed[`volume_${suffix}`] = parseFloat(metrics.vlm) || 0;
            });
        }
        
        return processed;
    });
    
    // Sort by account value by default
    processedData.sort((a, b) => b.accountValue - a.accountValue);
    
    // Update ranks after sorting
    processedData.forEach((item, index) => {
        item.rank = index + 1;
    });
    
    filteredData = [...processedData];
}

// Format numbers for display
function formatNumber(value, type) {
    if (value === null || value === undefined || isNaN(value)) return '-';
    
    switch (type) {
        case 'currency':
            if (Math.abs(value) >= 1e9) {
                return '$' + (value / 1e9).toFixed(2) + 'B';
            } else if (Math.abs(value) >= 1e6) {
                return '$' + (value / 1e6).toFixed(2) + 'M';
            } else if (Math.abs(value) >= 1e3) {
                return '$' + (value / 1e3).toFixed(2) + 'K';
            } else {
                return '$' + value.toFixed(2);
            }
        case 'percentage':
            return (value * 100).toFixed(2) + '%';
        case 'address':
            return value.slice(0, 6) + '...' + value.slice(-4);
        case 'number':
            return value.toLocaleString();
        default:
            return value.toString();
    }
}

// Get CSS class for number values
function getNumberClass(value, type) {
    if (type === 'currency' || type === 'percentage') {
        return value > 0 ? 'positive' : value < 0 ? 'negative' : '';
    }
    return '';
}

// Render table
function renderTable() {
    const table = document.getElementById('leaderboard-table');
    const header = document.getElementById('table-header');
    const filterRow = document.getElementById('filter-row');
    const tbody = document.getElementById('table-body');
    
    // Clear existing content
    header.innerHTML = '';
    filterRow.innerHTML = '';
    tbody.innerHTML = '';
    
    // Get all columns (base + formula)
    const allColumns = [...baseColumns, ...formulaColumns];
    
    // Render header
    allColumns.forEach(col => {
        if (!columnVisibility[col.key]) return;
        
        const th = document.createElement('th');
        th.textContent = col.name;
        th.classList.add('sortable');
        th.onclick = () => sortTable(col.key);
        
        if (sortColumn === col.key) {
            th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
        }
        
        if (col.isFormula) {
            th.classList.add('formula-column');
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-formula';
            deleteBtn.innerHTML = '×';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteFormulaColumn(col.key);
            };
            th.appendChild(deleteBtn);
        }
        
        header.appendChild(th);
    });
    
    // Render filter row
    allColumns.forEach(col => {
        if (!columnVisibility[col.key]) return;
        
        const th = document.createElement('th');
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Filter ${col.name}`;
        input.addEventListener('input', applyFilters);
        input.dataset.column = col.key;
        th.appendChild(input);
        filterRow.appendChild(th);
    });
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    // Render data rows
    pageData.forEach((row, index) => {
        const tr = document.createElement('tr');
        
        // Add rank-based styling
        const globalRank = startIndex + index + 1;
        if (globalRank <= 3) {
            tr.classList.add(`rank-${globalRank}`);
        }
        
        allColumns.forEach(col => {
            if (!columnVisibility[col.key]) return;
            
            const td = document.createElement('td');
            let value = row[col.key];
            
            // Calculate formula columns
            if (col.isFormula) {
                value = calculateFormula(col.formula, row);
            }
            
            td.textContent = formatNumber(value, col.type);
            
            // Add CSS classes
            const numberClass = getNumberClass(value, col.type);
            if (numberClass) td.classList.add(numberClass);
            if (col.type) td.classList.add(col.type);
            
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    
    updatePagination();
}

// Sort table
function sortTable(columnKey) {
    console.log('Sorting by column:', columnKey);
    
    if (sortColumn === columnKey) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = columnKey;
        sortDirection = 'asc';
    }
    
    filteredData.sort((a, b) => {
        let aVal = a[columnKey];
        let bVal = b[columnKey];
        
        // Handle formula columns
        const formulaCol = formulaColumns.find(col => col.key === columnKey);
        if (formulaCol) {
            aVal = calculateFormula(formulaCol.formula, a);
            bVal = calculateFormula(formulaCol.formula, b);
        }
        
        // Handle null/undefined values
        if (aVal === null || aVal === undefined) aVal = 0;
        if (bVal === null || bVal === undefined) bVal = 0;
        
        // Numeric comparison
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        // String comparison
        const aStr = aVal.toString().toLowerCase();
        const bStr = bVal.toString().toLowerCase();
        
        if (sortDirection === 'asc') {
            return aStr.localeCompare(bStr);
        } else {
            return bStr.localeCompare(aStr);
        }
    });
    
    currentPage = 1;
    renderTable();
}

// Apply filters
function applyFilters() {
    console.log('Applying filters...');
    
    const filterInputs = document.querySelectorAll('#filter-row input');
    const globalSearch = document.getElementById('global-search').value.toLowerCase();
    
    filteredData = processedData.filter(row => {
        // Global search
        if (globalSearch && !row.ethAddress.toLowerCase().includes(globalSearch)) {
            return false;
        }
        
        // Column filters
        for (let input of filterInputs) {
            const column = input.dataset.column;
            const filterValue = input.value.toLowerCase();
            
            if (filterValue) {
                let cellValue = row[column];
                
                // Handle formula columns
                const formulaCol = formulaColumns.find(col => col.key === column);
                if (formulaCol) {
                    cellValue = calculateFormula(formulaCol.formula, row);
                }
                
                if (cellValue === null || cellValue === undefined) {
                    return false;
                }
                
                const cellString = cellValue.toString().toLowerCase();
                if (!cellString.includes(filterValue)) {
                    return false;
                }
            }
        }
        
        return true;
    });
    
    currentPage = 1;
    renderTable();
}

// Update pagination
function updatePagination() {
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    document.getElementById('pagination-info').textContent = 
        `Showing ${startItem}-${endItem} of ${totalItems} entries`;
    
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
    
    // Render page numbers
    const pageNumbers = document.getElementById('page-numbers');
    pageNumbers.innerHTML = '';
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('a');
        pageButton.href = '#';
        pageButton.className = 'page-number';
        pageButton.textContent = i;
        
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        
        pageButton.onclick = (e) => {
            e.preventDefault();
            currentPage = i;
            renderTable();
        };
        
        pageNumbers.appendChild(pageButton);
    }
}

// Column visibility
function setupColumnVisibility() {
    const container = document.getElementById('column-checkboxes');
    container.innerHTML = '';
    
    const allColumns = [...baseColumns, ...formulaColumns];
    
    allColumns.forEach(col => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `col-${col.key}`;
        checkbox.checked = columnVisibility[col.key];
        checkbox.addEventListener('change', () => {
            columnVisibility[col.key] = checkbox.checked;
            renderTable();
        });
        
        const label = document.createElement('label');
        label.htmlFor = `col-${col.key}`;
        label.textContent = col.name;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
    });
}

// Formula calculations
function calculateFormula(formula, row) {
    try {
        // Replace column names with values
        let expression = formula;
        
        const allColumns = [...baseColumns, ...formulaColumns];
        allColumns.forEach(col => {
            const regex = new RegExp(`\\b${col.key}\\b`, 'g');
            const value = row[col.key] || 0;
            expression = expression.replace(regex, value.toString());
        });
        
        // Basic validation - only allow numbers, operators, and parentheses
        if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
            throw new Error('Invalid characters in formula');
        }
        
        // Evaluate the expression safely
        const result = new Function('return ' + expression)();
        return isNaN(result) ? 0 : result;
    } catch (error) {
        console.error('Formula calculation error:', error);
        return 0;
    }
}

// Add formula column
function addFormulaColumn() {
    const name = document.getElementById('formula-name').value.trim();
    const formula = document.getElementById('formula-expression').value.trim();
    
    if (!name || !formula) {
        alert('Please provide both column name and formula expression.');
        return;
    }
    
    // Generate unique key
    const key = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    
    // Check if key already exists
    const allColumns = [...baseColumns, ...formulaColumns];
    if (allColumns.some(col => col.key === key)) {
        alert('A column with this name already exists.');
        return;
    }
    
    // Test formula
    try {
        if (processedData.length > 0) {
            calculateFormula(formula, processedData[0]);
        }
    } catch (error) {
        alert('Invalid formula expression. Please check your syntax.');
        return;
    }
    
    // Add formula column
    formulaColumns.push({
        key: key,
        name: name,
        formula: formula,
        type: 'number',
        isFormula: true
    });
    
    columnVisibility[key] = true;
    
    // Clear form and close modal
    document.getElementById('formula-name').value = '';
    document.getElementById('formula-expression').value = '';
    closeModal('formula-modal');
    
    renderTable();
    setupColumnVisibility();
}

// Delete formula column
function deleteFormulaColumn(key) {
    if (confirm('Are you sure you want to delete this formula column?')) {
        formulaColumns = formulaColumns.filter(col => col.key !== key);
        delete columnVisibility[key];
        renderTable();
        setupColumnVisibility();
    }
}

// Export to CSV
function exportToCSV() {
    const allColumns = [...baseColumns, ...formulaColumns].filter(col => columnVisibility[col.key]);
    
    // Create CSV header
    const headers = allColumns.map(col => col.name);
    let csvContent = headers.join(',') + '\n';
    
    // Add data rows
    filteredData.forEach(row => {
        const values = allColumns.map(col => {
            let value = row[col.key];
            
            if (col.isFormula) {
                value = calculateFormula(col.formula, row);
            }
            
            if (value === null || value === undefined) return '';
            
            // Escape commas and quotes
            let strValue = value.toString();
            if (strValue.includes(',') || strValue.includes('"')) {
                strValue = '"' + strValue.replace(/"/g, '""') + '"';
            }
            
            return strValue;
        });
        
        csvContent += values.join(',') + '\n';
    });
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hyperliquid-leaderboard-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Modal functions
function openModal(modalId) {
    console.log('Opening modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        if (modalId === 'columns-modal') {
            setupColumnVisibility();
        } else if (modalId === 'formula-modal') {
            setupFormulaModal();
        }
    } else {
        console.error('Modal not found:', modalId);
    }
}

function closeModal(modalId) {
    console.log('Closing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function setupFormulaModal() {
    const container = document.getElementById('available-columns');
    container.innerHTML = '';
    
    const allColumns = [...baseColumns, ...formulaColumns];
    allColumns.forEach(col => {
        const tag = document.createElement('span');
        tag.className = 'column-tag';
        tag.textContent = col.key;
        container.appendChild(tag);
    });
}

// UI state functions
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('error').style.display = 'none';
    document.getElementById('table-container').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('table-container').style.display = 'block';
}

function showError(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'flex';
    document.getElementById('error-text').textContent = message;
    document.getElementById('table-container').style.display = 'none';
}

function updateUI() {
    renderTable();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing app...');
    
    initializeColumnVisibility();
    
    // Button event listeners
    const refreshBtn = document.getElementById('refresh-btn');
    const columnsBtn = document.getElementById('columns-btn');
    const addFormulaBtn = document.getElementById('add-formula-btn');
    const exportBtn = document.getElementById('export-btn');
    
    if (refreshBtn) refreshBtn.addEventListener('click', fetchData);
    if (columnsBtn) columnsBtn.addEventListener('click', () => openModal('columns-modal'));
    if (addFormulaBtn) addFormulaBtn.addEventListener('click', () => openModal('formula-modal'));
    if (exportBtn) exportBtn.addEventListener('click', exportToCSV);
    
    // Pagination event listeners
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    
    if (prevPage) {
        prevPage.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
    }
    
    if (nextPage) {
        nextPage.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredData.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
    }
    
    // Search event listener
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', applyFilters);
    }
    
    // Modal close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
            }
        });
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Initial data fetch
    console.log('Starting initial data fetch...');
    fetchData();
});

// Make functions globally available for onclick handlers
window.openModal = openModal;
window.closeModal = closeModal;
window.addFormulaColumn = addFormulaColumn;
window.fetchData = fetchData;