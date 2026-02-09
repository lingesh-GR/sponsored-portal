const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async (to, subject, text) => {
  await transporter.sendMail({
    from: '"Sponsored Provider Portal" <no-reply@sponsored_provider_portal>',
     to,
    subject,
    text,
  });
};
