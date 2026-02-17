
import { Resend } from 'resend'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testEmail() {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
        console.error('❌ RESEND_API_KEY is missing in .env.local')
        return
    }

    console.log('🔑 API Key found:', apiKey.slice(0, 5) + '...')

    const resend = new Resend(apiKey)

    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev'
    // Use a safe test email or the one from the user's reservation if known, 
    // but for generic test, send to the developer/admin or a disposable one if user permits.
    // Ideally, send to the "FROM" address itself to test self-delivery, or a hardcoded test address.
    // Since I don't know the user's email, I'll try sending to "delivered@resend.dev" which is a successful sink,
    // OR to the 'from' address if valid.

    const toEmail = 'delivered@resend.dev'

    console.log(`📧 Attempting to send email from ${fromEmail} to ${toEmail}...`)

    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject: 'Test Email from TourReservas Debugger',
            html: '<p>If you see this, the email configuration is working!</p>'
        })

        if (error) {
            console.error('❌ Failed to send email:', error)
        } else {
            console.log('✅ Email sent successfully!', data)
        }
    } catch (err) {
        console.error('❌ Exception during send:', err)
    }
}

testEmail()
