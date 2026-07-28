const { Type } = require('@google/genai');

const SYSTEM_INSTRUCTION = `You are the PlaceEdge AI Assistant, a centralized AI Agent for students preparing for placements and careers.
Your responsibilities cover:
- Mock interviews and feedback.
- ATS Resume Checking.
- Generating Exams and Company Prep Sheets.
- Generating a resume for the user.

STRICT RULES:
1. Scope: Only answer questions related to placements, studies, coding, and careers. Politely decline others.
2. Tools over Text: If the user asks for an exam, company prep, interview evaluation, or resume generation, ALWAYS gather the required details interactively and then invoke the corresponding tool. Do NOT just output plain text for these features.
    - generate_exam: Requires topic (e.g., DSA, Aptitude) and difficulty (easy/medium/hard).
    - generate_company_prep: Requires company name and target role.
    - evaluate_interview: Requires the question asked and the user's answer.
    - generate_resume_ui: Requires name, email, phone, and skills.
    - show_ats_score: Requires the user's resume text and a job description. 
      NOTE: If the user attaches a PDF file, the system will automatically extract the text and append it to their message as "--- EXTRACTED RESUME TEXT ---". You CAN read this! Do not tell the user you cannot read PDFs. If you receive the extracted text but no job description, ask them to provide the job description so you can proceed with calling the tool.`;

const generateResumeTool = {
    name: "generate_resume_ui",
    description: "Generates a Resume PDF UI for the user. Call after gathering name, email, phone, and skills.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            skills: { type: Type.STRING }
        },
        required: ["name", "email", "phone", "skills"]
    }
};

const generateExamTool = {
    name: "generate_exam",
    description: "Generates a multiple-choice exam for the user. Call after gathering topic and difficulty.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            topic: { type: Type.STRING, description: "Topic of the exam (e.g., React, Java, Aptitude)" },
            difficulty: { type: Type.STRING, description: "Difficulty level: easy, medium, or hard" },
            questions: {
                type: Type.ARRAY,
                description: "Array of exactly 5 generated MCQ questions",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 options" },
                        correctAnswer: { type: Type.STRING, description: "The correct option exactly as written" },
                        explanation: { type: Type.STRING, description: "Short explanation of why it is correct" }
                    },
                    required: ["question", "options", "correctAnswer", "explanation"]
                }
            }
        },
        required: ["topic", "difficulty", "questions"]
    }
};

const generateCompanyPrepTool = {
    name: "generate_company_prep",
    description: "Generates a prep sheet for a specific company and role.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            companyName: { type: Type.STRING },
            role: { type: Type.STRING },
            aboutCompany: { type: Type.STRING, description: "Brief overview of the company" },
            interviewRounds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Typical interview rounds" },
            topQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 frequently asked questions" }
        },
        required: ["companyName", "role", "aboutCompany", "interviewRounds", "topQuestions"]
    }
};

const evaluateInterviewTool = {
    name: "evaluate_interview",
    description: "Evaluates the user's answer to an interview question.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            userAnswer: { type: Type.STRING },
            score: { type: Type.NUMBER, description: "Score out of 10" },
            strengths: { type: Type.STRING, description: "What they did well" },
            improvements: { type: Type.STRING, description: "How they can improve" }
        },
        required: ["question", "userAnswer", "score", "strengths", "improvements"]
    }
};

const showAtsScoreTool = {
    name: "show_ats_score",
    description: "Displays the ATS match score and feedback based on the user's provided resume text and job description.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.NUMBER, description: "Match percentage (0-100)" },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionableFeedback: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 actionable tips to improve" }
        },
        required: ["score", "missingKeywords", "actionableFeedback"]
    }
};

module.exports = {
    SYSTEM_INSTRUCTION,
    allTools: [generateResumeTool, generateExamTool, generateCompanyPrepTool, evaluateInterviewTool, showAtsScoreTool]
};
