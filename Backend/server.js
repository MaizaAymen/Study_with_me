const express = require('express');
const fetch = require('node-fetch');
const app = express();
const cors = require('cors');
const port = 4000;
require('dotenv').config()

app.use(express.json());
app.use(cors({
    origin: '*', // Remplacez par un domaine précis si nécessaire
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));



app.listen(port, () => {
    console.log('Server is running on port 4000');
});

const apikey = process.env.apikey;

// Handle first message
app.post('/chat', async (req, res) => {
    const { message } = req.body;
    const message1=`Please provide a comprehensive and well-structured report based 
    on the following details: ${message}. 
   The report should include an introduction, key findings, analysis, and a conclusion. 
   Ensure clarity, coherence, and a professional tone throughout. 
   Format it properly with headings and bullet points if necessary.`;
     

    try {
        // Send the first message to the API
        const response1 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apikey}`,
                "HTTP-Referer": "<YOUR_SITE_URL>", // Optional
                "X-Title": "<YOUR_SITE_NAME>", // Optional
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-pro-exp-02-05:free",
                "messages": [
                    {
                        "role": "user",
                        "content": message1
                    }
                ]
            })
        });
        const data1 = await response1.json();
        if (data1.choices && data1.choices[0] && data1.choices[0].message) {
            const messageContent1 = data1.choices[0].message.content;
            console.log('First message response:', messageContent1);

            const aymen = `Give me only 4 URL of docs form diffrent websites and he must be free this question : ${message}`;
            
            const response2 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {              
                    "Authorization": `Bearer ${apikey}`,
                    "HTTP-Referer": "<YOUR_SITE_URL>", // Optional
                    "X-Title": "<YOUR_SITE_NAME>", // Optional
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "google/gemini-2.0-pro-exp-02-05:free",
                    "messages": [
                        {
                            "role": "user",
                            "content": aymen
                        }
                    ]
                })
            });

            const data2 = await response2.json();
            if (data2.choices && data2.choices[0] && data2.choices[0].message) {
                const messageContent2 = data2.choices[0].message.content;
                console.log('Second message response:', messageContent2);
                return res.json({ message1: messageContent1, message2: messageContent2 });
            } else {
                console.log('No valid response from second query');
                res.status(500).json({ error: 'No valid response from second query' });
            }

        } else {
            console.log('No valid response from first query');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
