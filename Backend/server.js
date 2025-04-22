const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

app.get('/', (req, res) => {
    res.send("hello world");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const apikey = process.env.apikey;
console.log(apikey);
app.post('/chat', async (req, res) => {
    const { message } = req.body;

    const prompt1 = `Please make in only 2 line provide a comprehensive and well-structured report based 
    on the following details: ${message}. 
    The report should include an introduction, key findings, analysis, and a conclusion. 
    Ensure clarity, coherence, and a professional tone throughout. 
    Format it properly with headings and bullet points if necessary.`;

    try {
        const response1 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apikey}`,
                "Content-Type": "application/json",
                // Optional:
                // "HTTP-Referer": "https://study-with-me-eight.vercel.app",
                // "X-Title": "Study With Me"
            },
            body: JSON.stringify({
                model: "google/gemini-pro",
                messages: [
                    {
                        role: "user",
                        content: prompt1
                    }
                ]
            })
        });

        const data1 = await response1.json();
        const messageContent1 = data1?.choices?.[0]?.message?.content;

        if (!messageContent1) {
            return res.status(500).json({ error: "No valid response from first query" });
        }

        const prompt2 = `Give me only 4 free and valid URLs of documentation from different websites related to this question: ${message}`;

        const response2 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apikey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-pro",
                messages: [
                    {
                        role: "user",
                        content: prompt2
                    }
                ]
            })
        });

        const data2 = await response2.json();
        const messageContent2 = data2?.choices?.[0]?.message?.content;

        if (!messageContent2) {
            return res.status(500).json({ error: "No valid response from second query" });
        }

        return res.json({ message1: messageContent1, message2: messageContent2 });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});
