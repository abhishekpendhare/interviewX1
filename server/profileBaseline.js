const fs = require('fs');

async function runBaselineProfiling() {
    console.log('====================================================');
    console.log('📊 STRATA SYSTEM PERFORMANCE PROFILING: BASELINE');
    console.log('====================================================\n');
    
    // 1. File and Memory footprint
    const storeStats = fs.statSync('server/db/store.json');
    console.log('[Metric 1] Database store.json Size on Disk:', (storeStats.size / (1024*1024)).toFixed(2), 'MB');

    // 2. API Endpoints Latency & Payload Size
    const endpoints = [
        { name: 'Compiler Problems Catalog', url: '/api/compiler/problems' },
        { name: 'Single Problem Details', url: '/api/compiler/problems/two-sum' },
        { name: 'Foundations Sprints List', url: '/api/foundations/sprints' },
        { name: 'Candidate Profile & Dossier', url: '/api/candidate/profile' },
        { name: 'AI Signal Briefing', url: '/api/advisor/briefing' }
    ];

    console.log('\n[Metric 2] API Latencies & Payloads (5-run averages):');
    console.log('-------------------------------------------------------------------------------');
    console.log('Endpoint Name                  | Avg Latency | Payload Size | Total Items');
    console.log('-------------------------------------------------------------------------------');
    
    for (const ep of endpoints) {
        let totalLat = 0;
        let payloadSize = 0;
        let itemCount = '-';
        for (let i = 0; i < 5; i++) {
            const start = performance.now();
            const res = await fetch('http://localhost:3000' + ep.url, { headers: { 'x-student-id': 'candidate-001' } });
            const text = await res.text();
            totalLat += (performance.now() - start);
            payloadSize = Buffer.byteLength(text);
            try {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed)) itemCount = parsed.length;
                else if (parsed.problems) itemCount = parsed.problems.length;
            } catch (e) {}
        }
        const avgLat = (totalLat / 5).toFixed(1);
        const sizeKb = (payloadSize / 1024).toFixed(1);
        console.log(
            ep.name.padEnd(30) + ' | ' +
            (avgLat + ' ms').padEnd(11) + ' | ' +
            (sizeKb + ' KB').padEnd(12) + ' | ' +
            String(itemCount).padEnd(10)
        );
    }
    console.log('-------------------------------------------------------------------------------');

    // 3. Client Distribution Asset Sizes
    console.log('\n[Metric 3] Client Distribution Asset Sizes:');
    const distAssets = fs.readdirSync('client/dist/assets');
    let totalJsSize = 0;
    let totalCssSize = 0;
    distAssets.forEach(file => {
        const sz = fs.statSync('client/dist/assets/' + file).size;
        if (file.endsWith('.js')) totalJsSize += sz;
        if (file.endsWith('.css')) totalCssSize += sz;
    });
    console.log('Total JS Assets in client/dist:', (totalJsSize / 1024).toFixed(1), 'KB');
    console.log('Total CSS Assets in client/dist:', (totalCssSize / 1024).toFixed(1), 'KB');
    console.log('Main bundle (index-*.js):', (fs.statSync('client/dist/assets/' + distAssets.find(f => f.startsWith('index-') && f.endsWith('.js'))).size / 1024).toFixed(1), 'KB');
    console.log('====================================================\n');
}

runBaselineProfiling();
