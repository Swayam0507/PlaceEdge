const { Type } = require('@google/genai');

const SYSTEM_INSTRUCTION = `You are the PlaceEdge AI Assistant, a highly advanced and friendly AI Mentor for students preparing for placements and careers.
Your responsibilities cover:
- Mock interviews and feedback.
- ATS Resume Checking.
- Generating Exams and Company Prep Sheets.
- Generating a resume for the user.

STRICT RULES (CRITICAL):
1. MULTILINGUAL & FORMATTING: If the user speaks Gujarati, Hindi, or Hinglish, ALWAYS reply in the exact same language (e.g. Gujarati). Use rich Markdown (**bold**, lists, ###) and Emojis (🚀, 💡, 🎯) to make the chat feel premium and engaging. DO NOT output plain, boring text.
2. SCOPE: Only answer questions related to placements, studies, coding, and careers. Politely decline others.
3. TOOLS OVER TEXT: If the user asks for an exam, company prep, interview evaluation, or resume generation, ALWAYS gather the required details interactively and then invoke the corresponding tool natively. DO NOT output raw JSON or <function> tags in your text. Just call the tool natively using the API schema.
    - generate_exam: Requires topic (e.g., DSA, Aptitude) and difficulty (easy/medium/hard).
    - generate_company_prep: Requires company name and target role.
    - evaluate_interview: Requires the question asked and the user's answer.
    - generate_resume_ui: Requires name, email, phone, and skills.
    - show_ats_score: Requires the user's resume text and a job description.


TOOL CALLING RULES:
1. Scope: Only answer questions related to placements, studies, coding, and careers. Politely decline others.
2. Tools over Text: If the user asks for an exam, company prep, interview evaluation, or resume generation, ALWAYS gather the required details interactively and then invoke the corresponding tool natively via the API.
3. NEVER write raw JSON, <function>, or XML tags in your text response to call a tool. Just call the tool natively using the provided schema.
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
    allTools: [
        generateResumeTool,
        generateExamTool,
        generateCompanyPrepTool,
        evaluateInterviewTool,
        showAtsScoreTool
    ],
    allToolsGroq: [
        {
            type: "function",
            function: {
                name: "generate_resume_ui",
                description: "Generates a Resume PDF UI for the user. Call after gathering name, email, phone, and skills.",
                parameters: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        email: { type: "string" },
                        phone: { type: "string" },
                        skills: { type: "string" }
                    },
                    required: ["name", "email", "phone", "skills"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "generate_exam",
                description: "Generates a multiple-choice exam for the user. Call after gathering topic and difficulty.",
                parameters: {
                    type: "object",
                    properties: {
                        topic: { type: "string", description: "Topic of the exam" },
                        difficulty: { type: "string", description: "easy, medium, or hard" },
                        questions: {
                            type: "array",
                            description: "Exactly 5 generated MCQ questions",
                            items: {
                                type: "object",
                                properties: {
                                    question: { type: "string" },
                                    options: { type: "array", items: { type: "string" } },
                                    correctAnswer: { type: "string" },
                                    explanation: { type: "string" }
                                },
                                required: ["question", "options", "correctAnswer", "explanation"]
                            }
                        }
                    },
                    required: ["topic", "difficulty", "questions"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "generate_company_prep",
                description: "Generates a prep sheet for a specific company and role.",
                parameters: {
                    type: "object",
                    properties: {
                        companyName: { type: "string" },
                        role: { type: "string" },
                        aboutCompany: { type: "string" },
                        interviewRounds: { type: "array", items: { type: "string" } },
                        topQuestions: { type: "array", items: { type: "string" } }
                    },
                    required: ["companyName", "role", "aboutCompany", "interviewRounds", "topQuestions"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "evaluate_interview",
                description: "Evaluates the user's answer to an interview question.",
                parameters: {
                    type: "object",
                    properties: {
                        question: { type: "string" },
                        userAnswer: { type: "string" },
                        score: { type: "number" },
                        strengths: { type: "string" },
                        improvements: { type: "string" }
                    },
                    required: ["question", "userAnswer", "score", "strengths", "improvements"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "show_ats_score",
                description: "Displays the ATS match score and feedback based on the user's provided resume text and job description.",
                parameters: {
                    type: "object",
                    properties: {
                        score: { type: "number" },
                        missingKeywords: { type: "array", items: { type: "string" } },
                        actionableFeedback: { type: "array", items: { type: "string" } }
                    },
                    required: ["score", "missingKeywords", "actionableFeedback"]
                }
            }
        }
    ]
};
