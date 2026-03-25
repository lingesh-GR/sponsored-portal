const fetch = require("node-fetch");
async function test() {
  try {
    const res = await fetch("https://sponsored-portal-production.up.railway.app/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "testnode@example.com", username: "testnode", password: "password", role: "student" })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
test();
