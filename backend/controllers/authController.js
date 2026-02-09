const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* =========================
   EMAIL AUTOCOMPLETE
========================= */
exports.searchEmails = (req, res) => {
  const q = `%${req.query.q || ""}%`;

  db.query(
    "SELECT email FROM users WHERE email LIKE ? LIMIT 5",
    [q],
    (err, rows) => {
      if (err) {
        console.error("EMAIL SEARCH ERROR:", err);
        return res.json([]);
      }
      res.json(rows.map(r => r.email));
    }
  );
};

/* =========================
   REGISTER  ✅ (THIS WAS MISSING)
========================= */
exports.register = async (req, res) => {
  const { email, username, password, role } = req.body;

  if (!email || !username || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if email already exists
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, rows) => {
        if (err) {
          console.error("REGISTER CHECK ERROR:", err);
          return res.status(500).json({ message: "Database error" });
        }

        if (rows.length > 0) {
          return res.status(400).json({ message: "Email already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        db.query(
          "INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)",
          [email, username, hashedPassword, role],
          (err) => {
            if (err) {
              console.error("REGISTER INSERT ERROR:", err);
              return res.status(500).json({ message: "Registration failed" });
            }

            res.status(201).json({ message: "User registered successfully" });
          }
        );
      }
    );
  } catch (err) {
    console.error("REGISTER SERVER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   LOGIN
========================= */
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, rows) => {
      if (err) {
        console.error("LOGIN ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (!rows.length) {
        return res.status(404).json({ message: "Account not found" });
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token, role: user.role });
    }
  );
};
