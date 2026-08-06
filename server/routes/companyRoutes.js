const express = require("express");
const router = express.Router();
const {
  getCompanies, checkEligibility, createCompany, updateCompany, deleteCompany,
  addPlacement, getPlacements, removePlacement, searchStudents,
} = require("../controllers/companyController");
const { protect, authorize } = require("../middleware/auth");

// Student search (for admin placement dropdown) — must be before /:id routes
router.get("/students/search", protect, authorize("admin"), searchStudents);

router.get("/", protect, getCompanies);
router.get("/:id/eligibility", protect, checkEligibility);
router.post("/", protect, authorize("admin"), createCompany);
router.put("/:id", protect, authorize("admin"), updateCompany);
router.delete("/:id", protect, authorize("admin"), deleteCompany);

// Placement routes
router.get("/:id/placements", protect, getPlacements);
router.post("/:id/placements", protect, authorize("admin"), addPlacement);
router.delete("/:id/placements/:placementId", protect, authorize("admin"), removePlacement);

module.exports = router;
