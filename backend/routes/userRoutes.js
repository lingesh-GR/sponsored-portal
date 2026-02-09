const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  verifyToken,
  isAdmin,
  isStudent
} = require("../middleware/authMiddleware");

router.get("/admin", verifyToken, isAdmin, userController.adminDashboard);
router.get("/student", verifyToken, isStudent, userController.studentDashboard);
router.get("/emails", userController.getEmails);

module.exports = router;
