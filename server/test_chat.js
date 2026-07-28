const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({apiKey: 'dummy'});
try {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            temperature: 0.7,
        },
        history: [{role: 'user', parts: [{text: 'hello'}]}]
    });
    console.log("Chat created successfully");
} catch(e) {
    console.error("Error creating chat:", e.message);
}
