const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  verifyToken,
  isAdmin,
  isStudent
} = require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/users/admin:
 *   get:
 *     summary: Verify admin access
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 */
router.get("/admin", verifyToken, isAdmin, userController.adminDashboard);

/**
 * @swagger
 * /api/users/student:
 *   get:
 *     summary: Verify student access
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 */
router.get("/student", verifyToken, isStudent, userController.studentDashboard);

/**
 * @swagger
 * /api/users/emails:
 *   get:
 *     summary: Search user emails
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of emails
 */
router.get("/emails", userController.getEmails);

module.exports = router;
