const express = require('express');
const fetch = require('node-fetch');

import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear el cuerpo de las solicitudes POST
app.use(express.json());

// Sirve archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint que el frontend puede usar para obtener flashcards
app.post('/get-flashcard', async (req, res) => {
    try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        "role": "system",
                        "content": "You are an AI trained to provide flashcards with a Chinese character, Pinyin, English and French translations, and a short explanation."
                    },
                    {
                        "role": "user",
                        "content": "Generate a flashcard with a unique Chinese character and provide the Pinyin, English translation, French translation, and a short explanation of the character."
                    }
                ]
            })
        });

        const openaiData = await openaiResponse.json();
        res.json(openaiData);
    } catch (error) {
        console.error('Error connecting to OpenAI:', error);
        res.status(500).json({ error: 'Error connecting to OpenAI' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
