const { GoogleGenAI } = require('@google/genai');
const Groq = require("groq-sdk");
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { SYSTEM_INSTRUCTION, allTools, allToolsGroq } = require('../utils/aiTools');

// Single API key - simple setup
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
            currentMessage.parts[0].text += `\n\n--- EXTRACTED RESUME TEXT ---\n${fileText}`;
        }

        let chatResponse;
        try {
            const chat = ai.chats.create({
                model: 'gemini-1.5-flash',
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    tools: allTools,
                    temperature: 0.7,
                },
                history: formattedHistory
            });
            chatResponse = await chat.sendMessage({
                message: currentMessage.parts[0].text
            });
            
            if (chatResponse.functionCalls && chatResponse.functionCalls.length > 0) {
                const functionCall = chatResponse.functionCalls[0];
                return res.status(200).json({
                    success: true,
                    extractedText: fileText || undefined,
                    message: { role: "ai", isToolCall: true, toolName: functionCall.name, toolArgs: functionCall.args }
                });
            }

            let cleanText = chatResponse.text || "I couldn't process that.";
            cleanText = cleanText.replace(/<function[^>]*>[\s\S]*?<\/function>/gi, '').trim();

            return res.status(200).json({
                success: true,
                extractedText: fileText || undefined,
                message: { role: "ai", text: cleanText }
            });

        } catch (geminiError) {
            console.log("⚠️ Gemini API failed (Likely Rate Limit). Falling back to Groq LLaMA...", geminiError.message);
            
            // --- FALLBACK TO GROQ ---
            const groqMessages = [{ role: "system", content: SYSTEM_INSTRUCTION }];
            messages.forEach(msg => {
                if (msg.isToolCall) {
                    groqMessages.push({ role: "system", content: `I triggered the ${msg.toolName} tool with arguments ${JSON.stringify(msg.toolArgs || {})}` });
                } else {
                    let text = msg.text || " ";
                    if (msg.hiddenText) text += `\n\n--- EXTRACTED RESUME TEXT ---\n${msg.hiddenText}`;
                    groqMessages.push({ role: msg.role === 'ai' ? 'assistant' : 'user', content: text });
                }
            });
            if (fileText) {
                groqMessages[groqMessages.length - 1].content += `\n\n--- EXTRACTED RESUME TEXT ---\n${fileText}`;
            }

            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const chatCompletion = await groq.chat.completions.create({
                messages: groqMessages,
                model: "llama-3.3-70b-versatile",
                tools: allToolsGroq,
                tool_choice: "auto",
                temperature: 0.7,
            });

            const responseMessage = chatCompletion.choices[0]?.message;

            if (responseMessage?.tool_calls && responseMessage.tool_calls.length > 0) {
                const functionCall = responseMessage.tool_calls[0].function;
                let args = {};
                try { args = JSON.parse(functionCall.arguments); } catch(e) {}
                return res.status(200).json({
                    success: true,
                    extractedText: fileText || undefined,
                    message: { role: "ai", isToolCall: true, toolName: functionCall.name, toolArgs: args }
                });
            }

            let cleanText = responseMessage?.content || "I couldn't process that.";
            cleanText = cleanText.replace(/<function[^>]*>[\s\S]*?<\/function>/gi, '').trim();

            return res.status(200).json({
                success: true,
                extractedText: fileText || undefined,
                message: { role: "ai", text: cleanText }
            });
        }

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
CRITICAL: If the category involves Mathematics, Quantitative Aptitude, or Logical Reasoning, you MUST ensure that the question is mathematically sound, the numbers make logical sense, and exactly one of the provided options is the unequivocally correct answer. Double-check your calculations step-by-step internally before finalizing the output.
Respond ONLY with a valid JSON array of objects. Each object MUST have the following structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"], // Exactly 4 options
  "correctAnswer": 0, // Integer 0-3 representing the index of the correct option
  "explanation": "Step-by-step explanation for the correct answer to prove it is mathematically correct."
}`;

        let responseText = "";
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.7,
                }
            });
            responseText = response.text;
        } catch (geminiError) {
            console.log("⚠️ Gemini API failed for Exam. Falling back to Groq...", geminiError.message);
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const groqResponse = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                response_format: { type: "json_object" }
            });
            responseText = groqResponse.choices[0]?.message?.content || "{}";
        }

        let questionsData = [];
        try {
            questionsData = JSON.parse(responseText);
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

        let responseText = "";
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.7,
                }
            });
            responseText = response.text;
        } catch (geminiError) {
            console.log("⚠️ Gemini API failed for Career Advice. Falling back to Groq...", geminiError.message);
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const groqResponse = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                response_format: { type: "json_object" }
            });
            responseText = groqResponse.choices[0]?.message?.content || "{}";
        }

        let adviceData = {};
        try {
            adviceData = JSON.parse(responseText);
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

exports.atsCheck = async (req, res) => {
    try {
        const { jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).json({ success: false, message: "Job description is required." });
        }

        let fileText = "";
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Resume file is required." });
        }

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

        const prompt = `You are a strict but helpful ATS (Applicant Tracking System) used by top-tier tech companies like Google and Meta. 
