require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Default route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Endpoint for Waitlist Submission
app.post('/api/waitlist', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Send email using Resend
        // Note: For unverified domains on Resend, you must send 'from' onboarding@resend.dev
        // and 'to' the email address registered to your Resend account.
        const data = await resend.emails.send({
            from: 'Ctrl + Vibe <onboarding@resend.dev>',
            to: email, // If this is a testing account, it will only deliver to your verified email
            subject: 'Welcome to the Ctrl + Vibe Waitlist! 🚀',
            html: `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #030305; color: #ffffff; padding: 0; border-radius: 16px; border: 1px solid #1a1a2e; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    
                    <!-- Header with Gradient Accent -->
                    <div style="background: linear-gradient(135deg, #00f3ff 0%, #0075ff 50%, #9d00ff 100%); height: 6px; width: 100%;"></div>
                    
                    <div style="padding: 40px;">
                        <h2 style="margin: 0 0 24px; font-size: 28px; font-weight: bold; color: #ffffff;">
                            You're on the list! <span style="font-size: 24px;">🚀</span>
                        </h2>
                        
                        <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                            Hey there,<br><br>
                            Thanks for joining the waitlist for <strong>Ctrl + Vibe</strong>. You just secured your spot in the most dynamic, futuristic coding community for next-gen developers.
                        </p>
                        
                        <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 24px; border-radius: 12px; margin-bottom: 32px; text-align: center;">
                            <h3 style="color: #00f3ff; margin: 0 0 10px; font-size: 18px;">What's Next?</h3>
                            <p style="color: #9494a0; font-size: 15px; line-height: 1.5; margin: 0;">
                                We're putting the final touches on the platform. Keep an eye on your inbox—we'll be sending out exclusive early access invites very soon.
                            </p>
                        </div>
                        
                        <!-- CTA -->
                        <div style="text-align: center; margin-bottom: 40px;">
                            <a href="https://discord.gg/FCnSf3Ej" style="display: inline-block; background-color: #ffffff; color: #030305; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 16px;">
                                Join our Discord
                            </a>
                        </div>
                        
                        <!-- Footer -->
                        <div style="border-top: 1px solid #1a1a2e; padding-top: 24px; text-align: center;">
                            <p style="color: #ffffff; font-weight: bold; font-size: 16px; margin: 0 0 4px;">Ctrl + Vibe</p>
                            <p style="color: #00f3ff; font-size: 14px; margin: 0 0 16px; letter-spacing: 1px;">CODE SMART. BUILD VIBES.</p>
                            <p style="color: #5a5a6e; font-size: 12px; margin: 0;">
                                &copy; 2026 Ctrl + Vibe Community. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            `
        });

        if (data.error) {
            console.error('Resend Error:', data.error);
            return res.status(400).json({ success: false, error: data.error.message });
        }

        res.status(200).json({ success: true, message: 'Email sent successfully', data });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to send email' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
