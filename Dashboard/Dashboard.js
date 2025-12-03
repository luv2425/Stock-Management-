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

// Main dashboard logic
function initDashboard() {
    const products = loadProducts();
    const sales = loadSales();

    // Top cards
    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
    const totalStockValue = products.reduce(
        (sum, p) => sum + Number(p.quantity || 0) * Number(p.price || 0),
        0
    );

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalQuantity').textContent = totalQuantity;
    document.getElementById('totalStockValue').textContent = formatCurrency(totalStockValue);

    // Today's sales & profit
    const todayStr = new Date().toDateString();
    let todaySalesTotal = 0;
    let todayProfitTotal = 0;

    sales.forEach(s => {
        const d = new Date(s.date);
        if (d.toDateString() === todayStr) {
            todaySalesTotal += Number(s.total || 0);
            todayProfitTotal += Number(s.total || 0) - Number(s.cost || 0);
        }
    });

    document.getElementById('todaySales').textContent = formatCurrency(todaySalesTotal);
    document.getElementById('todayProfit').textContent = formatCurrency(todayProfitTotal);

    // Low stock table (below 50)
    const lowStockBody = document.getElementById('lowStockBody');
    lowStockBody.innerHTML = "";
    const lowItems = products.filter(p => Number(p.quantity || 0) < 50);

    if (lowItems.length === 0) {
        lowStockBody.innerHTML = "<tr><td colspan='4' style='text-align:center'>No low stock items</td></tr>";
    } else {
        lowItems.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>${p.quantity}</td>
        <td>${p.unit}</td>
      `;
            lowStockBody.appendChild(tr);
        });
    }

    // Recent sales (last 5)
    const recentSalesBody = document.getElementById('recentSalesBody');
    recentSalesBody.innerHTML = "";
    const sortedSales = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = sortedSales.slice(0, 5);

    if (recent.length === 0) {
        recentSalesBody.innerHTML = "<tr><td colspan='4' style='text-align:center'>No sales yet</td></tr>";
    } else {
        recent.forEach(s => {
            const d = new Date(s.date);
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${d.toLocaleString()}</td>
        <td>${s.customer || "Walk-in"}</td>
        <td>${(s.items && s.items.length) || 0}</td>
        <td>${formatCurrency(s.total || 0)}</td>
      `;
            recentSalesBody.appendChild(tr);
        });
    }

    // Sales last 7 days chart data
    const labels = [];
    const dataSales = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
        labels.push(label);

        const sumForDay = sales
            .filter(s => new Date(s.date).toDateString() === d.toDateString())
            .reduce((sum, s) => sum + Number(s.total || 0), 0);

        dataSales.push(sumForDay);
    }

    const ctx = document.getElementById('salesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Sales (₹)',
                data: dataSales
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (ctx) {
                            return '₹' + Number(ctx.parsed.y).toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initDashboard();

    // Highlight active navbar pill
    const current = location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.nav a').forEach(link => {
        if (link.getAttribute('href') === current) {
            link.classList.add('active');
        }
    });
});
