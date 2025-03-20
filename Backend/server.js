const express = require('express');
const fetch = require('node-fetch');
const app = express();
const cors = require('cors');
const port = 4000;
require('dotenv').config()

app.use(express.json());
app.use(cors({
    origin: 'https://study-with-me-eight.vercel.app', // Met ton domaine ici
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

app.get('/', (req, res) => {
    res.send("hello world ");
});

const apikey = process.env.apikey;

// Handle first message
app.post('/chat', async (req, res) => {
    const { message } = req.body;
    const message1 = `Please make in only 2 line provide a comprehensive and well-structured report based 
    on the following details: ${message}. 
   The report should include an introduction, key findings, analysis, and a conclusion. 
   Ensure clarity, coherence, and a professional tone throughout. 
   Format it properly with headings and bullet points if necessary.`;

    try {
        const response1 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apikey}`,
                "HTTP-Referer": "<YOUR_SITE_URL>",
                "X-Title": "<YOUR_SITE_NAME>",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-pro-exp-02-05:free",
                "messages": [
                    { "role": "user", "content": message1 }
                ],
                "stream": true  // Enable streaming
            })
        });

        // This function will handle the streaming response
        let messageContent1 = '';
        response1.body.on('data', chunk => {
            const chunkStr = chunk.toString();
            const parsedChunk = JSON.parse(chunkStr);

            if (parsedChunk.choices && parsedChunk.choices[0] && parsedChunk.choices[0].delta) {
                messageContent1 += parsedChunk.choices[0].delta.content || '';
                // Send partial response to client as the token is received
                res.write(messageContent1);
            }
        });

        response1.body.on('end', async () => {
            console.log('First message complete:', messageContent1);
            
            // Once the first message is fully received, continue with the second request
            const aymen = `Give me only 4 URL free and valid of docs from different websites and he must be free this question: ${message}`;

            const response2 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apikey}`,
                    "HTTP-Referer": "<YOUR_SITE_URL>",
                    "X-Title": "<YOUR_SITE_NAME>",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "google/gemini-2.0-pro-exp-02-05:free",
                    "messages": [
                        { "role": "user", "content": aymen }
                    ],
                    "stream": true  // Enable streaming for the second request as well
                })
            });

            let messageContent2 = '';
            response2.body.on('data', chunk => {
                const chunkStr = chunk.toString();
                const parsedChunk = JSON.parse(chunkStr);

                if (parsedChunk.choices && parsedChunk.choices[0] && parsedChunk.choices[0].delta) {
                    messageContent2 += parsedChunk.choices[0].delta.content || '';
                    // Send partial response to client as the token is received
                    res.write(messageContent2);
                }
            });

            response2.body.on('end', () => {
                console.log('Second message complete:', messageContent2);
                res.end();  // End the response when both parts are fully streamed
            });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = app;
