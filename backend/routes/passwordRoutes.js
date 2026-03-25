const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

/**
 * @swagger
 * /api/password/forgot:
 *   post:
 *     summary: Request password reset link
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *     responses:
 *       200:
 *         description: Reset email sent
 */
router.post("/forgot", passwordController.forgotPassword);

/**
 * @swagger
 * /api/password/reset:
 *   post:
 *     summary: Reset password with token
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *     responses:
 *       200:
 *         description: Reset successful
 */
router.post("/reset", passwordController.resetPassword);

module.exports = router;
