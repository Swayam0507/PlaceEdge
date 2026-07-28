const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
    // Create dummy pdf
    fs.writeFileSync('dummy.pdf', '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    const form = new FormData();
    form.append('resume', fs.createReadStream('dummy.pdf'));
    form.append('messages', JSON.stringify([{role: 'user', text: 'ATS Check kar to'}]));

    try {
        const res = await axios.post('http://localhost:5000/api/ai/test-upload', form, {
            headers: form.getHeaders()
        });
        console.log("Success:", res.data);
    } catch(e) {
        console.log("Error:", e.message);
    }
}
test();
