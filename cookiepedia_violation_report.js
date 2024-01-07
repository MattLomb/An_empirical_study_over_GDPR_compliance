/******
 * Script that produces the report of the violation for a given website.
 * It works by comparing the consents given by the user and the cookies categories setted during the navigation.
 * The model used here is the Cookiepedia Model
 */

const fs = require('fs');
const { isEmpty } = require('lodash');
const path = require('path');

const model = "cookiepedia";

var no_interaction = false;

// Check number of args passed to the script
if (process.argv.length < 5) {
  console.log( 'USAGE: node cookiepedia_violation_report.js <url> <predictions_file.json> <list_of_consents>' );
  console.log( 'CONSENTS can be:\n no_interaction -> cookies downloaded without any interaction with the CMP \n no_consents -> cookies downloaded after hiding the CMP with COM \n 0 -> necessary cookies \n 1 -> functional cookies \n 2 -> analytics cookies\n 3 -> advertising cookies' ); 
  console.log( 'EXAMPLE: node cookiepedia_violation_report.js hdblog.it predictions.json 0 1 2' );
  process.exit(1);
}

// Take filename from command line
const jsonFilename = process.argv[3];

const url = process.argv[2];

// Create consents array to double check the violation
var arguments = process.argv.slice(3);
  arguments.forEach((value, index) => {
    //console.log(index, value);
  });

const consents_array = [];
let i = 0;
for (i; i < arguments.length; i++) {
  if (i > 0) {
    if ( arguments[i] == 'no_consents' ) {
      consents_array.push(0);
    } else if ( arguments[i] == 'no_interaction' ) {
      consents_array.push(0);
      no_interaction = true;
    } else {
      consents_array.push( parseInt( arguments[i] ) );
    }
    
  }
}

//console.log( consents_array ); 

// Report arrays
const necessary = [];
const functional = [];
const analytics = [];
const advertising = [];
const undefined = [];
const report = [ necessary, functional, analytics, advertising, undefined ];

if ( !urlIsError( url ) ) {
  // Read JSON content and parse it
  fs.readFile(jsonFilename, 'utf-8', (error, data) => {
    if (error) {
      console.error('Error while reading the JSON file:', error);
    } else {
      try {
        // Convert the content of the JSON file into a JSON object
        const jsonData = JSON.parse(data);

        // Add each cookie in the related array based on its category
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
          } else if ( jsonData[key] == -1 ) {
              undefined.push( key );
          }
        }

        writeFinalReport( report, consents_array );

        return;

      } catch (parseError) {
        console.error('Error while parsing the JSON file:', parseError);
      }
    }
  });
} else {
  console.log( "Cookiepedia PREDICTION NOT EXECUTE BECAUSE " + url + " CONTAINS ERRORS" );
}

// This function is the one that performs the report on the console.
function writeFinalReport( report, consents_array ) {

  var violation = false;

  console.log("\n\nCOOKIEPEDIA REPORT OVER WEBSITE: " + url + " \n");
  console.log( "NECESSARY COOKIES = " + report[0] );
  console.log( "FUNCTIONAL COOKIES = " + report[1] );
  console.log( "ANALYTICS COOKIES = " + report[2] );
  console.log( "ADVERTISING COOKIES = " + report[3] );
  console.log( "UNDEFINED COOKIES: " + report[4] );

  // Perform the comparison between the consent array and the report array
  const all_consents = [0, 1, 2, 3];
  const difference = 
      all_consents.filter((element) => !consents_array.includes(element)); 
  //console.log(difference);

  if ( isEmpty(difference) ) {
    console.log("ALL PERMISSIONS GIVEN");
  } else {
    difference.forEach( function (elem) {
      if ( !isEmpty( report[elem] ) ) {
        //console.log("COOKIES WITH NO CONSENT FOUND!");
        violation = true;
      }
    });
  }

  if ( violation == true ) {
    console.log( "\n⚠️\tVIOLATION FOUND: the consents given have not been respected\t⚠️" );
    if ( no_interaction ) {
      console.log( "NO INTERACTION WITH THE BANNER PERFORMED --> ONLY NECESSARY COOKIES SHOULD BE SET \n" );
    }
    var given_consents = "GIVEN CONSENTS FOR: ";
    consents_array.forEach( function(elem) {
      if ( elem == 0 ) {
        given_consents += "Necessary ";
      } else if ( elem == 1 ) {
        given_consents += "Functional ";
      } else if ( elem == 2 ) {
        given_consents +=  "Analytics "; 
      } else if ( elem == 3 ) {
        given_consents += "Advertising ";
      }
    });
    console.log( given_consents + "cookies" );

    var violation_string = "FOUND CONSENTS ALSO FOR: ";
    difference.forEach( function(elem) {
      if ( elem == 0 && !isEmpty(report[0]) ) {
        violation_string += "Necessary ";
      } else if ( elem == 1 && !isEmpty(report[1]) ) {
        violation_string += "Functional ";
      } else if ( elem == 2 && !isEmpty(report[2]) ) {
        violation_string +=  "Analytics "; 
      } else if ( elem == 3 && !isEmpty(report[3]) ) {
        violation_string += "Advertising ";
      }
    });
    console.log( violation_string + "cookies" );
    console.log( "Cookiepedia has not been able to classify those cookies: " + report[4] );

    writeWebsiteWithViolationInOutput( model, url );

    // Write report in output
    writeViolationReportInOutput( model, url, report, given_consents, violation_string );

  } else {
    console.log( "NO VIOLATION FOUND FOR: " + url );
    writeWebsiteWithoutViolationInOutput( model, url );
  }

}

