const API = "http://localhost:5000";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "../login.html";
}

// Display profile name
const profileName = localStorage.getItem("username");
if (profileName) {
  const el = document.getElementById("profileName");
  if (el) el.textContent = profileName;
}

let allApplications = [];
let allSchemes = [];
let allInternships = [];
let allEvents = [];

// Pagination state
const ROWS_PER_PAGE = 10;
let appPage = 1;
let dashAppPage = 1;
let schemePage = 1;
let internshipPage = 1;
let eventPage = 1;

/* =====================================
   LOADING SKELETONS
===================================== */
function showSkeletonRows(tableId, cols = 6, rows = 5) {
  const table = document.getElementById(tableId);
  if (!table) return;
  table.innerHTML = '';
  for (let i = 0; i < rows; i++) {
    let cells = '';
    for (let j = 0; j < cols; j++) {
      const w = 40 + Math.random() * 50;
      cells += `<td><div class="skeleton-box" style="width:${w}%"></div></td>`;
    }
    table.innerHTML += `<tr class="skeleton-row">${cells}</tr>`;
  }
}

/* =====================================
   LOAD DASHBOARD STATS + CHARTS
===================================== */
let statusPieChart = null;
let monthlyBarChart = null;

async function loadStats() {
  try {
    const res = await fetch(`${API}/api/admin/applications/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    animateCounter('totalCount', data.total || 0);
    animateCounter('pendingCount', data.pending || 0);
    animateCounter('approvedCount', data.approved || 0);
    animateCounter('rejectedCount', data.rejected || 0);

    // Render pie chart
    renderStatusChart(data);

  } catch (err) {
    console.error("Error loading stats:", err);
  }
}

/* =====================================
   PIE CHART — STATUS BREAKDOWN
===================================== */
function renderStatusChart(data) {
  const ctx = document.getElementById('statusPieChart');
  if (!ctx) return;

  if (statusPieChart) statusPieChart.destroy();

  statusPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [{
        data: [data.approved || 0, data.pending || 0, data.rejected || 0],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderColor: ['#16a34a', '#d97706', '#dc2626'],
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8',
            font: { family: 'Inter', size: 12 },
            padding: 16,
            usePointStyle: true
          }
        }
      }
    }
  });
}

/* =====================================
   BAR CHART — MONTHLY TRENDS
===================================== */
function renderMonthlyChart(applications) {
  const ctx = document.getElementById('monthlyBarChart');
  if (!ctx) return;

  if (monthlyBarChart) monthlyBarChart.destroy();

  // Group by month
  const monthCounts = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  applications.forEach(app => {
    const d = new Date(app.applied_at);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    monthCounts[key] = (monthCounts[key] || 0) + 1;
  });

  // Get last 6 months
  const labels = Object.keys(monthCounts).slice(-6);
  const values = labels.map(l => monthCounts[l]);

  monthlyBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['No Data'],
      datasets: [{
        label: 'Applications',
        data: values.length ? values : [0],
        backgroundColor: 'rgba(124, 58, 237, 0.6)',
        borderColor: '#7c3aed',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#64748b', font: { family: 'Inter' }, stepSize: 1 },
          grid: { color: 'rgba(100,116,139,0.08)' }
        },
        x: {
          ticks: { color: '#64748b', font: { family: 'Inter' } },
          grid: { display: false }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
        }
      }
    }
  });
}

/* =====================================
   ACTIVITY LOG
===================================== */
function renderActivityLog(applications) {
  const container = document.getElementById('activityLog');
  if (!container) return;

  // Sort by date descending and take latest 10
  const sorted = [...applications].sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at)).slice(0, 10);

  if (!sorted.length) {
    container.innerHTML = '<p class="no-data">No recent activity</p>';
    return;
  }

  container.innerHTML = sorted.map(app => {
    const dotClass = app.status === 'approved' ? 'dot-approved'
      : app.status === 'rejected' ? 'dot-rejected'
        : 'dot-pending';

    const action = app.status === 'approved' ? 'was approved'
      : app.status === 'rejected' ? 'was rejected'
        : 'is pending review';

    const timeAgo = getTimeAgo(new Date(app.applied_at));

    return `
      <div class="activity-item">
        <div class="activity-dot ${dotClass}"></div>
        <div class="activity-text">
          <strong>${app.username}</strong>'s application for <strong>${app.scheme_name}</strong> ${action}
        </div>
        <div class="activity-time">${timeAgo}</div>
      </div>
    `;
  }).join('');
}

function getTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

/* =====================================
   EXPORT CSV
===================================== */
function exportCSV() {
  if (!allApplications.length) {
    showToast('No application data to export', 'warning');
    return;
  }

  const headers = ['S.No', 'Username', 'Email', 'Scheme', 'Status', 'Applied Date'];
  const rows = allApplications.map((app, i) => [
    i + 1,
    app.username,
    app.email,
    app.scheme_name,
    app.status,
    new Date(app.applied_at).toLocaleDateString()
  ]);

  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => `"${cell}"`).join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `applications_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  showToast('CSV exported successfully!', 'success');
}

/* =====================================
   EXPORT PDF
===================================== */
function exportPDF() {
  if (!allApplications.length) {
    showToast('No application data to export', 'warning');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setTextColor(124, 58, 237);
  doc.text('Sponsored Program Portal', 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Applications Report — ${new Date().toLocaleDateString()}`, 14, 28);

  // Table
  const headers = [['S.No', 'Username', 'Email', 'Scheme', 'Status', 'Date']];
  const rows = allApplications.map((app, i) => [
    i + 1,
    app.username,
    app.email,
    app.scheme_name,
    app.status,
    new Date(app.applied_at).toLocaleDateString()
  ]);

  doc.autoTable({
    head: headers,
    body: rows,
    startY: 35,
    theme: 'grid',
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: 50
    },
    alternateRowStyles: {
      fillColor: [245, 245, 255]
    }
  });

  doc.save(`applications_${new Date().toISOString().slice(0, 10)}.pdf`);
  showToast('PDF exported successfully!', 'success');
}

/* =====================================
   LOAD APPLICATIONS
===================================== */
async function loadApplications() {
  showLoading();
  try {
    const res = await fetch(`${API}/api/admin/applications`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    allApplications = data || [];

    dashAppPage = 1;
    appPage = 1;
    renderTable(allApplications, "dashboardTable", false, dashAppPage);
    renderTable(allApplications, "applicationsTable", true, appPage);

    // Render charts & activity log
    renderMonthlyChart(allApplications);
    renderActivityLog(allApplications);
    populateNotifications(allApplications);

  } catch (err) {
    console.error("Error loading applications:", err);
  } finally {
    hideLoading();
  }
}

/* =====================================
   RENDER APPLICATION TABLE (WITH PAGINATION)
===================================== */
function renderTable(data, tableId, showActions = false, page = 1) {
  const table = document.getElementById(tableId);
  if (!table) return;

  table.innerHTML = "";

  if (!data.length) {
    table.innerHTML = `
      <tr>
        <td colspan="${showActions ? 7 : 6}" class="no-data">
          No applications found
        </td>
      </tr>
    `;
    // Clear pagination
    const pagId = tableId + 'Pagination';
    const pagEl = document.getElementById(pagId);
    if (pagEl) pagEl.innerHTML = '';
    return;
  }

  // Pagination slice
  const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);
  const start = (page - 1) * ROWS_PER_PAGE;
  const pageData = data.slice(start, start + ROWS_PER_PAGE);

  pageData.forEach((app, index) => {
    const statusClass = app.status === "approved" ? "status-approved"
      : app.status === "rejected" ? "status-rejected"
        : "status-pending";

    let actionCol = "";

    if (showActions) {
      actionCol = `
        <td>
          <div class="action-row">
            <select class="status-select select-${app.status}" onchange="updateStatus(${app.id}, this.value)">
              <option value="approved" ${app.status === "approved" ? "selected" : ""}>✅ Approved</option>
              <option value="pending"  ${app.status === "pending" ? "selected" : ""}>⏳ Pending</option>
              <option value="rejected" ${app.status === "rejected" ? "selected" : ""}>❌ Rejected</option>
            </select>
            <button class="btn-icon-delete" onclick="deleteApplication(${app.id})" title="Delete application">
              🗑️
            </button>
          </div>
          <input class="admin-note-input" id="note-${app.id}" placeholder="Add a note..." value="${app.admin_note || ''}" onchange="saveAdminNote(${app.id})">
        </td>
      `;
    }

    table.innerHTML += `
      <tr>
        <td>${start + index + 1}</td>
        <td><strong>${app.username}</strong></td>
        <td>${app.email}</td>
        <td>${app.scheme_name}</td>
        <td><span class="status-badge ${statusClass}">${app.status}</span></td>
        <td>${new Date(app.applied_at).toLocaleDateString()}</td>
        ${actionCol}
      </tr>
    `;
  });

  // Render pagination
  const pagId = tableId + 'Pagination';
  const pagFn = tableId === 'applicationsTable' ? 'goToAppPage' : 'goToDashAppPage';
  let pagEl = document.getElementById(pagId);
  if (!pagEl) {
    pagEl = document.createElement('div');
    pagEl.id = pagId;
    pagEl.className = 'pagination';
    table.closest('.table-container').appendChild(pagEl);
  }
  renderPagination(pagId, page, totalPages, pagFn);
}

// Pagination navigation functions
function goToAppPage(p) {
  appPage = p;
  filterApplications();
}
function goToDashAppPage(p) {
  dashAppPage = p;
  const q = document.getElementById('dashboardSearch')?.value?.toLowerCase() || '';
  const filtered = allApplications.filter(app =>
    app.username.toLowerCase().includes(q) ||
    app.email.toLowerCase().includes(q) ||
    app.scheme_name.toLowerCase().includes(q) ||
    app.status.toLowerCase().includes(q)
  );
  renderTable(filtered, 'dashboardTable', false, dashAppPage);
}

/* =====================================
   UPDATE STATUS
===================================== */
async function updateStatus(id, status) {
  const noteInput = document.getElementById(`note-${id}`);
  const admin_note = noteInput ? noteInput.value : '';

  try {
    await fetch(`${API}/api/admin/applications/status/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status, admin_note })
    });

    // 🎉 Confetti on approve!
    if (status === 'approved') launchConfetti();

    showToast(`Application ${status} successfully!`, 'success');
    loadApplications();
    loadStats();

  } catch (err) {
    console.error("Error updating status:", err);
  }
}

