const db = require("../config/db");

/* =========================
   GET ALL APPLICATIONS
========================= */
exports.getAllApplications = (callback) => {
  const sql = `
    SELECT 
      applications.id,
      users.username,
      users.email,
      applications.scheme_name,
      applications.status,
      applications.applied_at,
      applications.document_url
    FROM applications
    JOIN users ON applications.user_id = users.id
    ORDER BY applications.applied_at DESC
  `;

  db.query(sql, callback);
};


/* =========================
   GET STATS
========================= */
exports.getApplicationStats = (callback) => {
  const sql = `
    SELECT 
      COUNT(*) AS total,
      SUM(status='pending') AS pending,
      SUM(status='approved') AS approved,
      SUM(status='rejected') AS rejected
    FROM applications
  `;
  db.query(sql, callback);
};

/* =========================
   CREATE APPLICATION
========================= */
exports.createApplication = (user_id, scheme_name, status, document_url, callback) => {
  const sql = `
    INSERT INTO applications (user_id, scheme_name, status, document_url)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [user_id, scheme_name, status, document_url], callback);
};

/* =========================
   UPDATE STATUS
========================= */
exports.updateStatus = (id, status, adminNote, callback) => {
  const sql = `
    UPDATE applications
    SET status = ?
    WHERE id = ?
  `;
  db.query(sql, [status, id], callback);
};

/* =========================
   DELETE APPLICATION
========================= */
exports.deleteApplication = (id, callback) => {
  const sql = "DELETE FROM applications WHERE id = ?";
  db.query(sql, [id], callback);
};


/* =========================
   EDIT APPLICATION
========================= */
exports.updateApplication = (id, scheme_name, status, callback) => {
  const sql = `
    UPDATE applications
    SET scheme_name = ?, status = ?
    WHERE id = ?
  `;
  db.query(sql, [scheme_name, status, id], callback);
};

/* =========================
   GET APPLICATIONS BY USER
========================= */
exports.getApplicationsByUserId = (userId, callback) => {
  const sql = `
    SELECT 
      applications.id,
      applications.scheme_name,
      applications.status,
      applications.applied_at,
      applications.document_url
    FROM applications
    WHERE applications.user_id = ?
    ORDER BY applications.applied_at DESC
  `;
  db.query(sql, [userId], callback);
};

/* =========================
   GET STATS BY USER
========================= */
exports.getStatsByUserId = (userId, callback) => {
  const sql = `
    SELECT 
      COUNT(*) AS total,
      SUM(status='pending') AS pending,
      SUM(status='approved') AS approved,
      SUM(status='rejected') AS rejected
    FROM applications
    WHERE user_id = ?
  `;
  db.query(sql, [userId], callback);
};

/* =========================
   GET APPLICATION BY ID (with user info)
========================= */
exports.getApplicationById = (id, callback) => {
  const sql = `
    SELECT a.id, a.scheme_name, a.status, u.email, u.username
    FROM applications a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = ?
  `;
  db.query(sql, [id], callback);
};

/* =========================
   CHECK DUPLICATE APPLICATION
========================= */
exports.checkDuplicate = (userId, schemeName, callback) => {
  const sql = `
    SELECT id FROM applications
    WHERE user_id = ? AND scheme_name = ?
  `;
  db.query(sql, [userId, schemeName], callback);
};
