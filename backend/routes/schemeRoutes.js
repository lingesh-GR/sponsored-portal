const express = require("express");
const router = express.Router();

const schemeController = require("../controllers/schemeController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/schemes:
 *   get:
 *     summary: Get all government schemes
 *     tags: [Schemes]
 *     responses:
 *       200:
 *         description: Array of scheme objects
 */
router.get("/schemes", schemeController.getAllSchemes);

/**
 * @swagger
 * /api/admin/schemes:
 *   post:
 *     summary: Add a new government scheme (Admin only)
 *     tags: [Schemes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, eligibility, deadline]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               eligibility:
 *                 type: string
 *               website:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Scheme added successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/admin/schemes", verifyToken, isAdmin, schemeController.addScheme);

/**
 * @swagger
 * /api/admin/schemes/{id}:
 *   delete:
 *     summary: Delete a scheme (Admin only)
 *     tags: [Schemes]
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
 *         description: Scheme deleted
 *       404:
 *         description: Scheme not found
 */
router.delete("/admin/schemes/:id", verifyToken, isAdmin, schemeController.deleteScheme);

module.exports = router;
