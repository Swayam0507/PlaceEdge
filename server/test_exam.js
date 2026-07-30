require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY.split(',')[0] });

async function test() {
    try {
        const prompt = `Generate exactly 2 multiple choice questions for the category "react" at a "medium" difficulty level.
The questions should be relevant for a placement or interview preparation exam.
Respond ONLY with a valid JSON array of objects. Each object MUST have the following structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"], // Exactly 4 options
  "correctAnswer": 0, // Integer 0-3 representing the index of the correct option
  "explanation": "Explanation for the correct answer"
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.7,
            }
        });

        console.log("Response text:", response.text);
        
        let questionsData = JSON.parse(response.text);
        console.log("Parsed:", questionsData);
    } catch(e) {
        console.error("Error:", e);
    }
}

test();
