const nodemailer = require("nodemailer");

module.exports = async (to, subject, text, html = null) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ ERROR: EMAIL_USER or EMAIL_PASS environment variables are missing!");
    throw new Error("Email credentials not configured on server.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Sponsored Provider Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };
  
  if (html) {
    mailOptions.html = html;
  }
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Mailing Info:", info.messageId, info.response);
    return info;
  } catch (err) {
    console.error("❌ Nodemailer send failed:", err.message);
    throw err;
  }
};
