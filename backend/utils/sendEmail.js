const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async (to, subject, text, html = null) => {
  const mailOptions = {
    from: `"Sponsored Provider Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };
  if (html) {
    mailOptions.html = html;
  }
  const info = await transporter.sendMail(mailOptions);
  console.log("Mailing Info:", info.messageId, info.response);
};
