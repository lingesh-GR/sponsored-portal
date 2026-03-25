const db = require("../config/db");
const bcrypt = require("bcryptjs"); // Fixed: Use bcryptjs for Windows compatibility
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
      console.error("Forgot password SQL error:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "This email is not registered" });
    }

    // Fixed: Standardized reset link for local development (Live Server)
    const resetLink = `http://127.0.0.1:5500/frontend/reset.html?token=${token}`;

    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Password Reset 🔑</h2>
        <p>You requested a password reset for your Sponsored Provider Portal account.</p>
        <p>This link is valid for 15 minutes.</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px;">Reset My Password</a>
        <br><br>
        <p>Or copy this link into your browser: <br>${resetLink}</p>
      </div>
    `;

    try {
        await sendEmail(
          email,
          "Password Reset - Sponsored Portal",
          `Reset your password here: ${resetLink}`,
          emailHtml
        );
        res.json({ message: "Reset link sent to your email" });
    } catch (mailErr) {
        console.error("Mailing failed:", mailErr.message);
        res.status(500).json({ message: "Could not send reset email" });
    }
  });
};

/**
 * RESET PASSWORD
 */
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
      const hashed = await bcrypt.hash(password, 10);

      const sql = `
        UPDATE users
        SET password = ?, reset_token = NULL, reset_expires = NULL
        WHERE reset_token = ? AND reset_expires > NOW()
      `;

      db.query(sql, [hashed, token], (err, result) => {
        if (err) {
          console.error("Reset password SQL error:", err.message);
          return res.status(500).json({ message: "Server error" });
        }

        if (result.affectedRows === 0) {
          return res.status(400).json({ message: "Invalid or expired token" });
        }

        res.json({ message: "Password reset successful" });
      });
  } catch (hashErr) {
      res.status(500).json({ message: "Error hashing password" });
  }
};
