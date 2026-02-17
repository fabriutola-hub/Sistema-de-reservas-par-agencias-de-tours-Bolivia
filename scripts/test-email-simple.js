
const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

// Manually parse .env.local because dotenv might not be installed
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error('❌ .env.local file not found');
            return {};
        }
        const envContent = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                let value = match[2].trim();
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                env[match[1].trim()] = value;
            }
        });
        return env;
    } catch (err) {
        console.error('❌ Error reading .env.local:', err);
        return {};
    }
}

const env = loadEnv();
const apiKey = env.RESEND_API_KEY;

if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in .env.local');
    process.exit(1);
}

console.log('🔑 API Key found:', apiKey.slice(0, 5) + '...');

const resend = new Resend(apiKey);
const fromEmail = env.FROM_EMAIL || 'onboarding@resend.dev';
const toEmail = 'delivered@resend.dev';

console.log(`📧 Attempting to send email from ${fromEmail} to ${toEmail}...`);

async function send() {
    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject: 'Test Email from TourReservas Debugger',
            html: '<p>If you see this, the email configuration is working!</p>'
        });

        if (error) {
            console.error('❌ Failed to send email:', error);
            // Check for specific error about verified domain
            if (error.message && error.message.includes('verified')) {
                console.error('\n⚠️  It looks like the sender domain is not verified. On the free plan, you can only send FROM onboarding@resend.dev or a verified domain.');
                console.error('   You also might be restricted to sending TO your own email address unless you verify the domain.');
            }
        } else {
            console.log('✅ Email sent successfully!', data);
        }
    } catch (err) {
        console.error('❌ Exception during send:', err);
    }
}

send();
