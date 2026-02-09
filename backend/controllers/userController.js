// ✅ IMPORT USER MODEL (THIS WAS MISSING)
const User = require("../models/userModel");

/* =========================
   ADMIN DASHBOARD
========================= */
exports.adminDashboard = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  res.json({
    message: "Welcome Admin Dashboard 🚀",
    user: {
      id: req.user.id,
      role: req.user.role
    }
  });
};

/* =========================
   STUDENT DASHBOARD
========================= */
exports.studentDashboard = (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Access denied" });
  }

  res.json({
    message: "Welcome Student Dashboard 🎓",
    user: {
      id: req.user.id,
      role: req.user.role
    }
  });
};

/* =========================
   EMAIL AUTOCOMPLETE
========================= */
exports.getEmails = (req, res) => {
  const q = req.query.q;

  if (!q) {
    return res.json([]);
  }

  User.searchEmails(q, (err, emails) => {
    if (err) {
      console.error("Email search error:", err);
      return res.status(500).json([]);
    }

    res.json(emails);
  });
};
