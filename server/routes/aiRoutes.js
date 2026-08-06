const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/auth");
const chatbotController = require("../controllers/chatbotController");
const { GoogleGenAI } = require("@google/genai");

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

        const Groq = require("groq-sdk");
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const prompt = `You are an expert interview coach. Evaluate the following interview answer and provide short, direct, and constructive feedback. KEEP YOUR RESPONSE EXTREMELY CONCISE AND TO THE POINT (maximum 3-4 short sentences per section). Do not write long essays or full answers.\n\nQuestion: ${question}\n\nCandidate's Answer: ${answer}\n\nProvide short feedback in markdown format covering:\n- Strength (1 bullet)\n- Weaknesses (1-2 bullets)\n- Score (1-10)\n- Suggestions (1-2 short bullet points max)`;

        let feedbackText = "";
        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.1-8b-instant",
                temperature: 0.5,
                max_tokens: 500,
            });
            feedbackText = chatCompletion.choices[0]?.message?.content;
        } catch (groqError) {
            console.log("⚠️ Groq API failed for Interview Feedback. Falling back to Gemini...", groqError.message);
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: prompt,
                config: {
                    temperature: 0.5,
                }
            });
            feedbackText = response.text;
        }

        res.status(200).json({
            success: true,
            feedback: feedbackText,
        });
    } catch (error) {
        console.error("Interview Feedback Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate feedback." });
    }
});

// ATS Resume Check Endpoint
router.post("/ats-check", protect, upload.single("resume"), chatbotController.atsCheck);

// Company Prep Guide Generation
router.get("/company-prep/:companyName", protect, chatbotController.companyPrep);

module.exports = router;
