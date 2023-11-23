const puppeteer = require('puppeteer-extra');
const path = require('path');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const readFileLines = require( './fileReader' );
const { writeJsonArrayToFiles, writeErrorsToFiles } = require('./writeOutput');

const pathToExtension = path.join(process.cwd(), './Consent-O-Matic-ScrapeAutoTesting/Extension');
const directoryResult = './results';
const directoryResultErrors = './results/errors';

// Arrays containing the results of the crawling
var res = [];
var errors = [];

(async () => {

  // Read file in input containing the urls and take the first one to crawl
  var urlList = await readFileLines( './input_urls.txt' );

  for ( const url of urlList ) {
    const browser = await puppeteer
    .use(StealthPlugin())
    .launch({
      headless: 'new',
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ],
    });

    const page = await browser.newPage();    

    try {
      //goto page
      const navigation = await page.goto(url, {
        waitUntil: 'networkidle2'
      });

      console.log( 'URL VISITATO ' + url );

      if ( navigation.status().toString() != '200' ) {
        console.log("ERROR " + navigation.status().toString() );
      } else {
        let promise = new Promise((resolve)=>{
          page.exposeFunction("publishCoMResult", (result)=>{
              console.log(result);
              resolve(result);
          });
          //page.screenshot({ path: url + '.png', fullPage: true });
        });
  
        await page.evaluate(()=>{
            window.dispatchEvent(new CustomEvent("startCOM"));
        });
  
        let result = await promise;
  
        res.push( result );
      }

      

      //await browser.close();

    } catch ( err ) {

      console.error( 'An error occurred while visiting ' + url + ': ' + err.message);
      errors.push ( url );      

    } finally {
      await page.close();
      await browser.close();
    }
    
  }
  
  /*
  console.log( "------ PRINTING THE RESULT OF THE CRAWL ------" );
  console.log( res );

  console.log( "------ WEBSITES WITH ERRORS ------" );
  console.log( errors );

  */

  writeJsonArrayToFiles(res, directoryResult)
  .then(() => {
    console.log('Scrittura completata.');
  })
  .catch((err) => {
    console.error(`Si è verificato un errore: ${err.message}`);
  });

  writeErrorsToFiles(errors, directoryResultErrors)
  .then(() => {
    console.log('Scrittura errori completata.');
  })
  .catch((err) => {
    console.error(`Si è verificato un errore: ${err.message}`);
  });

  return res;

})();
