/******
 * COOKIEPEDIA MODEL
 * This script implements the model to perform the classification of the cookies downloaded after the interaction of Consent-O-Matic.
 * It opens the file containing all the cookies setted during the navigation and:
 *  1. Takes the name of each cookie
 *  2. Asks to Cookiepedia_model to perform the prediction of the cookie category
 *  3. Creates a file containing all the names and related purposes that can be analyzed by the cookiepedia_violation_report.js to perform the detection of the violations.
 * 
 * USAGE: node cookiepedia_classifier.js <url>
 */

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
            //console.log(`Key: ${key}`);
            cookies_names.push( key );
            await getCookiepediaClassification( key ).then( result => {
            //console.log("Prediction: " + result );
            cookies_predictions.push( result );
            });
        }
    }
   //console.log( cookies_names );
   //console.log( cookies_predictions );
   await writeCookiepediaPredictions( url, cookies_names, cookies_predictions );
  } catch (error) {
    console.error('Error reading/parsing JSON file:', error.message);
    return null;
  }
}

async function writeCookiepediaPredictions( fileName, names, predictions ) {
    var filePath = 'cookiepedia_json/cookiepedia_' + fileName + ".json";
    const jsonOutput = {};

    for (let i = 0; i < names.length; i++) {
        const key = `${names[i]}`;
        //console.log( key );
        jsonOutput[key] = predictions[i];
    }

    //console.log(jsonOutput);

    const jsonString = JSON.stringify(jsonOutput, null, 2);

    fs.writeFileSync(filePath, jsonString, 'utf-8');
}

//Store here the cookies name with their predictions obtained from Cookiepedia.
var cookies_names = [];
var cookies_predictions = [];

// URL PARAMETER IS USED TO RETRIEVE THE JSON FILE
var url = process.argv[2];


// MAIN //
const jsonFilePath = './cookies_formatted/' + url + '.json';
const parsedData = readAndParseJson(jsonFilePath);

if (parsedData) {
  console.log('Parsed JSON data:', parsedData);
}