Evaluate the following resume against the given job description. 
You MUST provide your response in highly professional, structured, and visually appealing Markdown format. Do NOT write long blocky paragraphs. Use bullet points, bold text for emphasis, blockquotes for important notes, and relevant emojis.

Structure your response EXACTLY like this:

### 📊 Overall Match Assessment
> **Status:** [High Match / Partial Match / Low Match]
> **Summary:** [1-2 sharp, professional sentences summarizing their fit.]

### 🎯 Key Strengths
* **[Skill 1]:** Brief explanation of why this is a strength based on the JD.
* **[Skill 2]:** Brief explanation.
* **[Skill 3]:** Brief explanation.

### ⚠️ Missing Keywords & Critical Gaps
* 🔴 **[Missing Skill/Keyword 1]:** Why it's needed and how to add it.
* 🔴 **[Missing Skill/Keyword 2]:** Why it's needed.
* 🔴 **[Experience/Education Gap]:** Note any major gaps (e.g., dates in the future, missing degree).

### 💡 Formatting & Impact Suggestions
* ⚡ **Actionable Tip 1:** [Specific advice, e.g., "Change X to Y"]
* ⚡ **Actionable Tip 2:** [Specific advice]
* ⚡ **Actionable Tip 3:** [Specific advice]

---
*Generated by PlaceEdge AI ATS Engine*

Job Description:
${jobDescription}

Resume:
${fileText}
`;

        let feedbackText = "";
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
                config: {
                    temperature: 0.2,
                }
            });
            feedbackText = response.text;
        } catch (geminiError) {
            console.log("⚠️ Gemini API failed for ATS Check. Falling back to Groq...", geminiError.message);
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const groqResponse = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.2
            });
            feedbackText = groqResponse.choices[0]?.message?.content || "Could not generate ATS analysis.";
        }

        return res.status(200).json({ 
            success: true, 
            feedback: feedbackText 
        });

    } catch (error) {
        console.error("ATS Check Error:", error);
        res.status(500).json({ success: false, message: "Failed to perform ATS check." });
    }
};

exports.companyPrep = async (req, res) => {
    try {
        const { companyName } = req.params;
        if (!companyName) {
            return res.status(400).json({ success: false, message: "Company name is required." });
        }

        const prompt = `You are an expert technical interviewer and career coach.
Generate a comprehensive interview preparation guide for ${companyName}.
Return the response as a raw JSON string.
The JSON object must perfectly match this structure:
{
  "totalQuestions": <approximate number of recent interview questions, e.g. 150>,
  "difficulty": { "easy": <percentage>, "medium": <percentage>, "hard": <percentage> },
  "mostAskedTopics": [
    { 
      "name": "<topic name, e.g. Arrays, System Design, HR>", 
      "count": <approximate frequency>,
      "questions": ["<question 1>", "<question 2>", "<question 3>"]
    }
  ],
  "topQuestions": [
    { "title": "<question title>", "difficulty": "<Easy/Medium/Hard>", "leetcodeUrl": "<optional url or empty string>" }
  ],
  "roadmap": [
    { "week": "Week 1", "title": "<focus title>", "description": "<brief description of what to study>" },
    { "week": "Week 2", "title": "<focus title>", "description": "<brief description of what to study>" },
    { "week": "Week 3", "title": "<focus title>", "description": "<brief description of what to study>" },
    { "week": "Week 4", "title": "<focus title>", "description": "<brief description of what to study>" }
  ],
  "proTips": [
    "<specific insider tip 1 for ${companyName}>",
    "<specific insider tip 2 for ${companyName}>",
    "<specific insider tip 3 for ${companyName}>"
  ]
}
Make sure the percentages in difficulty add up to 100.
Provide around 6 most asked topics and 10 top questions specifically tailored to ${companyName}'s known interview patterns.`;

        let responseText = "";
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
                config: {
                    temperature: 0.3,
                    responseMimeType: "application/json"
                }
            });
            responseText = response.text;
        } catch (geminiError) {
            console.log("⚠️ Gemini API failed for Company Prep. Falling back to Groq...", geminiError.message);
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const groqResponse = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.3,
                response_format: { type: "json_object" }
            });
            responseText = groqResponse.choices[0]?.message?.content || "{}";
        }

        const data = JSON.parse(responseText);

        return res.status(200).json({ 
            success: true, 
            data 
        });
    } catch (error) {
        console.error("Company Prep Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate company prep data." });
    }
};
