const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { name, email, phone, organization } = req.body;
        
        // If the environment variable isn't set, just log and pretend it succeeded
        // This prevents the app from breaking if the user hasn't set up the Google script yet
        if (!process.env.GOOGLE_SCRIPT_URL) {
            console.log('Lead captured (Google Script URL not configured):', { name, email, phone, organization });
            return res.json({ success: true, message: 'Simulated success' });
        }
        
        // Forward to Google Apps Script Webhook
        await axios.post(process.env.GOOGLE_SCRIPT_URL, {
            name,
            email,
            phone,
            organization,
            timestamp: new Date().toISOString()
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        res.json({ success: true });
    } catch (err) {
        console.error('Failed to send lead to Google Sheets:', err.message);
        // We still return success:true so the user gets their QR code even if the sheet fails
        res.json({ success: true, warning: 'Failed to save to sheet' });
    }
});

module.exports = router;
