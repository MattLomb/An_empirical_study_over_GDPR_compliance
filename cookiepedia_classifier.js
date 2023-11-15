const fs = require('fs');
const cookiepedia_model = require('./cookiepedia_model');
const getCookiepediaClassification = require('./cookiepedia_model');

async function readAndParseJson(filePath) {
  try {
    // Leggi il contenuto del file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Effettua il parsing del contenuto come JSON
    const jsonData = JSON.parse(fileContent);

    for (const key in jsonData) {
        if (jsonData.hasOwnProperty(key)) {
            const object = jsonData[key];
            // Esegui le operazioni desiderate per ciascun oggetto
            console.log(`Key: ${key}`);
            cookies_names.push( key );
            await getCookiepediaClassification( key ).then( result => {
            console.log("Prediction: " + result );
            cookies_predictions.push( result );
            });
        }
    }
   console.log( cookies_names );
   console.log( cookies_predictions );
   await writeCookiepediaPredictions( url, cookies_names, cookies_predictions );
  } catch (error) {
    console.error('Error reading/parsing JSON file:', error.message);
    return null;
  }
}

async function writeCookiepediaPredictions( fileName, names, predictions ) {
    var filePath = 'cookiepedia_' + fileName + ".json";
    const jsonOutput = {};

    for (let i = 0; i < names.length; i++) {
        const key = `${names[i]}`;
        console.log( key );
        jsonOutput[key] = predictions[i];
    }

    console.log(jsonOutput);

    const jsonString = JSON.stringify(jsonOutput, null, 2);

    fs.writeFileSync(filePath, jsonString, 'utf-8');
}

//Store here the cookies name with their predictions obtained from Cookiepedia.
var cookies_names = [];
var cookies_predictions = [];

// URL PARAMETER IS USED TO RETRIEVE THE JSON FILE
var url = process.argv[2];

// Esempio di utilizzo
const jsonFilePath = './' + url + '.json';
const parsedData = readAndParseJson(jsonFilePath);

if (parsedData) {
  console.log('Parsed JSON data:', parsedData);
}