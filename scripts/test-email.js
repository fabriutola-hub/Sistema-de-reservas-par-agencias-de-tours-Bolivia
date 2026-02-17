
const { Resend } = require('resend');
// require('dotenv').config({ path: '.env.local' });

async function testEmail() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('❌ RESEND_API_KEY is missing in .env.local');
        return;
    }

    console.log('🔑 API Key found:', apiKey.slice(0, 5) + '...');

    const resend = new Resend(apiKey);

    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const toEmail = 'delivered@resend.dev';

    console.log(`📧 Attempting to send email from ${fromEmail} to ${toEmail}...`);

    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject: 'Test Email from TourReservas Debugger',
            html: '<p>If you see this, the email configuration is working!</p>'
        });

        if (error) {
            console.error('❌ Failed to send email:', error);
        } else {
            console.log('✅ Email sent successfully!', data);
        }
    } catch (err) {
        console.error('❌ Exception during send:', err);
    }
}

testEmail();