/* =====================================
   📝 SAVE ADMIN NOTE
===================================== */
async function saveAdminNote(id) {
  const noteInput = document.getElementById(`note-${id}`);
  if (!noteInput) return;

  try {
    const selectEl = noteInput.closest('td').querySelector('.status-select');
    const status = selectEl ? selectEl.value : 'pending';

    await fetch(`${API}/api/admin/applications/status/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status, admin_note: noteInput.value })
    });

    showToast('Note saved!', 'success');
  } catch (err) {
    console.error("Error saving note:", err);
  }
}

/* =====================================
   DELETE APPLICATION
===================================== */
async function deleteApplication(id) {
  try {
    await fetch(`${API}/api/admin/applications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    loadApplications();
    loadStats();

  } catch (err) {
    console.error("Error deleting application:", err);
  }
}

/* =====================================
   ADD GOVERNMENT SCHEME
===================================== */
async function addScheme() {

  const title = document.getElementById("schemeTitle").value.trim();
  const description = document.getElementById("schemeDesc").value.trim();
  const eligibility = document.getElementById("schemeEligibility").value.trim();
  const website = document.getElementById("schemeWebsite").value.trim();
  const deadline = document.getElementById("schemeDeadline").value;

  if (!title || !description || !eligibility || !deadline) {
    showToast("Please fill all required fields", "warning");
    return;
  }

  try {
    const res = await fetch(`${API}/api/admin/schemes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        description,
        eligibility,
        website,
        deadline
      })
    });

    const data = await res.json();
    console.log("Add scheme response:", data);

    if (!res.ok) {
      showToast(data.message || "Failed to add scheme", "error");
      return;
    }

    // Clear form
    document.getElementById("schemeTitle").value = "";
    document.getElementById("schemeDesc").value = "";
    document.getElementById("schemeEligibility").value = "";
    document.getElementById("schemeWebsite").value = "";
    document.getElementById("schemeDeadline").value = "";

    // Reload schemes table
    await loadSchemes();

  } catch (err) {
    console.error("Add scheme error:", err);
    showToast("Server error while adding scheme", "error");
  }
}


/* =====================================
   LOAD SCHEMES
===================================== */
async function loadSchemes() {
  try {
    const res = await fetch(`${API}/api/schemes`);
    if (!res.ok) throw new Error("Failed to load schemes");

    const data = await res.json();
    allSchemes = data || [];
    renderSchemeTable(allSchemes);

  } catch (err) {
    console.error("Error loading schemes:", err);
  }
}

function renderSchemeTable(data) {
  const table = document.getElementById("schemeTable");
  table.innerHTML = "";

  if (!data.length) {
    table.innerHTML = `<tr><td colspan="7" class="no-data">No schemes found</td></tr>`;
    return;
  }

  data.forEach((scheme, index) => {
    table.innerHTML += `
<tr>
  <td>${index + 1}</td>
  <td>${scheme.title}</td>
  <td>${scheme.description}</td>
  <td>${scheme.eligibility}</td>
  <td>${new Date(scheme.deadline).toLocaleDateString()}</td>
  <td>
  ${scheme.website
        ? `<a href="${scheme.website}" target="_blank" class="scheme-link">
           Visit
         </a>`
        : "N/A"
      }
</td>
  <td>
    <button class="btn-icon-delete" onclick="deleteScheme(${scheme.id})" title="Delete scheme">
      🗑️
    </button>
  </td>
</tr>
`;
  });
}


/* =====================================
   DELETE SCHEME
===================================== */
async function deleteScheme(id) {
  try {
    const res = await fetch(`${API}/api/admin/schemes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Delete failed");
    }

    // Refresh schemes + applications (cascade delete)
    await loadSchemes();
    loadApplications();
    loadStats();

  } catch (err) {
    console.error("Delete error:", err);
  }
}

/* =====================================
   ADD INTERNSHIP
===================================== */
async function addInternship() {

  const title = document.getElementById("internTitle").value.trim();
  const description = document.getElementById("internDesc").value.trim();
  const eligibility = document.getElementById("internEligibility").value.trim();
  const website = document.getElementById("internWebsite").value.trim();
  const deadline = document.getElementById("internDeadline").value;

  if (!title || !description || !eligibility || !deadline) {
    showToast("Please fill all required fields", "warning");
    return;
  }

  try {
    const res = await fetch(`${API}/api/admin/internships`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        description,
        eligibility,
        website,
        deadline
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Failed to add internship", "error");
      return;
    }

    // Clear form
    document.getElementById("internTitle").value = "";
    document.getElementById("internDesc").value = "";
    document.getElementById("internEligibility").value = "";
    document.getElementById("internWebsite").value = "";
    document.getElementById("internDeadline").value = "";

    // 🔥 IMPORTANT
    await loadInternships();

  } catch (err) {
    console.error("Add internship error:", err);
    showToast("Server error while adding internship", "error");
  }
}


/* =====================================
   LOAD INTERNSHIPS
===================================== */
async function loadInternships() {
  try {
    const res = await fetch(`${API}/api/internships`);

    if (!res.ok) throw new Error("Failed to load internships");

    const data = await res.json();
    allInternships = data || [];
    renderInternshipTable(allInternships);

  } catch (err) {
    console.error("Error loading internships:", err);
  }
}

function renderInternshipTable(data) {
  const table = document.getElementById("internshipTable");
  if (!table) return;
  table.innerHTML = "";

  if (!data.length) {
    table.innerHTML = `<tr><td colspan="7" class="no-data">No internships found</td></tr>`;
    return;
  }

  data.forEach((intern, index) => {
    table.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${intern.title}</td>
        <td>${intern.description}</td>
        <td>${intern.eligibility}</td>
        <td>${new Date(intern.deadline).toLocaleDateString()}</td>
        <td>
          ${intern.website
        ? `<a href="${intern.website}" target="_blank" class="scheme-link">Visit</a>`
        : "N/A"
      }
        </td>
        <td>
          <button class="btn-icon-delete" onclick="deleteInternship(${intern.id})" title="Delete internship">
            🗑️
          </button>
        </td>
      </tr>
    `;
  });
}



/* =====================================
   DELETE INTERNSHIP
===================================== */
async function deleteInternship(id) {
  try {
    const res = await fetch(`${API}/api/admin/internships/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Delete failed");
    }

    await loadInternships();
    loadApplications();
    loadStats();

  } catch (err) {
    console.error("Delete error:", err);
  }
}


/* =====================================
   ADD EVENT
===================================== */
async function addEvent() {

  const title = document.getElementById("eventTitle").value.trim();
  const description = document.getElementById("eventDesc").value.trim();
  const event_date = document.getElementById("eventDate").value;
  const website = document.getElementById("eventWebsite").value.trim();

  if (!title || !description || !event_date) {
    showToast("Please fill all required fields", "warning");
    return;
  }

  try {
    const res = await fetch(`${API}/api/admin/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        description,
        event_date,
        website
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Failed to add event", "error");
      return;
    }

    // Clear form
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDesc").value = "";
    document.getElementById("eventDate").value = "";
    document.getElementById("eventWebsite").value = "";

    loadEvents();

  } catch (err) {
    console.error(err);
    showToast("Server error", "error");
  }
}


/* =====================================
   LOAD EVENTS
===================================== */
async function loadEvents() {
  try {
    const res = await fetch(`${API}/api/events`);
    const data = await res.json();
    allEvents = data || [];
    renderEventTable(allEvents);

  } catch (err) {
    console.error("Load events error:", err);
  }
}

function renderEventTable(data) {
  const table = document.getElementById("eventTable");
  if (!table) return;
  table.innerHTML = "";

  if (!data.length) {
    table.innerHTML = `<tr><td colspan="6" class="no-data">No events found</td></tr>`;
    return;
  }

  data.forEach((ev, index) => {
    table.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${ev.title}</td>
        <td>${ev.description}</td>
        <td>${new Date(ev.event_date).toLocaleDateString()}</td>
        <td>
          ${ev.website
        ? `<a href="${ev.website}" target="_blank" class="scheme-link">Visit</a>`
        : "N/A"
      }
        </td>
        <td>
          <button class="btn-icon-delete" onclick="deleteEvent(${ev.id})" title="Delete event">
            🗑️
          </button>
        </td>
      </tr>
    `;
  });
}



/* =====================================
   DELETE EVENT
===================================== */
async function deleteEvent(id) {
  try {
    const res = await fetch(`${API}/api/admin/events/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Delete failed");

    await loadEvents();
    loadApplications();
    loadStats();

  } catch (err) {
    console.error("Delete event error:", err);
  }
}


/* =====================================
   SECTION SWITCH
===================================== */
function showSection(section) {

  const sections = [
    "dashboardSection",
    "applicationsSection",
    "schemesSection",
    "internshipSection",
    "eventsSection"
  ];

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  if (section === "dashboard")
    document.getElementById("dashboardSection").style.display = "block";

  if (section === "applications")
    document.getElementById("applicationsSection").style.display = "block";

  if (section === "schemes") {
    document.getElementById("schemesSection").style.display = "block";
    loadSchemes();          // ✅ Works
  }

  if (section === "internship") {
    document.getElementById("internshipSection").style.display = "block";
    loadInternships();      // 🔥 THIS WAS MISSING
  }

  if (section === "events") {
    document.getElementById("eventsSection").style.display = "block";
    loadEvents();           // 🔥 Also required
  }
}


// logout is now in utils.js

/* =====================================
   SEARCH FILTERS
===================================== */
function filterDashboard() {
  dashAppPage = 1;
  const q = document.getElementById("dashboardSearch").value.toLowerCase();
  const filtered = allApplications.filter(app =>
    app.username.toLowerCase().includes(q) ||
    app.email.toLowerCase().includes(q) ||
    app.scheme_name.toLowerCase().includes(q) ||
    app.status.toLowerCase().includes(q)
  );
  renderTable(filtered, "dashboardTable", false, dashAppPage);
}

function filterApplications() {
  appPage = (typeof appPage !== 'undefined') ? 1 : 1;
  const q = (document.getElementById("applicationsSearch")?.value || '').toLowerCase();
  const statusVal = (document.getElementById("statusFilter")?.value || 'all');

  let filtered = allApplications;

  // Text search
  if (q) {
    filtered = filtered.filter(app =>
      app.username.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.scheme_name.toLowerCase().includes(q) ||
      app.status.toLowerCase().includes(q)
    );
  }

  // Status filter
  if (statusVal !== 'all') {
    filtered = filtered.filter(app => app.status === statusVal);
  }

  appPage = 1;
  renderTable(filtered, "applicationsTable", true, appPage);
}

function filterSchemes() {
  const q = document.getElementById("schemesSearch").value.toLowerCase();
  const filtered = allSchemes.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    (s.eligibility && s.eligibility.toLowerCase().includes(q))
  );
  renderSchemeTable(filtered);
}

function filterInternships() {
  const q = document.getElementById("internshipsSearch").value.toLowerCase();
  const filtered = allInternships.filter(i =>
    i.title.toLowerCase().includes(q) ||
    i.description.toLowerCase().includes(q) ||
    (i.eligibility && i.eligibility.toLowerCase().includes(q))
  );
  renderInternshipTable(filtered);
}

function filterEvents() {
  const q = document.getElementById("eventsSearch").value.toLowerCase();
  const filtered = allEvents.filter(e =>
    e.title.toLowerCase().includes(q) ||
    e.description.toLowerCase().includes(q)
  );
  renderEventTable(filtered);
}

/* =====================================
   🔢 ANIMATED COUNTER
===================================== */
function animateCounter(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const duration = 1200;
  const start = performance.now();
  const from = 0;

  function step(timestamp) {
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(from + (target - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* =====================================
   🎉 CONFETTI
===================================== */
function launchConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  const colors = ['#7c3aed', '#a855f7', '#22c55e', '#f97316', '#3b82f6', '#ef4444', '#eab308'];

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 1.5 + 's';
    piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    piece.style.width = (6 + Math.random() * 8) + 'px';
    piece.style.height = (6 + Math.random() * 8) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), 4000);
}

/* =====================================
/* =====================================
   🔔 NOTIFICATION BELL
===================================== */
let bellNotifications = [];

function toggleBellDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('bellDropdown');
  const isOpen = dropdown.classList.contains('active');

  if (!isOpen) {
    // Re-render notifications when opening
    renderBellItems();
  }

  dropdown.classList.toggle('active');
}

function clearNotifications(e) {
  e.stopPropagation();
  bellNotifications = [];
  document.getElementById('bellList').innerHTML = '<div class="bell-empty">No new notifications</div>';
  document.getElementById('bellBadge').style.display = 'none';
}

function populateNotifications(applications) {
  const badge = document.getElementById('bellBadge');
  if (!applications) return;

  bellNotifications = applications
    .filter(a => a.status !== 'pending')
    .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
    .slice(0, 5);

  if (bellNotifications.length === 0) {
    badge.style.display = 'none';
  } else {
    badge.textContent = bellNotifications.length;
    badge.style.display = 'flex';
  }

  // Also render immediately
  renderBellItems();
}

function renderBellItems() {
  const list = document.getElementById('bellList');
  if (!list) return;

  if (bellNotifications.length === 0) {
    list.innerHTML = '<div class="bell-empty">No new notifications</div>';
    return;
  }

  list.innerHTML = bellNotifications.map(app => {
    const icon = app.status === 'approved' ? '✅' : '❌';
    const action = app.status === 'approved' ? 'approved' : 'rejected';
    return `
      <div class="bell-item">
        <div class="bell-item-icon">${icon}</div>
        <div class="bell-item-content">
          <div class="bell-item-text"><strong>${app.username || 'User'}</strong>'s application was ${action}</div>
          <div class="bell-item-time">${getTimeAgo(app.applied_at)}</div>
        </div>
      </div>
    `;
  }).join('');
}

// Close bell dropdown when clicking outside
document.addEventListener('click', (e) => {
  const bell = document.querySelector('.notification-bell');
  const dropdown = document.getElementById('bellDropdown');
  if (bell && !bell.contains(e.target) && dropdown) {
    dropdown.classList.remove('active');
  }
});

/* =====================================
   👋 WELCOME GREETING
===================================== */
function showWelcomeGreeting() {
  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';
  else greeting = 'Good Evening';

  const name = localStorage.getItem('username') || 'Admin';
  const el = document.getElementById('welcomeGreeting');
  const sub = document.getElementById('welcomeSubtext');
  if (!el) return;

  const fullText = `${greeting}, ${name}!`;
  el.innerHTML = '';
  let i = 0;

  const typeInterval = setInterval(() => {
    el.innerHTML = fullText.substring(0, i + 1) + '<span class="typing-cursor">|</span>';
    i++;
    if (i >= fullText.length) {
      clearInterval(typeInterval);
      setTimeout(() => {
        el.innerHTML = fullText;
      }, 2000);
    }
  }, 50);

  if (sub) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    sub.textContent = `Today is ${today}. Here's your dashboard overview.`;
  }
}

/* =====================================
   ⌨️ KEYBOARD SHORTCUTS
===================================== */
document.addEventListener('keydown', (e) => {
  // Ctrl+K → Focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('dashboardSearch') || document.getElementById('applicationsSearch');
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Esc → Close dropdowns & modals
  if (e.key === 'Escape') {
    const dropdown = document.getElementById('bellDropdown');
    if (dropdown) dropdown.classList.remove('active');
  }
});

/* =====================================
   INIT
===================================== */
loadStats();
loadApplications();
loadSchemes();
loadInternships();
loadEvents();
showWelcomeGreeting();
