const http = require('http');

async function test() {
    const loginData = JSON.stringify({ email: 'alex.morgan@interviewx.dev', password: 'InterviewX#2026' });
    const loginReq = http.request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
        }
    }, res => {
        const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0] : '';
        console.log('Login status:', res.statusCode);

        const probReq = http.request('http://localhost:3000/api/compiler/problems?page=1&limit=10', {
            headers: { 'Cookie': cookie }
        }, pRes => {
            let data = '';
            pRes.on('data', c => data += c);
            pRes.on('end', () => {
                const json = JSON.parse(data);
                console.log('Compiler problems status:', pRes.statusCode);
                console.log('Total problems in API:', json.total);
                console.log('Total catalog:', json.totalCatalog);
                console.log('Categories count:', json.categories ? json.categories.length : 0);
                console.log('Companies count:', json.companies ? json.companies.length : 0);
                if (json.problems) {
                    console.log('Sample problems:');
                    json.problems.slice(0, 5).forEach((p, idx) => {
                        console.log('  ' + (idx+1) + '. ' + p.title + ' (' + p.difficulty + ') [' + (p.companyTags || []).slice(0, 3).join(', ') + ']');
                    });
                }
                process.exit(0);
            });
        });
        probReq.end();
    });
    loginReq.write(loginData);
    loginReq.end();
}
test();
