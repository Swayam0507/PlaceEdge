const Company = require("../models/Company");
const Placement = require("../models/Placement");
const User = require("../models/User");

/**
 * @desc    Get all companies (paginated, filterable)
 * @route   GET /api/companies?status=upcoming&page=1
 * @access  Private
 */
const getCompanies = async (req, res) => {
  try {
    // Auto-correct stale statuses: upcoming/ongoing companies with past dates → completed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await Company.updateMany(
      { status: { $in: ["upcoming", "ongoing"] }, visitDate: { $lt: today } },
      { $set: { status: "completed" } }
    );

    const { status, search, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .sort({ visitDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Company.countDocuments(filter),
    ]);

    // Auto-compute studentsPlaced from Placement records
    const companyIds = companies.map(c => c._id);
    const placedCounts = await Placement.aggregate([
      { $match: { company: { $in: companyIds } } },
      { $group: { _id: "$company", count: { $sum: 1 } } },
    ]);
    const placedMap = {};
    placedCounts.forEach(p => { placedMap[p._id.toString()] = p.count; });

    const enrichedCompanies = companies.map(c => ({
      ...c,
      studentsPlaced: placedMap[c._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      companies: enrichedCompanies,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
      },
    });
  } catch (error) {
    console.error("Get Companies Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch companies." });
  }
};

/**
 * @desc    Check eligibility for a company
 * @route   GET /api/companies/:id/eligibility
 * @access  Private
 */
const checkEligibility = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });

    const user = req.user;
    const issues = [];

    if (company.eligibility.minCGPA > 0 && user.cgpa < company.eligibility.minCGPA) {
      issues.push(`CGPA ${user.cgpa} below required ${company.eligibility.minCGPA}`);
    }
    if (company.eligibility.branches.length > 0 && !company.eligibility.branches.includes(user.branch)) {
      issues.push(`Branch "${user.branch}" not eligible`);
    }

    res.status(200).json({
      success: true,
      eligible: issues.length === 0,
      issues,
      company: company.name,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to check eligibility." });
  }
};

/**
 * @desc    Create a company (admin)
 * @route   POST /api/companies
 * @access  Private/Admin
 */
const createCompany = async (req, res) => {
  try {
    const { name, visitDate, status, roles, selectionProcess } = req.body;

    // --- Validation ---
    const errors = [];

    if (!name || !name.trim()) {
      errors.push("Company name is required.");
    }

    if (!visitDate) {
      errors.push("Visit date is required.");
    }

    // Roles: accept array or comma-separated string
    const rolesArr = Array.isArray(roles) ? roles : (roles || "").split(",").map(r => r.trim()).filter(Boolean);
    if (rolesArr.length === 0) {
      errors.push("At least one role is required.");
    }

    // Selection process: accept array or comma-separated string
    const processArr = Array.isArray(selectionProcess) ? selectionProcess : (selectionProcess || "").split(",").map(s => s.trim()).filter(Boolean);
    if (processArr.length === 0) {
      errors.push("At least one selection process step is required.");
    }

    // Date-status consistency
    if (visitDate && status) {
      const visit = new Date(visitDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (status === "upcoming" && visit < today) {
        errors.push("Visit date must be today or in the future for 'Upcoming' status.");
      }
      if (status === "completed" && visit > today) {
        errors.push("Visit date must be in the past for 'Completed' status.");
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(" ") });
    }

    const company = await Company.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, message: "Company added.", company });
  } catch (error) {
    console.error("Create Company Error:", error);
    res.status(500).json({ success: false, message: "Failed to create company." });
  }
};

/**
 * @desc    Update a company (admin)
 * @route   PUT /api/companies/:id
 * @access  Private/Admin
 */
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });
    res.status(200).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update company." });
  }
};

/**
 * @desc    Delete a company (admin)
 * @route   DELETE /api/companies/:id
 * @access  Private/Admin
 */
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });
    // Also delete all placement records for this company
    await Placement.deleteMany({ company: req.params.id });
    res.status(200).json({ success: true, message: "Company deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete company." });
  }
};

/**
 * @desc    Add a student as placed in a company
 * @route   POST /api/companies/:id/placements
 * @access  Private/Admin
 */
const addPlacement = async (req, res) => {
  try {
    const { studentId, role, packageOffered } = req.body;

    if (!studentId || !role) {
      return res.status(400).json({ success: false, message: "Student and role are required." });
    }

    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    // Check for duplicate
    const existing = await Placement.findOne({ student: studentId, company: req.params.id });
    if (existing) {
      return res.status(400).json({ success: false, message: "Student is already placed in this company." });
    }

    const placement = await Placement.create({
      student: studentId,
      company: req.params.id,
      role,
      packageOffered: packageOffered || 0,
      addedBy: req.user._id,
    });

    const populated = await Placement.findById(placement._id)
      .populate("student", "name email branch cgpa");

    res.status(201).json({ success: true, message: "Placement recorded.", placement: populated });
  } catch (error) {
    console.error("Add Placement Error:", error);
    res.status(500).json({ success: false, message: "Failed to add placement." });
  }
};

/**
 * @desc    Get all placed students for a company
 * @route   GET /api/companies/:id/placements
 * @access  Private
 */
const getPlacements = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });

    const placements = await Placement.find({ company: req.params.id })
      .populate("student", "name email branch cgpa semester")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, placements, count: placements.length });
  } catch (error) {
    console.error("Get Placements Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch placements." });
  }
};

/**
 * @desc    Remove a placement record
 * @route   DELETE /api/companies/:id/placements/:placementId
 * @access  Private/Admin
 */
const removePlacement = async (req, res) => {
  try {
    const placement = await Placement.findOneAndDelete({
      _id: req.params.placementId,
      company: req.params.id,
    });
    if (!placement) return res.status(404).json({ success: false, message: "Placement record not found." });
    res.status(200).json({ success: true, message: "Placement removed." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to remove placement." });
  }
};

/**
 * @desc    Search students (for admin placement dropdown)
 * @route   GET /api/companies/students/search?q=name
 * @access  Private/Admin
 */
const searchStudents = async (req, res) => {
  try {
    const { q = "" } = req.query;
    if (!q.trim()) return res.status(200).json({ success: true, students: [] });

    const students = await User.find({
      role: "student",
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("name email branch cgpa")
      .limit(10)
      .lean();

    res.status(200).json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to search students." });
  }
};

module.exports = {
  getCompanies, checkEligibility, createCompany, updateCompany, deleteCompany,
  addPlacement, getPlacements, removePlacement, searchStudents,
};
