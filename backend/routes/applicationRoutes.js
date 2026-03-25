const express = require("express");
const router = express.Router();

const applicationController = require("../controllers/applicationController");
const { verifyToken, isAdmin, isStudent } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

/* =========================
   STUDENT ROUTES
========================= */

/**
 * @swagger
 * /api/student/applications:
 *   get:
 *     summary: Get logged-in student's applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of student's applications
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/student/applications",
  verifyToken,
  isStudent,
  applicationController.getMyApplications
);

/**
 * @swagger
 * /api/student/applications/stats:
 *   get:
 *     summary: Get student's application statistics
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Object with total, pending, approved, rejected counts
 */
router.get(
  "/student/applications/stats",
  verifyToken,
  isStudent,
  applicationController.getMyStats
);

/**
 * @swagger
 * /api/student/applications:
 *   post:
 *     summary: Apply to a scheme
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [scheme_name]
 *             properties:
 *               scheme_name:
 *                 type: string
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Optional document upload (PDF/JPG/PNG)
 *     responses:
 *       201:
 *         description: Application submitted
 *       400:
 *         description: Already applied or validation error
 */
router.post(
  "/student/applications",
  verifyToken,
  isStudent,
  upload,
  applicationController.applyToScheme
);

/* =========================
   ADMIN ROUTES
========================= */

/**
 * @swagger
 * /api/admin/applications:
 *   get:
 *     summary: Get all applications (Admin only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of all applications
 */
router.get(
  "/admin/applications",
  verifyToken,
  isAdmin,
  applicationController.getAllApplications
);

/**
 * @swagger
 * /api/admin/applications/stats:
 *   get:
 *     summary: Get application statistics (Admin only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics object
 */
router.get(
  "/admin/applications/stats",
  verifyToken,
  isAdmin,
  applicationController.getStats
);

/**
 * @swagger
 * /api/admin/applications/status/{id}:
 *   put:
 *     summary: Update application status (Admin only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, pending, rejected]
 *               admin_note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put(
  "/admin/applications/status/:id",
  verifyToken,
  isAdmin,
  applicationController.updateStatus
);

/**
 * @swagger
 * /api/admin/applications/{id}:
 *   delete:
 *     summary: Delete an application (Admin only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Application deleted
 */
router.delete(
  "/admin/applications/:id",
  verifyToken,
  isAdmin,
  applicationController.deleteApplication
);

module.exports = router;
