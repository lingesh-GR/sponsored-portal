const express = require("express");
const router = express.Router();

// ✅ THIS LINE WAS MISSING
const authController = require("../controllers/authController");

// Register & Login
router.post("/register", authController.register);
router.post("/login", authController.login);

// Email autocomplete (optional)
router.get("/emails", authController.searchEmails);

module.exports = router;
