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
        const response = await fetch('/get-flashcard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // No necesitas enviar el cuerpo si el mensaje es siempre el mismo
            // puede ser manejado directamente en el servidor.
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // Asumimos que la respuesta del servidor es la misma que esperarías de OpenAI
        const content = data.choices[0].message.content;
        const character = content.match(/Character: (\S+)/)[1]; // Extrae el carácter chino

        if (!seenCharacters.has(character)) {
            seenCharacters.add(character);
            flashcardCount++; // Incrementa el contador por cada tarjeta nueva
            updateFlashcardCount(); // Actualiza el marcador en la interfaz
            displayFlashcard(content);
        } else {
            console.log('Repeated character detected:', character);
            // No llames a fetchWordsFromAPI() inmediatamente para evitar posibles bucles infinitos
        }
    } catch (error) {
        console.error('There was a problem fetching the flashcard data:', error);
    }
}

function updateFlashcardCount() {
    document.getElementById('current-score').textContent = flashcardCount; // Actualiza el marcador en la interfaz
}

function displayFlashcard(content) {
    // Asegúrate de que la estructura de content coincide con lo que devuelve tu servidor
    const parts = content.replace('Character: ', '')
                         .replace('English Translation: ', 'English: ')
                         .replace('French Translation: ', 'French: ')
                         .split('\n')
                         .map(part => part.trim());

    // Suponiendo que tu HTML tiene estos ID's para mostrar la información de la tarjeta
    document.getElementById('chinese-characters').textContent = parts[0];
    document.getElementById('pinyin').textContent = parts[1];
    document.getElementById('translation').textContent = parts[2].replace('English: ', '');
    document.getElementById('french-translation').textContent = parts[3].replace('French: ', '');
    document.getElementById('explanation').textContent = parts.slice(4).join(' ');
}

window.addEventListener('load', fetchWordsFromAPI);