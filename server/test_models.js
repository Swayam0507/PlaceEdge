require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
    const models = [
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-3-flash-preview',
        'gemini-3-pro-preview',
        'gemini-flash-latest',
    ];

    for (const model of models) {
        try {
            console.log(`\nTesting ${model}...`);
            const response = await ai.models.generateContent({
                model,
                contents: 'Say hello in one word.',
            });
            console.log(`✅ ${model} WORKS! Response: ${response.text.trim()}`);
        } catch(e) {
            console.log(`❌ ${model} FAILED: ${e.status} - ${e.message?.substring(0, 150)}`);
        }
    }
}

test();
