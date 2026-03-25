const express = require("express");
const router = express.Router();

const internshipController = require("../controllers/internshipController");

/**
 * @swagger
 * /api/internships:
 *   get:
 *     summary: Get all internship listings
 *     tags: [Internships]
 *     responses:
 *       200:
 *         description: Array of internship objects
 */
router.get("/internships", internshipController.getInternships);

/**
 * @swagger
 * /api/admin/internships:
 *   post:
 *     summary: Add a new internship (Admin only)
 *     tags: [Internships]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, eligibility, deadline]
 *     responses:
 *       201:
 *         description: Internship added
 */
router.post("/admin/internships", internshipController.addInternship);

/**
 * @swagger
 * /api/admin/internships/{id}:
 *   delete:
 *     summary: Delete an internship (Admin only)
 *     tags: [Internships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete("/admin/internships/:id", internshipController.deleteInternship);

module.exports = router;
