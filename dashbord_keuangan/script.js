/* ===== DATA STORAGE ===== */
let transactions = [];
let pieChart, barChart;

/* ===== UTILITY FUNCTIONS ===== */

/**
 * Format number to Indonesian Rupiah format
 * @param {number} num - Number to format
 * @returns {string} Formatted rupiah string
 */
function formatRupiah(num) {
    return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Current date
 */
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

/* ===== TRANSACTION FUNCTIONS ===== */

/**
 * Add new transaction
 */
function addTransaction() {
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    // Validation
    if (!description || !amount || amount <= 0) {
        alert('❌ Silakan isi semua data dengan benar!');
        return;
    }

    // Create new transaction object
    const newTransaction = {
        id: Date.now(),
        desc: description,
        amount: amount,
        type: type,
        date: getCurrentDate()
    };

    // Add to array
    transactions.push(newTransaction);

    // Clear input fields
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('type').value = 'expense';

    // Update UI
    updateDashboard();
    console.log('✅ Transaksi ditambahkan:', newTransaction);
}

/**
 * Delete transaction by ID
 * @param {number} id - Transaction ID
 */
function deleteTransaction(id) {
    const initialLength = transactions.length;
    transactions = transactions.filter(t => t.id !== id);
    
    if (transactions.length < initialLength) {
        updateDashboard();
        console.log('✅ Transaksi dihapus');
    }
}

/* ===== CALCULATION FUNCTIONS ===== */

/**
 * Calculate total income
 * @returns {number} Total income
 */
function calculateTotalIncome() {
    return transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate total expense
 * @returns {number} Total expense
 */
function calculateTotalExpense() {
    return transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate balance (income - expense)
 * @returns {number} Balance
 */
function calculateBalance() {
    return calculateTotalIncome() - calculateTotalExpense();
}

/**
 * Group expenses by category
 * @returns {object} Object with category as key and amount as value
 */
function getExpensesByCategory() {
    const expenseByCategory = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            expenseByCategory[t.desc] = (expenseByCategory[t.desc] || 0) + t.amount;
        });
    return expenseByCategory;
}

/* ===== UPDATE UI FUNCTIONS ===== */

/**
 * Update all dashboard components
 */
function updateDashboard() {
    updateSummary();
    updateTable();
    updateCharts();
}

/**
 * Update summary cards with totals
 */
function updateSummary() {
    const income = calculateTotalIncome();
    const expense = calculateTotalExpense();
    const balance = calculateBalance();

    document.getElementById('totalIncome').textContent = formatRupiah(income);
    document.getElementById('totalExpense').textContent = formatRupiah(expense);
    document.getElementById('totalBalance').textContent = formatRupiah(balance);
}

/**
 * Update transaction table
 */
function updateTable() {
    const tbody = document.getElementById('transactionTable');
    tbody.innerHTML = '';

    // Show empty message if no transactions
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">📭 Belum ada transaksi</td></tr>';
        return;
    }

    // Create table rows for each transaction
    transactions.forEach(t => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${t.desc}</td>
            <td>${t.date}</td>
            <td class="${t.type === 'income' ? 'income-text' : 'expense-text'}">
                ${t.type === 'income' ? '+' : '-'} ${formatRupiah(t.amount)}
            </td>
            <td>
                <span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">
                    ${t.type === 'income' ? '💳 Masuk' : '💸 Keluar'}
                </span>
            </td>
            <td>
                <button class="btn-delete" onclick="deleteTransaction(${t.id})">🗑️ Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Update all charts
 */
function updateCharts() {
    updatePieChart();
    updateBarChart();
}

/**
 * Update pie chart - expenses by category
 */
function updatePieChart() {
    const expenseByCategory = getExpensesByCategory();
    const labels = Object.keys(expenseByCategory);
    const data = Object.values(expenseByCategory);

    const ctx = document.getElementById('pieChart').getContext('2d');

    // Destroy old chart if exists
    if (pieChart) {
        pieChart.destroy();
    }

    // Create new pie chart
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels.length > 0 ? labels : ['Belum ada data'],
            datasets: [{
                data: data.length > 0 ? data : [1],
                backgroundColor: [
                    '#3b82f6',
                    '#ef4444',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6',
                    '#ec4899',
                    '#06b6d4',
                    '#f97316',
                ],
                borderColor: '#1e293b',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff',
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const percent = ((value / data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                            return context.label + ': ' + formatRupiah(value) + ' (' + percent + '%)';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update bar chart - income vs expense comparison
 */
function updateBarChart() {
    const income = calculateTotalIncome();
    const expense = calculateTotalExpense();

    const ctx = document.getElementById('barChart').getContext('2d');

    // Destroy old chart if exists
    if (barChart) {
        barChart.destroy();
    }

    // Create new bar chart
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Januari'],
            datasets: [
                {
                    label: 'Pemasukan',
                    data: [income],
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 2,
                    borderRadius: 5
                },
                {
                    label: 'Pengeluaran',
                    data: [expense],
                    backgroundColor: '#ef4444',
                    borderColor: '#dc2626',
                    borderWidth: 2,
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff',
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatRupiah(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        color: '#cbd5e1',
                        callback: function(value) {
                            return formatRupiah(value);
                        }
                    },
                    grid: { color: '#475569' }
                },
                x: {
                    ticks: { color: '#cbd5e1' },
                    grid: { color: '#475569' }
                }
            }
        }
    });
}

/* ===== INITIALIZATION ===== */

/**
 * Initialize dashboard on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
    console.log('✅ Dashboard initialized');
});