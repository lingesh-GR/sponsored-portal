/* =========================
   CONFIG
========================= */

const API_BASE = "https://sponsored-portal-production-f148.up.railway.app";

/* =========================
   COMMON ELEMENTS (SAFE)
========================= */

const emailInput = document.getElementById("email");
const suggestionsBox = document.getElementById("suggestions");
const errorBox = document.getElementById("error");

/* =========================
   EMAIL FILTER (AUTOCOMPLETE)
========================= */

emailInput?.addEventListener("input", async () => {
  if (!suggestionsBox) return;

  const q = emailInput.value.trim();
  suggestionsBox.innerHTML = "";

  if (q.length < 2) return;

  try {
    const res = await fetch(`${API_BASE}/api/users/emails?q=${q}`);
    if (!res.ok) return;

    const emails = await res.json();

    emails.forEach((email) => {
      const div = document.createElement("div");
      div.textContent = email;

      div.addEventListener("click", () => {
        emailInput.value = email;
        suggestionsBox.innerHTML = "";
      });

      suggestionsBox.appendChild(div);
    });
  } catch (err) {
    console.error("Email filter failed", err);
  }
});

/* =========================
   CLOSE SUGGESTIONS ON OUTSIDE CLICK
========================= */

document.addEventListener("click", (e) => {
  if (suggestionsBox && !e.target.closest(".input-wrapper")) {
    suggestionsBox.innerHTML = "";
  }
});

/* =========================
   LOGIN
========================= */

async function login() {
  if (!emailInput) return;

  const passwordInput = document.getElementById("password");
  const errorBox = document.getElementById("error");

  errorBox.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    errorBox.textContent = "Email and password are required";
    return;
  }

  try {
    const rememberMe = document.getElementById('rememberMe')?.checked || false;

    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberMe })
    });

    const data = await res.json();

    if (!res.ok) {
      errorBox.textContent = data.message || "Login failed";
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);

    // Remember Me: store flag
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }

    // ✅ ROLE BASED REDIRECT
    window.location.replace(
      data.role === "admin"
        ? "dashboard/admin.html"
        : "dashboard/student.html"
    );

  } catch (err) {
    errorBox.textContent = "Server error. Try again later.";
  }
}

/* =========================
   REGISTER
========================= */

async function registerUser() {
  const email = document.getElementById("email")?.value.trim();
  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value;
  const role = document.getElementById("role")?.value;
  const errorBox = document.getElementById("error-msg");

  if (!errorBox) return;
  errorBox.textContent = "";

  if (!email || !username || !password || !role) {
    errorBox.textContent = "All fields are required";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password, role })
    });

    const data = await res.json();

    if (!res.ok) {
      errorBox.textContent = data.message || "Registration failed";
      return;
    }

    // ✅ AUTO REDIRECT TO LOGIN
    window.location.replace("login.html");

  } catch (err) {
    errorBox.textContent = "Server error. Try again later.";
  }
}

/* =========================
   👁️ SHOW / HIDE PASSWORD
   (LOGIN + REGISTER)
========================= */

const passwordInput = document.getElementById("password");
const toggleLogin = document.getElementById("toggleLogin");
const toggleRegister = document.getElementById("toggleRegister");

toggleLogin?.addEventListener("click", () => {
  passwordInput.type =
    passwordInput.type === "password" ? "text" : "password";
});

toggleRegister?.addEventListener("click", () => {
  passwordInput.type =
    passwordInput.type === "password" ? "text" : "password";
});

/* =========================
   🔐 PASSWORD STRENGTH METER
========================= */
function checkPasswordStrength() {
  const pw = document.getElementById('password')?.value || '';
  const bar = document.getElementById('strengthBar');
  const label = document.getElementById('strengthLabel');
  if (!bar || !label) return;

  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { width: '0%', color: 'transparent', text: '', textColor: '#64748b' },
    { width: '20%', color: '#ef4444', text: 'Very Weak', textColor: '#ef4444' },
    { width: '40%', color: '#f97316', text: 'Weak', textColor: '#f97316' },
    { width: '60%', color: '#eab308', text: 'Fair', textColor: '#eab308' },
    { width: '80%', color: '#22c55e', text: 'Strong', textColor: '#22c55e' },
    { width: '100%', color: '#16a34a', text: 'Very Strong 💪', textColor: '#16a34a' }
  ];

  const level = levels[score];
  bar.style.width = level.width;
  bar.style.background = level.color;
  label.textContent = level.text;
  label.style.color = level.textColor;
}
