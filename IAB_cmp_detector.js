const puppeteer = require('puppeteer-extra');
const path = require('path');
const cookiesFormatter = require( './cookiesFormatter' );
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const formatCookies = require('./cookiesFormatter');
const { arguments } = require('commander');

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

  const url = 'https://www.' + arguments[0];

  // PRINT FOR DEBUG PURPOSES
  //console.log( "Consent arrays ");
  //console.log( consents_array );

  return [url];
}

/***** MAIN  ******/
(async () => {

  // Get args
  const args = await parseArgsAndSetup();
  const url = args[0];

  // Launch Puppeteer with Consent-O-Matic extension
  const pathToExtension = path.join(process.cwd(), './Consent-O-Matic-ScrapeAutoTesting/Extension');
  const browser = await puppeteer
  .use(StealthPlugin())
  .launch({
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      '--disable-web-security' // Disabilita la sicurezza web per consentire i cookies di terze parti
    ],
  });

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

    /* Create a Chromium based Developer Session
    * Only in this way it is possible to download all cookies, also third party cookies, setted over the browser!
    */
    const client = await page.target().createCDPSession();

    //console.log( 'URL VISITATO ' + url );
    //console.log( navigation.status().toString() );

    /****** DOWNLOAD:
     * If the website we are contacting doesn't return OK as navigation status, break!
     ******/
    if ( navigation.status().toString() != '200' ) {
        console.log( "ERROR DURING NAVIGATION ON  " + url + "\nERROR CODE/RESPONSE STATUS: " + navigation.status().toString() );
    } else {
        // Start executing the script for the interaction with the CMP
        // Aspetta che la funzione __tcfapi sia disponibile
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
            console.log("TCF API NOT AVAILABLE");
            await browser.close();
            return;
        }

        // Esegui il codice nella console del browser
        const pingReturn = await page.evaluate(() => {
            return new Promise(resolve => {
                __tcfapi('ping', 2, pingReturn => {
                    resolve(pingReturn);
                });
            });
        });

        console.log(pingReturn);

        console.log( pingReturn.id );

        await browser.close();
    
        return;
    }
    
  } catch ( err ) {
    console.log( "Error: " + err );
  }
  
})();


