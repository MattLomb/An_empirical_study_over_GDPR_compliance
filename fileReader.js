const fs = require('fs');

// This function is used to read domains name and to add them the https:// 'header'
async function readFileLines(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
  
        const lines = data.split('\n');

        // Add 'https://www.' to each line to get the exact web address
        const modifiedLines = lines.map(line => `https://${line}`);

        resolve(modifiedLines);
      });
    });
  }

module.exports = readFileLines;