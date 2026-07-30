const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { updateProfile, getProfile, toggleTheme, completeOnboarding, toggleRoadmapTask } = require("../controllers/profileController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.put("/theme", protect, toggleTheme);
router.post("/onboarding", protect, upload.single("resume"), completeOnboarding);
router.put("/roadmap/task", protect, toggleRoadmapTask);

module.exports = router;
