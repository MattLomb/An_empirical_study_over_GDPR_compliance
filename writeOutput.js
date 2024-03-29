const fs = require('fs');
const path = require('path');

// Funzione per scrivere un oggetto JSON in un file specifico
function writeJsonToFile(jsonObject, filePath) {
  return new Promise((resolve, reject) => {
    var stringToWrite = jsonObject.url + '\n';
    fs.appendFile(filePath, stringToWrite, { flag: 'a+' }, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function writeUrlToErrors(url, filePath) {
    return new Promise((resolve, reject) => {
        var stringToWrite = url + '\n';
        fs.appendFile(filePath, stringToWrite, { flag: 'a+' }, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
}

// Function that takes in input the JSON returned by Consent-O-Matic and that writes the name of the URL in the CMP file.
async function writeJsonArrayToFiles(jsonArray, directoryPath) {
  try {
    // Assicurati che la directory esista, altrimenti creala
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    for (let i = 0; i < jsonArray.length; i++) {
      const jsonObject = jsonArray[i];
      const fileName = `${jsonObject.cmpName}.txt`;
      const filePath = path.join(directoryPath, fileName);

      await writeJsonToFile(jsonObject, filePath);
      console.log(`Scritto il JSON in ${filePath}`);
    }
  } catch (err) {
    throw err;
  }
}

// Function that writes domains names in the txt file containing errors.
async function writeErrorsToFiles(errorsList, directoryPath) {
    try {
        // Assicurati che la directory esista, altrimenti creala
        if (!fs.existsSync(directoryPath)) {
          fs.mkdirSync(directoryPath, { recursive: true });
        }
    
        for (let i = 0; i < errorsList.length; i++) {
          const url = errorsList[i];
          const fileName = 'errors.txt';
          const filePath = path.join(directoryPath, fileName);
    
          await writeUrlToErrors(url, filePath);
          //console.log(`Scritto l'url in ${filePath}`);
        }
      } catch (err) {
        throw err;
      }
}

function writeUrlToIAB(url, filePath) {
  return new Promise((resolve, reject) => {
      var stringToWrite = url + '\n';
      fs.appendFile(filePath, stringToWrite, { flag: 'a+' }, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
}

async function writeWebsiteToCMPIdFolder( cmpID, website_name, directoryPath ) {
  try {
    // Assicurati che la directory esista, altrimenti creala
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
    const fileName = cmpID + '.txt';
    const filePath = path.join(directoryPath, fileName);
    await writeUrlToIAB( website_name, filePath);
  } catch (err) {
    throw err;
  }
}

module.exports = {
    writeJsonArrayToFiles,
    writeErrorsToFiles,
    writeWebsiteToCMPIdFolder
};