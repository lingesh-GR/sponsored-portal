const applicationModel = require("../models/applicationModel");
const sendEmail = require("../utils/sendEmail");

/* =========================
   GET ALL APPLICATIONS
========================= */
const getAllApplications = (req, res) => {
  applicationModel.getAllApplications((err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
};

/* =========================
   GET STATS
========================= */
const getStats = (req, res) => {
  applicationModel.getApplicationStats((err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results[0]);
  });
};

/* =========================
   UPDATE STATUS + SEND EMAIL
========================= */
const updateStatus = (req, res) => {
  const { id } = req.params;
  const { status, admin_note } = req.body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  applicationModel.updateStatus(id, status, admin_note || null, (err) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }

    // Send email notification to student
    if (status === "approved" || status === "rejected") {
      applicationModel.getApplicationById(id, async (err, results) => {
        if (!err && results.length > 0) {
          const { email, username, scheme_name } = results[0];

          const isApproved = status === "approved";
          const statusLabel = isApproved ? "Approved ✅" : "Rejected ❌";
          const statusColor = isApproved ? "#16a34a" : "#dc2626";

          const subject = `Application ${isApproved ? "Approved" : "Rejected"} — ${scheme_name}`;

          const text = `Hi ${username},\n\nYour application for "${scheme_name}" has been ${status}.\n\nRegards,\nSponsored Provider Portal`;

          const html = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 28px 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Sponsored Provider Portal</h1>
              </div>
              <div style="padding: 28px 24px;">
                <p style="font-size: 16px; color: #374151; margin-top: 0;">Hi <strong>${username}</strong>,</p>
                <p style="font-size: 15px; color: #4b5563;">Your application for the following program has been reviewed:</p>
                <div style="background: #f9fafb; border-left: 4px solid ${statusColor}; padding: 14px 18px; border-radius: 6px; margin: 18px 0;">
                  <p style="margin: 0 0 6px; font-size: 14px; color: #6b7280;">Program</p>
                  <p style="margin: 0 0 14px; font-size: 16px; font-weight: 600; color: #111827;">${scheme_name}</p>
                  <p style="margin: 0 0 6px; font-size: 14px; color: #6b7280;">Status</p>
                  <p style="margin: 0; font-size: 16px; font-weight: 700; color: ${statusColor};">${statusLabel}</p>
                </div>
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">If you have questions, please contact the administration.</p>
              </div>
              <div style="background: #f3f4f6; padding: 16px 24px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2026 Sponsored Provider Portal. All rights reserved.</p>
              </div>
            </div>
          `;

          try {
            await sendEmail(email, subject, text, html);
            console.log(`📧 Email sent to ${email} — ${status}`);
          } catch (emailErr) {
            console.error("❌ Failed to send email:", emailErr.message);
          }
        }
      });
    }

    res.json({ message: "Application status updated successfully" });
  });
};

/* =========================
   DELETE APPLICATION
========================= */
const deleteApplication = (req, res) => {
  const { id } = req.params;

  applicationModel.deleteApplication(id, (err) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }
    res.json({ message: "Application deleted successfully" });
  });
};

/* =========================
   GET MY APPLICATIONS (STUDENT)
========================= */
const getMyApplications = (req, res) => {
  const userId = req.user.id;

  applicationModel.getApplicationsByUserId(userId, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
};

/* =========================
   GET MY STATS (STUDENT)
========================= */
const getMyStats = (req, res) => {
  const userId = req.user.id;

  applicationModel.getStatsByUserId(userId, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results[0]);
  });
};

/* =========================
   APPLY TO SCHEME (STUDENT)
========================= */
const applyToScheme = (req, res) => {
  const userId = req.user.id;
  const { scheme_name } = req.body;

  if (!scheme_name) {
    return res.status(400).json({ message: "Scheme name is required" });
  }

  // Check for duplicate application
  applicationModel.checkDuplicate(userId, scheme_name, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "You have already applied to this program" });
    }

    const document_url = req.file ? req.file.path : null;

    applicationModel.createApplication(userId, scheme_name, "pending", document_url, (err) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }
      res.status(201).json({ message: "Application submitted successfully" });
    });
  });
};

/* 🔥 IMPORTANT EXPORT */
module.exports = {
  getAllApplications,
  getStats,
  updateStatus,
  deleteApplication,
  getMyApplications,
  getMyStats,
  applyToScheme
};
