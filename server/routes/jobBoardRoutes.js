const express = require("express");
const router = express.Router();
const { getJobs } = require("../controllers/jobBoardController");
const { protect } = require("../middleware/auth");

// We can protect it so only logged-in users can see off-campus jobs
router.get("/", protect, getJobs);

module.exports = router;
