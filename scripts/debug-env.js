
const fs = require('fs');
const path = require('path');

try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env.local file NOT found');
    } else {
        console.log('✅ .env.local file found');
        const content = fs.readFileSync(envPath, 'utf8');
        console.log('--- Raw Content Start ---');
        console.log(content);
        console.log('--- Raw Content End ---');

        console.log('\n--- Parsing ---');
        content.split('\n').forEach((line, idx) => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                console.log(`Line ${idx + 1}: Key=[${match[1].trim()}], Value=[${match[2].trim().substring(0, 5)}...]`);
            } else {
                console.log(`Line ${idx + 1}: [NO MATCH] ${line}`);
            }
        });
    }
} catch (err) {
    console.error('Error:', err);
}
