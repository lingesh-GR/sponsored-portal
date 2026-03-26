const API = "https://sponsored-portal-production.up.railway.app";

/* =========================
   FORGOT PASSWORD – EMAIL FILTER
========================= */

const emailInput = document.getElementById("email");
const msg = document.getElementById("msg");
let list;

/* Create suggestion box */
if (emailInput) {
  list = document.createElement("ul");
  list.className = "email-list";
  emailInput.parentNode.appendChild(list);
}

emailInput?.addEventListener("input", async () => {
  const q = emailInput.value.trim();
  list.innerHTML = "";

  if (q.length < 2) return;

  try {
    const res = await fetch(`${API}/api/users/emails?q=${q}`);
    const emails = await res.json();

    emails.forEach(email => {
      const li = document.createElement("li");
      li.textContent = email;
      li.onclick = () => {
        emailInput.value = email;
        list.innerHTML = "";
      };
      list.appendChild(li);
    });
  } catch {
    console.error("Email filter failed");
  }
});

/* =========================
   SEND RESET LINK
========================= */

async function sendReset() {
  const email = emailInput.value.trim();

  if (!email) {
    msg.textContent = "Please enter email";
    msg.style.color = "red";
    return;
  }

  const res = await fetch(`${API}/api/password/forgot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  msg.textContent = data.message;
  msg.style.color = res.ok ? "green" : "red";
}

/* =========================
   RESET PASSWORD + REDIRECT
========================= */
document.getElementById("resetForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = document.getElementById("password").value;
  const token = new URLSearchParams(window.location.search).get("token");

  if (!token || !password) {
    return;
  }

  try {
    const res = await fetch(`${API}/api/password/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });

    if (!res.ok) {
      alert("Password reset failed");
      return;
    }

    // ✅ AUTO REDIRECT (NO POPUP)
    window.location.replace("login.html");

  } catch (err) {
    console.error(err);
  }
});


/* =========================
   👁️ EYE TOGGLE (RESET PAGE)
========================= */

const eye = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

eye?.addEventListener("click", () => {
  passwordInput.type =
    passwordInput.type === "password" ? "text" : "password";
});
