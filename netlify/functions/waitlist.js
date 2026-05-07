const { Resend } = require('resend');

const jsonResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, { success: false, error: 'Method not allowed' });
    }

    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch (error) {
        return jsonResponse(400, { success: false, error: 'Invalid JSON body' });
    }

    const email = typeof payload.email === 'string' ? payload.email.trim() : '';
    if (!email) {
        return jsonResponse(400, { success: false, error: 'Email is required' });
    }

    if (!process.env.RESEND_API_KEY) {
        return jsonResponse(500, { success: false, error: 'Email service is not configured' });
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const data = await resend.emails.send({
            from: 'Ctrl + Vibe <onboarding@resend.dev>',
            to: email,
            subject: 'Welcome to the Ctrl + Vibe Waitlist!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #030305; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #1a1a2e;">
                    <h2 style="margin: 0 0 20px; color: #ffffff;">You're on the list!</h2>
                    <p style="color: #e2e8f0; line-height: 1.6;">Thanks for joining the Ctrl + Vibe waitlist. You secured your spot in a community for next-gen developers building with AI, open source, and product-first skills.</p>
                    <p style="color: #9494a0; line-height: 1.6;">Keep an eye on your inbox for early access updates.</p>
                    <a href="https://discord.gg/FCnSf3Ej" style="display: inline-block; background-color: #ffffff; color: #030305; font-weight: bold; text-decoration: none; padding: 12px 20px; border-radius: 8px;">Join our Discord</a>
                </div>
            `
        });

        if (data.error) {
            return jsonResponse(400, { success: false, error: data.error.message });
        }

        return jsonResponse(200, { success: true, message: 'Email sent successfully' });
    } catch (error) {
        return jsonResponse(500, { success: false, error: error.message || 'Failed to send email' });
    }
};
