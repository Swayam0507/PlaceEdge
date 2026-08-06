const Question = require("../models/Question");

/**
 * @desc    Get questions by category (with optional difficulty filter)
 * @route   GET /api/questions?category=quantitative&difficulty=medium&limit=10
 * @access  Private
 */
const getQuestions = async (req, res) => {
  try {
    const { category, difficulty, limit = 10 } = req.query;

    const filter = {};
    if (category && category !== "mixed") {
      filter.category = category;
    }
    if (difficulty && difficulty !== "mixed") {
      filter.difficulty = difficulty;
    }

    // Randomly select questions
    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(limit) } },
      {
        $project: {
          category: 1,
          question: 1,
          options: 1,
          difficulty: 1,
          // Don't send correctAnswer to frontend during test
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error("Get Questions Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions.",
    });
  }
};



/**
 * @desc    Get all categories with question counts
 * @route   GET /api/questions/categories
 * @access  Private
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Question.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          difficulties: { $addToSet: "$difficulty" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      categories: categories.map((c) => ({
        name: c._id,
        count: c.count,
        difficulties: c.difficulties,
      })),
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories.",
    });
  }
};



module.exports = { getQuestions, getCategories };
