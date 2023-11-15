const axios = require('axios');

async function getRequest(param) {
  try {
    var ret;
    const url = 'https://cookiepedia.co.uk/cookies';
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

      if ( match ) {
        cookiepediaCategory = match[1];
        switch ( cookiepediaCategory ) {
          case 'Strictly Necessary':
            ret = 0;
            break;
          case 'Functionality':
            ret = 1;
            break;
          case 'Performance':
            ret = 2;
            break;
          case 'Targeting/Advertising':
            ret = 3;
            break;
          case 'Unknown':
            ret = -1;
            break;
          case 'Not Found':
            ret = -1;
            break;
          case 'Match Failed':
            ret = -1;
            break;
        }
     }
    } else {
      cookiepediaCategory = 'Connection Failed';
      ret = -1;
    }

    console.log(cookiepediaCategory);
    if ( cookiepediaCategory == 'Not Found' ) {
      ret = -1;
    }
    return ret;
  } catch (error) {
    // Gestisci gli errori
    console.error('Error during GET request:', error.message);
    ret = -1;
    return ret;
  }
}

/*
// Esempio di utilizzo della funzione
const parameterValue = 'azdbfdbdfb';

getRequest(parameterValue).then( result => console.log(result));
*/
module.exports = formatCookies;