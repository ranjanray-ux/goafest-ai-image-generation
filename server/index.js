require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const generateRoute = require('./routes/generate');

const app = express();
const PORT = process.env.PORT || 3031;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../client')));

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Routes
app.use('/api/generate', generateRoute);
app.use('/api/upload', require('./routes/upload'));
app.use('/api/leads', require('./routes/leads'));

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
