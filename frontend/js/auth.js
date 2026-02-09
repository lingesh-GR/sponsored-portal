/* =========================
   CONFIG
========================= */

const API_BASE = "http://localhost:5000";

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
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorBox.textContent = data.message || "Login failed";
      return;
    }

    localStorage.setItem("token", data.token);

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
