const db = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

/**
 * FORGOT PASSWORD
 */
exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString("hex");

  const sql = `
    UPDATE users 
    SET reset_token = ?, reset_expires = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
    WHERE email = ?
  `;

  db.query(sql, [token, email], async (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "This email is not registered" });
    }

    const resetLink = `http://localhost:5500/frontend/reset.html?token=${token}`;

    await sendEmail(
      email,
      "Password Reset",
      `Click the link to reset your password:\n\n${resetLink}`
    );

    res.json({ message: "Reset link sent to your email" });
  });
};

/**
 * RESET PASSWORD
 */
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const sql = `
    UPDATE users
    SET password = ?, reset_token = NULL, reset_expires = NULL
    WHERE reset_token = ? AND reset_expires > NOW()
  `;

  db.query(sql, [hashed, token], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    res.json({ message: "Password reset successful" });
  });
};
