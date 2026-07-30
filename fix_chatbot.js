const fs = require('fs');
const path = './server/controllers/chatbotController.js';
let content = fs.readFileSync(path, 'utf8');

// Replace gemini-pro
content = content.replace(/gemini-pro/g, 'gemini-2.0-flash');

// Add const ai = getNextAiInstance();
content = content.replace(/exports\.chat = async \(req, res\) => \{\s*try \{/g, 'exports.chat = async (req, res) => {\n    try {\n        const ai = getNextAiInstance();');
content = content.replace(/exports\.generateCareerAdvice = async \(req, res\) => \{\s*try \{/g, 'exports.generateCareerAdvice = async (req, res) => {\n    try {\n        const ai = getNextAiInstance();');
content = content.replace(/exports\.atsCheck = async \(req, res\) => \{\s*try \{/g, 'exports.atsCheck = async (req, res) => {\n    try {\n        const ai = getNextAiInstance();');
content = content.replace(/exports\.companyPrep = async \(req, res\) => \{\s*try \{/g, 'exports.companyPrep = async (req, res) => {\n    try {\n        const ai = getNextAiInstance();');

fs.writeFileSync(path, content);
console.log("Fixed chatbotController.js");
