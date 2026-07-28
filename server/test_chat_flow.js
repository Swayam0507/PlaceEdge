const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
    // 1. Create dummy pdf
    fs.writeFileSync('dummy.pdf', '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\nDummy Resume Text here\n');

    // 2. Simulate Turn 1: User sends "ATS Check kar to" with PDF
    let messages = [
        { role: 'ai', text: 'Hi! How can I help?' },
        { role: 'user', text: 'ATS Check kar to [Attached: dummy.pdf]' }
    ];
    
    const form1 = new FormData();
    form1.append('resume', fs.createReadStream('dummy.pdf'));
    form1.append('messages', JSON.stringify(messages));

    let res1;
    try {
        res1 = await axios.post('http://localhost:5000/api/ai/test-chat', form1, {
            headers: form1.getHeaders()
        });
        console.log("Turn 1 Response:", res1.data);
    } catch(e) {
        console.log("Turn 1 Error:", e.response ? e.response.data : e.message);
        return;
    }

    // Simulate frontend appending the AI response and storing hiddenText
    messages.push(res1.data.message);
    if (res1.data.extractedText) {
        // Find last user message
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                messages[i].hiddenText = res1.data.extractedText;
                break;
            }
        }
    }

    // 3. Simulate Turn 2: User provides JD (no file)
    messages.push({ role: 'user', text: 'Job Description: React Developer' });
    
    try {
        const res2 = await axios.post('http://localhost:5000/api/ai/test-chat', { messages });
        console.log("Turn 2 Response:", res2.data);
    } catch(e) {
        console.log("Turn 2 Error:", e.response ? e.response.data : e.message);
    }
}
test();
