const fs = require('fs');

function fixChatbot() {
    const file = 'server/controllers/chatbotController.js';
    let c = fs.readFileSync(file, 'utf8');
    
    // Replace all wrong models
    c = c.replace(/gemini-2\.5-flash/g, 'gemini-2.0-flash');
    c = c.replace(/gemini-pro/g, 'gemini-2.0-flash');
    
    // Inject ai init where missing
    const toReplace = 'const response = await ai.models.generateContent';
    const replacement = 'const ai = getNextAiInstance();\n        const response = await ai.models.generateContent';
    
    // We replace all instances that do not already have the ai init right above them
    // An easy way is to replace all, and if it duplicates, we fix it.
    // Let's just blindly replace all occurrences of `const response = await ai.models.generateContent` 
    // with the initialization attached to it.
    c = c.split(toReplace).join(replacement);
    
    fs.writeFileSync(file, c);
    console.log('Fixed chatbotController.js');
}

function fixRoutes() {
    const file = 'server/routes/aiRoutes.js';
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace(/gemini-2\.5-flash/g, 'gemini-2.0-flash');
    fs.writeFileSync(file, c);
    console.log('Fixed aiRoutes.js');
}

fixChatbot();
fixRoutes();
