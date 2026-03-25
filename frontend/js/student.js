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

let myApplications = [];
let studentSchemes = [];
let studentInternships = [];
let studentEvents = [];

let currentAppPage = 1;
const appsPerPage = 6;

// showToast, toggleTheme, toggleSidebar, logout — loaded from utils.js

/* =====================================
   LOAD MY STATS
===================================== */
async function loadMyStats() {
    try {
        const res = await fetch(`${API}/api/student/applications/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        animateCounter("totalCount", data.total || 0);
        animateCounter("pendingCount", data.pending || 0);
        animateCounter("approvedCount", data.approved || 0);
        animateCounter("rejectedCount", data.rejected || 0);

    } catch (err) {
        console.error("Error loading stats:", err);
    }
}

/* =====================================
   LOAD MY APPLICATIONS
===================================== */
async function loadMyApplications() {
    showLoading();
    try {
        const res = await fetch(`${API}/api/student/applications`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        myApplications = data || [];

        // Simple render for dashboard (top 5)
        renderApplicationTable(myApplications.slice(0, 5), "dashboardTable");
        
        // Full table with pagination
        filterStudentApps(); 
        
        populateStudentNotifications(myApplications);
        checkStatusChanges(myApplications);

    } catch (err) {
        console.error("Error loading applications:", err);
    } finally {
        hideLoading();
    }
}

/* =====================================
   RENDER APPLICATION TABLE
===================================== */
function renderApplicationTable(data, tableId, showSno = false, startSno = 1) {
    const table = document.getElementById(tableId);
    if (!table) return;

    table.innerHTML = "";

    if (!data || !data.length) {
        table.innerHTML = `
      <tr>
        <td colspan="4" class="no-data">
          No matching applications found
        </td>
      </tr>
    `;
        return;
    }

    data.forEach((app, index) => {
        const statusClass = app.status === "approved" ? "status-approved"
            : app.status === "rejected" ? "status-rejected"
                : "status-pending";

        table.innerHTML += `
      <tr>
        <td data-label="SNO">${showSno ? startSno + index : index + 1}</td>
        <td data-label="Scheme">${app.scheme_name}</td>
        <td data-label="Status"><span class="status-badge ${statusClass}">${app.status}</span></td>
        <td data-label="Applied Date">${new Date(app.applied_at).toLocaleDateString()}</td>
      </tr>
    `;
    });
}

/* =====================================
   LOAD SCHEMES (BROWSE + APPLY)
===================================== */
async function loadSchemes() {
    try {
        const res = await fetch(`${API}/api/schemes`);
        if (!res.ok) throw new Error("Failed to load schemes");

        const data = await res.json();
        studentSchemes = data || [];
        renderSchemeCards(studentSchemes);

    } catch (err) {
        console.error("Error loading schemes:", err);
    }
}

function renderSchemeCards(data) {
    const container = document.getElementById("schemeCards");
    container.innerHTML = "";

    if (!data.length) {
        container.innerHTML = `<p class="no-data">No schemes found.</p>`;
        return;
    }

    data.forEach(scheme => {
        const deadlineDate = new Date(scheme.deadline);
        const isExpired = deadlineDate < new Date();

        // Only show active schemes
        if (isExpired) return;

        const isBookmarked = isItemBookmarked('scheme', scheme.id);

        container.innerHTML += `
        <div class="scheme-card">
          <div class="scheme-card-header">
            <h4>${scheme.title}</h4>
            <span class="deadline-badge">
              📅 ${deadlineDate.toLocaleDateString()}
            </span>
          </div>
          <p class="scheme-desc">${scheme.description}</p>
          <p class="scheme-eligibility"><strong>Eligibility:</strong> ${scheme.eligibility}</p>
          <div class="scheme-card-footer">
            ${scheme.website
                ? `<a href="${scheme.website}" target="_blank" class="btn-link">🔗 Official Website</a>`
                : ''
            }
            <button class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark('scheme', ${scheme.id}, '${scheme.title.replace(/'/g, "\\'")}', '${(scheme.description || '').substring(0, 80).replace(/'/g, "\\'")}', '${scheme.deadline || ''}')">
              ${isBookmarked ? '★ Saved' : '☆ Save'}
            </button>
            <button class="btn-apply" onclick="applyToScheme('${scheme.title.replace(/'/g, "\\'")}')">
              ✅ Apply Now
            </button>
          </div>
        </div>
      `;
    });
}

/* =====================================
   CUSTOM MODAL HELPERS
===================================== */
function showConfirm({ icon = '❓', title = 'Confirm', message = 'Are you sure?', confirmText = 'Confirm', confirmClass = 'modal-btn-confirm' }) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('confirmModal');
        document.getElementById('confirmModalIcon').textContent = icon;
        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalMsg').textContent = message;

        const okBtn = document.getElementById('confirmModalOk');
        okBtn.textContent = confirmText;
        okBtn.className = 'modal-btn ' + confirmClass;

        overlay.style.display = 'flex';

        const cleanup = (result) => {
            overlay.style.display = 'none';
            okBtn.onclick = null;
            document.getElementById('confirmModalCancel').onclick = null;
            resolve(result);
        };

        okBtn.onclick = () => cleanup(true);
        document.getElementById('confirmModalCancel').onclick = () => cleanup(false);
        overlay.onclick = (e) => { if (e.target === overlay) cleanup(false); };
    });
}

function showAlert({ icon = '✅', title = 'Success', message = 'Done!', btnText = 'OK', btnClass = 'modal-btn-success' }) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('alertModal');
        document.getElementById('alertModalIcon').textContent = icon;
        document.getElementById('alertModalTitle').textContent = title;
        document.getElementById('alertModalMsg').textContent = message;

        const okBtn = document.getElementById('alertModalOk');
        okBtn.textContent = btnText;
        okBtn.className = 'modal-btn ' + btnClass;

        overlay.style.display = 'flex';

        const cleanup = () => {
            overlay.style.display = 'none';
            okBtn.onclick = null;
            resolve();
        };

        okBtn.onclick = cleanup;
        overlay.onclick = (e) => { if (e.target === overlay) cleanup(); };
    });
}

/* =====================================
   APPLY TO SCHEME
===================================== */
async function applyToScheme(schemeName) {
    const confirmed = await showConfirm({
        icon: '🏛️',
        title: 'Apply to Scheme',
        message: `Do you want to apply for "${schemeName}"?`,
        confirmText: '✅ Apply Now',
        confirmClass: 'modal-btn-success'
    });
    if (!confirmed) return;

    showLoading();
    try {
        const formData = new FormData();
        formData.append("scheme_name", schemeName);

        const res = await fetch(`${API}/api/student/applications`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        const data = await res.json();
        hideLoading(); // Hide loading before showing alert

        if (!res.ok) {
            await showAlert({ icon: '❌', title: 'Failed', message: data.message || 'Application failed', btnClass: 'modal-btn-danger' });
            return;
        }

        await showAlert({ icon: '🎉', title: 'Success', message: `Applied for ${schemeName}.` });
        loadMyStats();
        loadMyApplications();

    } catch (err) {
        console.error("Apply error:", err);
        await showAlert({ icon: '⚠️', title: 'Server Error', message: 'Something went wrong.', btnClass: 'modal-btn-danger' });
    } finally {
        hideLoading();
    }
}

/* =====================================
   LOAD INTERNSHIPS (CARD LAYOUT + APPLY)
===================================== */
async function loadInternships() {
    try {
        const res = await fetch(`${API}/api/internships`);
        if (!res.ok) throw new Error("Failed to load internships");

        const data = await res.json();
        studentInternships = data || [];
        renderInternshipCards(studentInternships);

    } catch (err) {
        console.error("Error loading internships:", err);
    }
}

function renderInternshipCards(data) {
    const container = document.getElementById("internshipCards");
    container.innerHTML = "";

    if (!data.length) {
        container.innerHTML = `<p class="no-data">No internships found.</p>`;
        return;
    }

    data.forEach(intern => {
        const deadlineDate = new Date(intern.deadline);
        const isExpired = deadlineDate < new Date();

        // Only show active internships
        if (isExpired) return;

        const isBookmarked = isItemBookmarked('internship', intern.id);

        container.innerHTML += `
        <div class="scheme-card internship-card">
          <div class="scheme-card-header">
            <h4>${intern.title}</h4>
            <span class="deadline-badge">
              📅 ${deadlineDate.toLocaleDateString()}
            </span>
          </div>
          <p class="scheme-desc">${intern.description}</p>
          <p class="scheme-eligibility"><strong>Eligibility:</strong> ${intern.eligibility}</p>
          <div class="scheme-card-footer">
            ${intern.website
                ? `<a href="${intern.website}" target="_blank" class="btn-link">🔗 Official Website</a>`
                : ''
            }
            <button class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark('internship', ${intern.id}, '${intern.title.replace(/'/g, "\\'")}'  , '${(intern.description || '').substring(0, 80).replace(/'/g, "\\'")}'  , '${intern.deadline || ''}')">
              ${isBookmarked ? '★ Saved' : '☆ Save'}
            </button>
            <button class="btn-apply btn-apply-intern" onclick="applyToProgram('${intern.title.replace(/'/g, "\\'")}'  , 'internship')">
              ✅ Apply Now
            </button>
          </div>
        </div>
      `;
    });
}

/* =====================================
   LOAD EVENTS (CARD LAYOUT + APPLY)
===================================== */
async function loadEvents() {
    try {
        const res = await fetch(`${API}/api/events`);
        const data = await res.json();
        studentEvents = data || [];
        renderEventCards(studentEvents);

    } catch (err) {
        console.error("Load events error:", err);
    }
}

function renderEventCards(data) {
    const container = document.getElementById("eventCards");
    container.innerHTML = "";

    if (!data.length) {
        container.innerHTML = `<p class="no-data">No events found.</p>`;
        return;
    }

    data.forEach(event => {
        const eventDate = new Date(event.event_date);
        const isPast = eventDate < new Date();

        // Only show future events
        if (isPast) return;

        const isBookmarked = isItemBookmarked('event', event.id);

        container.innerHTML += `
        <div class="scheme-card event-card">
          <div class="scheme-card-header">
            <h4>${event.title}</h4>
            <span class="deadline-badge">
              📅 ${eventDate.toLocaleDateString()}
            </span>
          </div>
          <p class="scheme-desc">${event.description}</p>
          <div class="scheme-card-footer">
            ${event.website
                ? `<a href="${event.website}" target="_blank" class="btn-link">🔗 Official Website</a>`
                : ''
            }
            <button class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark('event', ${event.id}, '${event.title.replace(/'/g, "\\'")}'  , '${(event.description || '').substring(0, 80).replace(/'/g, "\\'")}'  , '${event.event_date || ''}')">
              ${isBookmarked ? '★ Saved' : '☆ Save'}
            </button>
            <button class="btn-apply btn-apply-event" onclick="applyToProgram('${event.title.replace(/'/g, "\\'")}'  , 'event')">
              ✅ Register Now
            </button>
          </div>
        </div>
      `;
    });
}

/* =====================================
   APPLY TO ANY PROGRAM (SCHEME/INTERNSHIP/EVENT)
===================================== */
async function applyToProgram(programName, type) {
    const label = type === 'internship' ? 'Internship' : 'Event';
    const icon = type === 'internship' ? '💼' : '📅';

    const confirmed = await showConfirm({
        icon: icon,
        title: `Apply to ${label}`,
        message: `Do you want to apply to ${label.toLowerCase()}: "${programName}"?`,
        confirmText: type === 'internship' ? '✅ Apply Now' : '✅ Register Now',
        confirmClass: 'modal-btn-success'
    });
    if (!confirmed) return;

    showLoading();
    try {
        const formData = new FormData();
        formData.append("scheme_name", `[${type.toUpperCase()}] ${programName}`);

        const res = await fetch(`${API}/api/student/applications`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const data = await res.json();
        hideLoading(); // Hide loading immediately

        if (!res.ok) {
            await showAlert({ icon: '❌', title: 'Failed', message: data.message || 'Application failed', btnClass: 'modal-btn-danger' });
            return;
        }

        await showAlert({
            icon: '🎉',
            title: `${label} Application Submitted!`,
            message: `Your application for "${programName}" has been submitted successfully.`
        });
        loadMyStats();
        loadMyApplications();

    } catch (err) {
        console.error("Apply error:", err);
        await showAlert({ icon: '⚠️', title: 'Server Error', message: 'Something went wrong. Please try again later.', btnClass: 'modal-btn-danger' });
    }
}

/* =====================================
   SEARCH FILTERS
===================================== */
function filterStudentDash() {
    const q = document.getElementById("studentDashSearch").value.toLowerCase();
    const filtered = myApplications.filter(app =>
        app.scheme_name.toLowerCase().includes(q) ||
        app.status.toLowerCase().includes(q)
    );
    renderApplicationTable(filtered, "dashboardTable");
}

function filterStudentApps(page = 1) {
    currentAppPage = page;
    const q = document.getElementById("studentAppSearch")?.value.toLowerCase() || "";
    const status = document.getElementById("studentStatusFilter")?.value || "";

    const filtered = myApplications.filter(app => {
        const matchSearch = app.scheme_name.toLowerCase().includes(q) || app.status.toLowerCase().includes(q);
        const matchStatus = status === "" || app.status === status;
        return matchSearch && matchStatus;
    });

    const start = (currentAppPage - 1) * appsPerPage;
    const paginated = filtered.slice(start, start + appsPerPage);

    renderApplicationTable(paginated, "applicationsTable", true, start + 1);
    
    // Use the shared renderPagination from utils.js
    if (typeof renderPagination === "function") {
        renderPagination(
            filtered.length,
            appsPerPage,
            currentAppPage,
            "studentPagination",
            (p) => filterStudentApps(p)
        );
    }
}

function filterStudentSchemes() {
    const q = document.getElementById("studentSchemeSearch").value.toLowerCase();
    const filtered = studentSchemes.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.eligibility && s.eligibility.toLowerCase().includes(q))
    );
    renderSchemeCards(filtered);
}

function filterStudentInternships() {
    const q = document.getElementById("studentInternSearch").value.toLowerCase();
    const filtered = studentInternships.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.eligibility && i.eligibility.toLowerCase().includes(q))
    );
    renderInternshipCards(filtered);
}

function filterStudentEvents() {
    const q = document.getElementById("studentEventSearch").value.toLowerCase();
    const filtered = studentEvents.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
    renderEventCards(filtered);
}

/* =====================================
   SECTION SWITCH
===================================== */
function showSection(section) {
    const sections = [
        "dashboardSection",
        "applicationsSection",
        "schemesSection",
        "internshipsSection",
        "eventsSection",
        "savedSection",
        "profileSection"
    ];

    // Hide all sections
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    // Update sidebar active state
    const sidebarItems = document.querySelectorAll(".sidebar li");
    sidebarItems.forEach(li => li.classList.remove("active"));
    if (event && event.target) event.target.classList.add("active");

    // Show selected section & load data
    if (section === "dashboard") {
        document.getElementById("dashboardSection").style.display = "block";
        loadMyStats();
        loadMyApplications();
    }

    if (section === "applications") {
        document.getElementById("applicationsSection").style.display = "block";
        loadMyApplications();
    }

    if (section === "schemes") {
        document.getElementById("schemesSection").style.display = "block";
        loadSchemes();
    }

    if (section === "internships") {
        document.getElementById("internshipsSection").style.display = "block";
        loadInternships();
    }

    if (section === "events") {
        document.getElementById("eventsSection").style.display = "block";
        loadEvents();
    }

    if (section === "saved") {
        document.getElementById("savedSection").style.display = "block";
        renderSavedItems('all');
    }

    if (section === "profile") {
        document.getElementById("profileSection").style.display = "block";
        loadProfile();
    }
}

// logout is now in utils.js

/* =====================================
   🔢 ANIMATED COUNTER
===================================== */
function animateCounter(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const duration = 1200;
    const start = performance.now();

    function step(timestamp) {
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * eased);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

let bellNotifications = [];

function toggleBellDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('bellDropdown');
    const isOpen = dropdown.classList.contains('active');
    if (!isOpen) renderBellItems();
    dropdown.classList.toggle('active');
}

function clearNotifications(e) {
    e.stopPropagation();
    bellNotifications = [];
    document.getElementById('bellList').innerHTML = '<div class="bell-empty">No new notifications</div>';
    document.getElementById('bellBadge').style.display = 'none';
}

function populateStudentNotifications(applications) {
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
        const timeAgo = getTimeAgo(app.applied_at);
        return `
      <div class="bell-item">
        <div class="bell-item-icon">${icon}</div>
        <div class="bell-item-content">
          <div class="bell-item-text">Your application for <strong>${app.scheme_name}</strong> was ${action}</div>
          <div class="bell-item-time">${timeAgo}</div>
        </div>
      </div>
    `;
    }).join('');
}

function getTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

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

    const name = localStorage.getItem('username') || 'Student';
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
            setTimeout(() => { el.innerHTML = fullText; }, 2000);
        }
    }, 50);

    if (sub) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        sub.textContent = `Today is ${today}. Explore opportunities below!`;
    }
}

/* =====================================
   ⌨️ KEYBOARD SHORTCUTS
===================================== */
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('studentDashSearch') || document.getElementById('studentAppSearch');
        if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    if (e.key === 'Escape') {
        const dropdown = document.getElementById('bellDropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
});

/* =====================================
   🔖 BOOKMARK SYSTEM
===================================== */
function getBookmarks() {
    return JSON.parse(localStorage.getItem('bookmarks') || '[]');
}

function isItemBookmarked(type, id) {
    return getBookmarks().some(b => b.type === type && b.id === id);
}

function toggleBookmark(type, id, title, description, date) {
    let bookmarks = getBookmarks();
    const exists = bookmarks.findIndex(b => b.type === type && b.id === id);

    if (exists > -1) {
        bookmarks.splice(exists, 1);
        showToast(`Removed "${title}" from saved items`, 'info');
    } else {
        bookmarks.push({ type, id, title, description, date, savedAt: new Date().toISOString() });
        showToast(`Saved "${title}" to bookmarks!`, 'success');
    }

    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

    // Re-render the current cards to update button state
    if (type === 'scheme') loadSchemes();
    if (type === 'internship') loadInternships();
    if (type === 'event') loadEvents();
}

function filterSaved(filter, btn) {
    document.querySelectorAll('.saved-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderSavedItems(filter);
}

function renderSavedItems(filter = 'all') {
    const container = document.getElementById('savedCards');
    if (!container) return;

    let bookmarks = getBookmarks();
    if (filter !== 'all') bookmarks = bookmarks.filter(b => b.type === filter);

    if (!bookmarks.length) {
        container.innerHTML = `<p class="no-data">🔖 No saved items yet. Browse schemes, internships, or events and click ☆ Save!</p>`;
        return;
    }

    container.innerHTML = bookmarks.map(b => {
        const typeIcon = b.type === 'scheme' ? '🏛️' : b.type === 'internship' ? '💼' : '📅';
        const typeLabel = b.type.charAt(0).toUpperCase() + b.type.slice(1);
        const dateStr = b.date ? new Date(b.date).toLocaleDateString() : '';

        return `
      <div class="scheme-card">
        <div class="scheme-card-header">
          <h4>${b.title}</h4>
          <span class="deadline-badge">${typeIcon} ${typeLabel}</span>
        </div>
        <p class="scheme-desc">${b.description || 'No description'}</p>
        ${dateStr ? `<p class="scheme-eligibility"><strong>Date:</strong> ${dateStr}</p>` : ''}
        <div class="scheme-card-footer">
          <button class="btn-bookmark bookmarked" onclick="toggleBookmark('${b.type}', ${b.id}, '${b.title.replace(/'/g, "\\'")}'  , '${(b.description || '').replace(/'/g, "\\'")}'  , '${b.date || ''}'); renderSavedItems('${filter}')">
            ★ Remove
          </button>
        </div>
      </div>
    `;
    }).join('');
}

/* =====================================
   👤 STUDENT PROFILE
===================================== */
function loadProfile() {
    const profile = JSON.parse(localStorage.getItem('studentProfile') || '{}');
    if (profile.fullName) document.getElementById('profileFullName').value = profile.fullName;
    if (profile.department) document.getElementById('profileDepartment').value = profile.department;
    if (profile.year) document.getElementById('profileYear').value = profile.year;
    if (profile.phone) document.getElementById('profilePhone').value = profile.phone;
    if (profile.bio) document.getElementById('profileBio').value = profile.bio;
    if (profile.avatar) {
        document.getElementById('profileAvatar').innerHTML = `<img src="${profile.avatar}" alt="Avatar">`;
    }
}

function saveProfile() {
    const profile = {
        fullName: document.getElementById('profileFullName').value,
        department: document.getElementById('profileDepartment').value,
        year: document.getElementById('profileYear').value,
        phone: document.getElementById('profilePhone').value,
        bio: document.getElementById('profileBio').value,
        avatar: JSON.parse(localStorage.getItem('studentProfile') || '{}').avatar || null
    };

    localStorage.setItem('studentProfile', JSON.stringify(profile));
    showToast('Profile saved successfully!', 'success');
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const dataUrl = e.target.result;
        document.getElementById('profileAvatar').innerHTML = `<img src="${dataUrl}" alt="Avatar">`;

        const profile = JSON.parse(localStorage.getItem('studentProfile') || '{}');
        profile.avatar = dataUrl;
        localStorage.setItem('studentProfile', JSON.stringify(profile));
        showToast('Profile photo updated!', 'success');
    };
    reader.readAsDataURL(file);
}

/* =====================================
   🔔 APPLICATION STATUS NOTIFICATIONS
===================================== */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

let previousStatuses = {};

function checkStatusChanges(applications) {
    if (!applications || !applications.length) return;

    const stored = JSON.parse(localStorage.getItem('appStatuses') || '{}');
    let hasChanges = false;

    applications.forEach(app => {
        const prevStatus = stored[app.id];
        if (prevStatus && prevStatus !== app.status) {
            hasChanges = true;
            const icon = app.status === 'approved' ? '✅' : app.status === 'rejected' ? '❌' : '⏳';
            showToast(`${icon} Your application "${app.scheme_name}" was ${app.status}!`, app.status === 'approved' ? 'success' : 'error');

            // Browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Application Update', {
                    body: `Your application for "${app.scheme_name}" was ${app.status}`,
                    icon: app.status === 'approved' ? '✅' : '❌'
                });
            }
        }
        stored[app.id] = app.status;
    });

    localStorage.setItem('appStatuses', JSON.stringify(stored));
}

/* =====================================
   INIT
===================================== */
loadMyStats();
loadMyApplications();
showWelcomeGreeting();
requestNotificationPermission();
