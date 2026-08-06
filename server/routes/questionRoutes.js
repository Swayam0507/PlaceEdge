const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getQuestions,
  getCategories,
} = require("../controllers/questionController");

// Public (protected) routes
router.get("/", protect, getQuestions);
router.get("/categories", protect, getCategories);



module.exports = router;
