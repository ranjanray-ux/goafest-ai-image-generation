const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ success: false, error: 'No image provided' });
        }

        // Remove the data:image/jpeg;base64, prefix
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const formData = new FormData();
        formData.append('files[]', buffer, { filename: 'goa-fest-avatar.jpg', contentType: 'image/jpeg' });

        const uploadRes = await axios.post('https://uguu.se/upload', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        const data = uploadRes.data;
        if (data.success && data.files && data.files.length > 0) {
            res.json({ success: true, url: data.files[0].url });
        } else {
            throw new Error('Upload to uguu.se failed');
        }
    } catch (err) {
        console.error('Upload Error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to generate cloud link' });
    }
});

module.exports = router;
