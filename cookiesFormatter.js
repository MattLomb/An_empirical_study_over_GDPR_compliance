const fs = require('fs');
const path = require('path');

// Funzione per leggere un file riga per riga e restituire le righe come un array
async function formatCookies( url, cookies ) {
    return new Promise((resolve, reject) => {
      const fileName = url.replace(/[^a-zA-Z0-9]/g, '_') + '.json';
      const filePath = path.join(__dirname, fileName);

      // Scrivi i cookies nel file
      fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2), 'utf-8');
    });
  }

module.exports = formatCookies;