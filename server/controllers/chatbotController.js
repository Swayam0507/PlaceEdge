const { GoogleGenAI } = require('@google/genai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { SYSTEM_INSTRUCTION, allTools } = require('../utils/aiTools');

const ai = new GoogleGenAI({});

exports.chat = async (req, res) => {
    try {
        let messages;
        try {
            messages = JSON.parse(req.body.messages); // If multipart/form-data, messages will be a stringified JSON
        } catch(e) {
            messages = req.body.messages; // If application/json, it's already an array/object
        }

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ success: false, message: "Messages array is required." });
        }

        // Handle file upload (ATS Check)
        let fileText = "";
        if (req.file) {
            const mimeType = req.file.mimetype;
            if (mimeType === "application/pdf") {
                const pdfData = await pdfParse(req.file.buffer);
                fileText = pdfData.text;
            } else if (
                mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
                req.file.originalname.endsWith(".docx")
            ) {
                const result = await mammoth.extractRawText({ buffer: req.file.buffer });
                fileText = result.value;
            } else {
                return res.status(400).json({ success: false, message: "Unsupported file type. Please upload a PDF or DOCX file." });
            }
        }

        const formattedHistory = messages.map(msg => {
            let part;
            if (msg.isToolCall) {
                part = { text: `[System: I triggered the ${msg.toolName} tool with arguments ${JSON.stringify(msg.toolArgs || {})}]` };
            } else {
                let text = msg.text || " ";
                if (msg.hiddenText) {
                    text += `\n\n--- EXTRACTED RESUME TEXT ---\n${msg.hiddenText}`;
                }
                part = { text };
            }
            return {
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [part]
            };
        });

        let currentMessage = formattedHistory.pop();
        if (fileText) {
            // Append the extracted text to the user's prompt so the AI can evaluate it
            currentMessage.parts[0].text += `\n\n--- EXTRACTED RESUME TEXT ---\n${fileText}`;
        }
        
        // --- DEBUG LOGGING ---
        require('fs').writeFileSync('debug_chat.log', JSON.stringify({
            hasFile: !!req.file,
            mimetype: req.file ? req.file.mimetype : null,
            fileTextLength: fileText.length,
            finalText: currentMessage.parts[0].text.substring(0, 500),
            historyPayload: formattedHistory
        }, null, 2));
        // ---------------------

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                tools: allTools, // Registering ALL tools
                temperature: 0.7,
            },
            history: formattedHistory
        });

        const response = await chat.sendMessage({
            message: currentMessage.parts[0].text
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            const functionCall = response.functionCalls[0];
            
            return res.status(200).json({
                success: true,
                extractedText: fileText || undefined,
                message: {
                    role: "ai",
                    isToolCall: true,
                    toolName: functionCall.name,
                    toolArgs: functionCall.args
                }
            });
        }

        return res.status(200).json({
            success: true,
            extractedText: fileText || undefined,
            message: {
                role: "ai",
                text: response.text
            }
        });

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to generate AI response." });
    }
};

