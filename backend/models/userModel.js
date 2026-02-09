const db = require("../config/db");

/* =========================
   CREATE USER
========================= */
exports.createUser = (email, username, password, role, callback) => {
  const sql =
    "INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)";
  db.query(sql, [email, username, password, role], callback);
};

/* =========================
   FIND BY USERNAME
========================= */
exports.findByUsername = (username, callback) => {
  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], callback);
};

/* =========================
   FIND BY EMAIL
========================= */
exports.findByEmail = (email, callback) => {
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], callback);
};

/* =========================
   EMAIL AUTOCOMPLETE
========================= */
exports.searchEmails = (query, callback) => {
  const sql = "SELECT email FROM users WHERE email LIKE ?";
  db.query(sql, [`${query}%`], (err, results) => {
    if (err) return callback(err);
    callback(null, results.map(row => row.email));
  });
};
