const express = require("express");
const router = express.Router();
const {
  generateInterviewQuestions
} = require("../controllers/interviewController");
const { protect } = require("../middleware/auth");

router.post("/generate", protect, generateInterviewQuestions);

module.exports = router;
