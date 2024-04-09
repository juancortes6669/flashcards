let flashcardCount = 0; // Inicializa el contador de tarjetas vistas
const seenCharacters = new Set(); // Guardará los caracteres chinos que ya se han visto

document.getElementById('new-card-button').addEventListener('click', fetchWordsFromAPI);

async function fetchWordsFromAPI() {
    if (flashcardCount >= 500) { // Si has revisado muchas flashcards, considera detenerte o reiniciar
        console.log('You have reached the limit of flashcards.');
        // Aquí puedes elegir mostrar un mensaje al usuario o detener la generación de tarjetas
        return;
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
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

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const character = content.match(/Character: (\S+)/)[1]; // Extrae el carácter chino

        if (!seenCharacters.has(character)) {
            seenCharacters.add(character);
            flashcardCount++; // Incrementa el contador por cada tarjeta nueva
            updateFlashcardCount(); // Actualiza el marcador en la interfaz
            displayFlashcard(content);
        } else {
            console.log('Repeated character detected:', character);
            await fetchWordsFromAPI(); // Intenta de nuevo si se detecta un carácter repetido
        }
    } catch (error) {
        console.error('There was a problem fetching the flashcard data:', error);
    }
}

function updateFlashcardCount() {
    document.getElementById('current-score').textContent = flashcardCount; // Actualiza el marcador en la interfaz
}

function displayFlashcard(content) {
    const parts = content.replace('Character: ', '')
                         .replace('English Translation: ', 'English: ')
                         .replace('French Translation: ', 'French: ')
                         .split('\n')
                         .map(part => part.trim());
    
    document.getElementById('chinese-characters').textContent = parts[0];
    document.getElementById('pinyin').textContent = parts[1];
    document.getElementById('translation').textContent = parts[2].replace('English: ', '');
    document.getElementById('french-translation').textContent = parts[3].replace('French: ', '');
    document.getElementById('explanation').textContent = parts.slice(4).join(' ');
}

window.addEventListener('load', fetchWordsFromAPI);
