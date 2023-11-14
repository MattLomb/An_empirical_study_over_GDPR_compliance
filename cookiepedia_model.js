const axios = require('axios');

async function getRequest(url, param) {
  try {
    // Aggiungi il parametro alla URL (se necessario)
    const apiUrl = param ? `${url}/${param}` : url;

    // Definisci gli headers desiderati
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
    };

    // Esegui la richiesta GET con gli headers
    const response = await axios.get(apiUrl, { headers });

    // Stampa la risposta
    //console.log('Response:', response.data);

    let cookiepediaCategory = 'Not Found';

    if (response.data) {
      const regex = /The main purpose of this cookie is:\s*<strong>(.*)<\/strong>/;
      const match = response.data.match(regex);

      if (match) {
        cookiepediaCategory = match[1];
      }
    } else {
      cookiepediaCategory = 'Connection Failed';
    }

    console.log(cookiepediaCategory);
  } catch (error) {
    // Gestisci gli errori
    console.error('Error during GET request:', error.message);
  }
}

// Esempio di utilizzo della funzione
const targetUrl = 'https://cookiepedia.co.uk/cookies';
const parameterValue = '_GA';

getRequest(targetUrl, parameterValue);