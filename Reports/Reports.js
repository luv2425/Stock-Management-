// ---- Shared storage helpers ----
const STORAGE_KEYS = {
    PRODUCTS: 'sbm_products',
    SALES: 'sbm_sales'
};

function loadProducts() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || []; }
    catch (e) { return []; }
}

function loadSales() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES)) || []; }
    catch (e) { return []; }
}

function formatCurrency(v) { return "₹" + Number(v).toFixed(2); }

// ---- DOM ----
const salesReportBtn = document.getElementById('salesReportBtn');
const stockReportBtn = document.getElementById('stockReportBtn');
const profitReportBtn = document.getElementById('profitReportBtn');
const reportOutput = document.getElementById('reportOutput');

// Daily Sales Report
function generateSalesReport() {
    const sales = loadSales();
    const today = new Date().toDateString();
    const todays = sales.filter(s => new Date(s.date).toDateString() === today);
    let out = `Daily Sales Report — ${today}\n`;
    if (todays.length === 0) out += "(No sales today)\n";
    else {
        let t = 0;
        todays.forEach(s => {
            out += `${s.customer} • ${formatCurrency(s.total)}\n`;
            t += s.total || 0;
        });
        out += `\nTotal: ${formatCurrency(t)}\n`;
    }
    reportOutput.textContent = out;
}

// Stock Remaining Report
function generateStockReport() {
    const products = loadProducts();
    let out = "Stock Remaining:\n";
    if (products.length === 0) out += "(No products)\n";
    else products.forEach(p => {
        out += `${p.name}: ${p.quantity} ${p.unit}\n`;
    });
    reportOutput.textContent = out;
}

// Profit / Loss Report
function generateProfitLoss() {
    const sales = loadSales();
    let totalSales = sales.reduce((a, s) => a + (s.total || 0), 0);
    let totalCost = sales.reduce((a, s) => a + (s.cost || 0), 0);
    let profit = totalSales - totalCost;
    let out = `Profit / Loss Report\n` +
        `Total Sales: ${formatCurrency(totalSales)}\n` +
        `Total Cost: ${formatCurrency(totalCost)}\n` +
        `Profit: ${formatCurrency(profit)}\n`;
    reportOutput.textContent = out;
}

// Wire buttons
salesReportBtn.addEventListener('click', generateSalesReport);
stockReportBtn.addEventListener('click', generateStockReport);
profitReportBtn.addEventListener('click', generateProfitLoss);

// Highlight active navbar pill
document.addEventListener('DOMContentLoaded', function () {
    const current = location.pathname.split('/').pop() || 'reports.html';
    document.querySelectorAll('.nav a').forEach(link => {
        if (link.getAttribute('href') === current) {
            link.classList.add('active');
        }
    });
});
