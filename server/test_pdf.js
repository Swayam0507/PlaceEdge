const pdfParse = require('pdf-parse');
async function test() {
    try {
        const fs = require('fs');
        const buffer = fs.readFileSync('dummy.pdf');
        const data = await pdfParse(buffer);
        console.log("Success:", data.text);
    } catch(e) {
        console.log("Error:", e.message);
    }
}
test();
