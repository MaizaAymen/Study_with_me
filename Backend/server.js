const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
// Load environment variables from Backend/.env
require('dotenv').config();

// Use node-fetch for HTTP requests
const fetch = require('node-fetch');

// Load OpenRouter API key from env
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.apikey;
if (!OPENROUTER_API_KEY) {
    console.error('Missing OPENROUTER_API_KEY environment variable');
    process.exit(1);
}
// Debug logs for environment variables
console.log('OPENROUTER_API_KEY set:', Boolean(OPENROUTER_API_KEY));
console.log('Using MONGODB_URL:', process.env.MONGODB_URL || 'default to localhost');

const app = express();
const port = 4000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/study_with_me', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('MongoDB connected');
    // Seed default admin user
    try {
        const adminUser = await User.findOne({ username: 'aymen' });
        if (!adminUser) {
            const hashedPwd = await bcrypt.hash('123456789', 10);
            const admin = new User({
                username: 'aymen',
                password: hashedPwd,
                name: 'Admin User',
                email: 'maizaaymena@gmail.com',
                role: 'admin'
            });
            await admin.save();
            console.log('Default admin user created: aymen');
        }
    } catch (seedErr) {
        console.error('Error seeding admin user:', seedErr);
    }
}).catch(err => console.error('MongoDB connection error:', err));

// Chat schema and model
const chatSchema = new mongoose.Schema({
    username: String,
    message: String,
    response1: String,
    response2: String,
    createdAt: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', chatSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

app.use(express.json());
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

// Registration endpoint
app.post('/auth/register', async (req, res) => {
    const { username, password, name, email, role } = req.body;
    if (!username || !password || !name || !email || !role) {
        return res.status(400).json({ error: 'All registration fields are required.' });
    }
    // Check for existing user or email
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(409).json({ error: 'Username or email already in use.' });
    // Hash password and set role (auto-assign admin for specific email)
    const hashed = await bcrypt.hash(password, 10);
    const assignedRole = email === 'maizaaymena@gmail.com' ? 'admin' : role;
    const newUser = new User({ username, password: hashed, name, email, role: assignedRole });
    await newUser.save();
    return res.status(201).json({ message: 'User registered successfully.' });
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required.' });
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token missing.' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token.' });
        req.user = user;
        next();
    });
}

// Middleware to require admin privileges
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
    next();
}

app.get('/', (req, res) => {
    res.send("hello world");
});

// Protected chat endpoint
app.post('/chat', authenticateToken, async (req, res) => {
    console.log('Chat request by', req.user.username, 'message:', req.body.message);
    const { message } = req.body;

    const prompt1 = `Please make in only 2 line provide a comprehensive and well-structured report based 
    on the following details: ${message}. 
    The report should include an introduction, key findings, analysis, and a conclusion. 
    Ensure clarity, coherence, and a professional tone throughout. 
    Format it properly with headings and bullet points if necessary.`;

    try {        const response1 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-exp:free",
                messages: [
                    {
                        role: "user",
                        content: prompt1
                    }
                ]
            })
        });
        if (!response1.ok) {
            console.error('OpenRouter API error 1:', response1.status, await response1.text());
            return res.status(500).json({ error: 'Error from OpenRouter API (step 1)' });
        }

        const data1 = await response1.json();
        const messageContent1 = data1?.choices?.[0]?.message?.content;

        if (!messageContent1) {
            console.error('First query error:', data1);
            return res.status(500).json({ error: "No valid response from first query" });
        }

        const prompt2 = `Give me only 4 free and valid URLs of documentation from different websites related to this question: ${message}`;        const response2 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-exp:free",
                messages: [
                    {
                        role: "user",
                        content: prompt2
                    }
                ]
            })
        });
        if (!response2.ok) {
            console.error('OpenRouter API error 2:', response2.status, await response2.text());
            return res.status(500).json({ error: 'Error from OpenRouter API (step 2)' });
        }

        const data2 = await response2.json();
        const messageContent2 = data2?.choices?.[0]?.message?.content;

        if (!messageContent2) {
            return res.status(500).json({ error: "No valid response from second query" });
        }

        // Attempt to save chat history
        try {
            await Chat.create({ username: req.user.username, message, response1: messageContent1, response2: messageContent2 });
        } catch (dbErr) {
            console.error('Failed to save chat to DB:', dbErr);
        }
        return res.json({ message1: messageContent1, message2: messageContent2 });

    } catch (error) {
        console.error('Chat processing error:', error);
        // Return detailed error for debugging
        return res.status(500).json({ error: error.message });
    }
});

// Fetch chat history for the user
app.get('/chats', authenticateToken, async (req, res) => {
    try {
        const chats = await Chat.find({ username: req.user.username }).sort({ createdAt: -1 });
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch chat history.' });
    }
});

// Admin route: list all users
app.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    const users = await User.find({}, 'username name email role createdAt').sort({ createdAt: -1 });
    res.json(users);
});

// Admin route: fetch chat history for a specific user by ID
app.get('/admin/users/:id/chats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        const chats = await Chat.find({ username: user.username }).sort({ createdAt: -1 });
        res.json({ user: { username: user.username, email: user.email }, chats });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user chats.' });
    }
});

// Only start server if not imported by tests
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

// Export Express app for testing
module.exports = app;
