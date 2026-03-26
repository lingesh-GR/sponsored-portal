const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all upcoming events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Array of events
 */
router.get("/events", eventController.getEvents);

/**
 * @swagger
 * /api/admin/events:
 *   post:
 *     summary: Add an event (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, event_date]
 *     responses:
 *       201:
 *         description: Event added
 */
router.post("/admin/events", verifyToken, isAdmin, eventController.addEvent);

/**
 * @swagger
 * /api/admin/events/{id}:
 *   delete:
 *     summary: Delete an event (Admin only)
 *     tags: [Events]
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
router.delete("/admin/events/:id", verifyToken, isAdmin, eventController.deleteEvent);

module.exports = router;
