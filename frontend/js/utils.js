/* =====================================
   🔧 SHARED UTILITIES — utils.js
   Common functions shared across admin.js and student.js
===================================== */

/* =====================================
   TOAST NOTIFICATIONS
===================================== */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span>${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

/* =====================================
   THEME TOGGLE
===================================== */
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    const icon = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');
    if (icon) icon.textContent = isLight ? '☀️' : '🌙';
    if (label) label.textContent = isLight ? 'Light' : 'Dark';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Apply saved theme
(function () {
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        const icon = document.getElementById('themeIcon');
        const label = document.getElementById('themeLabel');
        if (icon) icon.textContent = '☀️';
        if (label) label.textContent = 'Light';
    }
})();

/* =====================================
   SIDEBAR COLLAPSE / MOBILE TOGGLE
===================================== */
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    // Mobile: toggle mobile-open class
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-open');
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

/* =====================================
   LOADING OVERLAY
===================================== */
function showLoading() {
    const el = document.getElementById('loadingOverlay');
    if (el) el.classList.add('active');
}

function hideLoading() {
    const el = document.getElementById('loadingOverlay');
    if (el) el.classList.remove('active');
}

/* =====================================
   PAGINATION HELPER
===================================== */
function renderPagination(containerId, currentPage, totalPages, onPageChange) {
    let container = document.getElementById(containerId);

    // Create if doesn't exist
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'pagination';
        // Try to insert after the table-container or card-grid that's nearby
        const parent = document.querySelector(`#${containerId.replace('Pagination', 'Table')}`)?.closest('.table-container')
            || document.querySelector(`#${containerId.replace('Pagination', 'Cards')}`)?.closest('section');
        if (parent) parent.appendChild(container);
    }

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = `<button ${currentPage === 1 ? 'disabled' : ''} onclick="${onPageChange}(${currentPage - 1})">← Prev</button>`;

    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) html += `<button onclick="${onPageChange}(1)">1</button><span class="page-info">…</span>`;

    for (let i = start; i <= end; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="${onPageChange}(${i})">${i}</button>`;
    }

    if (end < totalPages) html += `<span class="page-info">…</span><button onclick="${onPageChange}(${totalPages})">${totalPages}</button>`;

    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="${onPageChange}(${currentPage + 1})">Next →</button>`;
    html += `<span class="page-info">Page ${currentPage} of ${totalPages}</span>`;

    container.innerHTML = html;
}

/* =====================================
   LOGOUT
===================================== */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = '../login.html';
}
