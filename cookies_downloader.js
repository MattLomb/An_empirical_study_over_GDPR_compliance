/******
 * Input:
 * - url to visit
 * - consents
 * Output: cookies downloaded and formatted from the website passed as input. 
 * 
 * Usage example: "node cookies_downloader.js site.it 0 1 2"
 * 
 * How it works?
 * The script opens a puppeteer based instance browser and start a Developer Session over the website passed as input.
 * At this point it executes the Consent-O-Matic extension using the consents passed as input to interact with the CMP installed over the website.
 * It waits for the interaction and downloads all cookies setted.
 * The cookies downloaded are passed into the cookiesFormatted module that formats them into the desired format required by CookieBlock project.
 */

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

  const url = 'https://' + arguments[0];

  const consents_array = [];
  let i = 0;
  for (i; i < arguments.length; i++) {
    if (i > 0) {
      consents_array.push(arguments[i]);
    }
  }
  
  const url_file_name = arguments[0];
  // PRINT FOR DEBUG PURPOSES
  //console.log( "Consent arrays ");
  //console.log( consents_array );

  return [url, consents_array, url_file_name];
}

/***** MAIN  ******/
(async () => {

  // Get args
  const args = await parseArgsAndSetup();
  const url = args[0];
  const consents_array = args[1];
  const url_file_name = args[2];

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
        //Inject the code of Consent-O-Matic
        let promise = new Promise((resolve)=>{
            page.exposeFunction("publishCoMResult", (result)=>{
                //console.log(result);
                resolve(result);
            });
            //page.screenshot({ path: url + '.png', fullPage: true });
        });
    
        // Start executing the script for the interaction with the CMP
        await page.evaluate( (consents_array)=>{
            var consents_values = consents_array.join();
            window.dispatchEvent(new CustomEvent("startCOM", { detail: consents_values }));
        }, consents_array);
    
        let result = await promise;

        // Wait untile all cookies have been setted (8s is the amount of time required to complete all network activities)
        await new Promise(resolve => setTimeout(resolve, 8000));

        //console.log("------ COOKIES RETRIEVED ------");
        const all_browser_cookies = (await client.send('Storage.getCookies')).cookies;
        //console.log(all_browser_cookies);

        await browser.close();

        // Format cookies retrieved in the required input format for CookieBlock
        await formatCookies( url_file_name, all_browser_cookies );
    
        return result;
    }
    
  } catch ( err ) {
    console.log( "Error: " + err );
  }
  
})();


