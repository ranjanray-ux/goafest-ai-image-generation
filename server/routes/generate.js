const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const { getMasterPrompt } = require('../utils/promptBuilder');

const router = express.Router();


// Setup Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req, res, next) => {
    try {
        const { vibe } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, error: 'No image provided' });
        }
        if (!vibe) {
            return res.status(400).json({ success: false, error: 'No vibe selected' });
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey || apiKey === 'dummy') {
            return res.status(400).json({ success: false, error: 'Valid Google API Key is missing in .env' });
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });

        const userImageBase64 = file.buffer.toString('base64');
        const mimeType = file.mimetype;

        // Dynamically find the reference image based on vibe
        const vibeName = vibe.replace(/^THE /, '').replace(/\s+/g, ''); // e.g., "NIGHTENERGY"
        const referenceDir = path.join(__dirname, '../../reference');
        let referencePath = null;

        const possibleExtensions = ['.png', '.jpeg', '.jpg'];
        for (const ext of possibleExtensions) {
            const checkPath = path.join(referenceDir, `${vibeName}${ext}`);
            if (fs.existsSync(checkPath)) {
                referencePath = checkPath;
                break;
            }
        }

        if (!referencePath) {
            return res.status(400).json({ success: false, error: `Missing reference image for vibe: ${vibe}` });
        }

        const logoPath = path.join(__dirname, '../../assets/logo.png');

        // console.log('Generating image with gemini-3.1-flash-image-preview...');

        const promptText = getMasterPrompt(vibe);

        const promptArray = [
            { text: promptText },
            { text: "USER_IMAGE (Face to preserve exactly):" },
            { inlineData: { mimeType: mimeType, data: userImageBase64 } }
        ];

        if (fs.existsSync(referencePath)) {
            const ext = path.extname(referencePath).toLowerCase();
            const refMimeType = ext === '.jpeg' || ext === '.jpg' ? 'image/jpeg' : 'image/png';
            promptArray.push({ text: "REFERENCE_STYLE_IMAGE (Match fonts, typography, and layout):" });
            promptArray.push({ inlineData: { mimeType: refMimeType, data: fs.readFileSync(referencePath).toString('base64') } });
        }
        if (fs.existsSync(logoPath)) {
            promptArray.push({ text: "LOGO_IMAGE (Place exactly without altering):" });
            promptArray.push({ inlineData: { mimeType: "image/png", data: fs.readFileSync(logoPath).toString('base64') } });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-image-preview",
            contents: promptArray,
            config: {
                responseModalities: ["IMAGE"],
                aspectRatio: "3:4"
            }
        });

        let imageUrl = null;
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                // Reverted to base64 for Vercel compatibility
                imageUrl = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
                break;
            }
        }

        if (!imageUrl) {
            throw new Error('No image returned from the Gemini API.');
        }

        console.log('Generation complete!');
        res.json({
            success: true,
            imageUrl: imageUrl
        });

    } catch (error) {
        console.error('Generation Error:', error.message || error);
        res.status(500).json({ success: false, error: 'Generation failed. Check server logs.' });
    }
});

module.exports = router;
