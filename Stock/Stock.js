/* =========================================
   🔐 ADMIN ACCESS SYSTEM (built-in)
========================================= */
let isAdmin = false; // becomes true after correct password
function ensureAdmin() {
    if (isAdmin) return true;
    const ADMIN_PASSWORD = "admin123"; // change this if needed
    const pwd = prompt("Admin access required.\nPlease enter admin password:");
    if (pwd === null) return false;
    if (pwd === ADMIN_PASSWORD) {
        isAdmin = true;
        alert("✅ Admin verified. You can now modify stock.");
        return true;
    } else {
        alert("❌ Access denied. Wrong password.");
        return false;
    }
}

/* =========================================
   🌟 MAIN STOCK MANAGEMENT SCRIPT
========================================= */
const STORAGE_KEYS = { PRODUCTS: 'sbm_products', SALES: 'sbm_sales' };

function loadProducts() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || []; }
    catch (e) { return []; }
}
function saveProducts() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}
function loadSales() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES)) || []; }
    catch (e) { return []; }
}
function saveSales() {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
}

// DOM elements
const stockForm = document.getElementById('stockForm');
const nameInput = document.getElementById('name');
const categoryInput = document.getElementById('category');
const quantityInput = document.getElementById('quantity');
const unitInput = document.getElementById('unit');
const priceInput = document.getElementById('price');
const costInput = document.getElementById('cost');
const searchInput = document.getElementById('search');
const stockTableBody = document.querySelector('#stockTable tbody');
const clearAllBtn = document.getElementById('clearAll');
const exportCSVBtn = document.getElementById('exportCSVBtn');

// Data
let products = loadProducts();
let sales = loadSales(); // only for clear all

function formatCurrency(v) { return "₹" + Number(v).toFixed(2); }
function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Add / Edit product (admin protected)
stockForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!ensureAdmin()) return; // admin check

    const name = nameInput.value.trim();
    const category = categoryInput.value.trim();
    const qty = Number(quantityInput.value);
    const unit = unitInput.value;
    const price = Number(priceInput.value);
    const cost = Number(costInput.value);

    if (!name || !category || !isFinite(qty) || qty < 0 ||
        !isFinite(price) || price <= 0 || !isFinite(cost) || cost < 0) {
        alert("Please fill valid product data.");
        return;
    }

    const product = { id: Date.now(), name, category, quantity: qty, unit, price, cost };
    products.push(product);
    saveProducts();
    displayProducts(searchInput.value);
    stockForm.reset();
    nameInput.focus();
});

// Display products
function displayProducts(filter = "") {
    const f = (filter || "").toLowerCase();
    stockTableBody.innerHTML = "";
    if (products.length === 0) {
        stockTableBody.innerHTML = "<tr><td colspan='6' style='text-align:center'>No products added</td></tr>";
        return;
    }
    products
        .filter(p => p.name.toLowerCase().includes(f) || p.category.toLowerCase().includes(f))
        .forEach(p => {
            const totalValue = p.quantity * p.price;
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.category)}</td>
        <td>${p.quantity} ${escapeHtml(p.unit)}</td>
        <td>${formatCurrency(p.price)}</td>
        <td>${formatCurrency(totalValue)}</td>
        <td>
          <button type="button" onclick="editProduct(${p.id})">Edit</button>
          <button type="button" class="delete-btn" onclick="deleteProduct(${p.id})">Delete</button>
        </td>`;
            stockTableBody.appendChild(tr);
        });
}

// Edit & Delete (admin protected)
window.deleteProduct = function (id) {
    if (!ensureAdmin()) return;
    if (!confirm("Delete product?")) return;
    products = products.filter(p => p.id !== id);
    saveProducts();
    displayProducts(searchInput.value);
};

window.editProduct = function (id) {
    if (!ensureAdmin()) return;
    const p = products.find(x => x.id === id);
    if (!p) return;
    nameInput.value = p.name;
    categoryInput.value = p.category;
    quantityInput.value = p.quantity;
    unitInput.value = p.unit;
    priceInput.value = p.price;
    costInput.value = p.cost;
    products = products.filter(x => x.id !== id);
    saveProducts();
    displayProducts(searchInput.value);
    nameInput.focus();
};

// Search
searchInput.addEventListener('input', function () { displayProducts(this.value); });

// Clear all (admin protected)
clearAllBtn.addEventListener('click', function () {
    if (!ensureAdmin()) return;
    if (!confirm("Clear ALL products and sales data?")) return;
    products = [];
    sales = [];
    saveProducts();
    saveSales();
    displayProducts();
    alert("All products and sales cleared.");
});

// Export stock CSV
exportCSVBtn.addEventListener('click', function () {
    if (products.length === 0) { alert("No stock to export"); return; }
    const rows = [
        ["name", "category", "quantity", "unit", "price", "cost"],
        ...products.map(p => [p.name, p.category, p.quantity, p.unit, p.price, p.cost])
    ];
    if (typeof XLSX === "undefined") {
        alert("XLSX library not loaded. Please include SheetJS to export Excel.\nRows logged in console.");
        console.log("CSV rows:", rows);
        return;
    }
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock");
    XLSX.writeFile(workbook, `stock_${Date.now()}.xlsx`);
});

// Initial display
displayProducts();

// Highlight active nav
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.nav-link');
    const current = location.pathname.split('/').pop();
    links.forEach(link => {
        if (link.getAttribute('href') === current) link.classList.add('active');
    });
});
