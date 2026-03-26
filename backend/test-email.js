require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

async function test() {
  try {
    console.log("Testing email with:", process.env.EMAIL_USER);
    await sendEmail(process.env.EMAIL_USER, "Test Subject", "Test Body");
    console.log("SUCCESS! The credentials are valid and email sent.");
  } catch (err) {
    console.error("FAIL! Error sending email:", err.message);
  }
}

test();
