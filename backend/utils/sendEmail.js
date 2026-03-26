module.exports = async (to, subject, text, html = null) => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error("❌ ERROR: BREVO_API_KEY environment variable is missing!");
    throw new Error("Email API key not configured on server.");
  }

  // The sender email should ideally be verified in Brevo.
  // Using the email you signed up with is the safest for a free account.
  const senderEmail = process.env.EMAIL_USER || "lingeshgr06@gmail.com";

  const payload = {
    sender: {
      name: "Sponsored Provider Portal",
      email: senderEmail
    },
    to: [
      {
        email: to
      }
    ],
    subject: subject,
    textContent: text
  };

  if (html) {
    payload.htmlContent = html;
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Brevo API Error:", data);
      throw new Error("Failed to send email via Brevo API.");
    }

    console.log("✅ Mailing Info (Brevo API):", data.messageId);
    return data;
  } catch (err) {
    console.error("❌ Email fetch failed:", err.message);
    throw err;
  }
};
