const express = require("express");
const router = express.Router();

// THIS LINE WAS MISSING
const authController = require("../controllers/authController");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: securePassword123
 *               role:
 *                 type: string
 *                 enum: [student, admin]
 *                 default: student
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Login successful - returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/emails:
 *   get:
 *     summary: Search registered emails (autocomplete)
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Partial email to search for
 *     responses:
 *       200:
 *         description: List of matching emails
 */
router.get("/emails", authController.searchEmails);

module.exports = router;
