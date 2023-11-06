const fs = require('fs');

// Check number of args passed to the script
if (process.argv.length < 3) {
  console.log('USAGE: node violation_report.js <predictions_file.json>');
  process.exit(1);
}

// Take filename from command line
const jsonFilename = process.argv[2];

// Report arrays
const necessary = [];
const functional = [];
const analytics = [];
const advertising = [];

// Read JSON content and parse it
fs.readFile(jsonFilename, 'utf-8', (error, data) => {
  if (error) {
    console.error('Error while reading the JSON file:', error);
  } else {
    try {
      // Prova a convertire il contenuto del file in un oggetto JavaScript
      const jsonData = JSON.parse(data);

      for ( key in jsonData ) {
        /*console.log("KEY: " + key );
        console.log("VALUE: " + jsonData[key]);*/
        if ( jsonData[key] == 0 ) {
            necessary.push( key );
        } else if ( jsonData[key] == 1 ) {
            functional.push( key );
        } else if ( jsonData[key] == 2 ) {
            analytics.push( key );
        } else if ( jsonData[key] == 3 ) {
            advertising.push( key );
        }
      }

      console.log("FINAL REPORT");

      console.log( "NECESSARY COOKIES = " + necessary );
      console.log( "FUNCTIONAL COOKIES = " + functional );
      console.log( "ANALYTICS COOKIES = " + analytics );
      console.log( "ADVERTISING COOKIES = " + advertising );

    } catch (parseError) {
      console.error('Error while parsing the JSON file:', parseError);
    }
  }
});