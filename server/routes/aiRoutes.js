const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/auth");
const chatbotController = require("../controllers/chatbotController");

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// The Single Centralized AI Endpoint
// We add upload.single("resume") so the chatbot can handle file uploads (e.g. for ATS checking)
router.post("/chat", protect, upload.single("resume"), chatbotController.chat);

// Test route to verify file upload without auth
router.post("/test-upload", upload.single("resume"), (req, res) => {
    res.json({
        fileReceived: !!req.file,
        mimetype: req.file ? req.file.mimetype : null,
        bodyMessages: req.body.messages ? "present" : "missing"
    });
});

router.post("/test-chat", upload.single("resume"), chatbotController.chat);

// Exam Generation Endpoint
router.post("/generate-exam", protect, chatbotController.generateExam);

// Career Advice Endpoint
router.post("/career-advice", protect, chatbotController.generateCareerAdvice);

// Interview practice feedback — also increments user's practice counter for journey map
router.post("/interview-feedback", protect, async (req, res) => {
    try {
        const { question, answer } = req.body;
        if (!question || !answer) {
            return res.status(400).json({ success: false, message: "Question and answer are required." });
        }

        // Increment user's interview practice count
        const User = require("../models/User");
        await User.findByIdAndUpdate(req.user._id, { $inc: { interviewPracticeCount: 1 } });

        const { GoogleGenAI } = require("@google/genai");
        const ai = new GoogleGenAI({});
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an expert interview coach. Evaluate the following interview answer and provide constructive feedback with ratings and improvement tips.\n\nQuestion: ${question}\n\nCandidate's Answer: ${answer}\n\nProvide feedback in markdown format covering: Strength, Weaknesses, Score (1-10), and Suggestions.`,
        });

        res.status(200).json({
            success: true,
            feedback: response.text,
        });
    } catch (error) {
        console.error("Interview Feedback Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate feedback." });
    }
});

module.exports = router;
