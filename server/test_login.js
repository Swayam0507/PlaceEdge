const axios = require('axios');
async function test() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@placeedge.com',
            password: 'Admin@2026'
        });
        console.log("Success:", res.data);
    } catch(e) {
        if (e.code === 'ECONNREFUSED') {
            console.log("Server is down!");
        } else if (e.response) {
            console.log("Error status:", e.response.status);
            console.log("Error data:", e.response.data);
        } else {
            console.log("Error:", e.message);
        }
    }
}
test();
