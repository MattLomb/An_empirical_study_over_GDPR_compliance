const puppeteer = require('puppeteer-extra');
const path = require('path');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { arguments } = require('commander');
const readFileLines = require( './fileReader' );
const { writeJsonArrayToFiles, writeErrorsToFiles, writeWebsiteToCMPIdFolder } = require('./writeOutput');

/****** 
 * PARSE INPUT
 * Get the URL to contact
 * Get the arguments to pass as input to CoM Custom Event
******/
async function parseArgsAndSetup() {

  var arguments = process.argv.slice(2);
  arguments.forEach((value, index) => {
    //console.log(index, value);
  });

  // Get file name
  var input_file = arguments[0];

  // PRINT FOR DEBUG PURPOSES
  //console.log( "Consent arrays ");
  //console.log( consents_array );

  return [input_file];
}

/***** MAIN  ******/
(async () => {

  // Get args
  const args = await parseArgsAndSetup();
  const input_file = args[0];
  //console.log(input_file);

  // Read file in input containing the urls and take the first one to crawl
  var urlList = await readFileLines( input_file );

  for ( const url of urlList ) {
    // Create a new instance of puppeteer
    const browser = await puppeteer
    .use(StealthPlugin())
    .launch({
      headless: 'new'
    });

    console.log( "Checking IAB Compliance on website: " + url );

    try {
      const page = await browser.newPage();
  
      // Set Italian Language
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'it-IT'
      });
    
      // Wait until network requests have been completed
      const navigation = await page.goto(url, {
          waitUntil: 'networkidle2'
      });

      
      // If the website we are contacting doesn't return OK as navigation status, break!
      
      if ( navigation.status().toString() != '200' ) {
          console.log( "ERROR DURING NAVIGATION ON  " + url + "\nERROR CODE/RESPONSE STATUS: " + navigation.status().toString() );
      } else {
          // Start executing the script for the interaction with the CMP
          // Wait until the _tcfcmp function is not available
          const isTcfapiAvailable = await page.evaluate(async () => {
              const startTime = Date.now();
              while (typeof __tcfapi !== 'function') {
                  if (Date.now() - startTime > 5000) {
                      // Timeout after 5 seconds
                      return false;
                  }
                  await new Promise(resolve => setTimeout(resolve, 100));
              }
              return true;
          });
            
          if (!isTcfapiAvailable) {
              // Write result inside related file
              console.log("TCF API NOT AVAILABLE \n");
              var directoryResult = './results/IAB';
              await writeWebsiteToCMPIdFolder( 'no_tcf_api', url, directoryResult );
              await browser.close();
          } else {
            // Execute the tcfapi function over the page
            const pingReturn = await page.evaluate(async () => {
              return new Promise(async resolve => {
                let result;
            
                // Funzione ricorsiva per aspettare che cmpLoaded diventi true
                const waitForCmpLoaded = async () => {
                  result = await new Promise(cmpResolve => {
                    __tcfapi('ping', 2, pingReturn => {
                      cmpResolve( pingReturn );
                    });
                  });
            
                  if (!result || !result.cmpLoaded) {
                    // Attendi un po' prima di ricontrollare
                    setTimeout(waitForCmpLoaded, 100);
                  } else {
                    // Resolve quando cmpLoaded è true
                    resolve(result);
                  }
                };
            
                // Avvia il processo di attesa
                await waitForCmpLoaded();
              });
            });
  
            // Write result inside related file.
            var directoryResult = './results/IAB';
            await writeWebsiteToCMPIdFolder( pingReturn.cmpId, url, directoryResult );
  
            console.log(pingReturn);
            console.log( '\n' );
            //console.log( pingReturn.cmpId );
          }
  
      }

      await browser.close();
      
    } catch ( err ) {
      console.log( "Error: " + err );
      let directory_null = './results/IAB';
      await writeWebsiteToCMPIdFolder( 'errors', url, directory_null );
    }

  }

  console.log( "Process completed" );

})();


