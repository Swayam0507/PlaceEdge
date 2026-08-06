const Groq = require("groq-sdk");

/**
 * @desc    Generate dynamic interview questions using Groq AI
 * @route   POST /api/interview/generate
 * @access  Private
 */
const generateInterviewQuestions = async (req, res) => {
  try {
    const { category, company, role } = req.body;
    
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "તમારી-કોપી-કરેલી-કી-અહીં-પેસ્ટ-કરો") {
      return res.status(500).json({ success: false, message: "Groq API Key is missing. Please add it to server/.env" });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const prompt = `You are an expert technical interviewer. Generate 5 realistic interview questions for a candidate applying for the role of ${role || "Software Engineer"} at ${company || "a tech company"}. Focus on ${category || "technical"} questions. 
    Respond ONLY with a valid JSON object in this exact format: {"questions": [{"question": "...", "hint": "..."}]}. Do not include any other text or markdown block backticks.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    });

    let resultText = chatCompletion.choices[0]?.message?.content;
    let parsed;
    try {
      parsed = JSON.parse(resultText);
    } catch (e) {
      return res.status(500).json({ success: false, message: "Failed to parse AI response.", raw: resultText });
    }

    res.status(200).json({ success: true, questions: parsed.questions || [] });
  } catch (error) {
    console.error("Generate Interview Questions Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to generate interview questions." });
  }
};

module.exports = {
  generateInterviewQuestions,
};