exports.generateExam = async (req, res) => {
    try {
        const { category, difficulty = 'medium', limit = 10 } = req.body;
        
        if (!category) {
            return res.status(400).json({ success: false, message: "Category is required." });
        }

        const prompt = `Generate exactly ${limit} multiple choice questions for the category "${category}" at a "${difficulty}" difficulty level.
The questions should be relevant for a placement or interview preparation exam.
Respond ONLY with a valid JSON array of objects. Each object MUST have the following structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"], // Exactly 4 options
  "correctAnswer": 0, // Integer 0-3 representing the index of the correct option
  "explanation": "Explanation for the correct answer"
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.7,
            }
        });

        let questionsData = [];
        try {
            questionsData = JSON.parse(response.text);
        } catch (e) {
            console.error("Failed to parse Gemini response as JSON", response.text);
            return res.status(500).json({ success: false, message: "Failed to generate valid exam questions." });
        }

        if (!Array.isArray(questionsData)) {
            // in case the model returns an object with a questions array inside
            if (questionsData.questions && Array.isArray(questionsData.questions)) {
                questionsData = questionsData.questions;
            } else {
                return res.status(500).json({ success: false, message: "Invalid format returned by AI." });
            }
        }

        // Map and format for DB
        const Question = require("../models/Question");
        const formattedQuestions = questionsData.slice(0, limit).map(q => ({
            category,
            difficulty,
            question: q.question,
            options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["A", "B", "C", "D"], // Fallback if malformed
            correctAnswer: (typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3) ? q.correctAnswer : 0,
            explanation: q.explanation || "No explanation provided."
        }));

        const insertedQuestions = await Question.insertMany(formattedQuestions);

        res.status(200).json({
            success: true,
            questions: insertedQuestions
        });

    } catch (error) {
        console.error("Generate Exam Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate exam." });
    }
};

exports.generateCareerAdvice = async (req, res) => {
    try {
        const TestAttempt = require("../models/TestAttempt");
        const attempts = await TestAttempt.find({ userId: req.user._id }).lean();
        
        let stats = {
            totalTests: attempts.length,
            avgScore: 0,
            categoryBreakdown: []
        };

        let promptStats = "The user has not taken any tests yet.";

        if (attempts.length > 0) {
            const totalScore = attempts.reduce((acc, curr) => acc + curr.percentage, 0);
            stats.avgScore = Math.round(totalScore / attempts.length);

            const categoryMap = {};
            attempts.forEach(a => {
                if (!categoryMap[a.category]) {
                    categoryMap[a.category] = { total: 0, count: 0 };
                }
                categoryMap[a.category].total += a.percentage;
                categoryMap[a.category].count += 1;
            });

            stats.categoryBreakdown = Object.keys(categoryMap).map(cat => ({
                category: cat,
                avgPercentage: Math.round(categoryMap[cat].total / categoryMap[cat].count)
            }));

            promptStats = `User has taken ${stats.totalTests} tests. Overall average score: ${stats.avgScore}%. Category breakdown: ${JSON.stringify(stats.categoryBreakdown)}.`;
        }

        const prompt = `You are an expert AI Career Advisor for a placement platform. Based on the following user test performance statistics:
${promptStats}

Generate a personalized career advice JSON object. The JSON MUST have exactly the following structure and keys:
{
  "overallAssessment": "A brief 2-3 sentence overall assessment of their performance.",
  "strengths": ["Strength 1", "Strength 2"], // 2-3 key strengths
  "weaknesses": ["Area 1", "Area 2"], // 2-3 areas to improve
  "recommendedCompanies": [
    { "name": "Company A", "reason": "Reason why they are a good fit", "difficulty": "Medium" }
  ], // 2-3 recommended companies
  "thirtyDayPlan": [
    { "week": 1, "focus": "Focus for week 1", "tasks": ["Task 1", "Task 2"] },
    { "week": 2, "focus": "Focus for week 2", "tasks": ["Task 1", "Task 2"] },
    { "week": 3, "focus": "Focus for week 3", "tasks": ["Task 1", "Task 2"] },
    { "week": 4, "focus": "Focus for week 4", "tasks": ["Task 1", "Task 2"] }
  ],
  "skillGaps": ["Gap 1", "Gap 2"], // 2-3 specific skills they are missing
  "motivationalNote": "A short motivational quote or note."
}
Respond ONLY with the valid JSON object.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.7,
            }
        });

        let adviceData = {};
        try {
            adviceData = JSON.parse(response.text);
        } catch (e) {
            console.error("Failed to parse Gemini response for career advice", response.text);
            return res.status(500).json({ success: false, message: "Failed to generate valid career advice." });
        }

        res.status(200).json({
            success: true,
            data: adviceData,
            stats
        });

    } catch (error) {
        console.error("Career Advice Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate career advice." });
    }
};