function writeWebsiteWithViolationInOutput( model, url ) {

  // Create folder if it doesn't exists
  const violationsFolderPath = path.join(__dirname, 'violations/cookiepedia');
  if (!fs.existsSync(violationsFolderPath)) {
    fs.mkdirSync(violationsFolderPath);
  }

  // Create model file for output
  const modelFilePath = path.join(violationsFolderPath, `${model}.txt`);

  // Check if the file exists, otherwise create it
  if (!fs.existsSync(modelFilePath)) {
    // Se il file non esiste, crealo
    fs.writeFileSync(modelFilePath, '');
  }

  // Read file content
  const currentContent = fs.readFileSync(modelFilePath, 'utf-8');
  var content = url + "\n";

  fs.appendFile(modelFilePath, content, { flag: 'a+' }, (err) => {
    if (err) {
      //console.log( err );
      return;
    } else {
      //console.log(`URL "${url}" aggiunto al file "${model}.txt".`);; 
    }
  });
  
}

// Function that creates the report for the website under examination.
function writeViolationReportInOutput( model, url, report, given_consents, violation_string ) {

  // Create folder if it doesn't exists
  const violationsFolderPath = path.join(__dirname, 'violations/Cookiepedia/reports');
  if (!fs.existsSync(violationsFolderPath)) {
    fs.mkdirSync(violationsFolderPath);
  }

  // Create model file for output
  const modelFilePath = path.join(violationsFolderPath, `${url}.txt`);

  // Check if the file exists, otherwise create it
  if (!fs.existsSync(modelFilePath)) {
    // Se il file non esiste, crealo
    fs.writeFileSync(modelFilePath, '');
  }

  // Generate content for the output file
  var content = "";
  content = "Cookiepedia model FINAL REPORT OVER WEBSITE: " + url + " \n";
  if ( no_interaction ) {
    content += "NO INTERACTION WITH THE BANNER PERFORMED --> ONLY NECESSARY COOKIES SHOULD BE SET \n";
  }
  content += "NECESSARY COOKIES = " + report[0] + "\n";
  content += "FUNCTIONAL COOKIES = " + report[1] + "\n";
  content += "ANALYTICS COOKIES = " + report[2] + "\n";
  content += "ADVERTISING COOKIES = " + report[3] + "\n";
  content += "UNCLASSIFIED COOKIES = " + report[4] + "\n";

  content += "\n⚠️\tVIOLATION FOUND: the consents given have not been respected\t⚠️\n";
  content += given_consents + "cookies\n";

  content += violation_string + "cookies";

  fs.appendFile(modelFilePath, content, { flag: 'a+' }, (err) => {
    if (err) {
      console.log( err );
      return;
    } else {
      console.log(`Report for "${url}" written.`);; 
    }
  });
  
}

// Function that records the name of the website that has no violation.
function writeWebsiteWithoutViolationInOutput( model, url ) {
  // Create folder if it doesn't exists
  const violationsFolderPath = path.join(__dirname, 'violations/Cookiepedia/NO_VIOLATIONS/');
  if (!fs.existsSync(violationsFolderPath)) {
    fs.mkdirSync(violationsFolderPath);
  }

  // Create model file for output
  const modelFilePath = path.join(violationsFolderPath, `${model}.txt`);

  // Check if the file exists, otherwise create it
  if (!fs.existsSync(modelFilePath)) {
    // Se il file non esiste, crealo
    fs.writeFileSync(modelFilePath, '');
  }

  // Read file content
  const currentContent = fs.readFileSync(modelFilePath, 'utf-8');
  var content = url + "\n";

  fs.appendFile(modelFilePath, content, { flag: 'a+' }, (err) => {
    if (err) {
      console.log( err );
      return;
    } else {
      console.log(`URL "${url}" added to file "NO_VIOLATIONS/${model}.txt".`);; 
    }
  });
}

function urlIsError( url ) {
  const errorsFilePath = './violations/errors/errors.txt';
  try {
    //console.log( url );
    const fileContent = fs.readFileSync(errorsFilePath, 'utf-8');
    const errorUrls = fileContent.split('\n').map(line =>  line.trim());
    //console.log(errorUrls.includes( "https://" + url));
    return errorUrls.includes( "https://" + url);

  } catch (error) {

    console.error(`Error reading file ${errorsFilePath}: ${error.message}`);
    return false;

  }
}